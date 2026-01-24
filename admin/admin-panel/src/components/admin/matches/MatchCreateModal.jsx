import React, { useState, useEffect } from 'react';
import { useAdminStore } from '../../../stores/adminStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";

const MatchCreateModal = ({ open, onOpenChange, onSuccess }) => {
  const { events, fetchEligibleTeams, createMatch, isLoading } = useAdminStore();
  const [formData, setFormData] = useState({
    event: '',
    teamA: '',
    teamB: '',
    venue: '',
    round: '',
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
    await createMatch(formData);
    onSuccess();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle>Schedule New Match</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <Select onValueChange={(val) => setFormData({...formData, event: val})}>
            <SelectTrigger><SelectValue placeholder="Select Event" /></SelectTrigger>
            <SelectContent>
              {events.map(e => <SelectItem key={e._id} value={e._id}>{e.name} ({e.sport})</SelectItem>)}
            </SelectContent>
          </Select>

          <div className="grid grid-cols-2 gap-4">
            <Select disabled={!formData.event} onValueChange={(val) => setFormData({...formData, teamA: val})}>
              <SelectTrigger><SelectValue placeholder="Team A" /></SelectTrigger>
              <SelectContent>
                {eligibleTeams.map(t => <SelectItem key={t._id} value={t._id}>{t.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select disabled={!formData.event} onValueChange={(val) => setFormData({...formData, teamB: val})}>
              <SelectTrigger><SelectValue placeholder="Team B" /></SelectTrigger>
              <SelectContent>
                {eligibleTeams.map(t => <SelectItem key={t._id} value={t._id}>{t.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <Input placeholder="Venue (e.g. Ground A)" onChange={(e) => setFormData({...formData, venue: e.target.value})} />
          <Input type="datetime-local" onChange={(e) => setFormData({...formData, startTime: e.target.value})} />
          
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>Schedule Match</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MatchCreateModal;