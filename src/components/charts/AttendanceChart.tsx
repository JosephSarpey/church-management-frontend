"use client";

import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { motion } from "framer-motion";

interface LabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
  index: number;
  name: string;
  value: number;
}

interface DataProps {
  name: string;
  value: number;
}

const COLORS = [
  "#0EA5E9", // sky-500
  "#0284C7", // sky-600
  "#6366F1", // indigo-500
  "#4F46E5", // indigo-600
  "#14B8A6", // teal-500
  "#0D9488", // teal-600
  "#38BDF8", // sky-400
];

const HOVER_COLORS = [
  "#0284C7",
  "#0369A1",
  "#4F46E5",
  "#4338CA",
  "#0D9488",
  "#0F766E",
  "#0EA5E9",
];

const data: DataProps[] = [
  { name: "Sunday", value: 80 },
  { name: "Monday", value: 85 },
  { name: "Tuesday", value: 78 },
  { name: "Wednesday", value: 90 },
  { name: "Thursday", value: 88 },
  { name: "Friday", value: 92 },
  { name: "Saturday", value: 87 },
];

const RADIAN = Math.PI / 180;

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: LabelProps) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      className="text-[10px] font-medium"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export function AttendanceChart() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ 
        opacity: 1, 
        y: 0, 
        scale: isHovered ? 1.01 : 1 
      }}
      transition={{ 
        duration: 0.6, 
        ease: "easeOut",
        scale: { type: "spring", stiffness: 300, damping: 15 }
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="w-full bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300"
    >
      <div className="mb-5 pb-3 border-b border-border">
        <h3 className="text-lg font-semibold">Weekly Attendance</h3>
      </div>
      <div className="h-[320px] sm:h-[280px] flex flex-col sm:flex-row">
        <div className="relative flex-1 min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                labelLine={false}
                label={renderCustomizedLabel}
                dataKey="value"
                animationBegin={200}
                animationDuration={1500}
                animationEasing="ease-out"
                onMouseEnter={(_, index) => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {data.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      hoveredIndex === index
                        ? HOVER_COLORS[index % HOVER_COLORS.length]
                        : COLORS[index % COLORS.length]
                    }
                    stroke="#fff"
                    strokeWidth={1.5}
                    style={{
                      transform: hoveredIndex === index 
                        ? 'scale(1.08) translate(2px, -2px)' 
                        : 'scale(1)',
                      transformOrigin: "center",
                      opacity: hoveredIndex === null || hoveredIndex === index ? 1 : 0.8,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string) => [`${value}%`, name]}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Center Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
              {total}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Total
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4 sm:mt-0 sm:ml-4 sm:flex-col sm:justify-start sm:overflow-y-auto sm:pr-2 sm:max-h-full">
          {data.map((item, index) => (
            <motion.div 
              key={`legend-${index}`} 
              className="flex items-center cursor-pointer"
              initial={{ opacity: 0, x: -10 }}
              animate={{ 
                opacity: 1, 
                x: 0,
                color: hoveredIndex === index ? 'var(--color-primary, #4F46E5)' : 'inherit'
              }}
              transition={{ 
                duration: 0.3, 
                delay: 0.1 * index,
                ease: "easeOut"
              }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <motion.div
                className="w-4 h-4 rounded-full mr-2"
                style={{
                  backgroundColor:
                    hoveredIndex === index
                      ? HOVER_COLORS[index % HOVER_COLORS.length]
                      : COLORS[index % COLORS.length],
                }}
                animate={{
                  scale: hoveredIndex === index ? 1.2 : 1,
                  boxShadow: hoveredIndex === index ? '0 0 0 2px rgba(255,255,255,0.5)' : 'none'
                }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
              <div className="flex items-baseline min-w-0">
                <span className="text-sm font-medium truncate">{item.name}</span>
                <motion.span 
                  className="ml-2 text-xs text-muted-foreground whitespace-nowrap"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: hoveredIndex === index ? 1 : 0 }}
                >
                  {((item.value / total) * 100).toFixed(1)}%
                </motion.span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
