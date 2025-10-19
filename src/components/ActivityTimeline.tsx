import { CheckCircle, DollarSign, FileText, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Activity } from '@/lib/api/members/types';

interface ActivityTimelineProps {
  activities: Activity[];
}

export function ActivityTimeline({ activities = [] }: ActivityTimelineProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'tithe':
      case 'offering':
        return <DollarSign className="h-4 w-4 text-green-500" />;
      case 'attendance':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityBadge = (activity: Activity) => {
    if (activity.type === 'attendance') {
      return activity.present ? (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Present
        </span>
      ) : (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Present
        </span>
      );
    }
    
    if (activity.amount !== undefined) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          ${activity.amount.toFixed(2)}
        </span>
      );
    }
    
    return null;
  };

  // Group activities by date
  const activitiesByDate = activities.reduce<Record<string, Activity[]>>((acc, activity) => {
    const date = format(new Date(activity.date), 'yyyy-MM-dd');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(activity);
    return acc;
  }, {});

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {Object.entries(activitiesByDate).sort(([dateA], [dateB]) => 
          new Date(dateB).getTime() - new Date(dateA).getTime()
        ).map(([date, dateActivities]) => (
          <li key={date}>
            <div className="relative pb-8">
              <span 
                className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200" 
                aria-hidden="true"
              />
              <div className="relative flex space-x-3">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <CalendarIcon className="h-4 w-4 text-gray-500" />
                  </div>
                </div>
                <div className="min-w-0 flex-1 pt-1.5">
                  <h3 className="text-sm font-medium text-gray-900">
                    {format(new Date(date), 'EEEE, MMMM d, yyyy')}
                  </h3>
                </div>
              </div>
              
              <div className="mt-2 ml-12 space-y-4">
                {dateActivities.map((activity) => (
                  <div key={activity.id} className="relative flex items-start space-x-3">
                    <div className="relative">
                      <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center ring-8 ring-white">
                        {getActivityIcon(activity.type)}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1 bg-white rounded-lg p-3 border border-gray-200">
                      <div className="flex justify-between">
                        <h4 className="text-sm font-medium text-gray-900">
                          {activity.title}
                        </h4>
                        <div className="flex space-x-2">
                          {getActivityBadge(activity)}
                          <span className="text-xs text-gray-500">
                            {format(new Date(activity.date), 'h:mm a')}
                          </span>
                        </div>
                      </div>
                      {activity.description && (
                        <p className="mt-1 text-sm text-gray-600">
                          {activity.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
