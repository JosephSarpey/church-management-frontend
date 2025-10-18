/* eslint-disable @typescript-eslint/no-unused-vars */
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Edit } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface PastorDetailPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params: _params }: PastorDetailPageProps): Promise<Metadata> {
  // In a real app, you would fetch the pastor's name here
  const pastorName = "Pastor Name"; // Replace with actual data fetch
  return {
    title: `${pastorName} | Pastor Details`,
  };
}

async function getPastor(id: string) {
  // TODO: Replace with actual API call
  // const res = await fetch(`/api/pastors/${id}`);
  // if (!res.ok) return null;
  // return res.json();
  
  // Mock data
  return {
    id,
    name: "John Doe",
    dateAppointed: "2020-01-15",
    currentStation: "Main Branch",
    createdAt: "2020-01-15T00:00:00.000Z",
    updatedAt: "2023-01-15T00:00:00.000Z",
  };
}

export default async function PastorDetailPage({ params }: PastorDetailPageProps) {
  const pastor = await getPastor(params.id);

  if (!pastor) {
    notFound();
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