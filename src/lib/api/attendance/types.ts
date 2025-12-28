export enum ServiceType {
  SUNDAY_SERVICE = 'SUNDAY_SERVICE',
  BIBLE_STUDY = 'BIBLE_STUDY',
  PRAYER_MEETING = 'PRAYER_MEETING',
  YOUTH_SERVICE = 'YOUTH_SERVICE',
  CHILDREN_SERVICE = 'CHILDREN_SERVICE',
  SPECIAL_EVENT = 'SPECIAL_EVENT',
  OTHER = 'OTHER'
}

export interface Member {
  id: string;
  memberNumber: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  membershipStatus?: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  joinDate?: string;
  baptized?: boolean;
  baptismDate?: string;
  occupation?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
}

export interface Attendance {
  takenBy: string;
  id: string;
  memberId?: string;
  member?: Member;
  serviceType: ServiceType;
  date: string;
  notes?: string;
  isVisitor: boolean;
  visitorName?: string;
  contact?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAttendanceDto {
  memberId?: string;
  serviceType: ServiceType;
  date?: string | Date;
  notes?: string;
  isVisitor?: boolean;
  visitorName?: string;
  contact?: string;
  takenBy?: string;
  address?: string;
}

export type UpdateAttendanceDto = Partial<CreateAttendanceDto>

export interface FindAllAttendanceParams {
  startDate?: string;
  endDate?: string;
  memberId?: string;
  serviceType?: ServiceType;
  isVisitor?: boolean;
  page?: number;
  limit?: number;
}

export interface PaginatedAttendanceResponse {
  data: Attendance[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    stats: {
      members: number;
      visitors: number;
      byServiceType: Record<string, number>;
    };
  };
}

export interface AttendanceStats {
  totalAttendance: number;
  serviceTypeBreakdown: Record<ServiceType, number>;
  dateRange: {
    start: string;
    end: string;
  };
  averageAttendance: number;
  memberAttendance: Array<{
    memberId: string;
    firstName: string;
    lastName: string;
    attendanceCount: number;
  }>;
  visitorStats: {
    totalVisitors: number;
    visitorsByService: Record<ServiceType, number>;
  };
}

export interface MarkAttendanceResponse {
  success: boolean;
  data: Attendance;
  message?: string;
}

export interface Visitor {
  name: string;
  memberNumber: string;
  status: 'present' | 'absent' | 'excused';
  isVisitor: boolean;
  contact?: string;
  address?: string;
}

export interface AttendanceSummary {
  date: string;
  serviceType: ServiceType;
  totalPresent: number;
  totalVisitors: number;
  membersPresent: number;
}