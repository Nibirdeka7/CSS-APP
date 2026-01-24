import React from 'react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Users, Mail, Phone, Calendar, CheckCircle, XCircle, MapPin, Trophy, User } from 'lucide-react';
import { format } from 'date-fns';

const PendingTeams = ({ teams, onApprove, onReject }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return format(date, 'MMM dd, yyyy');
  };

  const getTeamLogo = (teamName, sport) => {
    const logos = {
      CRICKET: '🏏',
      BADMINTON: '🏸',
    };
    return logos[sport] || '🏆';
  };

  if (teams.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No Pending Teams</h3>
          <p className="text-gray-500 mt-2">All team registrations have been processed.</p>
        </CardContent>
      </Card>
    );
  }

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
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center text-3xl">
                      {getTeamLogo(team.name, team.event?.sport)}
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold text-gray-900">{team.name}</h3>
                        <Badge variant="warning">Pending Review</Badge>
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
                          <span>Registered: {formatDate(team.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Trophy size={16} />
                          <span>{team.event?.sport || 'Unknown Sport'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Team Members */}
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-3">Team Members</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {team.members?.map((member, index) => (
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
                            {member.user?.phone && (
                              <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                                <Phone size={14} />
                                <span>{member.user.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Team Description */}
                {team.description && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-1">Team Description</h4>
                    <p className="text-sm text-blue-800">{team.description}</p>
                  </div>
                )}
              </div>

              {/* Action Panel */}
              <div className="lg:w-80 border-t lg:border-t-0 lg:border-l pt-6 lg:pt-0 lg:pl-6">
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Registration Details</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex justify-between">
                        <span className="text-gray-600">Team ID:</span>
                        <span className="font-medium">T-{team._id?.slice(-6) || 'N/A'}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-600">Event Type:</span>
                        <span className="font-medium">{team.event?.type || 'N/A'}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-600">Category:</span>
                        <span className="font-medium">{team.event?.category || 'N/A'}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-600">Registration Date:</span>
                        <span className="font-medium">{formatDate(team.createdAt)}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className="font-medium text-orange-600">Pending Approval</span>
                      </li>
                    </ul>
                  </div>

                  <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
                    <Button 
                      onClick={() => onApprove(team)}
                      className="flex-1"
                      variant="success"
                    >
                      <CheckCircle className="mr-2" size={16} />
                      Approve Team
                    </Button>
                    <Button 
                      onClick={() => onReject(team._id)}
                      className="flex-1"
                      variant="destructive"
                    >
                      <XCircle className="mr-2" size={16} />
                      Reject Team
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <Button variant="outline" className="w-full">
                      View Full Application
                    </Button>
                    <Button variant="ghost" className="w-full">
                      Request More Info
                    </Button>
                  </div>

                  {/* Additional Info */}
                  {team.additionalInfo && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-1">Additional Info</h4>
                      <p className="text-sm text-gray-600">{team.additionalInfo}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PendingTeams;