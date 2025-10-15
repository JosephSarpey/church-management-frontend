import { Member } from "@/app/(protected)/members/page"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/Button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { MoreHorizontal } from "lucide-react"

interface MembersTableProps {
  members: Member[]
  onViewProfile: (memberId: string) => void
  onEdit?: (memberId: string) => void
  onDelete?: (memberId: string) => void
}

export function MembersTable({ members, onViewProfile, onEdit, onDelete }: MembersTableProps) {
  const getStatusBadge = (status: string | undefined) => {
    const statusToUse = status || 'PENDING'; 
    switch (statusToUse) {
      case 'ACTIVE':
        return <Badge className="bg-green-500">Active</Badge>
      case 'INACTIVE':
        return <Badge className="bg-red-500">Inactive</Badge>
      case 'PENDING':
        return <Badge className="bg-yellow-500">Pending</Badge>
      default:
        return <Badge className="bg-gray-500">{status}</Badge>
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Member #</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Join Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.length > 0 ? (
            members.map((member) => (
              <TableRow key={member.id}>
                <TableCell className="font-medium">
                  {member.memberNumber || 'N/A'}
                </TableCell>
                <TableCell className="font-medium">
                  {member.firstName} {member.lastName}
                </TableCell>
                <TableCell>{member.email}</TableCell>
                <TableCell>{member.phone}</TableCell>
                <TableCell>{getStatusBadge(member.membershipStatus)}</TableCell>
                <TableCell>
                  {new Date(member.joinDate).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onViewProfile(member.id)}>
                        View Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit?.(member.id)}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => onDelete?.(member.id)}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                No members found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}