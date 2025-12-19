/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Pastor } from "@/lib/api/pastors/types";
import { Button } from "@/components/ui/Button";
import { Pencil, Trash2 } from "lucide-react";
import Link from "next/link";

export const columns = (opts: { onDelete: (id: string) => void }): ColumnDef<Pastor>[] => [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "currentStation",
    header: "Current Station",
  },
  {
    accessorKey: "dateAppointed",
    header: "Date Appointed",
    cell: ({ row }: { row: any }) => {
      const date = new Date(row.getValue("dateAppointed"));
      return date.toLocaleDateString();
    },
  },
  {
    id: "actions",
    cell: ({ row }: { row: any }) => {
      const pastor = row.original;

      return (
        <div className="flex space-x-2">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/pastors/${pastor.id}/edit`}>
              <Pencil className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="destructive"
            size="icon"
            onClick={() => opts.onDelete(pastor.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];