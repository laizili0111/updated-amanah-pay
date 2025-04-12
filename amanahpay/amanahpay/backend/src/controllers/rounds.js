const { Round, Donation, Campaign } = require('../models');
const blockchainService = require('../services/blockchain');
const quadraticFunding = require('../utils/quadraticFunding');
const { ethers } = require('ethers');

// Create a new funding round
const createRound = async (req, res, next) => {
  try {
    const { name, description, start_time, end_time, matching_pool } = req.body;
    
    // Check if there's an active round that would overlap
    const overlappingRound = await Round.findOne({
      where: {
        [Round.sequelize.Op.or]: [
          {
            start_time: { [Round.sequelize.Op.lt]: new Date(end_time) },
            end_time: { [Round.sequelize.Op.gt]: new Date(start_time) }
          }
        ]
      }
    });
    
    if (overlappingRound) {
      return res.status(400).json({
        error: true,
        message: 'There is already an active round during this period'
      });
    }
    
    // Convert matching pool to wei
    const poolAmount = ethers.parseEther(matching_pool.toString());
    
    // Create round on blockchain
    const tx = await blockchainService.createRound(
      name,
      new Date(start_time).getTime() / 1000, // Convert to unix timestamp
      new Date(end_time).getTime() / 1000,
      poolAmount
    );
    
    // Create round in database
    const round = await Round.create({
      name,
      description,
      start_time: new Date(start_time),
      end_time: new Date(end_time),
      matching_pool: poolAmount.toString(),
      blockchain_id: tx.events.RoundCreated.args.roundId.toString(),
      transaction_hash: tx.hash
    });
    
    res.status(201).json({
      success: true,
      data: {
        round,
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

// Get all funding rounds
const getAllRounds = async (req, res, next) => {
  try {
    const rounds = await Round.findAll({
      order: [['created_at', 'DESC']]
    });
    
    res.json({
      success: true,
      data: rounds
    });
  } catch (error) {
    next(error);
  }
};

// Get funding round by ID
const getRound = async (req, res, next) => {
  try {
    const roundId = parseInt(req.params.id);
    
    const round = await Round.findByPk(roundId);
    
    if (!round) {
      return res.status(404).json({
        error: true,
        message: 'Funding round not found'
      });
    }
    
    // Get donations for this round
    const donations = await Donation.findAll({
      where: { round_id: roundId },
      include: [
        { model: Campaign, attributes: ['id', 'name'] }
      ]
    });
    
    // Get allocation results if distributed
    let allocationResults = null;
    if (round.is_distributed) {
      allocationResults = await blockchainService.getRoundResults(round.blockchain_id);
    }
    
    res.json({
      success: true,
      data: {
        round,
        donations,
        allocationResults
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get current active round
const getCurrentRound = async (req, res, next) => {
  try {
    const currentRound = await Round.findOne({
      where: {
        start_time: { [Round.sequelize.Op.lt]: new Date() },
        end_time: { [Round.sequelize.Op.gt]: new Date() }
      }
    });
    
    if (!currentRound) {
      return res.status(404).json({
        error: true,
        message: 'No active funding round'
      });
    }
    
    // Get total donations for this round
    const donations = await Donation.findAll({
      where: { round_id: currentRound.id },
      attributes: [
        [Round.sequelize.fn('COUNT', Round.sequelize.col('id')), 'count'],
        [Round.sequelize.fn('SUM', Round.sequelize.col('amount')), 'total']
      ]
    });
    
    // Get unique donors for this round
    const uniqueDonors = await Donation.count({
      where: { round_id: currentRound.id },
      distinct: true,
      col: 'user_id'
    });
    
    res.json({
      success: true,
      data: {
        round: currentRound,
        stats: {
          donation_count: donations[0].dataValues.count,
          total_donated: donations[0].dataValues.total,
          unique_donors: uniqueDonors
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Calculate and distribute matching funds
const distributeMatching = async (req, res, next) => {
  try {
    const roundId = parseInt(req.params.id);
    
    const round = await Round.findByPk(roundId);
    
    if (!round) {
      return res.status(404).json({
        error: true,
        message: 'Funding round not found'
      });
    }
    
    if (round.is_distributed) {
      return res.status(400).json({
        error: true,
        message: 'Funding round has already been distributed'
      });
    }
    
    if (new Date() < round.end_time) {
      return res.status(400).json({
        error: true,
        message: 'Funding round has not ended yet'
      });
    }
    
    // Get all donations grouped by campaign
    const donations = await Donation.findAll({
      where: { round_id: roundId },
      include: [
        { model: Campaign, attributes: ['id', 'name', 'charity_id'] }
      ]
    });
    
    // Group donations by campaign
    const campaignDonations = {};
    donations.forEach(donation => {
      const campaignId = donation.campaign_id;
      if (!campaignDonations[campaignId]) {
        campaignDonations[campaignId] = [];
      }
      campaignDonations[campaignId].push(donation.amount.toString());
    });
    
    // Calculate quadratic funding allocation
    const allocations = quadraticFunding.calculateAllocation(
      campaignDonations,
      round.matching_pool
    );
    
    // Prepare allocation data for blockchain transaction
    const campaignAllocations = Object.entries(allocations).map(([campaignId, amount]) => {
      const campaign = donations.find(d => d.campaign_id.toString() === campaignId)?.campaign;
      
      return {
        campaignId: parseInt(campaignId),
        campaignName: campaign?.name || 'Unknown Campaign',
        charityId: campaign?.charity_id || 0,
        matchedAmount: amount.toString(),
        donationCount: campaignDonations[campaignId].length,
        totalDirectDonations: campaignDonations[campaignId]
          .reduce((sum, amount) => sum + BigInt(amount), BigInt(0))
          .toString()
      };
    });
    
    // Sort by matched amount (descending)
    campaignAllocations.sort((a, b) => 
      BigInt(b.matchedAmount) - BigInt(a.matchedAmount)
    );
    
    // Store allocations on blockchain
    const tx = await blockchainService.finalizeRound(round.id, campaignAllocations);
    
    // Update round in database
    round.is_distributed = true;
    round.distributed_at = new Date();
    round.distribution_transaction_hash = tx.hash;
    await round.save();
    
    res.json({
      success: true,
      data: {
        round,
        allocations: campaignAllocations,
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

// Finalize round (admin only)
const finalizeRound = async (req, res, next) => {
  try {
    const roundId = parseInt(req.params.id);
    
    const round = await Round.findByPk(roundId);
    
    if (!round) {
      return res.status(404).json({
        error: true,
        message: 'Funding round not found'
      });
    }
    
    if (round.is_finalized) {
      return res.status(400).json({
        error: true,
        message: 'Funding round has already been finalized'
      });
    }
    
    // Update round in database
    round.is_finalized = true;
    round.finalized_at = new Date();
    await round.save();
    
    res.json({
      success: true,
      data: {
        round
      }
    });
  } catch (error) {
    next(error);
  }
};

// Fund matching pool (admin only)
const fundMatchingPool = async (req, res, next) => {
  try {
    const roundId = parseInt(req.params.id);
    const { amount } = req.body;
    
    if (!amount || isNaN(parseFloat(amount))) {
      return res.status(400).json({
        error: true,
        message: 'Valid amount is required'
      });
    }
    
    const round = await Round.findByPk(roundId);
    
    if (!round) {
      return res.status(404).json({
        error: true,
        message: 'Funding round not found'
      });
    }
    
    // Convert amount to wei
    const amountWei = ethers.parseEther(amount.toString());
    
    // Update on blockchain
    const tx = await blockchainService.fundRound(round.blockchain_id, amountWei);
    
    // Update round in database
    const currentPool = ethers.getBigInt(round.matching_pool);
    const newPool = currentPool + amountWei;
    round.matching_pool = newPool.toString();
    await round.save();
    
    res.json({
      success: true,
      data: {
        round,
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

module.exports = {
  createRound,
  getAllRounds,
  getRound,
  getCurrentRound,
  distributeMatching,
  finalizeRound,
  fundMatchingPool
}; 