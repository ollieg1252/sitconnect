import { useState } from 'react';
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Alert, AlertDescription } from "./ui/alert";
import { ArrowLeft, Calendar, Clock, DollarSign, MapPin, Users, Star, Check, X } from "lucide-react";
import { noticesAPI } from '../utils/supabase/client';

interface User {
  id: string;
  email: string;
  name: string;
  userType: 'parent' | 'student';
}

interface NoticeDetailProps {
  notice: any;
  onNavigate: (screen: string) => void;
  userType: string;
  user: User | null;
}

export function NoticeDetail({ notice, onNavigate, userType, user }: NoticeDetailProps) {
  const [applicationMessage, setApplicationMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [updatingApplication, setUpdatingApplication] = useState<string | null>(null);

  if (!notice) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>No notice selected</p>
      </div>
    );
  }

  const isStudent = userType === 'student';
  const isParent = userType === 'parent';
  
  // Check if student has already applied
  const hasApplied = isStudent && notice.applications?.some((app: any) => app.studentId === user?.id);
  
  const handleApplicationStatusUpdate = async (applicationId: string, status: 'accepted' | 'rejected') => {
    try {
      setUpdatingApplication(applicationId);
      await noticesAPI.updateApplicationStatus(notice.id, applicationId, status);
      
      // Update the notice in place
      const updatedApplications = notice.applications.map((app: any) => 
        app.id === applicationId ? { ...app, status, updatedAt: new Date().toISOString() } : app
      );
      
      if (status === 'accepted') {
        notice.status = 'filled';
        notice.selectedStudentId = notice.applications.find((app: any) => app.id === applicationId)?.studentId;
        // Mark other applications as rejected
        updatedApplications.forEach((app: any) => {
          if (app.id !== applicationId && app.status === 'pending') {
            app.status = 'rejected';
            app.updatedAt = new Date().toISOString();
          }
        });
      }
      
      notice.applications = updatedApplications;
      setSuccess(`Application ${status} successfully!`);
    } catch (err: any) {
      console.error('Error updating application:', err);
      setError(err.message || 'Failed to update application');
    } finally {
      setUpdatingApplication(null);
    }
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!applicationMessage.trim()) {
      setError('Please enter a message with your application');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await noticesAPI.applyToNotice(notice.id, applicationMessage);
      setSuccess('Application submitted successfully!');
      setApplicationMessage('');
      
      // Add the application to the notice locally for immediate feedback
      if (!notice.applications) {
        notice.applications = [];
      }
      notice.applications.push({
        id: 'temp-' + Date.now(),
        studentId: user?.id,
        studentName: user?.name,
        message: applicationMessage,
        status: 'pending',
        appliedAt: new Date().toISOString()
      });
    } catch (err: any) {
      console.error('Error submitting application:', err);
      setError(err.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const calculateTotalPay = () => {
    if (notice.payRate && notice.duration) {
      const hours = parseFloat(notice.duration.split(' ')[0]);
      return `$${(notice.payRate * hours).toFixed(0)}`;
    }
    return 'TBD';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Button 
              variant="ghost"
              onClick={() => onNavigate(isStudent ? 'student-dashboard' : 'parent-dashboard')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert className="mb-6">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Notice Header */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">{notice.title}</CardTitle>
                    <CardDescription className="flex items-center mt-2">
                      <Users className="h-4 w-4 mr-1" />
                      {notice.parentName} • Ages {notice.ageGroup}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="text-lg px-3 py-1">
                      ${notice.payRate}/hour
                    </Badge>
                    {notice.status && notice.status !== 'open' && (
                      <div className="mt-2">
                        <Badge variant={notice.status === 'filled' ? 'default' : 'outline'}>
                          {notice.status.charAt(0).toUpperCase() + notice.status.slice(1)}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-4 text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    {new Date(notice.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    {notice.time}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    {notice.location}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {notice.description}
                </p>
                <div className="space-y-2">
                  <h4 className="font-medium">General Responsibilities:</h4>
                  <ul className="text-sm text-gray-600 space-y-1 ml-4">
                    <li>• Supervise children and ensure their safety</li>
                    <li>• Prepare simple snacks if needed</li>
                    <li>• Engage kids in age-appropriate activities</li>
                    <li>• Follow bedtime routines</li>
                    <li>• Provide regular updates to parents</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Application Form (Student View) */}
            {isStudent && notice.status === 'open' && !hasApplied && (
              <Card>
                <CardHeader>
                  <CardTitle>Apply for this Position</CardTitle>
                  <CardDescription>
                    Tell the family why you'd be a great fit for this job
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitApplication} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="message">Application Message</Label>
                      <Textarea 
                        id="message"
                        placeholder="Introduce yourself and explain why you're interested in this position..."
                        rows={6}
                        value={applicationMessage}
                        onChange={(e) => setApplicationMessage(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? 'Submitting...' : 'Submit Application'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Already Applied Message */}
            {isStudent && hasApplied && (
              <Card>
                <CardContent className="text-center py-8">
                  <h3 className="font-medium text-green-600 mb-2">Application Submitted!</h3>
                  <p className="text-gray-600">You have already applied for this position. The family will review your application and get back to you.</p>
                </CardContent>
              </Card>
            )}

            {/* Position Filled Message */}
            {notice.status === 'filled' && (
              <Card>
                <CardContent className="text-center py-8">
                  <h3 className="font-medium text-blue-600 mb-2">Position Filled</h3>
                  <p className="text-gray-600">This babysitting position has been filled.</p>
                </CardContent>
              </Card>
            )}

            {/* Applications (Parent View) */}
            {isParent && notice.applications && notice.applications.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Applications ({notice.applications.length})</CardTitle>
                  <CardDescription>
                    Students who have applied for this position
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {notice.applications.map((app: any) => (
                    <div key={app.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarFallback>{getUserInitials(app.studentName)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-medium">{app.studentName}</h4>
                            <p className="text-sm text-gray-600">
                              Applied on {new Date(app.appliedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Badge 
                          variant={
                            app.status === 'accepted' ? 'default' : 
                            app.status === 'rejected' ? 'destructive' : 'secondary'
                          }
                        >
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </Badge>
                      </div>
                      
                      {app.message && (
                        <p className="text-sm text-gray-700">{app.message}</p>
                      )}
                      
                      {app.status === 'pending' && (
                        <div className="flex space-x-2">
                          <Button 
                            size="sm"
                            onClick={() => handleApplicationStatusUpdate(app.id, 'accepted')}
                            disabled={updatingApplication === app.id}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            {updatingApplication === app.id ? 'Accepting...' : 'Accept'}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleApplicationStatusUpdate(app.id, 'rejected')}
                            disabled={updatingApplication === app.id}
                          >
                            <X className="h-4 w-4 mr-1" />
                            {updatingApplication === app.id ? 'Rejecting...' : 'Reject'}
                          </Button>
                        </div>
                      )}
                      
                      {app.status === 'accepted' && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <p className="text-sm text-green-800">
                            <strong>Selected!</strong> You've chosen {app.studentName} as your babysitter.
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* No Applications Yet */}
            {isParent && (!notice.applications || notice.applications.length === 0) && (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-gray-600">No applications received yet.</p>
                  <p className="text-sm text-gray-500 mt-2">Students will be able to apply once they see your notice.</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Family Info */}
            <Card>
              <CardHeader>
                <CardTitle>Family Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarFallback>{getUserInitials(notice.parentName)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium">{notice.parentName}</h4>
                    <div className="flex items-center text-sm text-gray-600">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                      New Parent
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{notice.location}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Job Details */}
            <Card>
              <CardHeader>
                <CardTitle>Job Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Duration</span>
                  <span className="text-gray-600">{notice.duration || 'TBD'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Pay</span>
                  <span className="text-gray-600">{calculateTotalPay()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Posted</span>
                  <span className="text-gray-600">
                    {new Date(notice.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Applications</span>
                  <span className="text-gray-600">
                    {notice.applications?.length || 0} received
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            {isStudent && notice.status === 'open' && !hasApplied && (
              <Card>
                <CardContent className="pt-6">
                  <Button 
                    className="w-full mb-2"
                    onClick={() => document.getElementById('message')?.focus()}
                  >
                    Apply Now
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}