import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '@/hooks';
import { getCampaigns, Campaign } from '@/lib/api/campaigns';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

export function CampaignList() {
  const { data: campaignsData, isLoading, error, execute } = useApi<Campaign[]>(getCampaigns);
  
  // Retry loading if there was an error
  const handleRetry = () => {
    execute();
  };

  const campaigns = Array.isArray(campaignsData) ? campaignsData : [];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="h-[200px] w-full" />
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-4" />
              <Skeleton className="h-2 w-full mt-2" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-9 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-6">
        <div className="text-red-500 mb-4">
          <p>Error loading campaigns: {error.message}</p>
        </div>
        <Button onClick={handleRetry}>Retry</Button>
      </div>
    );
  }

  if (!campaigns || campaigns.length === 0) {
    return (
      <div className="text-center p-6">
        <p className="mb-4">No campaigns available at this time.</p>
        <Button onClick={handleRetry}>Refresh</Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {campaigns.map((campaign) => (
        <Card key={campaign.id} className="overflow-hidden flex flex-col">
          {campaign.imageUrl ? (
            <img 
              src={campaign.imageUrl} 
              alt={campaign.name} 
              className="w-full h-[200px] object-cover" 
            />
          ) : (
            <div className="w-full h-[200px] bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500">No image available</span>
            </div>
          )}
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">{campaign.name}</CardTitle>
            <CardDescription className="line-clamp-2">
              {campaign.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-2 flex-grow">
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span>{Number(campaign.totalDonations || 0).toFixed(2)} ETH</span>
                <span>{Number(campaign.goal || 0).toFixed(2)} ETH</span>
              </div>
              <Progress 
                value={(Number(campaign.totalDonations || 0) / Math.max(Number(campaign.goal || 1), 1)) * 100} 
                className="h-2" 
              />
            </div>
            <p className="text-sm text-gray-500">
              {Math.round((Number(campaign.totalDonations || 0) / Math.max(Number(campaign.goal || 1), 1)) * 100)}% funded
            </p>
          </CardContent>
          <CardFooter className="pt-2">
            <Button asChild className="w-full">
              <Link to={`/campaigns/${campaign.id}`}>
                View Campaign
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
} 