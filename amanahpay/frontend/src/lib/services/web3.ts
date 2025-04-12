// We'll use ethers.js for blockchain interactions
import { ethers } from 'ethers';

// Keep the mock implementation for fallback only in development environments
const mockEthers = {
  BrowserProvider: class MockProvider {
    constructor() {}
    async getSigner() { return {}; }
    async send() { return []; }
    async getNetwork() { return { name: 'mock' }; }
  },
  Contract: class MockContract {
    constructor() {}
    async donate() { 
      return {
        wait: async () => ({
          hash: '0x' + Math.random().toString(16).substring(2, 10),
          blockNumber: Math.floor(Math.random() * 1000)
        })
      };
    }
  },
  parseEther: (value: string) => value
};

// Import ABI directly
const amanahPayABI = [
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_campaignId",
        "type": "uint256"
      }
    ],
    "name": "donate",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "donationId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "donor",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "campaignId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "roundId",
        "type": "uint256"
      }
    ],
    "name": "DonationReceived",
    "type": "event"
  }
];

// Contract and donation recipient addresses
const CONTRACT_ADDRESS = '0xeB42421a4D55593c5C5A290880961b383397A17E';
const DONATION_RECIPIENT_ADDRESS = '0x0C9Fb68ef196081E01B45EB2f8BE61782e3d8d97';

// Define window.ethereum for TypeScript
declare global {
  interface Window {
    ethereum: any;
  }
}

class Web3Service {
  private provider: any = null;
  private signer: any = null;
  private contract: any = null;
  private isInitialized = false;
  private mockEnabled = false; // Always disabled by default - we want real transactions
  
  constructor() {
    // Immediately check for MetaMask
    if (typeof window !== 'undefined') {
      if (!window.ethereum) {
        console.error('MetaMask not detected. Real blockchain transactions will not be possible.');
      } else {
        console.log('MetaMask detected. Blockchain transactions will be processed through MetaMask.');
      }
    }
    
    // Initialize web3 in a non-blocking way
    setTimeout(() => {
      this.initializeWeb3().catch(err => {
        console.error("Failed to initialize Web3 service:", err);
      });
    }, 100);
  }
  
  // Initialize connection to MetaMask/Web3 provider
  private async initializeWeb3() {
    try {
      // Don't try to initialize if already initialized or if window is not defined (SSR)
      if (this.isInitialized || typeof window === 'undefined') return;
      
      if (this.mockEnabled) {
        console.warn('WARNING: Using mock mode. No real blockchain transactions will be made.');
        // Use mock provider
        this.provider = new (mockEthers as any).BrowserProvider();
        this.signer = await this.provider.getSigner();
        this.contract = new (mockEthers as any).Contract(CONTRACT_ADDRESS, amanahPayABI, this.signer);
        console.log('Web3 mock provider initialized');
        this.isInitialized = true;
        return;
      }
      
      // Real implementation with MetaMask
      if (window.ethereum) {
        try {
          // Create a provider using the injected provider
          this.provider = new ethers.BrowserProvider(window.ethereum);
          console.log('Web3 provider initialized with MetaMask. Real blockchain transactions are enabled.');
        } catch (error) {
          console.error('Failed to create provider with MetaMask:', error);
          throw new Error('Could not connect to MetaMask.');
        }
      } else {
        console.error('MetaMask not detected. Please install MetaMask to make donations.');
        throw new Error('MetaMask is not installed.');
      }
      
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize Web3 provider:', error);
      
      // We won't automatically fall back to mock mode anymore
      // Instead, we propagate the error so the UI can handle it
      throw error;
    }
  }
  
  // Connect to wallet
  public async connectWallet(): Promise<string | null> {
    try {
      if (this.mockEnabled) {
        console.warn('WARNING: Using mock mode. This is not a real wallet connection.');
        // Return a mock wallet address
        return '0x' + Math.random().toString(16).substring(2, 42);
      }
      
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed. Please install MetaMask to connect your wallet.');
      }
      
      if (!this.provider) {
        await this.initializeWeb3();
        if (!this.provider) throw new Error('Web3 provider not available');
      }
      
      console.log('Requesting access to MetaMask wallet...');
      
      // Request account access from MetaMask - this will prompt the user
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. User may have denied the request.');
      }
      
      console.log('MetaMask wallet connected:', accounts[0]);
      
      // Get signer after requesting accounts
      this.signer = await this.provider.getSigner();
      
      // Initialize the contract with the signer
      this.contract = new ethers.Contract(CONTRACT_ADDRESS, amanahPayABI, this.signer);
      
