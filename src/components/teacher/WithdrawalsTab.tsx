import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { withdrawalService, type TeacherWithdrawal } from '@/services/withdrawalService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  DollarSign, 
  CreditCard, 
  ArrowUpRight, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';

export const WithdrawalsTab = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [availableBalance, setAvailableBalance] = useState<number>(0);
  const [withdrawalHistory, setWithdrawalHistory] = useState<TeacherWithdrawal[]>([]);
  const [pendingWithdrawals, setPendingWithdrawals] = useState<TeacherWithdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [amount, setAmount] = useState('');
  const [payoneerEmail, setPayoneerEmail] = useState('');

  const teacherId = user?.id || '';

  useEffect(() => {
    if (teacherId) {
      loadData();
    }
  }, [teacherId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [balance, history, pending] = await Promise.all([
        withdrawalService.getAvailableBalance(teacherId),
        withdrawalService.getWithdrawalHistory(teacherId),
        withdrawalService.getPendingWithdrawals(teacherId)
      ]);
      
      setAvailableBalance(balance);
      setWithdrawalHistory(history);
      setPendingWithdrawals(pending);
    } catch (error) {
      console.error('Error loading withdrawal data:', error);
      toast({
        title: "Error",
        description: "Failed to load withdrawal data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawalRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !payoneerEmail) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    const withdrawalAmount = parseFloat(amount);
    if (isNaN(withdrawalAmount) || withdrawalAmount <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive"
      });
      return;
    }

    try {
      setSubmitting(true);
      await withdrawalService.requestWithdrawal(teacherId, {
        amount: withdrawalAmount,
        payoneer_account_email: payoneerEmail
      });

      toast({
        title: "Withdrawal Request Submitted",
        description: `Your withdrawal request for ${withdrawalService.formatCurrency(withdrawalAmount)} has been submitted for review.`
      });

      // Clear form and reload data
      setAmount('');
      setPayoneerEmail('');
      await loadData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit withdrawal request",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'approved': return <AlertCircle className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const totalPending = pendingWithdrawals.reduce((sum, w) => sum + w.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Withdrawals</h1>
        <p className="text-muted-foreground">Manage your earnings withdrawals</p>
      </div>

      {/* Balance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {withdrawalService.formatCurrency(availableBalance)}
            </div>
            <p className="text-xs text-muted-foreground">
              Ready for withdrawal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Withdrawals</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {withdrawalService.formatCurrency(totalPending)}
            </div>
            <p className="text-xs text-muted-foreground">
              {pendingWithdrawals.length} request(s)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {withdrawalHistory.length}
            </div>
            <p className="text-xs text-muted-foreground">
              All time withdrawals
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Withdrawal Request Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Request Withdrawal
          </CardTitle>
          <CardDescription>
            Submit a new withdrawal request to your Payoneer account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Minimum withdrawal amount is $50. Withdrawals are processed within 3-5 business days.
            </AlertDescription>
          </Alert>

          <form onSubmit={handleWithdrawalRequest} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  min="50"
                  max={availableBalance}
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="50.00"
                  disabled={submitting}
                />
                <p className="text-xs text-muted-foreground">
                  Available: {withdrawalService.formatCurrency(availableBalance)}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payoneer-email">Payoneer Account Email</Label>
                <Input
                  id="payoneer-email"
                  type="email"
                  value={payoneerEmail}
                  onChange={(e) => setPayoneerEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  disabled={submitting}
                />
                <p className="text-xs text-muted-foreground">
                  Must match your Payoneer account
                </p>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={submitting || availableBalance < 50}
              className="w-full md:w-auto"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <ArrowUpRight className="mr-2 h-4 w-4" />
                  Submit Withdrawal Request
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Withdrawal History */}
      <Card>
        <CardHeader>
          <CardTitle>Withdrawal History</CardTitle>
          <CardDescription>
            Your withdrawal requests and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {withdrawalHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No withdrawal requests yet
            </div>
          ) : (
            <div className="space-y-4">
              {withdrawalHistory.map((withdrawal) => (
                <div key={withdrawal.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={withdrawalService.getStatusColor(withdrawal.status)}>
                      {getStatusIcon(withdrawal.status)}
                    </div>
                    <div>
                      <div className="font-medium">
                        {withdrawalService.formatCurrency(withdrawal.amount)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {withdrawal.payoneer_account_email}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Requested {format(new Date(withdrawal.requested_at), 'MMM dd, yyyy HH:mm')}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={withdrawalService.getStatusBadgeColor(withdrawal.status)}>
                      {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                    </Badge>
                    {withdrawal.processed_at && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Processed {format(new Date(withdrawal.processed_at), 'MMM dd, yyyy')}
                      </div>
                    )}
                    {withdrawal.rejection_reason && (
                      <div className="text-xs text-red-600 mt-1">
                        {withdrawal.rejection_reason}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};