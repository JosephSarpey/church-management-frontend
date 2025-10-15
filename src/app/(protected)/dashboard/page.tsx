'use client';

import { motion } from "framer-motion";
import { 
  Users, CalendarCheck, DollarSign, Activity, 
  UserPlus, CalendarDays, ArrowUpRight, MapPin, ArrowUp, ArrowDown,
  ArrowRight,
  Plus
} from "lucide-react";
import Link from "next/link";
import TextType from "@/components/TextType";
import { AttendanceChart } from "@/components/charts/AttendanceChart";
import { TithesChart } from "@/components/charts/TithesChart";
import { formatCurrency } from "@/lib/utils";

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
    monthlyTithes: 5275.5,
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

  // Rhythmic color palette for circular metrics
  const circularColors = ["#4F46E5", "#3B82F6", "#10B981", "#F59E0B", "#EF4444"];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <TextType
              text={["Welcome back, Admin", "Here's what's happening with your church today"]}
              typingSpeed={50}
              deletingSpeed={30}
              pauseDuration={2000}
              loop
              showCursor
              className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground"
              cursorCharacter="_"
              cursorClassName="text-primary"
              variableSpeed={undefined}
              onSentenceComplete={undefined}
            />
            <p className="mt-1.5 text-sm text-muted-foreground">Stay updated with key metrics & activities</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/events/create"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Event
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        <MetricCard 
          title="Total Members" 
          value={stats.totalMembers} 
          change={12} 
          icon={<Users className="h-5 w-5" />} 
          color={circularColors[0]} 
        />
        <MetricCard 
          title="Weekly Attendance" 
          value={stats.weeklyAttendance} 
          change={8} 
          icon={<CalendarCheck className="h-5 w-5" />} 
          color={circularColors[1]} 
        />
        <MetricCard 
          title="Monthly Tithes" 
          value={formatCurrency(stats.monthlyTithes)} 
          change={15} 
          icon={<DollarSign className="h-5 w-5" />} 
          color={circularColors[2]} 
        />
        <MetricCard 
          title="Upcoming Events" 
          value={stats.upcomingEvents} 
          change={-5} 
          icon={<Activity className="h-5 w-5" />} 
          color={circularColors[3]} 
        />
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Attendance Overview - 2/3 width */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="lg:col-span-2 space-y-6"
        >
          <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="p-6 pb-0">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Attendance Overview</h2>
                  <p className="text-sm text-muted-foreground">Last 6 months trend</p>
                </div>
                <Link 
                  href="/attendance" 
                  className="text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center"
                >
                  View all <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
              
              {/* Mini metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <AnimatedCircularMetric label="Attendance Rate" value={stats.attendanceRate} max={100} color={circularColors[2]} suffix="%" change={+3} />
                <AnimatedCircularMetric label="Weekly Avg" value={stats.weeklyAttendance} max={1000} color={circularColors[0]} change={+8} />
                <AnimatedCircularMetric label="Monthly Growth" value={6.4} max={100} color={circularColors[1]} suffix="%" change={+2} />
                <AnimatedCircularMetric label="Absentees" value={34} max={200} color={circularColors[4]} change={-1} />
              </div>
            </div>
            <div className="h-80">
              <AttendanceChart />
            </div>
          </div>
        </motion.div>

        {/* Upcoming Events - 1/3 width */}
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
                {upcomingEvents.map((event) => (
                  <EventCard key={event.id} event={event} formatEventDate={formatEventDate} />
                ))}
                {upcomingEvents.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No upcoming events scheduled
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="bg-card rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
                <p className="text-sm text-muted-foreground">Latest updates</p>
              </div>
              <Link 
                href="/activity" 
                className="text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center"
              >
                View all <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start group">
                  <div className="flex-shrink-0 h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center mr-3 transition-colors group-hover:bg-primary/20">
                    <activity.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{activity.title}</p>
                    <p className="text-sm text-muted-foreground truncate">{activity.description}</p>
                    <p className="text-xs text-muted-foreground/80 mt-0.5">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Tithes & Offerings */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-card rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Tithes & Offerings</h2>
                <p className="text-sm text-muted-foreground">Monthly breakdown</p>
              </div>
              <Link 
                href="/tithes" 
                className="text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center"
              >
                View report <ArrowUpRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <AnimatedCircularMetric 
                label="This Month" 
                value={stats.monthlyTithes} 
                max={10000} 
                color={circularColors[2]} 
                prefix="$" 
                change={+15} 
              />
              <AnimatedCircularMetric 
                label="Growth" 
                value={15} 
                max={100} 
                suffix="%" 
                color={circularColors[1]} 
                change={+3} 
              />
            </div>
            
            <div className="h-64">
              <TithesChart />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Metric Card with improved design
function MetricCard({ title, value, change, icon, color }: { title: string; value: string | number; change: number; icon: React.ReactNode; color: string }) {
  const isPositive = change >= 0;
  return (
    <div className="bg-card rounded-xl border border-border p-5 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <div className="flex items-baseline">
            <p className="text-2xl font-bold text-foreground">{value}</p>
            <motion.span
              className={`ml-2 inline-flex items-center text-xs font-medium ${
                isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.5 }}
            >
              {isPositive ? (
                <ArrowUp className="mr-0.5 h-3 w-3" />
              ) : (
                <ArrowDown className="mr-0.5 h-3 w-3" />
              )}
              {Math.abs(change)}%
            </motion.span>
          </div>
        </div>
        <div 
          className="h-9 w-9 rounded-lg flex items-center justify-center" 
          style={{ 
            backgroundColor: `${color}10`,
            color: color
          }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

// Animated Circular Metric with improved design
function AnimatedCircularMetric({
  label,
  value,
  max,
  color,
  prefix = '',
  suffix = '',
  change,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
  prefix?: string;
  suffix?: string;
  change: number;
}) {
  const percentage = Math.min(100, (value / max) * 100);
  const isPositive = change >= 0;
  const radius = 24; // Slightly smaller for better proportions
  const circumference = 2 * Math.PI * radius;
  const strokeWidth = 4;
  const size = (radius + strokeWidth) * 2;
  const viewBox = `0 0 ${size} ${size}`;
  const offset = circumference * (1 - percentage / 100);

  // Format value with proper formatting
  const formatValue = (val: number) => {
    if (suffix === '%') return `${Math.round(val)}${suffix}`;
    if (prefix === '$') return `${prefix}${val.toLocaleString()}`;
    return `${prefix}${val}${suffix}`;
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg 
          viewBox={viewBox} 
          className="w-full h-full -rotate-90"
          aria-hidden="true"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--muted)"
            strokeWidth={strokeWidth}
            strokeOpacity="0.2"
          />
          {/* Animated progress circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{
              duration: 1.5,
              ease: "easeInOut",
              delay: 0.2
            }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-center">
            <p className="text-xs font-semibold text-foreground">
              {formatValue(value)}
            </p>
            <div 
              className={`flex items-center justify-center text-[10px] font-medium ${
                isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}
            >
              {isPositive ? (
                <ArrowUp className="mr-0.5 h-2.5 w-2.5" />
              ) : (
                <ArrowDown className="mr-0.5 h-2.5 w-2.5" />
              )}
              {Math.abs(change)}%
            </div>
          </div>
        </div>
      </div>
      <p className="mt-2 text-xs text-muted-foreground text-center font-medium">
        {label}
      </p>
    </div>
  );
}


// Event Card Component with improved design
function EventCard({ event, formatEventDate }: { event: Event; formatEventDate: (d: string) => string }) {
  const attendancePercentage = Math.min(100, (event.attendees / event.maxAttendees) * 100);
  
  return (
    <div className="group relative p-4 rounded-lg border border-border hover:bg-accent/30 transition-colors">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
            {event.title}
          </h3>
          
          <div className="mt-2 space-y-1.5">
            <div className="flex items-center text-sm text-muted-foreground">
              <CalendarDays className="h-4 w-4 mr-2 opacity-70" />
              <span>{formatEventDate(event.date)} • {event.time}</span>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mr-2 opacity-70" />
              <span className="truncate">{event.location}</span>
            </div>
          </div>
          
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Attendance</span>
              <span className="font-medium text-foreground">
                {event.attendees} <span className="text-muted-foreground">/ {event.maxAttendees}</span>
              </span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary/80 rounded-full transition-all duration-300"
                style={{ width: `${attendancePercentage}%` }}
              />
            </div>
          </div>
        </div>
        
        <div className="flex-shrink-0 pt-0.5">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
        </div>
      </div>
      
      <Link 
        href={`/events/${event.id}`} 
        className="absolute inset-0 z-10"
        aria-label={`View ${event.title} details`}
      />
    </div>
  );
}
