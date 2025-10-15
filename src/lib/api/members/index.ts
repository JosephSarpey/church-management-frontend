import { api } from '..';
import {
  PaginatedMembers,
  CreateMemberDto,
  UpdateMemberDto,
  MemberResponse
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

api.defaults.baseURL = API_BASE_URL;
api.defaults.headers.common['Content-Type'] = 'application/json';
api.defaults.withCredentials = true;

// Add a request interceptor to include auth token if available
api.interceptors.request.use(
  (config) => {
    // You can add auth token here if needed
    // const token = getTokenFromStorage();
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

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
  async getMember(id: string): Promise<MemberResponse> {
    const response = await api.get<MemberResponse>(`/members/${id}`);
    return response.data;
  },

  /**
   * Create a new member
   * @param memberData Member data
   */
  async createMember(memberData: CreateMemberDto): Promise<MemberResponse> {
    const response = await api.post<MemberResponse>('/members', memberData);
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
): Promise<MemberResponse> {
  const response = await api.put<MemberResponse>(`/members/${id}`, memberData);
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
    const response = await api.get<PaginatedMembers>('/members/search', {
      params: { q: query, skip, take },
    });
    return response.data;
  },
};

export default api;