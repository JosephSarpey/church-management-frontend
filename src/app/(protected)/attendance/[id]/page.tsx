/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import * as React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { ArrowLeft, CalendarIcon, Clock, User, Users, Home, Phone, Mail, FileText, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { attendanceApi } from '@/lib/api/attendance'
import { ServiceType } from '@/lib/api/attendance/types'
import { useQuery } from '@tanstack/react-query'

const serviceTypeLabels: Record<ServiceType, string> = {
  [ServiceType.SUNDAY_SERVICE]: 'Sunday Service',
  [ServiceType.BIBLE_STUDY]: 'Bible Study',
  [ServiceType.PRAYER_MEETING]: 'Prayer Meeting',
  [ServiceType.YOUTH_SERVICE]: 'Youth Service',
  [ServiceType.CHILDREN_SERVICE]: 'Children Service',
  [ServiceType.SPECIAL_EVENT]: 'Special Event',
  [ServiceType.OTHER]: 'Other'
};

export default function AttendanceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const { data: attendance, isLoading, error } = useQuery({
    queryKey: ['attendance', id],
    queryFn: () => attendanceApi.getAttendance(id),
    enabled: !!id
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-destructive">Error loading attendance record</h2>
        <p className="text-muted-foreground mt-2">Please try again later</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go back
        </Button>
      </div>
    )
  }

  if (!attendance) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">Attendance record not found</h2>
        <p className="text-muted-foreground mt-2">The requested attendance record could not be found</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to attendance
        </Button>
      </div>
    )
  }

  const attendanceDate = new Date(attendance.date)
  const isVisitor = attendance.isVisitor
  const person = isVisitor 
    ? { name: attendance.visitorName, type: 'Visitor' as const }
    : attendance.member 
      ? { 
          name: `${attendance.member.firstName} ${attendance.member.lastName}`.trim(),
          type: 'Member' as const,
          member: attendance.member
        }
      : { name: 'Unknown', type: 'Member' as const }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Attendance Details</h1>
        </div>
        <p className="text-muted-foreground">
          View and manage attendance record
        </p>
      </div>

      <div className="grid gap-6">
        {/* Header Card */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <User className="h-5 w-5 text-muted-foreground" />
                  {person.name}
                  <Badge 
                    variant={isVisitor ? 'default' : 'secondary'}
                    className="ml-2"
                  >
                    {person.type}
                  </Badge>
                </CardTitle>
                <div className="flex items-center text-sm text-muted-foreground mt-1">
                  <CalendarIcon className="mr-1 h-4 w-4" />
                  {format(attendanceDate, 'EEEE, MMMM d, yyyy')}
                </div>
                <div className="flex items-center text-sm text-muted-foreground mt-1">
                  <Clock className="mr-1 h-4 w-4" />
                  {format(attendanceDate, 'h:mm a')}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => {
                  router.push(`/attendance/edit/${id}`)
                }}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={async () => {
                    if (confirm('Are you sure you want to delete this attendance record? This action cannot be undone.')) {
                      try {
                        await attendanceApi.deleteAttendance(id)
                        toast.success('Attendance record deleted')
                        router.push('/attendance')
                      } catch (error) {
                        console.error('Error deleting attendance:', error)
                        toast.error('Failed to delete attendance record')
                      }
                    }
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Details Card */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Service Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Service Type</p>
                    <p className="font-medium">
                      {serviceTypeLabels[attendance.serviceType] || attendance.serviceType}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Recorded By</p>
                    <p className="font-medium">{attendance.takenBy}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Attendance Type</p>
                    <p className="font-medium">
                      {isVisitor ? 'Visitor' : 'Member'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date Recorded</p>
                    <p className="font-medium">
                      {format(new Date(attendance.createdAt), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </div>

                {attendance.notes && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Notes</p>
                    <div className="p-4 bg-muted/50 rounded-md">
                      <p className="whitespace-pre-line">{attendance.notes}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Member/Visitor Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {isVisitor ? 'Visitor Details' : 'Member Details'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isVisitor ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Name</p>
                        <p className="font-medium">{attendance.visitorName}</p>
                      </div>
                      {attendance.contact && (
                        <div>
                          <p className="text-sm text-muted-foreground">Contact</p>
                          <p className="font-medium">{attendance.contact}</p>
                        </div>
                      )}
                    </div>
                    {attendance.address && (
                      <div>
                        <p className="text-sm text-muted-foreground">Address</p>
                        <p className="font-medium">{attendance.address}</p>
                      </div>
                    )}
                  </div>
                ) : person.member ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Member ID</p>
                        <p className="font-mono text-sm">{person.member.memberNumber || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <Badge variant="outline" className="capitalize">
                          {person.member.membershipStatus?.toLowerCase() || 'Active'}
                        </Badge>
                      </div>
                    </div>
                    
                    <Separator className="my-2" />
                    
                    <div className="grid grid-cols-2 gap-4">
                      {person.member.email && (
                        <div>
                          <p className="text-sm text-muted-foreground">Email</p>
                          <p className="font-medium flex items-center">
                            <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                            {person.member.email}
                          </p>
                        </div>
                      )}
                      {person.member.phone && (
                        <div>
                          <p className="text-sm text-muted-foreground">Phone</p>
                          <p className="font-medium flex items-center">
                            <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                            {person.member.phone}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {person.member.address && (
                      <div>
                        <p className="text-sm text-muted-foreground">Address</p>
                        <p className="font-medium flex items-start">
                          <Home className="mr-2 h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <span className="whitespace-pre-line">{person.member.address}</span>
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No additional information available</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Actions Card */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => {
                    if (!isVisitor && person.member) {
                      router.push(`/members/${person.member.id}`)
                    } else {
                      toast.info('Visitor profile management coming soon')
                    }
                  }}
                >
                  <User className="mr-2 h-4 w-4" />
                  View {isVisitor ? 'Visitor' : 'Member'} Profile
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => {
                    if (isVisitor) {
                      router.push(`/attendance/mark?visitorName=${encodeURIComponent(attendance.visitorName || '')}`)
                    } else if (person.member) {
                      router.push(`/attendance/mark?memberId=${person.member.id}`)
                    }
                  }}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  Mark Attendance Again
                </Button>
                
                {!isVisitor && person.member && (
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => {
                      router.push(`/attendance?memberId=${person.member?.id}`)
                    }}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    View All Attendance
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* System Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">System Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Record ID:</span>
                  <span className="font-mono">{attendance.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created:</span>
                  <span>{format(new Date(attendance.createdAt), 'MMM d, yyyy h:mm a')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Updated:</span>
                  <span>{format(new Date(attendance.updatedAt), 'MMM d, yyyy h:mm a')}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}