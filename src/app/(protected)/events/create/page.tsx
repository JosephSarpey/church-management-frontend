/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar as CalendarIcon, Clock, MapPin, X } from 'lucide-react';
import { format, addHours } from 'date-fns';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import Image from 'next/image';
import { eventsApi } from '@/lib/api/events';
import { CreateEventDto, ServiceType } from '@/lib/api/events/types';
import { toast } from 'sonner';

export default function CreateEventPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: new Date(),
    endTime: addHours(new Date(), 1), // Default to 1 hour duration
    location: '',
    type: 'SUNDAY_SERVICE' as ServiceType,
    isRecurring: false,
    recurringPattern: 'WEEKLY' as string,
    attendees: 0,
    maxAttendees: 100,
    registrationRequired: false,
    image: null as File | null,
    imageUrl: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }));
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      image: null
    }));
    setPreviewImage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const { image, ...eventData } = formData;
      
      // Create the event data object matching CreateEventDto
      const eventDto: CreateEventDto = {
        ...eventData,
        startTime: formData.startTime.toISOString(),
        endTime: formData.endTime.toISOString(),
        status: 'PUBLISHED',
        attendees: formData.attendees || 0,
        maxAttendees: formData.maxAttendees || 100,
        imageUrl: formData.imageUrl || '',
      };
      
      // Convert the event data to FormData for file upload
      const formDataToSend = new FormData();
      
      // Add all fields to form data
      Object.entries(eventDto).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formDataToSend.append(key, value.toString());
        }
      });
      
      // Add image if it exists
      if (image) {
        formDataToSend.append('files', image);
      }
      
      await eventsApi.createEvent(eventDto, image ? [image] : undefined);
      
      toast.success('Event created successfully!');
      router.push('/events');
      router.refresh(); // Refresh the events list
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create New Event</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">Fill in the details below to create a new church event</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Event Title <span className="text-red-500">*</span>
                </label>
                <Input
                  id="title"
                  name="title"
                  type="text"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="E.g., Sunday Service"
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <Textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Provide details about the event..."
                  className="min-h-[120px] dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Start Time <span className="text-red-500">*</span>
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !formData.startTime && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(formData.startTime, 'MMM d, yyyy h:mm a')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.startTime}
                        onSelect={(date) => {
                          if (date) {
                            const newStartTime = new Date(date);
                            newStartTime.setHours(formData.startTime.getHours(), formData.startTime.getMinutes());
                            setFormData(prev => ({
                              ...prev,
                              startTime: newStartTime,
                              endTime: new Date(newStartTime.getTime() + (formData.endTime.getTime() - formData.startTime.getTime()))
                            }));
                          }
                        }}
                        initialFocus
                      />
                      <div className="p-3 border-t">
                        <Input
                          type="time"
                          value={format(formData.startTime, 'HH:mm')}
                          onChange={(e) => {
                            const [hours, minutes] = e.target.value.split(':').map(Number);
                            const newStartTime = new Date(formData.startTime);
                            newStartTime.setHours(hours, minutes);
                            setFormData(prev => ({
                              ...prev,
                              startTime: newStartTime,
                              endTime: new Date(newStartTime.getTime() + (formData.endTime.getTime() - formData.startTime.getTime()))
                            }));
                          }}
                          className="w-full"
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    End Time <span className="text-red-500">*</span>
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !formData.endTime && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(formData.endTime, 'MMM d, yyyy h:mm a')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.endTime}
                        onSelect={(date) => {
                          if (date) {
                            const newEndTime = new Date(date);
                            newEndTime.setHours(formData.endTime.getHours(), formData.endTime.getMinutes());
                            setFormData(prev => ({
                              ...prev,
                              endTime: newEndTime
                            }));
                          }
                        }}
                        initialFocus
                      />
                      <div className="p-3 border-t">
                        <Input
                          type="time"
                          value={format(formData.endTime, 'HH:mm')}
                          onChange={(e) => {
                            const [hours, minutes] = e.target.value.split(':').map(Number);
                            const newEndTime = new Date(formData.endTime);
                            newEndTime.setHours(hours, minutes);
                            setFormData(prev => ({
                              ...prev,
                              endTime: newEndTime
                            }));
                          }}
                          className="w-full"
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Location <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input
                    id="location"
                    name="location"
                    type="text"
                    required
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="E.g., Main Sanctuary"
                    className="pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Event Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as ServiceType }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="SUNDAY_SERVICE">Sunday Service</option>
                  <option value="BIBLE_STUDY">Bible Study</option>
                  <option value="PRAYER_MEETING">Prayer Meeting</option>
                  <option value="YOUTH_SERVICE">Youth Service</option>
                  <option value="SPECIAL_EVENT">Special Event</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="attendees" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Current Attendees
                    </label>
                    <Input
                      id="attendees"
                      name="attendees"
                      type="number"
                      min="0"
                      value={formData.attendees}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        attendees: parseInt(e.target.value) || 0
                      }))}
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="maxAttendees" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Max Attendees
                    </label>
                    <Input
                      id="maxAttendees"
                      name="maxAttendees"
                      type="number"
                      min="1"
                      value={formData.maxAttendees}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        maxAttendees: parseInt(e.target.value) || 0
                      }))}
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    id="registrationRequired"
                    name="registrationRequired"
                    type="checkbox"
                    checked={formData.registrationRequired}
                    onChange={(e) => setFormData(prev => ({ ...prev, registrationRequired: e.target.checked }))}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="registrationRequired" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Require registration
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    id="isRecurring"
                    name="isRecurring"
                    type="checkbox"
                    checked={formData.isRecurring}
                    onChange={(e) => setFormData(prev => ({ ...prev, isRecurring: e.target.checked }))}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="isRecurring" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Recurring event
                  </label>
                </div>

                {formData.isRecurring && (
                  <div className="pl-6 space-y-2">
                    <label htmlFor="recurringPattern" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Recurrence Pattern
                    </label>
                    <select
                      id="recurringPattern"
                      name="recurringPattern"
                      value={formData.recurringPattern}
                      onChange={(e) => setFormData(prev => ({ ...prev, recurringPattern: e.target.value }))}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="DAILY">Daily</option>
                      <option value="WEEKLY">Weekly</option>
                      <option value="MONTHLY">Monthly</option>
                      <option value="YEARLY">Yearly</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Event Image (optional)
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-700 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  {previewImage ? (
                    <div className="relative">
                      <Image
                        src={previewImage}
                        width={200}
                        height={200}
                        alt="Preview"
                        className="mx-auto max-h-48 rounded-md"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 text-white hover:bg-red-600 focus:outline-none"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex text-sm text-gray-600 dark:text-gray-300">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-primary dark:text-white hover:text-primary-dark focus-within:outline-none"
                        >
                          <span>Upload a file</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            onChange={handleImageChange}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, GIF up to 5MB</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-8">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
            className="dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="w-full md:w-auto bg-yellow-500 hover:bg-yellow-600 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Event'}
          </Button>
        </div>
      </form>
    </div>
  );
}