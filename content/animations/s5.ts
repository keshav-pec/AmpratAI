import type { Animation } from '@/lib/types';

const X = [20, 150, 280, 410];

/** A queue over 30 minutes: arrivals λ/min against workers × 15 jobs/min, optionally capped. */
function queueState(lambda: number, workers: number, capped: boolean) {
  const mu = workers * 15;
  const growth = Math.max(0, lambda - mu);
  const cap = 500;
  const length = capped ? Math.min(cap, growth * 30) : growth * 30;
  const rejected = capped && growth * 30 > cap ? growth : 0;
  return { mu, growth, length, rejected, util: Math.min(1, lambda / mu) };
}

/** Allowed and refused requests over 60 s for a token bucket that starts full. */
function bucketMinute(cap: number, refill: number, rate: number) {
  const offered = rate * 60;
  const allowed = Math.min(offered, cap + refill * 60);
  return { offered, allowed, refused: offered - allowed };
}

/** Average cost (USD) and latency (s) per question with exact and semantic caches. */
function cacheEffect(exactPct: number, semPct: number, promptCache: boolean) {
  const e = exactPct / 100;
  const sm = semPct / 100;
  const full = promptCache ? 0.0132 : 0.0167;
  const fullLat = promptCache ? 1.15 : 1.3;
  const miss = (1 - e) * (1 - sm);
  const usd = e * 0.00001 + (1 - e) * sm * 0.0001 + miss * full;
  const lat = e * 0.02 + (1 - e) * sm * 0.12 + miss * fullLat;
  return { usd, lat, base: 0.0167 };
}

/** Blended cost and quality for a classifier router between Haiku 4.5 and Sonnet 5. */
function routing(sharePct: number, cheapQ: number) {
  const s = sharePct / 100;
  const usd = 0.0007 + s * 0.007 + (1 - s) * 0.014;
  const quality = s * cheapQ + (1 - s) * 95;
  return { usd, quality };
}

