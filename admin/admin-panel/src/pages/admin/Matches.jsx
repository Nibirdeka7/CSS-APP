// import React, { useState, useEffect } from 'react';
// import { useAdminStore } from '../../stores/adminStore';
// import MatchList from '../../components/admin/matches/MatchList';
// import MatchCreateModal from '../../components/admin/matches/MatchCreateModal';
// import MatchScoreModal from '../../components/admin/matches/MatchScoreModal';
// import MatchEndModal from '../../components/admin/matches/MatchEndModal';
// import { Button } from '../../components/ui/button';
// import { Input } from '../../components/ui/input';
// import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
// import { 
//   Search, 
//   Filter, 
//   Plus, 
//   Trophy, 
//   Clock, 
//   CheckCircle,
//   PlayCircle,
//   BarChart3,
//   Loader2,
//   RefreshCw,
//   Calendar
// } from 'lucide-react';
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from '../../components/ui/dropdown-menu';
// import { Badge } from '../../components/ui/badge';
// import { toast } from 'sonner';

// const Matches = () => {
//   const { 
//     events, 
//     matches, 
//     liveMatches, 
//     fetchEvents, 
//     fetchMatchesByEvent,
//     getMatchesByEvent,
//     isLoading 
//   } = useAdminStore();
  
//   const [activeTab, setActiveTab] = useState('all');
//   const [searchQuery, setSearchQuery] = useState('');
//   const [selectedEvent, setSelectedEvent] = useState('all');
//   const [statusFilter, setStatusFilter] = useState('all');
//   const [showCreateModal, setShowCreateModal] = useState(false);
//   const [selectedMatch, setSelectedMatch] = useState(null);
//   const [showScoreModal, setShowScoreModal] = useState(false);
//   const [showEndModal, setShowEndModal] = useState(false);
//   const [eventMatches, setEventMatches] = useState({});

//   // Fetch events on component mount
//   useEffect(() => {
//     fetchEvents();
//   }, [fetchEvents]);

//   // Fetch matches when event changes
//   useEffect(() => {
//     const loadMatches = async () => {
//       if (selectedEvent && selectedEvent !== 'all') {
//         try {
//           const matches = await fetchMatchesByEvent(selectedEvent);
//           setEventMatches(prev => ({
//             ...prev,
//             [selectedEvent]: matches
//           }));
//         } catch (error) {
//           console.error('Failed to load matches:', error);
//         }
//       } else if (selectedEvent === 'all') {
//         // Load matches for all events
//         const allMatches = [];
//         for (const event of events) {
//           try {
//             const matches = await fetchMatchesByEvent(event._id);
//             allMatches.push(...matches);
//             setEventMatches(prev => ({
//               ...prev,
//               [event._id]: matches
//             }));
//           } catch (error) {
//             console.error(`Failed to load matches for event ${event._id}:`, error);
//           }
//         }
//       }
//     };

//     loadMatches();
//   }, [selectedEvent, events, fetchMatchesByEvent]);

//   const handleRefresh = () => {
//     if (selectedEvent && selectedEvent !== 'all') {
//       fetchMatchesByEvent(selectedEvent);
//     }
//     toast.success('Matches refreshed');
//   };

//   const handleStartMatch = async (match) => {
//     try {
//       await useAdminStore.getState().startMatch(match._id);
//       toast.success('Match started successfully!');
//       // Refresh matches for the event
//       if (selectedEvent && selectedEvent !== 'all') {
//         fetchMatchesByEvent(selectedEvent);
//       }
//     } catch (error) {
//       toast.error('Failed to start match');
//     }
//   };

//   const handleUpdateScore = (match) => {
//     setSelectedMatch(match);
//     setShowScoreModal(true);
//   };

//   const handleEndMatch = (match) => {
//     setSelectedMatch(match);
//     setShowEndModal(true);
//   };

//   // Get matches based on selected event
//   const getMatches = () => {
//     if (selectedEvent === 'all') {
//       // Combine all matches from all events
//       return Object.values(eventMatches).flat();
//     }
//     return eventMatches[selectedEvent] || [];
//   };


//   const allMatches = getMatches();
  

//   // Filter matches based on search and status
//   const filteredMatches = (Array.isArray(allMatches) ? allMatches : []).filter((match) => {
//   const matchesStatus = 
//     statusFilter === 'all' ||
//     (statusFilter === 'upcoming' && match.status === 'UPCOMING') ||
//     (statusFilter === 'live' && match.status === 'LIVE') ||
//     (statusFilter === 'completed' && match.status === 'COMPLETED');

