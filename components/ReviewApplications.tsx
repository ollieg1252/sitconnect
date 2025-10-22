import { useState, useEffect } from 'react';
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { ArrowLeft, User, CheckCircle, XCircle, Clock, Mail, Phone } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";
import { noticesAPI } from '../utils/supabase/client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

interface Application {
  id: string;
  studentId: string;
  studentName: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  appliedAt: string;
}

interface Notice {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  payRate: string;
  duration: string;
  ageGroup: string;
  status: string;
  applications: Application[];
}

interface ReviewApplicationsProps {
  notice: Notice;
  onNavigate: (screen: string) => void;
}

export function ReviewApplications({ notice, onNavigate }: ReviewApplicationsProps) {
  const [applications, setApplications] = useState<Application[]>(notice.applications || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [actionType, setActionType] = useState<'accept' | 'reject' | null>(null);

  const handleStatusUpdate = async (applicationId: string, status: 'accepted' | 'rejected') => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await noticesAPI.updateApplicationStatus(notice.id, applicationId, status);
      
      // Update local state
      setApplications(prev => prev.map(app => 
        app.id === applicationId 
          ? { ...app, status }
          : app.status === 'pending' && status === 'accepted' 
            ? { ...app, status: 'rejected' as const }
            : app
      ));

      if (status === 'accepted') {
        setSuccess('Babysitter selected successfully! All other applications have been rejected.');
      } else {
        setSuccess('Application rejected.');
      }

      setSelectedApplication(null);
      setActionType(null);
    } catch (err: any) {
      console.error('Error updating application:', err);
      setError(err.message || 'Failed to update application');
    } finally {
      setLoading(false);
    }
  };

  const openConfirmDialog = (application: Application, action: 'accept' | 'reject') => {
    setSelectedApplication(application);
    setActionType(action);
  };

  const pendingApplications = applications.filter(app => app.status === 'pending');
  const acceptedApplications = applications.filter(app => app.status === 'accepted');
  const rejectedApplications = applications.filter(app => app.status === 'rejected');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'accepted':
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Accepted</Badge>;
      case 'rejected':
        return <Badge variant="secondary" className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <Button 
          variant="ghost" 
          className="mb-4"
          onClick={() => onNavigate('parent-dashboard')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>{notice.title}</CardTitle>
                <CardDescription className="mt-2">
                  {notice.date} at {notice.time} • {notice.location}
                </CardDescription>
              </div>
              <Badge variant={notice.status === 'filled' ? 'default' : 'secondary'}>
                {notice.status === 'filled' ? 'Filled' : 'Open'}
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-900">{success}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          {/* Pending Applications */}
          {pendingApplications.length > 0 && (
            <div>
              <h3 className="mb-3">Pending Applications ({pendingApplications.length})</h3>
              <div className="space-y-3">
                {pendingApplications.map(application => (
                  <Card key={application.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="mb-1">{application.studentName}</h4>
                            <p className="text-sm text-gray-500">
                              Applied {new Date(application.appliedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        {getStatusBadge(application.status)}
                      </div>

                      {application.message && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm">{application.message}</p>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button
                          onClick={() => openConfirmDialog(application, 'accept')}
                          className="flex-1"
                          disabled={loading || notice.status === 'filled'}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Select Babysitter
                        </Button>
                        <Button
                          onClick={() => openConfirmDialog(application, 'reject')}
                          variant="outline"
                          className="flex-1"
                          disabled={loading}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Accepted Applications */}
          {acceptedApplications.length > 0 && (
            <div>
              <h3 className="mb-3">Selected Babysitter</h3>
              <div className="space-y-3">
                {acceptedApplications.map(application => (
                  <Card key={application.id} className="border-green-200 bg-green-50">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                            <User className="h-6 w-6 text-green-600" />
                          </div>
                          <div>
                            <h4 className="mb-1">{application.studentName}</h4>
                            <p className="text-sm text-gray-500">
                              Accepted on {new Date(application.appliedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        {getStatusBadge(application.status)}
                      </div>

                      {application.message && (
                        <div className="mb-4 p-3 bg-white rounded-lg">
                          <p className="text-sm">{application.message}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Rejected Applications */}
          {rejectedApplications.length > 0 && (
            <div>
              <h3 className="mb-3">Rejected Applications ({rejectedApplications.length})</h3>
              <div className="space-y-3">
                {rejectedApplications.map(application => (
                  <Card key={application.id} className="opacity-60">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                            <User className="h-6 w-6 text-gray-400" />
                          </div>
                          <div>
                            <h4 className="mb-1">{application.studentName}</h4>
                            <p className="text-sm text-gray-500">
                              Applied {new Date(application.appliedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        {getStatusBadge(application.status)}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {applications.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="mb-2">No Applications Yet</h3>
                <p className="text-gray-600">
                  Students haven't applied to this notice yet. Check back later!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!selectedApplication && !!actionType} onOpenChange={() => {
        setSelectedApplication(null);
        setActionType(null);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === 'accept' ? 'Select Babysitter' : 'Reject Application'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === 'accept' ? (
                <>
                  Are you sure you want to select <strong>{selectedApplication?.studentName}</strong> as your babysitter?
                  This will automatically reject all other pending applications and mark this notice as filled.
                </>
              ) : (
                <>
                  Are you sure you want to reject the application from <strong>{selectedApplication?.studentName}</strong>?
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedApplication && actionType && handleStatusUpdate(selectedApplication.id, actionType)}
              className={actionType === 'reject' ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              {actionType === 'accept' ? 'Yes, Select This Babysitter' : 'Yes, Reject'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
