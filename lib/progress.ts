'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Progress, TopicProgress } from './types';
import { emptyProgress } from './types';

const KEY = 'amprat.progress.v1';

function read(): Progress {
  if (typeof window === 'undefined') return emptyProgress();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return emptyProgress();
    const p = JSON.parse(raw) as Progress;
    return { ...emptyProgress(), ...p, topics: p.topics ?? {}, projects: p.projects ?? {} };
  } catch {
    return emptyProgress();
  }
}

function write(p: Progress) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* private mode, quota — progress still works for this session */
  }
}

/**
 * Progress lives in localStorage and works with no setup at all.
 * If the server has a database configured, it also syncs so your progress
 * follows you to other devices. Sync failures are silent and harmless.
 */
export function useProgress() {
  const [progress, setProgress] = useState<Progress>(emptyProgress);
  const [ready, setReady] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const local = read();
    setProgress(local);
    setReady(true);

    // Pull whatever the server has and keep the newer of the two.
    (async () => {
      try {
        const res = await fetch('/api/progress');
        if (!res.ok) return;
        const remote = (await res.json()) as Progress | null;
        if (remote && (remote.updatedAt ?? 0) > (local.updatedAt ?? 0)) {
          setProgress({ ...emptyProgress(), ...remote });
          write(remote);
        }
      } catch {
        /* offline or no database configured — fine */
      }
    })();
  }, []);

  const push = useCallback((next: Progress) => {
    setProgress(next);
    write(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      try {
        setSyncing(true);
        await fetch('/api/progress', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(next),
        });
      } catch {
        /* ignore */
      } finally {
        setSyncing(false);
      }
    }, 900);
  }, []);

  const update = useCallback(
    (fn: (p: Progress) => Progress) => {
      setProgress((cur) => {
        const next = { ...fn(cur), updatedAt: Date.now() };
        write(next);
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(async () => {
          try {
            setSyncing(true);
            await fetch('/api/progress', {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify(next),
            });
          } catch {
            /* ignore */
          } finally {
            setSyncing(false);
          }
        }, 900);
        return next;
      });
    },
    [],
  );

  const topic = useCallback(
    (id: string): TopicProgress => progress.topics[id] ?? {},
    [progress],
  );

  const setTopic = useCallback(
    (id: string, patch: Partial<TopicProgress>) =>
      update((p) => ({
        ...p,
        lastTopicId: id,
        topics: { ...p.topics, [id]: { ...(p.topics[id] ?? {}), ...patch } },
      })),
    [update],
  );

  return { progress, ready, syncing, update, push, topic, setTopic };
}
