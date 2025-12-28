/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar as CalendarIcon, MapPin, X, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import Image from 'next/image';
import { eventsApi } from '@/lib/api/events';
import { toast } from 'sonner';

type EventType = 'SUNDAY_SERVICE' | 'BIBLE_STUDY' | 'PRAYER_MEETING' | 'YOUTH_SERVICE' | 'SPECIAL_EVENT' | 'OTHER';
type EventStatus = 'DRAFT' | 'PUBLISHED' | 'CANCELLED';

interface FormData {
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  location: string;
  type: EventType;
  isRecurring: boolean;
  attendees: number;
  maxAttendees: number;
  registrationRequired: boolean;
  status: EventStatus;
  image: File | null;
  imageUrl: string;
  recurringPattern?: string;
}

export default function EditEventPage() {
  const router = useRouter();
  const { id } = useParams();
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    startTime: new Date(),
    endTime: new Date(new Date().setHours(new Date().getHours() + 1)),
    location: '',
    type: 'SUNDAY_SERVICE',
    attendees: 0,
    isRecurring: false,
    maxAttendees: 100,
    registrationRequired: false,
    status: 'PUBLISHED',
    image: null,
    imageUrl: '',
    recurringPattern: 'WEEKLY',
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const event = await eventsApi.getEvent(id as string);
        setFormData({
          title: event.title,
          description: event.description || '',
          startTime: new Date(event.startTime),
          endTime: new Date(event.endTime),
          location: event.location || '',
          type: event.type as EventType,
          attendees: event.attendees || 0,
          isRecurring: event.isRecurring || false,
          maxAttendees: event.maxAttendees || 100,
          registrationRequired: event.registrationRequired || false,
          status: event.status as EventStatus,
          image: null,
          imageUrl: event.imageUrl || '',
          recurringPattern: event.recurringPattern || 'WEEKLY',
        });
        if (event.imageUrl) {
          setPreviewImage(event.imageUrl);
        }
      } catch (error) {
        console.error('Error fetching event:', error);
        toast.error('Failed to load event');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchEvent();
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' 
        ? parseInt(value, 10) 
        : type === 'checkbox' 
          ? (e.target as HTMLInputElement).checked
          : value
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
      const formDataToSend = new FormData();
      const { image, ...eventData } = formData;
      
      Object.entries(eventData).forEach(([key, value]) => {
        if (value instanceof Date) {
          formDataToSend.append(key, value.toISOString());
        } else if (value !== null && value !== undefined) {
          formDataToSend.append(key, value.toString());
        }
      });
      
      if (formData.image) {
        formDataToSend.append('files', formData.image);
      }
      
      await eventsApi.updateEvent(id as string, formDataToSend);
      
      toast.success('Event updated successfully!');
      router.push(`/events/${id}`);
      router.refresh();
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error('Failed to update event. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Event</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">Update the event details below</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Event Title <span className="text-red-500">*</span>
                </label>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter event title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Enter event description"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Time</label>
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
                        {formData.startTime ? format(formData.startTime, 'MMM d, yyyy h:mm a') : <span>Pick a date</span>}
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
                              endTime: new Date(newStartTime.getTime() + 3600000) // Add 1 hour
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
                              endTime: new Date(newStartTime.getTime() + 3600000) // Add 1 hour
                            }));
                          }}
                          className="w-full"
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">End Time</label>
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
                        {formData.endTime ? format(formData.endTime, 'MMM d, yyyy h:mm a') : <span>Pick a date</span>}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Location</label>
                  <div className="relative">
                    <Input
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="Enter event location"
                      className="pl-10"
                    />
                    <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Event Type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Event Status
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="DRAFT">Draft</option>
                      <option value="PUBLISHED">Published</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
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
                      onChange={handleChange}
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

        <div className="flex justify-end space-x-4 pt-4">
          <Button
            type="button"
            variant="outline"
            className="border-yellow-500 text-yellow-600 hover:bg-yellow-50 dark:border-yellow-600 dark:text-yellow-400 dark:hover:bg-yellow-900/20"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-yellow-500 hover:bg-yellow-600 text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : 'Update Event'}
          </Button>
        </div>
      </form>
    </div>
  );
}