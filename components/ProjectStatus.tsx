'use client';

import { useProgress } from '@/lib/progress';

/** Lets you record that a project is under way or shipped, with its links. Feeds the dashboard. */
export default function ProjectStatus({ id }: { id: string }) {
  const { progress, update } = useProgress();
  const p = progress.projects[id] ?? {};

  const set = (patch: Partial<typeof p>) =>
    update((cur) => ({
      ...cur,
      projects: { ...cur.projects, [id]: { ...(cur.projects[id] ?? {}), ...patch } },
    }));

  const input = {
    flex: 1, minWidth: 220, padding: '7px 10px', borderRadius: 8,
    border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)',
    font: 'inherit', fontSize: '0.9rem',
  } as const;

  return (
    <div className="card" style={{ marginTop: 26 }}>
      <div className="spread">
        <b>Your status</b>
        <div className="row">
          <button className={`btn ${p.started ? '' : 'ghost'} sm`}
                  onClick={() => set({ started: !p.started })}>
            {p.started ? '✓ started' : 'Mark as started'}
          </button>
          <button className={`btn ${p.done ? '' : 'ghost'} sm`}
                  onClick={() => set({ done: !p.done, started: true })}>
            {p.done ? '✓ shipped' : 'Mark as shipped'}
          </button>
        </div>
      </div>
      <div className="row" style={{ marginTop: 12 }}>
        <input style={input} placeholder="repo URL" defaultValue={p.repoUrl ?? ''}
               onBlur={(e) => set({ repoUrl: e.target.value.trim() || undefined })} />
        <input style={input} placeholder="live demo URL" defaultValue={p.demoUrl ?? ''}
               onBlur={(e) => set({ demoUrl: e.target.value.trim() || undefined })} />
      </div>
    </div>
  );
}
