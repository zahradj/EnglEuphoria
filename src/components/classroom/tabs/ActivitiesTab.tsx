
import { useLanguage } from "@/contexts/LanguageContext";
import { InteractiveStory } from "@/components/interactive/InteractiveStory";

interface ActivitiesTabProps {
  storyScenes: any[];
  onStoryComplete: () => void;
  onVocabLearned: (newWords: string[]) => void;
}

export function ActivitiesTab({ 
  storyScenes, 
  onStoryComplete, 
  onVocabLearned 
}: ActivitiesTabProps) {
  const { languageText } = useLanguage();
  
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold mb-4">{languageText.interactiveStories}</h2>
      <InteractiveStory
        title="The Friendly Lion"
        scenes={storyScenes}
        initialSceneId="scene1"
        onComplete={onStoryComplete}
        onVocabLearned={onVocabLearned}
      />
    </div>
  );
}
