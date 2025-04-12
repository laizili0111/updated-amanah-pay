import React, { useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';
import DonationHistory from '@/components/transactions/DonationHistory';
import ContributionDashboard from '@/components/dashboard/ContributionDashboard';
import UserCampaignsDashboard from '@/components/dashboard/UserCampaignsDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ZakatCalculator from '@/components/zakat/ZakatCalculator';
import { useAuth } from '@/hooks';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { getCurrentUserDonations } from '@/lib/api/donations';

// Format donation data for the dashboard
const formatDashboardData = (donations = []) => {
  if (!donations || !donations.length) {
    // Return mock data for empty donations
    const mockMonths = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - 5 + i);
      return {
        name: date.toLocaleString('default', { month: 'short' }),
        amount: Math.floor(Math.random() * 500) + 100 // Random amount between 100-600
      };
    });
    
    return {
      totalDonations: 2750,
      campaignsContributed: 8,
      totalTransactions: 14,
      monthlySummary: mockMonths,
      categoryDistribution: [
        { name: 'Education', value: 1200, color: '#8884d8' },
        { name: 'Healthcare', value: 800, color: '#83a6ed' },
        { name: 'Community', value: 450, color: '#8dd1e1' },
        { name: 'Emergency Relief', value: 300, color: '#82ca9d' },
      ]
    };
  }
  
  try {
    // Calculate total donations (sum of fiat amounts)
    const totalDonations = donations.reduce((sum, donation) => {
      const amount = parseFloat(donation.fiat_amount || donation.fiatAmount || 0);
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
    
    // Count unique campaigns
    const uniqueCampaigns = new Set(
      donations.map(d => d.campaign_id || d.campaignId)
    );
    
    // Generate monthly summary for the last 6 months
    const monthlySummary = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      
      const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      
      const monthlyTotal = donations.reduce((sum, donation) => {
        const donationDate = new Date(donation.created_at || donation.createdAt);
        const donationMonthYear = `${donationDate.getFullYear()}-${(donationDate.getMonth() + 1).toString().padStart(2, '0')}`;
        
        if (donationMonthYear === monthYear) {
          const amount = parseFloat(donation.fiat_amount || donation.fiatAmount || 0);
          return sum + (isNaN(amount) ? 0 : amount);
        }
        return sum;
      }, 0);
      
      monthlySummary.push({
        name: date.toLocaleString('default', { month: 'short' }),
        amount: monthlyTotal
      });
    }
    
    // Generate category distribution based on campaigns
    // Group donations by campaign category
    const categoryMap = new Map();
    const colors = ['#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c'];
    
    donations.forEach((donation, index) => {
      const category = donation.Campaign?.category || 'Other';
      const amount = parseFloat(donation.fiat_amount || donation.fiatAmount || 0);
      
      if (!isNaN(amount)) {
        if (categoryMap.has(category)) {
          categoryMap.set(category, categoryMap.get(category) + amount);
        } else {
          categoryMap.set(category, amount);
        }
      }
    });
    
    const categoryDistribution = Array.from(categoryMap.entries()).map(([name, value], index) => ({
      name,
      value,
      color: colors[index % colors.length]
    }));
    
    return {
      totalDonations,
      campaignsContributed: uniqueCampaigns.size,
      totalTransactions: donations.length,
      monthlySummary,
      categoryDistribution
    };
  } catch (err) {
    console.error('Error formatting dashboard data:', err);
    return {
      totalDonations: 0,
      campaignsContributed: 0,
      totalTransactions: 0,
      monthlySummary: [],
      categoryDistribution: []
    };
  }
};

