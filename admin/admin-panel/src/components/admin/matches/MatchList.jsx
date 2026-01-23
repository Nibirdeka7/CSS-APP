import React from 'react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Progress } from '../../../components/ui/progress';
import { 
  Trophy, 
  Clock, 
  PlayCircle, 
  BarChart3, 
  Flag, 
  Calendar,
  MapPin,
  MoreVertical
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';

const MatchList = ({ matches, onStartMatch, onUpdateScore, onEndMatch, readonly = false }) => {
  if (matches.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No Matches Found</h3>
          <p className="text-gray-500 mt-2">
            {readonly ? 'No completed matches yet.' : 'Schedule a new match to get started.'}
          </p>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'live':
        return <Badge variant="destructive" className="animate-pulse">LIVE</Badge>;
      case 'scheduled':
        return <Badge variant="outline">Scheduled</Badge>;
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getMatchCardClass = (status) => {
    switch (status) {
      case 'live':
        return 'border-red-200 bg-gradient-to-r from-red-50 to-white';
      case 'scheduled':
        return 'border-blue-200 bg-gradient-to-r from-blue-50 to-white';
      case 'completed':
        return 'border-green-200 bg-gradient-to-r from-green-50 to-white';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-4">
      {matches.map((match) => (
        <Card key={match.id} className={getMatchCardClass(match.status)}>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Match Info */}
              <div className="flex-1">
                {/* Match Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <Trophy className="h-5 w-5 text-gray-400" />
                      <h3 className="font-bold text-gray-900">{match.event}</h3>
                      {getStatusBadge(match.status)}
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} />
                        <span>{match.scheduledTime}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={14} />
                        <span>{match.venue}</span>
                      </div>
                      {match.round && (
                        <div className="flex items-center gap-2">
                          <Flag size={14} />
                          <span>{match.round}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {!readonly && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Match Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Edit Schedule</DropdownMenuItem>
                        {match.status === 'scheduled' && (
                          <DropdownMenuItem onClick={() => onStartMatch(match)}>
                            Start Match
                          </DropdownMenuItem>
                        )}
                        {match.status === 'live' && (
                          <>
                            <DropdownMenuItem onClick={() => onUpdateScore(match)}>
                              Update Score
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEndMatch(match)}>
                              End Match
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          Cancel Match
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>

                {/* Teams & Score */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Team A */}
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center text-4xl mx-auto mb-3">
                      {match.teamA.logo}
                    </div>
                    <h4 className="font-bold text-lg mb-1">{match.teamA.name}</h4>
                    <div className="flex items-center justify-center gap-4">
                      <span className="text-3xl font-bold">{match.scoreA}</span>
                      {match.status === 'live' && (
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      )}
                    </div>
                  </div>

                  {/* VS / Status */}
                  <div className="flex flex-col items-center justify-center">
                    <div className="text-center mb-4">
                      <div className="text-2xl font-bold text-gray-400">VS</div>
                      {match.status === 'live' && (
                        <>
                          <div className="text-sm text-red-600 font-medium mt-2">LIVE</div>
                          {match.duration && (
                            <div className="text-xs text-gray-500 mt-1">
                              <Clock size={12} className="inline mr-1" />
                              {match.duration}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    
                    {/* Action Buttons */}
                    {!readonly && (
                      <div className="flex gap-2">
                        {match.status === 'scheduled' && (
                          <Button 
                            onClick={() => onStartMatch(match)}
                            size="sm"
                            className="gap-2"
                          >
                            <PlayCircle size={16} />
                            Start Match
                          </Button>
                        )}
                        {match.status === 'live' && (
                          <>
                            <Button 
                              onClick={() => onUpdateScore(match)}
                              size="sm"
                              variant="outline"
                              className="gap-2"
                            >
                              <BarChart3 size={16} />
                              Update Score
                            </Button>
                            <Button 
                              onClick={() => onEndMatch(match)}
                              size="sm"
                              variant="destructive"
                              className="gap-2"
                            >
                              <Flag size={16} />
                              End Match
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Team B */}
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-100 to-red-50 flex items-center justify-center text-4xl mx-auto mb-3">
                      {match.teamB.logo}
                    </div>
                    <h4 className="font-bold text-lg mb-1">{match.teamB.name}</h4>
                    <div className="flex items-center justify-center gap-4">
                      {match.status === 'live' && (
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      )}
                      <span className="text-3xl font-bold">{match.scoreB}</span>
                    </div>
                  </div>
                </div>

                {/* Progress Bar for Live Matches */}
                {match.status === 'live' && (
                  <div className="mt-6">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Match Progress</span>
                      <span>~15 min remaining</span>
                    </div>
                    <Progress value={65} className="h-2" />
                  </div>
                )}
              </div>

              {/* Match Stats (for completed matches) */}
              {match.status === 'completed' && (
                <div className="lg:w-64 border-t lg:border-t-0 lg:border-l pt-6 lg:pt-0 lg:pl-6">
                  <h4 className="font-medium text-gray-900 mb-3">Match Statistics</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Winner</span>
                      <span className="font-medium text-green-600">{match.teamA.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Duration</span>
                      <span className="font-medium">1h 30m</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Points</span>
                      <span className="font-medium">{match.scoreA + match.scoreB}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Spectators</span>
                      <span className="font-medium">1,245</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MatchList;