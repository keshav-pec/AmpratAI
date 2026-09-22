# 07 — Mini-Project Briefs

Every brief is written as a work ticket, not a tutorial (`05-PLATFORM-SPEC.md` §6.1).
**Rule applied throughout: the problem must be one a real person would pay to have solved.**
Built in your own IDE. Verified by `forge verify`. Not complete until deployed.

---

## MP-1.1 — "The Port"
**Month 1 · 12–16 h · tier S · core**

**CONTEXT** You have several working Express + MongoDB projects. You have zero Python
projects. Recruiters and interviewers cannot see transferable skill — they see "JS
developer".

**PROBLEM** Rebuild one of your existing Express + Mongo apps as FastAPI + Postgres,
feature-for-feature, with tests and containers. Pick the one with the most interesting
data model (not the simplest).

**CONSTRAINTS** Identical API surface — the same frontend must work against both, unchanged ·
async throughout · Alembic migrations, no hand-edited schemas · `ruff` + `pyright` clean ·
runs from `docker compose up` on a machine with only Docker installed.

**NON-GOALS** New features. New UI. Rewriting the frontend. Performance tuning.

**ACCEPTANCE**
- [ ] Every endpoint from the original returns the same shape (a contract test suite proves it)
- [ ] Mongo collections modelled relationally, with FKs and deliberate indexes
- [ ] `pytest` ≥ 70% coverage; async tests included
- [ ] `docker compose up` → app + Postgres healthy, migrations applied
- [ ] Deployed; public URL
- [ ] `PORT_NOTES.md`: 10 things that differed from Express, ranked by how much they surprised you

**RUBRIC** Correctness of contract parity 30 · schema/index quality 20 · async correctness 20 ·
tests 15 · container/deploy 10 · notes quality 5

**STRETCH** Add SSE to one endpoint. Add a `pytest` benchmark comparing the two stacks and
be honest about what's faster and why.

**WHY THIS PROJECT** It's the highest-leverage project on the whole roadmap and it looks
like the most boring. You aren't learning Python from scratch — you're re-expressing
something you already understand, which is how experienced engineers actually learn a
language fast. It also converts "MERN dev" into "polyglot backend dev" on your GitHub in
two weeks.

---

## MP-1.2 — "Async Harvester"
**Month 1 · 8–10 h · tier S · core**

**CONTEXT** A market-research team has 2,400 company URLs in a spreadsheet and needs the
title, meta description, careers-page link and last-modified date for each. Their current
script is sequential, takes 4 hours, dies halfway, and starts over from the top.

**PROBLEM** Build a resumable, concurrent harvester.

**CONSTRAINTS** ≤ 20 concurrent requests (be a good citizen) · per-request timeout 10 s ·
exponential backoff + jitter, max 4 attempts · idempotent writes (re-running must not
duplicate) · resumable after SIGKILL · structured JSON logs · a summary report at the end.

**NON-GOALS** A UI. A crawler that follows links. JavaScript rendering.

**ACCEPTANCE**
- [ ] 2,400 URLs (or a 500-URL public test set) processed in < 4 minutes
- [ ] `kill -9` mid-run, restart → resumes, no duplicate rows, no lost rows
- [ ] 30% of targets returning 429/500 → run still completes, failures recorded with reason
- [ ] `EXPLAIN ANALYZE` on the dedup query shows an index scan, not a seq scan
- [ ] Final report: succeeded / failed-by-reason / p50 + p95 latency / total wall time

**RUBRIC** Concurrency correctness 25 · resumability 20 · error taxonomy 20 · idempotency 15 ·
observability 10 · report 10

**WHY THIS PROJECT** Every pattern here — bounded concurrency, backoff with jitter,
idempotency, partial failure, resumability — is exactly what you need next month for
concurrent LLM calls, and in Month 3 for embedding a corpus. You are building Month 3's
ingestion pipeline without spending a rupee on tokens.

---

## MP-2.1 — "Chat, done properly"
**Month 2 · 16–20 h · tier S · core**

