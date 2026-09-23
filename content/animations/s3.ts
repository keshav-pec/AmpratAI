import type { Animation } from '@/lib/types';

const X = [20, 150, 280, 410];

// A leave policy as eight paragraphs (token counts). The answer needs paragraphs 4 and 5.
const PARAS = [120, 90, 150, 60, 200, 80, 110, 140];

/** Pack whole paragraphs into chunks up to `size` tokens, carrying trailing paragraphs
 *  (up to `overlap` tokens) into the next chunk — the way a recursive splitter merges pieces. */
function packChunks(size: number, overlap: number): number[][] {
  const out: number[][] = [];
  let i = 0;
  while (i < PARAS.length) {
    const members: number[] = [];
    let tok = 0;
    let j = i;
    while (j < PARAS.length && (members.length === 0 || tok + PARAS[j] <= size)) {
      tok += PARAS[j];
      members.push(j);
      j++;
    }
    out.push(members);
    if (j >= PARAS.length) break;
    let back = 0;
    let k = j;
    while (k - 1 > members[0] && back + PARAS[k - 1] <= overlap) {
      back += PARAS[k - 1];
      k--;
    }
    i = k;
  }
  return out;
}

const chunkTokens = (c: number[]) => c.reduce((a, i) => a + PARAS[i], 0);

/** Retrieval metrics for two relevant chunks at ranks r1 and r2 (0 = not in the top 5). */
function rankMetrics(r1: number, r2: number) {
  const found = [...new Set([r1, r2].filter((r) => r > 0))];
  const dcg = found.reduce((a, r) => a + 1 / Math.log2(r + 1), 0);
  const ideal = 1 + 1 / Math.log2(3);
  return {
    found,
    recall: found.length / 2,
    precision: found.length / 5,
    mrr: found.length ? 1 / Math.min(...found) : 0,
    ndcg: dcg / ideal,
  };
}

/** A deliberately biased, simulated judge: it favours whichever answer it reads first, and
 *  longer answers. Answer A is short and correct; B is padded and has one error. */
function judgeVerdict(bFirst: boolean, fix: number): 'A' | 'B' | 'tie' {
  const bias = fix === 2 ? 0.02 : 0.15;
  const lengthBias = fix === 2 ? 0.02 : 0.2;
  const once = (bFirstNow: boolean) => {
    const a = 0.7 + (bFirstNow ? 0 : bias);
    const b = 0.55 + lengthBias + (bFirstNow ? bias : 0);
    return a >= b ? 'A' : 'B';
  };
  if (fix === 0) return once(bFirst);
  const x = once(false);
  const y = once(true);
  return x === y ? x : 'tie';
}

/** Where the evidence chunk "E" lands in vector, keyword and fused (RRF, k = 60) rankings,
 *  for three kinds of query. */
const HYBRID_CASES = [
  { name: 'paraphrase: "time off for a new dad"',
    vec: ['E', 'a', 'b', 'c', 'd', 'f', 'g', 'h'], kw: ['k1', 'k2', 'a', 'k3'] },
  { name: 'exact code: "ERR-2210 refund fee"',
    vec: ['a', 'b', 'c', 'd', 'f', 'g', 'h', 'i', 'E'], kw: ['E', 'k1', 'k2'] },
  { name: 'mixed: "ERR-2210 refund for managers"',
    vec: ['a', 'b', 'c', 'E', 'd', 'f'], kw: ['k1', 'E', 'a', 'k2'] },
];

function hybridRanks(i: number) {
  const c = HYBRID_CASES[i];
  const score: Record<string, number> = {};
  for (const list of [c.vec, c.kw]) {
    list.forEach((id, r) => { score[id] = (score[id] ?? 0) + 1 / (60 + r + 1); });
  }
  const fused = Object.keys(score).sort((a, b) => score[b] - score[a]);
  const rankIn = (l: string[]) => (l.includes('E') ? l.indexOf('E') + 1 : 0);
  return { vec: rankIn(c.vec), kw: rankIn(c.kw), fused: fused.indexOf('E') + 1, score: score.E };
}

/** An illustrative "lost in the middle" curve (the shape older models showed): best near the
 *  start, a little lower at the end, worst in the middle; deeper with more chunks. */
function middleAccuracy(n: number, pos: number) {
  const p = Math.min(pos, n);
  const t = n > 1 ? (p - 1) / (n - 1) : 0;
  const dip = Math.min(25, 1.2 * n);
  return 90 - dip * (1 - Math.abs(2 * t - 1)) - 5 * t;
}

