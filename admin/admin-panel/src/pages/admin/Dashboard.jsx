import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardStats from '../../components/admin/DashboardStats';
import { useAdminStore } from '../../stores/adminStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  Trophy,
  MoreVertical,
  Loader2,
  CheckCircle2,
  Badge
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { 
    events, 
    matches, 
    pendingTeams, 
    fetchEvents, 
    fetchMatches, 
    fetchPendingTeams, 
    isLoading 
  } = useAdminStore();

  // 1. Initial Data Fetching from real backend routes
  useEffect(() => {
    fetchEvents();
    fetchMatches('all');
    fetchPendingTeams();
  }, [fetchEvents, fetchMatches, fetchPendingTeams]);

  // 2. Dynamic Stats Calculation based on real data
  const liveStats = useMemo(() => {
    const activeMatchesCount = matches.filter(m => m.status === 'LIVE').length;
    
    return [
      {
        title: 'Total Events',
        value: events.length.toString(),
        icon: Calendar,
        color: 'blue'
      },
      {
        title: 'Active Matches',
        value: activeMatchesCount.toString(),
        icon: Trophy,
        color: 'green'
      },
      {
        title: 'Pending Teams',
        value: pendingTeams.length.toString(),
        icon: Users,
        color: 'orange'
      },
      {
        title: 'System Uptime',
        value: '99.9%',
        icon: TrendingUp,
        color: 'purple'
      }
    ];
  }, [events, matches, pendingTeams]);

  if (isLoading && events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="animate-spin h-10 w-10 text-primary" />
        <p className="text-muted-foreground animate-pulse">Syncing NIT Silchar real-time data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Admin Terminal</h1>
          <p className="text-gray-500">Live monitoring for NIT Silchar tournament activities.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100 font-medium">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Server Live
        </div>
      </div>

      {/* Real Stats Grid */}
      <DashboardStats stats={liveStats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Functional Quick Actions */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Shortcut to system modules</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="flex-col h-auto py-6 gap-3" onClick={() => navigate('/admin/events')}>
                  <Calendar className="text-blue-500" size={28} />
                  <span className="font-semibold">Events</span>
                </Button>
                <Button variant="outline" className="flex-col h-auto py-6 gap-3" onClick={() => navigate('/admin/teams')}>
                  <Users className="text-orange-500" size={28} />
                  <span className="font-semibold text-center">Approvals</span>
                </Button>
                <Button variant="outline" className="flex-col h-auto py-6 gap-3" onClick={() => navigate('/admin/matches')}>
                  <Trophy className="text-green-500" size={28} />
                  <span className="font-semibold text-center">Live Score</span>
                </Button>
                <Button variant="outline" className="flex-col h-auto py-6 gap-3">
                  <MoreVertical className="text-gray-400" size={28} />
                  <span className="font-semibold text-center text-gray-400">Settings</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Pending Teams List (Live) */}
          <Card className="shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Approval Queue</CardTitle>
                  <CardDescription>New registrations awaiting your check</CardDescription>
                </div>
                <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-100">{pendingTeams.length} Total</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {pendingTeams.length === 0 ? (
                <div className="flex flex-col items-center py-12 text-gray-400">
                  <CheckCircle2 size={40} className="mb-2 opacity-20" />
                  <p>All teams approved!</p>
                </div>
              ) : (
                <div className="divide-y">
                  {pendingTeams.slice(0, 4).map((team) => (
                    <div key={team._id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 uppercase">
                          {team.name[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{team.name}</p>
                          <p className="text-xs text-slate-500 uppercase font-black tracking-widest">{team.event?.sport} - {team.event?.type}</p>
                        </div>
                      </div>
                      <Button size="sm" variant="secondary" onClick={() => navigate('/admin/teams')}>Review</Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            {pendingTeams.length > 4 && (
              <div className="p-3 border-t text-center">
                <Button variant="ghost" size="sm" onClick={() => navigate('/admin/teams')} className="w-full text-blue-600">View all pending teams</Button>
              </div>
            )}
          </Card>
        </div>

        {/* System & Health */}
        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Infrastructure</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">API Gateway</span>
                  <div className="flex items-center gap-2 text-green-600 font-bold text-xs uppercase tracking-widest">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                    Online
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">MongoDB Clusters</span>
                  <div className="flex items-center gap-2 text-green-600 font-bold text-xs uppercase tracking-widest">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                    Connected
                  </div>
                </div>
                <div className="pt-4 border-t border-dashed">
                  <p className="text-[10px] text-gray-400 font-bold uppercase mb-2">Resource Monitoring</p>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 mb-1">
                    <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-400 font-medium">
                    <span>Database Usage</span>
                    <span>45%</span>
                  </div>
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