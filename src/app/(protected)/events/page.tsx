'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, Plus, Calendar, Clock, MapPin, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { format, parseISO } from 'date-fns';
import { eventsApi } from '@/lib/api/events';
import type { Event, EventsList } from '@/lib/api/events/types';
import { toast } from 'sonner';

export default function EventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await eventsApi.getEvents({ status: 'PUBLISHED' });
        // Handle paginated response structure
        setEvents(response?.data || []);
        setError(null);
      } catch (error) {
        console.error('Error fetching events:', error);
        setEvents([]);
        setError('Failed to load events. Please try again later.');
        toast.error('Failed to load events. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const filteredEvents = (events || []).filter(event =>
    event?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (event?.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
    (event?.location?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  );

  const formatEventDate = (dateString: string) => {
    return format(parseISO(dateString), 'yyyy-MM-dd');
  };

  const formatEventTime = (dateString: string) => {
    return format(parseISO(dateString), 'h:mm a');
  };

  const handleCreateEvent = () => {
    router.push('/events/create');
  };

  const handleDeleteEvent = async () => {
    if (!deleteId) return;

    try {
      setIsDeleting(true);
      await eventsApi.deleteEvent(deleteId);
      
      // Remove from local state
      setEvents(prev => prev.filter(e => e.id !== deleteId));
      toast.success('Event deleted successfully');
      setDeleteId(null);
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event. Please try again.');
    } finally {
      setIsDeleting(false);
    }
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Events</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">View and manage upcoming church events</p>
        </div>
        <Button onClick={handleCreateEvent} className="mt-4 md:mt-0">
          <Plus className="mr-2 h-4 w-4" />
          Create Event
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 mb-8">
        <div className="p-4 border-b dark:border-gray-700">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search events..."
              className="pl-10 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="divide-y">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <div key={event.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div className="mb-4 md:mb-0">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">{event.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">{event.description}</p>

                    <div className="mt-3 flex flex-wrap gap-4">
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 flex-wrap gap-2">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatEventDate(event.startTime)}
                        </div>
                        <span>•</span>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {formatEventTime(event.startTime)} - {formatEventTime(event.endTime)}
                        </div>
                        {event.location && (
                          <>
                            <span>•</span>
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {event.location}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                    <div className="flex flex-col items-end gap-2">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {event.attendees}/{event.maxAttendees} attendees
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => router.push(`/events/${event.id}`)} className="dark:border-gray-600 dark:text-white dark:hover:bg-gray-700">
                        View Details
                        </Button>
                        <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => setDeleteId(event.id)}
                        className="p-2"
                        >
                        <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              {searchTerm ? 'No events match your search.' : 'No upcoming events found.'}
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the event
              and remove it from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteEvent();
              }}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}