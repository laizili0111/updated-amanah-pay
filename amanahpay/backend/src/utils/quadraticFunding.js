/**
 * Utilities for quadratic funding calculations
 */
const { ethers } = require('ethers');

/**
 * Calculates the square of the sum of square roots for a specific campaign
 * @param {Array} donations - Array of donation amounts
 * @returns {BigInt} - The calculated contribution score as a BigInt
 */
const calculateContributionScore = (donations) => {
  if (!donations || donations.length === 0) return BigInt(0);
  
  // Convert all donations to BigInt and take their square roots
  const sqrtDonations = donations.map(donation => {
    const donationBigInt = BigInt(donation);
    return ethers.sqrt(donationBigInt);
  });
  
  // Sum all the square roots
  const sumSqrt = sqrtDonations.reduce((sum, sqrt) => sum + sqrt, BigInt(0));
  
  // Square the sum
  return sumSqrt * sumSqrt;
};

/**
 * Calculates the quadratic funding allocation for multiple campaigns
 * @param {Object} campaignDonations - Map of campaign IDs to arrays of donation amounts
 * @param {BigInt|String|Number} matchingPool - Total matching pool amount
 * @returns {Object} - Map of campaign IDs to allocated matching amounts
 */
const calculateAllocation = (campaignDonations, matchingPool) => {
  // Calculate contribution scores for each campaign
  const scores = {};
  let totalScore = BigInt(0);
  
  for (const [campaignId, donations] of Object.entries(campaignDonations)) {
    const score = calculateContributionScore(donations);
    scores[campaignId] = score;
    totalScore += score;
  }
  
  // If no donations, return empty allocation
  if (totalScore === BigInt(0)) {
    return Object.keys(campaignDonations).reduce((acc, campaignId) => {
      acc[campaignId] = '0';
      return acc;
    }, {});
  }
  
  // Calculate the allocation based on the proportion of each score to the total
  const matchingPoolBigInt = BigInt(matchingPool.toString());
  const allocations = {};
  
  for (const [campaignId, score] of Object.entries(scores)) {
    // Calculate the proportion of the matching pool this campaign should receive
    const allocation = (score * matchingPoolBigInt) / totalScore;
    allocations[campaignId] = allocation.toString();
  }
  
  return allocations;
};

/**
 * Calculates the quadratic funding allocation for a single campaign based on existing donations
 * @param {Array} donations - Array of donation amounts to the campaign
 * @param {Array} existingDonations - Array of all existing donation amounts to all campaigns
 * @param {BigInt|String|Number} matchingPool - Total matching pool amount
 * @returns {String} - Calculated matching amount as a string
 */
const calculateCampaignMatching = (donations, existingDonations, matchingPool) => {
  if (!donations || donations.length === 0) return '0';
  
  // Calculate the donation score for this campaign
  const campaignScore = calculateContributionScore(donations);
  
  // Calculate the total score across all campaigns
  const allDonationsScore = calculateContributionScore(existingDonations);
  
  // If no other donations, return the entire matching pool
  if (allDonationsScore === BigInt(0)) return matchingPool.toString();
  
  // Calculate the proportion of the matching pool this campaign should receive
  const matchingPoolBigInt = BigInt(matchingPool.toString());
  const allocation = (campaignScore * matchingPoolBigInt) / allDonationsScore;
  
  return allocation.toString();
};

/**
 * Estimates the impact of a new donation on the matching amount for a campaign
 * @param {String|Number} donationAmount - New donation amount
 * @param {Array} existingDonations - Existing donations to the campaign
 * @param {Array} allDonations - All existing donations to all campaigns
 * @param {BigInt|String|Number} matchingPool - Total matching pool amount
 * @returns {Object} - Object containing before and after matching amounts
 */
const estimateDonationImpact = (donationAmount, existingDonations, allDonations, matchingPool) => {
  // Calculate matching before new donation
  const beforeMatching = calculateCampaignMatching(existingDonations, allDonations, matchingPool);
  
  // Add the new donation
  const updatedDonations = [...existingDonations, donationAmount.toString()];
  const updatedAllDonations = [...allDonations, donationAmount.toString()];
  
  // Calculate matching after new donation
  const afterMatching = calculateCampaignMatching(updatedDonations, updatedAllDonations, matchingPool);
  
  // Calculate the difference (impact)
  const impact = (BigInt(afterMatching) - BigInt(beforeMatching)).toString();
  
  return {
    beforeMatching,
    afterMatching,
    impact
  };
};

module.exports = {
  calculateContributionScore,
  calculateAllocation,
  calculateCampaignMatching,
  estimateDonationImpact
}; 