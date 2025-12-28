import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { TithesChart } from "@/components/charts/TithesChart";
import { AnimatedCircularMetric } from "../metrics/AnimatedCircularMetric";

interface TithesOverviewProps {
  stats: {
    monthlyTithes: number;
    monthlyTithesChange: number;
  };
  circularColors: string[];
}

export function TithesOverview({ stats, circularColors }: TithesOverviewProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-card rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Tithes</h2>
            <p className="text-sm text-muted-foreground">Monthly breakdown</p>
          </div>
          <Link 
            href="/tithes" 
            className="text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center"
          >
            View tithes <ArrowUpRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <AnimatedCircularMetric 
            label="This Month" 
            value={stats.monthlyTithes} 
            max={10000} 
            color={circularColors[2]} 
            prefix="₵" 
            change={stats.monthlyTithesChange} 
          />
          <AnimatedCircularMetric 
            label="Growth" 
            value={stats.monthlyTithesChange} 
            max={100} 
            suffix="%" 
            color={stats.monthlyTithesChange >= 0 ? circularColors[1] : circularColors[4]} 
            change={stats.monthlyTithesChange} 
          />
        </div>
        
        <div className="h-64">
          <TithesChart />
        </div>
      </div>
    </motion.div>
  );
}
