import React, { useState } from 'react';
import { useAdminStore } from '../../../stores/adminStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";

const MatchScoreModal = ({ open, onOpenChange, match, onSuccess }) => {
  const { updateMatchScore, isLoading } = useAdminStore();
  const [scores, setScores] = useState({ scoreA: match?.scoreA || '', scoreB: match?.scoreB || '' });

  const handleUpdate = async () => {
    await updateMatchScore(match._id, scores);
    onSuccess();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white">
        <DialogHeader><DialogTitle>Update Live Score</DialogTitle></DialogHeader>
        <div className="flex items-center gap-6 py-6">
          <div className="flex-1 text-center">
            <p className="font-bold mb-2">{match?.teamA?.name}</p>
            <Input className="text-center text-2xl" value={scores.scoreA} onChange={(e) => setScores({...scores, scoreA: e.target.value})} />
          </div>
          <div className="font-black text-gray-300">VS</div>
          <div className="flex-1 text-center">
            <p className="font-bold mb-2">{match?.teamB?.name}</p>
            <Input className="text-center text-2xl" value={scores.scoreB} onChange={(e) => setScores({...scores, scoreB: e.target.value})} />
          </div>
        </div>
        <Button onClick={handleUpdate} disabled={isLoading} className="w-full">Update App Live</Button>
      </DialogContent>
    </Dialog>
  );
};

export default MatchScoreModal;