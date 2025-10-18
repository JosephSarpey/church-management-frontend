"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Edit, Users, DollarSign, Activity, Calendar, Hammer } from "lucide-react";
import Link from "next/link";

// Dummy data - replace with actual API call
const getBranchById = (id: string) => {
  const branches = [
    { 
      id: "1", 
      name: "Main Branch", 
      memberCount: 150, 
      income: 50000, 
      expenditure: 35000, 
      events: ["Sunday Service", "Bible Study", "Prayer Meeting"], 
      currentProject: "Church Renovation",
      description: "The main branch of our church, established in 2010.",
      pastor: "Pastor John Doe",
      address: "123 Church St, Anytown, AN 12345"
    },
    { 
      id: "2", 
      name: "North Branch", 
      memberCount: 85, 
      income: 25000, 
      expenditure: 20000, 
      events: ["Sunday Service", "Youth Gathering"], 
      currentProject: "Community Outreach",
      description: "Our northern branch serving the local community.",
      pastor: "Pastor Jane Smith",
      address: "456 North Ave, Somewhere, AN 67890"
    },
  ];
  
  return branches.find(branch => branch.id === id) || null;
};

export default function BranchDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const branch = getBranchById(params.id as string);

  if (!branch) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full space-y-6 text-center bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Branch not found</h2>
          <p className="text-gray-500 dark:text-gray-300 mb-6">The requested branch could not be found.</p>
          <Button onClick={() => router.push('/branches')} className="w-full sm:w-auto bg-amber-400 hover:bg-amber-500 dark:bg-amber-500 dark:hover:bg-amber-600 text-white">
            Back to Branches
          </Button>
        </div>
      </div>
    );
  }

  const netIncome = branch.income - branch.expenditure;
  const profitLossColor = netIncome >= 0 ? 'text-green-600' : 'text-red-600';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => router.back()}
                className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Branches
              </Button>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{branch.name}</h1>
            </div>
            <Link href={`/branches/${branch.id}/edit`}>
              <Button className="bg-amber-400 hover:bg-amber-500 dark:bg-amber-500 dark:hover:bg-amber-600 text-white">
                <Edit className="h-4 w-4 mr-2" />
                Edit Branch
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
          <Card className="hover:shadow-md dark:shadow-gray-800/50 transition-all duration-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Members</CardTitle>
              <div className="p-2 rounded-full bg-indigo-50 dark:bg-indigo-900/30">
                <Users className="h-5 w-5 text-indigo-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{branch.memberCount}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Active members</p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md dark:shadow-gray-800/50 transition-all duration-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Monthly Income</CardTitle>
              <div className="p-2 rounded-full bg-green-50">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">₵{branch.income.toLocaleString()}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">This month</p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md dark:shadow-gray-800/50 transition-all duration-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Monthly Expenses</CardTitle>
              <div className="p-2 rounded-full bg-red-50">
                <Activity className="h-5 w-5 text-red-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">₵{branch.expenditure.toLocaleString()}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">This month</p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md dark:shadow-gray-800/50 transition-all duration-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Net Income</CardTitle>
              <div className="p-2 rounded-full bg-blue-50">
                <DollarSign className={`h-5 w-5 ${profitLossColor}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${profitLossColor}`}>
                {netIncome >= 0 ? '+' : ''}₵{Math.abs(netIncome).toLocaleString()}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">This month</p>
            </CardContent>
          </Card>
        </div>

        {/* Branch Info and Current Project */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="hover:shadow-md dark:shadow-gray-800/50 transition-all duration-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg">Branch Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Branch Pastor</h4>
                <p className="text-gray-900 dark:text-gray-200">{branch.pastor}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Address</h4>
                <p className="text-gray-900 dark:text-gray-200">{branch.address}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Description</h4>
                <p className="text-gray-900 dark:text-gray-200">{branch.description}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md dark:shadow-gray-800/50 transition-all duration-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Current Project</CardTitle>
                <div className="p-2 rounded-full bg-amber-50">
                  <Hammer className="h-5 w-5 text-amber-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-medium text-gray-900 dark:text-white">{branch.currentProject}</div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-4">
                <div className="bg-green-500 dark:bg-green-600 h-2.5 rounded-full" style={{ width: '65%' }}></div>
              </div>
              <p className="text-sm text-gray-500 mt-2">65% complete</p>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Events */}
        <Card className="mt-6 hover:shadow-md transition-shadow duration-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Upcoming Events</CardTitle>
              <div className="p-2 rounded-full bg-purple-50">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-gray-900 dark:text-gray-200">
              {branch.events.map((event, index) => (
                <div key={index} className="flex items-center space-x-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <div className="h-2.5 w-2.5 rounded-full bg-green-600"></div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">{event}</p>
                    <p className="text-sm text-gray-500">Today, 7:00 PM</p>
                  </div>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}