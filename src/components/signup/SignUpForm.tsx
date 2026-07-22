import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff, User, Mail, Lock, CheckCircle, BookOpen, GraduationCap } from "lucide-react";
import { ProgressIndicator } from "@/components/navigation/ProgressIndicator";
import { BackNavigation } from "@/components/navigation/BackNavigation";
import { Logo } from "@/components/Logo";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string().min(6, { message: "Please confirm your password" }),
  userType: z.enum(["teacher", "student", "admin"], { 
    required_error: "Please select a user type" 
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const SignUpForm = () => {
  const navigate = useNavigate();

  const handleRoleSelection = (role: 'teacher' | 'student') => {
    if (role === 'teacher') {
      navigate('/for-teachers');
    } else if (role === 'student') {
      navigate('/student-signup');
    }
  };
  

  return (
    <div className="w-full max-w-md mx-auto relative">
      {/* Return Home Tab */}
      <div className="absolute -top-16 left-0">
        <Button
          variant="outline"
          onClick={() => navigate('/')}
          className="bg-white/90 backdrop-blur-sm border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-800 shadow-lg hover:shadow-xl transition-all duration-300 rounded-full px-6 py-2 font-medium"
        >
          <span className="mr-2">🏠</span>
          Return Home
        </Button>
      </div>
      
      <BackNavigation to="/" label="Back to Home" className="mb-4" />
      
      <Card className="w-full p-8 shadow-2xl relative overflow-hidden bg-white/95 backdrop-blur-sm animate-fade-in rounded-3xl border-0">
        {/* Enhanced glow effects */}
        <div className="absolute -z-10 top-0 left-0 w-[90%] h-[90%] bg-gradient-to-br from-purple-300/20 to-pink-300/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -z-10 bottom-0 right-0 w-[70%] h-[70%] bg-gradient-to-tl from-blue-300/15 to-cyan-300/15 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-3xl blur-sm"></div>
      
        <div className="text-center mb-10 relative">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-yellow-300/40 to-pink-300/40 rounded-full blur-lg animate-pulse"></div>
              <Logo size="large" className="relative hover:scale-110 transition-transform duration-300" />
            </div>
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-4">
            🌟 Join EnglEuphoria! 🌟
          </h2>
          <p className="text-slate-600 text-lg font-medium">Choose your adventure and let the magic begin! ✨</p>
        </div>
        
        <div className="space-y-6">
          <Button 
            onClick={() => handleRoleSelection('student')}
            className="w-full h-20 text-left bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 border-2 border-blue-200 hover:border-blue-300 text-gray-800 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 rounded-2xl group"
            variant="outline"
          >
            <div className="flex items-center space-x-5">
              <div className="relative w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-full"></div>
                <BookOpen className="h-7 w-7 text-white relative z-10" />
              </div>
              <div className="text-left">
                <div className="font-bold text-xl text-blue-700 group-hover:text-blue-800">📚 Get Started</div>
                <div className="text-base text-slate-600 font-medium">Start your magical learning journey!</div>
              </div>
            </div>
          </Button>
        </div>
        
        <div className="mt-10 text-center bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
          <p className="text-lg text-slate-600 font-medium">
            Already part of our family? 👋{" "}
            <Button 
              variant="link" 
              className="p-0 h-auto font-bold text-xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent hover:from-purple-700 hover:to-pink-700 transition-all duration-200" 
              onClick={() => navigate('/login')}
            >
              ✨ Welcome back! ✨
            </Button>
          </p>
        </div>
      </Card>
    </div>
  );
};
