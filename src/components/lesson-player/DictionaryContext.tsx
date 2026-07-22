import React, { createContext, useCallback, useContext, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { DictionaryPopover } from './DictionaryPopover';

interface DictEntry {
  word: string;
  definition?: string;
  translation?: string;
  image_url?: string | null;
  loading: boolean;
  error?: string;
}

interface DictCtx {
  open: (args: { word: string; context: string; rect: DOMRect; hub?: string }) => void;
}

const Ctx = createContext<DictCtx | null>(null);

export const useDictionary = () => useContext(Ctx);

export const DictionaryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { language } = useLanguage();
  const [entry, setEntry] = useState<DictEntry | null>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [hub, setHub] = useState<string>('academy');

  const open = useCallback(async (args: { word: string; context: string; rect: DOMRect; hub?: string }) => {
    const word = args.word.trim().replace(/[^\p{L}\p{N}'-]/gu, '');
    if (!word) return;
    setRect(args.rect);
    setHub(args.hub || 'academy');
    setEntry({ word, loading: true });
    try {
      const { data, error } = await supabase.functions.invoke('fetch-dictionary-definition', {
        body: { word, context: args.context, language, hub: args.hub || 'academy' },
      });
      if (error) throw error;
      setEntry({
        word,
        loading: false,
        definition: (data as any)?.definition,
        translation: (data as any)?.translation,
        image_url: (data as any)?.image_url ?? null,
      });
    } catch (e: any) {
      setEntry({ word, loading: false, error: e?.message || 'Lookup failed' });
    }
  }, [language]);

  return (
    <Ctx.Provider value={{ open }}>
      {children}
      <DictionaryPopover
        entry={entry}
        rect={rect}
        hub={hub}
        onClose={() => { setEntry(null); setRect(null); }}
      />
    </Ctx.Provider>
  );
};
