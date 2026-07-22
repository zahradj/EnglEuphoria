
import { supabase, Lesson, Homework, Payment } from '@/lib/supabase'

// Lessons Service
export const lessonsService = {
  async getUpcomingLessons(userId: string, role: 'student' | 'teacher') {
    const column = role === 'teacher' ? 'teacher_id' : 'student_id'
    const { data, error } = await supabase
      .from('lessons')
      .select(`
        *,
        teacher:users!teacher_id(full_name),
        student:users!student_id(full_name)
      `)
      .eq(column, userId)
      .gte('scheduled_at', new Date().toISOString())
      .order('scheduled_at', { ascending: true })

    if (error) throw error
    return data
  },

  async createLesson(lessonData: Omit<Lesson, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('lessons')
      .insert([lessonData])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateLessonStatus(lessonId: string, status: Lesson['status']) {
    const { data, error } = await supabase
      .from('lessons')
      .update({ status })
      .eq('id', lessonId)
      .select()
      .single()

    if (error) throw error
    return data
  }
}

// Homework Service
export const homeworkService = {
  async getHomeworkByStudent(studentId: string) {
    const { data, error } = await supabase
      .from('homework')
      .select(`
        *,
        lesson:lessons(title),
        teacher:users!teacher_id(full_name)
      `)
      .eq('student_id', studentId)
      .order('due_date', { ascending: true })

    if (error) throw error
    return data
  },

  async getHomeworkByTeacher(teacherId: string) {
    const { data, error } = await supabase
      .from('homework')
      .select(`
        *,
        lesson:lessons(title),
        student:users!student_id(full_name)
      `)
      .eq('teacher_id', teacherId)
      .order('due_date', { ascending: true })

    if (error) throw error
    return data
  },

  async createHomework(homeworkData: Omit<Homework, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('homework')
      .insert([homeworkData])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async submitHomework(homeworkId: string) {
    const { data, error } = await supabase
      .from('homework')
      .update({ status: 'submitted' })
      .eq('id', homeworkId)
      .select()
      .single()

    if (error) throw error
    return data
  }
}

// Payments Service
export const paymentsService = {
  async getPaymentHistory(studentId: string) {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        lesson:lessons(title, scheduled_at)
      `)
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async createPayment(paymentData: Omit<Payment, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('payments')
      .insert([paymentData])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getTeacherEarnings(teacherId: string) {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        amount,
        status,
        created_at,
        lesson:lessons!inner(teacher_id)
      `)
      .eq('lesson.teacher_id', teacherId)
      .eq('status', 'completed')

    if (error) throw error
    
    const totalEarnings = data.reduce((sum, payment) => sum + payment.amount, 0)
    const thisWeekStart = new Date()
    thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay())
    
    const weeklyEarnings = data
      .filter(payment => new Date(payment.created_at) >= thisWeekStart)
      .reduce((sum, payment) => sum + payment.amount, 0)

    return {
      totalEarnings,
      weeklyEarnings,
      paymentsCount: data.length
    }
  }
}
