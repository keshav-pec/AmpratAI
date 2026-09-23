'use client';

import { useEffect, useRef, useState } from 'react';
import { md } from '@/lib/md';
import type { PracticeMode } from '@/lib/types';

/** What kind of answer to expect — open-ended modes say so, so a different-but-good answer does not feel wrong. */
const PREFACE: Record<PracticeMode, string> = {
  primitive: 'A reference version. Yours can differ — compare what it does, not how it is written.',
  read: 'The answer, and why.',
  spec: 'A model spec, and the things AI-written versions usually get wrong.',
  tool: 'What success looks like, and the usual snags.',
  decision: 'One well-argued answer. Others can be right too — check your reasoning against this one.',
  break: 'What happens, and why.',
};

export default function Answer({
  mode,
  title,
  answer,
}: {
  mode: PracticeMode;
  title: string;
  answer: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <>
      <button className="btn ghost sm" onClick={() => setOpen(true)}>
        Check answer
      </button>
      <dialog
        ref={ref}
        className="answer"
        onClose={() => setOpen(false)}
        onClick={(e) => {
          // a click on the backdrop (the dialog element itself) closes it
          if (e.target === ref.current) setOpen(false);
        }}
        aria-labelledby="answer-title"
      >
        <div className="answer-in">
          <div className="spread answer-head">
            <div>
              <div className="pmode">Answer</div>
              <h3 id="answer-title" style={{ margin: '2px 0 0' }}>{title}</h3>
            </div>
            <button className="icon-btn" onClick={() => setOpen(false)} aria-label="Close answer">
              close
            </button>
          </div>
          <p className="small muted" style={{ margin: '10px 0 14px' }}>{PREFACE[mode]}</p>
          <div className="answer-body" dangerouslySetInnerHTML={{ __html: md(answer) }} />
        </div>
      </dialog>
    </>
  );
}
