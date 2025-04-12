import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, Award, Receipt, TrendingUp } from 'lucide-react';

interface DashboardProps {
  totalDonations: number;
  campaignsContributed: number;
  totalTransactions: number;
  monthlySummary: Array<{ name: string; amount: number }>;
  categoryDistribution: Array<{ name: string; value: number; color: string }>;
}

const ContributionDashboard: React.FC<DashboardProps> = ({ 
  totalDonations, 
  campaignsContributed, 
  totalTransactions, 
  monthlySummary, 
  categoryDistribution 
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              MYR {totalDonations.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Your lifetime contribution
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Campaigns Contributed</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaignsContributed}</div>
            <p className="text-xs text-muted-foreground">
              Total campaigns you've supported
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTransactions}</div>
            <p className="text-xs text-muted-foreground">
              All your contributions
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Monthly Overview</TabsTrigger>
          <TabsTrigger value="categories">Category Distribution</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Monthly Donations</CardTitle>
              <CardDescription>
                Your contribution trends over the past months
              </CardDescription>
            </CardHeader>
            <CardContent className="px-2">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlySummary}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false}
                      tickMargin={8}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false}
                      tickMargin={8}
                      tickFormatter={(value) => `MYR ${value}`}
                    />
                    <Tooltip 
                      formatter={(value) => [`MYR ${value}`, 'Amount']}
                      contentStyle={{ borderRadius: '8px' }}
                    />
                    <Bar 
                      dataKey="amount" 
                      fill="rgba(155, 135, 245, 0.8)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="categories" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Donations by Category</CardTitle>
              <CardDescription>
                How you've distributed your contributions across campaign types
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex justify-center items-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={110}
                      paddingAngle={2}
                      dataKey="value"
                      label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`MYR ${value}`, 'Amount']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContributionDashboard;
