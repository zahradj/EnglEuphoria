
import { SupabaseSetup } from "@/components/setup/SupabaseSetup";
import { SignUpHeader } from "./SignUpHeader";
import { SignUpFooter } from "./SignUpFooter";
import { SignUpBackground } from "./SignUpBackground";

export const SupabaseSetupPage = () => {
  return (
    <div className="min-h-dvh flex flex-col bg-background relative overflow-hidden">
      <SignUpBackground />
      <SignUpHeader />
      
      <main className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Database Setup Required</h2>
            <p className="text-gray-600">Before you can sign up, we need to configure your database connection.</p>
          </div>
          <SupabaseSetup />
        </div>
      </main>
      
      <SignUpFooter />
    </div>
  );
};
