import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  ChevronLeft, 
  ChevronRight, 
  Volume2, 
  Clock, 
  Trophy,
  BookOpen,
  Star,
  RotateCcw
} from 'lucide-react';

interface Question {
  id: number;
  type: 'multiple-choice' | 'audio' | 'image-choice' | 'fill-blank';
  question: string;
  options: string[];
  correctAnswer: number;
  image?: string;
  audio?: string;
  level: 'beginner' | 'elementary' | 'intermediate';
  points: number;
}

interface TestResult {
  score: number;
  totalPoints: number;
  level: string;
  cefrLevel: string;
  recommendations: string[];
}

const questions: Question[] = [
  {
    id: 1,
    type: 'image-choice',
    question: 'What color is this banana?',
    options: ['This is blue', 'This is yellow', 'This is red'],
    correctAnswer: 1,
    image: '🍌',
    level: 'beginner',
    points: 1
  },
  {
    id: 2,
    type: 'multiple-choice',
    question: 'How do you greet someone in the morning?',
    options: ['Good night', 'Good morning', 'Good evening', 'Goodbye'],
    correctAnswer: 1,
    level: 'beginner',
    points: 1
  },
  {
    id: 3,
    type: 'image-choice',
    question: 'What are these animals?',
    options: ['These are cats', 'These are dogs', 'These are birds'],
    correctAnswer: 2,
    image: '🐦🐦🐦',
    level: 'beginner',
    points: 1
  },
  {
    id: 4,
    type: 'multiple-choice',
    question: 'What is the opposite of "big"?',
    options: ['Large', 'Small', 'Huge', 'Giant'],
    correctAnswer: 1,
    level: 'beginner',
    points: 1
  },
  {
    id: 5,
    type: 'fill-blank',
    question: 'I _____ to school every day.',
    options: ['go', 'goes', 'going', 'went'],
    correctAnswer: 0,
    level: 'elementary',
    points: 2
  },
  {
    id: 6,
    type: 'multiple-choice',
    question: 'Which sentence is correct?',
    options: [
      'She have a red car',
      'She has a red car',
      'She having a red car',
      'She is have a red car'
    ],
    correctAnswer: 1,
    level: 'elementary',
    points: 2
  },
  {
    id: 7,
    type: 'multiple-choice',
    question: 'Yesterday, I _____ to the park.',
    options: ['go', 'goes', 'went', 'going'],
    correctAnswer: 2,
    level: 'elementary',
    points: 2
  },
  {
    id: 8,
    type: 'multiple-choice',
    question: 'If it rains tomorrow, we _____ stay inside.',
    options: ['will', 'would', 'could', 'should'],
    correctAnswer: 0,
    level: 'intermediate',
    points: 3
  },
  {
    id: 9,
    type: 'multiple-choice',
    question: 'She has been studying English _____ three years.',
    options: ['since', 'for', 'during', 'while'],
    correctAnswer: 1,
    level: 'intermediate',
    points: 3
  },
  {
    id: 10,
    type: 'multiple-choice',
    question: 'Which word best completes this sentence: "The book _____ I read yesterday was amazing."',
    options: ['what', 'which', 'who', 'where'],
    correctAnswer: 1,
    level: 'intermediate',
    points: 3
  }
];

interface PlacementTestLibraryProps {
  onTestComplete?: (result: TestResult) => void;
}

