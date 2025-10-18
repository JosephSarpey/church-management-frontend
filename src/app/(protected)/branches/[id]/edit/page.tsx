/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BranchForm } from "@/components/forms/branch-form";

// Dummy data - replace with actual API call
const getBranchById = (id: string) => {
  const branches = [
    { 
      id: "1", 
      name: "Main Branch", 
      memberCount: 150, 
      income: 50000, 
      expenditure: 35000, 
      events: "Sunday Service\nBible Study\nPrayer Meeting", 
      currentProject: "Church Renovation",
      description: "The main branch of our church, established in 2010.",
      address: "123 Church St, Anytown, AN 12345"
    },
    { 
      id: "2", 
      name: "North Branch", 
      memberCount: 85, 
      income: 25000, 
      expenditure: 20000, 
      events: "Sunday Service\nYouth Gathering", 
      currentProject: "Community Outreach",
      description: "Our northern branch serving the local community.",
      address: "456 North Ave, Somewhere, AN 67890"
    },
  ];
  
  return branches.find(branch => branch.id === id) || null;
};

export default function EditBranchPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [branch, setBranch] = useState<any>(null);

  useEffect(() => {
    // Simulate API call to fetch branch data
    const fetchBranch = async () => {
      try {
        setLoading(true);
        // In a real app, you would fetch the branch data from your API
        const data = getBranchById(params.id as string);
        if (data) {
          setBranch(data);
        } else {
          toast.error("Branch not found");
          router.push("/branches");
        }
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

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      console.log("Updating branch data:", data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Branch updated successfully");
      router.push(`/branches/${params.id}`);
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