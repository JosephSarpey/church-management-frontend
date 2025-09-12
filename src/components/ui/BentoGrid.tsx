/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ReactNode } from "react";

type BentoGridProps = {
  children: ReactNode;
  className?: string;
  containerClassName?: string;
};

export const BentoGrid = ({
  children,
  className,
  containerClassName,
}: BentoGridProps) => {
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto",
        containerClassName
      )}
    >
      {children}
    </div>
  );
};

type BentoGridItemProps = {
  className?: string;
  title?: string | ReactNode;
  description?: string | ReactNode;
  header?: ReactNode;
  icon?: ReactNode;
  span?: "1" | "2" | "3" | "4" | "5" | "6";
  row?: "1" | "2";
};

export const BentoGridItem = ({
  className,
  title,
  description,
  header,
  icon,
  span = "1",
  row = "1",
}: BentoGridItemProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className={cn(
        "row-span-1 rounded-xl group/bento hover:shadow-xl transition duration-200 shadow-input dark:shadow-none p-4 bg-white dark:bg-gray-800 border border-transparent dark:border-white/[0.2] hover:border-gray-200 dark:hover:border-gray-700 overflow-hidden",
        `col-span-${span}`,
        `row-span-${row}`,
        className
      )}
    >
      {header || (
        <div className="flex flex-col h-full">
          {icon && <div className="mb-4">{icon}</div>}
          {title && (
            <h3 className="font-bold text-lg mb-2 group-hover/bento:text-primary transition-colors">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {description}
            </p>
          )}
        </div>
      )}
    </motion.div>
  );
};
