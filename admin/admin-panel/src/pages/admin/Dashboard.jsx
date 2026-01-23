import React, { useState } from 'react';
import DashboardStats from '../../components/admin/DashboardStats';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Calendar, 
  Trophy,
  MoreVertical
} from 'lucide-react';

const Dashboard = () => {
  const stats = [
    {
      title: 'Total Events',
      value: '12',
      change: '+2',
      trend: 'up',
      icon: Calendar,
      color: 'blue'
    },
    {
      title: 'Active Matches',
      value: '8',
      change: '-1',
      trend: 'down',
      icon: Trophy,
      color: 'green'
    },
    {
      title: 'Pending Teams',
      value: '15',
      change: '+5',
      trend: 'up',
      icon: Users,
      color: 'orange'
    },
    {
      title: 'Total Revenue',
      value: '$4,250',
      change: '+12.5%',
      trend: 'up',
      icon: TrendingUp,
      color: 'purple'
    }
  ];

  const recentActivities = [
    { id: 1, action: 'Team "Dragons" approved', time: '2 min ago', type: 'team' },
    { id: 2, action: 'Match "Finals" created', time: '15 min ago', type: 'match' },
    { id: 3, action: 'Event "Summer Cup" updated', time: '1 hour ago', type: 'event' },
    { id: 4, action: 'User points distributed', time: '2 hours ago', type: 'transaction' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your tournaments.</p>
      </div>

      {/* Stats Grid */}
      <DashboardStats stats={stats} />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Frequently used admin actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button className="flex-col h-auto py-4">
                  <Calendar className="mb-2" size={24} />
                  <span>Create Event</span>
                </Button>
                <Button className="flex-col h-auto py-4">
                  <Users className="mb-2" size={24} />
                  <span>Approve Teams</span>
                </Button>
                <Button className="flex-col h-auto py-4">
                  <Trophy className="mb-2" size={24} />
                  <span>Start Match</span>
                </Button>
                <Button variant="outline" className="flex-col h-auto py-4">
                  <MoreVertical className="mb-2" size={24} />
                  <span>More Actions</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>Latest actions in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        activity.type === 'team' ? 'bg-blue-100 text-blue-600' :
                        activity.type === 'match' ? 'bg-green-100 text-green-600' :
                        activity.type === 'event' ? 'bg-purple-100 text-purple-600' :
                        'bg-orange-100 text-orange-600'
                      }`}>
                        {activity.type === 'team' && <Users size={18} />}
                        {activity.type === 'match' && <Trophy size={18} />}
                        {activity.type === 'event' && <Calendar size={18} />}
                        {activity.type === 'transaction' && <TrendingUp size={18} />}
                      </div>
                      <div>
                        <p className="font-medium">{activity.action}</p>
                        <p className="text-sm text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">View</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Pending Approvals */}
          <Card>
            <CardHeader>
              <CardTitle>Pending Approvals</CardTitle>
              <CardDescription>Require immediate attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">5 Teams</span>
                    <span className="text-sm text-orange-600">Waiting</span>
                  </div>
                  <p className="text-sm text-gray-600">New team registrations pending review</p>
                  <Button size="sm" className="w-full mt-3">Review Now</Button>
                </div>
                
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">3 Matches</span>
                    <span className="text-sm text-blue-600">Ready to Start</span>
                  </div>
                  <p className="text-sm text-gray-600">Scheduled matches can be started</p>
                  <Button size="sm" className="w-full mt-3">View Matches</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">API Status</span>
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-green-600">Operational</span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Database</span>
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-green-600">Healthy</span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Uptime</span>
                  <span className="text-gray-900 font-medium">99.9%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;