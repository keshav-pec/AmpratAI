import type { Animation } from '@/lib/types';

const X = [20, 150, 280, 410];

type VoiceKnobs = Record<string, number>;

/** Voice-to-voice latency (ms), illustrative: each hop's delay, plus ~100 ms of network. */
function voiceParts(k: VoiceKnobs): [string, number][] {
  return [
    ['waiting for silence', k.silence],
    ['speech-to-text', k.stt],
    ['LLM first token', k.ttft],
    ['LLM writing the whole reply first', k.stream ? 0 : 1500],
    ['text-to-speech', k.tts],
    ['network', 100],
  ];
}

const voiceTotal = (k: VoiceKnobs) => voiceParts(k).reduce((n, [, ms]) => n + ms, 0);

export const s7Animations: Animation[] = [
  // ─────────────────────────────────────────────── s7.3 voice
  {
    id: 'anim-voice-loop',
    title: 'Where a voice reply’s time goes',
    tier: 'T2',
    point:
      'Voice is a latency problem before it’s an AI problem. Every hop adds to one pause, and people notice a pause of about a second. Stream every hop and cut the biggest slice first — usually the wait for silence.',
    nodes: [
      { id: 'mic', label: 'Mic', shape: 'user', at: [X[0], 0], sub: 'you finish' },
      { id: 'vad', label: 'Turn detection', shape: 'proc', at: [X[1], 0] },
      { id: 'stt', label: 'Speech → text', shape: 'model', at: [X[2], 0] },
      { id: 'llm', label: 'LLM', shape: 'model', at: [X[3], 0] },
      { id: 'tts', label: 'Text → speech', shape: 'model', at: [X[3], 100] },
      { id: 'spk', label: 'Speaker', shape: 'user', at: [X[2], 100] },
    ],
    edges: [
      { from: 'mic', to: 'vad' }, { from: 'vad', to: 'stt' }, { from: 'stt', to: 'llm' },
      { from: 'llm', to: 'tts' }, { from: 'tts', to: 'spk' },
    ],
    scenes: [
      { caption: 'You stop talking. The system must decide you’ve finished — often by waiting for a stretch of silence.',
        flow: ['mic->vad'] },
      { caption: 'Speech-to-text finishes the transcript of what you said.', flow: ['vad->stt'] },
      { caption: 'The LLM starts answering. What counts is the time to its first token, not the whole reply.',
        flow: ['stt->llm'] },
      { caption: 'Text-to-speech speaks the first sentence while the LLM is still writing the rest.',
        flow: ['llm->tts', 'tts->spk'] },
      { caption: 'The hops add up to one pause. Drag the knobs: find the biggest slice and cut it.' },
    ],
    knobs: [
      { id: 'silence', label: 'Silence to wait for (ms)', min: 100, max: 1000, step: 50, default: 600 },
      { id: 'stt', label: 'Speech-to-text finish (ms)', min: 50, max: 500, step: 25, default: 200 },
      { id: 'ttft', label: 'LLM first token (ms)', min: 100, max: 1500, step: 50, default: 450 },
      { id: 'tts', label: 'Text-to-speech first audio (ms)', min: 50, max: 500, step: 25, default: 150 },
      { id: 'stream', label: 'Stream LLM into TTS (0/1)', min: 0, max: 1, step: 1, default: 1 },
    ],
    dynamicLabels: (k) => ({
      'vad.sub': `waits ${k.silence} ms`,
      'stt.sub': `${k.stt} ms`,
      'llm.sub': k.stream ? `TTFT ${k.ttft} ms` : `${k.ttft} + 1500 ms`,
      'tts.sub': `${k.tts} ms to audio`,
      'spk.sub': `${voiceTotal(k)} ms total`,
    }),
    dynamicMarks: (k) => {
      const t = voiceTotal(k);
      return [{ on: 'spk', tone: t <= 800 ? 'good' : t <= 1500 ? 'warn' : 'bad' }];
    },
    readout: [
      {
        label: 'you stop → you hear',
        expr: (k) => {
          const t = voiceTotal(k);
          const verdict = t <= 800 ? 'feels natural' : t <= 1500 ? 'a noticeable pause' : 'feels broken — people repeat themselves';
          return `${t} ms — ${verdict}`;
        },
      },
      {
        label: 'biggest slice',
        expr: (k) => {
          const [name, ms] = voiceParts(k).reduce((a, b) => (b[1] > a[1] ? b : a));
          return `${name} (${ms} ms)`;
        },
      },
      { label: 'numbers', expr: () => 'illustrative — measure each hop in your own traces' },
    ],
  },
  // ─────────────────────────────────────────────── s7.3 GraphRAG
  {
    id: 'anim-graphrag-vs-vector',
    title: 'Similar isn’t the same as connected',
    tier: 'T1',
    point:
      'Vector search finds text that looks like the question. A multi-hop question needs facts that are connected but don’t look alike. A graph follows the connections — and a second, targeted search often does too.',
    nodes: [
      { id: 'q', label: 'Question', shape: 'user', at: [20, 80] },
      { id: 'vec', label: 'Vector search', shape: 'db', at: [150, 0], sub: 'top 3, similar' },
      { id: 'c12', label: 'Chunk 12', shape: 'doc', at: [330, 0], sub: 'owner: Checkout' },
      { id: 'c87', label: 'Chunk 87', shape: 'doc', at: [510, 0], sub: 'Checkout: Priya' },
      { id: 'pay', label: 'Payments', shape: 'proc', at: [150, 160], sub: 'service' },
      { id: 'chk', label: 'Checkout', shape: 'proc', at: [330, 160], sub: 'team' },
      { id: 'priya', label: 'Priya', shape: 'user', at: [510, 160], sub: 'person' },
    ],
    edges: [
      { from: 'q', to: 'vec' }, { from: 'vec', to: 'c12' },
      { from: 'c12', to: 'c87', payload: 'search again' },
      { from: 'q', to: 'pay' },
      { from: 'pay', to: 'chk', payload: 'owned by' },
      { from: 'chk', to: 'priya', payload: 'managed by' },
    ],
    scenes: [
      { caption: 'The question: “Who manages the team that owns the payments service?” No single chunk holds the whole answer.',
        focus: ['q'] },
      { caption: 'Vector search finds chunks that look like the question. Chunk 12 talks about payments, so it ranks high.',
        flow: ['q->vec', 'vec->c12'], mark: [{ on: 'c12', tone: 'good' }] },
      { caption: 'Chunk 87 says who manages Checkout — but it never mentions payments, so it isn’t similar enough to be retrieved.',
        focus: ['q', 'vec', 'c12', 'c87'], mark: [{ on: 'c87', tone: 'bad' }], annotate: [{ on: 'c87', text: 'not retrieved' }] },
      { caption: 'A graph stores the same facts as connected entities. Start at Payments and follow “owned by”, then “managed by”.',
        flow: ['q->pay', 'pay->chk', 'chk->priya'] },
      { caption: 'Two hops reach the answer: Priya. Vectors find what is similar; graphs follow what is connected.',
        focus: ['pay', 'chk', 'priya'], mark: [{ on: 'priya', tone: 'good' }] },
      { caption: 'The cheaper fix is often enough: read Chunk 12, then search again for “Checkout team manager”. Two searches, no graph.',
        flow: ['vec->c12', 'c12->c87'], mark: [{ on: 'c87', tone: 'good' }] },
    ],
  },
];
