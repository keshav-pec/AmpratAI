import type { Topic } from '@/lib/types';

export const s7_3: Topic[] = [
  {
    id: 's7.3.t1',
    moduleId: 's7.3',
    title: 'Voice agents: a latency problem first',
    outcome: `You can explain how a voice agent works — turn detection, speech-to-text, the LLM, text-to-speech — budget its latency hop by hop, and handle interruptions correctly.`,
    minutes: 35,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
      {
        kind: 'find',
        label: 'Visual',
        query: 'voice AI agent latency pipeline explained STT LLM TTS',
        channel: '',
        reason: 'a voice pipeline walked through, hop by hop',
      },
    ],
    animations: ['anim-voice-loop'],
    analogy: `A phone call with satellite delay. Even half a second of lag and people start talking over
each other. Voice agents live or die by that same pause: the smartest answer is useless if
it arrives two seconds after the person stopped talking.`,
    notes: `## Two ways to build one

- **A cascade:** speech-to-text (STT) → LLM → text-to-speech (TTS). The most common
  design. You choose each part, you can trace each hop, and because text sits in the
  middle, your RAG, tools and guardrails work unchanged.
- **Speech-to-speech models:** one model hears audio and speaks audio — for example,
  OpenAI's Realtime API or Google's Gemini Live API. Lower latency and more natural
  speech; less control, and harder to inspect.

Start with the cascade. It reuses everything you've built.

---

## The latency budget

People notice a pause of about a second. Voice-agent builders commonly aim for under about
**800 ms** from when you stop talking to when the agent starts speaking.

Typical slices *(illustrative — measure your own)*:

| Hop | Typical |
|---|---|
| Turn detection (waiting for silence) | 200–800 ms |
| Speech-to-text, final transcript | 100–300 ms |
| LLM time to first token | 200–600 ms |
| Text-to-speech, first audio | 100–300 ms |
| Network, both ways | 50–150 ms |

The biggest slice is often the one nobody thinks of: **waiting for silence**.

---

## Stream every hop

- STT streams partial transcripts while you're still talking.
- The LLM streams tokens; TTS starts on the **first sentence**, not the whole reply.
- Audio plays in small chunks as it's made.

Without streaming, the time to generate the *entire* reply is added to the pause.

---

## Turn detection

**Voice activity detection (VAD)** tells speech from silence. The simple rule — "wait for
N ms of silence" — has two failure modes:

- too short: you cut people off mid-thought ("I'd like to book… for Tuesday");
- too long: every reply feels sluggish.

Better: a **turn-detection model** that uses the words and tone to judge "have they
finished?" Then the silence wait can be short. Pipecat and LiveKit both offer one.

---

## Interruptions ("barge-in")

The user starts talking while the agent is speaking. You must:

1. detect their speech;
2. **stop playback** immediately;
3. **cancel** the LLM generation still in flight;
4. **trim the conversation history** to what was actually *spoken* before the cut.

Skip step 4 and the model believes the user heard sentences they never heard — and it
refers back to them.

---

## Building and measuring

Open-source frameworks handle the plumbing: **Pipecat** and **LiveKit Agents**. Browsers
and phones connect over **WebRTC**, which handles jitter and echo.

Measure:
- **word error rate (WER)** of STT on *your* domain words — names, product codes;
- latency per hop, at p50 and p95;
- task success on scripted calls;
- interruption handling.

Keep prompts short and replies shorter. One or two sentences per turn.`,
    docs: [
      {
        label: 'Pipecat docs',
        url: 'https://docs.pipecat.ai/',
      },
      {
        label: 'LiveKit Agents docs',
        url: 'https://docs.livekit.io/agents/',
      },
    ],
    glossary: [
      {
        term: 'voice activity detection (VAD)',
        def: 'Detecting whether audio contains speech or silence.',
      },
      {
        term: 'turn detection',
        def: 'Judging when a speaker has finished their turn, from silence, words and tone.',
      },
      {
        term: 'barge-in',
        def: 'The user interrupting while the agent is speaking.',
      },
      {
        term: 'word error rate (WER)',
        def: 'The share of words a speech-to-text system gets wrong.',
      },
      {
        term: 'WebRTC',
        def: 'A real-time audio and video protocol used by browsers and phones.',
      },
    ],
    check: [
      {
        q: 'What\'s the usual target from \'user stops\' to \'agent speaks\'?',
        a: 'Under about 800 ms. People notice pauses of around a second.',
      },
      {
        q: 'Which hop is often the biggest, and why is it overlooked?',
        a: `Waiting for silence to decide the user has finished — it isn't a model call, so it doesn't show up as 'AI latency'.`,
      },
      {
        q: 'Why must TTS start on the first sentence?',
        a: 'Otherwise the time to generate the entire reply is added to the pause.',
      },
      {
        q: 'What four things happen on barge-in?',
        a: `Detect the user's speech, stop playback, cancel the in-flight generation, and trim the history to what was actually spoken.`,
      },
    ],
    practice: [
      {
        mode: 'spec',
        title: 'Budget a voice agent',
        body: `Measured on your prototype (p50): silence wait 600 ms · STT final 200 ms · LLM first
token 450 ms · TTS first audio 150 ms · network 100 ms. Streaming is on.

1. What's the total, and the biggest slice?
2. Propose changes, with a new number for each hop, that bring it to 800 ms or less.
3. What must you check so the cuts don't make the agent worse?`,
        answer: `**1.** 600 + 200 + 450 + 150 + 100 = **1,500 ms**. The biggest slice is the
**silence wait** (600 ms).

**2.** One plan:

| Hop | Change | New |
|---|---|---|
| Silence wait | a turn-detection model, so a short wait is safe | 200 ms |
| STT | a streaming model; finalise on the turn signal | 150 ms |
| LLM first token | shorter system prompt, prompt caching, a faster model for voice | 280 ms |
| TTS | a low-latency voice; start on the first clause | 100 ms |
| Network | run the services in one region, near the users | 60 ms |

Total: 200 + 150 + 280 + 100 + 60 = **790 ms**.

**3.** Check that the cuts don't cost quality:
- **Cut-offs:** how often the agent interrupts people mid-sentence (the risk of a short
  silence wait) — count it on recorded test calls.
- **Answer quality** with the faster model — run your eval set on the voice prompts.
- **p95, not just p50** — a 790 ms median with a 2.5 s p95 still feels broken.

Try the same numbers in the animation.`,
      },
      {
        mode: 'break',
        title: 'The barge-in bug',
        body: `A user interrupts the agent halfway through a long answer about refund rules. A minute
later the agent says: "As I mentioned, refunds over ₹5,000 need a manager's approval."
The user never heard that — it came after the interruption.

What's the bug, and how do you fix it?`,
        answer: `**The bug:** the conversation history kept the assistant's **whole generated reply**,
not the part that was actually **spoken** before the interruption. The model thinks
the user heard all of it.

**The fix:**
1. Track playback: TTS engines report word or character timing — keep a pointer to the
   last word actually played.
2. On barge-in: stop playback, cancel the generation, and **replace** the assistant's
   message in history with the spoken part only — plus a short marker like
   "[interrupted by the user]".
3. Add a scripted test: interrupt at a known point, then ask a follow-up that depends on
   the unspoken part. The agent must not claim it said it.

It's the voice version of a familiar rule: the history must reflect what really
happened, not what the system planned to happen.`,
      },
      {
        mode: 'decision',
        title: 'Cascade, speech-to-speech, or not real-time at all?',
        body: `Choose an approach for each, with a reason:

1. A hospital's appointment line. It must use the existing booking tools, follow strict
   data rules, and keep auditable records of every step.
2. A language-learning partner for practising spoken conversation, where natural
   rhythm and tone matter most.
3. Checking the quality of 10,000 recorded support calls each week.`,
        answer: `1. **A cascade.** Text in the middle means the existing tools, guardrails and logging
   work unchanged, and every step can be traced and audited.
2. **Speech-to-speech is worth trying.** Natural rhythm, tone and fast turn-taking are
   the product. Keep an eye on cost and on how you'll evaluate it.
3. **Not real-time at all.** Batch speech-to-text, then LLM analysis on the transcripts
   — cheaper (batch pricing), and latency doesn't matter.`,
      },
    ],
  },
  {
    id: 's7.3.t2',
    moduleId: 's7.3',
    title: 'Self-hosting models with vLLM',
    outcome: `You can explain what vLLM does — PagedAttention, continuous batching, an OpenAI-compatible server — estimate how much KV cache a GPU holds, and decide when self-hosting beats an API.`,
    minutes: 40,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
      {
        kind: 'find',
        label: 'Visual',
        query: 'vLLM PagedAttention explained KV cache',
        channel: '',
        reason: 'PagedAttention drawn out',
      },
      {
        kind: 'find',
        label: 'Deeper',
        query: 'vLLM serve tutorial GPU OpenAI compatible',
        channel: '',
        reason: 'a hands-on first deployment',
      },
    ],
    animations: [],
    analogy: `Running your own MongoDB server instead of using Atlas. You get control, and at steady high
volume it can cost less — but you now own the upgrades, scaling, backups and the 3 a.m.
alerts. The maths should decide, not pride.`,
    notes: `## Why self-host at all

- **Data can't leave your network** — regulated data, or a client's own servers.
- **Steady, high volume**, where GPU-hours cost less than per-token API prices.
- **An open model tuned for one narrow task.**
- **Latency control** — the model sits next to your app.

Why not: you own the GPUs, scaling, upgrades and monitoring; open models may trail the
best hosted models on hard tasks; and an idle GPU still costs money.

---

## The bottleneck: the KV cache

While generating, the model stores a **key** and a **value** vector for every token, in
every layer, so it doesn't recompute the past. That's the **KV cache**. It grows with every
token of every active request.

Memory per token = 2 (K and V) × layers × KV heads × head size × bytes per number.

Llama 3.1 8B: 32 layers, 8 KV heads, head size 128, 16-bit numbers →
2 × 32 × 8 × 128 × 2 = **131,072 bytes = 128 KiB per token**.

One 8,192-token conversation holds **1 GiB** of cache. That's why long contexts limit how
many users one GPU can serve.

---

## PagedAttention

Older servers reserved one large, contiguous region per request, sized for its maximum
length — mostly wasted.

vLLM's **PagedAttention** stores the cache in small fixed-size **blocks**, anywhere in
memory, tracked by a block table — just like an operating system's virtual memory pages.
Waste drops to nearly zero, and requests that share a prompt prefix can share blocks.
More requests fit, so throughput rises.

---

## Continuous batching

**Static batching** waits for the whole batch to finish before starting the next.

**Continuous batching** adds new requests and drops finished ones at **every generation
step**. The GPU never sits waiting on the slowest request in a batch.

vLLM can also reuse KV blocks across requests with the same prompt prefix — **prefix
caching** — the self-hosted cousin of the API's prompt caching.

---

## Running it

\`\`\`bash
pip install vllm
vllm serve meta-llama/Llama-3.1-8B-Instruct --max-model-len 8192
\`\`\`

(Llama models are gated: accept the licence on Hugging Face first.)

This serves an **OpenAI-compatible** API on port 8000 — \`/v1/chat/completions\` — so any
OpenAI-compatible client, or plain HTTP, can call it.

Flags that matter:
- \`--max-model-len\` — a shorter cap means more requests fit;
- \`--gpu-memory-utilization\` — the share of GPU memory vLLM may use (default 0.9);
- \`--tensor-parallel-size\` — split one model across several GPUs;
- \`--quantization\` and \`--kv-cache-dtype fp8\` — shrink the weights, or the cache.

---

## When it pays

Cost per million tokens = GPU cost per hour ÷ millions of tokens per hour.

Measure the tokens per hour **at your latency target** (p95 time to first token and time
per token), under a realistic load test — not the peak number from a blog post. And
multiply in your real **utilisation**: a GPU busy 30% of the time costs over three times
as much per token as one that's always busy.

Then compare with the API price of a model that passes the **same evals**.`,
    docs: [
      {
        label: 'vLLM documentation',
        url: 'https://docs.vllm.ai/en/latest/',
      },
      {
        label: 'PagedAttention paper',
        url: 'https://arxiv.org/abs/2309.06180',
      },
    ],
    glossary: [
      {
        term: 'KV cache',
        def: 'The stored keys and values for past tokens, kept so the model needn\'t recompute them.',
      },
      {
        term: 'PagedAttention',
        def: 'Storing the KV cache in small fixed-size blocks tracked by a table, like memory pages.',
      },
      {
        term: 'continuous batching',
        def: 'Adding and removing requests from the batch at every generation step.',
      },
      {
        term: 'utilisation',
        def: 'The share of time a GPU is doing useful work.',
      },
      {
        term: 'quantization',
        def: 'Storing numbers with fewer bits to save memory, at some risk to quality.',
      },
    ],
    check: [
      {
        q: 'What is the KV cache, and why does it limit concurrency?',
        a: `The stored keys and values for every token of every active request. It grows with context length, so GPU memory caps how many requests fit at once.`,
      },
      {
        q: 'What problem does PagedAttention solve?',
        a: `Wasted memory from reserving large contiguous regions per request. Fixed-size blocks tracked by a table cut the waste to nearly zero and allow prefix sharing.`,
      },
      {
        q: 'What does continuous batching change?',
        a: `Requests join and leave the batch at every generation step, so the GPU never waits for the slowest request.`,
      },
      {
        q: 'Why include utilisation in the self-hosting cost?',
        a: `You pay for the GPU whether it's busy or idle; at 30% utilisation each token costs over three times as much.`,
      },
    ],
    practice: [
      {
        mode: 'spec',
        title: 'How many conversations fit?',
        body: `Llama 3.1 8B (8.03 billion parameters) in 16-bit on a 24 GiB GPU, with
\`--gpu-memory-utilization 0.9\`. Reserve 1.5 GiB for activations and overhead.

1. How much memory do the weights take?
2. How many tokens of KV cache fit?
3. How many full-length conversations fit at once with \`--max-model-len 8192\`? With
   4,096?
4. Name two ways to fit more.`,
        answer: `**1.** 8.03 × 10⁹ × 2 bytes ≈ 16.06 GB ≈ **14.96 GiB**.

**2.** 24 × 0.9 = 21.6 GiB usable. 21.6 − 14.96 − 1.5 ≈ **5.14 GiB** for the cache.
At 128 KiB per token: 5.14 GiB ÷ 128 KiB ≈ **42,000 tokens**.

**3.** At 8,192 tokens each: 42,000 ÷ 8,192 ≈ **5 conversations**. At 4,096: about
**10**. (Most conversations are shorter than the maximum, so more fit in practice —
but plan for the worst case.)

**4.** Any two of:
- **An FP8 KV cache** (\`--kv-cache-dtype fp8\`) halves the bytes per token → about
  84,000 tokens.
- **4-bit weights** (AWQ or GPTQ, about 5 GiB) leave roughly 15 GiB for the cache —
  about three times as many tokens. Check quality on your evals.
- **A shorter \`--max-model-len\`**, if your prompts allow it.
- **More GPUs** with tensor parallelism.
- **Prefix caching**, so a shared system prompt is stored once, not per request.`,
      },
      {
        mode: 'decision',
        title: 'API or self-host?',
        body: `A GPU costs ₹80 an hour. Your load test shows it sustains 1,500 output tokens per
second across all users at your latency target.

1. What's the cost per million output tokens at 100% utilisation? At 30%?
2. For each team, API or self-host?
   - **A.** A startup with spiky traffic of about 2 million tokens a day.
   - **B.** A bank whose customer data must stay in its own cloud account, running
     an extraction task 24/7 at steady high volume, where a tuned 8B model matches
     the hosted model on the eval set.
   - **C.** A hackathon demo.`,
        answer: `**1.** 1,500 × 3,600 = 5.4 million tokens an hour → ₹80 ÷ 5.4 ≈ **₹14.8 per million**
at 100%. At 30% utilisation: 1.62 million an hour → **₹49 per million**. Compare these
with the API price of a model that passes the same evals — and add the engineering time
to run it.

**2.**
- **A — API.** Spiky, small volume: a GPU would sit idle most of the day, and the team
  would own the operations for nothing.
- **B — self-host.** Data residency is a hard requirement; the load is steady (high
  utilisation); and the small model is proven equal on evals. This is the textbook
  case.
- **C — API.** Zero operations; the demo needs to work tonight, not be cheap at scale.`,
      },
    ],
  },
  {
    id: 's7.3.t3',
    moduleId: 's7.3',
    title: 'GraphRAG: when similar isn\'t enough',
    outcome: `You can explain when vector search fails on connected facts, how GraphRAG builds and queries a knowledge graph, what it costs, and when cheaper fixes win.`,
    minutes: 35,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
      {
        kind: 'find',
        label: 'Visual',
        query: 'GraphRAG explained knowledge graph vs vector RAG',
        channel: '',
        reason: 'GraphRAG\'s pipeline, drawn',
      },
    ],
    animations: ['anim-graphrag-vs-vector'],
    analogy: `Finding a friend-of-a-friend on LinkedIn. Searching for profiles "similar to" your question
won't find them. You follow connections: you → your colleague → their manager. Some
questions are about connections, not similarity.`,
    notes: `## Where vector search fails

Two kinds of question:

- **Multi-hop:** "Who manages the team that owns the payments service?" The answer needs
  two facts from different chunks — and the second one doesn't look like the question.
- **Global:** "What are the main themes across 5,000 support tickets?" No single chunk
  holds the answer; top-k retrieval only ever sees a sliver.

---

## The graph idea

A **knowledge graph** stores **entities** (services, teams, people, products) as nodes,
and **relationships** (owns, manages, depends on) as edges.

Multi-hop questions become walks along edges.

Built with an LLM: extract \`(subject, relation, object)\` **triples** from each chunk,
merge duplicate names ("Checkout team" = "checkout"), and store them — in a graph database
like Neo4j, or in two Postgres tables.

---

## Microsoft's GraphRAG

Indexing:

1. An LLM extracts entities and relationships from every chunk.
2. **Community detection** (the Leiden algorithm) groups tightly connected entities.
3. The LLM writes a **summary for each community**, at several levels of detail.

Two ways to query:
- **Local search:** start from the entities in the question, gather their neighbourhood
  and source text, then answer. For specific, multi-hop questions.
- **Global search:** map-reduce over the community summaries. For "themes across
  everything" questions.

---

## The cost

Indexing calls an LLM on **every chunk**, then again for the summaries — far more than
embedding does. Updates are harder, too: new documents can change entities and
communities.

Lighter variants cut the indexing bill — for example, Microsoft's **LazyGraphRAG**, which
moves most LLM work to query time, and **LightRAG**. Always price the indexing on a
sample before committing.

---

## Try cheaper fixes first

- **Iterative (agentic) retrieval:** retrieve, read, search again with what you learned
  ("Checkout team manager"). Often enough for two hops — no graph.
- **Query decomposition:** split the question into sub-questions first.
- **Structured data:** if the facts are really a table — an org chart, a service
  registry — put them in SQL and let the model query it.
- **For global questions:** map-reduce summaries over clusters of documents.

Use GraphRAG when connected facts dominate and these fall short — **measured** on a
multi-hop golden set.`,
    docs: [
      {
        label: 'Microsoft GraphRAG',
        url: 'https://microsoft.github.io/graphrag/',
      },
      {
        label: 'From Local to Global: A Graph RAG Approach',
        url: 'https://arxiv.org/abs/2404.16130',
      },
    ],
    glossary: [
      {
        term: 'multi-hop question',
        def: 'A question whose answer needs several facts, found by following links between them.',
      },
      {
        term: 'knowledge graph',
        def: 'Entities as nodes and relationships as edges, queried by walking connections.',
      },
      {
        term: 'triple',
        def: 'One fact as (subject, relation, object).',
      },
      {
        term: 'community detection',
        def: 'Grouping tightly connected nodes in a graph; GraphRAG uses the Leiden algorithm.',
      },
      {
        term: 'entity resolution',
        def: 'Deciding that different names refer to the same thing, and merging them.',
      },
    ],
    check: [
      {
        q: 'Why does vector search miss the second hop of a multi-hop question?',
        a: `The chunk with the second fact doesn't resemble the question, so it isn't similar enough to be retrieved.`,
      },
      {
        q: 'What are GraphRAG\'s local and global searches for?',
        a: `Local: specific multi-hop questions, starting from entities in the question. Global: corpus-wide themes, map-reducing over community summaries.`,
      },
      {
        q: 'Why is GraphRAG indexing expensive?',
        a: `It runs an LLM over every chunk to extract entities and relations, and again to summarise communities.`,
      },
      {
        q: 'Name two cheaper fixes to try first.',
        a: `Any two of: iterative retrieval, query decomposition, putting table-like facts in SQL, map-reduce summaries for global questions.`,
      },
    ],
    practice: [
      {
        mode: 'decision',
        title: 'Graph, iterative retrieval, or SQL?',
        body: `Choose an approach, and say why:

1. "Which of our suppliers are in the same city as the vendor that had a security
   incident last quarter?" — over 3,000 contracts and incident reports.
2. "Who's the on-call engineer for the service that's failing?" — a service registry
   and an on-call rota already exist as tables.
3. "What are the most common complaints across last year's 20,000 reviews?"
4. "What does clause 14.3 of the Pune lease say about repairs?"`,
        answer: `1. **Start with iterative retrieval; consider a graph.** Two hops (incident → vendor's
   city → suppliers in that city) across unstructured text. Try "find the incident,
   then search suppliers by that city" first. If questions like this are the norm,
   a graph of vendors, suppliers and cities earns its cost.
2. **SQL.** The facts are already tables. Give the model a query tool over the registry
   and rota — exact, current, cheap.
3. **A global question.** Map-reduce summarisation over clusters of reviews — or
   GraphRAG's global search if you'll ask many such questions over the same corpus.
4. **Plain hybrid search.** One fact, in one place, with an exact clause number —
   Stage 3's retrieval handles it. A graph adds nothing.`,
      },
      {
        mode: 'spec',
        title: 'Triples into a graph you can query',
        body: `Write:

1. Pydantic models for extracting triples with \`client.messages.parse\` — entity types
   \`service\`, \`team\`, \`person\`; relations \`owns\`, \`manages\`, \`depends_on\`, \`member_of\`;
   and the chunk each triple came from.
2. A \`canonical()\` function that merges "The Checkout Team", "checkout team" and
   "checkout" — but keeps the Platform *team* and the Platform *service* separate.
3. The SQL (entities and edges tables) answering "Who manages the team that owns
   payments?", returning the source chunks as citations.`,
        answer: `\`\`\`python
import re
from typing import Literal
from pydantic import BaseModel

EntityType = Literal["service", "team", "person"]

class Triple(BaseModel):
    subject: str
    subject_type: EntityType
    relation: Literal["owns", "manages", "depends_on", "member_of"]
    object: str
    object_type: EntityType
    chunk_id: str

class Extraction(BaseModel):
    triples: list[Triple]

ALIASES = {("service", "pay svc"): "payments"}

def canonical(name: str, kind: str) -> tuple[str, str]:
    n = re.sub(r"\\s+", " ", name.strip().casefold())
    n = re.sub(r"^the ", "", n)
    n = re.sub(rf" {kind}$", "", n)              # "checkout team" -> "checkout"
    return kind, ALIASES.get((kind, n), n)
\`\`\`

The key is **(type, name)**, so "Platform" the team and "Platform" the service stay two
different entities. Merging on the name alone would join them — a classic graph bug.

\`\`\`sql
CREATE TABLE entities (id int PRIMARY KEY, type text NOT NULL, name text NOT NULL,
                       UNIQUE (type, name));
CREATE TABLE edges (src int NOT NULL REFERENCES entities, rel text NOT NULL,
                    dst int NOT NULL REFERENCES entities, chunk_id text NOT NULL,
                    PRIMARY KEY (src, rel, dst, chunk_id));

SELECT p.name AS manager, e1.chunk_id AS owner_source, e2.chunk_id AS manager_source
FROM entities s
JOIN edges e1   ON e1.dst = s.id   AND e1.rel = 'owns'
JOIN edges e2   ON e2.dst = e1.src AND e2.rel = 'manages'
JOIN entities p ON p.id = e2.src
WHERE s.type = 'service' AND s.name = 'payments';
\`\`\`

Checked on Postgres with four sample triples: the three spellings of Checkout merged
into one entity; Platform stayed two; the query returned **priya**, citing chunks
**c12** and **c87** — each hop has its source.

In Neo4j's Cypher, the same question is one line:
\`MATCH (p:Person)-[:MANAGES]->(:Team)-[:OWNS]->(:Service {name: 'payments'}) RETURN p.name\``,
      },
    ],
  },
  {
    id: 's7.3.t4',
    moduleId: 's7.3',
    title: 'Computer use and browser agents',
    outcome: `You can explain how computer-use and browser agents work — the see-and-act loop, element references versus pixel coordinates — and the isolation and approval rules that make them safe to run.`,
    minutes: 35,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
    ],
    animations: [],
    analogy: `Remote-desktop support. A technician sees your screen, moves your mouse and types for you.
You'd only let them in on a separate machine, watch what they do, and approve anything
involving money. An agent driving a computer needs exactly the same rules.`,
    notes: `## When an agent needs a screen

Prefer APIs and MCP tools — faster, cheaper, more reliable.

Use screen control only when there's no API: legacy internal tools, websites without
APIs, workflows that span several apps, and exploratory testing of interfaces.

---

## The loop

1. Your app sends the task and the tools.
2. Claude replies with actions — take a screenshot, click at (x, y), type text.
3. **Your code** performs them in a sandboxed environment.
4. It returns the results — screenshots as images, a short "OK" for other actions.
5. Repeat until the task is done.

Anthropic's **computer use tool** is a *client toolset*: one entry,
\`{"type": "computer_toolset_20260801"}\`, gives Claude member tools such as \`screenshot\`,
\`left_click\`, \`type\` and \`zoom\`. Nothing runs on Anthropic's side — your executor does
everything.

---

## Batches: in order, stop at the first failure

Claude often sends **several actions in one turn** — click, type, screenshot. Run them
**in order**: each depends on the one before.

- Every call gets exactly one \`tool_result\`, carrying \`"toolset_name": "computer"\`.
- If one fails, return \`is_error: true\` with what went wrong, and **don't run the rest**
  — mark each skipped one as an error saying it wasn't executed.
- If a person must approve risky actions, check **before each action**, since one
  batch can finish a multi-step action.

---

## Browser use: read the page, not just pixels

For tasks inside web pages, the **browser use tool** (\`browser_toolset_20260801\`) fits
better. Claude reads the page's **accessibility tree** — elements tagged like
\`[ref_2]\` — and clicks by reference.

References survive layout shifts; a tree read often costs fewer tokens than a screenshot.
Screenshots and coordinates remain the fallback for canvas and unusual widgets.

---

## Coordinates

Coordinates are in the pixel space of the **screenshots you return**. If you shrink a
screenshot to fit image limits, scale Claude's coordinates back up before clicking. Keep
screenshot sizes consistent.

---

## Safety: the non-negotiables

From Anthropic's docs:

1. A **dedicated VM or container** with minimal privileges.
2. **No sensitive data** or logged-in accounts it doesn't need.
3. A **domain allowlist**, enforced at the network layer.
4. A **person confirms** consequential actions — purchases, messages, accepting terms.

Any page can carry a prompt injection. Anthropic runs classifiers that flag likely
injections in screenshots and page content — but the rules above still apply. Everything
a page supplies is untrusted input.

---

## Evaluating these agents

Scripted tasks in a test environment you control. Measure the success rate, steps and
cost per task, recovery from unexpected pages — and safety: did it ever leave the
allowlist, or skip an approval?`,
    docs: [
      {
        label: 'Claude — computer use tool',
        url: 'https://platform.claude.com/docs/en/agents-and-tools/tool-use/computer-use-tool',
      },
      {
        label: 'Claude — browser use tool',
        url: 'https://platform.claude.com/docs/en/agents-and-tools/tool-use/browser-use-tool',
      },
      {
        label: 'Reference implementation',
        url: 'https://github.com/anthropics/anthropic-quickstarts/tree/main/computer-use-demo',
      },
    ],
    glossary: [
      {
        term: 'client toolset',
        def: 'A set of Anthropic-defined tools declared as one entry, executed by your own code.',
      },
      {
        term: 'batch action',
        def: 'Several tool calls in one model turn, to be run in order.',
      },
      {
        term: 'accessibility tree',
        def: 'The structured description of a page\'s elements that assistive technology uses.',
      },
      {
        term: 'domain allowlist',
        def: 'The only websites an agent is allowed to reach.',
      },
    ],
    check: [
      {
        q: 'When should an agent use screen control instead of an API?',
        a: `Only when there's no API: legacy tools, sites without APIs, cross-app workflows, or exploratory UI testing.`,
      },
      {
        q: 'How do you handle a batch of actions where the second fails?',
        a: `Run in order; return the second as an error; don't run the rest, marking each as not executed. Every call still gets a result.`,
      },
      {
        q: 'Why prefer element references over coordinates in a browser?',
        a: `References survive layout shifts and reflows, and reading the page tree often costs fewer tokens than a screenshot.`,
      },
      {
        q: 'Name the four safety rules for computer use.',
        a: `A dedicated low-privilege VM or container; no unneeded sensitive data or logins; a network-level domain allowlist; human confirmation for consequential actions.`,
      },
    ],
    practice: [
      {
        mode: 'spec',
        title: 'Execute a batch safely',
        body: `Write \`run_batch(response, env, needs_approval, ask_person)\` for the computer toolset:

- handle only \`tool_use\` blocks whose \`toolset_name\` is \`"computer"\`;
- run them in order with \`env.run(name, input)\`, which returns content or raises;
- one \`tool_result\` per block, each with \`"toolset_name": "computer"\`;
- before running a block, if \`needs_approval(block)\`, call \`ask_person(block)\` — a
  refusal counts as a failure;
- after a failure, don't run anything else; mark later blocks with the exact text
  \`Not executed: an earlier computer action in this turn failed.\``,
        answer: `\`\`\`python
NOT_EXECUTED = "Not executed: an earlier computer action in this turn failed."

def run_batch(response, env, needs_approval, ask_person) -> list[dict]:
    results, failed = [], False
    for block in response.content:
        if block.type != "tool_use" or block.toolset_name != "computer":
            continue
        result = {"type": "tool_result", "tool_use_id": block.id, "toolset_name": "computer"}
        if failed:
            result.update(content=NOT_EXECUTED, is_error=True)
        elif needs_approval(block) and not ask_person(block):
            result.update(content="A person declined this action.", is_error=True)
            failed = True                  # later actions assumed this one happened
        else:
            try:
                result["content"] = env.run(block.name, block.input)
            except Exception as err:
                result.update(content=f"Error: {err}", is_error=True)
                failed = True
        results.append(result)
    return results
\`\`\`

Checked with fake blocks:
- click, type, screenshot → OK, OK, an image;
- click, an unimplemented \`triple_click\`, type, screenshot → OK, an error, then two
  "not executed" — and \`type\` never ran;
- approval declined on \`type\` → OK, declined, not executed.

Why a refusal halts the batch: the actions after it were planned assuming it happened.
Running them anyway could type into the wrong field, or confirm something half-done.
Claude sees exactly what ran and what didn't, and replans.

Send \`results\` back as the content of the next \`user\` message.`,
      },
      {
        mode: 'decision',
        title: 'Which approach?',
        body: `Choose, for each: an API or MCP tool, a browser or computer-use agent, a
conventional script — or not automating it.

1. Fill 200 forms in an old internal app that has no API.
2. Get order statuses from a SaaS product with a documented REST API.
3. Check that your React app's checkout still works on every pull request.
4. Book flights for employees using the company card.`,
        answer: `1. **A browser (or computer-use) agent** — there's no API. Run it in a sandbox, start
   with a handful of forms under supervision, and have a person approve each
   submission until the error rate is known.
2. **An API tool.** Faster, cheaper and deterministic. Screen control here would be
   slower and more fragile for no gain.
3. **A conventional Playwright test.** Deterministic and cheap to run on every PR. An
   agent could add exploratory testing on top, but it shouldn't be the gate.
4. **A booking API with human approval**, if one exists. If an agent has to do it,
   a person confirms before every purchase — the docs name financial transactions
   explicitly — and the card is never visible to the agent.`,
      },
      {
        mode: 'break',
        title: 'Find the unsafe setup',
        body: `> "Our agent runs on a developer's laptop so it can use their logged-in Gmail and
> banking sessions. It can browse any site. To save time, it accepts cookie banners and
> terms of service by itself, and runs batches without pausing."

List the problems and the fixes.`,
        answer: `1. **The developer's own laptop** → a dedicated VM or container with minimal
   privileges. A mistake — or an injection — could damage a real machine.
2. **Logged into Gmail and banking** → a fresh profile with no credentials, and only
   the accounts the task needs. Otherwise a malicious page can steer it into reading
   email or moving money.
3. **Any site** → a domain allowlist enforced at the network layer, re-checked after
   redirects.
4. **Accepts terms and cookies on its own** → the docs list accepting terms and
   anything needing consent as actions for a person to confirm.
5. **No pauses within batches** → check for approval before *each* action, because a
   single batch can complete a whole multi-step action.
6. And **inform users and get consent** before enabling this in a product.`,
      },
    ],
  },
];
