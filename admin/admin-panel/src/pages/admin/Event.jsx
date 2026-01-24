import React, { useState, useEffect } from 'react';
import { useAdminStore } from '../../stores/adminStore';
import EventList from '../../components/admin/events/EventList';
import EventCreateModal from '../../components/admin/events/EventCreateModel';
import EventEditModal from '../../components/admin/events/EventEditModal';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Search, Filter, Plus, Calendar, Loader2, RefreshCw } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';

const Events = () => {
  const { events, fetchEvents, isLoading } = useAdminStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Fetch events on component mount
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleRefresh = () => {
    fetchEvents();
  };

  const handleEditEvent = (event) => {
    setSelectedEvent(event);
    setShowEditModal(true);
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      try {
        await useAdminStore.getState().deleteEvent(eventId);
      } catch (error) {
        console.error('Failed to delete event:', error);
      }
    }
  };

  // Filter events based on search and status
  const filteredEvents = events.filter(event => {
    const matchesSearch = 
      event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.sport?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.category?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'active' && event.isActive) ||
      (statusFilter === 'inactive' && !event.isActive);
    
    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const stats = {
    total: events.length,
    active: events.filter(e => e.isActive).length,
    upcoming: events.filter(e => e.startDate && new Date(e.startDate) > new Date()).length,
    withRegistrationOpen: events.filter(e => e.registrationOpen).length,
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Events Management</h1>
          <p className="text-gray-600">Create and manage tournament events</p>
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
          <Button 
            onClick={() => setShowCreateModal(true)} 
            disabled={isLoading}
          >
            <Plus className="mr-2" size={20} />
            Create Event
          </Button>
        </div>
      </div>

      {/* Filters Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  placeholder="Search events by name, sport, or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" disabled={isLoading}>
                    <Filter className="mr-2" size={16} />
                    Status: {statusFilter === 'all' ? 'All' : statusFilter}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                    All Events
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('active')}>
                    Active
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('inactive')}>
                    Inactive
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setStatusFilter('registration-open')}>
                    Registration Open
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" disabled={isLoading}>
                    Sort By
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Date (Newest)</DropdownMenuItem>
                  <DropdownMenuItem>Date (Oldest)</DropdownMenuItem>
                  <DropdownMenuItem>Name (A-Z)</DropdownMenuItem>
                  <DropdownMenuItem>Sport</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Events List */}
      {isLoading && events.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : filteredEvents.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No Events Found</h3>
            <p className="text-gray-500 mt-2">
              {searchQuery || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Create your first event to get started'}
            </p>
            <Button 
              onClick={() => setShowCreateModal(true)} 
              className="mt-4"
            >
              <Plus className="mr-2" size={20} />
              Create Your First Event
            </Button>
          </CardContent>
        </Card>
      ) : (
        <EventList 
          events={filteredEvents}
          onEdit={handleEditEvent}
          onDelete={handleDeleteEvent}
        />
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-gray-500">All events created</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Events</CardTitle>
            <div className="h-4 w-4 rounded-full bg-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-gray-500">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcoming}</div>
            <p className="text-xs text-gray-500">Scheduled to start</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registration Open</CardTitle>
            <div className="h-4 w-4 rounded-full bg-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.withRegistrationOpen}</div>
            <p className="text-xs text-gray-500">Accepting registrations</p>
          </CardContent>
        </Card>
      </div>

      {/* Create Event Modal */}
      <EventCreateModal 
        open={showCreateModal} 
        onOpenChange={setShowCreateModal}
        onSuccess={handleRefresh}
      />
      
      {/* Edit Event Modal */}
      {selectedEvent && (
        <EventEditModal 
          open={showEditModal} 
          onOpenChange={setShowEditModal}
          event={selectedEvent}
          onSuccess={handleRefresh}
        />
      )}
    </div>
  );
};

export default Events;