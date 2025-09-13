'use client';

import { Calendar, Clock, MapPin, ArrowRight } from 'lucide-react';
import { format, parseISO, isToday, isTomorrow } from 'date-fns';
import { Button } from '@/components/ui/Button';

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  attendees: number;
  maxAttendees: number;
}

interface UpcomingEventsGridProps {
  events: Event[];
  maxItems?: number;
}

export function UpcomingEventsGrid({ events, maxItems = 4 }: UpcomingEventsGridProps) {
  const formatEventDate = (dateString: string) => {
    const date = parseISO(dateString);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'EEEE, MMM d');
  };

  const displayedEvents = events.slice(0, maxItems);
  const hasMore = events.length > maxItems;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Upcoming Events</h3>
        <Button variant="ghost" size="sm" className="text-primary hover:bg-transparent hover:text-primary/80">
          View All
          <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayedEvents.map((event) => (
          <div key={event.id} className="group relative p-4 rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col h-full">
              <div className="flex items-center space-x-2 mb-2">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-medium line-clamp-1">{event.title}</h4>
                  <p className="text-sm text-muted-foreground">{formatEventDate(event.date)}</p>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                {event.description}
              </p>
              
              <div className="mt-auto pt-3 border-t border-border">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center text-muted-foreground">
                      <Clock className="h-4 w-4 mr-1.5" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-1.5 flex-shrink-0" />
                      <span className="truncate max-w-[120px]">{event.location}</span>
                    </div>
                  </div>
                  <div className="text-sm font-medium">
                    {event.attendees}/{event.maxAttendees || '∞'}
                  </div>
                </div>
              </div>
            </div>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 rounded-full"
            >
              <ArrowRight className="h-4 w-4" />
              <span className="sr-only">View event</span>
            </Button>
          </div>
        ))}
        
        {hasMore && (
          <div className="flex items-center justify-center p-4 border-2 border-dashed rounded-xl">
            <p className="text-sm text-muted-foreground">
              +{events.length - maxItems} more events
            </p>
          </div>
        )}
        
        {events.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center p-8 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground/40 mb-3" />
            <h4 className="font-medium">No upcoming events</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Create your first event to get started
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
