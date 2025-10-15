"use client";

import React, { useState } from 'react';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Download, Filter, Users, DollarSign, Calendar, UserCheck, Gift } from 'lucide-react';

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
    <button
      onClick={onGenerate}
      className="mt-auto w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 dark:bg-yellow-600 dark:hover:bg-yellow-700 transition-colors duration-200"
    >
      <Download className="mr-2 h-4 w-4" /> Generate Report
    </button>
  </div>
);

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(1)), // First day of current month
    endDate: new Date(), // Today
  });

  const handleGenerateReport = (reportType: string) => {
    console.log(`Generating ${reportType} report for`, dateRange);
    // TODO: Implement report generation logic
    // This could open a modal, navigate to a detailed report page, or trigger a download
  };

  const reportTypes = [
    {
      id: 'attendance',
      title: 'Attendance Report',
      description: 'View and analyze attendance patterns and statistics.',
      icon: <Users className="h-5 w-5" />,
    },
    {
      id: 'donations',
      title: 'Donations Report',
      description: 'Track and analyze financial contributions and giving patterns.',
      icon: <DollarSign className="h-5 w-5" />,
    },
    {
      id: 'events',
      title: 'Events Report',
      description: 'View event participation and engagement metrics.',
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      id: 'membership',
      title: 'Membership Report',
      description: 'Analyze membership growth and demographics.',
      icon: <UserCheck className="h-5 w-5" />,
    },
    {
      id: 'contributions',
      title: 'Contributions Report',
      description: 'Detailed breakdown of all contributions and offerings.',
      icon: <Gift className="h-5 w-5" />,
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Generate and analyze church reports</p>
        </div>
        <div className="mt-4 md:mt-0">
          <DateRangePicker
            onUpdate={({ range }) => setDateRange({
              startDate: range.from || new Date(),
              endDate: range.to || new Date(),
            })}
            initialDateFrom={dateRange.startDate}
            initialDateTo={dateRange.endDate}
            align="end"
            showCompare={false}
          />
        </div>
      </div>

      <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-100 dark:border-yellow-800/50">
        <div className="flex items-center">
          <Filter className="text-yellow-600 dark:text-yellow-400 mr-2 h-4 w-4" />
          <span className="text-sm text-yellow-800 dark:text-yellow-200">
            Showing reports from {dateRange.startDate.toLocaleDateString()} to {dateRange.endDate.toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportTypes.map((report) => (
          <ReportCard
            key={report.id}
            title={report.title}
            description={report.description}
            icon={report.icon}
            onGenerate={() => handleGenerateReport(report.id)}
          />
        ))}
      </div>
    </div>
  );
}