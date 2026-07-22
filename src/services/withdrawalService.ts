import { supabase } from "@/lib/supabase";

export interface TeacherWithdrawal {
  id: string;
  teacher_id: string;
  amount: number;
  payoneer_account_email: string;
  status: 'pending' | 'approved' | 'completed' | 'rejected';
  requested_at: string;
  processed_at?: string;
  admin_notes?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface WithdrawalRequest {
  amount: number;
  payoneer_account_email: string;
}

export class WithdrawalService {
  async getAvailableBalance(teacherId: string): Promise<number> {
    const { data, error } = await supabase.rpc('get_teacher_available_balance', {
      teacher_uuid: teacherId
    });

    if (error) {
      console.error('Error fetching available balance:', error);
      throw new Error('Failed to fetch available balance');
    }

    return data || 0;
  }

  async getWithdrawalHistory(teacherId: string): Promise<TeacherWithdrawal[]> {
    const { data, error } = await supabase
      .from('teacher_withdrawals')
      .select('*')
      .eq('teacher_id', teacherId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching withdrawal history:', error);
      throw new Error('Failed to fetch withdrawal history');
    }

    return data || [];
  }

  async requestWithdrawal(teacherId: string, request: WithdrawalRequest): Promise<TeacherWithdrawal> {
    // First check if teacher has sufficient balance
    const availableBalance = await this.getAvailableBalance(teacherId);
    
    if (request.amount > availableBalance) {
      throw new Error(`Insufficient balance. Available: $${availableBalance.toFixed(2)}`);
    }

    if (request.amount < 50) {
      throw new Error('Minimum withdrawal amount is $50');
    }

    const { data, error } = await supabase
      .from('teacher_withdrawals')
      .insert({
        teacher_id: teacherId,
        amount: request.amount,
        payoneer_account_email: request.payoneer_account_email
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating withdrawal request:', error);
      throw new Error('Failed to create withdrawal request');
    }

    return data;
  }

  async getPendingWithdrawals(teacherId: string): Promise<TeacherWithdrawal[]> {
    const { data, error } = await supabase
      .from('teacher_withdrawals')
      .select('*')
      .eq('teacher_id', teacherId)
      .in('status', ['pending', 'approved'])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching pending withdrawals:', error);
      throw new Error('Failed to fetch pending withdrawals');
    }

    return data || [];
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'pending': return 'text-yellow-600';
      case 'approved': return 'text-blue-600';
      case 'completed': return 'text-green-600';
      case 'rejected': return 'text-red-600';
      default: return 'text-gray-600';
    }
  }

  getStatusBadgeColor(status: string): string {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
}

export const withdrawalService = new WithdrawalService();