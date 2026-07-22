
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, TrendingUp, Clock, ArrowUp, ArrowDown } from "lucide-react";

interface BalanceOverviewProps {
  weeklyEarnings: number;
  pendingPayment: number;
  totalBalance: number;
}

export const BalanceOverview = ({ 
  weeklyEarnings, 
  pendingPayment, 
  totalBalance 
}: BalanceOverviewProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-0 overflow-hidden relative" style={{ backgroundColor: '#1A2A80' }}>
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
        <CardContent className="p-6 relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div className="flex items-center gap-1 text-white/80 text-sm">
              <ArrowUp className="h-4 w-4" />
              +15%
            </div>
          </div>
          <div>
            <p className="text-white/80 text-sm font-medium mb-1">This Week</p>
            <p className="text-3xl font-bold text-white">${weeklyEarnings}</p>
            <p className="text-white/60 text-xs mt-1">8 lessons completed</p>
          </div>
        </CardContent>
        <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: '#7A85C1' }}></div>
      </Card>

      <Card className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-0 overflow-hidden relative" style={{ backgroundColor: '#3B38A0' }}>
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
        <CardContent className="p-6 relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div className="flex items-center gap-1 text-white/80 text-sm">
              <Clock className="h-4 w-4 animate-pulse" />
              2 days
            </div>
          </div>
          <div>
            <p className="text-white/80 text-sm font-medium mb-1">Pending Payment</p>
            <p className="text-3xl font-bold text-white">${pendingPayment}</p>
            <p className="text-white/60 text-xs mt-1">Will be processed soon</p>
          </div>
        </CardContent>
        <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: '#B2B0E8' }}></div>
      </Card>

      <Card className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-0 overflow-hidden relative" style={{ backgroundColor: '#7A85C1' }}>
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
        <CardContent className="p-6 relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div className="flex items-center gap-1 text-white/80 text-sm">
              <ArrowUp className="h-4 w-4" />
              +8%
            </div>
          </div>
          <div>
            <p className="text-white/80 text-sm font-medium mb-1">Total Balance</p>
            <p className="text-3xl font-bold text-white">${totalBalance}</p>
            <p className="text-white/60 text-xs mt-1">All-time earnings</p>
          </div>
        </CardContent>
        <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: '#1A2A80' }}></div>
      </Card>
    </div>
  );
};
