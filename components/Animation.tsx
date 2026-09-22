'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Animation, AnimNode } from '@/lib/types';

const SHAPE: Record<AnimNode['shape'], { fill: string; stroke: string; rx: number }> = {
  doc: { fill: 'var(--surface-2)', stroke: 'var(--border)', rx: 4 },
  proc: { fill: 'var(--surface)', stroke: 'var(--accent-soft)', rx: 9 },
  db: { fill: 'var(--accent-wash)', stroke: 'var(--accent)', rx: 9 },
  model: { fill: 'var(--surface)', stroke: 'var(--info)', rx: 18 },
  note: { fill: 'none', stroke: 'transparent', rx: 0 },
  user: { fill: 'var(--surface-2)', stroke: 'var(--info)', rx: 18 },
};

const NW = 104;
const NH = 42;

function center(n: AnimNode) {
  return { x: n.at[0] + NW / 2, y: n.at[1] + NH / 2 };
}

/** Straight line between two node edges, trimmed so it stops at the boxes. */
function edgePath(a: AnimNode, b: AnimNode) {
  const c1 = center(a);
  const c2 = center(b);
  const dx = c2.x - c1.x;
  const dy = c2.y - c1.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  // distance from centre to the box edge along this direction
  const trim = (n: AnimNode) => {
    const tx = Math.abs(ux) < 1e-6 ? Infinity : NW / 2 / Math.abs(ux);
    const ty = Math.abs(uy) < 1e-6 ? Infinity : NH / 2 / Math.abs(uy);
    void n;
    return Math.min(tx, ty) + 5;
  };
  const s = trim(a);
  const e = trim(b);
  return {
    d: `M ${c1.x + ux * s} ${c1.y + uy * s} L ${c2.x - ux * e} ${c2.y - uy * e}`,
    mid: { x: (c1.x + c2.x) / 2, y: (c1.y + c2.y) / 2 },
  };
}

