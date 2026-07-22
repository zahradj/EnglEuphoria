
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Search, Star, User, Camera, Video, Mic, MessageCircle } from "lucide-react";

export interface ClassroomStudent {
  id: string;
  name: string;
  avatarUrl?: string;
  points: number;
  status: "online" | "offline" | "idle";
  handRaised: boolean;
  micEnabled: boolean;
  cameraEnabled: boolean;
  lastActive?: string;
  progress: {
    vocabulary: number;
    grammar: number;
    listening: number;
    speaking: number;
    reading: number;
  };
}

interface ClassroomStudentsProps {
  students: ClassroomStudent[];
  onMessageStudent?: (studentId: string) => void;
  onToggleSpotlight?: (studentId: string) => void;
  className?: string;
}

export function ClassroomStudents({
  students,
  onMessageStudent,
  onToggleSpotlight,
  className = "",
}: ClassroomStudentsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { languageText } = useLanguage();

  // Filter students based on search query
  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle>{languageText.studentsInClass}</CardTitle>
          <span className="text-sm text-muted-foreground">
            {students.filter(s => s.status === "online").length}/{students.length} {languageText.online}
          </span>
        </div>
        
        <div className="mt-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={languageText.searchStudents}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-1">
          {filteredStudents.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>{languageText.noStudentsFound}</p>
            </div>
          ) : (
            filteredStudents.map(student => (
              <div 
                key={student.id}
                className={`flex items-center p-2 rounded-md hover:bg-muted/50 ${
                  student.handRaised ? "bg-yellow-50" : ""
                }`}
              >
                {/* Avatar and status */}
                <div className="relative mr-3">
                  {student.avatarUrl ? (
                    <img 
                      src={student.avatarUrl} 
                      alt={student.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <span className="font-semibold text-muted-foreground">
                        {student.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  
                  <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                    student.status === "online" ? "bg-green-500" : 
                    student.status === "idle" ? "bg-yellow-500" : "bg-gray-400"
                  }`} />
                </div>
                
                {/* Student info */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium truncate">{student.name}</h4>
                    <div className="flex items-center gap-1 text-xs font-medium text-yellow-dark">
                      <Star className="h-3 w-3" />
                      {student.points}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                    {student.micEnabled ? (
                      <Mic className="h-3 w-3" />
                    ) : (
                      <Mic className="h-3 w-3 text-gray-400 line-through opacity-50" />
                    )}
                    
                    {student.cameraEnabled ? (
                      <Camera className="h-3 w-3" />
                    ) : (
                      <Camera className="h-3 w-3 text-gray-400 line-through opacity-50" />
                    )}
                    
                    {student.handRaised && (
                      <span className="bg-yellow-200 text-yellow-800 px-1.5 rounded-sm">
                        ✋ {languageText.handRaised}
                      </span>
                    )}
                    
                    {student.status !== "online" && student.lastActive && (
                      <span className="ml-auto">
                        {languageText.lastActive}: {student.lastActive}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Actions */}
                <div className="ml-2 flex items-center">
                  {onMessageStudent && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={() => onMessageStudent(student.id)}
                      title={`${languageText.message} ${student.name}`}
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {onToggleSpotlight && student.status === "online" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={() => onToggleSpotlight(student.id)}
                      title={`${languageText.spotlight} ${student.name}`}
                    >
                      <Video className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
