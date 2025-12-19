"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BranchForm } from "@/components/forms/branch-form";
import { branchesApi } from "@/lib/api/branches";
import { CreateBranchDto } from "@/lib/api/branches/types";

export default function AddBranchPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: CreateBranchDto) => {
    try {
      setLoading(true);
      await branchesApi.createBranch(data);
      toast.success("Branch added successfully");
      router.push("/branches");
      router.refresh();
    } catch (error) {
      console.error("Error adding branch:", error);
      toast.error("Failed to add branch");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Add New Branch</h1>
        <Button variant="outline" onClick={() => router.back()}>
          Back to Branches
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Branch Information</CardTitle>
        </CardHeader>
        <CardContent>
          <BranchForm onSubmit={onSubmit} loading={loading} />
        </CardContent>
      </Card>
    </div>
  );
}