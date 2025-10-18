'use client';

import { motion } from "framer-motion";
import { 
  Users, CalendarCheck, Activity, 
  UserPlus, CalendarDays, ArrowUpRight, MapPin, ArrowUp, ArrowDown,
  ArrowRight,
  Plus,
  DollarSign
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { membersApi } from "@/lib/api/members";
import { attendanceApi } from "@/lib/api/attendance";
import { endOfDay, subDays } from "date-fns";
import { toast } from "sonner";

const CediSign = ({ className }: { className?: string }) => (
  <Image 
    src="/cedi-sign.svg" 
    alt="Cedi Sign" 
    width={20} 
    height={20} 
    className={className}
  />
);
import Link from "next/link";
import TextType from "@/components/TextType";
import { TithesChart } from "@/components/charts/TithesChart";
import { AttendanceTrends } from "@/components/charts/AttendanceTrends";
import { ServiceType } from "@/lib/api/attendance/types";
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
  const [isLoading, setIsLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState<Array<{
    id: string;
    date: Date;
    serviceType: ServiceType;
    isVisitor: boolean;
    visitorName?: string;
    member?: {
      firstName: string;
      lastName: string;
    };
  }>>([]);

  const [stats, setStats] = useState({
    totalMembers: 0,
    weeklyAttendance: 0,
    previousWeekAttendance: 0,
    monthlyTithes: 0,
    newMembersThisMonth: 0,
    memberChangePercent: 0,
    upcomingEvents: 0,
    attendanceRate: 0,
    previousAttendanceRate: 0,
    monthlyGrowth: 0,
    absenteesPercentage: 0,
    previousAbsenteesPercentage: 0
  });

  const fetchAttendanceData = async (totalMembers: number) => {
    try {
      setIsLoading(true);
      const thirtyDaysAgo = subDays(new Date(), 30);
      const twoMonthsAgo = subDays(new Date(), 60);
      
      // Fetch attendance data for the last 60 days to calculate monthly growth
      const [currentMonthResponse, previousMonthResponse] = await Promise.all([
        attendanceApi.getAttendances({
          startDate: thirtyDaysAgo.toISOString(),
          endDate: endOfDay(new Date()).toISOString(),
          limit: 1000,
        }),
        attendanceApi.getAttendances({
          startDate: twoMonthsAgo.toISOString(),
          endDate: thirtyDaysAgo.toISOString(),
          limit: 1000,
        })
      ]);

      // Process current month data
      const currentMonthRecords = Array.isArray(currentMonthResponse)
        ? currentMonthResponse.map(record => ({
            ...record,
            date: new Date(record.date)
          }))
        : [];

      // Process previous month data
      const previousMonthRecords = Array.isArray(previousMonthResponse)
        ? previousMonthResponse.map(record => ({
            ...record,
            date: new Date(record.date)
          }))
        : [];

      setAttendanceData(currentMonthRecords);
      
      // Calculate weekly attendance (last 7 days and previous 7 days)
      const oneWeekAgo = subDays(new Date(), 7);
      const twoWeeksAgo = subDays(new Date(), 14);
      
      const weeklyAttendance = currentMonthRecords
        .filter(record => new Date(record.date) >= oneWeekAgo)
        .length;
        
      const previousWeekAttendance = currentMonthRecords
        .filter(record => new Date(record.date) >= twoWeeksAgo && new Date(record.date) < oneWeekAgo)
        .length;
      
      // Calculate attendance metrics
      const memberAttendances = currentMonthRecords.filter(record => !record.isVisitor);
      const uniqueAttendees = new Set(memberAttendances.map(a => a.member?.id)).size;
      
      // Calculate attendance rate as percentage of total members who attended at least once
      const attendanceRate = totalMembers > 0 
        ? Math.round((uniqueAttendees / totalMembers) * 100)
        : 0;
        
      // Calculate previous period attendance rate
      const previousPeriodAttendances = previousMonthRecords.filter(record => !record.isVisitor);
      const previousUniqueAttendees = new Set(previousPeriodAttendances.map(a => a.member?.id)).size;
      const previousAttendanceRate = totalMembers > 0
        ? Math.round((previousUniqueAttendees / totalMembers) * 100)
        : 0;
      
      // Calculate monthly growth based on total attendance count
      const currentMonthCount = currentMonthRecords.length;
      const previousMonthCount = previousMonthRecords.length;
      const monthlyGrowth = previousMonthCount > 0
        ? Math.round(((currentMonthCount - previousMonthCount) / previousMonthCount) * 100)
        : currentMonthCount > 0 ? 100 : 0;
      
      // Helper function to format date as YYYY-MM-DD
      const formatDate = (date: Date) => {
        return date.toISOString().split('T')[0];
      };

      // Group attendance by service type and date to count absentees
      const serviceAttendance = currentMonthRecords.reduce((acc, record) => {
        const date = record.date instanceof Date ? formatDate(record.date) : record.date.split('T')[0];
        const serviceKey = `${date}_${record.serviceType}`;
        if (!acc[serviceKey]) {
          acc[serviceKey] = new Set<string>();
        }
        if (record.member?.id) {
          acc[serviceKey].add(record.member.id);
        }
        return acc;
      }, {} as Record<string, Set<string>>);

      // Calculate total possible attendances (services * total members)
      const totalServices = Object.keys(serviceAttendance).length;
      const totalPossibleAttendances = totalServices * totalMembers;
      
      // Calculate total present attendances
      const totalPresentAttendances = Object.values<Set<string>>(serviceAttendance)
        .reduce((sum: number, members: Set<string>) => sum + members.size, 0);
      
      // Calculate absentees (total possible - present)
      const absenteesCount = Math.max(0, totalPossibleAttendances - totalPresentAttendances);
      const absenteesPercentage = totalPossibleAttendances > 0
        ? Math.round((absenteesCount / totalPossibleAttendances) * 100)
        : 0;
      
      // Calculate previous period absentees
      const prevServiceAttendance = previousMonthRecords.reduce((acc, record) => {
        const date = record.date instanceof Date ? formatDate(record.date) : record.date.split('T')[0];
        const serviceKey = `${date}_${record.serviceType}`;
        if (!acc[serviceKey]) {
          acc[serviceKey] = new Set<string>();
        }
        if (record.member?.id) {
          acc[serviceKey].add(record.member.id);
        }
        return acc;
      }, {} as Record<string, Set<string>>);
      
      const prevTotalServices = Object.keys(prevServiceAttendance).length;
      const prevTotalPossibleAttendances = prevTotalServices * totalMembers;
      const prevTotalPresentAttendances = Object.values<Set<string>>(prevServiceAttendance)
        .reduce((sum: number, members: Set<string>) => sum + members.size, 0);
      
      const previousAbsenteesCount = Math.max(0, prevTotalPossibleAttendances - prevTotalPresentAttendances);
      const previousAbsenteesPercentage = prevTotalPossibleAttendances > 0
        ? Math.round((previousAbsenteesCount / prevTotalPossibleAttendances) * 100)
        : 0;

      // Update stats with all metrics
      setStats(prev => ({
        ...prev,
        weeklyAttendance,
        previousWeekAttendance,
        attendanceRate,
        previousAttendanceRate,
        monthlyGrowth,
        absenteesPercentage,
        previousAbsenteesPercentage
      }));
      
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      toast.error('Failed to load attendance data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // First fetch members count
        const membersCountResponse = await membersApi.getTotalMembersCount();
        
        // Then fetch attendance data with the members count
        await fetchAttendanceData(membersCountResponse.count);
        
        // Calculate percentage changes
        const calculatePercentageChange = (current: number, previous: number): number => {
          if (previous === 0) return current > 0 ? 100 : 0;
          return Number((((current - previous) / previous) * 100).toFixed(1));
        };
        
        const memberChangePercent = calculatePercentageChange(
          membersCountResponse.count,
          membersCountResponse.previousCount
        );
        
        setStats(prev => ({
          ...prev,
          totalMembers: membersCountResponse.count,
          memberChangePercent,
          newMembersThisMonth: membersCountResponse.count - membersCountResponse.previousCount
        }));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

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
    { id: 2, title: "Tithe received", description: "₵150.00 from Jane Smith", time: "5 hours ago", icon: CediSign },
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
          change={stats.memberChangePercent} 
          icon={<Users className="h-5 w-5" />} 
          color={circularColors[0]} 
        />
        <MetricCard 
          title="Weekly Attendance" 
          value={stats.weeklyAttendance} 
          change={stats.previousWeekAttendance > 0 
            ? Math.round(((stats.weeklyAttendance - stats.previousWeekAttendance) / stats.previousWeekAttendance) * 100) 
            : stats.weeklyAttendance > 0 ? 100 : 0} 
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
                  <p className="text-sm text-muted-foreground">Last 30 days trend</p>
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
                <AnimatedCircularMetric 
                  label="Attendance Rate" 
                  value={stats.attendanceRate} 
                  max={100} 
                  color={circularColors[2]} 
                  suffix="%" 
                  change={stats.previousAttendanceRate > 0 
                    ? stats.attendanceRate - stats.previousAttendanceRate
                    : stats.attendanceRate > 0 ? stats.attendanceRate : 0} 
                />
                <AnimatedCircularMetric 
                  label="Weekly Avg" 
                  value={stats.weeklyAttendance} 
                  max={1000} 
                  color={circularColors[0]} 
                  change={stats.previousWeekAttendance > 0 
                    ? Math.round(((stats.weeklyAttendance - stats.previousWeekAttendance) / stats.previousWeekAttendance) * 100) 
                    : stats.weeklyAttendance > 0 ? 100 : 0} 
                />
                <AnimatedCircularMetric 
                  label="Monthly Growth" 
                  value={Math.abs(stats.monthlyGrowth)} 
                  max={100} 
                  color={stats.monthlyGrowth >= 0 ? circularColors[1] : circularColors[4]} 
                  suffix="%" 
                  change={stats.monthlyGrowth} 
                />
                <AnimatedCircularMetric 
                  label="Absentees" 
                  value={stats.absenteesPercentage} 
                  max={100} 
                  color={circularColors[4]} 
                  suffix="%" 
                  change={stats.previousAbsenteesPercentage > 0 
                    ? stats.previousAbsenteesPercentage - stats.absenteesPercentage
                    : stats.absenteesPercentage > 0 ? -stats.absenteesPercentage : 0} 
                />
              </div>
            </div>
            <div className="h-80 w-full">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <AttendanceTrends attendanceData={attendanceData} />
              )}
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
                prefix="₵" 
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

// Animated Circular Metric
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
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const strokeWidth = 10;
  const size = (radius + strokeWidth) * 2;
  const viewBox = `0 0 ${size} ${size}`;
  const offset = circumference * (1 - percentage / 100);

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
