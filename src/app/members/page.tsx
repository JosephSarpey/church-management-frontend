'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button'; 
import { Input } from '@/components/ui/Input';
import { Search, Plus } from 'lucide-react';
import { MembersTable } from '@/components/tables/MembersTable';

export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  membershipStatus: 'active' | 'inactive' | 'pending';
  joinDate: string;
}

export default function MembersPage() {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Mock data - Replace with actual API call
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        // TODO: Replace with actual API call
        const mockMembers: Member[] = [
          {
            id: '1',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            phone: '(123) 456-7890',
            membershipStatus: 'active',
            joinDate: '2023-01-15',
          },
          {
            id: '2',
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane.smith@example.com',
            phone: '(234) 567-8901',
            membershipStatus: 'active',
            joinDate: '2023-02-20',
          },
          // Add more mock data as needed
        ];
        
        setMembers(mockMembers);
      } catch (error) {
        console.error('Error fetching members:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMembers();
  }, []);

  const filteredMembers = members.filter(
    (member) =>
      member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewProfile = (memberId: string) => {
    router.push(`/members/${memberId}`);
  };

  const handleEditMember = (memberId: string) => {
    // TODO: Implement edit functionality
    console.log('Edit member:', memberId);
  };

  const handleDeleteMember = (memberId: string) => {
    // TODO: Implement delete functionality
    console.log('Delete member:', memberId);
  };

  if (isLoading) {
    return <div>Loading members...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Church Members</h1>
          <p className="text-muted-foreground">
            Manage and view all church members
          </p>
        </div>
        <Button onClick={() => router.push('/members/add')}>
          <Plus className="mr-2 h-4 w-4" />
          Add Member
        </Button>
      </div>

      <div className="flex flex-col gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search members..."
            className="pl-8 w-full md:w-1/3"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <MembersTable 
        members={filteredMembers} 
        onViewProfile={handleViewProfile}
        onEdit={handleEditMember}
        onDelete={handleDeleteMember}
      />
    </div>
  );
}