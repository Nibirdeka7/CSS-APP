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
import { CheckCircle, AlertCircle, Users, Trophy, Calendar, User } from 'lucide-react';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { useAdminStore } from '../../../stores/adminStore';
import { toast } from 'sonner';
import { format } from 'date-fns';

const TeamApprovalModal = ({ open, onOpenChange, team, onSuccess }) => {
  const { approveTeam, isLoading } = useAdminStore();
  const [approvalNotes, setApprovalNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!team) return null;

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      await approveTeam(team._id);
      toast.success('Team approved successfully!');
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Approval failed:', error);
      toast.error('Failed to approve team');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return format(date, 'MMM dd, yyyy');
  };

  const getSportIcon = (sport) => {
    switch(sport) {
      case 'CRICKET': return '🏏';
      case 'BADMINTON': return '🏸';
      default: return '🏆';
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
                {getSportIcon(team.event?.sport)}
              </div>
              <div>
                <h4 className="font-bold text-lg">{team.name}</h4>
                <p className="text-sm text-gray-600">
                  Event: {team.event?.name || 'Unknown Event'}
                </p>
              </div>
            </div>
            <Separator className="my-4" />
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Captain</p>
                <p className="font-medium">
                  {team.members?.find(m => m.isCaptain)?.user?.name || 'Unknown'}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Members</p>
                <p className="font-medium">{team.members?.length || 0} players</p>
              </div>
              <div>
                <p className="text-gray-500">Registered</p>
                <p className="font-medium">{formatDate(team.createdAt)}</p>
              </div>
              <div>
                <p className="text-gray-500">Status</p>
                <p className="font-medium text-orange-600">Pending Review</p>
              </div>
            </div>
          </div>

          {/* Team Members List */}
          <div>
            <Label className="mb-2">Team Members</Label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {team.members?.map((member, index) => (
                <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    {member.user?.avatar ? (
                      <img 
                        src={member.user.avatar} 
                        alt={member.user.name}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <User className="h-4 w-4 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {member.user?.name || 'Unknown User'}
                      {member.isCaptain && ' (Captain)'}
                    </p>
                    <p className="text-xs text-gray-500">{member.user?.email || 'No email'}</p>
                  </div>
                </div>
              ))}
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
              disabled={isSubmitting || isLoading}
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
              The team will appear in the "Eligible Teams" list for match scheduling.
            </AlertDescription>
          </Alert>

          {/* Action Buttons */}
          <DialogFooter className="flex-col sm:flex-row gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting || isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="success"
              onClick={handleApprove}
              disabled={isSubmitting || isLoading}
              className="flex-1"
            >
              {(isSubmitting || isLoading) ? (
                'Approving...'
              ) : (
                <>
                  <CheckCircle className="mr-2" size={16} />
                  Approve Team
                </>
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TeamApprovalModal;