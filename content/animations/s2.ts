import type { Animation } from '@/lib/types';

const X = [20, 150, 280, 410];

const fmt = (n: number) => Math.round(n).toLocaleString('en-IN');

export const s2Animations: Animation[] = [
  // ─────────────────────────────────────────────── s2.1 context budget
  {
    id: 'anim-context-budget',
    title: 'The context window is a budget',
    tier: 'T2',
    point:
      'Everything the model reads — and the answer it writes — shares one window. When it overflows, something gets dropped; the only question is whether you chose what.',
    nodes: [
      { id: 'sys', label: 'System prompt', shape: 'doc', at: [X[0], 26], sub: '1,200' },
      { id: 'hist', label: 'History', shape: 'doc', at: [X[1], 26] },
      { id: 'ret', label: 'Retrieved text', shape: 'doc', at: [X[2], 26] },
      { id: 'q', label: 'Question', shape: 'doc', at: [X[3], 26], sub: '150' },
      { id: 'win', label: 'Context window', shape: 'model', at: [215, 124] },
      { id: 'out', label: 'Answer space', shape: 'doc', at: [X[3], 124], sub: '4,000' },
    ],
    edges: [
      { from: 'sys', to: 'win' }, { from: 'hist', to: 'win' }, { from: 'ret', to: 'win' },
      { from: 'q', to: 'win' }, { from: 'out', to: 'win' },
    ],
    scenes: [
      { caption: 'Everything the model reads in one call shares a single budget: the context window.',
        focus: ['win'] },
      { caption: 'The system prompt, the history, retrieved passages and the question all take space.',
        flow: ['sys->win', 'hist->win', 'ret->win', 'q->win'] },
      { caption: 'The answer shares the window too. Reserve room for it, or it gets cut off.',
        focus: ['out', 'win'], flow: ['out->win'] },
      { caption: 'Drag the knobs. When the total passes the window, something must go — decide what, on purpose.' },
    ],
    knobs: [
      { id: 'window', label: 'Window (K tokens)', min: 16, max: 200, step: 8, default: 32 },
      { id: 'turns', label: 'History turns', min: 0, max: 40, step: 1, default: 10 },
      { id: 'chunks', label: 'Retrieved chunks', min: 0, max: 30, step: 1, default: 8 },
    ],
    dynamicLabels: (k) => {
      const total = 1200 + k.turns * 300 + k.chunks * 600 + 150 + 4000;
      return {
        'hist.sub': fmt(k.turns * 300),
        'ret.sub': fmt(k.chunks * 600),
        'win.sub': `${fmt(total)} / ${fmt(k.window * 1000)}`,
      };
    },
    dynamicMarks: (k) => {
      const total = 1200 + k.turns * 300 + k.chunks * 600 + 150 + 4000;
      return total > k.window * 1000
        ? [{ on: 'win', tone: 'bad' }, { on: 'hist', tone: 'warn' }, { on: 'ret', tone: 'warn' }]
        : [{ on: 'win', tone: 'good' }];
    },
    readout: [
      { label: 'used', expr: (k) => `${fmt(1200 + k.turns * 300 + k.chunks * 600 + 150 + 4000)} tokens` },
      {
        label: 'status',
        expr: (k) => {
          const over = 1200 + k.turns * 300 + k.chunks * 600 + 150 + 4000 - k.window * 1000;
          return over > 0 ? `over by ${fmt(over)} — trim history or retrieve less` : 'fits';
        },
      },
    ],
  },

  // ─────────────────────────────────────────────── s2.1 temperature
  {
    id: 'anim-temperature',
    title: 'What temperature does',
    tier: 'T2',
    point:
      'Temperature reshapes the odds of each next token. Low sharpens them toward the top choice; high gives unlikely — sometimes wrong — tokens a real chance. The newest Claude models no longer accept it at all.',
    nodes: [
      { id: 'ctx', label: 'The refund', shape: 'doc', at: [X[0], 96], sub: 'window is ...' },
      { id: 'scorer', label: 'Model', shape: 'model', at: [X[1], 96], sub: 'scores tokens' },
      { id: 't1', label: '"30"', shape: 'proc', at: [X[2], 6] },
      { id: 't2', label: '"14"', shape: 'proc', at: [X[2], 66] },
      { id: 't3', label: '"thirty"', shape: 'proc', at: [X[2], 126] },
      { id: 't4', label: '"not"', shape: 'proc', at: [X[2], 186] },
      { id: 'pick', label: 'Picked token', shape: 'db', at: [X[3], 96] },
    ],
    edges: [
      { from: 'ctx', to: 'scorer' },
      { from: 'scorer', to: 't1' }, { from: 'scorer', to: 't2' },
      { from: 'scorer', to: 't3' }, { from: 'scorer', to: 't4' },
      { from: 't1', to: 'pick' },
    ],
    scenes: [
      { caption: 'At each step the model scores every possible next token.', flow: ['ctx->scorer'] },
      { caption: 'Temperature reshapes those scores into odds before one is picked. Drag it.',
        flow: ['scorer->t1', 'scorer->t2', 'scorer->t3', 'scorer->t4'] },
      { caption: 'Low temperature: the top choice almost always wins.', flow: ['t1->pick'] },
      { caption: 'High temperature: "not" gets a real chance — and "the refund window is not" is a very different sentence.',
        focus: ['t4'] },
      { caption: "Claude's newest models reject temperature. You steer them with effort and structured outputs instead." },
    ],
    knobs: [{ id: 'temp', label: 'Temperature', min: 0, max: 2, step: 0.1, default: 1 }],
    dynamicLabels: (k) => {
      const logits = [3.2, 2.2, 1.4, 0.3];
      let p: number[];
      if (k.temp <= 0.001) p = [1, 0, 0, 0];
      else {
        const e = logits.map((l) => Math.exp(l / k.temp));
        const s = e.reduce((a, b) => a + b, 0);
        p = e.map((x) => x / s);
      }
      const pc = (x: number) => `${(x * 100).toFixed(x < 0.01 && x > 0 ? 1 : 0)}%`;
      return { 't1.sub': pc(p[0]), 't2.sub': pc(p[1]), 't3.sub': pc(p[2]), 't4.sub': pc(p[3]) };
    },
    dynamicMarks: (k) => (k.temp >= 1.3 ? [{ on: 't4', tone: 'warn' }] : k.temp <= 0.3 ? [{ on: 't1', tone: 'good' }] : []),
    readout: [
      {
        label: 'chance the top token is picked',
        expr: (k) => {
          if (k.temp <= 0.001) return '100%';
          const e = [3.2, 2.2, 1.4, 0.3].map((l) => Math.exp(l / k.temp));
          return `${((e[0] / e.reduce((a, b) => a + b, 0)) * 100).toFixed(0)}%`;
        },
      },
    ],
  },

  // ─────────────────────────────────────────────── s2.2 TTFT
  {
    id: 'anim-streaming-ttft',
    title: 'Time to first token',
    tier: 'T2',
    point:
      'Users feel the wait for the first words, not the total time. Streaming shows words after a fraction of a second, even when the full answer takes much longer.',
    nodes: [
      { id: 'user', label: 'User', shape: 'user', at: [X[0], 70] },
      { id: 'api', label: 'Your API', shape: 'proc', at: [X[1], 70] },
      { id: 'prov', label: 'Model', shape: 'model', at: [X[2], 70] },
      { id: 'first', label: 'First words', shape: 'db', at: [X[3], 10] },
      { id: 'last', label: 'Full answer', shape: 'db', at: [X[3], 130] },
    ],
    edges: [
      { from: 'user', to: 'api' }, { from: 'api', to: 'prov' },
      { from: 'prov', to: 'first' }, { from: 'prov', to: 'last' },
    ],
    scenes: [
      { caption: 'The user sends a question. It goes through your API to the model.', flow: ['user->api', 'api->prov'] },
      { caption: 'The model reads the input, then starts writing. The first words exist after a fraction of a second.',
        flow: ['prov->first'], mark: [{ on: 'first', tone: 'good' }] },
      { caption: 'Without streaming, the user sees nothing until the whole answer is finished.',
        flow: ['prov->last'] },
      { caption: 'Turn streaming off and on, and change the answer length. Watch when the user first sees something.' },
    ],
    knobs: [
      { id: 'stream', label: 'Streaming (0 off, 1 on)', min: 0, max: 1, step: 1, default: 1 },
      { id: 'tokens', label: 'Answer length (tokens)', min: 100, max: 2000, step: 100, default: 600 },
    ],
    dynamicLabels: (k) => {
      const total = 0.5 + k.tokens / 60;
      return {
        'first.sub': k.stream ? '0.5s' : `${total.toFixed(1)}s`,
        'last.sub': `${total.toFixed(1)}s`,
      };
    },
    dynamicMarks: (k) => (k.stream ? [{ on: 'first', tone: 'good' }] : [{ on: 'first', tone: 'bad' }]),
    readout: [
      { label: 'user first sees words after', expr: (k) => (k.stream ? '0.5s' : `${(0.5 + k.tokens / 60).toFixed(1)}s`) },
      { label: 'full answer after', expr: (k) => `${(0.5 + k.tokens / 60).toFixed(1)}s (about 60 tokens a second)` },
    ],
  },

  // ─────────────────────────────────────────────── s2.3 prompt anatomy
  {
    id: 'anim-prompt-anatomy',
    title: 'What a system prompt is made of',
    tier: 'T1',
    point:
      'Context changes the answer; shouting doesn’t. The situation, the task, a few constraints with reasons, the output shape and an escape hatch do the work.',
    nodes: [
      { id: 'sit', label: 'Situation', shape: 'doc', at: [X[0], 0], sub: 'product, audience' },
      { id: 'task', label: 'Task', shape: 'doc', at: [X[0], 56], sub: 'what good looks like' },
      { id: 'con', label: 'Constraints', shape: 'doc', at: [X[0], 112], sub: 'each with a reason' },
      { id: 'shape', label: 'Output shape', shape: 'doc', at: [X[0], 168], sub: 'format, length' },
      { id: 'esc', label: 'Escape hatch', shape: 'doc', at: [X[0], 224], sub: '"not covered"' },
      { id: 'prompt', label: 'System prompt', shape: 'proc', at: [215, 112] },
      { id: 'ans', label: 'Answer', shape: 'db', at: [X[3], 112] },
    ],
    edges: [
      { from: 'sit', to: 'prompt' }, { from: 'task', to: 'prompt' }, { from: 'con', to: 'prompt' },
      { from: 'shape', to: 'prompt' }, { from: 'esc', to: 'prompt' }, { from: 'prompt', to: 'ans' },
    ],
    scenes: [
      { caption: 'Start with the situation: the product, and who is on the other end.', focus: ['sit', 'prompt'], flow: ['sit->prompt'] },
      { caption: 'Then the task: what a good response achieves.', focus: ['task', 'prompt'], flow: ['task->prompt'] },
      { caption: 'Add the one or two real constraints, each with its reason, so the model can apply it sensibly.',
        focus: ['con', 'prompt'], flow: ['con->prompt'] },
      { caption: 'Say what shape the answer should take, if it matters.', focus: ['shape', 'prompt'], flow: ['shape->prompt'] },
      { caption: 'Give a concrete way to say "I don’t know". Without it, the likeliest continuation of a question is an answer.',
        focus: ['esc', 'prompt'], flow: ['esc->prompt'], mark: [{ on: 'esc', tone: 'good' }] },
      { caption: 'Together they give the model context. That, not capital letters, is what changes the answer.',
        flow: ['prompt->ans'], mark: [{ on: 'ans', tone: 'good' }] },
    ],
  },

  // ─────────────────────────────────────────────── s2.3 few-shot selection
  {
    id: 'anim-fewshot',
    title: 'Choosing examples per request',
    tier: 'T2',
    point:
      'Which examples matter more than how many. A few similar, varied examples teach the most and cost the least — one example gets copied too closely.',
    nodes: [
      { id: 'msg', label: 'New message', shape: 'user', at: [X[0], 20] },
      { id: 'pool', label: 'Example pool', shape: 'db', at: [X[0], 130], sub: '200 examples' },
      { id: 'pick', label: 'Pick similar', shape: 'proc', at: [X[1], 75] },
      { id: 'sel', label: 'Examples', shape: 'doc', at: [X[2], 75] },
      { id: 'prompt', label: 'Prompt', shape: 'model', at: [X[3], 75] },
    ],
    edges: [
      { from: 'msg', to: 'pick' }, { from: 'pool', to: 'pick' },
      { from: 'pick', to: 'sel' }, { from: 'sel', to: 'prompt' },
    ],
    scenes: [
      { caption: 'You have hundreds of good examples, but you pay for every one you send.', focus: ['pool'] },
      { caption: 'Compare the new message with the pool, and pick the most similar few.',
        flow: ['msg->pick', 'pool->pick'] },
      { caption: 'Cap how many come from any one label, so the choice isn’t made before the model reads the input.',
        flow: ['pick->sel'] },
      { caption: 'Drag the count. One example gets copied too closely; many cost more for little gain.',
        flow: ['sel->prompt'] },
    ],
    knobs: [{ id: 'k', label: 'Examples sent', min: 0, max: 10, step: 1, default: 3 }],
    dynamicLabels: (k) => ({ 'sel.sub': `${k.k} × ~120 tokens`, 'pick.sub': `top ${k.k}` }),
    dynamicMarks: (k) =>
      k.k === 1 ? [{ on: 'sel', tone: 'warn' }] : k.k >= 3 && k.k <= 5 ? [{ on: 'sel', tone: 'good' }] : [],
    readout: [
      { label: 'extra input per call', expr: (k) => `${k.k * 120} tokens` },
      { label: 'extra cost per 1,000 calls at $1 per 1M', expr: (k) => `$${((k.k * 120 * 1000) / 1_000_000).toFixed(2)}` },
      { label: 'risk', expr: (k) => (k.k === 1 ? 'the one example gets copied' : k.k === 0 ? 'no examples: fine if the task is clear' : k.k > 6 ? 'paying for little gain' : 'balanced') },
    ],
  },

  // ─────────────────────────────────────────────── s2.4 repair loop
  {
    id: 'anim-repair-loop',
    title: 'The repair loop',
    tier: 'T1',
    point:
      'The API guarantees the shape; your pydantic model enforces the rules. When a rule breaks, the exact error is the best correction prompt — once. Then fail honestly.',
    nodes: [
      { id: 'model', label: 'Model', shape: 'model', at: [X[0], 60] },
      { id: 'out', label: 'JSON output', shape: 'doc', at: [X[1], 60], sub: 'valid shape' },
      { id: 'val', label: 'pydantic', shape: 'proc', at: [X[2], 60], sub: 'checks the rules' },
      { id: 'ok', label: 'Valid object', shape: 'db', at: [X[3], 60] },
      { id: 'err', label: 'ValidationError', shape: 'doc', at: [X[2], 160] },
      { id: 'fix', label: 'Re-ask', shape: 'proc', at: [X[1], 160], sub: 'with the error, once' },
      { id: 'fail', label: 'Fail honestly', shape: 'doc', at: [X[3], 160] },
    ],
    edges: [
      { from: 'model', to: 'out' }, { from: 'out', to: 'val' }, { from: 'val', to: 'ok' },
      { from: 'val', to: 'err' }, { from: 'err', to: 'fix' }, { from: 'fix', to: 'model' },
      { from: 'err', to: 'fail' },
    ],
    scenes: [
      { caption: 'Structured output guarantees the shape — but not that a score is between 0 and 1.',
        flow: ['model->out'] },
      { caption: 'Your pydantic model checks the rules the API couldn’t enforce.', flow: ['out->val'] },
      { caption: 'A rule is broken. The error names the exact field and the exact rule.',
        flow: ['val->err'], mark: [{ on: 'err', tone: 'bad' }], annotate: [{ on: 'val', text: 'score 1.4 is over 1' }] },
      { caption: 'Send that exact error back, with the output it came from, and ask for a corrected version.',
        flow: ['err->fix', 'fix->model'] },
      { caption: 'Usually the second attempt passes.', flow: ['val->ok'], mark: [{ on: 'ok', tone: 'good' }] },
      { caption: 'If it fails again, stop. Return a clear failure — never keep paying in a loop.',
        flow: ['err->fail'], mark: [{ on: 'fail', tone: 'warn' }] },
    ],
  },

  // ─────────────────────────────────────────────── s2.5 fallback chain
  {
    id: 'anim-fallback-chain',
    title: 'A fallback chain',
    tier: 'T1',
    point:
      'Graceful degradation is a designed ladder, not a try/except. Each step is simpler but still useful — and a bad request never falls back.',
    nodes: [
      { id: 'req', label: 'Request', shape: 'user', at: [X[0], 110] },
      { id: 'p1', label: 'Main model', shape: 'model', at: [X[1], 10] },
      { id: 'p2', label: 'Smaller model', shape: 'model', at: [X[1], 80] },
      { id: 'p3', label: 'Passages only', shape: 'doc', at: [X[1], 150], sub: 'no generation' },
      { id: 'p4', label: 'Honest error', shape: 'doc', at: [X[1], 220] },
      { id: 'user', label: 'User sees', shape: 'user', at: [X[3], 110] },
    ],
    edges: [
      { from: 'req', to: 'p1' }, { from: 'p1', to: 'p2' }, { from: 'p2', to: 'p3' }, { from: 'p3', to: 'p4' },
      { from: 'p1', to: 'user' }, { from: 'p2', to: 'user' }, { from: 'p3', to: 'user' }, { from: 'p4', to: 'user' },
    ],
    scenes: [
      { caption: 'Normally the main model answers.', flow: ['req->p1', 'p1->user'], mark: [{ on: 'user', tone: 'good' }] },
      { caption: 'It returns 529 overloaded — after the SDK has already retried it.',
        mark: [{ on: 'p1', tone: 'bad' }], annotate: [{ on: 'p1', text: '529' }] },
      { caption: 'Step down to a smaller model: same prompt, same output shape, marked as a quick answer.',
        flow: ['p1->p2', 'p2->user'], mark: [{ on: 'p2', tone: 'good' }] },
      { caption: 'If that fails too, show the most relevant passages without a generated answer. Still useful.',
        flow: ['p2->p3', 'p3->user'], mark: [{ on: 'p3', tone: 'good' }] },
      { caption: 'Last resort: an honest "unavailable" — never a spinner that hangs.',
        flow: ['p3->p4', 'p4->user'] },
      { caption: 'A 400 never falls back: a bad request fails the same way on every model.',
        mark: [{ on: 'p1', tone: 'warn' }], annotate: [{ on: 'p1', text: '400 — stop here' }] },
    ],
  },

  // ─────────────────────────────────────────────── s2.5 prompt caching
  {
    id: 'anim-prompt-cache',
    title: 'Prompt caching',
    tier: 'T2',
    point:
      'Caching works on identical prefixes. Keep the stable parts first and anything that changes last — one timestamp near the top means nothing after it is ever reused.',
    nodes: [
      { id: 'tools', label: 'Tools', shape: 'doc', at: [X[0], 20] },
      { id: 'sys', label: 'Instructions', shape: 'doc', at: [X[1], 20] },
      { id: 'docs', label: 'Documents', shape: 'doc', at: [X[2], 20] },
      { id: 'conv', label: 'Conversation', shape: 'doc', at: [X[3], 20] },
      { id: 'cache', label: 'Provider cache', shape: 'db', at: [215, 120] },
      { id: 'q', label: 'New question', shape: 'user', at: [X[3], 120] },
    ],
    edges: [
      { from: 'tools', to: 'sys' }, { from: 'sys', to: 'docs' }, { from: 'docs', to: 'conv' },
      { from: 'docs', to: 'cache' }, { from: 'q', to: 'conv' },
    ],
    scenes: [
      { caption: 'The provider reads your request in order: tools, instructions, documents, conversation.',
        flow: ['tools->sys', 'sys->docs', 'docs->conv'] },
      { caption: 'If the start matches a recent request exactly, that part is read from the cache.',
        flow: ['docs->cache'], mark: [{ on: 'cache', tone: 'good' }] },
      { caption: 'Cache reads cost about a tenth of normal input. The first write costs a quarter more.',
        focus: ['cache'] },
      { caption: 'Now put the current time in the instructions. Every request differs from that point on, so nothing after it is ever reused. Try it with the last knob.' },
    ],
    knobs: [
      { id: 'n', label: 'Requests in 5 min', min: 1, max: 50, step: 1, default: 10 },
      { id: 'prefix', label: 'Stable prefix (K tokens)', min: 1, max: 50, step: 1, default: 8 },
      { id: 'stamp', label: 'Time in instructions (0/1)', min: 0, max: 1, step: 1, default: 0 },
    ],
    dynamicLabels: (k) => ({ 'cache.sub': k.stamp ? 'never hit' : `${k.n > 1 ? k.n - 1 : 0} hits` }),
    dynamicMarks: (k) => (k.stamp ? [{ on: 'sys', tone: 'bad' }, { on: 'cache', tone: 'bad' }] : [{ on: 'cache', tone: 'good' }]),
    readout: [
      { label: 'prefix cost without caching', expr: (k) => `${(k.n * k.prefix).toFixed(0)}K token-units` },
      {
        label: 'prefix cost with caching',
        expr: (k) =>
          k.stamp
            ? `${(k.n * k.prefix * 1.25).toFixed(0)}K token-units — worse: every request writes, none reads`
            : `${(k.prefix * 1.25 + (k.n - 1) * k.prefix * 0.1).toFixed(1)}K token-units`,
      },
    ],
  },
];