export default function AnimationView({
  anim,
  fullscreen = false,
}: {
  anim: Animation;
  fullscreen?: boolean;
}) {
  const [step, setStep] = useState(0);
  const [knobs, setKnobs] = useState<Record<string, number>>(() =>
    Object.fromEntries((anim.knobs ?? []).map((k) => [k.id, k.default])),
  );

  useEffect(() => {
    setStep(0);
    setKnobs(Object.fromEntries((anim.knobs ?? []).map((k) => [k.id, k.default])));
  }, [anim]);

  const scene = anim.scenes[Math.min(step, anim.scenes.length - 1)];
  const labels = useMemo(
    () => (anim.dynamicLabels ? anim.dynamicLabels(knobs) : {}),
    [anim, knobs],
  );

  const byId = useMemo(
    () => Object.fromEntries(anim.nodes.map((n) => [n.id, n])),
    [anim],
  );

  // Fit the canvas to the diagram so there is no dead space around it.
  const box = useMemo(() => {
    const xs = anim.nodes.map((n) => n.at[0]);
    const ys = anim.nodes.map((n) => n.at[1]);
    const minX = Math.min(...xs) - 10;
    const minY = Math.min(...ys) - 22;      // room for annotations above a node
    const maxX = Math.max(...xs) + NW + 10;
    const maxY = Math.max(...ys) + NH + 10;
    return `${minX} ${minY} ${maxX - minX} ${maxY - minY}`;
  }, [anim]);

  const focus = scene?.focus;
  const flowing = new Set(scene?.flow ?? []);
  const marks = Object.fromEntries((scene?.mark ?? []).map((m) => [m.on, m.tone]));
  const notes = Object.fromEntries((scene?.annotate ?? []).map((a) => [a.on, a.text]));

  function onKey(e: React.KeyboardEvent) {
    if (e.key === 'ArrowRight') setStep((s) => Math.min(s + 1, anim.scenes.length - 1));
    if (e.key === 'ArrowLeft') setStep((s) => Math.max(s - 1, 0));
  }

  return (
    <div onKeyDown={onKey} tabIndex={0} style={{ outline: 'none' }}>
      <div className="anim-stage">
        <svg viewBox={box} role="img"
             aria-label={`${anim.title}. Step ${step + 1} of ${anim.scenes.length}. ${scene?.caption ?? ''}`}>
          <defs>
            <marker id="arw" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6"
                    markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)" />
            </marker>
          </defs>

          {anim.edges.map((e) => {
            const a = byId[e.from];
            const b = byId[e.to];
            if (!a || !b) return null;
            const key = `${e.from}->${e.to}`;
            const { d, mid } = edgePath(a, b);
            const live = flowing.has(key);
            return (
              <g key={key}>
                <path d={d} fill="none" markerEnd="url(#arw)"
                      stroke={live ? 'var(--accent)' : 'var(--border)'}
                      strokeWidth={live ? 2.2 : 1.4} />
                {live && (
                  <path d={d} fill="none" stroke="var(--accent)" strokeWidth="2.2"
                        strokeDasharray="5 9" strokeLinecap="round">
                    <animate attributeName="stroke-dashoffset" from="28" to="0"
                             dur="0.9s" repeatCount="indefinite" />
                  </path>
                )}
                {e.payload && (
                  <text x={mid.x} y={mid.y - 7} textAnchor="middle" fontSize="9.5"
                        fill={live ? 'var(--accent)' : 'var(--muted)'}
                        fontFamily="var(--mono)">
                    {e.payload}
                  </text>
                )}
              </g>
            );
          })}

          {anim.nodes.map((n) => {
            const s = SHAPE[n.shape];
            const dimmed = (focus && focus.length > 0 && !focus.includes(n.id)) ||
                           (scene?.dim ?? []).includes(n.id);
            const tone = marks[n.id];
            const stroke =
              tone === 'good' ? 'var(--good)' :
              tone === 'bad' ? 'var(--bad)' :
              tone === 'warn' ? 'var(--warn)' : s.stroke;
            const label = labels[n.id] ?? n.label;
            return (
              <g key={n.id} opacity={dimmed ? 0.32 : 1}>
                {n.shape !== 'note' && (
                  <rect x={n.at[0]} y={n.at[1]} width={NW} height={NH} rx={s.rx}
                        fill={s.fill} stroke={stroke} strokeWidth={tone ? 2.2 : 1.4} />
                )}
                <text x={n.at[0] + NW / 2} y={n.at[1] + (n.sub ? NH / 2 - 3 : NH / 2 + 4)}
                      textAnchor="middle" fontSize="11.5" fill="var(--text)" fontWeight="550">
                  {label}
                </text>
                {n.sub && (
                  <text x={n.at[0] + NW / 2} y={n.at[1] + NH / 2 + 12} textAnchor="middle"
                        fontSize="9.5" fill="var(--muted)" fontFamily="var(--mono)">
                    {n.sub}
                  </text>
                )}
                {notes[n.id] && (
                  <text x={n.at[0] + NW / 2} y={n.at[1] - 7} textAnchor="middle" fontSize="10"
                        fill="var(--accent)" fontFamily="var(--mono)">
                    {notes[n.id]}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="anim-ctl">
        <button className="icon-btn" onClick={() => setStep((s) => Math.max(s - 1, 0))}
                disabled={step === 0} aria-label="Previous step">←</button>
        <button className="icon-btn"
                onClick={() => setStep((s) => Math.min(s + 1, anim.scenes.length - 1))}
                disabled={step >= anim.scenes.length - 1} aria-label="Next step">→</button>
        <span>step {step + 1} of {anim.scenes.length}</span>
        <span style={{ flex: 1 }} />
        {step >= anim.scenes.length - 1 && (
          <button className="icon-btn" onClick={() => setStep(0)}>restart</button>
        )}
      </div>

      <div className="anim-cap">{scene?.caption}</div>

      {anim.knobs && anim.knobs.length > 0 && (
        <div className="knobs">
          {anim.knobs.map((k) => (
            <label key={k.id} className="knob">
              <span>{k.label}</span>
              <input type="range" min={k.min} max={k.max} step={k.step}
                     value={knobs[k.id]}
                     onChange={(e) =>
                       setKnobs((v) => ({ ...v, [k.id]: Number(e.target.value) }))} />
              <span style={{ fontFamily: 'var(--mono)', minWidth: 46, textAlign: 'right' }}>
                {knobs[k.id]}{k.unit ?? ''}
              </span>
            </label>
          ))}
        </div>
      )}

      {anim.readout && anim.readout.length > 0 && (
        <div className="readout">
          {anim.readout.map((r) => (
            <div key={r.label}>{r.label}: <b>{r.expr(knobs)}</b></div>
          ))}
        </div>
      )}

      {!fullscreen && (
        <div className="anim-cap" style={{ borderTop: '1px solid var(--border)' }}>
          <span className="small muted">The point — </span>
          <span className="small">{anim.point}</span>
        </div>
      )}
    </div>
  );
}
