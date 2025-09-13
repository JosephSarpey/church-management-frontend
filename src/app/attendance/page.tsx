// src/pages/attendance/Attendance.tsx
"use client"

import * as React from "react"
import { useState } from "react"
import { format } from "date-fns"
import { CalendarIcon, DownloadIcon, PlusCircle } from "lucide-react"
import { saveAs } from "file-saver"
import { useRouter } from "next/navigation"

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
import { Progress } from "@/components/ui/progress"

// Mock data (replace with backend fetch later)
const attendanceData = [
  {
    id: "1",
    date: new Date(2025, 8, 13),
    serviceType: "Sunday Service",
    attendance: 120,
    percentage: 80,
    recordedBy: "Pastor John",
  },
  {
    id: "2",
    date: new Date(2025, 8, 6),
    serviceType: "Bible Study",
    attendance: 85,
    percentage: 53,
    recordedBy: "Sister Mary",
  },
]

export default function Attendance() {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [serviceType, setServiceType] = useState("All")
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({
    from: undefined,
    to: undefined,
  })

  // Filtering logic
  const filteredData = attendanceData.filter((r) => {
    const matchesSearch =
      r.serviceType.toLowerCase().includes(search.toLowerCase()) ||
      r.recordedBy.toLowerCase().includes(search.toLowerCase())

    const matchesService = serviceType === "All" || r.serviceType === serviceType

    const matchesDate =
      (!dateRange.from || r.date >= dateRange.from) &&
      (!dateRange.to || r.date <= dateRange.to)

    return matchesSearch && matchesService && matchesDate
  })

  // CSV Export
  const exportCSV = () => {
    const headers = ["Date", "Service Type", "Attendance", "Percentage", "Recorded By"]
    const rows = filteredData.map((r) => [
      format(r.date, "PP"),
      r.serviceType,
      r.attendance.toString(),
      `${r.percentage}%`,
      r.recordedBy,
    ])

    const csv = [headers, ...rows].map((e) => e.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
    saveAs(blob, "attendance.csv")
  }

  return (
    <div className="space-y-4">
      {/* Top Bar */}
      <div className="flex flex-wrap justify-between items-center gap-3">
        <h2 className="text-xl font-bold">Attendance</h2>
        <Button className="cursor-pointer" onClick={() => router.push("/attendance/mark")}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Mark Attendance
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <Input
          placeholder="Search services or recorder..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-60"
        />

        {/* Date Range */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-[260px] justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange.from && dateRange.to
                ? `${format(dateRange.from, "LLL dd, y")} - ${format(
                    dateRange.to,
                    "LLL dd, y"
                  )}`
                : "Select Date Range"}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="p-0">
            <Calendar
              mode="range"
              selected={{
                from: dateRange.from || undefined,
                to: dateRange.to || undefined
              }}
              onSelect={(range) => {
                setDateRange({
                  from: range?.from,
                  to: range?.to
                })
              }}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>

        {/* Service Type */}
        <Select value={serviceType} onValueChange={setServiceType}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by Service" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Services</SelectItem>
            <SelectItem value="Sunday Service">Sunday Service</SelectItem>
            <SelectItem value="Bible Study">Bible Study</SelectItem>
          </SelectContent>
        </Select>

        {/* CSV Export */}
        <Button variant="ghost" onClick={exportCSV}>
          <DownloadIcon className="mr-2 h-4 w-4" />
          Export CSV (excel file)
        </Button>
      </div>

      {/* Attendance Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Service Type</TableHead>
              <TableHead>Attendance</TableHead>
              <TableHead>Percentage</TableHead>
              <TableHead>Recorded By</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((row, i) => (
              <TableRow key={i}>
                <TableCell>{format(row.date, "PP")}</TableCell>
                <TableCell>{row.serviceType}</TableCell>
                <TableCell>{row.attendance}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress value={row.percentage} className="w-28" />
                    <span>{row.percentage}%</span>
                  </div>
                </TableCell>
                <TableCell>{row.recordedBy}</TableCell>
                <TableCell>
                  <Button 
                    variant="link" 
                    className="p-0 h-auto"
                    onClick={() => router.push(`/attendance/${row.id}`)}
                  >
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}

            {filteredData.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground"
                >
                  No attendance records found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
