import { useState } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Textarea } from "./ui/textarea";
import { Checkbox } from "./ui/checkbox";
import { Alert, AlertDescription } from "./ui/alert";
import { ArrowLeft, Users, Baby, Plus, X } from "lucide-react";
import { authAPI } from '../utils/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface User {
  id: string;
  email: string;
  name: string;
  userType: 'parent' | 'student';
}

interface SignupScreenProps {
  onNavigate: (screen: string) => void;
  onSignup: (user: User) => void;
}

interface Child {
  id: string;
  name: string;
  age: string;
  gender: string;
}

export function SignupScreen({ onNavigate, onSignup }: SignupScreenProps) {
  const [activeTab, setActiveTab] = useState<'student' | 'parent'>('student');
  const [parentStep, setParentStep] = useState(1); // Step 1: Account info, Step 2: Children
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    age: '',
    school: '',
    bio: '',
    interests: [] as string[],
  });

  // Children data for parents
  const [children, setChildren] = useState<Child[]>([]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const addChild = () => {
    setChildren(prev => [...prev, {
      id: crypto.randomUUID(),
      name: '',
      age: '',
      gender: ''
    }]);
  };

  const removeChild = (id: string) => {
    setChildren(prev => prev.filter(child => child.id !== id));
  };

  const updateChild = (id: string, field: string, value: string) => {
    setChildren(prev => prev.map(child =>
      child.id === id ? { ...child, [field]: value } : child
    ));
  };

  const validateBasicForm = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    return true;
  };

  const validateChildrenForm = () => {
    if (children.length === 0) {
      setError('Please add at least one child');
      return false;
    }

    for (const child of children) {
      if (!child.name || !child.age || !child.gender) {
        setError('Please fill in all child information (name, age, and gender)');
        return false;
      }
    }

    return true;
  };

  const handleNextStep = () => {
    setError('');
    
    if (activeTab === 'parent' && parentStep === 1) {
      if (validateBasicForm()) {
        setParentStep(2);
      }
    }
  };

  const handlePreviousStep = () => {
    setError('');
    setParentStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (activeTab === 'student') {
      if (!validateBasicForm()) {
        return;
      }
    } else {
      // Parent flow - validate children
      if (!validateChildrenForm()) {
        return;
      }
    }

    setLoading(true);
    setError('');

    try {
      // Create account with basic info
      const name = `${formData.firstName} ${formData.lastName}`;
      console.log('Creating account for:', name, activeTab);
      const userData = await authAPI.signUp(formData.email, formData.password, name, activeTab);
      console.log('Account created successfully');
      
      // Sign in the user
      const authData = await authAPI.signIn(formData.email, formData.password);
      console.log('Signed in successfully');
      
      // Update profile with additional info
      const profileUpdates: any = {
        phone: formData.phone,
      };

      if (activeTab === 'student') {
        profileUpdates.age = formData.age ? parseInt(formData.age) : null;
        profileUpdates.school = formData.school;
        profileUpdates.bio = formData.bio;
        profileUpdates.interests = formData.interests;
      } else {
        // Add children to parent profile
        profileUpdates.children = children;
      }

      await authAPI.updateProfile(profileUpdates);
      console.log('Profile updated successfully');

      // Get updated profile
      const profileData = await authAPI.getProfile();
      console.log('Final profile:', profileData);
      
      onSignup(profileData.profile);
    } catch (err: any) {
      console.error('Signup error:', err);
      console.error('Error message:', err.message);
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Button 
          variant="ghost" 
          className="mb-4"
          onClick={() => {
            if (activeTab === 'parent' && parentStep === 2) {
              handlePreviousStep();
            } else {
              onNavigate('login');
            }
          }}
          disabled={loading}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {activeTab === 'parent' && parentStep === 2 ? 'Back' : 'Back to Login'}
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Create Account</CardTitle>
            <CardDescription>
              {activeTab === 'parent' && parentStep === 2 
                ? 'Tell us about your children'
                : 'Join our babysitting community'
              }
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Show tabs only on step 1 or for students */}
              {(activeTab === 'student' || parentStep === 1) && (
                <Tabs value={activeTab} onValueChange={(value: string) => {
                  setActiveTab(value as 'student' | 'parent');
                  setParentStep(1);
                  setError('');
                }}>
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="student" className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      Student Babysitter
                    </TabsTrigger>
                    <TabsTrigger value="parent" className="flex items-center">
                      <Baby className="h-4 w-4 mr-2" />
                      Parent
                    </TabsTrigger>
                  </TabsList>

                  {/* Basic Account Information - shown for both */}
                  <div className="space-y-4 mb-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input 
                          id="firstName" 
                          placeholder="John"
                          value={formData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          disabled={loading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input 
                          id="lastName" 
                          placeholder="Doe"
                          value={formData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          disabled={loading}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="john.doe@school.edu"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        disabled={loading}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="password">Password *</Label>
                        <Input 
                          id="password" 
                          type="password" 
                          placeholder="At least 6 characters"
                          value={formData.password}
                          onChange={(e) => handleInputChange('password', e.target.value)}
                          disabled={loading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password *</Label>
                        <Input 
                          id="confirmPassword" 
                          type="password" 
                          placeholder="Repeat password"
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                          disabled={loading}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number (Optional)</Label>
                      <Input 
                        id="phone" 
                        type="tel" 
                        placeholder="(555) 123-4567"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Student-specific fields */}
                  <TabsContent value="student" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="age">Age</Label>
                      <Input 
                        id="age" 
                        type="number" 
                        placeholder="18"
                        value={formData.age}
                        onChange={(e) => handleInputChange('age', e.target.value)}
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="school">School/University</Label>
                      <Input 
                        id="school" 
                        placeholder="University Name"
                        value={formData.school}
                        onChange={(e) => handleInputChange('school', e.target.value)}
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bio">Brief Bio</Label>
                      <Textarea 
                        id="bio" 
                        placeholder="Tell parents about yourself, your experience with children, etc."
                        value={formData.bio}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-3">
                      <Label>Interests & Skills</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {['Arts & Crafts', 'Sports', 'Music', 'Reading', 'Cooking', 'Homework Help'].map((interest) => (
                          <div key={interest} className="flex items-center space-x-2">
                            <Checkbox 
                              id={interest}
                              checked={formData.interests.includes(interest)}
                              onCheckedChange={() => handleInterestToggle(interest)}
                              disabled={loading}
                            />
                            <Label htmlFor={interest} className="text-sm">{interest}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  {/* Parent Step 1 - just shows account info above */}
                  <TabsContent value="parent" className="space-y-4">
                    <p className="text-sm text-gray-600">
                      After creating your account, you'll be able to add information about your children.
                    </p>
                  </TabsContent>
                </Tabs>
              )}

              {/* Parent Step 2: Add Children */}
              {activeTab === 'parent' && parentStep === 2 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3>Your Children</h3>
                      <p className="text-sm text-gray-600">Add information about each child</p>
                    </div>
                    <Button
                      type="button"
                      onClick={addChild}
                      variant="outline"
                      size="sm"
                      disabled={loading}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Child
                    </Button>
                  </div>

                  {children.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                      <Baby className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">Click "Add Child" to get started</p>
                    </div>
                  )}

                  <div className="space-y-4">
                    {children.map((child, index) => (
                      <Card key={child.id}>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between mb-4">
                            <h4>Child {index + 1}</h4>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeChild(child.id)}
                              disabled={loading}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor={`child-name-${child.id}`}>Name *</Label>
                              <Input
                                id={`child-name-${child.id}`}
                                placeholder="Child's name"
                                value={child.name}
                                onChange={(e) => updateChild(child.id, 'name', e.target.value)}
                                disabled={loading}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor={`child-age-${child.id}`}>Age *</Label>
                                <Input
                                  id={`child-age-${child.id}`}
                                  type="number"
                                  placeholder="Age"
                                  value={child.age}
                                  onChange={(e) => updateChild(child.id, 'age', e.target.value)}
                                  disabled={loading}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`child-gender-${child.id}`}>Gender *</Label>
                                <Select
                                  value={child.gender}
                                  onValueChange={(value) => updateChild(child.id, 'gender', value)}
                                  disabled={loading}
                                >
                                  <SelectTrigger id={`child-gender-${child.id}`}>
                                    <SelectValue placeholder="Select" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="boy">Boy</SelectItem>
                                    <SelectItem value="girl">Girl</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              {activeTab === 'student' || parentStep === 2 ? (
                <Button 
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? 'Creating Account...' : `Create ${activeTab === 'student' ? 'Student' : 'Parent'} Account`}
                </Button>
              ) : (
                <Button 
                  type="button"
                  className="w-full"
                  onClick={handleNextStep}
                  disabled={loading}
                >
                  Next: Add Children
                </Button>
              )}
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
