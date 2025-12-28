/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { format, subDays, startOfDay, endOfDay } from "date-fns"
import { CalendarIcon, DownloadIcon, PlusCircle, Loader2, Search, Users, Activity } from "lucide-react"
import { saveAs } from "file-saver"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { DateRange } from "react-day-picker"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ServiceType } from "@/lib/api/attendance/types"
import { attendanceApi } from "@/lib/api/attendance"
import { AttendanceChart } from "@/components/charts/AttendanceChart"
import { AttendanceTrends } from "@/components/charts/AttendanceTrends"

interface AttendanceRecord {
  id: string;
  date: Date;
  serviceType: ServiceType;
  member?: {
    firstName: string;
    lastName: string;
  };
  isVisitor: boolean;
  visitorName?: string;
  takenBy: string;
  notes?: string;
}

const serviceTypeLabels: Record<ServiceType, string> = {
  [ServiceType.SUNDAY_SERVICE]: 'Sunday Service',
  [ServiceType.BIBLE_STUDY]: 'Bible Study',
  [ServiceType.PRAYER_MEETING]: 'Prayer Meeting',
  [ServiceType.YOUTH_SERVICE]: 'Youth Service',
  [ServiceType.CHILDREN_SERVICE]: 'Children Service',
  [ServiceType.SPECIAL_EVENT]: 'Special Event',
  [ServiceType.OTHER]: 'Other'
};

