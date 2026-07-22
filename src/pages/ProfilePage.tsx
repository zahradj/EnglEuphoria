import React from 'react';
import { MobileAwarePage } from '@/components/mobile/MobileAwarePage';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Mail, Calendar, Award } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <MobileAwarePage title="Profile">
      <div className="container mx-auto px-4 py-8 space-y-6 max-w-2xl">
        <Card className="glass-card-hub overflow-hidden">
          {/* Brand gradient header */}
          <div className="h-24 bg-gradient-to-r from-primary/80 to-primary/40 relative">
            <Avatar className="w-20 h-20 absolute -bottom-10 left-1/2 -translate-x-1/2 border-4 border-card shadow-lg">
              <AvatarFallback className="text-lg bg-primary/10 text-primary font-semibold">
                {(((user as any)?.full_name || (user?.user_metadata as any)?.full_name || user?.email || 'U') as string)
                  .trim()
                  .split(/\s+/)
                  .map((p: string) => p[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          <CardHeader className="text-center pt-14">
            <CardTitle className="text-xl text-foreground">
              {(user as any)?.full_name || (user?.user_metadata as any)?.full_name || 'Student'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-foreground">{user?.email}</span>
            </div>

            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-foreground capitalize">Student</span>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-foreground">
                Member since {new Date(user?.created_at || '').toLocaleDateString()}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Award className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-foreground">Level 1 - Beginner</span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card-hub">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">Learning Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Your learning analytics and progress tracking will appear here.
            </p>
          </CardContent>
        </Card>
      </div>
    </MobileAwarePage>
  );
};

export default ProfilePage;
