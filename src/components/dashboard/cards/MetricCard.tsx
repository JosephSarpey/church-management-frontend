import { ArrowUp, ArrowDown } from "lucide-react";
import { motion } from "framer-motion";

interface MetricCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  color: string;
}

export function MetricCard({ title, value, change, icon, color }: MetricCardProps) {
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
