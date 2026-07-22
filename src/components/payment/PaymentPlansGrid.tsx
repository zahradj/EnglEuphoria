import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Star, CreditCard, Sparkles, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Price } from "@/components/locale/Price";
import { useStudentLevel } from "@/hooks/useStudentLevel";
import { cn } from "@/lib/utils";

interface PaymentPlansGridProps {
  /** Optional override; defaults to current student's hub. */
  hubOverride?: AudienceLevel;
  onPlanSelect?: (planId: string, gateway: string) => void;
}

type AudienceLevel = "playground" | "academy" | "professional";

interface PackTier {
  id: string;
  name: Record<AudienceLevel, string>;
  label: string;
  sessions: number;
  price: Record<AudienceLevel, number>;
  originalPrice: Record<AudienceLevel, number>;
  savings: Record<AudienceLevel, number>;
  popular: boolean;
  isMastery: boolean;
}

// Mirrors src/components/landing/PricingSection.tsx — single source of truth for landing prices.
const PER_SESSION: Record<AudienceLevel, number> = {
  playground: 7.5,
  academy: 15,
  professional: 20,
};

const PACK_TIERS: PackTier[] = [
  {
    id: "starter-5",
    name: { playground: "Starter", academy: "Explorer", professional: "Pro Starter" },
    label: "Try it out",
    sessions: 5,
    price: { playground: 37.5, academy: 75, professional: 100 },
    originalPrice: { playground: 37.5, academy: 75, professional: 100 },
    savings: { playground: 0, academy: 0, professional: 0 },
    popular: false,
    isMastery: false,
  },
  {
    id: "popular-10",
    name: { playground: "Adventurer", academy: "Achiever", professional: "Executive" },
    label: "Most popular",
    sessions: 10,
    price: { playground: 75, academy: 150, professional: 195 },
    originalPrice: { playground: 85, academy: 165, professional: 200 },
    savings: { playground: 10, academy: 15, professional: 5 },
    popular: true,
    isMastery: false,
  },
  {
    id: "mastery-20",
    name: { playground: "Champion", academy: "Mastery", professional: "Global Leader" },
    label: "Best value",
    sessions: 20,
    price: { playground: 150, academy: 300, professional: 390 },
    originalPrice: { playground: 170, academy: 330, professional: 400 },
    savings: { playground: 20, academy: 30, professional: 10 },
    popular: false,
    isMastery: true,
  },
];

const HUB_THEME: Record<AudienceLevel, {
  label: string;
  perSessionLabel: string;
  priceText: string;
  popularBg: string;
  borderPopular: string;
  borderMastery: string;
  btnPrimary: string;
  btnPopular: string;
  btnMastery: string;
  checkIcon: string;
  clockIcon: string;
}> = {
  playground: {
    label: "Playground (30-min sessions)",
    perSessionLabel: "per 30-min session",
    priceText: "text-orange-600",
    popularBg: "from-amber-500 to-orange-600",
    borderPopular: "border-orange-300",
    borderMastery: "border-amber-400",
    btnPrimary: "bg-orange-500 hover:bg-orange-600 text-white",
    btnPopular: "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white",
    btnMastery: "bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white",
    checkIcon: "text-orange-500",
    clockIcon: "text-orange-500",
  },
  academy: {
    label: "Academy Hub (60-min sessions)",
    perSessionLabel: "per 60-min session",
    priceText: "text-purple-700",
    popularBg: "from-indigo-500 to-purple-600",
    borderPopular: "border-purple-300",
    borderMastery: "border-indigo-400",
    btnPrimary: "bg-purple-600 hover:bg-purple-700 text-white",
    btnPopular: "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white",
    btnMastery: "bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white",
    checkIcon: "text-purple-600",
    clockIcon: "text-purple-600",
  },
  professional: {
    label: "Success Hub (60-min sessions)",
    perSessionLabel: "per 60-min session",
    priceText: "text-emerald-700",
    popularBg: "from-emerald-500 to-teal-600",
    borderPopular: "border-emerald-300",
    borderMastery: "border-emerald-500",
    btnPrimary: "bg-emerald-600 hover:bg-emerald-700 text-white",
    btnPopular: "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white",
    btnMastery: "bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white",
    checkIcon: "text-emerald-600",
    clockIcon: "text-emerald-600",
  },
};

