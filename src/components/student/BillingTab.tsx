
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Download, Calendar, AlertCircle, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const BillingTab = () => {
  const navigate = useNavigate();
  
  const subscription = {
    plan: "Standard Plan",
    lessonsRemaining: 8,
    nextPayment: "Jan 7, 2025",
    amount: "4,500 DZD"
  };

  const paymentHistory = [
    {
      id: 1,
      date: "Dec 7, 2024",
      amount: "4,500 DZD", 
      method: "BaridiMob",
      status: "paid"
    },
    {
      id: 2,
      date: "Nov 7, 2024",
      amount: "4,500 DZD",
      method: "CIB Bank",
      status: "paid"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Payment & Billing</h1>
        <Button onClick={() => navigate("/payment")} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          View Plans
        </Button>
      </div>
      
      {/* Current Subscription */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-blue-500" />
            Current Subscription
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-lg mb-4">{subscription.plan}</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Lessons Remaining:</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    {subscription.lessonsRemaining} lessons
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Next Payment:</span>
                  <span className="font-medium">{subscription.nextPayment}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-medium">{subscription.amount}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <Button onClick={() => navigate("/payment")} className="w-full">Renew Subscription</Button>
              <Button onClick={() => navigate("/payment")} variant="outline" className="w-full">Change Plan</Button>
              <Button variant="outline" className="w-full">Update Payment Method</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-green-500" />
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {paymentHistory.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{payment.amount}</p>
                  <p className="text-sm text-gray-600">{payment.date} • {payment.method}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="default" className="bg-green-500">
                    {payment.status}
                  </Badge>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Invoice
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
