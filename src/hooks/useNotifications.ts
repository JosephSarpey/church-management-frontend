import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@clerk/nextjs';
import { notificationsApi } from '@/lib/api';
import { Notification } from '@/lib/api/notifications/types';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export type { Notification };

export const useNotifications = () => {
  const { userId, getToken } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef<Socket | null>(null);

  // Fetch initial notifications
  const fetchNotifications = async () => {
    if (!userId) return;
    try {
      const data = await notificationsApi.getAll(userId);
      setNotifications(data);
      setUnreadCount(data.filter((n: Notification) => !n.isRead).length);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  useEffect(() => {
    if (!userId) return;

    // Connect Socket
    socketRef.current = io(SOCKET_URL);

    socketRef.current.on('connect', () => {
      console.log('Connected to Notification Socket');
      socketRef.current?.emit('joinUserRoom', userId);
    });

    socketRef.current.on('notification', (newNotification: Notification) => {
      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);
      // Optional: Play sound or show browser notification here
    });

    fetchNotifications();

    return () => {
      socketRef.current?.disconnect();
    };
  }, [userId]);

  const markAsRead = async (id: string) => {
    // Optimistic update
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));

    try {
      await notificationsApi.markAsRead(id);
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  };

  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
    if (!userId) return;
    try {
      await notificationsApi.markAllAsRead(userId);
    } catch (err) {
      console.error('Failed to mark all read', err);
    }
  }

  return { notifications, unreadCount, markAsRead, markAllAsRead, refresh: fetchNotifications };
};
