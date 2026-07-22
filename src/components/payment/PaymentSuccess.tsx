
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

export const PaymentSuccess = () => {
  return (
    <div className="min-h-dvh bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center">
      <Card className="max-w-md w-full mx-4">
        <CardContent className="text-center py-8">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-gray-600 mb-4">
            Your payment has been processed and your account is now active.
          </p>
          <p className="text-sm text-gray-500">
            Redirecting to dashboard in a few seconds...
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
