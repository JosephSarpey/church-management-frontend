'use client';

import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Mail, Phone, Calendar, MapPin, Edit, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ActivityTimeline } from '@/components/ActivityTimeline';

type MemberStatus = 'active' | 'inactive' | 'pending';

type ActivityType = 'attendance' | 'tithe' | 'offering' | 'note' | 'other';

export interface Activity {
  id: string;
  type: ActivityType;
  date: string;
  title: string;
  description: string;
  present?: boolean;
  amount?: number;
}

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  joinDate: string;
  membershipStatus: MemberStatus;
  gender: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  familyMembers?: Array<{
    id: string;
    name: string;
    relationship: string;
  }>;
  notes?: string;
  activities?: Activity[];
}

export default function MemberProfilePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  
  // Mock data - Replace with actual API call
  const member: Member = {
    id: params.id,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '(123) 456-7890',
    address: '123 Church Street, Anytown, ST 12345',
    dateOfBirth: '1985-06-15',
    joinDate: '2023-01-15',
    membershipStatus: 'active',
    gender: 'male',
    familyMembers: [
      { id: '2', name: 'Jane Doe', relationship: 'Spouse' },
      { id: '3', name: 'Mike Doe', relationship: 'Child' },
    ],
    notes: 'Regular attendee and volunteer for Sunday school.',
    activities: [
      {
        id: '1',
        type: 'attendance',
        date: new Date().toISOString(),
        title: 'Sunday Service',
        present: true,
        description: 'Morning service at Main Sanctuary'
      },
      {
        id: '2',
        type: 'tithe',
        date: new Date().toISOString(),
        title: 'Monthly Tithe',
        amount: 200,
        description: 'September 2023 tithe'
      },
      {
        id: '3',
        type: 'attendance',
        date: new Date(Date.now() - 86400000).toISOString(),
        title: 'Bible Study',
        present: true,
        description: 'Wednesday night Bible study group'
      },
      {
        id: '4',
        type: 'offering',
        date: new Date(Date.now() - 2 * 86400000).toISOString(),
        title: 'Building Fund',
        amount: 50,
        description: 'Donation to church building fund'
      },
      {
        id: '5',
        type: 'attendance',
        date: new Date(Date.now() - 7 * 86400000).toISOString(),
        title: 'Sunday Service',
        present: false,
        description: 'Absent - Out of town'
      },
      {
        id: '6',
        type: 'tithe',
        date: new Date(Date.now() - 30 * 86400000).toISOString(),
        title: 'Monthly Tithe',
        amount: 180,
        description: 'August 2023 tithe'
      },
    ]
  };

  const getStatusBadge = (status: MemberStatus) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'inactive':
        return <Badge variant="outline">Inactive</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Calculate attendance percentage
  const attendanceStats = (() => {
    const allAttendance = member.activities?.filter(a => a.type === 'attendance') || [];
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
    const tithes = member.activities?.filter(a => a.type === 'tithe') || [];
    const offerings = member.activities?.filter(a => a.type === 'offering') || [];
    
    return {
      totalTithes: tithes.reduce((sum, a) => sum + (a.amount || 0), 0),
      titheCount: tithes.length,
      totalOfferings: offerings.reduce((sum, a) => sum + (a.amount || 0), 0),
      offeringCount: offerings.length
    };
  })();

  return (
    <div className="container mx-auto py-8 space-y-6">
      <Button 
        variant="ghost" 
        onClick={() => router.back()}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Members
      </Button>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Column - Profile Card */}
        <div className="md:w-1/3 space-y-4">
          <div className="flex flex-col gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={`/avatars/${member.id}.jpg`} />
                    <AvatarFallback>
                      {member.firstName[0]}{member.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-center">
                    <h2 className="text-2xl font-bold">
                      {member.firstName} {member.lastName}
                    </h2>
                    <p className="text-muted-foreground">Member since {formatDate(member.joinDate)}</p>
                    <div className="mt-2">{getStatusBadge(member.membershipStatus)}</div>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="space-y-4">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                    <a href={`mailto:${member.email}`} className="hover:underline">
                      {member.email}
                    </a>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                    <a href={`tel:${member.phone}"`} className="hover:underline">
                      {member.phone}
                    </a>
                  </div>
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <span>{member.address}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Birthday: {formatDate(member.dateOfBirth)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="w-full">
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
              <Button variant="outline" className="w-full text-red-500 hover:text-red-600 hover:bg-red-50">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
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
                      <Button variant="ghost" size="sm">View</Button>
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
              {member.activities?.length ? (
                <ActivityTimeline activities={member.activities} />
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