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
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Card, CardContent } from '../../../components/ui/card';
import { Plus, Minus, RefreshCw } from 'lucide-react';

const MatchScoreModal = ({ open, onOpenChange, match }) => {
  const [scores, setScores] = useState({
    teamA: match?.scoreA || 0,
    teamB: match?.scoreB || 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!match) return null;

  const handleScoreChange = (team, delta) => {
    setScores(prev => ({
      ...prev,
      [team]: Math.max(0, prev[team] + delta)
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // API call to update score
      console.log('Updating score:', { matchId: match.id, ...scores });
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to update score:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setScores({
      teamA: match.scoreA || 0,
      teamB: match.scoreB || 0,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Update Match Score</DialogTitle>
          <DialogDescription>
            Update the current score for {match.teamA.name} vs {match.teamB.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Match Info */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-4xl mb-2">{match.teamA.logo}</div>
                <h4 className="font-bold text-lg">{match.teamA.name}</h4>
                <p className="text-sm text-gray-500">Team A</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-4xl mb-2">{match.teamB.logo}</div>
                <h4 className="font-bold text-lg">{match.teamB.name}</h4>
                <p className="text-sm text-gray-500">Team B</p>
              </CardContent>
            </Card>
          </div>

          {/* Score Controls */}
          <div className="space-y-6">
            {/* Team A Score */}
            <div className="space-y-3">
              <Label>Team A Score</Label>
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleScoreChange('teamA', -1)}
                  disabled={scores.teamA <= 0}
                >
                  <Minus size={16} />
                </Button>
                
                <div className="flex-1">
                  <Input
                    type="number"
                    min="0"
                    value={scores.teamA}
                    onChange={(e) => setScores(prev => ({ ...prev, teamA: parseInt(e.target.value) || 0 }))}
                    className="text-center text-2xl font-bold"
                  />
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleScoreChange('teamA', 1)}
                >
                  <Plus size={16} />
                </Button>
              </div>
            </div>

            {/* Team B Score */}
            <div className="space-y-3">
              <Label>Team B Score</Label>
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleScoreChange('teamB', -1)}
                  disabled={scores.teamB <= 0}
                >
                  <Minus size={16} />
                </Button>
                
                <div className="flex-1">
                  <Input
                    type="number"
                    min="0"
                    value={scores.teamB}
                    onChange={(e) => setScores(prev => ({ ...prev, teamB: parseInt(e.target.value) || 0 }))}
                    className="text-center text-2xl font-bold"
                  />
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleScoreChange('teamB', 1)}
                >
                  <Plus size={16} />
                </Button>
              </div>
            </div>
          </div>

          {/* Current Score Display */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <p className="text-sm text-gray-600">Current Score</p>
              <div className="flex items-center justify-center gap-6 mt-2">
                <div className="text-center">
                  <div className="text-3xl font-bold">{scores.teamA}</div>
                  <p className="text-sm text-gray-500">{match.teamA.name}</p>
                </div>
                <div className="text-2xl text-gray-400">-</div>
                <div className="text-center">
                  <div className="text-3xl font-bold">{scores.teamB}</div>
                  <p className="text-sm text-gray-500">{match.teamB.name}</p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={isSubmitting}
              className="gap-2"
            >
              <RefreshCw size={16} />
              Reset
            </Button>
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
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Updating...' : 'Update Score'}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MatchScoreModal;