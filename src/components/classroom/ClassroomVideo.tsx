
import { useLanguage } from "@/contexts/LanguageContext";
import { Mic } from "lucide-react";

interface ClassroomVideoProps {
  teacher: string;
}

export function ClassroomVideo({ teacher }: ClassroomVideoProps) {
  const { languageText } = useLanguage();
  
  return (
    <div className="relative bg-gradient-to-br from-surface-2 to-surface-3 rounded-3xl aspect-video overflow-hidden shadow-2xl border border-primary-200 min-h-[350px]">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-100/20 via-transparent to-accent-100/10"></div>
      <div className="absolute top-4 right-4 w-16 h-16 rounded-full bg-primary-200/30 animate-pulse-subtle"></div>
      <div className="absolute bottom-6 left-6 w-12 h-12 rounded-full bg-accent-200/25 animate-bounce-light"></div>
      
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="h-28 w-28 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl ring-4 ring-primary-200/50 animate-float">
            <span className="text-4xl font-bold text-white">T</span>
          </div>
          <p className="font-bold text-text text-xl mb-2">{teacher}</p>
          <div className="px-3 py-1 bg-primary-100 rounded-full">
            <span className="text-sm font-medium text-primary-700">Teacher</span>
          </div>
        </div>
      </div>
      
      <div className="absolute top-4 left-4">
        <div className="bg-surface/90 backdrop-blur-sm px-4 py-2 rounded-xl border border-primary-200 shadow-lg">
          <span className="bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent font-bold text-sm">
            Live Class
          </span>
        </div>
      </div>
      
      <div className="absolute bottom-4 left-4">
        <div className="bg-surface/90 backdrop-blur-sm px-3 py-2 rounded-xl flex items-center gap-2 text-sm font-medium shadow-lg border border-success/20">
          <Mic size={16} className="text-success animate-pulse" />
          <span className="text-text">{languageText.speaking}...</span>
        </div>
      </div>

      {/* Corner decorations */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-primary-200/20 to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-accent-200/15 to-transparent"></div>
    </div>
  );
}
