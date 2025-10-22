import { useState } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Baby, Info, Users } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";
import { authAPI } from '../utils/supabase/client';

interface User {
  id: string;
  email: string;
  name: string;
  userType: 'parent' | 'student';
}

interface LoginScreenProps {
  onNavigate: (screen: string) => void;
  onLogin: (user: User) => void;
  onDemoMode?: (userType: 'student' | 'parent') => void;
}

export function LoginScreen({ onNavigate, onLogin, onDemoMode }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Sign in with Supabase
      const authData = await authAPI.signIn(email, password);
      console.log('Auth successful, getting profile...');
      
      // Get user profile
      const profileData = await authAPI.getProfile();
      console.log('Profile retrieved:', profileData);
      
      onLogin(profileData.profile);
    } catch (err: any) {
      console.error('Login error:', err);
      console.error('Error details:', err.message);
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center mb-4">
            <Baby className="h-8 w-8 text-blue-600 mr-2" />
            <h1 className="text-2xl">BabySitter Connect</h1>
          </div>
          <p className="text-gray-600">Connect families with trusted student babysitters</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {!error && (
                <Alert className="bg-blue-50 border-blue-200">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-900">
                    First time here? You'll need to{' '}
                    <button
                      type="button"
                      onClick={() => onNavigate('signup')}
                      className="underline hover:no-underline font-medium"
                    >
                      create an account
                    </button>
                    {' '}before signing in.
                  </AlertDescription>
                </Alert>
              )}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {error}
                    {error.includes('Invalid login credentials') && (
                      <div className="mt-2">
                        Don't have an account?{' '}
                        <button
                          type="button"
                          onClick={() => onNavigate('signup')}
                          className="underline hover:no-underline"
                        >
                          Create one here
                        </button>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-3">
              <Button 
                type="submit"
                className="w-full h-12"
                disabled={loading}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
              <Button 
                type="button"
                variant="link" 
                className="text-sm"
                onClick={() => onNavigate('signup')}
                disabled={loading}
              >
                Don't have an account? Sign up
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Demo Mode */}
        {onDemoMode && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-base">Preview Mode</CardTitle>
              <CardDescription className="text-blue-900">
                Explore the app without creating an account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline"
                className="w-full bg-white hover:bg-gray-50"
                onClick={() => onDemoMode('student')}
              >
                <Users className="h-4 w-4 mr-2" />
                Preview as Student
              </Button>
              <Button 
                variant="outline"
                className="w-full bg-white hover:bg-gray-50"
                onClick={() => onDemoMode('parent')}
              >
                <Baby className="h-4 w-4 mr-2" />
                Preview as Parent
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}