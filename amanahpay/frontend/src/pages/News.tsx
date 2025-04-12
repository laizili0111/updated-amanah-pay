
import React from 'react';
import Layout from '@/components/layout/Layout';
import NewsFeed from '@/components/news/NewsFeed';

// Sample data - would typically come from API
const sampleNews = [
  {
    id: '1',
    title: 'Masjid Renovation Project Reaches 50% Funding Goal',
    description: 'The community project to renovate the local masjid has reached a significant milestone thanks to generous donors through our blockchain platform.',
    category: 'Campaign Update',
    date: '2025-03-15',
    imageUrl: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?q=80&w=800&auto=format&fit=crop',
    author: 'AmanahPay Team',
    likes: 37,
    shares: 12,
    campaignId: '1'
  },
  {
    id: '2',
    title: 'New Islamic Finance Guide Released',
    description: 'Our team has published a comprehensive guide to Islamic finance principles and how blockchain technology is making Shariah-compliant donations more transparent.',
    category: 'Educational',
    date: '2025-03-10',
    imageUrl: 'https://images.unsplash.com/photo-1554774853-719586608dd6?q=80&w=800&auto=format&fit=crop',
    author: 'Ibrahim Hassan',
    likes: 24,
    shares: 8
  },
  {
    id: '3',
    title: 'Emergency Aid Delivered to Flood Victims',
    description: 'Thanks to the rapid response of our donors, emergency aid packages have been distributed to families affected by recent flooding.',
    category: 'Impact Report',
    date: '2025-03-05',
    imageUrl: 'https://images.unsplash.com/photo-1469290664615-bbe2afe34fb3?q=80&w=800&auto=format&fit=crop',
    author: 'Relief Team',
    likes: 42,
    shares: 18,
    campaignId: '4'
  },
  {
    id: '4',
    title: 'Milestone: 1000 Donors on AmanahPay Platform',
    description: 'Our platform has reached 1000 registered donors, marking a significant growth in the community of supporters for Islamic causes.',
    category: 'Announcement',
    date: '2025-02-20',
    imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=800&auto=format&fit=crop',
    author: 'AmanahPay Team',
    likes: 56,
    shares: 23
  }
];

const News = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">News & Updates</h1>
          <p className="text-gray-600">
            Stay informed about campaign progress, impact stories, and platform updates.
          </p>
        </div>
        
        <NewsFeed news={sampleNews} />
      </div>
    </Layout>
  );
};

export default News;
