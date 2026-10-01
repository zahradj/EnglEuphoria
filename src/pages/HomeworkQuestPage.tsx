import { useParams, useNavigate } from 'react-router-dom';
import HomeworkQuest from '@/components/homework-quest/HomeworkQuest';
import { getHomeworkQuest } from '@/content/homework-quests/registry';

/** /homework-quest/:questId — plays a lesson's Homework Quest. */
export default function HomeworkQuestPage() {
  const { questId } = useParams<{ questId: string }>();
  const navigate = useNavigate();
  const quest = questId ? getHomeworkQuest(questId) : null;
  if (!quest) {
    return <div className="min-h-dvh flex items-center justify-center p-6 text-center font-bold">This homework quest doesn’t exist.</div>;
  }
  return <HomeworkQuest quest={quest} onExit={() => navigate(-1)} />;
}
