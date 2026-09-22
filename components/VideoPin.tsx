'use client';

import { useState } from 'react';
import type { Source } from '@/lib/types';

/**
 * Videos are not hard-coded. The platform ships the search that finds the right
 * one; you pin the video that actually helped, and it stays pinned on every
 * device. This way nothing here can rot into a dead embed.
 */
export default function VideoPin({
  source,
  pinned,
  onPin,
  onClear,
}: {
  source: Source;
  pinned?: { videoId: string; start?: number; end?: number };
  onPin: (videoId: string, start?: number) => void;
  onClear: () => void;
}) {
  const [raw, setRaw] = useState('');

  if (pinned?.videoId) {
    const src = `https://www.youtube-nocookie.com/embed/${pinned.videoId}${
      pinned.start ? `?start=${pinned.start}` : ''
    }`;
    return (
      <>
        <div className="videoframe">
          <iframe
            src={src}
            title={source.label}
            allow="accelerometer; clipboard-write; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        </div>
        <div className="deck-nav noprint">
          <span className="small muted" style={{ flex: 1 }}>{source.reason}</span>
          <button className="icon-btn" onClick={onClear}>unpin</button>
        </div>
      </>
    );
  }

  const q = encodeURIComponent(
    source.channel ? `${source.query} ${source.channel}` : source.query ?? '',
  );

  return (
    <div className="deck">
      <h3 style={{ marginTop: 0 }}>{source.label}</h3>
      <p className="muted small">{source.reason}</p>
      <p>
        Search: <code>{source.query}</code>
        {source.channel && <> — prefer <b>{source.channel}</b></>}
      </p>
      <p className="row">
        <a className="btn sm" href={`https://www.youtube.com/results?search_query=${q}`}
           target="_blank" rel="noreferrer">Open the search on YouTube</a>
      </p>
      <p className="small muted">
        When you find one that actually helps, paste its link or ID below. It stays pinned
        here — on this device and any other you sign in from.
      </p>
      <div className="row">
        <input
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          placeholder="paste the YouTube link or ID"
          style={{
            flex: 1, minWidth: 200, padding: '7px 10px', borderRadius: 8,
            border: '1px solid var(--border)', background: 'var(--bg)',
            color: 'var(--text)', font: 'inherit', fontSize: '0.9rem',
          }}
        />
        <button
          className="btn sm"
          onClick={() => {
            const id = extractId(raw);
            if (id) {
              onPin(id.videoId, id.start);
              setRaw('');
            }
          }}
        >
          Pin it
        </button>
      </div>
    </div>
  );
}

export function extractId(input: string): { videoId: string; start?: number } | null {
  const s = input.trim();
  if (!s) return null;
  if (/^[\w-]{11}$/.test(s)) return { videoId: s };
  try {
    const u = new URL(s);
    const t = u.searchParams.get('t') ?? u.searchParams.get('start');
    const start = t ? parseInt(t.replace(/[^0-9]/g, ''), 10) || undefined : undefined;
    if (u.hostname.includes('youtu.be')) {
      const id = u.pathname.slice(1, 12);
      return /^[\w-]{11}$/.test(id) ? { videoId: id, start } : null;
    }
    const v = u.searchParams.get('v');
    if (v && /^[\w-]{11}$/.test(v)) return { videoId: v, start };
    const m = u.pathname.match(/\/(embed|shorts|live)\/([\w-]{11})/);
    if (m) return { videoId: m[2], start };
  } catch {
    /* not a URL */
  }
  return null;
}
