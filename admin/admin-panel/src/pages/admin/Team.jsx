import React, { useState, useEffect } from 'react';
import { useAdminStore } from '../../stores/adminStore';
// import { useUserStore } from '../../stores/authStore';
import PendingTeams from '../../components/admin/teams/PendingTeams';
import TeamApprovalModal from '../../components/admin/teams/TeamApprovalModel';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { 
  Search, 
  Filter, 
  Users, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  RefreshCw,
  Calendar
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
import { toast } from 'sonner';
import ApprovedTeams from '@/components/admin/teams/ApprovedTeams';
import AllTeams from '@/components/admin/teams/AllTeams';

const Teams = () => {
  const { 
    events, 
    fetchEvents, 
    pendingTeams, 
    fetchPendingTeams, 
    fetchTeamsByEvent,
    getTeamsByEvent,
    getApprovedTeamsByEvent,
    getPendingTeamsByEvent,
    isLoading 
  } = useAdminStore();
  
  const [activeTab, setActiveTab] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('all');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [eventTeams, setEventTeams] = useState([]);
  const [approvedTeams, setApprovedTeams] = useState([]);

  // Fetch events and teams on component mount
  useEffect(() => {
    fetchEvents();
    fetchPendingTeams();
  }, [fetchEvents, fetchPendingTeams]);

  // When selected event changes, fetch teams for that event
  useEffect(() => {
    if (selectedEvent && selectedEvent !== 'all') {
      loadTeamsForEvent(selectedEvent);
    } else if (selectedEvent === 'all') {
      // For "all events", combine all teams
      const allTeams = [];
      Object.keys(getTeamsByEvent).forEach(eventId => {
        allTeams.push(...getTeamsByEvent(eventId));
      });
      setEventTeams(allTeams);
      setApprovedTeams(allTeams.filter(team => team.approved));
    }
  }, [selectedEvent, getTeamsByEvent]);

  const loadTeamsForEvent = async (eventId) => {
    try {
      const teams = await fetchTeamsByEvent(eventId);
      setEventTeams(teams);
      setApprovedTeams(teams.filter(team => team.approved));
    } catch (error) {
      console.error('Failed to load teams for event:', error);
    }
  };

  const handleRefresh = () => {
    fetchPendingTeams();
    if (selectedEvent && selectedEvent !== 'all') {
      loadTeamsForEvent(selectedEvent);
    }
    toast.success('Teams list refreshed');
  };

  const handleApproveTeam = (team) => {
    setSelectedTeam(team);
    setShowApprovalModal(true);
  };

  const handleRejectTeam = async (teamId, reason = 'Registration rejected by admin') => {
    if (window.confirm('Are you sure you want to reject this team?')) {
      try {
        await useAdminStore.getState().rejectTeam(teamId, reason);
        // Refresh the list
        if (selectedEvent && selectedEvent !== 'all') {
          loadTeamsForEvent(selectedEvent);
        }
        fetchPendingTeams();
      } catch (error) {
        console.error('Failed to reject team:', error);
      }
    }
  };

  // Filter teams based on search query
  const filteredPendingTeams = pendingTeams.filter(team => {
    const matchesSearch = 
      team.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (team.captain?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (team.event?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesEvent = 
      selectedEvent === 'all' || 
      team.event?._id === selectedEvent ||
      team.event === selectedEvent;
    
    return matchesSearch && matchesEvent;
  });

  const filteredEventTeams = eventTeams.filter(team => {
    return team.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           (team.captain?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
  });

  const filteredApprovedTeams = approvedTeams.filter(team => {
    return team.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           (team.captain?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Calculate stats
  const stats = {
    totalPending: filteredPendingTeams.length,
    totalApproved: approvedTeams.length,
    totalRejected: 0, // You'll need to add rejected status to your team model
    totalTeams: eventTeams.length,
    totalEvents: events.length,
  };

  const eventOptions = [
    { id: 'all', name: 'All Events' },
    ...events.map(event => ({
      id: event._id,
      name: event.name,
      sport: event.sport,
      category: event.category
    }))
  ];

  const getSelectedEventName = () => {
    if (selectedEvent === 'all') return 'All Events';
    const event = events.find(e => e._id === selectedEvent);
    return event ? event.name : 'Select Event';
  };

  if (isLoading && pendingTeams.length === 0 && events.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
          <p className="text-gray-600">Manage team registrations and approvals by event</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Event Selection Card */}
      <Card>
        <CardHeader>
          <CardTitle>Select Event</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="mr-2 h-4 w-4" />
                    {getSelectedEventName()}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-96 max-h-80 overflow-y-auto">
                  <DropdownMenuLabel>Events ({events.length})</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setSelectedEvent('all')}>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span>All Events</span>
                    </div>
                  </DropdownMenuItem>
                  {events.map((event) => (
                    <DropdownMenuItem 
                      key={event._id} 
                      onClick={() => setSelectedEvent(event._id)}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{event.name}</span>
                        <span className="text-xs text-gray-500">
                          {event.sport} • {event.category} • {event.type}
                        </span>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Search teams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full md:w-64"
                disabled={isLoading}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Teams</p>
                <h3 className="text-2xl font-bold mt-2">{stats.totalPending}</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Awaiting approval
                </p>
              </div>
              <div className="p-3 rounded-full bg-orange-100">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved Teams</p>
                <h3 className="text-2xl font-bold mt-2">{stats.totalApproved}</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Ready for matches
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Teams</p>
                <h3 className="text-2xl font-bold mt-2">{stats.totalTeams}</h3>
                <p className="text-xs text-gray-500 mt-1">
                  In selected event
                </p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Events</p>
                <h3 className="text-2xl font-bold mt-2">{stats.totalEvents}</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Active tournaments
                </p>
              </div>
              <div className="p-3 rounded-full bg-purple-100">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle>
              Teams for {getSelectedEventName()}
              {selectedEvent !== 'all' && (
                <span className="text-sm font-normal text-gray-500 ml-2">
                  ({filteredEventTeams.length} teams)
                </span>
              )}
            </CardTitle>
            
            <div className="flex items-center gap-2">
              {selectedEvent !== 'all' && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    // This would be to view event details
                    toast.info('Event details would open here');
                  }}
                >
                  View Event Details
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="pending">
                Pending
                <Badge variant="secondary" className="ml-2">{stats.totalPending}</Badge>
              </TabsTrigger>
              <TabsTrigger value="approved">
                Approved
                <Badge variant="secondary" className="ml-2">{stats.totalApproved}</Badge>
              </TabsTrigger>
              <TabsTrigger value="all">
                All Teams
                <Badge variant="secondary" className="ml-2">{stats.totalTeams}</Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : filteredPendingTeams.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No Pending Teams</h3>
                    <p className="text-gray-500 mt-2">
                      {searchQuery || selectedEvent !== 'all' 
                        ? 'No pending teams found for the current filters'
                        : 'All team registrations have been processed.'}
                    </p>
                    {selectedEvent === 'all' && (
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={() => setSelectedEvent(events[0]?._id || 'all')}
                      >
                        View Teams by Event
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <PendingTeams 
                  teams={filteredPendingTeams}
                  onApprove={handleApproveTeam}
                  onReject={handleRejectTeam}
                />
              )}
            </TabsContent>

            <TabsContent value="approved" className="space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : filteredApprovedTeams.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No Approved Teams</h3>
                    <p className="text-gray-500 mt-2">
                      {selectedEvent === 'all'
                        ? 'Select an event to see approved teams'
                        : 'No approved teams found for this event.'}
                    </p>
                    {selectedEvent === 'all' && (
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={() => setSelectedEvent(events[0]?._id || 'all')}
                      >
                        Select an Event
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <ApprovedTeams 
                  teams={filteredApprovedTeams}
                  selectedEvent={selectedEvent}
                />
              )}
            </TabsContent>

            <TabsContent value="all" className="space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : filteredEventTeams.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Users className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No Teams Found</h3>
                    <p className="text-gray-500 mt-2">
                      {selectedEvent === 'all'
                        ? 'Select an event to see teams'
                        : 'No teams found for this event.'}
                    </p>
                    {selectedEvent === 'all' && (
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={() => setSelectedEvent(events[0]?._id || 'all')}
                      >
                        Select an Event
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <AllTeams 
                  teams={filteredEventTeams}
                  selectedEvent={selectedEvent}
                  onApprove={handleApproveTeam}
                  onReject={handleRejectTeam}
                />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Approval Modal */}
      {selectedTeam && (
        <TeamApprovalModal
          open={showApprovalModal}
          onOpenChange={setShowApprovalModal}
          team={selectedTeam}
          onSuccess={() => {
            fetchPendingTeams();
            if (selectedEvent && selectedEvent !== 'all') {
              loadTeamsForEvent(selectedEvent);
            }
            toast.success('Team approved successfully!');
          }}
        />
      )}
    </div>
  );
};

export default Teams;