"use client";

import React, { useEffect, useState } from 'react';
import membersApi from '@/lib/api/members';
import { MemberStats } from '@/lib/api/members/types';
import { Loader2, Users, TrendingUp, UserCheck, ShieldCheck, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { exportToCSV, exportToPDF } from '@/lib/utils/export';

export default function MembershipReport() {
  const [stats, setStats] = useState<MemberStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await membersApi.getMemberStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch membership stats:', err);
      setError('Failed to load membership report.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = () => {
    if (!stats) return;

    const csvData = [
      { 'Metric': 'Total Members', 'Value': stats.totalMembers },
      { 'Metric': 'Active Members', 'Value': stats.activeMembers },
      { 'Metric': 'Baptized Members', 'Value': stats.baptizedMembers },
      { 'Metric': 'Male', 'Value': stats.genderDistribution.male },
      { 'Metric': 'Female', 'Value': stats.genderDistribution.female },
      { 'Metric': 'Youth (Under 18)', 'Value': stats.ageDistribution.youth },
      { 'Metric': 'Adults (18+)', 'Value': stats.ageDistribution.adults },
      { 'Metric': 'Growth Rate (%)', 'Value': stats.growthRate.toFixed(1) },
    ];

    exportToCSV(csvData, `membership_report_${new Date().toISOString().split('T')[0]}`);
  };

  const handleDownloadPDF = async () => {
    await exportToPDF('membership-report-content', `membership_report_${new Date().toISOString().split('T')[0]}`, {
      title: 'Membership Report',
      orientation: 'portrait',
    });
  };

  if (loading && !stats) {
     return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#FFC72C]" />
      </div>
    );
  }

  // Calculate percentages for render
  const total = stats?.totalMembers || 0;
  
  // Demographics percentages
  const malePercent = total > 0 ? Math.round(((stats?.genderDistribution.male || 0) / total) * 100) : 0;
  const femalePercent = total > 0 ? Math.round(((stats?.genderDistribution.female || 0) / total) * 100) : 0;
  
  const youthPercent = total > 0 ? Math.round(((stats?.ageDistribution.youth || 0) / total) * 100) : 0;
  // If we had more age groups we'd calculate them here. For now 'adults' is implicit remainder or explicit stat.
  // Using stat:
  const adultPercent = total > 0 ? Math.round(((stats?.ageDistribution.adults || 0) / total) * 100) : 0;

  return (
    <div className="space-y-6" id="membership-report-content">
       <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Membership Report</h2>
            <p className="text-gray-500 dark:text-gray-400">
               Growth, demographics, and membership status analysis
            </p>
          </div>
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

        {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg">
          {error}
        </div>
      )}

      {stats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-[#FFC72C]/10 via-white to-white dark:from-[#FFC72C]/5 dark:via-gray-900 dark:to-gray-900">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFC72C]/10 rounded-full blur-3xl group-hover:bg-[#FFC72C]/20 transition-all duration-300"></div>
              <CardHeader className="pb-2 relative z-10">
                <CardTitle className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Total Members</CardTitle>
              </CardHeader>
              <CardContent className="relative z-10 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold bg-gradient-to-r from-[#FFC72C] to-[#FFD700] bg-clip-text text-transparent">{stats.totalMembers}</div>
                    <div className="text-xs text-[#FFC72C] flex items-center mt-1.5 font-medium">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {stats.growthRate > 0 ? '+' : ''}{stats.growthRate.toFixed(1)}% growth
                    </div>
                  </div>
                  <div className="p-2.5 bg-[#FFC72C]/20 dark:bg-[#FFC72C]/10 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <Users className="h-6 w-6 text-[#FFC72C]" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-[#333333]/5 via-white to-white dark:from-[#333333]/10 dark:via-gray-900 dark:to-gray-900">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#333333]/5 rounded-full blur-3xl group-hover:bg-[#333333]/10 transition-all duration-300"></div>
              <CardHeader className="pb-2 relative z-10">
                <CardTitle className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Active Membership</CardTitle>
              </CardHeader>
              <CardContent className="relative z-10 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.activeMembers}</div>
                    <div className="w-full bg-gradient-to-r from-gray-200 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-full h-1.5 mt-2 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-[#333333] to-[#555555] dark:from-gray-400 dark:to-gray-500 h-1.5 rounded-full transition-all duration-500 shadow-sm" 
                        style={{ width: `${total > 0 ? (stats.activeMembers / total) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1.5 font-medium">
                      {total > 0 ? Math.round((stats.activeMembers / total) * 100) : 0}% of total
                    </p>
                  </div>
                  <div className="p-2.5 bg-[#333333]/10 dark:bg-gray-700/50 rounded-xl group-hover:scale-110 transition-transform duration-300 ml-3">
                    <UserCheck className="h-6 w-6 text-[#333333] dark:text-gray-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-[#FFC72C]/10 via-white to-white dark:from-[#FFC72C]/5 dark:via-gray-900 dark:to-gray-900">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFC72C]/10 rounded-full blur-3xl group-hover:bg-[#FFC72C]/20 transition-all duration-300"></div>
              <CardHeader className="pb-2 relative z-10">
                <CardTitle className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Baptized Members</CardTitle>
              </CardHeader>
              <CardContent className="relative z-10 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.baptizedMembers}</div>
                    <div className="w-full bg-gradient-to-r from-gray-200 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-full h-1.5 mt-2 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-[#FFC72C] to-[#FFD700] h-1.5 rounded-full transition-all duration-500 shadow-sm" 
                        style={{ width: `${total > 0 ? (stats.baptizedMembers / total) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1.5 font-medium">
                      {total > 0 ? Math.round((stats.baptizedMembers / total) * 100) : 0}% confirmed
                    </p>
                  </div>
                  <div className="p-2.5 bg-[#FFC72C]/20 dark:bg-[#FFC72C]/10 rounded-xl group-hover:scale-110 transition-transform duration-300 ml-3">
                    <ShieldCheck className="h-6 w-6 text-[#FFC72C]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-xl font-bold">Demographics Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Men</span>
                      <span className="font-semibold">{malePercent}% ({stats.genderDistribution.male})</span>
                    </div>
                    <Progress value={malePercent} className="h-2 bg-[#FFC72C]/20 dark:bg-[#FFC72C]/10 [&>div]:bg-[#FFC72C]" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Women</span>
                      <span className="font-semibold">{femalePercent}% ({stats.genderDistribution.female})</span>
                    </div>
                    <Progress value={femalePercent} className="h-2 bg-[#333333]/20 dark:bg-[#333333]/30 [&>div]:bg-[#333333] dark:[&>div]:bg-gray-400" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Youth (Under 18)</span>
                      <span className="font-semibold">{youthPercent}% ({stats.ageDistribution.youth})</span>
                    </div>
                    <Progress value={youthPercent} className="h-2 bg-[#FFC72C]/20 dark:bg-[#FFC72C]/10 [&>div]:bg-[#FFC72C]" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Adults (18+)</span>
                      <span className="font-semibold">{adultPercent}% ({stats.ageDistribution.adults})</span>
                    </div>
                    <Progress value={adultPercent} className="h-2 bg-[#333333]/20 dark:bg-[#333333]/30 [&>div]:bg-[#333333] dark:[&>div]:bg-gray-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-xl font-bold">Growth Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-center justify-center bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                  <div className="text-center">
                     <p className="text-gray-500 font-medium">Coming Soon</p>
                     <p className="text-xs text-gray-400 mt-1">Historic growth chart will be available with sufficient history.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
