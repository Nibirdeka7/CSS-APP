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
import { Textarea } from '../../../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { Calendar } from '../../../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../../components/ui/popover';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../../../lib/utils';
import { useAdminStore } from '../../../stores/adminStore';
import { toast } from 'sonner';

const EventEditModal = ({ open, onOpenChange, event, onSuccess }) => {
  const { updateEvent, isLoading } = useAdminStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    sport: 'CRICKET',
    category: 'MALE',
    type: 'TEAM',
    bannerImageUrl: '',
    rules: 'Standard rules apply.',
    registrationOpen: true,
    maxTeamSize: '',
    minTeamSize: '',
    isActive: true,
    startDate: null,
  });

  // Initialize form with event data
  useEffect(() => {
    if (event) {
      setFormData({
        name: event.name || '',
        sport: event.sport || 'CRICKET',
        category: event.category || 'MALE',
        type: event.type || 'TEAM',
        bannerImageUrl: event.bannerImageUrl || '',
        rules: event.rules || 'Standard rules apply.',
        registrationOpen: event.registrationOpen !== false,
        maxTeamSize: event.maxTeamSize?.toString() || '',
        minTeamSize: event.minTeamSize?.toString() || '',
        isActive: event.isActive !== false,
        startDate: event.startDate ? new Date(event.startDate) : null,
      });
    }
  }, [event]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      const requiredFields = ['name', 'sport', 'category', 'type', 'bannerImageUrl', 'maxTeamSize', 'minTeamSize'];
      const missingFields = requiredFields.filter(field => !formData[field]);
      
      if (missingFields.length > 0) {
        toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
        setIsSubmitting(false);
        return;
      }

      // Validate team sizes
      if (parseInt(formData.maxTeamSize) < parseInt(formData.minTeamSize)) {
        toast.error('Maximum team size must be greater than or equal to minimum team size');
        setIsSubmitting(false);
        return;
      }

      // Prepare data for backend
      const eventData = {
        ...formData,
        maxTeamSize: parseInt(formData.maxTeamSize),
        minTeamSize: parseInt(formData.minTeamSize),
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
      };

      await updateEvent(event._id, eventData);
      toast.success('Event updated successfully!');
      
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Failed to update event:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const sportOptions = [
    { value: 'CRICKET', label: 'Cricket' },
    { value: 'BADMINTON', label: 'Badminton' },
  ];

  const categoryOptions = [
    { value: 'MALE', label: 'Male' },
    { value: 'FEMALE', label: 'Female' },
    { value: 'OPEN', label: 'Open' },
  ];

  const typeOptions = [
    { value: 'SOLO', label: 'Solo' },
    { value: 'DUO', label: 'Duo' },
    { value: 'TEAM', label: 'Team' },
  ];

  if (!event) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>
          <DialogDescription>
            Update the details for {event.name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Event Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Event Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Summer Cricket Tournament 2024"
              required
              disabled={isSubmitting || isLoading}
            />
          </div>

          {/* Sport, Category, Type */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sport">
                Sport <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.sport}
                onValueChange={(value) => setFormData({ ...formData, sport: value })}
                required
                disabled={isSubmitting || isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select sport" />
                </SelectTrigger>
                <SelectContent>
                  {sportOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">
                Category <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
                required
                disabled={isSubmitting || isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">
                Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
                required
                disabled={isSubmitting || isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {typeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Start Date */}
          <div className="space-y-2">
            <Label>Start Date (Optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.startDate && "text-gray-500"
                  )}
                  disabled={isSubmitting || isLoading}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.startDate ? (
                    format(new Date(formData.startDate), "PPP")
                  ) : (
                    <span>Pick a date (optional)</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.startDate ? new Date(formData.startDate) : null}
                  onSelect={(date) => setFormData({ ...formData, startDate: date })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Team Size Constraints */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minTeamSize">
                Minimum Team Size <span className="text-red-500">*</span>
              </Label>
              <Input
                id="minTeamSize"
                type="number"
                min="1"
                value={formData.minTeamSize}
                onChange={(e) => setFormData({ ...formData, minTeamSize: e.target.value })}
                placeholder="e.g., 1 for solo, 2 for duo, 5 for team"
                required
                disabled={isSubmitting || isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxTeamSize">
                Maximum Team Size <span className="text-red-500">*</span>
              </Label>
              <Input
                id="maxTeamSize"
                type="number"
                min="1"
                value={formData.maxTeamSize}
                onChange={(e) => setFormData({ ...formData, maxTeamSize: e.target.value })}
                placeholder="e.g., 1 for solo, 2 for duo, 11 for cricket"
                required
                disabled={isSubmitting || isLoading}
              />
            </div>
          </div>

          {/* Banner Image */}
          <div className="space-y-2">
            <Label htmlFor="bannerImageUrl">
              Banner Image URL <span className="text-red-500">*</span>
            </Label>
            <div className="space-y-3">
              <Input
                id="bannerImageUrl"
                value={formData.bannerImageUrl}
                onChange={(e) => setFormData({ ...formData, bannerImageUrl: e.target.value })}
                placeholder="Enter image URL"
                required
                disabled={isSubmitting || isLoading}
              />
              
              {formData.bannerImageUrl && (
                <div className="mt-2">
                  <div className="text-sm text-gray-500 mb-2">Preview:</div>
                  <div className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                    <img 
                      src={formData.bannerImageUrl} 
                      alt="Banner preview" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gray-400">Invalid image URL</div>';
                      }}
                    />
                  </div>
                </div>
              )}
              
              <p className="text-sm text-gray-500">
                Enter a valid image URL. Recommended size: 1200×400 pixels.
              </p>
            </div>
          </div>

          {/* Rules */}
          <div className="space-y-2">
            <Label htmlFor="rules">Rules</Label>
            <Textarea
              id="rules"
              value={formData.rules}
              onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
              placeholder="Enter tournament rules..."
              rows={3}
              disabled={isSubmitting || isLoading}
            />
          </div>

          {/* Status & Registration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="isActive">Event Status</Label>
              <Select
                value={formData.isActive ? 'active' : 'inactive'}
                onValueChange={(value) => setFormData({ ...formData, isActive: value === 'active' })}
                disabled={isSubmitting || isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="registrationOpen">Registration</Label>
              <Select
                value={formData.registrationOpen ? 'open' : 'closed'}
                onValueChange={(value) => setFormData({ ...formData, registrationOpen: value === 'open' })}
                disabled={isSubmitting || isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select registration status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting || isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || isLoading}
            >
              {(isSubmitting || isLoading) ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Event'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EventEditModal;