export function PlacementTestLibrary({ onTestComplete }: PlacementTestLibraryProps) {
  const { toast } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>(new Array(questions.length).fill(-1));
  const [selectedAnswer, setSelectedAnswer] = useState<number>(-1);
  const [testStarted, setTestStarted] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [result, setResult] = useState<TestResult | null>(null);

  // Timer
  useEffect(() => {
    if (testStarted && !testCompleted) {
      const timer = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [testStarted, testCompleted]);

  // Load saved answer for current question
  useEffect(() => {
    setSelectedAnswer(answers[currentQuestion]);
  }, [currentQuestion, answers]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startTest = () => {
    setTestStarted(true);
    toast({
      title: "Test Started!",
      description: "Take your time and do your best. Good luck!",
    });
  };

  const saveAnswer = (answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);
    setSelectedAnswer(answerIndex);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      completeTest();
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateResult = (): TestResult => {
    let score = 0;
    let totalPoints = 0;

    questions.forEach((question, index) => {
      totalPoints += question.points;
      if (answers[index] === question.correctAnswer) {
        score += question.points;
      }
    });

    const percentage = (score / totalPoints) * 100;
    
    let level = '';
    let cefrLevel = '';
    let recommendations: string[] = [];

    if (percentage >= 80) {
      level = 'Intermediate';
      cefrLevel = 'B1-B2';
      recommendations = [
        'You have a strong foundation in English!',
        'Focus on advanced grammar and complex sentence structures',
        'Practice reading advanced texts and literature',
        'Work on academic writing skills'
      ];
    } else if (percentage >= 60) {
      level = 'Elementary';
      cefrLevel = 'A2';
      recommendations = [
        'You have good basic English skills!',
        'Continue practicing verb tenses and sentence formation',
        'Expand your vocabulary with everyday topics',
        'Practice speaking and listening more frequently'
      ];
    } else {
      level = 'Beginner';
      cefrLevel = 'A1';
      recommendations = [
        'You are starting your English journey!',
        'Focus on basic vocabulary and simple sentences',
        'Practice common greetings and everyday phrases',
        'Use visual aids and flashcards for vocabulary building'
      ];
    }

    return {
      score,
      totalPoints,
      level,
      cefrLevel,
      recommendations
    };
  };

  const completeTest = () => {
    const testResult = calculateResult();
    setResult(testResult);
    setTestCompleted(true);
    
    toast({
      title: "Test Completed!",
      description: `Your level: ${testResult.level} (${testResult.cefrLevel})`,
    });

    if (onTestComplete) {
      onTestComplete(testResult);
    }
  };

  const restartTest = () => {
    setCurrentQuestion(0);
    setAnswers(new Array(questions.length).fill(-1));
    setSelectedAnswer(-1);
    setTestStarted(false);
    setTestCompleted(false);
    setTimeElapsed(0);
    setResult(null);
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const answeredQuestions = answers.filter(answer => answer !== -1).length;

  if (!testStarted) {
    return (
      <div className="h-full overflow-y-auto p-4">
        <Card className="max-w-2xl mx-auto shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              English Placement Test
            </CardTitle>
            <p className="text-muted-foreground">
              Discover your English level with our comprehensive assessment
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">Duration</p>
                  <p className="text-sm text-blue-700">Approximately 10-15 minutes</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
                <Trophy className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="font-medium text-purple-900">Questions</p>
                  <p className="text-sm text-purple-700">{questions.length} questions covering different skills</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                <Star className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">Assessment</p>
                  <p className="text-sm text-green-700">Get personalized recommendations</p>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
              <h4 className="font-medium text-yellow-800 mb-2">Instructions:</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Choose the best answer for each question</li>
                <li>• You can go back and change your answers</li>
                <li>• Take your time - there&apos;s no time limit</li>
                <li>• Some questions may include images or audio</li>
              </ul>
            </div>

            <Button 
              onClick={startTest}
              size="lg"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              Start Test
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (testCompleted && result) {
    return (
      <div className="h-full overflow-y-auto p-4">
        <Card className="max-w-2xl mx-auto shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center">
              <Trophy className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Test Complete!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-xl font-bold text-blue-600">{result.score}/{result.totalPoints}</p>
                  <p className="text-sm text-blue-700">Score</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-xl font-bold text-purple-600">{Math.round((result.score / result.totalPoints) * 100)}%</p>
                  <p className="text-sm text-purple-700">Accuracy</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-lg font-bold text-green-600">{formatTime(timeElapsed)}</p>
                  <p className="text-sm text-green-700">Time</p>
                </div>
              </div>

              <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                <Badge className="mb-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg px-4 py-2">
                  Your Level: {result.level} ({result.cefrLevel})
                </Badge>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-center">Recommendations</h3>
              <div className="space-y-3">
                {result.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-sm font-medium">{index + 1}</span>
                    </div>
                    <p className="text-gray-700">{recommendation}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={restartTest}
                className="flex-1"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Take Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const question = questions[currentQuestion];
  
  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <Badge variant="outline" className="text-sm">
              Question {currentQuestion + 1} of {questions.length}
            </Badge>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {formatTime(timeElapsed)}
              </div>
              <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                Level: {question.level}
              </Badge>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2">
            {answeredQuestions} of {questions.length} questions answered
          </p>
        </div>

        {/* Question Card */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm mb-6">
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Question */}
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-4">{question.question}</h2>
                
                {/* Image for image-choice questions */}
                {question.type === 'image-choice' && question.image && (
                  <div className="mb-6">
                    <div className="text-6xl mb-4">{question.image}</div>
                  </div>
                )}

                {/* Audio button for audio questions */}
                {question.type === 'audio' && (
                  <Button variant="outline" className="mb-6">
                    <Volume2 className="h-4 w-4 mr-2" />
                    Play Audio
                  </Button>
                )}
              </div>

              {/* Answer Options */}
              <RadioGroup
                value={selectedAnswer.toString()}
                onValueChange={(value) => saveAnswer(parseInt(value))}
                className="space-y-3"
              >
                {question.options.map((option, index) => (
                  <div
                    key={index}
                    className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all hover:bg-gray-50 cursor-pointer ${
                      selectedAnswer === index 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200'
                    }`}
                    onClick={() => saveAnswer(index)}
                  >
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                    <Label 
                      htmlFor={`option-${index}`} 
                      className="flex-1 cursor-pointer text-left"
                    >
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={previousQuestion}
            disabled={currentQuestion === 0}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          
          <span className="text-sm text-muted-foreground">
            {currentQuestion + 1} / {questions.length}
          </span>
          
          <Button
            onClick={nextQuestion}
            disabled={selectedAnswer === -1}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {currentQuestion === questions.length - 1 ? 'Finish Test' : 'Next'}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}