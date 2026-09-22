# 09 — Roles, Positioning, Interviews, Applications

> **Source note on the numbers.** The salary bands and market claims in §1–§2 are the
> reference video's figures for the Indian market, reported as *its* claims — I have not
> independently verified them, and you shouldn't treat them as data. Verify against live
> JDs, Levels.fyi, AmbitionBox and actual recruiter conversations before you anchor a
> negotiation on any number here. The *shape* of the market (which roles exist, what they
> ask for) is the useful part; the digits are directional at best.

---

## 1. The six roles hiding behind "AI Engineer"

People say "AI engineer" and mean six different jobs. Read JDs for which one they mean —
the skills overlap ~70% but the interviews and the day job don't.

| Role | What you actually do | What they interview | Video's band |
|---|---|---|---|
| **Agentic AI Engineer** | Build agents that reliably take actions | Tool use, orchestration, failure handling, durable execution, agent evals | 15–55 LPA |
| **LLMOps Engineer** | Deploy, monitor, scale LLM systems. DevOps for AI | Containers, K8s, gateways, caching, cost, observability, incident response | high hiring volume |
| **Forward-Deployed AI Engineer** | Build AI solutions on-site, with the client | Rapid prototyping, requirement translation, demo craft, communication | 18–90 LPA |
| **Context Engineer** | Decide what information reaches the model at each step | RAG depth, memory architecture, token budgeting, retrieval evals | new title, rising |
| **AI Evals Engineer** | Build the testing frameworks for AI quality | Judge design/calibration, error analysis, statistics, annotation tooling | specialised, scarce |
| **Full-Stack AI Engineer** ← *you* | The AI backend **and** the interface | Everything above, plus streaming UI, dashboards, product sense | premium (rare profile) |

**Your positioning decision:** lead with **Full-Stack AI Engineer**, and tune the emphasis
per application. Against an agentic JD, lead with MP-4.1's approval gates and trace
dashboard. Against an LLMOps JD, lead with MP-5.1's numbers and runbook. Same evidence,
different order.

## 2. Compensation, honestly

Video's claimed bands: GenAI engineers 20–70 LPA · traditional ML engineers 10–40 LPA ·
backend developers 8–25 LPA. Its core argument — *same person, different skills, different
band* — is the part I'd agree with regardless of the exact digits.

What actually moves your band, in order:
1. **Evidence of shipping to production** — deployed, instrumented, load-tested, with a runbook
2. **Evals** — because it proves you've operated something real, and almost nobody has it
3. **Full-stack range** — you cover two headcount's worth of surface area
4. **Domain fit** — an AI hiring product on your GitHub applying to an AI hiring company is not a coincidence you should leave to chance
5. **Communication** — forward-deployed roles pay the most in the list above and interview hardest on this
6. Years of experience — matters least in this specific market, which is the opportunity

Realistic expectation-setting: a strong portfolio from this roadmap puts you in
conversations for product-company AI roles rather than service-company generalist roles.
Anyone promising a specific number for a specific person is guessing.

## 3. Positioning assets (Month 6 deliverables)

### GitHub
- Profile README that reads as an engineer's, not a learner's: three flagship projects with one-line outcomes and live links, the MCP server install command, a link to your writing
- Each flagship repo: `README.md` (problem → architecture diagram → **results table** → tradeoffs → "what I'd do differently"), `ARCHITECTURE.md`, `EVALS.md`, `RUNBOOK.md`, a 90-second demo video
- Pinned in the order you want them read
- **Delete or archive the tutorial-follow-along repos.** They dilute the signal.

### LinkedIn
- Headline: `Full-Stack AI Engineer · RAG, Agents, MCP · Python + React`
- About: three paragraphs — what you build, the evidence (with numbers), what you're looking for. No "passionate about leveraging cutting-edge AI".
- Featured: the three flagship demos
- Post cadence: 1–2/week from Month 2 onward. **Start before you feel ready** — by Month 6 you want 30+ posts of history, because a profile that started posting last week reads as job-hunting, and one with a year of build logs reads as an engineer.
- What to post: the specific problem you hit this week and how you fixed it. "Reranking moved recall@5 from 0.61→0.89, cost +240ms and ₹0.20/query" outperforms every "excited to share my AI journey" post ever written.

### Personal site
You're a React developer — this should be embarrassingly good, and the AI demos should be
**embedded and interactive**, not screenshots. A recruiter who can type a question into
your RAG system on your own site is a recruiter who remembers you.

