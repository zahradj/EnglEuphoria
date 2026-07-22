import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Filter, MessageCircle, Calendar, BarChart3, Loader2 } from "lucide-react";
import { useTeacherStudents } from "@/hooks/useTeacherStudents";

import { format } from "date-fns";

export const StudentsTab = () => {
  const { students, loading, error } = useTeacherStudents();
  const [selectedStudent, setSelectedStudent] = useState<{
    id: string;
    name: string;
    level?: string;
  } | null>(null);

  return (
    <>
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">My Students</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading your students...</p>
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-red-600 mb-4">Error loading students: {error}</p>
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            </CardContent>
          </Card>
        ) : students.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-gray-400 mb-4">
                <Avatar className="h-16 w-16 mx-auto mb-4">
                  <AvatarFallback className="bg-gray-100 text-gray-400 text-2xl">
                    +
                  </AvatarFallback>
                </Avatar>
              </div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Students Yet</h3>
              <p className="text-gray-500 mb-6">Students who book lessons with you will appear here automatically.</p>
            </CardContent>
          </Card>
        ) : (
          students.map((student) => (
            <Card key={student.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback className="bg-teal-100 text-teal-700">
                        {student.name.split(' ').map((n: string) => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{student.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <Badge variant="outline">{student.level}</Badge>
                        <span>{student.total_lessons} lesson{student.total_lessons !== 1 ? 's' : ''}</span>
                        {student.next_lesson_date && (
                          <span>Next: {format(new Date(student.next_lesson_date), 'MMM d, h:mm a')}</span>
                        )}
                        <span>Attendance: {student.attendance_rate}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <MessageCircle className="h-4 w-4 mr-1" />
                      Message
                    </Button>
                    <Button variant="outline" size="sm">
                      <Calendar className="h-4 w-4 mr-1" />
                      Schedule
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setSelectedStudent({
                          id: student.id,
                          name: student.name,
                          level: student.level,
                        })
                      }
                    >
                      <BarChart3 className="h-4 w-4 mr-1" />
                      Progress
                    </Button>
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>Overall Progress</span>
                    <span>{student.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-teal-500 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${student.progress}%` }}
                    ></div>
                  </div>
                </div>

                {student.last_lesson_date && (
                  <div className="mt-3 text-sm text-gray-500">
                    Last lesson: {format(new Date(student.last_lesson_date), 'MMM d, yyyy')}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

    </div>
    </>
  );
};
