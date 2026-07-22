
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLanguage } from "@/contexts/LanguageContext";
import { SendHorizontal, Paperclip } from "lucide-react";

interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: Date;
  isTeacher: boolean;
}

interface ClassroomChatProps {
  teacherName: string;
  studentName: string;
}

export function ClassroomChat({ teacherName, studentName }: ClassroomChatProps) {
  const { languageText } = useLanguage();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Welcome to your English lesson! How are you today?",
      sender: teacherName,
      timestamp: new Date(),
      isTeacher: true,
    },
  ]);

  const sendMessage = () => {
    if (!message.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: message,
      sender: studentName,
      timestamp: new Date(),
      isTeacher: false,
    };

    setMessages([...messages, newMessage]);
    setMessage("");

    // In a real app, this would send to an API and perhaps trigger a response
    setTimeout(() => {
      // Simulate teacher response
      if (messages.length < 2) {
        const teacherResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: "Great! Let's start with today's vocabulary.",
          sender: teacherName,
          timestamp: new Date(),
          isTeacher: true,
        };
        
        setMessages(prev => [...prev, teacherResponse]);
      }
    }, 3000);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Sort messages to display student messages at top and teacher at bottom
  const sortedMessages = [...messages].sort((a, b) => {
    // Student messages (isTeacher: false) will come first
    if (a.isTeacher && !b.isTeacher) return 1;
    if (!a.isTeacher && b.isTeacher) return -1;
    // Within the same type, sort by timestamp (older first)
    return a.timestamp.getTime() - b.timestamp.getTime();
  });

  return (
    <div className="flex flex-col h-full rounded-lg shadow-sm" style={{ 
      backgroundColor: '#FBFBFB', 
      border: '1px solid rgba(196, 217, 255, 0.4)'
    }}>
      <div className="p-3 border-b" style={{ 
        backgroundColor: 'rgba(232, 249, 255, 0.4)', 
        borderBottomColor: 'rgba(196, 217, 255, 0.4)'
      }}>
        <h3 className="font-medium" style={{ color: '#374151' }}>{languageText.chat}</h3>
        <div className="flex justify-between text-xs mt-1" style={{ color: '#6B7280' }}>
          <span className="font-medium" style={{ color: '#3B82F6' }}>{studentName} (Student)</span>
          <span className="font-medium" style={{ color: '#10B981' }}>{teacherName} (Teacher)</span>
        </div>
      </div>

      <ScrollArea className="flex-1 p-3">
        <div className="space-y-4 flex flex-col">
          {sortedMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.isTeacher ? "items-start" : "items-end"
              }`}
            >
              <div
                className={`px-3 py-2 rounded-lg max-w-[85%]`}
                style={msg.isTeacher
                  ? { backgroundColor: 'rgba(232, 249, 255, 0.6)', color: '#374151' }
                  : { backgroundColor: '#4F46E5', color: 'white' }
                }
              >
                <p className="text-sm">{msg.content}</p>
              </div>
              <div className="flex items-center mt-1 text-xs" style={{ color: '#6B7280' }}>
                <span style={{ color: msg.isTeacher ? '#10B981' : '#3B82F6' }}>
                  {msg.sender}
                </span>
                <span className="mx-1">•</span>
                <span>{formatTime(msg.timestamp)}</span>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div style={{ height: '1px', backgroundColor: 'rgba(196, 217, 255, 0.4)' }}></div>

      <div className="p-3 flex gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 transition-colors duration-200"
          title={languageText.attachment}
          style={{ color: '#6B7280' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E8F9FF'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <Paperclip size={18} />
        </Button>
        <Input
          placeholder={`${languageText.typeMessage}...`}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
          className="flex-1"
          style={{ 
            borderColor: 'rgba(196, 217, 255, 0.5)',
            backgroundColor: '#FBFBFB'
          }}
        />
        <Button
          onClick={sendMessage}
          size="icon"
          className="shrink-0"
          disabled={!message.trim()}
          style={{ 
            backgroundColor: message.trim() ? '#4F46E5' : 'rgba(196, 217, 255, 0.3)',
            color: 'white'
          }}
        >
          <SendHorizontal size={18} />
        </Button>
      </div>
    </div>
  );
}