### Writing (the most underrated asset here)
8–12 technical posts, one per hard problem. Titles that are claims with numbers, not topics.
Cross-post to your site + LinkedIn + dev.to. One good post gets you more inbound than 100
applications, and writing them is how you find out which parts you only *thought* you
understood.

## 4. The interview question bank

Answer every one of these **from your own projects**, out loud, before you apply. If an
answer has no project behind it, that's a gap in your portfolio, not just your prep.

### LLM fundamentals
1. What is a token? Why does the same information cost more tokens as JSON than as prose?
2. Walk me through what happens between my `POST` and the first streamed token.
3. Temperature vs top_p. When do you use each, and what do you set for extraction?
4. Why do models hallucinate? Which mitigations actually work, and which just feel good?
5. How do you count tokens *before* sending, and why does it matter?
6. What's in the context window on turn 12 of a long agent run, and who decided that?
7. Prompt caching: how does it work, and how do you restructure a prompt to exploit it?
8. When would you use a reasoning model, and when is it a waste of money?

### Prompting & structured output
9. How do you get reliable JSON out of an LLM? Three mechanisms, ranked, with tradeoffs.
10. Your extractor returns valid JSON with a fabricated phone number. How do you fix that?
11. How do you version prompts? How do you A/B test one in production?
12. Same prompt, different provider, different behaviour. What do you do?
13. Design a system prompt for a refund-policy assistant. What's the escape hatch and why?
14. Few-shot: how many examples, chosen how?

### RAG (expect the most depth here)
15. Draw a production RAG pipeline. Now tell me which stage fails most often.
16. RAG vs long context vs fine-tuning — decide, with numbers.
17. How do you chunk a 900-page regulatory PDF with tables and numbered sections?
18. What metadata do you attach to every chunk, and what does each field buy you?
19. Why does hybrid search beat vector-only? Give a query where vector search fails.
20. What does a reranker do that the retriever can't? What does it cost?
21. **How do you know your retrieval is good?** (The question. Have the table ready.)
22. recall@k vs precision@k vs MRR vs nDCG — which do you optimise and why?
23. Your users say it "feels worse" this week. Nothing was deployed. Diagnose it.
24. How do you handle a question the corpus can't answer?
25. Multi-tenant RAG: how do you guarantee tenant A never retrieves tenant B's data?
26. A document is updated. What re-embeds, and how do you avoid re-embedding everything?
27. Embedding model choice: how did you pick, and what would make you switch?
28. What is "lost in the middle" and what did you do about it?

### Agents & tools
29. What makes something an agent rather than a chatbot?
30. Walk me through one full tool-calling round trip. Who executes the tool?
31. Your agent loops forever. Detect it, stop it, and prevent it.
32. Design the safety model for an agent that can issue refunds.
33. When is multi-agent the right answer? (Correct answer: rarely. Say why.)
34. How do you make an agent run survive a server restart mid-execution?
35. Short-term vs long-term memory. What do you write, what do you retrieve, what do you forget?
36. What is MCP and what problem does it solve? How is it different from A2A?
37. A retrieved document contains "ignore previous instructions". What happens in your system?
38. How do you evaluate an agent? (Hint: trajectories, not just final answers.)

### System design & production
39. Design an enterprise document QA system for 10k employees and 2M documents.
40. Now give me its latency budget and its monthly cost, with your assumptions.
41. Where do you cache, at how many layers, and what's the invalidation story for each?
42. Your LLM provider has a 40-minute outage. What do users see?
43. How do you rate-limit per tenant when one request can cost 200× another?
44. Costs tripled overnight with flat traffic. Walk me through the investigation.
45. What do you trace on every request, and what dashboard do you open first?
46. Your p95 is 11s and the target is 4s. Where do you look, in what order?
47. How do you ship a prompt change safely to 100% of traffic?
48. What's in your CI pipeline for an AI service that isn't in a normal web service's?
49. Sync vs async vs streaming: when does each fit, and what breaks at scale?

### Evals & quality
50. What's in your golden set, who wrote it, and how big is it?
51. LLM-as-judge: how do you know the judge is any good?
52. Which biases does your judge have, and how did you measure them?
53. How does an eval gate block a merge? What threshold, and who set it?
54. Offline scores are up, users are complaining. Reconcile that.
55. How do you capture and use user feedback as eval data?

### Security & ethics
56. Prompt injection: direct vs indirect. Why can't you fully fix it?
57. Your agent can read email and browse the web. What's the exfiltration path?
58. What PII do you log, and what's your retention policy?
59. Your hiring product scores candidates. What signals did you exclude and how did you test that exclusion?
60. A user asks your support bot something harmful. What happens, at which layer?

