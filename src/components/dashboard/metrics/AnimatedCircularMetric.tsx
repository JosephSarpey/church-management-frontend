import { ArrowUp, ArrowDown } from "lucide-react";
import { motion } from "framer-motion";

interface AnimatedCircularMetricProps {
  label: string;
  value: number;
  max: number;
  color: string;
  prefix?: string;
  suffix?: string;
  change: number;
}

export function AnimatedCircularMetric({
  label,
  value,
  max,
  color,
  prefix = '',
  suffix = '',
  change,
}: AnimatedCircularMetricProps) {
  const percentage = Math.min(100, (value > 0 ? value / max : 0) * 100);
  const isPositive = change >= 0;
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const strokeWidth = 10;
  const size = (radius + strokeWidth) * 2;
  const viewBox = `0 0 ${size} ${size}`;
  const offset = circumference * (1 - percentage / 100);

  const formatValue = (val: number) => {
    if (suffix === '%') return `${Math.round(val)}${suffix}`;
    if (prefix) return `${prefix}${val.toLocaleString()}`;
    return `${val}${suffix}`;
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg 
          viewBox={viewBox} 
          className="w-full h-full -rotate-90"
          aria-hidden="true"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--muted)"
            strokeWidth={strokeWidth}
            strokeOpacity="0.2"
          />
          {/* Animated progress circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{
              duration: 1.5,
              ease: "easeInOut",
              delay: 0.2
            }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-center">
            <p className="text-xs font-semibold text-foreground">
              {formatValue(value)}
            </p>
            <div 
              className={`flex items-center justify-center text-[10px] font-medium ${
                isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}
            >
              {isPositive ? (
                <ArrowUp className="mr-0.5 h-2.5 w-2.5" />
              ) : (
                <ArrowDown className="mr-0.5 h-2.5 w-2.5" />
              )}
              {Math.abs(change)}%
            </div>
          </div>
        </div>
      </div>
      <p className="mt-2 text-xs font-medium text-muted-foreground text-center">
        {label}
      </p>
    </div>
  );
}
