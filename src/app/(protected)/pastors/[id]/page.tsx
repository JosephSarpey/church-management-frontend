"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Edit } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { pastorsApi } from "@/lib/api/pastors";
import { Pastor } from "@/lib/api/pastors/types";
import { toast } from "sonner";

export default function PastorDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [pastor, setPastor] = useState<Pastor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPastor = async () => {
      try {
        setLoading(true);
        const data = await pastorsApi.getPastor(params.id);
        setPastor(data);
      } catch (error) {
        console.error("Error fetching pastor:", error);
        toast.error("Failed to load pastor");
        setPastor(null);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchPastor();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!pastor) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">Pastor not found</h2>
        <p className="text-muted-foreground mt-2">The requested pastor could not be found</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push("/pastors")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to pastors
        </Button>
      </div>
    );
  }

  const formattedDate = format(new Date(pastor.dateAppointed), "MMMM d, yyyy");

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/pastors">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Pastor Details</h1>
        </div>

        <Button asChild>
          <Link href={`/pastors/${pastor.id}/edit`} className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Edit Pastor
          </Link>
        </Button>
      </div>

      <Card className="bg-card text-card-foreground shadow-sm">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl">{pastor.name}</CardTitle>
            <Badge variant="outline" className="text-sm">
              Active
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Name</p>
              <p className="text-foreground">{pastor.name}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Current Station</p>
              <p className="text-foreground">{pastor.currentStation}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Date Appointed</p>
              <p className="text-foreground">{formattedDate}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Member Since</p>
              <p className="text-foreground">
                {format(new Date(pastor.createdAt), "MMMM d, yyyy")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}