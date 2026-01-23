import React, { useState } from 'react';
import PendingTeams from '../../components/admin/teams/PendingTeams';
import TeamApprovalModal from '../../components/admin/teams/TeamApprovalModel';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Search, Filter, Users, CheckCircle, XCircle, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { Badge } from '../../components/ui/badge';

const Teams = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);

  // Mock data
  const teams = [
    {
      id: 1,
      name: 'Dragon Warriors',
      event: 'Summer Cup 2024',
      captain: 'John Doe',
      members: 5,
      registeredDate: '2024-01-15',
      status: 'pending',
      logo: '🏆'
    },
    {
      id: 2,
      name: 'Phoenix Rising',
      event: 'Winter Championship',
      captain: 'Jane Smith',
      members: 6,
      registeredDate: '2024-01-14',
      status: 'approved',
      logo: '🔥'
    },
    // Add more teams...
  ];

  const handleApproveTeam = (team) => {
    setSelectedTeam(team);
    setShowApprovalModal(true);
  };

  const handleRejectTeam = (teamId) => {
    // Handle team rejection
    console.log('Reject team:', teamId);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
          <p className="text-gray-600">Manage team registrations and approvals</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            Export Data
          </Button>
          <Button>
            <Users className="mr-2" size={20} />
            View All Teams
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Teams</p>
                <h3 className="text-2xl font-bold mt-2">48</h3>
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
                <p className="text-sm font-medium text-gray-600">Pending Approval</p>
                <h3 className="text-2xl font-bold mt-2">15</h3>
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
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <h3 className="text-2xl font-bold mt-2">30</h3>
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
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <h3 className="text-2xl font-bold mt-2">3</h3>
              </div>
              <div className="p-3 rounded-full bg-red-100">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle>Team Registrations</CardTitle>
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  placeholder="Search teams..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>

              {/* Filters */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Filter className="mr-2" size={16} />
                    Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Filter by Event</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>All Events</DropdownMenuItem>
                  <DropdownMenuItem>Summer Cup 2024</DropdownMenuItem>
                  <DropdownMenuItem>Winter Championship</DropdownMenuItem>
                  <DropdownMenuItem>Spring Tournament</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Filter by Date</DropdownMenuLabel>
                  <DropdownMenuItem>Last 7 days</DropdownMenuItem>
                  <DropdownMenuItem>Last 30 days</DropdownMenuItem>
                  <DropdownMenuItem>Custom Range</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="pending">
                Pending
                <Badge variant="secondary" className="ml-2">15</Badge>
              </TabsTrigger>
              <TabsTrigger value="approved">
                Approved
                <Badge variant="secondary" className="ml-2">30</Badge>
              </TabsTrigger>
              <TabsTrigger value="all">
                All Teams
                <Badge variant="secondary" className="ml-2">48</Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4">
              <PendingTeams 
                teams={teams.filter(t => t.status === 'pending')}
                onApprove={handleApproveTeam}
                onReject={handleRejectTeam}
              />
            </TabsContent>

            <TabsContent value="approved" className="space-y-4">
              {/* Approved Teams List */}
              <div className="space-y-4">
                {teams
                  .filter(t => t.status === 'approved')
                  .map((team) => (
                    <div key={team.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-2xl">
                          {team.logo}
                        </div>
                        <div>
                          <h4 className="font-medium">{team.name}</h4>
                          <p className="text-sm text-gray-500">{team.event} • {team.captain}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="success">Approved</Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Edit Team</DropdownMenuItem>
                            <DropdownMenuItem>Send Message</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              Disqualify
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="all">
              {/* All Teams Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Team</th>
                      <th className="text-left py-3 px-4">Event</th>
                      <th className="text-left py-3 px-4">Captain</th>
                      <th className="text-left py-3 px-4">Members</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teams.map((team) => (
                      <tr key={team.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center">
                              {team.logo}
                            </div>
                            <span className="font-medium">{team.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">{team.event}</td>
                        <td className="py-3 px-4">{team.captain}</td>
                        <td className="py-3 px-4">{team.members}</td>
                        <td className="py-3 px-4">
                          <Badge variant={team.status === 'approved' ? 'success' : 'warning'}>
                            {team.status === 'approved' ? 'Approved' : 'Pending'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                Actions
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem>View Details</DropdownMenuItem>
                              <DropdownMenuItem>Edit</DropdownMenuItem>
                              {team.status === 'pending' && (
                                <>
                                  <DropdownMenuItem onClick={() => handleApproveTeam(team)}>
                                    Approve
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleRejectTeam(team.id)}>
                                    Reject
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Approval Modal */}
      <TeamApprovalModal
        open={showApprovalModal}
        onOpenChange={setShowApprovalModal}
        team={selectedTeam}
      />
    </div>
  );
};

export default Teams;