import React, { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { 
  Users, 
  Trophy, 
  Calendar, 
  CheckCircle,
  XCircle,
  User,
  Filter,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import { format } from 'date-fns';
import { cn } from '../../../lib/utils';

const AllTeams = ({ teams, selectedEvent, onApprove, onReject }) => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [expandedTeam, setExpandedTeam] = useState(null);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return format(date, 'MMM dd, yyyy');
  };

  const getSportIcon = (sport) => {
    switch(sport) {
      case 'CRICKET': return '🏏';
      case 'BADMINTON': return '🏸';
      default: return '🏆';
    }
  };

  // Filter teams by status
  const filteredTeams = teams.filter(team => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'approved') return team.approved === true;
    if (statusFilter === 'pending') return team.approved === false;
    return true;
  });

  // Sort teams
  const sortedTeams = [...filteredTeams].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
    if (sortBy === 'oldest') {
      return new Date(a.createdAt) - new Date(b.createdAt);
    }
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    }
    return 0;
  });

  const toggleExpand = (teamId) => {
    setExpandedTeam(expandedTeam === teamId ? null : teamId);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Status: {statusFilter === 'all' ? 'All' : statusFilter}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                All Teams
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('approved')}>
                Approved Only
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('pending')}>
                Pending Only
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Sort: {sortBy === 'newest' ? 'Newest First' : 
                      sortBy === 'oldest' ? 'Oldest First' : 'Name A-Z'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSortBy('newest')}>
                Newest First
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('oldest')}>
                Oldest First
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('name')}>
                Name A-Z
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="text-sm text-gray-500">
          Showing {sortedTeams.length} of {teams.length} teams
        </div>
      </div>

      {/* Teams List */}
      <div className="space-y-4">
        {sortedTeams.map((team) => (
          <Card key={team._id}>
            <CardContent className="p-0">
              {/* Team Header */}
              <div 
                className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleExpand(team._id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-lg flex items-center justify-center text-2xl",
                      team.approved ? "bg-green-100" : "bg-orange-100"
                    )}>
                      {getSportIcon(team.event?.sport)}
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-gray-900">{team.name}</h3>
                        {team.approved ? (
                          <Badge variant="success" className="gap-1">
                            <CheckCircle size={12} />
                            Approved
                          </Badge>
                        ) : (
                          <Badge variant="warning" className="gap-1">
                            <XCircle size={12} />
                            Pending
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <span>Event: {team.event?.name || 'Unknown'}</span>
                        <span>•</span>
                        <span>{team.members?.length || 0} members</span>
                        <span>•</span>
                        <span>Registered: {formatDate(team.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Button 
                      size="sm" 
                      variant={team.approved ? "outline" : "default"}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!team.approved) {
                          onApprove(team);
                        }
                      }}
                      disabled={team.approved}
                    >
                      {team.approved ? 'Approved' : 'Approve'}
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                    >
                      {expandedTeam === team._id ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              {expandedTeam === team._id && (
                <div className="px-6 pb-6 border-t pt-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Team Details */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">Team Details</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Captain:</span>
                          <span className="font-medium">
                            {team.members?.find(m => m.isCaptain)?.user?.name || 'Unknown'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Event Sport:</span>
                          <span className="font-medium">{team.event?.sport || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Event Category:</span>
                          <span className="font-medium">{team.event?.category || 'N/A'}</span>
                        </div>
                        {team.description && (
                          <div className="mt-3">
                            <p className="text-sm text-gray-500 mb-1">Description:</p>
                            <p className="text-sm">{team.description}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Team Members */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Team Members</h4>
                      <div className="space-y-2">
                        {team.members?.slice(0, 3).map((member, index) => (
                          <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <User className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">
                                {member.user?.name || 'Unknown User'}
                                {member.isCaptain && ' (Captain)'}
                              </p>
                              <p className="text-xs text-gray-500">{member.user?.email || 'No email'}</p>
                            </div>
                          </div>
                        ))}
                        
                        {team.members?.length > 3 && (
                          <div className="text-center text-sm text-gray-500">
                            +{team.members.length - 3} more members
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Actions</h4>
                      <div className="space-y-2">
                        {!team.approved && (
                          <>
                            <Button 
                              className="w-full"
                              onClick={() => onApprove(team)}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Approve Team
                            </Button>
                            <Button 
                              variant="destructive" 
                              className="w-full"
                              onClick={() => onReject(team._id)}
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Reject Team
                            </Button>
                          </>
                        )}
                        <Button variant="outline" className="w-full">
                          View Full Details
                        </Button>
                        <Button variant="ghost" className="w-full">
                          Send Message
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AllTeams;