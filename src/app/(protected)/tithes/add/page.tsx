"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { tithesApi } from '@/lib/api';
import type { CreateTitheDto, PaymentMethod, PaymentType } from '@/lib/api/tithes/types';
import MemberSearch from '@/components/forms/MemberSearch';
import type { Member } from '@/lib/api/members/types';

const paymentTypeMap: Record<string, string> = {
  Tithe: 'TITHE',
  Offering: 'OFFERING',
  Donation: 'DONATION',
  Other: 'OTHER',
};

const paymentMethodMap: Record<string, string> = {
  Cash: 'CASH',
  'Bank Transfer': 'BANK_TRANSFER',
  'Credit Card': 'CREDIT_CARD',
  'Mobile Money': 'MOBILE_MONEY',
  Other: 'OTHER',
};

export default function AddTithePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    memberName: '',
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: '',
    paymentType: '',
    referenceNumber: '',
    notes: '',
  });
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Use the selected member (autocomplete) to get memberId
      if (!selectedMember) {
        throw new Error('Please select a member from the search results');
      }
      const memberId = selectedMember.id;

      const payload: CreateTitheDto = {
        memberId,
        amount: parseFloat(formData.amount),
        // convert date-only input to full ISO datetime string
        paymentDate: new Date(formData.paymentDate).toISOString(),
        paymentMethod: (paymentMethodMap[formData.paymentMethod] || 'OTHER') as PaymentMethod,
        paymentType: (paymentTypeMap[formData.paymentType] || 'OTHER') as PaymentType,
        reference: formData.referenceNumber || undefined,
        recordedBy: selectedMember.createdById || 'system',
        notes: formData.notes || undefined,
      };

      await tithesApi.createTithe(payload);

      toast.success('Tithe record added successfully');

      router.push('/tithes');
    } catch (error) {
      console.error('Error adding tithe:', error);
      toast.error('Failed to add tithe. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <Button 
        variant="ghost" 
        className="mb-6" 
        onClick={() => router.back()}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Tithes
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Add New Tithe/Offering</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="memberName">Member Name *</Label>
                <MemberSearch
                  defaultQuery={formData.memberName}
                  onSelect={(m) => {
                    setSelectedMember(m);
                    setFormData((prev) => ({ ...prev, memberName: `${m.firstName} ${m.lastName}` }));
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentType">Tithe/Offering *</Label>
                <Select
                  value={formData.paymentType}
                  onValueChange={(value) => handleSelectChange('paymentType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tithe">Tithe</SelectItem>
                    <SelectItem value="Offering">Offering</SelectItem>
                    <SelectItem value="Donation">Donation</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5">₵</span>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder="0.00"
                    className="pl-8"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentDate">Payment Date *</Label>
                <Input
                  id="paymentDate"
                  name="paymentDate"
                  type="date"
                  value={formData.paymentDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment Method *</Label>
                <Select
                  value={formData.paymentMethod}
                  onValueChange={(value) => handleSelectChange('paymentMethod', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    <SelectItem value="Credit Card">Credit Card</SelectItem>
                    <SelectItem value="Mobile Money">Mobile Money</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="referenceNumber">Reference Number</Label>
                <Input
                  id="referenceNumber"
                  name="referenceNumber"
                  value={formData.referenceNumber}
                  onChange={handleChange}
                  placeholder="Enter reference number"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Any additional notes"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/tithes')}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Tithe'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}