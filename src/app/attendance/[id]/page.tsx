"use client"

import { useParams } from "next/navigation"
import { format } from "date-fns"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

// Mock data - replace with actual data fetching
const getAttendanceDetails = (id: string) => {
  // In a real app, you would fetch this data from your API
  const mockData = [
    {
      id: "1",
      date: new Date(2025, 8, 13),
      serviceType: "Sunday Service",
      attendance: 120,
      totalMembers: 150,
      percentage: 80,
      recordedBy: "Pastor John",
      notes: "Special guest speaker today. Many visitors attended.",
      attendees: [
        { id: 1, name: "John Doe", status: "Present" },
        { id: 2, name: "Jane Smith", status: "Present" },
        { id: 3, name: "Visitor 1", status: "Present", isVisitor: true },
        { id: 4, name: "Visitor 2", status: "Present", isVisitor: true },
      ]
    },
    {
      id: "2",
      date: new Date(2025, 8, 12),
      serviceType: "Bible Study",
      attendance: 85,
      totalMembers: 150,
      percentage: 57,
      recordedBy: "Sister Mary",
      notes: "Regular bible study session.",
      attendees: [
        { id: 1, name: "John Doe", status: "Present" },
        { id: 5, name: "Robert Johnson", status: "Present" },
        { id: 6, name: "Visitor 3", status: "Present", isVisitor: true },
      ]
    }
  ];
  
  // Find the attendance record with the matching ID
  return mockData.find(record => record.id === id) || mockData[0];
}

export default function AttendanceDetails() {
  const { id } = useParams()
  const attendance = getAttendanceDetails(id as string)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/attendance" className="p-1 rounded-md hover:bg-accent">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h2 className="text-2xl font-bold">Attendance Details</h2>
      </div>

      <div className="grid gap-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card p-4 rounded-lg border">
            <h3 className="text-sm font-medium text-muted-foreground">Date</h3>
            <p className="text-lg font-medium">{format(attendance.date, "PPP")}</p>
          </div>
          <div className="bg-card p-4 rounded-lg border">
            <h3 className="text-sm font-medium text-muted-foreground">Service Type</h3>
            <p className="text-lg font-medium">{attendance.serviceType}</p>
          </div>
          <div className="bg-card p-4 rounded-lg border">
            <h3 className="text-sm font-medium text-muted-foreground">Recorded By</h3>
            <p className="text-lg font-medium">{attendance.recordedBy}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card p-4 rounded-lg border">
            <h3 className="text-sm font-medium text-muted-foreground">Attendance</h3>
            <p className="text-2xl font-bold">{attendance.attendance} <span className="text-sm font-normal text-muted-foreground">/ {attendance.totalMembers}</span></p>
            <div className="mt-2">
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary" 
                  style={{ width: `${attendance.percentage}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground mt-1">{attendance.percentage}% attendance rate</p>
            </div>
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Notes</h3>
          <p className="text-muted-foreground">
            {attendance.notes || "No additional notes for this service."}
          </p>
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Attendees</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-muted-foreground border-b">
                  <th className="pb-2 px-4">Name</th>
                  <th className="pb-2 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {attendance.attendees.map((attendee) => (
                  <tr key={attendee.id} className="border-b">
                    <td className="py-3 px-4">{attendee.name}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {attendee.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
