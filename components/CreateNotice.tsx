import { useState } from 'react';
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Alert, AlertDescription } from "./ui/alert";
import { ArrowLeft, Calendar, Clock, DollarSign } from "lucide-react";
import { noticesAPI } from '../utils/supabase/client';

interface User {
  id: string;
  email: string;
  name: string;
  userType: 'parent' | 'student';
}

interface CreateNoticeProps {
  onNavigate: (screen: string) => void;
  user: User | null;
}

export function CreateNotice({ onNavigate, user }: CreateNoticeProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    address: '',
    location: '',
    payRate: '',
    ageGroup: '',
    duration: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Calculate duration when start/end times change
    if (field === 'startTime' || field === 'endTime') {
      const updatedData = { ...formData, [field]: value };
      if (updatedData.startTime && updatedData.endTime) {
        const start = new Date(`2000-01-01 ${updatedData.startTime}`);
        const end = new Date(`2000-01-01 ${updatedData.endTime}`);
        const diffHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        if (diffHours > 0) {
          setFormData(prev => ({ ...prev, duration: `${diffHours} hours` }));
        }
      }
    }
  };

  const validateForm = () => {
    if (!formData.title || !formData.description || !formData.date || 
        !formData.startTime || !formData.endTime || !formData.address || 
        !formData.location || !formData.payRate || !formData.ageGroup) {
      setError('Please fill in all required fields');
      return false;
    }

    const payRateNum = parseFloat(formData.payRate);
    if (isNaN(payRateNum) || payRateNum <= 0) {
      setError('Please enter a valid hourly rate');
      return false;
    }

    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      setError('Please select a future date');
      return false;
    }

    return true;
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const noticeData = {
        title: formData.title,
        description: formData.description,
        date: formData.date,
        time: `${formatTime(formData.startTime)} - ${formatTime(formData.endTime)}`,
        address: formData.address,
        location: formData.location,
        payRate: parseFloat(formData.payRate),
        duration: formData.duration || 'TBD',
        ageGroup: formData.ageGroup
      };

      await noticesAPI.createNotice(noticeData);
      
      // Navigate back to dashboard
      onNavigate('parent-dashboard');
    } catch (err: any) {
      console.error('Error creating notice:', err);
      setError(err.message || 'Failed to create notice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Button 
              variant="ghost"
              onClick={() => onNavigate('parent-dashboard')}
              disabled={loading}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Create Babysitting Notice</CardTitle>
                  <CardDescription>
                    Provide details about your babysitting needs to attract the right candidates
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Job Title *</Label>
                    <Input 
                      id="title" 
                      placeholder="e.g., Saturday Evening Babysitting, After School Care"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea 
                      id="description"
                      placeholder="Describe what you're looking for in a babysitter, any special requirements, and what the children enjoy doing..."
                      rows={4}
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ages">Children's Ages *</Label>
                    <Input 
                      id="ages" 
                      placeholder="e.g., 4, 7, 10"
                      value={formData.ageGroup}
                      onChange={(e) => handleInputChange('ageGroup', e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Date & Time */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Date & Time
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date *</Label>
                    <Input 
                      id="date" 
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleInputChange('date', e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startTime">Start Time *</Label>
                      <Input 
                        id="startTime" 
                        type="time"
                        value={formData.startTime}
                        onChange={(e) => handleInputChange('startTime', e.target.value)}
                        disabled={loading}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="endTime">End Time *</Label>
                      <Input 
                        id="endTime" 
                        type="time"
                        value={formData.endTime}
                        onChange={(e) => handleInputChange('endTime', e.target.value)}
                        disabled={loading}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment & Location */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-2" />
                    Payment & Location
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="rate">Hourly Rate *</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-500">$</span>
                      <Input 
                        id="rate" 
                        type="number"
                        step="0.50"
                        min="0"
                        placeholder="15"
                        className="pl-8"
                        value={formData.payRate}
                        onChange={(e) => handleInputChange('payRate', e.target.value)}
                        disabled={loading}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">Full Address *</Label>
                    <Input 
                      id="address" 
                      placeholder="123 Main St, City, State 12345"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="location">General Area *</Label>
                    <Input 
                      id="location" 
                      placeholder="e.g., Downtown, Near University, Suburbs"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      disabled={loading}
                    />
                    <p className="text-xs text-gray-500">This will be visible to students browsing notices</p>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end space-x-4">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => onNavigate('parent-dashboard')}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Post Notice'}
                </Button>
              </div>
            </form>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Notice Preview</CardTitle>
                <CardDescription>How your notice will appear to students</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h3 className="font-medium">{formData.title || 'Job Title'}</h3>
                  <p className="text-sm text-gray-600">
                    {user?.name || 'Your Name'} • Ages {formData.ageGroup || 'TBD'}
                  </p>
                </div>
                
                {formData.payRate && (
                  <div className="flex items-center justify-between text-sm">
                    <span>Rate:</span>
                    <span className="font-medium">${formData.payRate}/hour</span>
                  </div>
                )}
                
                <div className="text-sm text-gray-600 space-y-1">
                  {formData.date && (
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>{new Date(formData.date).toLocaleDateString()}</span>
                    </div>
                  )}
                  {formData.startTime && formData.endTime && (
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{formatTime(formData.startTime)} - {formatTime(formData.endTime)}</span>
                    </div>
                  )}
                </div>
                
                {formData.description && (
                  <p className="text-sm text-gray-700 mt-2">{formData.description}</p>
                )}
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle>Tips for Success</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>• Be specific about your expectations</p>
                <p>• Include children's interests and personalities</p>
                <p>• Set a competitive but fair rate</p>
                <p>• Respond to applications promptly</p>
                <p>• Provide clear instructions and emergency contacts</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}