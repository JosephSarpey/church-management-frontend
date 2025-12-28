import { membersApi } from '../members';
import { tithesApi } from '../tithes';
import { eventsApi } from '../events';
import { RecentActivity, ActivityType } from './types';
import { Member } from '../members/types';
import { Tithe } from '../tithes/types';
import { Event } from '../events/types';

/**
 * Activity API client
 * Aggregates recent activities from multiple sources
 */
export const activityApi = {
  /**
   * Get recent activities across members, tithes, and events
   * @param limit Maximum number of activities to return
   */
  async getRecentActivities(limit = 5): Promise<RecentActivity[]> {
    try {
      // Fetch data from all sources in parallel
      const [membersResponse, tithesResponse, eventsResponse] = await Promise.allSettled([
        membersApi.getMembers(0, 5),
        tithesApi.getTithes(),
        eventsApi.getEvents({ take: 5 }),
      ]);

      const activities: RecentActivity[] = [];

      // Process members
      if (membersResponse.status === 'fulfilled') {
        // The backend returns an array directly, not a paginated response
        const membersData = Array.isArray(membersResponse.value) 
          ? membersResponse.value 
          : (membersResponse.value?.data || []);
        
        const recentMembers = membersData
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5);

        recentMembers.forEach((member: Member) => {
          activities.push({
            id: `member-${member.id}`,
            type: 'MEMBER_JOINED' as ActivityType,
            title: 'New member registered',
            description: `${member.firstName} ${member.lastName} joined the church community`,
            timestamp: new Date(member.createdAt),
            iconType: 'user',
          });
        });
      } else if (membersResponse.status === 'rejected') {
        console.error('Failed to fetch members:', membersResponse.reason);
      }

      // Process tithes
      if (tithesResponse.status === 'fulfilled' && tithesResponse.value) {
        // The tithes API now returns a paginated response with a .data property
        const tithesData = (tithesResponse.value as { data: Tithe[] }).data || tithesResponse.value;
        
        const recentTithes = (Array.isArray(tithesData) ? tithesData : [])
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5);

        recentTithes.forEach((tithe: Tithe) => {
          const typeLabel = tithe.paymentType === 'TITHE' ? 'Tithe' : 
                           tithe.paymentType === 'OFFERING' ? 'Offering' : 
                           tithe.paymentType === 'DONATION' ? 'Donation' : 'Payment';
          
          activities.push({
            id: `tithe-${tithe.id}`,
            type: 'TITHE_RECEIVED' as ActivityType,
            title: `${typeLabel} received`,
            description: `₵${tithe.amount.toFixed(2)}${tithe.memberName ? ` from ${tithe.memberName}` : ''}`,
            timestamp: new Date(tithe.createdAt),
            iconType: 'cedi',
          });
        });
      } else if (tithesResponse.status === 'rejected') {
        console.error('Failed to fetch tithes:', tithesResponse.reason);
      }

      // Process events
      if (eventsResponse.status === 'fulfilled' && eventsResponse.value.data) {
        const recentEvents = eventsResponse.value.data
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5);

        recentEvents.forEach((event: Event) => {
          activities.push({
            id: `event-${event.id}`,
            type: 'EVENT_CREATED' as ActivityType,
            title: 'Event created',
            description: `${event.title} - ${new Date(event.startTime).toLocaleDateString()}`,
            timestamp: new Date(event.createdAt),
            iconType: 'calendar',
          });
        });
      } else if (eventsResponse.status === 'rejected') {
        console.error('Failed to fetch events:', eventsResponse.reason);
      }

      // Sort all activities by timestamp (most recent first) and limit
      return activities
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      throw error;
    }
  },
};

export default activityApi;
