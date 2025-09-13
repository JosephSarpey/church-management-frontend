"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/switch';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-amber-900 dark:text-amber-100 mb-8">Settings</h1>
      
      <div className="grid gap-6">
        {/* Church Information */}
        <Card className="border-amber-200 dark:border-amber-800">
          <CardHeader>
            <CardTitle className="text-xl text-amber-800 dark:text-amber-200">Church Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="churchName">Church Name</Label>
                  <Input id="churchName" defaultValue="Zion Chapel" className="border-amber-300 dark:border-amber-700" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pastorName">Pastor&apos;s Name</Label>
                  <Input id="pastorName" placeholder="Enter pastor's name" className="border-amber-300 dark:border-amber-700" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Contact Email</Label>
                  <Input id="email" type="email" placeholder="contact@zionchapel.com" className="border-amber-300 dark:border-amber-700" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" placeholder="+1 (555) 000-0000" className="border-amber-300 dark:border-amber-700" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" placeholder="123 Church Street, City, State" className="border-amber-300 dark:border-amber-700" />
              </div>
              <div className="flex justify-end pt-4">
                <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* App Preferences */}
        <Card className="border-amber-200 dark:border-amber-800">
          <CardHeader>
            <CardTitle className="text-xl text-amber-800 dark:text-amber-200">App Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
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
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable maintenance mode for the application
                  </p>
                </div>
                <Switch />
              </div>
              <div className="flex justify-end pt-2">
                <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                  Save Preferences
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}