
import React, { createContext, useContext, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface UnifiedClassroomContextType {
  currentUser: {
    id: string;
    name: string;
    role: 'teacher' | 'student';
  };
  finalRoomId: string;
  isLoading: boolean;
  error: string | null;
}

const UnifiedClassroomContext = createContext<UnifiedClassroomContextType | undefined>(undefined);

export function UnifiedClassroomProvider({ children }: { children: React.ReactNode }) {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Get URL parameters
  const roomId = searchParams.get("roomId") || "unified-classroom-default";
  const role = (searchParams.get("role") || "student") as 'teacher' | 'student';
  const name = searchParams.get("name") || "User";
  const userId = searchParams.get("userId");

  // State for current user
  const [currentUser, setCurrentUser] = useState({
    id: userId || `${role}-${Date.now()}`,
    name,
    role
  });

  useEffect(() => {
    const initializeUser = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // For development, we'll allow URL parameters to override authentication
        if (userId && name && role) {
          setCurrentUser({
            id: userId,
            name,
            role
          });
          setIsLoading(false);
          return;
        }

        // Check if user is authenticated
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          console.warn('Authentication error:', authError);
          // Don't block access for development, just use URL params
          if (userId && name && role) {
            setCurrentUser({
              id: userId,
              name,
              role
            });
          } else {
            setError('User information required to access classroom.');
            return;
          }
        } else if (user) {
          // Use authenticated user ID
          setCurrentUser({
            id: user.id,
            name: user.user_metadata?.full_name || name || 'Teacher',
            role
          });
        } else if (userId) {
          // Use provided user ID (for development/testing)
          setCurrentUser({
            id: userId,
            name,
            role
          });
        } else {
          setError('User authentication required to access classroom.');
          return;
        }
      } catch (error) {
        console.error('Failed to initialize classroom user:', error);
        setError('Failed to initialize classroom. Please refresh and try again.');
        
        toast({
          title: "Initialization Error",
          description: "Failed to set up classroom connection. Please refresh the page.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    initializeUser();
  }, [userId, name, role, roomId, toast]);

  if (isLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Connecting to classroom...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Connection Error</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  const contextValue: UnifiedClassroomContextType = {
    currentUser,
    finalRoomId: roomId,
    isLoading,
    error
  };

  return (
    <UnifiedClassroomContext.Provider value={contextValue}>
      {children}
    </UnifiedClassroomContext.Provider>
  );
}

export function useUnifiedClassroomContext() {
  const context = useContext(UnifiedClassroomContext);
  if (context === undefined) {
    throw new Error('useUnifiedClassroomContext must be used within a UnifiedClassroomProvider');
  }
  return context;
}
