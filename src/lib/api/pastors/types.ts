export interface Branch {
  id: string;
  name: string;
  location: string;
  createdAt: string;
  updatedAt: string;
}
export interface Pastor {
  id: string;
  name: string;
  dateAppointed: string;
  currentStation: string;
  createdAt: string;
  updatedAt: string;
}

export type CreatePastorDto = {
  name: string;
  dateAppointed: string;
  currentStation: string;
};

export type UpdatePastorDto = Partial<CreatePastorDto>;