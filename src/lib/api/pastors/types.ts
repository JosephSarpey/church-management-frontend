export interface Pastor {
  id: string;
  name: string;
  dateAppointed: string;
  currentStation: string;
  createdAt?: string;
  updatedAt?: string;
}

export type CreatePastorDto = Omit<Pastor, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdatePastorDto = Partial<CreatePastorDto>;