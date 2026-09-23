import type { Topic } from '@/lib/types';

export const s3_7: Topic[] = [
  {
    id: 's3.7.t1',
    moduleId: 's3.7',
    title: 'The token budget',
    outcome: `You can split a request's tokens between instructions, history, retrieved text, the question and the answer — and pack retrieved chunks into their share without overflowing or wasting it.`,
    minutes: 30,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
    ],
    animations: ['anim-context-budget'],
    analogy: `A monthly salary. Rent, food, travel and savings all come out of one number, and you
decide each share before the month starts — not when the money runs out on the 25th. A
prompt is the same: one budget, planned shares.`,
    notes: `## One budget, five shares

| Share | Typical size | Notes |
|---|---|---|
| System prompt | 500–1,500 | stable; cache it |
| Conversation history | 0–4,000 | compacted (topic 4) |
| **Retrieved context** | 2,000–8,000 | the share you tune |
| The question | 20–200 | |
| Reserved for the answer | \`max_tokens\` | set it deliberately |

The model's window (200K for Haiku 4.5, 1M for Sonnet 5 and Opus 5) is rarely the limit.
**Cost and latency** are: every extra thousand tokens is paid on every question and adds to
the time before the first word.

---

## Choosing the retrieved share

More context isn't automatically better:

- too little → the evidence doesn't fit
- too much → cost and latency rise, and the answer gets diluted by near-misses

Pick it from your golden set: measure recall and faithfulness at budgets of, say, 2K, 4K and
8K tokens, and take the smallest budget that's within a point or two of the best.

---

## Packing chunks into the share

\`\`\`python
def pack(chunks, budget: int, count_tokens) -> list:
    picked, used = [], 0
    for c in chunks:                      # already in rank order
        n = count_tokens(c.text)
        if used + n > budget:
            continue                      # skip it; a smaller one may still fit
        picked.append(c)
        used += n
    return picked
\`\`\`

Then **merge neighbours**: two picked chunks that are adjacent in the same section become
one passage — no repeated overlap text, and a complete thought for the model.

---

## Counting tokens

- For budgeting inside your code, an estimate is fine — but estimate per model: Claude
  Sonnet 5's tokenizer produces roughly 30% more tokens than Sonnet 4.6 for the same text.
- For exact numbers (and to calibrate your estimate), the API's token-counting endpoint
  counts a full request, free.
- After each call, log \`usage.input_tokens\` and \`usage.output_tokens\`. Your real budget is
  what the logs say, not what you planned.

---

## Reserve the answer

\`max_tokens\` is part of the plan. Too low and answers get cut off mid-sentence (check
\`stop_reason == "max_tokens"\` and handle it); too high only matters for your worst case. Pick
it from the length of good answers in your golden set, with headroom.`,
    docs: [
      {
        label: 'Anthropic — context windows',
        url: 'https://platform.claude.com/docs/en/build-with-claude/context-windows',
      },
      {
        label: 'Anthropic — token counting',
        url: 'https://platform.claude.com/docs/en/build-with-claude/token-counting',
      },
    ],
    glossary: [
      {
        term: 'token budget',
        def: 'The planned split of a request\'s tokens between its parts.',
      },
      {
        term: 'max_tokens',
        def: 'The most tokens the model may write in its answer.',
      },
      {
        term: 'packing',
        def: 'Choosing which retrieved chunks fit into the context budget.',
      },
      {
        term: 'time to first token',
        def: 'How long before the first word of the answer appears; grows with input size.',
      },
    ],
    check: [
      {
        q: 'What usually limits the context you send — the window or something else?',
        a: `Cost and latency. Windows are very large now; every extra token is paid on every question and delays the first word.`,
      },
      {
        q: 'Why does the packing loop `continue` instead of `break` when a chunk doesn\'t fit?',
        a: 'A later, smaller chunk may still fit in the remaining budget.',
      },
      {
        q: 'Why merge adjacent chunks after packing?',
        a: 'It removes duplicated overlap text and gives the model one complete passage instead of fragments.',
      },
      {
        q: 'How do you know your real token usage?',
        a: 'Log `usage.input_tokens` and `usage.output_tokens` from each response.',
      },
    ],
    practice: [
      {
        mode: 'primitive',
        title: 'Pack and merge',
        body: `Without AI: extend \`pack()\` so that, after picking, it merges chunks that are adjacent
(\`chunk_index\` differs by 1) within the same \`document_id\`, joining their text and keeping
the lowest rank of the pair for ordering. Chunks have \`document_id\`, \`chunk_index\`,
\`rank\`, \`text\`.`,
        answer: `\`\`\`python
def merge_adjacent(picked: list) -> list[dict]:
    ordered = sorted(picked, key=lambda c: (c.document_id, c.chunk_index))
    merged: list[dict] = []
    for c in ordered:
        last = merged[-1] if merged else None
        if (last and last["document_id"] == c.document_id
                and c.chunk_index == last["end_index"] + 1):
            last["text"] += "\\n" + c.text
            last["end_index"] = c.chunk_index
            last["rank"] = min(last["rank"], c.rank)
        else:
            merged.append({"document_id": c.document_id, "start_index": c.chunk_index,
                           "end_index": c.chunk_index, "rank": c.rank, "text": c.text})
    return sorted(merged, key=lambda m: m["rank"])   # back to relevance order
\`\`\`

Two details:

- If your chunks overlap, joining them repeats the overlap text. Store each chunk's
  character offsets and join on the source text instead, or trim the known overlap.
- Keep \`start_index\`/\`end_index\` — citations for a merged passage should cover the range.`,
      },
      {
        mode: 'tool',
        title: 'Find your budget',
        body: `Run your golden set with retrieved-context budgets of 1K, 2K, 4K and 8K tokens (packing
reranked chunks). Record recall at that budget, faithfulness, p95 latency and cost per
question.`,
        answer: `Your table:

| Budget | recall | faithfulness | p95 | cost / question |
|---|---|---|---|---|
| 1K | | | | |
| 2K | | | | |
| 4K | | | | |
| 8K | | | | |

Typical shape: recall rises and then flattens; faithfulness is often flat or even dips at
the largest budget (more near-miss text to embellish from); latency and cost rise steadily.
With a good reranker the knee often comes early.

Choose the smallest budget near the best recall and faithfulness, and write down *why* —
the reasoning is part of the p-3.1 story.`,
      },
    ],
  },
  {
    id: 's3.7.t2',
    moduleId: 's3.7',
    title: 'Ordering and prompt layout',
    outcome: `You can lay out retrieved documents so the model uses them well: few and relevant, clearly labelled, most relevant first, and the question at the end.`,
    minutes: 30,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
    ],
    animations: ['anim-lost-in-middle'],
    analogy: `Briefing a colleague before a meeting. You hand them three labelled pages with the key one
on top, and then ask your question — not a 40-page stack with the question buried on page 12.`,
    notes: `## Lost in the middle

A 2023 study, *Lost in the Middle*, found that models used information at the **start and
end** of a long context noticeably better than information in the **middle** — accuracy
followed a U shape as the key passage moved through the context.

Newer models are much better at this, but long inputs still degrade quality (Chroma's 2025
"context rot" research). The practical lesson hasn't changed: **don't bury the evidence.**

---

## Four layout rules

1. **Send fewer, better chunks.** Rerank, then keep 5–8. Twenty loosely related chunks put
   the good one "in the middle" by definition.
2. **Most relevant first.**
3. **Documents at the top, question at the end.** Anthropic's guidance reports that putting
   the query after long documents can improve response quality by up to 30% in their tests.
4. **Label everything** — source, section, date — so the model can tell passages apart and
   cite them.

---

## A layout that works with Claude

\`\`\`text
<documents>
  <document index="1">
    <source>Leave Policy 2025 › Probation (page 4)</source>
    <document_content>
    During probation, employees may not take earned leave...
    </document_content>
  </document>
  <document index="2">
    ...
  </document>
</documents>

Answer using only the documents above, citing them like [1]. If they don't contain the
answer, say so plainly.

<question>Can I take sick leave during probation?</question>
\`\`\`

The XML tags give each part a clear boundary; the index gives citations something to point at.

---

## Quote first, for hard questions

For complex questions over several documents, asking the model to **first pull out the
relevant quotes**, then answer from them, helps it focus. It costs output tokens, so use it
where your error analysis shows the model mixing up or missing passages — not everywhere.

---

## Caching-friendly order

Prompt caching needs an identical **prefix**. So: stable system instructions first, then
the retrieved documents, then the question. Retrieved text changes per question, so it isn't
usually cached — but a long, stable system prompt is.`,
    docs: [
      {
        label: 'Anthropic — long-context prompting tips',
        url: `https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices#long-context-prompting`,
      },
      {
        label: 'Lost in the Middle (Liu et al., 2023)',
        url: 'https://arxiv.org/abs/2307.03172',
      },
      {
        label: 'Chroma — context rot',
        url: 'https://research.trychroma.com/context-rot',
      },
    ],
    glossary: [
      {
        term: 'lost in the middle',
        def: `The tendency of models to use information in the middle of a long context less well than at its start or end.`,
      },
      {
        term: 'prompt layout',
        def: 'The order and structure of the parts of a prompt.',
      },
      {
        term: 'XML tags',
        def: 'Named tags like <document> used to mark clear boundaries in a prompt.',
      },
    ],
    check: [
      {
        q: 'What did the \'Lost in the Middle\' study find?',
        a: `Models used information at the start and end of a long context better than information in the middle.`,
      },
      {
        q: 'Where should the question go relative to long documents?',
        a: 'After them, at the end of the prompt.',
      },
      {
        q: 'Why give each document an index and a source?',
        a: 'So the model can tell passages apart, attribute claims, and cite them in a form your UI can link.',
      },
      {
        q: 'When is \'quote first, then answer\' worth its cost?',
        a: `For complex, multi-document questions where error analysis shows the model missing or mixing up passages.`,
      },
    ],
    practice: [
      {
        mode: 'tool',
        title: 'Move the evidence around',
        body: `Take 15 golden questions. For each, build a prompt with 10 chunks where the evidence chunk
is placed first, in the middle (position 5–6) and last. Run each variant and grade the
answers (your faithfulness judge or by hand). Then repeat with only 4 chunks.`,
        answer: `What you'll likely see with a current model: small differences with 4 chunks; somewhat
larger ones with 10, with "middle" the weakest position — smaller than the 2023 paper's
numbers, but not zero.

The more important finding usually comes from the second run: **4 chunks beat 10**
regardless of position, because there's less near-miss text to confuse the answer.

Conclusion for p-3.1: rerank, keep few, put the best first, question last. Record the
table — it's evidence for a design choice, not just a belief from a paper.`,
      },
      {
        mode: 'read',
        title: 'Fix this prompt',
        body: `\`\`\`text
You are a helpful HR assistant. Question: What is the carry-forward limit for earned
leave? Here is some context that might help:
the carry forward limit is 10 days except in the first year
probation lasts 90 days
...(16 more unlabelled chunks)...
Answer the question.
\`\`\`

List what's wrong and rewrite its structure.`,
        answer: `Problems:

- The **question comes before** a long context — move it to the end.
- **18 chunks, unlabelled** — no sources, no boundaries, nothing to cite.
- **No instruction about grounding** or what to do if the answer's missing.
- "Might help" invites the model to lean on its own knowledge.

Rewrite:

\`\`\`text
[system] You answer questions for Acme employees using the company's HR documents.

<documents>
  <document index="1"><source>Leave Policy 2025 › Carry forward</source>
  <document_content>The carry-forward limit is 10 days, except in the first year...</document_content>
  </document>
  ... (the top 5 after reranking, most relevant first)
</documents>

Answer using only these documents and cite them like [1]. If they don't answer the
question, say so.

<question>What is the carry-forward limit for earned leave?</question>
\`\`\``,
      },
    ],
  },
  {
    id: 's3.7.t3',
    moduleId: 's3.7',
    title: 'Citations the UI can link to',
    outcome: `You can make every answer's claims link back to the exact document, page and passage — with prompt-based markers or Anthropic's Citations API — and verify them.`,
    minutes: 40,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
    ],
    animations: [],
    analogy: `A good news article links each claim to its source, and the link opens at the right
paragraph. A citation that says "Source: HR documents" is like a link to a homepage — it
proves nothing and nobody clicks it.`,
    notes: `## What a useful citation carries

- **Which document** — title, version, date
- **Where** — page and section (or timestamp, or \`file:line\`)
- **What exactly** — the quoted text, to highlight when opened

That needs metadata from ingestion (Module 3) — citations are only as good as what you
stored.

---

## Option 1: markers in the prompt

Number the documents in the prompt (previous topic) and ask for \`[1]\`-style markers. Then:

1. Parse the markers from the answer.
2. **Validate:** does document 3 exist in what you sent? Drop or flag markers that don't.
3. Map each index to its chunk's metadata to build links.

Simple and model-agnostic. The weakness: nothing guarantees the marked passage actually says
what the sentence claims — you measure that (Module 8).

---

## Option 2: Anthropic's Citations API

Send chunks as **search result** blocks with citations enabled:

\`\`\`python
content = [
    {"type": "search_result",
     "source": f"/docs/{c.document_id}?page={c.page_start}",
     "title": f"{c.title} › {' › '.join(c.section_path)}",
     "content": [{"type": "text", "text": c.text}],
     "citations": {"enabled": True}}
    for c in top_chunks
]
content.append({"type": "text", "text": question})

response = client.messages.create(model="claude-sonnet-5", max_tokens=1024,
                                  messages=[{"role": "user", "content": content}])

for block in response.content:
    if block.type == "text":
        for cite in block.citations or []:
            print(cite.search_result_index, cite.source, cite.cited_text)
\`\`\`

---

## What the API gives you

- Each answer text block carries its citations: the **source and title** you supplied, the
  result's index, and \`cited_text\` — the exact passage.
- The cited text is **guaranteed to come from your documents** — no invented quotes.
- \`cited_text\` doesn't count toward output tokens.
- For whole documents instead of chunks, \`document\` blocks work too, with page locations for
  PDFs and character ranges for text.
- One constraint: citations **can't be combined with structured outputs** — the API returns
  a 400 if you enable both.

"Guaranteed to exist" isn't "guaranteed to support the claim". Still measure citation
correctness.

---

## In the UI

- Render each cited span as a small numbered link after its sentence.
- The link goes through your API (permission check, Module 6), opens the document at the
  page, and **highlights \`cited_text\`**.
- Show "no sources" answers differently — a plain "not in the documents" message, not an
  answer with empty citations.`,
    docs: [
      {
        label: 'Anthropic — citations',
        url: 'https://platform.claude.com/docs/en/build-with-claude/citations',
      },
      {
        label: 'Anthropic — search results (citations for RAG)',
        url: 'https://platform.claude.com/docs/en/build-with-claude/search-results',
      },
    ],
    glossary: [
      {
        term: 'citation',
        def: 'A link from a claim in the answer to the exact source passage that supports it.',
      },
      {
        term: 'search result block',
        def: 'A Claude API content block carrying one retrieved passage with its source and title.',
      },
      {
        term: 'cited_text',
        def: 'The exact source passage returned with a citation by the Citations API.',
      },
      {
        term: 'citation marker',
        def: 'A reference like [2] placed in the answer text.',
      },
    ],
    check: [
      {
        q: 'What three things should a useful citation carry?',
        a: `Which document (title, version), where in it (page, section, timestamp or line), and the exact quoted text to highlight.`,
      },
      {
        q: 'What does the Citations API guarantee, and what doesn\'t it?',
        a: `It guarantees the cited text really exists in the supplied documents. It doesn't guarantee that the passage supports the claim — you still measure that.`,
      },
      {
        q: 'Can you use the Citations API together with structured outputs?',
        a: `No. Enabling citations on documents or search results together with a structured output format returns a 400 error.`,
      },
      {
        q: 'Why validate parsed `[n]` markers?',
        a: `The model can cite an index that doesn't exist or that you didn't send; unvalidated markers produce broken or misleading links.`,
      },
    ],
    practice: [
      {
        mode: 'tool',
        title: 'Switch p-3.1 to the Citations API',
        body: `Replace prompt-based markers with search result blocks and citations enabled. Render
citations as links that open the document at the page and highlight the cited text. Then
run your citation-correctness check on 30 golden answers, comparing the two approaches.`,
        answer: `What to check as you build it:

- **\`source\`** should be your own URL (routed through your API), not a raw file path —
  so clicking it checks permissions.
- **\`title\`** is what the model sees as the result's name: include the section path, so
  citations read well ("Leave Policy 2025 › Probation").
- **Multiple citations per sentence** happen — render them all.
- **Answers with no citations**: decide how to show them (probably as "not found").

Comparison you'll typically see: invalid or out-of-range markers drop to zero (the API
can't cite something you didn't send), and highlighting becomes trivial because
\`cited_text\` is exact. Citation *support* (does the passage back the claim?) usually
improves too, but it isn't guaranteed — your 30-answer check is the evidence.`,
      },
      {
        mode: 'primitive',
        title: 'Parse and validate markers',
        body: `Without AI: \`parse_citations(answer: str, n_docs: int) -> tuple[list[tuple[str, list[int]]], list[int]]\`.
Split the answer into sentences, extract \`[n]\` or \`[n, m]\` markers per sentence, and
return the sentences with their valid document numbers, plus a list of invalid numbers
(below 1 or above \`n_docs\`).`,
        answer: `\`\`\`python
import re

MARK = re.compile(r"\\[(\\d+(?:\\s*,\\s*\\d+)*)\\]")

def parse_citations(answer: str, n_docs: int):
    sentences = re.split(r"(?<=[.!?])\\s+", answer.strip())
    out, invalid = [], []
    for s in sentences:
        nums: list[int] = []
        for group in MARK.findall(s):
            nums += [int(x) for x in group.split(",")]
        valid = [n for n in nums if 1 <= n <= n_docs]
        invalid += [n for n in nums if not 1 <= n <= n_docs]
        text = re.sub(r"\\s+([.,;:!?])", r"\\1", MARK.sub("", s))   # "days [1]." -> "days."
        out.append((re.sub(r"\\s{2,}", " ", text).strip(), sorted(set(valid))))
    return out, invalid
\`\`\`

Log every invalid marker. A steady trickle means the prompt's numbering isn't clear
enough (or you're sending fewer documents than the prompt claims). The sentence splitter
is naive — "e.g." or "Rs. 500" will split wrongly — which is one more reason the
Citations API's structured output is easier to build on.`,
      },
      {
        mode: 'decision',
        title: 'Which citation approach?',
        body: `Pick prompt markers or the Citations API for each case:

1. Your app must return its answer as strict JSON (structured outputs) for a mobile client.
2. A legal research tool where every quote must be exactly verifiable.
3. A product that must switch between Claude and two other providers.`,
        answer: `1. **Prompt markers** (or two steps). Citations and structured outputs can't be combined
   in one request. Either put markers inside a JSON string field and validate them
   yourself, or generate the cited answer first and structure it in a second, cheap call.
2. **The Citations API.** Exact, guaranteed-to-exist quotes with locations are the whole
   product; don't rebuild that with regexes.
3. **Prompt markers behind your adapter interface** (Stage 2), since they work with every
   provider — or a provider-specific citation path per adapter, if each offers one, with
   one internal citation format your UI understands.`,
      },
    ],
  },
  {
    id: 's3.7.t4',
    moduleId: 's3.7',
    title: 'Memory and compaction in RAG chat',
    outcome: `You can decide what a RAG chat carries from turn to turn, compact long conversations without losing the facts that matter, and keep it cache-friendly.`,
    minutes: 30,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
    ],
    animations: [],
    analogy: `Taking minutes in a long meeting. You don't transcribe every word, and you don't re-read
every document that was passed around. You keep the decisions, the open questions and the
references — and fetch the documents again when you need them.`,
    notes: `## What to carry between turns

- **Keep:** the user's messages and the assistant's answers, with their citation references.
- **Don't keep:** the retrieved chunks from earlier turns. They're large, they go stale, and
  each new turn retrieves fresh evidence with its standalone rewrite (Module 6).

Carrying old chunks forward is the most common way RAG chats grow expensive — turn 12 paying
for the evidence of turns 1–11.

---

## Compaction

When the history passes its share of the budget:

1. Keep the **last few turns** verbatim — they carry the immediate context.
2. Replace older turns with a **running summary**, written by a small model.
3. Store the summary with the conversation and update it incrementally.

A good summary keeps **specifics**: numbers, names, dates, decisions, which documents were
cited. "We discussed leave" is useless; "User is on probation (joined March 2026); asked
about sick leave (6 days, Leave Policy 2025 §4)" is useful.

---

## Cache-friendly shape

Order the request so the stable part comes first:

1. system prompt (never changes)
2. conversation summary (changes only when compaction runs)
3. recent turns
4. this turn's retrieved documents and question

The prefix up to the summary stays identical across turns, so prompt caching keeps working
between compactions.

---

## Server-side options

The Claude API also offers **context editing** and **compaction** (in beta) for long
conversations — the API trims or summarises older context for you. They're built for long
agent sessions with many tool calls (Stage 4). For a RAG chat, your own compaction is
usually simpler to reason about, because you know exactly what's safe to drop.

---

## Two things that bite

- **Permissions change mid-conversation.** If history contains restricted text and the
  user loses access, the history still has it. Another reason to not carry chunks forward.
- **Summaries drift.** Each re-summary can lose or distort a detail. Keep citation
  references in the summary, so facts can be re-fetched from sources instead of trusted
  from memory.`,
    docs: [
      {
        label: 'Anthropic — compaction',
        url: 'https://platform.claude.com/docs/en/build-with-claude/compaction',
      },
      {
        label: 'Anthropic — context editing',
        url: 'https://platform.claude.com/docs/en/build-with-claude/context-editing',
      },
      {
        label: 'Anthropic — prompt caching',
        url: 'https://platform.claude.com/docs/en/build-with-claude/prompt-caching',
      },
    ],
    glossary: [
      {
        term: 'compaction',
        def: 'Replacing older conversation turns with a shorter summary.',
      },
      {
        term: 'running summary',
        def: 'A summary updated incrementally as the conversation grows.',
      },
      {
        term: 'context editing',
        def: 'An API feature that trims older context, such as old tool results, from long conversations.',
      },
    ],
    check: [
      {
        q: 'Why not carry earlier turns\' retrieved chunks forward?',
        a: `They're large, they go stale, they may include text the user can no longer access, and each turn retrieves fresh evidence anyway.`,
      },
      {
        q: 'What makes a conversation summary useful?',
        a: 'Specifics — numbers, names, dates, decisions and which documents were cited — not vague topics.',
      },
      {
        q: 'How do you keep prompt caching working in a long chat?',
        a: `Put stable parts first — system prompt, then the summary — so the prefix stays identical between compactions.`,
      },
    ],
    practice: [
      {
        mode: 'spec',
        title: 'Spec the compaction step',
        body: `Write the spec for compaction in your p-3.1 chat: when it triggers, how many turns stay
verbatim, the summary prompt, where the summary is stored, and how you test that a key
fact survives two compactions. Have AI implement it.`,
        answer: `Spec essentials:

- **Trigger:** history tokens exceed ~3,000 (your history share).
- **Keep:** the last 4 turns verbatim.
- **Summary prompt:** "Update the running summary with the turns below. Keep every
  specific fact the user stated about themselves, every number and date in the
  assistant's answers, and the document references cited. Drop greetings and repetition.
  Keep it under 250 words." Input: the previous summary plus the turns being compacted.
- **Storage:** \`conversations.summary\` plus \`summary_through_turn\`, so compaction is
  incremental and resumable.
- **Model:** a small, fast one.

**The test:** a scripted 20-turn conversation where turn 2 states "I joined in March 2026
and I'm on probation". At turn 18, ask "Can I take earned leave yet?" Assert the answer
reflects probation — which only works if the fact survived two rounds of summarising.`,
      },
      {
        mode: 'read',
        title: 'Why is turn 15 so expensive?',
        body: `Logs for one conversation: input tokens per turn go 3,100 → 6,400 → 9,800 → … → 45,000
at turn 15. Each turn retrieves 6 chunks of ~500 tokens. What's the likely cause and fix?`,
        answer: `Growth of roughly 3,000–3,500 tokens per turn, and each turn retrieves ~3,000 tokens of
chunks: the app is **appending each turn's retrieved chunks to the history**. By turn 15
it resends 14 turns' worth of old evidence.

Fix: store only the user message and the assistant's answer (with citation references)
in history; retrieve fresh evidence for each turn; add compaction once history passes its
budget. Input per turn should then stay roughly flat — around the system prompt plus a
few thousand tokens.

Add a guard: alert when a conversation's input tokens exceed, say, 3× the first turn's.`,
      },
    ],
  },
  {
    id: 's3.7.t5',
    moduleId: 's3.7',
    title: 'When not to retrieve: routing',
    outcome: `You can put a router in front of retrieval that sends each message down the right path — no retrieval, RAG, a data tool, or a clarifying question — and measure its mistakes.`,
    minutes: 30,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
    ],
    animations: ['anim-rag-router'],
    analogy: `A hospital reception desk. Not everyone who walks in needs a specialist: some need
directions, some need the pharmacy, some need a form. The receptionist routes them, and
sending everyone to the specialist wastes everyone's time.`,
    notes: `## Not every message is a lookup

| Message | Right path |
|---|---|
| "Hi!" / "Thanks, that helped" | reply directly — no retrieval |
| "What's the notice period?" | **RAG** |
| "How many leave days have I used?" | a **data tool** (SQL over your records) |
| "Is the payroll system down?" | a **live status tool** |
| "Write me a poem" | politely out of scope |
| "What about the other one?" (no context) | **ask a clarifying question** |

Retrieving for everything wastes money and produces odd answers — a greeting answered with
a paragraph from the leave policy.

---

## Build it in layers

1. **Rules first** — a handful of greetings and thanks, matched cheaply.
2. **A small classifier** — a fast model with structured outputs:

\`\`\`python
class Route(BaseModel):
    path: Literal["chat", "lookup", "my_data", "status", "out_of_scope", "clarify"]
    reason: str
\`\`\`

3. **A safe default** — when unsure, choose \`lookup\`: retrieving unnecessarily costs a
   little; skipping retrieval when it was needed invites a made-up answer.

---

## Hiding the router's latency

A small-model router adds a few hundred milliseconds. You can overlap it:

- start retrieval **at the same time** as routing (speculatively),
- if the route is \`lookup\`, the evidence is already there,
- if not, discard it.

You pay for some unneeded searches — cheap — and the common path loses no time.

---

## Measure the router

Label 100 real messages with their correct route, and build a confusion table. The mistakes
aren't equal:

- \`lookup\` sent to \`chat\` → the model answers from memory: **risky**
- \`chat\` sent to \`lookup\` → wasted retrieval: **cheap**
- \`my_data\` sent to \`lookup\` → a policy passage instead of the user's actual numbers:
  **wrong answer**

Tune for the expensive mistakes, not overall accuracy.

---

## Router today, agent tomorrow

A router makes **one fixed decision** per message. In Stage 4, an agent decides for itself
which tools to call, possibly several in a row. Start with the router: it's predictable,
cheap and easy to test — and many products never need more.`,
    docs: [
      {
        label: 'Anthropic — structured outputs',
        url: 'https://platform.claude.com/docs/en/build-with-claude/structured-outputs',
      },
      {
        label: 'Anthropic — building effective agents (routing pattern)',
        url: 'https://www.anthropic.com/engineering/building-effective-agents',
      },
    ],
    glossary: [
      {
        term: 'router',
        def: 'A step that classifies each message and sends it down the right path.',
      },
      {
        term: 'speculative retrieval',
        def: 'Starting retrieval before you know it\'s needed, to save time on the common path.',
      },
      {
        term: 'confusion table',
        def: 'A table of true versus predicted classes, showing which mistakes a classifier makes.',
      },
    ],
    check: [
      {
        q: 'Why is `lookup` the safe default when the router is unsure?',
        a: `Retrieving unnecessarily costs a little. Skipping retrieval when it was needed lets the model answer from memory — a made-up answer.`,
      },
      {
        q: 'How can you hide the router\'s latency?',
        a: `Start retrieval in parallel with routing, and discard the results if the route turns out not to need them.`,
      },
      {
        q: 'Which router mistake is worse: chat → lookup, or lookup → chat?',
        a: `lookup → chat: the model answers a factual question without evidence. chat → lookup just wastes a search.`,
      },
      {
        q: 'How does a router differ from an agent?',
        a: `A router makes one fixed decision per message; an agent decides for itself which tools to call, possibly several in sequence.`,
      },
    ],
    practice: [
      {
        mode: 'tool',
        title: 'Build and measure a router',
        body: `Collect 100 messages (real v1 logs plus ones you write), label each with a route, and
build the rules + small-model router. Report the confusion table and the two most
expensive mistake types.`,
        answer: `Your confusion table has true routes as rows and predicted routes as columns. Read it for
the expensive cells first:

- **lookup → chat** — look at every one. Often short factual questions ("PL limit?") that
  look like chit-chat. Add examples of terse lookups to the router prompt.
- **my_data → lookup** — questions about *the user's own* numbers ("how many days have I
  taken?"). The router needs to know the difference between policy and personal data;
  say so explicitly in its instructions.
- **clarify** — check the model doesn't over-use it; asking too many questions is its own
  annoyance.

Then add the speculative-retrieval trick and compare p95 latency for lookup messages with
and without it.`,
      },
      {
        mode: 'decision',
        title: 'Route these',
        body: `Route each message: chat, lookup, my_data, status, out_of_scope or clarify.

1. "ok cool"
2. "PL carry fwd?"
3. "How many PLs do I have left?"
4. "Can you help me write a resignation email?"
5. "What about for the other office?" — first message in the conversation
6. "Is it true we get Diwali off?"`,
        answer: `1. **chat** — no retrieval needed.
2. **lookup** — terse, but a clear policy question (privilege-leave carry-forward).
   Exactly the kind a naive router misroutes to chat.
3. **my_data** — it's about *their* balance, which lives in the HR system, not in a
   policy document.
4. **Depends on your product.** If writing help is in scope, chat (perhaps with a notice-
   period lookup to get the facts right). If it isn't, out_of_scope with a polite reply.
5. **clarify** — "the other office" has nothing to refer to.
6. **lookup** — the holiday calendar. Phrased as a yes/no, still a factual question that
   needs evidence.`,
      },
    ],
  },
];
