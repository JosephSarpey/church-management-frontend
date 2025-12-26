/* eslint-disable @typescript-eslint/no-unused-vars */
import { api } from '..';
import { Event, CreateEventDto, UpdateEventDto, EventsList, EventsFilter } from './types';

export const eventsApi = {
  // POST /events
  createEvent: async (data: CreateEventDto, files?: File[]): Promise<Event> => {
    const formData = new FormData();
    
    // Append each field from data to formData
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        // Handle nested objects by stringifying them
        const formValue = typeof value === 'object' ? JSON.stringify(value) : value;
        formData.append(key, formValue as string | Blob);
      }
    });

    // Append each file with the correct field name
    if (files?.length) {
      files.forEach((file) => {
        formData.append('files', file);
      });
    }

    const response = await api.post<Event>('/events', formData, {
      headers: { 
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // GET /events
  getEvents: async (params?: EventsFilter): Promise<EventsList> => {
    const response = await api.get<EventsList>('/events', { params });
    return response.data;
  },

  // GET /events/upcoming
  getUpcomingEvents: async (): Promise<Event[]> => {
    const response = await api.get<Event[]>('/events/upcoming');
    return response.data;
  },

  // GET /events/:id
  getEvent: async (id: string): Promise<Event> => {
    const response = await api.get<Event>(`/events/${id}`);
    return response.data;
  },

  // PATCH /events/:id
  updateEvent: async (id: string, data: UpdateEventDto | FormData, files?: File[]): Promise<Event> => {
    let response;
    
    if (data instanceof FormData) {
      // Handle FormData (for file uploads)
      response = await api.patch<Event>(`/events/${id}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } else {
      // Handle regular JSON data
      response = await api.patch<Event>(`/events/${id}`, data);
    }
    
    return response.data;
  },

  // DELETE /events/:id
  deleteEvent: async (id: string): Promise<void> => {
    await api.delete(`/events/${id}`);
  },
};

export default eventsApi;