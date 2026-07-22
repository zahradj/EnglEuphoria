import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Star, Award, Clock, CheckCircle, Play, Target, Trophy } from "lucide-react";
import { toast } from "sonner";

interface SlideProps {
  isActive: boolean;
}

const TitleSlide: React.FC<SlideProps> = ({ isActive }) => (
  <div className={`flex flex-col items-center justify-center min-h-[600px] bg-gradient-to-br from-primary via-secondary to-accent text-white p-8 rounded-xl ${isActive ? 'animate-scale-in' : ''}`}>
    <div className="text-center space-y-6">
      <div className="animate-bounce-light">
        <h1 className="text-5xl font-bold mb-4">Daily Routines</h1>
        <h2 className="text-2xl font-medium opacity-90">A2 Elementary English Lesson</h2>
      </div>
      <div className="flex items-center justify-center space-x-4 mt-8">
        <Badge className="bg-white/20 text-white border-white/30 px-4 py-2">
          <Clock size={16} className="mr-2" />
          45 minutes
        </Badge>
        <Badge className="bg-white/20 text-white border-white/30 px-4 py-2">
          <Target size={16} className="mr-2" />
          A2 Level
        </Badge>
      </div>
    </div>
  </div>
);

const WarmUpSlide: React.FC<SlideProps> = ({ isActive }) => (
  <div className={`p-8 min-h-[600px] bg-gradient-to-br from-mint-100 to-mint-200 rounded-xl ${isActive ? 'animate-fade-in' : ''}`}>
    <div className="text-center mb-8">
      <h2 className="text-4xl font-bold text-primary mb-4">🌅 Warm-Up Activity</h2>
      <p className="text-xl text-muted-foreground">Let's think about your day!</p>
    </div>
    
    <Card className="p-8 glass-subtle">
      <div className="text-center space-y-6">
        <div className="text-2xl font-semibold text-primary">
          What's the first thing you do when you wake up?
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          {["☕ Drink coffee", "🚿 Take a shower", "📱 Check phone", "🥱 Stretch"].map((item, index) => (
            <Button 
              key={index}
              variant="outline" 
              className="h-20 text-lg hover:bg-primary hover:text-white transition-all duration-300"
              onClick={() => toast.success(`Great choice! ${item.split(" ")[1]}`)}
            >
              {item}
            </Button>
          ))}
        </div>
      </div>
    </Card>
  </div>
);

const ObjectivesSlide: React.FC<SlideProps> = ({ isActive }) => (
  <div className={`p-8 min-h-[600px] bg-gradient-to-br from-secondary/10 to-accent/10 rounded-xl ${isActive ? 'animate-fade-in' : ''}`}>
    <div className="text-center mb-8">
      <h2 className="text-4xl font-bold text-primary mb-4">🎯 Today's Goals</h2>
      <p className="text-xl text-muted-foreground">What we'll achieve together!</p>
    </div>
    
    <div className="grid md:grid-cols-2 gap-6">
      {[
        "📝 Learn daily routine vocabulary",
        "⏰ Use time expressions correctly",
        "🗣️ Talk about your daily schedule",
        "🎮 Practice with fun activities"
      ].map((objective, index) => (
        <Card key={index} className="p-6 glass-subtle hover:scale-105 transition-all duration-300 animate-fade-in" style={{ animationDelay: `${index * 200}ms` }}>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl">
              {index + 1}
            </div>
            <div className="text-lg font-medium">{objective}</div>
          </div>
        </Card>
      ))}
    </div>
  </div>
);

