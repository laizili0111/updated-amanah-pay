const QRCode = require('qrcode');
const fs = require('fs').promises;
const path = require('path');

/**
 * Generate a QR code for certificate verification
 * @param {string} data - The data to encode in the QR code
 * @param {string} outputPath - Optional path to save the QR code image
 * @returns {Promise<string|Buffer>} - The QR code as data URL or file path
 */
const generateQRCode = async (data, outputPath = null) => {
  try {
    if (outputPath) {
      // Ensure the directory exists
      const dir = path.dirname(outputPath);
      await fs.mkdir(dir, { recursive: true });
      
      // Generate QR code and save to file
      await QRCode.toFile(outputPath, data, {
        errorCorrectionLevel: 'H',
        margin: 1,
        width: 300,
        color: {
          dark: '#000000',  // Black dots
          light: '#ffffff'  // White background
        }
      });
      
      return outputPath;
    } else {
      // Return QR code as data URL
      const dataUrl = await QRCode.toDataURL(data, {
        errorCorrectionLevel: 'H',
        margin: 1,
        width: 300,
        color: {
          dark: '#000000',  // Black dots
          light: '#ffffff'  // White background
        }
      });
      
      return dataUrl;
    }
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error(`Failed to generate QR code: ${error.message}`);
  }
};

module.exports = {
  generateQRCode
}; 