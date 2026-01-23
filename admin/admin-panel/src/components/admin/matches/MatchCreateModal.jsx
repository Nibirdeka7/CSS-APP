import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { Calendar } from '../../../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../../components/ui/popover';
import { CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../../../lib/utils';

const MatchCreateModal = ({ open, onOpenChange }) => {
  const [formData, setFormData] = useState({
    eventId: '',
    teamAId: '',
    teamBId: '',
    scheduledDate: null,
    scheduledTime: '14:00',
    round: 'group',
    venue: 'Main Arena',
    referee: ''
  });

  const [events, setEvents] = useState([]);
  const [teams, setTeams] = useState([]);
  const [eligibleTeams, setEligibleTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Mock data - replace with API calls
  useEffect(() => {
    // Fetch events
    setEvents([
      { id: 1, name: 'Summer Cup 2024' },
      { id: 2, name: 'Winter Championship' },
      { id: 3, name: 'Spring Tournament' },
    ]);

    // Fetch teams
    setTeams([
      { id: 1, name: 'Dragon Warriors', eventId: 1 },
      { id: 2, name: 'Phoenix Rising', eventId: 1 },
      { id: 3, name: 'Titan Strikers', eventId: 1 },
      { id: 4, name: 'Storm Breakers', eventId: 1 },
    ]);
  }, []);

  // Filter eligible teams when event changes
  useEffect(() => {
    if (formData.eventId) {
      setEligibleTeams(teams.filter(team => team.eventId === parseInt(formData.eventId)));
      // Reset team selections
      setFormData(prev => ({ ...prev, teamAId: '', teamBId: '' }));
    }
  }, [formData.eventId, teams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // API call to create match
      console.log('Creating match:', formData);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      onOpenChange(false);
      // Reset form
      setFormData({
        eventId: '',
        teamAId: '',
        teamBId: '',
        scheduledDate: null,
        scheduledTime: '14:00',
        round: 'group',
        venue: 'Main Arena',
        referee: ''
      });
    } catch (error) {
      console.error('Failed to create match:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const rounds = [
    { value: 'group', label: 'Group Stage' },
    { value: 'quarter', label: 'Quarter Finals' },
    { value: 'semi', label: 'Semi Finals' },
    { value: 'final', label: 'Final' },
    { value: 'third', label: '3rd Place' },
  ];

  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00',
    '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Schedule New Match</DialogTitle>
          <DialogDescription>
            Create a new match between two eligible teams
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Event Selection */}
          <div className="space-y-3">
            <Label htmlFor="event">Event *</Label>
            <Select
              value={formData.eventId}
              onValueChange={(value) => setFormData({ ...formData, eventId: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an event" />
              </SelectTrigger>
              <SelectContent>
                {events.map((event) => (
                  <SelectItem key={event.id} value={event.id.toString()}>
                    {event.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Teams Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="teamA">Team A *</Label>
              <Select
                value={formData.teamAId}
                onValueChange={(value) => setFormData({ ...formData, teamAId: value })}
                disabled={!formData.eventId}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Team A" />
                </SelectTrigger>
                <SelectContent>
                  {eligibleTeams.map((team) => (
                    <SelectItem key={team.id} value={team.id.toString()}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label htmlFor="teamB">Team B *</Label>
              <Select
                value={formData.teamBId}
                onValueChange={(value) => setFormData({ ...formData, teamBId: value })}
                disabled={!formData.eventId}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Team B" />
                </SelectTrigger>
                <SelectContent>
                  {eligibleTeams
                    .filter(team => team.id.toString() !== formData.teamAId)
                    .map((team) => (
                      <SelectItem key={team.id} value={team.id.toString()}>
                        {team.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label>Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.scheduledDate && "text-gray-500"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.scheduledDate ? (
                      format(formData.scheduledDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.scheduledDate}
                    onSelect={(date) => setFormData({ ...formData, scheduledDate: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-3">
              <Label htmlFor="time">Time *</Label>
              <Select
                value={formData.scheduledTime}
                onValueChange={(value) => setFormData({ ...formData, scheduledTime: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      <div className="flex items-center gap-2">
                        <Clock size={14} />
                        {time}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Round & Venue */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="round">Round</Label>
              <Select
                value={formData.round}
                onValueChange={(value) => setFormData({ ...formData, round: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select round" />
                </SelectTrigger>
                <SelectContent>
                  {rounds.map((round) => (
                    <SelectItem key={round.value} value={round.value}>
                      {round.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label htmlFor="venue">Venue</Label>
              <Input
                id="venue"
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                placeholder="Enter venue name"
              />
            </div>
          </div>

          {/* Referee */}
          <div className="space-y-3">
            <Label htmlFor="referee">Referee (Optional)</Label>
            <Input
              id="referee"
              value={formData.referee}
              onChange={(e) => setFormData({ ...formData, referee: e.target.value })}
              placeholder="Enter referee name"
            />
          </div>

          {/* Validation Warning */}
          {formData.teamAId && formData.teamBId && formData.teamAId === formData.teamBId && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">
                ⚠️ Team A and Team B cannot be the same team.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || formData.teamAId === formData.teamBId}
            >
              {isLoading ? 'Creating...' : 'Schedule Match'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MatchCreateModal;