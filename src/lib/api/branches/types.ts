export interface Branch {
  id: string;
  name: string;
  memberCount: number;
  income: number;
  expenditure: number;
  events: string;
  currentProject: string;
  address: string;
  description: string;
  pastorId: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateBranchDto = {
  name: string;
  memberCount: number;
  income: number;
  expenditure: number;
  events: string;
  currentProject: string;
  address: string;
  description: string;
  pastorId: string;
};

export type UpdateBranchDto = Partial<CreateBranchDto>;

