// Import the API client directly from the source to avoid circular dependencies
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Create a new axios instance specifically for attendance API calls
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 10000, // 10 seconds
});
import {
  Attendance,
  CreateAttendanceDto,
  UpdateAttendanceDto,
  PaginatedAttendanceResponse,
  FindAllAttendanceParams,
  AttendanceStats,
  MarkAttendanceResponse
} from './types';

/**
 * Attendance API client
 */
export const attendanceApi = {
  /**
   * Mark attendance for a member or visitor
   * @param attendanceData Attendance data to mark
   */
  async markAttendance(attendanceData: CreateAttendanceDto): Promise<MarkAttendanceResponse> {
    const response = await api.post<MarkAttendanceResponse>('/attendance', attendanceData);
    return response.data;
  },

  /**
   * Get all attendance records with optional filtering
   * @param params Query parameters for filtering and pagination
   */
  async getAttendances(params?: FindAllAttendanceParams): Promise<PaginatedAttendanceResponse> {
    const response = await api.get<PaginatedAttendanceResponse>('/attendance', { params });
    return response.data;
  },

  /**
   * Get a single attendance record by ID
   * @param id Attendance record ID
   */
  async getAttendance(id: string): Promise<Attendance> {
    const response = await api.get<Attendance>(`/attendance/${id}`);
    return response.data;
  },

  /**
   * Update an attendance record
   * @param id Attendance record ID
   * @param updateData Updated attendance data
   */
  async updateAttendance(id: string, updateData: UpdateAttendanceDto): Promise<Attendance> {
    const response = await api.patch<Attendance>(`/attendance/${id}`, updateData);
    return response.data;
  },

  /**
   * Delete an attendance record
   * @param id Attendance record ID to delete
   */
  async deleteAttendance(id: string): Promise<void> {
    await api.delete(`/attendance/${id}`);
  },

  /**
   * Get attendance statistics for a date range
   * @param startDate Start date for statistics
   * @param endDate End date for statistics
   */
  async getAttendanceStats(startDate: string, endDate: string): Promise<AttendanceStats> {
    const response = await api.get<AttendanceStats>('/attendance/stats', {
      params: { startDate, endDate }
    });
    return response.data;
  },

  /**
   * Mark multiple attendances at once
   * @param attendances Array of attendance records to create
   */
  async markMultipleAttendances(
    attendances: CreateAttendanceDto[]
  ): Promise<MarkAttendanceResponse[]> {
    const response = await api.post<MarkAttendanceResponse[]>('/attendance/batch', { attendances });
    return response.data;
  }
};

export default attendanceApi;