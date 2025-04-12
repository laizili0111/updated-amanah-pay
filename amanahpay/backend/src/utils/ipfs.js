const axios = require('axios');
require('dotenv').config();

// Pinata API credentials
const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_API_SECRET = process.env.PINATA_API_SECRET;
const PINATA_JWT = process.env.PINATA_JWT;

/**
 * Pin JSON data to IPFS via Pinata
 * @param {Object} jsonData - The JSON data to pin to IPFS
 * @returns {Promise<Object>} - The response from Pinata, including the IPFS hash
 */
const pinJSONToIPFS = async (jsonData) => {
  try {
    const url = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';
    
    const response = await axios.post(
      url,
      jsonData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${PINATA_JWT}`
        }
      }
    );
    
    return response.data; // Contains IpfsHash, PinSize, Timestamp
  } catch (error) {
    console.error('Error pinning to IPFS:', error);
    throw new Error(`Failed to pin data to IPFS: ${error.message}`);
  }
};

/**
 * Get JSON data from IPFS via Pinata gateway
 * @param {string} ipfsHash - The IPFS hash (CID) to retrieve
 * @returns {Promise<Object>} - The JSON data retrieved from IPFS
 */
const getJSONFromIPFS = async (ipfsHash) => {
  try {
    // Remove ipfs:// prefix if present
    const hash = ipfsHash.replace('ipfs://', '');
    
    // Using Pinata IPFS gateway
    const gatewayUrl = `https://gateway.pinata.cloud/ipfs/${hash}`;
    
    const response = await axios.get(gatewayUrl);
    return response.data;
  } catch (error) {
    console.error('Error retrieving from IPFS:', error);
    throw new Error(`Failed to get data from IPFS: ${error.message}`);
  }
};

/**
 * Resolve IPFS URI to full gateway URL
 * @param {string} ipfsUri - The IPFS URI (ipfs://...)
 * @returns {string} - The full gateway URL
 */
const resolveIPFSUri = (ipfsUri) => {
  if (!ipfsUri) return null;
  
  // Remove ipfs:// prefix
  const hash = ipfsUri.replace('ipfs://', '');
  return `https://gateway.pinata.cloud/ipfs/${hash}`;
};

module.exports = {
  pinJSONToIPFS,
  getJSONFromIPFS,
  resolveIPFSUri
}; 