const VocabularySlide: React.FC<SlideProps> = ({ isActive }) => (
  <div className={`p-8 min-h-[600px] bg-gradient-to-br from-teacher/10 to-teacher-accent/10 rounded-xl ${isActive ? 'animate-fade-in' : ''}`}>
    <div className="text-center mb-8">
      <h2 className="text-4xl font-bold text-primary mb-4">📚 Daily Routine Vocabulary</h2>
    </div>
    
    <div className="grid md:grid-cols-3 gap-6">
      {[
        { verb: "wake up", emoji: "🌅", time: "7:00 AM" },
        { verb: "brush teeth", emoji: "🦷", time: "7:15 AM" },
        { verb: "take a shower", emoji: "🚿", time: "7:30 AM" },
        { verb: "have breakfast", emoji: "🍳", time: "8:00 AM" },
        { verb: "go to work", emoji: "🏢", time: "8:30 AM" },
        { verb: "have lunch", emoji: "🥗", time: "12:00 PM" }
      ].map((item, index) => (
        <Card 
          key={index} 
          className="p-6 text-center glass-subtle hover:scale-105 transition-all duration-300 cursor-pointer animate-fade-in"
          style={{ animationDelay: `${index * 150}ms` }}
          onClick={() => toast.success(`${item.emoji} ${item.verb} - ${item.time}`)}
        >
          <div className="text-4xl mb-4">{item.emoji}</div>
          <div className="text-xl font-semibold mb-2">{item.verb}</div>
          <Badge variant="secondary">{item.time}</Badge>
        </Card>
      ))}
    </div>
  </div>
);

