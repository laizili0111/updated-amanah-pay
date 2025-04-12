import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { useState } from 'react';
import { Calculator, Heart, Lightbulb, Users } from 'lucide-react';

const QuadraticExplainer: React.FC = () => {
  const [donorCount, setDonorCount] = useState(25);
  const [donationAmount, setDonationAmount] = useState(100);
  
  // Calculate standard matching (1:1)
  const standardMatching = donorCount * donationAmount;
  
  // Calculate quadratic matching (based on square root of sum of square roots of donations)
  const quadraticMatching = Math.round(Math.pow(donorCount * Math.sqrt(donationAmount), 2));
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Understanding Quadratic Funding</CardTitle>
          <CardDescription>
            Learn how our matching system amplifies the power of community support
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="what">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="what">What Is It?</TabsTrigger>
              <TabsTrigger value="why">Why It Matters</TabsTrigger>
              <TabsTrigger value="simulate">See It In Action</TabsTrigger>
            </TabsList>
            
            <TabsContent value="what" className="space-y-4 pt-4">
              <div className="flex items-start space-x-4">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Calculator className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">The Mathematics of Community</h3>
                  <p className="text-muted-foreground">
                    Quadratic funding is a democratic method for allocating matching funds that prioritizes projects with broad community support over those with a few large donors.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">People-Powered Allocation</h3>
                  <p className="text-muted-foreground">
                    The funding each project receives is proportional to the square of the sum of the square roots of contributions. This means many small donations can outweigh a few large ones.
                  </p>
                </div>
              </div>
              
              <div className="border rounded-lg p-4 bg-muted/30 mt-4">
                <p className="text-sm font-medium mb-2">For example:</p>
                <p className="text-sm">
                  • 100 people donating $1 each (total $100) receive <span className="font-semibold">$10,000</span> in matching
                </p>
                <p className="text-sm">
                  • 1 person donating $100 (total $100) receives <span className="font-semibold">$100</span> in matching
                </p>
                <p className="text-sm mt-2">
                  The difference is striking, even though the total donation amount is identical!
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="why" className="space-y-4 pt-4">
              <div className="flex items-start space-x-4">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Strengthening Community Voices</h3>
                  <p className="text-muted-foreground">
                    Quadratic funding empowers smaller donors by making their collective voice more impactful, promoting a more democratic funding environment.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Lightbulb className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Promoting Diverse Projects</h3>
                  <p className="text-muted-foreground">
                    This system helps support a diverse range of charitable initiatives that might otherwise struggle to attract large individual donors but have strong grassroots support.
                  </p>
                </div>
              </div>
              
              <div className="border rounded-lg p-4 bg-muted/30 mt-4">
                <p className="text-sm">
                  Quadratic funding aligns perfectly with Islamic principles of community support and fairness. It ensures that funds are distributed in a way that reflects communal priorities and needs, rather than being influenced solely by wealth.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="simulate" className="pt-4 space-y-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium">Number of Donors</label>
                    <span className="text-sm text-muted-foreground">{donorCount} donors</span>
                  </div>
                  <Slider
                    value={[donorCount]}
                    min={1}
                    max={100}
                    step={1}
                    onValueChange={(value) => setDonorCount(value[0])}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium">Amount per Donor (MYR)</label>
                    <span className="text-sm text-muted-foreground">MYR {donationAmount}</span>
                  </div>
                  <Slider
                    value={[donationAmount]}
                    min={10}
                    max={1000}
                    step={10}
                    onValueChange={(value) => setDonationAmount(value[0])}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium">Standard 1:1 Matching</h4>
                      <span className="text-xs bg-muted px-2 py-1 rounded-full">Traditional</span>
                    </div>
                    <p className="text-2xl font-bold">MYR {standardMatching.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Total donations: MYR {(donorCount * donationAmount).toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Matching ratio: 1:1
                    </p>
                  </div>
                  
                  <div className="border rounded-lg p-4 bg-primary/5">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium">Quadratic Matching</h4>
                      <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">AmanahPay</span>
                    </div>
                    <p className="text-2xl font-bold">MYR {quadraticMatching.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Total donations: MYR {(donorCount * donationAmount).toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Matching ratio: {(quadraticMatching / (donorCount * donationAmount)).toFixed(2)}:1
                    </p>
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground mt-2 space-y-1">
                  <p>Formula used: Matching = (Number of Donors × √Individual Donation)²</p>
                  <p>The larger the community of supporters, the greater the matching amount!</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuadraticExplainer; 