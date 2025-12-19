"use client";

/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { tithesApi } from '@/lib/api';
import type { Tithe as ApiTithe } from '@/lib/api/tithes/types';

const TitheDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string | undefined;

  const [tithe, setTithe] = useState<ApiTithe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        setLoading(true);
        const data = await tithesApi.getTithe(id);
        setTithe(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (!id) return <div>Invalid tithe id</div>;

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tithe Details</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading...</div>
          ) : tithe ? (
            <div className="space-y-2">
              <div><strong>Member:</strong> {tithe.memberName}</div>
              <div><strong>Amount:</strong> ₵{tithe.amount.toFixed(2)}</div>
              <div><strong>Payment Date:</strong> {new Date(tithe.paymentDate).toLocaleString()}</div>
              <div><strong>Payment Type:</strong> {tithe.paymentType}</div>
              <div><strong>Payment Method:</strong> {tithe.paymentMethod}</div>
              <div><strong>Reference:</strong> {tithe.reference || '-'}</div>
              <div><strong>Notes:</strong> {tithe.notes || '-'}</div>
            </div>
          ) : (
            <div>Tithe not found</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TitheDetailPage;