      return accounts[0];
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      
      // Instead of falling back to mock mode, we propagate the error
      throw error;
    }
  }
  
  // Get current connected account
  public async getAccount(): Promise<string | null> {
    try {
      if (this.mockEnabled) {
        return null; // No account connected initially in mock mode
      }
      
      if (!this.isMetaMaskInstalled()) {
        throw new Error('MetaMask is not installed');
      }
      
      if (!this.provider) {
        await this.initializeWeb3();
        if (!this.provider) throw new Error('Web3 provider not available');
      }
      
      // Get accounts from MetaMask
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      return accounts[0] || null;
    } catch (error) {
      console.error('Failed to get account:', error);
      return null;
    }
  }
  
  // Execute a donation directly to the recipient address
  public async donate(campaignId: number, amount: string): Promise<any> {
    try {
      if (this.mockEnabled) {
        console.warn('WARNING: Using mock mode. This is not a real blockchain transaction.');
        // Simulate a delay for realism
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Return mock transaction data
        return {
          transactionHash: '0x' + Math.random().toString(16).substring(2, 42),
          blockNumber: Math.floor(Math.random() * 10000),
          isMock: true
        };
      }
      
      // Ensure we have a signer to send transactions
      if (!this.signer) {
        await this.connectWallet();
        if (!this.signer) throw new Error('Cannot make transactions without connecting a wallet first');
      }
      
      // Convert amount to Wei (ETH amount in string format)
      const amountInWei = ethers.parseEther(amount);
      
      console.log(`REAL TRANSACTION: Sending ${amount} ETH to ${DONATION_RECIPIENT_ADDRESS}`);
      
      // Get the current network to check compatibility
      const network = await this.provider.getNetwork();
      console.log(`Network: ${network.name} (${network.chainId})`);
      
      // Get the current wallet balance
      const address = await this.signer.getAddress();
      const balance = await this.provider.getBalance(address);
      console.log(`Wallet balance: ${ethers.formatEther(balance)} ETH`);
      
      // Make sure there's enough balance for the transaction
      if (balance <= amountInWei) {
        throw new Error(`Insufficient funds: You have ${ethers.formatEther(balance)} ETH but trying to send ${amount} ETH`);
      }
      
      // Get current gas price from the network
      const feeData = await this.provider.getFeeData();
      console.log(`Current gas price: ${ethers.formatUnits(feeData.gasPrice || 0, 'gwei')} Gwei`);
      
      // Create simplified transaction object for direct transfer with explicit gas parameters
      const tx = await this.signer.sendTransaction({
        to: DONATION_RECIPIENT_ADDRESS,
        value: amountInWei,
        // Explicitly set higher gas limit to ensure transaction goes through
        gasLimit: 30000, // 21000 is standard for ETH transfers
        // Use maxFeePerGas and maxPriorityFeePerGas for EIP-1559 networks
        ...(feeData.maxFeePerGas && feeData.maxPriorityFeePerGas 
          ? { 
              maxFeePerGas: feeData.maxFeePerGas,
              maxPriorityFeePerGas: feeData.maxPriorityFeePerGas
            } 
          : { gasPrice: feeData.gasPrice }) // Fallback for non-EIP-1559 networks
      });
      
      console.log('Transaction submitted:', tx);
      console.log('Waiting for transaction to be mined...');
      
      // Wait for transaction to be mined
      const receipt = await tx.wait();
      
      console.log('REAL TRANSACTION SUCCESSFUL:', receipt);
      
      // Return transaction details
      return {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        recipient: DONATION_RECIPIENT_ADDRESS,
        amount: amount,
        campaignId: campaignId, // Include this in the response instead of transaction data
        isReal: true
      };
    } catch (error: any) {
      console.error('REAL TRANSACTION FAILED:', error);
      
      // If user rejected transaction in MetaMask
      if (error.code === 4001 || (error.message && error.message.includes('user rejected'))) {
        throw new Error('Transaction was rejected. Please confirm the transaction in MetaMask.');
      }
      
      // If insufficient funds
      if (error.message && error.message.includes('insufficient funds')) {
        throw new Error('Insufficient funds in your wallet to complete this transaction.');
      }
      
      // Handle gas estimation errors specifically
      if (error.message && (
          error.message.includes('gas estimation') || 
          error.message.includes('CALL_EXCEPTION') ||
          error.message.includes('estimateGas')
      )) {
        throw new Error('Transaction failed during gas estimation. Your wallet may not have enough ETH to cover gas fees or the network may be congested. Try using a smaller amount.');
      }
      
      // Network errors
      if (error.message && (
          error.message.includes('network') ||
          error.message.includes('connection')
      )) {
        throw new Error('Network error: Please check your internet connection and try again.');
      }
      
      // Unknown errors - provide more details to help debugging
      throw new Error(`Transaction failed: ${error.message || 'Unknown error'}. Please try again with a smaller amount or contact support.`);
    }
  }
  
  // Check if user has MetaMask installed
  public isMetaMaskInstalled(): boolean {
    if (this.mockEnabled) {
      return true; // Always return true in mock mode
    }
    
    try {
      return typeof window !== 'undefined' && !!window.ethereum;
    } catch (e) {
      return false;
    }
  }
  
  // Get network details
  public async getNetworkDetails(): Promise<any> {
    if (this.mockEnabled) {
      return { name: 'Ethereum (Mock)', chainId: '1', isMock: true };
    }
    
    try {
      if (!this.isMetaMaskInstalled()) {
        throw new Error('MetaMask is not installed');
      }
      
      if (!this.provider) {
        await this.initializeWeb3();
        if (!this.provider) throw new Error('Web3 provider not available');
      }
      
      const network = await this.provider.getNetwork();
      return {
        name: network.name,
        chainId: network.chainId.toString(),
        isReal: true
      };
    } catch (error) {
      console.error('Failed to get network details:', error);
      throw error;
    }
  }
  
  // Toggle mock mode (should only be used in development)
  public toggleMockMode(enable: boolean): void {
    this.mockEnabled = enable;
    console.warn(`Mock mode ${enable ? 'enabled' : 'disabled'}. ${enable ? 'No real blockchain transactions will be made.' : 'Real blockchain transactions will be made.'}`);
    // Reinitialize web3 with new mode
    this.isInitialized = false;
    this.initializeWeb3();
  }
  
  // Check if we're in mock mode
  public isMockModeEnabled(): boolean {
    return this.mockEnabled;
  }
}

// Create and export a singleton instance
const web3Service = new Web3Service();
export default web3Service; 