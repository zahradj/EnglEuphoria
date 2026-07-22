
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Download, Calendar, AlertCircle, Settings, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { paymentService, PaymentHistoryItem, SubscriptionDetails } from "@/services/paymentService";
import { PaymentPlansGrid } from "@/components/payment/PaymentPlansGrid";
import { useStudentLevel } from "@/hooks/useStudentLevel";
import { cn } from "@/lib/utils";

export const EnhancedBillingTab = () => {
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryItem[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();
  const { studentLevel } = useStudentLevel();
  const isSuccess = studentLevel === "professional";
  const primaryBtn = isSuccess ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "";
  const outlineBtn = isSuccess ? "border-emerald-600 text-emerald-700 hover:bg-emerald-50" : "";
  const iconAccent = isSuccess ? "text-emerald-600" : "text-blue-500";
  const iconAccent2 = isSuccess ? "text-emerald-600" : "text-green-500";

  useEffect(() => {
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    try {
      setLoading(true);
      const [historyData, subscriptionData] = await Promise.all([
        paymentService.getPaymentHistory(),
        paymentService.getCurrentSubscription()
      ]);
      
      setPaymentHistory(historyData);
      setSubscription(subscriptionData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load billing data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadBillingData();
    setRefreshing(false);
    toast({
      title: "Updated",
      description: "Billing data refreshed successfully"
    });
  };

  const handleManageSubscription = async () => {
    try {
      const { url } = await paymentService.openCustomerPortal();
      window.open(url, '_blank');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to open subscription management",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'paid':
      case 'active':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'failed':
      case 'canceled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading billing information...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Payment & Billing</h1>
        <Button onClick={handleRefresh} variant="outline" disabled={refreshing} className={outlineBtn}>
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Current Subscription */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className={cn("h-5 w-5", iconAccent)} />
            Current Subscription
          </CardTitle>
        </CardHeader>
        <CardContent>
          {subscription ? (
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-lg mb-4">{subscription.plan.name}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <Badge className={getStatusColor(subscription.status)}>
                      {subscription.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current Period:</span>
                    <span className="font-medium">
                      {formatDate(subscription.current_period_start)} - {formatDate(subscription.current_period_end)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monthly Cost:</span>
                    <span className="font-medium">
                      {subscription.plan.price.toLocaleString()} {subscription.plan.currency}
                    </span>
                  </div>
                  {subscription.cancel_at_period_end && (
                    <div className="flex items-center gap-2 text-orange-600">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm">Subscription will cancel at period end</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-3">
                <Button onClick={handleManageSubscription} className={cn("w-full", primaryBtn)}>
                  <Settings className="h-4 w-4 mr-2" />
                  Manage Subscription
                </Button>
                <p className="text-sm text-gray-500">
                  Cancel, change plan, or update payment method through Stripe portal
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-600 mb-4">No active subscription found</p>
              <p className="text-sm text-gray-500">Choose a plan below to get started</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lesson Packages & Plans — always available, synced with subscription */}
      <Card>
        <CardHeader>
          <CardTitle>{subscription ? "Buy More Lessons or Change Plan" : "Choose Your Plan"}</CardTitle>
        </CardHeader>
        <CardContent>
          <PaymentPlansGrid onPlanSelect={loadBillingData} />
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className={cn("h-5 w-5", iconAccent2)} />
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {paymentHistory.length > 0 ? (
            <div className="space-y-3">
              {paymentHistory.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">
                      {payment.amount.toLocaleString()} {payment.currency}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatDate(payment.created_at)} • {payment.payment_gateway?.toUpperCase() || payment.payment_method}
                    </p>
                    {payment.plan && (
                      <p className="text-xs text-gray-500">{payment.plan.name}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={getStatusColor(payment.status)}>
                      {payment.status}
                    </Badge>
                    {payment.invoice_url && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(payment.invoice_url, '_blank')}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Invoice
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              No payment history found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
