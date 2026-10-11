// "Hear it again": a small round gold lamp-style speaker button beside a spoken line. Shown only when a recorded clip exists for the line.
import { useContext } from 'react';
import { DeckContext } from './ctx';
import { Icon } from './Icon';

export function Hear({ who, text }: { who: string; text: string }) {
  const c = useContext(DeckContext);
  if (!c || !c.voice || !c.clipsReady || !c.canHear(who, text)) return null;
  return (
    <button type="button" className="ad-hear" aria-label="Hear it again" title="Hear it again" onClick={() => void c.speak(who, text)}>
      <Icon name="speaker" />
    </button>
  );
}
