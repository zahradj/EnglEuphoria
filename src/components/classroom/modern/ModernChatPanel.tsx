import { useState, useRef, useEffect, useCallback } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRealTimeChat } from "@/hooks/useRealTimeChat";
import { ChatMessage } from "@/services/chatService";
import { 
  Send, 
  Paperclip, 
  Download, 
  Smile, 
  X,
  Edit2,
  Trash2,
  Check,
  Image as ImageIcon,
  FileText
} from "lucide-react";
import { format } from "date-fns";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { toast } from "sonner";

interface ModernChatPanelProps {
  roomId: string;
  currentUser: {
    id: string;
    name: string;
    role: 'teacher' | 'student';
  };
}

interface MessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
  isTeacher: boolean;
  onEdit?: (messageId: string, newContent: string) => void;
  onDelete?: (messageId: string) => void;
}

function MessageBubble({ message, isOwn, isTeacher, onEdit, onDelete }: MessageBubbleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [showActions, setShowActions] = useState(false);

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
      toast.success("File downloaded");
    } catch (error) {
      console.error('Failed to download file:', error);
      toast.error("Failed to download file");
    }
  };

  const handleSaveEdit = () => {
    if (editContent.trim() && editContent !== message.content) {
      onEdit?.(message.id, editContent);
    }
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (confirm("Delete this message?")) {
      onDelete?.(message.id);
    }
  };

  const senderColor = message.sender_role === 'teacher' 
    ? 'from-classroom-accent/20 to-classroom-primary/20'
    : 'from-classroom-success/20 to-classroom-accent/20';

  return (
    <div 
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3 animate-fade-in`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className={`max-w-[80%] ${isOwn ? 'order-1' : 'order-2'}`}>
        <GlassCard 
          variant="light"
          className={`p-3 ${isOwn ? 'glass' : `bg-gradient-to-br ${senderColor}`} relative`}
        >
          {/* Sender info */}
          {!isOwn && (
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-classroom-primary/30 flex items-center justify-center text-xs font-medium">
                {message.sender_name[0].toUpperCase()}
              </div>
              <p className="text-xs font-medium">
                {message.sender_name}
                <span className="text-xs text-muted-foreground ml-1">
                  ({message.sender_role})
                </span>
              </p>
            </div>
          )}

          {/* Message content */}
          {message.message_type === 'file' ? (
            <div className="space-y-2">
              {message.file_name?.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                <div className="rounded-lg overflow-hidden bg-background/20">
                  <img 
                    src={message.file_url!} 
                    alt={message.file_name} 
                    className="max-w-full max-h-48 object-contain"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-2 p-2 rounded bg-background/10">
                  <FileText className="w-5 h-5 text-classroom-accent" />
                  <span className="text-sm flex-1 truncate">{message.file_name}</span>
                </div>
              )}
              <p className="text-sm">{message.content}</p>
              {message.file_url && message.file_name && (
                <GlassButton
                  variant="accent"
                  size="sm"
                  onClick={() => handleDownload(message.file_url!, message.file_name!)}
                >
                  <Download className="w-3 h-3 mr-1" />
                  Download
                </GlassButton>
              )}
            </div>
          ) : isEditing ? (
            <div className="space-y-2">
              <Input
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveEdit();
                  if (e.key === 'Escape') setIsEditing(false);
                }}
                autoFocus
              />
              <div className="flex gap-2">
                <GlassButton size="sm" variant="success" onClick={handleSaveEdit}>
                  <Check className="w-3 h-3" />
                </GlassButton>
                <GlassButton size="sm" variant="default" onClick={() => setIsEditing(false)}>
                  <X className="w-3 h-3" />
                </GlassButton>
              </div>
            </div>
          ) : (
            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
          )}

          {/* Timestamp and actions */}
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-muted-foreground">
              {format(new Date(message.created_at), 'HH:mm')}
            </p>
            
            {showActions && isTeacher && !isEditing && message.message_type !== 'file' && (
              <div className="flex gap-1">
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-xs opacity-60 hover:opacity-100 transition-opacity"
                  title="Edit message"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
                <button
                  onClick={handleDelete}
                  className="text-xs opacity-60 hover:opacity-100 transition-opacity text-destructive"
                  title="Delete message"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

function TypingIndicator({ users }: { users: string[] }) {
  if (users.length === 0) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground animate-fade-in">
      <div className="flex gap-1">
        <span className="w-2 h-2 bg-classroom-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 bg-classroom-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 bg-classroom-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span>{users[0]} is typing...</span>
    </div>
  );
}

export function ModernChatPanel({ roomId, currentUser }: ModernChatPanelProps) {
  const [inputMessage, setInputMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const { messages, isLoading, isSending, error, sendMessage, sendFile } = useRealTimeChat({
    roomId,
    userId: currentUser.id,
    userName: currentUser.name,
    userRole: currentUser.role
  });

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isSending) return;
    
    await sendMessage(inputMessage);
    setInputMessage('');
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setInputMessage(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const handleFileSelect = async (file: File) => {
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    await sendFile(file);
    toast.success("File sent");
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.target === dropZoneRef.current) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, []);

  const isTeacher = currentUser.role === 'teacher';

  return (
    <div
      ref={dropZoneRef}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="h-full relative"
    >
      <GlassCard className="h-full flex flex-col">
        {/* Drag overlay */}
        {isDragging && (
          <div className="absolute inset-0 z-50 glass flex items-center justify-center border-2 border-dashed border-classroom-accent animate-pulse">
            <div className="text-center">
              <Paperclip className="w-16 h-16 mx-auto mb-4 text-classroom-accent" />
              <p className="text-lg font-semibold">Drop file here</p>
              <p className="text-sm text-muted-foreground">Max 10MB</p>
            </div>
          </div>
        )}

      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Class Chat</h3>
            <p className="text-xs text-muted-foreground">
              {messages.length} messages
            </p>
          </div>
          <div className="w-2 h-2 bg-classroom-success rounded-full animate-pulse" title="Connected" />
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-1">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-classroom-primary/20 flex items-center justify-center">
                <Send className="w-8 h-8 text-classroom-primary" />
              </div>
              <p className="text-sm font-medium">No messages yet</p>
              <p className="text-xs text-muted-foreground mt-1">Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.sender_id === currentUser.id}
                isTeacher={isTeacher}
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Typing indicator */}
      <TypingIndicator users={typingUsers} />

      {/* Input area */}
      <div className="p-4 border-t border-white/10 space-y-3">
        {/* Emoji picker */}
        {showEmojiPicker && (
          <div className="absolute bottom-20 right-4 z-50 animate-scale-in">
            <EmojiPicker onEmojiClick={handleEmojiClick} />
          </div>
        )}

        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
            disabled={isSending}
            className="flex-1 glass"
          />
          
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileInputChange}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.txt"
          />
          
          <GlassButton
            type="button"
            variant="default"
            size="sm"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            disabled={isSending}
            title="Add emoji"
          >
            <Smile className="w-4 h-4" />
          </GlassButton>
          
          <GlassButton
            type="button"
            variant="default"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isSending}
            title="Attach file"
          >
            <Paperclip className="w-4 h-4" />
          </GlassButton>
          
          <GlassButton 
            type="submit" 
            variant="primary"
            size="sm"
            disabled={isSending || !inputMessage.trim()}
          >
            <Send className="w-4 h-4" />
          </GlassButton>
        </form>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <ImageIcon className="w-3 h-3" />
          <span>Drag and drop files or click to attach</span>
        </div>
      </div>
      </GlassCard>
    </div>
  );
}
