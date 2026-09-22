'use client';

import Link from 'next/link';
import { useProgress } from '@/lib/progress';
import type { Stage, Topic } from '@/lib/types';

export default function Home({
  stages,
  ordered,
  counts,
}: {
  stages: Stage[];
  ordered: { id: string; title: string; moduleTitle: string; stage: number }[];
  counts: Record<number, { authored: number; planned: number }>;
}) {
  const { progress, ready } = useProgress();

  const doneIds = new Set(
    Object.entries(progress.topics)
      .filter(([, v]) => v.done)
      .map(([k]) => k),
  );
  const next = ordered.find((t) => !doneIds.has(t.id)) ?? ordered[ordered.length - 1];
  const last = progress.lastTopicId
    ? ordered.find((t) => t.id === progress.lastTopicId)
    : undefined;
  const doneTotal = ordered.filter((t) => doneIds.has(t.id)).length;

  return (
    <>
      <section style={{ padding: '34px 0 10px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: 6 }}>
          Full-stack AI engineer
        </h1>
        <p className="muted" style={{ maxWidth: 620 }}>
          Seven stages. No deadlines, no streaks, nothing expires. Stop for exams and pick
          up exactly where you left off.
        </p>
      </section>

      {ready && (
        <div className="card" style={{ marginBottom: 26 }}>
          {last && last.id !== next?.id ? (
            <>
              <div className="small muted">Where you left off</div>
              <h2 style={{ margin: '4px 0 2px' }}>{last.title}</h2>
              <p className="small muted" style={{ margin: 0 }}>
                Stage {last.stage} · {last.moduleTitle}
              </p>
              <div className="row" style={{ marginTop: 14 }}>
                <Link className="btn" href={`/topic/${last.id}`}>Carry on</Link>
                {next && next.id !== last.id && (
                  <Link className="btn ghost" href={`/topic/${next.id}`}>
                    Next unfinished: {next.title}
                  </Link>
                )}
              </div>
            </>
          ) : next ? (
            <>
              <div className="small muted">{doneTotal === 0 ? 'Start here' : 'Next up'}</div>
              <h2 style={{ margin: '4px 0 2px' }}>{next.title}</h2>
              <p className="small muted" style={{ margin: 0 }}>
                Stage {next.stage} · {next.moduleTitle}
              </p>
              <div className="row" style={{ marginTop: 14 }}>
                <Link className="btn" href={`/topic/${next.id}`}>Open it</Link>
              </div>
            </>
          ) : null}
          {doneTotal > 0 && (
            <p className="small muted" style={{ margin: '14px 0 0' }}>
              {doneTotal} {doneTotal === 1 ? 'topic' : 'topics'} done so far.
            </p>
          )}
        </div>
      )}

      <div className="stack" style={{ paddingBottom: 60 }}>
        {stages.map((s) => {
          const c = counts[s.n];
          const stageTopics = ordered.filter((t) => t.stage === s.n);
          const done = stageTopics.filter((t) => doneIds.has(t.id)).length;
          const pct = stageTopics.length ? Math.round((done / stageTopics.length) * 100) : 0;
          return (
            <Link key={s.n} href={`/stage/${s.n}`} className="card"
                  style={{ display: 'block', color: 'inherit', textDecoration: 'none' }}>
              <div className="spread">
                <div style={{ minWidth: 0 }}>
                  <div className="small muted">Stage {s.n}</div>
                  <h3 style={{ margin: '2px 0 4px' }}>{s.title}</h3>
                  <p className="small muted" style={{ margin: 0 }}>{s.outcome}</p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  {c.authored > 0 ? (
                    <>
                      <div className="small muted">{done} / {c.authored}</div>
                      <div className="bar" style={{ width: 90, marginTop: 5 }}>
                        <i style={{ width: `${pct}%` }} />
                      </div>
                    </>
                  ) : (
                    <span className="tag">{c.planned} topics planned</span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}

export type HomeTopic = Pick<Topic, 'id' | 'title'>;
