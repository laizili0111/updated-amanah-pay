
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, Heart, Share2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export interface NewsItem {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  imageUrl: string;
  author: string;
  likes: number;
  shares: number;
  campaignId?: string;
}

interface NewsFeedProps {
  news: NewsItem[];
}

const NewsFeed: React.FC<NewsFeedProps> = ({ news }) => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="news">News</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-6">
          {news.map((item) => (
            <NewsCard key={item.id} item={item} />
          ))}
        </TabsContent>
        
        <TabsContent value="campaigns" className="space-y-6">
          {news.filter(item => item.campaignId).map((item) => (
            <NewsCard key={item.id} item={item} />
          ))}
        </TabsContent>
        
        <TabsContent value="news" className="space-y-6">
          {news.filter(item => !item.campaignId).map((item) => (
            <NewsCard key={item.id} item={item} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Extract the NewsCard to a separate component for better readability
const NewsCard: React.FC<{ item: NewsItem }> = ({ item }) => {
  const handleNonCampaignClick = () => {
    toast.info("This is a news article without an associated campaign.");
  };

  return (
    <Card key={item.id} className="overflow-hidden">
      <div className="md:flex">
        <div className="md:w-1/3 h-full">
          <img 
            src={item.imageUrl} 
            alt={item.title}
            className="h-48 md:h-full w-full object-cover"
            onError={(e) => {
              // If image fails to load, replace with placeholder
              e.currentTarget.src = 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?q=80&w=800&auto=format&fit=crop';
            }}
          />
        </div>
        <div className="md:w-2/3 flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="bg-islamic-secondary/10 text-islamic-dark">
                {item.category}
              </Badge>
              <div className="flex items-center text-sm text-gray-500">
                <Clock size={14} className="mr-1" />
                {item.date}
              </div>
            </div>
            <CardTitle className="mt-2">{item.title}</CardTitle>
            <CardDescription className="text-sm">{item.author}</CardDescription>
          </CardHeader>
          
          <CardContent className="flex-grow">
            <p className="text-gray-600">{item.description}</p>
          </CardContent>
          
          <CardFooter className="flex justify-between border-t pt-4">
            <div className="flex space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <Heart size={14} className="mr-1" />
                {item.likes}
              </div>
              <div className="flex items-center">
                <Share2 size={14} className="mr-1" />
                {item.shares}
              </div>
            </div>
            
            {item.campaignId ? (
              <Button asChild size="sm" variant="outline">
                <Link to={`/campaigns/${item.campaignId}`}>
                  <ExternalLink size={14} className="mr-1" />
                  View Campaign
                </Link>
              </Button>
            ) : (
              <Button size="sm" variant="outline" onClick={handleNonCampaignClick}>
                <ExternalLink size={14} className="mr-1" />
                View Article
              </Button>
            )}
          </CardFooter>
        </div>
      </div>
    </Card>
  );
};

export default NewsFeed;
