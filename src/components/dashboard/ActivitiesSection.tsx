
import { BookOpen, Edit, Video } from "lucide-react";
import { ActivityCard } from "./ActivityCard";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";

export function ActivitiesSection() {
  const navigate = useNavigate();
  const { languageText } = useLanguage();
  
  // Activities
  const activities = [
    {
      title: "Alphabet Songs",
      description: "Learn through music",
      icon: <BookOpen className="h-5 w-5" />,
      color: "bg-purple-light text-purple-dark",
    },
    {
      title: "Animal Vocabulary",
      description: "Learn animal names",
      icon: <Video className="h-5 w-5" />,
      color: "bg-teal-light text-teal-dark",
    },
    {
      title: "Writing Practice",
      description: "Draw and write letters",
      icon: <Edit className="h-5 w-5" />,
      color: "bg-orange-light text-orange-dark",
    },
  ];
  
  const handleStartActivity = (activityIndex: number) => {
    // For demo purposes, going to whiteboard for any activity
    navigate("/whiteboard");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">{languageText.funActivities}</h2>
        <Button variant="ghost" size="sm">
          {languageText.viewAll}
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {activities.map((activity, index) => (
          <ActivityCard
            key={index}
            icon={activity.icon}
            title={activity.title}
            description={activity.description}
            colorClass={activity.color}
            onStart={() => handleStartActivity(index)}
          />
        ))}
      </div>
    </div>
  );
}
