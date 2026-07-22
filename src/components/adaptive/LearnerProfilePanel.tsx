import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { LearnerProfile } from '@/adaptive/types';

interface Props {
  profile: LearnerProfile;
}

export default function LearnerProfilePanel({ profile }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Learner Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{profile.hub}</Badge>
          <Badge>{profile.cefr_level}</Badge>
          <Badge variant="outline">Pacing: {profile.preferred_pacing}</Badge>
          <Badge variant="outline">Anxiety: {profile.anxiety_level}</Badge>
          <Badge variant="outline">Style: {profile.engagement_style}</Badge>
        </div>

        <Section title="Strengths" items={profile.strengths} variant="default" />
        <Section title="Weaknesses" items={profile.weaknesses} variant="destructive" />
        <Section
          title="Pronunciation Challenges"
          items={profile.pronunciation_challenges}
          variant="secondary"
        />
      </CardContent>
    </Card>
  );
}

function Section({
  title,
  items,
  variant,
}: {
  title: string;
  items: string[];
  variant: 'default' | 'destructive' | 'secondary';
}) {
  return (
    <div>
      <p className="mb-2 font-medium">{title}</p>
      {items.length === 0 ? (
        <p className="text-muted-foreground">None recorded.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {items.map((i) => (
            <Badge key={i} variant={variant}>
              {i}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
