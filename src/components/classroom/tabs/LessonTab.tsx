
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import { QuizContainer } from "@/components/assessment/QuizContainer";
import { PlayCircle, MessageCircle, Book, Download, FileText, List } from "lucide-react";

interface LessonTabProps {
  quizQuestions: any[];
  onQuizComplete: (score: number, total: number) => void;
}

export function LessonTab({ quizQuestions, onQuizComplete }: LessonTabProps) {
  const { languageText } = useLanguage();
  const [lessonTab, setLessonTab] = useState("video");

  return (
    <div className="space-y-4">
      <Tabs value={lessonTab} onValueChange={setLessonTab} className="w-full">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="video">
            <PlayCircle className="mr-2 h-4 w-4" />
            Video Lesson
          </TabsTrigger>
          <TabsTrigger value="practice">
            <List className="mr-2 h-4 w-4" />
            Practice
          </TabsTrigger>
          <TabsTrigger value="resources">
            <FileText className="mr-2 h-4 w-4" />
            Resources
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="video" className="pt-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <h2 className="text-lg font-bold mb-2">Animal Sounds</h2>
              <div className="aspect-video bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                <div className="text-center">
                  <PlayCircle className="mx-auto h-12 w-12 text-muted-foreground/60 mb-2" />
                  <p className="text-muted-foreground">{languageText.clickToPlayVideo}</p>
                  <Button className="mt-2">{languageText.play}</Button>
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-4 mt-4">
                <Button variant="outline" className="flex items-center gap-2">
                  <MessageCircle size={16} />
                  {languageText.chat}
                </Button>
                <Button className="flex items-center gap-2">
                  <Book size={16} />
                  {languageText.resources}
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="practice" className="pt-4">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{languageText.animalSoundsQuiz}</CardTitle>
                <CardDescription>{languageText.matchAnimalsWithSounds}</CardDescription>
              </CardHeader>
              <CardContent>
                <QuizContainer 
                  title={languageText.animalSoundsQuiz} 
                  description={languageText.matchAnimalsWithSounds}
                  questions={quizQuestions}
                  onComplete={onQuizComplete}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="resources" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Lesson Resources</CardTitle>
              <CardDescription>Download materials for this lesson</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li>
                  <Button variant="ghost" size="sm" className="h-auto p-0 text-sm hover:no-underline flex items-center">
                    <Download className="mr-2 h-4 w-4" />
                    Animal Vocabulary.pdf
                  </Button>
                </li>
                <li>
                  <Button variant="ghost" size="sm" className="h-auto p-0 text-sm hover:no-underline flex items-center">
                    <Download className="mr-2 h-4 w-4" />
                    Animal Sounds.mp3
                  </Button>
                </li>
                <li>
                  <Button variant="ghost" size="sm" className="h-auto p-0 text-sm hover:no-underline flex items-center">
                    <Download className="mr-2 h-4 w-4" />
                    Homework Assignment.docx
                  </Button>
                </li>
                <li>
                  <Button variant="ghost" size="sm" className="h-auto p-0 text-sm hover:no-underline flex items-center">
                    <Download className="mr-2 h-4 w-4" />
                    Animal Flashcards.zip
                  </Button>
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
