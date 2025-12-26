export type ServiceType = 'SUNDAY_SERVICE' | 'BIBLE_STUDY' | 'PRAYER_MEETING' | 'YOUTH_SERVICE' | 'SPECIAL_EVENT' | 'OTHER';

export interface Event {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  location?: string;
  type: ServiceType;
  isRecurring: boolean;
  recurringPattern?: string;
  groupId?: string;
  imageUrl: string;
  attendees?:number;
  maxAttendees?: number;
  registrationRequired?: boolean;
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED';
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventDto {
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  location?: string;
  type: ServiceType;
  isRecurring?: boolean;
  recurringPattern?: string;
  groupId?: string;
  imageUrl: string;
  attendees?: number;
  maxAttendees?: number;
  registrationRequired?: boolean;
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED';
}

export type UpdateEventDto = Partial<CreateEventDto>

export interface EventsList {
  data: Event[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface EventsFilter {
  skip?: number;
  take?: number;
  status?: 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED';
  type?: string;
}