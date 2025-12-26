/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Calendar, Clock, MapPin, Users } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Event } from '@/lib/api/events/types';
import { useEffect, useState } from 'react';
import { eventsApi } from '@/lib/api/events';
import { toast } from 'sonner';
import Image from 'next/image';

export default function EventDetailsPage() {
  const router = useRouter();
  const { id } = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id || typeof id !== 'string') {
        setError('Invalid event ID');
        setIsLoading(false);
        return;
      }

      try {
        const eventData = await eventsApi.getEvent(id);
        setEvent(eventData);
        setError(null);
      } catch (error) {
        console.error('Error fetching event:', error);
        setError('Failed to load event. Please try again later.');
        toast.error('Failed to load event. Please try again later.');
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Event Not Found</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">The requested event could not be found.</p>
        <Button onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Events
        </Button>
      </div>
    );
  }

  // Format dates and times
  const formatDateTime = (dateString: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return {
      date: format(date, 'MMM d, yyyy'),
      time: format(date, 'h:mm a'),
      day: format(date, 'EEE')
    };
  };

  const startDateTime = event.startTime ? formatDateTime(event.startTime) : null;
  const endDateTime = event.endTime ? formatDateTime(event.endTime) : null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Events
        </Button>
        <Button 
          variant="outline" 
          onClick={() => router.push(`/events/${event.id}/edit`)}
          className="mb-6 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
        >
          Edit Event
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{event.title}</h1>
              
              {/* Event Image */}
              {event.imageUrl && (
                <div className="mt-4 mb-6 rounded-lg overflow-hidden">
                  <Image 
                    src={event.imageUrl} 
                    alt={event.title}
                    className="w-full h-64 object-cover rounded-lg"
                    width={1000}
                    height={1000}
                  />
                </div>
              )}
              
              <div className="flex flex-wrap gap-4 mt-6 mb-8">
                <div className="flex items-start text-gray-700 dark:text-gray-300">
                  <Calendar className="h-5 w-5 mr-2 text-primary mt-0.5 flex-shrink-0" />
                  <div className="flex items-center gap-1">
                    {startDateTime && (
                      <span>
                        {startDateTime.day} {startDateTime.date} • {startDateTime.time}
                      </span>
                    )}
                    {endDateTime && (
                      <>
                        <span className="mx-1">-</span>
                        <span>
                          {startDateTime?.day === endDateTime.day ? (
                            endDateTime.time
                          ) : (
                            <>{endDateTime.day} {endDateTime.date} • {endDateTime.time}</>
                          )}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                {event.location && (
                  <div className="flex items-center text-gray-700 dark:text-gray-300">
                    <MapPin className="h-5 w-5 mr-2 text-primary" />
                    <span>{event.location}</span>
                  </div>
                )}
                {(event.attendees !== undefined && event.maxAttendees) && (
                  <div className="flex items-center text-gray-700 dark:text-gray-300">
                    <Users className="h-5 w-5 mr-2 text-primary" />
                    <span>{event.attendees} of {event.maxAttendees} attending</span>
                  </div>
                )}
              </div>
            </div>

            {event.registrationRequired && (
              <Button className="mt-4 md:mt-0">
                Register for Event
              </Button>
            )}
          </div>

          {event.description && (
            <div className="mt-8 pt-6 border-t dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">About This Event</h2>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{event.description}</p>
            </div>
          )}

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
