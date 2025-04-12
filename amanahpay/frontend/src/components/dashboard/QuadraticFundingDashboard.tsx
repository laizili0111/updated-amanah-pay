import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Clock, Award, TrendingUp, Users, DollarSign } from 'lucide-react';
import { getRounds, getCurrentRound, Round } from '@/lib/api/rounds';
import { formatDistanceToNow } from 'date-fns';

interface QuadraticFundingDashboardProps {
  isAdmin?: boolean;
}

const QuadraticFundingDashboard: React.FC<QuadraticFundingDashboardProps> = ({ isAdmin = false }) => {
  const [currentRound, setCurrentRound] = useState<Round | null>(null);
  const [pastRounds, setPastRounds] = useState<Round[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('current');

  // Mock data for demonstration
  const mockCampaignImpact = [
    { name: 'Educational Fund', donors: 230, donations: 12500, matching: 25000, color: '#4f46e5' },
    { name: 'Medical Aid', donors: 180, donations: 8000, matching: 16000, color: '#8b5cf6' },
    { name: 'Food Security', donors: 120, donations: 5000, matching: 10000, color: '#ec4899' },
    { name: 'Disaster Relief', donors: 85, donations: 3200, matching: 6400, color: '#f43f5e' },
    { name: 'Education', donors: 65, donations: 2400, matching: 4800, color: '#06b6d4' },
  ];

  const mockTimelineData = [
    { date: 'Week 1', donations: 12000, donors: 120 },
    { date: 'Week 2', donations: 19000, donors: 195 },
    { date: 'Week 3', donations: 22000, donors: 250 },
    { date: 'Week 4', donations: 28000, donors: 320 },
  ];

  // Calculate remaining time for current round
  const calculateRemainingTime = (endTime: string) => {
    const end = new Date(endTime);
    return formatDistanceToNow(end, { addSuffix: true });
  };

  // Calculate progress percentage for current round
  const calculateProgress = (startTime: string, endTime: string) => {
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    const now = new Date().getTime();
    
    if (now < start) return 0;
    if (now > end) return 100;
    
    return Math.round(((now - start) / (end - start)) * 100);
  };

  // Fetch rounds data
  useEffect(() => {
    const fetchRoundsData = async () => {
      try {
        setLoading(true);
        const current = await getCurrentRound();
        setCurrentRound(current);
        
        const allRounds = await getRounds();
        setPastRounds(allRounds.filter(round => round.isDistributed));
      } catch (error) {
        console.error('Error fetching rounds data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRoundsData();
  }, []);

  // Format currency
  const formatCurrency = (value: string | number) => {
    return `MYR ${Number(value).toLocaleString()}`;
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading quadratic funding data...</div>;
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="current">Current Round</TabsTrigger>
          <TabsTrigger value="past">Past Rounds</TabsTrigger>
        </TabsList>
        
        <TabsContent value="current" className="space-y-6 pt-4">
          {currentRound ? (
            <>
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-xl">Active Funding Round</CardTitle>
                      <CardDescription>
                        Quadratic funding amplifies the impact of small donations
                      </CardDescription>
                    </div>
                    <Badge variant={new Date() < new Date(currentRound.endTime) ? "default" : "secondary"}>
                      {new Date() < new Date(currentRound.endTime) ? "Active" : "Ended"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col space-y-2">
                      <span className="text-muted-foreground text-sm">Matching Pool</span>
                      <div className="flex items-center">
                        <DollarSign className="h-5 w-5 mr-1 text-primary" />
                        <span className="text-xl font-bold">{formatCurrency(currentRound.matchingPool)}</span>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <span className="text-muted-foreground text-sm">Total Contributions</span>
                      <div className="flex items-center">
                        <TrendingUp className="h-5 w-5 mr-1 text-green-500" />
                        <span className="text-xl font-bold">{formatCurrency(currentRound.totalDonations)}</span>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <span className="text-muted-foreground text-sm">Time Remaining</span>
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 mr-1 text-orange-500" />
                        <span className="text-xl font-medium">
                          {calculateRemainingTime(currentRound.endTime)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{calculateProgress(currentRound.startTime, currentRound.endTime)}%</span>
                    </div>
                    <Progress value={calculateProgress(currentRound.startTime, currentRound.endTime)} />
                  </div>
                </CardContent>
                {isAdmin && (
                  <CardFooter>
                    <Button variant="outline" className="w-full">Administer Round</Button>
                  </CardFooter>
                )}
              </Card>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Campaign Impact</CardTitle>
                    <CardDescription>
                      How donations are matched across campaigns
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={mockCampaignImpact}
                          layout="vertical"
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                          <XAxis type="number" tickFormatter={(value) => `MYR ${value/1000}k`} />
                          <YAxis type="category" dataKey="name" width={100} />
                          <Tooltip formatter={(value) => [`MYR ${Number(value).toLocaleString()}`, 'Amount']} />
                          <Legend />
                          <Bar dataKey="donations" stackId="a" fill="#9f7aea" name="Direct Donations" />
                          <Bar dataKey="matching" stackId="a" fill="#4c1d95" name="Matching Funds" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Round Activity</CardTitle>
                    <CardDescription>
                      Donation progress over the funding round period
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={mockTimelineData}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="date" />
                          <YAxis yAxisId="left" tickFormatter={(value) => `MYR ${value/1000}k`} />
                          <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `${value}`} />
                          <Tooltip />
                          <Legend />
                          <Area yAxisId="left" type="monotone" dataKey="donations" stroke="#8884d8" fill="#8884d8" name="Donations (MYR)" />
                          <Area yAxisId="right" type="monotone" dataKey="donors" stroke="#82ca9d" fill="#82ca9d" name="Donors" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Active Funding Round</CardTitle>
                <CardDescription>
                  There are currently no active quadratic funding rounds
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center p-6 space-y-4">
                  <Award className="h-16 w-16 text-muted-foreground" />
                  <p className="text-center text-muted-foreground">
                    Check back later for the next funding round or view past rounds to see previous impact.
                  </p>
                </div>
              </CardContent>
              {isAdmin && (
                <CardFooter>
                  <Button className="w-full">Create New Round</Button>
                </CardFooter>
              )}
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="past" className="space-y-6 pt-4">
          {pastRounds.length > 0 ? (
            <>
              <div className="grid gap-4">
                {pastRounds.map((round) => (
                  <Card key={round.id}>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">
                          Funding Round #{round.id}
                        </CardTitle>
                        <Badge variant="outline">Completed</Badge>
                      </div>
                      <CardDescription>
                        {new Date(round.startTime).toLocaleDateString()} - {new Date(round.endTime).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex flex-col">
                          <span className="text-sm text-muted-foreground">Matching Pool</span>
                          <span className="text-lg font-medium">{formatCurrency(round.matchingPool)}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm text-muted-foreground">Total Contributions</span>
                          <span className="text-lg font-medium">{formatCurrency(round.totalDonations)}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm text-muted-foreground">Multiplier Effect</span>
                          <span className="text-lg font-medium">
                            {round.totalDonations === '0' 
                              ? 'N/A' 
                              : `${(Number(round.matchingPool) / Number(round.totalDonations)).toFixed(2)}x`}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full">View Details</Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Past Rounds</CardTitle>
                <CardDescription>
                  There are no completed quadratic funding rounds yet
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center p-6 space-y-4">
                  <Users className="h-16 w-16 text-muted-foreground" />
                  <p className="text-center text-muted-foreground">
                    Past rounds will appear here once they have been completed and funds have been distributed.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QuadraticFundingDashboard; 