'use client';

import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Mail, Phone, Calendar, MapPin, Edit, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

type MemberStatus = 'active' | 'inactive' | 'pending';

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
    notes: 'Regular attendee and volunteer for Sunday school.'
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

          {/* Additional sections can be added here */}
          <Card>
            <CardHeader>
              <CardTitle>Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Member activity and statistics will appear here.</p>
              {/* Add activity timeline or other relevant information */}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}