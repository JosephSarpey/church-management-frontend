"use client";

import React, { useState } from 'react';
import { Users, DollarSign, Calendar, UserCheck, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import AttendanceReport from '@/components/reports/AttendanceReport';
import DonationsReport from '@/components/reports/DonationsReport';
import EventsReport from '@/components/reports/EventsReport';
import MembershipReport from '@/components/reports/MembershipReport';

type ReportType = 'attendance' | 'donations' | 'events' | 'membership' | 'contributions' | null;

type ReportCardProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
  onGenerate: () => void;
};

const ReportCard: React.FC<ReportCardProps> = ({ title, description, icon, onGenerate }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200 flex flex-col border border-gray-200 dark:border-gray-700">
    <div className="flex items-center mb-4">
      <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-full text-yellow-600 dark:text-yellow-400 mr-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
    </div>
    <p className="text-gray-600 dark:text-gray-300 flex-grow mb-4">{description}</p>
    <Button
      onClick={onGenerate}
      className="mt-auto w-full bg-yellow-500 hover:bg-yellow-600 text-white"
    >
      View Report
    </Button>
  </div>
);

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState<ReportType>(null);

  const reportTypes = [
    {
      id: 'attendance',
      title: 'Attendance Report',
      description: 'View and analyze attendance patterns, service statistics, and visitor tracking.',
      icon: <Users className="h-5 w-5" />,
    },
    {
      id: 'donations',
      title: 'Financial Report',
      description: 'Track financial contributions, tithes, and analyze giving trends over time.',
      icon: <DollarSign className="h-5 w-5" />,
    },
    {
      id: 'events',
      title: 'Events Report',
      description: 'Overview of upcoming and past events, participation, and scheduling.',
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      id: 'membership',
      title: 'Membership Report',
      description: 'Analyze membership growth, demographics, and member status distribution.',
      icon: <UserCheck className="h-5 w-5" />,
    },
    // Contributions is similar to donations, can be merged or separate. Keeping separate placeholder if needed or merging.
    // For now, I'll map 'contributions' to Donations report as well or keep it disabled/different if requirements differ.
    // Let's remove it to avoid confusion if it's redundant, or map it to DonationsReport.
  ];

  const renderActiveReport = () => {
    switch (activeReport) {
      case 'attendance':
        return <AttendanceReport />;
      case 'donations':
        return <DonationsReport />;
      case 'events':
        return <EventsReport />;
      case 'membership':
        return <MembershipReport />;
      default:
        return null;
    }
  };

  if (activeReport) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => setActiveReport(null)}
            className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white p-0 hover:bg-transparent"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Reports
          </Button>
        </div>
        
        {renderActiveReport()}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports Central</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Generate and analyze detailed church reports</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportTypes.map((report) => (
          <ReportCard
            key={report.id}
            title={report.title}
            description={report.description}
            icon={report.icon}
            onGenerate={() => setActiveReport(report.id as ReportType)}
          />
        ))}
      </div>
    </div>
  );
}
