'use client';

import Link from 'next/link';
import { useProgress } from '@/lib/progress';
import { mdInline } from '@/lib/md';
import type { Stage } from '@/lib/types';

export type HomeTopic = {
  id: string;
  title: string;
  outcome: string;
  moduleTitle: string;
  stage: number;
  practiceCount: number;
};

export type HomeProject = { id: string; stage: number; title: string; optional?: boolean };

const pct = (done: number, total: number) => (total ? Math.round((done / total) * 100) : 0);

export default function Home({
  stages,
  ordered,
  projects,
}: {
  stages: Stage[];
  ordered: HomeTopic[];
  projects: HomeProject[];
}) {
  const { progress, ready } = useProgress();

  const doneIds = new Set(
    Object.entries(progress.topics).filter(([, v]) => v.done).map(([k]) => k),
  );
  const topicsDone = ordered.filter((t) => doneIds.has(t.id)).length;
  const practiceTotal = ordered.reduce((n, t) => n + t.practiceCount, 0);
  const practiceDone = ordered.reduce(
    (n, t) => n + (progress.topics[t.id]?.practiceDone?.length ?? 0),
    0,
  );
  const coreProjects = projects.filter((p) => !p.optional);
  const shipped = projects.filter((p) => progress.projects[p.id]?.done).length;

  const next = ordered.find((t) => !doneIds.has(t.id));
  const last = progress.lastTopicId ? ordered.find((t) => t.id === progress.lastTopicId) : undefined;
  const current = last && !doneIds.has(last.id) ? last : next;
  const currentStage = stages.find((s) => s.n === (current?.stage ?? 1));

  const recent = ordered
    .filter((t) => progress.topics[t.id]?.lastSeen)
    .sort((a, b) => (progress.topics[b.id]?.lastSeen ?? 0) - (progress.topics[a.id]?.lastSeen ?? 0))
    .slice(0, 3);

  const overall = pct(topicsDone, ordered.length);

  return (
    <>
      <section style={{ padding: '30px 0 14px' }}>
        <h1 style={{ fontSize: '1.9rem', marginBottom: 4 }}>Full-stack AI engineer</h1>
        <p className="muted" style={{ maxWidth: 640, margin: 0 }}>
          Seven stages. No deadlines, no streaks, nothing expires — stop for exams and pick up
          exactly where you left off.
        </p>
      </section>

      <section className="dash" aria-label="Your progress" style={{ opacity: ready ? 1 : 0.4 }}>
        <div className="dash-grid">
          <div className="dash-col">
            <div className="hero">
              <div className="hero-num">{overall}%</div>
              <div>
                <div className="hero-label">of the path done</div>
                <div className="small muted">
                  {topicsDone} of {ordered.length} topics
                </div>
              </div>
            </div>

            <div className="tiles">
              <div className="tile">
                <div className="tile-label">Current stage</div>
                <div className="tile-value">Stage {currentStage?.n ?? 1}</div>
                <div className="tile-sub">{currentStage?.title}</div>
              </div>
              <div className="tile">
                <div className="tile-label">Practice done</div>
                <div className="tile-value">{practiceDone}</div>
                <div className="tile-sub">of {practiceTotal} exercises</div>
              </div>
              <div className="tile">
                <div className="tile-label">Projects shipped</div>
                <div className="tile-value">{shipped}</div>
                <div className="tile-sub">of {coreProjects.length} core projects</div>
              </div>
            </div>
            <div className="meters">
              {stages.map((s) => {
                const list = ordered.filter((t) => t.stage === s.n);
                const done = list.filter((t) => doneIds.has(t.id)).length;
                const p = pct(done, list.length);
                return (
                  <Link key={s.n} href={`/stage/${s.n}`} className="meter-row"
                        title={`Stage ${s.n}: ${done} of ${list.length} topics done`}>
                    <span className="meter-label">
                      <span className="muted">Stage {s.n}</span> {s.title}
                    </span>
                    <span className="meter" role="meter" aria-valuemin={0}
                          aria-valuemax={list.length} aria-valuenow={done}
                          aria-label={`Stage ${s.n} progress`}>
                      <i style={{ width: done ? `max(${p}%, 6px)` : 0 }} />
                    </span>
                    <span className="meter-value">{done} / {list.length}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="dash-col">
            {current && (
              <div className="continue">
                <div className="tile-label">
                  {topicsDone === 0 && !last ? 'Start here' : 'Continue'}
                </div>
                <h2 style={{ margin: '4px 0 2px', fontSize: '1.15rem' }}>{current.title}</h2>
                <div className="small muted">
                  Stage {current.stage} · {current.moduleTitle}
                </div>
                <div className="row" style={{ marginTop: 12 }}>
                  <Link className="btn" href={`/topic/${current.id}`}>
                    {topicsDone === 0 && !last ? 'Open it' : 'Carry on'}
                  </Link>
                  {next && next.id !== current.id && (
                    <Link className="btn ghost sm" href={`/topic/${next.id}`}>
                      First unfinished
                    </Link>
                  )}
                </div>
              </div>
            )}

            {recent.length > 0 && (
              <div className="recent">
                <div className="tile-label" style={{ marginBottom: 6 }}>
                  Recently opened — a quick refresher
                </div>
                <ul>
                  {recent.map((t) => (
                    <li key={t.id}>
                      <Link href={`/topic/${t.id}`}>{t.title}</Link>
                      <div className="small muted"
                           dangerouslySetInnerHTML={{ __html: mdInline(t.outcome) }} />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

      </section>

      <h2 style={{ marginTop: 34 }}>The path</h2>
      <div className="stack" style={{ paddingBottom: 60 }}>
        {stages.map((s) => (
          <Link key={s.n} href={`/stage/${s.n}`} className="card stage-card">
            <div className="small muted">Stage {s.n}</div>
            <h3 style={{ margin: '2px 0 4px' }}>{s.title}</h3>
            <p className="small muted" style={{ margin: 0 }}>{s.outcome}</p>
          </Link>
        ))}
      </div>
    </>
  );
}
