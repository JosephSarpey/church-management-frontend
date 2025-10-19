/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Calendar as CalendarIcon, UserPlus, X } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { attendanceApi } from '@/lib/api/attendance';
import { membersApi } from '@/lib/api/members';
import { Member as ApiMember } from '@/lib/api/members/types';
import { CreateAttendanceDto, ServiceType } from '@/lib/api/attendance/types';

interface AttendanceMember extends Omit<ApiMember, 'id'> {
  id: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  isVisitor: boolean;
  name: string;
}

interface Visitor extends Omit<AttendanceMember, 'id' | 'memberId' | 'membershipStatus'> {
  id: string;
  contact?: string;
  address?: string;
}

export default function MarkAttendancePage() {
  const router = useRouter();
  const [date, setDate] = useState<Date>(new Date());
  const [serviceType, setServiceType] = useState<ServiceType>(ServiceType.SUNDAY_SERVICE);
  const [notes, setNotes] = useState('');
  const [members, setMembers] = useState<AttendanceMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddVisitor, setShowAddVisitor] = useState(false);
  const [takenBy, setTakenBy] = useState('');
  const [newVisitor, setNewVisitor] = useState<CreateAttendanceDto>({
    visitorName: '',
    isVisitor: true,
    serviceType: ServiceType.SUNDAY_SERVICE,
    contact: '',
    address: ''
  });

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setIsLoading(true);
        const response = await membersApi.getMembers(0, 100);
        
        // Handle both direct array and paginated response formats
        const membersData = Array.isArray(response) 
          ? response // Direct array response
          : response?.data; // Paginated response with data property
        
        if (Array.isArray(membersData)) {
          // Transform API response to our attendance format
          const membersList = membersData.map(member => ({
            ...member,
            status: 'present' as const,
            isVisitor: false,
            name: `${member.firstName} ${member.lastName || ''}`.trim()
          }));
          
          setMembers(membersList);
        } else {
          console.error('Unexpected API response format:', response);
          toast.error('Invalid response format when loading members');
          setMembers([]);
        }
      } catch (error) {
        console.error('Error fetching members:', error);
        toast.error('Failed to load members. Please try again.');
        setMembers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMembers();
  }, []);

  const filteredMembers = members.filter(member => {
    const searchLower = searchTerm.toLowerCase();
    const memberName = member.name || `${member.firstName} ${member.lastName || ''}`.trim();
    
    return (
      memberName.toLowerCase().includes(searchLower) ||
      (member.memberNumber || '').toLowerCase().includes(searchLower) ||
      (member.phone || '').toLowerCase().includes(searchLower) ||
      (member.email || '').toLowerCase().includes(searchLower)
    );
  });

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
    
    if (!date || !serviceType) {
      toast.error('Please select a date and service type');
      return;
    }

    const presentMembers = members.filter(m => m.status === 'present');
    
    if (presentMembers.length === 0) {
      toast.error('Please mark at least one member as present');
      return;
    }

    setIsSubmitting(true);

    try {
      // Process members and visitors separately for better error handling
      const memberAttendances = presentMembers
        .filter(member => !member.isVisitor)
        .map(member => ({
          memberId: member.id,
          serviceType,
          date: date.toISOString(),
          notes: notes || undefined,
          isVisitor: false,
          takenBy: takenBy.trim()
        } as const));

      const visitorAttendances = presentMembers
        .filter(member => member.isVisitor)
        .map(visitor => ({
          isVisitor: true,
          visitorName: visitor.name,
          contact: visitor.phone || undefined,
          address: visitor.address || undefined,
          serviceType,
          date: date.toISOString(),
          notes: notes || undefined,
          takenBy: takenBy.trim()
        } as const));

      // Mark all attendances
      const results = await Promise.allSettled([
        ...memberAttendances.map(att => attendanceApi.markAttendance(att)),
        ...visitorAttendances.map(att => attendanceApi.markAttendance(att))
      ]);

      // Check for any failed requests
      const failed = results.filter(r => r.status === 'rejected');
      if (failed.length > 0) {
        console.error('Some attendances failed to save:', failed);
        if (failed.length === results.length) {
          throw new Error('Failed to save any attendance records');
        }
        toast.warning(`Saved ${results.length - failed.length} records, but ${failed.length} failed`);
      } else {
        toast.success(`Successfully marked ${results.length} attendance records`);
      }

      // Reset form
      setMembers(prevMembers => 
        prevMembers.map(m => ({
          ...m,
          status: 'present',
          // Keep visitor status but clear other fields if it was a visitor
          ...(m.isVisitor ? { 
            name: '',
            phone: '',
            address: '' 
          } : {})
        }))
      );
      setDate(new Date());
      setServiceType(ServiceType.SUNDAY_SERVICE);
      setNotes('');
      setSearchTerm('');
      setShowAddVisitor(false);
      setTakenBy('');
      
    } catch (error) {
      console.error('Error marking attendance:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to mark attendance';
      toast.error(errorMessage);
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

  const handleAddVisitor = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newVisitor.visitorName?.trim()) {
      toast.error('Please enter visitor name');
      return;
    }

    try {
      // Create visitor in local state first for immediate UI feedback
      const tempId = `temp-${Date.now()}`;
      const newVisitorWithId: AttendanceMember = {
        id: tempId,
        firstName: newVisitor.visitorName.split(' ')[0] || 'Visitor',
        lastName: newVisitor.visitorName.split(' ').slice(1).join(' ') || '',
        memberNumber: 'VISITOR',
        status: 'present',
        isVisitor: true,
        name: newVisitor.visitorName,
        phone: newVisitor.contact || '',
        address: newVisitor.address || '',
        email: '',
        dateOfBirth: '',
        gender: 'OTHER',
        maritalStatus: 'SINGLE',
        membershipStatus: 'ACTIVE',
        joinDate: new Date().toISOString(),
        baptized: false,
        occupation: '',
        emergencyContact: '',
        emergencyPhone: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setMembers(prev => [...prev, newVisitorWithId]);
      
      // Reset form
      setNewVisitor({
        visitorName: '',
        isVisitor: true,
        serviceType: ServiceType.SUNDAY_SERVICE,
        contact: '',
        address: ''
      });
      setShowAddVisitor(false);
      
      toast.success('Visitor added to attendance list');
    } catch (error) {
      console.error('Error adding visitor:', error);
      toast.error('Failed to add visitor. Please try again.');
    }
  };

  const removeVisitor = (id: string) => {
    // Only allow removing temporary visitors (not yet saved to the database)
    if (id.startsWith('temp-')) {
      setMembers(members.filter(member => member.id !== id));
    } else {
      toast.info('Please refresh the page to remove saved attendance records');
    }
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
              onChange={(e) => setServiceType(e.target.value as ServiceType)}
            >
              {Object.entries(ServiceType).map(([key, value]) => (
                <option key={value} value={value}>
                  {key.split('_').map(word => 
                    word.charAt(0) + word.slice(1).toLowerCase()
                  ).join(' ')}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label>Taken By *</Label>
            <Input
              id="takenBy"
              placeholder="Your name"
              value={takenBy}
              onChange={(e) => setTakenBy(e.target.value)}
              required
            />
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
                    value={newVisitor.visitorName || ''}
                    onChange={(e) => setNewVisitor({
                      ...newVisitor, 
                      visitorName: e.target.value
                    })}
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
                  disabled={!newVisitor.visitorName?.trim()}
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
                      {member.isVisitor && member.phone && (
                        <div className="text-xs text-muted-foreground">
                          {member.phone}
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      {member.memberNumber || (member.isVisitor ? 'Visitor' : 'N/A')}
                    </td>
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