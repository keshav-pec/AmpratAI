# 07 — Project Briefs

Each brief is a work ticket, not an exercise. Built in your own IDE, with AI assistance.
Verified by acceptance tests, a reachable URL, and a conversation with Amprat Assistant
about your own code.

**No time boxes, no deadlines.** Each brief has a rough *size* so you know what you're
walking into — nothing more.

**Because you build with AI, these aim high.** The hard part of each one is the thinking:
what to build, what to measure, what to trade away. That's deliberate — it's the part that's
actually scarce, and the part interviews probe.

Sizes: **S** a session or two · **M** a few sessions · **L** a real project · **XL** flagship

---

## P1.1 — "The Port" · S

**CONTEXT** You have working Express + MongoDB projects and no Python projects. Interviewers
can't see transferable skill; they see "JS developer".

**PROBLEM** Rebuild one of your existing Express + Mongo apps as FastAPI + Postgres, feature
for feature, with tests and containers. Pick the one with the most interesting data model,
not the simplest.

**CONSTRAINTS** Identical API surface — the same frontend must work against both, unchanged ·
async throughout · Alembic migrations, no hand-edited schemas · `ruff` and `pyright` clean ·
runs from `docker compose up` on a machine that has only Docker.

**NON-GOALS** New features. New UI. Rewriting the frontend. Performance tuning.

**ACCEPTANCE**
- [ ] Every endpoint returns the same shape as the original — a contract test suite proves it
- [ ] Mongo collections modelled relationally, with foreign keys and deliberate indexes
- [ ] Async tests included; meaningful coverage
- [ ] `docker compose up` brings up app + Postgres, migrations applied
- [ ] Deployed, public URL
- [ ] `PORT_NOTES.md` — ten things that differed from Express, ranked by how much they surprised you

**JUDGED ON** Contract parity · schema and index quality · async correctness · whether you
can explain the dependency-injection and session-handling choices in your own code

**WHY** It's the fastest way to convert "MERN developer" into "polyglot backend developer"
on your GitHub, because you're re-expressing something you already understand rather than
learning a language cold. Low effort, disproportionate signal.

---

## P1.2 — "Async Harvester" · S

**CONTEXT** A research team has 2,400 company URLs and needs the title, meta description,
careers link and last-modified date for each. Their script is sequential, takes four hours,
dies halfway, and restarts from the top.

**PROBLEM** Build a resumable, concurrent harvester.

**CONSTRAINTS** At most 20 concurrent requests · 10-second per-request timeout · exponential
backoff with jitter, four attempts max · idempotent writes · resumable after `kill -9` ·
structured JSON logs · a summary report.

**NON-GOALS** A UI. Link-following. JavaScript rendering.

**ACCEPTANCE**
- [ ] 500-URL test set completes in under four minutes
- [ ] Killed mid-run and restarted → resumes, no duplicates, no losses
- [ ] With 30% of targets returning 429/500, the run still completes and records why each failure happened
- [ ] `EXPLAIN ANALYZE` on the dedup query shows an index scan
- [ ] Final report: succeeded, failed by reason, p50 and p95 latency, wall time

**JUDGED ON** Concurrency correctness · resumability · error taxonomy · idempotency

**WHY** Bounded concurrency, backoff with jitter, idempotency, partial failure,
resumability — every one of these is what you need next stage for concurrent LLM calls, and
in Stage 3 for embedding a corpus. You're building that muscle without spending a rupee on
tokens.

---

## P2.1 — "Chat, done properly" · M

**CONTEXT** Every AI portfolio has a chat app and they all look the same: no streaming, one
provider, no cost visibility, no failure handling. Interviewers have seen two hundred.

**PROBLEM** Build the one that answers what the other two hundred can't: what did that cost,
what happens when the provider dies, and which prompt version produced this answer?

**CONSTRAINTS** Three providers behind **one** internal interface · real token streaming with
cancellation that actually stops upstream billing · every message records model, prompt
version, tokens in/out, ₹, latency and time-to-first-token · prompts versioned in git ·
p95 time-to-first-token under 1.5s.

**NON-GOALS** Auth beyond one user. Retrieval. Agents. Chat history search.