const Dashboard = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [donations, setDonations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null);
  const [apiEndpoint, setApiEndpoint] = useState<string | null>(null);
  const [dashboardError, setDashboardError] = useState<boolean>(false);

  const fetchDonations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setDashboardError(false);
      setConnectionStatus("Connecting to API...");
      
      try {
        // Try the primary endpoint
        setApiEndpoint('/api/donations/me');
        const data = await getCurrentUserDonations();
        
        // Handle different response formats
        if (data && typeof data === 'object') {
          if (Array.isArray(data)) {
            setDonations(data);
          } else if (data.data && Array.isArray(data.data)) {
            setDonations(data.data);
          } else if (data.donations && Array.isArray(data.donations)) {
            setDonations(data.donations);
          } else {
            console.log('Unexpected data format:', data);
            setDonations([]);
          }
        }
        setConnectionStatus("API connected successfully");
      } catch (apiErr: any) {
        setApiEndpoint(apiErr?.config?.url || 'Unknown endpoint');
        console.warn("Error fetching donations:", apiErr);
        
        const errorMessage = apiErr.response?.data?.message || apiErr.message || 'Unknown error';
        setError(`API Error (${apiErr.response?.status || 'Unknown'}): ${errorMessage}`);
        setConnectionStatus("Failed to load donations");
        setDonations([]);
        
        // Only set dashboard error if it's a critical error
        if (apiErr.response?.status >= 500) {
          setDashboardError(true);
        }
      }
    } catch (err: any) {
      console.error("Error in donation fetch process:", err);
      setError(err.message || "Failed to process donations request");
      setConnectionStatus("API connection process failed");
      setDashboardError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDonations();
    }
  }, [user]);

  const handleRetry = () => {
    fetchDonations();
  };

  const handleReload = () => {
    window.location.reload();
  };

  // Format transactions for the donation history component
  const formatTransactions = (donationData) => {
    if (!donationData || !donationData.length) {
      // Return mock transaction data
      const mockTransactions = [];
      const campaignNames = ['Education for All', 'Healthcare Initiative', 'Community Development', 'Emergency Relief Fund', 'Food Security Program'];
      
      // Generate 12 mock transactions, spanning last 3 months
      for (let i = 0; i < 12; i++) {
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 90)); // Random date within last 90 days
        
        mockTransactions.push({
          id: `mock-${i+1}`,
          date: date.toISOString().split('T')[0],
          amount: Math.floor(Math.random() * 400) + 100, // Random amount between 100-500
          currency: 'MYR',
          campaignName: campaignNames[Math.floor(Math.random() * campaignNames.length)],
          campaignId: Math.floor(Math.random() * 10) + 1,
          status: Math.random() > 0.1 ? 'success' : 'pending' // 90% success, 10% pending
        });
      }
      
      // Sort by date, newest first
      return mockTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    
    return donationData.map(d => ({
      id: d.id.toString(),
      date: new Date(d.created_at || d.createdAt).toISOString().split('T')[0],
      amount: parseFloat(d.amount),
      currency: d.fiat_currency || d.fiatCurrency || 'ETH',
      campaignName: d.Campaign?.name || `Campaign #${d.campaign_id || d.campaignId}`,
      campaignId: (d.campaign_id || d.campaignId).toString(),
      status: d.transaction_hash || d.transactionHash ? 'success' : 'pending'
    }));
  };

  // Calculate dashboard metrics from real data
  const dashboardData = formatDashboardData(donations);
  const formattedTransactions = formatTransactions(donations);

  if (dashboardError) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto p-6 border border-red-200 rounded-lg bg-red-50 text-red-800">
            <AlertCircle className="h-12 w-12 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-center mb-2">Something went wrong</h2>
            <p className="text-center mb-6">
              The application encountered an error. Please try refreshing the page.
            </p>
            <Button 
              className="w-full bg-white hover:bg-gray-100 text-red-800 border-red-300"
              onClick={handleReload}
            >
              Refresh Page
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Your Dashboard</h1>
        
        {connectionStatus && (
          <Alert className="mb-4" variant={connectionStatus.includes("failed") ? "destructive" : "default"}>
            <AlertTitle>API Status</AlertTitle>
            <AlertDescription>
              {connectionStatus} {apiEndpoint && `(${apiEndpoint})`}
              {error && (
                <div className="mt-2 text-sm">
                  <span>Error: {error}</span>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}
        
        {isLoading || authLoading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="history">Donation History</TabsTrigger>
              <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
              <TabsTrigger value="zakat">Zakat Calculator</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <ContributionDashboard 
                totalDonations={dashboardData.totalDonations}
                campaignsContributed={dashboardData.campaignsContributed}
                totalTransactions={dashboardData.totalTransactions}
                monthlySummary={dashboardData.monthlySummary}
                categoryDistribution={dashboardData.categoryDistribution}
              />
            </TabsContent>
            
            <TabsContent value="history">
              <div className="mb-4 flex justify-between items-center">
                <h2 className="text-2xl font-semibold">Donation History</h2>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRetry} 
                  disabled={isLoading}
                  className="flex items-center gap-1"
                >
                  <RefreshCw size={14} />
                  Refresh
                </Button>
              </div>
              <DonationHistory transactions={formattedTransactions} />
            </TabsContent>
            
            <TabsContent value="campaigns">
              <UserCampaignsDashboard />
            </TabsContent>
            
            <TabsContent value="zakat">
              <div className="mb-4">
                <h2 className="text-2xl font-semibold">Zakat Calculator</h2>
                <p className="text-muted-foreground">
                  Calculate your Zakat obligations based on your assets
                </p>
              </div>
              <ZakatCalculator />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
