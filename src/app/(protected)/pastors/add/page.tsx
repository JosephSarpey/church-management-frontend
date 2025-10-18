/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useRouter } from "next/navigation";
import { PastorForm } from "@/components/forms/pastor-form";
import { toast } from "sonner";
import { CreatePastorDto } from "@/lib/api/pastors/types";

export default function AddPastorPage() {
  const router = useRouter();

  const handleSubmit = async (data: CreatePastorDto) => {
    try {
      // TODO: Replace with actual API call
      // const res = await fetch('/api/pastors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data),
      // });
      // if (!res.ok) throw new Error('Failed to create pastor');
      
      toast.success('Pastor created successfully');
      router.push('/pastors');
      router.refresh();
    } catch (error) {
      console.error('Error creating pastor:', error);
      toast.error('Failed to create pastor');
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Add New Pastor</h1>
          <p className="text-muted-foreground">
            Add a new pastor to the church management system
          </p>
        </div>
      </div>
      
      <div className="bg-card text-card-foreground p-6 rounded-lg border shadow-sm">
        <PastorForm 
          onSubmit={handleSubmit}
          isEdit={false}
        />
      </div>
    </div>
  );
}