import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Clock, Users, Share2, Heart, AlertCircle, CreditCard, Smartphone, Building, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import QRCodePayment from '@/components/payments/QRCodePayment';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import CampaignRating from '@/components/campaigns/CampaignRating';
import QuadraticImpactVisualizer from '@/components/quadratic/QuadraticImpactVisualizer';
import web3Service from '@/lib/services/web3';
import { useAuth } from '@/hooks';

const campaignData = {
  id: '1',
  title: 'Masjid Renovation Project',
  description: 'Help us renovate the local masjid to accommodate our growing community and provide better services.',
  longDescription: `
    Our community's masjid has been serving our growing Muslim population for over 20 years, but it now requires significant renovations to continue meeting the needs of our ummah. The current structure is facing several challenges:

    - The prayer hall is too small for Friday prayers, with many worshippers having to pray outside
    - The roof has developed leaks, causing damage during rainy seasons
    - The wudu area needs complete renovation to improve accessibility
    - Heating and cooling systems are outdated and inefficient
    - Additional classrooms are needed for our expanding weekend Islamic school

    This renovation project will expand the prayer hall by 30%, completely renovate the roof and weatherproofing, modernize the wudu facilities, install energy-efficient HVAC systems, and add three new classrooms for education.

    All donations will be tracked on the blockchain for complete transparency, and detailed financial reports will be published monthly. The project has been approved by the local Islamic council, and all construction will be performed by certified contractors.

    Your generous support will help ensure our masjid continues to be a center for worship, education, and community for generations to come. May Allah reward your generosity.
  `,
  imageUrl: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?q=80&w=1200&auto=format&fit=crop',
  goal: 250000,
  raised: 162500,
  currency: 'MYR',
  daysLeft: 21,
  supporters: 147,
  category: 'Masjid',
  organizationName: 'Islamic Community Center',
  organizationLogo: 'https://randomuser.me/api/portraits/lego/1.jpg',
  updates: [
    {
      date: '2023-03-01',
      title: 'Construction Begins',
      content: 'We are excited to announce that construction has officially begun on the masjid renovation project. The first phase involves roof repairs and structural assessments.'
    },
    {
      date: '2023-02-15',
      title: 'Architectural Plans Approved',
      content: 'The city council has approved our architectural plans. We can now proceed with the renovation as scheduled.'
    },
    {
      date: '2023-01-20',
      title: 'Fundraising Campaign Launch',
      content: 'Today we officially launch our fundraising campaign for the masjid renovation. We thank everyone for their support and duas.'
    }
  ],
  blockchainTransactions: [
    { 
      txHash: '0x2a567de4ac1cbd4c41c48988963988211c45a1c2a1d1bd4545',
      date: '2023-03-05',
      amount: 0.25,
      currency: 'ETH'
    },
    { 
      txHash: '0x8b34f67de43c21a56789a452bb4e3267fdde321ac34a45c2',
      date: '2023-02-25',
      amount: 0.5,
      currency: 'ETH'
    },
    { 
      txHash: '0x3c45de67843abc1357924680abcdef12345678901234567',
      date: '2023-02-10',
      amount: 0.7,
      currency: 'ETH'
    }
  ]
};

