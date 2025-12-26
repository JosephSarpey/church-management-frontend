import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { Event } from "@/lib/api/events/types";

interface UpcomingEventsListProps {
  upcomingEvents: Event[];
}

export function UpcomingEventsList({ upcomingEvents }: UpcomingEventsListProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="space-y-6"
    >
      <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
        <div className="p-6 pb-0">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Upcoming Events</h2>
              <p className="text-sm text-muted-foreground">Next gatherings</p>
            </div>
            <Link 
              href="/events" 
              className="text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center"
            >
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>
        <div className="p-2 flex-1 overflow-y-auto max-h-[500px]">
          <div className="space-y-2">
            {upcomingEvents.map((event) => {
              const startTime = new Date(event.startTime);
              const endTime = new Date(event.endTime);

              return (
                <Link 
                  key={event.id} 
                  href={`/events/${event.id}`}
                  className="block group"
                >
                  <div className="p-4 border rounded-xl hover:border-primary/30 transition-all duration-200 hover:shadow-sm bg-card group-hover:bg-accent/5">
                    <div className="flex items-start gap-4">
                      {/* Date Badge */}
                      <div className="flex flex-col items-center justify-center min-w-[56px] p-2 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10 text-center">
                        <span className="text-lg font-semibold text-primary">
                          {startTime.getDate()}
                        </span>
                        <span className="text-xs text-muted-foreground uppercase">
                          {startTime.toLocaleString('default', { month: 'short' })}
                        </span>
                      </div>
                      
                      {/* Event Details */}
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <h3 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
                          {event.title}
                        </h3>
                        
                        {/* Time */}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-3.5 w-3.5 flex-shrink-0 opacity-70" />
                          <span>
                            {startTime.toLocaleTimeString('en-US', { 
                              hour: '2-digit', 
                              minute: '2-digit',
                              hour12: true 
                            })}
                            {endTime && (
                              <>
                                {' - '}
                                {endTime.toLocaleTimeString('en-US', { 
                                  hour: '2-digit', 
                                  minute: '2-digit',
                                  hour12: true 
                                })}
                              </>
                            )}
                          </span>
                        </div>
                        
                        {/* Location */}
                        {event.location && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5 flex-shrink-0 opacity-70" />
                            <span className="truncate">{event.location}</span>
                          </div>
                        )}
                        
                        {/* View Button */}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 px-2 -ml-2 mt-1 text-xs text-primary/80 hover:text-primary hover:bg-primary/5"
                          asChild
                        >
                          <div className="flex items-center gap-1">
                            <span>View details</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </div>
                        </Button>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
            {upcomingEvents.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No upcoming events scheduled
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
