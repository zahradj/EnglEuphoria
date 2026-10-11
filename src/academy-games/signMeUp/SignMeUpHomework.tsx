import { HomeworkApp } from '@/academy-deck/homework/Homework';

/** The Daily 10 homework quest for "Sign Me Up". Progress is kept on this device for now. */
export default function SignMeUpHomework(_props: { onBack?: () => void }) {
  return <HomeworkApp artBase="/academy-art" demo={false} />;
}
