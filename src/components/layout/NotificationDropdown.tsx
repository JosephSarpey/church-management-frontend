/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from 'react';
import { Bell, Check, Clock, AlertCircle, Calendar, Info } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();


  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'BIRTHDAY':
        return <Calendar className="h-4 w-4 text-purple-500" />;
      case 'EVENT':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'SUCCESS':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'WARNING':
         return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <DropdownMenu onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between p-4 bg-muted/20">
          <h4 className="text-sm font-medium">Notifications</h4>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 text-xs text-blue-500 hover:text-blue-600"
            onClick={(e) => {
              e.stopPropagation();
              markAllAsRead();
            }}
          >
            Mark all as read
          </Button>
        </div>
        
        <DropdownMenuSeparator />
        
        <div className="max-h-[400px] overflow-y-auto">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <DropdownMenuItem 
                key={notification.id} 
                className={`flex gap-3 p-3 cursor-pointer items-start ${!notification.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`text-sm truncate ${!notification.isRead ? 'font-semibold' : 'font-medium'}`}>{notification.title}</p>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                       {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{notification.message}</p>
                </div>
              </DropdownMenuItem>
            ))
          ) : (
            <div className="p-8 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
              <Bell className="h-8 w-8 text-muted-foreground/30" />
              <p>No new notifications</p>
            </div>
          )}
        </div>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem className="justify-center text-xs text-muted-foreground py-3 cursor-pointer hover:bg-transparent">
          View all notifications
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
