/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Mail, Phone, Calendar, MapPin, Edit, Trash2, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ActivityTimeline } from '@/components/ActivityTimeline';
import { membersApi } from '@/lib/api/members';
import { 
  Member, 
  GenderOptions, 
  MembershipStatusOptions, 
  MaritalStatusOptions,
  Activity,
  ActivityType 
} from '@/lib/api/members/types';
import { format } from 'date-fns';

export default function MemberProfilePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchMember = async () => {
      try {
        setLoading(true);
        const data = await membersApi.getMember(params.id);
        setMember(data);
      } catch (err) {
        console.error('Error fetching member:', err);
        setError('Failed to load member data');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchMember();
    }
  }, [params.id]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      console.error('Error formatting date:', e);
      return 'Invalid date';
    }
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    const first = (firstName || '').charAt(0) || '';
    const last = (lastName || '').charAt(0) || '';
    return `${first}${last}`.toUpperCase() || '?';
  };

  const handleDelete = async () => {
    if (!member) return;
    
    if (!confirm('Are you sure you want to delete this member? This action cannot be undone.')) {
      return;
    }

    try {
      setIsDeleting(true);
      await membersApi.deleteMember(member.id);
      router.push('/members');
    } catch (error) {
      console.error('Error deleting member:', error);
      setError('Failed to delete member. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="container mx-auto p-6">
        <Button variant="outline" onClick={() => router.push('/members')} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Members
        </Button>
        <div className="bg-destructive/15 border border-destructive text-destructive p-4 rounded-md">
          <p>{error || 'Member not found'}</p>
        </div>
      </div>
    );
  }

  // Mock activities - replace with actual API call
  const activities: Activity[] = [
    {
      id: '1',
      type: 'attendance',
      date: new Date().toISOString(),
      title: 'Sunday Service',
      present: true,
      description: 'Morning service at Main Sanctuary'
    },
    {
      id: '5',
      type: 'attendance',
      date: new Date(Date.now() - 7 * 86400000).toISOString(),
      title: 'Sunday Service',
      present: false,
      description: 'Absent - Out of town'
    },
    // Add more activities here...
  ];

  // Calculate attendance percentage
  const attendanceStats = (() => {
    const allAttendance = activities.filter(a => a.type === 'attendance');
    const presentCount = allAttendance.filter(a => a.present).length;
    const totalCount = allAttendance.length;

    return {
      percentage: totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0,
      presentCount,
      totalCount
    };
  })();

  // Calculate financial stats
  const financialStats = (() => {
    const tithes = activities.filter(a => a.type === 'tithe');
    const offerings = activities.filter(a => a.type === 'offering');

    return {
      totalTithes: tithes.reduce((sum, a) => sum + (a.amount || 0), 0),
      titheCount: tithes.length,
      totalOfferings: offerings.reduce((sum, a) => sum + (a.amount || 0), 0),
      offeringCount: offerings.length
    };
  })();

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" size="sm" onClick={() => router.push('/members')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Members
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push(`/members/${member.id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" /> Edit Profile
          </Button>
          <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Column - Profile Card */}
        <div className="md:w-1/3 space-y-4">
          <div className="flex flex-col gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage 
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(member.firstName + ' ' + member.lastName)}&background=random`} 
                      alt={`${member.firstName} ${member.lastName}`}
                    />
                    <AvatarFallback>{getInitials(member.firstName, member.lastName)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h1 className="text-2xl font-bold">{member.firstName} {member.lastName}</h1>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Badge variant={member.membershipStatus === 'ACTIVE' ? 'default' : 'secondary'}>
                        {MembershipStatusOptions[member.membershipStatus as keyof typeof MembershipStatusOptions] || member.membershipStatus}
                      </Badge>
                      <p className="text-muted-foreground">Member since {formatDate(member.joinDate)}</p>
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="space-y-4">
                  {member.email && (
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p>{member.email}</p>
                      </div>
                    </div>
                  )}
                  {member.phone && (
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p>{member.phone}</p>
                      </div>
                    </div>
                  )}
                  {member.dateOfBirth && (
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Date of Birth</p>
                        <p>{formatDate(member.dateOfBirth)}</p>
                      </div>
                    </div>
                  )}
                  {(member.address || member.city || member.state || member.country) && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-muted-foreground">Address</p>
                        <p className="whitespace-pre-line">
                          {[member.address, member.city, member.state, member.postalCode, member.country]
                            .filter(Boolean)
                            .join('\n')}
                        </p>
                      </div>
                    </div>
                  )}
                  {member.gender && (
                    <div className="flex items-start gap-3">
                      <div className="h-5 w-5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Gender</p>
                        <p>{GenderOptions[member.gender as keyof typeof GenderOptions] || member.gender}</p>
                      </div>
                    </div>
                  )}
                  {member.maritalStatus && (
                    <div className="flex items-start gap-3">
                      <div className="h-5 w-5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Marital Status</p>
                        <p>{MaritalStatusOptions[member.maritalStatus as keyof typeof MaritalStatusOptions] || member.maritalStatus}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column - Additional Information */}
        <div className="md:w-2/3 space-y-6">
          {/* Family Members */}
          {member.familyMembers && member.familyMembers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Family Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {member.familyMembers.map((familyMember) => (
                    <div key={familyMember.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{familyMember.name}</p>
                        <p className="text-sm text-muted-foreground">{familyMember.relationship}</p>
                      </div>                      
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {member.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line">{member.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Activities */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <p className="text-sm text-muted-foreground">Member&apos;s recent activities and contributions</p>
            </CardHeader>
            <CardContent>
              {activities.length ? (
                <ActivityTimeline activities={activities} />
              ) : (
                <p className="text-muted-foreground text-center py-4">No activities found</p>
              )}
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Attendance (Last 30 days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {attendanceStats.percentage}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {attendanceStats.presentCount} of {attendanceStats.totalCount} services
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Tithes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${financialStats.totalTithes.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {financialStats.titheCount} transactions
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Offerings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${financialStats.totalOfferings.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {financialStats.offeringCount} donations
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}