//   const matchesSearch = 
//     searchQuery === '' ||
//     match.teamA?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//     match.teamB?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//     match.event?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//     match.round?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//     match.venue?.toLowerCase().includes(searchQuery.toLowerCase());

//   return matchesStatus && matchesSearch;
// });

//   // Calculate stats
//   const stats = {
//     total: filteredMatches.length,
//     live: filteredMatches.filter(m => m.status === 'LIVE').length,
//     upcoming: filteredMatches.filter(m => m.status === 'UPCOMING').length,
//     completed: filteredMatches.filter(m => m.status === 'COMPLETED').length,
//   };

//   const eventOptions = [
//     { id: 'all', name: 'All Events' },
//     ...events.map(event => ({
//       id: event._id,
//       name: event.name,
//       sport: event.sport,
//     }))
//   ];

//   const getSelectedEventName = () => {
//     if (selectedEvent === 'all') return 'All Events';
//     const event = events.find(e => e._id === selectedEvent);
//     return event ? event.name : 'Select Event';
//   };

//   const getStatusFilterName = () => {
//     switch(statusFilter) {
//       case 'all': return 'All Status';
//       case 'upcoming': return 'Upcoming';
//       case 'live': return 'Live';
//       case 'completed': return 'Completed';
//       default: return 'All Status';
//     }
//   };

//   if (isLoading && events.length === 0) {
//     return (
//       <div className="flex items-center justify-center h-96">
//         <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {/* Page Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900">Match Management</h1>
//           <p className="text-gray-600">Schedule, monitor, and manage tournament matches</p>
//         </div>
//         <div className="flex gap-2">
//           <Button 
//             variant="outline" 
//             onClick={handleRefresh}
//             disabled={isLoading}
//           >
//             <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
//             Refresh
//           </Button>
//           <Button 
//             onClick={() => setShowCreateModal(true)} 
//             disabled={isLoading || events.length === 0}
//           >
//             <Plus className="mr-2" size={20} />
//             Schedule Match
//           </Button>
//         </div>
//       </div>

//       {/* Event Selection & Filters */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Match Filters</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="flex flex-col md:flex-row gap-4">
//             {/* Event Selection */}
//             <div className="flex-1">
//               <DropdownMenu>
//                 <DropdownMenuTrigger asChild>
//                   <Button variant="outline" className="w-full justify-start">
//                     <Calendar className="mr-2 h-4 w-4" />
//                     {getSelectedEventName()}
//                   </Button>
//                 </DropdownMenuTrigger>
//                 <DropdownMenuContent className="w-64 max-h-64 overflow-y-auto">
//                   <DropdownMenuLabel>Events ({events.length})</DropdownMenuLabel>
//                   <DropdownMenuSeparator />
//                   <DropdownMenuItem onClick={() => setSelectedEvent('all')}>
//                     <div className="flex items-center gap-2">
//                       <div className="w-2 h-2 rounded-full bg-blue-500" />
//                       <span>All Events</span>
//                     </div>
//                   </DropdownMenuItem>
//                   {events.map((event) => (
//                     <DropdownMenuItem 
//                       key={event._id} 
//                       onClick={() => setSelectedEvent(event._id)}
//                     >
//                       <div className="flex flex-col">
//                         <span className="font-medium">{event.name}</span>
//                         <span className="text-xs text-gray-500">
//                           {event.sport} • {event.category}
//                         </span>
//                       </div>
//                     </DropdownMenuItem>
//                   ))}
//                 </DropdownMenuContent>
//               </DropdownMenu>
//             </div>

//             {/* Status Filter */}
//             <div>
//               <DropdownMenu>
//                 <DropdownMenuTrigger asChild>
//                   <Button variant="outline" className="w-full justify-start">
//                     <Filter className="mr-2 h-4 w-4" />
//                     {getStatusFilterName()}
//                   </Button>
//                 </DropdownMenuTrigger>
//                 <DropdownMenuContent>
//                   <DropdownMenuLabel>Match Status</DropdownMenuLabel>
//                   <DropdownMenuSeparator />
//                   <DropdownMenuItem onClick={() => setStatusFilter('all')}>
//                     All Matches
//                   </DropdownMenuItem>
//                   <DropdownMenuItem onClick={() => setStatusFilter('upcoming')}>
//                     Upcoming
//                   </DropdownMenuItem>
//                   <DropdownMenuItem onClick={() => setStatusFilter('live')}>
//                     Live
//                   </DropdownMenuItem>
//                   <DropdownMenuItem onClick={() => setStatusFilter('completed')}>
//                     Completed
//                   </DropdownMenuItem>
//                 </DropdownMenuContent>
//               </DropdownMenu>
//             </div>

