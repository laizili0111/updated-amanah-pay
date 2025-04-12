import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, Award, ArrowRight, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import apiClient from '@/lib/api-client';

interface DonationImpactCardProps {
  amount: number;
  campaignId: number;
  onContinue: () => void;
}

interface ImpactData {
  donation: {
    amount: string;
    campaignId: number;
    roundId: number;
  };
  matching: {
    beforeDonation: string;
    afterDonation: string;
    impact: string;
  };
  matchingPool: {
    total: string;
    roundEndsAt: string;
  };
}

const DonationImpactCard: React.FC<DonationImpactCardProps> = ({ amount, campaignId, onContinue }) => {
  const [loading, setLoading] = useState(true);
  const [impact, setImpact] = useState<ImpactData | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchImpact = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await apiClient.post('/api/donations/estimate-quadratic-impact', {
          amount,
          campaignId
        });
        
        setImpact(response.data.data);
      } catch (error) {
        console.error('Error fetching donation impact:', error);
        setError('Unable to calculate impact. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    if (amount > 0 && campaignId) {
      fetchImpact();
    }
  }, [amount, campaignId]);
  
  // Format large numbers for better readability
  const formatCurrency = (value: string | number) => {
    return `MYR ${Number(value).toLocaleString()}`;
  };
  
  // Calculate percentage increase in matching
  const calculateMatchingIncrease = () => {
    if (!impact) return 0;
    
    const before = Number(impact.matching.beforeDonation);
    const after = Number(impact.matching.afterDonation);
    
    if (before === 0) return 100;
    return Math.round(((after - before) / before) * 100);
  };
  
  // Calculate the multiplier effect of the donation
  const calculateMultiplier = () => {
    if (!impact) return 1;
    
    const donationAmount = Number(impact.donation.amount);
    const matchingImpact = Number(impact.matching.impact);
    
    if (donationAmount === 0) return 0;
    return (matchingImpact / donationAmount).toFixed(2);
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Your Donation Impact</CardTitle>
        <CardDescription>
          See how your donation will be amplified through quadratic funding
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : error ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground">{error}</p>
            <Button variant="outline" className="mt-4" onClick={() => onContinue()}>
              Continue Anyway
            </Button>
          </div>
        ) : impact ? (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col p-4 border rounded-lg">
                <span className="text-sm text-muted-foreground">Your Donation</span>
                <span className="text-2xl font-bold mt-1">{formatCurrency(amount)}</span>
              </div>
              <div className="flex flex-col p-4 border rounded-lg bg-primary/5">
                <span className="text-sm text-muted-foreground">Matching Generated</span>
                <span className="text-2xl font-bold mt-1">{formatCurrency(impact.matching.impact)}</span>
              </div>
            </div>
            
            <div className="bg-muted/30 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Award className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Impact Multiplier</span>
                </div>
                <span className="text-sm font-bold">{calculateMultiplier()}x</span>
              </div>
              
              <p className="text-sm text-muted-foreground">
                Your donation of {formatCurrency(amount)} will generate {formatCurrency(impact.matching.impact)} in matching funds, 
                effectively multiplying your impact by {calculateMultiplier()}x.
              </p>
              
              {Number(impact.matching.beforeDonation) > 0 && (
                <div className="text-xs text-muted-foreground mt-1">
                  This represents a {calculateMatchingIncrease()}% increase in matching for this campaign.
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                Matching pool ends {formatDistanceToNow(new Date(impact.matchingPool.roundEndsAt), { addSuffix: true })}
              </span>
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-muted-foreground">No active funding round available.</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={onContinue} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Calculating...
            </>
          ) : (
            <>
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DonationImpactCard; 