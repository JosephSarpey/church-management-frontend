/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FamilyMembersInput } from '@/components/forms/FamilyMembersInput';
import { membersApi } from '@/lib/api/members';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';

// Form schema with validation
const memberFormSchema = z.object({
  firstName: z.string().min(2, { message: 'First name must be at least 2 characters' }),
  lastName: z.string().min(2, { message: 'Last name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  phone: z.string().min(10, { message: 'Please enter a valid phone number' }),
  dateOfBirth: z.date({
    error: 'A date of birth is required.',
  }),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'], 'Please select a gender'),
  address: z.string().min(5, { message: 'Please enter a valid address' }),
  membershipStatus: z.enum(['ACTIVE', 'INACTIVE', 'PENDING'], 'Please select a membership status'),
  joinDate: z.date({
    error: 'Join date is required.',
  }),
  notes: z.string().optional(),
  familyMembers: z.array(z.object({
    id: z.string(),
    name: z.string(),
    relationship: z.string(),
  })).optional(),
});

type MemberFormValues = z.infer<typeof memberFormSchema>;

export default function EditMemberPage({ params }: { params: { id: string } }) {
  // In Next.js 13+, params is a Promise and needs to be unwrapped with React.use()
  const { id } = params;
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<MemberFormValues>({
    resolver: zodResolver(memberFormSchema),
    defaultValues: {
      membershipStatus: 'ACTIVE',
      joinDate: new Date(),
      familyMembers: [],
    },
  });

  // Fetch member data
  useEffect(() => {
    const fetchMember = async () => {
      try {
        setIsLoading(true);
        const member = await membersApi.getMember(id);
        
        // Format dates and set form values
        reset({
          ...member,
          dateOfBirth: member.dateOfBirth ? new Date(member.dateOfBirth) : new Date(),
          joinDate: member.joinDate ? new Date(member.joinDate) : new Date(),
          familyMembers: (member as any).familyMembers || [],
        });
      } catch (error) {
        console.error('Error fetching member:', error);
        toast.error('Failed to load member data');
        router.push('/members');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchMember();
    }
  }, [id, reset, router]);

  const onSubmit = async (data: MemberFormValues) => {
    try {
      const memberData = {
        ...data,
        dateOfBirth: data.dateOfBirth.toISOString(),
        joinDate: data.joinDate.toISOString(),
        gender: data.gender as 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY',
        familyMembers: data.familyMembers?.map(fm => ({
          ...fm, // Spread all existing properties including id
          name: fm.name,
          relationship: fm.relationship,
        })) || [],
      };
      
      await membersApi.updateMember(id, memberData);
      
      toast.success('Member updated successfully');
      
      router.push(`/members/${id}`);
      router.refresh();
    } catch (error) {
      console.error('Error updating member:', error);
      toast.error('Failed to update member. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Button 
        variant="ghost" 
        onClick={() => router.push(`/members/${id}`)}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Member Details
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Edit Member</CardTitle>
          <CardDescription>Update the member details below.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input id="firstName" {...register('firstName')} />
                {errors.firstName && (
                  <p className="text-sm text-red-500">{errors.firstName.message}</p>
                )}
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input id="lastName" {...register('lastName')} />
                {errors.lastName && (
                  <p className="text-sm text-red-500">{errors.lastName.message}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" {...register('email')} />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input id="phone" {...register('phone')} />
                {errors.phone && (
                  <p className="text-sm text-red-500">{errors.phone.message}</p>
                )}
              </div>

              {/* Date of Birth */}
              <div className="space-y-2">
                <Label>Date of Birth *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !watch('dateOfBirth') && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {watch('dateOfBirth') ? (
                        format(watch('dateOfBirth'), 'PPP')
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={watch('dateOfBirth')}
                      onSelect={(date) => setValue('dateOfBirth', date as Date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.dateOfBirth && (
                  <p className="text-sm text-red-500">{errors.dateOfBirth.message}</p>
                )}
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <Label>Gender *</Label>
                <Select
                  onValueChange={(value) => setValue('gender', value as MemberFormValues['gender'])}
                  value={watch('gender')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Male</SelectItem>
                    <SelectItem value="FEMALE">Female</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                    <SelectItem value="PREFER_NOT_TO_SAY">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
                {errors.gender && (
                  <p className="text-sm text-red-500">{errors.gender.message}</p>
                )}
              </div>

              {/* Address */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Address *</Label>
                <Input id="address" {...register('address')} />
                {errors.address && (
                  <p className="text-sm text-red-500">{errors.address.message}</p>
                )}
              </div>

              {/* Membership Status */}
              <div className="space-y-2">
                <Label>Membership Status *</Label>
                <Select
                  onValueChange={(value) => setValue('membershipStatus', value as MemberFormValues['membershipStatus'])}
                  value={watch('membershipStatus')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                  </SelectContent>
                </Select>
                {errors.membershipStatus && (
                  <p className="text-sm text-red-500">{errors.membershipStatus.message}</p>
                )}
              </div>

              {/* Join Date */}
              <div className="space-y-2">
                <Label>Join Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !watch('joinDate') && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {watch('joinDate') ? (
                        format(watch('joinDate'), 'PPP')
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={watch('joinDate')}
                      onSelect={(date) => setValue('joinDate', date as Date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.joinDate && (
                  <p className="text-sm text-red-500">{errors.joinDate.message}</p>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Input id="notes" {...register('notes')} />
                {errors.notes && (
                  <p className="text-sm text-red-500">{errors.notes.message}</p>
                )}
              </div>

              {/* Family Members */}
              <div className="space-y-2 md:col-span-2">
                
                <FamilyMembersInput
                  value={watch('familyMembers') || []}
                  onChange={(familyMembers) => setValue('familyMembers', familyMembers)}
                />
                {errors.familyMembers && (
                  <p className="text-sm text-red-500">{errors.familyMembers.message}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/members/${id}`)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}