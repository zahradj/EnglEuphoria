import { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PhoneticKeyboard } from './PhoneticKeyboard';
import { validateIPATranscription, formatIPA, COMMON_IPA_PATTERNS } from '@/lib/ipaUtils';
import { 
  Keyboard, 
  CheckCircle2, 
  AlertTriangle, 
  Volume2,
  Lightbulb
} from 'lucide-react';

interface IPAEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  word: string;
  currentIPA: string;
  onSave: (newIPA: string) => void;
}

export function IPAEditor({ 
  open, 
  onOpenChange, 
  word, 
  currentIPA, 
  onSave 
}: IPAEditorProps) {
  const [ipaValue, setIpaValue] = useState(currentIPA);
  const [showKeyboard, setShowKeyboard] = useState(true);
  const [validation, setValidation] = useState<{ isValid: boolean; issues: string[] }>({ 
    isValid: true, 
    issues: [] 
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const [cursorPosition, setCursorPosition] = useState(0);

  useEffect(() => {
    setIpaValue(currentIPA);
  }, [currentIPA, open]);

  useEffect(() => {
    if (ipaValue) {
      const result = validateIPATranscription(ipaValue);
      setValidation(result);
    } else {
      setValidation({ isValid: true, issues: [] });
    }
  }, [ipaValue]);

  const handleSymbolClick = (symbol: string) => {
    const input = inputRef.current;
    if (input) {
      const start = input.selectionStart || cursorPosition;
      const end = input.selectionEnd || cursorPosition;
      const newValue = ipaValue.slice(0, start) + symbol + ipaValue.slice(end);
      setIpaValue(newValue);
      
      // Update cursor position
      const newCursorPos = start + symbol.length;
      setCursorPosition(newCursorPos);
      
      // Focus and set cursor position after state update
      setTimeout(() => {
        input.focus();
        input.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIpaValue(e.target.value);
    setCursorPosition(e.target.selectionStart || 0);
  };

  const handleSave = () => {
    onSave(formatIPA(ipaValue));
    onOpenChange(false);
  };

  const suggestedIPA = COMMON_IPA_PATTERNS[word.toLowerCase()];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Edit IPA Transcription
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Word Display */}
          <div className="p-4 bg-muted/30 rounded-lg text-center">
            <div className="text-sm text-muted-foreground mb-1">Word</div>
            <div className="text-2xl font-bold">{word}</div>
            {suggestedIPA && (
              <div className="mt-2 flex items-center justify-center gap-2">
                <Lightbulb className="h-4 w-4 text-yellow-500" />
                <span className="text-sm text-muted-foreground">
                  Suggested: <span className="font-mono">{formatIPA(suggestedIPA)}</span>
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 px-2 text-xs"
                  onClick={() => setIpaValue(suggestedIPA)}
                >
                  Use
                </Button>
              </div>
            )}
          </div>

          {/* IPA Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="ipa-input">IPA Transcription</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowKeyboard(!showKeyboard)}
                className="h-7 text-xs"
              >
                <Keyboard className="h-3 w-3 mr-1" />
                {showKeyboard ? 'Hide' : 'Show'} Keyboard
              </Button>
            </div>
            
            <div className="relative">
              <Input
                id="ipa-input"
                ref={inputRef}
                value={ipaValue}
                onChange={handleInputChange}
                onSelect={(e) => setCursorPosition((e.target as HTMLInputElement).selectionStart || 0)}
                className="font-mono text-lg pr-20"
                placeholder="Enter IPA transcription"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {validation.isValid ? (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Valid
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Issues
                  </Badge>
                )}
              </div>
            </div>

            {/* Preview */}
            {ipaValue && (
              <div className="text-center p-2 bg-muted/20 rounded">
                <span className="text-sm text-muted-foreground">Preview: </span>
                <span className="font-mono text-lg">{formatIPA(ipaValue)}</span>
              </div>
            )}
          </div>

          {/* Validation Issues */}
          {validation.issues.length > 0 && (
            <Alert variant="default" className="border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <ul className="list-disc list-inside text-sm">
                  {validation.issues.map((issue, i) => (
                    <li key={i}>{issue}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Phonetic Keyboard */}
          {showKeyboard && (
            <PhoneticKeyboard 
              onSymbolClick={handleSymbolClick}
              onClose={() => setShowKeyboard(false)}
            />
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!ipaValue.trim()}>
            Save IPA
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
