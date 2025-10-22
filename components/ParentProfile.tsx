import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { ArrowLeft, Edit, Phone, Mail, MapPin, Users, Calendar } from "lucide-react";

interface ParentProfileProps {
  onNavigate: (screen: string) => void;
}

export function ParentProfile({ onNavigate }: ParentProfileProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Button 
              variant="ghost"
              onClick={() => onNavigate('parent-dashboard')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="flex items-center space-x-6 pt-6">
            <Avatar className="h-24 w-24">
              <AvatarFallback className="text-lg">JS</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-2xl">Jane Smith</h1>
              <p className="text-gray-600 mb-2">Parent • Member since Oct 2023</p>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-1" />
                  jane.smith@email.com
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-1" />
                  (555) 987-6543
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  Downtown Area
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Family Info */}
            <Card>
              <CardHeader>
                <CardTitle>Family Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">About Our Family</h4>
                  <p className="text-gray-700 leading-relaxed">
                    We're a friendly family of four living in a quiet neighborhood downtown. Both parents work 
                    full-time and occasionally need reliable babysitting for date nights and work events. Our children 
                    are well-behaved and love engaging activities. We provide all necessary supplies and clear instructions 
                    for our sitters.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Children</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">Emma</p>
                        <p className="text-sm text-gray-600">Age 7 • 2nd Grade</p>
                        <p className="text-xs text-gray-500">Loves reading and arts & crafts</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">Lucas</p>
                        <p className="text-sm text-gray-600">Age 4 • Preschool</p>
                        <p className="text-xs text-gray-500">Energetic, loves building blocks and outdoor play</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">House Rules & Guidelines</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Bedtime: Emma 8:30 PM, Lucas 7:30 PM</li>
                    <li>• Screen time limited to 1 hour on weekends</li>
                    <li>• Snacks provided in labeled containers</li>
                    <li>• Emergency contacts posted on refrigerator</li>
                    <li>• Please text updates every 2 hours</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Babysitting History */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Babysitting Sessions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    sitter: "Emma Davis",
                    date: "Oct 21, 2023",
                    duration: "4 hours",
                    rating: 5,
                    note: "Excellent care, kids had a great time!"
                  },
                  {
                    sitter: "Mike Chen",
                    date: "Oct 14, 2023", 
                    duration: "3 hours",
                    rating: 5,
                    note: "Very responsible, would hire again."
                  },
                  {
                    sitter: "Sarah Johnson",
                    date: "Oct 7, 2023",
                    duration: "5 hours",
                    rating: 4,
                    note: "Good experience, kids enjoyed activities."
                  }
                ].map((session, index) => (
                  <div key={index} className="border-b pb-4 last:border-b-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{session.sitter}</span>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{session.duration}</Badge>
                        <span className="text-sm text-gray-600">★ {session.rating}/5</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mb-1">{session.note}</p>
                    <p className="text-xs text-gray-500">{session.date}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="text-sm">Notices Posted</span>
                  </div>
                  <span className="font-medium">8</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="text-sm">Sitters Hired</span>
                  </div>
                  <span className="font-medium">5</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="w-4 h-4 mr-2 text-center text-xs">★</span>
                    <span className="text-sm">Average Rating</span>
                  </div>
                  <span className="font-medium">4.8/5</span>
                </div>
              </CardContent>
            </Card>

            {/* Preferences */}
            <Card>
              <CardHeader>
                <CardTitle>Sitter Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Min Age</span>
                  <span className="text-gray-600">18 years</span>
                </div>
                <div className="flex justify-between">
                  <span>Experience</span>
                  <span className="text-gray-600">1+ years</span>
                </div>
                <div className="flex justify-between">
                  <span>Rate Range</span>
                  <span className="text-gray-600">$12-20/hour</span>
                </div>
                <div className="flex justify-between">
                  <span>Transportation</span>
                  <span className="text-gray-600">Not required</span>
                </div>
              </CardContent>
            </Card>

            {/* Contact Preferences */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Text Updates</span>
                  <Badge variant="secondary">Every 2 hours</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Preferred Contact</span>
                  <Badge variant="secondary">Text Message</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Emergency Contact</span>
                  <Badge variant="secondary">Available 24/7</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Verification */}
            <Card>
              <CardHeader>
                <CardTitle>Account Verification</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Email Verified</span>
                    <Badge variant="default">✓</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Phone Verified</span>
                    <Badge variant="default">✓</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Background Check</span>
                    <Badge variant="default">✓</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}