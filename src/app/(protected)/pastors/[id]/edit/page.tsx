/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pastor, UpdatePastorDto } from "@/lib/api/pastors/types";
import { pastorFormSchema } from "@/validations/pastor";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PastorForm } from "@/components/forms/pastor-form";
import Link from "next/link";

type MockPastor = Omit<Pastor, 'id'> & { id: string | string[] };

export default function EditPastorPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [pastor, setPastor] = useState<MockPastor | null>(null);

  const form = useForm<UpdatePastorDto>({
    resolver: zodResolver(pastorFormSchema.partial()),
    defaultValues: {
      name: "",
      dateAppointed: "",
      currentStation: "",
    },
  });

  useEffect(() => {
    const fetchPastor = async () => {
      try {
        // TODO: Replace with actual API call
        // const res = await fetch(`/api/pastors/${params.id}`);
        // if (!res.ok) throw new Error("Failed to fetch pastor");
        // const data = await res.json();
        
        // Mock data
        const data: MockPastor = {
  id: params.id as string, 
  name: "John Doe",
  dateAppointed: "2020-01-15",
  currentStation: "Main Branch",
  createdAt: "2020-01-15T00:00:00.000Z",
  updatedAt: "2023-01-15T00:00:00.000Z",
};
        
        setPastor(data);
        form.reset({
          name: data.name,
          dateAppointed: data.dateAppointed,
          currentStation: data.currentStation,
        });
      } catch (error) {
        console.error("Error fetching pastor:", error);
        toast.error("Failed to load pastor data");
      } finally {
        setLoading(false);
      }
    };

    fetchPastor();
  }, [params.id, form]);

  const onSubmit = async (formData: UpdatePastorDto) => {
  try {
    setLoading(true);
    // TODO: Replace with actual API call
    // const res = await fetch(`/api/pastors/${params.id}`, {
    //   method: "PATCH",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify(formData),
    // });
    // if (!res.ok) throw new Error("Failed to update pastor");
    
    toast.success("Pastor updated successfully");
    router.push(`/pastors/${params.id}`);
    router.refresh();
  } catch (error) {
    console.error("Error updating pastor:", error);
    toast.error("Failed to update pastor");
  } finally {
    setLoading(false);
  }
};

  if (loading && !pastor) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!pastor) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Pastor not found</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/pastors">Back to Pastors</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/pastors/${params.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Edit Pastor</h1>
      </div>

      <div className="bg-card text-card-foreground rounded-lg border shadow-sm p-6">
        <PastorForm
          initialData={pastor}
          isEdit
          onSubmit={onSubmit}
          loading={loading}
        />
      </div>
    </div>
  );
}