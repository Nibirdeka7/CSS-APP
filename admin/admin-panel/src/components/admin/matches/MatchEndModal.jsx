import React, { useState } from 'react';
import { useAdminStore } from '../../../stores/adminStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../ui/dialog";
import { Button } from "../../ui/button";

const MatchEndModal = ({ open, onOpenChange, match, onSuccess }) => {
  const { endMatch, isLoading } = useAdminStore();
  const [winnerId, setWinnerId] = useState(null);

  const handleEndMatch = async () => {
    if (!winnerId) return;
    await endMatch(match._id, winnerId);
    onSuccess();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>Declare Winner & Settle Points</DialogTitle>
          <DialogDescription>Warning: This will distribute coins and eliminate the loser.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <Button 
            variant={winnerId === match?.teamA?._id ? "default" : "outline"}
            onClick={() => setWinnerId(match?.teamA?._id)}
          >
            {match?.teamA?.name} Won
          </Button>
          <Button 
            variant={winnerId === match?.teamB?._id ? "default" : "outline"}
            onClick={() => setWinnerId(match?.teamB?._id)}
          >
            {match?.teamB?.name} Won
          </Button>
        </div>
        <Button onClick={handleEndMatch} disabled={!winnerId || isLoading} className="w-full bg-red-600 hover:bg-red-700">
          Confirm Settlement
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default MatchEndModal;