const CampaignDetail = () => {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const [donationAmount, setDonationAmount] = useState<string>('250');
  const fiatCurrency = 'MYR';
  const cryptoCurrency = 'ETH';
  const [donationTab, setDonationTab] = useState<string>('fiat');
  const [paymentMethod, setPaymentMethod] = useState<string>('card');
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState<boolean>(false);
  const [wallet, setWallet] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const progress = (campaignData.raised / campaignData.goal) * 100;
  
  // Check if MetaMask is installed on component mount
  useEffect(() => {
    const checkWallet = async () => {
      const hasMetaMask = web3Service.isMetaMaskInstalled();
      setIsMetaMaskInstalled(hasMetaMask);
      
      if (hasMetaMask) {
        const account = await web3Service.getAccount();
        setWallet(account);
      }
    };
    
    checkWallet();
  }, []);
  
  const handleConnectWallet = async () => {
    try {
      setIsLoading(true);
      const account = await web3Service.connectWallet();
      setWallet(account);
      if (account) {
        toast.success("Wallet connected successfully!");
      }
    } catch (error: any) {
      toast.error("Failed to connect wallet", {
        description: error.message || "Please try again"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDonate = async () => {
    // Handle fiat donations with original logic
    if (donationTab === 'fiat') {
      toast.success(`Thank you for your ${donationAmount} ${fiatCurrency} donation!`, {
        description: `Your transaction via ${getPaymentMethodName(paymentMethod)} is being processed.`,
      });
      return;
    }
    
    // Handle crypto donations with Web3
    try {
      if (!id) {
        toast.error("Campaign ID is missing");
        return;
      }
      
      setIsLoading(true);
      
      // If wallet is not connected, try to connect first
      if (!wallet) {
        const account = await web3Service.connectWallet();
        if (!account) {
          toast.error("Please connect your wallet to donate");
          setIsLoading(false);
          return;
        }
        setWallet(account);
      }
      
      // Perform the actual blockchain donation
      const campaignIdNumber = parseInt(id);
      const transaction = await web3Service.donate(campaignIdNumber, donationAmount);
      
      toast.success(`Thank you for your ${donationAmount} ETH donation!`, {
        description: `Your transaction has been submitted to the blockchain. Hash: ${transaction.transactionHash.substring(0, 10)}...`,
      });
      
      // Add new transaction to the displayed list
      const newTx = {
        txHash: transaction.transactionHash,
        date: new Date().toISOString().split('T')[0],
        amount: parseFloat(donationAmount),
        currency: 'ETH'
      };
      
      campaignData.blockchainTransactions.unshift(newTx);
      
    } catch (error: any) {
      console.error("Donation error:", error);
      toast.error("Donation failed", {
        description: error.message || "Please try again"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const getPaymentMethodName = (method: string) => {
    switch(method) {
      case 'card': return 'Credit/Debit Card';
      case 'bank': return 'Bank Transfer';
      case 'ewallet': return 'E-Wallet';
      default: return '';
    }
  };
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <img 
              src={campaignData.imageUrl} 
              alt={campaignData.title}
              className="w-full h-96 object-cover rounded-xl mb-6" 
            />
            
            <h1 className="text-3xl font-bold mb-4">{campaignData.title}</h1>
            
            <div className="flex items-center mb-6">
              <img 
                src={campaignData.organizationLogo} 
                alt={campaignData.organizationName}
                className="w-10 h-10 rounded-full mr-3" 
              />
              <span className="font-medium">{campaignData.organizationName}</span>
              <span className="mx-3 text-gray-400">•</span>
              <span className="bg-islamic-secondary/20 text-islamic-dark px-3 py-1 rounded-full text-sm">
                {campaignData.category}
              </span>
            </div>
            
            <Tabs defaultValue="about">
              <TabsList className="w-full">
                <TabsTrigger value="about" className="flex-1">About</TabsTrigger>
                <TabsTrigger value="updates" className="flex-1">Updates</TabsTrigger>
                <TabsTrigger value="transactions" className="flex-1">Blockchain Transactions</TabsTrigger>
                <TabsTrigger value="ratings" className="flex-1">Community Ratings</TabsTrigger>
              </TabsList>
              
              <TabsContent value="about" className="mt-6">
                <div className="prose max-w-none">
                  <p className="text-gray-600 whitespace-pre-line">{campaignData.longDescription}</p>
                </div>
              </TabsContent>
              
              <TabsContent value="updates" className="mt-6">
                <div className="space-y-6">
                  {campaignData.updates.map((update, index) => (
                    <div key={index} className="border-l-4 border-islamic-primary pl-4 py-2">
                      <div className="text-sm text-gray-500 mb-1">{update.date}</div>
                      <h3 className="font-medium text-lg mb-2">{update.title}</h3>
                      <p className="text-gray-600">{update.content}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="transactions" className="mt-6">
                <div className="rounded-lg border overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction Hash</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {campaignData.blockchainTransactions.map((tx, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tx.date}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{tx.amount} {tx.currency}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate max-w-xs">
                            <a href="#" className="text-islamic-primary hover:underline">
                              {tx.txHash.substring(0, 10)}...{tx.txHash.substring(tx.txHash.length - 8)}
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
              
              <TabsContent value="ratings" className="mt-6">
                <CampaignRating campaignId={id || '1'} />
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="lg:sticky lg:top-8 self-start">
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-islamic-dark font-medium">
                    {campaignData.raised.toLocaleString()} {campaignData.currency}
                  </span>
                  <span className="text-gray-500">
                    of {campaignData.goal.toLocaleString()} {campaignData.currency} goal
                  </span>
                </div>
                <Progress value={progress} className="h-2 mb-4" />
                
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="bg-islamic-primary/10 rounded-lg p-3 text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Users size={18} className="text-islamic-primary mr-1" />
                      <span className="font-medium">{campaignData.supporters}</span>
                    </div>
                    <span className="text-xs text-gray-500">Supporters</span>
                  </div>
                  <div className="bg-islamic-primary/10 rounded-lg p-3 text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Clock size={18} className="text-islamic-primary mr-1" />
                      <span className="font-medium">{campaignData.daysLeft}</span>
                    </div>
                    <span className="text-xs text-gray-500">Days Left</span>
                  </div>
                </div>

                {/* Quadratic Impact Visualizer */}
                <QuadraticImpactVisualizer 
                  campaignId={parseInt(id || '1')} 
                  className="mb-6" 
                />
              </div>
              
              <Tabs value={donationTab} onValueChange={setDonationTab}>
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="fiat">Donate with Fiat</TabsTrigger>
                  <TabsTrigger value="crypto">Donate with Crypto</TabsTrigger>
                </TabsList>
                
                <TabsContent value="fiat">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="donationAmount">Donation Amount ({fiatCurrency})</Label>
                      <div className="grid grid-cols-4 gap-2 mb-2">
                        {[50, 100, 250, 500].map(amount => (
                          <Button 
                            key={amount}
                            type="button"
                            variant={donationAmount === amount.toString() ? "default" : "outline"}
                            onClick={() => setDonationAmount(amount.toString())}
                          >
                            {amount}
                          </Button>
                        ))}
                      </div>
                      <Input 
                        id="donationAmount"
                        type="number" 
                        value={donationAmount}
                        onChange={(e) => setDonationAmount(e.target.value)}
                        placeholder="Other amount"
                      />
                    </div>
                    
                    <div>
                      <Label className="mb-2 block">Payment Method</Label>
                      <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                        <div className="flex items-center space-x-2 rounded-md border p-3 mb-2">
                          <RadioGroupItem value="card" id="card" />
                          <Label htmlFor="card" className="flex-1 cursor-pointer">
                            <div className="flex items-center">
                              <CreditCard className="mr-2 h-5 w-5 text-islamic-primary" />
                              Credit/Debit Card
                            </div>
                          </Label>
                        </div>
                        
                        <div className="flex items-center space-x-2 rounded-md border p-3 mb-2">
                          <RadioGroupItem value="bank" id="bank" />
                          <Label htmlFor="bank" className="flex-1 cursor-pointer">
                            <div className="flex items-center">
                              <Building className="mr-2 h-5 w-5 text-islamic-primary" /> 
                              Bank Transfer
                            </div>
                          </Label>
                        </div>
                        
                        <div className="flex items-center space-x-2 rounded-md border p-3">
                          <RadioGroupItem value="ewallet" id="ewallet" />
                          <Label htmlFor="ewallet" className="flex-1 cursor-pointer">
                            <div className="flex items-center">
                              <Smartphone className="mr-2 h-5 w-5 text-islamic-primary" />
                              E-Wallet
                            </div>
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    {paymentMethod === 'ewallet' ? (
                      <div className="mt-4">
                        <h3 className="text-center font-medium mb-3">Scan to Pay</h3>
                        <QRCodePayment amount={donationAmount} campaignId={id || '1'} />
                      </div>
                    ) : (
                      <Button 
                        className="w-full" 
                        size="lg"
                        onClick={handleDonate}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          `Donate ${donationAmount} ${fiatCurrency}`
                        )}
                      </Button>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="crypto">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="cryptoAmount">Donation Amount (ETH)</Label>
                      <div className="grid grid-cols-4 gap-2 mb-2">
                        {[0.01, 0.05, 0.1, 0.5].map(amount => (
                          <Button 
                            key={amount}
                            type="button"
                            variant={donationAmount === amount.toString() ? "default" : "outline"}
                            onClick={() => setDonationAmount(amount.toString())}
                          >
                            {amount}
                          </Button>
                        ))}
                      </div>
                      <Input 
                        id="cryptoAmount"
                        type="number" 
                        value={donationAmount}
                        onChange={(e) => setDonationAmount(e.target.value)}
                        placeholder="Other amount"
                        step="0.001"
                      />
                    </div>
                    
                    {wallet ? (
                      <div>
                        <div className="bg-gray-100 rounded-md p-3 mb-4">
                          <p className="text-xs text-gray-600 mb-1">Connected Wallet</p>
                          <p className="font-mono text-sm truncate">{wallet}</p>
                        </div>
                        <Button 
                          className="w-full" 
                          size="lg"
                          onClick={handleDonate}
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            `Donate ${donationAmount} ${cryptoCurrency}`
                          )}
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        className="w-full" 
                        size="lg"
                        onClick={handleConnectWallet}
                        disabled={isLoading || !isMetaMaskInstalled}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Connecting...
                          </>
                        ) : !isMetaMaskInstalled ? (
                          "MetaMask not installed"
                        ) : (
                          "Connect Wallet"
                        )}
                      </Button>
                    )}
                    
                    {!isMetaMaskInstalled && (
                      <div className="flex items-start mt-2">
                        <AlertCircle className="text-yellow-500 mr-2 h-5 w-5 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-gray-600">
                          MetaMask extension is required for crypto donations. 
                          <a 
                            href="https://metamask.io/download/" 
                            target="_blank" 
                            rel="noreferrer"
                            className="text-islamic-primary ml-1 hover:underline"
                          >
                            Install MetaMask
                          </a>
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            
            <div className="mt-4 flex justify-between">
              <Button variant="outline" size="sm" className="flex-1 mr-2">
                <Heart className="mr-2 h-4 w-4" />
                Save
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CampaignDetail;