**ACCEPTANCE**
- [ ] Switch provider mid-conversation; history is preserved and correctly re-serialised for the new format
- [ ] Cancelling a stream aborts the upstream request — prove it in the logs, not just the UI
- [ ] Per-message cost badge and a session total
- [ ] Revoke the primary provider's key → the fallback chain serves a degraded answer, no 500
- [ ] A 200k-token input gets a clear, graceful rejection, not a stack trace
- [ ] Every stored message traces back to the exact prompt version that produced it
- [ ] Deployed, public URL, short demo video

**JUDGED ON** Streaming and cancellation correctness · quality of the provider abstraction ·
cost instrumentation · failure handling · whether you can explain what your abstraction
layer normalises and what it can't

**STRETCH** Regenerate with a different model and diff the answers side by side. Add prompt
caching and show the cost drop on your own dashboard.

---

## P2.2 — "Structured Extraction Service" · M

**CONTEXT** A 40-person recruitment agency gets ~900 resumes a month as PDFs and DOCX in
every imaginable layout. Two coordinators spend around fifteen hours a week copying name,
email, phone, experience, skills, current CTC, notice period and the last three roles into a
spreadsheet. They make typos and they miss people.

**PROBLEM** A service that takes a resume file and returns validated structured JSON — or an
explicit, actionable failure.

**CONSTRAINTS** A strict schema, no free-form dicts · ISO dates · skills mapped to a closed
vocabulary, unknowns bucketed with the raw string kept · on validation failure, one repair
attempt with the error fed back, then a structured failure · under ₹0.60 per resume ·
p95 under 8 seconds · **never invent a field** — a missing phone number is `null`.