//             {/* Search */}
//             <div className="relative">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
//               <Input
//                 placeholder="Search matches..."
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 className="pl-10 w-full"
//                 disabled={isLoading}
//               />
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Stats Overview */}
//       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//         <Card>
//           <CardContent className="pt-6">
//             <div className="text-center">
//               <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
//               <p className="text-sm text-gray-500">Total Matches</p>
//             </div>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardContent className="pt-6">
//             <div className="text-center">
//               <div className="flex items-center justify-center gap-2">
//                 <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
//                 <div className="text-2xl font-bold text-gray-900">{stats.live}</div>
//               </div>
//               <p className="text-sm text-gray-500">Live Now</p>
//             </div>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardContent className="pt-6">
//             <div className="text-center">
//               <div className="text-2xl font-bold text-gray-900">{stats.upcoming}</div>
//               <p className="text-sm text-gray-500">Upcoming</p>
//             </div>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardContent className="pt-6">
//             <div className="text-center">
//               <div className="text-2xl font-bold text-gray-900">{stats.completed}</div>
//               <p className="text-sm text-gray-500">Completed</p>
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Live Matches Banner */}
//       {stats.live > 0 && (
//         <Card className="border-red-200 bg-red-50">
//           <CardContent className="p-4">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-3">
//                 <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
//                 <div>
//                   <h4 className="font-bold text-red-900">{stats.live} Matches Live</h4>
//                   <p className="text-sm text-red-700">Action happening right now!</p>
//                 </div>
//               </div>
//               <Button variant="outline" size="sm" className="border-red-300 text-red-700">
//                 <PlayCircle className="mr-2" size={16} />
//                 Watch Live Dashboard
//               </Button>
//             </div>
//           </CardContent>
//         </Card>
//       )}

//       {/* Main Content */}
//       <Card>
//         <CardHeader>
//           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//             <CardTitle>
//               Matches for {getSelectedEventName()}
//               <span className="text-sm font-normal text-gray-500 ml-2">
//                 ({filteredMatches.length} matches)
//               </span>
//             </CardTitle>
//           </div>
//         </CardHeader>
//         <CardContent>
//           <Tabs value={activeTab} onValueChange={setActiveTab}>
//             <TabsList className="grid grid-cols-4 mb-6">
//               <TabsTrigger value="all">
//                 All Matches
//                 <Badge variant="secondary" className="ml-2">{stats.total}</Badge>
//               </TabsTrigger>
//               <TabsTrigger value="live">
//                 <div className="flex items-center gap-2">
//                   <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
//                   Live
//                 </div>
//                 <Badge variant="secondary" className="ml-2">{stats.live}</Badge>
//               </TabsTrigger>
//               <TabsTrigger value="upcoming">
//                 Upcoming
//                 <Badge variant="secondary" className="ml-2">{stats.upcoming}</Badge>
//               </TabsTrigger>
//               <TabsTrigger value="completed">
//                 Completed
//                 <Badge variant="secondary" className="ml-2">{stats.completed}</Badge>
//               </TabsTrigger>
//             </TabsList>

//             <TabsContent value="all" className="space-y-4">
//               {isLoading ? (
//                 <div className="flex items-center justify-center h-64">
//                   <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
//                 </div>
//               ) : filteredMatches.length === 0 ? (
//                 <Card>
//                   <CardContent className="p-8 text-center">
//                     <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//                     <h3 className="text-lg font-medium text-gray-900">No Matches Found</h3>
//                     <p className="text-gray-500 mt-2">
//                       {searchQuery || selectedEvent !== 'all' || statusFilter !== 'all'
//                         ? 'Try adjusting your search or filters'
//                         : 'Schedule your first match to get started'}
//                     </p>
//                     <Button 
//                       onClick={() => setShowCreateModal(true)} 
//                       className="mt-4"
//                       disabled={events.length === 0}
//                     >
//                       <Plus className="mr-2" size={20} />
//                       Schedule First Match
//                     </Button>
//                   </CardContent>
//                 </Card>
//               ) : (
//                 <MatchList 
//                   matches={filteredMatches}
//                   onStartMatch={handleStartMatch}
//                   onUpdateScore={handleUpdateScore}
//                   onEndMatch={handleEndMatch}
//                 />
//               )}
//             </TabsContent>

