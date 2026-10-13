import { useEffect, useRef } from 'react';
import { COLOR } from '../Stage';
import { Hear } from '../Hear';
import { ChatAvatar } from './teach';

/** A messaging window (speech bubbles, avatars, "Club chat" header): the conversation is read as a chat, not as lines in a frame. */
export function ChatWindow({ lines, title = 'Club chat', me = 'Ava' }: { lines: { who: string; text: string }[]; title?: string; me?: string }) {
  const bodyRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  });
  const who = [...new Set(lines.map((l) => l.who))];
  return (
    <div className="ad-chatwin" aria-live="polite">
      <header className="ad-chat-head">
        <span className="ad-chat-avatars">{who.slice(0, 3).map((w) => <ChatAvatar key={w} who={w} />)}</span>
        <span className="ad-chat-title"><b>{title}</b><i><span className="ad-online" /> {who.join(' · ')}</i></span>
      </header>
      <div className="ad-chat-body" ref={bodyRef}>
        {lines.map((l, i) => (
          <div key={i} className="ad-cm" data-me={l.who === me} data-new={i === lines.length - 1} style={{ ['--who' as string]: COLOR[l.who as keyof typeof COLOR] }}>
            <ChatAvatar who={l.who} />
            <div className="ad-cm-col">
              <span className="ad-cm-name">{l.who}</span>
              <div className="ad-cm-bubble"><span>{l.text}</span><Hear who={l.who} text={l.text} /></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
