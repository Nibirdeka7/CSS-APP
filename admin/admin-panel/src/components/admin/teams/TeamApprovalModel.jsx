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
import { Textarea } from '../../../components/ui/textarea';
import { Label } from '../../../components/ui/label';
import { Separator } from '../../../components/ui/separator';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../../../components/ui/alert';

const TeamApprovalModal = ({ open, onOpenChange, team }) => {
  const [approvalNotes, setApprovalNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!team) return null;

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      // API call to approve team
      console.log('Approving team:', team.id);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      onOpenChange(false);
    } catch (error) {
      console.error('Approval failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    setIsSubmitting(true);
    try {
      // API call to reject team
      console.log('Rejecting team:', team.id);
      await new Promise(resolve => setTimeout(resolve, 1000));
      onOpenChange(false);
    } catch (error) {
      console.error('Rejection failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Approve Team Registration</DialogTitle>
          <DialogDescription>
            Review and approve {team.name} for participation
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Team Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center text-2xl">
                {team.logo}
              </div>
              <div>
                <h4 className="font-bold text-lg">{team.name}</h4>
                <p className="text-sm text-gray-600">Event: {team.event}</p>
              </div>
            </div>
            <Separator className="my-4" />
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Captain</p>
                <p className="font-medium">{team.captain}</p>
              </div>
              <div>
                <p className="text-gray-500">Members</p>
                <p className="font-medium">{team.members} players</p>
              </div>
              <div>
                <p className="text-gray-500">Registered</p>
                <p className="font-medium">{team.registeredDate}</p>
              </div>
              <div>
                <p className="text-gray-500">Status</p>
                <p className="font-medium text-orange-600">Pending Review</p>
              </div>
            </div>
          </div>

          {/* Approval Notes */}
          <div className="space-y-3">
            <Label htmlFor="approvalNotes">Approval Notes (Optional)</Label>
            <Textarea
              id="approvalNotes"
              placeholder="Add any notes or comments about this approval..."
              value={approvalNotes}
              onChange={(e) => setApprovalNotes(e.target.value)}
              rows={3}
            />
            <p className="text-sm text-gray-500">
              These notes will be visible to team captains.
            </p>
          </div>

          {/* Alert */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Once approved, this team will be eligible to participate in matches and tournaments.
            </AlertDescription>
          </Alert>

          {/* Action Buttons */}
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
              onClick={handleReject}
              disabled={isSubmitting}
              className="flex-1"
            >
              Reject Team
            </Button>
            <Button
              type="button"
              variant="success"
              onClick={handleApprove}
              disabled={isSubmitting}
              className="flex-1"
            >
              <CheckCircle className="mr-2" size={16} />
              Approve Team
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TeamApprovalModal;