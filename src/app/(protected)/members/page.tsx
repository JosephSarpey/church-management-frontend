'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button'; 
import { Input } from '@/components/ui/Input';
import { Search, Plus } from 'lucide-react';
import { MembersTable } from '@/components/tables/MembersTable';
import { membersApi } from '@/lib/api/members';
import { Member as ApiMember } from '@/lib/api/members/types';
import { toast } from 'sonner';

export type Member = Omit<ApiMember, 'createdAt' | 'updatedAt'> & {
  joinDate: string;
};

export default function MembersPage() {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setIsLoading(true);
        const response = await membersApi.getMembers(0, 50);
        
        
        if (!response || !Array.isArray(response)) {
          console.error('Invalid API response format:', response);
          return;
        }
        
        const membersData: Member[] = response.map((member) => ({
          id: member.id,
          memberNumber: member.memberNumber || '',
          firstName: member.firstName || '',
          lastName: member.lastName || '',
          email: member.email || '',
          phone: member.phone || '',
          dateOfBirth: member.dateOfBirth,
          gender: member.gender,
          maritalStatus: member.maritalStatus,
          address: member.address || '',
          city: member.city || '',
          state: member.state || '',
          country: member.country || '',
          postalCode: member.postalCode || '',
          joinDate: member.joinDate || new Date().toISOString().split('T')[0],
          baptized: member.baptized || false,
          baptismDate: member.baptismDate,
          occupation: member.occupation || '',
          emergencyContact: member.emergencyContact || '',
          emergencyPhone: member.emergencyPhone || '',
          notes: member.notes || '',
          membershipStatus: member.membershipStatus || 'ACTIVE',
        }));
        
        const sortedMembers = [...membersData].sort((a, b) => {
          const memberNumA = a.memberNumber || '0';
          const memberNumB = b.memberNumber || '0';
          
          const numA = parseInt(memberNumA, 10);
          const numB = parseInt(memberNumB, 10);
          
          if (!isNaN(numA) && !isNaN(numB)) {
            return numA - numB;
          }
          return memberNumA.localeCompare(memberNumB, undefined, { numeric: true });
        });
        
        setMembers(sortedMembers);
      } catch (error) {
        console.error('Error fetching members:', error);
        toast.error('Failed to load members. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMembers();
  }, []);

  const filteredMembers = members.filter(
    (member) =>
      (member.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.phone?.includes(searchTerm)) &&
      (member.firstName || member.lastName)
  ); 

  
  
  const noMembersFound = !isLoading && filteredMembers.length === 0;

  const handleViewProfile = (memberId: string) => {
    router.push(`/members/${memberId}`);
  };

  const handleEditMember = (memberId: string) => {
    router.push(`/members/${memberId}/edit`);
  };

  const handleDeleteMember = async (memberId: string) => {
    toast.warning('Are you sure you want to delete this member? This action cannot be undone.', {
      action: {
        label: 'Delete',
        onClick: async () => {
          try {
            await membersApi.deleteMember(memberId);
            setMembers(prevMembers => prevMembers.filter(member => member.id !== memberId));
            toast.success('Member deleted successfully');
          } catch (error) {
            console.error('Error deleting member:', error);
            toast.error('Failed to delete member. Please try again.');
          }
        },
      },
      cancel: {
        label: 'Cancel',
        onClick: () => {}
      },
      duration: 10000 // Show for 10 seconds to give user time to decide
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg font-medium">Loading members...</p>
        </div>
      </div>
    );
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

      {noMembersFound ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchTerm ? 'No members found matching your search.' : 'No members found.'}
          </p>
          {searchTerm && (
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => setSearchTerm('')}
            >
              Clear search
            </Button>
          )}
        </div>
      ) : (
        <MembersTable 
          members={filteredMembers} 
          onViewProfile={handleViewProfile}
          onEdit={handleEditMember}
          onDelete={handleDeleteMember}
        />
      )}
    </div>
  );
}