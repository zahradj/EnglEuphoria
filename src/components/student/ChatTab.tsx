
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Send, Paperclip } from "lucide-react";

export const ChatTab = () => {
  const messages = [
    {
      id: 1,
      sender: "teacher",
      name: "Ms. Sarah",
      message: "Great work on your homework! Your essay showed good understanding of past tense.",
      time: "2:30 PM",
      avatar: "/placeholder.svg"
    },
    {
      id: 2,
      sender: "student", 
      name: "You",
      message: "Thank you! I had some difficulty with irregular verbs though.",
      time: "2:35 PM"
    }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Chat with Teacher</h1>
      
      <Card className="h-[600px] flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-blue-500" />
            Ms. Sarah Johnson
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 space-y-4 overflow-y-auto mb-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex gap-3 ${message.sender === 'student' ? 'flex-row-reverse' : ''}`}>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={message.avatar} />
                  <AvatarFallback>
                    {message.sender === 'teacher' ? 'T' : 'S'}
                  </AvatarFallback>
                </Avatar>
                <div className={`max-w-xs ${message.sender === 'student' ? 'text-right' : ''}`}>
                  <div className={`p-3 rounded-lg ${
                    message.sender === 'student' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    <p>{message.message}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{message.time}</p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Message Input */}
          <div className="flex gap-2">
            <Input placeholder="Type your message..." className="flex-1" />
            <Button variant="outline" size="sm">
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button size="sm" className="bg-blue-500 hover:bg-blue-600">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
