// Use the main API client from the root
import { api } from '../index';
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
    const response = await api.post<MarkAttendanceResponse>('/attendance', attendanceData, {
      withCredentials: true
    });
    return response.data;
  },

  /**
   * Get all attendance records with optional filtering
   * @param params Query parameters for filtering and pagination
   */
  async getAttendances(params?: FindAllAttendanceParams): Promise<PaginatedAttendanceResponse> {
    const response = await api.get<PaginatedAttendanceResponse>('/attendance', { 
      params,
      withCredentials: true 
    });
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