export const s5Animations: Animation[] = [
  // ─────────────────────────────────────────────── s5.1 the framework
  {
    id: 'anim-ai-system-anatomy',
    title: 'Eight steps of an AI system design',
    tier: 'T1',
    point:
      'Numbers first, then budgets, then the design — and finish with how quality is measured and how the system is run. Most answers stop at the diagram in the middle.',
    nodes: [
      { id: 'req', label: '1 Requirements', shape: 'doc', at: [X[0], 0], sub: 'as numbers' },
      { id: 'bud', label: '2 Budgets', shape: 'doc', at: [X[1], 0], sub: 'latency and ₹' },
      { id: 'mod', label: '3 Models', shape: 'model', at: [X[2], 0], sub: 'route, fall back' },
      { id: 'ctx', label: '4 Context', shape: 'db', at: [X[3], 0], sub: 'RAG, memory' },
      { id: 'orc', label: '5 Orchestrate', shape: 'proc', at: [X[3], 100], sub: 'queue, stream' },
      { id: 'grd', label: '6 Guardrails', shape: 'proc', at: [X[2], 100], sub: 'limits, tenancy' },
      { id: 'evl', label: '7 Evaluation', shape: 'proc', at: [X[1], 100], sub: 'offline + online' },
      { id: 'ops', label: '8 Operations', shape: 'proc', at: [X[0], 100], sub: 'trace + undo' },
    ],
    edges: [
      { from: 'req', to: 'bud' }, { from: 'bud', to: 'mod' }, { from: 'mod', to: 'ctx' }, { from: 'ctx', to: 'orc' },
      { from: 'orc', to: 'grd' }, { from: 'grd', to: 'evl' }, { from: 'evl', to: 'ops' }, { from: 'ops', to: 'req', plain: true },
    ],
    scenes: [
      { caption: 'Requirements: who, what, how often, how accurate, how fast, how cheap — as numbers.', focus: ['req'] },
      { caption: 'Budgets: split the latency target across steps, and price a request in rupees. They rule designs in or out.',
        focus: ['req', 'bud'], flow: ['req->bud'] },
      { caption: 'Models and context: which model for which job, what gets retrieved, and the token budget.',
        focus: ['bud', 'mod', 'ctx'], flow: ['bud->mod', 'mod->ctx'] },
      { caption: 'Orchestration: what’s synchronous and streamed, what goes on a queue, workflow or agent.',
        focus: ['ctx', 'orc'], flow: ['ctx->orc'] },
      { caption: 'Guardrails: validation, injection defence, permissions, rate limits and tenancy.',
        focus: ['orc', 'grd'], flow: ['orc->grd'] },
      { caption: 'Evaluation: the golden set in CI, sampled production traffic, user feedback.',
        focus: ['grd', 'evl'], flow: ['grd->evl'] },
      { caption: 'Operations: traces, dashboards, alerts, rollback and spend caps — and what you learn feeds the next requirements.',
        focus: ['evl', 'ops', 'req'], flow: ['evl->ops', 'ops->req'] },
      { caption: 'Say the framework out loud at the start of an interview — then use it as your clock.',
        flow: ['req->bud', 'bud->mod', 'mod->ctx', 'ctx->orc', 'orc->grd', 'grd->evl', 'evl->ops'] },
    ],
  },
  // ─────────────────────────────────────────────── s5.2 queues
  {
    id: 'anim-queue-backpressure',
    title: 'Queues, capacity and backpressure',
    tier: 'T2',
    point:
      'When arrivals outpace workers, a queue grows every minute without limit. Scale on queue depth — and cap it, so overload becomes a clear 429 instead of hours of delay.',
    nodes: [
      { id: 'api', label: 'API', shape: 'user', at: [X[0], 70] },
      { id: 'queue', label: 'Queue', shape: 'db', at: [X[1], 70] },
      { id: 'workers', label: 'Workers', shape: 'proc', at: [X[2], 70] },
      { id: 'done', label: 'Done', shape: 'doc', at: [X[3], 70] },
      { id: 'reject', label: '429 Retry-After', shape: 'doc', at: [X[1], 170] },
    ],
    edges: [
      { from: 'api', to: 'queue' }, { from: 'queue', to: 'workers' }, { from: 'workers', to: 'done' },
      { from: 'queue', to: 'reject' },
    ],
    scenes: [
      { caption: 'Jobs arrive at λ per minute and wait in the queue.', flow: ['api->queue'] },
      { caption: 'Workers take them off at their combined throughput μ — here, 15 jobs a minute each.',
        flow: ['queue->workers', 'workers->done'] },
      { caption: 'Below capacity the queue stays short. Drag arrivals above capacity: it grows every minute, without limit.' },
      { caption: 'Backpressure: cap the queue. Past the cap, new jobs get a 429 with Retry-After instead of an ever-longer wait.',
        flow: ['queue->reject'] },
    ],
    knobs: [
      { id: 'lambda', label: 'Arrivals (jobs/min)', min: 10, max: 300, step: 10, default: 120 },
      { id: 'workers', label: 'Workers', min: 1, max: 20, step: 1, default: 8 },
      { id: 'cap', label: 'Cap the queue (0/1)', min: 0, max: 1, step: 1, default: 0 },
    ],
    dynamicLabels: (k) => {
      const q = queueState(k.lambda, k.workers, k.cap === 1);
      return {
        'api.sub': `${k.lambda}/min`,
        'queue.sub': `${Math.round(q.length).toLocaleString('en-IN')} at 30 min`,
        'workers.sub': `${k.workers} × 15/min`,
        'done.sub': `${Math.min(k.lambda, q.mu)}/min`,
        'reject.sub': q.rejected ? `${q.rejected}/min refused` : 'none',
      };
    },
    dynamicMarks: (k) => {
      const q = queueState(k.lambda, k.workers, k.cap === 1);
      return [
        { on: 'queue', tone: q.growth === 0 ? (q.util > 0.85 ? 'warn' : 'good') : 'bad' },
        ...(q.rejected ? [{ on: 'reject', tone: 'warn' as const }] : []),
      ];
    },
    readout: [
      {
        label: 'utilisation',
        expr: (k) => `${Math.round(queueState(k.lambda, k.workers, false).util * 100)}% of ${k.workers * 15} jobs/min`,
      },
      {
        label: 'queue',
        expr: (k) => {
          const q = queueState(k.lambda, k.workers, k.cap === 1);
          return q.growth === 0 ? 'stays short' : `grows by ${q.growth} jobs every minute${k.cap ? ', capped at 500' : ''}`;
        },
      },
    ],
  },

  // ─────────────────────────────────────────────── s5.2 token bucket
  {
    id: 'anim-token-bucket',
    title: 'A token bucket per tenant',
    tier: 'T2',
    point:
      'The refill rate is the sustained limit; the capacity is the burst. A quiet tenant can burst, a busy one settles to the refill rate, and the excess gets a clear 429.',
    nodes: [
      { id: 'req', label: 'Requests', shape: 'user', at: [X[0], 70] },
      { id: 'bucket', label: 'Bucket', shape: 'db', at: [X[1], 70] },
      { id: 'refill', label: 'Refill', shape: 'proc', at: [X[1], 170] },
      { id: 'ok', label: 'Allowed', shape: 'doc', at: [X[3], 20] },
      { id: 'no', label: '429', shape: 'doc', at: [X[3], 120] },
    ],
    edges: [
      { from: 'req', to: 'bucket' }, { from: 'refill', to: 'bucket' },
      { from: 'bucket', to: 'ok' }, { from: 'bucket', to: 'no' },
    ],
    scenes: [
      { caption: 'Each request spends a token from its tenant’s bucket.', flow: ['req->bucket', 'bucket->ok'] },
      { caption: 'The bucket refills at a steady rate, up to its capacity.', flow: ['refill->bucket'] },
      { caption: 'A tenant that’s been quiet can burst — up to the capacity — then settles to the refill rate.' },
      { caption: 'Drag the request rate above the refill rate. Over a minute, the excess is refused with 429s.',
        flow: ['bucket->no'] },
    ],
    knobs: [
      { id: 'cap', label: 'Capacity (burst)', min: 1, max: 30, step: 1, default: 10 },
      { id: 'refill', label: 'Refill per second', min: 1, max: 5, step: 1, default: 1 },
      { id: 'rate', label: 'Requests per second', min: 0, max: 10, step: 1, default: 3 },
    ],
    dynamicLabels: (k) => {
      const m = bucketMinute(k.cap, k.refill, k.rate);
      return {
        'req.sub': `${k.rate}/s`,
        'bucket.sub': `holds up to ${k.cap}`,
        'refill.sub': `+${k.refill}/s`,
        'ok.sub': `${m.allowed} in 60 s`,
        'no.sub': `${m.refused} in 60 s`,
      };
    },
    dynamicMarks: (k) => {
      const m = bucketMinute(k.cap, k.refill, k.rate);
      return [{ on: 'no', tone: m.refused === 0 ? 'good' : 'warn' }];
    },
    readout: [
      {
        label: 'over one minute',
        expr: (k) => {
          const m = bucketMinute(k.cap, k.refill, k.rate);
          return `${m.offered} offered · ${m.allowed} allowed · ${m.refused} refused`;
        },
      },
      { label: 'sustained limit', expr: (k) => `${k.refill} per second, bursts up to ${k.cap}` },
    ],
  },
  // ─────────────────────────────────────────────── s5.3 cache ladder
  {
    id: 'anim-cache-tiers',
    title: 'The cache ladder',
    tier: 'T2',
    point:
      'Each rung catches some requests and saves most of their cost and time. Provider prompt caching is the safe, always-on rung; response caches need careful keys and measured hit rates.',
    nodes: [
      { id: 'req', label: 'Question', shape: 'user', at: [X[0], 90] },
      { id: 'exact', label: 'Exact cache', shape: 'db', at: [X[1], 20] },
      { id: 'sem', label: 'Semantic cache', shape: 'db', at: [X[2], 20] },
      { id: 'prov', label: 'Model call', shape: 'model', at: [X[3], 20] },
      { id: 'ans', label: 'Answer', shape: 'doc', at: [X[3], 160] },
    ],
    edges: [
      { from: 'req', to: 'exact' }, { from: 'exact', to: 'sem' }, { from: 'sem', to: 'prov' },
      { from: 'exact', to: 'ans' }, { from: 'sem', to: 'ans' }, { from: 'prov', to: 'ans' },
    ],
    scenes: [
      { caption: 'Check the exact-match cache first: the identical question, in the same scope and index version, returns instantly.',
        flow: ['req->exact', 'exact->ans'] },
      { caption: 'Then — only if you’ve measured its false hits — a semantic cache for similar questions, with guards.',
        flow: ['exact->sem', 'sem->ans'] },
      { caption: 'Everything else goes to the model, where provider prompt caching makes the repeated prefix cheaper and faster.',
        flow: ['sem->prov', 'prov->ans'] },
      { caption: 'Drag the hit rates. Each rung saves on what it catches; the model call still dominates the bill.' },
    ],
    knobs: [
      { id: 'e', label: 'Exact hit rate (%)', min: 0, max: 40, step: 5, default: 10 },
      { id: 'sm', label: 'Semantic hit rate (%)', min: 0, max: 30, step: 5, default: 0 },
      { id: 'pc', label: 'Prompt caching (0/1)', min: 0, max: 1, step: 1, default: 1 },
    ],
    dynamicLabels: (k) => {
      const r = cacheEffect(k.e, k.sm, k.pc === 1);
      return {
        'exact.sub': `${k.e}% hits`,
        'sem.sub': k.sm ? `${k.sm}% of the rest` : 'not built',
        'prov.sub': k.pc ? 'prefix cached' : 'no prompt cache',
        'ans.sub': `₹${(r.usd * 88).toFixed(2)} avg`,
      };
    },
    dynamicMarks: (k) => [{ on: 'prov', tone: k.pc ? 'good' : 'warn' }],
    readout: [
      {
        label: 'per question',
        expr: (k) => {
          const r = cacheEffect(k.e, k.sm, k.pc === 1);
          return `₹${(r.usd * 88).toFixed(2)} and ${r.lat.toFixed(2)} s on average (illustrative)`;
        },
      },
      {
        label: 'saving vs no caching',
        expr: (k) => {
          const r = cacheEffect(k.e, k.sm, k.pc === 1);
          return `${Math.round((1 - r.usd / r.base) * 100)}%`;
        },
      },
    ],
  },

  // ─────────────────────────────────────────────── s5.3 model routing
  {
    id: 'anim-model-routing',
    title: 'Routing between a cheap and a strong model',
    tier: 'T2',
    point:
      'Send easy requests to the cheaper model and hard ones to the stronger one. Cost falls with every share you route — quality falls only if the cheap model struggles on what it gets. Measure both.',
    nodes: [
      { id: 'req', label: 'Requests', shape: 'user', at: [X[0], 90] },
      { id: 'router', label: 'Router', shape: 'proc', at: [X[1], 90], sub: 'small model' },
      { id: 'cheap', label: 'Haiku 4.5', shape: 'model', at: [X[2], 20] },
      { id: 'strong', label: 'Sonnet 5', shape: 'model', at: [X[2], 160] },
      { id: 'out', label: 'Blended', shape: 'db', at: [X[3], 90] },
    ],
    edges: [
      { from: 'req', to: 'router' }, { from: 'router', to: 'cheap' }, { from: 'router', to: 'strong' },
      { from: 'cheap', to: 'out' }, { from: 'strong', to: 'out' },
    ],
    scenes: [
      { caption: 'A router labels each request: easy or hard.', flow: ['req->router'] },
      { caption: 'Easy requests go to the cheaper model; hard ones to the stronger model.',
        flow: ['router->cheap', 'router->strong', 'cheap->out', 'strong->out'] },
      { caption: 'Drag the share. Cost falls as more goes cheap — quality falls if the cheap model struggles on the traffic it gets.' },
      { caption: 'The right setting is a measured trade: golden-set quality per route, cost per request and p95.' },
    ],
    knobs: [
      { id: 'share', label: 'Share routed to Haiku (%)', min: 0, max: 100, step: 10, default: 70 },
      { id: 'q', label: 'Haiku quality on that traffic (%)', min: 70, max: 100, step: 1, default: 92 },
    ],
    dynamicLabels: (k) => {
      const r = routing(k.share, k.q);
      return {
        'cheap.sub': `${k.share}% · $0.007`,
        'strong.sub': `${100 - k.share}% · $0.014`,
        'out.sub': `$${r.usd.toFixed(4)} · ${r.quality.toFixed(1)}%`,
      };
    },
    dynamicMarks: (k) => {
      const r = routing(k.share, k.q);
      return [{ on: 'out', tone: r.quality >= 93 ? 'good' : r.quality >= 90 ? 'warn' : 'bad' }];
    },
    readout: [
      {
        label: 'cost per request',
        expr: (k) => `$${routing(k.share, k.q).usd.toFixed(4)} vs $0.0140 all-Sonnet (router call included)`,
      },
      {
        label: 'blended quality',
        expr: (k) => `${routing(k.share, k.q).quality.toFixed(1)}% (strong model: 95%, illustrative)`,
      },
    ],
  },
  // ─────────────────────────────────────────────── s5.4 trace waterfall
  {
    id: 'anim-trace-waterfall',
    title: 'Reading a trace',
    tier: 'T1',
    point:
      'A trace is a tree of timed spans. Laid out by start time, it shows what ran in parallel, what waited for what, and which step to shorten.',
    nodes: [
      { id: 'req', label: 'POST /chat', shape: 'user', at: [20, 0], sub: '1,420 ms' },
      { id: 'auth', label: 'auth', shape: 'proc', at: [20, 45], sub: '20 ms' },
      { id: 'route', label: 'route', shape: 'model', at: [38, 90], sub: '310 ms · Haiku' },
      { id: 'ret', label: 'retrieve', shape: 'proc', at: [38, 135], sub: '290 ms' },
      { id: 'emb', label: 'embed', shape: 'proc', at: [38, 180], sub: '80 ms' },
      { id: 'srch', label: 'search', shape: 'db', at: [110, 225], sub: '60 ms' },
      { id: 'rr', label: 'rerank 30 → 6', shape: 'model', at: [164, 270], sub: '150 ms' },
      { id: 'gen', label: 'generate', shape: 'model', at: [299, 315], sub: 'TTFT 780 ms' },
    ],
    edges: [
      { from: 'emb', to: 'srch' }, { from: 'srch', to: 'rr' }, { from: 'rr', to: 'gen' },
    ],
    scenes: [
      { caption: 'One request, one trace. Each step is a span, placed here by when it started.', focus: ['req'] },
      { caption: 'Routing runs in parallel with retrieval, so its 310 ms doesn’t add to the wait.',
        focus: ['route', 'ret'], annotate: [{ on: 'route', text: 'parallel' }] },
      { caption: 'Retrieval’s children — embed, search, rerank — each record their time and details: filters, candidates, scores.',
        focus: ['ret', 'emb', 'srch', 'rr'] },
      { caption: 'The answer starts after reranking. Its span records model, prompt version, tokens, cost and time to first token.',
        focus: ['gen'], mark: [{ on: 'gen', tone: 'good' }] },
      { caption: 'The critical path: auth, then embed → search → rerank → generate. Shortening those steps is what cuts latency.',
        flow: ['emb->srch', 'srch->rr', 'rr->gen'] },
    ],
  },
  // ─────────────────────────────────────────────── s5.5 canary
  {
    id: 'anim-canary-rollback',
    title: 'A canary with automatic rollback',
    tier: 'T2',
    point:
      'Send a small, stable share of users to the new version, compare it with the old one over the same window, and let pre-agreed rules roll it back automatically.',
    nodes: [
      { id: 'users', label: 'Users', shape: 'user', at: [X[0], 90] },
      { id: 'flag', label: 'Flag', shape: 'proc', at: [X[1], 90] },
      { id: 'old', label: 'Prompt v14', shape: 'model', at: [X[2], 20] },
      { id: 'new', label: 'Prompt v15', shape: 'model', at: [X[2], 160] },
      { id: 'check', label: 'Rollback rules', shape: 'proc', at: [X[3], 90] },
    ],
    edges: [
      { from: 'users', to: 'flag' }, { from: 'flag', to: 'old' }, { from: 'flag', to: 'new' },
      { from: 'old', to: 'check' }, { from: 'new', to: 'check' },
    ],
    scenes: [
      { caption: 'A flag sends a small, stable share of users — chosen by a hash of their ID — to the new version.',
        flow: ['users->flag', 'flag->old', 'flag->new'] },
      { caption: 'Both versions are measured over the same window: errors, p95, cost and judged quality.',
        flow: ['old->check', 'new->check'] },
      { caption: 'The rules were agreed in advance: errors above 2× baseline, or judged faithfulness down more than 5 points → roll back.' },
      { caption: 'Drag the knobs and watch the checker decide. No one has to be awake for it.' },
    ],
    knobs: [
      { id: 'share', label: 'Canary share (%)', min: 1, max: 50, step: 1, default: 5 },
      { id: 'err', label: 'Canary error rate (× baseline)', min: 1, max: 5, step: 0.5, default: 1 },
      { id: 'drop', label: 'Faithfulness drop (points)', min: 0, max: 10, step: 1, default: 1 },
    ],
    dynamicLabels: (k) => {
      const bad = k.err > 2 || k.drop > 5;
      return {
        'flag.sub': bad ? 'v15 → 0%' : `${k.share}% → v15`,
        'old.sub': bad ? '100%' : `${100 - k.share}%`,
        'new.sub': bad ? 'rolled back' : `${k.share}%`,
        'check.sub': bad ? 'rule fired' : 'all pass',
      };
    },
    dynamicMarks: (k) => {
      const bad = k.err > 2 || k.drop > 5;
      return [{ on: 'check', tone: bad ? 'bad' : 'good' }, { on: 'new', tone: bad ? 'bad' : 'good' }];
    },
    readout: [
      {
        label: 'decision',
        expr: (k) =>
          k.err > 2
            ? `roll back: errors at ${k.err}× baseline`
            : k.drop > 5
              ? `roll back: faithfulness down ${k.drop} points`
              : `keep going — next step ${k.share < 25 ? '25%' : k.share < 50 ? '50%' : '100%'} after the window`,
      },
    ],
  },
  // ─────────────────────────────────────────────── s5.6 tenant isolation
  {
    id: 'anim-tenant-isolation-bug',
    title: 'The forgotten tenant filter',
    tier: 'T2',
    point:
      'One query without the tenant filter, and one customer’s documents answer another’s questions. Take the tenant from auth, and let row-level security catch the query that forgets.',
    nodes: [
      { id: 'user', label: 'Tenant B user', shape: 'user', at: [X[0], 90] },
      { id: 'q', label: 'Search query', shape: 'proc', at: [X[1], 90] },
      { id: 'db', label: 'Chunks table', shape: 'db', at: [X[2], 90] },
      { id: 'a', label: 'Tenant A doc', shape: 'doc', at: [X[3], 20], sub: 'secret pricing' },
      { id: 'b', label: 'Tenant B docs', shape: 'doc', at: [X[3], 160] },
    ],
    edges: [
      { from: 'user', to: 'q' }, { from: 'q', to: 'db' }, { from: 'db', to: 'a' }, { from: 'db', to: 'b' },
    ],
    scenes: [
      { caption: 'A user from tenant B asks: "What’s the price per seat?"', flow: ['user->q'] },
      { caption: 'The retrieval query should filter by tenant — taken from the login, never from the request.',
        flow: ['q->db', 'db->b'] },
      { caption: 'Now a new code path forgets the filter. Tenant A’s pricing ranks first, and the model helpfully summarises it.',
        flow: ['q->db', 'db->a'] },
      { caption: 'Row-level security makes the database itself enforce the tenant, so a forgotten filter returns nothing extra. Try the knobs.' },
    ],
    knobs: [
      { id: 'filter', label: 'Query has tenant filter (0/1)', min: 0, max: 1, step: 1, default: 1 },
      { id: 'rls', label: 'Row-level security (0/1)', min: 0, max: 1, step: 1, default: 0 },
    ],
    dynamicLabels: (k) => ({
      'q.sub': k.filter ? 'WHERE tenant = B' : 'no tenant filter',
      'db.sub': k.rls ? 'RLS on' : 'RLS off',
    }),
    dynamicMarks: (k) => [
      { on: 'a', tone: !k.filter && !k.rls ? 'bad' : 'good' },
      { on: 'q', tone: k.filter ? 'good' : 'warn' },
    ],
    readout: [
      {
        label: 'tenant A’s document',
        expr: (k) =>
          k.filter ? 'blocked by the query’s filter' : k.rls ? 'blocked by row-level security (the backstop)' : 'LEAKED into tenant B’s answer',
      },
      { label: 'the test that catches it', expr: () => 'seed two tenants, ask as B, assert nothing of A appears' },
    ],
  },
  // ─────────────────────────────────────────────── s5.7 pipeline with eval gate
  {
    id: 'anim-eval-ci-gate',
    title: 'A pipeline with an eval gate',
    tier: 'T2',
    point:
      'Cheap checks first, then the eval gate, then build, staging and a person’s approval. A quality drop beyond the tolerance stops the release before anything is deployed.',
    nodes: [
      { id: 'pr', label: 'Pull request', shape: 'user', at: [X[0], 90] },
      { id: 'checks', label: 'Cheap checks', shape: 'proc', at: [X[1], 20], sub: 'lint + tests' },
      { id: 'gate', label: 'Eval gate', shape: 'proc', at: [X[1], 160] },
      { id: 'build', label: 'Build image', shape: 'proc', at: [X[2], 90] },
      { id: 'stage', label: 'Staging', shape: 'db', at: [X[3], 20] },
      { id: 'prod', label: 'Production', shape: 'db', at: [X[3], 160] },
    ],
    edges: [
      { from: 'pr', to: 'checks' }, { from: 'checks', to: 'gate' }, { from: 'gate', to: 'build' },
      { from: 'build', to: 'stage' }, { from: 'stage', to: 'prod' },
    ],
    scenes: [
      { caption: 'A pull request runs the cheap checks first: lint, types, unit tests.', flow: ['pr->checks'] },
      { caption: 'Then the eval gate: retrieval metrics, assertions and a judged subset, compared with main’s baseline.',
        flow: ['checks->gate'] },
      { caption: 'Only if the gate passes is an image built and deployed to staging, where smoke tests run.',
        flow: ['gate->build', 'build->stage'] },
      { caption: 'Production waits for a person’s approval.', flow: ['stage->prod'] },
      { caption: 'Drag the quality drop past the tolerance. The gate fails — and nothing after it runs.' },
    ],
    knobs: [
      { id: 'drop', label: 'recall@5 drop in this PR (points)', min: 0, max: 10, step: 1, default: 0 },
      { id: 'tol', label: 'Gate tolerance (points)', min: 1, max: 5, step: 1, default: 2 },
    ],
    dynamicLabels: (k) => {
      const pass = k.drop <= k.tol;
      return {
        'gate.sub': `drop ${k.drop} · max ${k.tol}`,
        'build.sub': pass ? 'runs' : 'skipped',
        'stage.sub': pass ? 'smoke tested' : 'skipped',
        'prod.sub': pass ? 'after approval' : 'skipped',
      };
    },
    dynamicMarks: (k) => {
      const pass = k.drop <= k.tol;
      return pass
        ? [{ on: 'gate', tone: 'good' }]
        : [{ on: 'gate', tone: 'bad' }, { on: 'build', tone: 'warn' }, { on: 'stage', tone: 'warn' }, { on: 'prod', tone: 'warn' }];
    },
    readout: [
      { label: 'gate', expr: (k) => (k.drop <= k.tol ? 'passes — the release continues' : 'fails — the PR can’t merge or deploy') },
      { label: 'tolerance', expr: () => 'set just above the run-to-run noise you measured' },
    ],
  },
  // ─────────────────────────────────────────────── s5.8 LoRA
  {
    id: 'anim-lora-adapter',
    title: 'LoRA: a small add-on to a frozen matrix',
    tier: 'T2',
    point:
      'LoRA leaves the big weight matrix frozen and trains two thin matrices whose product is added to it. At rank 16, that’s under 1% of the numbers — so it fits on a small GPU and saves as a small file.',
    nodes: [
      { id: 'x', label: 'Input', shape: 'user', at: [X[0], 90] },
      { id: 'w', label: 'Frozen W', shape: 'db', at: [X[1], 20] },
      { id: 'a', label: 'A (down)', shape: 'proc', at: [X[1], 160] },
      { id: 'b', label: 'B (up)', shape: 'proc', at: [X[2], 160] },
      { id: 'out', label: 'W·x + B·A·x', shape: 'model', at: [X[3], 90] },
    ],
    edges: [
      { from: 'x', to: 'w' }, { from: 'x', to: 'a' }, { from: 'a', to: 'b' },
      { from: 'w', to: 'out' }, { from: 'b', to: 'out' },
    ],
    scenes: [
      { caption: 'A layer multiplies its input by a large weight matrix W. In LoRA, W stays frozen.',
        flow: ['x->w', 'w->out'], mark: [{ on: 'w', tone: 'good' }] },
      { caption: 'Beside it, two thin matrices: A squeezes the input down to r numbers, B expands it back.',
        flow: ['x->a', 'a->b'] },
      { caption: 'Their product is added to W’s output. Only A and B are trained.',
        flow: ['b->out', 'w->out'] },
      { caption: 'Drag the size and the rank: the trainable share stays tiny. The adapter saves as a small file you load on top of the base model.' },
    ],
    knobs: [
      { id: 'd', label: 'Matrix size d (d × d)', min: 1024, max: 8192, step: 1024, default: 4096 },
      { id: 'r', label: 'Rank r', min: 1, max: 64, step: 1, default: 16 },
    ],
    dynamicLabels: (k) => ({
      'w.sub': `${k.d.toLocaleString('en-IN')} × ${k.d.toLocaleString('en-IN')}`,
      'a.sub': `${k.r} × ${k.d.toLocaleString('en-IN')}`,
      'b.sub': `${k.d.toLocaleString('en-IN')} × ${k.r}`,
      'out.sub': `trains ${((2 * k.d * k.r) / (k.d * k.d) * 100).toFixed(2)}%`,
    }),
    readout: [
      { label: 'full matrix', expr: (k) => `${(k.d * k.d).toLocaleString('en-IN')} numbers` },
      {
        label: 'LoRA trains',
        expr: (k) => `${(2 * k.d * k.r).toLocaleString('en-IN')} numbers (${((2 * k.r) / k.d * 100).toFixed(2)}%)`,
      },
    ],
  },
];
