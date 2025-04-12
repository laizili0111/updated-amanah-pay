import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Clock, Users, TrendingUp, Info } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Round } from '@/lib/api/rounds';
import { Link } from 'react-router-dom';

interface QuadraticFundingPoolCardProps {
  className?: string;
}

// Mock data for development and demonstration
const MOCK_ROUND = {
  id: 1,
  startTime: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
  endTime: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 days from now
  matchingPool: "500000",
  totalDonations: "175000",
  isDistributed: false,
  createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
};

const MOCK_STATS = {
  uniqueDonors: 212,
  totalDonations: "175000",
};

const QuadraticFundingPoolCard: React.FC<QuadraticFundingPoolCardProps> = ({ className }) => {
  const [loading, setLoading] = useState(true);
  const [currentRound] = useState<Round>(MOCK_ROUND);
  const [stats] = useState(MOCK_STATS);

  // Simulate loading delay for a more realistic UI
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  // Calculate progress percentage for current round
  const calculateProgress = (startTime: string, endTime: string) => {
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    const now = new Date().getTime();
    
    if (now < start) return 0;
    if (now > end) return 100;
    
    return Math.round(((now - start) / (end - start)) * 100);
  };

  // Format currency for display
  const formatCurrency = (value: string | number) => {
    return `MYR ${Number(value).toLocaleString()}`;
  };

  if (loading) {
    return (
      <Card className={`w-full ${className}`}>
        <CardContent className="flex items-center justify-center py-6">
          <div className="animate-pulse text-center">
            <div className="h-5 w-40 bg-muted rounded mx-auto mb-2"></div>
            <div className="h-4 w-60 bg-muted rounded mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const progress = calculateProgress(currentRound.startTime, currentRound.endTime);

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              Quadratic Funding Round
              <Badge variant="default">Active</Badge>
            </CardTitle>
            <CardDescription>
              Your small donations have greater impact when they join forces with many others
            </CardDescription>
          </div>
          <Link to="/quadratic-funding">
            <Button variant="outline" size="sm" className="mt-2 md:mt-0">
              <Info className="mr-2 h-4 w-4" />
              Learn More
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="flex flex-col space-y-1">
            <span className="text-sm text-muted-foreground">Matching Pool</span>
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 mr-1 text-primary" />
              <span className="text-lg font-bold">{formatCurrency(currentRound.matchingPool)}</span>
            </div>
          </div>
          
          <div className="flex flex-col space-y-1">
            <span className="text-sm text-muted-foreground">Total Contributions</span>
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-1 text-green-500" />
              <span className="text-lg font-bold">{formatCurrency(currentRound.totalDonations)}</span>
            </div>
          </div>
          
          <div className="flex flex-col space-y-1">
            <span className="text-sm text-muted-foreground">Unique Donors</span>
            <div className="flex items-center">
              <Users className="h-5 w-5 mr-1 text-blue-500" />
              <span className="text-lg font-bold">{stats.uniqueDonors}</span>
            </div>
          </div>
          
          <div className="flex flex-col space-y-1">
            <span className="text-sm text-muted-foreground">Time Remaining</span>
            <div className="flex items-center">
              <Clock className="h-5 w-5 mr-1 text-orange-500" />
              <span className="text-lg font-bold">
                {formatDistanceToNow(new Date(currentRound.endTime), { addSuffix: true })}
              </span>
            </div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span>Round Progress</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardContent>
      <CardFooter className="pt-0 text-sm text-muted-foreground">
        <p>Donate to any campaign now and multiply your impact through quadratic funding!</p>
      </CardFooter>
    </Card>
  );
};

export default QuadraticFundingPoolCard; 