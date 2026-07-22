
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";

interface DictionarySearchFormProps {
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  recentSearches: string[];
  onRecentSearchClick: (word: string) => void;
}

export function DictionarySearchForm({
  searchTerm,
  onSearchTermChange,
  onSubmit,
  isLoading,
  recentSearches,
  onRecentSearchClick
}: DictionarySearchFormProps) {
  return (
    <div className="space-y-4">
      {/* Search Form */}
      <form onSubmit={onSubmit} className="flex gap-2">
        <Input
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
          placeholder="Search for a word..."
          className="text-sm"
        />
        <Button type="submit" size="sm" disabled={isLoading}>
          <Search size={14} />
        </Button>
      </form>

      {/* Recent Searches */}
      {recentSearches.length > 0 && (
        <div>
          <div className="text-xs font-medium text-gray-600 mb-2">Recent</div>
          <div className="flex flex-wrap gap-1">
            {recentSearches.slice(0, 5).map((word, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="cursor-pointer text-xs"
                onClick={() => onRecentSearchClick(word)}
              >
                {word}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
