"use client";

import { motion } from "framer-motion";
import { ArrowRight, UserPlus, CalendarDays, Loader2, Banknote } from "lucide-react";
import { useEffect, useState } from "react";
import { activityApi } from "@/lib/api";
import { RecentActivity as RecentActivityType } from "@/lib/api/activity/types";
import { formatRelativeTime } from "@/lib/utils/time";
import { ActivityModal } from "@/components/modals/ActivityModal";

interface ActivityItem {
  id: string;
  title: string;
  description: string;
  time: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function RecentActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await activityApi.getRecentActivities(3);
        
        // Map the data to the format expected by the UI
        const mappedActivities: ActivityItem[] = data.map((activity: RecentActivityType) => {
          let icon: React.ComponentType<{ className?: string }>;
          
          switch (activity.iconType) {
            case 'user':
              icon = UserPlus;
              break;
            case 'cedi':
              icon = Banknote;
              break;
            case 'calendar':
              icon = CalendarDays;
              break;
            default:
              icon = UserPlus;
          }

          return {
            id: activity.id,
            title: activity.title,
            description: activity.description,
            time: formatRelativeTime(activity.timestamp),
            icon,
          };
        });

        setActivities(mappedActivities);
      } catch (err) {
        console.error('Failed to fetch recent activities:', err);
        setError('Failed to load recent activities');
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
        className="bg-card rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Recent Activities</h2>
              <p className="text-sm text-muted-foreground">Latest updates</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center"
            >
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-start group">
                  <div className="flex-shrink-0 h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center mr-3 transition-colors group-hover:bg-primary/20">
                    <activity.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{activity.title}</p>
                    <p className="text-sm text-muted-foreground truncate">{activity.description}</p>
                    <p className="text-xs text-muted-foreground/80 mt-0.5">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      <ActivityModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
}

