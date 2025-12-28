"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import tithesApi from '@/lib/api/tithes';
import { TitheResponse } from '@/lib/api/tithes/types';
import { Loader2, DollarSign, TrendingUp, CreditCard, Download } from 'lucide-react';
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

interface TitheWithMember extends TitheResponse {
  member?: {
    firstName: string;
    lastName: string;
  };
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'GHS', 
  }).format(amount);
};

export default function DonationsReport() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(1)), 
    to: new Date(),
  });
  const [data, setData] = useState<TitheResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!dateRange?.from || !dateRange?.to) return;

    try {
      setLoading(true);
      setError(null);
      const response = await tithesApi.getTithes({
        startDate: dateRange.from.toISOString(),
        endDate: dateRange.to.toISOString(),
      });
      
      // Handle response being array or object with data property based on actual return from client
      const records = Array.isArray(response) ? response : (response as { data?: TitheResponse[] }).data || [];
      setData(records as TitheResponse[]);
    } catch (err) {
      console.error('Failed to fetch tithes:', err);
      setError('Failed to load donations report. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchData();
  
  }, [fetchData]);

  // Calculate stats
  const totalAmount = data.reduce((sum, item) => sum + Number(item.amount), 0);
  const averageDonation = data.length > 0 ? totalAmount / data.length : 0;
  const uniqueDonors = new Set(data.map(item => item.memberId).filter(Boolean)).size;

  const handleDownloadCSV = () => {
    const csvData = data.map(record => {
      const titheRecord = record as TitheWithMember;
      return {
      'Date': new Date(record.paymentDate).toLocaleDateString(),
      'Member': titheRecord.member ? `${titheRecord.member.firstName} ${titheRecord.member.lastName}` : (record.memberName || 'Anonymous'),
      'Type': record.paymentType,
      'Amount': Number(record.amount),
    };
    });

    const dateStr = getDateRangeFilename(dateRange?.from, dateRange?.to);
    exportToCSV(csvData, `donations_report_${dateStr}`);
  };

  const handleDownloadPDF = async () => {
    const dateStr = getDateRangeFilename(dateRange?.from, dateRange?.to);
    await exportToPDF('donations-report-content', `donations_report_${dateStr}`, {
      title: 'Donations Report',
      orientation: 'portrait',
    });
  };

  if (loading && data.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6" id="donations-report-content">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Donations Report</h2>
          <p className="text-gray-500 dark:text-gray-400">
             Financial contributions, tithes, and offerings overview
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contributions</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalAmount)}</div>
            <p className="text-xs text-muted-foreground">
              In selected period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Donation</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(averageDonation)}</div>
            <p className="text-xs text-muted-foreground">
              Per transaction
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Donors</CardTitle>
            <CreditCard className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueDonors}</div>
            <p className="text-xs text-muted-foreground">
              Members who contributed
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Member</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.slice(0, 10).map((record) => {
                  const titheRecord = record as TitheWithMember;
                  return (
                  <TableRow key={record.id}>
                    <TableCell>
                      {new Date(record.paymentDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-medium">
                      {titheRecord.member ? `${titheRecord.member.firstName} ${titheRecord.member.lastName}` : (record.memberName || 'Anonymous')}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                        {record.paymentType}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(Number(record.amount))}
                    </TableCell>
                  </TableRow>
                );
                })}
                {data.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4 text-gray-500">
                      No donation records found for this period.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {data.length > 10 && (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500">Showing 10 most recent transactions of {data.length}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
