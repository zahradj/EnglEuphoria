
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Video, Users, Clock, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SimpleClassroomSelector = () => {
  const navigate = useNavigate();

  const availableClassrooms = [
    {
      id: "unified-classroom-1",
      title: "Enhanced ESL Classroom",
      description: "Interactive classroom with AI tools and whiteboard",
      participants: 2,
      status: "active" as const,
      features: ["AI Worksheet Generator", "Interactive Whiteboard", "Video Chat", "Reward System"]
    }
  ];

  const handleJoinClassroom = (classroomId: string, isTeacher: boolean = false) => {
    const role = isTeacher ? 'teacher' : 'student';
    const name = isTeacher ? 'Teacher' : 'Student';
    const userId = isTeacher ? 'teacher-1' : 'student-1';
    
    navigate(`/media-test?roomId=${classroomId}&role=${role}&name=${name}&userId=${userId}`);
  };

  return (
    <div className="min-h-dvh bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Choose Your Classroom</h1>
          <p className="text-gray-600">Select a classroom to join and start your learning session</p>
        </div>

        <div className="grid gap-6 md:grid-cols-1 max-w-2xl mx-auto">
          {availableClassrooms.map((classroom) => (
            <Card key={classroom.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{classroom.title}</CardTitle>
                  <Badge variant={classroom.status === 'active' ? 'default' : 'secondary'}>
                    {classroom.status}
                  </Badge>
                </div>
                <p className="text-gray-600">{classroom.description}</p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{classroom.participants} participants</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>Available now</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Features:</h4>
                  <div className="flex flex-wrap gap-1">
                    {classroom.features.map((feature, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button 
                    onClick={() => handleJoinClassroom(classroom.id, false)}
                    className="flex-1"
                  >
                    <Video className="h-4 w-4 mr-2" />
                    Join as Student
                  </Button>
                  <Button 
                    onClick={() => handleJoinClassroom(classroom.id, true)}
                    variant="outline"
                    className="flex-1"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Join as Teacher
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="text-gray-600"
          >
            <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SimpleClassroomSelector;
