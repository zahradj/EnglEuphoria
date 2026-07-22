
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRealTimeChat } from '@/hooks/useRealTimeChat';
import { ChatMessage } from '@/services/chatService';
import { whiteboardService, ChatBroadcastPayload } from '@/services/whiteboardService';
import { Send, Paperclip, Download, AlertCircle, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { LoadingSpinner, ErrorState } from '@/components/ui/loading-states';

interface RealTimeChatPanelProps {
  roomId: string;
  currentUser: {
    id: string;
    name: string;
    role: 'teacher' | 'student';
  };
}

function MessageBubble({ message, isOwn }: { message: ChatMessage; isOwn: boolean }) {
  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Failed to download file:', error);
    }
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`max-w-[80%] rounded-lg p-3 ${
        isOwn 
          ? 'bg-blue-500 text-white' 
          : message.sender_role === 'teacher'
            ? 'bg-green-100 text-green-900'
            : 'bg-gray-100 text-gray-900'
      }`}>
        {!isOwn && (
          <p className="text-xs font-medium mb-1 opacity-70">
            {message.sender_name} ({message.sender_role})
          </p>
        )}
        
        {message.message_type === 'file' ? (
          <div className="space-y-2">
            <p className="text-sm">{message.content}</p>
            {message.file_url && message.file_name && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownload(message.file_url!, message.file_name!)}
                className={`text-xs ${isOwn ? 'border-white text-white hover:bg-white hover:text-blue-500' : ''}`}
              >
                <Download size={12} className="mr-1" />
                Download
              </Button>
            )}
          </div>
        ) : (
          <p className="text-sm">{message.content}</p>
        )}
        
        <p className="text-xs mt-1 opacity-70">
          {format(new Date(message.created_at), 'HH:mm')}
        </p>
      </div>
    </div>
  );
}

export function RealTimeChatPanel({ roomId, currentUser }: RealTimeChatPanelProps) {
  const [inputMessage, setInputMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Instant-broadcast messages received over the unified classroom channel.
  // These are merged with DB-backed messages and de-duped by id below.
  const [broadcastMessages, setBroadcastMessages] = useState<ChatMessage[]>([]);

  const { messages: dbMessages, isLoading, isSending, error, retryCount, sendMessage, sendFile, retry } = useRealTimeChat({
    roomId,
    userId: currentUser.id,
    userName: currentUser.name,
    userRole: currentUser.role
  });

  // Subscribe to live chat broadcasts on the unified classroom_${roomId} channel.
  useEffect(() => {
    if (!roomId) return;
    const unsub = whiteboardService.subscribeToChatMessages(roomId, (payload) => {
      // Ignore own broadcasts — local optimistic insert already added the message.
      if (payload.senderId === currentUser.id) return;
      setBroadcastMessages((prev) => {
        if (prev.some((m) => m.id === payload.id)) return prev;
        const incoming: ChatMessage = {
          id: payload.id,
          content: payload.text,
          sender_id: payload.senderId,
          sender_name: payload.senderName,
          sender_role: payload.senderRole,
          room_id: roomId,
          created_at: new Date(payload.timestamp).toISOString(),
          message_type: 'text',
        };
        return [...prev, incoming];
      });
    });
    return unsub;
  }, [roomId, currentUser.id]);

  // Merge DB-backed and broadcast messages. De-dupe by id; sort by created_at.
  const messages = useMemo<ChatMessage[]>(() => {
    const map = new Map<string, ChatMessage>();
    for (const m of dbMessages) map.set(m.id, m);
    for (const m of broadcastMessages) if (!map.has(m.id)) map.set(m.id, m);
    return Array.from(map.values()).sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  }, [dbMessages, broadcastMessages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isSending) return;

    const text = inputMessage.trim();
    setInputMessage('');

    // Instant broadcast on the unified channel — both peers render immediately.
    const broadcastId = `live-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const payload: ChatBroadcastPayload = {
      id: broadcastId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      text,
      timestamp: Date.now(),
    };

    // Optimistic insert for self
    setBroadcastMessages((prev) => [
      ...prev,
      {
        id: broadcastId,
        content: text,
        sender_id: currentUser.id,
        sender_name: currentUser.name,
        sender_role: currentUser.role,
        room_id: roomId,
        created_at: new Date(payload.timestamp).toISOString(),
        message_type: 'text',
      },
    ]);

    // Fire-and-forget broadcast (instant); DB persistence runs in parallel.
    void whiteboardService.sendChatMessage(roomId, payload).catch((err) =>
      console.error('Chat broadcast failed:', err)
    );

    await sendMessage(text);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    await sendFile(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (isLoading && messages.length === 0) {
    return (
      <Card className="h-full flex items-center justify-center">
        <LoadingSpinner message="Loading chat..." />
      </Card>
    );
  }

  if (error && messages.length === 0) {
    return (
      <Card className="h-full flex items-center justify-center p-4">
        <ErrorState
          title="Chat Error"
          message={`${error.message}${retryCount > 0 ? ` (Attempt ${retryCount}/3)` : ''}`}
          onRetry={retry}
          retryLabel="Retry Loading Chat"
        />
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <div className="p-3 border-b flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-sm">Class Chat</h3>
          <p className="text-xs text-gray-500">
            {messages.length} messages
          </p>
        </div>
        
        {error && (
          <Button
            variant="ghost"
            size="sm"
            onClick={retry}
            className="text-red-600 hover:text-red-700"
          >
            <AlertCircle size={16} className="mr-1" />
            <RefreshCw size={12} />
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1 p-3">
        <div className="space-y-1">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500">No messages yet</p>
              <p className="text-xs text-gray-400 mt-1">Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.sender_id === currentUser.id}
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div className="p-3 border-t">
        {error && (
          <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
            <div className="flex items-center gap-1">
              <AlertCircle size={12} />
              {error.message}
            </div>
          </div>
        )}
        
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
            disabled={isSending}
            className="flex-1"
          />
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.txt"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={isSending}
          >
            <Paperclip size={16} />
          </Button>
          <Button type="submit" disabled={isSending || !inputMessage.trim()}>
            {isSending ? <RefreshCw size={16} className="animate-spin" /> : <Send size={16} />}
          </Button>
        </form>
      </div>
    </Card>
  );
}
