'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { Topic } from '@/lib/types';
import { animations as allAnimations } from '@/content/animations';
import { useProgress } from '@/lib/progress';
import { md } from '@/lib/md';
import Deck from './Deck';
import VideoPin from './VideoPin';
import AnimationView from './Animation';

type Nav = { prev?: { id: string; title: string }; next?: { id: string; title: string } };

const MODE_LABEL: Record<string, string> = {
  primitive: 'write it yourself · no AI',
  read: 'read & predict',
  spec: 'spec it, then check the AI',
  tool: 'real tool',
  decision: 'decide & defend',
  break: 'break it',
};

export default function TopicView({
  topic,
  crumb,
  nav,
}: {
  topic: Topic;
  crumb: string;
  nav: Nav;
}) {
  const anims = topic.animations
    .map((id) => allAnimations.find((a) => a.id === id))
    .filter((a): a is NonNullable<typeof a> => !!a);

  const { topic: getTopic, setTopic, ready } = useProgress();
  const tp = getTopic(topic.id);

  const [tab, setTab] = useState<'notes' | 'practice' | 'check' | 'docs' | 'ask'>('notes');
  const [srcIdx, setSrcIdx] = useState(0);
  const [animIdx, setAnimIdx] = useState(0);
  const [fs, setFs] = useState<null | 'source' | 'anim'>(null);
  const [showAnim, setShowAnim] = useState(true);

  useEffect(() => {
    if (ready) setTopic(topic.id, {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, topic.id]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setFs(null);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const source = topic.sources[srcIdx] ?? topic.sources[0];
  const anim = anims[animIdx];
  const doneCount = (tp.practiceDone ?? []).length;

  function renderSource(full = false) {
    if (!source) return null;
    if (source.kind === 'deck') return <Deck notes={topic.notes} fullscreen={full} />;
    return (
      <VideoPin
        source={source}
        pinned={tp.pinnedVideos?.[source.label]}
        onPin={(videoId, start) =>
          setTopic(topic.id, {
            pinnedVideos: { ...(tp.pinnedVideos ?? {}), [source.label]: { videoId, start } },
          })
        }
        onClear={() => {
          const next = { ...(tp.pinnedVideos ?? {}) };
          delete next[source.label];
          setTopic(topic.id, { pinnedVideos: next });
        }}
      />
    );
  }

  return (
    <>
      {fs && (
        <div className="fs">
          <div className="fs-head">
            <b>{fs === 'anim' ? anim?.title : topic.title}</b>
            <span style={{ flex: 1 }} />
            <span className="small muted">Esc to close · ← → to move</span>
            <button className="icon-btn" onClick={() => setFs(null)}>close</button>
          </div>
          <div className="fs-body">
            {fs === 'source' ? (
              renderSource(true)
            ) : anim ? (
              <div className="anim"><AnimationView anim={anim} fullscreen /></div>
            ) : null}
          </div>
        </div>
      )}

      <div className="row noprint" style={{ paddingTop: 14 }}>
        <span className="small muted">{crumb}</span>
        <span style={{ flex: 1 }} />
        <Link className="icon-btn" href={`/print/${topic.id}`}>print page</Link>
      </div>

      <h1 style={{ marginTop: 8 }}>{topic.title}</h1>
      <p className="muted" style={{ marginTop: -4 }}>{topic.outcome}</p>

      <div className={`topic ${showAnim && anims.length ? '' : 'wide'}`}>
        <div className="pane">
          <div className="stage-box">
            <div className="stage-head">
              {topic.sources.map((s, i) => (
                <button key={s.label} className={`src-btn ${i === srcIdx ? 'on' : ''}`}
                        onClick={() => setSrcIdx(i)} title={s.reason}>
                  {s.label}
                  {s.kind !== 'deck' && !tp.pinnedVideos?.[s.label] ? ' +' : ''}
                </button>
              ))}
              <span style={{ flex: 1 }} />
              {anims.length > 0 && (
                <button className="icon-btn" onClick={() => setShowAnim((v) => !v)}>
                  {showAnim ? 'hide animation' : 'show animation'}
                </button>
              )}
              <button className="icon-btn" onClick={() => setFs('source')}>fullscreen</button>
            </div>
            {renderSource()}
          </div>

          <div className="tabs noprint">
            {(
              [
                ['notes', 'Notes'],
                ['practice', `Practice${doneCount ? ` · ${doneCount}/${topic.practice.length}` : ''}`],
                ['check', 'Check yourself'],
                ['docs', 'Docs & terms'],
                ['ask', 'Ask Amprat'],
              ] as const
            ).map(([k, label]) => (
              <button key={k} className={`tab ${tab === k ? 'on' : ''}`} onClick={() => setTab(k)}>
                {label}
              </button>
            ))}
          </div>

          <div className="tabpanel">
            {tab === 'notes' && (
              <>
                <p className="small muted">
                  The same material as the slides, in one scroll. Use whichever you prefer —
                  or hit <b>print page</b> for a one-sheet summary to write on.
                </p>
                <div className="card" style={{ marginBottom: 18 }}>
                  <div className="small muted" style={{ marginBottom: 4 }}>
                    You already know this
                  </div>
                  <div dangerouslySetInnerHTML={{ __html: md(topic.analogy) }} />
                </div>
                <div dangerouslySetInnerHTML={{ __html: md(topic.notes.replace(/^\s*---\s*$/gm, '')) }} />
              </>
            )}

            {tab === 'practice' && (
              <>
                <p className="small muted">
                  Do these in your own editor. Mark one off when it works — nothing is
                  checked or graded here.
                </p>
                {topic.practice.map((p, i) => {
                  const done = (tp.practiceDone ?? []).includes(i);
                  return (
                    <div key={i} className={`pcard ${done ? 'done' : ''}`}>
                      <div className="spread">
                        <span className="pmode">{MODE_LABEL[p.mode] ?? p.mode}</span>
                        <button className="btn ghost sm"
                                onClick={() => {
                                  const cur = tp.practiceDone ?? [];
                                  setTopic(topic.id, {
                                    practiceDone: done ? cur.filter((n) => n !== i) : [...cur, i],
                                  });
                                }}>
                          {done ? 'undo' : 'done'}
                        </button>
                      </div>
                      <h3 style={{ marginTop: 6 }}>{p.title}</h3>
                      <div dangerouslySetInnerHTML={{ __html: md(p.body) }} />
                    </div>
                  );
                })}
              </>
            )}

            {tab === 'check' && (
              <>
                <p className="small muted">
                  Answer out loud first, then open it. This is for you — no score is kept.
                </p>
                {topic.check.map((c, i) => (
                  <details className="qa" key={i}>
                    <summary>{c.q}</summary>
                    <div dangerouslySetInnerHTML={{ __html: md(c.a) }} />
                  </details>
                ))}
              </>
            )}

            {tab === 'docs' && (
              <>
                <h3 style={{ marginTop: 0 }}>Read these after the slides</h3>
                <ul>
                  {topic.docs.map((d) => (
                    <li key={d.url}>
                      <a href={d.url} target="_blank" rel="noreferrer">{d.label}</a>
                    </li>
                  ))}
                </ul>
                <h3>Words used here</h3>
                <table>
                  <tbody>
                    {topic.glossary.map((g) => (
                      <tr key={g.term}>
                        <th style={{ width: '30%' }}>{g.term}</th>
                        <td>{g.def}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}

            {tab === 'ask' && <AskAmprat topic={topic} />}
          </div>
        </div>

        {showAnim && anims.length > 0 && (
          <aside className="pane noprint">
            <div className="anim">
              <div className="anim-head">
                {anims.length > 1 ? (
                  anims.map((a, i) => (
                    <button key={a.id} className={`src-btn ${i === animIdx ? 'on' : ''}`}
                            onClick={() => setAnimIdx(i)}>
                      {a.title}
                    </button>
                  ))
                ) : (
                  <span>{anim?.title}</span>
                )}
                <span style={{ flex: 1 }} />
                <button className="icon-btn" onClick={() => setFs('anim')}>⛶</button>
              </div>
              {anim && <AnimationView anim={anim} />}
            </div>
          </aside>
        )}
      </div>

      <div className="spread noprint"
           style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginBottom: 50 }}>
        <div>
          {nav.prev && (
            <Link className="btn ghost sm" href={`/topic/${nav.prev.id}`}>
              ← {nav.prev.title}
            </Link>
          )}
        </div>
        <button className="btn" onClick={() => setTopic(topic.id, { done: !tp.done })}>
          {tp.done ? '✓ done — click to undo' : 'Mark as done'}
        </button>
        <div>
          {nav.next && (
            <Link className="btn ghost sm" href={`/topic/${nav.next.id}`}>
              {nav.next.title} →
            </Link>
          )}
        </div>
      </div>
    </>
  );
}

function AskAmprat({ topic }: { topic: Topic }) {
  const [copied, setCopied] = useState(false);
  const prompt = `You are Amprat Assistant, my tutor for a full-stack AI engineer path. I come from MERN (React, Node, Express, MongoDB, MySQL). Explain in plain language, short sentences, and use analogies to what I already know.

Topic: ${topic.title}
What I'm meant to get from it: ${topic.outcome}
Terms in play: ${topic.glossary.map((g) => g.term).join(', ')}

Here are the notes I just read:
---
${topic.notes.replace(/^\s*---\s*$/gm, '').trim()}
---

Do this: ask me three questions about the above, one at a time, to find out what I have not actually understood. Do not explain anything until I answer. After each answer, tell me plainly if it was right, partly right, or wrong, and why.`;

  return (
    <>
      <p>
        AmpratAI does not run its own model — that would be a whole extra service to keep
        alive, and you already have Claude. So this builds the prompt for you, with this
        topic&apos;s notes and your background already in it.
      </p>
      <div className="row" style={{ marginBottom: 12 }}>
        <button className="btn sm"
                onClick={() => {
                  navigator.clipboard.writeText(prompt).then(() => {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1800);
                  });
                }}>
          {copied ? 'copied' : 'Copy the prompt'}
        </button>
        <a className="btn ghost sm" href="https://claude.ai/new" target="_blank" rel="noreferrer">
          Open Claude
        </a>
      </div>
      <div className="copybox">{prompt}</div>
    </>
  );
}
