'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Mail, Phone, Calendar, MapPin, Edit, Trash2, Loader2, NotebookPen, HeartHandshake, PersonStandingIcon, FileChartColumnIncreasing } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ActivityTimeline } from '@/components/ActivityTimeline';
import { membersApi } from '@/lib/api/members';
import { attendanceApi } from '@/lib/api/attendance';
import { tithesApi } from '@/lib/api/tithes';
import { Tithe, PaymentTypeOptions } from '@/lib/api/tithes/types';
import {
  Member,
  GenderOptions,
  MembershipStatusOptions,
  MaritalStatusOptions
} from '@/lib/api/members/types';
import { ServiceType } from '@/lib/api/attendance/types';
import { format } from 'date-fns';

type ServiceTypeCount = {
  [key: string]: number; 
};

interface AttendanceRecord {
  id: string;
  serviceType: ServiceType;
  date: string;
  notes?: string;
  takenBy: string;
  isVisitor: boolean;
  visitorName?: string;
  memberId?: string;
  member?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

enum ActivityType {
  NOTE = 'note',
  ATTENDANCE = 'attendance',
  TITHE = 'tithe',
  OFFERING = 'offering',
  UPDATE = 'update'
}

export default function MemberProfilePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [member, setMember] = useState<Member | null>(null);
  const [attendanceStats, setAttendanceStats] = useState<{
    last30Days: number;
    lastService: string;
    serviceTypes: ServiceTypeCount;
  }>({
    last30Days: 0,
    lastService: '',
    serviceTypes: {}
  });
  const [recentAttendances, setRecentAttendances] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAttendance, setLoadingAttendance] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, setIsDeleting] = useState(false);

  const [financialStats, setFinancialStats] = useState({
    totalTithes: 0,
    titheCount: 0,
    totalOfferings: 0,
    offeringCount: 0
  });
  const [loadingFinancials, setLoadingFinancials] = useState(true);
  const [recentFinances, setRecentFinances] = useState<Tithe[]>([]);

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

    const fetchAttendanceData = async () => {
      if (!params.id) return;
      try {
        setLoadingAttendance(true);
        // Get last 30 days attendance
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const response = await attendanceApi.getAttendances({
          memberId: params.id,
          startDate: thirtyDaysAgo.toISOString(),
          limit: 100
        });

        const attendanceData = Array.isArray(response?.data) ? response.data :
          (Array.isArray(response) ? response : []);

        const last30Days = attendanceData.length;
        const lastAttendance = attendanceData[0];

        const serviceTypes = attendanceData.reduce<ServiceTypeCount>((acc, record) => {
          if (!record?.serviceType) return acc;
          const serviceType = String(record.serviceType);
          const currentCount = acc[serviceType] || 0;
          return {
            ...acc,
            [serviceType]: currentCount + 1
          };
        }, {});

        setAttendanceStats({
          last30Days,
          lastService: lastAttendance ? formatDate(lastAttendance.date) : 'No recent attendance',
          serviceTypes
        });

        // Set recent attendances for activity feed
        setRecentAttendances(attendanceData.slice(0, 5));

      } catch (err) {
        console.error('Error fetching attendance data:', err);
      } finally {
        setLoadingAttendance(false);
      }
    };

    const fetchFinancialData = async () => {
      if (!params.id) return;
      try {
        setLoadingFinancials(true);
        const tithes = await tithesApi.getTithes({ memberId: params.id });

        const totalTithes = (tithes || [])
          .filter(t => t.paymentType === 'TITHE')
          .reduce((s, t) => s + (t.amount || 0), 0);

        const titheCount = (tithes || []).filter(t => t.paymentType === 'TITHE').length;

        const totalOfferings = (tithes || [])
          .filter(t => t.paymentType === 'OFFERING')
          .reduce((s, t) => s + (t.amount || 0), 0);

        const offeringCount = (tithes || []).filter(t => t.paymentType === 'OFFERING').length;

        setFinancialStats({ totalTithes, titheCount, totalOfferings, offeringCount });
        const recent = (tithes || [])
          .slice()
          .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())
          .slice(0, 5);
        setRecentFinances(recent);
      } catch (err) {
        console.error('Error fetching financial data (tithes):', err);
      } finally {
        setLoadingFinancials(false);
      }
    };

    if (params.id) {
      fetchMember();
      fetchAttendanceData();
      fetchFinancialData();
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

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header with Back Button and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => router.push('/members')}
          className="w-fit"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Members
        </Button>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => router.push(`/members/${member.id}/edit`)}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" /> Edit Profile
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-red-500 hover:text-red-600 hover:bg-red-50 flex items-center gap-2" 
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" /> Delete
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column - Profile Card */}
        <div className="lg:w-1/3 space-y-6">
          <Card className="overflow-hidden">
            {/* Profile Header with Gradient */}
            <div className="h-2 bg-gradient-to-r "></div>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="-mt-14 mb-4">
                  <Avatar className="h-24 w-24 border-4 border-background">
                    <AvatarImage
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(member.firstName + ' ' + member.lastName)}&background=4f46e5&color=fff`}
                      alt={`${member.firstName} ${member.lastName}`}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-primary/10 text-primary text-2xl font-semibold">
                      {getInitials(member.firstName, member.lastName)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="w-full">
                  <h1 className="text-2xl font-bold tracking-tight">{member.firstName} {member.lastName}</h1>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mt-2">
                    <Badge 
                      variant={member.membershipStatus === 'ACTIVE' ? 'default' : 'secondary'}
                      className="w-fit"
                    >
                      {MembershipStatusOptions[member.membershipStatus as keyof typeof MembershipStatusOptions] || member.membershipStatus}
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      Member since {formatDate(member.joinDate)}
                    </p>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="space-y-5">
                {member.email && (
                  <div className="flex items-start gap-3 group">
                    <div className="p-2 rounded-lg bg-primary/5 group-hover:bg-primary/10 transition-colors">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Email</p>
                      <a 
                        href={`mailto:${member.email}`} 
                        className="text-foreground hover:text-primary hover:underline transition-colors"
                      >
                        {member.email}
                      </a>
                    </div>
                  </div>
                )}
                
                {member.phone && (
                  <div className="flex items-start gap-3 group">
                    <div className="p-2 rounded-lg bg-primary/5 group-hover:bg-primary/10 transition-colors">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Phone</p>
                      <a 
                        href={`tel:${member.phone}`}
                        className="text-foreground hover:text-primary hover:underline transition-colors"
                      >
                        {member.phone}
                      </a>
                    </div>
                  </div>
                )}
                
                {member.dateOfBirth && (
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/5">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                      <p className="text-foreground">{formatDate(member.dateOfBirth)}</p>
                    </div>
                  </div>
                )}
                
                {(member.address || member.city || member.state || member.country) && (
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/5">
                      <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Address</p>
                      <address className="not-italic text-foreground">
                        {[member.address, member.city, member.state, member.postalCode, member.country]
                          .filter(Boolean)
                          .map((line, i, arr) => (
                            <span key={i}>
                              {line}
                              {i < arr.length - 1 && <br />}
                            </span>
                          ))}
                      </address>
                    </div>
                  </div>
                )}
                
                {(member.gender || member.maritalStatus) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                    {member.gender && (
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/5">
                          <div className="h-5 w-5 flex items-center justify-center">
                            <PersonStandingIcon className="h-5 w-5 text-primary" />
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Gender</p>
                          <p className="text-foreground">{GenderOptions[member.gender as keyof typeof GenderOptions] || member.gender}</p>
                        </div>
                      </div>
                    )}
                    
                    {member.maritalStatus && (
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/5">
                          <div className="h-5 w-5 flex items-center justify-center">
                            <HeartHandshake className="text-primary" />
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Marital Status</p>
                          <p className="text-foreground">
                            {MaritalStatusOptions[member.maritalStatus as keyof typeof MaritalStatusOptions] || member.maritalStatus}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Additional Information */}
        <div className="lg:w-2/3 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Attendance (30d)
                  </CardTitle>
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <Calendar className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loadingAttendance ? (
                  <div className="h-8 flex items-center">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-bold">{attendanceStats.last30Days}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {attendanceStats.last30Days > 0 ? 'Recent activity tracked' : 'No recent attendance'}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Last Attended
                  </CardTitle>
                  <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500 dark:text-amber-400">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                    </svg>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loadingAttendance ? (
                  <div className="h-8 flex items-center">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-bold">
                      {attendanceStats.lastService || 'N/A'}
                    </div>
                    {recentAttendances[0]?.serviceType && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {ServiceType[recentAttendances[0].serviceType]?.replace('_', ' ')}
                      </p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Contributions
                  </CardTitle>
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                    <FileChartColumnIncreasing className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loadingFinancials ? (
                  <div className="h-8 flex items-center">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-bold">
                      ₵{(financialStats.totalTithes + financialStats.totalOfferings).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      <span className="mr-3">Tithes: ₵{financialStats.totalTithes.toLocaleString(undefined, { minimumFractionDigits: 2 })} ({financialStats.titheCount})</span>
                      <span>Offerings: ₵{financialStats.totalOfferings.toLocaleString(undefined, { minimumFractionDigits: 2 })} ({financialStats.offeringCount})</span>
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Family Members */}
          {member.familyMembers && member.familyMembers.length > 0 && (
            <Card className="overflow-hidden">
              <CardHeader className="bg-muted/20 border-b">
                <CardTitle className="text-lg">Family Members</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {member.familyMembers.map((familyMember) => (
                    <div 
                      key={familyMember.id} 
                      className="flex items-center justify-between p-4 hover:bg-muted/10 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-medium text-primary">
                            {familyMember.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{familyMember.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {familyMember.relationship}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {member.notes && (
            <Card className="border-l-4 border-l-primary">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <path d="M12 20h9"></path>
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                  </svg>
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <p className="text-foreground whitespace-pre-line">{member.notes}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Activities */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-muted/20 border-b">
              <CardTitle className="text-lg">Recent Activities</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loadingAttendance ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : recentAttendances.length > 0 ? (
                <div className="p-4">
                  <h4 className="text-sm font-medium text-muted-foreground mb-4">Recent Attendance</h4>
                  <ActivityTimeline 
                    activities={recentAttendances.slice(0, 3).map(attendance => ({
                      id: attendance.id,
                      type: ActivityType.ATTENDANCE,
                      title: `Attended ${ServiceType[attendance.serviceType]?.replace('_', ' ') || 'Service'}`,
                      date: attendance.date,
                      description: attendance.notes || '',
                      icon: <NotebookPen className="h-4 w-4 text-primary" />,
                      iconBackground: 'bg-primary/10',
                      meta: `Recorded by ${attendance.takenBy}`
                    }))} 
                  />
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="mx-auto h-16 w-16 text-muted-foreground mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <line x1="23" y1="11" x2="17" y2="11"></line>
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-1">No recent activities</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Attendance and other activities will appear here once recorded.
                  </p>
                </div>
              )}
            </CardContent>
            
            {/* Other Activities Section */}
            <div className="border-t">
              <div className="p-4 bg-muted/10">
                <h4 className="text-sm font-medium text-muted-foreground mb-3">Other Activities</h4>
                <ActivityTimeline 
                  activities={
                    recentFinances && recentFinances.length > 0
                      ? recentFinances.map(f => ({
                          id: f.id,
                          type: f.paymentType === 'TITHE' ? ActivityType.TITHE : ActivityType.OFFERING,
                          title: `${PaymentTypeOptions[f.paymentType as keyof typeof PaymentTypeOptions] || f.paymentType} — $${f.amount.toFixed(2)}`,
                          date: f.paymentDate,
                          description: f.notes || f.reference || '',
                          icon: <NotebookPen className="h-4 w-4 text-primary" />,
                          iconBackground: 'bg-primary/10',
                          meta: `Recorded by ${f.recordedBy}`
                        }))
                      : [
                          {
                            id: 'note-1',
                            type: ActivityType.NOTE,
                            title: 'Note added',
                            date: '2023-05-10T14:15:00Z',
                            description: 'Member requested prayer for family',
                            icon: <NotebookPen className="h-4 w-4 text-primary" />,
                            iconBackground: 'bg-primary/10',
                            meta: 'Recorded by John Doe'
                          },
                          {
                            id: 'update-1',
                            type: ActivityType.UPDATE,
                            title: 'Profile updated',
                            date: '2023-05-01T09:45:00Z',
                            description: 'Updated contact information',
                            icon: <NotebookPen className="h-4 w-4 text-primary" />,
                            iconBackground: 'bg-primary/10',
                            meta: 'Recorded by John Doe'
                          }
                        ]
                  }
                />
              </div>
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
}