**NON-GOALS** Ranking candidates. Matching to jobs (that's the capstone). Handwritten scans.

**ACCEPTANCE**
- [ ] A 30-resume golden set committed: single-column, two-column, table-heavy, one scanned, one Hinglish — with hand-labelled expected output
- [ ] At least 90% field-level accuracy on it
- [ ] **Zero fabricated fields** — a specific test asserts that a resume with no phone number returns `null`. This is the most important test in the project; a confident wrong value is worse than a gap.
- [ ] The repair loop measurably improves the pass rate — report both numbers
- [ ] Tests fail the build when accuracy drops below your threshold
- [ ] Cost per resume, from real instrumentation
- [ ] Deployed, public URL

**JUDGED ON** Accuracy · the no-fabrication guarantee · golden set quality · the repair loop ·
cost discipline

**STRETCH** Per-field confidence scores, routing low-confidence extractions to a human review
queue. That queue is a genuine product feature and a good interface to show off.

---

## P3.1 — "Document Intelligence, with receipts" · XL · FLAGSHIP

**CONTEXT** Pick one corpus and commit. The messier the better:
- Your university's academic regulations and exam bylaws — students ask the same thirty questions every semester and nobody can find the answer
- RBI master circulars on retail lending — cross-references and amendments
- Health insurance policy wordings — exclusions buried in sub-clauses, and people lose money over this
- GST or income-tax circulars for small businesses

**PROBLEM** Answer natural-language questions over this corpus with citations a sceptical
person can verify — and **prove** the retrieval is good, with numbers.

**START FROM YOUR EXISTING RAG PROJECT.** It becomes version 1 — the baseline row of the
results table. That framing matters: this isn't "learn RAG", it's "take what you built and
find out how good it actually is."

**CONSTRAINTS** Citations deep-link to page and section, and the UI shows the source text ·
answers say "not in these documents" rather than guess · p95 under 6 seconds · under ₹1.50
per query · re-ingestion is incremental — changing one PDF doesn't re-embed the corpus ·
metadata is multi-tenant-ready even though you're single-tenant now.

**NON-GOALS** Agents. Fine-tuning. Cross-corpus multi-hop reasoning.

**ACCEPTANCE**
- [ ] At least 50 hand-written golden questions with known correct sources, committed
- [ ] **A results table across 6+ pipeline versions**, each with recall@5, faithfulness, p95 latency and ₹/query:
      `v1 your existing project` → `v2 chunking` → `v3 hybrid + RRF` → `v4 reranking` → `v5 contextual retrieval` → `v6 query rewriting`
- [ ] The eval suite runs in CI, and a deliberately bad change demonstrably fails it
- [ ] Every answer carries at least one verifiable citation; twenty sampled and manually confirmed
- [ ] It abstains correctly on ten out-of-corpus questions — a scored criterion, not a nice-to-have
- [ ] Incremental re-ingest proven: change one page, show only the affected chunks re-embedded
- [ ] A hand error-analysis of twenty failures, grouped into categories, written up
- [ ] Deployed, public URL, demo video

**JUDGED ON** Evaluation rigour above everything · retrieval quality · citation correctness ·
abstention behaviour · ingestion engineering · whether you can explain, from your own table,
why each change helped and what it cost

**STRETCH** Table-aware extraction so numeric questions work. Cross-document comparison.
Hindi questions over English documents.

**WHY** The results table *is* the portfolio piece. Anyone can say "I built RAG". Almost
nobody can say "reranking moved recall@5 from 0.61 to 0.89, cost me 240ms and ₹0.20 a query,
and here's the twenty-failure analysis that told me to try it." That sentence is the
difference between a hobbyist and a hire.

---

## P3.2 — "Ask My Repo" · M · optional

**CONTEXT** You have a dozen repos and can't remember how you did auth in the third one.

**PROBLEM** Retrieval over your own GitHub repos, with code-aware chunking and `file:line`
citations.

**CONSTRAINTS** Chunk on function and class boundaries, not character counts · metadata:
repo, path, language, symbol, line range · citations link to `repo/path#L12-L48` ·
incremental indexing driven by git diff.

**ACCEPTANCE** Answers "how did I implement X" across repos with correct citations ·
20-question golden set · incremental indexing works · deployed.

**WHY** Code chunking is a genuinely different problem from prose chunking, and it comes up
constantly at companies building developer tools — a large share of AI hiring.

---

## P4.1 — "Support Ops Agent" · XL · FLAGSHIP

**CONTEXT** A D2C brand's two-person support team handles about 300 tickets a day. Sixty
percent are the same five questions. Each needs the order looked up, the policy checked and
a reply written — six minutes each. They want two minutes, and they are correctly terrified
of an AI auto-refunding ₹40,000 at 3am.

**PROBLEM** An agent that does the whole workflow and **stops for human approval** before
anything consequential.

**CONSTRAINTS** Tools: `lookup_order`, `get_customer_history`, `search_policy` (your Stage 3
retrieval), `draft_reply`, `issue_refund` (**approval-gated, hard cap**), `escalate` · step,
rupee and wall-clock budgets · every action audit-logged with the reasoning that produced it ·
runs resumable after a server restart · retrieved policy text and tool results treated as
untrusted data, never as instructions.

**NON-GOALS** Emailing real customers. Multi-agent architecture. Voice.

**ACCEPTANCE**
- [ ] 30 scenario fixtures — happy path, out-of-policy refund, missing order, abusive message, ambiguous request, and **a ticket containing a prompt-injection attempt** — with expected action sequences
- [ ] An agent eval suite reporting action-sequence accuracy honestly, failures included
- [ ] Never issues a refund without approval. One test asserts this; a second asserts it under the injection attempt.
- [ ] Interrupt and resume works across a process restart
- [ ] Loop detection: same tool, same arguments, three times → it intervenes
- [ ] Budget exhaustion escalates to a human rather than crashing
- [ ] **A trace dashboard**: live reasoning, tool timeline with arguments, results, duration and cost, an approval modal, an interrupt button, and full run replay
- [ ] Both your hand-written loop and the LangGraph version in the repo, with a README comparing them
- [ ] Deployed, public URL, demo video showing an approval and a rejection

**JUDGED ON** Safety and approval correctness · agent eval rigour · the dashboard ·
resumability · injection resistance · whether you can walk through a trace and explain each
decision the agent made

**WHY** Two things here are rare: a durable approval gate, and the dashboard. A Python-only
engineer ships a CLI with print statements. You ship something a support manager could use
tomorrow — which is exactly the premium the reference video describes.

---

## P4.2 — "Your MCP Server" · M

**CONTEXT** MCP is infrastructure now — built by Anthropic, stewarded by the Linux
Foundation, adopted across the industry. Almost no candidate in India has built one. That
asymmetry won't last; use it while it's there.

**PROBLEM** Build, test, publish and document an MCP server that solves a real problem.

Pick one:
1. **Read-only Postgres explorer** — schema introspection, safe parameterised queries, row limits, a hard timeout, a denylist. Useful, with a clean security story.
2. **Study-context server** — exposes your AmpratAI progress and notes so Claude can tutor you from your actual state.
3. **Project-context server** — your repos, open issues, deploy status and recent incidents as MCP resources.

**CONSTRAINTS** Python SDK · **tools and resources** (most servers only do tools — doing both
shows you read the spec) · stdio and streamable HTTP · input validation on every tool ·
errors returned as structured tool results, never raised · published with a one-line install ·
tool descriptions written as prompts, with units.

**ACCEPTANCE**
- [ ] A stranger can install it in one command from your README alone
- [ ] Works in Claude Code and Claude Desktop — screenshots of both
- [ ] `tools/list` and `resources/list` both populated and correct
- [ ] Tests covering the protocol surface, not just the business logic
- [ ] Large results truncated with a "refine your query" hint, not dumped into context
- [ ] `SECURITY.md` — threat model: what it can reach, what it can't, and why
- [ ] A demo GIF of it running inside Claude Code

**JUDGED ON** Protocol correctness · security model · usefulness · installability · tests

**WHY** "I published an MCP server, here's the install command" ends any doubt about whether
you're current. Publishing anything to a package registry is a credibility step most learners
never take, and this one is small.

---

## P5.1 — "Production Hardening" · XL · FLAGSHIP

**CONTEXT** You have three things that work on your machine and a PaaS. None would survive a
traffic spike, a malicious user, or a finance team asking what they cost.

**PROBLEM** Take P3.1 or P4.1 to genuine production grade, and produce the numbers.

**CONSTRAINTS** A real cloud (AWS ECS/Fargate or GCP Cloud Run), containerised · managed
Postgres with pgvector, Redis, object storage · queue and workers for ingestion and agent
runs · tracing on every model call, retrieval and tool call · caching: prompt cache, exact
match, semantic · per-tenant rate limits and budgets with a kill switch · CI/CD with an eval
gate · load-tested.

**ACCEPTANCE**
- [ ] `ARCHITECTURE.md` with a diagram and every component's purpose
- [ ] **A results table**: p95 before and after · ₹/request before and after · cache hit rate · load-test ceiling and the failure mode at that ceiling
- [ ] Cost cut by at least 40% through caching and routing, with the working shown
- [ ] Dashboard screenshots: cost per day by feature, p95 by endpoint, quality trend
- [ ] Rate limiting demonstrated under load; the budget kill switch demonstrated
- [ ] A pipeline: lint → typecheck → test → eval gate → build → staging → smoke → prod, with a demonstrated rollback
- [ ] `RUNBOOK.md` — how to diagnose slow responses, cost spikes, bad answers and a stuck queue, with the actual queries and dashboard links
- [ ] OWASP LLM Top 10 reviewed against this code, with at least three real fixes committed

**JUDGED ON** Real numbers above all · architecture quality · observability · the eval gate ·
security fixes · the runbook

**WHY** This is what makes you interview as a mid-level engineer rather than a
career-switcher. The runbook especially — candidates with runbooks have operated something.

---

## P5.2 — "Break it and write it up" · S

**CONTEXT** Nothing on your CV yet says you've survived something going wrong. Interviewers
probe exactly there, because it separates shipped-to-production from shipped-to-localhost.

**PROBLEM** Deliberately cause a realistic incident in your own staging environment, detect
it through your own dashboards, fix it, and write a real postmortem.

Pick two and run them for real:

| Incident | How to cause it | What it teaches |
|---|---|---|
| Retry storm | Remove jitter, make the provider fail | What a self-inflicted outage feels like |
| Cost spike | Remove the cache, loop a 30k-token prompt | How fast money moves when nobody's watching |
| Context overflow | Never compact agent history | The turn-12 cliff |
| Indirect injection | Plant an instruction inside a retrieved document | Why permissions, not prompts, are the boundary |
| Tenant leak | Drop the tenant filter | The one-line bug that ends companies |
| Silent quality collapse | Ship a "harmless" prompt edit | Why the eval gate exists |

**ACCEPTANCE**
- [ ] A real incident, in staging, with timestamps
- [ ] **Detected through your own dashboard or alert** — not by knowing you caused it. If your observability didn't catch it, that's finding number one.
- [ ] `postmortems/NNN-<slug>.md` — timeline, impact with numbers, root cause, contributing factors, fix, prevention, and what you'd have needed to catch it in one minute instead of twenty
- [ ] The prevention is implemented and committed, not just recommended

**JUDGED ON** Realism · detection through your own tooling · root-cause depth · implemented
prevention · writing quality

**WHY** Small, and the highest senior-signal per hour on the whole path. It comes up in
every interview you take.

---

## P5.3 — "Eval harness library" · M · optional

Extract your eval code into a small open-source library: dataset loading and versioning,
retrieval metrics, LLM-judge scaffolding with calibration helpers, test-framework
integration, and a CI reporter that posts scores on a pull request. Docs, types, tests,
published.

**WHY** A published library with real docs compounds, and giving your metrics an API forces
you to understand them properly.

---

## P6.1 — CAPSTONE: AI Hiring Copilot *(working title — you name it)* · XL · THE FLAGSHIP

**CONTEXT** Hiring is broken at both ends. Candidates send 200 applications into a void with
no idea why they're rejected. Recruiters read 900 resumes for 6 openings using keyword
search that misses anyone who phrased their skills differently.

**PROBLEM** Build the system that fixes matching for both sides — and make it survive real
users.

**SCOPE** — each piece reuses earlier work; this is integration, not fresh invention
1. **Resume understanding** — P2.2, hardened, with confidence scores and a human review queue
2. **Job description understanding** — requirements extracted, must-have separated from nice-to-have, and the seniority the posting is *actually* asking for
3. **Semantic matching** — hybrid retrieval both directions, reranked, with **an explanation of every match**: which requirement is met by which line of the resume
4. **Gap analysis** — "you're missing X and Y for this role; here are three specific things to build", grounded in the actual posting
5. **Interview prep** — questions from the specific posting and the candidate's actual experience, not generic lists
6. **Recruiter search** — natural-language candidate search with **per-tenant isolation**
7. **Observability, evals and a cost dashboard**

**CONSTRAINTS** **Multi-tenant with retrieval-level isolation**, and a test proving tenant A
can't reach tenant B's candidates · per-tenant budgets and rate limits · human-in-the-loop on
anything candidate-facing · a published cost-per-match ceiling · **no unexplained scores** —
every match cites the resume line and the requirement it's based on · real users, at least
ten, whose feedback you log and act on · **a fairness review**: document which signals you
deliberately excluded (name, gender, college tier, age proxies) and test that excluding them
doesn't change match scores.

**NON-GOALS** Payments. A mobile app. Scraping job boards. Training a model. ATS integration.

**ACCEPTANCE**
- [ ] Live, public, multi-tenant, with real users and usage data
- [ ] A tenant-isolation test in CI
- [ ] A 100-pair golden set (resume × posting, human-labelled match quality), with published metrics
- [ ] Every match explained, with citations on both sides
- [ ] The fairness review documented, with the exclusion tests passing
- [ ] Eval gate in CI, tracing, cost dashboard
- [ ] `ARCHITECTURE.md`, `RUNBOOK.md`, `EVALS.md`, and a written "what real users did that I didn't predict"
- [ ] A three-minute demo video and a written case study

**JUDGED ON** Real usage and what you did with the feedback · multi-tenant correctness ·
match quality and explainability · eval rigour · fairness handling · operations · docs

**WHY** A real problem, it exercises everything on the path, and the explainability and
fairness work shows judgement rather than plumbing. It's also demo-able to a recruiter —
which is the exact person you need to impress.

---

## P7.1 — Specialisation project · L

One project in your chosen specialisation (`02-ROADMAP.md` §6.2), scoped to what the job
descriptions you're actually interviewing for ask about. For example: a durable browser-use
agent with recovery · a GraphRAG system over a linked corpus · a self-hosted vLLM gateway
with routing, autoscaling and cost dashboards · an annotation and judge-calibration tool ·
three rapid client-style prototypes in different domains.

---

## If you only build four

Ranked by portfolio return:

1. **P3.1** — Document Intelligence with receipts. The results table is the differentiator.
2. **P4.1** — Support Ops Agent. Approval gates and the trace dashboard prove both halves of your stack.
3. **P5.1 + P5.2** — Production hardening and the postmortem. The senior signal.
4. **P6.1** — The capstone. The one you talk about for thirty minutes.

P1.x and P2.x are scaffolding: worth building, not necessarily worth showcasing.
**P4.2 — the MCP server — is small and punches far above its weight.** Build it even if you
skip everything else on this list.
