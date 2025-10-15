'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, Plus, Calendar, Clock, MapPin } from 'lucide-react';
import { format } from 'date-fns';

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  imageUrl?: string;
  attendees: number;
  maxAttendees: number;
}

export default function EventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Mock data - Replace with actual API call
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // TODO: Replace with actual API call
        const mockEvents: Event[] = [
          {
            id: '1',
            title: 'Sunday Service',
            description: 'Weekly Sunday worship service with communion',
            date: '2023-10-15',
            time: '10:00 AM',
            location: 'Main Sanctuary',
            attendees: 120,
            maxAttendees: 200,
          },
          {
            id: '2',
            title: 'Bible Study',
            description: 'Mid-week Bible study and prayer meeting',
            date: '2023-10-18',
            time: '7:00 PM',
            location: 'Fellowship Hall',
            attendees: 45,
            maxAttendees: 60,
          },
          {
            id: '3',
            title: 'Youth Group',
            description: 'Weekly youth group meeting',
            date: '2023-10-20',
            time: '6:30 PM',
            location: 'Youth Center',
            attendees: 25,
            maxAttendees: 40,
          },
        ];
        
        setEvents(mockEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateEvent = () => {
    router.push('/events/create');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Events</h1>
          <p className="text-gray-600 mt-2">View and manage upcoming church events</p>
        </div>
        <Button onClick={handleCreateEvent} className="mt-4 md:mt-0">
          <Plus className="mr-2 h-4 w-4" />
          Create Event
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border mb-8">
        <div className="p-4 border-b">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search events..."
              className="pl-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="divide-y">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <div key={event.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div className="mb-4 md:mb-0">
                    <h3 className="text-lg font-medium text-gray-900">{event.title}</h3>
                    <p className="text-gray-600 mt-1">{event.description}</p>
                    
                    <div className="mt-3 flex flex-wrap gap-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1.5" />
                        {format(new Date(event.date), 'MMMM d, yyyy')}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1.5" />
                        {event.time}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="h-4 w-4 mr-1.5" />
                        {event.location}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end">
                    <div className="text-sm text-gray-500 mb-2">
                      {event.attendees}/{event.maxAttendees} attendees
                    </div>
                    <Button variant="outline" size="sm" onClick={() => router.push(`/events/${event.id}`)}>
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              {searchTerm ? 'No events match your search.' : 'No upcoming events found.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}