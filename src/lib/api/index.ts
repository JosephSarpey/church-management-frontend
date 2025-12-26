import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 10000, // 10 seconds
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Will add auth token here if needed
    // const token = getTokenFromStorage();
    // if (token) {
    //   config.headers = config.headers || {};
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    // Handle common error responses here
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API Error Response:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      });
    } else if (error.request) {
      console.error('API Request Error:', error.request);
      
    } else {
      console.error('API Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export { api };

export { membersApi } from './members';
export { attendanceApi } from './attendance';
export { pastorsApi } from './pastors';
export { branchesApi } from './branches';
export { tithesApi } from './tithes';
export { eventsApi } from './events';
export { notificationsApi } from './notifications';
export { activityApi } from './activity';
// export * from './events';


export default api;