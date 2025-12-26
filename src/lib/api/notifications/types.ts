export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  link?: string;
  metadata?: any;
  createdAt: string;
  readAt?: string;
}

export interface NotificationStats {
  unreadCount: number;
}
