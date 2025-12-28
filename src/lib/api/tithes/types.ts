export type PaymentType =
  | 'TITHE'
  | 'OFFERING'
  | 'DONATION'
  | 'OTHER';

export const PaymentTypeOptions = {
  TITHE: 'Tithe',
  OFFERING: 'Offering',
  DONATION: 'Donation',
  OTHER: 'Other',
} as const;

export type PaymentMethod =
  | 'CASH'
  | 'BANK_TRANSFER'
  | 'MOBILE_MONEY'
  | 'CREDIT_CARD'
  | 'OTHER';

export const PaymentMethodOptions = {
  CASH: 'Cash',
  BANK_TRANSFER: 'Bank Transfer',
  MOBILE_MONEY: 'Mobile Money',
  CREDIT_CARD: 'Credit Card',
  OTHER: 'Other',
} as const;

export interface Tithe {
  id: string;
  memberId: string;
  memberName?: string;
  amount: number;
  paymentDate: string; 
  paymentMethod: PaymentMethod;
  reference?: string;
  paymentType: PaymentType;
  recordedBy: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateTitheDto = Omit<Tithe, 'id' | 'createdAt' | 'updatedAt' | 'memberName'> & {
  // memberName is a UI convenience; backend expects memberId
};

export type UpdateTitheDto = Partial<CreateTitheDto>;

export type TitheResponse = Tithe;

export interface PaginatedTitheResponse {
  data: Tithe[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export type TithesList = PaginatedTitheResponse;
