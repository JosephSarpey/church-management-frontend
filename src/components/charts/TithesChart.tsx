"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { motion } from "framer-motion";

const COLORS = [
  '#4F46E5', // indigo-600
  '#7C3AED', // violet-600
  '#9333EA', // purple-600
  '#C026D3', // fuchsia-600
  '#F59E0B', // amber-500
  '#10B981'  // emerald-500
];

const HOVER_COLORS = [
  '#4338CA', // indigo-700
  '#6D28D9', // violet-700
  '#7E22CE', // purple-700
  '#A21CAF', // fuchsia-700
  '#D97706', // amber-600
  '#059669'  // emerald-600
];

const data = [
  { name: "Jan", amount: 1200, color: COLORS[0] },
  { name: "Feb", amount: 1500, color: COLORS[1] },
  { name: "Mar", amount: 1000, color: COLORS[2] },
  { name: "Apr", amount: 1800, color: COLORS[3] },
  { name: "May", amount: 1600, color: COLORS[4] },
  { name: "Jun", amount: 2000, color: COLORS[5] },
];

export function TithesChart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm"
    >
      <h3 className="text-lg font-medium mb-4">Monthly Tithes</h3>
      <div className="h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 60,
            }}
            barGap={4}
            barCategoryGap="20%"
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              className="stroke-gray-100 dark:stroke-gray-700" 
              vertical={false}
            />
            <XAxis 
              dataKey="name" 
              className="text-xs"
              tick={{ fill: 'currentColor' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              className="text-xs"
              tickFormatter={(value) => `$${value}`}
              tick={{ fill: 'currentColor' }}
              axisLine={false}
              tickLine={false}
              width={60}
            />
            <Tooltip 
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                      <p className="font-semibold text-sm mb-1">{label}</p>
                      <p className="text-sm">
                        <span className="text-muted-foreground">Amount: </span>
                        <span className="font-medium">${payload[0].value?.toLocaleString()}</span>
                      </p>
                    </div>
                  );
                }
                return null;
              }}
              cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
              wrapperStyle={{
                zIndex: 100,
                position: 'absolute',
                top: -70,
                left: 0,
              }}
            />
            <Bar 
              dataKey="amount"
              name="Tithes"
              radius={[4, 4, 0, 0]}
              animationDuration={1500}
              animationEasing="ease-out"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  className="transition-all duration-300 hover:opacity-90"
                  onMouseEnter={() => {
                    const element = document.querySelector(`.bar-${index}`);
                    if (element) {
                      element.setAttribute('fill', HOVER_COLORS[index % HOVER_COLORS.length]);
                    }
                  }}
                  onMouseLeave={() => {
                    const element = document.querySelector(`.bar-${index}`);
                    if (element) {
                      element.setAttribute('fill', COLORS[index % COLORS.length]);
                    }
                  }}
                />
              ))}
            </Bar>
            <Legend 
              verticalAlign="bottom"
              content={({ payload }) => (
                <div className="flex justify-center mt-6 space-x-4">
                  {payload?.map((entry, index) => (
                    <div key={`item-${index}`} className="flex items-center text-sm">
                      <div 
                        className="w-3 h-3 rounded mr-2" 
                        style={{ backgroundColor: entry.color }}
                      />
                      {entry.value}
                    </div>
                  ))}
                </div>
              )}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
