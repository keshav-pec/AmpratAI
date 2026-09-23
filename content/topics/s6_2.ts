import type { Topic } from '@/lib/types';

export const s6_2: Topic[] = [
  {
    id: 's6.2.t1',
    moduleId: 's6.2',
    title: 'Five specialisations, one choice',
    outcome: `You can describe the five specialisations — the day-to-day job, what interviews test, and what project proves it — and choose one from evidence, not hype.`,
    minutes: 30,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
      {
        kind: 'find',
        label: 'Visual',
        query: 'types of AI engineer roles explained LLMOps agentic forward deployed',
        channel: '',
        reason: 'how the AI engineering titles differ in practice',
      },
    ],
    animations: [],
    analogy: `Choosing a branch after the common first year. Everyone takes the same core (for you,
Stages 1–5). Then you pick one direction to go deep. The branch shapes your projects and
interviews — but you keep the core, and the core is what makes the depth useful.`,
    notes: `## Why pick one

"Full-stack AI engineer" is your headline. A **specialisation** is your depth — the topic
you can discuss for 45 minutes without running out.

Hiring teams look for **T-shaped** people: broad enough to build the whole thing, deep in
one part. One depth is enough. Two half-depths read as none.

---

## Agentic AI

- **The job:** agents that reliably take actions — multi-step tasks, tools, recovery.
- **Interviews test:** tool design, loop control and budgets, **durable execution**
  (resuming after a crash), human approval, and agent evals that score the whole path,
  not just the final answer.
- **Proof project:** an agent that survives a crash mid-task and resumes from its last
  checkpoint, with an eval suite over its runs.
- **Suits you if** Stage 4 was your favourite.

---

## Context engineering

- **The job:** deciding what information reaches the model at each step — retrieval,
  memory, token budgets.
- **Interviews test:** RAG in depth, chunking, hybrid search and reranking, retrieval
  evals, memory designs, GraphRAG.
- **Proof project:** a retrieval system with measured gains on a hard corpus — for
  example, multi-hop questions over linked documents.
- **Suits you if** Stage 3 felt like puzzles you enjoyed.

---

## LLMOps

- **The job:** deploy, scale, watch and pay for LLM systems. DevOps for AI.
- **Interviews test:** containers, Kubernetes, gateways, caching, autoscaling,
  self-hosting (vLLM), cost, incident response.
- **Proof project:** a self-hosted model gateway with routing, autoscaling and cost
  dashboards, load-tested.
- **Suits you if** Stage 5 was the one you couldn't stop tinkering with.

---

## AI evals

- **The job:** the systems that measure AI quality — golden sets, judges, error
  analysis, red-teaming.
- **Interviews test:** judge calibration, basic statistics (confidence intervals,
  whether a difference is real), annotation tooling, error analysis.
- **Proof project:** an annotation and judge-calibration tool that reports how well the
  judge agrees with people.
- **Suits you if** you liked Stages 3.8 and 5.5, and you're the one who asks "prove it".

---

## Forward-deployed

- **The job:** build AI solutions with a client, close to their team — discovery,
  quick prototypes, demos, handover.
- **Interviews test:** turning a vague need into a spec, building live, explaining
  trade-offs to non-engineers, handling ambiguity.
- **Proof project:** three quick client-style prototypes in different domains, each with
  a discovery note and a demo video.
- **Suits you if** you enjoy people and speed more than one deep system. Your React
  speed is a real edge here.

---

## How to choose

Three inputs, in this order:

1. **The market:** which job descriptions excite you? (The next topic tallies them.)
2. **You:** which stage's practice did you finish without being pushed?
3. **The capstone:** which part did you most enjoy building?

Not an input: what's trending this month.

And the choice isn't permanent. It's which depth you build *next*.`,
    docs: [],
    glossary: [
      {
        term: 'specialisation',
        def: 'The one area you go deep in, on top of broad full-stack skills.',
      },
      {
        term: 'T-shaped',
        def: 'Broad across a field, deep in one part of it.',
      },
      {
        term: 'durable execution',
        def: 'Running a long task so it can resume after a crash from its last saved step.',
      },
      {
        term: 'forward-deployed',
        def: 'Working directly with a client\'s team to build and hand over a solution.',
      },
    ],
    check: [
      {
        q: 'Why pick exactly one specialisation?',
        a: `It gives you one deep area to discuss at length. Hiring teams want T-shaped people; two half-depths read as none.`,
      },
      {
        q: 'Which specialisation interviews hardest on communication?',
        a: `Forward-deployed: you turn vague client needs into specs, build live and explain trade-offs to non-engineers.`,
      },
      {
        q: 'What would prove depth in AI evals?',
        a: 'An annotation and judge-calibration tool that reports how well the judge agrees with human labels.',
      },
      {
        q: 'What are the three inputs for choosing, in order?',
        a: `The job descriptions that excite you, the stage whose practice you finished unprompted, and the capstone part you enjoyed most.`,
      },
    ],
    practice: [
      {
        mode: 'decision',
        title: 'Match the person to the specialisation',
        body: `Suggest a specialisation for each person, with one reason.

1. Loved tuning chunking and reranking; keeps a spreadsheet of recall numbers.
2. Spent a whole weekend making a Docker image 400 MB smaller, for fun.
3. Happiest on calls with the non-tech founder of a friend's startup, sketching what
   they need.
4. Their agent's approval gate and restart recovery is the part of p-4.1 they keep
   showing people.
5. Built a small tool to label 200 answers and was fascinated that the LLM judge
   disagreed with them on 30%.`,
        answer: `1. **Context engineering** — retrieval quality is the job, and measuring it is the habit.
2. **LLMOps** — they enjoy the infrastructure for its own sake.
3. **Forward-deployed** — discovery and communication energise them.
4. **Agentic AI** — durable execution and human-in-the-loop are the core of that role.
5. **AI evals** — judge disagreement is exactly the problem evals engineers work on.

Any of them could pick differently — the point is to decide from what they *did*, not
from what sounds impressive.`,
      },
      {
        mode: 'read',
        title: 'What would they ask?',
        body: `For each specialisation, write two questions you'd expect in an interview, and one
line on what a strong answer includes.`,
        answer: `Examples — check yours against the ideas, not the wording.

**Agentic**
- "Your agent loops forever. Detect it, stop it, prevent it." → step and cost budgets,
  repeated-call detection, a clear stop reason, and evals over the run's path.
- "How does a run survive a restart?" → checkpoint state after each step, idempotent
  tools, resume from the last checkpoint.

**Context engineering**
- "How do you know your retrieval is good?" → a golden set, recall@k and MRR, a results
  table with baselines.
- "A multi-hop question fails. What do you try?" → query decomposition, iterative
  retrieval, then a graph if connections dominate.

**LLMOps**
- "p95 is 11 s, target is 4 s. Where do you look?" → traces: queueing, retrieval,
  time to first token, output length; then caching, streaming, routing.
- "Costs tripled overnight with flat traffic." → cost by route and tenant, token counts
  per request, cache hit rate, retries, a prompt or model change.

**AI evals**
- "How do you know your judge is any good?" → compare it with human labels on a
  sample; report agreement; check known biases like position and length.
- "Offline scores are up, users complain." → the golden set no longer matches real
  traffic; sample production, relabel, look for new failure types.

**Forward-deployed**
- "A client says 'we want AI for our support team'. What next?" → discovery: the
  volume, current process, success metric, data access, a small pilot.
- "Build a prototype in 45 minutes." → narrow the scope out loud, build the core
  path first, demo, and state what you'd do next.`,
      },
    ],
  },
  {
    id: 's6.2.t2',
    moduleId: 's6.2',
    title: 'Reading job descriptions like data',
    outcome: `You can decode a job description — which role it really is, what's required versus wished for, how senior, and whether the AI work is real — and tally twenty of them to pick your focus.`,
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
        query: 'how to read a job description software engineer what matters',
        channel: '',
        reason: 'reading JDs critically',
      },
    ],
    animations: [],
    analogy: `Reading a client's requirements document in your MERN work. Half of it is must-have, a
third is wishful thinking, and some of it contradicts itself. You learned to find the
three things they'd actually pay for. A job description is the same kind of document.`,
    notes: `## A wish list, not a checklist

A job description (JD) is usually an old JD, a manager's wishes and HR boilerplate,
stitched together. Almost nobody meets all of it.

So don't read it as a test you must pass. Read it as **data** about what the team needs.
If you meet most of the must-haves and can *show* evidence for them, apply.

---

## Decode in four passes

1. **Which role is it really?** Look at the verbs. "Deploy, scale, monitor" → LLMOps.
   "Work with clients" → forward-deployed. "Build agents that…" → agentic. "Retrieval,
   grounding" → context engineering. "Evaluate, benchmark" → evals.
2. **Must vs nice.** "Required", "you have", "must" versus "bonus", "nice to have",
   "familiarity with".
3. **Seniority.** Years, and verbs: *own, lead, design, mentor* versus *implement,
   contribute, support*.
4. **Is the AI work real?** Next slide.

---

## Real AI work, or a wrapper?

**Signs it's real:**
- production users, and numbers about them
- evals, quality metrics, latency or cost targets
- specific problems: retrieval over *their* data, agents taking *their* actions
- on-call, incidents, owning a service

**Warning signs:**
- "prompt engineering" or "using ChatGPT to improve productivity" as the main task
- "AI enthusiast", "exposure to AI"
- a long list of every buzzword — LangChain, TensorFlow, computer vision, Big Data,
  Power BI — with no product in sight

**Different job:** "train models, publish papers, PhD preferred" is ML research. Good job;
not this path.

---

## Tally twenty

Collect twenty JDs you'd plausibly apply to. For each, record:

| company | role | must tags | nice tags | seniority | real AI (0–2) | excited? |
|---|---|---|---|---|---|---|

**Normalise the tags** so they can be counted: "LangGraph", "tool calling" and "agents"
all become \`agents\`; "RAG", "vector DB" and "retrieval" become \`retrieval\`.

You can extract these with Claude and structured output (Stage 2) — a fixed list of
allowed tags keeps them consistent. But read every JD yourself too.

---

## From tally to action

Count tags only across the JDs you're **excited** by. Then:

- **In 40% or more, and you have evidence** → lead with it in applications.
- **In 40% or more, and you lack it** → your gap list (Stage 7.2 turns each gap into a
  short plan).
- **Between 10% and 40%** → watch: note it, don't act on it yet.
- **Under 10%** → ignore for now, however loud it is online.

The top tags usually point straight at your specialisation.`,
    docs: [],
    glossary: [
      {
        term: 'job description (JD)',
        def: 'A posting that describes a role; best read as data about what a team needs.',
      },
      {
        term: 'tag',
        def: 'A normalised skill label, so the same skill is counted once across JDs.',
      },
      {
        term: 'wrapper role',
        def: 'A job titled \'AI\' whose work is using AI tools, not engineering AI systems.',
      },
    ],
    check: [
      {
        q: 'What are the four passes for decoding a JD?',
        a: `Which role it really is (from the verbs); must-haves versus nice-to-haves; seniority (years and verbs like own or lead); whether the AI work is real.`,
      },
      {
        q: 'Name two signs a role has real AI work.',
        a: `Any two of: production users with numbers; evals or quality metrics; latency or cost targets; specific problems with their own data; on-call ownership.`,
      },
      {
        q: 'Why normalise tags before counting?',
        a: `Different words mean the same skill. Without normalising, 'RAG', 'retrieval' and 'vector DB' are counted separately and the tally misleads.`,
      },
      {
        q: 'Why count tags only across JDs you\'re excited by?',
        a: 'The tally should point at the jobs you actually want, not at the whole market.',
      },
    ],
    practice: [
      {
        mode: 'read',
        title: 'Decode three job descriptions',
        body: `For each: the role, the must-haves, the nice-to-haves, the seniority, and whether the
AI work is real — quoting your evidence.

**A — FinPay (fintech, Bengaluru).** "We're building an assistant that answers
merchants' questions about settlements and disputes, grounded in our policy documents
and each merchant's transactions. You will own retrieval and generation pipelines in
Python, design evals that run in CI for faithfulness and accuracy, and work with the
platform team on latency (p95 under 3 s) and cost per conversation. It ships to
40,000 merchants. You have 2+ years of backend engineering in Python or Go, have shipped
an LLM feature to production, and know SQL. Nice to have: vector databases, LangGraph,
React."

**B — TalentSpark Solutions (IT services).** "Looking for an AI enthusiast with
exposure to ChatGPT, Gemini, Copilot, Midjourney, LangChain, LlamaIndex, TensorFlow,
PyTorch, OpenCV, NLP, computer vision, Big Data and Power BI. You will create prompts to
improve the productivity of internal teams and support AI initiatives across accounts.
Freshers with a passion for AI welcome. Excellent communication a must."

**C — ShopKart (e-commerce).** "Run our self-hosted LLM inference (vLLM on Kubernetes)
serving 30M requests a day: autoscaling, GPU utilisation, a model gateway with
fallbacks, and cost attribution by team. You'll join the on-call rotation. Must:
Kubernetes in production, Python or Go, Prometheus and Grafana. Nice: vLLM or TGI,
CUDA basics, Terraform."`,
        answer: `**A — context engineering, with a full-stack flavour. Real.**
- Must: 2+ years backend (Python/Go), an LLM feature shipped to production, SQL.
- Nice: vector databases, LangGraph, React.
- Seniority: mid — "you will **own**" pipelines.
- Real: "grounded in our policy documents", "evals that run in CI", "p95 under 3 s",
  "cost per conversation", "40,000 merchants".
- For you: a strong fit. Lead with p-3.1's results table and the eval gate from p-5.1.

**B — not AI engineering. A wrapper role.**
- Must: communication. Nice: fourteen unrelated tools.
- Seniority: entry ("freshers welcome").
- Warning signs: "AI enthusiast", "exposure to", "create prompts to improve
  productivity", a buzzword list covering vision, NLP, BI and Big Data with no product.
- For you: skip. It won't grow the skills this path built.

**C — LLMOps. Real, and demanding.**
- Must: Kubernetes in production, Python or Go, Prometheus/Grafana.
- Nice: vLLM/TGI, CUDA basics, Terraform.
- Seniority: mid to senior — "on-call", "Kubernetes **in production**".
- Real: "30M requests a day", autoscaling, GPU utilisation, gateway with fallbacks,
  cost attribution.
- For you: a stretch unless LLMOps is your specialisation — production Kubernetes is
  the gap.`,
      },
      {
        mode: 'spec',
        title: 'A JD extractor with a fixed tag list',
        body: `Write the Pydantic models for extracting a JD with \`client.messages.parse\`, so every
tag comes from a fixed list and every requirement keeps its exact quote. Include the
role, seniority, and quotes that suggest real or wrapper work.

Then write the tally: given a list of extracted JDs and a set of the companies you're
excited by, print each tag's share, and whether to *lead*, *close the gap*, *watch* or
*ignore*.`,
        answer: `\`\`\`python
from collections import Counter
from typing import Literal
from pydantic import BaseModel, Field

Tag = Literal["retrieval", "agents", "evals", "infra", "self-hosting", "fine-tuning",
              "frontend", "backend", "sql", "llm-production", "communication", "other"]
Role = Literal["agentic", "llmops", "forward-deployed", "context", "evals",
               "full-stack", "not-ai-engineering"]

class Requirement(BaseModel):
    tag: Tag
    kind: Literal["must", "nice"]
    quote: str = Field(description="the exact words from the posting")

class JD(BaseModel):
    company: str
    role: Role
    seniority: Literal["entry", "mid", "senior", "lead"]
    requirements: list[Requirement]
    real_ai_quotes: list[str] = Field(description="quotes showing production AI work")
    wrapper_quotes: list[str] = Field(description="quotes suggesting no real AI engineering")

def extract(client, text: str) -> JD:
    response = client.messages.parse(
        model="claude-haiku-4-5",
        max_tokens=2048,
        messages=[{"role": "user", "content":
                   f"Extract this job posting.\\n\\n<posting>\\n{text}\\n</posting>"}],
        output_format=JD,
    )
    return response.parsed_output

def tally(jds: list[JD], excited: set[str], have: set[str]) -> None:
    chosen = [j for j in jds if j.company in excited]
    counts = Counter(t for j in chosen for t in {r.tag for r in j.requirements})
    for tag, n in counts.most_common():
        share = n / len(chosen)
        if share >= 0.4:
            action = "lead" if tag in have else "close the gap"
        elif share >= 0.1:
            action = "watch"
        else:
            action = "ignore"
        print(f"{tag:15} {share:4.0%}  {action}")
\`\`\`

Why these choices:

- **\`Literal\` tags** force the model to pick from your list, so "RAG" and "vector DB"
  can't appear as separate tags. The count is only as good as the normalising.
- **\`{r.tag for r in ...}\`** — a set, so a JD that mentions retrieval three times
  counts once.
- **Quotes** let you check the extraction against the posting in seconds.`,
      },
      {
        mode: 'decision',
        title: 'What does the tally say?',
        body: `You read 20 JDs and were excited by 14. Tag counts across those 14:

| tag | JDs |
|---|---|
| retrieval | 11 |
| evals | 9 |
| agents | 7 |
| infra (Kubernetes, cloud) | 6 |
| frontend | 5 |
| fine-tuning | 2 |
| self-hosting | 2 |
| GraphRAG | 1 |

Your evidence: strong retrieval (p-3.1), an eval gate (p-5.1), an agent (p-4.1),
React from MERN. Kubernetes: none.

Pick the specialisation, what to lead with, and your gap list.`,
        answer: `Shares: retrieval 79%, evals 64%, agents 50%, infra 43%, frontend 36%, fine-tuning 14%,
self-hosting 14%, GraphRAG 7%.

- **Specialisation: context engineering.** Retrieval tops the tally and you have
  evidence; evals (64%) supports it directly — measuring retrieval *is* the job.
- **Lead with:** p-3.1's results table and the eval gate. Mention the agent (50%) second.
- **Gap list:** infra at 43% crosses the 40% line and you have nothing — a small,
  focused plan: containers on a managed Kubernetes service, one deployment with
  autoscaling. Not a certification.
- **Watch:** frontend (36%) — you already have React, so make sure it's visible.
  Fine-tuning and self-hosting (14% each) — note them, don't act yet.
- **Ignore for now:** GraphRAG (7%). However loud it is online, one JD in fourteen
  doesn't justify it yet.`,
      },
    ],
  },
  {
    id: 's6.2.t3',
    moduleId: 's6.2',
    title: 'Planning your specialisation project',
    outcome: `You can scope the specialisation project (p-7.1) around one hard problem your target jobs care about, with a number to move, a demo moment, and a clear definition of done.`,
    minutes: 30,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
    ],
    animations: [],
    analogy: `A good hackathon entry: one sharp idea, one impressive demo moment, finished. Not ten
half-built features. Judges remember the moment the demo did something hard in front of
them. Your specialisation project should work the same way.`,
    notes: `## One hard problem

This project exists to prove depth. Pick the problem your target JDs mention most — one
that's hard in a way you can explain in a sentence.

- **Agentic:** a browser agent that survives a crash mid-task and resumes from its last
  checkpoint.
- **Context:** GraphRAG versus hybrid search on a linked corpus, measured on multi-hop
  questions.
- **LLMOps:** a self-hosted vLLM gateway with routing, autoscaling and a cost dashboard.
- **Evals:** an annotation and judge-calibration tool.
- **Forward-deployed:** three quick client-style prototypes in different domains.

---

## A number to move

Depth shows as measurement: **baseline → your change → result, and what it cost.**

The shapes to aim for:

- "multi-hop accuracy X% → Y% on 60 questions, at N× the indexing cost"
- "p95 under load X s → Y s at 50 requests per second"
- "judge agreement with humans X → Y"

Your real numbers go in. A made-up number is worse than no number — interviewers ask how
you measured it.

---

## Reuse the capstone

Build on what already works: auth, tracing, the eval harness, the deploy pipeline. The new
work should be the hard problem, and nothing else.

If the project needs a new login system, it's scoped wrong.

---

## The one-page brief

1. **Problem** — one sentence.
2. **Why it's hard** — one sentence.
3. **Baseline** — the simple approach you'll beat.
4. **Approach** — what you'll build.
5. **Metric and eval set** — what number, measured on what.
6. **Demo moment** — the 20 seconds that show it working.
7. **Done when** — a short checklist.
8. **Non-goals** and **risks**.

---

## Done means done

Finished and public beats ambitious and 80% done: a README with the results table, a
demo video, a short write-up. Then stop, and apply.

Signs of scope creep:
- "…and also a UI for configuring it"
- "support every model provider"
- "turn it into a library"`,
    docs: [],
    glossary: [
      {
        term: 'baseline',
        def: 'The simple approach a new approach must beat to count as progress.',
      },
      {
        term: 'demo moment',
        def: 'The short stretch of a demo that shows the hard thing working.',
      },
      {
        term: 'scope creep',
        def: 'A project growing beyond its plan, one reasonable-sounding addition at a time.',
      },
    ],
    check: [
      {
        q: 'What makes a good specialisation project problem?',
        a: 'One problem your target JDs mention most, hard in a way you can explain in one sentence.',
      },
      {
        q: 'What\'s the shape of the number to report?',
        a: 'Baseline → your change → result, plus what it cost — measured on a stated eval set.',
      },
      {
        q: 'Why build on the capstone\'s infrastructure?',
        a: 'So all new effort goes into the hard problem, not into rebuilding auth, tracing or deploys.',
      },
      {
        q: 'Name two signs of scope creep.',
        a: 'Any two of: adding a configuration UI, supporting every provider, turning it into a library.',
      },
    ],
    practice: [
      {
        mode: 'spec',
        title: 'Write the brief',
        body: `Your tally points to **context engineering**. Several target JDs mention "complex
questions across many documents". Write the one-page brief for your p-7.1 using the
eight headings from the slides.`,
        answer: `An example to compare against:

1. **Problem:** questions that need facts from several linked documents fail in
   hybrid RAG.
2. **Why it's hard:** the needed passages don't resemble the question, so similarity
   search doesn't retrieve them.
3. **Baseline:** p-3.1's hybrid search with reranking.
4. **Approach:** two alternatives, compared honestly — (a) iterative retrieval with
   query decomposition; (b) a GraphRAG-style entity graph over the same corpus.
5. **Metric and eval set:** answer accuracy and recall of the needed passages on 60
   hand-written multi-hop questions over a public linked corpus (for example, a
   company wiki export), plus indexing cost and latency.
6. **Demo moment:** the same question side by side — the baseline misses, the new
   approach walks the two hops and cites both passages.
7. **Done when:** results table with all three approaches; costs; README; a 90-second
   video; a short post (optional).
8. **Non-goals:** a general graph platform, custom graph UI, fine-tuning.
   **Risks:** graph extraction costs too much → index a subset first and project the
   cost; the questions are too easy → have a friend write 20 of them.

Note (a): it's cheap, and it may win. Reporting that honestly is a *stronger*
interview story than "the fancy one won".`,
      },
      {
        mode: 'break',
        title: 'Fix this over-scoped plan',
        body: `> "I'll build a general agent framework that works with every LLM provider, with a
> visual workflow editor, a plugin marketplace, built-in evals, and a hosted cloud
> version."

Cut it down to a project that proves agentic depth and can actually be finished.`,
        answer: `What's wrong: it's five products. A framework, an editor, a marketplace, an eval tool
and a cloud service — none will be finished, and none proves depth on its own.

A focused version:

- **Problem:** a browser agent doing a real multi-step task (for example, filing an
  expense claim in a demo app) fails halfway when the server restarts or a page
  changes.
- **Hard part:** resuming from a checkpoint without repeating side effects, and
  recovering from unexpected pages.
- **Number:** task success rate over 30 scripted runs with injected failures (crashes,
  slow pages, changed layouts), versus the same agent without checkpoints.
- **Demo moment:** kill the server mid-task; restart; watch it resume at the right
  step without filing the claim twice.
- **Non-goals:** multi-provider support, a visual editor, plugins, hosting for others.

One provider, one task, one number, one demo moment.`,
      },
    ],
  },
];
