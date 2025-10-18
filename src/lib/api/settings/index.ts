import axios from 'axios';
import { ChurchSettings, UpdateSettingsDto } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

axios.defaults.baseURL = API_BASE_URL;
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.withCredentials = true;

const settingsApiEndpoints = {
  async getSettings(): Promise<ChurchSettings> {
    const response = await axios.get<ChurchSettings>('/settings');
    return response.data;
  },

  async updateSettings(settings: UpdateSettingsDto): Promise<ChurchSettings> { 
    const response = await axios.post<ChurchSettings>('/settings', settings);
    return response.data;
  },
};

export default settingsApiEndpoints;