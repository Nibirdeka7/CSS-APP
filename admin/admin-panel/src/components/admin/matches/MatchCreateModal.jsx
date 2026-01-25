import React, { useState, useEffect } from 'react';
import { useAdminStore } from '../../../stores/adminStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { Layers } from 'lucide-react'; // Icon for rounds

const MatchCreateModal = ({ open, onOpenChange, onSuccess }) => {
  const { events, fetchEligibleTeams, createMatch, isLoading } = useAdminStore();
  const [formData, setFormData] = useState({
    event: '',
    teamA: '',
    teamB: '',
    venue: '',
    round: '', // Now mandatory
    startTime: ''
  });
  const [eligibleTeams, setEligibleTeams] = useState([]);

  // Fetch teams specific to the selected event category
  useEffect(() => {
    if (formData.event) {
      fetchEligibleTeams(formData.event).then(teams => setEligibleTeams(teams));
    }
  }, [formData.event, fetchEligibleTeams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Add validation to ensure round is selected
    if(!formData.round) return alert("Please select a tournament round");
    
    await createMatch(formData);
    onSuccess();
    onOpenChange(false);
    // Reset form
    setFormData({ event: '', teamA: '', teamB: '', venue: '', round: '', startTime: '' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-white border-t-4 border-black">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Schedule New Match</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          
          {/* 1. Select Event */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-gray-500">Tournament Event</label>
            <Select onValueChange={(val) => setFormData({...formData, event: val})}>
              <SelectTrigger className="bg-gray-50 border-gray-200">
                <SelectValue placeholder="Select Sport Category" />
              </SelectTrigger>
              <SelectContent>
                {events.map(e => (
                  <SelectItem key={e._id} value={e._id}>
                    {e.name} ({e.sport})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 2. Select Tournament Round (New Field) */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-gray-500">Tournament Stage</label>
            <Select onValueChange={(val) => setFormData({...formData, round: val})}>
              <SelectTrigger className="bg-indigo-50 border-indigo-100 text-black">
                <Layers className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Select Round" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="QUALIFIERS">Qualifiers</SelectItem>
                <SelectItem value="QUARTER_FINALS">Quarter Finals</SelectItem>
                <SelectItem value="SEMI_FINALS">Semi Finals</SelectItem>
                <SelectItem value="THIRD_PLACE">3rd Place Match</SelectItem>
                <SelectItem value="FINALS">Grand Finale</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 3. Select Teams */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-gray-500">Team A</label>
              <Select disabled={!formData.event} onValueChange={(val) => setFormData({...formData, teamA: val})}>
                <SelectTrigger className="bg-gray-50"><SelectValue placeholder="Team A" /></SelectTrigger>
                <SelectContent>
                  {eligibleTeams.map(t => (
                    <SelectItem key={t._id} value={t._id} disabled={t._id === formData.teamB}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-gray-500">Team B</label>
              <Select disabled={!formData.event} onValueChange={(val) => setFormData({...formData, teamB: val})}>
                <SelectTrigger className="bg-gray-50"><SelectValue placeholder="Team B" /></SelectTrigger>
                <SelectContent>
                  {eligibleTeams.map(t => (
                    <SelectItem key={t._id} value={t._id} disabled={t._id === formData.teamA}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 4. Venue & Time */}
          <div className="space-y-1">
             <label className="text-xs font-bold uppercase text-gray-500">Venue</label>
             <Input 
                className="bg-gray-50" 
                placeholder="Ground Name / Court Number" 
                onChange={(e) => setFormData({...formData, venue: e.target.value})} 
             />
          </div>
          
          <div className="space-y-1">
             <label className="text-xs font-bold uppercase text-gray-500">Start Date & Time</label>
             <Input 
                type="datetime-local" 
                className="bg-gray-50"
                onChange={(e) => setFormData({...formData, startTime: e.target.value})} 
             />
          </div>
          
          <DialogFooter className="pt-4">
            <Button type="submit" disabled={isLoading} className="w-full bg-black hover:bg-gray-800">
              Schedule {formData.round || "Match"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MatchCreateModal;