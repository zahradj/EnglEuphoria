
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

export const SecurityNotice = () => {
  return (
    <Card className="mt-8 bg-gray-50">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <span>Your payment information is encrypted and secure. We support multiple payment methods including international cards and local Algerian payment systems.</span>
        </div>
      </CardContent>
    </Card>
  );
};
