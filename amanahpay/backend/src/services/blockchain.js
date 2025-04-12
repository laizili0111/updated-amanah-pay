const { ethers } = require('ethers');
require('dotenv').config();

// Mock implementations of blockchain functions for development
const blockchainService = {
  // Mock donation function
  donate: async (campaignId, amount) => {
    console.log(`Mock donation to campaign ${campaignId} with amount ${amount}`);
    
    // Return mock transaction result
    return {
      hash: `0x${Math.random().toString(16).substring(2, 42)}`,
      blockNumber: Math.floor(Math.random() * 1000000)
    };
  },
  
  // Mock certificate minting function
  mintCertificate: async (userId, charityId, amount, ipfsHash) => {
    console.log(`Mock minting certificate for user ${userId}, charity ${charityId}`);
    
    // Generate a random token ID
    const tokenId = Math.floor(Math.random() * 1000000);
    
    // Return mock transaction with events
    return {
      hash: `0x${Math.random().toString(16).substring(2, 42)}`,
      blockNumber: Math.floor(Math.random() * 1000000),
      events: {
        CertificateMinted: {
          args: {
            tokenId: tokenId
          }
        }
      }
    };
  },
  
  // Mock IPFS storage function
  storeOnIPFS: async (data) => {
    console.log('Mock storing data on IPFS');
    
    // Return mock IPFS hash
    return `ipfs://${Math.random().toString(16).substring(2, 42)}`;
  },
  
  // Mock certificate verification function
  verifyCertificate: async (tokenId, ipfsHash) => {
    console.log(`Mock verifying certificate with token ID ${tokenId}`);
    
    // For development, always return true
    return true;
  },
  
  // Mock function to create a funding round
  createRound: async (name, startTime, endTime, matchingPool) => {
    console.log(`Mock creating funding round: ${name}`);
    
    // Return mock transaction with events
    return {
      hash: `0x${Math.random().toString(16).substring(2, 42)}`,
      blockNumber: Math.floor(Math.random() * 1000000),
      events: {
        RoundCreated: {
          args: {
            roundId: Math.floor(Math.random() * 100)
          }
        }
      }
    };
  },
  
  // Mock function to finalize a funding round
  finalizeRound: async (roundId) => {
    console.log(`Mock finalizing round: ${roundId}`);
    
    // Return mock transaction
    return {
      hash: `0x${Math.random().toString(16).substring(2, 42)}`,
      blockNumber: Math.floor(Math.random() * 1000000)
    };
  },
  
  // Mock function to fund a round's matching pool
  fundRound: async (roundId, amount) => {
    console.log(`Mock funding round ${roundId} with amount ${amount.toString()}`);
    
    // Return mock transaction
    return {
      hash: `0x${Math.random().toString(16).substring(2, 42)}`,
      blockNumber: Math.floor(Math.random() * 1000000)
    };
  },
  
  // Mock function to get round results
  getRoundResults: async (roundId) => {
    console.log(`Mock getting results for round: ${roundId}`);
    
    // Generate mock results for 3 random campaigns
    const mockResults = [];
    for (let i = 0; i < 3; i++) {
      mockResults.push({
        campaignId: Math.floor(Math.random() * 10) + 1,
        totalAmount: ethers.parseEther((Math.random() * 10).toFixed(4)).toString(),
        matchedAmount: ethers.parseEther((Math.random() * 5).toFixed(4)).toString()
      });
    }
    
    return mockResults;
  },
  
  // Mock function to transfer funds to charity
  transferFunds: async (charityId, amount) => {
    console.log(`Mock transferring ${amount} to charity ${charityId}`);
    
    // Return mock transaction
    return {
      hash: `0x${Math.random().toString(16).substring(2, 42)}`,
      blockNumber: Math.floor(Math.random() * 1000000)
    };
  }
};

module.exports = blockchainService; 