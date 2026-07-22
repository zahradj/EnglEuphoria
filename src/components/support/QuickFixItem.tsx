import React from 'react';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { LucideIcon } from 'lucide-react';

interface QuickFixItemProps {
  value: string;
  icon: LucideIcon;
  question: string;
  answer: string;
}

export const QuickFixItem: React.FC<QuickFixItemProps> = ({
  value, icon: Icon, question, answer
}) => (
  <AccordionItem value={value}>
    <AccordionTrigger className="text-sm hover:no-underline">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        {question}
      </div>
    </AccordionTrigger>
    <AccordionContent className="text-sm text-muted-foreground">
      {answer}
    </AccordionContent>
  </AccordionItem>
);
