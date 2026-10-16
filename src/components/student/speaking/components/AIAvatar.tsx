
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';

interface AIAvatarProps {
  avatar: string;
  isAiSpeaking: boolean;
}

export const AIAvatar: React.FC<AIAvatarProps> = ({ avatar, isAiSpeaking }) => {
  const { t } = useTranslation();
  return (
    <Card className="lg:col-span-1">
      <CardContent className="pt-6 text-center">
        <div className="text-8xl mb-4">{avatar}</div>
        <h3 className="font-medium">{t('st.sp.aiTeacher', 'Your AI Teacher')}</h3>
        <p className="text-sm text-gray-600">{t('st.sp.aiReady', 'Ready to help you practice!')}</p>
        {isAiSpeaking && (
          <div className="mt-4">
            <div className="flex justify-center">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
            <p className="text-xs text-blue-600 mt-2">{t('st.sp.aiSpeaking', 'Speaking...')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
