import { FamilyMember } from "@/components/forms/FamilyMembersInput";

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  skip: number;
  take: number;
}

export interface MemberCountResponse {
  count: number;
  previousCount: number;
}

export interface MemberStats {
  totalMembers: number;
  activeMembers: number;
  baptizedMembers: number;
  genderDistribution: {
    male: number;
    female: number;
  };
  ageDistribution: {
    youth: number;
    adults: number;
  };
  growthRate: number;
}

export type Gender = 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
export const GenderOptions = {
  MALE: 'Male',
  FEMALE: 'Female',
  OTHER: 'Other',
  PREFER_NOT_TO_SAY: 'Prefer not to say'
} as const;

export type MaritalStatus = 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED' | 'SEPARATED' | 'OTHER';
export const MaritalStatusOptions = {
  SINGLE: 'Single',
  MARRIED: 'Married',
  DIVORCED: 'Divorced',
  WIDOWED: 'Widowed',
  SEPARATED: 'Separated',
  OTHER: 'Other'
} as const;

export type MembershipStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING';
export const MembershipStatusOptions = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  PENDING: 'Pending'
} as const;

export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  memberNumber?: string;
  dateOfBirth?: string;
  gender?: Gender;
  maritalStatus?: MaritalStatus;
  membershipStatus?: MembershipStatus;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  joinDate?: string;
  baptized?: boolean;
  baptismDate?: string;
  familyMembers?: FamilyMember[];
  occupation?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdById?: string;
}

export type CreateMemberDto = Omit<Member, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateMemberDto = Partial<CreateMemberDto>;
export type MemberResponse = Member;
export type PaginatedMembers = PaginatedResponse<Member>;

export type ActivityType = 'attendance' | 'tithe' | 'offering' | 'note' | 'update' | 'other';

export interface Activity {
  id: string;
  type: ActivityType;
  date: string;
  title: string;
  description: string;
  present?: boolean;
  amount?: number;
  icon?: React.ReactNode;
  iconBackground?: string;
  meta?: string;
}