const TimeExpressionsSlide: React.FC<SlideProps> = ({ isActive }) => (
  <div className={`p-8 min-h-[600px] bg-gradient-to-br from-accent/10 to-primary/10 rounded-xl ${isActive ? 'animate-fade-in' : ''}`}>
    <div className="text-center mb-8">
      <h2 className="text-4xl font-bold text-primary mb-4">⏰ Time Expressions</h2>
    </div>
    
    <div className="grid md:grid-cols-2 gap-8">
      <Card className="p-6 glass-subtle">
        <h3 className="text-2xl font-bold text-center mb-6 text-secondary">Frequency Words</h3>
        <div className="space-y-4">
          {["Always (100%)", "Usually (80%)", "Often (60%)", "Sometimes (40%)", "Never (0%)"].map((freq, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
              <span className="font-medium">{freq}</span>
              <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-1000"
                  style={{ width: `${100 - index * 20}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
      
      <Card className="p-6 glass-subtle">
        <h3 className="text-2xl font-bold text-center mb-6 text-secondary">Time of Day</h3>
        <div className="space-y-4">
          {[
            { time: "In the morning", icon: "🌅", example: "I wake up at 7 AM" },
            { time: "In the afternoon", icon: "☀️", example: "I have lunch at 1 PM" },
            { time: "In the evening", icon: "🌆", example: "I watch TV at 7 PM" },
            { time: "At night", icon: "🌙", example: "I go to bed at 10 PM" }
          ].map((item, index) => (
            <div key={index} className="p-3 bg-white/50 rounded-lg">
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-3">{item.icon}</span>
                <span className="font-semibold">{item.time}</span>
              </div>
              <div className="text-sm text-muted-foreground ml-11">{item.example}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  </div>
);

const DragDropActivity: React.FC<SlideProps> = ({ isActive }) => {
  const [droppedItems, setDroppedItems] = useState<{[key: string]: string}>({});
  const [availableWords] = useState(["wake up", "breakfast", "shower", "work", "lunch", "dinner"]);
  
  const timeSlots = [
    { time: "7:00 AM", emoji: "🌅", correct: "wake up" },
    { time: "8:00 AM", emoji: "🍳", correct: "breakfast" },
    { time: "7:30 AM", emoji: "🚿", correct: "shower" },
    { time: "9:00 AM", emoji: "🏢", correct: "work" },
    { time: "12:00 PM", emoji: "🥗", correct: "lunch" },
    { time: "7:00 PM", emoji: "🍽️", correct: "dinner" }
  ];

  const handleDrop = (timeSlot: string, word: string) => {
    setDroppedItems(prev => ({ ...prev, [timeSlot]: word }));
    const slot = timeSlots.find(s => s.time === timeSlot);
    if (slot?.correct === word) {
      toast.success("Perfect match! 🎉");
    }
  };

  return (
    <div className={`p-8 min-h-[600px] bg-gradient-to-br from-mint/10 to-mint-light rounded-xl ${isActive ? 'animate-fade-in' : ''}`}>
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-primary mb-4">🎯 Drag & Drop Activity</h2>
        <p className="text-xl text-muted-foreground">Match the activities with the correct times!</p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8">
        <Card className="p-6 glass-subtle">
          <h3 className="text-xl font-bold mb-4 text-center">Available Words</h3>
          <div className="flex flex-wrap gap-3 justify-center">
            {availableWords.map((word, index) => (
              <Button
                key={index}
                variant="outline"
                className="hover:bg-primary hover:text-white transition-all duration-300"
                onClick={() => toast.info(`Selected: ${word}. Now click a time slot!`)}
              >
                {word}
              </Button>
            ))}
          </div>
        </Card>
        
        <Card className="p-6 glass-subtle">
          <h3 className="text-xl font-bold mb-4 text-center">Time Schedule</h3>
          <div className="space-y-3">
            {timeSlots.map((slot, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary transition-all duration-300 cursor-pointer"
                onClick={() => handleDrop(slot.time, availableWords[index % availableWords.length])}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{slot.emoji}</span>
                  <span className="font-semibold">{slot.time}</span>
                </div>
                <div className="min-w-[80px] h-8 border rounded bg-white/50 flex items-center justify-center">
                  {droppedItems[slot.time] && (
                    <span className="text-sm font-medium">{droppedItems[slot.time]}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

const MatchingActivity: React.FC<SlideProps> = ({ isActive }) => {
  const [matches, setMatches] = useState<{[key: string]: boolean}>({});
  
  const pairs = [
    { activity: "brush teeth", time: "after meals", id: "teeth" },
    { activity: "take a shower", time: "in the morning", id: "shower" },
    { activity: "have dinner", time: "in the evening", id: "dinner" },
    { activity: "go to bed", time: "at night", id: "bed" }
  ];

  const handleMatch = (id: string) => {
    setMatches(prev => ({ ...prev, [id]: true }));
    toast.success("Great match! ✨");
  };

  return (
    <div className={`p-8 min-h-[600px] bg-gradient-to-br from-secondary/10 to-secondary-foreground/5 rounded-xl ${isActive ? 'animate-fade-in' : ''}`}>
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-primary mb-4">🔗 Matching Activity</h2>
        <p className="text-xl text-muted-foreground">Connect activities with their best times!</p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8">
        <Card className="p-6 glass-subtle">
          <h3 className="text-xl font-bold mb-4 text-center text-secondary">Activities</h3>
          <div className="space-y-4">
            {pairs.map((pair, index) => (
              <Button
                key={index}
                variant="outline"
                className={`w-full h-16 text-lg transition-all duration-300 ${
                  matches[pair.id] ? 'bg-green-100 border-green-500 text-green-700' : 'hover:bg-primary hover:text-white'
                }`}
                onClick={() => handleMatch(pair.id)}
                disabled={matches[pair.id]}
              >
                {matches[pair.id] && <CheckCircle className="mr-2" size={20} />}
                {pair.activity}
              </Button>
            ))}
          </div>
        </Card>
        
        <Card className="p-6 glass-subtle">
          <h3 className="text-xl font-bold mb-4 text-center text-secondary">Times</h3>
          <div className="space-y-4">
            {pairs.map((pair, index) => (
              <div
                key={index}
                className={`w-full h-16 border-2 border-dashed rounded-lg flex items-center justify-center text-lg transition-all duration-300 ${
                  matches[pair.id] ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-300 bg-white/50'
                }`}
              >
                {pair.time}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

const MultipleChoiceActivity: React.FC<SlideProps> = ({ isActive }) => {
  const [selectedAnswers, setSelectedAnswers] = useState<{[key: number]: string}>({});
  
  const questions = [
    {
      question: "I _____ my teeth after every meal.",
      options: ["brush", "wash", "clean", "scrub"],
      correct: "brush"
    },
    {
      question: "She _____ to work at 8:30 AM.",
      options: ["go", "goes", "going", "went"],
      correct: "goes"
    },
    {
      question: "We _____ dinner at 7 PM every day.",
      options: ["has", "have", "having", "had"],
      correct: "have"
    }
  ];

  const handleAnswer = (questionIndex: number, answer: string) => {
    setSelectedAnswers(prev => ({ ...prev, [questionIndex]: answer }));
    const question = questions[questionIndex];
    if (answer === question.correct) {
      toast.success("Excellent! That's correct! 🎉");
    } else {
      toast.error("Try again! Think about the subject-verb agreement.");
    }
  };

  return (
    <div className={`p-8 min-h-[600px] bg-gradient-to-br from-accent/10 to-primary/5 rounded-xl ${isActive ? 'animate-fade-in' : ''}`}>
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-primary mb-4">❓ Multiple Choice Quiz</h2>
        <p className="text-xl text-muted-foreground">Choose the best answer for each question!</p>
      </div>
      
      <div className="space-y-8">
        {questions.map((question, qIndex) => (
          <Card key={qIndex} className="p-6 glass-subtle">
            <h3 className="text-xl font-semibold mb-4">{qIndex + 1}. {question.question}</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {question.options.map((option, oIndex) => (
                <Button
                  key={oIndex}
                  variant="outline"
                  className={`h-12 text-lg transition-all duration-300 ${
                    selectedAnswers[qIndex] === option
                      ? option === question.correct
                        ? 'bg-green-100 border-green-500 text-green-700'
                        : 'bg-red-100 border-red-500 text-red-700'
                      : 'hover:bg-primary hover:text-white'
                  }`}
                  onClick={() => handleAnswer(qIndex, option)}
                >
                  {selectedAnswers[qIndex] === option && (
                    option === question.correct ? 
                    <CheckCircle className="mr-2" size={16} /> : 
                    <span className="mr-2">❌</span>
                  )}
                  {option}
                </Button>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

const SpeakingTaskSlide: React.FC<SlideProps> = ({ isActive }) => (
  <div className={`p-8 min-h-[600px] bg-gradient-to-br from-mint/20 to-mint-light rounded-xl ${isActive ? 'animate-fade-in' : ''}`}>
    <div className="text-center mb-8">
      <h2 className="text-4xl font-bold text-primary mb-4">🗣️ Speaking Practice</h2>
      <p className="text-xl text-muted-foreground">Practice talking about daily routines!</p>
    </div>
    
    <div className="grid md:grid-cols-2 gap-8">
      <Card className="p-6 glass-subtle">
        <h3 className="text-2xl font-bold mb-4 text-center text-secondary">Role Play Scenario</h3>
        <div className="bg-primary/10 p-4 rounded-lg mb-4">
          <p className="text-lg">🎭 <strong>Situation:</strong> You're talking to a new friend about your daily routine.</p>
        </div>
        <div className="space-y-3">
          <div className="p-3 bg-white/50 rounded-lg">
            <strong>Student A:</strong> Ask about their morning routine
          </div>
          <div className="p-3 bg-white/50 rounded-lg">
            <strong>Student B:</strong> Describe your morning activities with times
          </div>
          <div className="p-3 bg-white/50 rounded-lg">
            <strong>Both:</strong> Compare your routines and find similarities
          </div>
        </div>
      </Card>
      
      <Card className="p-6 glass-subtle">
        <h3 className="text-2xl font-bold mb-4 text-center text-secondary">Useful Phrases</h3>
        <div className="space-y-3">
          {[
            "What time do you usually...?",
            "I always/usually/sometimes...",
            "After that, I...",
            "Then I...",
            "Finally, I...",
            "How about you?"
          ].map((phrase, index) => (
            <div key={index} className="p-3 bg-primary/10 rounded-lg text-center">
              <span className="font-medium">"{phrase}"</span>
            </div>
          ))}
        </div>
        <Button 
          className="w-full mt-6" 
          size="lg"
          onClick={() => toast.success("Great speaking practice! Keep it up! 🎤")}
        >
          <Play className="mr-2" size={20} />
          Start Speaking Practice
        </Button>
      </Card>
    </div>
  </div>
);

const RewardSlide: React.FC<SlideProps> = ({ isActive }) => (
  <div className={`flex flex-col items-center justify-center min-h-[600px] bg-gradient-to-br from-yellow-100 via-orange-100 to-pink-100 text-center p-8 rounded-xl ${isActive ? 'animate-scale-in' : ''}`}>
    <div className="space-y-6">
      <div className="animate-bounce-light">
        <Trophy className="w-24 h-24 text-yellow-500 mx-auto mb-4" />
        <h1 className="text-5xl font-bold text-primary mb-4">You Did It!</h1>
        <h2 className="text-2xl font-medium text-secondary">Congratulations! 🎉</h2>
      </div>
      
      <div className="flex justify-center space-x-4 mt-8">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star key={star} className="w-12 h-12 text-yellow-400 fill-current animate-pulse" style={{ animationDelay: `${star * 200}ms` }} />
        ))}
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        <Badge className="bg-green-100 text-green-800 border-green-300 p-4">
          <Award className="mr-2" size={16} />
          Vocabulary Master
        </Badge>
        <Badge className="bg-blue-100 text-blue-800 border-blue-300 p-4">
          <Clock className="mr-2" size={16} />
          Time Expert
        </Badge>
        <Badge className="bg-purple-100 text-purple-800 border-purple-300 p-4">
          <CheckCircle className="mr-2" size={16} />
          Activity Champion
        </Badge>
        <Badge className="bg-pink-100 text-pink-800 border-pink-300 p-4">
          <Play className="mr-2" size={16} />
          Speaking Star
        </Badge>
      </div>
      
      <p className="text-xl text-muted-foreground mt-6">
        You've mastered daily routines vocabulary and time expressions! 
        Keep practicing and you'll become even more fluent! 🌟
      </p>
    </div>
  </div>
);

export function DailyRoutinesSlides() {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const slides = [
    { component: TitleSlide, title: "Title" },
    { component: WarmUpSlide, title: "Warm-Up" },
    { component: ObjectivesSlide, title: "Objectives" },
    { component: VocabularySlide, title: "Vocabulary" },
    { component: TimeExpressionsSlide, title: "Time & Frequency" },
    { component: DragDropActivity, title: "Drag & Drop" },
    { component: MatchingActivity, title: "Matching" },
    { component: MultipleChoiceActivity, title: "Multiple Choice" },
    { component: SpeakingTaskSlide, title: "Speaking Practice" },
    { component: RewardSlide, title: "Reward" }
  ];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const CurrentSlideComponent = slides[currentSlide].component;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-primary">Daily Routines - Interactive Lesson</h1>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            Slide {currentSlide + 1} of {slides.length}
          </Badge>
        </div>
        
        {/* Slide Navigation */}
        <div className="flex flex-wrap gap-2 mb-4">
          {slides.map((slide, index) => (
            <Button
              key={index}
              variant={currentSlide === index ? "default" : "outline"}
              size="sm"
              onClick={() => goToSlide(index)}
              className="transition-all duration-300"
            >
              {slide.title}
            </Button>
          ))}
        </div>
      </div>

      {/* Main Slide Content */}
      <div className="mb-6">
        <CurrentSlideComponent isActive={true} />
      </div>

      {/* Navigation Controls */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          size="lg"
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className="transition-all duration-300"
        >
          <ChevronLeft className="mr-2" size={20} />
          Previous
        </Button>
        
        <div className="flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                currentSlide === index ? 'bg-primary' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
        
        <Button
          variant="outline"
          size="lg"
          onClick={nextSlide}
          disabled={currentSlide === slides.length - 1}
          className="transition-all duration-300"
        >
          Next
          <ChevronRight className="ml-2" size={20} />
        </Button>
      </div>
    </div>
  );
}