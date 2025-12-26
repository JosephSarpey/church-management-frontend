"use client";

import React, { useEffect, useState } from 'react';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import attendanceApi from '@/lib/api/attendance';
import { AttendanceStats, ServiceType } from '@/lib/api/attendance/types';
import { Loader2, Users, UserCheck, UserPlus, Calendar, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { exportToCSV, exportToPDF, getDateRangeFilename } from '@/lib/utils/export';

// Helper for service type formatting
const formatServiceType = (type: ServiceType) => {
  return type.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ');
};

export default function AttendanceReport() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(1)), // First day of current month
    to: new Date(),
  });
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange]);

  const fetchStats = async () => {
    if (!dateRange?.from || !dateRange?.to) return;

    try {
      setLoading(true);
      setError(null);
      const data = await attendanceApi.getAttendanceStats(
        dateRange.from.toISOString(),
        dateRange.to.toISOString()
      );
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch attendance stats:', err);
      setError('Failed to load attendance statistics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = () => {
    if (!stats) return;

    const csvData = stats.memberAttendance.map(record => ({
      'Member Name': `${record.firstName} ${record.lastName}`,
      'Attendance Count': record.attendanceCount,
    }));

    const dateStr = getDateRangeFilename(dateRange?.from, dateRange?.to);
    exportToCSV(csvData, `attendance_report_${dateStr}`);
  };

  const handleDownloadPDF = async () => {
    const dateStr = getDateRangeFilename(dateRange?.from, dateRange?.to);
    await exportToPDF('attendance-report-content', `attendance_report_${dateStr}`, {
      title: 'Attendance Report',
      orientation: 'portrait',
    });
  };

  if (!stats && loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6" id="attendance-report-content">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Attendance Report</h2>
          <p className="text-gray-500 dark:text-gray-400">
            Analysis of service attendance and member participation
          </p>
        </div>
        <div className="flex gap-2">
          <DateRangePicker
            initialDateFrom={dateRange?.from || new Date()}
            initialDateTo={dateRange?.to || new Date()}
            onUpdate={({ range }) => setDateRange(range)}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={handleDownloadCSV}>
                Download as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownloadPDF}>
                Download as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg">
          {error}
        </div>
      )}

      {stats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Attendance</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalAttendance}</div>
                <p className="text-xs text-muted-foreground">
                  Across all services in period
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Attendance</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Math.round(stats.averageAttendance || 0)}</div>
                <p className="text-xs text-muted-foreground">
                  Per service event
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Visitors</CardTitle>
                <UserPlus className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.visitorStats.totalVisitors}</div>
                <p className="text-xs text-muted-foreground">
                  First-time guests
                </p>
              </CardContent>
            </Card>

             <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Most Attended Service</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold truncate">
                  {Object.entries(stats.serviceTypeBreakdown).sort(([,a], [,b]) => b - a)[0]?.[0] 
                    ? formatServiceType(Object.entries(stats.serviceTypeBreakdown).sort(([,a], [,b]) => b - a)[0][0] as ServiceType)
                    : 'N/A'
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  Highest turnout by type
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Attendance by Service Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(stats.serviceTypeBreakdown).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2" />
                        <span className="text-sm font-medium">{formatServiceType(type as ServiceType)}</span>
                      </div>
                      <span className="text-sm text-gray-500">{count}</span>
                    </div>
                  ))}
                  {Object.keys(stats.serviceTypeBreakdown).length === 0 && (
                     <p className="text-sm text-gray-500 text-center py-4">No data available for this period.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Visitor Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                 <div className="space-y-4">
                  {Object.entries(stats.visitorStats.visitorsByService).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mr-2" />
                        <span className="text-sm font-medium">{formatServiceType(type as ServiceType)}</span>
                      </div>
                      <span className="text-sm text-gray-500">{count}</span>
                    </div>
                  ))}
                   {Object.keys(stats.visitorStats.visitorsByService).length === 0 && (
                     <p className="text-sm text-gray-500 text-center py-4">No visitor data available.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Member Attendance Records</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member Name</TableHead>
                      <TableHead>Attendance Count</TableHead>
                      <TableHead className="text-right">Attendance Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.memberAttendance.slice(0, 10).map((record) => (
                      <TableRow key={record.memberId}>
                        <TableCell className="font-medium">
                          {record.firstName} {record.lastName}
                        </TableCell>
                        <TableCell>{record.attendanceCount}</TableCell>
                        <TableCell className="text-right">
                          {/* We don't have total services count in MemberAttendance struct easily, so simple usage here */}
                          {record.attendanceCount} sessions
                        </TableCell>
                      </TableRow>
                    ))}
                     {stats.memberAttendance.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-4 text-gray-500">
                          No member attendance records found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              {stats.memberAttendance.length > 10 && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-500">Showing top 10 attendees</p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
