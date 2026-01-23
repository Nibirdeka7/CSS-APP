import React from 'react';
import { Button } from '../../ui/button';
import { Card, CardContent } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Users, Mail, Phone, Calendar, CheckCircle, XCircle } from 'lucide-react';

const PendingTeams = ({ teams, onApprove, onReject }) => {
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
        <Card key={team.id}>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Team Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center text-3xl">
                      {team.logo}
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold text-gray-900">{team.name}</h3>
                        <Badge variant="warning">Pending Review</Badge>
                      </div>
                      <p className="text-gray-600 mt-1">Event: {team.event}</p>
                      <div className="flex flex-wrap gap-4 mt-3">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Users size={16} />
                          <span>{team.members} members</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar size={16} />
                          <span>Registered: {team.registeredDate}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Team Members */}
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-3">Team Members</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="font-semibold text-blue-600">JD</span>
                        </div>
                        <div>
                          <p className="font-medium">John Doe (Captain)</p>
                          <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                            <Mail size={14} />
                            <span>john@example.com</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Add more members... */}
                  </div>
                </div>
              </div>

              {/* Action Panel */}
              <div className="lg:w-80 border-t lg:border-t-0 lg:border-l pt-6 lg:pt-0 lg:pl-6">
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Registration Details</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex justify-between">
                        <span className="text-gray-600">Team ID:</span>
                        <span className="font-medium">T-{team.id.toString().padStart(4, '0')}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-600">Registration Date:</span>
                        <span className="font-medium">{team.registeredDate}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-600">Members Verified:</span>
                        <span className="font-medium text-green-600">Yes</span>
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
                      onClick={() => onReject(team.id)}
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