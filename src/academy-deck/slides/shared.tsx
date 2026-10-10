import type { ReactNode } from 'react';
import { Icon } from '../Icon';

/** The glass panel a game sits on, over the scene plate. */
export function Panel({ title, children, wide = false }: { title?: string; children: ReactNode; wide?: boolean }) {
  return (
    <section className="ad-panel" data-wide={wide}>
      {title && <h2 className="ad-prompt">{title}</h2>}
      {children}
    </section>
  );
}

export const Feedback = ({ kind, children }: { kind: 'ok' | 'try'; children: ReactNode }) => (
  <p className={`ad-feedback ad-feedback-${kind}`} role="status">{kind === 'ok' && <Icon name="check" />} {children}</p>
);

/** Not yet — try again. Friendly wording only (Academy rule). */
export const NOT_YET = 'Not yet — look again and try once more.';
export const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
