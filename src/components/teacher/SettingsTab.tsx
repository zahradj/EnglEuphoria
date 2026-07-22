
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Save, Bell, Globe, Clock, User, CreditCard } from "lucide-react";

interface SettingsTabProps {
  teacherName: string;
}

export const SettingsTab = ({ teacherName }: SettingsTabProps) => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Settings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback className="bg-teal-100 text-teal-700 text-xl">
                  {teacherName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <Button variant="outline" size="sm">
                <Camera className="h-4 w-4 mr-2" />
                Change Photo
              </Button>
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" defaultValue={teacherName} />
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue="teacher@example.com" />
              </div>
              
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" defaultValue="+1 (555) 123-4567" />
              </div>
              
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Input id="bio" placeholder="Tell students about yourself..." />
              </div>
            </div>

            <Button className="w-full">
              <Save className="h-4 w-4 mr-2" />
              Save Profile
            </Button>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="language">Interface Language</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="ar">العربية</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="timezone">Time Zone</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="utc">UTC</SelectItem>
                  <SelectItem value="est">Eastern Time</SelectItem>
                  <SelectItem value="pst">Pacific Time</SelectItem>
                  <SelectItem value="cet">Central European Time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Teaching Levels</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {["Beginner", "Intermediate", "Advanced"].map((level) => (
                  <div key={level} className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id={level.toLowerCase()} 
                      defaultChecked 
                      className="rounded"
                    />
                    <Label htmlFor={level.toLowerCase()}>{level}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>Preferred Subjects</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {["Grammar", "Conversation", "Vocabulary", "Writing", "Reading"].map((subject) => (
                  <div key={subject} className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id={subject.toLowerCase()} 
                      defaultChecked 
                      className="rounded"
                    />
                    <Label htmlFor={subject.toLowerCase()}>{subject}</Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-gray-600">Receive updates via email</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Class Reminders</p>
                <p className="text-sm text-gray-600">Get notified before classes</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Student Messages</p>
                <p className="text-sm text-gray-600">Notifications for new messages</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Homework Submissions</p>
                <p className="text-sm text-gray-600">Alert when homework is submitted</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Payment Updates</p>
                <p className="text-sm text-gray-600">Notifications about earnings</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Working Hours */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Working Hours
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Available Days</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                  <div key={day} className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id={day.toLowerCase()} 
                      defaultChecked={day !== "Sunday"} 
                      className="rounded"
                    />
                    <Label htmlFor={day.toLowerCase()}>{day}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start-time">Start Time</Label>
                <Input id="start-time" type="time" defaultValue="09:00" />
              </div>
              <div>
                <Label htmlFor="end-time">End Time</Label>
                <Input id="end-time" type="time" defaultValue="18:00" />
              </div>
            </div>

            <Button className="w-full">
              <Save className="h-4 w-4 mr-2" />
              Save Schedule
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Payment Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="payoneer-email">Payoneer Account Email</Label>
            <Input 
              id="payoneer-email" 
              type="email" 
              placeholder="Enter your Payoneer account email"
              className="mt-1"
            />
            <p className="text-sm text-muted-foreground mt-1">
              This email will be used to send your lesson payments via Payoneer
            </p>
          </div>

          <Button className="w-full">
            <Save className="h-4 w-4 mr-2" />
            Save Payment Info
          </Button>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="current-password">Current Password</Label>
              <Input id="current-password" type="password" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" />
              </div>
              <div>
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input id="confirm-password" type="password" />
              </div>
            </div>

            <Button variant="outline">
              Update Password
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
