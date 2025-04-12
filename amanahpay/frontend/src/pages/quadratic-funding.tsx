import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import QuadraticFundingDashboard from '@/components/dashboard/QuadraticFundingDashboard';
import QuadraticExplainer from '@/components/quadratic/QuadraticExplainer';
import RoundManager from '@/components/admin/RoundManager';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const QuadraticFundingPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  return (
    <div className="container py-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Quadratic Funding</h1>
      
      <Alert className="mb-6">
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>Community-Powered Funding</AlertTitle>
        <AlertDescription>
          Our quadratic funding system amplifies the impact of small donations by matching them according to the number of donors rather than the amount.
          This ensures that projects with broad community support receive proportionally more funding.
        </AlertDescription>
      </Alert>
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-3 lg:w-fit">
          <TabsTrigger value="dashboard">Active Rounds</TabsTrigger>
          <TabsTrigger value="how-it-works">How It Works</TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="admin">Round Management</TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="dashboard" className="pt-2">
          <QuadraticFundingDashboard isAdmin={isAdmin} />
        </TabsContent>
        
        <TabsContent value="how-it-works" className="pt-2">
          <QuadraticExplainer />
        </TabsContent>
        
        {isAdmin && (
          <TabsContent value="admin" className="pt-2">
            <RoundManager onRoundCreated={() => setActiveTab('dashboard')} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default QuadraticFundingPage; 