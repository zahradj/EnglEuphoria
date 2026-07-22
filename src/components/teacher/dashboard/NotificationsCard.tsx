
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, FileText, Calendar } from "lucide-react";

interface Notification {
  type: "message" | "homework" | "schedule";
  text: string;
  time: string;
}

interface NotificationsCardProps {
  notifications: Notification[];
}

export const NotificationsCard = ({ notifications }: NotificationsCardProps) => {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-blue-500" />
          Recent Notifications
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {notifications.map((notification, index) => (
            <div key={index} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
              <div className={`p-2 rounded-full ${
                notification.type === 'message' ? 'bg-blue-100' :
                notification.type === 'homework' ? 'bg-green-100' : 'bg-orange-100'
              }`}>
                {notification.type === 'message' ? <MessageCircle className="h-4 w-4 text-blue-500" /> :
                 notification.type === 'homework' ? <FileText className="h-4 w-4 text-green-500" /> :
                 <Calendar className="h-4 w-4 text-orange-500" />}
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-800">{notification.text}</p>
                <p className="text-xs text-gray-500">{notification.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
