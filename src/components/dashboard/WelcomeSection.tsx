import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";

interface WelcomeSectionProps {
  studentName: string;
}

export function WelcomeSection({ studentName }: WelcomeSectionProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();

  const name =
    (user as any)?.full_name ||
    (user?.user_metadata as any)?.full_name ||
    studentName;

  return (
    <Card className="bg-gradient-to-r from-purple-light/70 to-teal-light/70 border-none">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              {t('sd.welcome.greeting', { name })}
            </h2>
            <p className="text-muted-foreground">
              {t('sd.welcome.subtitle')}
            </p>
          </div>

          <Button className="gap-2" onClick={() => navigate('/discover-teachers')}>
            {t('sd.welcome.joinNext')} <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
