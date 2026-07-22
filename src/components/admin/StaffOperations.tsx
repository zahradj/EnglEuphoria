import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, DollarSign, Award } from 'lucide-react';
import { PayrollLedger } from './PayrollLedger';
import { ContractManagement } from './ContractManagement';
import { PerformanceBonuses } from './PerformanceBonuses';

export const StaffOperations: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#6B21A8] font-inter tracking-tight">
          Staff Operations
        </h1>
        <p className="text-sm text-[#9E9E9E] mt-1">
          Contracts, payroll, and performance management
        </p>
      </div>

      <Tabs defaultValue="payroll" className="w-full">
        <TabsList className="bg-muted/50 border">
          <TabsTrigger value="payroll" className="gap-2">
            <DollarSign className="h-4 w-4" />
            Payroll Ledger
          </TabsTrigger>
          <TabsTrigger value="contracts" className="gap-2">
            <FileText className="h-4 w-4" />
            Contracts
          </TabsTrigger>
          <TabsTrigger value="bonuses" className="gap-2">
            <Award className="h-4 w-4" />
            Bonuses
          </TabsTrigger>
        </TabsList>

        <TabsContent value="payroll">
          <PayrollLedger />
        </TabsContent>
        <TabsContent value="contracts">
          <ContractManagement />
        </TabsContent>
        <TabsContent value="bonuses">
          <PerformanceBonuses />
        </TabsContent>
      </Tabs>
    </div>
  );
};
