import { api } from '..';
import {
  Pastor,
  CreatePastorDto,
  UpdatePastorDto,
} from './types';

/**
 * Pastors API client
 * Provides methods for interacting with the pastors API endpoints
 */
export const pastorsApi = {
  /**
   * Get all pastors
   */
  async getPastors(): Promise<Pastor[]> {
    const response = await api.get<Pastor[]>('/pastors');
    return response.data;
  },

  /**
   * Get a single pastor by ID
   * @param id Pastor ID
   */
  async getPastor(id: string): Promise<Pastor> {
    const response = await api.get<Pastor>(`/pastors/${id}`);
    return response.data;
  },

  /**
   * Create a new pastor
   * @param pastorData Pastor data
   */
  async createPastor(pastorData: CreatePastorDto): Promise<Pastor> {
    const response = await api.post<Pastor>('/pastors', pastorData);
    return response.data;
  },

  /**
   * Update an existing pastor
   * @param id Pastor ID
   * @param pastorData Partial pastor data with updates
   */
  async updatePastor(
    id: string, 
    pastorData: UpdatePastorDto
  ): Promise<Pastor> {
    const response = await api.patch<Pastor>(`/pastors/${id}`, pastorData);
    return response.data;
  },

  /**
   * Delete a pastor
   * @param id Pastor ID to delete
   */
  async deletePastor(id: string): Promise<void> {
    await api.delete(`/pastors/${id}`);
  }
};

export default pastorsApi;