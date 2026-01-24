import React from 'react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { useAdminStore } from '../../../stores/adminStore';
import { 
  Trophy, 
  Clock, 
  PlayCircle, 
  BarChart3, 
  Flag, 
  Calendar,
  MapPin,
  MoreVertical,
  Award,
  Trash2,
  TrendingUp
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

// Sub-component to handle the Live Pot Visualization
const MatchPotStats = ({ match, stats }) => {
  if (!stats) return <div className="text-[10px] text-gray-400 animate-pulse">Calculating pot...</div>;

  const teamAId = match.teamA?._id || match.teamA;
  const teamBId = match.teamB?._id || match.teamB;

  const totalA = stats.find(s => s._id === teamAId)?.totalPoints || 0;
  const totalB = stats.find(s => s._id === teamBId)?.totalPoints || 0;
  const combined = totalA + totalB;
  const ratioA = combined > 0 ? (totalA / combined) * 100 : 50;

  return (
    <div className="mt-4 pt-3 border-t border-gray-100">
      <div className="flex justify-between items-end mb-1">
        <div className="flex flex-col">
          <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">Team A Pot</span>
          <span className="text-xs font-bold text-blue-600">{totalA.toLocaleString()} pts</span>
        </div>
        <TrendingUp size={12} className="text-gray-300 mb-1" />
        <div className="flex flex-col items-end">
          <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">Team B Pot</span>
          <span className="text-xs font-bold text-red-600">{totalB.toLocaleString()} pts</span>
        </div>
      </div>
      <div className="w-full h-1.5 bg-gray-100 rounded-full flex overflow-hidden">
        <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${ratioA}%` }} />
        <div className="h-full bg-red-500 transition-all duration-500" style={{ width: `${100 - ratioA}%` }} />
      </div>
    </div>
  );
};

const MatchList = ({ 
  matches = [], 
  onStartMatch = () => {}, 
  onUpdateScore = () => {}, 
  onEndMatch = () => {}, 
  onCancelMatch = () => {},
  readonly = false 
}) => {
  
  // Access global stats from store
  const matchStats = useAdminStore((state) => state.matchStats || {});
  const fetchMatchStats = useAdminStore((state) => state.fetchMatchStats);

  // Fetch stats for all visible matches when list loads
  React.useEffect(() => {
    matches.forEach(m => {
      if (!matchStats[m._id]) fetchMatchStats(m._id);
    });
  }, [matches]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Not scheduled';
    try {
      return format(new Date(dateString), 'MMM dd, HH:mm');
    } catch (e) {
      return 'Invalid Date';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'LIVE':
        return <Badge variant="destructive" className="gap-1 animate-pulse"><div className="w-2 h-2 rounded-full bg-white" /> LIVE</Badge>;
      case 'UPCOMING':
        return <Badge variant="outline" className="gap-1 text-blue-600 border-blue-200 bg-blue-50/50"><Clock size={12} /> Upcoming</Badge>;
      case 'COMPLETED':
        return <Badge className="gap-1 bg-emerald-600 text-white hover:bg-emerald-700 border-0"><Flag size={12} /> Completed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getMatchCardClass = (status) => {
    const base = "transition-all duration-200 border-l-4 ";
    switch (status) {
      case 'LIVE': return base + 'border-l-red-500 border-red-100 bg-white shadow-md';
      case 'UPCOMING': return base + 'border-l-blue-500 border-blue-50 bg-white';
      case 'COMPLETED': return base + 'border-l-emerald-500 border-emerald-50 bg-gray-50';
      default: return base + 'border-l-gray-300 bg-white';
    }
  };

  if (!matches || matches.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-12 text-center">
          <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No Matches Found</h3>
          <p className="text-gray-500 mt-1">
            {readonly ? 'No match history yet.' : 'Schedule a new match to get started.'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {matches.map((match) => {
        const teamAId = match.teamA?._id || match.teamA;
        const teamBId = match.teamB?._id || match.teamB;
        const winnerId = match.winner?._id || match.winner;

        return (
          <Card key={match._id} className={getMatchCardClass(match.status)}>
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                           <h3 className="font-bold text-gray-900 text-lg">
                            {match.event?.name || 'Tournament Match'}
                           </h3>
                           <Badge variant="secondary" className="text-[9px] uppercase tracking-widest font-black h-5 px-1.5">
                            {match.event?.sport || 'Sport'}
                           </Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                          {getStatusBadge(match.status)}
                          {match.round && <Badge variant="outline" className="text-[10px] h-5 uppercase border-gray-300 text-gray-500">{match.round}</Badge>}
                        </div>
                      </div>
                    </div>
                    
                    {!readonly && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100 rounded-full">
                            <MoreVertical size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52 shadow-xl border-slate-200">
                          <DropdownMenuLabel className="text-xs text-gray-400">Manage Match</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          
                          {/* Use onSelect for reliable trigger inside Dropdowns */}
                          {match.status === 'UPCOMING' && (
                            <DropdownMenuItem onSelect={() => onStartMatch(match)} className="text-blue-600 font-semibold cursor-pointer">
                              <PlayCircle size={16} className="mr-2" /> Start Live Match
                            </DropdownMenuItem>
                          )}
                          
                          {match.status === 'LIVE' && (
                            <>
                              <DropdownMenuItem onSelect={() => onUpdateScore(match)} className="cursor-pointer font-medium">
                                <BarChart3 size={16} className="mr-2" /> Update Score
                              </DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => onEndMatch(match)} className="text-emerald-600 font-bold cursor-pointer">
                                <Flag size={16} className="mr-2" /> End & Settle Points
                              </DropdownMenuItem>
                            </>
                          )}
                          
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onSelect={() => {
                              if (window.confirm("Delete this match? This will remove all associated user investments.")) {
                                onCancelMatch(match._id);
                              }
                            }} 
                            className="text-red-500 cursor-pointer focus:bg-red-50 focus:text-red-600"
                          >
                            <Trash2 size={16} className="mr-2" /> Cancel Match
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4 bg-gray-50/80 p-5 rounded-2xl border border-gray-100 shadow-inner">
                    {/* Team A */}
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-16 h-16 rounded-full bg-white border-2 border-white shadow-sm flex items-center justify-center text-3xl relative">
                        {match.teamA?.logo || '🏠'}
                        {winnerId === teamAId && (
                          <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-1 border-2 border-white shadow-md animate-bounce">
                            <Award className="h-4 w-4 text-white" />
                          </div>
                        )}
                      </div>
                      <span className="font-bold text-center leading-tight min-h-[2rem] flex items-center text-slate-700">
                        {match.teamA?.name || 'Team A'}
                      </span>
                      <span className="text-4xl font-black text-slate-900 tracking-tighter">{match.scoreA || '0'}</span>
                    </div>

                    {/* VS Center Section */}
                    <div className="flex flex-col items-center">
                      <div className="px-5 py-1 rounded-full bg-white border border-gray-200 text-gray-400 text-[10px] font-black tracking-widest shadow-sm mb-2 uppercase">VS</div>
                      {match.status === 'LIVE' && <div className="text-[9px] text-red-500 font-black tracking-[0.2em] animate-pulse">MATCH LIVE</div>}
                      <div className="mt-3 text-[11px] text-gray-500 flex items-center gap-1.5 font-medium">
                        <MapPin size={12} className="text-gray-300" /> {match.venue || 'TBA'}
                      </div>
                      <div className="text-[11px] text-gray-500 flex items-center gap-1.5 mt-1.5 font-medium">
                        <Calendar size={12} className="text-gray-300" /> {formatDate(match.startTime || match.createdAt)}
                      </div>
                    </div>

                    {/* Team B */}
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-16 h-16 rounded-full bg-white border-2 border-white shadow-sm flex items-center justify-center text-3xl relative">
                        {match.teamB?.logo || '🚀'}
                        {winnerId === teamBId && (
                          <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-1 border-2 border-white shadow-md animate-bounce">
                            <Award className="h-4 w-4 text-white" />
                          </div>
                        )}
                      </div>
                      <span className="font-bold text-center leading-tight min-h-[2rem] flex items-center text-slate-700">
                        {match.teamB?.name || 'Team B'}
                      </span>
                      <span className="text-4xl font-black text-slate-900 tracking-tighter">{match.scoreB || '0'}</span>
                    </div>
                  </div>

                  {/* Render the Pot Stats Visualization */}
                  <MatchPotStats match={match} stats={matchStats[match._id]} />
                </div>

                {/* Match Result Summary Sidebar (COMPLETED ONLY) */}
                {match.status === 'COMPLETED' && (
                  <div className="lg:w-60 flex flex-col justify-center border-t lg:border-t-0 lg:border-l border-gray-200 pt-6 lg:pt-0 lg:pl-6">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Final Verdict</h4>
                    <div className="space-y-4">
                       <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                        <span className="text-[9px] text-emerald-600 font-black uppercase">Winner</span>
                        <p className="text-sm font-black text-emerald-900 mt-0.5 truncate">
                           {winnerId === teamAId ? match.teamA?.name : match.teamB?.name}
                        </p>
                       </div>
                       <div className="flex flex-col px-1">
                        <span className="text-[9px] text-gray-400 font-bold uppercase">Official</span>
                        <span className="text-xs font-semibold text-gray-600 truncate">{match.referee || 'Unassigned'}</span>
                       </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default MatchList;