**CONTEXT** Every AI portfolio has a chat app, and every one of them looks identical:
non-streaming, one provider, no cost visibility, no failure handling. Interviewers have
seen 200 of them.

**PROBLEM** Build the version that answers the questions the other 200 can't:
what did that cost, what happens when the provider dies, and which prompt produced this?

**CONSTRAINTS** Three providers (Anthropic, OpenAI, Gemini) behind **one** internal
interface · true token streaming with working cancellation that stops upstream billing ·
every message row stores model, prompt version, input/output tokens, ₹ cost, latency,
TTFT · prompts live in `prompts/` under git with version tags · p95 TTFT < 1.5 s.

**NON-GOALS** Auth beyond a single user. RAG. Agents. Mobile app. Chat history search.

**ACCEPTANCE**
- [ ] Switch provider mid-conversation; history is preserved and correctly re-serialised for the new provider's format
- [ ] Cancel a stream → the upstream request is aborted (prove it: show token usage stopping in your logs, not just the UI)
- [ ] Per-message cost badge, and a session total in ₹
- [ ] Revoke the primary provider's API key → fallback chain serves a degraded answer, no 500
- [ ] Send a 200k-token input → graceful, explained rejection, not a stack trace
- [ ] Every stored message is traceable to the exact prompt version that produced it
- [ ] Deployed; public URL; 90-second demo video

**RUBRIC** Streaming + cancellation correctness 25 · provider abstraction quality 20 ·
cost instrumentation 20 · failure handling 20 · UI polish 10 · docs 5

**STRETCH** Regenerate with a different model and diff the two answers side by side.
Add prompt caching and show the cost drop in your own dashboard.

**WHY THIS PROJECT** The cost meter and the prompt-version trace are the two features that
make an interviewer ask a follow-up question. Your React skill makes them cheap to build
and they're the parts most AI engineers skip.

---

## MP-2.2 — "Structured Extraction Service"
**Month 2 · 12–16 h · tier S · core**

**CONTEXT** A 40-person recruitment agency receives ~900 resumes a month as PDFs and DOCX
in every imaginable layout. Two coordinators spend ~15 hours a week copying name, email,
phone, total experience, skills, current CTC, notice period and last three roles into a
spreadsheet. They make typos. They miss candidates. (This is `NexHireAI`'s actual core
problem — build it here at small scale.)

**PROBLEM** A service that takes a resume file and returns validated structured JSON, or an
explicit, actionable failure.

**CONSTRAINTS** A strict pydantic schema — no free-form dicts · dates normalised to ISO ·
skills mapped to a closed vocabulary, unknown skills bucketed to `other` with the raw
string kept · validation failure → one repair attempt with the error fed back, then a hard
structured failure · ₹ ceiling 0.60/resume · p95 < 8 s · never invent a field (a missing
phone number is `null`, never a plausible fabrication).

