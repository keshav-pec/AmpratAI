import type { Animation } from '@/lib/types';

const X = [20, 150, 280, 410];

/**
 * One posting matched against the candidate pool, with illustrative prices:
 * explanations at ~2,500 input + 300 output tokens each (Haiku 4.5 $1/$5, Sonnet 5 $2/$10
 * per million), reranking at $0.002 per 100 candidates, ₹88 to the dollar.
 */
function matchRun(pool: number, k: number, strong: boolean) {
  const explainUsd = strong ? 2500 * 2e-6 + 300 * 10e-6 : 2500 * 1e-6 + 300 * 5e-6;
  const rerankUsd = 0.002 * Math.ceil(pool / 100);
  const inr = (rerankUsd + k * explainUsd) * 88;
  const explainS = strong ? 2.6 : 1.4;
  const beforeS = 0.15 + pool * 0.002;
  return {
    inr,
    eachInr: explainUsd * 88,
    firstS: beforeS + explainS,
    allS: beforeS + Math.ceil(k / 5) * explainS,
  };
}

export const s6Animations: Animation[] = [
  // ─────────────────────────────────────────────── s6.1 capstone
  {
    id: 'anim-capstone-architecture',
    title: 'Your capstone, assembled',
    tier: 'T2',
    point:
      'The capstone is your earlier projects joined up: extraction, tenant-filtered hybrid retrieval, reranking, explanations that cite both sides, a person before anything reaches a candidate — and a cost per match you can state.',
    nodes: [
      { id: 'user', label: 'Recruiter', shape: 'user', at: [X[0], 90] },
      { id: 'api', label: 'API + auth', shape: 'proc', at: [X[1], 90], sub: 'tenant from auth' },
      { id: 'parse', label: 'Extract', shape: 'model', at: [X[1], 0], sub: 'resume + JD' },
      { id: 'index', label: 'Hybrid index', shape: 'db', at: [X[2], 0], sub: 'tenant-filtered' },
      { id: 'match', label: 'Match', shape: 'proc', at: [X[2], 90] },
      { id: 'explain', label: 'Explain', shape: 'model', at: [X[3], 90] },
      { id: 'review', label: 'Human review', shape: 'user', at: [X[3], 180], sub: 'before sending' },
      { id: 'cost', label: 'Cost per match', shape: 'note', at: [X[1], 180] },
    ],
    edges: [
      { from: 'user', to: 'api' }, { from: 'api', to: 'parse' }, { from: 'parse', to: 'index' },
      { from: 'api', to: 'match' }, { from: 'index', to: 'match' }, { from: 'match', to: 'explain' },
      { from: 'explain', to: 'review' },
    ],
    scenes: [
      { caption: 'Resumes and postings come in through one API. Extraction turns each into structured fields: skills, years, must-haves.',
        flow: ['user->api', 'api->parse', 'parse->index'] },
      { caption: 'The tenant comes from the login, never from the request body. Every read of the index is filtered by it first.',
        focus: ['api', 'index'], annotate: [{ on: 'index', text: 'tenant filter' }] },
      { caption: 'Hybrid search pulls a pool of candidates for the posting. A reranker keeps the top k.',
        flow: ['api->match', 'index->match'] },
      { caption: 'Each of the top k gets an explanation: which requirement is met by which resume line, quoted.',
        flow: ['match->explain'] },
      { caption: 'Anything a candidate will see passes a person first.', flow: ['explain->review'] },
      { caption: 'Every step is traced with its cost. Drag the knobs and keep the cost per match under your ceiling.' },
    ],
    knobs: [
      { id: 'pool', label: 'Candidates pulled per posting', min: 20, max: 200, step: 10, default: 100 },
      { id: 'k', label: 'Top k explained', min: 3, max: 30, step: 1, default: 10 },
      { id: 'strong', label: 'Larger model for explanations (0/1)', min: 0, max: 1, step: 1, default: 0 },
    ],
    dynamicLabels: (k) => {
      const r = matchRun(k.pool, k.k, k.strong === 1);
      return {
        'match.sub': `${k.pool} → top ${k.k}`,
        'explain.sub': `₹${r.eachInr.toFixed(2)} each`,
        'cost.sub': `₹${r.inr.toFixed(2)}`,
      };
    },
    dynamicMarks: (k) => {
      const r = matchRun(k.pool, k.k, k.strong === 1);
      return [{ on: 'cost', tone: r.inr <= 5 ? 'good' : 'bad' }];
    },
    readout: [
      {
        label: 'cost per match',
        expr: (k) => {
          const r = matchRun(k.pool, k.k, k.strong === 1);
          return `₹${r.inr.toFixed(2)} for ${k.k} explained candidates — ${r.inr <= 5 ? 'under' : 'over'} a ₹5 ceiling`;
        },
      },
      {
        label: 'time',
        expr: (k) => {
          const r = matchRun(k.pool, k.k, k.strong === 1);
          return `first explanation after ~${r.firstS.toFixed(1)} s, all ${k.k} after ~${r.allS.toFixed(1)} s (5 at a time)`;
        },
      },
      { label: 'prices', expr: () => 'illustrative — replace them with numbers from your own traces' },
    ],
  },
];
