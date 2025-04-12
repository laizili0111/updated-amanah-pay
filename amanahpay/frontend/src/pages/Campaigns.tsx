import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import CampaignCard, { CampaignProps } from '@/components/campaigns/CampaignCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter, DollarSign, Info, Users, Calculator, Clock } from 'lucide-react';
import QuadraticFundingPoolCard from '@/components/quadratic/QuadraticFundingPoolCard';
import { Link } from 'react-router-dom';

// Sample campaign data
const ALL_CAMPAIGNS: CampaignProps[] = [
  {
    id: '1',
    title: 'Masjid Renovation Project',
    description: 'Help us renovate the local masjid to accommodate our growing community and provide better services.',
    imageUrl: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?q=80&w=800&auto=format&fit=crop',
    goal: 50000,
    raised: 32500,
    currency: 'USD',
    daysLeft: 21,
    supporters: 147,
    category: 'Masjid'
  },
  {
    id: '2',
    title: 'Eid Food Packages',
    description: 'Provide food packages to families in need during the blessed month of Ramadan and for Eid celebrations.',
    imageUrl: 'https://plus.unsplash.com/premium_photo-1723532511908-8aaab763942b?q=80&w=1958&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    goal: 10000,
    raised: 8750,
    currency: 'USD',
    daysLeft: 7,
    supporters: 215,
    category: 'Food Aid'
  },
  {
    id: '3',
    title: 'Islamic Education Scholarship',
    description: 'Support students pursuing Islamic studies with scholarships to cover tuition and living expenses.',
    imageUrl: 'https://plus.unsplash.com/premium_photo-1661382504923-8085addc989c?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    goal: 25000,
    raised: 12300,
    currency: 'USD',
    daysLeft: 45,
    supporters: 78,
    category: 'Education'
  },
  {
    id: '4',
    title: 'Yemen Emergency Relief',
    description: 'Urgent humanitarian aid for families affected by conflict in Yemen, providing food, shelter, and medical care.',
    imageUrl: 'https://plus.unsplash.com/premium_photo-1670689707643-f36b72da4405?q=80&w=2030&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    goal: 100000,
    raised: 67800,
    currency: 'USD',
    daysLeft: 15,
    supporters: 532,
    category: 'Emergency'
  },
  {
    id: '5',
    title: 'Islamic Community Center',
    description: 'Build a new community center offering educational programs, youth activities, and community services.',
    imageUrl: 'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?q=80&w=800&auto=format&fit=crop',
    goal: 200000,
    raised: 89000,
    currency: 'USD',
    daysLeft: 60,
    supporters: 312,
    category: 'Community'
  },
  {
    id: '6',
    title: 'Water Wells in Africa',
    description: 'Provide clean water access by building wells in drought-affected regions across Africa.',
    imageUrl: 'https://images.unsplash.com/photo-1543181077-099f32f30a1c?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    goal: 30000,
    raised: 21500,
    currency: 'USD',
    daysLeft: 30,
    supporters: 178,
    category: 'Water'
  }
];

const categories = [
  'All',
  'Masjid', 
  'Education', 
  'Food Aid', 
  'Emergency', 
  'Community',
  'Water',
  'Zakat',
  'Sadaqah'
];

const Campaigns = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  
  const filteredCampaigns = ALL_CAMPAIGNS.filter(campaign => {
    const matchesSearch = campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         campaign.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'All' || campaign.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  return (
    <Layout>
      <section className="py-8 md:py-12 bg-islamic-primary/10">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-4 text-islamic-dark">Browse Campaigns</h1>
          {/* <p className="text-gray-600 max-w-3xl">
            Explore our collection of Shariah-compliant fundraising campaigns and support causes that matter to you. All donations are processed through our secure blockchain system.
          </p> */}
        </div>
      </section>
      
      {/* Quadratic Funding Pool Section */}
      <section className="py-10 bg-gradient-to-r from-purple-50 to-indigo-50 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-100 rounded-full opacity-50 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-100 rounded-full opacity-50 translate-x-1/3 translate-y-1/3"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-indigo-100 p-2 rounded-full mr-3">
              <DollarSign size={24} className="text-indigo-600" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-center text-indigo-900">Sadaqah Quadratic Funding Pool</h2>
          </div>
          
          <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
            Our quadratic funding pool amplifies the impact of small donations. The more people who donate to a campaign, the more matching funds it receives!
          </p>
          
          <QuadraticFundingPoolCard className="shadow-xl transform hover:scale-[1.01] transition-transform duration-300 border-t-4 border-indigo-500" />
          
          <div className="mt-8 p-6 bg-white rounded-lg shadow-md border border-indigo-100 relative">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 bg-indigo-500 text-white text-xs font-bold py-2 px-3 rounded-full">
              New Feature
            </div>
            
            <h3 className="text-xl font-semibold mb-4 text-indigo-800 flex items-center">
              <Info size={20} className="mr-2" /> How Quadratic Funding Works
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-indigo-50 p-4 rounded-lg">
                <div className="flex items-center mb-3">
                  <Users className="h-5 w-5 text-indigo-600 mr-2" />
                  <div className="font-medium text-indigo-800">Community Support Matters</div>
                </div>
                <p className="text-gray-600 text-sm">
                  Campaigns with more donors receive more matching funds, regardless of donation size. 100 people donating $1 each can generate more matching than 1 person donating $100!
                </p>
              </div>
              
              <div className="bg-indigo-50 p-4 rounded-lg">
                <div className="flex items-center mb-3">
                  <Calculator className="h-5 w-5 text-indigo-600 mr-2" />
                  <div className="font-medium text-indigo-800">Mathematical Formula</div>
                </div>
                <p className="text-gray-600 text-sm">
                  We use a formula based on the square of the sum of square roots of contributions to prioritize projects with broad community support.
                </p>
              </div>
              
              <div className="bg-indigo-50 p-4 rounded-lg">
                <div className="flex items-center mb-3">
                  <Clock className="h-5 w-5 text-indigo-600 mr-2" />
                  <div className="font-medium text-indigo-800">Limited-Time Rounds</div>
                </div>
                <p className="text-gray-600 text-sm">
                  Funding rounds run for a limited time. At the end of each round, the matching pool is distributed to campaigns based on the quadratic formula.
                </p>
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <Link to="/quadratic-funding">
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  Learn more about Quadratic Funding
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Search campaigns..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center">
              <Filter size={18} className="mr-2 text-gray-500" />
              <span className="mr-2 text-sm text-gray-500">Filter:</span>
              <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
                <TabsList className="h-auto overflow-auto">
                  {categories.map(category => (
                    <TabsTrigger 
                      key={category} 
                      value={category}
                      className="text-xs px-3 py-1"
                    >
                      {category}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold mb-6">Available Campaigns</h2>
          
          {filteredCampaigns.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCampaigns.map((campaign) => (
                <CampaignCard key={campaign.id} {...campaign} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <h3 className="text-xl font-medium mb-2">No Campaigns Found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your search or filter criteria</p>
              <Button onClick={() => {setSearchTerm(''); setActiveCategory('All');}}>
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Campaigns;
