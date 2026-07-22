
import { useState, useEffect, useCallback } from 'react';
import { chatService, ChatMessage } from '@/services/chatService';
import { useToast } from '@/hooks/use-toast';

interface UseRealTimeChatProps {
  roomId: string;
  userId: string;
  userName: string;
  userRole: 'teacher' | 'student';
}

interface ChatError {
  message: string;
  code?: string;
}

export function useRealTimeChat({ roomId, userId, userName, userRole }: UseRealTimeChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<ChatError | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const { toast } = useToast();

  const maxRetries = 3;

  // Load initial messages with retry logic
  const loadMessages = useCallback(async (attempt = 1) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const initialMessages = await chatService.getMessages(roomId);
      
      setMessages(initialMessages);
      setRetryCount(0);
    } catch (error: any) {
      console.error('📧 Failed to load messages:', error);
      
      const chatError: ChatError = {
        message: error.message || 'Failed to load chat messages',
        code: error.code || 'UNKNOWN_ERROR'
      };
      
      setError(chatError);
      
      if (attempt < maxRetries) {
        setTimeout(() => {
          setRetryCount(attempt);
          loadMessages(attempt + 1);
        }, attempt * 2000);
      } else {
        toast({
          title: "Chat Error",
          description: `Failed to load chat messages: ${chatError.message}`,
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [roomId, toast]);

  // Load messages on mount and when roomId changes
  useEffect(() => {
    if (roomId && userId) {
      loadMessages();
    }
  }, [roomId, userId, loadMessages]);

  // Subscribe to real-time messages with error handling
  useEffect(() => {
    if (!roomId || error) return;

    
    const unsubscribe = chatService.subscribeToMessages(roomId, (newMessage) => {
      
      setMessages(prev => {
        // Avoid duplicates
        if (prev.some(msg => msg.id === newMessage.id)) {
          return prev;
        }
        return [...prev, newMessage];
      });
    });

    return () => {
      unsubscribe();
    };
  }, [roomId, error]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isSending) return;

    try {
      setIsSending(true);
      setError(null);
      
      
      await chatService.sendMessage(roomId, content.trim(), userId, userName, userRole);
      
    } catch (error: any) {
      console.error('📧 Failed to send message:', error);
      
      const chatError: ChatError = {
        message: error.message || 'Failed to send message',
        code: error.code || 'SEND_FAILED'
      };
      
      setError(chatError);
      
      toast({
        title: "Error",
        description: chatError.message,
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  }, [roomId, userId, userName, userRole, isSending, toast]);

  const sendFile = useCallback(async (file: File) => {
    if (isSending) return;

    try {
      setIsSending(true);
      setError(null);
      
      
      await chatService.sendFileMessage(roomId, file, userId, userName, userRole);
      
      toast({
        title: "File Shared",
        description: `${file.name} has been shared in the chat`,
      });
      
    } catch (error: any) {
      console.error('📧 Failed to send file:', error);
      
      const chatError: ChatError = {
        message: error.message || 'Failed to share file',
        code: error.code || 'FILE_SEND_FAILED'
      };
      
      setError(chatError);
      
      toast({
        title: "Error",
        description: chatError.message,
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  }, [roomId, userId, userName, userRole, isSending, toast]);

  const retry = useCallback(() => {
    setError(null);
    setRetryCount(0);
    loadMessages();
  }, [loadMessages]);

  return {
    messages,
    isLoading,
    isSending,
    error,
    retryCount,
    sendMessage,
    sendFile,
    retry
  };
}
