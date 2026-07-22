
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const SignUpHeader = () => {
  const navigate = useNavigate();

  return (
    <header className="w-full bg-gradient-to-r from-purple-50 via-pink-50 to-blue-50 backdrop-blur-sm border-b border-purple-200/50 py-4 px-4 relative z-10 shadow-sm">
      <div className="container max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div 
          className="flex items-center gap-3 cursor-pointer hover:scale-105 transition-transform duration-300"
          onClick={() => navigate('/')}
        >
          <div className="relative">
            <img 
              src="/icons/icon-192.png?v=5" 
              alt="Engleuphoria Logo" 
              className="w-12 h-12 animate-bounce-slow"
            />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-pulse" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 bg-clip-text text-transparent animate-gradient">
            EnglEuphoria ✨
          </h1>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/login')}
            className="text-purple-600 hover:text-purple-700 hover:bg-purple-100/50 transition-all duration-300 font-medium"
          >
            Already have an account? 🎓
          </Button>
          
          <Button 
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 border-0"
          >
            🏠 Back to Home
          </Button>
        </div>
      </div>
    </header>
  );
};
