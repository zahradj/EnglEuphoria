import React from 'react';
import { Mic, Play, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BackNavigation } from '@/components/navigation/BackNavigation';
import { NavigationBreadcrumb } from '@/components/navigation/Breadcrumb';

const SpeakingPractice = () => {
  const breadcrumbs = [
    { label: 'Dashboard', path: '/student' },
    { label: 'Speaking Practice', path: '/student/speaking-practice' }
  ];

  const practiceScenarios = [
    {
      id: 1,
      title: 'Restaurant Conversation',
      level: 'Beginner',
      duration: '5 minutes',
      description: 'Practice ordering food at a restaurant'
    },
    {
      id: 2,
      title: 'Job Interview',
      level: 'Intermediate',
      duration: '10 minutes',
      description: 'Common job interview questions and answers'
    },
    {
      id: 3,
      title: 'Travel Planning',
      level: 'Advanced',
      duration: '8 minutes',
      description: 'Discuss travel plans and make reservations'
    }
  ];

  return (
    <div className="min-h-dvh bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <BackNavigation />
        <NavigationBreadcrumb items={breadcrumbs} />
        
        <div className="flex items-center gap-3 mb-6">
          <Mic className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Speaking Practice</h1>
        </div>

        <div className="grid gap-6">
          {practiceScenarios.map((scenario) => (
            <Card key={scenario.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-6 w-6" />
                    <div>
                      <span>{scenario.title}</span>
                      <p className="text-sm text-muted-foreground font-normal">
                        {scenario.description}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-normal">{scenario.level}</div>
                    <div className="text-xs text-muted-foreground">{scenario.duration}</div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-end">
                  <Button className="flex items-center gap-2">
                    <Play className="h-4 w-4" />
                    Start Practice
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SpeakingPractice;