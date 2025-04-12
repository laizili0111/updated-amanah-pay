import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Plus, RefreshCw, BarChart } from 'lucide-react';
import { getRounds, addToMatchingPool, Round } from '@/lib/api/rounds';
import { cn } from '@/lib/utils';

interface RoundManagerProps {
  onRoundCreated?: () => void;
}

const RoundManager: React.FC<RoundManagerProps> = ({ onRoundCreated }) => {
  const [rounds, setRounds] = useState<Round[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingRound, setCreatingRound] = useState(false);
  
  // New round form state
  const [roundName, setRoundName] = useState('');
  const [roundDescription, setRoundDescription] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(
    new Date(new Date().setDate(new Date().getDate() + 14))
  );
  const [matchingPool, setMatchingPool] = useState('');
  
  // Add to matching pool state
  const [selectedRoundId, setSelectedRoundId] = useState<number | null>(null);
  const [additionalFunds, setAdditionalFunds] = useState('');

  // Load rounds data
  useEffect(() => {
    fetchRounds();
  }, []);

  const fetchRounds = async () => {
    try {
      setLoading(true);
      const fetchedRounds = await getRounds();
      setRounds(fetchedRounds);
      
      // Set selected round to the active one by default
      const activeRound = fetchedRounds.find(r => 
        new Date(r.startTime) <= new Date() && new Date(r.endTime) >= new Date()
      );
      if (activeRound) {
        setSelectedRoundId(activeRound.id);
      } else if (fetchedRounds.length > 0) {
        setSelectedRoundId(fetchedRounds[0].id);
      }
    } catch (error) {
      console.error('Error fetching rounds:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRound = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !matchingPool || !roundName) return;
    
    try {
      setCreatingRound(true);
      
      // Mock API call - In a real implementation you would call the API to create a round
      // const response = await createRound({
      //   name: roundName,
      //   description: roundDescription,
      //   startTime: startDate.toISOString(),
      //   endTime: endDate.toISOString(),
      //   matchingPool
      // });
      
      // Simulate successful response
      setTimeout(() => {
        // Reset form
        setRoundName('');
        setRoundDescription('');
        setStartDate(new Date());
        setEndDate(new Date(new Date().setDate(new Date().getDate() + 14)));
        setMatchingPool('');
        setCreatingRound(false);
        
        // Refresh rounds
        fetchRounds();
        
        // Notify parent
        if (onRoundCreated) onRoundCreated();
      }, 1000);
      
    } catch (error) {
      console.error('Error creating round:', error);
      setCreatingRound(false);
    }
  };

  const handleAddToMatchingPool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoundId || !additionalFunds) return;
    
    try {
      await addToMatchingPool(additionalFunds);
      
      // Reset form and refresh data
      setAdditionalFunds('');
      fetchRounds();
    } catch (error) {
      console.error('Error adding to matching pool:', error);
    }
  };

  const getRoundStatus = (round: Round) => {
    const now = new Date();
    const start = new Date(round.startTime);
    const end = new Date(round.endTime);
    
    if (now < start) return 'upcoming';
    if (now > end) return 'completed';
    return 'active';
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="manage">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manage">Manage Rounds</TabsTrigger>
          <TabsTrigger value="create">Create New Round</TabsTrigger>
        </TabsList>
        
        <TabsContent value="manage" className="space-y-6 pt-4">
          <div className="grid gap-4">
            {loading ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-center items-center h-20">
                    <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ) : rounds.length > 0 ? (
              rounds.map((round) => {
                const status = getRoundStatus(round);
                return (
                  <Card key={round.id}>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle>Round #{round.id}</CardTitle>
                        <Badge
                          variant={
                            status === 'active' ? 'default' :
                            status === 'upcoming' ? 'outline' : 'secondary'
                          }
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </Badge>
                      </div>
                      <CardDescription>
                        {new Date(round.startTime).toLocaleDateString()} - {new Date(round.endTime).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium mb-1">Matching Pool</h4>
                          <p>MYR {Number(round.matchingPool).toLocaleString()}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium mb-1">Donations</h4>
                          <p>MYR {Number(round.totalDonations).toLocaleString()}</p>
                        </div>
                      </div>
                      
                      {status === 'active' && (
                        <div className="mt-4">
                          <Label htmlFor={`add-funds-${round.id}`}>Add to Matching Pool</Label>
                          <div className="flex mt-1 space-x-2">
                            <Input
                              id={`add-funds-${round.id}`}
                              type="number"
                              placeholder="Amount (MYR)"
                              value={selectedRoundId === round.id ? additionalFunds : ''}
                              onChange={(e) => {
                                setSelectedRoundId(round.id);
                                setAdditionalFunds(e.target.value);
                              }}
                            />
                            <Button
                              onClick={handleAddToMatchingPool}
                              disabled={!additionalFunds || selectedRoundId !== round.id}
                            >
                              Add
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline">View Details</Button>
                      {status === 'completed' && !round.isDistributed && (
                        <Button variant="default">
                          <BarChart className="h-4 w-4 mr-2" />
                          Distribute Matching
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                );
              })
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center justify-center p-6 space-y-4">
                    <Plus className="h-12 w-12 text-muted-foreground" />
                    <div className="text-center">
                      <p className="text-muted-foreground">No funding rounds yet</p>
                      <p className="text-sm text-muted-foreground">Create your first quadratic funding round to get started.</p>
                    </div>
                    <Button onClick={() => document.querySelector('[value="create"]')?.dispatchEvent(new Event('click'))}>
                      Create New Round
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="create" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Create a New Funding Round</CardTitle>
              <CardDescription>
                Set up a new quadratic funding round with matching pool
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleCreateRound}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="round-name">Round Name</Label>
                  <Input
                    id="round-name"
                    placeholder="e.g., Q3 2023 Funding Round"
                    value={roundName}
                    onChange={(e) => setRoundName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="A brief description of this funding round"
                    value={roundDescription}
                    onChange={(e) => setRoundDescription(e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !startDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !endDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate ? format(endDate, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          disabled={(date) => 
                            startDate ? date < startDate : false
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="matching-pool">Initial Matching Pool (MYR)</Label>
                  <Input
                    id="matching-pool"
                    type="number"
                    placeholder="e.g., 100000"
                    value={matchingPool}
                    onChange={(e) => setMatchingPool(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={creatingRound}>
                  {creatingRound ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Funding Round"
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RoundManager; 