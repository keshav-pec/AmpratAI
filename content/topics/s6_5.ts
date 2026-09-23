import type { Topic } from '@/lib/types';

export const s6_5: Topic[] = [
  {
    id: 's6.5.t1',
    moduleId: 's6.5',
    title: 'Targets, referrals and outreach',
    outcome: `You can pick target companies by tier, reach engineers with short messages that lead with working evidence, and ask for referrals in a way that's easy to say yes to.`,
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
        query: 'how to ask for a referral cold message software engineer',
        channel: '',
        reason: 'examples of outreach that gets replies',
      },
    ],
    animations: [],
    analogy: `Sending your API docs straight to the developer who'll use them, versus pinning a flyer to
a hundred notice boards. The direct message gets read because it's relevant and easy to
act on. Outreach works the same way.`,
    notes: `## The mix

A suggested mix of where applications come from:

- **60%** referrals and warm outreach
- **30%** direct applications
- **10%** inbound — people who found you through your work

Mass-applying is the low-yield path. A specific message with a working link can be
checked in 30 seconds — that's what gets replies.

---

## Three tiers of target

- **Tier A:** AI-first product companies and well-funded startups; AI teams inside
  product companies (fintech, e-commerce, SaaS); global companies' Indian engineering
  centres. The highest bar, and the most learning.
- **Tier B:** consultancies and services firms with real AI practices. Breadth over
  depth — good for forward-deployed skills, and a sound on-ramp.
- **Tier C:** remote AI startups abroad. Public work — demos, writing — matters most.

Skip wrapper roles (Stage 6.2's warning signs), whatever the tier.

---

## Finding the right person

Your first message goes to an **engineer on the team**, not a recruiter:

- LinkedIn: "AI engineer at <company>"
- authors on the company's engineering blog
- contributors to its open-source repos
- speakers at meetups and conferences
- **alumni of your college** — the warmest route of all

---

## The message

> Hi <name> — I saw <company> is building <specific thing>. I built <one-line
> description> that handles <the specific hard part>: <live link>. The interesting
> problem was <one sentence about a real trade-off>. If you're hiring for AI engineering
> I'd love 15 minutes; if not, I'd still value your read on <specific technical question>.

Why it works: it's checkable in 30 seconds, the ask is small, and the technical question
makes replying interesting rather than a chore.

Keep it under about 120 words. Never attach a resume to a first message.

---

## Asking for a referral

Only after a real exchange. Then make it easy:

- the job link;
- a three-line note on why you fit, which they can paste straight into the referral form;
- your resume;
- "No pressure — if you'd rather not refer, I completely understand."

Thank them either way, and tell them how it turns out.

One polite follow-up after about a week if there's no reply. Then let it go.

---

## Tailoring every application

The same evidence, in a different order:

- an agentic role → the support agent (p-4.1) first;
- an LLMOps role → production hardening (p-5.1) first;
- a context-engineering role → document intelligence (p-3.1) first.

Add a three-line note on why *this* role. Keep the resume to one page, projects with
numbers and links.`,
    docs: [],
    glossary: [
      {
        term: 'warm outreach',
        def: 'A message to someone with a shared connection or a specific, relevant reason to write.',
      },
      {
        term: 'referral',
        def: 'An employee recommending you for a role, usually through an internal form.',
      },
      {
        term: 'tailoring',
        def: 'Adjusting the order and framing of the same evidence to fit a specific role.',
      },
    ],
    check: [
      {
        q: 'Why message engineers rather than recruiters first?',
        a: `Engineers can judge your work in 30 seconds and refer you; a working link means more to them than to a recruiter.`,
      },
      {
        q: 'What makes the outreach template work?',
        a: `It's specific, checkable in 30 seconds, asks for something small, and ends with a technical question that's interesting to answer.`,
      },
      {
        q: 'What do you give someone who agrees to refer you?',
        a: `The job link, a three-line note on why you fit that they can paste, and your resume — plus an easy way to say no.`,
      },
      {
        q: 'How do you tailor without rewriting everything?',
        a: `Keep the same evidence, but reorder it so the project closest to the role comes first, with a three-line note on why this role.`,
      },
    ],
    practice: [
      {
        mode: 'read',
        title: 'Rewrite this outreach message',
        body: `> Dear Sir/Madam,
> I am a passionate AI enthusiast looking for opportunities in your esteemed
> organisation. Please find my resume attached. Kindly refer me for any suitable role.
> Regards

Rewrite it for an engineer at a fintech whose blog described their support assistant.`,
        answer: `> Hi Ananya — I read your post on how FinPay's support assistant grounds answers in
> merchant transactions. I built a document Q&A system that cites every claim back to
> the page it came from: <live link>. The interesting problem was exact clause numbers —
> vector search missed them, so I added keyword search and a reranker, which raised
> recall@5 from <x> to <y>. If you're hiring for AI engineering, I'd love 15 minutes. If
> not, I'd still value your view on one thing: how do you keep answers faithful when a
> merchant's data changes mid-conversation?

What changed:
- **A name**, and a reason for writing to *this* person.
- **A working link** and one specific result, instead of "passionate".
- **No attachment**, and no "any suitable role".
- **A small ask** with an easy alternative.
- **A real technical question** they'd enjoy answering.`,
      },
      {
        mode: 'decision',
        title: 'Which project first?',
        body: `Your flagships: p-3.1 (document intelligence with a results table), p-4.1 (support agent
with approval gates), p-5.1 (production hardening with load tests and a cost dashboard),
and the capstone.

Which leads for each role, and what's second?

1. "LLM Platform Engineer — run our model gateway, cost attribution, autoscaling"
2. "AI Engineer, Agents — build agents that take actions in our merchants' accounts"
3. "Forward-Deployed AI Engineer — prototype solutions with enterprise clients"`,
        answer: `1. **p-5.1 first** — load tests, the cost dashboard and the runbook are the job. Second:
   the capstone's per-company budgets and rate limits.
2. **p-4.1 first** — approval gates, restart-safe runs and the trace dashboard. Second:
   the capstone, for multi-tenancy — "their merchants' accounts" means isolation matters.
3. **The capstone first** — real users, a product built from a vague brief, a demo
   video. Second: the three-minute demo itself, since demo craft is half that job.`,
      },
      {
        mode: 'spec',
        title: 'Ask for a referral',
        body: `An engineer replied warmly to your message and said their team is hiring. Write the
referral request.`,
        answer: `> Thanks so much, Ananya — that answer about re-grounding on each turn was really
> useful. The role I'd love to be considered for is AI Engineer, Merchant Assistant:
> <job link>.
>
> If you're comfortable referring me, here's a note you can paste:
> "<Your name> builds full-stack AI systems: a document Q&A system that raised
> recall@5 from <x> to <y> with hybrid search and reranking, and a support agent with
> approval gates that survive restarts. The work covers retrieval, evals and
> production operations — a close match to the merchant assistant role."
>
> My resume's attached. And no pressure at all — if you'd rather not, I completely
> understand, and thanks again for your time.

Why it works: specific role, a ready-to-paste note, the resume only now that it's
wanted, and an easy way out. Afterwards, tell them the outcome either way.`,
      },
    ],
  },
  {
    id: 's6.5.t2',
    moduleId: 's6.5',
    title: 'Tracking the pipeline',
    outcome: `You can run applications as a tracked pipeline — stages, next actions, conversion by channel — and use the numbers to fix whichever stage is leaking.`,
    minutes: 25,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
    ],
    animations: [],
    analogy: `An online store's checkout funnel: product page → cart → payment → order. If most people
drop at payment, you fix payment, not the product photos. A job search is the same kind of
funnel — and the same logic applies.`,
    notes: `## A pipeline, not a pile

One row per role, with: company, role type, **source** (referral, warm, direct,
inbound), contact, **stage**, **next action**, notes.

The stages:

**Target → Contacted → Replied → Applied or Referred → Screen → Rounds → Offer**
(or Rejected, or Withdrawn)

Record *when* each stage was reached. That's what lets you measure the funnel later.

---

## Measure it by channel

For each source, how many reach each stage. For example:

| Source | Contacted | Replied | Referred | Screens |
|---|---|---|---|---|
| Warm outreach | 40 | 12 (30%) | 8 | 4 |
| Direct applications | — | — | 60 applied | 3 (5%) |

*Illustrative numbers.* The point: compare the channels by result per effort, then put
your effort where it converts.

---

## Which stage is leaking?

- **Few replies to outreach** → the message, or the wrong people.
- **Replies, but few screens** → the match between your projects and the role; tailoring.
- **Screens, but no rounds** → your pitch, or basic concepts.
- **Rounds, but no offers** → system design, coding or depth — your debriefs (Stage 7.1)
  will say which.

Fix one stage at a time, then watch whether its rate moves.

---

## A regular review

On a rhythm that fits your exams and life — weekly is common while applying:

1. update every row's stage;
2. send the follow-ups that are due;
3. recalculate the rates by channel;
4. pick **one** change to try.

Keep enough in flight. A pipeline with five companies isn't a pipeline.

---

## A sheet is fine

A spreadsheet works. So does a small table in your capstone's Postgres, with a page on
top.

Just don't let building the tracker become the thing you do instead of applying.`,
    docs: [
      {
        label: 'PostgreSQL — SELECT DISTINCT ON',
        url: 'https://www.postgresql.org/docs/current/sql-select.html#SQL-DISTINCT',
      },
    ],
    glossary: [
      {
        term: 'pipeline',
        def: 'Every application in flight, each at a stage, with a next action.',
      },
      {
        term: 'conversion rate',
        def: 'The share of items at one stage that reach the next.',
      },
      {
        term: 'channel',
        def: 'Where an application came from: referral, warm outreach, direct, or inbound.',
      },
    ],
    check: [
      {
        q: 'Why record when each stage was reached, not just the current stage?',
        a: `A rejected row otherwise loses how far it got. The history is what lets you count how many reached each stage.`,
      },
      {
        q: 'Replies come in, but screens don\'t. What\'s likely wrong?',
        a: 'The fit between your projects and the role, or how you\'ve tailored the application.',
      },
      {
        q: 'What happens in a regular pipeline review?',
        a: 'Update stages, send due follow-ups, recalculate rates by channel, and pick one change to try.',
      },
      {
        q: 'How do you compare channels fairly?',
        a: 'By result per unit of effort — for example, screens per message sent versus screens per application.',
      },
    ],
    practice: [
      {
        mode: 'decision',
        title: 'Find the leak',
        body: `Your pipeline so far:

| Source | Started | Replied | Referred / applied | Screens | Rounds | Offers |
|---|---|---|---|---|---|---|
| Warm outreach | 30 messages | 6 | 4 referred | 3 | 0 | 0 |
| Direct | 50 applications | — | 50 | 2 | 1 | 0 |
| Inbound | 3 contacts | — | — | 2 | 1 | 0 |

Calculate the key rates. Where's the leak, what's the likely cause, and what's one
change?`,
        answer: `**Rates:**
- Warm: 20% reply; 4 of 6 replies became referrals; 3 of 4 referrals got screens →
  **10% of messages became screens**.
- Direct: **4% of applications became screens**.
- Screens → rounds: warm 0 of 3, direct 1 of 2, inbound 1 of 2 → **2 of 7 overall (29%)**.

**The leak: screens → rounds**, and it's worst on the warm path, where people arrive
already interested. A screen is usually a short call about your pitch, your projects
and some basics.

**Likely cause:** the 60-second pitch and the concepts answers — not the portfolio,
which is clearly getting you in the door.

**One change:** rehearse the pitch and the concepts round (Stage 6.4) out loud, and
write a debrief after every screen (Stage 7.1) to find the exact questions that went
badly.

**Also:** warm outreach converts 2.5× better than direct per unit of effort. Shift
effort there.`,
      },
      {
        mode: 'spec',
        title: 'The pipeline in Postgres',
        body: `Design the tables so that rejected applications still show how far they got. Then
write two queries:

1. per source: total, replied, screens, rounds, offers, and the screen rate;
2. where each application stands now, with its next action.`,
        answer: `\`\`\`sql
CREATE TABLE applications (
  id          serial PRIMARY KEY,
  company     text NOT NULL,
  role        text NOT NULL,
  archetype   text,
  source      text NOT NULL CHECK (source IN ('referral', 'warm', 'direct', 'inbound')),
  contact     text,
  next_action text,
  notes       text,
  created_at  date NOT NULL DEFAULT current_date
);

CREATE TABLE stage_changes (
  app_id int  NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  stage  text NOT NULL CHECK (stage IN ('contacted', 'replied', 'applied', 'screen',
                                        'rounds', 'offer', 'rejected', 'withdrawn')),
  at     date NOT NULL DEFAULT current_date,
  PRIMARY KEY (app_id, stage)
);

-- 1. the funnel by source
SELECT a.source,
       COUNT(DISTINCT a.id)                                        AS total,
       COUNT(DISTINCT s.app_id) FILTER (WHERE s.stage = 'replied') AS replied,
       COUNT(DISTINCT s.app_id) FILTER (WHERE s.stage = 'screen')  AS screens,
       COUNT(DISTINCT s.app_id) FILTER (WHERE s.stage = 'rounds')  AS rounds,
       COUNT(DISTINCT s.app_id) FILTER (WHERE s.stage = 'offer')   AS offers,
       ROUND(100.0 * COUNT(DISTINCT s.app_id) FILTER (WHERE s.stage = 'screen')
             / COUNT(DISTINCT a.id))                               AS screen_pct
FROM applications a
LEFT JOIN stage_changes s ON s.app_id = a.id
GROUP BY a.source
ORDER BY screen_pct DESC;

-- 2. where each application stands now
SELECT DISTINCT ON (a.id) a.company, s.stage AS current_stage, s.at, a.next_action
FROM applications a
JOIN stage_changes s ON s.app_id = a.id
ORDER BY a.id, s.at DESC;
\`\`\`

Why two tables: the **history** is the data. A single \`stage\` column is overwritten
when you're rejected, and you lose the fact that it reached a screen. With
\`stage_changes\`, "reached a screen" is simply "has a screen row".

\`DISTINCT ON (a.id) … ORDER BY a.id, s.at DESC\` is Postgres's way to take the latest
row per application. Both queries checked on Postgres 16 with sample data.`,
      },
    ],
  },
];
