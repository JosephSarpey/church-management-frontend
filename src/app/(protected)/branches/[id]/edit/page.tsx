"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BranchForm } from "@/components/forms/branch-form";
import { branchesApi } from "@/lib/api/branches";
import { Branch, UpdateBranchDto } from "@/lib/api/branches/types";

export default function EditBranchPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [branch, setBranch] = useState<Branch | null>(null);

  useEffect(() => {
    const fetchBranch = async () => {
      try {
        setLoading(true);
        const id = Array.isArray(params.id) ? params.id[0] : (params.id as string);
        const data = await branchesApi.getBranch(id);
        setBranch(data);
      } catch (error) {
        console.error("Error fetching branch:", error);
        toast.error("Failed to load branch data");
        router.push("/branches");
      } finally {
        setLoading(false);
      }
    };

    fetchBranch();
  }, [params.id, router]);

  const onSubmit = async (data: UpdateBranchDto) => {
    try {
      setLoading(true);
      const id = Array.isArray(params.id) ? params.id[0] : (params.id as string);
      await branchesApi.updateBranch(id, data);
      toast.success("Branch updated successfully");
      router.push(`/branches/${id}`);
      router.refresh();
    } catch (error) {
      console.error("Error updating branch:", error);
      toast.error("Failed to update branch");
    } finally {
      setLoading(false);
    }
  };

  if (!branch) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Loading branch data...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Edit Branch</h1>
        <Button variant="outline" onClick={() => router.back()}>
          Back to Branch
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Branch Information</CardTitle>
        </CardHeader>
        <CardContent>
          <BranchForm 
            initialData={branch} 
            onSubmit={onSubmit} 
            loading={loading} 
          />
        </CardContent>
      </Card>
    </div>
  );
}