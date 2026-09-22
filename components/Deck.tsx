'use client';

import { useEffect, useMemo, useState } from 'react';
import { md, slides } from '@/lib/md';

export default function Deck({ notes, fullscreen }: { notes: string; fullscreen?: boolean }) {
  const pages = useMemo(() => slides(notes), [notes]);
  const [i, setI] = useState(0);
  const [seen, setSeen] = useState<Set<number>>(new Set([0]));

  useEffect(() => {
    setSeen((s) => new Set(s).add(i));
  }, [i]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const el = document.activeElement;
      if (el && ['INPUT', 'TEXTAREA'].includes(el.tagName)) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown')
        setI((n) => Math.min(n + 1, pages.length - 1));
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') setI((n) => Math.max(n - 1, 0));
    }
    if (fullscreen) {
      window.addEventListener('keydown', onKey);
      return () => window.removeEventListener('keydown', onKey);
    }
  }, [fullscreen, pages.length]);

  return (
    <>
      <div className="deck">
        <div className="deck-body" dangerouslySetInnerHTML={{ __html: md(pages[i] ?? '') }} />
      </div>
      <div className="deck-nav noprint">
        <button className="icon-btn" onClick={() => setI((n) => Math.max(n - 1, 0))}
                disabled={i === 0} aria-label="Previous slide">←</button>
        <button className="icon-btn"
                onClick={() => setI((n) => Math.min(n + 1, pages.length - 1))}
                disabled={i >= pages.length - 1} aria-label="Next slide">→</button>
        <div className="dots">
          {pages.map((_, n) => (
            <button key={n} onClick={() => setI(n)}
                    className={`dot ${n === i ? 'on' : seen.has(n) ? 'seen' : ''}`}
                    aria-label={`Slide ${n + 1}`} />
          ))}
        </div>
        <span className="small muted">{i + 1} / {pages.length}</span>
      </div>
    </>
  );
}
