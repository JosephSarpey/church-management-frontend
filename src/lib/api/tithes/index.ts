import { api } from '..';
import {
  TithesList,
  CreateTitheDto,
  UpdateTitheDto,
  TitheResponse,
} from './types';

/**
 * Tithes API client
 * Mirrors backend endpoints under `/tithes`
 */
export const tithesApi = {
  async getTithes(filters?: {
    memberId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<TithesList> {
    const response = await api.get<TithesList>('/tithes', { params: filters });
    return response.data;
  },

  async getTithe(id: string): Promise<TitheResponse> {
    const response = await api.get<TitheResponse>(`/tithes/${id}`);
    return response.data;
  },

  async createTithe(dto: CreateTitheDto): Promise<TitheResponse> {
    const response = await api.post<TitheResponse>('/tithes', dto);
    return response.data;
  },

  async updateTithe(id: string, dto: UpdateTitheDto): Promise<TitheResponse> {
    const response = await api.put<TitheResponse>(`/tithes/${id}`, dto);
    return response.data;
  },

  async deleteTithe(id: string): Promise<void> {
    await api.delete(`/tithes/${id}`);
  },
};

export default tithesApi;
