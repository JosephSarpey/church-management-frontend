"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Edit, Users, DollarSign, Activity, Calendar, MapPin, User, Info, TrendingUp, TrendingDown } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { branchesApi } from "@/lib/api/branches";
import { Branch } from "@/lib/api/branches/types";
import { pastorsApi } from "@/lib/api/pastors";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function BranchDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [branch, setBranch] = useState<Branch | null>(null);
  const [loading, setLoading] = useState(true);
  const [pastorName, setPastorName] = useState<string>("");

  useEffect(() => {
    const fetchBranch = async () => {
      try {
        setLoading(true);
        const id = Array.isArray(params.id) ? params.id[0] : (params.id as string);
        const data = await branchesApi.getBranch(id);
        setBranch(data);
      } catch (error) {
        console.error("Error fetching branch:", error);
        toast.error("Failed to load branch");
        setBranch(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBranch();
  }, [params.id]);

  useEffect(() => {
    const fetchPastorName = async () => {
      if (!branch?.pastorId) {
        setPastorName("");
        return;
      }

      try {
        const pastor = await pastorsApi.getPastor(branch.pastorId);
        setPastorName(pastor?.name || branch.pastorId);
      } catch (error) {
        console.error("Error fetching pastor:", error);
        setPastorName(branch.pastorId);
      }
    };

    fetchPastorName();
  }, [branch?.pastorId]);

  const eventsList = useMemo(() => {
    const raw = branch?.events || "";
    return raw
      .split(/\r?\n/)
      .map((e) => e.trim())
      .filter(Boolean);
  }, [branch?.events]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 flex items-center justify-center px-4">
        <div className="flex flex-col items-center space-y-4 animate-pulse">
          <div className="h-12 w-12 rounded-full border-4 border-amber-400 border-t-transparent animate-spin"></div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Loading branch details...</p>
        </div>
      </div>
    );
  }

  if (!branch) {
    return (
      <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 flex items-center justify-center px-4">
        <Card className="max-w-md w-full p-8 text-center border-gray-100 dark:border-gray-800 shadow-lg">
          <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
            <Info className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Branch not found</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">The requested branch could not be found or may have been removed.</p>
          <Button onClick={() => router.push('/branches')} className="w-full bg-amber-400 hover:bg-amber-500 text-white">
            Return to Branches
          </Button>
        </Card>
      </div>
    );
  }

  const netIncome = branch.income - branch.expenditure;
  const isPositiveIncome = netIncome >= 0;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 pb-12">
      {/* Header Section with Gradient Background */}
      <div className="relative bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 pb-8 pt-6">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-50/50 to-transparent dark:from-amber-900/10 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <Button 
              variant="ghost" 
              onClick={() => router.back()}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/50 dark:hover:bg-gray-700/50 -ml-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Overview
            </Button>
            <Link href={`/branches/${branch.id}/edit`}>
              <Button className="bg-amber-400 hover:bg-amber-500 dark:bg-amber-500 dark:hover:bg-amber-600 text-white shadow-sm hover:shadow transition-all">
                <Edit className="h-4 w-4 mr-2" />
                Edit Branch
              </Button>
            </Link>
          </div>
          
          <div className="flex items-start justify-between mb-5">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">
                {branch.name}
              </h1>
              <div className="flex items-center text-gray-500 dark:text-gray-400 space-x-4">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1.5 opacity-70" />
                  <span className="text-sm">{branch.address}</span>
                </div>
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1.5 opacity-70" />
                  <span className="text-sm">Pastor {pastorName}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-10 relative z-10">
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-8"
        >
          {/* Stats Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <motion.div variants={item}>
              <Card className="border-none shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 bg-white dark:bg-gray-800 overflow-hidden hover:translate-y-[-2px] transition-transform duration-200">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Users className="h-24 w-24 text-blue-500" />
                </div>
                <CardHeader className="pb-2 relative">
                  <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Members</CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">{branch.memberCount}</span>
                    <span className="text-sm text-green-600 dark:text-green-400 font-medium">Active</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card className="border-none shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 bg-white dark:bg-gray-800 overflow-hidden hover:translate-y-[-2px] transition-transform duration-200">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <DollarSign className="h-24 w-24 text-amber-500" />
                </div>
                <CardHeader className="pb-2 relative">
                  <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Monthly Income</CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">₵{branch.income.toLocaleString()}</div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card className="border-none shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 bg-white dark:bg-gray-800 overflow-hidden hover:translate-y-[-2px] transition-transform duration-200">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Activity className="h-24 w-24 text-red-500" />
                </div>
                <CardHeader className="pb-2 relative">
                  <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Monthly Expenses</CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">₵{branch.expenditure.toLocaleString()}</div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card className="border-none shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 bg-white dark:bg-gray-800 overflow-hidden hover:translate-y-[-2px] transition-transform duration-200">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  {isPositiveIncome ? (
                    <TrendingUp className="h-24 w-24 text-green-500" />
                  ) : (
                    <TrendingDown className="h-24 w-24 text-red-500" />
                  )}
                </div>
                <CardHeader className="pb-2 relative">
                  <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Net Income</CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <div className={`text-3xl font-bold ${isPositiveIncome ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {isPositiveIncome ? '+' : ''}₵{Math.abs(netIncome).toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content Column */}
            <motion.div variants={item} className="lg:col-span-2 space-y-6">
              <Card className="border-none shadow-md bg-white dark:bg-gray-800">
                <CardHeader className="border-b border-gray-100 dark:border-gray-700">
                  <CardTitle className="flex items-center text-xl text-gray-900 dark:text-white">
                    <Info className="h-5 w-5 mr-2 text-amber-500" />
                    About This Branch
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Pastor in Charge</label>
                      <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold text-lg mr-3">
                          {pastorName ? pastorName.charAt(0) : <User className="h-5 w-5" />}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{pastorName || "Unassigned"}</p>
                          <p className="text-xs text-gray-500 text-amber-600">Head Pastor</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Location</label>
                      <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg h-[64px]">
                        <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                        <p className="text-gray-900 dark:text-white line-clamp-2">{branch.address}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Description</label>
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                      {branch.description || "No description provided for this branch."}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Sidebar Column */}
            <motion.div variants={item} className="space-y-6">
              <Card className="border-none shadow-md bg-white dark:bg-gray-800 h-full">
                <CardHeader className="border-b border-gray-100 dark:border-gray-700 bg-amber-50/30 dark:bg-amber-900/10">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center text-lg text-gray-900 dark:text-white">
                      <Calendar className="h-5 w-5 mr-2 text-amber-500" />
                      Events Schedule
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {eventsList.length === 0 ? (
                      <div className="text-center py-8">
                        <Calendar className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-500 dark:text-gray-400">No upcoming events scheduled.</p>
                      </div>
                    ) : (
                      eventsList.map((event, index) => (
                        <div key={index} className="group flex items-start space-x-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border border-transparent hover:border-gray-100 dark:hover:border-gray-700">
                          <div className="flex-shrink-0 w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex flex-col items-center justify-center text-amber-700 dark:text-amber-400">
                             <span className="text-[10px] uppercase font-bold leading-none mt-1">Ref</span>
                             <span className="text-lg font-bold leading-none">{index + 1}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2">
                              {event}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center">
                              <Activity className="h-3 w-3 mr-1" />
                              Active Scheduled Event
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}