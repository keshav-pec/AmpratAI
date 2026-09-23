import type { Topic } from '@/lib/types';

export const s4_4: Topic[] = [
  {
    id: 's4.4.t1',
    moduleId: 's4.4',
    title: 'Chains and routers',
    outcome: `You can pick the right workflow shape — a chain with gates, or a router — and know why these simpler patterns should be your first try before an agent.`,
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
        query: 'building effective agents workflow patterns prompt chaining routing',
        channel: '',
        reason: 'the five patterns, visually',
      },
    ],
    animations: ['anim-orchestration-patterns'],
    analogy: `An assembly line with inspection points (a chain), and a hospital triage desk that sends
each patient to the right department (a router). Neither is clever. Both are reliable,
cheap, and easy to debug — which is why factories and hospitals use them.`,
    notes: `## The patterns, from simple to autonomous

From Anthropic's *Building effective agents*:

1. **Prompt chaining** — a fixed sequence of model calls, each using the previous output.
2. **Routing** — classify the input, send it down one of several paths.
3. **Parallelisation** — independent parts at once, or the same task several times (topic 2).
4. **Orchestrator–workers** — a model decides the subtasks, delegates, combines.
5. **Evaluator–optimiser** — one call generates, another critiques, repeat (topic 3).

Then **agents**: the model directs the whole process. Each step down the list trades
predictability for flexibility.

---

## Chains with gates

\`\`\`python
outline = await call("Write an outline for a reply to this ticket", ticket)
if not has_required_sections(outline):          # a gate, in plain code
    outline = await call("Fix the outline: it must cover X and Y", outline)
reply = await call("Write the reply from this outline", outline)
\`\`\`

Each call does one simpler job, so each is more accurate. The **gates** between steps are
ordinary code checks — the cheapest, most reliable evaluator there is.

Use when the task splits cleanly into fixed steps.

---

## Routers

You built one in Stage 3: classify, then dispatch.

- Different prompts for different kinds of input (refund vs technical vs billing).
- Different models by difficulty — a small model for easy questions, a larger one for hard.
- Different tools per path, so each path only sees what it needs.

Use when inputs fall into distinct categories that need different handling.

---

## Why start here

- **Testable:** each step and each route has its own eval.
- **Debuggable:** the path is in your code, not in the model's head.
- **Cheap and fast:** no loop, no growing context.

Reach for an agent when the steps genuinely can't be known in advance — and even then, parts
of it (like refunds) often stay workflow-shaped.`,
    docs: [
      {
        label: 'Anthropic — Building effective agents',
        url: 'https://www.anthropic.com/engineering/building-effective-agents',
      },
    ],
    glossary: [
      {
        term: 'prompt chaining',
        def: 'A fixed sequence of model calls, each working on the previous output.',
      },
      {
        term: 'gate',
        def: 'A check between chain steps that stops or repairs bad intermediate output.',
      },
      {
        term: 'routing',
        def: 'Classifying an input and sending it down a specialised path.',
      },
    ],
    check: [
      {
        q: 'What\'s a \'gate\' in a prompt chain?',
        a: `A check between steps — usually plain code — that verifies the previous output before the next call runs.`,
      },
      {
        q: 'Name three reasons to route inputs.',
        a: 'Different prompts per category, different models by difficulty, and different tool sets per path.',
      },
      {
        q: 'Why prefer workflows before agents?',
        a: `They're testable step by step, debuggable because the path lives in code, and cheaper and faster with no loop or growing context.`,
      },
    ],
    practice: [
      {
        mode: 'decision',
        title: 'Which pattern?',
        body: `Pick chain, router, parallel, orchestrator–workers, evaluator–optimiser, or agent:

1. Turn a meeting transcript into minutes, then action items, then an email.
2. Support messages that are refunds, bugs, or sales questions, each with its own process.
3. Review a pull request for security, performance and style.
4. Write a product description that must pass a brand-voice checklist.
5. "Plan our team offsite" with calendar, budget and venue tools.`,
        answer: `1. **Chain** — fixed steps, each building on the last; gate after minutes (all speakers
   covered?).
2. **Router** — distinct categories, distinct handling.
3. **Parallel (sectioning)** — three independent reviews run at once, then combined.
4. **Evaluator–optimiser** — generate, check against the checklist, revise; bounded to
   two or three rounds.
5. **Agent** — the steps depend on what the calendar and venues return. (With a human
   approving any booking.)`,
      },
      {
        mode: 'spec',
        title: 'Chain your reply writer',
        body: `Rewrite p-4.1's "draft the reply" step as a chain: (1) extract the facts the reply must
contain from the trace, (2) draft the reply, (3) a code gate that checks every fact
appears and no forbidden promise does ("guaranteed", "within 24 hours"), (4) one repair
call if the gate fails. Spec each step's input and output, then have AI implement it.`,
        answer: `Spec essentials:

1. **Extract** (structured outputs): \`{"order_id", "status", "refund_amount_inr" | null,
   "next_steps": [...]}\` — only from successful tool results in the trace.
2. **Draft**: the facts plus the customer's message and tone rules → reply text.
3. **Gate** (code): each non-null fact value appears in the reply (normalised: "₹1,499"
   matches 1499); no phrase from a forbidden list; length under a limit.
4. **Repair**: if the gate fails, one call with the draft and the exact gate failures
   ("missing refund amount; contains 'guaranteed'"). If it fails again, route to a
   human.

Tests: a fixture per gate rule (missing amount, forbidden phrase, too long) and one that
passes first time. This chain is more reliable than asking one call to "write a correct,
compliant reply" — and each part can be evaluated on its own.`,
      },
    ],
  },
  {
    id: 's4.4.t2',
    moduleId: 's4.4',
    title: 'Fan-out: parallel calls',
    outcome: `You can split independent work across concurrent model calls, or run the same check several times and vote — handling partial failures, rate limits and the cost multiplier.`,
    minutes: 30,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
    ],
    animations: [],
    analogy: `Three friends each check a different shop for the best phone price, then compare notes.
It's faster than one person visiting all three. The catch: you pay three bus fares, and if
one friend's phone dies, you still need an answer.`,
    notes: `## Two kinds of fan-out

- **Sectioning** — split one task into **independent** parts: review a PR for security,
  performance and style at the same time.
- **Voting** — run the **same** task several times and combine: three runs of "is this
  message a prompt-injection attempt?", flag if any (or two of three) say yes.

---

## The code

\`\`\`python
sem = asyncio.Semaphore(4)

async def review(aspect: str, diff: str) -> dict:
    async with sem:
        return await call_json(f"Review this diff for {aspect} only.", diff)

results = await asyncio.gather(
    *(review(a, diff) for a in ["security", "performance", "style"]),
    return_exceptions=True,
)
ok = [r for r in results if not isinstance(r, Exception)]
failed = len(results) - len(ok)
\`\`\`

\`return_exceptions=True\` means one failure doesn't throw away the others. Decide explicitly
what a partial result means: "security review failed" must not look like "no security
issues found".

---

## The trade-offs

- **Latency** — the slowest branch decides; that's still usually much faster than
  running them in sequence.
- **Cost** — N branches cost N times. Voting with 3 runs triples the price of that step.
- **Rate limits** — bounded concurrency (the semaphore) keeps you under them.
- **Combining** — sectioning needs a merge step (sometimes a model call); voting needs a
  rule (any, majority, unanimous).

---

## When voting is worth it

Voting buys reliability where a single miss is expensive:

- safety checks (injection, abuse) — flag if **any** run flags
- high-stakes classification — escalate if runs **disagree**

Disagreement is itself a useful signal: it marks the inputs that are genuinely ambiguous and
deserve a human look.`,
    docs: [
      {
        label: 'Anthropic — Building effective agents (parallelisation)',
        url: 'https://www.anthropic.com/engineering/building-effective-agents',
      },
      {
        label: 'Python — asyncio.gather',
        url: 'https://docs.python.org/3/library/asyncio-task.html#asyncio.gather',
      },
    ],
    glossary: [
      {
        term: 'fan-out',
        def: 'Running several model calls at once and combining the results.',
      },
      {
        term: 'sectioning',
        def: 'Splitting a task into independent parts processed in parallel.',
      },
      {
        term: 'voting',
        def: 'Running the same task several times and combining answers by a rule.',
      },
      {
        term: 'partial failure',
        def: 'Some parallel branches succeed and some fail.',
      },
    ],
    check: [
      {
        q: 'What\'s the difference between sectioning and voting?',
        a: `Sectioning splits a task into independent parts run in parallel; voting runs the same task several times and combines the answers.`,
      },
      {
        q: 'Why use `return_exceptions=True` with gather?',
        a: `So one failed branch doesn't discard the others' results — then you handle the partial result explicitly.`,
      },
      {
        q: 'What decides the latency of a fan-out?',
        a: 'The slowest branch.',
      },
      {
        q: 'When is voting worth its cost?',
        a: `Where a single miss is expensive — safety checks and high-stakes classification — and disagreement between runs is a useful signal.`,
      },
    ],
    practice: [
      {
        mode: 'tool',
        title: 'Parallel review',
        body: `Build the three-aspect PR reviewer. Run it on 5 real diffs from your own repos,
sequentially and in parallel. Record total latency, total tokens, and whether the
parallel version found the same issues.`,
        answer: `Expected: parallel latency close to the slowest single review (roughly a third of
sequential); tokens the same in both modes (the same three calls); identical findings
apart from normal run-to-run variation.

Two things worth writing down:

- **Focused prompts find more:** each reviewer looks at one aspect, and a single
  "review everything" prompt usually misses some of what the three specialists catch.
  Compare against one combined call on the same diffs to see it.
- **The merge matters:** three lists of findings can overlap ("unvalidated input" in both
  security and style). A small merge step that de-duplicates by file and line keeps the
  output readable.`,
      },
      {
        mode: 'decision',
        title: 'Voting rule',
        body: `You run an injection detector three times on each incoming ticket. Pick the combination
rule — any, majority, or unanimous — for each use and explain:

1. Deciding whether the ticket's text may reach the agent unmarked.
2. Deciding whether to auto-close the ticket as spam.
3. Deciding whether to alert the security team.`,
        answer: `1. **Any** — if even one run suspects injection, treat the text as hostile (quarantine or
   extra framing). A false positive costs a little caution; a false negative costs an
   incident.
2. **Unanimous** — auto-closing a real customer's ticket is expensive and visible; only do
   it when all runs agree.
3. **Majority** (or any, with rate limiting) — the security team needs signal, not noise.
   Include disagreements in a daily digest instead of paging.

Same three runs, three different rules — the rule follows the cost of each kind of mistake.`,
      },
    ],
  },
  {
    id: 's4.4.t3',
    moduleId: 's4.4',
    title: 'Evaluator–optimiser and reflection',
    outcome: `You can build a generate–check–revise loop that actually improves output — grounded in real checks, with a hard round limit — and know when reflection is just expensive polishing.`,
    minutes: 30,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
    ],
    animations: [],
    analogy: `Writing an essay with a strict editor: you draft, they mark specific problems against a
rubric, you revise. Two rounds help a lot. Ten rounds and you're just shuffling commas —
and an editor with no rubric only has opinions.`,
    notes: `## The loop

1. **Generate** a draft.
2. **Evaluate** it against explicit criteria.
3. If it fails, **revise** using the evaluation's specific feedback.
4. Stop when it passes — or after **2–3 rounds**, whichever comes first.

---

## The evaluator is everything

The loop only improves things if the evaluation is **real**. From best to weakest:

| Evaluator | Example |
|---|---|
| **Execution** | run the tests, the SQL, the schema validation |
| **Code checks** | required facts present, forbidden phrases absent, length |
| **A model with a rubric** | "does the reply answer every question the customer asked?" |
| **The same model, "reflect on your answer"** | weakest — often agrees with itself |

A model asked to critique its own output without new information tends to find small
things to change rather than real errors. Ground the loop in something outside the model
wherever you can.

---

## A grounded example

\`\`\`python
sql = await generate_sql(question, schema)
for round in range(3):
    error = await try_explain(sql)            # EXPLAIN on a read-only replica
    if error is None:
        break
    sql = await fix_sql(question, schema, sql, error)   # feedback = the real error
else:
    return escalate("couldn't produce valid SQL")
\`\`\`

The feedback is the database's actual error message — specific, true, and actionable.

---

## Costs and failure modes

- Each round is another generation **and** another evaluation.
- **Oscillation** — fixing A breaks B, fixing B breaks A. The round limit stops it.
- **Evaluator drift** — a model judge that "passes" after enough rewording. Calibrate it
  like Stage 3's judges.
- **Polishing** — rounds that change wording but not quality. Measure pass rate per round;
  if round 3 rarely changes the verdict, stop at 2.`,
    docs: [
      {
        label: 'Anthropic — Building effective agents (evaluator–optimiser)',
        url: 'https://www.anthropic.com/engineering/building-effective-agents',
      },
    ],
    glossary: [
      {
        term: 'evaluator–optimiser',
        def: 'A loop where one step generates, another evaluates against criteria, and failures are revised.',
      },
      {
        term: 'reflection',
        def: 'Asking a model to critique and improve its own output.',
      },
      {
        term: 'oscillation',
        def: 'Revisions that fix one problem while re-introducing another, round after round.',
      },
    ],
    check: [
      {
        q: 'What\'s the most reliable kind of evaluator in an evaluator–optimiser loop?',
        a: 'Execution — running tests, queries or validation — followed by deterministic code checks.',
      },
      {
        q: 'Why is plain self-reflection weak?',
        a: `Without new information, a model critiquing its own output tends to agree with itself or make cosmetic changes rather than find real errors.`,
      },
      {
        q: 'Why cap the loop at 2–3 rounds?',
        a: 'To stop oscillation and polishing, and to bound cost — later rounds rarely change the verdict.',
      },
    ],
    practice: [
      {
        mode: 'tool',
        title: 'Measure what each round buys',
        body: `Build an evaluator–optimiser for p-4.1's reply drafts: the evaluator is your chain's
code gate plus a rubric judge ("addresses every question in the ticket"). Run 30 tickets
with up to 3 rounds. Report the pass rate after round 1, 2 and 3, and the cost per round.`,
        answer: `A typical result shape:

| after round | pass rate | cumulative cost |
|---|---|---|
| 1 (first draft) | e.g. 70% | 1× |
| 2 | e.g. 90% | ~1.6× |
| 3 | e.g. 92% | ~2.1× |

(Your numbers will differ.) The usual lesson: round 2 buys most of the gain, round 3
very little. Also look at **what** failed — if the same ticket types fail every round,
no amount of revising helps; the fix is upstream (a missing tool result, or a
policy the agent never retrieved).`,
      },
      {
        mode: 'read',
        title: 'Is this loop useful?',
        body: `\`\`\`python
answer = await ask(question)
for _ in range(5):
    critique = await ask(f"Critique this answer: {answer}")
    answer = await ask(f"Improve the answer using this critique: {critique}")
\`\`\`

What's wrong with it, and how would you redesign it?`,
        answer: `Problems:

- **No stopping condition** — always 5 rounds, even if round 1 was fine: ~11× the cost
  of one answer.
- **No real evaluator** — the critique has no criteria and no outside information, so it
  will always find *something* to change. Answers can get longer and worse.
- **No pass/fail**, so you can't measure whether the loop helps.

Redesign: define criteria (from the task — e.g. "cites a policy section", "gives the
refund amount"); evaluate with code checks first and a rubric judge second; revise only
on a fail, with the specific failures; stop on pass or after 2–3 rounds; and measure the
pass rate per round to decide whether to keep the loop at all.`,
      },
    ],
  },
  {
    id: 's4.4.t4',
    moduleId: 's4.4',
    title: 'Human in the loop',
    outcome: `You can put people at exactly the right points — approving consequential actions, answering clarifying questions, taking over on escalation — with waits that survive restarts.`,
    minutes: 40,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
    ],
    animations: ['anim-human-in-loop'],
    analogy: `A junior accountant prepares payments; a manager approves anything over a limit before it
goes out. Nobody finds this insulting. It's how organisations let people act fast without
letting one mistake become a disaster. An agent is the junior; you design the approval.`,
    notes: `## Three kinds of human step

1. **Approval** — the agent proposes an action; a person approves, edits or rejects it.
   (Refunds above a limit, emails to customers, anything irreversible.)
2. **Clarification** — the agent can't proceed without information only a person has.
3. **Escalation** — the agent hands the whole case to a person, with its findings.

---

## Approval, enforced in code

The model must not be able to skip the gate — so the gate lives in the **tool**, not the
prompt:

\`\`\`python
async def issue_refund(args: RefundArgs, ctx: RunContext):
    check_refund(args, ...)                                 # validation first (Module 1)
    approval = await approvals.create(run_id=ctx.run_id, action="refund",
                                      payload=args.model_dump(),
                                      reasoning=ctx.last_reasoning)
    raise PauseRun(approval.id)             # the run stops here, durably
\`\`\`

The run's status becomes \`waiting_approval\`. Nothing else happens until a person decides.

---

## Durable waiting

A person may take minutes or hours. So the wait must survive restarts (Module 3's events):

- the pending action is **stored** with its exact payload
- the decision is **stored** (who, when, approve/edit/reject)
- a worker **resumes** the run with the decision as the tool's result:
  "Approved by Priya: refund R-7781 issued" or "Rejected: amount exceeds policy for this
  item"

Add an **expiry**: undecided after, say, 24 hours → auto-reject with a note, so runs don't
hang forever.

---

## A good approval screen shows

- the **exact action** (tool, amount, recipient) — the thing that will happen
- **why** — the agent's reasoning and the evidence (order, policy passage)
- **edit** — change the amount, not just yes/no
- one-click approve / reject, with an optional note

---

## Don't exhaust the humans

Approving everything trains people to click "approve" without reading. Gate only what's
consequential; auto-approve small, reversible actions within caps; show a daily summary
instead of a flood of pings. Track time-to-decision and the approve rate — a 99.9% approve
rate may mean the gate is too wide, or nobody's reading.`,
    docs: [
      {
        label: 'Anthropic — Building effective agents',
        url: 'https://www.anthropic.com/engineering/building-effective-agents',
      },
      {
        label: 'LangGraph — human-in-the-loop',
        url: 'https://langchain-ai.github.io/langgraph/concepts/human_in_the_loop/',
      },
    ],
    glossary: [
      {
        term: 'human in the loop',
        def: 'Designing specific points where a person approves, answers or takes over.',
      },
      {
        term: 'approval gate',
        def: 'A point where a proposed action waits for a person\'s decision before running.',
      },
      {
        term: 'escalation',
        def: 'Handing a case to a person, with the agent\'s findings.',
      },
      {
        term: 'approval fatigue',
        def: 'People approving without reading because they\'re asked too often.',
      },
    ],
    check: [
      {
        q: 'Name the three kinds of human step.',
        a: `Approval of a proposed action, clarification when information is missing, and escalation of the whole case.`,
      },
      {
        q: 'Why must the approval gate live in the tool rather than the prompt?',
        a: `A prompt can be ignored or overridden (for example by injected text); code in the tool can't be skipped by the model.`,
      },
      {
        q: 'What makes a wait for approval durable?',
        a: `The pending action and the decision are stored, and a worker resumes the run from stored state when the decision arrives — surviving restarts.`,
      },
      {
        q: 'Why is approving everything a bad design?',
        a: `It causes approval fatigue: people stop reading and click approve, so the gate stops protecting anything.`,
      },
    ],
    practice: [
      {
        mode: 'spec',
        title: 'Spec the approval flow for p-4.1',
        body: `Spec the full approval flow: the \`approvals\` table, how \`issue_refund\` creates one and
pauses the run, the API a UI calls to approve/edit/reject, how the run resumes, the
expiry, and the audit record. Then write the test that proves it survives a restart.`,
        answer: `Spec essentials:

- **Table:** \`approvals(id, run_id, action, payload jsonb, reasoning, status
  [pending|approved|rejected|expired], decided_by, decided_at, note, expires_at)\`.
- **Tool:** validates, inserts a pending approval, records a \`tool_call\` event, and
  raises \`PauseRun\`; the runner catches it and sets the run to \`waiting_approval\`.
- **API:** \`POST /approvals/{id}/decide {decision, edited_payload?, note}\` — checks the
  decider's role; edited payloads are validated again with the same rules.
- **Resume:** a worker picks runs whose approval is decided, executes the (possibly
  edited) action with its idempotency key on approve, and feeds the outcome back as the
  tool result.
- **Expiry:** a scheduled job marks stale approvals \`expired\` and resumes with a
  rejection result.
- **Audit:** every state change is an event with who and when.

**Restart test:** create a refund approval, kill the server, restart, approve via the
API, and assert the refund executed exactly once and the run finished.`,
      },
      {
        mode: 'decision',
        title: 'Gate or not?',
        body: `Decide: auto (no approval), approval, or never allowed — for a support agent's actions.

1. Looking up an order
2. Sending a reply that quotes the refund policy
3. A ₹300 refund on a damaged item, within policy
4. A ₹12,000 refund
5. Changing a customer's registered phone number
6. Deleting a customer account`,
        answer: `1. **Auto** — read-only.
2. **Auto, with guardrails** — the chain's gate checks facts and forbidden promises;
   approve replies only during an initial trial period, then sample them.
3. **Auto within a cap** — small, within policy, and reversible in practice; count it
   against the run's and the day's refund budget.
4. **Approval** — above the limit.
5. **Approval, or never** — account takeover often starts with changing the phone
   number. Many teams require the customer to verify through a separate channel instead.
6. **Never allowed for the agent** — escalate to a person who uses the admin tool. Not
   every action belongs in an agent's tool set.`,
      },
    ],
  },
  {
    id: 's4.4.t5',
    moduleId: 's4.4',
    title: 'Multi-agent systems — rarely',
    outcome: `You can explain when several cooperating agents beat one, what they cost, and why a single agent with good tools (and maybe a subagent) is usually the right default.`,
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
        query: 'multi-agent vs single agent tradeoffs LLM',
        channel: '',
        reason: 'a balanced talk on when multi-agent helps',
      },
    ],
    animations: [],
    analogy: `One capable engineer with good tools versus a committee of five. The committee can cover
more ground in parallel — if the work splits cleanly. Otherwise it spends its time in
meetings, passing notes, and contradicting itself.`,
    notes: `## What "multi-agent" means

Several model-driven loops that cooperate: typically a **lead** agent that plans and
delegates, and **subagents** that each work on a piece with their own context and tools,
then report back.

---

## When it helps

Anthropic's write-up of their multi-agent research system gives real numbers. On their
internal research eval, a lead agent with parallel subagents outperformed a single agent by
**90.2%**. Why it worked there:

- research is **breadth-first** — many independent directions to explore at once
- each subagent gets a **fresh, focused context** instead of one overloaded one
- more total tokens spent on the problem — which, they found, explained most of the
  performance difference

---

## What it costs

From the same write-up: agents use about **4×** the tokens of a chat interaction, and
multi-agent systems about **15×**.

Plus coordination problems:

- subagents duplicating work or contradicting each other
- context lost in hand-offs — each only knows what it was told
- much harder debugging: several interleaved traces

They also note that most **coding** tasks have fewer truly parallel parts than research —
a warning against multi-agent designs where the work doesn't split.

---

## The usual right answer

1. **One agent**, good tools, clear budgets.
2. If one part of the task needs a lot of exploring, a **subagent** for just that part: it
   gets a narrow task, burns tokens in its own context, and returns a **short summary**. The
   main agent's context stays clean.
3. A full multi-agent system only when the work is **wide and parallel** and valuable enough
   to justify ~15× the tokens.

---

## Interview framing

*"I'd start with a single agent and measure. I'd add a subagent where one step needs deep
exploration that would flood the main context. I'd only go multi-agent for breadth-first
tasks like research, where parallel exploration clearly pays for the extra tokens — Anthropic
reported about 15× the tokens of chat for their multi-agent system."*`,
    docs: [
      {
        label: 'Anthropic — How we built our multi-agent research system',
        url: 'https://www.anthropic.com/engineering/multi-agent-research-system',
      },
      {
        label: 'Anthropic — Building effective agents',
        url: 'https://www.anthropic.com/engineering/building-effective-agents',
      },
    ],
    glossary: [
      {
        term: 'multi-agent system',
        def: 'Several cooperating model-driven loops, usually a lead agent delegating to subagents.',
      },
      {
        term: 'subagent',
        def: 'A separate agent loop with its own context, given one narrow task, returning a short result.',
      },
      {
        term: 'breadth-first task',
        def: 'Work that splits into many independent directions that can be explored in parallel.',
      },
    ],
    check: [
      {
        q: 'Why did multi-agent work well for research in Anthropic\'s system?',
        a: `Research is breadth-first with many independent directions; subagents explored them in parallel with fresh contexts, spending more total tokens on the problem.`,
      },
      {
        q: 'Roughly how many tokens do agents and multi-agent systems use compared with chat, per Anthropic?',
        a: 'About 4× for agents and about 15× for multi-agent systems.',
      },
      {
        q: 'What does a subagent give you without a full multi-agent design?',
        a: `A separate context for one exploration-heavy part, returning only a short summary so the main agent's context stays clean.`,
      },
      {
        q: 'Why are most coding tasks a poor fit for multi-agent designs?',
        a: `They have fewer truly parallel parts, and the pieces depend on each other, so coordination costs outweigh the parallelism.`,
      },
    ],
    practice: [
      {
        mode: 'decision',
        title: 'One agent or many?',
        body: `1. p-4.1's support agent.
2. A "competitor analysis" tool that researches 12 companies across pricing, hiring and
   product news.
3. An agent that fixes a failing test in a 20-file Python project.`,
        answer: `1. **One agent.** The steps depend on each other (look up → check → propose → approve),
   and runs are short. Multiple agents would add cost and hand-off errors for nothing.
2. **Multi-agent is reasonable** — 12 independent companies × 3 aspects is wide, parallel
   work. A lead agent plans and delegates per company; subagents research and return
   short structured summaries; the lead combines. Budget it: it will cost many times a
   single agent.
3. **One agent**, maybe with a subagent to explore the codebase ("find where X is
   configured") and return a summary. Code changes depend tightly on each other; parallel
   editors would conflict.`,
      },
      {
        mode: 'spec',
        title: 'Spec a subagent tool',
        body: `Spec a \`research_policy(question)\` tool for p-4.1 that runs a small subagent: it can
call \`search_policy\` up to 5 times and must return at most 150 words with citations.
Say what the main agent sees, and what it never sees. Have AI implement it.`,
        answer: `Spec essentials:

- **Input:** a focused question from the main agent.
- **Subagent:** its own loop and messages list, a smaller or cheaper model if evaluation
  allows, tools = \`search_policy\` only, budget = 5 steps and a token cap.
- **Output:** structured \`{"answer": str (≤150 words), "citations": [section ids],
  "confident": bool}\`.
- **The main agent sees:** only that output, as the tool result.
- **It never sees:** the subagent's search results and reasoning — that's the point: the
  exploration stays out of the main context.

Log the subagent's trace under the parent run ID, so the dashboard can show it nested.
Evaluate: does the main agent get equally good answers with and without the subagent,
and how much smaller is its context?`,
      },
    ],
  },
];
