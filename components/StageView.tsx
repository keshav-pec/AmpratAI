'use client';

import Link from 'next/link';
import { useProgress } from '@/lib/progress';
import type { Project, Stage, Topic } from '@/lib/types';

export default function StageView({
  stage,
  topicsByModule,
  projects,
}: {
  stage: Stage;
  topicsByModule: Record<string, Pick<Topic, 'id' | 'title' | 'minutes'>[]>;
  projects: Pick<Project, 'id' | 'title' | 'size' | 'flagship' | 'optional'>[];
}) {
  const { progress } = useProgress();
  const isDone = (id: string) => !!progress.topics[id]?.done;

  return (
    <div style={{ padding: '22px 0 60px' }}>
      <Link className="small muted" href="/">← all stages</Link>
      <h1 style={{ marginTop: 10 }}>
        <span className="muted" style={{ fontWeight: 400 }}>Stage {stage.n} · </span>
        {stage.title}
      </h1>
      <p style={{ maxWidth: 680 }}>{stage.outcome}</p>
      {stage.note && <p className="small muted" style={{ maxWidth: 680 }}>{stage.note}</p>}

      {stage.opener && (
        <div className="card" style={{ marginTop: 18, borderColor: 'var(--accent-soft)' }}>
          <h3 style={{ marginTop: 0 }}>{stage.opener.title}</h3>
          <p style={{ marginBottom: 0 }}>{stage.opener.body}</p>
        </div>
      )}

      <div className="stack" style={{ marginTop: 24 }}>
        {stage.modules.map((m) => {
          const list = topicsByModule[m.id] ?? [];
          return (
            <section key={m.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '13px 16px', borderBottom: list.length ? '1px solid var(--border)' : 0 }}>
                <div className="spread">
                  <h3 style={{ margin: 0 }}>
                    <span className="muted" style={{ fontWeight: 400, fontFamily: 'var(--mono)', fontSize: '0.8rem' }}>
                      {m.id}{' '}
                    </span>
                    {m.title}
                  </h3>
                  <span className={`tag ${m.priority === 'core' ? 'core' : ''}`}>{m.priority}</span>
                </div>
                {m.note && <p className="small muted" style={{ margin: '6px 0 0' }}>{m.note}</p>}
                {m.selfCheck && (
                  <p className="small" style={{ margin: '8px 0 0', color: 'var(--accent)' }}>
                    {m.selfCheck}
                  </p>
                )}
              </div>
              {list.length > 0 ? (
                <ul className="tlist">
                  {list.map((t, i) => (
                    <li key={t.id}>
                      <Link className="tlink" href={`/topic/${t.id}`}>
                        <span className={`tick ${isDone(t.id) ? 'on' : ''}`}>✓</span>
                        <span className="n">{String(i + 1).padStart(2, '0')}</span>
                        <span className="t">{t.title}</span>
                        <span className="small muted">{t.minutes}m</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="small muted" style={{ padding: '10px 16px 14px', margin: 0 }}>
                  {m.topicCount} topics — written while you work through the stage before this
                  one, so nothing here is stale by the time you reach it.
                </p>
              )}
            </section>
          );
        })}
      </div>

      {projects.length > 0 && (
        <>
          <h2>What you build</h2>
          <div className="stack">
            {projects.map((p) => (
              <Link key={p.id} href={`/project/${p.id}`} className="card"
                    style={{ color: 'inherit', textDecoration: 'none' }}>
                <div className="spread">
                  <div>
                    <span className="small muted" style={{ fontFamily: 'var(--mono)' }}>{p.id}</span>
                    <h3 style={{ margin: '2px 0 0' }}>{p.title}</h3>
                  </div>
                  <div className="row">
                    {p.flagship && <span className="tag core">flagship</span>}
                    {p.optional && <span className="tag">optional</span>}
                    <span className="tag">{p.size}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}

      <h2>Ready to move on?</h2>
      <p className="small muted">
        A self-check, not a test. Nothing is locked — go on whenever you want and come back
        when something bites.
      </p>
      <ul>
        {stage.readiness.map((r) => <li key={r}>{r}</li>)}
      </ul>
    </div>
  );
}
