import React from 'react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { 
  Users, 
  Trophy, 
  Calendar, 
  CheckCircle,
  User,
  Mail,
  Phone,
  MoreVertical
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import { format } from 'date-fns';

const ApprovedTeams = ({ teams, selectedEvent }) => {
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

  const handleViewDetails = (team) => {
    console.log('View team details:', team);
    // You can implement a modal or redirect here
  };

  const handleDisqualify = (teamId) => {
    if (window.confirm('Are you sure you want to disqualify this team?')) {
      console.log('Disqualify team:', teamId);
      // Implement disqualify logic here
    }
  };

  return (
    <div className="space-y-4">
      {teams.map((team) => (
        <Card key={team._id}>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Team Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center text-3xl">
                      {getSportIcon(team.event?.sport)}
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold text-gray-900">{team.name}</h3>
                        <Badge variant="success" className="gap-1">
                          <CheckCircle size={12} />
                          Approved
                        </Badge>
                      </div>
                      <p className="text-gray-600 mt-1">
                        Event: {team.event?.name || 'Unknown Event'}
                      </p>
                      <div className="flex flex-wrap gap-4 mt-3">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Users size={16} />
                          <span>{team.members?.length || 0} members</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar size={16} />
                          <span>Approved: {formatDate(team.updatedAt)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Trophy size={16} />
                          <span>{team.event?.sport || 'Unknown Sport'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewDetails(team)}>
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        Edit Team
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        Send Message
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => handleDisqualify(team._id)}
                      >
                        Disqualify Team
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Team Members */}
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-3">Team Members</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {team.members?.slice(0, 4).map((member, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            {member.user?.avatar ? (
                              <img 
                                src={member.user.avatar} 
                                alt={member.user.name}
                                className="w-10 h-10 rounded-full"
                              />
                            ) : (
                              <User className="h-5 w-5 text-blue-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">
                              {member.user?.name || 'Unknown User'}
                              {member.isCaptain && ' (Captain)'}
                            </p>
                            <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                              <Mail size={14} />
                              <span>{member.user?.email || 'No email'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {team.members?.length > 4 && (
                      <div className="p-3 bg-gray-50 rounded-lg flex items-center justify-center">
                        <span className="text-gray-500">
                          +{team.members.length - 4} more members
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Team Stats */}
                <div className="mt-4 grid grid-cols-3 gap-4">
                  <div className="p-3 bg-blue-50 rounded-lg text-center">
                    <div className="text-sm text-gray-500">Matches Played</div>
                    <div className="text-xl font-bold">0</div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg text-center">
                    <div className="text-sm text-gray-500">Matches Won</div>
                    <div className="text-xl font-bold">0</div>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg text-center">
                    <div className="text-sm text-gray-500">Points</div>
                    <div className="text-xl font-bold">0</div>
                  </div>
                </div>
              </div>

              {/* Action Panel */}
              <div className="lg:w-64 border-t lg:border-t-0 lg:border-l pt-6 lg:pt-0 lg:pl-6">
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">Team Status</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <Badge variant="success">Active</Badge>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-600">Can Play Matches:</span>
                        <span className="font-medium text-green-600">Yes</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-600">Eliminated:</span>
                        <span className="font-medium text-red-600">No</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-600">Registration Date:</span>
                        <span className="font-medium">{formatDate(team.createdAt)}</span>
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <Button variant="outline" className="w-full" onClick={() => handleViewDetails(team)}>
                      View Full Details
                    </Button>
                    <Button className="w-full">
                      Schedule Match
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ApprovedTeams;