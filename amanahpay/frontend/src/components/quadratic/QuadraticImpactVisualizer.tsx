import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import apiClient from '@/lib/api-client';

interface QuadraticImpactVisualizerProps {
  campaignId: number;
  className?: string;
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

const QuadraticImpactVisualizer: React.FC<QuadraticImpactVisualizerProps> = ({ campaignId, className }) => {
  const [amount, setAmount] = useState(100);
  const [impact, setImpact] = useState<ImpactData | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasRound, setHasRound] = useState(true);

  useEffect(() => {
    const fetchImpact = async () => {
      try {
        setLoading(true);
        
        const response = await apiClient.post('/api/donations/estimate-quadratic-impact', {
          amount,
          campaignId
        });
        
        setImpact(response.data.data);
        setHasRound(true);
      } catch (error) {
        console.error('Error fetching impact data:', error);
        setHasRound(false);
      } finally {
        setLoading(false);
      }
    };

    // Debounce the API call to avoid too many requests
    const timeoutId = setTimeout(() => {
      fetchImpact();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [amount, campaignId]);

  // Calculate the multiplier effect of the donation
  const calculateMultiplier = () => {
    if (!impact) return 1;
    
    const donationAmount = Number(impact.donation.amount);
    const matchingImpact = Number(impact.matching.impact);
    
    if (donationAmount === 0) return 0;
    return (matchingImpact / donationAmount);
  };

  // Format currency values
  const formatCurrency = (value: string | number) => {
    return `MYR ${Number(value).toLocaleString()}`;
  };

  if (!hasRound) {
    return null; // Don't show anything if there's no active round
  }

  const multiplier = calculateMultiplier();
  const totalImpact = amount + (impact ? Number(impact.matching.impact) : 0);

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium flex items-center">
            See Your Potential Impact
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="ml-1 text-muted-foreground">
                    <Info className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Through quadratic funding, your donation is matched from our funding pool based on the number of donors, not just the amount.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </h4>
          <span className="text-xs text-muted-foreground">Donation Amount: {formatCurrency(amount)}</span>
        </div>

        <Slider
          value={[amount]}
          min={10}
          max={1000}
          step={10}
          onValueChange={(value) => setAmount(value[0])}
          className="my-4"
        />

        <div className="relative h-8 bg-muted rounded-full overflow-hidden">
          {/* Base donation */}
          <div 
            className="absolute h-full bg-primary/80 transition-all duration-300"
            style={{ width: `${(amount / totalImpact) * 100}%` }}
          />
          {/* Matched amount */}
          <div 
            className="absolute h-full bg-primary transition-all duration-300"
            style={{ 
              width: `${(impact ? Number(impact.matching.impact) / totalImpact : 0) * 100}%`,
              left: `${(amount / totalImpact) * 100}%`
            }}
          />
          
          {/* Labels */}
          <div className="absolute inset-0 flex items-center justify-between px-3 text-xs text-white font-medium">
            <span>Your Donation</span>
            <span>+ Matching: {loading ? '...' : formatCurrency(impact?.matching.impact || 0)}</span>
          </div>
        </div>

        <div className="mt-3 text-center">
          <p className="text-sm">
            <span className="font-semibold">Total Impact: {formatCurrency(totalImpact)}</span>
            {' '}
            <span className="text-muted-foreground text-xs">
              ({loading ? 'Calculating...' : `${multiplier.toFixed(2)}x multiplier`})
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuadraticImpactVisualizer;