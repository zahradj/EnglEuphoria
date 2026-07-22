
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, Paperclip, Search, Plus } from "lucide-react";

export const MessagesTab = () => {
  const [selectedChat, setSelectedChat] = useState(1);
  const [messageText, setMessageText] = useState("");

  const conversations = [
    {
      id: 1,
      student: "Alex Johnson",
      lastMessage: "Thank you for the feedback on my homework!",
      timestamp: "2 min ago",
      unread: 2,
      avatar: "AJ"
    },
    {
      id: 2,
      student: "Maria Garcia",
      lastMessage: "Could you explain the past tense rule again?",
      timestamp: "1 hour ago", 
      unread: 1,
      avatar: "MG"
    },
    {
      id: 3,
      student: "Emma Johnson",
      lastMessage: "See you in tomorrow's class!",
      timestamp: "Yesterday",
      unread: 0,
      avatar: "EJ"
    },
    {
      id: 4,
      student: "Li Wei",
      lastMessage: "The reading assignment was very helpful.",
      timestamp: "2 days ago",
      unread: 0,
      avatar: "LW"
    }
  ];

  const messages = [
    {
      id: 1,
      sender: "student",
      text: "Hi! I have a question about today's homework.",
      timestamp: "10:30 AM"
    },
    {
      id: 2,
      sender: "teacher",
      text: "Of course! What specific part would you like help with?",
      timestamp: "10:32 AM"
    },
    {
      id: 3,
      sender: "student", 
      text: "I'm confused about when to use 'have been' vs 'has been'.",
      timestamp: "10:35 AM"
    },
    {
      id: 4,
      sender: "teacher",
      text: "Great question! 'Have been' is used with I, you, we, they. 'Has been' is used with he, she, it. Would you like me to send you some practice exercises?",
      timestamp: "10:38 AM"
    },
    {
      id: 5,
      sender: "student",
      text: "Thank you for the feedback on my homework!",
      timestamp: "10:45 AM"
    }
  ];

  const handleSendMessage = () => {
    if (messageText.trim()) {
      setMessageText("");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Messages</h1>
        <Button className="bg-teal-500 hover:bg-teal-600">
          <Plus className="h-4 w-4 mr-2" />
          New Message
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Conversations List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Conversations</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input 
                placeholder="Search students..." 
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`p-4 cursor-pointer hover:bg-gray-50 border-b ${
                    selectedChat === conversation.id ? 'bg-teal-50 border-l-4 border-l-teal-500' : ''
                  }`}
                  onClick={() => setSelectedChat(conversation.id)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback className="bg-teal-100 text-teal-700">
                        {conversation.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-sm text-gray-800 truncate">
                          {conversation.student}
                        </h3>
                        {conversation.unread > 0 && (
                          <Badge className="bg-red-500 text-white text-xs h-5 w-5 rounded-full flex items-center justify-center">
                            {conversation.unread}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 truncate">{conversation.lastMessage}</p>
                      <p className="text-xs text-gray-400">{conversation.timestamp}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="lg:col-span-2">
          <CardHeader className="border-b">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback className="bg-teal-100 text-teal-700">
                  AJ
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">Alex Johnson</CardTitle>
                <p className="text-sm text-gray-600">Beginner Level</p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="flex flex-col h-[450px]">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 p-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'teacher' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.sender === 'teacher'
                        ? 'bg-teal-500 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p className={`text-xs mt-1 ${
                      message.sender === 'teacher' ? 'text-teal-100' : 'text-gray-500'
                    }`}>
                      {message.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="border-t pt-4">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Input
                    placeholder="Type your message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  className="bg-teal-500 hover:bg-teal-600"
                  onClick={handleSendMessage}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
