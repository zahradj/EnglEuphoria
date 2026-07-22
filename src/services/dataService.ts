// Centralized data service to replace mock data throughout the app

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  avatar?: string;
}

export interface Lesson {
  id: string;
  title: string;
  scheduledAt: string;
  duration: number;
  teacherId: string;
  studentId: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export interface TeacherEarnings {
  totalEarnings: number;
  thisMonth: number;
  pendingPayments: number;
  completedLessons: number;
}

export interface StudentProgress {
  totalLessons: number;
  hoursStudied: number;
  currentLevel: string;
  xpPoints: number;
}

class DataService {
  // User data
  async getCurrentUser(): Promise<User | null> {
    // Replace with actual API call
    const storedUser = localStorage.getItem('currentUser');
    return storedUser ? JSON.parse(storedUser) : null;
  }

  async getUserById(id: string): Promise<User | null> {
    // Replace with actual API call
    return {
      id,
      name: 'User Name',
      email: 'user@example.com',
      role: 'student'
    };
  }

  // Lesson data
  async getUpcomingLessons(userId: string, role: string): Promise<Lesson[]> {
    // Replace with actual API call
    return [];
  }

  async getLessonHistory(userId: string): Promise<Lesson[]> {
    // Replace with actual API call
    return [];
  }

  // Teacher earnings
  async getTeacherEarnings(teacherId: string): Promise<TeacherEarnings> {
    // Replace with actual Supabase query
    return {
      totalEarnings: 0,
      thisMonth: 0,
      pendingPayments: 0,
      completedLessons: 0
    };
  }

  // Student progress
  async getStudentProgress(studentId: string): Promise<StudentProgress> {
    // Replace with actual Supabase query
    return {
      totalLessons: 0,
      hoursStudied: 0,
      currentLevel: 'Beginner',
      xpPoints: 0
    };
  }

  // Remove console.log statements in production
  private log(message: string, data?: any) {
    if (process.env.NODE_ENV === 'development') {
    }
  }
}

export const dataService = new DataService();