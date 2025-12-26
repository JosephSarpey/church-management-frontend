import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AttendanceTrends } from "@/components/charts/AttendanceTrends";
import { AnimatedCircularMetric } from "../metrics/AnimatedCircularMetric";
import { ServiceType } from "@/lib/api/attendance/types";

interface AttendanceOverviewProps {
  isLoading: boolean;
  attendanceData: Array<{
    id: string;
    date: Date;
    serviceType: ServiceType;
    isVisitor: boolean;
    visitorName?: string;
    member?: {
      firstName: string;
      lastName: string;
    };
  }>;
  stats: {
    attendanceRate: number;
    previousAttendanceRate: number;
    weeklyAttendance: number;
    previousWeekAttendance: number;
    monthlyGrowth: number;
    absenteesPercentage: number;
    previousAbsenteesPercentage: number;
  };
  circularColors: string[];
}

export function AttendanceOverview({ isLoading, attendanceData, stats, circularColors }: AttendanceOverviewProps) {
  return (
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
  );
}
