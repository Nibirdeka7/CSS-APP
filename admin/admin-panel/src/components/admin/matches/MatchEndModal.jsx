import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Label } from '../../../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../../../components/ui/radio-group';
import { Textarea } from '../../../components/ui/textarea';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { AlertCircle, Trophy, Award } from 'lucide-react';

const MatchEndModal = ({ open, onOpenChange, match }) => {
  const [winner, setWinner] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!match) return null;

  const handleSubmit = async () => {
    if (!winner) {
      alert('Please select a winner');
      return;
    }

    setIsSubmitting(true);
    try {
      // API call to end match
      console.log('Ending match:', { 
        matchId: match.id, 
        winnerId: winner,
        notes 
      });
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to end match:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>End Match</DialogTitle>
          <DialogDescription>
            Finalize the match and declare the winner
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Match Info */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-center mb-4">
              <h4 className="font-bold text-lg">{match.teamA.name} vs {match.teamB.name}</h4>
              <p className="text-sm text-gray-600">{match.event} • {match.round}</p>
            </div>
            <div className="flex items-center justify-center gap-6">
              <div className="text-center">
                <div className="text-4xl mb-2">{match.teamA.logo}</div>
                <div className="font-medium">{match.teamA.name}</div>
                <div className="text-2xl font-bold mt-1">{match.scoreA}</div>
              </div>
              <div className="text-3xl text-gray-400">-</div>
              <div className="text-center">
                <div className="text-4xl mb-2">{match.teamB.logo}</div>
                <div className="font-medium">{match.teamB.name}</div>
                <div className="text-2xl font-bold mt-1">{match.scoreB}</div>
              </div>
            </div>
          </div>

          {/* Winner Selection */}
          <div className="space-y-4">
            <Label className="text-base">Select Winner *</Label>
            <RadioGroup value={winner} onValueChange={setWinner} className="space-y-3">
              <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value={match.teamA.id.toString()} id="teamA" />
                <Label htmlFor="teamA" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-xl">
                      {match.teamA.logo}
                    </div>
                    <div>
                      <div className="font-medium">{match.teamA.name}</div>
                      <div className="text-sm text-gray-500">Current: {match.scoreA} points</div>
                    </div>
                    {winner === match.teamA.id.toString() && (
                      <Trophy className="h-5 w-5 text-yellow-500" />
                    )}
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value={match.teamB.id.toString()} id="teamB" />
                <Label htmlFor="teamB" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-xl">
                      {match.teamB.logo}
                    </div>
                    <div>
                      <div className="font-medium">{match.teamB.name}</div>
                      <div className="text-sm text-gray-500">Current: {match.scoreB} points</div>
                    </div>
                    {winner === match.teamB.id.toString() && (
                      <Trophy className="h-5 w-5 text-yellow-500" />
                    )}
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="draw" id="draw" />
                <Label htmlFor="draw" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Award className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="font-medium">Draw / No Winner</div>
                      <div className="text-sm text-gray-500">Match ends in a tie</div>
                    </div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Additional Notes */}
          <div className="space-y-3">
            <Label htmlFor="notes">Match Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about the match outcome..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
            <p className="text-sm text-gray-500">
              These notes will be visible in match history.
            </p>
          </div>

          {/* Warning Alert */}
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Warning:</strong> Ending the match will:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Mark the match as completed</li>
                <li>Declare the selected winner</li>
                <li>Eliminate the losing team (if applicable)</li>
                <li>Distribute points to bettors</li>
                <li>This action cannot be undone</li>
              </ul>
            </AlertDescription>
          </Alert>

          <DialogFooter className="flex-col sm:flex-row gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleSubmit}
              disabled={isSubmitting || !winner}
              className="flex-1"
            >
              {isSubmitting ? 'Ending Match...' : 'Confirm & End Match'}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MatchEndModal;