export const s3Animations: Animation[] = [
  // ─────────────────────────────────────────────── s3.1 the pipeline
  {
    id: 'anim-rag-pipeline',
    title: 'The eight stages of RAG',
    tier: 'T1',
    point:
      'Four stages run when documents change, four run on every question. A defect upstream shows up downstream — so debug by walking back along the line.',
    nodes: [
      { id: 'docs', label: 'Documents', shape: 'doc', at: [X[0], 0], sub: 'PDF, HTML, docx' },
      { id: 'ing', label: '1 Ingest', shape: 'proc', at: [X[1], 0], sub: 'text + metadata' },
      { id: 'chunk', label: '2 Chunk', shape: 'proc', at: [X[2], 0] },
      { id: 'emb', label: '3 Embed', shape: 'model', at: [X[3], 0] },
      { id: 'q', label: 'Question', shape: 'user', at: [X[0], 90] },
      { id: 'ret', label: '5 Retrieve', shape: 'proc', at: [X[2], 90], sub: 'top 50' },
      { id: 'idx', label: '4 Index', shape: 'db', at: [X[3], 90], sub: 'vectors + text' },
      { id: 'rr', label: '6 Rerank', shape: 'model', at: [X[3], 180], sub: 'keep 5' },
      { id: 'asm', label: '7 Assemble', shape: 'proc', at: [X[2], 180], sub: 'token budget' },
      { id: 'gen', label: '8 Generate', shape: 'model', at: [X[1], 180] },
      { id: 'ans', label: 'Answer', shape: 'doc', at: [X[0], 180], sub: 'with citations' },
    ],
    edges: [
      { from: 'docs', to: 'ing' }, { from: 'ing', to: 'chunk' }, { from: 'chunk', to: 'emb' },
      { from: 'emb', to: 'idx' }, { from: 'q', to: 'ret' }, { from: 'idx', to: 'ret' },
      { from: 'ret', to: 'rr' }, { from: 'rr', to: 'asm' }, { from: 'asm', to: 'gen' },
      { from: 'gen', to: 'ans' },
    ],
    scenes: [
      { caption: 'Offline, whenever documents change: ingestion turns files into clean text with metadata.',
        focus: ['docs', 'ing'], flow: ['docs->ing'] },
      { caption: 'Chunking splits the text into pieces; embedding turns each piece into a vector.',
        focus: ['ing', 'chunk', 'emb'], flow: ['ing->chunk', 'chunk->emb'] },
      { caption: 'The index stores vectors, text and metadata so search is fast. That ends the offline side.',
        focus: ['emb', 'idx'], flow: ['emb->idx'] },
      { caption: 'Online, for every question: retrieval pulls around 50 candidates from the index.',
        focus: ['q', 'ret', 'idx'], flow: ['q->ret', 'idx->ret'] },
      { caption: 'A reranker reads each candidate together with the question and keeps the best few.',
        focus: ['ret', 'rr'], flow: ['ret->rr'] },
      { caption: 'Assembly builds the prompt inside a token budget; the model answers with citations.',
        focus: ['rr', 'asm', 'gen', 'ans'], flow: ['rr->asm', 'asm->gen', 'gen->ans'] },
      { caption: 'A table parsed badly at step 1 becomes a wrong answer at step 8. When an answer is wrong, walk back up the line.',
        mark: [{ on: 'ing', tone: 'bad' }, { on: 'ans', tone: 'bad' }] },
    ],
  },
  // ─────────────────────────────────────────────── s3.2 embedding space
  {
    id: 'anim-embedding-space',
    title: 'Meaning as position',
    tier: 'T2',
    point:
      'Similar meaning lands close together, and search is "find the nearest points". Embed the question differently from the chunks and it lands in the wrong place — with no error.',
    nodes: [
      { id: 'l1', label: 'Paternity leave', shape: 'dot', at: [85, 120] },
      { id: 'l2', label: 'Maternity leave', shape: 'dot', at: [60, 75] },
      { id: 'l3', label: 'Applying for leave', shape: 'dot', at: [70, 30] },
      { id: 'p1', label: 'Salary date', shape: 'dot', at: [300, 40] },
      { id: 'p2', label: 'Tax deductions', shape: 'dot', at: [320, 85] },
      { id: 'p3', label: 'Payslips', shape: 'dot', at: [295, 130] },
      { id: 'i1', label: 'VPN setup', shape: 'dot', at: [190, 205] },
      { id: 'i2', label: 'Laptop request', shape: 'dot', at: [215, 240] },
      { id: 'i3', label: 'Password reset', shape: 'dot', at: [180, 275] },
      { id: 'q', label: 'Q: paternity days?', shape: 'qdot', at: [30, 160] },
      { id: 'qw', label: 'same Q, model B', shape: 'qdot', at: [250, 160] },
    ],
    edges: [
      { from: 'q', to: 'l1', plain: true }, { from: 'q', to: 'l2', plain: true },
      { from: 'q', to: 'l3', plain: true },
      { from: 'qw', to: 'p3', plain: true }, { from: 'qw', to: 'i1', plain: true },
    ],
    scenes: [
      { caption: 'Every chunk becomes a point. Chunks with similar meaning land near each other: three topics, three neighbourhoods.',
        dim: ['q', 'qw'] },
      { caption: 'A question is embedded the same way, and lands near the chunks that answer it.',
        focus: ['q', 'l1', 'l2', 'l3'] },
      { caption: 'Search returns the k nearest points. Drag k.',
        flow: ['q->l1', 'q->l2', 'q->l3'], dim: ['qw'] },
      { caption: 'Now embed the same question with a different model, or without its query setting. It lands somewhere else.',
        focus: ['qw', 'p3', 'i1'], mark: [{ on: 'qw', tone: 'warn' }] },
      { caption: 'Its nearest neighbours are now payslips and VPN setup. Nothing errors — recall just quietly drops.',
        focus: ['qw', 'p3', 'i1', 'q', 'l1'], flow: ['qw->p3', 'qw->i1'],
        mark: [{ on: 'p3', tone: 'bad' }, { on: 'i1', tone: 'bad' }] },
    ],
    knobs: [{ id: 'k', label: 'k nearest', min: 1, max: 3, step: 1, default: 2 }],
    dynamicMarks: (k) => ['l1', 'l2', 'l3'].slice(0, k.k).map((on) => ({ on, tone: 'good' as const })),
    readout: [
      {
        label: 'returned',
        expr: (k) => ['Paternity leave', 'Maternity leave', 'Applying for leave'].slice(0, k.k).join(', '),
      },
    ],
  },

  // ─────────────────────────────────────────────── s3.2 vector footprint
  {
    id: 'anim-vector-footprint',
    title: 'What vectors cost to keep',
    tier: 'T2',
    point:
      'Storage is chunks × dimensions × bytes per number. Fewer dimensions and fewer bits shrink it a lot; recall pays a little — and rescoring buys most of that back.',
    nodes: [
      { id: 'n', label: 'Chunks', shape: 'doc', at: [X[0], 40] },
      { id: 'v', label: 'One vector', shape: 'proc', at: [X[1], 40] },
      { id: 's', label: 'Vector storage', shape: 'db', at: [X[2], 40] },
      { id: 'i', label: 'Index in RAM', shape: 'model', at: [X[3], 40] },
      { id: 'r', label: 'Recall', shape: 'doc', at: [X[3], 130] },
    ],
    edges: [
      { from: 'n', to: 'v' }, { from: 'v', to: 's' }, { from: 's', to: 'i' }, { from: 'i', to: 'r' },
    ],
    scenes: [
      { caption: 'Every chunk gets one vector, and every number in it normally costs 4 bytes.',
        focus: ['n', 'v'], flow: ['n->v'] },
      { caption: 'Multiply it out: a million chunks at 1,024 dimensions is about 4 GB — and a fast index wants it in memory.',
        flow: ['v->s', 's->i'] },
      { caption: 'Fewer dimensions and fewer bits per number both shrink it. Drag the knobs; watch the 16 GB line.' },
      { caption: 'Smaller costs recall. Binary alone loses clearly; shortlisting with binary and re-ranking with full vectors wins most of it back.',
        flow: ['i->r'] },
    ],
    knobs: [
      { id: 'chunks', label: 'Chunks (× 100K)', min: 1, max: 200, step: 1, default: 10 },
      { id: 'dims', label: 'Dimensions', min: 256, max: 3072, step: 256, default: 1024 },
      { id: 'prec', label: 'Precision (0 f32, 1 f16, 2 int8, 3 bit)', min: 0, max: 3, step: 1, default: 0 },
    ],
    dynamicLabels: (k) => {
      const bpn = [4, 2, 1, 0.125][k.prec];
      const gb = (k.chunks * 1e5 * k.dims * bpn) / 1e9;
      const name = ['float32', 'float16', 'int8', 'binary'][k.prec];
      return {
        'n.sub': `${(k.chunks / 10).toFixed(1)} million`,
        'v.sub': `${k.dims} × ${name}`,
        's.sub': `${gb < 1 ? gb.toFixed(2) : gb.toFixed(1)} GB`,
        'i.sub': gb <= 16 ? 'fits in 16 GB' : 'exceeds 16 GB',
        'r.sub': ['baseline', 'about the same', 'small loss', 'clear loss: rescore'][k.prec],
      };
    },
    dynamicMarks: (k) => {
      const gb = (k.chunks * 1e5 * k.dims * [4, 2, 1, 0.125][k.prec]) / 1e9;
      const m: { on: string; tone: 'good' | 'bad' | 'warn' }[] = [
        { on: 's', tone: gb <= 8 ? 'good' : gb <= 16 ? 'warn' : 'bad' },
      ];
      if (k.prec === 3) m.push({ on: 'r', tone: 'warn' });
      if (k.prec === 0 && k.dims > 2000) m.push({ on: 'i', tone: 'warn' });
      return m;
    },
    readout: [
      {
        label: 'storage',
        expr: (k) => `${((k.chunks * 1e5 * k.dims * [4, 2, 1, 0.125][k.prec]) / 1e9).toFixed(2)} GB for the vectors alone`,
      },
      {
        label: 'pgvector',
        expr: (k) =>
          k.prec === 0 && k.dims > 2000
            ? 'a vector index stops at 2,000 dims: use halfvec or fewer dims'
            : k.prec === 2
              ? 'no int8 type: use halfvec, or an engine with int8 (e.g. Qdrant)'
              : k.prec === 3
                ? 'bit type + Hamming index, then rescore the shortlist'
                : 'indexable as is',
      },
    ],
  },
  // ─────────────────────────────────────────────── s3.3 incremental sync
  {
    id: 'anim-incremental-sync',
    title: 'An incremental sync',
    tier: 'T2',
    point:
      'Compare hashes, touch only what changed, and defend the delete step: a listing that suddenly shows far fewer files is a broken listing, not a mass deletion.',
    nodes: [
      { id: 'src', label: 'Source listing', shape: 'doc', at: [X[0], 90] },
      { id: 'hash', label: 'Compare hashes', shape: 'proc', at: [X[1], 90] },
      { id: 'add', label: 'Added', shape: 'proc', at: [X[2], 0], sub: 'parse + embed' },
      { id: 'chg', label: 'Changed', shape: 'proc', at: [X[2], 60], sub: 'replace chunks' },
      { id: 'del', label: 'Missing', shape: 'proc', at: [X[2], 120], sub: 'to delete' },
      { id: 'same', label: 'Unchanged', shape: 'doc', at: [X[2], 180], sub: 'skip' },
      { id: 'idx', label: 'Index', shape: 'db', at: [X[3], 30] },
      { id: 'guard', label: 'Sweep guard', shape: 'proc', at: [X[3], 120] },
    ],
    edges: [
      { from: 'src', to: 'hash' }, { from: 'hash', to: 'add' }, { from: 'hash', to: 'chg' },
      { from: 'hash', to: 'del' }, { from: 'hash', to: 'same' }, { from: 'add', to: 'idx' },
      { from: 'chg', to: 'idx' }, { from: 'del', to: 'guard' }, { from: 'guard', to: 'idx' },
    ],
    scenes: [
      { caption: 'List the source and hash each file. Compare with the hashes stored last time.',
        focus: ['src', 'hash'], flow: ['src->hash'] },
      { caption: 'New files are parsed, chunked and embedded.',
        focus: ['hash', 'add', 'idx'], flow: ['hash->add', 'add->idx'] },
      { caption: 'Changed files get all their chunks replaced in one transaction. The embedding cache makes unchanged chunks free.',
        focus: ['hash', 'chg', 'idx'], flow: ['hash->chg', 'chg->idx'] },
      { caption: 'Unchanged files are skipped. On a normal night that is almost everything.',
        focus: ['hash', 'same'], flow: ['hash->same'], mark: [{ on: 'same', tone: 'good' }] },
      { caption: 'Files missing from the listing are deleted — but only after a guard checks the listing looks complete.',
        focus: ['hash', 'del', 'guard', 'idx'], flow: ['hash->del', 'del->guard', 'guard->idx'] },
      { caption: 'Drag the knob. An expired token can return an empty listing; the guard blocks the sweep and raises an alert instead.' },
    ],
    knobs: [{ id: 'seen', label: 'Files seen (% of last sync)', min: 0, max: 120, step: 5, default: 100 }],
    dynamicLabels: (k) => ({
      'src.sub': `${Math.round((412 * k.seen) / 100)} files`,
      'guard.sub': k.seen >= 50 ? 'sweep allowed' : 'sweep blocked',
      'del.sub': k.seen >= 100 ? '0 to delete' : `${Math.round(412 - (412 * k.seen) / 100)} to delete`,
    }),
    dynamicMarks: (k) =>
      k.seen >= 50
        ? [{ on: 'guard', tone: 'good' }]
        : [{ on: 'guard', tone: 'bad' }, { on: 'src', tone: 'warn' }],
    readout: [
      { label: 'listing', expr: (k) => `${Math.round((412 * k.seen) / 100)} of 412 files seen last time` },
      {
        label: 'sweep',
        expr: (k) => (k.seen >= 50 ? 'allowed' : 'blocked: listing looks broken, alert a human'),
      },
    ],
  },

  // ─────────────────────────────────────────────── s3.3 ingestion jobs
  {
    id: 'anim-ingest-jobs',
    title: 'Ingestion as jobs',
    tier: 'T1',
    point:
      'Each document is a job with a status. Stages save their output, so a retry resumes where it failed — and a file that always fails ends up on a list instead of blocking the queue.',
    nodes: [
      { id: 'q', label: 'Job queue', shape: 'db', at: [X[0], 60] },
      { id: 'w', label: 'Worker', shape: 'proc', at: [X[1], 60], sub: 'claims one job' },
      { id: 'p', label: 'Parse', shape: 'proc', at: [X[2], 0] },
      { id: 'c', label: 'Chunk', shape: 'proc', at: [X[3], 0] },
      { id: 'e', label: 'Embed', shape: 'model', at: [X[3], 75] },
      { id: 'i', label: 'Searchable', shape: 'db', at: [X[3], 150] },
      { id: 'r', label: 'Retry later', shape: 'proc', at: [X[1], 150], sub: 'with backoff' },
      { id: 'd', label: 'Dead-letter', shape: 'doc', at: [X[0], 150], sub: 'with the error' },
    ],
    edges: [
      { from: 'q', to: 'w' }, { from: 'w', to: 'p' }, { from: 'p', to: 'c' }, { from: 'c', to: 'e' },
      { from: 'e', to: 'i' }, { from: 'e', to: 'r' }, { from: 'r', to: 'q' }, { from: 'r', to: 'd' },
    ],
    scenes: [
      { caption: 'Every document is a job in the queue. A worker claims one; SKIP LOCKED means no two workers take the same job.',
        focus: ['q', 'w'], flow: ['q->w'] },
      { caption: 'The worker runs the stages in order and saves each stage’s output.',
        focus: ['w', 'p', 'c', 'e'], flow: ['w->p', 'p->c', 'c->e'] },
      { caption: 'The embedding API returns 429. The job goes back to the queue with a delay.',
        flow: ['e->r', 'r->q'], mark: [{ on: 'e', tone: 'warn' }], annotate: [{ on: 'e', text: '429' }] },
      { caption: 'On the next attempt it resumes at the embed step — the parse is not redone — and the document becomes searchable.',
        flow: ['e->i'], mark: [{ on: 'i', tone: 'good' }] },
      { caption: 'A file that fails every time goes to the dead-letter list after a few attempts, with its error. The rest of the queue keeps moving.',
        flow: ['r->d'], mark: [{ on: 'd', tone: 'bad' }] },
    ],
  },
  // ─────────────────────────────────────────────── s3.4 chunk size and overlap
  {
    id: 'anim-chunk-strategies',
    title: 'Where the chunk boundaries fall',
    tier: 'T2',
    point:
      'Chunk size and overlap decide whether an answer stays in one piece. Bigger chunks keep it together but send more tokens per question; overlap repairs boundaries. Measure, don’t guess.',
    nodes: [
      { id: 'a1', label: 'Scope', shape: 'doc', at: [X[0], 10] },
      { id: 'a2', label: 'Who qualifies', shape: 'doc', at: [X[1], 10] },
      { id: 'a3', label: 'Leave types', shape: 'doc', at: [X[2], 10] },
      { id: 'a4', label: 'Probation rule', shape: 'doc', at: [X[3], 10] },
      { id: 'a5', label: 'Its exceptions', shape: 'doc', at: [X[0], 90] },
      { id: 'a6', label: 'How to apply', shape: 'doc', at: [X[1], 90] },
      { id: 'a7', label: 'Approvals', shape: 'doc', at: [X[2], 90] },
      { id: 'a8', label: 'Carry-over', shape: 'doc', at: [X[3], 90] },
    ],
    edges: [],
    scenes: [
      { caption: 'A leave policy as eight paragraphs. "Can I take sick leave on probation?" needs paragraphs 4 and 5 together.',
        annotate: [{ on: 'a4', text: 'answer, part 1' }, { on: 'a5', text: 'answer, part 2' }] },
      { caption: 'A splitter packs whole paragraphs into chunks up to a size limit. Under each paragraph: its tokens, and the chunk it landed in.' },
      { caption: 'At 300 tokens the answer is cut in two — neither chunk holds the whole rule. Try a bigger size.',
        focus: ['a4', 'a5'] },
      { caption: 'Bigger chunks keep it together, but every chunk now carries more text, so every question sends more tokens.' },
      { caption: 'Or go back to 300 and add overlap: a paragraph at a boundary is repeated at the start of the next chunk.' },
      { caption: 'No size is best everywhere. Measure recall at a fixed token budget on your own questions (topic 7).' },
    ],
    knobs: [
      { id: 'size', label: 'Chunk size (tokens)', min: 100, max: 600, step: 50, default: 300 },
      { id: 'overlap', label: 'Overlap (tokens)', min: 0, max: 150, step: 10, default: 0 },
    ],
    dynamicLabels: (k) => {
      const chunks = packChunks(k.size, k.overlap);
      const ids = ['a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8'];
      return Object.fromEntries(
        ids.map((id, i) => {
          const inChunks = chunks.flatMap((c, n) => (c.includes(i) ? [n + 1] : []));
          return [`${id}.sub`, `${PARAS[i]} tok → c${inChunks.join(',c')}`];
        }),
      );
    },
    dynamicMarks: (k) => {
      const together = packChunks(k.size, k.overlap).some((c) => c.includes(3) && c.includes(4));
      const tone = together ? ('good' as const) : ('bad' as const);
      return [{ on: 'a4', tone }, { on: 'a5', tone }];
    },
    readout: [
      { label: 'chunks', expr: (k) => `${packChunks(k.size, k.overlap).length}` },
      {
        label: 'the answer',
        expr: (k) => {
          const chunks = packChunks(k.size, k.overlap);
          const n = chunks.findIndex((c) => c.includes(3) && c.includes(4));
          return n >= 0 ? `whole, in chunk ${n + 1}` : 'split across two chunks';
        },
      },
      {
        label: 'top-3 chunks send about',
        expr: (k) => {
          const chunks = packChunks(k.size, k.overlap);
          const avg = chunks.reduce((a, c) => a + chunkTokens(c), 0) / chunks.length;
          return `${Math.round(avg * 3)} tokens per question`;
        },
      },
    ],
  },

  // ─────────────────────────────────────────────── s3.4 parent-document retrieval
  {
    id: 'anim-parent-doc',
    title: 'Match small, send big',
    tier: 'T1',
    point:
      'Small chunks match precisely; big sections answer well. Parent-document retrieval matches on the small children and sends their parent.',
    nodes: [
      { id: 'q', label: 'Question', shape: 'user', at: [X[0], 80] },
      { id: 'c1', label: 'Child 1', shape: 'doc', at: [X[1], 10], sub: '~150 tokens' },
      { id: 'c2', label: 'Child 2', shape: 'doc', at: [X[1], 80], sub: '~150 tokens' },
      { id: 'c3', label: 'Child 3', shape: 'doc', at: [X[1], 150], sub: '~150 tokens' },
      { id: 'par', label: 'Parent section', shape: 'doc', at: [X[2], 80], sub: '~1,500 tokens' },
      { id: 'llm', label: 'Model', shape: 'model', at: [X[3], 80] },
    ],
    edges: [
      { from: 'q', to: 'c1', plain: true }, { from: 'q', to: 'c2', plain: true }, { from: 'q', to: 'c3', plain: true },
      { from: 'c1', to: 'par', plain: true }, { from: 'c2', to: 'par' }, { from: 'c3', to: 'par', plain: true },
      { from: 'par', to: 'llm' },
    ],
    scenes: [
      { caption: 'Each section (the parent) is split into small children. Only the children are embedded and searched.',
        focus: ['c1', 'c2', 'c3', 'par'] },
      { caption: 'A small child is about one thing, so its vector is sharp. The question matches child 2 best.',
        focus: ['q', 'c2'], flow: ['q->c2'], mark: [{ on: 'c2', tone: 'good' }] },
      { caption: 'But 150 tokens is too little to answer from. Follow child 2 up to its parent.',
        focus: ['c2', 'par'], flow: ['c2->par'] },
      { caption: 'Send the whole parent section to the model: precise matching, enough context.',
        focus: ['par', 'llm'], flow: ['par->llm'], mark: [{ on: 'llm', tone: 'good' }] },
      { caption: 'Sentence-window retrieval is the same move, smaller: match one sentence, send it with a few sentences on either side.' },
    ],
  },

  // ─────────────────────────────────────────────── s3.4 contextual retrieval
  {
    id: 'anim-contextual-retrieval',
    title: 'Contextual retrieval',
    tier: 'T2',
    point:
      'A chunk that doesn’t say what it’s about can’t be found. A short, model-written context — prepended before embedding and keyword indexing — fixes that, and prompt caching makes it cheap.',
    nodes: [
      { id: 'doc', label: 'Whole document', shape: 'doc', at: [X[0], 90], sub: 'ACME Q2 2025 report' },
      { id: 'ch', label: 'Chunk', shape: 'doc', at: [X[1], 10], sub: '"Revenue grew 3%..."' },
      { id: 'llm', label: 'Small model', shape: 'model', at: [X[1], 170], sub: 'writes context' },
      { id: 'ctx', label: 'Context + chunk', shape: 'doc', at: [X[2], 90] },
      { id: 'emb', label: 'Embeddings', shape: 'proc', at: [X[3], 20] },
      { id: 'kw', label: 'Keyword index', shape: 'proc', at: [X[3], 160] },
    ],
    edges: [
      { from: 'doc', to: 'llm' }, { from: 'ch', to: 'llm' }, { from: 'llm', to: 'ctx' },
      { from: 'ch', to: 'ctx' }, { from: 'ctx', to: 'emb' }, { from: 'ctx', to: 'kw' },
    ],
    scenes: [
      { caption: 'A chunk on its own: "Revenue grew 3% over the previous quarter." Whose revenue? Which quarter?',
        focus: ['ch'], mark: [{ on: 'ch', tone: 'warn' }] },
      { caption: 'Give a small model the whole document and the chunk, and ask for a sentence or two that situates it.',
        focus: ['doc', 'ch', 'llm'], flow: ['doc->llm', 'ch->llm'] },
      { caption: 'Prepend that context to the chunk: "From ACME’s Q2 2025 report, revenue section..."',
        focus: ['llm', 'ch', 'ctx'], flow: ['llm->ctx', 'ch->ctx'] },
      { caption: 'Embed and keyword-index the combined text. Now "ACME Q2 2025 revenue" finds it, both ways.',
        flow: ['ctx->emb', 'ctx->kw'], mark: [{ on: 'emb', tone: 'good' }, { on: 'kw', tone: 'good' }] },
      { caption: 'The document is identical for every chunk in it, so prompt caching makes all but the first call cheap.',
        focus: ['doc', 'llm'], annotate: [{ on: 'doc', text: 'cached' }] },
      { caption: 'Drag the knob to see what each step bought in Anthropic’s tests. Your corpus will differ — measure it.' },
    ],
    knobs: [{ id: 'setup', label: 'Setup (0 plain → 3 + rerank)', min: 0, max: 3, step: 1, default: 0 }],
    dynamicLabels: (k) => ({
      'ctx.sub': ['not used', 'embedded', 'embedded + BM25', '+ reranked'][k.setup],
    }),
    dynamicMarks: (k) => (k.setup === 0 ? [{ on: 'ctx', tone: 'warn' }] : [{ on: 'ctx', tone: 'good' }]),
    readout: [
      {
        label: 'setup',
        expr: (k) =>
          ['plain embeddings', 'contextual embeddings', '+ contextual BM25', '+ reranking'][k.setup],
      },
      {
        label: 'top-20 failure rate',
        expr: (k) =>
          `${['5.7', '3.7', '2.9', '1.9'][k.setup]}% (${['baseline', '−35%', '−49%', '−67%'][k.setup]}, Anthropic’s reported average)`,
      },
    ],
  },
  // ─────────────────────────────────────────────── s3.5 HNSW
  {
    id: 'anim-hnsw',
    title: 'How HNSW finds a neighbour',
    tier: 'T2',
    point:
      'HNSW jumps along long links to get close, then walks short links to finish. ef_search is how many candidates it keeps while walking — the dial between recall and speed.',
    nodes: [
      { id: 'e', label: 'entry point', shape: 'dot', at: [30, 40] },
      { id: 't1', label: '', shape: 'dot', at: [190, 50] },
      { id: 't2', label: '', shape: 'dot', at: [320, 105] },
      { id: 'a', label: '', shape: 'dot', at: [90, 105] },
      { id: 'b', label: '', shape: 'dot', at: [140, 165] },
      { id: 'c', label: '', shape: 'dot', at: [235, 115] },
      { id: 'd', label: '', shape: 'dot', at: [270, 195] },
      { id: 'f', label: '', shape: 'dot', at: [380, 45] },
      { id: 'g', label: 'near miss', shape: 'dot', at: [395, 205] },
      { id: 'h', label: '', shape: 'dot', at: [55, 200] },
      { id: 'i', label: '', shape: 'dot', at: [195, 225] },
      { id: 'n', label: 'true nearest', shape: 'dot', at: [335, 185] },
      { id: 'q', label: 'query', shape: 'qdot', at: [375, 150] },
    ],
    edges: [
      { from: 'e', to: 't1', plain: true }, { from: 't1', to: 't2', plain: true },
      { from: 't2', to: 'n', plain: true }, { from: 't2', to: 'g', plain: true },
      { from: 'e', to: 'a', plain: true }, { from: 'a', to: 'b', plain: true },
      { from: 'b', to: 'h', plain: true }, { from: 'a', to: 'c', plain: true },
      { from: 'c', to: 't1', plain: true }, { from: 'c', to: 'd', plain: true },
      { from: 'd', to: 'i', plain: true }, { from: 'b', to: 'i', plain: true },
      { from: 't1', to: 'f', plain: true }, { from: 'f', to: 't2', plain: true },
      { from: 'd', to: 'n', plain: true }, { from: 'g', to: 'n', plain: true },
    ],
    scenes: [
      { caption: 'Every vector is a point, linked to a few near neighbours. That web of links is the index.',
        dim: ['q'] },
      { caption: 'A few points also live on upper layers, joined by long links — the highway.',
        focus: ['e', 't1', 't2'], flow: ['e->t1', 't1->t2'] },
      { caption: 'A search starts at the entry point and jumps along the long links towards the query.',
        focus: ['e', 't1', 't2', 'q'], flow: ['e->t1', 't1->t2'] },
      { caption: 'Then it walks short local links, keeping the best ef_search candidates, until nothing closer is left.',
        focus: ['t2', 'n', 'g', 'q'], flow: ['t2->n'], mark: [{ on: 'n', tone: 'good' }] },
      { caption: 'Keep too few candidates and the walk can settle on a point that only looks closest. Drag ef_search.' },
    ],
    knobs: [{ id: 'ef', label: 'ef_search', min: 10, max: 400, step: 10, default: 40 }],
    dynamicMarks: (k) =>
      k.ef < 40 ? [{ on: 'g', tone: 'warn' }, { on: 'n', tone: 'bad' }] : [{ on: 'n', tone: 'good' }],
    readout: [
      { label: 'index recall@10', expr: (k) => `~${(100 * (1 - 0.3 * Math.exp(-k.ef / 45))).toFixed(1)}% (illustrative)` },
      { label: 'latency', expr: (k) => `~${(0.4 + k.ef * 0.018).toFixed(1)} ms (illustrative — measure yours)` },
    ],
  },

  // ─────────────────────────────────────────────── s3.5 filtered search
  {
    id: 'anim-filter-cliff',
    title: 'The filtered-search cliff',
    tier: 'T2',
    point:
      'An approximate index gathers its candidates first and filters after. A selective filter leaves you with fewer results than you asked for — silently — unless the scan is allowed to keep going.',
    nodes: [
      { id: 'q', label: 'Query', shape: 'user', at: [X[0], 70], sub: 'LIMIT 10' },
      { id: 'idx', label: 'HNSW scan', shape: 'model', at: [X[1], 70] },
      { id: 'filt', label: 'WHERE tenant', shape: 'proc', at: [X[2], 70] },
      { id: 'res', label: 'Results', shape: 'db', at: [X[3], 70] },
      { id: 'it', label: 'Iterative scan', shape: 'proc', at: [X[1], 170] },
    ],
    edges: [
      { from: 'q', to: 'idx' }, { from: 'idx', to: 'filt' }, { from: 'filt', to: 'res' },
      { from: 'it', to: 'idx' },
    ],
    scenes: [
      { caption: 'You ask for the 10 nearest chunks belonging to one tenant.',
        focus: ['q', 'idx'], flow: ['q->idx'] },
      { caption: 'The HNSW scan gathers ef_search candidates — 40 by default — without looking at the filter.',
        focus: ['idx'] },
      { caption: 'Then the WHERE clause drops every candidate from other tenants.',
        flow: ['idx->filt', 'filt->res'] },
      { caption: 'If the tenant owns 10% of rows, about 4 survive. Drag the share to 1% and watch it reach zero — with no error.' },
      { caption: 'Turn on iterative scans: the index keeps scanning until 10 rows pass the filter.',
        flow: ['it->idx', 'idx->filt', 'filt->res'] },
    ],
    knobs: [
      { id: 'share', label: 'Tenant’s share of rows (%)', min: 1, max: 100, step: 1, default: 10 },
      { id: 'ef', label: 'ef_search', min: 10, max: 200, step: 10, default: 40 },
      { id: 'iter', label: 'Iterative scan (0 off, 1 on)', min: 0, max: 1, step: 1, default: 0 },
    ],
    dynamicLabels: (k) => {
      const n = k.iter ? 10 : Math.min(10, Math.round((k.ef * k.share) / 100));
      return {
        'idx.sub': k.iter ? 'keeps scanning' : `${k.ef} candidates`,
        'filt.sub': `${k.share}% pass`,
        'res.sub': `${n} of 10`,
        'it.sub': k.iter ? 'on' : 'off',
      };
    },
    dynamicMarks: (k) => {
      const n = k.iter ? 10 : Math.min(10, Math.round((k.ef * k.share) / 100));
      const tone = n >= 10 ? ('good' as const) : n >= 5 ? ('warn' as const) : ('bad' as const);
      return [{ on: 'res', tone }, ...(k.iter ? [{ on: 'it', tone: 'good' as const }] : [])];
    },
    readout: [
      {
        label: 'rows returned',
        expr: (k) => `${k.iter ? 10 : Math.min(10, Math.round((k.ef * k.share) / 100))} of the 10 asked for`,
      },
      {
        label: 'why',
        expr: (k) =>
          k.iter
            ? 'the scan continues until 10 rows pass (capped by hnsw.max_scan_tuples)'
            : `${k.ef} candidates × ${k.share}% ≈ ${((k.ef * k.share) / 100).toFixed(1)} rows`,
      },
    ],
  },
  // ─────────────────────────────────────────────── s3.8 the eval loop
  {
    id: 'anim-eval-loop',
    title: 'The evaluation loop',
    tier: 'T1',
    point:
      'Fixed questions in, numbers out, failures read by hand, the biggest group fixed, and the numbers checked again. Every change earns its place in the results table.',
    nodes: [
      { id: 'golden', label: 'Golden set', shape: 'db', at: [X[0], 60], sub: '50+ questions' },
      { id: 'pipe', label: 'Pipeline vN', shape: 'proc', at: [X[1], 60] },
      { id: 'metrics', label: 'Metrics', shape: 'doc', at: [X[2], 60], sub: 'recall, faithfulness' },
      { id: 'table', label: 'Results table', shape: 'db', at: [X[3], 60], sub: 'a row per version' },
      { id: 'err', label: 'Error analysis', shape: 'proc', at: [X[2], 160], sub: 'read the failures' },
      { id: 'fix', label: 'Fix biggest group', shape: 'proc', at: [X[1], 160] },
    ],
    edges: [
      { from: 'golden', to: 'pipe' }, { from: 'pipe', to: 'metrics' }, { from: 'metrics', to: 'table' },
      { from: 'metrics', to: 'err' }, { from: 'err', to: 'fix' }, { from: 'fix', to: 'pipe' },
    ],
    scenes: [
      { caption: 'Start with a fixed golden set: real questions, each with known evidence.', focus: ['golden'] },
      { caption: 'Run the current pipeline on every question.', flow: ['golden->pipe'] },
      { caption: 'Score it: recall and MRR for retrieval, then faithfulness and declining for answers.',
        flow: ['pipe->metrics'] },
      { caption: 'The numbers become this version’s row in the results table.',
        flow: ['metrics->table'], mark: [{ on: 'table', tone: 'good' }] },
      { caption: 'Read the failures one by one. Group them. Count the groups.', flow: ['metrics->err'] },
      { caption: 'Fix the biggest group — and add questions for it to the golden set so it can’t quietly return.',
        flow: ['err->fix', 'fix->pipe'], annotate: [{ on: 'golden', text: '+ new questions' }] },
      { caption: 'Run again. Keep the change only if the numbers moved. That loop is the job.',
        flow: ['golden->pipe', 'pipe->metrics', 'metrics->table'] },
    ],
  },

  // ─────────────────────────────────────────────── s3.8 ranking metrics
  {
    id: 'anim-rank-metrics',
    title: 'Four ways to score a ranking',
    tier: 'T2',
    point:
      'recall@k asks "did it come back", precision "how much was noise", MRR "how high was the first hit", and nDCG "were the good ones near the top". Move the hits and watch each react.',
    nodes: [
      { id: 'q', label: 'Question', shape: 'user', at: [X[0], 100], sub: '2 relevant chunks' },
      { id: 's1', label: 'Rank 1', shape: 'doc', at: [X[2], 0] },
      { id: 's2', label: 'Rank 2', shape: 'doc', at: [X[2], 50] },
      { id: 's3', label: 'Rank 3', shape: 'doc', at: [X[2], 100] },
      { id: 's4', label: 'Rank 4', shape: 'doc', at: [X[2], 150] },
      { id: 's5', label: 'Rank 5', shape: 'doc', at: [X[2], 200] },
    ],
    edges: [
      { from: 'q', to: 's1', plain: true }, { from: 'q', to: 's2', plain: true },
      { from: 'q', to: 's3', plain: true }, { from: 'q', to: 's4', plain: true },
      { from: 'q', to: 's5', plain: true },
    ],
    scenes: [
      { caption: 'A question with two relevant chunks, A and B. The retriever returns five results.' },
      { caption: 'recall@5: how many of the relevant chunks made the top 5. Precision@5: how many of the 5 are relevant.' },
      { caption: 'MRR: 1 ÷ the rank of the first relevant result. It rewards getting one hit right at the top.' },
      { caption: 'nDCG: each relevant result earns credit that shrinks with rank. Drag the ranks and watch all four numbers.' },
    ],
    knobs: [
      { id: 'r1', label: 'Rank of chunk A (0 = missed)', min: 0, max: 5, step: 1, default: 1 },
      { id: 'r2', label: 'Rank of chunk B (0 = missed)', min: 0, max: 5, step: 1, default: 4 },
    ],
    dynamicLabels: (k) =>
      Object.fromEntries(
        [1, 2, 3, 4, 5].map((i) => [
          `s${i}.sub`,
          i === k.r1 ? 'relevant: A' : i === k.r2 ? 'relevant: B' : 'not relevant',
        ]),
      ),
    dynamicMarks: (k) => rankMetrics(k.r1, k.r2).found.map((r) => ({ on: `s${r}`, tone: 'good' as const })),
    readout: [
      { label: 'recall@5', expr: (k) => rankMetrics(k.r1, k.r2).recall.toFixed(2) },
      { label: 'precision@5', expr: (k) => rankMetrics(k.r1, k.r2).precision.toFixed(2) },
      { label: 'MRR', expr: (k) => rankMetrics(k.r1, k.r2).mrr.toFixed(2) },
      {
        label: 'nDCG@5',
        expr: (k) =>
          `${rankMetrics(k.r1, k.r2).ndcg.toFixed(3)}${k.r1 > 0 && k.r1 === k.r2 ? ' (both at one rank: counting one)' : ''}`,
      },
    ],
  },

  // ─────────────────────────────────────────────── s3.8 judge bias
  {
    id: 'anim-judge-bias',
    title: 'A biased judge, and two fixes',
    tier: 'T2',
    point:
      'A model judge can prefer whatever it reads first, and whatever is longer. Judge both orders and accept only agreement; then fix the rubric so quality, not length, decides.',
    nodes: [
      { id: 'a', label: 'Answer A', shape: 'doc', at: [X[0], 20], sub: 'short, correct' },
      { id: 'b', label: 'Answer B', shape: 'doc', at: [X[0], 120], sub: 'padded, one error' },
      { id: 'judge', label: 'Judge', shape: 'model', at: [X[2], 70] },
      { id: 'v', label: 'Verdict', shape: 'doc', at: [X[3], 70] },
    ],
    edges: [{ from: 'a', to: 'judge' }, { from: 'b', to: 'judge' }, { from: 'judge', to: 'v' }],
    scenes: [
      { caption: 'Two answers to the same question. A is short and correct; B is longer, padded, and has one error.',
        focus: ['a', 'b'] },
      { caption: 'A judge compares them. This one is simulated with two common biases: it favours the answer it reads first, and longer answers.',
        flow: ['a->judge', 'b->judge', 'judge->v'] },
      { caption: 'Flip the order knob. The verdict flips too — it was judging position and length, not quality.' },
      { caption: 'Fix 1: judge both orders and accept a verdict only when they agree. Disagreement becomes a tie for a person.' },
      { caption: 'Fix 2: a rubric that rewards supported facts, not length. Now A wins in both orders. Then calibrate against your own labels.' },
    ],
    knobs: [
      { id: 'order', label: 'Order (0 A first, 1 B first)', min: 0, max: 1, step: 1, default: 0 },
      { id: 'fix', label: 'Fix (0 none, 1 both orders, 2 + rubric)', min: 0, max: 2, step: 1, default: 0 },
    ],
    dynamicLabels: (k) => {
      const v = judgeVerdict(k.order === 1, k.fix);
      return {
        'judge.sub': k.fix === 0 ? (k.order ? 'reads B first' : 'reads A first') : 'reads both orders',
        'v.sub': v === 'tie' ? 'tie: ask a person' : `${v} wins`,
      };
    },
    dynamicMarks: (k) => {
      const v = judgeVerdict(k.order === 1, k.fix);
      return [{ on: 'v', tone: v === 'A' ? 'good' : v === 'B' ? 'bad' : 'warn' }];
    },
    readout: [
      {
        label: 'verdict',
        expr: (k) => {
          const v = judgeVerdict(k.order === 1, k.fix);
          return v === 'tie' ? 'tie — the two orders disagree' : `${v} wins${v === 'B' ? ' (wrong: bias decided it)' : ''}`;
        },
      },
    ],
  },
  // ─────────────────────────────────────────────── s3.6 hybrid + RRF
  {
    id: 'anim-hybrid-rrf',
    title: 'Hybrid search with RRF',
    tier: 'T2',
    point:
      'Vector search finds meaning; keyword search finds exact strings. RRF merges the two by rank, so whichever one finds the evidence, it stays near the top.',
    nodes: [
      { id: 'q', label: 'Query', shape: 'user', at: [X[0], 100] },
      { id: 'vec', label: 'Vector search', shape: 'proc', at: [X[1], 30] },
      { id: 'kw', label: 'Keyword search', shape: 'proc', at: [X[1], 170] },
      { id: 'fuse', label: 'RRF', shape: 'proc', at: [X[2], 100], sub: 'Σ 1/(60 + rank)' },
      { id: 'top', label: 'Fused results', shape: 'db', at: [X[3], 100] },
    ],
    edges: [
      { from: 'q', to: 'vec' }, { from: 'q', to: 'kw' },
      { from: 'vec', to: 'fuse' }, { from: 'kw', to: 'fuse' }, { from: 'fuse', to: 'top' },
    ],
    scenes: [
      { caption: 'The same question goes to two searches at once.', flow: ['q->vec', 'q->kw'] },
      { caption: 'Vector search finds meaning: "time off for a new dad" reaches the paternity leave chunk.',
        focus: ['q', 'vec'] },
      { caption: 'Keyword search finds exact strings: error codes, clause numbers, names — which vectors blur.',
        focus: ['q', 'kw'] },
      { caption: 'RRF merges the two rankings by rank, not by score: each list adds 1 ÷ (60 + rank).',
        flow: ['vec->fuse', 'kw->fuse'] },
      { caption: 'Switch the query type. Whichever search finds the evidence, the fused list keeps it near the top.',
        flow: ['vec->fuse', 'kw->fuse', 'fuse->top'] },
    ],
    knobs: [{ id: 'case', label: 'Query (0 paraphrase, 1 code, 2 mixed)', min: 0, max: 2, step: 1, default: 0 }],
    dynamicLabels: (k) => {
      const r = hybridRanks(k.case);
      const at = (n: number) => (n ? `evidence at #${n}` : 'evidence missed');
      return { 'vec.sub': at(r.vec), 'kw.sub': at(r.kw), 'top.sub': at(r.fused) };
    },
    dynamicMarks: (k) => {
      const r = hybridRanks(k.case);
      const tone = (n: number) => (n > 0 && n <= 5 ? ('good' as const) : ('bad' as const));
      return [{ on: 'vec', tone: tone(r.vec) }, { on: 'kw', tone: tone(r.kw) }, { on: 'top', tone: tone(r.fused) }];
    },
    readout: [
      { label: 'query', expr: (k) => HYBRID_CASES[k.case].name },
      {
        label: 'evidence score',
        expr: (k) => {
          const r = hybridRanks(k.case);
          const part = (n: number) => (n ? `1/${60 + n}` : '0');
          return `${part(r.vec)} + ${part(r.kw)} = ${r.score.toFixed(4)} → fused #${r.fused}`;
        },
      },
    ],
  },

  // ─────────────────────────────────────────────── s3.6 reranking
  {
    id: 'anim-reranker',
    title: 'Retrieve wide, rerank narrow',
    tier: 'T1',
    point:
      'Fast retrieval casts a wide net; a cross-encoder reads each candidate with the question and sorts them properly. It can only promote what retrieval found.',
    nodes: [
      { id: 'q', label: 'Question', shape: 'user', at: [X[0], 80] },
      { id: 'ret', label: 'Hybrid search', shape: 'proc', at: [X[1], 80], sub: 'fast, approximate' },
      { id: 'pool', label: 'Candidates', shape: 'doc', at: [X[2], 10], sub: '50 chunks' },
      { id: 'ce', label: 'Cross-encoder', shape: 'model', at: [X[2], 150], sub: 'reads Q + chunk' },
      { id: 'out', label: 'Top 5', shape: 'db', at: [X[3], 80], sub: 'sent to the model' },
    ],
    edges: [
      { from: 'q', to: 'ret' }, { from: 'ret', to: 'pool' }, { from: 'pool', to: 'ce' },
      { from: 'q', to: 'ce' }, { from: 'ce', to: 'out' },
    ],
    scenes: [
      { caption: 'Hybrid search returns 50 candidates in milliseconds, using vectors computed ahead of time.',
        flow: ['q->ret', 'ret->pool'] },
      { caption: 'The evidence is in there — but at rank 9. Only the top 5 go to the model, so it would be lost.',
        focus: ['pool'], annotate: [{ on: 'pool', text: 'evidence at #9' }], mark: [{ on: 'pool', tone: 'warn' }] },
      { caption: 'A cross-encoder reads the question and each candidate together, and scores how well they match.',
        flow: ['pool->ce', 'q->ce'] },
      { caption: 'Sorted by those scores, the evidence climbs to #2 and makes the cut.',
        flow: ['ce->out'], annotate: [{ on: 'out', text: 'evidence at #2' }], mark: [{ on: 'out', tone: 'good' }] },
      { caption: 'The limit: if retrieval never found the evidence, no reranker can bring it back. Measure recall@50 too.',
        focus: ['ret', 'pool'] },
    ],
  },

  // ─────────────────────────────────────────────── s3.6 query rewriting
  {
    id: 'anim-query-rewriting',
    title: 'Rewriting the question before searching',
    tier: 'T1',
    point:
      'Follow-ups can’t be searched as-is. Rewrite them into standalone questions — optionally several phrasings, fused with RRF — and keep the user’s own words for the final prompt.',
    nodes: [
      { id: 'hist', label: 'Conversation', shape: 'doc', at: [X[0], 20], sub: '"notice period?"' },
      { id: 'msg', label: 'Follow-up', shape: 'user', at: [X[0], 130], sub: '"and for managers?"' },
      { id: 'rw', label: 'Rewriter', shape: 'model', at: [X[1], 75], sub: 'small model' },
      { id: 'q1', label: 'Standalone', shape: 'doc', at: [X[2], 5], sub: 'notice, managers' },
      { id: 'q2', label: 'Phrasing 2', shape: 'doc', at: [X[2], 75], sub: 'resignation notice' },
      { id: 'q3', label: 'Phrasing 3', shape: 'doc', at: [X[2], 145], sub: 'M1/M2 grade notice' },
      { id: 'fuse', label: 'Search + RRF', shape: 'proc', at: [X[3], 75] },
    ],
    edges: [
      { from: 'hist', to: 'rw' }, { from: 'msg', to: 'rw' }, { from: 'rw', to: 'q1' },
      { from: 'rw', to: 'q2' }, { from: 'rw', to: 'q3' },
      { from: 'q1', to: 'fuse' }, { from: 'q2', to: 'fuse' }, { from: 'q3', to: 'fuse' },
    ],
    scenes: [
      { caption: '"And for managers?" can’t be searched on its own — it means nothing without the conversation.',
        focus: ['msg'], mark: [{ on: 'msg', tone: 'warn' }] },
      { caption: 'A small model rewrites it using the conversation: "What is the notice period for managers?"',
        flow: ['hist->rw', 'msg->rw', 'rw->q1'] },
      { caption: 'Multi-query: it can also write a couple of different phrasings of the same question.',
        flow: ['rw->q2', 'rw->q3'] },
      { caption: 'Search with each, then fuse the rankings with RRF. Evidence one phrasing misses, another finds.',
        flow: ['q1->fuse', 'q2->fuse', 'q3->fuse'], mark: [{ on: 'fuse', tone: 'good' }] },
      { caption: 'The final prompt still gets the user’s own words. The rewrite is only for searching.',
        annotate: [{ on: 'msg', text: 'sent to the model' }] },
    ],
  },
  // ─────────────────────────────────────────────── s3.7 lost in the middle
  {
    id: 'anim-lost-in-middle',
    title: 'Lost in the middle',
    tier: 'T2',
    point:
      'Models use evidence at the start and end of a long context better than in the middle. Send fewer, better chunks, put the best first and the question last.',
    nodes: [
      { id: 'first', label: 'Start', shape: 'doc', at: [X[0], 60] },
      { id: 'mid', label: 'Middle', shape: 'doc', at: [X[1], 60] },
      { id: 'end', label: 'End', shape: 'doc', at: [X[2], 60] },
      { id: 'q', label: 'Question', shape: 'user', at: [X[3], 60], sub: 'always last' },
    ],
    edges: [
      { from: 'first', to: 'mid', plain: true }, { from: 'mid', to: 'end', plain: true },
      { from: 'end', to: 'q', plain: true },
    ],
    scenes: [
      { caption: 'Retrieved chunks sit in the prompt one after another, with the question at the end.' },
      { caption: 'A 2023 study moved the one useful passage through the context: answers were best with it near the start or end, and worst in the middle.' },
      { caption: 'Drag the passage’s position and the number of chunks. More chunks make a deeper middle.' },
      { caption: 'Newer models dip much less — but the fix is the same: rerank, send fewer chunks, best first, question last.' },
    ],
    knobs: [
      { id: 'n', label: 'Chunks in the prompt', min: 4, max: 20, step: 1, default: 10 },
      { id: 'pos', label: 'Position of the key passage', min: 1, max: 20, step: 1, default: 5 },
    ],
    dynamicLabels: (k) => {
      const a = Math.ceil(k.n / 3);
      const b = Math.floor((2 * k.n) / 3);
      return { 'first.sub': `#1–#${a}`, 'mid.sub': `#${a + 1}–#${b}`, 'end.sub': `#${b + 1}–#${k.n}` };
    },
    dynamicMarks: (k) => {
      const p = Math.min(k.pos, k.n);
      const a = Math.ceil(k.n / 3);
      const b = Math.floor((2 * k.n) / 3);
      const where = p <= a ? 'first' : p <= b ? 'mid' : 'end';
      return [{ on: where, tone: where === 'mid' ? 'bad' : 'good' }];
    },
    readout: [
      { label: 'key passage', expr: (k) => `position ${Math.min(k.pos, k.n)} of ${k.n}` },
      { label: 'answer accuracy', expr: (k) => `~${middleAccuracy(k.n, k.pos).toFixed(0)}% (illustrative, older-model shape)` },
    ],
  },

  // ─────────────────────────────────────────────── s3.7 routing
  {
    id: 'anim-rag-router',
    title: 'Routing before retrieving',
    tier: 'T1',
    point:
      'Not every message is a lookup. A router sends greetings, lookups, personal-data questions and unclear messages down different paths — and early retrieval hides its delay.',
    nodes: [
      { id: 'msg', label: 'Message', shape: 'user', at: [X[0], 100] },
      { id: 'router', label: 'Router', shape: 'model', at: [X[1], 100], sub: 'rules, then model' },
      { id: 'chat', label: 'Reply directly', shape: 'doc', at: [X[3], 0] },
      { id: 'rag', label: 'RAG answer', shape: 'proc', at: [X[3], 70] },
      { id: 'tool', label: 'Data tool', shape: 'proc', at: [X[3], 140], sub: 'SQL' },
      { id: 'clar', label: 'Ask to clarify', shape: 'doc', at: [X[3], 210] },
      { id: 'ret', label: 'Early retrieval', shape: 'db', at: [X[1], 210], sub: 'runs in parallel' },
    ],
    edges: [
      { from: 'msg', to: 'router' }, { from: 'router', to: 'chat' }, { from: 'router', to: 'rag' },
      { from: 'router', to: 'tool' }, { from: 'router', to: 'clar' },
      { from: 'msg', to: 'ret' }, { from: 'ret', to: 'rag' },
    ],
    scenes: [
      { caption: 'Every message goes to a router first: quick rules, then a small model that picks a path.',
        flow: ['msg->router'] },
      { caption: '"Thanks, that helped!" needs no retrieval. Reply directly.',
        flow: ['router->chat'], annotate: [{ on: 'msg', text: '"thanks!"' }] },
      { caption: '"PL carry fwd?" is terse but it’s a policy lookup. Retrieve and answer.',
        flow: ['router->rag'], annotate: [{ on: 'msg', text: '"PL carry fwd?"' }] },
      { caption: '"How many leave days have I used?" is about the user’s own records: a data tool, not a policy passage.',
        flow: ['router->tool'], annotate: [{ on: 'msg', text: '"days I used?"' }] },
      { caption: '"What about the other one?" with no earlier context: ask a short clarifying question.',
        flow: ['router->clar'], annotate: [{ on: 'msg', text: '"the other one?"' }] },
      { caption: 'To hide the router’s delay, start retrieval at the same time. Keep it for lookups; discard it otherwise.',
        flow: ['msg->ret', 'ret->rag', 'msg->router'], mark: [{ on: 'rag', tone: 'good' }] },
    ],
  },
];
