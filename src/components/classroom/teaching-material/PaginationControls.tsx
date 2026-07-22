
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPrevPage: () => void;
  onNextPage: () => void;
}

export function PaginationControls({
  currentPage,
  totalPages,
  onPrevPage,
  onNextPage
}: PaginationControlsProps) {
  const { languageText } = useLanguage();

  if (totalPages <= 1) return null;

  return (
    <div className="p-2 border-t flex items-center justify-center gap-2">
      <Button
        variant="outline"
        size="sm"
        className="h-7 text-xs"
        onClick={onPrevPage}
        disabled={currentPage <= 1}
      >
        <ChevronLeft size={14} className="mr-1" />
        {languageText.previous}
      </Button>
      
      <span className="text-xs">
        {currentPage} / {totalPages}
      </span>
      
      <Button
        variant="outline"
        size="sm"
        className="h-7 text-xs"
        onClick={onNextPage}
        disabled={currentPage >= totalPages}
      >
        {languageText.next}
        <ChevronRight size={14} className="ml-1" />
      </Button>
    </div>
  );
}
