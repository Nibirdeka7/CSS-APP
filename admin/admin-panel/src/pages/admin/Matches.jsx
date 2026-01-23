import React, { useState } from 'react';
import MatchList from '../../components/admin/matches/MatchList';
import MatchCreateModal from '../../components/admin/matches/MatchCreateModal';
import MatchScoreModal from '../../components/admin/matches/MatchScoreModal';
import MatchEndModal from '../../components/admin/matches/MatchEndModal';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { 
  Search, 
  Filter, 
  Plus, 
  Trophy, 
  Clock, 
  CheckCircle,
  PlayCircle,
  BarChart3
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';

const Matches = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);

  // Mock data
  const matches = [
    {
      id: 1,
      event: 'Summer Cup 2024',
      teamA: { id: 1, name: 'Dragon Warriors', logo: '🐉' },
      teamB: { id: 2, name: 'Phoenix Rising', logo: '🔥' },
      scheduledTime: '2024-01-20 14:00',
      status: 'scheduled',
      scoreA: 0,
      scoreB: 0,
      round: 'Quarter Finals',
      venue: 'Main Arena'
    },
    {
      id: 2,
      event: 'Summer Cup 2024',
      teamA: { id: 3, name: 'Titan Strikers', logo: '⚡' },
      teamB: { id: 4, name: 'Storm Breakers', logo: '🌀' },
      scheduledTime: '2024-01-20 16:00',
      status: 'live',
      scoreA: 2,
      scoreB: 1,
      round: 'Semi Finals',
      venue: 'Court 2',
      duration: '45:00'
    },
    // Add more matches...
  ];

  const handleStartMatch = (match) => {
    console.log('Start match:', match.id);
    // API call to start match
  };

  const handleUpdateScore = (match) => {
    setSelectedMatch(match);
    setShowScoreModal(true);
  };

  const handleEndMatch = (match) => {
    setSelectedMatch(match);
    setShowEndModal(true);
  };

  const stats = {
    total: 24,
    live: 3,
    scheduled: 8,
    completed: 13,
    inProgress: 5
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Match Management</h1>
          <p className="text-gray-600">Schedule, monitor, and manage tournament matches</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="mr-2" size={20} />
          Schedule Match
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <p className="text-sm text-gray-500">Total Matches</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <div className="text-2xl font-bold text-gray-900">{stats.live}</div>
              </div>
              <p className="text-sm text-gray-500">Live Now</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.scheduled}</div>
              <p className="text-sm text-gray-500">Scheduled</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.completed}</div>
              <p className="text-sm text-gray-500">Completed</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.inProgress}</div>
              <p className="text-sm text-gray-500">In Progress</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Matches Banner */}
      {stats.live > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                <div>
                  <h4 className="font-bold text-red-900">{stats.live} Matches Live</h4>
                  <p className="text-sm text-red-700">Action happening right now!</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="border-red-300 text-red-700">
                <PlayCircle className="mr-2" size={16} />
                Watch Live
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle>Matches Schedule</CardTitle>
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  placeholder="Search matches..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>

              {/* Filters */}
              <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <Filter className="mr-2" size={16} />
                      Filter
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>All Matches</DropdownMenuItem>
                    <DropdownMenuItem>Live</DropdownMenuItem>
                    <DropdownMenuItem>Scheduled</DropdownMenuItem>
                    <DropdownMenuItem>Completed</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Filter by Event</DropdownMenuLabel>
                    <DropdownMenuItem>All Events</DropdownMenuItem>
                    <DropdownMenuItem>Summer Cup 2024</DropdownMenuItem>
                    <DropdownMenuItem>Winter Championship</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      Sort By
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>Date & Time</DropdownMenuItem>
                    <DropdownMenuItem>Round</DropdownMenuItem>
                    <DropdownMenuItem>Event</DropdownMenuItem>
                    <DropdownMenuItem>Status</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="all">
                All Matches
                <Badge variant="secondary" className="ml-2">{stats.total}</Badge>
              </TabsTrigger>
              <TabsTrigger value="live">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  Live
                </div>
                <Badge variant="secondary" className="ml-2">{stats.live}</Badge>
              </TabsTrigger>
              <TabsTrigger value="scheduled">
                Scheduled
                <Badge variant="secondary" className="ml-2">{stats.scheduled}</Badge>
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed
                <Badge variant="secondary" className="ml-2">{stats.completed}</Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <MatchList 
                matches={matches}
                onStartMatch={handleStartMatch}
                onUpdateScore={handleUpdateScore}
                onEndMatch={handleEndMatch}
              />
            </TabsContent>

            <TabsContent value="live">
              <MatchList 
                matches={matches.filter(m => m.status === 'live')}
                onUpdateScore={handleUpdateScore}
                onEndMatch={handleEndMatch}
              />
            </TabsContent>

            <TabsContent value="scheduled">
              <MatchList 
                matches={matches.filter(m => m.status === 'scheduled')}
                onStartMatch={handleStartMatch}
              />
            </TabsContent>

            <TabsContent value="completed">
              <MatchList 
                matches={matches.filter(m => m.status === 'completed')}
                readonly={true}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Modals */}
      <MatchCreateModal open={showCreateModal} onOpenChange={setShowCreateModal} />
      <MatchScoreModal 
        open={showScoreModal} 
        onOpenChange={setShowScoreModal} 
        match={selectedMatch}
      />
      <MatchEndModal 
        open={showEndModal} 
        onOpenChange={setShowEndModal} 
        match={selectedMatch}
      />
    </div>
  );
};

export default Matches;