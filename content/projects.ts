import type { Project } from '@/lib/types';

/**
 * Written as work tickets, not exercises. You build these in your own editor,
 * with AI assistance — so they aim higher than a course normally would.
 * No time boxes: the size label is only so you know what you are walking into.
 */
export const projects: Project[] = [
  {
    id: 'p-1.1', stage: 1, size: 'S', title: 'The Port',
    body: `**The situation.** You have working Express and MongoDB projects, and no Python
projects. Anyone looking at your GitHub sees a JS developer, because there is nothing there
that says otherwise.

**What to build.** Rebuild one of your existing Express + Mongo apps as FastAPI + Postgres,
feature for feature, with tests and containers. Pick the one with the most interesting data
model, not the simplest.

### Constraints
- The API surface stays identical — your existing frontend must work against it unchanged
- Async all the way through
- Alembic migrations, no hand-edited schemas
- \`ruff\` and \`pyright\` clean
- Runs from \`docker compose up\` on a machine that has nothing but Docker

### Not this time
New features. New UI. Rewriting the frontend. Performance tuning.

### Done when
- Every endpoint returns the same shape as the original, and a contract test proves it
- Your Mongo collections are modelled relationally, with foreign keys and indexes you chose on purpose
- Async tests included
- \`docker compose up\` brings up the app and the database, migrations applied
- It is deployed, with a public URL
- \`PORT_NOTES.md\` lists ten things that differed from Express, ranked by how much they surprised you

### Why this one
It is the fastest way to turn "MERN developer" into "polyglot backend developer", because
you are re-expressing something you already understand instead of learning a language cold.
Small effort, disproportionate signal.`,
  },
  {
    id: 'p-1.2', stage: 1, size: 'S', title: 'Async Harvester',
    body: `**The situation.** A research team has 2,400 company URLs in a spreadsheet. They need
the title, description, careers link and last-modified date for each one. Their current
script runs one at a time, takes four hours, dies halfway, and starts again from the top.

**What to build.** A concurrent, resumable harvester.

### Constraints
- At most 20 requests in flight
- 10-second timeout per request
- Exponential backoff with jitter, four attempts maximum
- Idempotent writes — running it twice must not duplicate anything
- Survives \`kill -9\` and resumes
- Structured JSON logs, and a summary at the end

### Done when
- A 500-URL test set finishes in under four minutes
- You kill it mid-run, restart, and it resumes with no duplicates and nothing lost
- With 30% of targets returning 429 or 500, it still completes and records why each one failed
- \`EXPLAIN ANALYZE\` on your dedup query shows an index scan, not a sequential scan
- The final report shows: succeeded, failed by reason, p50 and p95, total wall time

### Why this one
Bounded concurrency, backoff with jitter, idempotency, partial failure, resumability. Every
one of those is what you need in Stage 2 for concurrent model calls, and in Stage 3 for
embedding a corpus. You are building that muscle without spending a rupee on tokens.`,
  },
  {
    id: 'p-2.1', stage: 2, size: 'M', title: 'Chat, done properly',
    body: `**The situation.** Every AI portfolio has a chat app. They all look the same: no
streaming, one provider, no cost visibility, no failure handling. Interviewers have seen two
hundred of them.

**What to build.** The one that answers what the other two hundred cannot: what did that
cost, what happens when the provider dies, and which prompt produced this answer?

### Constraints
- Three providers behind **one** internal interface
- Real token streaming, with cancellation that actually stops upstream billing
- Every message records the model, prompt version, tokens in and out, rupees, latency and time to first token
- Prompts live in \`prompts/\` under git, with versions
- p95 time-to-first-token under 1.5 seconds

### Done when
- You switch provider mid-conversation and the history survives, correctly re-serialised
- Cancelling a stream aborts the upstream request — prove it in the logs, not just the UI
- There is a cost badge per message and a total per session
- Revoking the main provider's key gives a degraded answer, not a 500
- A 200k-token input gets a clear rejection, not a stack trace
- Deployed, with a short demo video`,
  },
  {
    id: 'p-2.2', stage: 2, size: 'M', title: 'Structured Extraction Service',
    body: `**The situation.** A 40-person recruitment agency receives about 900 resumes a month,
as PDFs and DOCX, in every layout imaginable. Two coordinators spend roughly fifteen hours a
week copying name, email, phone, experience, skills, current CTC, notice period and the last
three roles into a spreadsheet. They make typos and they miss people.

**What to build.** A service that takes a resume file and returns validated structured JSON,
or an explicit failure you can act on.

### Constraints
- A strict schema. No free-form dictionaries.
- Dates normalised. Skills mapped to a fixed vocabulary, unknowns bucketed with the raw string kept.
- On validation failure: one repair attempt with the error fed back, then a structured failure
- Under ₹0.60 per resume, p95 under 8 seconds
- **Never invent a field.** A missing phone number is null.

### Done when
- A 30-resume golden set is committed — single column, two column, table-heavy, one scan, one Hinglish — with hand-labelled expected output
- At least 90% field-level accuracy on it
- **A test asserts that a resume with no phone number returns null.** This is the most important test in the project: a confident wrong value is worse than a gap.
- The repair loop measurably improves the pass rate, and you report both numbers
- Tests fail the build when accuracy drops below your threshold
- Deployed`,
  },
  {
    id: 'p-3.1', stage: 3, size: 'XL', flagship: true, title: 'Document Intelligence, with receipts',
    body: `**Pick a corpus and commit.** The messier the better:
- Your university's academic regulations and exam bylaws — students ask the same thirty questions every semester and nobody can find the answer
- RBI master circulars on retail lending
- Health insurance policy wordings, where the exclusions are buried in sub-clauses and people lose money over it
- GST or income-tax circulars for small businesses

**What to build.** Answer questions over that corpus with citations a sceptical person can
check — and prove the retrieval is good, with numbers.

**Start from the RAG project you already have.** It becomes version 1, the baseline row of
your results table. This is not "learn RAG". It is "find out how good the thing you built
actually is".

### Constraints
- Citations link to page and section, and the interface shows the source text
- It says "not in these documents" instead of guessing
- p95 under 6 seconds, under ₹1.50 per query
- Re-ingestion is incremental — changing one PDF must not re-embed the corpus
- Metadata is ready for multiple tenants even though there is only one now

### Done when
- At least 50 hand-written golden questions with known correct sources, committed
- **A results table across six or more versions**, each with recall@5, faithfulness, p95 and ₹ per query: your existing project → chunking → hybrid + RRF → reranking → contextual retrieval → query rewriting
- The eval suite runs in CI, and a deliberately bad change visibly fails it
- Every answer carries a citation; twenty sampled and confirmed by hand
- It abstains correctly on ten out-of-corpus questions
- A hand error-analysis of twenty failures, grouped into categories
- Deployed, with a demo video

### Why this one
The results table *is* the portfolio piece. Anyone can say "I built RAG". Almost nobody can
say "reranking moved recall@5 from 0.61 to 0.89, cost me 240ms and ₹0.20 a query, and here
is the failure analysis that told me to try it."`,
  },
  {
    id: 'p-3.2', stage: 3, size: 'M', optional: true, title: 'Ask My Repo',
    body: `**The situation.** You have a dozen repos and cannot remember how you did auth in the
third one.

**What to build.** Retrieval over your own GitHub repos, with code-aware chunking and
\`file:line\` citations.

### Constraints
- Chunk on function and class boundaries, not character counts
- Metadata: repo, path, language, symbol, line range
- Citations link to \`repo/path#L12-L48\`
- Incremental indexing driven by git diff

### Why this one
Code chunking is a genuinely different problem from prose chunking, and it comes up
constantly at companies building developer tools — a large share of AI hiring.`,
  },
  {
    id: 'p-4.1', stage: 4, size: 'XL', flagship: true, title: 'Support Ops Agent',
    body: `**The situation.** A D2C brand's two-person support team handles about 300 tickets a
day. Sixty percent are the same five questions. Each one needs the order looked up, the
policy checked and a reply written — six minutes each. They want two minutes, and they are
correctly terrified of an AI auto-refunding ₹40,000 at 3am.

**What to build.** An agent that does the whole workflow and stops for human approval before
anything consequential.

### Constraints
- Tools: look up order, customer history, search policy (your Stage 3 retrieval), draft reply, issue refund (**approval-gated, hard cap**), escalate
- Budgets on steps, rupees and wall-clock
- Every action audit-logged with the reasoning that produced it
- Runs resume after a server restart
- Retrieved policy text and tool results are treated as untrusted data, never as instructions

### Done when
- 30 scenario fixtures with expected action sequences — happy path, out-of-policy refund, missing order, abusive message, ambiguous request, and **a ticket containing a prompt-injection attempt**
- An agent eval suite reporting action accuracy honestly, failures included
- It never issues a refund without approval. One test asserts that; a second asserts it under the injection attempt.
- Interrupt and resume works across a process restart
- Loop detection: the same tool with the same arguments three times triggers an intervention
- **A trace dashboard**: live reasoning, tool timeline with arguments and costs, approval modal, interrupt button, full replay
- Both your hand-written loop and the LangGraph version, with a README comparing them
- Deployed, with a demo showing an approval and a rejection

### Why this one
Two things here are rare: a durable approval gate, and the dashboard. A Python-only engineer
ships a CLI with print statements. You ship something a support manager could use tomorrow.`,
  },
  {
    id: 'p-4.2', stage: 4, size: 'M', title: 'Your MCP Server',
    body: `**The situation.** MCP is infrastructure now. Almost no candidate in India has built
one. That gap will not last; use it while it is there.

**What to build.** Pick one, then build, test, publish and document it.
1. **Read-only Postgres explorer** — schema introspection, safe parameterised queries, row limits, a hard timeout, a denylist
2. **Study-context server** — exposes your AmpratAI progress and notes so Claude can tutor you from your real state
3. **Project-context server** — your repos, open issues, deploy status and recent incidents as resources

### Constraints
- Python SDK
- **Tools and resources.** Most servers only do tools; doing both shows you read the spec.
- stdio and streamable HTTP
- Input validation on every tool; errors returned as structured results, never raised
- Published, installable in one line
- Tool descriptions written as prompts, with units

### Done when
- A stranger can install it from your README alone
- It works in Claude Code and Claude Desktop, with screenshots of both
- \`tools/list\` and \`resources/list\` are both populated
- Tests cover the protocol surface, not just the business logic
- Large results are truncated with a "refine your query" hint, not dumped into context
- \`SECURITY.md\` states what it can reach, what it cannot, and why

### Why this one
"I published an MCP server, here is the install command" ends any doubt about whether you
are current. It is small and it punches far above its weight.`,
  },
  {
    id: 'p-5.1', stage: 5, size: 'XL', flagship: true, title: 'Production Hardening',
    body: `**The situation.** You have three things that work on your machine and a hosting
platform. None of them would survive a traffic spike, a malicious user, or a finance team
asking what they cost.

**What to build.** Take p-3.1 or p-4.1 to genuine production grade, and produce the numbers.

### Constraints
- A real cloud, containerised
- Managed Postgres with pgvector, Redis, object storage
- Queue and workers for ingestion and agent runs
- Tracing on every model call, retrieval and tool call
- Caching: prompt cache, exact match, semantic
- Per-tenant rate limits and budgets, with a kill switch
- CI/CD with an eval gate; load-tested

### Done when
- \`ARCHITECTURE.md\` with a diagram and every component's purpose
- **A results table**: p95 before and after, ₹ per request before and after, cache hit rate, load-test ceiling and the failure mode at that ceiling
- Cost cut by at least 40% through caching and routing, with the working shown
- Rate limiting demonstrated under load; the budget kill switch demonstrated
- A pipeline from lint through eval gate to production, with a demonstrated rollback
- \`RUNBOOK.md\` — how to diagnose slow responses, cost spikes, bad answers and a stuck queue, with the actual queries and dashboard links
- OWASP LLM Top 10 reviewed against this code, with at least three real fixes committed

### Why this one
This is what makes you interview as a mid-level engineer rather than a career-switcher. The
runbook especially — candidates with runbooks have operated something.`,
  },
  {
    id: 'p-5.2', stage: 5, size: 'S', title: 'Break it and write it up',
    body: `**The situation.** Nothing on your CV says you have survived something going wrong.
Interviewers probe exactly there, because it separates shipped-to-production from
shipped-to-localhost.

**What to build.** Deliberately cause a realistic incident in your own staging environment,
detect it through your own dashboards, fix it, and write a proper postmortem.

Pick two and run them for real:

| Incident | How to cause it | What it teaches |
|---|---|---|
| Retry storm | Remove jitter, make the provider fail | What a self-inflicted outage feels like |
| Cost spike | Remove the cache, loop a 30k-token prompt | How fast money moves when nobody is watching |
| Context overflow | Never compact agent history | The turn-12 cliff |
| Indirect injection | Plant an instruction inside a retrieved document | Why permissions, not prompts, are the boundary |
| Tenant leak | Drop the tenant filter | The one-line bug that ends companies |
| Silent quality collapse | Ship a "harmless" prompt edit | Why the eval gate exists |

### Done when
- The incident is real, in staging, with timestamps
- **You detected it through your own dashboard or alert** — not by knowing you caused it. If your observability missed it, that is finding number one.
- \`postmortems/NNN-slug.md\` covers timeline, impact with numbers, root cause, contributing factors, fix, prevention, and what you would have needed to catch it in one minute instead of twenty
- The prevention is implemented and committed, not just recommended

### Why this one
The highest senior-signal per hour on the whole path. It comes up in every interview.`,
  },
  {
    id: 'p-5.3', stage: 5, size: 'M', optional: true, title: 'Eval harness library',
    body: `Extract your eval code into a small open-source library: dataset loading and
versioning, retrieval metrics, judge scaffolding with calibration helpers, test-framework
integration, and a CI reporter that posts scores on a pull request. Docs, types, tests,
published.

Giving your metrics an API forces you to understand them properly.`,
  },
  {
    id: 'p-6.1', stage: 6, size: 'XL', flagship: true, title: 'Capstone — AI hiring copilot (you name it)',
    body: `**The situation.** Hiring is broken at both ends. Candidates send 200 applications
into a void with no idea why they were rejected. Recruiters read 900 resumes for 6 openings
using keyword search that misses anyone who phrased their skills differently.

**What to build.** The system that fixes matching for both sides — and make it survive real
users. Each piece reuses earlier work; this is integration, not fresh invention.

1. **Resume understanding** — p-2.2, hardened, with confidence scores and a human review queue
2. **Job description understanding** — requirements extracted, must-have separated from nice-to-have, and the seniority the posting is *actually* asking for
3. **Semantic matching** — hybrid retrieval both directions, reranked, with **an explanation of every match**: which requirement is met by which line of the resume
4. **Gap analysis** — "you are missing X and Y for this role, here are three specific things to build", grounded in the actual posting
5. **Interview prep** — questions from the specific posting and the candidate's real experience, not generic lists
6. **Recruiter search** — natural-language candidate search with per-tenant isolation
7. **Observability, evals and a cost dashboard**

### Constraints
- **Multi-tenant with retrieval-level isolation**, and a test proving tenant A cannot reach tenant B's candidates
- Per-tenant budgets and rate limits
- Human in the loop on anything candidate-facing
- **No unexplained scores.** Every match cites the resume line and the requirement it is based on.
- Real users — at least ten — whose feedback you log and act on
- **A fairness review**: document which signals you deliberately excluded (name, gender, college tier, age proxies) and test that excluding them does not change match scores

### Done when
- Live, public, multi-tenant, with real usage
- A tenant-isolation test in CI
- A 100-pair golden set with published metrics
- Every match explained, with citations on both sides
- The fairness review documented and its tests passing
- \`ARCHITECTURE.md\`, \`RUNBOOK.md\`, \`EVALS.md\`, and a written "what real users did that I did not predict"
- A three-minute demo video and a written case study

### Why this one
A real problem, it exercises everything on the path, and the explainability and fairness
work shows judgement rather than plumbing. It is also demo-able to a recruiter, which is the
exact person you need to impress.`,
  },
  {
    id: 'p-7.1', stage: 7, size: 'L', title: 'Specialisation project',
    body: `One project in whichever specialisation you picked, scoped to what the job
descriptions you are actually interviewing for ask about.

For example: a durable browser-use agent with recovery · a GraphRAG system over a linked
corpus · a self-hosted vLLM gateway with routing, autoscaling and cost dashboards · an
annotation and judge-calibration tool · three rapid client-style prototypes in different
domains.`,
  },
];
