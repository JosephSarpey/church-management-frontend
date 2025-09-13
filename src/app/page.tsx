/* eslint-disable @typescript-eslint/no-unused-vars */
import { Users, CalendarCheck, DollarSign, Activity, UserPlus, CalendarDays, ArrowUpRight, Clock, MapPin } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { AttendanceChart } from "@/components/charts/AttendanceChart";
import { TithesChart } from "@/components/charts/TithesChart";
import Link from "next/link";
import TextType from "@/components/TextType";

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  attendees: number;
  maxAttendees: number;
}

export default function DashboardPage() {
  const stats = {
    totalMembers: 256,
    weeklyAttendance: 184,
    monthlyTithes: 5275.50,
    newMembersThisMonth: 12,
    upcomingEvents: 3,
    attendanceRate: 87.5
  };

  const upcomingEvents: Event[] = [
    {
      id: '1',
      title: 'Sunday Service',
      date: new Date().toISOString().split('T')[0],
      time: '10:00 AM',
      location: 'Main Sanctuary',
      attendees: 120,
      maxAttendees: 200
    },
    {
      id: '2',
      title: 'Bible Study',
      date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      time: '7:00 PM',
      location: 'Fellowship Hall',
      attendees: 45,
      maxAttendees: 60
    }
  ];

  const recentActivity = [
    { id: 1, title: "New member registered", description: "John Doe joined the church community", time: "2 hours ago", icon: UserPlus },
    { id: 2, title: "Tithe received", description: "$150.00 from Jane Smith", time: "5 hours ago", icon: DollarSign },
    { id: 3, title: "Event created", description: "Sunday Service - September 15", time: "1 day ago", icon: CalendarDays },
  ];

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="flex flex-col space-y-1">
        <TextType
          text={["Welcome back, Admin", "Here's what's happening with your church today"]}
          typingSpeed={50}
          deletingSpeed={30}
          pauseDuration={2000}
          loop
          showCursor
          className="text-4xl font-bold"
          cursorCharacter="_"
          cursorClassName="text-primary"
          variableSpeed={undefined}
          onSentenceComplete={undefined}
        />
        <p className="text-muted-foreground text-sm">Here&apos;s what&apos;s happening with your church today</p>
      </div>

      {/* Top Row - Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Total Members" 
          value={stats.totalMembers}
          change="+12% from last month"
          icon={<Users className="h-5 w-5" />}
        />
        <MetricCard 
          title="Weekly Attendance" 
          value={stats.weeklyAttendance}
          change="+8% from last week"
          icon={<CalendarCheck className="h-5 w-5" />}
        />
        <MetricCard 
          title="Monthly Tithes" 
          value={formatCurrency(stats.monthlyTithes)}
          change="+15% from last month"
          icon={<DollarSign className="h-5 w-5" />}
        />
        <MetricCard 
          title="Upcoming Events" 
          value={stats.upcomingEvents}
          change="2 new events this week"
          icon={<Activity className="h-5 w-5" />}
        />
      </div>

      {/* Middle Row - Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Attendance Chart */}
        <div className="lg:col-span-2 bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold">Attendance Overview</h2>
              <p className="text-sm text-muted-foreground">Last 6 months trend</p>
            </div>
            <Link href="/attendance" className="text-sm text-primary flex items-center hover:underline">
              View all <span className="ml-1">→</span>
            </Link>
          </div>
          <div className="h-80">
            <AttendanceChart />
          </div>
        </div>

        {/* Right Column - Upcoming Events */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold">Upcoming Events</h2>
              <p className="text-sm text-muted-foreground">Your next gatherings</p>
            </div>
            <Link href="/events" className="text-sm text-primary flex items-center hover:underline">
              View all <span className="ml-1">→</span>
            </Link>
          </div>
          <div className="space-y-4">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => (
                <div key={event.id} className="group relative p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium">{event.title}</h3>
                      <div className="flex items-center mt-1 text-sm text-muted-foreground">
                        <CalendarDays className="h-4 w-4 mr-1.5 flex-shrink-0" />
                        <span className="truncate">{formatEventDate(event.date)}</span>
                      </div>
                      <div className="flex items-center mt-1 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 mr-1.5 flex-shrink-0" />
                        <span className="whitespace-nowrap">{event.time}</span>
                        <span className="mx-2">•</span>
                        <MapPin className="h-4 w-4 mr-1.5 flex-shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <div className="text-sm font-medium text-right">
                        {event.attendees}/{event.maxAttendees}
                      </div>
                      <div className="w-24 h-2 bg-muted rounded-full mt-1 overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full" 
                          style={{ width: `${Math.min(100, (event.attendees / event.maxAttendees) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <Link 
                    href={`/events/${event.id}`}
                    className="absolute inset-0 z-10"
                    aria-label={`View ${event.title} details`}
                  />
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarDays className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No upcoming events</p>
              </div>
            )}
            <div className="pt-2">
              <Link 
                href="/events/create" 
                className="w-full flex items-center justify-center text-sm text-primary hover:underline"
              >
                <span>Create New Event</span>
                <ArrowUpRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row - Recent Activity and Tithes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold">Recent Activity</h2>
              <p className="text-sm text-muted-foreground">Latest updates</p>
            </div>
            <Link href="/reports" className="text-sm text-primary flex items-center hover:underline">
              View all <span className="ml-1">→</span>
            </Link>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3 mt-0.5">
                  <activity.icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{activity.title}</p>
                  <p className="text-sm text-muted-foreground truncate">{activity.description}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tithes & Offerings */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold">Tithes & Offerings</h2>
              <p className="text-sm text-muted-foreground">Monthly breakdown</p>
            </div>
            <Link href="/tithes" className="text-sm text-primary flex items-center hover:underline">
              View report <ArrowUpRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <div className="h-64">
            <TithesChart />
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function MetricCard({ title, value, change, icon }: { title: string; value: string | number; change: string; icon: React.ReactNode }) {
  return (
    <div className="bg-card rounded-lg p-5 border border-border hover:border-primary/20 transition-colors">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
          {icon}
        </div>
      </div>
      <div className="mt-2">
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-green-500 flex items-center mt-1">
          <span className="mr-1">↑</span>
          {change}
        </p>
      </div>
    </div>
  );
}

function StatItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
          {icon}
        </div>
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <span className="font-medium">{value}</span>
    </div>
  );
}
