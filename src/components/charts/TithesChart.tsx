/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { tithesApi } from "@/lib/api/tithes";
import { Tithe } from "@/lib/api/tithes/types";

const COLORS = [
  "#3B82F6", // blue-500
  "#6366F1", // indigo-500
  "#8B5CF6", // violet-500
  "#06B6D4", // cyan-500
  "#14B8A6", // teal-500
  "#0EA5E9", // sky-500
];

const HOVER_COLORS = [
  "#2563EB", // blue-600
  "#4F46E5", // indigo-600
  "#7C3AED", // violet-600
  "#0891B2", // cyan-600
  "#0D9488", // teal-600
  "#0284C7", // sky-600
];


export function TithesChart() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [data, setData] = useState<Array<{ name: string; amount: number }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        const end = new Date();
        const start = new Date(end.getFullYear(), end.getMonth() - 5, 1); // last 6 months

        const tithes = await tithesApi.getTithes({
          startDate: start.toISOString(),
          endDate: end.toISOString(),
        });

        const months: Date[] = [];
        for (let i = 0; i < 6; i++) {
          months.push(new Date(start.getFullYear(), start.getMonth() + i, 1));
        }

        const monthKeys = months.map(
          (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        );

        const sums: Record<string, number> = {};
        monthKeys.forEach((k) => (sums[k] = 0));

        const tithesData = ('data' in tithes ? tithes.data : tithes) as Tithe[];

        for (const t of tithesData) {
          if (t.paymentType !== 'TITHE') continue;
          const pd = t.paymentDate || t.createdAt;
          if (!pd) continue;
          const dt = new Date(pd);
          const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
          if (key in sums) sums[key] += t.amount || 0;
        }

        const result = months.map((d) => {
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          return { name: d.toLocaleString(undefined, { month: 'short' }), amount: Math.round(sums[key] || 0) };
        });

        if (mounted) setData(result);
      } catch (err) {
        console.error('Failed to load tithes chart data', err);
        if (mounted) setError('Failed to load tithes');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();
    return () => {
      mounted = false;
    };
  }, []);

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
      <div className="mb-5 pb-3 border-b border-border flex items-center justify-between">
        <h3 className="text-lg font-semibold">Monthly Tithes</h3>
      </div>
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 5,
              right: 5,
              left: 5,
              bottom: 30,
            }}
            barCategoryGap="25%"
          >
            {/* Grid */}
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(148, 163, 184, 0.15)"
              vertical={false}
            />

            {/* X Axis */}
            <XAxis
              dataKey="name"
              tick={{ fill: "currentColor", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />

            {/* Y Axis */}
            <YAxis
              tickFormatter={(value) => `₵${value}`}
              tick={{ fill: "currentColor", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={50}
            />

            {/* Tooltip */}
            <Tooltip
              cursor={{ fill: "rgba(0,0,0,0.04)" }}
              content={({ active, payload, label }) => {
                if (active && payload?.[0]?.value !== undefined) {
                  return (
                    <div className="bg-background/90 backdrop-blur-md border border-border rounded-lg px-3 py-2 shadow-md">
                      <p className="font-medium text-sm">{label}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Amount:{" "}
                        <span className="font-semibold text-foreground">
                          ₵{payload[0].value.toLocaleString()}
                        </span>
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />

            {/* Bars */}
            <Bar
              dataKey="amount"
              name="Tithes"
              radius={[8, 8, 0, 0]}
              animationDuration={1500}
              animationEasing="ease-out"
              animationBegin={200}
              isAnimationActive={true}
              style={{
                transition: 'all 0.3s ease-out',
              }}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={hoveredIndex === index 
                    ? HOVER_COLORS[index % HOVER_COLORS.length] 
                    : COLORS[index % COLORS.length]}
                  className="transition-all duration-300 ease-out"
                  style={{
                    transform: hoveredIndex === index 
                      ? 'translateY(-4px)' 
                      : 'translateY(0)',
                    opacity: hoveredIndex === null || hoveredIndex === index ? 1 : 0.7,
                    transition: 'all 0.3s ease-out'
                  }}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              ))}
            </Bar>

            {/* Legend */}
            <Legend
              verticalAlign="bottom"
              align="center"
              content={({ payload }) => (
                <div className="flex justify-center mt-3 flex-wrap gap-2 text-xs">
                  {payload?.map((entry, index) => (
                    <div
                      key={`legend-${index}`}
                      className="flex items-center text-xs text-muted-foreground"
                    >
                      <div
                        className="w-3 h-3 rounded-full mr-2"
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
