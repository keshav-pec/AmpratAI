import type { Topic } from '@/lib/types';

export const s7_1: Topic[] = [
  {
    id: 's7.1.t1',
    moduleId: 's7.1',
    title: 'Running the interview loop',
    outcome: `You can prepare each round with a one-page sheet, run the round with a clear structure, and keep several hiring processes moving without dropping any.`,
    minutes: 25,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
    ],
    animations: [],
    analogy: `Match day in cricket. The net practice is already done. On the day, you study the pitch
and the opposition, stick to a plan, and review the footage afterwards. Preparing for one
specific round is short and targeted — the long work happened in Stage 6.`,
    notes: `## The shape of a process

A common sequence: recruiter call → technical screen (coding or concepts) → a loop of
rounds (system design, coding, a deep dive on your projects, behavioural) → hiring
manager → offer.

Every company differs. **Ask the recruiter** what the rounds are and what each one
assesses. Most will tell you — and it's the cheapest preparation there is.

---

## A one-page prep sheet per company

- **What they build with AI** — from the product, the JD, blog posts, talks — in your
  own words.
- **The role type**, and which project you'll lead with.
- **Three likely deep-dive questions** about your projects, with your answers.
- **Your 60-second pitch**, tuned to them.
- **Three questions to ask them** (Stage 7.4 has the ones that reveal real AI work).
- **Logistics:** time and time zone, the link, interviewers' names.

---

## During the round

- **Clarify before solving.** Restate the question.
- **Think aloud.** Name the trade-offs as you make them.
- **Check in:** "Should I go deeper here, or move on?"
- **Write numbers down** where they can see them.
- **Stuck?** Say what you're thinking and ask for a hint. Using a hint well is scored
  positively.

For online rounds: a stable connection with a phone hotspot as backup, headphones, a
whiteboard tool open, your editor warmed up.

---

## Several processes at once

- Keep every process in your pipeline tracker (Stage 6.5).
- **Be open about timelines:** "I'm in later rounds elsewhere — is there flexibility on
  your timeline?" is a normal thing to ask.
- **Rescheduling around exams is fine.** Ask early, politely, with two alternative slots.

---

## After the round

Within two hours: the debrief (next topic).

A short thank-you note is polite, not decisive. If you fumbled an answer, one brief
follow-up with the correct version is fine — once.`,
    docs: [],
    glossary: [
      {
        term: 'recruiter screen',
        def: 'A short first call about your background, interest and logistics.',
      },
      {
        term: 'loop',
        def: 'The set of interview rounds, often on one day or across a week.',
      },
      {
        term: 'prep sheet',
        def: 'A one-page summary of what you need for one company\'s rounds.',
      },
    ],
    check: [
      {
        q: 'What\'s the cheapest way to prepare for a company\'s rounds?',
        a: 'Ask the recruiter what the rounds are and what each assesses — most will say.',
      },
      {
        q: 'Name four things on a one-page prep sheet.',
        a: `Any four of: what they build with AI; the role type and your lead project; likely deep-dive questions with answers; a tuned pitch; questions to ask them; logistics.`,
      },
      {
        q: 'What should you do when stuck in a round?',
        a: 'Say what you\'re thinking and ask for a hint; using a hint well counts in your favour.',
      },
      {
        q: 'How do you ask for a later interview slot during exams?',
        a: 'Early and politely, with two alternative slots.',
      },
    ],
    practice: [
      {
        mode: 'spec',
        title: 'Build a prep sheet',
        body: `Build the one-page prep sheet for FinPay's AI Engineer role (the first JD in Stage 6.2:
a merchant support assistant grounded in policy documents and transaction data, evals
in CI, a p95 under 3 s, cost per conversation, 40,000 merchants).`,
        answer: `**What they build:** an assistant answering merchants' questions about settlements and
disputes, grounded in policy documents *and* each merchant's own transactions. So it's
RAG plus tool calls into live data, with strict per-merchant isolation.

**Role type:** context engineering, with a full-stack flavour.
**Lead with:** p-3.1 (retrieval with a results table); then the capstone's tenant
isolation (merchant data is tenant data).

**Likely deep-dive questions:**
1. "How do you stop merchant A seeing merchant B's transactions?" → the tenant comes
   from auth, row-level security, filtered retrieval, the canary isolation test in CI.
2. "How would your eval suite catch a faithfulness drop?" → a golden set with policy
   and transaction questions; citation checks; a judge checked against human labels;
   the gate in CI.
3. "Your p95 is 5 s against a 3 s target. What do you do?" → trace it: retrieval, tool
   calls, time to first token, output length. Then stream, cache, fewer chunks, a
   faster model for simple intents.

**Pitch, tuned:** lead with grounded answers and isolation, then cost per conversation.

**Questions for them:**
- "What's in the eval suite today, and what does a failed gate look like?"
- "How do answers stay correct when a merchant's data changes mid-conversation?"
- "Who owns cost per conversation, and what's the target?"

**Logistics:** date, time (IST), video link, interviewers' names and roles.`,
      },
      {
        mode: 'decision',
        title: 'Two processes collide',
        body: `Company X has made an offer and wants an answer within five days. Company Y — which
you'd prefer — has its final round in ten days. And your exams start next week.

What do you do, and what do you say to each company?`,
        answer: `1. **Tell Y, honestly, and ask to move faster:** "I've received an offer with a deadline
   of <date>. Y is my first choice — is there any way to bring the final round
   forward?" Companies often can.
2. **Ask X for more time:** "Thank you — I'm excited about this. I'm finishing another
   process and have exams next week. Could I give you an answer by <date>?" A week's
   extension is a common and reasonable ask.
3. **Protect your exams.** If Y can only move the round *into* exam week, ask for a slot
   just before or after; don't sit a final round the night before a paper.
4. **Decide your criteria now**, before the pressure peaks: the role-screening score
   (Stage 7.4), learning, pay. Then the answer is quick when the moment comes.

Never invent an offer or a deadline. Recruiters talk to each other more than you'd
think, and honesty is what makes the ask work.`,
      },
    ],
  },
  {
    id: 's7.1.t2',
    moduleId: 's7.1',
    title: 'Same-day debriefs that close gaps',
    outcome: `You can write a debrief within hours of a round — the questions, your answers, the stronger answers, the gaps — and turn your debriefs into a short, ordered list of fixes before the next round.`,
    minutes: 25,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
    ],
    animations: [],
    analogy: `Reviewing match footage with a coach. They don't say "play better". They pause on the ball
you edged and say "your front foot didn't move — drill that". A debrief is that
pause-and-name step, for interviews.`,
    notes: `## Why the same day

Within a few hours, you forget the exact wording of questions — and the follow-up that
exposed you. Those details are the whole value. Write the debrief within **two hours** of
the round.

---

## The template

\`\`\`markdown
# <Company> — <round type> — <date>
Interviewers: <names and roles>

## Questions (as close to word-for-word as you can)
## What I answered (short)
## What a strong answer would have been
## Gaps
- Knowledge:
- Communication:
- Portfolio:
## Signals from them (what they cared about; follow-ups they pushed)
## Fix before the next round (one to three items)
\`\`\`

---

## Three kinds of gap

- **Knowledge** — you didn't know how something works.
  *Fix:* read the primary source; write a Claim / How / Evidence / Trade-off answer.
- **Communication** — you knew it but explained it badly: rambling, no structure, no
  numbers. *Fix:* rehearse out loud and record it.
- **Portfolio** — "tell me about a time you…" and you had no project to point to.
  *Fix:* a small proof-of-skill build (Stage 7.2).

Naming the kind decides the fix. "I need to study agents" is too vague to act on.

---

## From debriefs to one list

Keep every debrief in one folder. After each, update a single **gap list**: the gap, how
often it's come up, the fix, the status.

Fix first what **keeps recurring**, and what the **next round** will test.

---

## Rejections are data

Ask politely for feedback. Many companies won't give it; some will.

Record the stage where it ended in your tracker. Two rejections at the same stage with the
same gap isn't bad luck — it's a signal to act on.`,
    docs: [],
    glossary: [
      {
        term: 'debrief',
        def: 'A written review of a round, done soon after: questions, answers, gaps, fixes.',
      },
      {
        term: 'gap list',
        def: 'One running list of what to fix, how often it\'s appeared, and its status.',
      },
      {
        term: 'access control list (ACL)',
        def: 'The list of users or groups allowed to see an item.',
      },
    ],
    check: [
      {
        q: 'Why write the debrief within two hours?',
        a: `The exact wording of questions and follow-ups fades fast, and those details are what make the debrief useful.`,
      },
      {
        q: 'What are the three kinds of gap, and their fixes?',
        a: `Knowledge → read the source and write a structured answer; communication → rehearse aloud and record; portfolio → a small proof-of-skill build.`,
      },
      {
        q: 'Which gaps do you fix first?',
        a: 'Those that recur across rounds, and those the next round will test.',
      },
      {
        q: 'What do two rejections at the same stage with the same gap mean?',
        a: 'A pattern to act on, not bad luck.',
      },
    ],
    practice: [
      {
        mode: 'spec',
        title: 'Debrief from messy notes',
        body: `Your notes, typed on your phone right after a round:

> sys design w/ Rohit (staff eng). doc QA for 5k employees. did reqs ok, forgot latency
> budget. drew pipeline. he asked "how do permissions work if a doc is shared with a
> group that changes?" — i said filter by user id, he pushed on groups, i kind of
> waffled. evals — said golden set + recall, he seemed happy. ran out of time before
> ops. he asked what i'd monitor — i said latency and errors. hmm.

Turn it into the debrief template, including the stronger answers and the fixes.`,
        answer: `**Company — system design — date.** Interviewer: Rohit, staff engineer.

**Questions:**
1. Design document Q&A for 5,000 employees.
2. "How do permissions work if a document is shared with a group whose membership
   changes?"
3. "What would you monitor?"

**What I answered:** requirements fine; skipped the latency budget; permissions as a
filter on user ID, then waffled on groups; evals — golden set and recall (landed well);
monitoring — latency and errors only; ran out of time before operations.

**Stronger answers:**
- *Permissions:* store **access lists on each chunk** (user and group IDs, copied from
  the source system). At query time, **expand the user's groups** from the identity
  provider (cached briefly) and filter on "chunk ACL overlaps the user's IDs". When
  group membership changes, only the user → groups lookup changes — no re-indexing.
  When a document's sharing changes, re-sync its chunks' ACLs. Test it with a canary
  document shared with one group.
- *Monitoring:* besides latency and errors — retrieval quality signals (no-answer rate,
  citation rate), thumbs-down rate, cost per request and per team, time to first token,
  and permission-filter violations (should be zero, alerted).

**Gaps:**
- Knowledge: permission models for shared, group-based access.
- Communication: no latency budget; lost time before operations.
- Portfolio: nothing showing group-based access control.

**Signals:** cares about permissions and operations; pushed on the edge case.

**Fix before the next round:**
1. Add group-based ACLs to the capstone's retrieval, with a test.
2. Rehearse the 45-minute plan with a clock; say the latency budget by minute 8.
3. A monitoring checklist for AI systems, answered out loud.`,
      },
      {
        mode: 'decision',
        title: 'Prioritise these gaps',
        body: `Your gap list after five rounds:

| Gap | Times seen | Kind |
|---|---|---|
| Permissions with groups | 2 | knowledge / portfolio |
| Rambling on behavioural answers | 3 | communication |
| KV cache and serving costs | 1 | knowledge |
| No example of agent evals at scale | 1 | portfolio |
| Slow on medium DSA with heaps | 1 | practice |

Your next round, in a week, is a behavioural round plus a system design round. Pick
the top two fixes, and say why.`,
        answer: `1. **Rambling on behavioural answers** — seen three times, and the next round has a
   behavioural section. Fix: write the eight STAR stories as bullets (not scripts),
   time each at two minutes, record, cut.
2. **Permissions with groups** — seen twice, and it comes up naturally in system
   design. Fix: add group-based ACLs to the capstone with a test, so the answer has a
   real project behind it.

Later: KV cache (a single knowledge gap — one or two sessions, Stage 7.3); agent evals
at scale (a proof-of-skill build once the round pressure eases); heaps (a few problems
when coding rounds come up).

The rule: **frequency × relevance to the next round.**`,
      },
    ],
  },
  {
    id: 's7.1.t3',
    moduleId: 's7.1',
    title: 'When you don\'t know',
    outcome: `You can handle a question you can't answer — by saying what you do know, reasoning out loud from first principles, and proposing how you'd find out — without bluffing.`,
    minutes: 25,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
    ],
    animations: [],
    analogy: `A good doctor facing an unusual symptom doesn't invent a diagnosis. They say what it
isn't, what they suspect and why, and which test would tell them. Patients trust that far
more than a confident guess. Interviewers do too.`,
    notes: `## Why bluffing fails

Interviewers keep asking follow-ups until they find the edge of what you know — that's
their job. A bluff is usually exposed within two follow-ups, and then they doubt your
*other* answers too.

"I don't know that part" costs little. Being caught bluffing can cost the round.

---

## The four moves

1. **Say it plainly:** "I haven't used that directly."
2. **Say what you do know nearby:** "I know it's used to speed up generation, and that
   generating is one token at a time and limited by memory speed."
3. **Reason out loud:** "So maybe a smaller model guesses a few tokens, and the big model
   checks them all at once…"
4. **Say how you'd find out:** "I'd read the method section of the paper and benchmark
   it on our workload."

Moves 2 and 3 are where you earn credit. Interviewers score reasoning, not recall.

---

## How that example actually works

**Speculative decoding:** a small, fast **draft** model proposes several tokens. The large
model checks all of them in **one** forward pass — it can, because they're already
written down. It keeps the longest run it agrees with, and supplies its own token at the
first disagreement.

Checking several tokens costs about the same as generating one, because generation is
limited by reading the model's weights from memory, not by arithmetic. A special
acceptance rule keeps the output distribution the same as the large model's alone.

---

## Recovering from a mistake

If you realise you said something wrong: correct it out loud. "Earlier I said X —
that's wrong. It's Y, because…" Self-correction is a *positive* signal.

If they push back — "Are you sure?" — don't cave by reflex. Re-check your reasoning out
loud. Still right? Say why, politely. Not right? Update, and say what changed your mind.

---

## Hints are part of the round

A hint isn't a failure. Take it, build on it, and say what it unlocked: "Ah — if the
groups change often, then I shouldn't copy memberships into the index…"`,
    docs: [
      {
        label: 'Fast Inference from Transformers via Speculative Decoding',
        url: 'https://arxiv.org/abs/2211.17192',
      },
      {
        label: 'ColBERT',
        url: 'https://arxiv.org/abs/2004.12832',
      },
    ],
    glossary: [
      {
        term: 'speculative decoding',
        def: 'A small draft model proposes tokens; the large model checks them all in one pass.',
      },
      {
        term: 'late interaction',
        def: 'Scoring by matching each query token to its best passage token, as in ColBERT.',
      },
      {
        term: 'first principles',
        def: 'Reasoning up from basic facts you know, instead of recalling an answer.',
      },
    ],
    check: [
      {
        q: 'Why is bluffing risky in an interview?',
        a: 'Follow-up questions expose it quickly, and then the interviewer doubts your other answers as well.',
      },
      {
        q: 'What are the four moves when you don\'t know?',
        a: 'Say so plainly; say what you know nearby; reason out loud; say how you\'d find out.',
      },
      {
        q: 'What should you do if you realise you said something wrong earlier?',
        a: 'Correct it out loud, with the reason. Self-correction reads as a strength.',
      },
      {
        q: 'How do you respond to \'Are you sure?\'',
        a: `Re-check your reasoning aloud; hold your position politely if it still stands, or update and say why.`,
      },
    ],
    practice: [
      {
        mode: 'read',
        title: 'Rewrite the bluffs',
        body: `Each answer is a bluff. Rewrite it using the four moves, then give the correct short
answer.

1. *"What's PagedAttention?"* — "It's attention that only looks at one page of the
   document at a time, to save memory."
2. *"How is ColBERT different from a normal embedding model?"* — "ColBERT is BERT
   fine-tuned by Stanford for better embeddings. It's just more accurate."
3. *"MCP versus A2A?"* — "They're basically the same thing from different companies."`,
        answer: `**1. PagedAttention**
- *Four moves:* "I haven't worked with it directly. I know serving is limited by the
  memory for the KV cache — the stored keys and values for every token. 'Paged' makes
  me think of operating-system memory pages, so I'd guess it stores that cache in
  blocks rather than one big reserved region. I'd confirm in the vLLM paper."
- *Correct:* it stores each request's KV cache in small fixed-size blocks that needn't
  sit next to each other, tracked by a block table — like virtual memory. Almost no
  memory is wasted, requests can share blocks for a common prefix, and more requests
  fit on a GPU.

**2. ColBERT**
- *Four moves:* "I know standard embedding models turn a whole passage into one vector.
  I believe ColBERT keeps more detail than that, but I'm not sure how. I'd check the
  scoring function."
- *Correct:* ColBERT keeps **one vector per token** for both the query and the passage.
  The score adds up, for each query token, its best match among the passage's tokens —
  "late interaction", or MaxSim. More precise than one vector per passage; much more
  storage.

**3. MCP versus A2A**
- *Four moves:* "I've built with MCP — it connects an app or agent to tools and data
  through a standard protocol. I know A2A is also about agents, but I haven't used it.
  From the name, I'd guess it's for agents talking to *other agents*."
- *Correct:* that guess is right. MCP connects a model application to **tools and data
  sources**. A2A (Agent2Agent) is for **agents to discover and delegate tasks to other
  agents**. They complement each other rather than compete.`,
      },
      {
        mode: 'decision',
        title: 'Handle the pushback',
        body: `Interviewer: "Ranking by cosine similarity and ranking by dot product give the same
order, right?"

You: "Only if the vectors are normalised."

Interviewer: "Are you sure? Think about it."

What do you say?`,
        answer: `Re-check out loud, and hold the position — it's correct, with one refinement:

> "Let me reason it through. The dot product is |q| × |d| × cos θ. For one query, |q|
> is the same for every document, so it can't change the order. But |d| differs between
> documents. If a document has a larger norm, its dot product rises even at the same
> angle. So the orders match when all *document* vectors have the same length — for
> example, when they're normalised. The query's length doesn't matter. Many embedding
> models return normalised vectors, which is why the two are often used
> interchangeably."

That's the ideal response: you didn't cave, you showed the reasoning, and you refined
your own answer — only the documents' norms matter. If the interviewer was testing
whether you'd fold under pressure, you passed.`,
      },
    ],
  },
];
