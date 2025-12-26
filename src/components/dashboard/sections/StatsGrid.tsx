import { motion } from "framer-motion";
import { Users, CalendarCheck, DollarSign, Activity } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { MetricCard } from "../cards/MetricCard";

interface StatsGridProps {
  stats: {
    totalMembers: number;
    memberChangePercent: number;
    weeklyAttendance: number;
    previousWeekAttendance: number;
    monthlyTithes: number;
    monthlyTithesChange: number;
    upcomingEvents: number;
    upcomingEventsChange: number;
  };
  circularColors: string[];
}

export function StatsGrid({ stats, circularColors }: StatsGridProps) {
  return (
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
        icon={<Users className="h-5 text-amber-500 w-5" />} 
        color={circularColors[0]} 
      />
      <MetricCard 
        title="Weekly Attendance" 
        value={stats.weeklyAttendance} 
        change={stats.previousWeekAttendance > 0 
          ? Math.round(((stats.weeklyAttendance - stats.previousWeekAttendance) / stats.previousWeekAttendance) * 100) 
          : stats.weeklyAttendance > 0 ? 100 : 0} 
        icon={<CalendarCheck className="h-5 text-amber-500 w-5" />} 
        color={circularColors[1]} 
      />
      <MetricCard 
        title="Monthly Tithes" 
        value={formatCurrency(stats.monthlyTithes)} 
        change={stats.monthlyTithesChange} 
        icon={<DollarSign className="h-5 text-amber-500 w-5" />} 
        color={circularColors[2]} 
      />
      <MetricCard 
        title="Upcoming Events" 
        value={stats.upcomingEvents} 
        change={stats.upcomingEventsChange} 
        icon={<Activity className="h-5 text-amber-500 w-5" />} 
        color={circularColors[3]} 
      />
    </motion.div>
  );
}
