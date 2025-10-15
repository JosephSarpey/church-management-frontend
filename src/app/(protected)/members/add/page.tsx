/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
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


const memberFormSchema = z.object({
  firstName: z.string().min(2, { message: 'First name must be at least 2 characters' }),
  lastName: z.string().min(2, { message: 'Last name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }).optional(),
  phone: z.string().min(10, { message: 'Please enter a valid phone number' }).optional(),
  dateOfBirth: z.date({
    error: 'A date of birth is required.',
  }).optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER'], 'Please select a gender').optional(),
  maritalStatus: z.enum(['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED'], 'Please select a marital status').optional(),
  membershipStatus: z.enum(['ACTIVE', 'INACTIVE', 'PENDING'], 'Please select a membership status').default('PENDING'),
  address: z.string().min(5, { message: 'Please enter a valid address' }).optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  joinDate: z.date({
    error: 'Join date is required.',
  }).default(new Date()),
  baptized: z.boolean().default(false),
  baptismDate: z.date().optional(),
  occupation: z.string().optional(),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
  notes: z.string().optional(),
  familyMembers: z.array(z.object({
    id: z.string(),
    name: z.string(),
    relationship: z.string(),
    dateOfBirth: z.date().optional(),
  })).optional(),
});

type MemberFormValues = {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: Date;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  maritalStatus?: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED';
  membershipStatus: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  joinDate: Date;
  baptized: boolean;
  baptismDate?: Date;
  occupation?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  notes?: string;
  familyMembers?: Array<{
    id: string;
    name: string;
    relationship: string;
    dateOfBirth?: Date;
  }>;
};

export default function AddMemberPage() {
  const router = useRouter();
  
  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberFormSchema as any),
    defaultValues: {
      firstName: '',
      lastName: '',
      membershipStatus: 'ACTIVE',
      joinDate: new Date(),
      baptized: false,
      familyMembers: [],
    },
  });

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = form;

  const generateId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

  const onSubmit: SubmitHandler<MemberFormValues> = async (data) => {
    try {
      const memberData = {
        ...data,
        dateOfBirth: data.dateOfBirth?.toISOString(),
        joinDate: data.joinDate.toISOString(),
        baptismDate: data.baptismDate?.toISOString(),
        gender: data.gender as 'MALE' | 'FEMALE' | 'OTHER' | undefined,
        familyMembers: data.familyMembers?.map(fm => ({
          id: fm.id || generateId(),
          name: fm.name,
          relationship: fm.relationship,
          dateOfBirth: fm.dateOfBirth?.toISOString(),
        })) || [],
      };
      
      await membersApi.createMember(memberData);
      
      toast.success('Member added successfully');
      
      router.push('/members');
      router.refresh(); 
    } catch (error) {
      console.error('Error adding member:', error);
      toast.error('Failed to add member. Please try again.');
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Button 
        variant="ghost" 
        onClick={() => router.back()}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Members
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Add New Member</CardTitle>
          <CardDescription>Fill in the details below to add a new church member.</CardDescription>
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
                        format(watch('dateOfBirth') as Date, 'PPP')
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={watch('dateOfBirth') || undefined}
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
                  defaultValue={watch('gender')}
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
              <div className="space-y-2">
                <Label>Address</Label>
                <Input id="address" {...register('address')} placeholder="Street address" />
                {errors.address && (
                  <p className="text-sm text-red-500">{errors.address.message}</p>
                )}
              </div>

              {/* City */}
              <div className="space-y-2">
                <Label>City</Label>
                <Input id="city" {...register('city')} />
              </div>

              {/* State/Province */}
              <div className="space-y-2">
                <Label>State/Province</Label>
                <Input id="state" {...register('state')} />
              </div>

              {/* Country */}
              <div className="space-y-2">
                <Label>Country</Label>
                <Input id="country" {...register('country')} />
              </div>

              {/* Postal Code */}
              <div className="space-y-2">
                <Label>Postal Code</Label>
                <Input id="postalCode" {...register('postalCode')} />
              </div>

              {/* Marital Status */}
              <div className="space-y-2">
                <Label>Marital Status</Label>
                <Select
                  onValueChange={(value: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED') => 
                    setValue('maritalStatus', value)
                  }
                  defaultValue={watch('maritalStatus')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select marital status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SINGLE">Single</SelectItem>
                    <SelectItem value="MARRIED">Married</SelectItem>
                    <SelectItem value="DIVORCED">Divorced</SelectItem>
                    <SelectItem value="WIDOWED">Widowed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Baptism Status */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="baptized"
                    {...register('baptized')}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <Label htmlFor="baptized">Baptized</Label>
                </div>
                {watch('baptized') && (
                  <div className="mt-2">
                    <Label>Baptism Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full justify-start text-left font-normal',
                            !watch('baptismDate') && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {watch('baptismDate') ? (
                            format(watch('baptismDate')!, 'PPP')
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={watch('baptismDate') as Date | undefined}
                          onSelect={(date) => setValue('baptismDate', date as Date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
              </div>

              {/* Occupation */}
              <div className="space-y-2">
                <Label>Occupation</Label>
                <Input id="occupation" {...register('occupation')} />
              </div>

              {/* Emergency Contact */}
              <div className="space-y-2">
                <Label>Emergency Contact Name</Label>
                <Input id="emergencyContact" {...register('emergencyContact')} />
              </div>

              {/* Emergency Phone */}
              <div className="space-y-2">
                <Label>Emergency Contact Phone</Label>
                <Input id="emergencyPhone" {...register('emergencyPhone')} />
              </div>

              {/* Notes */}
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
                  defaultValue={watch('membershipStatus')}
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
                <Input
                  id="notes"
                  {...register('notes')}
                  placeholder="Any additional notes about the member"
                />
              </div>

              {/* Family Members */}
              <div className="space-y-2 md:col-span-2">
                <FamilyMembersInput
                  value={watch('familyMembers') || []}
                  onChange={(members) => setValue('familyMembers', members)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/members')}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="min-w-[120px]"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding...
                  </>
                ) : 'Add Member'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
