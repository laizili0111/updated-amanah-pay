
import React from 'react';
import { Link } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';
import { Clock, Users, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface CampaignProps {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  goal: number;
  raised: number;
  currency: string;
  daysLeft: number;
  supporters: number;
  category: string;
}

const CampaignCard: React.FC<CampaignProps> = ({
  id,
  title,
  description,
  imageUrl,
  goal,
  raised,
  currency = 'MYR', // Always default to MYR
  daysLeft,
  supporters,
  category
}) => {
  const progress = (raised / goal) * 100;
  
  return (
    <div className="islamic-card group">
      <div className="relative overflow-hidden">
        <img 
          src={imageUrl} 
          alt={title} 
          className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-3 right-3 bg-islamic-secondary text-islamic-dark font-medium py-1 px-3 text-xs rounded-full">
          {category}
        </div>
      </div>
      
      <div className="p-5">
        <h3 className="text-lg font-semibold text-islamic-dark truncate">
          <Link to={`/campaigns/${id}`} className="hover:text-islamic-primary">
            {title}
          </Link>
        </h3>
        
        <p className="text-gray-600 mt-2 text-sm line-clamp-2">{description}</p>
        
        <div className="mt-4 mb-2">
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium text-islamic-dark">Raised: <span className="text-islamic-primary">MYR {raised.toLocaleString()}</span></span>
            <span className="text-gray-500">Goal: MYR {goal.toLocaleString()}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        
        <div className="flex justify-between mt-4 pt-4 border-t text-sm text-gray-500">
          <div className="flex items-center">
            <Clock size={14} className="mr-1" />
            <span>{daysLeft} days left</span>
          </div>
          <div className="flex items-center">
            <Users size={14} className="mr-1" />
            <span>{supporters} supporters</span>
          </div>
        </div>
        
        <div className="mt-4 flex space-x-2">
          <Button asChild className="w-full bg-islamic-primary hover:bg-islamic-primary/90">
            <Link to={`/campaigns/${id}`}>Donate Now</Link>
          </Button>
          <Button variant="outline" size="icon" className="rounded-full">
            <Heart size={16} className="text-islamic-primary" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CampaignCard;
