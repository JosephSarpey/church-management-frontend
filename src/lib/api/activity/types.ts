import { LucideIcon } from 'lucide-react';

export type ActivityType = 'MEMBER_JOINED' | 'TITHE_RECEIVED' | 'EVENT_CREATED';

export interface RecentActivity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: Date;
  iconType: 'user' | 'cedi' | 'calendar';
}

export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  time: string;
  icon: LucideIcon | React.ComponentType<{ className?: string }>;
}