**NON-GOALS** Ranking candidates. JD matching (that's the capstone). A UI beyond a simple
upload page. Handling handwritten scans.

**ACCEPTANCE**
- [ ] 30-resume golden set (varied layouts: single-column, two-column, tables, a scanned one, a Hinglish one) with hand-labelled expected output, committed
- [ ] ≥ 90% field-level accuracy on the golden set
- [ ] **Zero fabricated fields** — a specific test asserts that a resume with no phone number returns `null` (this is the test that matters most; fabrication is worse than a gap)
- [ ] The repair loop measurably improves the pass rate — report both numbers
- [ ] `pytest` suite fails the build if accuracy drops below 88%
- [ ] Cost per resume reported from real instrumentation
- [ ] Deployed; public URL

**RUBRIC** Accuracy 25 · no-fabrication guarantee 20 · golden set quality 20 · repair loop 15 ·
cost discipline 10 · docs 10

**STRETCH** Add confidence scores per field and route low-confidence extractions to a human
review queue. That queue is a genuine product feature and a great UI to show off.

---

## MP-3.1 — "Document Intelligence, with receipts"
**Month 3 · 25–35 h · tier S · core · FLAGSHIP**

**CONTEXT** Pick one and commit to it (the messier the better):
- Your university's academic regulations + examination bylaws (~400 pages, students ask the same 30 questions every semester and nobody can find the answer)
- RBI master circulars on retail lending (~600 pages, cross-referencing, amendments)
- A health insurance policy wording set (~300 pages, exclusions buried in sub-clauses — people lose money over this)
- GST/Income-tax circulars for small businesses

**PROBLEM** Answer natural-language questions over this corpus with citations a sceptical
person can verify, and **prove** your retrieval is good with numbers.

**CONSTRAINTS** Citations must deep-link to page + section, and the UI must show the source
text · answers must say "not in these documents" rather than guess · p95 < 6 s end to end ·
₹ ceiling 1.50/query · re-ingest must be incremental (changing one PDF doesn't re-embed the
corpus) · multi-tenant-ready metadata even though you're single-tenant now.

**NON-GOALS** Agents. Multi-hop reasoning across unrelated corpora. Fine-tuning. Chat memory
beyond the current thread.

**ACCEPTANCE**
- [ ] ≥ 50 hand-written golden questions with known correct source sections, committed
- [ ] **A results table with ≥ 6 pipeline versions**, each with recall@5, faithfulness, p95 latency and ₹/query:
      `v1 baseline` → `v2 chunking` → `v3 hybrid+RRF` → `v4 rerank` → `v5 contextual retrieval` → `v6 query rewriting`
- [ ] Eval suite in GitHub Actions; a deliberately-bad PR demonstrably fails the gate
- [ ] Every answer carries ≥ 1 verifiable citation; a randomly sampled 20 are manually confirmed correct
- [ ] Abstains correctly on 10 out-of-corpus questions (this is a scored acceptance criterion, not a nice-to-have)
- [ ] Incremental re-ingest proven: change one page, show only the affected chunks re-embedded
- [ ] Hand error-analysis of 20 failures, categorised, written up
- [ ] Deployed; public URL; demo video

**RUBRIC** Eval rigour 30 · retrieval quality 20 · citation correctness 15 · abstention
behaviour 10 · ingestion engineering 10 · UI 10 · docs 5

**STRETCH** Table-aware extraction so numeric questions work. A "compare across documents"
mode. Hindi query support with English documents.

**WHY THIS PROJECT** The results table *is* the portfolio piece. Anyone can say "I built
RAG". Almost nobody can say "reranking moved recall@5 from 0.61 to 0.89 and cost me 240 ms
and ₹0.20 a query" — and that sentence is the entire difference between a hobbyist and a
hire.

---

## MP-3.2 — "Ask My Repo" `[STRETCH]`
**Month 3 · 10–14 h · tier A · stretch**

**CONTEXT** You have a dozen repos and you can't remember how you did auth in the third one.

**PROBLEM** RAG over your own GitHub repos with code-aware chunking and `file:line` citations.

**CONSTRAINTS** AST-aware chunking (function/class boundaries, not character counts) ·
metadata: repo, path, language, symbol name, line range · answers cite clickable
`repo/path#L12-L48` · handles a 50k-file monorepo without re-embedding on every commit.

**ACCEPTANCE** Answers "how did I implement X" across repos with correct citations ·
20-question golden set · incremental indexing on git diff · deployed.

**WHY** Code chunking is a genuinely different problem from prose chunking, and it comes up
constantly in interviews at companies building dev tools — which is a large share of the
Indian AI hiring market.

---

## MP-4.1 — "Support Ops Agent"
**Month 4 · 25–35 h · tier A · core · FLAGSHIP**

**CONTEXT** A D2C brand's two-person support team handles ~300 tickets a day. 60% are the
same five questions ("where is my order", "I want a refund", "wrong size"). Each needs the
order looked up, the policy checked, and a reply written. It takes 6 minutes. They want
2 minutes, and they are (correctly) terrified of an AI auto-refunding ₹40,000 at 3am.

**PROBLEM** An agent that does the whole workflow and **stops for human approval** before
anything consequential.

**CONSTRAINTS** Tools: `lookup_order`, `get_customer_history`, `search_policy` (your Month 3
RAG), `draft_reply`, `issue_refund` (**approval-gated, hard ₹ cap**), `escalate` · step
budget 12, ₹ budget 8/ticket, wall-clock 60 s · every action audit-logged with the
reasoning that produced it · runs resumable after a server restart (Postgres checkpointing) ·
retrieved policy text and tool results treated as untrusted data, never as instructions.

**NON-GOALS** Actually sending emails to real customers. Multi-agent architecture. Voice.
Training a model.

**ACCEPTANCE**
- [ ] 30 scenario fixtures (happy path, out-of-policy refund, missing order, abusive message, ambiguous request, **a ticket containing a prompt-injection attempt**) with expected action sequences
- [ ] Agent eval suite reports action-sequence accuracy honestly, including the failures
- [ ] Never issues a refund without approval — a test asserts this, and a second test asserts it under an injection attempt
- [ ] Interrupt/resume works across a process restart
- [ ] Loop detection: same tool + same args 3× → intervenes
- [ ] Budget exhaustion → graceful escalation to human, not a crash
- [ ] **React trace dashboard**: live reasoning stream, tool timeline with args/results/duration/₹, approval modal, interrupt button, full run replay
- [ ] Both a from-scratch loop version and a LangGraph version in the repo, with a README comparing them
- [ ] Deployed; public URL; demo video showing an approval and a rejection

**RUBRIC** Safety/approval correctness 25 · agent eval rigour 20 · trace dashboard 20 ·
resumability 15 · injection resistance 10 · docs 10

**WHY THIS PROJECT** Two things here are rare: the approval gate with durable state, and the
trace dashboard. The video's point about the full-stack premium is *this project*. A
Python-only engineer ships a CLI with print statements; you ship something a support
manager could actually use tomorrow.

---

## MP-4.2 — "Your MCP Server"
**Month 4 · 10–14 h · tier A · core**

**CONTEXT** MCP is infrastructure now — Anthropic built it, the Linux Foundation stewards
it, every major vendor adopted it. Almost no Indian candidate has built one. That asymmetry
will not last long; exploit it now.

**PROBLEM** Build, test, publish and document an MCP server that solves a real problem.

Pick one:
1. **Read-only Postgres explorer** — schema introspection, safe parameterised queries, row limits, a hard query timeout, a denylist. Genuinely useful and a clean security story.
2. **Forge tutor server** — exposes your learning platform's curriculum, notes and progress so Claude can tutor you from your real state. Delightfully recursive, and it makes the platform demo-able.
3. **Project-context server** — your repos, open issues, deploy status, and recent incidents as MCP resources.

**CONSTRAINTS** Python SDK · tools **and** resources (most servers only do tools — doing both
shows you read the spec) · stdio + streamable HTTP transports · input validation on every
tool · errors returned as structured tool results, never raised · published to PyPI with a
one-line install · tool descriptions written as prompts, with units.

**ACCEPTANCE**
- [ ] Installable by a stranger in one command, from your README alone
- [ ] Works in Claude Code and Claude Desktop (screenshots of both)
- [ ] `tools/list` and `resources/list` both populated and correct
- [ ] Tests covering the protocol surface, not just the business logic
- [ ] Large results truncated with a "refine your query" hint, not dumped into context
- [ ] `SECURITY.md`: threat model, what the server can and cannot reach, why
- [ ] Demo GIF of it working inside Claude Code

**RUBRIC** Protocol correctness 25 · security model 20 · usefulness 20 · docs/installability 20 ·
tests 15

**WHY** "I published an MCP server, here's the install command" ends a conversation about
whether you're current. Also: publishing anything to a package registry is a credibility
step most learners never take.

---

## MP-5.1 — "Production Hardening"
**Month 5 · 30–40 h · tier A · core · FLAGSHIP**

**CONTEXT** You have three projects that work on your machine and a PaaS. None of them
would survive a Hacker News front page, a malicious user, or a finance team asking what
they cost.

**PROBLEM** Take MP-3.1 **or** MP-4.1 to genuine production grade, and produce the numbers.

**CONSTRAINTS** Real cloud (AWS ECS/Fargate or GCP Cloud Run), containerised, IaC-light ·
managed Postgres + pgvector, Redis, object storage · queue + workers for ingestion and
agent runs · Langfuse tracing on every LLM call, retrieval and tool call · caching: prompt
cache + exact + semantic · per-tenant rate limits and ₹ budgets with a kill switch ·
CI/CD with an eval gate · load-tested with `k6`.

**ACCEPTANCE**
- [ ] `ARCHITECTURE.md` with a diagram and every component's purpose
- [ ] **A results table:** p95 latency before/after · ₹/request before/after · cache hit rate · load-test RPS ceiling and the failure mode at the ceiling
- [ ] Cost reduced by ≥ 40% via caching + routing, with the working shown
- [ ] Langfuse dashboard screenshots: cost/day by feature, p95 by endpoint, quality trend
- [ ] Rate limiting demonstrated under load; budget kill switch demonstrated
- [ ] CI pipeline: lint → typecheck → test → eval gate → build → staging → smoke → prod, with a demonstrated rollback
- [ ] `RUNBOOK.md`: how to diagnose slow responses, cost spikes, bad answers, a stuck queue — with the actual queries and dashboard links
- [ ] OWASP LLM Top 10 reviewed against this codebase; ≥ 3 real fixes committed with links

**RUBRIC** Real numbers 25 · architecture quality 20 · observability 20 · CI/eval gate 15 ·
security fixes 10 · runbook 10

**WHY** This is the project that makes you interview as a mid-level engineer rather than a
career-switcher. The runbook in particular: candidates with runbooks have operated
something.

---

## MP-5.2 — "Break it and write it up"
**Month 5 · 6–8 h · tier A · core**

**CONTEXT** Nothing on your CV says you've survived something going wrong. Interviewers
probe exactly there, because it's the fastest way to distinguish shipped-to-production from
shipped-to-localhost.

**PROBLEM** Deliberately cause a realistic incident in your own staging environment, detect
it through your own dashboards, fix it, and write a real postmortem.

Pick two and run them for real:
| Incident | Injection | What you should learn |
|---|---|---|
| Retry storm | Remove jitter, make the provider fail | How a self-inflicted DDoS feels |
| Cost spike | Remove the cache, loop a 30k-token prompt | How fast ₹ moves when nobody's watching |
| Context overflow | Never compact agent history | The turn-12 cliff |
| Indirect injection | Plant an instruction in a RAG document | Why permissions, not prompts, are the boundary |
| Tenant leak | Drop the `tenant_id` filter | The one-line bug that ends companies |
| Silent quality collapse | Ship a "harmless" prompt edit | Why you needed the eval gate |

**ACCEPTANCE**
- [ ] The incident is real, in staging, with timestamps
- [ ] **Detected via your own dashboard/alert**, not by knowing you caused it — if your observability didn't catch it, that's the first finding
- [ ] `postmortems/NNN-<slug>.md`: timeline, impact (with numbers), root cause, contributing factors, fix, prevention, and what you'd have needed to catch it in 1 minute instead of 20
- [ ] The prevention is implemented and committed, not just recommended

**RUBRIC** Realism 25 · detection via own tooling 25 · root-cause depth 20 · implemented
prevention 20 · writing quality 10

**WHY** Per the roadmap's rule 4: building teaches the happy path, breaking teaches the
system. This is also the cheapest senior-signal on the entire roadmap — eight hours for a
document that will come up in every interview you take.

---

## MP-5.3 — "Eval harness library" `[STRETCH]`
**Month 5 · 12–16 h · tier B · stretch**

Extract your eval code into a small OSS library: dataset loading/versioning, retrieval
metrics, LLM-judge scaffolding with calibration helpers, `pytest` integration, a CI
reporter that comments scores on a PR. Docs, types, tests, a real README, published.

**WHY** A published library with real docs is a portfolio item that compounds. It also
forces you to understand your metrics well enough to give them an API.

---

## MP-6.1 — CAPSTONE: `NexHireAI`
**Month 6 · 80–120 h · core · THE FLAGSHIP**

**CONTEXT** Indian hiring is broken at both ends. Candidates send 200 applications into a
void with no idea why they're rejected. Recruiters read 900 resumes for 6 openings using
keyword search that misses anyone who phrased their skills differently.

**PROBLEM** Build the system that fixes the matching problem for both sides — and make it
survive real users.

**SCOPE** (each piece reuses a prior month's work — this is integration, not fresh invention)
1. **Resume understanding** — MP-2.2, hardened; confidence scores; human review queue
2. **JD understanding** — extract requirements, separate must-have from nice-to-have, infer the seniority the JD is *actually* asking for
3. **Semantic matching** — hybrid retrieval both directions (candidate→JD, JD→candidate), reranked, with **an explanation of every match**: which requirement is met by which line of the resume
4. **Gap analysis agent** — "you're missing X and Y for this role; here are three specific things to build", grounded in the actual JD
5. **Interview prep generator** — questions derived from the specific JD + the candidate's actual experience, not generic lists
6. **Recruiter search** — natural-language candidate search with **per-tenant isolation**
7. **Full observability + eval suite + cost dashboard**

**CONSTRAINTS** **Multi-tenant with retrieval-level isolation** (and a test proving tenant A
cannot retrieve tenant B's candidates) · per-tenant ₹ budgets and rate limits ·
human-in-the-loop on any candidate-facing communication · ₹/match ceiling, published ·
every match explanation must cite the resume line and JD line it's based on — **no
unexplained scores** · real users: ≥ 10 people using it, whose feedback you log and act on ·
**fairness/bias review**: document what signals you deliberately excluded (name, gender,
college tier, age proxies) and test that excluding them doesn't change match scores

**NON-GOALS** Payments. A mobile app. Scraping job boards. Training your own model.
An ATS integration.

**ACCEPTANCE**
- [ ] Live, public, multi-tenant, with real users and usage data
- [ ] Tenant-isolation test in CI
- [ ] ≥ 100-pair golden set (resume × JD with human-labelled match quality); published metrics
- [ ] Every match explained with citations on both sides
- [ ] Bias review documented with the exclusion tests passing
- [ ] Eval gate in CI; Langfuse tracing; cost dashboard
- [ ] `ARCHITECTURE.md`, `RUNBOOK.md`, `EVALS.md`, and a written "what real users did that I didn't predict"
- [ ] 3-minute demo video; a written case study

**RUBRIC** Real usage + feedback loop 20 · multi-tenant correctness 15 · match quality +
explainability 20 · eval rigour 15 · fairness handling 10 · ops/observability 10 · docs 10

**WHY** It's a real problem, it's your repo, it exercises every skill on the map, and the
explainability + fairness work is the kind of judgement that distinguishes an engineer from
a prompt-plumber. Also: **a hiring product that you can demo to a recruiter is a
conversation-starter with the exact person you need to impress.**

---

## MP-7.1 — Specialisation project
**Month 7 · 30–50 h · core**

One project in your chosen spike (`02-ROADMAP.md` M6.2), scoped to what the JDs you're
actually interviewing for ask about. Examples: a durable browser-use agent with
recovery (agentic) · a GraphRAG system over a linked corpus (context engineering) ·
a self-hosted vLLM gateway with routing, autoscaling and FinOps dashboards (LLMOps) ·
an annotation + judge-calibration platform (evals) · three 48-hour client prototypes in
different domains (forward-deployed).

---

## Selection guide — if you can only build four

Ranked by portfolio return per hour:

1. **MP-3.1** Document Intelligence with receipts — the eval table is the differentiator
2. **MP-4.1** Support Ops Agent — approval gates + trace dashboard prove both halves of your stack
3. **MP-5.1 + MP-5.2** Production hardening + postmortem — the senior signal
4. **MP-6.1** Capstone — the one you talk about for 30 minutes

MP-1.1, MP-1.2 and MP-2.x are scaffolding: essential to *build*, not necessarily to
*showcase*. MP-4.2 (the MCP server) is small and punches far above its weight — build it
even if you skip everything else in this list.
