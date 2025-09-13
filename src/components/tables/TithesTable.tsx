"use client";

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/Button';
import { Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export interface Tithe {
  id: string;
  memberName: string;
  amount: number;
  paymentDate: Date;
  paymentMethod: string;
  referenceNumber?: string;
  notes?: string;
}

interface TithesTableProps {
  tithes: Tithe[];
  onEdit: (tithe: Tithe) => void;
  onDelete: (id: string) => void;
}

export function TithesTable({ tithes, onEdit, onDelete }: TithesTableProps) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(id);
      await onDelete(id);
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Member Name</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Payment Date</TableHead>
            <TableHead>Payment Method</TableHead>
            <TableHead>Reference</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tithes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-4">
                No tithes recorded yet.
              </TableCell>
            </TableRow>
          ) : (
            tithes.map((tithe) => (
              <TableRow key={tithe.id}>
                <TableCell className="font-medium">{tithe.memberName}</TableCell>
                <TableCell className="text-right">
                  ${tithe.amount.toFixed(2)}
                </TableCell>
                <TableCell>
                  {format(new Date(tithe.paymentDate), 'MMM dd, yyyy')}
                </TableCell>
                <TableCell>{tithe.paymentMethod}</TableCell>
                <TableCell>{tithe.referenceNumber || '-'}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(tithe)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(tithe.id)}
                      disabled={isDeleting === tithe.id}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}