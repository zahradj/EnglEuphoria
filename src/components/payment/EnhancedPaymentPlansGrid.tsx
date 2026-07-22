import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Star, CreditCard, Smartphone, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getRegionalPlans, RegionalPricingPlan } from "@/services/pricingData";
import { getRegionConfig } from "@/services/locationService";

interface EnhancedPaymentPlansGridProps {
  selectedRegion: 'algeria' | 'international';
  onPlanSelect?: (planId: string, gateway: string) => void;
}

export const EnhancedPaymentPlansGrid: React.FC<EnhancedPaymentPlansGridProps> = ({ 
  selectedRegion,
  onPlanSelect 
}) => {
  const [plans, setPlans] = useState<RegionalPricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const { toast } = useToast();

  const regionConfig = getRegionConfig(selectedRegion);

  useEffect(() => {
    loadPlans();
  }, [selectedRegion]);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const data = await getRegionalPlans(selectedRegion);
      setPlans(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load payment plans",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSelect = async (plan: RegionalPricingPlan, gateway: string) => {
    setProcessingPlan(plan.id);
    
    try {
      
      if (selectedRegion === 'algeria') {
        if (gateway === 'baridimob') {
          // Open BaridiMob payment (mock URL for demo)
          const paymentUrl = `https://pay.baridimob.dz/payment?amount=${plan.price}&currency=${plan.currency}&plan=${plan.id}`;
          window.open(paymentUrl, '_blank');
          
          toast({
            title: "Opening BaridiMob Payment",
            description: "You will be redirected to BaridiMob to complete your payment.",
          });
        } else if (gateway === 'cib') {
          // Open CIB payment (mock URL for demo)
          const paymentUrl = `https://pay.cib.dz/payment?amount=${plan.price}&currency=${plan.currency}&plan=${plan.id}`;
          window.open(paymentUrl, '_blank');
          
          toast({
            title: "Opening CIB Payment",
            description: "You will be redirected to CIB to complete your payment.",
          });
        }
      } else {
        // International payments
        if (gateway === 'bank_transfer') {
          // Show banking instructions
          toast({
            title: "Bank Transfer Instructions",
            description: "Please use the banking information provided above to complete your payment. Reference: " + plan.id,
            duration: 10000,
          });
        } else if (gateway === 'sepa') {
          // Open SEPA transfer (mock URL for demo)
          const paymentUrl = `https://sepa.banking-circle.com/transfer?amount=${plan.price}&currency=${plan.currency}&plan=${plan.id}&iban=LU574080000024260839`;
          window.open(paymentUrl, '_blank');
          
          toast({
            title: "Opening SEPA Transfer",
            description: "You will be redirected to complete your SEPA transfer.",
          });
        }
      }
      
      onPlanSelect?.(plan.id, gateway);
    } catch (error) {
      toast({
        title: "Payment Error",
        description: error instanceof Error ? error.message : "Failed to process payment",
        variant: "destructive"
      });
    } finally {
      setProcessingPlan(null);
    }
  };

  const formatFeatures = (features: RegionalPricingPlan['features']) => {
    const featureList = [];
    if (features.lessons_per_month === -1) {
      featureList.push("Unlimited lessons");
    } else if (features.lessons_per_month) {
      featureList.push(`${features.lessons_per_month} lessons/month`);
    }
    if (features.lessons) {
      featureList.push(`${features.lessons} lesson${features.lessons > 1 ? 's' : ''}`);
    }
    if (features.ai_assistant) featureList.push("AI Assistant");
    if (features.homework_tracking) featureList.push("Homework tracking");
    if (features.priority_support) featureList.push("Priority support");
    if (features.custom_curriculum) featureList.push("Custom curriculum");
    if (features.progress_reports) featureList.push("Progress reports");
    if (features.certificate) featureList.push("Completion certificate");
    return featureList;
  };

  const formatPrice = (price: number, currency: string) => {
    if (currency === 'DZD') {
      return `${price.toLocaleString()} DA`;
    }
    if (currency === 'EUR') {
      return `€${price}`;
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(price);
  };

  const getPaymentButtons = (plan: RegionalPricingPlan) => {
    if (selectedRegion === 'algeria') {
      return (
        <div className="space-y-2">
          <Button 
            onClick={() => handlePlanSelect(plan, 'baridimob')}
            disabled={processingPlan === plan.id}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            <Smartphone className="w-4 h-4 mr-2" />
            {processingPlan === plan.id ? "Processing..." : "Pay with BaridiMob"}
          </Button>
          <Button 
            variant="outline"
            onClick={() => handlePlanSelect(plan, 'cib')}
            disabled={processingPlan === plan.id}
            className="w-full"
          >
            <Building2 className="w-4 h-4 mr-2" />
            Pay with CIB
          </Button>
        </div>
      );
    }
    
    return (
      <div className="space-y-2">
        <Button 
          onClick={() => handlePlanSelect(plan, 'bank_transfer')}
          disabled={processingPlan === plan.id}
          className={`w-full ${plan.popular ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-800 hover:bg-gray-900'}`}
        >
          <Building2 className="w-4 h-4 mr-2" />
          {processingPlan === plan.id ? "Processing..." : "Bank Transfer"}
        </Button>
        <Button 
          variant="outline"
          onClick={() => handlePlanSelect(plan, 'sepa')}
          disabled={processingPlan === plan.id}
          className="w-full"
        >
          SEPA Transfer
        </Button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading payment plans...</p>
      </div>
    );
  }

  const subscriptionPlans = plans.filter(p => p.type === 'subscription');
  const oneTimePlans = plans.filter(p => p.type === 'one_time');

  return (
    <div className="space-y-8">
      {/* Region Info Header */}
      <div className="text-center bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold flex items-center justify-center gap-2">
          <span className="text-2xl">{regionConfig.flag}</span>
          {regionConfig.name} Pricing
        </h3>
        <p className="text-sm text-gray-600 mt-1">{regionConfig.description}</p>
        <div className="flex justify-center gap-4 mt-2 text-xs text-gray-500">
          <span>Currency: {regionConfig.currency}</span>
          <span>•</span>
          <span>Payment: {regionConfig.paymentMethods.join(', ')}</span>
        </div>
      </div>

      {/* Trial/One-time Plans */}
      {oneTimePlans.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Try Before You Subscribe</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {oneTimePlans.map((plan) => (
              <Card key={plan.id} className="border-green-200">
                <CardHeader className="text-center">
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <div className="text-2xl font-bold text-green-600">
                    {formatPrice(plan.price, plan.currency)}
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{plan.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {formatFeatures(plan.features).map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                  {getPaymentButtons(plan)}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Subscription Plans */}
      {subscriptionPlans.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Monthly Subscription Plans</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {subscriptionPlans.map((plan) => (
              <Card key={plan.id} className={`relative ${plan.popular ? 'border-blue-500 border-2 shadow-lg scale-105' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-500 text-white px-4 py-1">
                      <Star className="w-3 h-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <div className="text-3xl font-bold text-blue-600">
                    {formatPrice(plan.price, plan.currency)}
                    <span className="text-sm font-normal text-gray-500">/{plan.interval}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{plan.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {formatFeatures(plan.features).map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                  {getPaymentButtons(plan)}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
