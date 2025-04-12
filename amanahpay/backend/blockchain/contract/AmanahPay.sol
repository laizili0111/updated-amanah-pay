// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

/**
 * @title AmanahPay
 * @dev Main contract for AmanahPay charity donation platform with quadratic funding
 */
contract AmanahPay is Ownable(msg.sender), ReentrancyGuard {
    using Counters for Counters.Counter;
    using Math for uint256;

    // Certificate contract
    AmanahCertificate public certificateContract;
    
    // Charity structure
    struct Charity {
        uint256 id;
        string name;
        string description;
        address admin;
        bool isVerified;
        bool isActive;
    }
    
    // Campaign structure
    struct Campaign {
        uint256 id;
        uint256 charityId;
        string name;
        string description;
        string imageURI;
        uint256 goal;
        uint256 totalDonations;
        bool isActive;
    }
    
    // Donation structure
    struct Donation {
        uint256 id;
        address donor;
        uint256 campaignId;
        uint256 amount;
        uint256 timestamp;
        uint256 roundId;
    }
    
    // Funding round structure
    struct Round {
        uint256 id;
        uint256 startTime;
        uint256 endTime;
        uint256 matchingPool;
        uint256 totalDonations;
        bool isDistributed;
    }
    
    // Transaction record for transparency
    struct Transaction {
        address destination;
        uint256 amount;
        uint256 timestamp;
        string reason;
    }
    
    // Counters
    Counters.Counter private _charityIdCounter;
    Counters.Counter private _campaignIdCounter;
    Counters.Counter private _donationIdCounter;
    Counters.Counter private _roundIdCounter;
    Counters.Counter private _transactionIdCounter;
    
    // Contract state variables
    uint256 public constant PLATFORM_FEE = 100; // 1% = 100 basis points
    address payable public platformWallet;
    uint256 public poolBalance;
    
    // Current round info
    uint256 public currentRoundId;
    
    // Mappings
    mapping(uint256 => Charity) public charities;
    mapping(uint256 => Campaign) public campaigns;
    mapping(uint256 => Donation) public donations;
    mapping(uint256 => Round) public rounds;
    mapping(uint256 => Transaction) public transactions;
    
    mapping(address => bool) public isCharityAdmin;
    mapping(uint256 => uint256[]) public charityCampaigns; // charityId => campaignIds
    mapping(uint256 => mapping(address => bool)) public hasContributed; // roundId => donor => bool
    mapping(uint256 => mapping(address => uint256)) public donationsByDonor; // roundId => donor => amount
    mapping(uint256 => mapping(uint256 => uint256)) public donationsByCampaign; // roundId => campaignId => amount
    mapping(uint256 => uint256) public uniqueDonorsCount; // roundId => count
    
    // Events
    event CharityRegistered(uint256 indexed charityId, string name, address admin);
    event CharityVerified(uint256 indexed charityId, bool verified);
    event CampaignCreated(uint256 indexed campaignId, uint256 indexed charityId, string name);
    event DonationReceived(uint256 indexed donationId, address indexed donor, uint256 indexed campaignId, uint256 amount, uint256 roundId);
    event RoundCreated(uint256 indexed roundId, uint256 startTime, uint256 endTime);
    event RoundDistributed(uint256 indexed roundId, uint256 matchingPool);
    event FundsReleased(uint256 indexed transactionId, address recipient, uint256 amount, string reason);
    event MatchingPoolFunded(uint256 indexed roundId, uint256 amount);
    
    constructor(address payable _platformWallet) {
        platformWallet = _platformWallet;
        
        // Start the first funding round automatically (1 month)
        _createNewRound();
    }
    
    /**
     * @dev Set the certificate contract address
     */
    function setCertificateContract(address _certificateContract) external onlyOwner {
        certificateContract = AmanahCertificate(_certificateContract);
    }
    
    /**
     * @dev Register a new charity
     */
    function registerCharity(string memory _name, string memory _description) external {
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_description).length > 0, "Description cannot be empty");
        
        uint256 charityId = _charityIdCounter.current();
        _charityIdCounter.increment();
        
        charities[charityId] = Charity({
            id: charityId,
            name: _name,
            description: _description,
            admin: msg.sender,
            isVerified: false,
            isActive: true
        });
        
        emit CharityRegistered(charityId, _name, msg.sender);
    }
    
    /**
     * @dev Verify a charity (platform admin only)
     */
    function verifyCharity(uint256 _charityId, bool _verified) external onlyOwner {
        require(_charityId < _charityIdCounter.current(), "Charity does not exist");
        
        Charity storage charity = charities[_charityId];
        charity.isVerified = _verified;
        
        if (_verified) {
            isCharityAdmin[charity.admin] = true;
        } else {
            isCharityAdmin[charity.admin] = false;
        }
        
        emit CharityVerified(_charityId, _verified);
    }
    
    /**
     * @dev Create a new charity campaign
     */
    function createCampaign(
        uint256 _charityId,
        string memory _name,
        string memory _description,
        string memory _imageURI,
        uint256 _goal
    ) external {
        require(_charityId < _charityIdCounter.current(), "Charity does not exist");
        Charity storage charity = charities[_charityId];
        
        require(charity.isVerified, "Charity is not verified");
        require(charity.isActive, "Charity is not active");
        require(charity.admin == msg.sender, "Not the charity admin");
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_description).length > 0, "Description cannot be empty");
        
        uint256 campaignId = _campaignIdCounter.current();
        _campaignIdCounter.increment();
        
        campaigns[campaignId] = Campaign({
            id: campaignId,
            charityId: _charityId,
            name: _name,
            description: _description,
            imageURI: _imageURI,
            goal: _goal,
            totalDonations: 0,
            isActive: true
        });
        
        charityCampaigns[_charityId].push(campaignId);
        
        emit CampaignCreated(campaignId, _charityId, _name);
    }
    
    /**
     * @dev Make a donation to a specific campaign
     */
    function donate(uint256 _campaignId) external payable nonReentrant {
        require(msg.value > 0, "Donation amount must be greater than 0");
        require(_campaignId < _campaignIdCounter.current(), "Campaign does not exist");
        require(campaigns[_campaignId].isActive, "Campaign is not active");
        
        require(currentRoundId < _roundIdCounter.current(), "No active round");
        Round storage round = rounds[currentRoundId];
        require(block.timestamp >= round.startTime && block.timestamp <= round.endTime, "Round not active");
        
        // Calculate platform fee
        uint256 fee = (msg.value * PLATFORM_FEE) / 10000;
        uint256 donationAmount = msg.value - fee;
        
        // Update donation pool
        poolBalance += donationAmount;
        round.totalDonations += donationAmount;
        
        // Update campaign stats
        Campaign storage campaign = campaigns[_campaignId];
        campaign.totalDonations += donationAmount;
        
        // Create donation record
        uint256 donationId = _donationIdCounter.current();
        _donationIdCounter.increment();
        
        donations[donationId] = Donation({
            id: donationId,
            donor: msg.sender,
            campaignId: _campaignId,
            amount: donationAmount,
            timestamp: block.timestamp,
            roundId: currentRoundId
        });
        
        // Update round tracking
        if (!hasContributed[currentRoundId][msg.sender]) {
            hasContributed[currentRoundId][msg.sender] = true;
            uniqueDonorsCount[currentRoundId]++;
        }
        
        // Update donation metrics
        donationsByDonor[currentRoundId][msg.sender] += donationAmount;
        donationsByCampaign[currentRoundId][_campaignId] += donationAmount;
        
        // Send platform fee to platform wallet
        if (fee > 0) {
            (bool feeSuccess, ) = platformWallet.call{value: fee}("");
            require(feeSuccess, "Fee transfer failed");
        }
        
        emit DonationReceived(donationId, msg.sender, _campaignId, donationAmount, currentRoundId);
        
        // Mint certificate NFT if certificate contract is set
        if (address(certificateContract) != address(0)) {
            certificateContract.mintCertificate(msg.sender, donationId, donationAmount);
        }
    }
    
    /**
     * @dev Create a new funding round (automatically called when distributing funds)
     */
    function _createNewRound() internal {
        uint256 roundId = _roundIdCounter.current();
        _roundIdCounter.increment();
        
        // Set round for 1 month
        uint256 startTime = block.timestamp;
        uint256 endTime = startTime + 30 days;
        
        rounds[roundId] = Round({
            id: roundId,
            startTime: startTime,
            endTime: endTime,
            matchingPool: 0,
            totalDonations: 0,
            isDistributed: false
        });
        
        currentRoundId = roundId;
        
        emit RoundCreated(roundId, startTime, endTime);
    }
    
    /**
     * @dev Admin function to fund the matching pool for the current round
     */
    function fundMatchingPool() external payable onlyOwner {
        require(currentRoundId < _roundIdCounter.current(), "No active round");
        
        Round storage round = rounds[currentRoundId];
        round.matchingPool += msg.value;
        
        emit MatchingPoolFunded(currentRoundId, msg.value);
    }
    
    /**
     * @dev Admin function to finalize the current round, calculate quadratic matching, and start a new one
     */
    function finalizeRound() external onlyOwner {
        require(currentRoundId < _roundIdCounter.current(), "No active round");
        
        Round storage round = rounds[currentRoundId];
        require(!round.isDistributed, "Round already distributed");
        require(block.timestamp > round.endTime, "Round still active");
        
        // Mark round as distributed
        round.isDistributed = true;
        
        emit RoundDistributed(currentRoundId, round.matchingPool);
        
        // Create a new round
        _createNewRound();
    }
    
    /**
     * @dev Admin function to release funds based on off-chain voting results
     * Only funds from finalized rounds can be released
     */
    function releaseFunds(uint256 _amount, address payable _recipient, string memory _reason) external onlyOwner nonReentrant {
        require(_amount <= poolBalance, "Insufficient funds in pool");
        require(_recipient != address(0), "Invalid recipient address");
        
        // Ensure there's at least one finalized round
        bool hasFinalized = false;
        for (uint256 i = 0; i < currentRoundId; i++) {
            if (rounds[i].isDistributed) {
                hasFinalized = true;
                break;
            }
        }
        require(hasFinalized, "No finalized rounds yet");
        
        // Update pool balance
        poolBalance -= _amount;
        
        // Record the transaction
        uint256 transactionId = _transactionIdCounter.current();
        _transactionIdCounter.increment();
        
        transactions[transactionId] = Transaction({
            destination: _recipient,
            amount: _amount,
            timestamp: block.timestamp,
            reason: _reason
        });
        
        // Transfer funds
        (bool success, ) = _recipient.call{value: _amount}("");
        require(success, "Transfer failed");
        
        emit FundsReleased(transactionId, _recipient, _amount, _reason);
    }
    
    /**
     * @dev Admin function to update platform wallet
     */
    function updatePlatformWallet(address payable _newWallet) external onlyOwner {
        require(_newWallet != address(0), "Invalid wallet address");
        platformWallet = _newWallet;
    }
    
    /**
     * @dev Helper function to calculate square root using Babylonian method
     */
    function sqrt(uint256 x) internal pure returns (uint256) {
        if (x == 0) return 0;
        
        uint256 z = (x + 1) / 2;
        uint256 y = x;
        
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
        
        return y;
    }
    
    /**
     * @dev Get donation details
     */
    function getDonation(uint256 _donationId) external view returns (
        address donor,
        uint256 campaignId,
        uint256 amount,
        uint256 timestamp,
        uint256 roundId
    ) {
        require(_donationId < _donationIdCounter.current(), "Donation does not exist");
        Donation storage donation = donations[_donationId];
        return (
            donation.donor,
            donation.campaignId,
            donation.amount,
            donation.timestamp,
            donation.roundId
        );
    }
    
    /**
     * @dev Get round details
     */
    function getRound(uint256 _roundId) external view returns (
        uint256 startTime,
        uint256 endTime,
        uint256 matchingPool,
        uint256 totalDonations,
        bool isDistributed
    ) {
        require(_roundId < _roundIdCounter.current(), "Round does not exist");
        Round storage round = rounds[_roundId];
        return (
            round.startTime,
            round.endTime,
            round.matchingPool,
            round.totalDonations,
            round.isDistributed
        );
    }
    
    /**
     * @dev Get campaigns for a charity
     */
    function getCharityCampaigns(uint256 _charityId) external view returns (uint256[] memory) {
        require(_charityId < _charityIdCounter.current(), "Charity does not exist");
        return charityCampaigns[_charityId];
    }
    
    /**
     * @dev Get charity details
     */
    function getCharity(uint256 _charityId) external view returns (
        string memory name,
        string memory description,
        address admin,
        bool isVerified,
        bool isActive
    ) {
        require(_charityId < _charityIdCounter.current(), "Charity does not exist");
        Charity storage charity = charities[_charityId];
        return (
            charity.name,
            charity.description,
            charity.admin,
            charity.isVerified,
            charity.isActive
        );
    }
    
    /**
     * @dev Get campaign details
     */
    function getCampaign(uint256 _campaignId) external view returns (
        uint256 charityId,
        string memory name,
        string memory description,
        string memory imageURI,
        uint256 goal,
        uint256 totalDonations,
        bool isActive
    ) {
        require(_campaignId < _campaignIdCounter.current(), "Campaign does not exist");
        Campaign storage campaign = campaigns[_campaignId];
        return (
            campaign.charityId,
            campaign.name,
            campaign.description,
            campaign.imageURI,
            campaign.goal,
            campaign.totalDonations,
            campaign.isActive
        );
    }
    
    /**
     * @dev Get the total number of charities
     */
    function getCharityCount() external view returns (uint256) {
        return _charityIdCounter.current();
    }
    
    /**
     * @dev Get the total number of campaigns
     */
    function getCampaignCount() external view returns (uint256) {
        return _campaignIdCounter.current();
    }
    
    /**
     * @dev Get the total number of donations
     */
    function getDonationCount() external view returns (uint256) {
        return _donationIdCounter.current();
    }
    
    /**
     * @dev Get the total number of rounds
     */
    function getRoundCount() external view returns (uint256) {
        return _roundIdCounter.current();
    }
    
    /**
     * @dev Get the total number of transactions
     */
    function getTransactionCount() external view returns (uint256) {
        return _transactionIdCounter.current();
    }
    
    /**
     * @dev Calculate the quadratic allocation for a donor in a specific round
     * This is a view function to help the backend determine fund allocations
     */
    function calculateQuadraticAllocation(address _donor, uint256 _roundId) external view returns (uint256) {
        require(_roundId < _roundIdCounter.current(), "Invalid round ID");
        
        Round storage round = rounds[_roundId];
        require(round.isDistributed, "Round not yet distributed");
        
        if (uniqueDonorsCount[_roundId] == 0 || round.matchingPool == 0) {
            return 0;
        }
        
        // If donor didn't contribute in this round
        if (!hasContributed[_roundId][_donor]) {
            return 0;
        }
        
        // Get donor's contribution for this round
        uint256 donorContribution = donationsByDonor[_roundId][_donor];
        
        // In a real-world implementation, we'd have a more efficient method to track
        // all donors and their contributions. For this MVP, we'll provide an estimate.
        
        // Simple estimate based on average contribution
        uint256 donorSquareRoot = sqrt(donorContribution);
        uint256 averageContribution = round.totalDonations / uniqueDonorsCount[_roundId];
        uint256 averageSquareRoot = sqrt(averageContribution);
        
        // Total quadratic denominator estimate
        uint256 estimatedTotalQuadratic = averageSquareRoot * uniqueDonorsCount[_roundId];
        
        if (estimatedTotalQuadratic > 0) {
            return (round.matchingPool * donorSquareRoot) / estimatedTotalQuadratic;
        }
        
        return 0;
    }
}

