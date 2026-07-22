
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Send, 
  Smile, 
  Paperclip,
  Image as ImageIcon,
  Mic
} from "lucide-react";

export function OneOnOneChat() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "teacher",
      name: "Ms. Johnson",
      content: "Hello Emma! Ready for today's lesson?",
      timestamp: "2:30 PM",
      type: "text"
    },
    {
      id: 2,
      sender: "student",
      name: "Emma",
      content: "Yes! I'm excited to learn new words today 😊",
      timestamp: "2:31 PM",
      type: "text"
    },
    {
      id: 3,
      sender: "teacher",
      name: "Ms. Johnson",
      content: "Great! Let's start with some vocabulary about animals. Can you tell me your favorite animal?",
      timestamp: "2:32 PM",
      type: "text"
    },
    {
      id: 4,
      sender: "student",
      name: "Emma",
      content: "I love cats! They are so cute and fluffy 🐱",
      timestamp: "2:33 PM",
      type: "text"
    }
  ]);

  const sendMessage = () => {
    if (!message.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      sender: "student",
      name: "Emma",
      content: message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: "text"
    };

    setMessages([...messages, newMessage]);
    setMessage("");

    // Simulate teacher response
    setTimeout(() => {
      const teacherResponse = {
        id: messages.length + 2,
        sender: "teacher",
        name: "Ms. Johnson",
        content: "That's wonderful! Cats are indeed very cute animals.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: "text"
      };
      setMessages(prev => [...prev, teacherResponse]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Chat Messages */}
      <ScrollArea className="flex-1 pr-3">
        <div className="space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'student' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  msg.sender === 'student'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <div className="text-xs opacity-70 mb-1">{msg.name}</div>
                <div className="text-sm">{msg.content}</div>
                <div className="text-xs opacity-70 mt-1">{msg.timestamp}</div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Quick Emoji Bar */}
      <div className="py-2 border-t border-gray-100">
        <div className="flex gap-1 text-lg">
          {["😊", "👍", "❤️", "😂", "🎉", "👏"].map((emoji) => (
            <button
              key={emoji}
              className="p-1 hover:bg-gray-100 rounded"
              onClick={() => setMessage(message + emoji)}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Message Input */}
      <div className="flex gap-2 pt-2">
        <div className="flex-1 relative">
          <Input
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pr-10"
          />
          <Button
            size="sm"
            variant="ghost"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
          >
            <Smile size={14} />
          </Button>
        </div>
        
        <Button size="sm" variant="outline">
          <Paperclip size={14} />
        </Button>
        
        <Button size="sm" variant="outline">
          <ImageIcon size={14} />
        </Button>
        
        <Button size="sm" variant="outline">
          <Mic size={14} />
        </Button>
        
        <Button size="sm" onClick={sendMessage} disabled={!message.trim()}>
          <Send size={14} />
        </Button>
      </div>

      {/* Notes Section */}
      <div className="mt-4 pt-3 border-t border-gray-100">
        <h5 className="text-xs font-medium text-gray-600 mb-2">Teacher Notes</h5>
        <div className="text-xs text-gray-500 space-y-1">
          <div>• Excellent pronunciation of "cat"</div>
          <div>• Practice: "animals" vocabulary</div>
          <div>• Homework: Write about pets</div>
        </div>
      </div>
    </div>
  );
}
