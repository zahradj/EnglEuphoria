import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Logo } from "@/components/Logo";
import { 
  User, 
  Target, 
  BookOpen, 
  Clock, 
  Heart, 
  CheckCircle,
  Sparkles,
  ArrowLeft,
  ArrowRight
} from "lucide-react";

interface StudentProfile {
  basicInfo: {
    name: string;
    age: number;
    nationality: string;
    nativeLanguage: string;
    currentGrade: string;
  };
  englishLevel: string;
  goals: string[];
  strengths: {
    reading: number;
    speaking: number;
    writing: number;
    listening: number;
  };
  weakAreas: string[];
  preferredStyle: string[];
  timeCommitment: string;
  interests: string[];
  specialNeeds: string;
}

const StudentApplication = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const totalSteps = 6;
  
  const [profile, setProfile] = useState<StudentProfile>({
    basicInfo: {
      name: '',
      age: 0,
      nationality: '',
      nativeLanguage: '',
      currentGrade: ''
    },
    englishLevel: '',
    goals: [],
    strengths: {
      reading: 3,
      speaking: 3,
      writing: 3,
      listening: 3
    },
    weakAreas: [],
    preferredStyle: [],
    timeCommitment: '',
    interests: [],
    specialNeeds: ''
  });

  const englishLevels = [
    { value: 'none', label: 'Complete Beginner (No English)' },
    { value: 'pre-a1', label: 'Pre-A1 (Some words)' },
    { value: 'a1', label: 'A1 (Basic phrases)' },
    { value: 'a2', label: 'A2 (Simple conversations)' },
    { value: 'b1', label: 'B1 (Intermediate)' },
    { value: 'b2', label: 'B2 (Upper Intermediate)' }
  ];

  const goalOptions = [
    'Better grades in school',
    'Communicate with friends',
    'Travel and explore',
    'Watch movies without subtitles',
    'Read English books',
    'Future career opportunities',
    'Family speaks English',
    'Just for fun!'
  ];

  const styleOptions = [
    { value: 'games', label: 'Games & Interactive Activities', icon: '🎮' },
    { value: 'stories', label: 'Stories & Reading', icon: '📖' },
    { value: 'videos', label: 'Videos & Multimedia', icon: '📺' },
    { value: 'projects', label: 'Creative Projects', icon: '🛠️' },
    { value: 'music', label: 'Songs & Music', icon: '🎵' },
    { value: 'speaking', label: 'Conversation Practice', icon: '💬' }
  ];

  const interestOptions = [
    'Animals & Nature', 'Space & Science', 'Food & Cooking', 'Sports & Fitness',
    'Art & Creativity', 'Technology', 'Music & Dance', 'Adventure & Travel',
    'Friendship & Family', 'Fantasy & Magic', 'History & Culture', 'Fashion & Style'
  ];

  const timeOptions = [
    { value: '1-lesson', label: '1 lesson per week (25 minutes)' },
    { value: '2-lessons', label: '2 lessons per week (50 minutes total)' },
    { value: '3-lessons', label: '3 lessons per week (75 minutes total)' },
    { value: 'intensive', label: 'Intensive (5+ lessons per week)' }
  ];

  const handleArrayToggle = (array: string[], value: string, setter: (arr: string[]) => void) => {
    if (array.includes(value)) {
      setter(array.filter(item => item !== value));
    } else {
      setter([...array, value]);
    }
  };

  const handleSkillChange = (skill: keyof typeof profile.strengths, value: number) => {
    setProfile(prev => ({
      ...prev,
      strengths: {
        ...prev.strengths,
        [skill]: value
      }
    }));
  };

  const generateLearningPath = async () => {
    setIsGenerating(true);
    
    try {
      localStorage.setItem('studentProfile', JSON.stringify(profile));
      
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      toast({
        title: "🎉 Your Learning Path is Ready!",
        description: "Redirecting to your personalized dashboard...",
      });
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
      
    } catch (error) {
      console.error('Error generating learning path:', error);
      toast({
        title: "Something went wrong",
        description: "Please try again or contact support.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      generateLearningPath();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progress = (currentStep / totalSteps) * 100;

  if (isGenerating) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-8 w-8 text-white animate-pulse" />
            </div>
            <CardTitle>Creating Your Learning Path...</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={66} className="mb-4" />
            <p className="text-gray-600 mb-4">
              Our AI is analyzing your profile and creating a personalized curriculum just for you!
            </p>
            <div className="space-y-2 text-sm text-gray-500">
              <div>✅ Analyzing your strengths and goals</div>
              <div>✅ Selecting perfect learning materials</div>
              <div className="animate-pulse">🔄 Building your weekly lessons...</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex flex-col bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50">
      {/* Simple Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b py-4 px-6">
        <div className="container mx-auto flex items-center justify-between">
          <Logo />
          <Button variant="ghost" onClick={() => navigate('/login')}>
            Back to Login
          </Button>
        </div>
      </header>
      
      <main className="flex-1 py-8 px-4">
        <div className="container mx-auto max-w-2xl">
          {/* Progress Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <Badge variant="secondary" className="text-sm">
                Step {currentStep} of {totalSteps}
              </Badge>
              <div className="text-sm text-gray-600">
                {Math.round(progress)}% Complete
              </div>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {currentStep === 1 && <User className="h-5 w-5" />}
                {currentStep === 2 && <BookOpen className="h-5 w-5" />}
                {currentStep === 3 && <Target className="h-5 w-5" />}
                {currentStep === 4 && <CheckCircle className="h-5 w-5" />}
                {currentStep === 5 && <Heart className="h-5 w-5" />}
                {currentStep === 6 && <Clock className="h-5 w-5" />}
                
                {currentStep === 1 && "Tell us about yourself! 👋"}
                {currentStep === 2 && "What's your English level? 📚"}
                {currentStep === 3 && "What are your goals? 🎯"}
                {currentStep === 4 && "Rate your current skills 💪"}
                {currentStep === 5 && "What do you love? ❤️"}
                {currentStep === 6 && "Let's plan your schedule! ⏰"}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Step 1: Basic Info */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">What's your name? *</Label>
                    <Input
                      id="name"
                      value={profile.basicInfo.name}
                      onChange={(e) => setProfile(prev => ({
                        ...prev,
                        basicInfo: { ...prev.basicInfo, name: e.target.value }
                      }))}
                      placeholder="Enter your full name"
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="age">How old are you? *</Label>
                      <Input
                        id="age"
                        type="number"
                        min="4"
                        max="18"
                        value={profile.basicInfo.age || ''}
                        onChange={(e) => setProfile(prev => ({
                          ...prev,
                          basicInfo: { ...prev.basicInfo, age: parseInt(e.target.value) || 0 }
                        }))}
                        placeholder="Age"
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="grade">What grade are you in?</Label>
                      <Input
                        id="grade"
                        value={profile.basicInfo.currentGrade}
                        onChange={(e) => setProfile(prev => ({
                          ...prev,
                          basicInfo: { ...prev.basicInfo, currentGrade: e.target.value }
                        }))}
                        placeholder="e.g., 5th grade"
                        className="mt-1"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="nationality">What's your nationality? *</Label>
                    <Input
                      id="nationality"
                      value={profile.basicInfo.nationality}
                      onChange={(e) => setProfile(prev => ({
                        ...prev,
                        basicInfo: { ...prev.basicInfo, nationality: e.target.value }
                      }))}
                      placeholder="e.g., Algerian, French, American..."
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="native">What's your native language? *</Label>
                    <Input
                      id="native"
                      value={profile.basicInfo.nativeLanguage}
                      onChange={(e) => setProfile(prev => ({
                        ...prev,
                        basicInfo: { ...prev.basicInfo, nativeLanguage: e.target.value }
                      }))}
                      placeholder="e.g., Spanish, Chinese, Arabic..."
                      className="mt-1"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: English Level */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Have you studied English before? Choose the level that best describes you:
                  </p>
                  
                  <div className="space-y-2">
                    {englishLevels.map((level) => (
                      <div
                        key={level.value}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          profile.englishLevel === level.value
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setProfile(prev => ({ ...prev, englishLevel: level.value }))}
                      >
                        <div className="font-medium">{level.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Goals */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Why do you want to learn English? Check all that apply:
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {goalOptions.map((goal) => (
                      <div key={goal} className="flex items-center space-x-2">
                        <Checkbox
                          id={goal}
                          checked={profile.goals.includes(goal)}
                          onCheckedChange={() => 
                            handleArrayToggle(profile.goals, goal, (goals) =>
                              setProfile(prev => ({ ...prev, goals }))
                            )
                          }
                        />
                        <Label htmlFor={goal} className="text-sm cursor-pointer">
                          {goal}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 4: Skills Assessment */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <p className="text-gray-600">
                    Rate your current English skills (1 = Beginner, 5 = Advanced):
                  </p>
                  
                  {Object.entries(profile.strengths).map(([skill, value]) => (
                    <div key={skill}>
                      <div className="flex justify-between items-center mb-2">
                        <Label className="capitalize text-base font-medium">
                          {skill === 'listening' && '👂'} 
                          {skill === 'speaking' && '🗣️'} 
                          {skill === 'reading' && '📖'} 
                          {skill === 'writing' && '✍️'} 
                          {skill}
                        </Label>
                        <Badge variant={value >= 4 ? 'default' : value >= 3 ? 'secondary' : 'outline'}>
                          {value >= 4 ? 'Strong' : value >= 3 ? 'Good' : 'Needs Work'}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <button
                            key={level}
                            type="button"
                            className={`w-12 h-8 rounded text-sm font-medium transition-colors ${
                              value >= level
                                ? 'bg-emerald-500 text-white'
                                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                            }`}
                            onClick={() => handleSkillChange(skill as keyof typeof profile.strengths, level)}
                          >
                            {level}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Step 5: Interests & Learning Style */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div>
                    <Label className="text-base font-medium mb-3 block">
                      How do you like to learn? Choose your favorites:
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                      {styleOptions.map((style) => (
                        <div
                          key={style.value}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors text-center ${
                            profile.preferredStyle.includes(style.value)
                              ? 'border-emerald-500 bg-emerald-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => 
                            handleArrayToggle(profile.preferredStyle, style.value, (styles) =>
                              setProfile(prev => ({ ...prev, preferredStyle: styles }))
                            )
                          }
                        >
                          <div className="text-2xl mb-1">{style.icon}</div>
                          <div className="text-sm font-medium">{style.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-base font-medium mb-3 block">
                      What topics interest you? (Pick 3-5)
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {interestOptions.map((interest) => (
                        <Badge
                          key={interest}
                          variant={profile.interests.includes(interest) ? "default" : "outline"}
                          className="cursor-pointer text-sm py-1.5 px-3"
                          onClick={() => 
                            handleArrayToggle(profile.interests, interest, (interests) =>
                              setProfile(prev => ({ ...prev, interests }))
                            )
                          }
                        >
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 6: Time & Schedule */}
              {currentStep === 6 && (
                <div className="space-y-6">
                  <div>
                    <Label className="text-base font-medium mb-3 block">
                      How much time can you dedicate to learning?
                    </Label>
                    <div className="space-y-2">
                      {timeOptions.map((option) => (
                        <div
                          key={option.value}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                            profile.timeCommitment === option.value
                              ? 'border-emerald-500 bg-emerald-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setProfile(prev => ({ ...prev, timeCommitment: option.value }))}
                        >
                          <div className="font-medium">{option.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="special">Any special requirements or notes? (Optional)</Label>
                    <Textarea
                      id="special"
                      value={profile.specialNeeds}
                      onChange={(e) => setProfile(prev => ({ ...prev, specialNeeds: e.target.value }))}
                      placeholder="Learning difficulties, specific focus areas, or anything else we should know..."
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                
                <Button
                  onClick={nextStep}
                  className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600"
                >
                  {currentStep === totalSteps ? (
                    <>
                      Create My Path
                      <Sparkles className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Next
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default StudentApplication;
