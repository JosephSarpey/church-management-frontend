"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { tithesApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { TithesTable } from '@/components/tables/TithesTable';
import { Tithe as TableTithe } from '@/components/tables/TithesTable';

export default function TithesPage() {
  const router = useRouter();
  const [tithes, setTithes] = useState<TableTithe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  
  useEffect(() => {
    const fetchTithes = async () => {
      try {
        setIsLoading(true);
        const data = await tithesApi.getTithes();

        // Map backend shape to table-compatible shape
        const mapped = data.map((t) => {
          const paymentMethod =
            t.paymentMethod === 'CASH'
              ? 'Cash'
              : t.paymentMethod === 'BANK_TRANSFER'
              ? 'Bank Transfer'
              : t.paymentMethod === 'CREDIT_CARD'
              ? 'Credit Card'
              : t.paymentMethod === 'MOBILE_MONEY'
              ? 'Mobile Money'
              : 'Other';

          const paymentType =
            t.paymentType === 'TITHE'
              ? 'Tithe'
              : t.paymentType === 'OFFERING'
              ? 'Offering'
              : t.paymentType === 'DONATION'
              ? 'Donation'
              : 'Other';

          const tableTithe: TableTithe = {
            id: t.id,
            memberName: t.memberName || '',
            amount: t.amount,
            paymentDate: new Date(t.paymentDate),
            paymentMethod,
            paymentType,
            referenceNumber: t.reference || undefined,
            notes: t.notes,
          };

          return tableTithe;
        });

        setTithes(mapped);
      } catch (error) {
        console.error('Error fetching tithes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTithes();
  }, []);

  const handleEdit = (tithe: TableTithe) => {
    router.push(`/tithes/${tithe.id}/edit`);
  };

  const handleDelete = async (id: string) => {
    try {
      await tithesApi.deleteTithe(id);
      setTithes((prev) => prev.filter((t) => t.id !== id));
    } catch (error) {
      console.error('Error deleting tithe:', error);
    }
  };

  const filteredTithes = tithes.filter((tithe) => {
    const matchesSearch = tithe.memberName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter =
      filter === 'all' || tithe.paymentMethod === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tithes & Offering Management</h1>
        <Button onClick={() => router.push('/tithes/add')}>
          <Plus className="mr-2 h-4 w-4" /> Add Tithe/Offering
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>Tithes</CardTitle>
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                placeholder="Search by member name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64"
              />
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="Credit Card">Credit Card</SelectItem>
                  <SelectItem value="Mobile Money">Mobile Money</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <TithesTable
              tithes={filteredTithes}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}