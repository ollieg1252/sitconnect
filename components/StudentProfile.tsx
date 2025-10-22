import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Checkbox } from "./ui/checkbox";
import { ArrowLeft, Edit, Star, Phone, Mail, MapPin } from "lucide-react";

interface StudentProfileProps {
  onNavigate: (screen: string) => void;
}

export function StudentProfile({ onNavigate }: StudentProfileProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Button 
              variant="ghost"
              onClick={() => onNavigate('student-dashboard')}
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
              <h1 className="text-2xl">John Smith</h1>
              <p className="text-gray-600 mb-2">Student Babysitter • Age 19</p>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-1" />
                  john.smith@school.edu
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-1" />
                  (555) 123-4567
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  University Area
                </div>
              </div>
              <div className="flex items-center mt-2">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="ml-2 text-sm text-gray-600">4.8 (12 reviews)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            <Card>
              <CardHeader>
                <CardTitle>About Me</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  I'm a responsible and caring 19-year-old student at the local university studying Early Childhood Education. 
                  I have over 2 years of experience babysitting children of all ages, from toddlers to pre-teens. I love 
                  engaging kids in creative activities and helping them with homework. I'm CPR certified and have flexible 
                  availability on weekends and evenings.
                </p>
              </CardContent>
            </Card>

            {/* Experience */}
            <Card>
              <CardHeader>
                <CardTitle>Experience & Qualifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium">Babysitting Experience</h4>
                  <p className="text-sm text-gray-600">2+ years of regular babysitting for 3 families</p>
                </div>
                <div>
                  <h4 className="font-medium">Education</h4>
                  <p className="text-sm text-gray-600">Currently studying Early Childhood Education at State University</p>
                </div>
                <div>
                  <h4 className="font-medium">Certifications</h4>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <Badge variant="outline">CPR Certified</Badge>
                    <Badge variant="outline">First Aid</Badge>
                    <Badge variant="outline">Background Check</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Reviews</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    parent: "Sarah M.",
                    rating: 5,
                    comment: "John was amazing with our 6-year-old! Very responsible and the kids loved his creative activities.",
                    date: "Oct 20, 2023"
                  },
                  {
                    parent: "Mike T.",
                    rating: 5,
                    comment: "Punctual, professional, and great with homework help. Highly recommend!",
                    date: "Oct 15, 2023"
                  }
                ].map((review, index) => (
                  <div key={index} className="border-b pb-4 last:border-b-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{review.parent}</span>
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            className={`h-3 w-3 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mb-1">{review.comment}</p>
                    <p className="text-xs text-gray-500">{review.date}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Availability */}
            <Card>
              <CardHeader>
                <CardTitle>Availability</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Monday - Friday</span>
                    <span className="text-gray-600">After 5 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday</span>
                    <span className="text-gray-600">All Day</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday</span>
                    <span className="text-gray-600">All Day</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Interests & Skills */}
            <Card>
              <CardHeader>
                <CardTitle>Interests & Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Arts & Crafts',
                    'Sports',
                    'Reading',
                    'Homework Help',
                    'Cooking',
                    'Music',
                    'Outdoor Activities',
                    'Board Games'
                  ].map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Preferences */}
            <Card>
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Age Groups</span>
                  <span className="text-gray-600">2-12 years</span>
                </div>
                <div className="flex justify-between">
                  <span>Max Children</span>
                  <span className="text-gray-600">3</span>
                </div>
                <div className="flex justify-between">
                  <span>Rate</span>
                  <span className="text-gray-600">$12-18/hour</span>
                </div>
                <div className="flex justify-between">
                  <span>Transportation</span>
                  <span className="text-gray-600">Available</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}