//             <TabsContent value="live">
//               {isLoading ? (
//                 <div className="flex items-center justify-center h-64">
//                   <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
//                 </div>
//               ) : filteredMatches.filter(m => m.status === 'LIVE').length === 0 ? (
//                 <Card>
//                   <CardContent className="p-8 text-center">
//                     <PlayCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
//                     <h3 className="text-lg font-medium text-gray-900">No Live Matches</h3>
//                     <p className="text-gray-500 mt-2">
//                       There are no matches currently live.
//                       Start an upcoming match to see it here.
//                     </p>
//                   </CardContent>
//                 </Card>
//               ) : (
//                 <MatchList 
//                   matches={filteredMatches.filter(m => m.status === 'LIVE')}
//                   onUpdateScore={handleUpdateScore}
//                   onEndMatch={handleEndMatch}
//                 />
//               )}
//             </TabsContent>

//             <TabsContent value="upcoming">
//               {isLoading ? (
//                 <div className="flex items-center justify-center h-64">
//                   <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
//                 </div>
//               ) : filteredMatches.filter(m => m.status === 'UPCOMING').length === 0 ? (
//                 <Card>
//                   <CardContent className="p-8 text-center">
//                     <Calendar className="h-12 w-12 text-blue-400 mx-auto mb-4" />
//                     <h3 className="text-lg font-medium text-gray-900">No Upcoming Matches</h3>
//                     <p className="text-gray-500 mt-2">
//                       There are no matches scheduled.
//                       Schedule a match to see it here.
//                     </p>
//                     <Button 
//                       onClick={() => setShowCreateModal(true)} 
//                       className="mt-4"
//                       disabled={events.length === 0}
//                     >
//                       <Plus className="mr-2" size={20} />
//                       Schedule a Match
//                     </Button>
//                   </CardContent>
//                 </Card>
//               ) : (
//                 <MatchList 
//                   matches={filteredMatches.filter(m => m.status === 'UPCOMING')}
//                   onStartMatch={handleStartMatch}
//                 />
//               )}
//             </TabsContent>

//             <TabsContent value="completed">
//               {isLoading ? (
//                 <div className="flex items-center justify-center h-64">
//                   <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
//                 </div>
//               ) : filteredMatches.filter(m => m.status === 'COMPLETED').length === 0 ? (
//                 <Card>
//                   <CardContent className="p-8 text-center">
//                     <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
//                     <h3 className="text-lg font-medium text-gray-900">No Completed Matches</h3>
//                     <p className="text-gray-500 mt-2">
//                       There are no completed matches yet.
//                       End a live match to see it here.
//                     </p>
//                   </CardContent>
//                 </Card>
//               ) : (
//                 <MatchList 
//                   matches={filteredMatches.filter(m => m.status === 'COMPLETED')}
//                   readonly={true}
//                 />
//               )}
//             </TabsContent>
//           </Tabs>
//         </CardContent>
//       </Card>

//       {/* Modals */}
//       <MatchCreateModal 
//         open={showCreateModal} 
//         onOpenChange={setShowCreateModal}
//         selectedEvent={selectedEvent !== 'all' ? selectedEvent : null}
//         onSuccess={() => {
//           if (selectedEvent && selectedEvent !== 'all') {
//             fetchMatchesByEvent(selectedEvent);
//           }
//           toast.success('Match scheduled successfully!');
//         }}
//       />
      
//       {selectedMatch && (
//         <>
//           <MatchScoreModal 
//             open={showScoreModal} 
//             onOpenChange={setShowScoreModal} 
//             match={selectedMatch}
//             onSuccess={() => {
//               if (selectedEvent && selectedEvent !== 'all') {
//                 fetchMatchesByEvent(selectedEvent);
//               }
//               toast.success('Score updated successfully!');
//             }}
//           />
//           <MatchEndModal 
//             open={showEndModal} 
//             onOpenChange={setShowEndModal} 
//             match={selectedMatch}
//             onSuccess={() => {
//               if (selectedEvent && selectedEvent !== 'all') {
//                 fetchMatchesByEvent(selectedEvent);
//               }
//               toast.success('Match ended successfully!');
//             }}
//           />
//         </>
//       )}
//     </div>
//   );
// };

