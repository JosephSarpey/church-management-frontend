"use client";

import React, { useEffect, useState } from 'react';
import eventsApi from '@/lib/api/events';
import { Event } from '@/lib/api/events/types';
import { Loader2, Calendar, MapPin, CheckCircle2, Download, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { exportToCSV, exportToPDF } from '@/lib/utils/export';

export default function EventsReport() {
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [pastEvents, setPastEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch upcoming
      const upcoming = await eventsApi.getUpcomingEvents();
      setUpcomingEvents(upcoming || []);

      // Fetch all (recent 50) and filter for past
      // In a real optimized app, we'd want a specific 'past' endpoint or date filter on getAll
      // Using existing list endpoint
      const allResponse = await eventsApi.getEvents({ take: 50 });
      const all = allResponse?.data || [];
      
      const now = new Date();
      const past = all.filter(e => new Date(e.startTime) < now).sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
      setPastEvents(past);

    } catch (err) {
      console.error('Failed to fetch events:', err);
      setError('Failed to load events report.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = () => {
    const allEvents = [...upcomingEvents, ...pastEvents];
    const csvData = allEvents.map(event => ({
      'Title': event.title,
      'Date': new Date(event.startTime).toLocaleDateString(),
      'Time': new Date(event.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      'Location': event.location || 'N/A',
      'Status': event.status,
    }));

    exportToCSV(csvData, `events_report_${new Date().toISOString().split('T')[0]}`);
  };

  const handleDownloadPDF = async () => {
    await exportToPDF('events-report-content', `events_report_${new Date().toISOString().split('T')[0]}`, {
      title: 'Events Report',
      orientation: 'portrait',
    });
  };

  if (loading && upcomingEvents.length === 0 && pastEvents.length === 0) {
     return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#FFC72C]" />
      </div>
    );
  }

  return (
    <div className="space-y-6" id="events-report-content">
       <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Events Report</h2>
            <p className="text-gray-500 dark:text-gray-400">
               Overview of church events and activities
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={handleDownloadCSV}>
                Download as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownloadPDF}>
                Download as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="group border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#FFC72C]/10 rounded-full blur-3xl group-hover:bg-[#FFC72C]/20 transition-all duration-300"></div>
          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center text-xl font-bold">
              <div className="p-2 bg-[#FFC72C]/20 dark:bg-[#FFC72C]/10 rounded-xl mr-3">
                <Calendar className="h-5 w-5 text-[#FFC72C]" />
              </div>
              Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="space-y-4">
              {upcomingEvents.length === 0 ? (
                <p className="text-gray-500 italic">No upcoming events scheduled.</p>
              ) : (
                upcomingEvents.map(event => (
                  <div key={event.id} className="group/item border-l-4 border-[#FFC72C] pl-4 py-3 bg-gradient-to-r from-[#FFC72C]/5 to-transparent dark:from-[#FFC72C]/5 dark:to-transparent rounded-r-lg hover:from-[#FFC72C]/10 hover:to-transparent transition-all duration-200">
                    <h4 className="font-semibold text-gray-900 dark:text-white group-hover/item:text-[#FFC72C] transition-colors">{event.title}</h4>
                    <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <Calendar className="mr-1.5 h-3.5 w-3.5" />
                      {new Date(event.startTime).toLocaleDateString()} at {new Date(event.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                     <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <MapPin className="mr-1.5 h-3.5 w-3.5" />
                      {event.location || 'Church Main Hall'}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="group border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#333333]/5 rounded-full blur-3xl group-hover:bg-[#333333]/10 transition-all duration-300"></div>
           <CardHeader className="relative z-10">
            <CardTitle className="flex items-center text-xl font-bold">
              <div className="p-2 bg-[#333333]/10 dark:bg-gray-700/50 rounded-xl mr-3">
                <CheckCircle2 className="h-5 w-5 text-[#333333] dark:text-gray-400" />
              </div>
              Past Events
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="space-y-4">
              {pastEvents.length === 0 ? (
                <p className="text-gray-500 italic">No past events found.</p>
              ) : (
                 pastEvents.slice(0, 5).map(event => (
                  <div key={event.id} className="flex justify-between items-center border-b pb-3 last:border-0 last:pb-0 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/30 px-2 py-2 -mx-2 rounded-lg transition-colors duration-200">
                    <div>
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm">{event.title}</h4>
                         <div className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(event.startTime).toLocaleDateString()}
                        </div>
                    </div>
                    <Badge variant={event.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                      {event.status}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="group relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-[#FFC72C]/10 via-white to-white dark:from-[#FFC72C]/5 dark:via-gray-900 dark:to-gray-900">
          <div className="absolute inset-0 bg-gradient-to-br from-[#FFC72C]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardContent className="pt-5 pb-5 relative z-10">
            <div className="text-center">
              <div className="inline-flex p-2 bg-[#FFC72C]/20 dark:bg-[#FFC72C]/10 rounded-xl mb-2">
                <Calendar className="h-5 w-5 text-[#FFC72C]" />
              </div>
              <div className="text-3xl font-bold bg-gradient-to-r from-[#FFC72C] to-[#FFD700] bg-clip-text text-transparent">{upcomingEvents.length}</div>
              <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-1.5">Scheduled</div>
            </div>
          </CardContent>
        </Card>
        <Card className="group relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-[#333333]/5 via-white to-white dark:from-[#333333]/10 dark:via-gray-900 dark:to-gray-900">
          <div className="absolute inset-0 bg-gradient-to-br from-[#333333]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardContent className="pt-5 pb-5 relative z-10">
             <div className="text-center">
              <div className="inline-flex p-2 bg-[#333333]/10 dark:bg-gray-700/50 rounded-xl mb-2">
                <CheckCircle2 className="h-5 w-5 text-[#333333] dark:text-gray-400" />
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{pastEvents.length}</div>
              <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-1.5">Completed</div>
            </div>
          </CardContent>
        </Card>
         <Card className="group relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-[#FFC72C]/10 to-[#333333]/5 dark:from-[#FFC72C]/5 dark:to-[#333333]/10">
          <div className="absolute inset-0 bg-gradient-to-br from-[#FFC72C]/10 to-[#333333]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardContent className="pt-5 pb-5 relative z-10">
             <div className="text-center">
              <div className="inline-flex p-2 bg-gradient-to-br from-[#FFC72C]/20 to-[#333333]/10 dark:from-[#FFC72C]/10 dark:to-[#333333]/20 rounded-xl mb-2">
                <TrendingUp className="h-5 w-5 text-[#FFC72C]" />
              </div>
              <div className="text-3xl font-bold bg-gradient-to-r from-[#FFC72C] to-[#333333] dark:from-[#FFC72C] dark:to-gray-400 bg-clip-text text-transparent">{upcomingEvents.length + pastEvents.length}</div>
              <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-1.5">Total Tracked</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
