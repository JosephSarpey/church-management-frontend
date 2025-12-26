/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/Button";
import { useEffect, useState } from "react";
import { pastorsApi } from "@/lib/api/pastors";
import { Pastor } from "@/lib/api/pastors/types";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  pastorId: z.string().min(1, {
    message: "Please select a pastor.",
  }),
  memberCount: z.coerce.number().min(0, {
    message: "Number of members cannot be negative.",
  }),
  income: z.coerce.number().min(0, {
    message: "Income cannot be negative.",
  }),
  expenditure: z.coerce.number().min(0, {
    message: "Expenditure cannot be negative.",
  }),
  events: z.string().min(1, {
    message: "Please enter at least one event.",
  }),
  currentProject: z.string().min(1, {
    message: "Please enter the current project.",
  }),
  address: z.string().min(5, {
    message: "Please enter a valid address.",
  }),
  description: z.string().min(1, {
    message: "Please enter a description.",
  }),
});

type BranchFormValues = z.infer<typeof formSchema>;

interface BranchFormProps {
  onSubmit: (data: BranchFormValues) => void;
  loading?: boolean;
  initialData?: Partial<BranchFormValues>;
}

export function BranchForm({ onSubmit, loading, initialData }: BranchFormProps) {
  const [pastors, setPastors] = useState<Pastor[]>([]);
  const [loadingPastors, setLoadingPastors] = useState(false);

  const form = useForm<BranchFormValues>({
    resolver: zodResolver(formSchema as any),
    defaultValues: {
      name: initialData?.name || "",
      pastorId: initialData?.pastorId || "",
      memberCount: initialData?.memberCount || 0,
      income: initialData?.income || 0,
      expenditure: initialData?.expenditure || 0,
      events: initialData?.events || "",
      currentProject: initialData?.currentProject || "",
      address: initialData?.address || "",
      description: initialData?.description || "",
    },
  });

  useEffect(() => {
    const fetchPastors = async () => {
      try {
        setLoadingPastors(true);
        const data = await pastorsApi.getPastors();
        setPastors(data);
      } catch (error) {
        console.error("Error fetching pastors:", error);
        toast.error("Failed to load pastors list");
      } finally {
        setLoadingPastors(false);
      }
    };

    fetchPastors();
  }, []);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => onSubmit(data))} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Branch Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter branch name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="pastorId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Branch Pastor</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={loadingPastors ? "Loading..." : "Select a pastor"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {pastors.map((pastor) => (
                      <SelectItem key={pastor.id} value={pastor.id}>
                        {pastor.name}
                      </SelectItem>
                    ))}
                    {pastors.length === 0 && !loadingPastors && (
                      <div className="p-2 text-sm text-muted-foreground text-center">
                        No pastors found
                      </div>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="memberCount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number of Members</FormLabel>
                <FormControl>
                  <Input type="number" min={0} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="income"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Income (₵)</FormLabel>
                <FormControl>
                  <Input type="number" min={0} step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="expenditure"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expenditure (₵)</FormLabel>
                <FormControl>
                  <Input type="number" min={0} step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="events"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Upcoming Events (one per line)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Sunday Service&#10;Bible Study&#10;Prayer Meeting"
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="currentProject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Project</FormLabel>
                <FormControl>
                  <Input placeholder="Enter current project" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input placeholder="Enter branch address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter branch description"
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-end space-x-4">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => window.history.back()}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Branch"}
          </Button>
        </div>
      </form>
    </Form>
  );
}