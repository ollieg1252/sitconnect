import { useState, useEffect } from 'react';
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Alert, AlertDescription } from "./ui/alert";
import { Bell, Calendar, Clock, Plus, User, Users, Eye, LogOut, RefreshCw, Check, X } from "lucide-react";
import { noticesAPI } from '../utils/supabase/client';
import { getNoticesForDemo } from '../utils/demoData';

interface User {
  id: string;
  email: string;
  name: string;
  userType: 'parent' | 'student';
}

interface ParentDashboardProps {
  onNavigate: (screen: string) => void;
  onSelectNotice: (notice: any) => void;
  user: User | null;
  onLogout: () => void;
  demoMode?: boolean;
}

export function ParentDashboard({ onNavigate, onSelectNotice, user, onLogout, demoMode }: ParentDashboardProps) {
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [updatingApplication, setUpdatingApplication] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setError('');
      
      if (demoMode) {
        // Use demo data
        setNotices(getNoticesForDemo('parent'));
      } else {
        // Use real API
        const response = await noticesAPI.getMyNotices();
        setNotices(response.notices || []);
      }
    } catch (err: any) {
      console.error('Error loading notices:', err);
      setError(err.message || 'Failed to load notices');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [demoMode]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
  };

  const handleApplicationStatusUpdate = async (noticeId: string, applicationId: string, status: 'accepted' | 'rejected') => {
    try {
      setUpdatingApplication(applicationId);
      await noticesAPI.updateApplicationStatus(noticeId, applicationId, status);
      
      // Refresh the data to show updated status
      await loadData();
    } catch (err: any) {
      console.error('Error updating application:', err);
      setError(err.message || 'Failed to update application');
    } finally {
      setUpdatingApplication(null);
    }
  };

  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return 'default';
      case 'filled':
        return 'secondary';
      case 'closed':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getAllApplications = () => {
    const allApplications: any[] = [];
    notices.forEach(notice => {
      if (notice.applications && notice.applications.length > 0) {
        notice.applications.forEach((app: any) => {
          allApplications.push({
            ...app,
            noticeTitle: notice.title,
            noticeId: notice.id
          });
        });
      }
    });
    return allApplications.sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());
  };

  const getPendingApplicationsCount = () => {
    return getAllApplications().filter(app => app.status === 'pending').length;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <h1 className="text-xl">Parent Dashboard</h1>
              {demoMode && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  Demo Mode
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-4">
              {!demoMode && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleRefresh}
                  disabled={refreshing}
                >
                  <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                </Button>
              )}
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onNavigate('parent-profile')}
              >
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>
              <Button 
                size="sm"
                onClick={() => !demoMode && onNavigate('create-notice')}
                disabled={demoMode}
                title={demoMode ? 'Not available in demo mode' : ''}
              >
                <Plus className="h-4 w-4 mr-2" />
                Post Notice
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={onLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Welcome Card */}
        <Card className="mb-6">
          <CardContent className="flex items-center space-x-4 pt-6">
            <Avatar className="h-16 w-16">
              <AvatarFallback>{user ? getUserInitials(user.name) : 'U'}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg">Welcome back, {user?.name || 'Parent'}!</h2>
              <p className="text-gray-600">Manage your babysitting requests and find the perfect sitter.</p>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="notices" className="space-y-6">
          <TabsList>
            <TabsTrigger value="notices">
              My Notices ({notices.length})
            </TabsTrigger>
            <TabsTrigger value="applications">
              Applications ({getPendingApplicationsCount()})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="notices">
            <div className="grid gap-4">
              {notices.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-gray-600">You haven't posted any notices yet.</p>
                    <p className="text-sm text-gray-500 mt-2">Click "Post Notice" to get started!</p>
                  </CardContent>
                </Card>
              ) : (
                notices.map((notice) => (
                  <Card key={notice.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{notice.title}</CardTitle>
                          <CardDescription className="flex items-center mt-1">
                            <Users className="h-4 w-4 mr-1" />
                            Ages {notice.ageGroup}
                          </CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary">${notice.payRate}/hour</Badge>
                          <Badge variant={getStatusColor(notice.status)}>
                            {notice.status.charAt(0).toUpperCase() + notice.status.slice(1)}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-gray-700">{notice.description}</p>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(notice.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {notice.time} ({notice.duration})
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {notice.applications?.length || 0} applications
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            onSelectNotice(notice);
                            onNavigate('notice-detail');
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        {notice.applications && notice.applications.length > 0 && (
                          <Button 
                            size="sm"
                            onClick={() => {
                              onSelectNotice(notice);
                              onNavigate('review-applications');
                            }}
                          >
                            <Users className="h-4 w-4 mr-2" />
                            Review Applications ({notice.applications.length})
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="applications">
            <div className="grid gap-4">
              {getAllApplications().length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-gray-600">No applications received yet.</p>
                    <p className="text-sm text-gray-500 mt-2">Post a notice to start receiving applications!</p>
                  </CardContent>
                </Card>
              ) : (
                getAllApplications().map((app) => (
                  <Card key={`${app.noticeId}-${app.id}`}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base">{app.studentName}</CardTitle>
                          <CardDescription>Applied for: {app.noticeTitle}</CardDescription>
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
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {app.message && (
                        <div>
                          <span className="text-sm font-medium text-gray-700">Message:</span>
                          <p className="text-sm text-gray-600 mt-1">{app.message}</p>
                        </div>
                      )}
                      
                      <div className="text-xs text-gray-500">
                        Applied on {new Date(app.appliedAt).toLocaleDateString()}
                      </div>
                      
                      {app.status === 'pending' && (
                        <div className="flex space-x-2">
                          <Button 
                            size="sm"
                            onClick={() => handleApplicationStatusUpdate(app.noticeId, app.id, 'accepted')}
                            disabled={updatingApplication === app.id}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            {updatingApplication === app.id ? 'Accepting...' : 'Accept'}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleApplicationStatusUpdate(app.noticeId, app.id, 'rejected')}
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
                            <strong>Congratulations!</strong> You've selected {app.studentName} as your babysitter. 
                            Please contact them to coordinate the details.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}