// export default Matches;
import React, { useState, useEffect, useRef } from 'react';
import { useAdminStore } from '../../stores/adminStore';
import MatchList from '../../components/admin/matches/MatchList';
import MatchCreateModal from '../../components/admin/matches/MatchCreateModal';
import MatchScoreModal from '../../components/admin/matches/MatchScoreModal';
import MatchEndModal from '../../components/admin/matches/MatchEndModal';
import { Button } from '../../components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Plus, RefreshCw, Loader2, Calendar } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
import { toast } from 'sonner';

const Matches = () => {
  const { events, matches, fetchEvents, fetchMatches,cancelMatch, startMatch, isLoading } = useAdminStore();
  
  // Tab and Filter State
  const [selectedEvent, setSelectedEvent] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  
  // Modal Visibility State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  
  // Data State for specific match actions
  const [selectedMatch, setSelectedMatch] = useState(null);

  const hasInitialized = useRef(false);

  // Initial Data Fetch
  useEffect(() => {
    const init = async () => {
      if (!hasInitialized.current) {
        await fetchEvents();
        await fetchMatches('all');
        hasInitialized.current = true;
      }
    };
    init();
  }, [fetchEvents, fetchMatches]);

  // Handlers for MatchList Actions
  const handleEventSelect = (id) => {
    setSelectedEvent(id);
    fetchMatches(id);
  };

  const handleStartMatch = async (match) => {
    try {
      await startMatch(match._id);
      toast.success('Match is now LIVE!');
      fetchMatches(selectedEvent);
    } catch (error) {
      toast.error('Failed to start match');
    }
  };

  const handleUpdateScoreClick = (match) => {
    setSelectedMatch(match);
    setShowScoreModal(true);
  };

  const handleEndMatchClick = (match) => {
    setSelectedMatch(match);
    setShowEndModal(true);
  };
  const handleCancelMatch = async (matchId) => {
  await cancelMatch(matchId);
};

  // Memory filtering for the current view
  const filteredMatches = matches.filter(m => {
    const matchesTab = activeTab === 'all' || m.status?.toLowerCase() === activeTab.toLowerCase();
    return matchesTab;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Match Management</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => fetchMatches(selectedEvent)}>
            <RefreshCw className={isLoading ? "animate-spin" : ""} size={16} />
          </Button>
          <Button onClick={() => setShowCreateModal(true)}><Plus size={16} /> Schedule</Button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="flex gap-4 bg-white p-2 rounded-lg border shadow-sm">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="border">
               <Calendar size={16} className="mr-2"/> 
               {selectedEvent === 'all' ? "All Events" : events.find(e => e._id === selectedEvent)?.name}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleEventSelect('all')}>All Events</DropdownMenuItem>
            {events.map(e => (
              <DropdownMenuItem key={e._id} onClick={() => handleEventSelect(e._id)}>{e.name}</DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="all">Total ({matches.length})</TabsTrigger>
            <TabsTrigger value="live">Live</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="completed">Finished</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content Section */}
      {isLoading && matches.length === 0 ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>
      ) : (
        <MatchList 
          matches={filteredMatches} 
          onStartMatch={handleStartMatch}
          onUpdateScore={handleUpdateScoreClick}
          onEndMatch={handleEndMatchClick}
          onCancelMatch={handleCancelMatch}
        />
      )}

      {/* Modal Management */}
      <MatchCreateModal 
        open={showCreateModal} 
        onOpenChange={setShowCreateModal} 
        onSuccess={() => fetchMatches(selectedEvent)} 
      />

      {selectedMatch && (
        <>
          <MatchScoreModal 
            open={showScoreModal} 
            onOpenChange={setShowScoreModal} 
            match={selectedMatch} 
            onSuccess={() => fetchMatches(selectedEvent)} 
          />
          <MatchEndModal 
            open={showEndModal} 
            onOpenChange={setShowEndModal} 
            match={selectedMatch} 
            onSuccess={() => fetchMatches(selectedEvent)} 
          />
        </>
      )}
    </div>
  );
};

export default Matches;