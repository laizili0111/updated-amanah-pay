const { Certificate, Donation, Campaign, User } = require('../models');
const blockchainService = require('../services/blockchain');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;
const path = require('path');
const PDFDocument = require('pdfkit');
const db = require('../config/db');
const { generateQRCode } = require('../utils/qrCode');
const { pinJSONToIPFS, getJSONFromIPFS, resolveIPFSUri } = require('../utils/ipfs');

// Generate a digital certificate for a donation
const generateCertificate = async (req, res, next) => {
  try {
    const donationId = parseInt(req.params.donationId);
    
    // Check if donation exists
    const donation = await Donation.findByPk(donationId, {
      include: [
        { model: Campaign, attributes: ['id', 'name', 'charity_id'] },
        { model: User, attributes: ['id', 'name', 'email'] }
      ]
    });
    
    if (!donation) {
      return res.status(404).json({
        error: true,
        message: 'Donation not found'
      });
    }
    
    // Check if certificate already exists
    const existingCertificate = await Certificate.findOne({
      where: { donation_id: donationId }
    });
    
    if (existingCertificate) {
      return res.status(400).json({
        error: true,
        message: 'Certificate already exists for this donation',
        certificate_id: existingCertificate.id
      });
    }
    
    // Generate a unique certificate ID
    const certificateId = uuidv4();
    
    // Create certificate metadata
    const metadata = {
      certificate_id: certificateId,
      donation_id: donation.id,
      amount: donation.amount,
      donor_name: donation.User.name,
      donor_email: donation.User.email,
      campaign_name: donation.Campaign.name,
      donation_date: donation.created_at,
      issue_date: new Date()
    };
    
    // Store certificate metadata on IPFS
    const ipfsHash = await blockchainService.storeOnIPFS(JSON.stringify(metadata));
    
    // Mint NFT certificate on blockchain
    const tx = await blockchainService.mintCertificate(
      donation.User.id,
      donation.Campaign.charity_id,
      donation.amount,
      ipfsHash
    );
    
    // Generate PDF certificate
    const pdfFilePath = await generatePDFCertificate(metadata);
    
    // Save certificate in database
    const certificate = await Certificate.create({
      uuid: certificateId,
      donation_id: donation.id,
      user_id: donation.user_id,
      campaign_id: donation.campaign_id,
      ipfs_hash: ipfsHash,
      pdf_url: `/certificates/${path.basename(pdfFilePath)}`,
      token_id: tx.events.CertificateMinted.args.tokenId.toString(),
      transaction_hash: tx.hash,
      metadata: JSON.stringify(metadata)
    });
    
    res.status(201).json({
      success: true,
      data: {
        certificate,
        download_url: `/api/certificates/${certificate.id}/download`,
        transaction: {
          hash: tx.hash,
          blockNumber: tx.blockNumber
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get certificate by ID
exports.getCertificate = async (req, res) => {
  try {
    const certificateId = parseInt(req.params.id);
    
    const certificateResult = await db.query(
      `SELECT c.*, d.amount, d.transaction_hash as donation_tx_hash, 
      u.name as donor_name, u.email as donor_email,
      ca.name as campaign_name, ca.description as campaign_description, 
      ch.name as charity_name, ch.logo_url as charity_logo
      FROM certificates c
      JOIN donations d ON c.donation_id = d.id
      JOIN users u ON d.user_id = u.id
      JOIN campaigns ca ON d.campaign_id = ca.id
      JOIN charities ch ON ca.charity_id = ch.id
      WHERE c.id = $1`,
      [certificateId]
    );

    if (certificateResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        certificate: certificateResult.rows[0],
        download_url: `/api/certificates/${certificateId}/download`
      }
    });
  } catch (error) {
    console.error('Error getting certificate:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get all certificates for a user
exports.getUserCertificates = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    const certificatesResult = await db.query(
      `SELECT c.*, d.amount, d.transaction_hash as donation_tx_hash, 
      ca.name as campaign_name
      FROM certificates c
      JOIN donations d ON c.donation_id = d.id
      JOIN campaigns ca ON d.campaign_id = ca.id
      WHERE d.user_id = $1
      ORDER BY c.created_at DESC`,
      [userId]
    );
    
    return res.status(200).json({
      success: true,
      data: certificatesResult.rows
    });
  } catch (error) {
    console.error('Error getting user certificates:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Download certificate PDF
exports.downloadCertificate = async (req, res) => {
  try {
    const certificateId = parseInt(req.params.id);
    
    const certificateResult = await db.query(
      'SELECT * FROM certificates WHERE id = $1',
      [certificateId]
    );
    
    if (certificateResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }
    
    const certificate = certificateResult.rows[0];
    
    // Get the path of the PDF file
    const pdfFilePath = path.join(__dirname, '../../public', certificate.pdf_url);
    
    // Check if the file exists
    try {
      await fs.access(pdfFilePath);
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: 'Certificate file not found'
      });
    }
    
    return res.download(pdfFilePath);
  } catch (error) {
    console.error('Error downloading certificate:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Helper function to generate PDF certificate
const generatePDFCertificate = async (metadata) => {
  // Create a PDF document
  const doc = new PDFDocument({
    size: 'A4',
    layout: 'landscape',
    margin: 50
  });
  
  const filename = `certificate_${metadata.certificate_id}.pdf`;
  const outputPath = path.join(__dirname, '../../public/certificates', filename);
  
  // Ensure certificates directory exists
  await fs.mkdir(path.join(__dirname, '../../public/certificates'), { recursive: true });
  
  // Pipe PDF to file
  const stream = fs.createWriteStream(outputPath);
  doc.pipe(stream);
  
  // Add content to PDF
  doc.font('Helvetica-Bold').fontSize(30).text('DONATION CERTIFICATE', { align: 'center' });
  doc.moveDown();
  doc.font('Helvetica').fontSize(18).text(`Certificate ID: ${metadata.certificate_id}`, { align: 'center' });
  doc.moveDown();
  doc.fontSize(16).text(`This certifies that ${metadata.donor_name} has donated`, { align: 'center' });
  doc.moveDown();
  doc.font('Helvetica-Bold').fontSize(24).text(`${metadata.amount} ETH`, { align: 'center' });
  doc.moveDown();
  doc.font('Helvetica').fontSize(16).text(`to ${metadata.campaign_name}`, { align: 'center' });
  doc.moveDown(2);
  doc.fontSize(12).text(`Donation Date: ${new Date(metadata.donation_date).toLocaleDateString()}`, { align: 'center' });
  doc.moveDown();
  doc.text(`Issued Date: ${new Date(metadata.issue_date).toLocaleDateString()}`, { align: 'center' });
  doc.moveDown(2);
  doc.fontSize(10).text('This certificate is stored on the blockchain and its authenticity can be verified.', { align: 'center' });
  
  // Finalize PDF
  doc.end();
  
  // Wait for PDF to be created
  return new Promise((resolve, reject) => {
    stream.on('finish', () => resolve(outputPath));
    stream.on('error', reject);
  });
};

// Verify certificate authenticity
exports.verifyCertificate = async (req, res) => {
  try {
    const { uuid } = req.params;
    
    const certificateResult = await db.query(
      `SELECT c.*, d.amount, d.transaction_hash as donation_tx_hash, 
      u.name as donor_name,
      ca.name as campaign_name
      FROM certificates c
      JOIN donations d ON c.donation_id = d.id
      JOIN users u ON d.user_id = u.id
      JOIN campaigns ca ON d.campaign_id = ca.id
      WHERE c.uuid = $1`,
      [uuid]
    );
    
    if (certificateResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }
    
    const certificate = certificateResult.rows[0];
    
    // Verify certificate on blockchain
    const isValid = await blockchainService.verifyCertificate(
      certificate.token_id,
      certificate.ipfs_hash
    );
    
    return res.status(200).json({
      success: true,
      data: {
        certificate,
        verification: {
          valid: isValid,
          blockchain_record: {
            token_id: certificate.token_id,
            ipfs_hash: certificate.ipfs_hash,
            transaction_hash: certificate.transaction_hash
          }
        }
      }
    });
  } catch (error) {
    console.error('Error verifying certificate:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * @desc Get all certificates
 * @route GET /api/certificates
 * @access Public
 */
exports.getAllCertificates = async (req, res) => {
  try {
    const certificates = await db.query(
      `SELECT c.*, d.amount, d.campaign_id, 
      u.name as donor_name, u.email as donor_email,
      ca.name as campaign_name, ca.charity_id,
      ch.name as charity_name
      FROM certificates c
      JOIN donations d ON c.donation_id = d.id
      JOIN users u ON d.user_id = u.id
      JOIN campaigns ca ON d.campaign_id = ca.id
      JOIN charities ch ON ca.charity_id = ch.id
      ORDER BY c.created_at DESC`
    );

    return res.status(200).json({
      success: true,
      data: certificates.rows
    });
  } catch (error) {
    console.error('Error getting certificates:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * @desc Get certificate metadata (for NFT)
 * @route GET /api/certificates/:id/metadata
 * @access Public
 */
exports.getCertificateMetadata = async (req, res) => {
  try {
    const { id } = req.params;
    
    const certificateResult = await db.query(
      `SELECT c.*, d.amount, d.campaign_id, 
      u.name as donor_name, u.email as donor_email,
      ca.name as campaign_name, ca.image_url as campaign_image, ca.charity_id,
      ch.name as charity_name, ch.logo_url as charity_logo
      FROM certificates c
      JOIN donations d ON c.donation_id = d.id
      JOIN users u ON d.user_id = u.id
      JOIN campaigns ca ON d.campaign_id = ca.id
      JOIN charities ch ON ca.charity_id = ch.id
      WHERE c.id = $1`,
      [id]
    );

    if (certificateResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    const certificate = certificateResult.rows[0];
    
    // Format metadata according to NFT standards (ERC-721 metadata schema)
    const metadata = {
      name: `AmanahPay Donation Certificate #${certificate.id}`,
      description: `Certificate of donation to ${certificate.campaign_name} by ${certificate.charity_name}`,
      image: certificate.certificate_url || "https://amanahpay.com/default-certificate.png",
      external_url: `https://amanahpay.com/certificates/${certificate.id}`,
      attributes: [
        {
          trait_type: "Donor",
          value: certificate.donor_name
        },
        {
          trait_type: "Donation Amount",
          value: certificate.amount
        },
        {
          trait_type: "Campaign",
          value: certificate.campaign_name
        },
        {
          trait_type: "Charity",
          value: certificate.charity_name
        },
        {
          trait_type: "Date",
          value: new Date(certificate.created_at).toISOString().split('T')[0]
        }
      ]
    };

    return res.status(200).json(metadata);
  } catch (error) {
    console.error('Error getting certificate metadata:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * @desc Get certificate by ID
 * @route GET /api/certificates/:id
 * @access Public
 */
exports.getCertificateById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const certificateResult = await db.query(
      `SELECT c.*, d.amount, d.transaction_hash as donation_tx_hash, 
      u.name as donor_name, u.email as donor_email,
      ca.name as campaign_name, ca.description as campaign_description, 
      ch.name as charity_name, ch.logo_url as charity_logo
      FROM certificates c
      JOIN donations d ON c.donation_id = d.id
      JOIN users u ON d.user_id = u.id
      JOIN campaigns ca ON d.campaign_id = ca.id
      JOIN charities ch ON ca.charity_id = ch.id
      WHERE c.id = $1`,
      [id]
    );

    if (certificateResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: certificateResult.rows[0]
    });
  } catch (error) {
    console.error('Error getting certificate:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * @desc Update certificate metadata
 * @route PUT /api/certificates/:id/metadata
 * @access Private
 */
exports.updateCertificateMetadata = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verify certificate exists
    const certificateResult = await db.query(
      'SELECT * FROM certificates WHERE id = $1',
      [id]
    );

    if (certificateResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    const certificate = certificateResult.rows[0];
    
    // Get certificate data to create metadata
    const metadataResult = await db.query(
      `SELECT c.*, d.amount, d.campaign_id, 
      u.name as donor_name, u.email as donor_email,
      ca.name as campaign_name, ca.image_url as campaign_image, ca.charity_id,
      ch.name as charity_name, ch.logo_url as charity_logo
      FROM certificates c
      JOIN donations d ON c.donation_id = d.id
      JOIN users u ON d.user_id = u.id
      JOIN campaigns ca ON d.campaign_id = ca.id
      JOIN charities ch ON ca.charity_id = ch.id
      WHERE c.id = $1`,
      [id]
    );
    
    if (metadataResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Certificate data not found'
      });
    }
    
    const metadataData = metadataResult.rows[0];
    
    // Format metadata according to NFT standards (ERC-721 metadata schema)
    const metadata = {
      name: `AmanahPay Donation Certificate #${metadataData.id}`,
      description: `Certificate of donation to ${metadataData.campaign_name} by ${metadataData.charity_name}`,
      image: metadataData.certificate_url || "https://amanahpay.com/default-certificate.png",
      external_url: `https://amanahpay.com/certificates/${metadataData.id}`,
      attributes: [
        {
          trait_type: "Donor",
          value: metadataData.donor_name
        },
        {
          trait_type: "Donation Amount",
          value: metadataData.amount
        },
        {
          trait_type: "Campaign",
          value: metadataData.campaign_name
        },
        {
          trait_type: "Charity",
          value: metadataData.charity_name
        },
        {
          trait_type: "Date",
          value: new Date(metadataData.created_at).toISOString().split('T')[0]
        }
      ]
    };
    
    // Update metadata on IPFS
    const { IpfsHash } = await pinJSONToIPFS(metadata);
    
    // Update certificate record with new metadata URI
    await db.query(
      'UPDATE certificates SET metadata_uri = $1, updated_at = NOW() WHERE id = $2',
      [`ipfs://${IpfsHash}`, id]
    );

    return res.status(200).json({
      success: true,
      message: 'Certificate metadata updated successfully',
      data: {
        id: certificate.id,
        metadata_uri: `ipfs://${IpfsHash}`
      }
    });
  } catch (error) {
    console.error('Error updating certificate metadata:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * @desc Fetch certificate metadata from IPFS
 * @route GET /api/certificates/:id/ipfs
 * @access Public
 */
exports.fetchCertificateFromIPFS = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get certificate with metadata URI
    const certificateResult = await db.query(
      'SELECT * FROM certificates WHERE id = $1',
      [id]
    );

    if (certificateResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    const certificate = certificateResult.rows[0];
    
    if (!certificate.metadata_uri) {
      return res.status(404).json({
        success: false,
        message: 'Certificate has no IPFS metadata'
      });
    }
    
    // Fetch JSON from IPFS
    const ipfsData = await getJSONFromIPFS(certificate.metadata_uri);
    
    return res.status(200).json({
      success: true,
      data: {
        id: certificate.id,
        metadata_uri: certificate.metadata_uri,
        metadata: ipfsData,
        gateway_url: resolveIPFSUri(certificate.metadata_uri)
      }
    });
  } catch (error) {
    console.error('Error fetching certificate from IPFS:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  generateCertificate: exports.generateCertificate,
  getCertificate: exports.getCertificate,
  getUserCertificates: exports.getUserCertificates,
  downloadCertificate: exports.downloadCertificate,
  verifyCertificate: exports.verifyCertificate,
  getAllCertificates: exports.getAllCertificates,
  getCertificateMetadata: exports.getCertificateMetadata,
  getCertificateById: exports.getCertificateById,
  updateCertificateMetadata: exports.updateCertificateMetadata,
  fetchCertificateFromIPFS: exports.fetchCertificateFromIPFS
}; 