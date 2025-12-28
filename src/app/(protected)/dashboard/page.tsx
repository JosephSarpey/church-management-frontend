'use client';

import { useEffect, useState } from "react";
import { membersApi } from "@/lib/api/members";
import { attendanceApi } from "@/lib/api/attendance";
import { tithesApi } from "@/lib/api/tithes";
import { Tithe } from "@/lib/api/tithes/types";
import { eventsApi } from "@/lib/api/events";
import type { Event } from "@/lib/api/events/types";
import { endOfDay, subDays } from "date-fns";
import { toast } from "sonner";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { ServiceType } from "@/lib/api/attendance/types";

import { DashboardHeader } from "@/components/dashboard/sections/DashboardHeader";
import { StatsGrid } from "@/components/dashboard/sections/StatsGrid";
import { AttendanceOverview } from "@/components/dashboard/sections/AttendanceOverview";
import { UpcomingEventsList } from "@/components/dashboard/sections/UpcomingEventsList";
import { RecentActivity } from "@/components/dashboard/sections/RecentActivity";
import { TithesOverview } from "@/components/dashboard/sections/TithesOverview";

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
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
    upcomingEventsChange: 0,
    attendanceRate: 0,
    previousAttendanceRate: 0,
    monthlyGrowth: 0,
    monthlyTithesChange: 0,
    previousMonthlyTithes: 0,
    absenteesPercentage: 0,
    previousAbsenteesPercentage: 0
  });

  const circularColors = ["#4F46E5", "#3B82F6", "#10B981", "#F59E0B", "#EF4444"];

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
      const currentMonthRecords = Array.isArray(currentMonthResponse.data)
        ? currentMonthResponse.data.map(record => ({
            ...record,
            date: new Date(record.date)
          }))
        : [];

      // Process previous month data
      const previousMonthRecords = Array.isArray(previousMonthResponse.data)
        ? previousMonthResponse.data.map(record => ({
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
      
      // Group attendance by service type and date to count absentees
      const serviceAttendance = currentMonthRecords.reduce((acc, record) => {
        const date = record.date instanceof Date 
          ? record.date.toISOString().split('T')[0] 
          : (record.date as unknown as string).split('T')[0];
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
        const date = record.date instanceof Date 
          ? record.date.toISOString().split('T')[0] 
          : (record.date as unknown as string).split('T')[0];
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

  const fetchUpcomingEvents = async () => {
    try {
      const [upcoming, pastResponse] = await Promise.all([
        eventsApi.getUpcomingEvents(),
        eventsApi.getEvents({ status: 'COMPLETED', take: 100 })
      ]);

      const now = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(now.getDate() + 30);
      const thirtyDaysAgo = subDays(now, 30);

      // Count events in the next 30 days
      const upcomingCount30Days = upcoming.filter(event => {
        const date = new Date(event.startTime);
        return date >= now && date <= thirtyDaysFromNow;
      }).length;

      // Count events in the last 30 days
      const pastEvents = pastResponse.data || [];
      const pastCount30Days = pastEvents.filter(event => {
        const date = new Date(event.startTime);
        return date >= thirtyDaysAgo && date <= now;
      }).length;

      const change = pastCount30Days === 0 
        ? (upcomingCount30Days > 0 ? 100 : 0)
        : Math.round(((upcomingCount30Days - pastCount30Days) / pastCount30Days) * 100);

      setUpcomingEvents(upcoming);
      setStats(prev => ({
        ...prev,
        upcomingEvents: upcoming.length,
        upcomingEventsChange: change
      }));
    } catch (error) {
      console.error('Error fetching events data:', error);
      toast.error('Failed to load events data');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch upcoming events in parallel with other data
        await Promise.all([
          fetchUpcomingEvents(),
        ]);
        setIsLoading(true);
        
        // First fetch members count
        const membersCountResponse = await membersApi.getTotalMembersCount();
        
        // Then fetch attendance data with the members count
        await fetchAttendanceData(membersCountResponse.count);
        
        // Percentage helper (used for members and tithes)
        const calculatePercentageChange = (current: number, previous: number): number => {
          if (previous === 0) return current > 0 ? 100 : 0;
          return Number((((current - previous) / previous) * 100).toFixed(1));
        };

        // Fetch tithes for the current month and previous month, then compute totals and change
        try {
          const firstOfMonth = new Date();
          firstOfMonth.setDate(1);
          firstOfMonth.setHours(0, 0, 0, 0);

          const prevMonthStart = new Date(firstOfMonth);
          prevMonthStart.setMonth(prevMonthStart.getMonth() - 1);
          prevMonthStart.setDate(1);
          prevMonthStart.setHours(0, 0, 0, 0);

          const prevMonthEnd = endOfDay(subDays(firstOfMonth, 1));

          const [tithesThisMonth, tithesPreviousMonth] = await Promise.all([
            tithesApi.getTithes({ startDate: firstOfMonth.toISOString(), endDate: endOfDay(new Date()).toISOString() }),
            tithesApi.getTithes({ startDate: prevMonthStart.toISOString(), endDate: prevMonthEnd.toISOString() }),
          ]);

          const tithesThisMonthData = 'data' in tithesThisMonth ? tithesThisMonth.data : (tithesThisMonth as unknown as Tithe[]);
          const tithesPreviousMonthData = 'data' in tithesPreviousMonth ? tithesPreviousMonth.data : (tithesPreviousMonth as unknown as Tithe[]);

          const monthlyTithesAmount = tithesThisMonthData.reduce((sum: number, t: Tithe) => sum + (t.paymentType === 'TITHE' ? (t.amount || 0) : 0), 0);
          const previousMonthlyTithesAmount = tithesPreviousMonthData.reduce((sum: number, t: Tithe) => sum + (t.paymentType === 'TITHE' ? (t.amount || 0) : 0), 0);

          const tithesChangePercent = calculatePercentageChange(monthlyTithesAmount, previousMonthlyTithesAmount);

          setStats(prev => ({
            ...prev,
            monthlyTithes: monthlyTithesAmount,
            previousMonthlyTithes: previousMonthlyTithesAmount,
            monthlyTithesChange: tithesChangePercent,
          }));
        } catch (err) {
          console.error('Failed to load tithes:', err);
        }
        
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

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8">
      {/* Header */}
      <DashboardHeader />

      {/* Stats Grid */}
      <StatsGrid stats={stats} circularColors={circularColors} />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Attendance Overview - 2/3 width */}
        <AttendanceOverview 
          isLoading={isLoading} 
          attendanceData={attendanceData} 
          stats={stats} 
          circularColors={circularColors} 
        />

        {/* Upcoming Events - 1/3 width */}
        <UpcomingEventsList upcomingEvents={upcomingEvents} />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <RecentActivity />

        {/* Tithes */}
        <TithesOverview stats={stats} circularColors={circularColors} />
      </div>
    </div>
  );
}
