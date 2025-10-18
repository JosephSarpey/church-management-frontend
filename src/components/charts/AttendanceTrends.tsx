"use client";

import { useMemo } from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { motion } from "framer-motion";
import { ServiceType } from "@/lib/api/attendance/types";
import { format } from "date-fns";
import { TooltipProps } from "recharts";
import { useTheme } from "next-themes";

interface AttendanceRecord {
  date: Date;
  serviceType: ServiceType;
  isVisitor: boolean;
}

interface AttendanceTrendsProps {
  attendanceData: AttendanceRecord[];
}

const serviceTypeLabels: Record<ServiceType, string> = {
  [ServiceType.SUNDAY_SERVICE]: "Sunday Service",
  [ServiceType.BIBLE_STUDY]: "Bible Study",
  [ServiceType.PRAYER_MEETING]: "Prayer Meeting",
  [ServiceType.SPECIAL_EVENT]: "Special Service",
  [ServiceType.YOUTH_SERVICE]: "Youth Service",
  [ServiceType.CHILDREN_SERVICE]: "Children Service",
  [ServiceType.OTHER]: "Other",
};

const COLORS = [
  "#3b82f6", // blue-500
  "#10b981", // emerald-500
  "#8b5cf6", // violet-500
  "#ec4899", // pink-500
  "#f59e0b", // amber-500
  "#14b8a6", // teal-500
];

export function AttendanceTrends({ attendanceData }: AttendanceTrendsProps) {
  const chartData = useMemo(() => {
    const dateMap = new Map<string, { date: string } & Record<string, number>>();
    const today = new Date();

    // Initialize with empty data for the last 30 days
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const initialData = Object.values(ServiceType).reduce((acc, type) => {
        acc[serviceTypeLabels[type]] = 0;
        return acc;
      }, {} as Record<string, number>);
      
      dateMap.set(dateStr, {
        date: format(date, "MMM d"),
        ...initialData
      } as { date: string } & Record<string, number>);
    }

    // Fill with actual data
    attendanceData.forEach((record) => {
      const dateStr = record.date.toISOString().split("T")[0];
      const serviceType = serviceTypeLabels[record.serviceType];

      if (dateMap.has(dateStr)) {
        const dateData = dateMap.get(dateStr)!;
        dateData[serviceType] = (dateData[serviceType] || 0) + 1;
      }
    });

    return Array.from(dateMap.values());
  }, [attendanceData]);

  const serviceTypes = Object.values(ServiceType).map(
    (type) => serviceTypeLabels[type]
  );

  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  if (!active || !payload || !payload.length) return null;
  return (
    <div className={`p-3 shadow-lg rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <p className={`font-medium mb-2 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{label}</p>
      {payload
        .sort((a, b) => (b.value ?? 0) - (a.value ?? 0))
        .map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: <span className="font-medium">{entry.value}</span>
          </p>
        ))}
    </div>
  );
};

  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`w-full h-full rounded-lg ${isDark ? 'bg-gray-900' : 'bg-white'}`}
    >
      <div className="w-full h-full p-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              {serviceTypes.map((serviceType, index) => {
                const gradientId = `color-${serviceType.replace(/\s+/g, "-")}`;
                return (
                  <linearGradient
                    key={gradientId}
                    id={gradientId}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={COLORS[index % COLORS.length]}
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor={COLORS[index % COLORS.length]}
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                );
              })}
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke={isDark ? '#374151' : '#f1f5f9'}
            />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: isDark ? '#9ca3af' : '#64748b', fontSize: 10 }}
              tickMargin={10}
              interval={Math.floor(chartData.length / 7)} // Show ~7 labels
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: isDark ? '#9ca3af' : '#64748b', fontSize: 10 }}
              tickMargin={10}
              width={30}
            />
            <Tooltip
              content={CustomTooltip}
              cursor={{ stroke: isDark ? '#4b5563' : '#cbd5e1', strokeWidth: 1 }}
            />
            {serviceTypes.map((serviceType, index) => {
              const gradientId = `color-${serviceType.replace(/\s+/g, "-")}`;
              return (
                <Area
                  key={gradientId}
                  type="monotone"
                  dataKey={serviceType}
                  name={serviceType}
                  stroke={COLORS[index % COLORS.length]}
                  fillOpacity={1}
                  fill={`url(#${gradientId})`}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{
                    r: 4,
                    stroke: COLORS[index % COLORS.length],
                    strokeWidth: 2,
                    fill: isDark ? '#1f2937' : '#ffffff',
                  }}
                />
              );
            })}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
