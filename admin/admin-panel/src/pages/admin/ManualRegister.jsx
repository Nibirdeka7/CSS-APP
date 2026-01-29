import React, { useState, useEffect } from 'react';
import { useAdminStore } from '../../stores/adminStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { UserPlus, Trash2, ShieldCheck, Mail } from 'lucide-react';
import { toast } from "sonner"; // Assuming you use sonner for toast

const ManualRegister = () => {
  const { events, fetchEvents } = useAdminStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    eventId: '',
    teamName: '',
    captainPhone: '',
    members: [{ email: '' }] // Start with one member field
  });

  useEffect(() => { fetchEvents(); }, []);

  const addMemberField = () => {
    setFormData({ ...formData, members: [...formData.members, { email: '' }] });
  };

  const removeMemberField = (index) => {
    const newMembers = formData.members.filter((_, i) => i !== index);
    setFormData({ ...formData, members: newMembers });
  };

  const handleMemberChange = (index, value) => {
    const newMembers = [...formData.members];
    newMembers[index].email = value;
    setFormData({ ...formData, members: newMembers });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // We will create a new backend route for this: /api/admin/manual-register
      const response = await fetch('http://localhost:5000/api/admin/manual-register', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log(data);
      if (!response.ok) throw new Error(data.message);

      toast.success("Users registered successfully!");
      setFormData({ eventId: '', teamName: '', captainPhone: '', members: [{ email: '' }] });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card className="border-t-4 border-t-indigo-600">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="text-indigo-600" /> Manual Event Registration
          </CardTitle>
          <CardDescription>Register users for an event on their behalf.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Event Selection */}
            <div className="space-y-2">
              <label className="text-sm font-bold">Select Event</label>
              <Select onValueChange={(val) => setFormData({...formData, eventId: val})}>
                <SelectTrigger><SelectValue placeholder="Choose Event" /></SelectTrigger>
                <SelectContent>
                  {events.map(e => <SelectItem key={e._id} value={e._id}>{e.name} ({e.sport})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold">Team Name (Solo: User's Name)</label>
                <Input 
                  placeholder="e.g. Team Alpha" 
                  value={formData.teamName}
                  onChange={(e) => setFormData({...formData, teamName: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold">Contact Phone</label>
                <Input 
                  placeholder="10-digit number" 
                  value={formData.captainPhone}
                  onChange={(e) => setFormData({...formData, captainPhone: e.target.value})} 
                />
              </div>
            </div>

            {/* Members Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold">Member Emails</label>
                <Button type="button" variant="outline" size="sm" onClick={addMemberField}>
                  <UserPlus size={14} className="mr-1" /> Add Email
                </Button>
              </div>
              
              {formData.members.map((member, index) => (
                <div key={index} className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <Input 
                      className="pl-10"
                      placeholder="user@cse.nits.ac.in" 
                      value={member.email}
                      onChange={(e) => handleMemberChange(index, e.target.value)}
                      required
                    />
                  </div>
                  {formData.members.length > 1 && (
                    <Button variant="ghost" size="icon" onClick={() => removeMemberField(index)}>
                      <Trash2 size={16} className="text-red-500" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <Button type="submit" className="w-full bg-indigo-600" disabled={loading}>
              {loading ? "Processing..." : "Register Users for Event"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManualRegister;