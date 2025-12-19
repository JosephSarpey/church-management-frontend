"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { DataTable } from "./components/data-table";
import { columns as getColumns } from "./components/columns";
import { useEffect, useMemo, useState } from "react";
import { Pastor } from "@/lib/api/pastors/types";
import { pastorsApi } from "@/lib/api/pastors";
import { toast } from "sonner";

export default function PastorsPage() {
  const router = useRouter();
  const [pastors, setPastors] = useState<Pastor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pastorToDelete, setPastorToDelete] = useState<Pastor | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchPastors = async () => {
      try {
        setLoading(true);
        const data = await pastorsApi.getPastors();
        setPastors(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching pastors:", error);
        toast.error("Failed to load pastors");
      } finally {
        setLoading(false);
      }
    };

    fetchPastors();
  }, []);

  const handleDeleteRequest = (id: string) => {
    const pastor = pastors.find((p) => p.id === id) ?? null;
    setPastorToDelete(pastor);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!pastorToDelete) return;

    try {
      setDeleting(true);
      await pastorsApi.deletePastor(pastorToDelete.id);
      setPastors((prev) => prev.filter((p) => p.id !== pastorToDelete.id));
      toast.success("Pastor deleted successfully");
      setDeleteDialogOpen(false);
      setPastorToDelete(null);
    } catch (error) {
      console.error("Error deleting pastor:", error);
      toast.error("Failed to delete pastor");
    } finally {
      setDeleting(false);
    }
  };

  const filteredPastors = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return pastors;

    return pastors.filter((p) => {
      const haystack = [p.name, p.currentStation, p.dateAppointed]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [pastors, search]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Pastors</h1>
          <p className="text-muted-foreground dark:text-gray-300">
            Manage pastors and their information
          </p>
        </div>
        <div className="flex flex-col gap-3 w-full sm:w-auto sm:flex-row sm:items-center">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search pastors..."
            className="w-full sm:w-64"
          />
          <Button 
            onClick={() => router.push("/pastors/add")}
            className="bg-amber-400 hover:bg-amber-500 dark:bg-amber-500 dark:hover:bg-amber-600 text-white"
          >
            <Plus className="mr-2 h-4 w-4" /> Add New
          </Button>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
        <DataTable columns={getColumns({ onDelete: handleDeleteRequest })} data={filteredPastors} />
      </div>

      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) setPastorToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete pastor?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
              {pastorToDelete?.name ? ` This will permanently delete ${pastorToDelete.name}.` : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}