import React, { useState, useEffect, ErrorInfo } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Loader2, ExternalLink, AlertCircle, WalletIcon, RefreshCw } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useApi } from '@/hooks';
import { getCampaigns, Campaign } from '@/lib/api/campaigns';
import web3Service from '@/lib/services/web3';

// Error Boundary class component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode, fallback: React.ReactNode }, 
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode, fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Caught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

// Main dashboard component, wrapped with error boundary
const UserCampaignsDashboardWithErrorBoundary = () => {
  const fallbackUI = (
    <div className="p-6 border border-red-200 rounded-lg bg-red-50 text-red-800">
      <h3 className="text-lg font-medium mb-2">Something went wrong</h3>
      <p className="mb-4">There was an error loading the campaigns dashboard.</p>
      <Button 
        variant="outline" 
        onClick={() => window.location.reload()}
        className="bg-white hover:bg-gray-100"
      >
        Reload Page
      </Button>
    </div>
  );

  return (
    <ErrorBoundary fallback={fallbackUI}>
      <UserCampaignsDashboard />
    </ErrorBoundary>
  );
};

// Donation recipient address for display
const DONATION_RECIPIENT_ADDRESS = '0x0C9Fb68ef196081E01B45EB2f8BE61782e3d8d97';

const UserCampaignsDashboard = () => {
  const { data: campaignsData, isLoading, error, execute } = useApi<Campaign[]>(getCampaigns);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [donationAmount, setDonationAmount] = useState<string>('0.005');
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState<boolean>(false);
  const [wallet, setWallet] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isDonating, setIsDonating] = useState<boolean>(false);
  const [isCheckingConnection, setIsCheckingConnection] = useState<boolean>(true);
  const [networkInfo, setNetworkInfo] = useState<{name: string, chainId: string} | null>(null);
  const [hasError, setHasError] = useState<boolean>(false);
  
  // Check if MetaMask is installed on component mount
  useEffect(() => {
    const checkWallet = async () => {
      try {
        setIsCheckingConnection(true);
        setHasError(false);
        
        // Check if MetaMask is installed
        const hasMetaMask = web3Service.isMetaMaskInstalled();
        setIsMetaMaskInstalled(hasMetaMask);
        
        if (hasMetaMask) {
          try {
            // Try to get any already connected accounts
            const account = await web3Service.getAccount();
            setWallet(account);
            
            // Get network information
            const network = await web3Service.getNetworkDetails();
            setNetworkInfo(network);
            
            // Set up event listeners for account and network changes
            if (window.ethereum) {
              // Remove existing listeners first to prevent duplicates
              window.ethereum.removeListener('accountsChanged', () => {});
              window.ethereum.removeListener('chainChanged', () => {});
              
              // Add new listeners
              window.ethereum.on('accountsChanged', (accounts: string[]) => {
                console.log('accountsChanged', accounts);
                setWallet(accounts[0] || null);
              });
              
              window.ethereum.on('chainChanged', () => {
                console.log('chainChanged');
                window.location.reload();
              });
            }
          } catch (connectionError) {
            console.error("Error connecting to MetaMask:", connectionError);
            // Don't set error - just continue without wallet connection
          }
        }
      } catch (error) {
        console.error("Error checking wallet:", error);
        setHasError(true);
      } finally {
        setIsCheckingConnection(false);
      }
    };
    
    checkWallet();
    
    // Cleanup event listeners
    return () => {
      try {
        if (window.ethereum) {
          window.ethereum.removeListener('accountsChanged', () => {});
          window.ethereum.removeListener('chainChanged', () => {});
        }
      } catch (error) {
        console.error("Error cleaning up event listeners:", error);
      }
    };
  }, []);
  
  const handleConnectWallet = async () => {
    try {
      setIsConnecting(true);
      
      if (!web3Service.isMetaMaskInstalled()) {
        toast.error("MetaMask is not installed");
        return;
      }
      
      const account = await web3Service.connectWallet();
      setWallet(account);
      
      if (account) {
        // Get updated network info after connection
        const network = await web3Service.getNetworkDetails();
        setNetworkInfo(network);
        
        toast.success("Wallet connected successfully!", {
          description: `Connected account: ${account.substring(0, 6)}...${account.substring(account.length - 4)}`
        });
      }
    } catch (error: any) {
      console.error("Connection error:", error);
      toast.error("Failed to connect wallet", {
        description: error.message || "Please try again"
      });
    } finally {
      setIsConnecting(false);
    }
  };
  
  const handleRefreshConnection = async () => {
    try {
      setIsCheckingConnection(true);
      
      // Try to get any already connected accounts
      const account = await web3Service.getAccount();
      setWallet(account);
      
      // Get network information
      const network = await web3Service.getNetworkDetails();
      setNetworkInfo(network);
      
      toast.success("Connection refreshed");
    } catch (error) {
      console.error("Error refreshing connection:", error);
      toast.error("Failed to refresh connection");
    } finally {
      setIsCheckingConnection(false);
    }
  };
  
  const handleDonate = async () => {
    if (!selectedCampaign) {
      toast.error("Please select a campaign to donate to");
      return;
    }
    
    if (!isMetaMaskInstalled) {
      toast.error("MetaMask is required for donations", {
        description: "Please install MetaMask to continue"
      });
      return;
    }
    
    try {
      setIsDonating(true);
      
      // If wallet is not connected, try to connect first
      if (!wallet) {
        try {
          const account = await web3Service.connectWallet();
          if (!account) {
            toast.error("Failed to connect wallet");
            setIsDonating(false);
            return;
          }
          setWallet(account);
        } catch (error: any) {
          toast.error("Wallet connection failed", {
            description: error.message
          });
          setIsDonating(false);
          return;
        }
      }
      
      // Validate the amount
      const numAmount = parseFloat(donationAmount);
      if (isNaN(numAmount) || numAmount <= 0) {
        toast.error("Please enter a valid donation amount");
        setIsDonating(false);
        return;
      }
      
      // Make sure the amount isn't too small (gas costs may exceed very small donations)
      if (numAmount < 0.0001) {
        toast.error("Donation amount too small", {
          description: "Please enter a larger amount to cover network fees"
        });
        setIsDonating(false);
        return;
      }
      
      // Show confirmation toast
      toast.info("Please confirm the transaction in your MetaMask wallet", {
        duration: 10000
      });
      
      // Perform the actual blockchain donation
      const transaction = await web3Service.donate(selectedCampaign.id, donationAmount);
      
      // Check if this was a real transaction
      if (transaction.isReal) {
        toast.success(`Thank you for your ${donationAmount} ETH donation!`, {
          description: `Your transaction has been confirmed on the blockchain. Hash: ${transaction.transactionHash.substring(0, 10)}...`,
          duration: 8000
        });
      } else if (transaction.isMock) {
        toast.warning(`This was a simulated donation (mock mode)`, {
          description: "No real funds were transferred. Mock transaction hash: " + 
                      transaction.transactionHash.substring(0, 10) + "...",
          duration: 8000
        });
      } else {
        toast.success(`Donation of ${donationAmount} ETH completed`, {
          description: `Transaction hash: ${transaction.transactionHash.substring(0, 10)}...`,
        });
      }
      
      // Reset the selected campaign after successful donation
      setSelectedCampaign(null);
      setDonationAmount('0.005');
      
      // Refresh the campaigns list
      execute();
      
    } catch (error: any) {
      console.error("Donation error:", error);
      
      // Handle specific errors
      if (error.message && error.message.includes('user rejected')) {
        toast.error("Transaction was rejected", {
          description: "You declined the transaction in MetaMask"
        });
      } else if (error.message && error.message.includes('insufficient funds')) {
        toast.error("Insufficient funds", {
          description: "Your wallet doesn't have enough ETH to complete this transaction"
        });
      } else if (error.message && (
          error.message.includes('gas estimation') || 
          error.message.includes('CALL_EXCEPTION') ||
          error.message.includes('estimateGas')
      )) {
        toast.error("Transaction setup failed", {
          description: "This could be due to network congestion or low gas. Try again with a different amount."
        });
      } else {
        toast.error("Donation failed", {
          description: error.message || "Please try again"
        });
      }
    } finally {
      setIsDonating(false);
    }
  };
  
  // Safe render check
  const campaigns = Array.isArray(campaignsData) ? campaignsData : [];
  
  if (hasError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Something went wrong</AlertTitle>
        <AlertDescription>
          There was an error with the campaigns dashboard. 
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.location.reload()}
            className="ml-2"
          >
            Reload
          </Button>
        </AlertDescription>
      </Alert>
    );
  }
  
  if (isLoading || isCheckingConnection) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-1/3" />
          <Loader2 className="animate-spin h-4 w-4 ml-2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="rounded-lg border border-destructive p-4 text-destructive flex items-center gap-2">
        <AlertCircle size={18} />
        <p>Error loading campaigns: {error.message}</p>
        <Button variant="outline" size="sm" onClick={execute} className="ml-auto">
          Retry
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">Available Campaigns</h2>
        
        <div className="flex items-center gap-2">
          {!isMetaMaskInstalled ? (
            <Alert variant="warning" className="p-2 max-w-md">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>MetaMask not detected</AlertTitle>
              <AlertDescription className="mt-1">
                <Button variant="outline" asChild size="sm">
                  <a 
                    href="https://metamask.io/download/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs"
                  >
                    Install MetaMask <ExternalLink size={12} />
                  </a>
                </Button>
              </AlertDescription>
            </Alert>
          ) : wallet ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-sm">
                <WalletIcon size={14} />
                <span>
                  {wallet.substring(0, 6)}...{wallet.substring(wallet.length - 4)}
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={handleRefreshConnection} disabled={isCheckingConnection}>
                <RefreshCw size={14} className={isCheckingConnection ? "animate-spin" : ""} />
              </Button>
              <Button variant="outline" size="sm" onClick={handleConnectWallet} disabled={isConnecting}>
                Switch
              </Button>
            </div>
          ) : (
            <Button onClick={handleConnectWallet} disabled={isConnecting} size="sm">
              {isConnecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <WalletIcon className="mr-2 h-4 w-4" />
                  Connect Wallet
                </>
              )}
            </Button>
          )}
        </div>
      </div>
      
      {networkInfo && (
        <div className="text-sm text-muted-foreground">
          Connected to: {networkInfo.name} (Chain ID: {networkInfo.chainId})
        </div>
      )}
      
      {!campaigns || campaigns.length === 0 ? (
        <div className="text-center p-8 border rounded-lg bg-muted/50">
          <p className="mb-4">No campaigns available at this time.</p>
          <Button onClick={execute}>Refresh Campaigns</Button>
        </div>
      ) : (
        <Tabs defaultValue="grid" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="grid">Grid View</TabsTrigger>
            <TabsTrigger value="donate">Donate</TabsTrigger>
          </TabsList>
          
          <TabsContent value="grid" className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {campaigns.map((campaign) => (
                <Card key={campaign.id} className="overflow-hidden flex flex-col">
                  {campaign.imageUrl ? (
                    <img 
                      src={campaign.imageUrl} 
                      alt={campaign.name} 
                      className="w-full h-[150px] object-cover" 
                    />
                  ) : (
                    <div className="w-full h-[150px] bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500">No image available</span>
                    </div>
                  )}
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{campaign.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {campaign.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2 flex-grow">
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>{Number(campaign.totalDonations || 0).toFixed(4)} ETH</span>
                        <span>{Number(campaign.goal || 0).toFixed(4)} ETH</span>
                      </div>
                      <Progress 
                        value={(Number(campaign.totalDonations || 0) / Math.max(Number(campaign.goal || 1), 1)) * 100} 
                        className="h-2" 
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2 flex gap-2">
                    <Button asChild variant="outline" className="flex-1">
                      <Link to={`/campaigns/${campaign.id}`}>
                        View Details
                      </Link>
                    </Button>
                    <Button 
                      className="flex-1"
                      onClick={() => {
                        setSelectedCampaign(campaign);
                        document.querySelector('[data-value="donate"]')?.click();
                      }}
                    >
                      Donate
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="donate" className="w-full">
            <Card>
              <CardHeader>
                <CardTitle>Donate with MetaMask</CardTitle>
                <CardDescription>
                  Support a campaign directly using your Ethereum wallet
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isMetaMaskInstalled ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>MetaMask is required</AlertTitle>
                    <AlertDescription>
                      To make donations using cryptocurrency, you need to install the MetaMask browser extension first.
                      <div className="mt-2">
                        <Button asChild variant="outline" size="sm">
                          <a 
                            href="https://metamask.io/download/" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1"
                          >
                            Install MetaMask <ExternalLink size={14} />
                          </a>
                        </Button>
                      </div>
                    </AlertDescription>
                  </Alert>
                ) : !wallet ? (
                  <div className="text-center py-4">
                    <p className="mb-4">Connect your wallet to make a donation</p>
                    <Button onClick={handleConnectWallet} disabled={isConnecting} className="w-full sm:w-auto">
                      {isConnecting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <WalletIcon className="mr-2 h-4 w-4" />
                          Connect Wallet
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <>
                    <div>
                      <label htmlFor="campaign" className="block text-sm font-medium mb-1">
                        Select Campaign
                      </label>
                      <select
                        id="campaign"
                        className="w-full p-2 rounded-md border border-input bg-background"
                        value={selectedCampaign?.id || ''}
                        onChange={(e) => {
                          const campaign = campaigns.find(c => c.id.toString() === e.target.value);
                          setSelectedCampaign(campaign || null);
                        }}
                      >
                        <option value="">-- Select a campaign --</option>
                        {campaigns.map((campaign) => (
                          <option key={campaign.id} value={campaign.id}>
                            {campaign.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="amount" className="block text-sm font-medium mb-1">
                        Donation Amount (ETH)
                      </label>
                      <Input
                        id="amount"
                        type="number"
                        min="0.001"
                        step="0.001"
                        value={donationAmount}
                        onChange={(e) => setDonationAmount(e.target.value)}
                        placeholder="Enter amount in ETH"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Recommended minimum: 0.005 ETH to ensure transaction success
                      </p>
                    </div>
                    
                    {selectedCampaign && (
                      <div className="p-3 bg-muted rounded-md">
                        <p className="font-medium">Donation Summary</p>
                        <div className="text-sm mt-1 space-y-1">
                          <div className="flex justify-between">
                            <span>Campaign:</span>
                            <span className="font-medium">{selectedCampaign.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Amount:</span>
                            <span className="font-medium">{donationAmount} ETH</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Recipient:</span>
                            <span className="font-medium text-xs break-all">
                              {DONATION_RECIPIENT_ADDRESS}
                            </span>
                          </div>
                          {networkInfo && (
                            <div className="flex justify-between">
                              <span>Network:</span>
                              <span className="font-medium">{networkInfo.name}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <Alert variant="info" className="bg-blue-50 text-blue-700 border-blue-200">
                      <AlertTitle className="flex items-center">
                        <WalletIcon className="mr-2 h-4 w-4" />
                        Important Information
                      </AlertTitle>
                      <AlertDescription className="text-xs text-blue-600 mt-1 space-y-2">
                        <p>
                          Your donation will be sent directly to the AmanahPay operational wallet. Funds are used to support the selected campaign according to our transparent allocation policy.
                        </p>
                        <p className="font-bold">
                          This is a real blockchain transaction that will transfer ETH from your wallet. Please ensure you have sufficient funds.
                        </p>
                      </AlertDescription>
                    </Alert>
                    
                    <Alert variant="warning" className="bg-amber-50 text-amber-700 border-amber-200">
                      <AlertTitle className="flex items-center">
                        <AlertCircle className="mr-2 h-4 w-4" />
                        Troubleshooting Transaction Issues
                      </AlertTitle>
                      <AlertDescription className="text-xs text-amber-600 mt-1">
                        <ul className="list-disc pl-4 space-y-1">
                          <li>Make sure your wallet has enough ETH for both the donation and gas fees</li>
                          <li>Try using a higher amount (0.005 ETH or more)</li>
                          <li>Make sure you're on a supported network (like Ethereum Mainnet)</li>
                          <li>If you get gas estimation errors, try again in a few minutes</li>
                        </ul>
                      </AlertDescription>
                    </Alert>
                  </>
                )}
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                <Button 
                  className="w-full"
                  disabled={!wallet || !selectedCampaign || isDonating || Number(donationAmount) <= 0}
                  onClick={handleDonate}
                >
                  {isDonating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing Donation...
                    </>
                  ) : (
                    'Make Real Blockchain Donation'
                  )}
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  Click the button above to initiate a real Ethereum transfer through MetaMask
                </p>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default UserCampaignsDashboardWithErrorBoundary; 