import React from 'react';
import { Notification } from '@/hooks/useNotifications';
import { Check, Clock, Calendar, Info } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface NotificationListProps {
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}

const getIcon = (type: string) => {
  switch (type) {
    case 'BIRTHDAY': return <Calendar className="w-4 h-4 text-purple-500" />;
    case 'EVENT': return <Clock className="w-4 h-4 text-blue-500" />;
    case 'SUCCESS': return <Check className="w-4 h-4 text-green-500" />;
    default: return <Info className="w-4 h-4 text-gray-500" />;
  }
};

const NotificationList: React.FC<NotificationListProps> = ({ notifications, onMarkRead, onMarkAllRead }) => {
  return (
    <div className="flex flex-col max-h-[80vh]">
      <div className="p-3 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
        <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">Notifications</h3>
        <div className="flex gap-2 text-xs">
          <button onClick={onMarkAllRead} className="text-blue-600 dark:text-blue-400 hover:underline">
            Mark all read
          </button>
        </div>
      </div>

      <div className="overflow-y-auto flex-1">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">
            No notifications yet
          </div>
        ) : (
          notifications.map((notification) => (
            <div 
              key={notification.id}
              className={`p-4 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer ${!notification.isRead ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}
              onClick={() => onMarkRead(notification.id)}
            >
              <div className="flex gap-3">
                <div className={`mt-1 h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${!notification.isRead ? 'bg-white shadow-sm' : 'bg-gray-100 dark:bg-gray-800'}`}>
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1 space-y-1">
                  <p className={`text-sm ${!notification.isRead ? 'font-medium text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                    {notification.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                    {notification.message}
                  </p>
                  <p className="text-[10px] text-gray-400">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </p>
                </div>
                {!notification.isRead && (
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0" />
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationList;
