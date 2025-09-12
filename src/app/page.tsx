import { Users, CalendarCheck, DollarSign, Activity, UserPlus, CalendarDays, ArrowUpRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { AttendanceChart } from "@/components/charts/AttendanceChart";
import { TithesChart } from "@/components/charts/TithesChart";

export default function DashboardPage() {
  const stats = {
    totalMembers: 256,
    weeklyAttendance: 184,
    monthlyTithes: 5275.50,
    newMembersThisMonth: 12,
    upcomingEvents: 3,
    attendanceRate: 87.5
  };

  const recentActivity = [
    { id: 1, title: "New member registered", description: "John Doe joined the church community", time: "2 hours ago", icon: UserPlus },
    { id: 2, title: "Tithe received", description: "$150.00 from Jane Smith", time: "5 hours ago", icon: DollarSign },
    { id: 3, title: "Event created", description: "Sunday Service - September 15", time: "1 day ago", icon: CalendarDays },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="flex flex-col space-y-1">
        <h1 className="text-2xl font-bold">Welcome back, Admin</h1>
        <p className="text-muted-foreground text-sm">Here&apos;s what&apos;s happening with your church today</p>
      </div>

      {/* Top Row - Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Total Members" 
          value={stats.totalMembers}
          change="+12% from last month"
          icon={<Users className="h-5 w-5" />}
        />
        <MetricCard 
          title="Weekly Attendance" 
          value={stats.weeklyAttendance}
          change="+8% from last week"
          icon={<CalendarCheck className="h-5 w-5" />}
        />
        <MetricCard 
          title="Monthly Tithes" 
          value={formatCurrency(stats.monthlyTithes)}
          change="+15% from last month"
          icon={<DollarSign className="h-5 w-5" />}
        />
        <MetricCard 
          title="Attendance Rate" 
          value={`${stats.attendanceRate}%`}
          change="+5% from last month"
          icon={<Activity className="h-5 w-5" />}
        />
      </div>

      {/* Middle Row - Main Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Chart */}
        <div className="lg:col-span-2 bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold">Attendance Overview</h2>
              <p className="text-sm text-muted-foreground">Last 6 months trend</p>
            </div>
            <button className="text-sm text-primary flex items-center hover:underline">
              View all <span className="ml-1">→</span>
            </button>
          </div>
          <div className="h-80">
            <AttendanceChart />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-6">
          <div className="bg-card rounded-xl p-6 border border-border">
            <h3 className="font-medium mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <StatItem 
                icon={<UserPlus className="h-4 w-4 text-primary" />}
                label="New Members This Month"
                value={stats.newMembersThisMonth}
              />
              <StatItem 
                icon={<CalendarDays className="h-4 w-4 text-primary" />}
                label="Upcoming Events"
                value={stats.upcomingEvents}
              />
              <StatItem 
                icon={<DollarSign className="h-4 w-4 text-primary" />}
                label="Average Weekly Tithes"
                value={formatCurrency(stats.monthlyTithes / 4)}
              />
            </div>
          </div>
          
          <div className="bg-card rounded-xl p-6 border border-border">
            <h3 className="font-medium mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3 mt-0.5">
                    <activity.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{activity.title}</p>
                    <p className="text-sm text-muted-foreground truncate">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
              <button className="w-full text-sm text-primary text-center pt-2 hover:underline">
                View all activity
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row - Detailed Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tithes & Offerings */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold">Tithes & Offerings</h2>
              <p className="text-sm text-muted-foreground">Monthly breakdown</p>
            </div>
            <button className="text-sm text-primary flex items-center hover:underline">
              View report <ArrowUpRight className="ml-1 h-4 w-4" />
            </button>
          </div>
          <div className="h-64">
            <TithesChart />
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold">Recent Transactions</h2>
              <p className="text-sm text-muted-foreground">Latest financial activities</p>
            </div>
            <button className="text-sm text-primary flex items-center hover:underline">
              View all <ArrowUpRight className="ml-1 h-4 w-4" />
            </button>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center justify-between pb-3 border-b border-border/50 last:border-0 last:pb-0">
                <div className="flex items-center">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                    <DollarSign className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Tithe Payment</p>
                    <p className="text-xs text-muted-foreground">Member #{1000 + item}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">${(Math.random() * 200 + 50).toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">{item} day{item !== 1 ? 's' : ''} ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function MetricCard({ title, value, change, icon }: { title: string; value: string | number; change: string; icon: React.ReactNode }) {
  return (
    <div className="bg-card rounded-lg p-5 border border-border hover:border-primary/20 transition-colors">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
          {icon}
        </div>
      </div>
      <div className="mt-2">
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-green-500 flex items-center mt-1">
          <span className="mr-1">↑</span>
          {change}
        </p>
      </div>
    </div>
  );
}

function StatItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
          {icon}
        </div>
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <span className="font-medium">{value}</span>
    </div>
  );
}
