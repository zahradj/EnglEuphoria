export interface Assignment {
  id: string;
  title: string;
  description: string;
  type: 'essay' | 'quiz' | 'project' | 'reading' | 'speaking';
  dueDate: string;
  points: number;
  instructions: string;
  attachments?: AssignmentAttachment[];
  rubric?: GradingRubric;
  template?: AssignmentTemplate;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  content: string;
  attachments: SubmissionFile[];
  status: 'draft' | 'submitted' | 'graded' | 'returned';
  submittedAt?: string;
  grade?: number;
  feedback?: string;
  rubricScores?: RubricScore[];
  createdAt: string;
  updatedAt: string;
}

export interface SubmissionFile {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
}

export interface AssignmentAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
}

export interface GradingRubric {
  id: string;
  criteria: RubricCriterion[];
  totalPoints: number;
}

export interface RubricCriterion {
  id: string;
  name: string;
  description: string;
  points: number;
  levels: RubricLevel[];
}

export interface RubricLevel {
  id: string;
  name: string;
  description: string;
  points: number;
}

export interface RubricScore {
  criterionId: string;
  levelId: string;
  points: number;
  feedback?: string;
}

export interface AssignmentTemplate {
  id: string;
  name: string;
  description: string;
  type: Assignment['type'];
  defaultInstructions: string;
  defaultPoints: number;
  suggestedRubric?: GradingRubric;
}

class AssignmentService {
  // Assignment CRUD operations
  async createAssignment(assignmentData: Omit<Assignment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Assignment> {
    const assignment: Assignment = {
      ...assignmentData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // In a real implementation, this would save to Supabase
    return assignment;
  }

  async getAssignmentsByTeacher(teacherId: string): Promise<Assignment[]> {
    // Mock data for now
    return [
      {
        id: '1',
        title: 'Essay: My Weekend Activities',
        description: 'Write a 150-word essay about your weekend activities using past tense.',
        type: 'essay',
        dueDate: '2024-12-08T23:59:59Z',
        points: 25,
        instructions: 'Use at least 5 different past tense verbs. Include introduction, body, and conclusion.',
        createdBy: teacherId,
        createdAt: '2024-12-01T10:00:00Z',
        updatedAt: '2024-12-01T10:00:00Z'
      },
      {
        id: '2',
        title: 'Vocabulary Quiz: Unit 5',
        description: 'Complete the vocabulary quiz covering words from Unit 5.',
        type: 'quiz',
        dueDate: '2024-12-06T23:59:59Z',
        points: 20,
        instructions: 'Match words with definitions and use them in sentences.',
        createdBy: teacherId,
        createdAt: '2024-11-28T10:00:00Z',
        updatedAt: '2024-11-28T10:00:00Z'
      }
    ];
  }

  async getAssignmentsByStudent(studentId: string): Promise<Assignment[]> {
    return this.getAssignmentsByTeacher('teacher-1'); // Mock data
  }

  // Submission operations
  async createSubmission(submissionData: Omit<AssignmentSubmission, 'id' | 'createdAt' | 'updatedAt'>): Promise<AssignmentSubmission> {
    const submission: AssignmentSubmission = {
      ...submissionData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return submission;
  }

  async submitAssignment(assignmentId: string, studentId: string, content: string, files: File[]): Promise<AssignmentSubmission> {
    const attachments: SubmissionFile[] = files.map(file => ({
      id: Date.now().toString() + Math.random(),
      fileName: file.name,
      fileUrl: URL.createObjectURL(file),
      fileType: file.type,
      fileSize: file.size,
      uploadedAt: new Date().toISOString()
    }));

    return this.createSubmission({
      assignmentId,
      studentId,
      studentName: 'Student Name', // Would get from user data
      content,
      attachments,
      status: 'submitted',
      submittedAt: new Date().toISOString()
    });
  }

  async getSubmissionsByAssignment(assignmentId: string): Promise<AssignmentSubmission[]> {
    // Mock data
    return [
      {
        id: '1',
        assignmentId,
        studentId: 'student-1',
        studentName: 'Alex Johnson',
        content: 'Last weekend, I visited my grandmother...',
        attachments: [],
        status: 'submitted',
        submittedAt: '2024-12-05T14:30:00Z',
        createdAt: '2024-12-05T14:30:00Z',
        updatedAt: '2024-12-05T14:30:00Z'
      }
    ];
  }

  async getSubmissionsByStudent(studentId: string): Promise<AssignmentSubmission[]> {
    return [
      {
        id: '1',
        assignmentId: '1',
        studentId,
        studentName: 'Current Student',
        content: 'My submission content...',
        attachments: [],
        status: 'submitted',
        submittedAt: '2024-12-05T14:30:00Z',
        createdAt: '2024-12-05T14:30:00Z',
        updatedAt: '2024-12-05T14:30:00Z'
      }
    ];
  }

  // Grading operations
  async gradeSubmission(
    submissionId: string, 
    grade: number, 
    feedback: string, 
    rubricScores?: RubricScore[]
  ): Promise<AssignmentSubmission> {
    
    // Mock return
    return {
      id: submissionId,
      assignmentId: '1',
      studentId: 'student-1',
      studentName: 'Student Name',
      content: 'Submission content',
      attachments: [],
      status: 'graded',
      grade,
      feedback,
      rubricScores,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  // Template operations
  async getAssignmentTemplates(): Promise<AssignmentTemplate[]> {
    return [
      {
        id: '1',
        name: 'Personal Narrative Essay',
        description: 'Template for personal experience essays',
        type: 'essay',
        defaultInstructions: 'Write about a personal experience using descriptive language and proper grammar.',
        defaultPoints: 25
      },
      {
        id: '2',
        name: 'Vocabulary Assessment',
        description: 'Template for vocabulary quizzes',
        type: 'quiz',
        defaultInstructions: 'Complete the vocabulary exercises using the words from this unit.',
        defaultPoints: 20
      },
      {
        id: '3',
        name: 'Reading Comprehension',
        description: 'Template for reading assignments',
        type: 'reading',
        defaultInstructions: 'Read the provided text and answer the comprehension questions.',
        defaultPoints: 30
      }
    ];
  }

  // File operations
  async uploadFile(file: File, category: 'assignment' | 'submission'): Promise<string> {
    // Mock file upload - in real implementation would upload to Supabase Storage
    return URL.createObjectURL(file);
  }

  async deleteFile(fileUrl: string): Promise<boolean> {
    return true;
  }
}

export const assignmentService = new AssignmentService();
