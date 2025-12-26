"use client";

import { useEffect, useState } from "react";
import { X, UserPlus, CalendarDays, Banknote, Loader2 } from "lucide-react";
import { activityApi } from "@/lib/api";
import { RecentActivity } from "@/lib/api/activity/types";
import { formatRelativeTime } from "@/lib/utils/time";

interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ActivityItem {
  id: string;
  title: string;
  description: string;
  time: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function ActivityModal({ isOpen, onClose }: ActivityModalProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchAllActivities();
    }
  }, [isOpen]);

  const fetchAllActivities = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch more activities for the modal (e.g., 50 instead of 5)
      const data = await activityApi.getRecentActivities(50);
      
      const mappedActivities: ActivityItem[] = data.map((activity: RecentActivity) => {
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
      console.error('Failed to fetch activities:', err);
      setError('Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-card border border-border rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold text-foreground">All Activities</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {activities.length} {activities.length === 1 ? 'activity' : 'activities'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-muted-foreground">No activities found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div 
                  key={activity.id} 
                  className="flex items-start p-4 rounded-lg hover:bg-muted/50 transition-colors group"
                >
                  <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mr-4 transition-colors group-hover:bg-primary/20">
                    <activity.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{activity.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                    <p className="text-xs text-muted-foreground/80 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
