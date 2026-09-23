import type { Topic } from '@/lib/types';

export const s3_4: Topic[] = [
  {
    id: 's3.4.t1',
    moduleId: 's3.4',
    title: 'Fixed-size and recursive splitting',
    outcome: `You can predict exactly where a fixed-size or recursive splitter will cut a document, and what overlap does — and doesn't — do.`,
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
        query: '5 levels of text splitting chunking Greg Kamradt',
        channel: 'Greg Kamradt',
        reason: 'a walkthrough from fixed-size to semantic chunking',
      },
    ],
    animations: ['anim-chunk-strategies'],
    analogy: `Cutting a long shop receipt into pieces that fit an envelope. Cut every 10 cm and you slice
through line items. Cut at the gaps between items and every piece still makes sense.
Recursive splitting is "cut at the gaps, unless a single item is longer than the envelope."`,
    notes: `## Why chunk at all

- **One vector can't hold a whole document.** A 40-page policy covers 30 topics; its single
  vector is a vague average of all of them, close to nothing in particular.
- **Embedding models have input limits.**
- **The prompt has a budget**, and a citation should point at a passage, not a file.

A chunk is the unit you **retrieve**, **send** and **cite**. Everything in this module is
about choosing that unit well.

---

## Fixed-size

Cut every N characters (or tokens). Predictable and fast — and it cuts mid-sentence,
mid-word, mid-table.

**Overlap** repeats the end of each chunk at the start of the next, so a sentence cut at a
boundary still appears whole in one of them. It costs more chunks, more storage, and
near-duplicate results. 10–20% of the chunk size is typical.

---

## Recursive splitting

Try the biggest natural boundary first; only use smaller ones for pieces that are still too
big:

1. paragraphs (\`"\\n\\n"\`)
2. lines (\`"\\n"\`)
3. spaces (\`" "\`)
4. single characters (last resort)

Then small pieces are **merged back together** up to the size limit.

\`\`\`python
from langchain_text_splitters import RecursiveCharacterTextSplitter

splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=150)
chunks = splitter.split_text(text)          # sizes are in characters by default
\`\`\`

\`chunk_size\` is a **maximum**, not a target — chunks come out in many sizes.

---

## The overlap surprise

Overlap is only added when the splitter had to cut **inside** a paragraph.

Real output (chunk_size 500, overlap 100) for a 1,007-character paragraph followed by a
278-character one:

| chunk | length | overlap with the previous chunk |
|---|---|---|
| 1 | 492 | — |
| 2 | 496 | ~100 characters |
| 3 | 209 | ~100 characters |
| 4 | 278 | **none** — it starts a new paragraph |

When whole paragraphs are merged into chunks, a paragraph bigger than the overlap is never
repeated. So "overlap 100" does not mean every boundary overlaps. Check real output before
relying on it.

---

## Where this leaves you

Recursive splitting at a sensible size is the **baseline** — probably what your v1 does.
Keep it as the first row in your results table. Every cleverer strategy in this module has
to beat it on your golden set, at the same token budget (topic 7).`,
    docs: [
      {
        label: 'LangChain — text splitters',
        url: 'https://python.langchain.com/docs/concepts/text_splitters/',
      },
      {
        label: 'LangChain — recursive text splitter',
        url: 'https://python.langchain.com/docs/how_to/recursive_text_splitter/',
      },
    ],
    glossary: [
      {
        term: 'chunk',
        def: 'The piece of a document you retrieve, send to the model and cite.',
      },
      {
        term: 'overlap',
        def: 'Text repeated at the start of the next chunk so boundary sentences appear whole.',
      },
      {
        term: 'recursive splitting',
        def: 'Splitting on the largest natural boundary first, smaller ones only when needed.',
      },
      {
        term: 'separator',
        def: 'The boundary a splitter cuts on — a blank line, a newline, a space.',
      },
    ],
    check: [
      {
        q: 'Why not embed each document as one vector?',
        a: `One vector averages all its topics into something vague; long documents exceed input limits; and you can't send or cite a whole document for every hit.`,
      },
      {
        q: 'In what order does the default recursive splitter try separators?',
        a: 'Paragraph breaks, then line breaks, then spaces, then single characters.',
      },
      {
        q: 'With LangChain\'s recursive splitter, is `chunk_size` measured in characters or tokens?',
        a: 'Characters, by default. Use a token-based constructor (next topic) to measure in tokens.',
      },
      {
        q: 'When does a recursive splitter\'s overlap actually appear?',
        a: `When it had to cut inside a piece — typically a long paragraph. Between whole paragraphs merged into separate chunks, there's often no overlap at all.`,
      },
    ],
    practice: [
      {
        mode: 'read',
        title: 'Where does it cut?',
        body: `\`RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=100)\`.

1. A 300-character document with no blank lines. How many chunks, and is there overlap?
2. Three paragraphs of 499, 449 and 249 characters, separated by blank lines. How many
   chunks, and where is the overlap?
3. Why does the answer to 2 matter for a question whose answer spans the end of
   paragraph 1 and the start of paragraph 2?`,
        answer: `1. **One chunk** of 300 characters. It already fits, so nothing is split, and overlap
   never applies.
2. **Three chunks: 499, 449, 249 — with no overlap at all.** Each paragraph fits within
   500 on its own, but no two fit together, so each becomes a chunk. The merge step only
   carries text forward when it's within the overlap size, and every paragraph is bigger
   than 100 characters.
3. The answer is **split across two chunks with nothing shared.** Neither chunk alone
   contains it, so retrieval can bring back one half and the model answers from half the
   information. Overlap, which you might think protects you, doesn't here. The fixes:
   larger chunks, structure-aware chunking that keeps the section together, or
   parent-document retrieval (topic 5).

(These results are from running the splitter, not from reading its docs — which is the
habit to build.)`,
      },
      {
        mode: 'primitive',
        title: 'A fixed-size splitter by hand',
        body: `Without AI: \`split(text, size, overlap) -> list[str]\`, measured in characters.

Rules: never cut inside a word (move the cut back to the previous space); every chunk
except the first starts with the last \`overlap\` characters of the previous one (again,
rounded to a word boundary); it must always make progress, even with one huge word.`,
        answer: `\`\`\`python
def split(text: str, size: int, overlap: int) -> list[str]:
    assert 0 <= overlap < size
    chunks, start = [], 0
    while start < len(text):
        end = min(start + size, len(text))
        if end < len(text):
            space = text.rfind(" ", start + 1, end)
            if space > start:
                end = space                      # don't cut inside a word
        chunks.append(text[start:end].strip())
        if end >= len(text):
            break
        nxt = max(end - overlap, start + 1)      # always move forward
        space = text.find(" ", nxt, end + 1)     # next word boundary, up to the cut
        start = space + 1 if space != -1 else nxt
    return [c for c in chunks if c]
\`\`\`

The edge cases your tests should cover:

- **A single word longer than \`size\`:** \`rfind\` finds no space, so the word is cut
  mid-way. That's the only way to guarantee progress.
- **\`overlap\` close to \`size\`:** \`max(end - overlap, start + 1)\` guarantees the loop
  advances. Without it you can loop forever.
- **No word boundary inside the overlap region:** the search for the next space runs up
  to *and including* the cut point, so the next chunk starts at the cut — no overlap
  rather than half a word. (Searching only up to \`end\` is an easy off-by-one that starts
  chunks mid-word; a test with short words and a small overlap catches it.)
- **Trailing spaces or empty chunks** are stripped and dropped.`,
      },
      {
        mode: 'break',
        title: 'Tiny chunks, no overlap',
        body: `Re-chunk your corpus with \`chunk_size=128, chunk_overlap=0\` (characters). Re-embed and
run your golden set.

Find one question that now fails, and explain exactly why.`,
        answer: `128 characters is about one sentence. Typical failures:

- **A condition separated from its rule.** "Employees may carry over up to 10 days." and
  "This does not apply in the first year." become separate chunks. A question about
  carry-over retrieves the first and answers without the exception.
- **Pronouns without their subject.** A chunk reading "It must be approved by the
  manager within 3 days." matches "approval time?" but nobody knows what "it" is.
- **Tables in pieces.** Rows lose their headers.

The deeper point: every chunk must **make sense on its own**, because it may be the only
thing the model sees. Tiny chunks match precisely but carry too little meaning — which is
exactly the problem parent-document retrieval and contextual retrieval solve.`,
      },
    ],
  },
  {
    id: 's3.4.t2',
    moduleId: 's3.4',
    title: 'Sizing chunks in tokens',
    outcome: `You can size chunks in tokens — the unit models and budgets actually use — and know why character counts mislead for code, numbers and Indian languages.`,
    minutes: 25,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
    ],
    animations: [],
    analogy: `Packing for a flight by counting items instead of weighing the bag. The airline weighs the
bag. Models "weigh" text in tokens, so that's what your size limit should count.`,
    notes: `## Characters mislead

For English prose, a token is roughly 4 characters. For other text, very different:

- **Code** — symbols, indentation and identifiers split into many tokens.
- **Numbers, IDs and URLs** — often a token for every few characters.
- **Hindi, Tamil and other non-Latin scripts** — often several times more tokens per
  character than English, depending on the tokenizer.

A "1,000-character" chunk might be 250 tokens of English or 800 of Devanagari. If the limit
is in characters, your real sizes are all over the place.

---

## Which tokenizer?

Two different limits, two different tokenizers:

| Limit | Tokenizer to use |
|---|---|
| The embedding model's **max input** (truncation) | the embedding model's own |
| The **prompt budget** (Module 7) | the LLM's (approximate is fine) |

- OpenAI's embedding models use the \`cl100k_base\` encoding (\`tiktoken\`).
- Voyage: \`vo.count_tokens(texts, model="voyage-4")\`.
- Hugging Face models: the model's tokenizer from \`transformers\`.
- Claude's tokenizer isn't published; count with the API's \`count_tokens\` endpoint.

---

## Token-aware splitting

\`\`\`python
from langchain_text_splitters import RecursiveCharacterTextSplitter

splitter = RecursiveCharacterTextSplitter.from_tiktoken_encoder(
    encoding_name="cl100k_base", chunk_size=400, chunk_overlap=50,
)

# or, for a Hugging Face embedding model:
from transformers import AutoTokenizer
tok = AutoTokenizer.from_pretrained("BAAI/bge-m3")
splitter = RecursiveCharacterTextSplitter.from_huggingface_tokenizer(
    tok, chunk_size=400, chunk_overlap=50,
)
\`\`\`

Same recursive logic; the lengths are counted in tokens.

---

## The silent truncation trap

Many smaller open models accept only 256 or 512 tokens. \`all-MiniLM-L6-v2\`, a popular
tutorial default, truncates at 256. A 1,000-token chunk still "works" — no error — but its
vector describes only the first quarter of the text.

Modern hosted models accept far more (Voyage 4: 32,000 tokens), so this bites mostly with
small local models and old tutorials.

---

## Measure the distribution

After chunking, log token counts: median, 95th percentile and maximum. Then assert:

\`\`\`python
assert max(token_counts) <= EMBED_MAX_TOKENS, "a chunk will be truncated"
\`\`\`

A histogram exposes the outliers: a giant table that couldn't be split, a code block, a page
with no line breaks. Those are the chunks that quietly retrieve badly.

As a starting range, many systems land somewhere around 200–800 tokens per chunk. Where
*yours* should be is topic 7's experiment.`,
    docs: [
      {
        label: 'tiktoken',
        url: 'https://github.com/openai/tiktoken',
      },
      {
        label: 'LangChain — splitting by tokens',
        url: 'https://python.langchain.com/docs/how_to/split_by_token/',
      },
      {
        label: 'Anthropic — token counting',
        url: 'https://platform.claude.com/docs/en/build-with-claude/token-counting',
      },
    ],
    glossary: [
      {
        term: 'tokenizer',
        def: 'The component that splits text into tokens; each model family has its own.',
      },
      {
        term: 'truncation',
        def: 'Cutting off input past a model\'s limit — often silently.',
      },
      {
        term: 'p95',
        def: 'The value 95% of items are at or below; shows the large outliers the average hides.',
      },
    ],
    check: [
      {
        q: 'Why size chunks in tokens rather than characters?',
        a: `Models and budgets count tokens, and characters per token varies a lot — code, numbers and non-Latin scripts use many more tokens per character.`,
      },
      {
        q: 'Which tokenizer decides whether a chunk gets truncated?',
        a: 'The embedding model\'s own tokenizer, against the embedding model\'s input limit.',
      },
      {
        q: 'What happens when you embed a 1,000-token chunk with a model limited to 256 tokens?',
        a: `It's usually truncated silently: the vector represents only the first 256 tokens, and the rest of the chunk can't be found.`,
      },
      {
        q: 'Why look at the chunk-size distribution, not just the average?',
        a: `The outliers — huge tables, code blocks, unsplittable pages — are the chunks that get truncated or retrieve badly.`,
      },
    ],
    practice: [
      {
        mode: 'tool',
        title: 'Tokens per character, measured',
        body: `Take four ~1,000-character samples: English prose from your corpus, a Python file, a
table of numbers, and a Hindi paragraph. Count tokens for each with \`tiktoken\`
(\`cl100k_base\`) and with your embedding model's counter.

Report characters per token for each. Which one surprised you?`,
        answer: `The pattern you should see:

- **English prose:** close to 4 characters per token.
- **Python code:** lower — punctuation, indentation and identifiers split more.
- **Numeric table:** lower still — digits and separators fragment.
- **Hindi:** usually the lowest with \`cl100k_base\`, often around 1 character per token or
  worse; newer and multilingual tokenizers do noticeably better.

The practical conclusion: a single character limit gives your Hindi chunks several times
the tokens of your English ones. Token-aware splitting fixes the size; it doesn't fix the
fact that the same content costs more to embed and send — worth knowing when you budget a
multilingual product.`,
      },
      {
        mode: 'primitive',
        title: 'Write the chunk-size guard',
        body: `Without AI: \`check_sizes(chunks, count_tokens, limit)\` returns a small report — count,
median, p95, max — and the indices of chunks over the limit. Use only the standard
library (\`statistics\` is fine).`,
        answer: `\`\`\`python
import statistics

def check_sizes(chunks: list[str], count_tokens, limit: int) -> dict:
    sizes = [count_tokens(c) for c in chunks]
    ordered = sorted(sizes)
    p95 = ordered[min(len(ordered) - 1, int(0.95 * len(ordered)))]
    return {
        "count": len(sizes),
        "median": statistics.median(sizes),
        "p95": p95,
        "max": ordered[-1],
        "over_limit": [i for i, n in enumerate(sizes) if n > limit],
    }
\`\`\`

Run it at the end of every ingestion and fail the job (or alert) if \`over_limit\` isn't
empty. Printing the offending chunks' first 100 characters makes the fix obvious: it's
almost always a table or code block that needs its own splitting rule.`,
      },
      {
        mode: 'read',
        title: 'Why does this chunk never come back?',
        body: `Your index uses \`all-MiniLM-L6-v2\`. One chunk holds an entire 2,400-token benefits table.
Questions about rows near the **bottom** of the table never retrieve it, while questions
about the top rows do.

Explain, and give two fixes.`,
        answer: `**Truncation.** The model reads only the first 256 tokens, so the vector represents the
table's header and first few rows. Rows further down are effectively invisible to vector
search — no error, just misses.

Fixes:

1. **Split the table by rows**, repeating the header row in every chunk (or turn each row
   into a sentence), so every row sits inside a chunk the model fully reads.
2. **Use an embedding model with a much longer input**, and still split very long tables
   for precise matching.

Plus the guard from the previous exercise, so the next oversized chunk fails ingestion
loudly instead of hiding.`,
      },
    ],
  },
  {
    id: 's3.4.t3',
    moduleId: 's3.4',
    title: 'Structure-aware chunking',
    outcome: `You can look at a document and pick a chunking strategy from its shape — and predict what that choice does to your results.`,
    minutes: 40,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
      {
        kind: 'find',
        label: 'Visual',
        query: 'chunking strategies for RAG structure aware markdown',
        channel: '',
        reason: 'a demo of splitting by document structure',
      },
    ],
    animations: ['anim-chunk-strategies'],
    analogy: `You split a React app by component, not by line count, because components are where
meaning naturally ends. A markdown heading is the same kind of boundary. Cutting a document
every 512 characters is like cutting a codebase every 512 characters.`,
    notes: `## Documents have shape

Headings, sections, list items, table rows, functions. They mark where one idea ends and the
next begins. **Chunk boundaries should follow them.**

This is the biggest single upgrade over a character splitter for most real corpora — and
it's cheap.

---

## Markdown headings

\`\`\`python
from langchain_text_splitters import MarkdownHeaderTextSplitter

splitter = MarkdownHeaderTextSplitter(
    headers_to_split_on=[("#", "h1"), ("##", "h2"), ("###", "h3")],
)
for section in splitter.split_text(markdown):
    print(section.metadata, section.page_content[:60])
# {'h1': 'Leave', 'h2': 'Probation'}  This applies for the first 90 days...
\`\`\`

Then a second pass: sections longer than your limit are split recursively; tiny ones are
merged with a neighbour under the same parent heading.

---

## Other shapes

- **HTML** — split on \`h1\`–\`h3\` or \`section\`/\`article\` (LangChain's HTML header splitter
  does this), after main-content extraction.
- **PDF** — parse to markdown first (pymupdf4llm, Docling), then use the markdown path.
  Numbered sections ("4.2.1 Termination") are headings too — a regex can find them.
- **Code** — split by function and class. \`RecursiveCharacterTextSplitter.from_language(...)\`
  is the light version (it prefers \`class\` and \`def\` boundaries); \`tree-sitter\` is the exact one.
- **Tables** — one chunk per table, or per group of rows with the header repeated.
- **FAQs** — one question-and-answer pair per chunk. The document already chunked itself.

---

## Put the heading path in the chunk

A chunk's own text often doesn't say what it's about:

> "This applies for the first 90 days of employment, after which the standard rules apply."

Prepend its heading path before embedding and before showing it to the model:

> **Leave › Probation**
> This applies for the first 90 days of employment…

Now "leave during probation" matches, and the model knows what "this" means. It's the
cheapest version of contextual retrieval (topic 6).

---

## Six strategies, and when each wins

| Strategy | Wins when |
|---|---|
| Recursive, fixed size | unstructured text; the baseline |
| **Structure-aware** | the documents have headings, sections or numbered clauses |
| Semantic | long, unstructured text whose topic drifts (transcripts) |
| Propositions | dense facts, precise questions — and you can afford a model call per passage |
| Parent-document | you need precise matching *and* broad context |
| Contextual retrieval | chunks don't make sense on their own |

They combine. A common strong setup: structure-aware splitting + heading paths + parent
sections for context.`,
    docs: [
      {
        label: 'LangChain — markdown header splitter',
        url: 'https://python.langchain.com/docs/how_to/markdown_header_metadata_splitter/',
      },
      {
        label: 'LangChain — splitting code',
        url: 'https://python.langchain.com/docs/how_to/code_splitter/',
      },
      {
        label: 'Anthropic — contextual retrieval (why context in chunks matters)',
        url: 'https://www.anthropic.com/engineering/contextual-retrieval',
      },
    ],
    glossary: [
      {
        term: 'structure-aware chunking',
        def: 'Splitting at a document\'s natural boundaries — headings, sections, rows, functions.',
      },
      {
        term: 'heading path',
        def: 'The chain of headings above a chunk, prepended to give it context.',
      },
      {
        term: 'clause',
        def: 'A numbered unit of a legal or regulatory text, like 7.3.2.',
      },
      {
        term: 'merge rule',
        def: 'What to do with sections too small to be useful chunks on their own.',
      },
    ],
    check: [
      {
        q: 'Why prepend the heading path to each chunk?',
        a: `The chunk's text often doesn't name its own topic. The path gives the embedding and the model that missing context — cheaply.`,
      },
      {
        q: 'What does the second pass after header splitting do?',
        a: `Splits sections that are over the size limit, and merges tiny sections with a neighbour under the same parent.`,
      },
      {
        q: 'How should an FAQ page be chunked?',
        a: 'One question-and-answer pair per chunk. The document\'s own structure already gives the ideal units.',
      },
      {
        q: 'How do you find headings in a PDF?',
        a: `Parse it to markdown with a layout-aware tool, or detect numbered section titles with a regex, then use the markdown path.`,
      },
    ],
    practice: [
      {
        mode: 'spec',
        title: 'Spec a markdown splitter with heading paths',
        body: `Write the spec for a markdown-header-aware splitter that stores the heading path as
metadata *and* prepends it to the chunk text, with a size limit and a merge rule. Have AI
implement it.

Review it against three cases: a document with no headings; nested headings (\`###\`
under \`#\` with no \`##\`); a heading at the very end with nothing under it.`,
        answer: `Spec essentials: split on \`#\`–\`###\`; keep the path as a list; sections over N tokens go
through the recursive splitter (each piece keeps the path); sections under M tokens merge
with the next sibling under the same parent; the chunk text is \`" › ".join(path)\`, a blank
line, then the body.

What the three cases should produce (LangChain's \`MarkdownHeaderTextSplitter\` behaves
exactly like this):

- **No headings:** one section with empty metadata \`{}\`. Your code must still size-split
  it and give it a sensible path — the document title — instead of an empty string.
- **\`###\` directly under \`#\`:** metadata has \`h1\` and \`h3\` but no \`h2\`. The path joins
  what's there: "Leave › Exceptions". Make sure the code doesn't crash on the missing
  level or insert a blank.
- **A heading at the very end with no body:** it produces **no chunk at all** — the
  heading silently disappears. Usually fine. But if the document's last line is something
  meaningful (a title-only notice), check you want it dropped.

Also check that headings are removed from the body (the default) so they don't appear
twice once you prepend the path.`,
      },
      {
        mode: 'decision',
        title: 'The 900-page regulation',
        body: `A 900-page regulatory PDF with numbered sections (like "4.2.1"), many tables, and
questions that are usually about one specific clause ("what's the penalty under 7.3.2?").

Pick a chunking strategy and metadata set, and say what you're trading away.`,
        answer: `**Strategy:**

- Parse with a layout-aware parser (tables matter).
- Chunk by **clause**: detect numbered headings with a regex like \`^\\d+(\\.\\d+)*\\s\`, one
  clause per chunk; long clauses split recursively; short sibling clauses kept separate
  (people ask about exactly one).
- Tables stay whole, or split by row groups with the header repeated.
- Prepend the path: "Part 7 › Penalties › 7.3.2".

**Metadata:** \`clause_number\`, \`section_path\`, \`page_start\`/\`page_end\`, \`effective_date\`,
\`version\`, \`is_table\`.

**Plus:** hybrid search — "7.3.2" is an exact string that vectors blur (Module 6) — and
an optional filter when the question names a clause.

**Trade-offs:** questions that span several clauses ("compare the penalties in 7.3 and
9.1") need multiple retrievals or decomposition; clause-sized chunks can be too small
for the model to see the surrounding definitions — parent retrieval of the whole section
helps; and a clause-detection regex breaks on the one chapter formatted differently, so
it needs a check.`,
      },
      {
        mode: 'read',
        title: 'What does the heading path rescue?',
        body: `Chunk text, without any heading path:

> "Up to 10 days may be carried forward. Unused days beyond this lapse on 31 March."

Write two realistic questions this chunk should answer but probably won't be retrieved
for — and say what heading path would fix them.`,
        answer: `Questions that probably miss:

- "How much **annual leave** can I carry over?" — the chunk never says "annual leave".
- "What happens to my **earned leave** at the end of the year?" — ditto; and "carry
  forward" vs "carry over" is a synonym vectors *might* catch, but the leave type is
  missing entirely.

And the dangerous version: a similar chunk under **"Sick Leave › Carry forward"** with
different numbers competes for the same questions. Without paths, nothing tells them apart.

With **"Leave › Annual (earned) leave › Carry forward"** prepended, the right chunk
matches "annual leave" and "earned leave" questions, and the model can say *which* leave
type the 10 days applies to.`,
      },
    ],
  },
  {
    id: 's3.4.t4',
    moduleId: 's3.4',
    title: 'Semantic and propositional chunking',
    outcome: `You can explain semantic and propositional chunking, estimate what they cost, and decide from evidence whether they're worth it for your corpus.`,
    minutes: 30,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
    ],
    animations: [],
    analogy: `Semantic chunking is cutting a podcast transcript where the topic changes, instead of every
five minutes. Propositional chunking is rewriting the transcript as a list of standalone
facts — precise, but now it's your summary, not what was said.`,
    notes: `## Semantic chunking

1. Split the text into sentences and embed each one.
2. Measure the similarity between each sentence and the next.
3. Cut where similarity drops sharply — a topic shift — for example below the 20th percentile
   of all the similarities in the document.

Each chunk ends up covering one topic. LangChain (\`SemanticChunker\`, in
\`langchain_experimental\`) and LlamaIndex (\`SemanticSplitterNodeParser\`) implement it.

---

## What it costs

- **An embedding call per sentence** at ingestion — many more than per chunk.
- **Thresholds to tune** per corpus.
- **Wildly varying chunk sizes** — some tiny, some huge. You still need a size cap.

And the evidence is mixed. A 2024 study titled *"Is Semantic Chunking Worth the
Computational Cost?"* found its gains inconsistent and often not worth the extra compute
compared with fixed-size chunks, and Chroma's 2024 chunking evaluation found simple
recursive splitting at modest sizes competitive with more elaborate methods.

So: a **candidate** to test, not a default.

---

## Propositional chunking

From the 2023 paper *Dense X Retrieval*: have a model rewrite each passage into atomic,
self-contained statements:

> "Acme's probation period is 90 days."
> "During probation, Acme employees cannot take earned leave."

Each proposition is indexed on its own. Pronouns are resolved, so every unit makes sense
alone, and matching is very precise.

---

## What propositions cost

- **A model call per passage** — the most expensive chunking there is.
- **Paraphrase errors.** The rewrite can drop a condition or subtly change a number. Your
  index no longer contains the original words.
- **Citations must point back** to the source passage — never cite the paraphrase.

The safe design: store propositions as **child units** pointing to their source passage.
Match on the proposition; send and cite the original passage (the parent pattern, next topic).

---

## When to reach for either

Only after the cheap wins — structure-aware chunks with heading paths — and only when your
error analysis shows **chunk boundary failures** that those didn't fix.

Then measure: recall at the same token budget, plus the ingestion cost and time. Keep the
variant only if the numbers say so.`,
    docs: [
      {
        label: 'Dense X Retrieval (propositions), 2023',
        url: 'https://arxiv.org/abs/2312.06648',
      },
      {
        label: 'Is Semantic Chunking Worth the Computational Cost? (2024)',
        url: 'https://arxiv.org/abs/2410.13070',
      },
      {
        label: 'Chroma — evaluating chunking strategies',
        url: 'https://research.trychroma.com/evaluating-chunking',
      },
    ],
    glossary: [
      {
        term: 'semantic chunking',
        def: 'Cutting where the topic changes, detected from drops in similarity between neighbouring sentences.',
      },
      {
        term: 'proposition',
        def: 'A single, self-contained factual statement rewritten from a passage.',
      },
      {
        term: 'percentile threshold',
        def: 'A cut-off set relative to the document\'s own values, e.g. the lowest 20% of similarities.',
      },
    ],
    check: [
      {
        q: 'How does semantic chunking decide where to cut?',
        a: `It embeds each sentence and cuts where the similarity between neighbouring sentences drops sharply, signalling a topic change.`,
      },
      {
        q: 'What\'s the main risk of propositional chunking?',
        a: `The model's rewrite can drop conditions or change facts, and the index no longer holds the original words.`,
      },
      {
        q: 'How do you cite correctly when using propositions?',
        a: 'Store each proposition as a child of its source passage, and cite (and send) the original passage.',
      },
      {
        q: 'When should you try these techniques?',
        a: `After structure-aware chunking and heading paths, and only if error analysis shows boundary failures they didn't fix — then keep them only if the eval improves.`,
      },
    ],
    practice: [
      {
        mode: 'primitive',
        title: 'Find semantic breakpoints',
        body: `Without AI: given \`vecs\`, a list of unit-length sentence embeddings (numpy arrays),
write \`breakpoints(vecs, pct=20) -> list[int]\` returning the indices *after which* to cut:
every place where the similarity to the next sentence is below the \`pct\`-th percentile.

Then \`group(sentences, cuts) -> list[str]\`.`,
        answer: `\`\`\`python
import numpy as np

def breakpoints(vecs: list[np.ndarray], pct: float = 20) -> list[int]:
    sims = [float(vecs[i] @ vecs[i + 1]) for i in range(len(vecs) - 1)]
    if not sims:
        return []
    threshold = np.percentile(sims, pct)
    return [i for i, s in enumerate(sims) if s < threshold]

def group(sentences: list[str], cuts: list[int]) -> list[str]:
    chunks, start = [], 0
    for c in cuts:
        chunks.append(" ".join(sentences[start:c + 1]))
        start = c + 1
    chunks.append(" ".join(sentences[start:]))
    return [c for c in chunks if c]
\`\`\`

With unit-length vectors, \`a @ b\` *is* the cosine similarity. Notice what a percentile
threshold implies: it **always** produces cuts — roughly a fifth of all sentence
boundaries here — even in a document that never changes topic. That's one reason sizes
vary so much and why a size cap and a minimum size are still needed.`,
      },
      {
        mode: 'decision',
        title: 'Worth it here?',
        body: `Decide for each corpus: recursive/structure-aware only, semantic, or propositions.

1. 50,000 support tickets, each a few paragraphs about one problem.
2. 300 hour-long interview transcripts that drift between topics, with no headings.
3. A dense tax regulation where users ask precise questions ("is X deductible under Y?").`,
        answer: `1. **Neither.** Each ticket is already one topic and short. Chunk per ticket (or per
   message in a thread); spend the effort on metadata and cleaning instead.
2. **Semantic is a reasonable candidate.** No structure to follow and real topic drift.
   Test it against fixed-size windows with overlap, at the same token budget, and include
   time-stamped metadata either way.
3. **Structure first** — clauses and sections. If error analysis still shows misses on
   precise questions, **propositions as child units** pointing back to the clause could
   help; you'd cite the clause itself, never the paraphrase. Budget for the model calls,
   and eval the propositions for dropped conditions (tax rules are full of "except").`,
      },
      {
        mode: 'read',
        title: 'What went wrong in this proposition?',
        body: `Source passage: *"Employees may carry forward up to 10 days of earned leave, except
during their first year of service, when no carry-forward is permitted."*

Generated proposition: *"Employees may carry forward up to 10 days of earned leave."*

What's wrong, what does it cause, and how would you catch this class of error?`,
        answer: `**The exception was dropped.** The proposition is true for most employees and false for
first-year employees — exactly the people most likely to ask.

What it causes: a first-year employee asks, the proposition matches strongly, and if you
send the proposition (not the source), the model confidently says yes.

How to catch and contain it:

- **Always send and cite the source passage**, not the proposition — the model then sees
  the "except".
- **Check propositions automatically:** a cheap model call per proposition asking "is
  every statement here fully supported by the source, including its conditions?" Flag
  failures for review.
- **Add golden questions about exceptions** ("I joined 4 months ago — can I carry
  forward?"). Rules with exceptions are where paraphrase breaks, so that's where your
  eval should look.`,
      },
    ],
  },
  {
    id: 's3.4.t5',
    moduleId: 's3.4',
    title: 'Parent-document and sentence-window retrieval',
    outcome: `You can separate what you match on from what you send to the model, and choose parent-document or sentence-window retrieval for a corpus.`,
    minutes: 35,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
    ],
    animations: ['anim-parent-doc'],
    analogy: `A Google result. It matched your query against a snippet-sized piece of the page — but
when you click, you read the whole page. Match small, read big.`,
    notes: `## One chunk size can't do both jobs

- **Small chunks match precisely.** A 100-token chunk is about one thing, so its vector is
  sharp.
- **Big chunks answer well.** The model needs the surrounding definitions, conditions and
  exceptions.

Parent-document retrieval stops forcing one size to do both.

---

## Small-to-big

- Split each section (the **parent**, ~1,000–2,000 tokens) into small **children**
  (~100–300 tokens).
- Embed and index the **children** only. Each points to its parent.
- At query time: find the best children → look up their parents → send the parents.

Several children often share a parent — send it once.

---

## In SQL

\`\`\`sql
WITH top_children AS (
  SELECT parent_id, embedding <=> $1 AS dist
  FROM child_chunks
  ORDER BY embedding <=> $1
  LIMIT 30
),
best AS (
  SELECT parent_id, min(dist) AS dist
  FROM top_children GROUP BY parent_id
)
SELECT p.id, p.text
FROM best JOIN parents p ON p.id = best.parent_id
ORDER BY best.dist
LIMIT 4;
\`\`\`

Parents are ranked by their best child, duplicates collapse, and the \`LIMIT\` is your
context budget in parents.

---

## Sentence-window: the same idea, smaller

Index **single sentences**. At retrieval, expand each hit to a window of a few sentences on
either side. (LlamaIndex's \`SentenceWindowNodeParser\` does this.)

Good for dense text where the answer is one or two sentences and the context is nearby.
Weaker when the needed context is far away — a definition three pages earlier.

---

## Budget and citations

- **Budget:** 4 parents × 1,500 tokens = 6,000 tokens per question. With 1M-token windows
  that's affordable; with a tight latency or cost target, use smaller parents or fewer.
- **Citations:** cite the parent's page and section, and let the UI **highlight the matched
  child** inside it. Precise and readable.`,
    docs: [
      {
        label: 'LangChain — parent document retriever',
        url: 'https://python.langchain.com/docs/how_to/parent_document_retriever/',
      },
      {
        label: 'LlamaIndex — node parsers (sentence window)',
        url: 'https://docs.llamaindex.ai/en/stable/module_guides/loading/node_parsers/modules/',
      },
    ],
    glossary: [
      {
        term: 'parent-document retrieval',
        def: 'Match on small child chunks, send their larger parent section.',
      },
      {
        term: 'sentence-window retrieval',
        def: 'Match single sentences, send each with a few sentences on either side.',
      },
      {
        term: 'child chunk',
        def: 'A small piece used only for matching; it points to its parent.',
      },
      {
        term: 'token cap',
        def: 'A limit on how many tokens of context are sent, regardless of how many items.',
      },
    ],
    check: [
      {
        q: 'What is matched, and what is sent, in parent-document retrieval?',
        a: 'Small child chunks are embedded and matched; their larger parent sections are sent to the model.',
      },
      {
        q: 'Why rank parents by their best child?',
        a: `It keeps the most relevant section first and collapses several matching children of the same parent into one entry.`,
      },
      {
        q: 'When is sentence-window retrieval weaker than parent-document?',
        a: `When the context needed is far from the matching sentence — a definition several pages earlier won't be inside a small window.`,
      },
    ],
    practice: [
      {
        mode: 'spec',
        title: 'Spec the parent–child store',
        body: `Spec the tables and the retrieval function for parent-document retrieval in pgvector:
how parents and children are created at ingestion, the query, how many children to
fetch, and a token cap on what's returned. Have AI implement it.

Review question: what happens when one parent has 20 matching children in the top 30?`,
        answer: `- **Tables:** \`parents(id, document_id, section_path, page_start, page_end, text,
  token_count)\` and \`child_chunks(id, parent_id, text, embedding)\`.
- **Ingestion:** structure-aware sections become parents (split any over ~2,000
  tokens); each parent is split into ~200-token children with the heading path prepended;
  only children get embeddings.
- **Retrieval:** top 30 children → group by parent (best distance) → order → add parents
  until a token cap (say 6,000) is reached — a cap in tokens, not a fixed count, because
  parents vary in size.
- Return child IDs too, for highlighting.

**20 of the top 30 children in one parent:** that parent ranks first (fine), but it has
used most of your candidate pool, so few other parents appear — you can miss a second
relevant section elsewhere. Two remedies: fetch more children (e.g. 100) before grouping,
or cap how many children per parent count toward the pool. This is the same diversity
problem Module 6 handles with MMR.`,
      },
      {
        mode: 'read',
        title: 'Predict what gets sent',
        body: `The top 6 children, in order, belong to parents: **A, A, B, A, C, B**. Parents are
about 1,500, 900 and 2,200 tokens (A, B, C). The limit is 3 parents *or* 4,000 tokens,
whichever comes first.

What is sent, in what order, and how many tokens?`,
        answer: `Ranking parents by their best child: **A** (best child at rank 1), **B** (rank 3),
**C** (rank 5).

- A: 1,500 → running total 1,500
- B: 900 → 2,400
- C: 2,200 → 4,600 — **over the 4,000 cap**, so C is left out.

Sent: **A then B, 2,400 tokens.** Three parent slots were allowed, but the token cap hit
first. That's the point of capping in tokens: one huge parent can't blow the budget. If C
mattered, your golden set will show it — and the fix is smaller parents, not a bigger cap.`,
      },
      {
        mode: 'decision',
        title: 'Which pattern, if any?',
        body: `1. An FAQ with 400 short question-and-answer pairs.
2. Long commercial contracts where clauses refer to definitions in section 1.
3. Research papers where answers are usually one or two sentences in the results section.`,
        answer: `1. **Neither.** Each Q&A pair is already a perfect unit — small enough to match
   precisely, complete enough to answer from.
2. **Parent-document by section, plus the definitions.** Children match the clause;
   the parent section gives context. The definitions in section 1 are far away, so
   neither pattern alone brings them — add a rule that always includes the definitions
   of terms that appear in the retrieved clause, or retrieve "definition of X" as a
   second query.
3. **Sentence-window** is a good fit: the answer is local, and a few sentences around it
   are usually enough. Keep the paper title and section as metadata for citations.`,
      },
    ],
  },
  {
    id: 's3.4.t6',
    moduleId: 's3.4',
    title: 'Contextual retrieval',
    outcome: `You can add a short model-written context to every chunk, estimate its cost with prompt caching, and measure the recall gain on your own corpus.`,
    minutes: 40,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
      {
        kind: 'find',
        label: 'Visual',
        query: 'Anthropic contextual retrieval explained',
        channel: '',
        reason: 'a walkthrough of the technique and its results',
      },
    ],
    animations: ['anim-contextual-retrieval'],
    analogy: `A photo in a shared album with no caption, and the same photo captioned "Goa trip, December
2025, Rahul's birthday". Same photo. Only one of them turns up when you search "Goa".`,
    notes: `## Chunks lose their context

> "Revenue grew by 3% over the previous quarter."

Whose revenue? Which quarter? The chunk doesn't say — the document did, pages earlier. So a
search for "ACME Q2 2025 revenue" can't match it, by vector or by keyword.

Heading paths (topic 3) help when the headings carry the context. Often they don't.

---

## The fix

From Anthropic's 2024 write-up, *Introducing Contextual Retrieval*:

1. For each chunk, give a small model **the whole document and the chunk**.
2. Ask for a short context (roughly 50–100 tokens) that situates the chunk in the document.
3. **Prepend** it to the chunk — before embedding *and* before keyword indexing.

> "This chunk is from ACME's Q2 2025 quarterly report, in the revenue section, comparing
> against Q1 2025. Revenue grew by 3% over the previous quarter."

---

## What it bought, in their tests

Top-20 retrieval failure rate (how often the right chunk was *not* in the top 20),
averaged across their datasets:

| Setup | Failure rate | Reduction |
|---|---|---|
| Plain embeddings | 5.7% | — |
| Contextual embeddings | 3.7% | 35% |
| + contextual keyword (BM25) search | 2.9% | 49% |
| + reranking | 1.9% | 67% |

Your corpus will differ. That's why you measure it (the tool exercise below).

---

## Making it affordable: prompt caching

Every call contains the **whole document**. Without caching, a 100-page document (~60,000
tokens) split into 150 chunks means 150 × 60,000 = 9 million input tokens — about **$9** on
Claude Haiku 4.5.

With caching, the document is written once and read 149 times at about a tenth of the price:

- write: 60,000 × 1.25 = 75,000 token-units
- reads: 149 × 60,000 × 0.1 ≈ 894,000 token-units
- total ≈ 969,000 → about **$0.97**, plus ~$0.06 of output

Roughly **$1 per 100-page document, once.**

---

## The code

\`\`\`python
def situate(doc_text: str, chunk_text: str) -> str:
    r = client.messages.create(
        model="claude-haiku-4-5",
        max_tokens=150,
        messages=[{"role": "user", "content": [
            {"type": "text", "text": f"<document>\\n{doc_text}\\n</document>",
             "cache_control": {"type": "ephemeral"}},       # cached across this doc's chunks
            {"type": "text", "text":
                f"<chunk>\\n{chunk_text}\\n</chunk>\\n"
                "Write one or two sentences that situate this chunk within the document, "
                "to improve search retrieval of the chunk. Reply with only that context."},
        ]}],
    )
    return "".join(b.text for b in r.content if b.type == "text").strip()
\`\`\`

Process all chunks of one document back to back, so the cache stays warm (5 minutes).

---

## Alternatives and pitfalls

**Alternatives:** contextualised chunk embeddings — Voyage's \`voyage-context-4\` embeds each
chunk with awareness of its whole document in one API call, no generation step. Test it
against the model-written context on your eval; it may be cheaper for similar gains.

**Pitfalls:**

- The context can be **wrong** — sample and read some.
- Store it in its **own column**, so you can regenerate it without re-parsing.
- **Show and cite the original chunk**, not the added context.`,
    docs: [
      {
        label: 'Anthropic — Introducing Contextual Retrieval',
        url: 'https://www.anthropic.com/engineering/contextual-retrieval',
      },
      {
        label: 'Anthropic — prompt caching',
        url: 'https://platform.claude.com/docs/en/build-with-claude/prompt-caching',
      },
      {
        label: 'Anthropic — embeddings (voyage-context-4)',
        url: 'https://platform.claude.com/docs/en/build-with-claude/embeddings',
      },
    ],
    glossary: [
      {
        term: 'contextual retrieval',
        def: `Prepending a short, model-written description of where a chunk sits in its document before indexing it.`,
      },
      {
        term: 'BM25',
        def: 'A classic keyword-ranking formula used by search engines.',
      },
      {
        term: 'contextual BM25',
        def: 'Keyword indexing of chunks that have had their context prepended.',
      },
      {
        term: 'contextualised chunk embeddings',
        def: 'Embeddings that encode each chunk with awareness of its whole document.',
      },
    ],
    check: [
      {
        q: 'What two indexes does contextual retrieval feed?',
        a: 'The embeddings and the keyword (BM25) index — the context is prepended before both.',
      },
      {
        q: 'Why does prompt caching make contextual retrieval affordable?',
        a: `Every call for a document repeats the whole document. Caching writes it once and reads it at about a tenth of the price for the rest of that document's chunks.`,
      },
      {
        q: `In Anthropic's tests, what did contextual embeddings plus contextual BM25 do to the top-20 failure rate?`,
        a: 'Cut it by about 49%, from 5.7% to 2.9%. Adding reranking brought it to 1.9%.',
      },
      {
        q: 'Why store the context in its own column?',
        a: `So you can regenerate or change it without re-parsing documents, and keep citations showing the original chunk text.`,
      },
    ],
    practice: [
      {
        mode: 'tool',
        title: 'Add contextual retrieval and measure it',
        body: `On your p-3.1 corpus: generate contexts for every chunk with Haiku 4.5 and prompt
caching, prepend them, re-embed, and run your golden set. Compare recall@5 and recall@10
with and without. Record the total cost from the API's \`usage\` fields.`,
        answer: `Steps that make the result trustworthy:

1. **Same chunks, same model, same k** — the context line is the only difference.
2. **Check caching is working:** in each response's \`usage\`, \`cache_read_input_tokens\`
   should be large for every chunk after the first in a document. If it's zero, the
   cache isn't being hit — usually because something before the document block changes
   between calls, or the document is under the model's minimum cacheable length.
3. **Read 20 contexts** before trusting the numbers. Wrong contexts do exist.

Result table:

| Variant | recall@5 | recall@10 | one-time cost |
|---|---|---|---|
| Structure-aware + heading paths | | | — |
| + contextual retrieval | | | $… |

What to expect: a clear gain on corpora whose chunks don't stand alone (reports,
papers, long contracts); a small gain where heading paths already carry the context. This
row goes into your p-3.1 results table either way — a small gain honestly reported is
still a good result.`,
      },
      {
        mode: 'primitive',
        title: 'The cost calculator',
        body: `Without AI: \`context_cost(doc_tokens, n_chunks, out_tokens, in_price, out_price,
cached=True)\` returns the dollar cost of contextualising one document.

Then compute a 500-page corpus as 25 documents of 20 pages (about 12,000 tokens each,
30 chunks each), at Haiku 4.5 prices ($1 in, $5 out), with and without caching.`,
        answer: `\`\`\`python
def context_cost(doc_tokens, n_chunks, out_tokens, in_price, out_price, cached=True):
    per_in = in_price / 1_000_000
    if cached:
        units = doc_tokens * 1.25 + (n_chunks - 1) * doc_tokens * 0.1
    else:
        units = n_chunks * doc_tokens
    return units * per_in + n_chunks * out_tokens * out_price / 1_000_000

per_doc_cached = context_cost(12_000, 30, 80, 1, 5, cached=True)
per_doc_plain = context_cost(12_000, 30, 80, 1, 5, cached=False)
print(25 * per_doc_cached, 25 * per_doc_plain)
\`\`\`

Per document: cached ≈ 15,000 + 34,800 = 49,800 units → **$0.050** + $0.012 output ≈
**$0.062**. Uncached: 360,000 → $0.36 + $0.012 ≈ **$0.37**.

For 25 documents: **~$1.55 cached vs ~$9.30 uncached.** A 6× saving — and either way,
a one-time cost that's tiny next to the engineering time. (The small per-chunk
instruction text is left out; it adds a little.)`,
      },
      {
        mode: 'read',
        title: 'Which context line is best?',
        body: `Chunk: *"The limit rises to ₹15,000 for employees at grade M3 and above."*

Three generated contexts:

A. "This chunk discusses a limit and grades."
B. "From Acme's 2025 Travel & Expense Policy, section 4.2 (Hotel stays), on the nightly
   hotel reimbursement limit for domestic travel."
C. "Acme is a large Indian IT company founded in 1998 with offices in Pune and Bengaluru,
   known for its generous travel benefits."

Pick the best and explain what's wrong with the others.`,
        answer: `**B is best.** It names the document, the year, the section and — crucially — *what*
the limit is (nightly hotel reimbursement, domestic). "Hotel limit for managers" now
matches, by vector and by keyword.

- **A** is too generic: it restates the chunk without adding anything the chunk lacked.
  A sign the prompt isn't asking clearly for *situating* information.
- **C** is about the company, not the chunk — and may be partly invented ("known for its
  generous travel benefits"). It adds noise to the vector and can mislead the model.

Put A-style and C-style failures on your checklist when you read your 20 sample contexts.`,
      },
    ],
  },
  {
    id: 's3.4.t7',
    moduleId: 's3.4',
    title: 'Measuring chunk size on your corpus',
    outcome: `You can run a fair chunking experiment — equal token budgets, fixed questions, labels that survive re-chunking — and choose a strategy from your own numbers.`,
    minutes: 40,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
    ],
    animations: [],
    analogy: `Comparing two phone plans by price when one gives 2 GB and the other 20 GB. You compare
the cost per GB. For chunking, compare how often you find the answer **per token of context
you send**.`,
    notes: `## The unfair comparison

"Recall@5 is higher with 1,000-token chunks than with 200-token chunks."

Of course it is: five 1,000-token chunks contain five times as much text. They also cost
five times as much per question and bury the answer in more noise.

Comparing recall@k across different chunk sizes rewards big chunks for being big.

---

## The fair comparison: equal budgets

Fix the **context budget** — say 2,000 tokens — and fill it:

- 1,000-token chunks → top 2
- 400-token chunks → top 5
- 200-token chunks → top 10

Then measure **recall at that budget**: did the answer's evidence make it into the
2,000 tokens? Measure at two budgets (e.g. 2,000 and 6,000), because the winner can change.

---

## Labels that survive re-chunking

If your golden set says "the answer is chunk 1832", it's useless the moment you change
chunking — chunk 1832 no longer exists.

Label **evidence**, not chunks: the document plus a page and section, or a short quote from
the source. Then a retrieved chunk is a hit if it **contains or overlaps** the evidence.

This one decision is what makes every chunking experiment in this module possible. (Module 8
builds the golden set this way from the start.)

---

## The grid

Hold everything else fixed — embedding model, index, question set — and vary:

| Dimension | Values |
|---|---|
| strategy | recursive · structure-aware · + heading paths · + contextual |
| size | 200 · 400 · 800 tokens |
| overlap | 0 · 15% |

Script it: each variant is built into its own table (\`chunks_v2_struct_400\`…), so runs don't
interfere and you can re-run any of them.

---

## Reading the results

- **Pick the cheapest variant within a point or two of the best** — not the top number.
- **Mind the noise:** with 40 questions, one question is 2.5 points. Differences of a few
  points may be luck. More questions shrink the noise.
- **Look at failures by type**, not just the average: did the new variant fix split
  answers but break tables?
- **Check answer quality on the winner** (Module 8's faithfulness metric) — retrieval
  recall isn't the whole story.

The winning configuration becomes the next row in your p-3.1 results table.`,
    docs: [
      {
        label: 'Chroma — evaluating chunking strategies',
        url: 'https://research.trychroma.com/evaluating-chunking',
      },
      {
        label: 'Anthropic — define success criteria and build evals',
        url: 'https://platform.claude.com/docs/en/test-and-evaluate/develop-tests',
      },
    ],
    glossary: [
      {
        term: 'context budget',
        def: 'The number of tokens of retrieved text you allow per question.',
      },
      {
        term: 'recall at budget',
        def: 'Whether the answer\'s evidence fits in the top chunks up to a fixed token budget.',
      },
      {
        term: 'evidence span',
        def: 'The exact source location of an answer — document plus offsets, page or quote.',
      },
      {
        term: 'ablation',
        def: 'Changing one thing at a time to see what each change contributes.',
      },
    ],
    check: [
      {
        q: 'Why is recall@5 across different chunk sizes an unfair comparison?',
        a: `Bigger chunks contain more text, so they find more — while costing more tokens per question. The comparison rewards size, not quality.`,
      },
      {
        q: 'What does \'recall at a fixed budget\' mean?',
        a: `Fill the same number of context tokens with each variant's top chunks, then check whether the answer's evidence is inside.`,
      },
      {
        q: 'Why label evidence as a source span instead of a chunk ID?',
        a: `Chunk IDs change whenever chunking changes. A source span (document, page, quote) stays valid, and any chunk overlapping it counts as a hit.`,
      },
      {
        q: 'With 40 golden questions, how much is one question worth in recall?',
        a: '2.5 percentage points — so small differences between variants can be noise.',
      },
    ],
    practice: [
      {
        mode: 'tool',
        title: 'The chunking experiment',
        body: `Take a real ~200-page PDF and your golden questions (with evidence labelled as spans).
Build four variants — recursive 200/400/800 tokens and structure-aware 400 with heading
paths — each into its own pgvector table. Report recall at 2,000 and 6,000 tokens of
context.`,
        answer: `Outline of the script:

\`\`\`python
VARIANTS = {
    "rec_200": dict(strategy="recursive", size=200),
    "rec_400": dict(strategy="recursive", size=400),
    "rec_800": dict(strategy="recursive", size=800),
    "struct_400": dict(strategy="structure", size=400, heading_path=True),
}
for name, cfg in VARIANTS.items():
    build_table(name, chunk(doc, **cfg))          # its own table + HNSW index
    for budget in (2000, 6000):
        hits = [evidence_in_budget(name, q, budget) for q in golden]
        print(name, budget, sum(hits) / len(hits))
\`\`\`

Your table:

| Variant | recall @2K | recall @6K |
|---|---|---|
| rec_200 | | |
| rec_400 | | |
| rec_800 | | |
| struct_400 + paths | | |

Common pattern: at the small budget, mid-sized chunks tend to win (small ones lose
context, big ones fit too few); at the large budget the differences shrink; the
structure-aware variant often wins on documents with real headings. Whatever you see,
write one sentence per row explaining *why*, from the failures — that's the part
interviewers ask about.`,
      },
      {
        mode: 'primitive',
        title: 'The hit function',
        body: `Without AI: \`is_hit(chunk, gold) -> bool\`. Both have \`doc_id\`, \`start\` and \`end\`
character offsets in the parsed document. A chunk counts as a hit if it's from the same
document and covers at least half of the gold span.

Then write \`evidence_in_budget(ranked_chunks, gold, budget, count_tokens) -> bool\`.`,
        answer: `\`\`\`python
def is_hit(chunk, gold, min_cover: float = 0.5) -> bool:
    if chunk.doc_id != gold.doc_id:
        return False
    overlap = min(chunk.end, gold.end) - max(chunk.start, gold.start)
    return overlap > 0 and overlap / (gold.end - gold.start) >= min_cover

def evidence_in_budget(ranked_chunks, gold, budget: int, count_tokens) -> bool:
    used = 0
    for c in ranked_chunks:
        used += count_tokens(c.text)
        if used > budget:
            return False
        if is_hit(c, gold):
            return True
    return False
\`\`\`

Why "at least half of the gold span": a chunk that clips the last three words of the
evidence shouldn't count, but one that holds most of it should. For evidence split across
two chunks, a stricter version checks that the *union* of chunks in the budget covers the
span — worth adding once your golden set has multi-part answers.

This needs chunkers that record character offsets — make that a requirement of every
chunker you write.`,
      },
      {
        mode: 'read',
        title: 'Which conclusion is justified?',
        body: `A teammate's results, on 40 questions:

| Chunk size | recall@5 |
|---|---|
| 256 | 0.70 |
| 512 | 0.78 |
| 1,024 | 0.83 |

Conclusion: "1,024 is clearly best; switch production to 1,024."
Is it justified? What would you ask for?`,
        answer: `**Not yet.** Three problems:

1. **Unequal budgets.** Top-5 at 1,024 tokens is ~5,000 tokens of context; at 256 it's
   ~1,300. The bigger chunks are being rewarded for size. Ask for recall at a fixed
   budget (say 2,000 and 5,000 tokens).
2. **Noise.** With 40 questions, 0.78 vs 0.83 is two questions. That could easily be
   luck. Ask for more questions, or at least a look at *which* questions changed.
3. **Cost and quality.** Even if 1,024 wins at equal budgets, what does it do to cost,
   latency and faithfulness? Bigger contexts can dilute the answer.

A good reply isn't "you're wrong" — it's "let's re-run at equal budgets and look at the
five questions that flipped."`,
      },
    ],
  },
];
