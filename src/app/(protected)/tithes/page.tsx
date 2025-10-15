"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { Tithe } from '@/components/tables/TithesTable';

export default function TithesPage() {
  const router = useRouter();
  const [tithes, setTithes] = useState<Tithe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  // Fetch tithes from API
  useEffect(() => {
    const fetchTithes = async () => {
      try {
        // TODO: Replace with actual API call
        // const response = await fetch('/api/tithes');
        // const data = await response.json();
        
        // Mock data for now
        const mockTithes: Tithe[] = [
          {
            id: '1',
            memberName: 'John Doe',
            amount: 100,
            paymentDate: new Date('2023-10-15'),
            paymentMethod: 'Cash',
            referenceNumber: 'T12345',
          },
          {
            id: '2',
            memberName: 'Jane Smith',
            amount: 150,
            paymentDate: new Date('2023-10-10'),
            paymentMethod: 'Bank Transfer',
            referenceNumber: 'T12346',
          },
        ];
        
        setTithes(mockTithes);
      } catch (error) {
        console.error('Error fetching tithes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTithes();
  }, []);

  const handleEdit = (tithe: Tithe) => {
    router.push(`/tithes/edit/${tithe.id}`);
  };

  const handleDelete = async (id: string) => {
    try {
      // TODO: Replace with actual API call
      // await fetch(`/api/tithes/${id}`, { method: 'DELETE' });
      setTithes(tithes.filter((tithe) => tithe.id !== id));
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
        <h1 className="text-2xl font-bold">Tithes Management</h1>
        <Button onClick={() => router.push('/tithes/add')}>
          <Plus className="mr-2 h-4 w-4" /> Add Tithe
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