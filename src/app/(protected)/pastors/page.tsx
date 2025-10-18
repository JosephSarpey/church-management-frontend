"use client";

import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { DataTable } from "./components/data-table";
import { columns } from "./components/columns";
import { useEffect, useState } from "react";
import { Pastor } from "@/lib/api/pastors/types";

export default function PastorsPage() {
  const router = useRouter();
  const [pastors, setPastors] = useState<Pastor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch pastors from API
    const fetchPastors = async () => {
      try {
        // Mock data - replace with actual API call
        const mockPastors: Pastor[] = [
          {
            id: "1",
            name: "John Doe",
            dateAppointed: "2020-01-15",
            currentStation: "Main Branch"
          },
          {
            id: "2",
            name: "Jane Smith",
            dateAppointed: "2021-03-22",
            currentStation: "Downtown Branch"
          }
        ];
        setPastors(mockPastors);
      } catch (error) {
        console.error("Error fetching pastors:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPastors();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Pastors</h1>
          <p className="text-muted-foreground dark:text-gray-300">
            Manage pastors and their information
          </p>
        </div>
        <Button 
          onClick={() => router.push("/pastors/add")}
          className="bg-amber-400 hover:bg-amber-500 dark:bg-amber-500 dark:hover:bg-amber-600 text-white"
        >
          <Plus className="mr-2 h-4 w-4" /> Add New
        </Button>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
        <DataTable columns={columns} data={pastors} />
      </div>
    </div>
  );
}