
import React from 'react';
import CampaignCard, { CampaignProps } from './CampaignCard';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const SAMPLE_CAMPAIGNS: CampaignProps[] = [
  {
    id: '1',
    title: 'Masjid Renovation Project',
    description: 'Help us renovate the local masjid to accommodate our growing community and provide better services.',
    imageUrl: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?q=80&w=800&auto=format&fit=crop',
    goal: 250000,
    raised: 162500,
    currency: 'MYR',
    daysLeft: 21,
    supporters: 147,
    category: 'Masjid'
  },
  {
    id: '2',
    title: 'Eid Food Packages',
    description: 'Provide food packages to families in need during the blessed month of Ramadan and for Eid celebrations.',
    imageUrl: 'https://plus.unsplash.com/premium_photo-1723532511908-8aaab763942b?q=80&w=1958&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    goal: 50000,
    raised: 43750,
    currency: 'MYR',
    daysLeft: 7,
    supporters: 215,
    category: 'Food Aid'
  },
  {
    id: '3',
    title: 'Islamic Education Scholarship',
    description: 'Support students pursuing Islamic studies with scholarships to cover tuition and living expenses.',
    imageUrl: 'https://plus.unsplash.com/premium_photo-1661382504923-8085addc989c?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    goal: 125000,
    raised: 61500,
    currency: 'MYR',
    daysLeft: 45,
    supporters: 78,
    category: 'Education'
  }
];

const FeaturedCampaigns: React.FC = () => {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10">
          <div>
            <h2 className="islamic-heading text-3xl">Featured Campaigns</h2>
            <p className="text-gray-600 mt-2">Support these important causes in our community</p>
          </div>
          <Button asChild variant="outline" className="mt-4 md:mt-0">
            <Link to="/campaigns">View All Campaigns</Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SAMPLE_CAMPAIGNS.map((campaign) => (
            <CampaignCard key={campaign.id} {...campaign} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCampaigns;
