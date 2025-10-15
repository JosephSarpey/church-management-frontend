'use client';

import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Calendar, Clock, MapPin, Users } from 'lucide-react';
import { format } from 'date-fns';
import { Event } from '../page';
import { useEffect, useState } from 'react';

export default function EventDetailsPage() {
  const router = useRouter();
  const { id } = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        // TODO: Replace with actual API call to fetch event by ID
        const mockEvents: Event[] = [
          {
            id: '1',
            title: 'Sunday Service',
            description: 'Weekly Sunday worship service with communion. All are welcome to join us for a time of worship, prayer, and teaching from God\'s Word. This week we\'ll be continuing our series on the Book of Acts.',
            date: '2023-10-15',
            time: '10:00 AM',
            location: 'Main Sanctuary',
            attendees: 120,
            maxAttendees: 200,
          },
          // ... other mock events
        ];
        
        const foundEvent = mockEvents.find(e => e.id === id) || null;
        setEvent(foundEvent);
      } catch (error) {
        console.error('Error fetching event:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Event Not Found</h1>
        <p className="text-gray-600 mb-6">The requested event could not be found.</p>
        <Button onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Events
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button 
        variant="ghost" 
        onClick={() => router.back()}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Events
      </Button>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{event.title}</h1>
              
              <div className="flex flex-wrap gap-4 mt-6 mb-8">
                <div className="flex items-center text-gray-700">
                  <Calendar className="h-5 w-5 mr-2 text-primary" />
                  <span>{format(new Date(event.date), 'EEEE, MMMM d, yyyy')}</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <Clock className="h-5 w-5 mr-2 text-primary" />
                  <span>{event.time}</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <MapPin className="h-5 w-5 mr-2 text-primary" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <Users className="h-5 w-5 mr-2 text-primary" />
                  <span>{event.attendees} of {event.maxAttendees} attending</span>
                </div>
              </div>
            </div>

            <Button className="mt-4 md:mt-0">
              Register for Event
            </Button>
          </div>

          <div className="mt-8 pt-6 border-t">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">About This Event</h2>
            <p className="text-gray-700 whitespace-pre-line">{event.description}</p>
          </div>

          {/* Add more sections here as needed, such as:
              - Event schedule
              - Speakers
              - Location map
              - Registration form
              - Related events
          */}
        </div>
      </div>
    </div>
  );
}
