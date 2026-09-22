export type SourceKind = 'deck' | 'video' | 'find';

export type Source = {
  kind: SourceKind;
  label: string;        // "Slides", "Visual", "Deeper", "Hindi"
  reason: string;       // one line: why this source exists
  videoId?: string;     // set when a video has been pinned
  start?: number;       // segment start, seconds
  end?: number;         // segment end, seconds
  query?: string;       // for kind 'find': what to search for
  channel?: string;     // for kind 'find': which channel to prefer
};

export type PracticeMode =
  | 'primitive'   // hand-write it, no AI
  | 'read'        // read & predict
  | 'spec'        // spec-then-verify
  | 'tool'        // real tool drill
  | 'decision'    // no code, pick an approach and defend it
  | 'break';      // break it on purpose

export type Practice = {
  mode: PracticeMode;
  title: string;
  body: string;         // markdown
};

export type Topic = {
  id: string;           // "s1.3.t1"
  moduleId: string;     // "s1.3"
  title: string;
  outcome: string;
  minutes: number;
  sources: Source[];
  notes: string;        // markdown; "\n---\n" splits it into slides
  analogy: string;      // the MERN/MySQL bridge
  animations: string[];
  docs: { label: string; url: string }[];
  glossary: { term: string; def: string }[];
  check: { q: string; a: string }[];
  practice: Practice[];
};

export type Module = {
  id: string;           // "s1.3"
  stage: number;
  title: string;
  priority: 'core' | 'optional';
  note?: string;
  selfCheck?: string;
  topicCount?: number;  // for stages not yet authored
};

export type Stage = {
  n: number;
  title: string;
  outcome: string;
  note?: string;
  opener?: { title: string; body: string };
  modules: Module[];
  projects: string[];
  readiness: string[];
};

export type Project = {
  id: string;           // "p-1.1"
  stage: number;
  title: string;
  size: 'S' | 'M' | 'L' | 'XL';
  flagship?: boolean;
  optional?: boolean;
  body: string;         // markdown
};

// ---- animations -------------------------------------------------------

export type AnimNode = {
  id: string;
  label: string;
  shape: 'doc' | 'proc' | 'db' | 'model' | 'note' | 'user';
  at: [number, number];
  sub?: string;
};

export type AnimEdge = { from: string; to: string; payload?: string; curve?: number };

export type AnimScene = {
  caption: string;
  focus?: string[];
  flow?: string[];                                   // edge ids "a->b"
  annotate?: { on: string; text: string }[];
  dim?: string[];
  mark?: { on: string; tone: 'good' | 'bad' | 'warn' }[];
};

export type AnimKnob = {
  id: string;
  label: string;
  min: number;
  max: number;
  step: number;
  default: number;
  unit?: string;
};

export type Animation = {
  id: string;
  title: string;
  tier: 'T1' | 'T2';
  point: string;                                     // the one takeaway
  width?: number;
  height?: number;
  nodes: AnimNode[];
  edges: AnimEdge[];
  scenes: AnimScene[];
  knobs?: AnimKnob[];
  // derived readouts shown under the knobs, computed from knob values
  readout?: { label: string; expr: (k: Record<string, number>) => string }[];
  // knob-driven node label overrides
  dynamicLabels?: (k: Record<string, number>) => Record<string, string>;
};

// ---- progress ---------------------------------------------------------

export type TopicProgress = {
  done?: boolean;
  practiceDone?: number[];      // indices of completed practice items
  checkSeen?: boolean;
  pinnedVideos?: Record<string, { videoId: string; start?: number; end?: number }>;
  note?: string;                // a one-line marker, e.g. "come back to this"
};

export type Progress = {
  topics: Record<string, TopicProgress>;
  projects: Record<string, { started?: boolean; done?: boolean; repoUrl?: string; demoUrl?: string }>;
  lastTopicId?: string;
  updatedAt?: number;
};

export const emptyProgress = (): Progress => ({ topics: {}, projects: {} });
