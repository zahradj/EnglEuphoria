import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Star, CreditCard, Sparkles, Clock, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useStudentLevel } from "@/hooks/useStudentLevel";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface PaymentPlansGridProps {
  /** Optional override; defaults to current student's hub. */
  hubOverride?: AudienceLevel;
  /** Called after Stripe checkout redirect is initiated (not on completion —
   * the actual grant happens server-side via stripe-webhook once paid). */
  onCheckoutStarted?: (packId: string) => void;
}

type AudienceLevel = "playground" | "academy" | "professional";

interface CreditPack {
  id: string;
  name: string;
  session_count: number;
  price_eur: number;
  original_price_eur: number;
  savings_eur: number;
  sort_order: number;
}

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

export const PaymentPlansGrid: React.FC<PaymentPlansGridProps> = ({ hubOverride, onCheckoutStarted }) => {
  const { studentLevel } = useStudentLevel();
  const hub: AudienceLevel = hubOverride ?? (studentLevel as AudienceLevel) ?? "academy";
  const theme = HUB_THEME[hub];
  const { toast } = useToast();
  const [packs, setPacks] = useState<CreditPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    supabase
      .from("credit_packs")
      .select("id, name, session_count, price_eur, original_price_eur, savings_eur, sort_order")
      .eq("student_level", hub)
      .eq("is_active", true)
      .order("sort_order")
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          toast({ title: "Could not load lesson packages", description: error.message, variant: "destructive" });
        } else {
          setPacks((data ?? []).map((p) => ({
            ...p,
            price_eur: Number(p.price_eur),
            original_price_eur: Number(p.original_price_eur),
            savings_eur: Number(p.savings_eur),
          })));
        }
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [hub, toast]);

  const handleBuy = async (pack: CreditPack) => {
    setBuyingId(pack.id);
    try {
      const { data, error } = await supabase.functions.invoke("create-pack-checkout", {
        body: { packId: pack.id },
      });
      if (error || !data?.url) {
        throw new Error(error?.message || "Could not start checkout");
      }
      onCheckoutStarted?.(pack.id);
      window.location.href = data.url;
    } catch (err: any) {
      toast({
        title: "Checkout failed",
        description: err?.message ?? "Please try again in a moment.",
        variant: "destructive",
      });
      setBuyingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading lesson packages…
      </div>
    );
  }

  if (packs.length === 0) {
    return <p className="text-sm text-muted-foreground py-8 text-center">No lesson packages are available right now.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Lesson Packages</h3>
          <p className="text-sm text-muted-foreground">{theme.label}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {packs.map((pack, i) => {
          const popular = i === 1 && packs.length >= 2;
          const isMastery = i === packs.length - 1 && packs.length >= 3;
          const hasDiscount = pack.savings_eur > 0;
          const isProcessing = buyingId === pack.id;

          return (
            <Card
              key={pack.id}
              className={cn(
                "relative flex flex-col",
                popular && `border-2 ${theme.borderPopular} shadow-lg`,
                isMastery && `border-2 ${theme.borderMastery} shadow-xl scale-[1.02]`
              )}
            >
              {popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className={cn("text-white px-3 py-1 bg-gradient-to-r", theme.popularBg)}>
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              {isMastery && (
                <div className="absolute -top-3 right-3">
                  <Badge className="bg-amber-500 text-white px-3 py-1">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Best Value
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-3">
                <CardTitle className="text-lg">{pack.name}</CardTitle>

                <div className="mt-3 flex items-center justify-center gap-2">
                  <Clock className={cn("h-4 w-4", theme.clockIcon)} />
                  <span className="text-sm font-medium text-gray-600">
                    {pack.session_count} sessions
                  </span>
                </div>

                <div className="mt-3 flex items-baseline justify-center gap-2">
                  <span className={cn("text-3xl font-extrabold", theme.priceText)}>
                    €{pack.price_eur.toFixed(0)}
                  </span>
                  {hasDiscount && (
                    <span className="line-through text-base text-muted-foreground">
                      €{pack.original_price_eur.toFixed(0)}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  €{(pack.price_eur / pack.session_count).toFixed(2)} {theme.perSessionLabel}
                </p>
                {hasDiscount && (
                  <p className="text-xs font-semibold text-emerald-600 mt-1">
                    Save €{pack.savings_eur.toFixed(0)}
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
                  onClick={() => handleBuy(pack)}
                  disabled={isProcessing}
                  className={cn(
                    "w-full",
                    isMastery ? theme.btnMastery : popular ? theme.btnPopular : theme.btnPrimary
                  )}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  {isProcessing ? "Redirecting…" : `Buy ${pack.session_count} Sessions`}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
