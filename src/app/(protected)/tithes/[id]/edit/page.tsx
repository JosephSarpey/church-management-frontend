"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { toast } from 'sonner';
import { tithesApi } from '@/lib/api';
import type { UpdateTitheDto, PaymentMethod, PaymentType } from '@/lib/api/tithes/types';
import MemberSearch from '@/components/forms/MemberSearch';
import type { Member } from '@/lib/api/members/types';

const paymentTypeMap: Record<string, string> = {
  Tithe: 'TITHE',
  Offering: 'OFFERING',
  Donation: 'DONATION',
  Other: 'OTHER',
};

const paymentTypeReverseMap: Record<string, string> = {
  TITHE: 'Tithe',
  OFFERING: 'Offering',
  DONATION: 'Donation',
  OTHER: 'Other',
};

const paymentMethodMap: Record<string, string> = {
  Cash: 'CASH',
  'Bank Transfer': 'BANK_TRANSFER',
  'Credit Card': 'CREDIT_CARD',
  'Mobile Money': 'MOBILE_MONEY',
  Other: 'OTHER',
};

const paymentMethodReverseMap: Record<string, string> = {
  CASH: 'Cash',
  BANK_TRANSFER: 'Bank Transfer',
  CREDIT_CARD: 'Credit Card',
  MOBILE_MONEY: 'Mobile Money',
  OTHER: 'Other',
};

const EditTithePage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string | undefined;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        setLoading(true);
        const t = await tithesApi.getTithe(id);
        setFormData({
            memberName: t.memberName || '',
          amount: String(t.amount),
          paymentDate: new Date(t.paymentDate).toISOString().split('T')[0],
          paymentMethod: paymentMethodReverseMap[t.paymentMethod] || 'Other',
          paymentType: paymentTypeReverseMap[t.paymentType] || 'Tithe',
          referenceNumber: t.reference || '',
          notes: t.notes || '',
        });
          // set selected member id/name for search component
          if (t.memberId) {
            setSelectedMember({ id: t.memberId, firstName: t.memberName?.split(' ')[0] || '', lastName: t.memberName?.split(' ').slice(1).join(' ') || '', email: '', phone: '', memberNumber: '', createdAt: '', updatedAt: '' } as Member);
          }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load tithe');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setIsSubmitting(true);
    try {
      // If memberName changed, try to resolve memberId
      if (!selectedMember) {
        throw new Error('Please select a member');
      }
      const memberId = selectedMember.id;
      const payload: UpdateTitheDto = {
        memberId,
        amount: parseFloat(formData.amount),
        // convert date-only input to full ISO datetime string
        paymentDate: new Date(formData.paymentDate).toISOString(),
        paymentMethod: (paymentMethodMap[formData.paymentMethod] || 'OTHER') as PaymentMethod,
        paymentType: (paymentTypeMap[formData.paymentType] || 'OTHER') as PaymentType,
        reference: formData.referenceNumber || undefined,
        notes: formData.notes || undefined,
      };

      await tithesApi.updateTithe(id, payload);
      toast.success('Tithe updated');
      router.push('/tithes');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update tithe');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!id) return <div>Invalid id</div>;

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Edit Tithe</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Tithe</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading...</div>
          ) : (
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
                  <Select value={formData.paymentType} onValueChange={(v) => handleSelectChange('paymentType', v)}>
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
                  <Input id="amount" name="amount" type="number" step="0.01" min="0" value={formData.amount} onChange={handleChange} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentDate">Payment Date *</Label>
                  <Input id="paymentDate" name="paymentDate" type="date" value={formData.paymentDate} onChange={handleChange} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Payment Method *</Label>
                  <Select value={formData.paymentMethod} onValueChange={(v) => handleSelectChange('paymentMethod', v)}>
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
                  <Input id="referenceNumber" name="referenceNumber" value={formData.referenceNumber} onChange={handleChange} />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} rows={3} />
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <Button type="button" variant="outline" onClick={() => router.push('/tithes')} disabled={isSubmitting}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Changes'}</Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EditTithePage;