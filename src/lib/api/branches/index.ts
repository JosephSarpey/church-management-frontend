import { api } from '..';
import { Branch, CreateBranchDto, UpdateBranchDto } from './types';

export const branchesApi = {
  async getBranches(): Promise<Branch[]> {
    const response = await api.get<Branch[]>('/branches');
    return response.data;
  },

  async getBranch(id: string): Promise<Branch> {
    const response = await api.get<Branch>(`/branches/${id}`);
    return response.data;
  },

  async createBranch(branchData: CreateBranchDto): Promise<Branch> {
    const response = await api.post<Branch>('/branches', branchData);
    return response.data;
  },

  async updateBranch(id: string, branchData: UpdateBranchDto): Promise<Branch> {
    const response = await api.put<Branch>(`/branches/${id}`, branchData);
    return response.data;
  },

  async deleteBranch(id: string): Promise<void> {
    await api.delete(`/branches/${id}`);
  },
};

export default branchesApi;