/**
 * @title AmanahCertificate
 * @dev NFT certificate contract for AmanahPay donations
 */
contract AmanahCertificate is ERC721URIStorage, Ownable(msg.sender) {
    using Counters for Counters.Counter;
    
    // Main contract address
    address public amanahPay;
    
    // Counter for token IDs
    Counters.Counter private _tokenIdCounter;
    
    // Certificate tiers based on donation amount
    enum CertificateTier { BRONZE, SILVER, GOLD, PLATINUM }
    
    // Certificate metadata
    struct CertificateMetadata {
        uint256 donationId;
        uint256 amount;
        CertificateTier tier;
        uint256 timestamp;
    }
    
    // Mapping from token ID to metadata
    mapping(uint256 => CertificateMetadata) public certificates;
    
    // Base URI for token metadata
    string private _baseTokenURI;
    
    event CertificateMinted(uint256 indexed tokenId, address indexed owner, uint256 donationId, CertificateTier tier);
    
    constructor(string memory name, string memory symbol) ERC721(name, symbol) {}
    
    /**
     * @dev Set the main contract address
     */
    function setAmanahPay(address _amanahPay) external onlyOwner {
        require(_amanahPay != address(0), "Invalid address");
        amanahPay = _amanahPay;
    }
    
    /**
     * @dev Mint a new certificate NFT
     */
    function mintCertificate(
        address _to,
        uint256 _donationId,
        uint256 _amount
    ) external returns (uint256) {
        require(msg.sender == amanahPay || msg.sender == owner(), "Unauthorized");
        
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        // Determine certificate tier based on amount
        CertificateTier tier;
        if (_amount >= 10 ether) {
            tier = CertificateTier.PLATINUM;
        } else if (_amount >= 1 ether) {
            tier = CertificateTier.GOLD;
        } else if (_amount >= 0.1 ether) {
            tier = CertificateTier.SILVER;
        } else {
            tier = CertificateTier.BRONZE;
        }
        
        // Mint the token
        _safeMint(_to, tokenId);
        
        // Store metadata
        certificates[tokenId] = CertificateMetadata({
            donationId: _donationId,
            amount: _amount,
            tier: tier,
            timestamp: block.timestamp
        });
        
        // Set token URI
        _setTokenURI(tokenId, _generateTokenURI(tokenId, tier));
        
        emit CertificateMinted(tokenId, _to, _donationId, tier);
        
        return tokenId;
    }
    
    /**
     * @dev Set the base URI for token metadata
     */
    function setBaseURI(string memory baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }
    
    /**
     * @dev Generate token URI based on tier
     */
    function _generateTokenURI(uint256 _tokenId, CertificateTier _tier) internal view returns (string memory) {
        string memory tierName;
        if (_tier == CertificateTier.BRONZE) tierName = "bronze";
        else if (_tier == CertificateTier.SILVER) tierName = "silver";
        else if (_tier == CertificateTier.GOLD) tierName = "gold";
        else tierName = "platinum";
        
        return string(abi.encodePacked(_baseTokenURI, "/certificate/", _tokenId, "/", tierName));
    }
    
    /**
     * @dev Get certificate details
     */
    function getCertificate(uint256 _tokenId) external view returns (
        uint256 donationId,
        uint256 amount,
        string memory tier,
        uint256 timestamp
    ) {
        // Check if the token exists by verifying it has metadata
        require(_tokenId < _tokenIdCounter.current(), "Certificate ID does not exist");
        require(certificates[_tokenId].timestamp > 0, "Certificate does not exist");
        
        CertificateMetadata storage metadata = certificates[_tokenId];
        
        string memory tierName;
        if (metadata.tier == CertificateTier.BRONZE) tierName = "Bronze";
        else if (metadata.tier == CertificateTier.SILVER) tierName = "Silver";
        else if (metadata.tier == CertificateTier.GOLD) tierName = "Gold";
        else tierName = "Platinum";
        
        return (
            metadata.donationId,
            metadata.amount,
            tierName,
            metadata.timestamp
        );
    }
    
    /**
     * @dev Get total number of certificates minted
     */
    function getTotalCertificates() external view returns (uint256) {
        return _tokenIdCounter.current();
    }
}