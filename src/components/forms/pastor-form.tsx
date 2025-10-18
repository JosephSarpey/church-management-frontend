/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/Button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/Input";
import { toast } from "sonner";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

const formSchema = z.object({
    name: z.string().min(2, {
        message: "Name must be at least 2 characters.",
    }),
    dateAppointed: z.string().min(1, {
        message: "Please select a date of appointment.",
    }),
    currentStation: z.string().min(2, {
        message: "Please enter the current station or branch.",
    }),
});

type PastorFormValues = z.infer<typeof formSchema>;

interface PastorFormProps {
  initialData?: any;
  isEdit?: boolean;
  loading?: boolean;
  onSubmit: (data: PastorFormValues) => Promise<void> | void;
}

export const PastorForm: React.FC<PastorFormProps> = ({
    initialData,
    isEdit = false,
}) => {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const form = useForm<PastorFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData || {
            name: "",
            dateAppointed: "",
            currentStation: "",
        },
    });
    const onSubmit = async (data: PastorFormValues) => {
        try {
            setLoading(true);
            console.log("Submitting pastor data:", data);
            if (isEdit) {
                // Update pastor
                // TODO: Implement update API call
                toast.success("Pastor updated successfully!");
            } else {
                // Create new pastor
                // TODO: Implement create API call
                toast.success("Pastor added successfully!");
            }
            router.refresh();
            router.push(`/pastors`);
        } catch (error) {
            console.error("Error submitting form:", error);
            toast.error("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
                <div className="grid grid-cols-1 gap-8">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input
                                        disabled={loading}
                                        placeholder="Pastor's full name"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="dateAppointed"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Date Appointed as Pastor</FormLabel>
                                <FormControl>
                                    <Input
                                        type="date"
                                        disabled={loading}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="currentStation"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Current Station/Branch</FormLabel>
                                <FormControl>
                                    <Input
                                        disabled={loading}
                                        placeholder="Current station or branch"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <Button
                    disabled={loading}
                    type="submit"
                    className="ml-auto"
                >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isEdit ? 'Save changes' : 'Add Pastor'}
                </Button>
            </form>
        </Form>
    );
};