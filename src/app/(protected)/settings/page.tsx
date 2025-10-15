/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/switch';
import { useTheme } from 'next-themes';
import { Sun, Moon, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import settingsApi from '@/lib/api/settings';

type FormData = {
  churchName: string;
  pastorName: string; 
  email: string;       
  phone: string;       
  address: string;     
  emailNotifications: boolean;
  maintenanceMode: boolean;
  timezone: string;
  currency: string;
  dateFormat: string;
  timeFormat: string;
};

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const queryClient = useQueryClient();

  // Fetch settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsApi.getSettings(),
  });

  // Update settings mutation
  const updateSettings = useMutation({
    mutationFn: (newSettings: any) => settingsApi.updateSettings(newSettings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Settings updated successfully');
    },
    onError: (error: any) => {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings');
    },
  });

  const [formData, setFormData] = useState<FormData>({
    churchName: '',
    pastorName: '',
    email: '',
    phone: '',
    address: '',
    emailNotifications: true,
    maintenanceMode: false,
    timezone: 'UTC',
    currency: 'USD',
    dateFormat: 'MM/dd/yyyy',
    timeFormat: 'hh:mm a',
  });

  // Update form data when settings are loaded
  useEffect(() => {
    if (settings) {
      setFormData(prev => ({
        ...prev,
        churchName: settings.churchName,
        pastorName: settings.pastorName || '', 
        email: settings.email || '', 
        phone: settings.phone || '', 
        address: settings.address || '', 
        emailNotifications: settings.emailNotifications,
        maintenanceMode: settings.maintenanceMode,
        timezone: settings.timezone,
        currency: settings.currency,
        dateFormat: settings.dateFormat,
        timeFormat: settings.timeFormat,
      }));
    }
  }, [settings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings.mutate(formData);
  };

  if (isLoading) {
    return <div>Loading settings...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-amber-900 dark:text-amber-100 mb-8">Settings</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Church Information */}
        <Card className="border-amber-200 dark:border-amber-800">
          <CardHeader>
            <CardTitle className="text-xl text-amber-800 dark:text-amber-200">Church Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="churchName">Church Name</Label>
                <Input
                  id="churchName"
                  name="churchName"
                  value={formData.churchName}
                  onChange={handleChange}
                  className="border-amber-300 dark:border-amber-700"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pastorName">Pastor&apos;s Name</Label>
                <Input
                  id="pastorName"
                  name="pastorName"
                  value={formData.pastorName || ''}
                  onChange={handleChange}
                  className="border-amber-300 dark:border-amber-700"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Contact Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={handleChange}
                  className="border-amber-300 dark:border-amber-700"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleChange}
                  className="border-amber-300 dark:border-amber-700"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                value={formData.address || ''}
                onChange={handleChange}
                className="border-amber-300 dark:border-amber-700"
              />
            </div>
          </CardContent>
        </Card>

        {/* App Preferences */}
        <Card className="border-amber-200 dark:border-amber-800">
          <CardHeader>
            <CardTitle className="text-xl text-amber-800 dark:text-amber-200">App Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/50">
                  {theme === 'dark' ? (
                    <Moon className="h-5 w-5 text-amber-400" />
                  ) : (
                    <Sun className="h-5 w-5 text-amber-600" />
                  )}
                </div>
                <div>
                  <Label className="text-base block">Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    {theme === 'dark' ? 'Dark' : 'Light'} theme is currently active
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="border-amber-300 dark:border-amber-700"
                type="button"
              >
                {theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive email notifications
                </p>
              </div>
              <Switch
                checked={formData.emailNotifications}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, emailNotifications: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Enable maintenance mode for the application
                </p>
              </div>
              <Switch
                checked={formData.maintenanceMode}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, maintenanceMode: checked }))
                }
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                className="bg-amber-600 hover:bg-amber-700 text-white"
                disabled={updateSettings.isPending}
              >
                {updateSettings.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Settings
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}