### About you
61. Tell me about something you built that broke in production. (Your postmortem. This is why MP-5.2 exists.)
62. What did you believe three months ago that you now think was wrong?
63. Why not just use a bigger model / a framework / long context? (Tests whether you have judgement or habits.)

## 5. Where to apply

**Tier A — AI-first product companies & well-funded startups.** Highest learning, best
comp, hardest bar. India: Sarvam, Krutrim, CoRover, and the AI teams at Razorpay, Zerodha,
Zoho, Freshworks, Postman, Atlassian India, Uber India, Swiggy, Meesho, PhonePe, Flipkart,
plus the large GCCs (Google, Microsoft, Amazon, Adobe, Salesforce, Atlassian). Watch the
YC/Accel/Sequoia India batch lists for pre-PMF teams hiring AI generalists — a seed-stage
AI startup is the fastest place to become genuinely good.

**Tier B — consultancies & services with real AI practices.** EY, Deloitte, Accenture,
Thoughtworks, and the AI arms of the big Indian services firms. The video notes these
firms began posting agentic-AI roles that didn't exist in their pipelines two years ago.
Less depth per project, enormous breadth, good for forward-deployed skills. A genuinely
good on-ramp if Tier A doesn't bite in month one.

**Tier C — global remote.** AI-native startups hiring remotely. Pays in a different
currency, interviews in English, values a public portfolio and writing more than a degree.
Your writing from Month 6 is the whole strategy here.

**Avoid:** "AI engineer" titles that are actually prompt-copy-paste roles with no
engineering. Screen for it: *"What does the AI system you'd put me on look like in
production? What's in your eval suite? Who owns cost?"* No good answer → it's a chatbot
wrapper and a dead end. Also avoid anywhere that wants to pay you in "exposure to AI".

## 6. Running applications as a pipeline

Target mix: **60% referral/warm outreach · 30% direct application · 10% inbound.**

Mass-applying to 200 postings for "14 LPA" is the first half of the video's opening
contrast. Being the person a recruiter calls is the second half. The difference is that the
second person has a public, verifiable body of work — which is precisely what Month 6
produces.

### Weekly cadence (Months 6–7)
- 5 targeted applications (each with a tailored 3-line note and the *right* project linked first)
- 5 warm outreach messages to engineers (not recruiters) at target companies
- 1 published post
- 1 mock interview
- Debrief every real round in writing within 2 hours, then fix the specific gap it exposed *before* the next round

### Outreach that works
Short, specific, and leads with a working thing:

> Hi <name> — I saw <company> is building <specific thing>. I built a <one-line
> description> that handles <the specific hard part>: <live link>. The interesting problem
> was <one sentence about a real tradeoff you made>. If you're hiring for AI engineering
> I'd love 15 minutes; if not, I'd still value your read on <specific technical question>.

Why it works: it's checkable in 30 seconds, it asks a small thing, and the technical
question makes replying interesting rather than obligatory. Never attach a resume to a
first message.

### Tracking
A table (or a `NexHireAI` dogfood): company, role archetype, source, date, contact, stage,
next action, notes. Review every Monday. A pipeline with 5 companies isn't a pipeline.

## 7. Offers & negotiation

- Know your band before the first call; never give the first number (*"I'd rather hear the range you've budgeted for the level"*)
- Interview them back: what fraction of the role is real AI engineering vs support work? Who owns the eval suite? What's the AI infra budget? Is there a production system or a pilot deck?
- Compare total comp, but weight **what you'll learn in the next 18 months** heavily — in a field moving this fast, the role that makes you better is worth more than ₹3 LPA
- Get everything in writing before you resign anything
- A title with no real AI work is a trap even at a good number. Two years of prompt-tweaking in a role called "AI Engineer" is worse for your career than one year of genuine engineering in a role called "Backend Engineer".

## 8. The one-paragraph pitch (write this in Month 6, refine it monthly)

> I'm a full-stack AI engineer. I came from MERN, so I build the AI backend in Python —
> retrieval, agents, evals, the production plumbing — and the interface in React, which
> most AI engineers can't. Three things I'd point you at: a document-intelligence system
> where I moved retrieval recall@5 from 0.61 to 0.89 and can tell you exactly what each
> change cost in latency and rupees; a support agent with durable human-approval gates and
> a live trace dashboard; and an MCP server you can install in one command. I also have a
> postmortem from the time I broke my own production system, which I'd rather talk about
> than any of the successes.

That last sentence is the one that gets you hired.
