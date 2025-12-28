"use client";

import { useState, useEffect, useCallback } from 'react';
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
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Handle search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchTithes = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await tithesApi.getTithes({
        page: pagination.page,
        limit: pagination.limit,
        search: debouncedSearch || undefined,
        paymentMethod: filter !== 'all' ? filter.toUpperCase().replace(' ', '_') : undefined,
      });

      // Map backend shape to table-compatible shape
      const mapped = response.data.map((t) => {
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
      setPagination(prev => ({
        ...prev,
        total: response.meta.total,
        totalPages: response.meta.totalPages
      }));
    } catch (error) {
      console.error('Error fetching tithes:', error);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, filter, debouncedSearch]);

  useEffect(() => {
    fetchTithes();
  }, [fetchTithes]);

  const handleView = (tithe: TableTithe) => {
    router.push(`/tithes/${tithe.id}`);
  };

  const handleEdit = (tithe: TableTithe) => {
    router.push(`/tithes/${tithe.id}/edit`);
  };

  const handleDelete = async (id: string) => {
    try {
      await tithesApi.deleteTithe(id);
      fetchTithes(); // Refresh list
    } catch (error) {
      console.error('Error deleting tithe:', error);
    }
  };

  const filteredTithes = tithes; // Server-side filtered

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
            <div className="space-y-4">
              <TithesTable
                tithes={filteredTithes}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />

              {/* Pagination Controls */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Showing <span className="font-medium">{tithes.length === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1}</span> to{" "}
                  <span className="font-medium">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span>{" "}
                  of <span className="font-medium">{pagination.total}</span> records
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={pagination.limit.toString()}
                    onValueChange={(value) => setPagination(prev => ({ ...prev, limit: parseInt(value), page: 1 }))}
                  >
                    <SelectTrigger className="w-[70px]">
                      <SelectValue placeholder="10" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-muted-foreground mr-2">per page</span>
                  
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                      disabled={pagination.page <= 1}
                    >
                      Previous
                    </Button>
                    <div className="flex items-center justify-center min-w-[32px] text-sm font-medium">
                      {pagination.page}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                      disabled={pagination.page >= pagination.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
