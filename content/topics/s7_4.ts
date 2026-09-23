import type { Topic } from '@/lib/types';

export const s7_4: Topic[] = [
  {
    id: 's7.4.t1',
    moduleId: 's7.4',
    title: 'Screening a role for real AI work',
    outcome: `You can find out, before you accept, whether a role involves real AI engineering — production systems, evals, ownership of cost — by asking specific questions and reading the answers honestly.`,
    minutes: 25,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
    ],
    animations: [],
    analogy: `Checking a flat before signing the lease. You don't trust the photos: you turn on the
taps, check the water pressure, and ask when the building was last repaired. The listing
says "AI engineer". The questions tell you what the job really is.`,
    notes: `## Why screen

A title with no real AI work is a trap at any salary. Two years of prompt-tweaking in a
role called "AI Engineer" does less for your career than one year of real engineering in
a role called "Backend Engineer".

You've spent this whole path building real skills. Make sure the job uses them.

---

## Interview them back

- "What does the AI system I'd work on look like in production today — users, volume?"
- "What's in your eval suite, and who maintains it?"
- "Who owns cost and latency for it?"
- "What share of this role is building AI systems, versus support, demos or other work?"
- "Can the team use the models and tools it needs — is there budget?"
- "What did the team ship in the last three months?"
- "Is there a production system, or a pilot deck?"

---

## Reading the answers

**Green:** specific numbers; named metrics; a real eval process; recent launches;
engineers who own services; access to real data.

**Red:** "we're exploring use cases"; "the business will decide"; "mostly prompt
engineering"; no one can name a metric; no access to data; demos, but nothing in
production.

**Yellow:** an early team building its first system. It can be excellent — *if* there's
data, budget and a sponsor with a mandate. Ask who sponsors it, and what happens if the
first version misses.

---

## Who to ask

- **The hiring manager:** mandate, budget, priorities.
- **An engineer on the team:** the day-to-day reality.

If you haven't met an engineer, ask to. At the offer stage, it's a normal request.

---

## Score it

Score each dimension 0–2:

1. **Production reality** — real users, real volume
2. **Evals** — a maintained suite and a quality bar
3. **Ownership** — engineers own services, cost and latency
4. **Learning** — people ahead of you to learn from
5. **Data access** — the data the work needs
6. **Mandate and budget** — a sponsor, and money for models and tools

Put the score in your tracker. Compare offers on it — not only on money.`,
    docs: [],
    glossary: [
      {
        term: 'interviewing them back',
        def: 'Asking your own questions to judge whether a role is right for you.',
      },
      {
        term: 'mandate',
        def: 'Official backing — a sponsor and budget — for a team\'s work.',
      },
      {
        term: 'pilot',
        def: 'An early trial that may or may not become a real product.',
      },
    ],
    check: [
      {
        q: 'Why can a well-paid \'AI engineer\' role be a bad move?',
        a: `If the work is prompt-tweaking or demos, it doesn't build engineering skill; a real engineering role grows your career more, whatever the title.`,
      },
      {
        q: 'Name three questions that reveal whether the AI work is real.',
        a: `Any three of: what's in production and at what volume; what's in the eval suite and who maintains it; who owns cost and latency; what share of the role is building; what shipped recently; whether there's a production system or only a pilot.`,
      },
      {
        q: 'What makes an early-stage AI team a good bet rather than a red flag?',
        a: `Real data, budget, and a sponsor with a mandate — plus a clear answer to what happens if the first version misses.`,
      },
      {
        q: 'What are the six scoring dimensions?',
        a: 'Production reality, evals, ownership, learning, data access, and mandate and budget.',
      },
    ],
    practice: [
      {
        mode: 'decision',
        title: 'Score these two roles',
        body: `Notes from the final conversations:

**Role 1 — a startup.** "Our assistant serves 12,000 small businesses. The eval suite
runs in CI; engineers maintain it and add cases from support tickets. Each engineer
owns a service and its cost dashboard. You'd spend most of your time building. Two
senior engineers have run LLM systems in production before. You'd have full access
to anonymised production data. The CEO sponsors the work, and the budget is approved."

**Role 2 — a services firm's GenAI centre.** "We're exploring use cases with clients.
Evals depend on what each client wants. Cost is the client's concern. About half the
role is pre-sales demos, a third is prompt work, the rest is building proofs of
concept. Your manager is new to AI. Data access depends on the client. The centre is
funded for this year."

Score each on the six dimensions and decide.`,
        answer: `| Dimension | Role 1 | Role 2 |
|---|---|---|
| Production reality | 2 — 12,000 businesses | 0 — exploring use cases |
| Evals | 2 — in CI, maintained, fed by tickets | 0 — "depends on the client" |
| Ownership | 2 — a service and its costs | 0 — "the client's concern" |
| Learning | 2 — seniors with production experience | 0–1 — the manager is new to AI |
| Data access | 2 — anonymised production data | 1 — varies by client |
| Mandate and budget | 2 — CEO-sponsored, approved | 1 — funded this year only |
| **Total** | **12 / 12** | **2–3 / 12** |

**Decision:** Role 1, unless money or location forces otherwise.

Role 2 isn't worthless — breadth and client exposure help a forward-deployed
specialist. But with about 80% of the time on demos and prompts, it won't build the
skills this path developed, and it may erode them.`,
      },
      {
        mode: 'spec',
        title: 'Your question list',
        body: `You're in the final round: 30 minutes with the hiring manager, then 20 with an engineer
on the team. Write six questions for the manager and four for the engineer. Don't ask
both the same things.`,
        answer: `**Hiring manager — mandate, direction, expectations**
1. "What does success look like for this role after six months?"
2. "Which AI system is the team responsible for, and how is it doing against its
   targets?"
3. "Who sponsors this work, and what's the budget for models and infrastructure?"
4. "What share of the role is building, versus support or demos?"
5. "How do you decide when a model or prompt change is ready to ship?"
6. "What's the biggest risk to the team's plan this year?"

**Engineer — daily reality**
1. "Walk me through your last week. What did you actually build?"
2. "What happens when an eval fails in CI?"
3. "When something breaks in production, how do you find out, and who fixes it?"
4. "What do you wish you'd known before joining?"

The manager tells you the plan; the engineer tells you whether it's true.`,
      },
    ],
  },
  {
    id: 's7.4.t2',
    moduleId: 's7.4',
    title: 'Negotiating an offer',
    outcome: `You can compare offers by their real parts — fixed pay, variable pay, bonuses, equity — handle the 'expected salary' question without anchoring low, and negotiate politely with evidence, getting everything in writing.`,
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
        query: 'salary negotiation India software engineer CTC in-hand explained',
        channel: '',
        reason: 'CTC components, explained with examples',
      },
    ],
    animations: [],
    analogy: `Buying a used bike online. You check what similar bikes sell for, you let the seller name
a price first, you negotiate on facts ("the tyres need replacing"), and you don't pay until
the papers are signed. Offer negotiation follows the same rules — just more politely.`,
    notes: `## Know your range before the first call

Sources: Levels.fyi and AmbitionBox (self-reported, so noisy), Glassdoor, seniors and
alumni at similar companies, and recruiters — who'll often share a band if you ask.

Build a **range per company tier**, not one number. Treat any single figure — including
those in this course's docs — as a rough signal, not a fact.

---

## Don't give the first number

When asked "What's your expected CTC?":

> "I'd rather understand the range you've budgeted for this level. I'm confident we can
> find something fair if the role is the right fit."

If they insist, give a **researched range** whose bottom is a number you'd be happy with.

If asked about your current pay, you can answer honestly — and add that you're evaluating
this role on its scope and the market range for it.

---

## Read the offer's parts

Indian offers usually quote **CTC** — cost to company. It bundles:

- **Fixed pay** — basic plus allowances; what you're paid monthly, before tax.
- **Employer PF** (provident fund) — real savings, but locked away; not monthly cash.
- **Gratuity** — paid only after five years of continuous service.
- **Variable pay** — "up to"; often paid only in part.
- **Joining bonus** — one-time; usually repayable if you leave within a year.
- **ESOPs or RSUs** — equity. Typically vests over four years with a one-year cliff.
  Startup ESOPs can't be sold until an exit or a buyback.

Compare **fixed cash** first. Then value the rest, discounted for uncertainty. Watch for
offers that fold equity into the headline CTC.

---

## Negotiate with evidence, politely

- Say you're excited first. Then: "Is there flexibility on the fixed component?"
- Use only **real** leverage: an actual competing offer, a market range, your evidence.
  Never invent an offer.
- Negotiate the whole package: fixed pay, joining bonus, level, start date, learning
  budget, remote days.
- One round, perhaps two. Keep it warm — you'll work with these people.

---

## Get it in writing — and decide on more than money

- Everything agreed goes into the **written offer** before you resign or decline others.
- Weight **what you'll learn in the next 18 months** heavily. In a field moving this fast,
  the role that makes you better is worth more than a small pay difference.
- A very short deadline? Ask politely for more time. A reasonable company usually gives a
  few days.`,
    docs: [
      {
        label: 'Levels.fyi',
        url: 'https://www.levels.fyi/',
      },
      {
        label: 'AmbitionBox',
        url: 'https://www.ambitionbox.com/',
      },
    ],
    glossary: [
      {
        term: 'CTC',
        def: 'Cost to company: the total an employer spends on you, including parts that aren\'t monthly cash.',
      },
      {
        term: 'fixed pay',
        def: 'The guaranteed salary paid monthly, before tax and deductions.',
      },
      {
        term: 'vesting',
        def: 'Earning your equity over time, on a schedule.',
      },
      {
        term: 'cliff',
        def: 'The initial period before any equity vests.',
      },
      {
        term: 'joining bonus',
        def: 'A one-time payment on joining, often repayable if you leave within a year.',
      },
    ],
    check: [
      {
        q: 'How do you answer \'What\'s your expected CTC?\' early on?',
        a: `Ask for the range they've budgeted for the level; if pressed, give a researched range whose bottom you'd be happy with.`,
      },
      {
        q: 'Which part of an Indian CTC should you compare first, and why?',
        a: `Fixed pay — it's the reliable monthly cash. Variable, gratuity, PF and equity are uncertain, delayed or locked.`,
      },
      {
        q: 'What\'s a one-year cliff?',
        a: 'No equity vests until you\'ve completed a year; then the first year\'s share vests at once.',
      },
      {
        q: 'What leverage is legitimate in a negotiation?',
        a: 'A real competing offer, a researched market range, and your evidence. Never an invented offer.',
      },
    ],
    practice: [
      {
        mode: 'decision',
        title: 'Compare two offers',
        body: `**Offer A — the startup (Role 1 from the previous topic).** CTC ₹22 L: fixed ₹15.2 L,
employer PF ₹0.8 L, variable up to ₹2 L, and ESOPs "worth ₹4 L a year" at the last
funding round (four-year vesting, one-year cliff).

**Offer B — the services firm (Role 2).** CTC ₹20 L: fixed ₹17.5 L, employer PF
₹0.9 L, gratuity ₹0.4 L, variable up to ₹1.2 L.

Assume variable pay usually comes in at about 70%, and you'd stay about two years.

1. Which pays more cash?
2. What is the ESOP line really worth?
3. Which do you take, and what do you negotiate?`,
        answer: `**1. Cash.** Expected cash a year:
- A: 15.2 + 0.7 × 2 = **₹16.6 L**
- B: 17.5 + 0.7 × 1.2 = **₹18.34 L**

B pays about **₹1.74 L a year more in cash**, despite the lower headline CTC. Monthly
fixed: about ₹1,26,700 (A) against ₹1,45,800 (B). Gratuity (in B) needs five years, so
it's worth nothing over a two-year stay; employer PF is similar in both.

**2. ESOPs.** A's "₹4 L a year" uses the last round's valuation, can't be sold until
an exit or buyback, and nothing vests before month 12. It could be worth zero, or much
more. Treat it as upside — not salary — and note that it inflates A's headline CTC.

**3. Decision.** Role A scored 12/12 on real AI work; B scored 2–3. Over the next 18
months, A builds far more — so **take A, and negotiate**:

> "I'm excited about the role and the team. I have an offer with higher fixed pay —
> about ₹17.5 L. Is there room to bring the fixed component closer, or to add a joining
> bonus?"

A realistic ask: ₹1–1.5 L more fixed, or a joining bonus of similar size. Take B only
if you truly need the cash difference — and that's a legitimate reason.`,
      },
      {
        mode: 'spec',
        title: 'Scripts for three moments',
        body: `Write what you'd say in each:

1. The first recruiter call: "What's your expected CTC?"
2. After an offer, asking for more fixed pay, with a real competing offer in hand.
3. The offer expires in 48 hours, and your preferred company's final round is next week.`,
        answer: `**1.**
> "I'd like to understand the role's scope first, and the range you've budgeted for the
> level. I'm confident we can land on something fair if it's a good fit."

If pressed:
> "From my research for similar AI engineering roles, I'm looking at roughly ₹X–Y L
> fixed, depending on the level and the rest of the package."

**2.**
> "Thank you — I'm genuinely excited about this team. I do have another offer with a
> fixed component of ₹Z L. I'd prefer to join you. Is there flexibility to bring the
> fixed pay closer to that?"

Then stop talking and let them answer.

**3.**
> "Thank you for the offer — I'm very interested. I'm finishing one other process,
> with a final round next week, and I want to give you a considered answer rather than
> a rushed one. Could we extend the deadline to <date>?"

And tell your preferred company about the offer and its deadline — they may be able to
move faster.`,
      },
    ],
  },
];