export default function Attendance() {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [serviceType, setServiceType] = useState<ServiceType | "ALL">("ALL")
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date(),
  })
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalRecords: 0,
    members: 0,
    visitors: 0,
    byServiceType: {} as Record<ServiceType, number>
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        console.log('Fetching attendance with params:', {
          startDate: dateRange.from?.toISOString(),
          endDate: dateRange.to ? endOfDay(dateRange.to).toISOString() : undefined,
          serviceType: serviceType !== 'ALL' ? serviceType : undefined,
          page: pagination.page,
          limit: pagination.limit,
        });

        const response = await attendanceApi.getAttendances({
          startDate: dateRange.from?.toISOString(),
          endDate: dateRange.to ? endOfDay(dateRange.to).toISOString() : undefined,
          serviceType: serviceType !== 'ALL' ? serviceType : undefined,
          page: pagination.page,
          limit: pagination.limit,
        });

        const records = Array.isArray(response.data)
          ? response.data.map(record => ({
            ...record,
            date: new Date(record.date)
          }))
          : [];

        setAttendanceData(records)
        setPagination(prev => ({
          ...prev,
          total: response.meta?.total || 0,
          totalPages: response.meta?.totalPages || 0
        }))
        
        // Use backend stats for the cards
        if (response.meta?.stats) {
          setStats({
            totalRecords: response.meta.total,
            members: response.meta.stats.members,
            visitors: response.meta.stats.visitors,
            byServiceType: response.meta.stats.byServiceType as Record<ServiceType, number>
          })
        }
      } catch (error) {
        console.error('Error fetching attendance:', error)
        toast.error('Failed to load attendance data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [dateRange, serviceType, pagination.page, pagination.limit])

  // updateStats removed in favor of backend-provided stats

  const filteredData = (attendanceData || []).filter((record) => {
    const searchLower = search.toLowerCase()
    const memberName = record.member
      ? `${record.member.firstName} ${record.member.lastName}`.toLowerCase()
      : ''

    const matchesSearch =
      memberName.includes(searchLower) ||
      (record.visitorName?.toLowerCase() || '').includes(searchLower) ||
      record.takenBy.toLowerCase().includes(searchLower) ||
      record.notes?.toLowerCase().includes(searchLower)

    return matchesSearch
  })

  // CSV Export
  const exportCSV = () => {
    const headers = [
      "Date",
      "Service Type",
      "Name",
      "Type",
      "Recorded By",
      "Notes"
    ]

    const rows = filteredData.map((record) => [
      format(record.date, "yyyy-MM-dd"),
      serviceTypeLabels[record.serviceType],
      record.isVisitor ? record.visitorName : `${record.member?.firstName} ${record.member?.lastName}`.trim(),
      record.isVisitor ? 'Visitor' : 'Member',
      record.takenBy,
      record.notes || ''
    ])

    const csv = [headers, ...rows].map((e) => e.join(",")).join("\n")
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" })
    saveAs(blob, `attendance_${format(new Date(), 'yyyyMMdd')}.csv`)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading attendance data...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Attendance Records</h1>
          <p className="text-muted-foreground">
            View and manage all attendance records
          </p>
        </div>
        <Button onClick={() => router.push('/attendance/mark')}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Mark Attendance
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRecords}</div>
            <p className="text-xs text-muted-foreground">
              {stats.members} members, {stats.visitors} visitors
            </p>
          </CardContent>
        </Card>

        {Object.entries(ServiceType).map(([key, type]) => (
          <Card key={type}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {serviceTypeLabels[type]}
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.byServiceType[type] || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.totalRecords > 0
                  ? Math.round(((stats.byServiceType[type] || 0) / stats.totalRecords) * 100) + '% of total'
                  : 'No records'}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-xl font-bold">Attendance</h2>
            <Button className="cursor-pointer" onClick={() => router.push("/attendance/mark")}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Mark Attendance
            </Button>
          </div>

          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, recorded by, or notes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8"
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={serviceType}
              onValueChange={(value) => setServiceType(value as ServiceType | "ALL")}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Service Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Services</SelectItem>
                {Object.entries(ServiceType).map(([key, type]) => (
                  <SelectItem key={type} value={type}>
                    {serviceTypeLabels[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>{format(dateRange.from, "MMM d, yyyy")} - {format(dateRange.to, "MMM d, yyyy")}</>
                    ) : (
                      format(dateRange.from, "MMM d, yyyy")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={(range) => {
                    if (range?.from && range.to) {
                      setDateRange({
                        from: startOfDay(range.from),
                        to: endOfDay(range.to)
                      })
                    } else if (range?.from) {
                      setDateRange({
                        from: startOfDay(range.from),
                        to: endOfDay(range.from)
                      })
                    } else {
                      setDateRange({ from: undefined, to: undefined })
                    }
                  }}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>

            <Button variant="outline" size="icon" onClick={exportCSV}>
              <DownloadIcon className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="list" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="list">List View</TabsTrigger>
              <TabsTrigger value="stats">Statistics</TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Service Type</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Recorded By</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.length > 0 ? (
                      filteredData.map((record) => (
                        <TableRow
                          key={record.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => router.push(`/attendance/${record.id}`)}
                        >
                          <TableCell className="font-medium">
                            <div>{format(record.date, "MMM d, yyyy")}</div>
                            <div className="text-xs text-muted-foreground">
                              {format(record.date, "h:mm a")}
                            </div>
                          </TableCell>
                          <TableCell>
                            {serviceTypeLabels[record.serviceType] || record.serviceType}
                          </TableCell>
                          <TableCell>
                            {record.isVisitor
                              ? record.visitorName
                              : `${record.member?.firstName} ${record.member?.lastName}`.trim()}
                          </TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${record.isVisitor
                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                              }`}>
                              {record.isVisitor ? 'Visitor' : 'Member'}
                            </span>
                          </TableCell>
                          <TableCell>{record.takenBy}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/attendance/${record.id}`);
                              }}
                            >
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          No attendance records found. Try adjusting your filters.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination Controls */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
                <div className="text-sm text-muted-foreground">
                  Showing <span className="font-medium">{attendanceData.length === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1}</span> to{" "}
                  <span className="font-medium">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span>{" "}
                  of <span className="font-medium">{pagination.total}</span> records
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={pagination.limit.toString()}
                    onValueChange={(value) => setPagination(prev => ({ ...prev, limit: parseInt(value), page: 1 }))}
                  >
                    <SelectTrigger className="w-[70px]">
                      <SelectValue placeholder="10" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-muted-foreground mr-2">per page</span>
                  
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                      disabled={pagination.page <= 1}
                    >
                      Previous
                    </Button>
                    <div className="flex items-center justify-center min-w-[32px] text-sm font-medium">
                      {pagination.page}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                      disabled={pagination.page >= pagination.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="stats" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Attendance by Service Type</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(ServiceType).map(([key, type]) => (
                        <div key={type} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              {serviceTypeLabels[type]}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {stats.byServiceType[type] || 0} records
                            </span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{
                                width: stats.totalRecords > 0
                                  ? `${(stats.byServiceType[type] / stats.totalRecords) * 100}%`
                                  : '0%'
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Attendance Trends</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="h-[300px] w-full">
                      <AttendanceTrends attendanceData={attendanceData} />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Attendance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {attendanceData.slice(0, 5).map((record) => (
                        <div key={record.id} className="flex items-center">
                          <div className="space-y-1">
                            <p className="text-sm font-medium leading-none">
                              {record.isVisitor
                                ? record.visitorName
                                : `${record.member?.firstName} ${record.member?.lastName}`.trim()}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {serviceTypeLabels[record.serviceType]} • {format(record.date, 'MMM d, yyyy')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2">
                      <Button variant="outline" className="justify-start" onClick={exportCSV}>
                        <DownloadIcon className="mr-2 h-4 w-4" />
                        Export All Records
                      </Button>
                      <Button variant="outline" className="justify-start" onClick={() => router.push('/attendance/mark')}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add New Record
                      </Button>
                      <Button variant="outline" className="justify-start" onClick={() => router.push('/attendance/calendar')}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        View Calendar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
