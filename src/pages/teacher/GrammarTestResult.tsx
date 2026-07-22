import React from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, ArrowRight } from "lucide-react";

const GrammarTestResult: React.FC = () => {
  const [params] = useSearchParams();
  const passed = params.get("passed") === "true";
  const score = params.get("score") ?? "0";
  const total = params.get("total") ?? "0";
  const percentage = params.get("percentage") ?? "0";
  const token = params.get("token");

  return (
    <div dir="ltr" lang="en" className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center px-4 text-left">

      <Card className="max-w-xl w-full">
        <CardContent className="p-10 text-center space-y-6">
          {passed ? (
            <>
              <CheckCircle2 className="w-20 h-20 mx-auto text-emerald-600" />
              <h1 className="text-3xl font-bold text-slate-900">You passed!</h1>
              <p className="text-slate-700">
                You scored <strong>{score}/{total}</strong> ({percentage}%). You can now choose the hub
                you want to interview for and pick a date — no waiting required.
              </p>
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-left">
                <p className="text-sm text-emerald-900">
                  <strong>Next step:</strong> Pick <em>Playground</em>, <em>Academy</em>, or
                  <em> Success</em> and lock in your interview slot. We've also sent this link to your
                  email so you can come back to it any time.
                </p>
              </div>
              {token ? (
                <Link to={`/teacher/interview/schedule/${token}`}>
                  <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                    Choose your hub & schedule interview
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              ) : (
                <p className="text-sm text-slate-500">
                  Check your inbox — we've emailed your scheduling link.
                </p>
              )}
            </>
          ) : (
            <>
              <XCircle className="w-20 h-20 mx-auto text-rose-600" />
              <h1 className="text-3xl font-bold text-slate-900">Thank you for applying</h1>
              <p className="text-slate-700">
                You scored <strong>{score}/{total}</strong> ({percentage}%). Unfortunately, you did not
                reach our 85% language-proficiency threshold, so we will not be moving forward with your
                application at this time.
              </p>
              <p className="text-sm text-slate-500">
                We encourage you to keep building your English and apply again in the future.
              </p>
              <Link to="/">
                <Button variant="outline">Back to home</Button>
              </Link>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GrammarTestResult;
