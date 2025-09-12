"use client";

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
  color: string;
}

const COLORS = [
  '#4F46E5', // indigo-600
  '#7C3AED', // violet-600
  '#9333EA', // purple-600
  '#C026D3', // fuchsia-600
  '#DB2777', // pink-600
  '#E11D48', // rose-600
  '#F59E0B'  // amber-500
];

const HOVER_COLORS = [
  '#4338CA', // indigo-700
  '#6D28D9', // violet-700
  '#7E22CE', // purple-700
  '#A21CAF', // fuchsia-700
  '#BE185D', // pink-700
  '#BE123C', // rose-700
  '#D97706'  // amber-600
];

const data: DataProps[] = [
  { name: "Sunday", value: 80, color: COLORS[0] },
  { name: "Monday", value: 85, color: COLORS[1] },
  { name: "Tuesday", value: 78, color: COLORS[2] },
  { name: "Wednesday", value: 90, color: COLORS[3] },
  { name: "Thursday", value: 88, color: COLORS[4] },
  { name: "Friday", value: 92, color: COLORS[5] },
  { name: "Saturday", value: 87, color: COLORS[6] },
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
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      className="text-xs font-medium"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export function AttendanceChart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm"
    >
      <h3 className="text-lg font-medium mb-4">Weekly Attendance</h3>
      <div className="h-[400px] flex">
        <div className="flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={0}
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={100}
                dataKey="value"
                animationBegin={0}
                animationDuration={1000}
                animationEasing="ease-out"
                onMouseEnter={(_, index) => {
                  // Update color on hover for better feedback
                  if (index >= 0) {
                    const updatedData = [...data];
                    updatedData[index] = {
                      ...updatedData[index],
                      color: HOVER_COLORS[index % HOVER_COLORS.length],
                    };
                  }
                }}
                onMouseLeave={(_, index) => {
                  // Revert to original color on mouse leave
                  if (index >= 0) {
                    const updatedData = [...data];
                    updatedData[index] = {
                      ...updatedData[index],
                      color: COLORS[index % COLORS.length],
                    };
                  }
                }}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke="#fff"
                    strokeWidth={1}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string) => [
                  `${value}%`,
                  name,
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Vertical Legend */}
        <div className="flex flex-col justify-center space-y-2 ml-4">
          {data.map((item, index) => (
            <div key={`legend-${index}`} className="flex items-center">
              <div 
                className="w-4 h-4 rounded-full mr-2"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm">{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
