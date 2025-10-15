/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Calendar as CalendarIcon, UserPlus, Users, Check, X } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';

interface Member {
  id: string;
  name: string;
  memberId: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  isVisitor?: boolean;
  contact?: string;
  address?: string;
}

export default function MarkAttendancePage() {
  const router = useRouter();
  const [date, setDate] = useState<Date>(new Date());
  const [serviceType, setServiceType] = useState('Sunday Service');
  const [notes, setNotes] = useState('');
  const [members, setMembers] = useState<Member[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddVisitor, setShowAddVisitor] = useState(false);
  const [newVisitor, setNewVisitor] = useState<Omit<Member, 'id'>>({ 
    name: '', 
    memberId: `V${Date.now()}`,
    status: 'present',
    isVisitor: true,
    contact: '',
    address: ''
  });

  // Mock data - Replace with actual API call
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        // TODO: Replace with actual API call
        const mockMembers: Member[] = [
          { id: '1', name: 'John Doe', memberId: 'M001', status: 'present' },
          { id: '2', name: 'Jane Smith', memberId: 'M002', status: 'absent' },
          { id: '3', name: 'Robert Johnson', memberId: 'M003', status: 'present' },
          { id: '4', name: 'Emily Davis', memberId: 'M004', status: 'late' },
          { id: '5', name: 'Michael Brown', memberId: 'M005', status: 'excused' },
          { id: '6', name: 'Sarah Wilson', memberId: 'M006', status: 'absent' },
          { id: '7', name: 'David Taylor', memberId: 'M007', status: 'present' },
        ];
        setMembers(mockMembers);
      } catch (error) {
        console.error('Error fetching members:', error);
      }
    };

    fetchMembers();
  }, []);

  const filteredMembers = members.filter(member => 
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.memberId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleMemberStatus = (id: string) => {
    setMembers(members.map(member => {
      if (member.id === id) {
        const statuses: ('present' | 'absent' | 'late' | 'excused')[] = 
          ['present', 'absent', 'late', 'excused'];
        const currentIndex = statuses.indexOf(member.status);
        const nextIndex = (currentIndex + 1) % statuses.length;
        return { ...member, status: statuses[nextIndex] };
      }
      return member;
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // TODO: Replace with actual API call
      console.log({
        date,
        serviceType,
        notes,
        attendance: members.map(member => ({
          memberId: member.id,
          status: member.status
        }))
      });
      
      // Show success message and redirect
      alert('Attendance recorded successfully!');
      router.push('/attendance');
    } catch (error) {
      console.error('Error recording attendance:', error);
      alert('Failed to record attendance. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800';
      case 'absent': return 'bg-red-100 text-red-800';
      case 'late': return 'bg-yellow-100 text-yellow-800';
      case 'excused': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddVisitor = () => {
    if (!newVisitor.name.trim()) return;
    
    setMembers([
      ...members,
      {
        ...newVisitor,
        id: `visitor-${Date.now()}`,
        memberId: `V${Date.now().toString().slice(-4)}`
      }
    ]);
    
    // Reset form
    setNewVisitor({ 
      name: '', 
      memberId: `V${Date.now()}`,
      status: 'present',
      isVisitor: true,
      contact: '',
      address: ''
    });
    setShowAddVisitor(false);
  };

  const removeVisitor = (id: string) => {
    setMembers(members.filter(member => member.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Mark Attendance</h1>
          <p className="text-muted-foreground">Record attendance for a church service</p>
        </div>
        <Button 
          variant="outline" 
          className="cursor-pointer"
          onClick={() => router.push('/attendance')}
        >
          View All Records
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="date">Service Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => {
                    if (newDate) {
                      setDate(newDate);
                      // Close the popover after selecting a date
                      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
                    }
                  }}
                  initialFocus
                  components={{
                    Button: (props) => (
                      <button
                        {...props}
                        type="button"
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 w-9 p-0"
                      />
                    ),
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="serviceType">Service Type</Label>
            <select
              id="serviceType"
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
            >
              <option value="Sunday Service">Sunday Service</option>
              <option value="Bible Study">Bible Study</option>
              <option value="Prayer Meeting">Prayer Meeting</option>
              <option value="Special Service">Special Service</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label>Total Present</Label>
            <div className="flex items-center justify-between p-2 border rounded-md">
              <span className="text-2xl font-bold">
                {members.filter(m => m.status === 'present').length}
              </span>
              <span className="text-muted-foreground">
                {members.filter(m => m.status === 'present' && !m.isVisitor).length} members
                {members.some(m => m.isVisitor) && `, ${members.filter(m => m.isVisitor).length} visitors`}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Service Notes</Label>
          <Textarea
            id="notes"
            placeholder="Any special notes about the service..."
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Members</h3>
            <div className="flex gap-2">
              <Input
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-48"
              />
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => setShowAddVisitor(true)}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add Visitor
              </Button>
            </div>
          </div>

          {/* Add Visitor Form */}
          {showAddVisitor && (
            <div className="p-4 border rounded-lg bg-muted/20">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="space-y-2">
                  <Label>Visitor Name *</Label>
                  <Input
                    placeholder="Full name"
                    value={newVisitor.name}
                    onChange={(e) => setNewVisitor({...newVisitor, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contact</Label>
                  <Input
                    placeholder="Phone or email"
                    value={newVisitor.contact || ''}
                    onChange={(e) => setNewVisitor({...newVisitor, contact: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input
                    placeholder="Address"
                    value={newVisitor.address || ''}
                    onChange={(e) => setNewVisitor({...newVisitor, address: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowAddVisitor(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="button" 
                  size="sm"
                  onClick={handleAddVisitor}
                  disabled={!newVisitor.name.trim()}
                >
                  Add Visitor
                </Button>
              </div>
            </div>
          )}

          <div className="border rounded-md overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left p-3 text-sm font-medium">Name</th>
                  <th className="text-left p-3 text-sm font-medium">ID</th>
                  <th className="text-right p-3 text-sm font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="border-t hover:bg-muted/10">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {member.name}
                        {member.isVisitor && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            Visitor
                          </span>
                        )}
                      </div>
                      {member.isVisitor && member.contact && (
                        <div className="text-xs text-muted-foreground">
                          {member.contact}
                        </div>
                      )}
                    </td>
                    <td className="p-3">{member.memberId}</td>
                    <td className="p-3">
                      <div className="flex items-center justify-end gap-2">
                        {member.isVisitor && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeVisitor(member.id);
                            }}
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className={cn(
                            'min-w-[100px] justify-start',
                            member.status === 'present' && 'bg-green-50 text-green-800 border-green-200',
                            member.status === 'absent' && 'bg-red-50 text-red-800 border-red-200',
                            member.status === 'late' && 'bg-yellow-50 text-yellow-800 border-yellow-200',
                            member.status === 'excused' && 'bg-blue-50 text-blue-800 border-blue-200',
                          )}
                          onClick={() => toggleMemberStatus(member.id)}
                        >
                          <span className="capitalize">{member.status}</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredMembers.length === 0 && (
                  <tr>
                    <td colSpan={3} className="p-4 text-center text-muted-foreground">
                      No members found. {searchTerm ? 'Try a different search.' : 'Start by adding a visitor.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => router.push('/attendance')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Attendance'}
          </Button>
        </div>
      </form>
    </div>
  );
}