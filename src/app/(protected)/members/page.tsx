'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  // Handle search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // Reset to first page on new search
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchMembers = useCallback(async () => {
    try {
      setIsLoading(true);
      const skip = (currentPage - 1) * pageSize;
      const response = await membersApi.getMembers(skip, pageSize, debouncedSearch);
      
      if (!response || !response.data) {
        console.error('Invalid API response format:', response);
        return;
      }
      
      const membersData: Member[] = response.data.map((member) => ({
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
      
      setMembers(membersData);
      setTotalCount(response.total || 0);
    } catch (error) {
      console.error('Error fetching members:', error);
      toast.error('Failed to load members. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, debouncedSearch]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const noMembersFound = !isLoading && members.length === 0;

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
            fetchMembers(); // Refresh current page
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
      duration: 10000 
    });
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Church Members</h1>
          <p className="text-muted-foreground">
            Manage and view all church members
          </p>
        </div>
        <Button onClick={() => router.push('/members/add')} className="bg-amber-500 hover:bg-amber-600">
          <Plus className="mr-2 h-4 w-4" />
          Add Member
        </Button>
      </div>

      <div className="flex flex-col gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by name, email, phone or member number..."
            className="pl-8 w-full md:w-1/2"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-lg font-medium">Loading members...</p>
          </div>
        </div>
      ) : noMembersFound ? (
        <div className="text-center py-12 border rounded-lg bg-card">
          <p className="text-muted-foreground text-lg">
            {searchTerm ? `No members found matching "${searchTerm}".` : 'No members found.'}
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
        <div className="space-y-4">
          <MembersTable 
            members={members} 
            onViewProfile={handleViewProfile}
            onEdit={handleEditMember}
            onDelete={handleDeleteMember}
          />
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 px-2">
              <div className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} members
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                    .map((p, i, arr) => (
                      <React.Fragment key={p}>
                        {i > 0 && arr[i-1] !== p - 1 && <span className="px-1">...</span>}
                        <Button
                          variant={currentPage === p ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(p)}
                          className={currentPage === p ? "bg-amber-500 hover:bg-amber-600" : ""}
                        >
                          {p}
                        </Button>
                      </React.Fragment>
                    ))
                  }
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
