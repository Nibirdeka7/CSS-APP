import React from 'react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent } from '../../../components/ui/card';
import { 
  Calendar, 
  Users, 
  Trophy, 
  Edit, 
  MoreVertical,
  Clock,
  MapPin,
  Trash2,
  Eye,
  Lock,
  LockOpen,
  CheckCircle,
  XCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel
} from '../../../components/ui/dropdown-menu';

const EventList = ({ events, onEdit, onDelete }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'Not scheduled';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getSportIcon = (sport) => {
    switch(sport) {
      case 'CRICKET':
        return '🏏';
      case 'BADMINTON':
        return '🏸';
      default:
        return '🏆';
    }
  };

  const getStatusBadge = (isActive) => {
    if (isActive) {
      return <Badge variant="success" className="gap-1"><CheckCircle size={12} /> Active</Badge>;
    } else {
      return <Badge variant="destructive" className="gap-1"><XCircle size={12} /> Inactive</Badge>;
    }
  };

  const getRegistrationBadge = (registrationOpen) => {
    if (registrationOpen) {
      return <Badge variant="outline" className="gap-1 text-green-600 border-green-200"><LockOpen size={12} /> Open</Badge>;
    } else {
      return <Badge variant="outline" className="gap-1 text-red-600 border-red-200"><Lock size={12} /> Closed</Badge>;
    }
  };

  const getCategoryBadge = (category) => {
    const colors = {
      MALE: 'bg-blue-100 text-blue-800 border-blue-200',
      FEMALE: 'bg-pink-100 text-pink-800 border-pink-200',
      OPEN: 'bg-green-100 text-green-800 border-green-200',
    };
    return (
      <Badge variant="outline" className={colors[category]}>
        {category}
      </Badge>
    );
  };

  const getTypeBadge = (type) => {
    const colors = {
      SOLO: 'bg-purple-100 text-purple-800 border-purple-200',
      DUO: 'bg-orange-100 text-orange-800 border-orange-200',
      TEAM: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    };
    return (
      <Badge variant="outline" className={colors[type]}>
        {type}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <Card key={event._id} className="overflow-hidden hover:shadow-lg transition-shadow">
          <CardContent className="p-0">
            <div className="flex flex-col lg:flex-row">
              {/* Event Image */}
              <div className="lg:w-64 relative">
                <div className="h-full w-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-6">
                  {event.bannerImageUrl ? (
                    <div className="absolute inset-0">
                      <img 
                        src={event.bannerImageUrl} 
                        alt={event.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = `
                            <div class="w-full h-full flex items-center justify-center text-4xl">
                              ${getSportIcon(event.sport)}
                            </div>
                          `;
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>
                  ) : (
                    <div className="text-center z-10">
                      <div className="text-6xl mb-4">{getSportIcon(event.sport)}</div>
                      <h3 className="font-bold text-white text-xl">{event.name}</h3>
                    </div>
                  )}
                </div>
                <div className="absolute top-3 left-3 flex gap-2">
                  {getStatusBadge(event.isActive)}
                  {getRegistrationBadge(event.registrationOpen)}
                </div>
              </div>

              {/* Event Details */}
              <div className="flex-1 p-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{event.name}</h3>
                      {getCategoryBadge(event.category)}
                      {getTypeBadge(event.type)}
                    </div>
                    <p className="text-gray-600">{event.description || 'No description provided.'}</p>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onEdit(event)}>
                        <Edit className="mr-2" size={14} />
                        Edit Event
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Eye className="mr-2" size={14} />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Users className="mr-2" size={14} />
                        Manage Teams
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Trophy className="mr-2" size={14} />
                        Schedule Matches
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => onDelete(event._id)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2" size={14} />
                        Delete Event
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Event Info Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100">
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Start Date</p>
                      <p className="font-medium">
                        {formatDate(event.startDate)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-100">
                      <Users className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Team Size</p>
                      <p className="font-medium">
                        {event.minTeamSize} - {event.maxTeamSize} players
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-100">
                      <Trophy className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Sport</p>
                      <p className="font-medium">{event.sport}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-orange-100">
                      <Clock className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Created</p>
                      <p className="font-medium">
                        {formatDate(event.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Rules Preview */}
                {event.rules && event.rules !== 'Standard rules apply.' && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-1">Rules:</p>
                    <p className="text-sm text-gray-600 line-clamp-2">{event.rules}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-between items-center mt-6 pt-6 border-t">
                  <div className="text-sm text-gray-500">
                    Event ID: {event._id?.slice(-8) || 'N/A'}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="mr-2" size={14} />
                      View
                    </Button>
                    <Button size="sm" onClick={() => onEdit(event)}>
                      <Edit className="mr-2" size={14} />
                      Edit
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

export default EventList;