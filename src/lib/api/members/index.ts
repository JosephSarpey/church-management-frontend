import { api } from '..';
import {
  PaginatedMembers,
  CreateMemberDto,
  UpdateMemberDto,
  MemberCountResponse,
  Member
} from './types';


/**
 * Members API client
 * Provides methods for interacting with the members API endpoints
 */
export const membersApi = { 
  /**
   * Get paginated list of members
   * @param skip Number of records to skip (for pagination)
   * @param take Number of records to take (page size)
   */
  async getMembers(skip = 0, take = 50): Promise<PaginatedMembers> {
    const response = await api.get<PaginatedMembers>('/members', {
      params: { skip, take },
    });
    return response.data;
  },

  /**
   * Get a single member by ID
   * @param id Member ID
   */
  async getMember(id: string): Promise<Member> {
    const response = await api.get<Member>(`/members/${id}`);
    return response.data;
  },

  /**
   * Create a new member
   * @param memberData Member data
   */
  async createMember(memberData: CreateMemberDto): Promise<MemberCountResponse> {
    const response = await api.post<MemberCountResponse>('/members', memberData);
    return response.data;
  },

  /**
   * Update an existing member
   * @param id Member ID
   * @param memberData Partial member data with updates
   */
  async updateMember(
    id: string,
    memberData: UpdateMemberDto
  ): Promise<MemberCountResponse> {
    const response = await api.put<MemberCountResponse>(`/members/${id}`, memberData);
    return response.data;
  },

  /**
   * Delete a member
   * @param id Member ID to delete
   */
  async deleteMember(id: string): Promise<void> {
    await api.delete(`/members/${id}`);
  },

  /**
   * Search members by name or other fields
   * @param query Search query
   * @param skip Number of records to skip (for pagination)
   * @param take Number of records to take (page size)
   */
  async searchMembers(
    query: string,
    skip = 0,
    take = 50
  ): Promise<PaginatedMembers> {
    // Backend does not expose a dedicated /members/search endpoint.
    // Fall back to requesting the members list and filter client-side.
    const response = await api.get<Member[]>(`/members`, {
      params: { skip, take },
    });

    const all: Member[] = response.data || [];
    const q = (query || '').toLowerCase();
    const filtered = all.filter((m) => {
      const full = `${m.firstName || ''} ${m.lastName || ''}`.toLowerCase();
      return full.includes(q) || (m.email || '').toLowerCase().includes(q) || (m.phone || '').toLowerCase().includes(q) || (m.memberNumber || '').toLowerCase().includes(q);
    });

    return {
      data: filtered,
      total: filtered.length,
      skip,
      take,
    } as PaginatedMembers;
  },

  /**
   * Get total count of members and previous period count for comparison
   */
  async getTotalMembersCount(): Promise<MemberCountResponse> {
    const response = await api.get<MemberCountResponse>('/members/count');
    return response.data;
  },
};

export default membersApi;