export const PaymentPlansGrid: React.FC<PaymentPlansGridProps> = ({ hubOverride, onPlanSelect }) => {
  const { studentLevel } = useStudentLevel();
  const hub: AudienceLevel = hubOverride ?? (studentLevel as AudienceLevel) ?? "academy";
  const theme = HUB_THEME[hub];
  const perSession = PER_SESSION[hub];
  const { toast } = useToast();
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);

  const handleSelect = async (pack: PackTier) => {
    setProcessingPlan(pack.id);
    try {
      toast({
        title: "Redirecting to Payment",
        description: `Opening secure checkout for ${pack.name[hub]}...`,
      });
      onPlanSelect?.(pack.id, "stripe");
    } finally {
      setTimeout(() => setProcessingPlan(null), 800);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Lesson Packages</h3>
          <p className="text-sm text-muted-foreground">{theme.label}</p>
        </div>
        <p className="text-sm text-muted-foreground">
          Base rate{" "}
          <span className={cn("font-semibold", theme.priceText)}>
            <Price usd={perSession} showUsdHint />
          </span>{" "}
          {theme.perSessionLabel}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {PACK_TIERS.map((pack) => {
          const price = pack.price[hub];
          const original = pack.originalPrice[hub];
          const savings = pack.savings[hub];
          const hasDiscount = savings > 0;
          const isProcessing = processingPlan === pack.id;

          return (
            <Card
              key={pack.id}
              className={cn(
                "relative flex flex-col",
                pack.popular && `border-2 ${theme.borderPopular} shadow-lg`,
                pack.isMastery && `border-2 ${theme.borderMastery} shadow-xl scale-[1.02]`
              )}
            >
              {pack.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className={cn("text-white px-3 py-1 bg-gradient-to-r", theme.popularBg)}>
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              {pack.isMastery && (
                <div className="absolute -top-3 right-3">
                  <Badge className="bg-amber-500 text-white px-3 py-1">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Best Value
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-3">
                <CardTitle className="text-lg">{pack.name[hub]}</CardTitle>
                <p className="text-xs text-muted-foreground">{pack.label}</p>

                <div className="mt-3 flex items-center justify-center gap-2">
                  <Clock className={cn("h-4 w-4", theme.clockIcon)} />
                  <span className="text-sm font-medium text-gray-600">
                    {pack.sessions} sessions
                  </span>
                </div>

                <div className="mt-3 flex items-baseline justify-center gap-2">
                  <span className={cn("text-3xl font-extrabold", theme.priceText)}>
                    <Price usd={price} showUsdHint />
                  </span>
                  {hasDiscount && (
                    <span className="line-through text-base text-muted-foreground">
                      <Price usd={original} />
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  <Price usd={price / pack.sessions} /> {theme.perSessionLabel}
                </p>
                {hasDiscount && (
                  <p className="text-xs font-semibold text-emerald-600 mt-1">
                    Save <Price usd={savings} />
                  </p>
                )}
              </CardHeader>

              <CardContent className="flex-1 flex flex-col space-y-4">
                <ul className="space-y-2 flex-1">
                  {[
                    "1-on-1 with verified teacher",
                    "Personalized lesson plan",
                    "Homework & progress tracking",
                    "Free cancellation (120h notice)",
                    "Credits valid for 6 months",
                  ].map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-gray-700">
                      <Check className={cn("w-4 h-4 flex-shrink-0 mt-0.5", theme.checkIcon)} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleSelect(pack)}
                  disabled={isProcessing}
                  className={cn(
                    "w-full",
                    pack.isMastery ? theme.btnMastery : pack.popular ? theme.btnPopular : theme.btnPrimary
                  )}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  {isProcessing ? "Processing..." : `Buy ${pack.sessions} Sessions`}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
