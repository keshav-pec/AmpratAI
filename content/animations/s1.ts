import type { Animation } from '@/lib/types';

const X = [20, 150, 280, 410];
const Y = [26, 96, 166, 236];

export const s1Animations: Animation[] = [
  // ─────────────────────────────────────────────── s1.3 async
  {
    id: 'anim-event-loop',
    title: 'The event loop',
    tier: 'T1',
    point:
      'await parks a task and lets the loop run something else. A blocking call does not park — it freezes everything, exactly like it would in Node.',
    nodes: [
      { id: 'loop', label: 'Event loop', shape: 'proc', at: [X[1], Y[0]], sub: 'one thread' },
      { id: 'a', label: 'fetch A', shape: 'doc', at: [X[0], Y[1]], sub: 'network wait' },
      { id: 'b', label: 'fetch B', shape: 'doc', at: [X[1], Y[1]], sub: 'network wait' },
      { id: 'c', label: 'fetch C', shape: 'doc', at: [X[2], Y[1]], sub: 'network wait' },
      { id: 'blk', label: 'time.sleep(2)', shape: 'doc', at: [X[3], Y[1]], sub: 'blocking' },
      { id: 'done', label: 'all results', shape: 'db', at: [X[1], Y[2]] },
    ],
    edges: [
      { from: 'loop', to: 'a' }, { from: 'loop', to: 'b' },
      { from: 'loop', to: 'c' }, { from: 'loop', to: 'blk' },
      { from: 'b', to: 'done' },
    ],
    scenes: [
      { caption: 'One thread. Three network calls and one blocking call, all waiting to run.',
        focus: ['loop'] },
      { caption: 'The loop starts fetch A. A hits await and parks — it is waiting on the network, not on the CPU.',
        focus: ['loop', 'a'], flow: ['loop->a'], annotate: [{ on: 'a', text: 'parked' }] },
      { caption: 'Because A parked, the loop is free. It starts B, then C. All three are now in flight at once.',
        focus: ['loop', 'a', 'b', 'c'], flow: ['loop->b', 'loop->c'],
        annotate: [{ on: 'b', text: 'parked' }, { on: 'c', text: 'parked' }] },
      { caption: 'Now the blocking call. time.sleep does not park. It holds the thread.',
        focus: ['blk'], mark: [{ on: 'blk', tone: 'bad' }],
        annotate: [{ on: 'blk', text: 'holds the thread' }] },
      { caption: 'Nothing else can run for two seconds. Your whole server is stuck — same failure you know from Node.',
        mark: [{ on: 'blk', tone: 'bad' }, { on: 'loop', tone: 'bad' }],
        annotate: [{ on: 'loop', text: 'frozen' }] },
      { caption: 'Use the async version of every library, and the results come back together.',
        focus: ['done', 'b'], flow: ['b->done'], mark: [{ on: 'done', tone: 'good' }] },
    ],
  },
  {
    id: 'anim-semaphore',
    title: 'Bounded concurrency',
    tier: 'T2',
    point:
      'Unlimited concurrency is slower than limited concurrency once the server starts rejecting you. The fastest setting is not the highest one.',
    nodes: [
      { id: 'q', label: '200 requests', shape: 'doc', at: [X[0], Y[1]] },
      { id: 'gate', label: 'Semaphore', shape: 'proc', at: [X[1], Y[1]], sub: 'limit 10' },
      { id: 'srv', label: 'API server', shape: 'model', at: [X[2], Y[1]], sub: 'accepts 20/s' },
      { id: 'ok', label: 'succeeded', shape: 'db', at: [X[3], Y[0]] },
      { id: 'err', label: '429 rejected', shape: 'doc', at: [X[3], Y[2]] },
    ],
    edges: [
      { from: 'q', to: 'gate' }, { from: 'gate', to: 'srv' },
      { from: 'srv', to: 'ok' }, { from: 'srv', to: 'err' },
    ],
    scenes: [
      { caption: 'Two hundred requests to make. The gate decides how many are in flight at once.',
        focus: ['q', 'gate'], flow: ['q->gate'] },
      { caption: 'Drag the limit. Watch what happens above the server’s capacity.',
        flow: ['gate->srv'], focus: ['gate', 'srv'] },
      { caption: 'Too high and the server rejects you. Every rejection is a retry, and retries cost more time than waiting politely would have.',
        flow: ['srv->err'], mark: [{ on: 'err', tone: 'bad' }] },
      { caption: 'Just under capacity, nothing is rejected and everything finishes sooner.',
        flow: ['srv->ok'], mark: [{ on: 'ok', tone: 'good' }] },
    ],
    knobs: [{ id: 'limit', label: 'Concurrency', min: 1, max: 60, step: 1, default: 10 }],
    dynamicLabels: (k) => ({ gate: `Semaphore(${k.limit})` }),
    readout: [
      {
        label: 'in flight',
        expr: (k) => `${k.limit}`,
      },
      {
        label: 'rejected (429)',
        expr: (k) => (k.limit > 20 ? `${Math.round((k.limit - 20) * 6)} requests` : 'none'),
      },
      {
        label: 'time to finish 200',
        expr: (k) => {
          const eff = Math.min(k.limit, 20);
          const base = 200 / eff;
          const penalty = k.limit > 20 ? (k.limit - 20) * 0.45 : 0;
          return `${(base + penalty).toFixed(1)}s`;
        },
      },
    ],
  },
  {
    id: 'anim-backoff',
    title: 'Retries and jitter',
    tier: 'T2',
    point:
      'Without jitter, every client retries at the same instant and re-kills the server you were waiting for. Jitter scatters them.',
    nodes: [
      { id: 'cli', label: '500 clients', shape: 'user', at: [X[0], Y[1]] },
      { id: 'w1', label: 'wait 1s', shape: 'doc', at: [X[1], Y[0]] },
      { id: 'w2', label: 'wait 2s', shape: 'doc', at: [X[1], Y[1]] },
      { id: 'w3', label: 'wait 4s', shape: 'doc', at: [X[1], Y[2]] },
      { id: 'srv', label: 'Server', shape: 'model', at: [X[2], Y[1]], sub: 'recovering' },
      { id: 'out', label: 'outcome', shape: 'db', at: [X[3], Y[1]] },
    ],
    edges: [
      { from: 'cli', to: 'w1' }, { from: 'cli', to: 'w2' }, { from: 'cli', to: 'w3' },
      { from: 'w1', to: 'srv' }, { from: 'w2', to: 'srv' }, { from: 'w3', to: 'srv' },
      { from: 'srv', to: 'out' },
    ],
    scenes: [
      { caption: 'The server fails. Five hundred clients all decide to retry.', focus: ['cli', 'srv'],
        mark: [{ on: 'srv', tone: 'bad' }] },
      { caption: 'Exponential backoff: wait 1s, then 2s, then 4s. Sensible — but every client waits the same 1s.',
        focus: ['w1', 'w2', 'w3'], flow: ['cli->w1'] },
      { caption: 'So all five hundred arrive at the same instant. The server was almost up, and now it is down again.',
        flow: ['w1->srv'], mark: [{ on: 'srv', tone: 'bad' }],
        annotate: [{ on: 'srv', text: 'killed again' }] },
      { caption: 'Add jitter — a random amount on each wait — and the same retries spread out across the window.',
        flow: ['w1->srv', 'w2->srv', 'w3->srv'], mark: [{ on: 'srv', tone: 'warn' }] },
      { caption: 'The server absorbs them and recovers. Same retry count, different arrival pattern.',
        flow: ['srv->out'], mark: [{ on: 'out', tone: 'good' }] },
    ],
    knobs: [
      { id: 'clients', label: 'Clients', min: 50, max: 1000, step: 50, default: 500 },
      { id: 'jitter', label: 'Jitter', min: 0, max: 1, step: 1, default: 0 },
    ],
    readout: [
      {
        label: 'peak arrivals in one second',
        expr: (k) => (k.jitter ? `about ${Math.round(k.clients / 4)}` : `all ${k.clients}`),
      },
      { label: 'server survives', expr: (k) => (k.jitter ? 'yes' : 'no') },
    ],
  },

  // ─────────────────────────────────────────────── s1.2 pydantic
  {
    id: 'anim-pydantic',
    title: 'Validation at the boundary',
    tier: 'T1',
    point:
      'The validation error is structured data, not a crash. Later you will hand that exact error back to a model and ask it to fix its own output.',
    nodes: [
      { id: 'raw', label: 'raw JSON', shape: 'doc', at: [X[0], Y[1]], sub: 'from anywhere' },
      { id: 'model', label: 'Resume model', shape: 'proc', at: [X[1], Y[1]] },
      { id: 'name', label: 'name: str', shape: 'doc', at: [X[2], Y[0]] },
      { id: 'years', label: 'years: int', shape: 'doc', at: [X[2], Y[1]] },
      { id: 'email', label: 'email: str', shape: 'doc', at: [X[2], Y[2]] },
      { id: 'out', label: 'typed object', shape: 'db', at: [X[3], Y[1]] },
    ],
    edges: [
      { from: 'raw', to: 'model' },
      { from: 'model', to: 'name' }, { from: 'model', to: 'years' }, { from: 'model', to: 'email' },
      { from: 'years', to: 'out' },
    ],
    scenes: [
      { caption: 'Untrusted JSON arrives. You do not know what is in it.', focus: ['raw'] },
      { caption: 'The model is the boundary. Nothing past this point is unchecked.',
        focus: ['raw', 'model'], flow: ['raw->model'] },
      { caption: 'name is a string. Fine.', focus: ['name'], mark: [{ on: 'name', tone: 'good' }] },
      { caption: 'years came in as the text "5". Pydantic converts it to the number 5 — that is coercion, and you can switch it off.',
        focus: ['years'], mark: [{ on: 'years', tone: 'warn' }],
        annotate: [{ on: 'years', text: '"5" → 5' }] },
      { caption: 'email is missing. Now you get an error object saying exactly which field, and exactly why.',
        focus: ['email'], mark: [{ on: 'email', tone: 'bad' }],
        annotate: [{ on: 'email', text: 'field required' }] },
      { caption: 'Fix it and you get a real typed object. Your editor knows its shape from here on.',
        focus: ['out'], flow: ['years->out'], mark: [{ on: 'out', tone: 'good' }] },
    ],
  },

  // ─────────────────────────────────────────────── s1.6 postgres
  {
    id: 'anim-index',
    title: 'Scan versus index',
    tier: 'T2',
    point:
      'An index on the wrong column order is the same as no index — and the query plan tells you before your users do.',
    nodes: [
      { id: 'q', label: 'WHERE email=?', shape: 'doc', at: [X[0], Y[1]] },
      { id: 'plan', label: 'planner', shape: 'proc', at: [X[1], Y[1]] },
      { id: 'idx', label: 'B-tree index', shape: 'proc', at: [X[2], Y[0]], sub: '3 levels deep' },
      { id: 'tbl', label: 'users table', shape: 'db', at: [X[2], Y[2]] },
      { id: 'row', label: 'the row', shape: 'db', at: [X[3], Y[1]] },
    ],
    edges: [
      { from: 'q', to: 'plan' }, { from: 'plan', to: 'idx' }, { from: 'plan', to: 'tbl' },
      { from: 'idx', to: 'row' }, { from: 'tbl', to: 'row' },
    ],
    scenes: [
      { caption: 'One query, looking for one row by email.', focus: ['q', 'plan'], flow: ['q->plan'] },
      { caption: 'With no index, Postgres reads every single row and checks it. That is a sequential scan.',
        focus: ['tbl'], flow: ['plan->tbl'], mark: [{ on: 'tbl', tone: 'bad' }] },
      { caption: 'With an index, it walks down a tree — about three hops — and jumps straight there.',
        focus: ['idx'], flow: ['plan->idx'], mark: [{ on: 'idx', tone: 'good' }] },
      { caption: 'Same answer either way. The difference is only visible in EXPLAIN ANALYZE, and in your p95.',
        focus: ['row'], flow: ['idx->row'], mark: [{ on: 'row', tone: 'good' }] },
    ],
    knobs: [
      { id: 'rows', label: 'Rows in table', min: 1000, max: 2000000, step: 1000, default: 500000 },
      { id: 'index', label: 'Index', min: 0, max: 1, step: 1, default: 0 },
    ],
    readout: [
      {
        label: 'rows read',
        expr: (k) => (k.index ? '≈ 4' : k.rows.toLocaleString()),
      },
      {
        label: 'roughly',
        expr: (k) => (k.index ? '0.2 ms' : `${Math.max(1, Math.round(k.rows / 12000))} ms`),
      },
    ],
  },

  // ─────────────────────────────────────────────── s1.7 docker
  {
    id: 'anim-docker-layers',
    title: 'Layer order is build speed',
    tier: 'T1',
    point:
      'Copying your code before installing dependencies makes every code change reinstall everything. Reorder two lines and rebuilds go from minutes to seconds.',
    nodes: [
      { id: 'base', label: 'FROM python', shape: 'doc', at: [X[1], Y[0]], sub: 'layer 1' },
      { id: 'copyall', label: 'COPY . .', shape: 'doc', at: [X[1], Y[1]], sub: 'layer 2' },
      { id: 'install', label: 'pip install', shape: 'doc', at: [X[1], Y[2]], sub: 'layer 3' },
      { id: 'edit', label: 'you edit main.py', shape: 'user', at: [X[3], Y[1]] },
      { id: 'fixed', label: 'COPY reqs first', shape: 'proc', at: [X[0], Y[1]] },
    ],
    edges: [
      { from: 'base', to: 'copyall' }, { from: 'copyall', to: 'install' },
      { from: 'edit', to: 'copyall' }, { from: 'fixed', to: 'install' },
    ],
    scenes: [
      { caption: 'A Dockerfile builds top to bottom. Each instruction makes a layer, and layers are cached.',
        focus: ['base', 'copyall', 'install'] },
      { caption: 'Change nothing, rebuild, and every layer is reused. Instant.',
        mark: [{ on: 'base', tone: 'good' }, { on: 'copyall', tone: 'good' }, { on: 'install', tone: 'good' }] },
      { caption: 'Now you edit one line of Python. That invalidates COPY . . — and everything below it.',
        focus: ['edit', 'copyall'], flow: ['edit->copyall'],
        mark: [{ on: 'copyall', tone: 'bad' }, { on: 'install', tone: 'bad' }] },
      { caption: 'So pip reinstalls every dependency. For a one-character change. Every time.',
        focus: ['install'], mark: [{ on: 'install', tone: 'bad' }],
        annotate: [{ on: 'install', text: '90s wasted' }] },
      { caption: 'Copy the requirements file first and install before copying your code. Now a code edit only invalidates the last layer.',
        focus: ['fixed'], flow: ['fixed->install'], mark: [{ on: 'fixed', tone: 'good' }] },
    ],
  },

  // ─────────────────────────────────────────────── s1.8 AI intuition
  {
    id: 'anim-tokens',
    title: 'Text becomes tokens',
    tier: 'T2',
    point:
      'Tokens are not words. Code, JSON and Hindi cost two to four times more than plain English for the same information — which makes your output format a cost decision.',
    nodes: [
      { id: 'txt', label: 'your text', shape: 'doc', at: [X[0], Y[1]] },
      { id: 'tok', label: 'tokenizer', shape: 'proc', at: [X[1], Y[1]] },
      { id: 'ids', label: 'integers', shape: 'doc', at: [X[2], Y[1]], sub: '[9906, 1917, ...]' },
      { id: 'model', label: 'the model', shape: 'model', at: [X[3], Y[1]] },
      { id: 'bill', label: 'your bill', shape: 'db', at: [X[3], Y[2]] },
    ],
    edges: [
      { from: 'txt', to: 'tok' }, { from: 'tok', to: 'ids' },
      { from: 'ids', to: 'model' }, { from: 'ids', to: 'bill' },
    ],
    scenes: [
      { caption: 'The model never sees your text. It sees numbers.', focus: ['txt', 'tok'], flow: ['txt->tok'] },
      { caption: 'The tokenizer cuts the text into pieces. Common English words are usually one piece each.',
        focus: ['tok', 'ids'], flow: ['tok->ids'] },
      { caption: 'Rare words, code, punctuation-heavy JSON and non-English text get cut into many more pieces.',
        focus: ['ids'], mark: [{ on: 'ids', tone: 'warn' }] },
      { caption: 'You pay per token, in and out. So "write JSON" and "write a sentence" are different prices for the same answer.',
        focus: ['bill'], flow: ['ids->bill'], mark: [{ on: 'bill', tone: 'warn' }] },
    ],
    knobs: [
      { id: 'words', label: 'Words of text', min: 100, max: 5000, step: 100, default: 1000 },
      { id: 'kind', label: '0 prose 1 code 2 hindi', min: 0, max: 2, step: 1, default: 0 },
    ],
    readout: [
      {
        label: 'roughly tokens',
        expr: (k) => {
          const mult = k.kind === 0 ? 1.33 : k.kind === 1 ? 2.6 : 3.4;
          return Math.round(k.words * mult).toLocaleString();
        },
      },
      {
        label: 'cost in at ₹250 / 1M tokens',
        expr: (k) => {
          const mult = k.kind === 0 ? 1.33 : k.kind === 1 ? 2.6 : 3.4;
          return `₹${((k.words * mult * 250) / 1_000_000).toFixed(3)}`;
        },
      },
    ],
  },
];
