export interface ChurchSettings {
  id: string;
  churchName: string;
  pastorName: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  emailNotifications: boolean;
  maintenanceMode: boolean;
  timezone: string;
  currency: string;
  dateFormat: string;
  timeFormat: string;
  createdAt: string;
  updatedAt: string;
}

export type UpdateSettingsDto = Partial<Omit<ChurchSettings, 'id' | 'createdAt' | 'updatedAt'>>;