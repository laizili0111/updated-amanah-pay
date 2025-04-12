import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, MessageCircle, ThumbsUp, Clock } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';

interface RatingProps {
  campaignId: string;
}

interface Review {
  id: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  date: string;
  likes: number;
}

// Sample reviews data - would come from an API in a real app
const sampleReviews: Review[] = [
  {
    id: '1',
    userName: 'Ahmed Hassan',
    userAvatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    rating: 5,
    comment: "I visited the site and was impressed by how the renovation is progressing. The community space is much larger now and they've improved accessibility.",
    date: '2025-03-10',
    likes: 12
  },
  {
    id: '2',
    userName: 'Sarah Rahman',
    userAvatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    rating: 4,
    comment: 'The project is well organized and transparent. They provide regular updates and respond quickly to questions.',
    date: '2025-03-05',
    likes: 8
  },
  {
    id: '3',
    userName: 'Mohamed Ali',
    userAvatar: 'https://randomuser.me/api/portraits/men/85.jpg',
    rating: 5,
    comment: 'I attended their open house and saw the impact firsthand. The renovation is making a real difference for our community.',
    date: '2025-02-25',
    likes: 15
  }
];

const CampaignRating: React.FC<RatingProps> = ({ campaignId }) => {
  const [userRating, setUserRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [reviews, setReviews] = useState<Review[]>(sampleReviews);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  
  // Calculate average rating
  const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;
  
  const handleRatingClick = (rating: number) => {
    setUserRating(rating);
  };
  
  const handleSubmitReview = () => {
    if (userRating === 0) {
      toast.error("Please select a rating");
      return;
    }
    
    if (comment.trim() === '') {
      toast.error("Please add a comment");
      return;
    }
    
    // Create a new review
    const newReview: Review = {
      id: `review-${Date.now()}`,
      userName: 'You',
      userAvatar: 'https://randomuser.me/api/portraits/lego/1.jpg',
      rating: userRating,
      comment,
      date: new Date().toISOString().split('T')[0],
      likes: 0
    };
    
    // Add it to the reviews
    setReviews([newReview, ...reviews]);
    
    // Reset form
    setUserRating(0);
    setComment('');
    
    toast.success("Thank you for your feedback!");
  };
  
  const handleLike = (reviewId: string) => {
    setReviews(reviews.map(review => 
      review.id === reviewId 
        ? { ...review, likes: review.likes + 1 } 
        : review
    ));
    toast.success("You liked this review");
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            Community Feedback
            <div className="flex items-center ml-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-5 w-5 ${star <= Math.round(averageRating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                />
              ))}
            </div>
            <span className="ml-2 text-lg">
              {averageRating.toFixed(1)}
            </span>
          </CardTitle>
          <CardDescription>
            Based on {reviews.length} reviews from our community
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <h4 className="font-medium">Leave your review</h4>
            <div className="flex space-x-1 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-6 w-6 cursor-pointer ${
                    star <= (hoveredRating || userRating) 
                      ? "text-yellow-400 fill-yellow-400" 
                      : "text-gray-300"
                  }`}
                  onClick={() => handleRatingClick(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                />
              ))}
            </div>
            <Textarea
              placeholder="Share your experience with this campaign..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[100px]"
            />
            <Button 
              onClick={handleSubmitReview} 
              className="w-full bg-islamic-primary hover:bg-islamic-primary/90"
            >
              Submit Review
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Reviews list */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Recent Reviews</h3>
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between">
                <div className="flex items-center">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage src={review.userAvatar} />
                    <AvatarFallback>{review.userName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-sm">{review.userName}</CardTitle>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-3 w-3 ${
                            star <= review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock size={14} className="mr-1" />
                  {review.date}
                </div>
              </div>
            </CardHeader>
            <CardContent className="py-2">
              <p className="text-sm text-gray-600">{review.comment}</p>
            </CardContent>
            <CardFooter className="pt-1 flex justify-end">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleLike(review.id)}
                className="text-xs flex items-center"
              >
                <ThumbsUp size={14} className="mr-1" />
                Helpful ({review.likes})
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CampaignRating;
