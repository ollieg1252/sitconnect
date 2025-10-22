import { useState, useEffect } from 'react';
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Alert, AlertDescription } from "./ui/alert";
import { Bell, Calendar, Clock, MapPin, User, Users, LogOut, RefreshCw } from "lucide-react";
import { noticesAPI, applicationsAPI } from '../utils/supabase/client';
import { getNoticesForDemo, getApplicationsForStudent } from '../utils/demoData';

interface User {
  id: string;
  email: string;
  name: string;
  userType: 'parent' | 'student';
}

interface StudentDashboardProps {
  onNavigate: (screen: string) => void;
  onSelectNotice: (notice: any) => void;
  user: User | null;
  onLogout: () => void;
  demoMode?: boolean;
}

export function StudentDashboard({ onNavigate, onSelectNotice, user, onLogout, demoMode }: StudentDashboardProps) {
  const [notices, setNotices] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      setError('');
      
      if (demoMode) {
        // Use demo data
        setNotices(getNoticesForDemo('student'));
        setApplications(getApplicationsForStudent());
      } else {
        // Use real API
        const [noticesResponse, applicationsResponse] = await Promise.all([
          noticesAPI.getNotices(),
          applicationsAPI.getMyApplications()
        ]);

        setNotices(noticesResponse.notices || []);
        setApplications(applicationsResponse.applications || []);
      }
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError(err.message || 'Failed to load data');
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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'accepted':
        return 'default';
      case 'rejected':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
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
              <h1 className="text-xl">Student Dashboard</h1>
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
                onClick={() => onNavigate('student-profile')}
              >
                <User className="h-4 w-4 mr-2" />
                Profile
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
              <h2 className="text-lg">Welcome back, {user?.name || 'Student'}!</h2>
              <p className="text-gray-600">Ready to find your next babysitting opportunity?</p>
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
              Available Notices ({notices.length})
            </TabsTrigger>
            <TabsTrigger value="applications">
              My Applications ({applications.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="notices">
            <div className="grid gap-4">
              {notices.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-gray-600">No notices available at the moment.</p>
                    <p className="text-sm text-gray-500 mt-2">Check back later for new opportunities!</p>
                  </CardContent>
                </Card>
              ) : (
                notices.map((notice) => (
                  <Card key={notice.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{notice.title}</CardTitle>
                          <CardDescription className="flex items-center mt-1">
                            <Users className="h-4 w-4 mr-1" />
                            {notice.parentName} • Ages {notice.ageGroup}
                          </CardDescription>
                        </div>
                        <Badge variant="secondary">${notice.payRate}/hour</Badge>
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
                          <MapPin className="h-4 w-4 mr-1" />
                          {notice.location}
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="h-4 w-4 mr-1" />
                          {notice.applications?.length || 0} applications
                        </div>
                        
                        <Button 
                          onClick={() => {
                            onSelectNotice(notice);
                            onNavigate('notice-detail');
                          }}
                        >
                          View Details & Apply
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="applications">
            <div className="grid gap-4">
              {applications.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-gray-600">You haven't applied to any notices yet.</p>
                    <p className="text-sm text-gray-500 mt-2">Browse available notices to get started!</p>
                  </CardContent>
                </Card>
              ) : (
                applications.map((app) => (
                  <Card key={app.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="font-medium">{app.notice.title}</h3>
                          <p className="text-sm text-gray-600">{app.notice.parentName}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                            <span>Applied on {new Date(app.appliedAt).toLocaleDateString()}</span>
                            <span>{new Date(app.notice.date).toLocaleDateString()} at {app.notice.time}</span>
                            <span>{app.notice.location}</span>
                          </div>
                        </div>
                        <Badge variant={getStatusColor(app.status)}>
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </Badge>
                      </div>
                      
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">${app.notice.payRate}/hour</span>
                        {app.status === 'accepted' && (
                          <span className="text-green-600 font-medium">Congratulations! 🎉</span>
                        )}
                      </div>
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