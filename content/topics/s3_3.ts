import type { Topic } from '@/lib/types';

export const s3_3: Topic[] = [
  {
    id: 's3.3.t1',
    moduleId: 's3.3',
    title: 'PDF reality',
    outcome: `You can predict what a parser will do to a given PDF page, send each page to the right extraction method, and check the output instead of trusting it.`,
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
        query: 'PDF parsing for RAG tables layout comparison',
        channel: '',
        reason: 'a parser comparison on real documents',
      },
    ],
    animations: [],
    analogy: `HTML says "this is a heading, this is a table cell." A PDF says "draw these letters at
these coordinates." Getting paragraphs, columns and tables back out of a PDF is
reverse-engineering a printout.`,
    notes: `## What a PDF actually stores

A PDF is instructions for drawing a page: glyphs, positions, fonts, lines, images. It
has no idea what a paragraph, a column, a table or reading order is. Sometimes it doesn't
even store spaces — the gap between words is just a position.

Every PDF parser *guesses* the structure back from positions. Different parsers guess
differently, and each guesses badly on some pages.

---

## Five things that go wrong

1. **Two columns read straight across**, mixing the left column's line 1 with the right
   column's line 1.
2. **Tables flattened** into a word soup: \`Plan A Plan B 5,000 10,000 Dental Vision\`.
3. **Headers, footers and page numbers** repeated inside the text of every page.
4. **Hyphenation and ligatures:** \`inter-\` + newline + \`national\`, and \`ﬁ\` as a single
   character that search won't match with "fi".
5. **Scanned pages** with no text layer at all — just an image. The parser returns nothing,
   silently.

---

## The tools

| Tool | Good at | Watch out for |
|---|---|---|
| **pypdf** | simple text, pure Python, permissive licence | weak on layout and tables |
| **PyMuPDF / pymupdf4llm** | fast, good reading order, markdown output | **AGPL licence** (or a paid licence) |
| **pdfplumber** | character positions, table extraction | slower; needs tuning per layout |
| **Docling** | layout detection and table structure, markdown/JSON out | heavier (runs ML models) |
| **OCR** (Tesseract via \`ocrmypdf\`, cloud OCR) | scanned pages | errors in the text itself |
| **Hosted parsers** (Azure Document Intelligence, AWS Textract, LlamaParse…) | hard layouts at scale | cost per page; data leaves your system |
| **A vision model** (send the page to Claude) | charts, messy tables | cost: each page is billed as text *and* an image |

---

## Route pages, don't pick one tool

\`\`\`python
import pymupdf

def route(path: str):
    doc = pymupdf.open(path)
    for page in doc:
        text = page.get_text("text", sort=True)      # sort = reading order
        if len(text.strip()) < 20 and page.get_images():
            yield page.number, "ocr"                 # a scan: no text layer
        elif page.find_tables().tables:
            yield page.number, "tables"              # a table-aware extractor
        else:
            yield page.number, "text"                # fast path
\`\`\`

Most pages take the fast path. The expensive methods only run where they're needed, and
the route is logged per page, so you can count how many pages went where.

---

## Tables: where the numbers live

Numeric questions ("what's the dental limit on Plan B?") are answered from tables — and
tables are what parsers break most.

- Keep a table **in one chunk** when it fits; never split mid-row.
- Convert it to **markdown with its header row**. For a long table, repeat the header in
  each chunk.
- Or turn each row into a sentence: *"Plan B — dental ₹10,000, vision ₹5,000."* Row
  sentences embed and retrieve well.

---

## Check, don't trust

- Pick 20 pages covering every document type. Put the extracted text **side by side** with
  the page image and read it.
- Track per-document numbers: characters per page, pages sent to OCR, tables found. A
  200-page document with 40 characters per page is a scan nobody OCR'd.
- Put golden-set questions on tables and scanned pages, so parsing regressions show up as
  a score drop.`,
    docs: [
      {
        label: 'PyMuPDF — text extraction and tables',
        url: 'https://pymupdf.readthedocs.io/',
      },
      {
        label: 'Docling documentation',
        url: 'https://docling-project.github.io/docling/',
      },
      {
        label: 'Anthropic — PDF support (vision on pages)',
        url: 'https://platform.claude.com/docs/en/build-with-claude/pdf-support',
      },
    ],
    glossary: [
      {
        term: 'text layer',
        def: 'The machine-readable text inside a PDF. Scans often don\'t have one.',
      },
      {
        term: 'OCR',
        def: 'Optical character recognition: turning an image of text into text.',
      },
      {
        term: 'reading order',
        def: 'The order a human reads blocks on a page — columns top to bottom, then left to right.',
      },
      {
        term: 'ligature',
        def: 'Two letters drawn as one glyph, like ﬁ. Breaks search unless normalised.',
      },
      {
        term: 'AGPL',
        def: 'A copyleft licence that also covers software provided to users over a network.',
      },
    ],
    check: [
      {
        q: 'Why do PDF parsers disagree about the same page?',
        a: `A PDF stores glyphs at positions, not structure. Every parser reconstructs paragraphs, columns and tables with its own heuristics.`,
      },
      {
        q: 'How can you detect a scanned page cheaply?',
        a: 'Almost no extractable text, but the page contains an image. Route it to OCR.',
      },
      {
        q: 'Name two ways to make a table retrievable.',
        a: `Convert it to markdown with the header row (repeated per chunk for long tables), or rewrite each row as a self-contained sentence.`,
      },
      {
        q: 'What per-document number reveals an un-OCR\'d scan?',
        a: 'Characters per page: a long document with only a few characters per page has no text layer.',
      },
    ],
    practice: [
      {
        mode: 'read',
        title: 'Predict the extraction',
        body: `A page has two columns. Left column, lines 1–3: *"Employees on probation"*, *"may not
take earned leave"*, *"during the first 90 days."* Right column, lines 1–3: *"Sick leave
is available"*, *"from the first day of"*, *"employment, up to 6 days."*

A naive extractor reads each horizontal line across the page. Write what it outputs.
Then say why this is dangerous for RAG specifically.`,
        answer: `Naive output:

> Employees on probation Sick leave is available may not take earned leave from the first
> day of during the first 90 days. employment, up to 6 days.

It's dangerous because the result is **plausible-looking nonsense with the right
keywords.** "Probation", "sick leave" and "first day" are all in one chunk, so it will be
retrieved for "can I take sick leave on probation?" — and the model may confidently
combine the wrong halves.

Fixes: use reading-order extraction (\`sort=True\` in PyMuPDF, or block-based extraction),
or a layout-aware parser like Docling. Then check two-column documents by eye — it's a
five-minute test.`,
      },
      {
        mode: 'tool',
        title: 'Three parsers, ten nasty pages',
        body: `Pick 10 hard pages from your corpus: two-column, tables, a scan, headers and footers,
footnotes. Parse each with pypdf, pymupdf4llm and Docling. Score every page 0 (unusable),
1 (usable with problems) or 2 (clean), and note the time per page.`,
        answer: `Your table: rows = pages, columns = parser score + time. What people usually find:

- **pypdf**: fine on plain text pages, poor on tables and two-column layouts, nothing on
  scans.
- **pymupdf4llm**: fast, good reading order and headings in markdown; tables vary.
- **Docling**: usually best on tables and complex layouts, noticeably slower.
- **Scans**: all three need OCR switched on (Docling can run OCR; the others need
  \`ocrmypdf\` first).

The conclusion is almost never "use the best parser for everything" — it's the router
from the slides: a fast parser by default and the slow one only for the pages that need
it. Your scores tell you where to draw the line.`,
      },
      {
        mode: 'decision',
        title: 'Check the licence',
        body: `Your startup builds a closed-source SaaS product. A teammate has used PyMuPDF throughout
the ingestion service. What do you check, and what are your options?`,
        answer: `PyMuPDF is dual-licensed: **AGPL-3.0**, or a commercial licence from Artifex. The AGPL
requires you to offer your source code to users who interact with the software over a
network — a condition that also reaches software provided as a hosted service.

Options:

1. **Buy the commercial licence** if PyMuPDF is clearly the best fit.
2. **Switch the ingestion path to permissively licensed tools** (pypdf, pdfplumber,
   Docling are BSD/MIT) where they're good enough — your parser bake-off tells you where.
3. Ask whoever handles legal. Licence questions are a normal part of choosing
   dependencies, and it's much cheaper to ask before launch than after.

Engineers who check licences before shipping are rarer than they should be — it's worth
mentioning in an interview.`,
      },
    ],
  },
  {
    id: 's3.3.t2',
    moduleId: 's3.3',
    title: 'Every other format',
    outcome: `You can turn HTML, Markdown, Word files, code, spreadsheets and recordings into clean text that keeps its structure — headings, sections, rows and timestamps.`,
    minutes: 35,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
    ],
    animations: [],
    analogy: `Each format is a different API response shape. You'd never \`JSON.parse\` an XML response.
Pushing a spreadsheet through a PDF text extractor is the same mistake.`,
    notes: `## One rule for every format

**Keep the structure you'll need later**:

- headings → the section path (for citations and chunking)
- rows and columns → tables (for numeric answers)
- timestamps → jump-to-moment citations
- file paths and line numbers → \`file:line\` citations for code

Convert everything into **one intermediate shape**: markdown text plus a list of sections,
each with its metadata. Chunking then only has to understand one format.

---

## HTML

A web page is mostly *not* the article: navigation, cookie banners, footers, "related
posts". Extract the main content first.

\`\`\`python
import trafilatura

html = trafilatura.fetch_url(url)
md = trafilatura.extract(html, output_format="markdown", include_tables=True)
\`\`\`

Keep \`h1\`–\`h6\` as markdown headings. Resolve relative links. For docs sites you control,
prefer the source markdown over the rendered HTML.

---

## Word documents

In \`.docx\`, headings are paragraph **styles** (\`Heading 1\`, \`Heading 2\`…), which gives you
a clean section path for free.

\`\`\`python
from docx import Document

for p in Document(path).paragraphs:
    print(p.style.name, "|", p.text)       # "Heading 2 | Leave on probation"
\`\`\`

\`mammoth\` converts \`.docx\` to HTML or markdown and keeps headings, lists and tables. Old
\`.doc\` files: convert with LibreOffice first (\`soffice --headless --convert-to docx\`).

---

## Spreadsheets and CSV — is this even RAG?

"What's the total headcount by city?" is **SQL**, not retrieval. Load the sheet into a table
and let a tool query it (Stage 4).

For *lookup* questions over a sheet ("what's the SLA for the Gold plan?"), make each row
self-describing, with the headers repeated:

> Plan: Gold · Response SLA: 2 hours · Resolution SLA: 1 business day · Channels: phone, chat

A bare row like \`Gold, 2, 1, phone chat\` means nothing once it's separated from its header.

---

## Code

- Split by **function and class**, not by characters: a parser like \`tree-sitter\` knows
  where they start and end.
- Store \`repo\`, \`path\`, \`symbol\` and the **line range** — that's your \`file:line\` citation.
- Skip what nobody asks about: \`node_modules\`, lockfiles, minified bundles, generated code.
- README and docs files go through the markdown path.

(p-3.2, "Ask My Repo", is built on exactly this.)

---

## Audio and video

Transcribe first (the Whisper family — open-source \`faster-whisper\`, or a hosted API), and
**keep the timestamps**. Chunk by time windows or by speaker turns, storing
\`start_seconds\` and \`end_seconds\`.

Then a citation can link straight to the moment: \`https://youtu.be/<id>?t=754\`.`,
    docs: [
      {
        label: 'trafilatura documentation',
        url: 'https://trafilatura.readthedocs.io/',
      },
      {
        label: 'python-docx documentation',
        url: 'https://python-docx.readthedocs.io/',
      },
      {
        label: 'faster-whisper',
        url: 'https://github.com/SYSTRAN/faster-whisper',
      },
    ],
    glossary: [
      {
        term: 'main-content extraction',
        def: 'Pulling the article out of a web page, dropping navigation, ads and footers.',
      },
      {
        term: 'paragraph style',
        def: 'A named format in Word (like Heading 2) that marks what a paragraph is.',
      },
      {
        term: 'tree-sitter',
        def: 'A parser that turns source code into a syntax tree, so you can split by function or class.',
      },
      {
        term: 'transcription',
        def: 'Turning speech into text, ideally with timestamps.',
      },
    ],
    check: [
      {
        q: 'Why convert every format into one intermediate shape?',
        a: `So chunking and everything after it only has to understand one format — markdown text plus sections with metadata.`,
      },
      {
        q: 'What gives you the section path in a .docx file?',
        a: 'Paragraph styles: Heading 1, Heading 2 and so on.',
      },
      {
        q: 'A user asks for total headcount by city from a spreadsheet. Retrieval or SQL?',
        a: 'SQL. It\'s an aggregation over rows; retrieval returns a few passages, not a complete sum.',
      },
      {
        q: 'What metadata makes a transcript chunk citable?',
        a: 'Its start and end timestamps (plus the recording\'s URL), so a citation can jump to the exact moment.',
      },
    ],
    practice: [
      {
        mode: 'decision',
        title: 'Choose the path for each file',
        body: `1. \`pricing.xlsx\` — 40 rows, one per plan, 12 columns
2. The company's public docs site (built from markdown in a Git repo)
3. 300 recorded all-hands meetings (MP4)
4. \`employee_handbook_2019.doc\` (old Word format)
5. A monorepo with 6,000 TypeScript files, including \`dist/\` and \`node_modules/\`
6. 5,000 support emails in \`.eml\` format`,
        answer: `1. **Both.** Load into a SQL table for aggregate questions; also generate one
   self-describing text line per row for lookup questions.
2. **Use the markdown source from Git**, not the rendered HTML — cleaner, with headings
   intact, and Git history gives you change detection for free.
3. **Transcribe with timestamps**, chunk by time window or speaker turn, and cite with
   \`?t=\` links. Budget for it: transcription is the expensive step here.
4. **Convert to .docx with LibreOffice headless**, then use the Word path. And check the
   year: a 2019 handbook needs \`version\`/\`effective_date\` metadata so it doesn't
   out-rank the current one.
5. **Code path with exclusions:** skip \`dist/\`, \`node_modules/\`, lockfiles and generated
   files; split by function/class; store path and line range.
6. **Parse the email structure** (Python's \`email\` package): subject, sender, date as
   metadata; strip quoted replies and signatures, or each thread repeats itself many
   times (next topic: duplicates).`,
      },
      {
        mode: 'primitive',
        title: 'Section paths from a Word file',
        body: `Without AI, write \`sections(path) -> list[tuple[list[str], str]]\` using \`python-docx\`.
It returns each block of body text with its heading path, e.g.
\`(["Leave", "Probation"], "Employees on probation may...")\`.

Handle: body text before the first heading; a Heading 3 directly after a Heading 1.`,
        answer: `\`\`\`python
from docx import Document

def sections(path: str) -> list[tuple[list[str], str]]:
    out, stack, buf = [], [], []

    def flush():
        if buf:
            out.append((list(stack), "\\n".join(buf)))
            buf.clear()

    for p in Document(path).paragraphs:
        style = p.style.name or ""
        if style.startswith("Heading ") and style[8:].isdigit():
            flush()
            level = int(style[8:])
            del stack[level - 1:]          # drop this level and anything deeper
            stack.append(p.text.strip())
        elif p.text.strip():
            buf.append(p.text.strip())
    flush()
    return out
\`\`\`

- Text before any heading gets an **empty path** \`[]\` — keep it (often the title page or
  a summary). Don't drop it silently.
- A Heading 3 straight after a Heading 1 gives a 2-item path (\`["Leave", "Carry-over"]\`),
  which is fine. The \`del stack[level - 1:]\` keeps it from inheriting a stale Heading 2
  from an earlier section.
- This reads paragraphs only. Tables live in \`Document(path).tables\` — a real version
  walks the body in order to keep tables in their section.`,
      },
      {
        mode: 'read',
        title: 'Why does this chunk look like this?',
        body: `A chunk from your web-page ingestion:

> Home Products Pricing Blog Login Sign up We use cookies to improve your experience.
> Accept all Reject Refund policy Refunds are processed within 7 working days of approval.
> Related articles How to cancel Change your plan © 2025 Acme Inc. Privacy Terms

What went wrong, what does it do to retrieval, and how do you fix it and catch it next time?`,
        answer: `**The raw HTML was converted to text without main-content extraction.** Navigation,
cookie banner, related links and footer are all in the chunk; the one useful sentence is
buried in the middle.

Effects on retrieval:

- The vector is **diluted**: it's mostly about navigation, so the chunk ranks lower for
  refund questions than it should.
- Every page has the same boilerplate, so **all chunks look alike**, and the unrelated
  ones crowd into the top-k for vague queries.

Fix: \`trafilatura.extract(...)\` (or a site-specific CSS selector for the article body)
before chunking.

Catch it next time: flag chunks where most of the text also appears in many other chunks
(the boilerplate detector in the next topic), and look at the corpus map — boilerplate
shows up as one dense blob.`,
      },
    ],
  },
  {
    id: 's3.3.t3',
    moduleId: 's3.3',
    title: 'Cleaning: boilerplate, duplicates and broken text',
    outcome: `You can strip boilerplate, remove exact and near duplicates, and repair broken text before it reaches the index — and show how much you removed.`,
    minutes: 35,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
    ],
    animations: [],
    analogy: `De-duplicating a contacts list. Exact copies are easy. The real work is "Rahul S." and
"Rahul Sharma" with the same number — and knowing that two different Rahuls with similar
names must *not* be merged.`,
    notes: `## Why clean at all

- **Junk crowds out answers.** Top-5 slots taken by footers are slots the answer didn't get.
- **Duplicates waste the top-k.** Five results, all copies of one paragraph, is one result.
- **Broken text doesn't match.** "ﬁnancial" (with a ligature) never matches "financial".
- **Citations get confusing** — which of the four copies was the source?

---

## Repair the text

\`\`\`python
import re, unicodedata
import ftfy

def clean(text: str) -> str:
    text = ftfy.fix_text(text)                      # "Ã©" -> "é" (broken encodings)
    text = unicodedata.normalize("NFKC", text)      # "ﬁ" -> "fi" (ligatures)
    text = re.sub(r"(\\w)-\\n(\\w)", r"\\1\\2", text)    # "inter-\\nnational" -> "international"
    text = re.sub(r"[ \\t]+", " ", text)             # runs of spaces
    text = re.sub(r"\\n{3,}", "\\n\\n", text)          # runs of blank lines
    return text.strip()
\`\`\`

One trade-off: the hyphen rule also joins a real hyphenated word that happened to break at
a line end ("well-\\nknown" → "wellknown"). Usually acceptable; check a sample.

---

## Boilerplate

**Within a document:** a line that appears near the top or bottom of most pages is a header
or footer. Normalise digits first, so "Page 3 of 40" and "Page 4 of 40" count as the same
line.

**Across documents:** the same legal disclaimer at the end of 3,000 emails. Count how many
documents each paragraph appears in; above a threshold, drop it (or keep one copy as its
own document).

---

## Exact and near duplicates

**Exact:** hash the cleaned text. Keep one copy; record the others as extra sources.

**Near:** MinHash + LSH finds pairs with high word overlap without comparing every pair.

\`\`\`python
from datasketch import MinHash, MinHashLSH

def minhash(text: str, num_perm: int = 128) -> MinHash:
    m = MinHash(num_perm=num_perm)
    words = text.lower().split()
    for i in range(max(1, len(words) - 4)):
        m.update(" ".join(words[i:i + 5]).encode())   # 5-word shingles
    return m

lsh = MinHashLSH(threshold=0.9, num_perm=128)
for doc_id, text in docs:
    m = minhash(text)
    if (matches := lsh.query(m)):
        record_duplicate(doc_id, matches)
    else:
        lsh.insert(doc_id, m)
\`\`\`

---

## The trap: versions are not duplicates

The 2022 and 2025 leave policies may be 90% identical. **The 10% that differs is exactly
what people ask about.** Merging them — or keeping whichever you saw first — is how you get
confidently outdated answers.

Versions are handled with metadata (\`version\`, \`effective_date\`, \`is_latest\`) and a filter,
not with deduplication. Dedup is for true copies: the same file uploaded twice, the same
page reachable at two URLs.

---

## Language, and measuring what you removed

- **Detect the language** of each document or chunk (fastText's language-ID model, or
  \`lingua\`). It tells you which embedding model to use, lets you filter, and very low
  confidence often means OCR garbage.
- **Report every run:** documents in and out, boilerplate lines removed, duplicate
  clusters, languages found.
- **Keep a sample of removed text** and read it now and then. Cleaning rules delete real
  content more often than you'd expect.`,
    docs: [
      {
        label: 'datasketch — MinHash LSH',
        url: 'https://ekzhu.com/datasketch/lsh.html',
      },
      {
        label: 'ftfy — fixes broken Unicode',
        url: 'https://ftfy.readthedocs.io/',
      },
      {
        label: 'Python — unicodedata.normalize',
        url: 'https://docs.python.org/3/library/unicodedata.html#unicodedata.normalize',
      },
    ],
    glossary: [
      {
        term: 'boilerplate',
        def: 'Text repeated across pages or documents that carries no answer — headers, footers, disclaimers.',
      },
      {
        term: 'near-duplicate',
        def: 'A document almost identical to another, differing only in small details.',
      },
      {
        term: 'MinHash / LSH',
        def: 'A technique for finding near-duplicates quickly without comparing every pair.',
      },
      {
        term: 'NFKC',
        def: `A Unicode normalisation that replaces compatibility characters, like ligatures, with plain equivalents.`,
      },
      {
        term: 'shingle',
        def: 'A short overlapping run of words (e.g. 5 words) used to compare texts.',
      },
    ],
    check: [
      {
        q: 'Why normalise digits before counting repeated header lines?',
        a: `Page numbers differ on every page. Replacing digits makes "Page 3 of 40" and "Page 4 of 40" the same line, so the footer is detected.`,
      },
      {
        q: 'What does NFKC normalisation fix that matters for search?',
        a: 'Compatibility characters such as ligatures: "ﬁ" becomes "fi", so the word matches normal text.',
      },
      {
        q: 'Why must two versions of a policy not be de-duplicated?',
        a: `The small part that differs is exactly what people ask about. Versions are handled with metadata and a latest-version filter, not by merging.`,
      },
      {
        q: 'What does MinHash + LSH let you avoid?',
        a: `Comparing every pair of documents. It finds likely near-duplicates quickly by hashing overlapping word sequences.`,
      },
    ],
    practice: [
      {
        mode: 'primitive',
        title: 'Write the header/footer detector',
        body: `Without AI: \`repeated_lines(pages: list[str], edge: int = 3, share: float = 0.5) -> set[str]\`.

Look at the first and last \`edge\` lines of every page. Normalise digits to \`#\`. Return the
normalised lines that appear on at least \`share\` of the pages. Then write
\`strip_lines(page, repeated)\`.`,
        answer: `\`\`\`python
import re
from collections import Counter

def norm(line: str) -> str:
    return re.sub(r"\\d+", "#", line.strip().lower())

def repeated_lines(pages: list[str], edge: int = 3, share: float = 0.5) -> set[str]:
    counts, considered = Counter(), 0
    for page in pages:
        lines = [l for l in page.splitlines() if l.strip()]
        if len(lines) <= 2 * edge:
            continue                              # too short to tell edges from body
        considered += 1
        counts.update({norm(l) for l in lines[:edge] + lines[-edge:]})   # once per page
    need = max(2, int(considered * share))
    return {line for line, n in counts.items() if n >= need}

def strip_lines(page: str, repeated: set[str]) -> str:
    return "\\n".join(l for l in page.splitlines() if norm(l) not in repeated)
\`\`\`

Details that matter:

- A **set per page**, so a line repeated twice on one page counts once.
- **Short pages are skipped:** on a page with six lines, every line is an "edge" line,
  and body text would be counted as header or footer.
- \`max(2, ...)\` so a two-page document doesn't treat every line as a header.
- It only looks at page **edges**, so a genuinely repeated sentence in the body survives.`,
      },
      {
        mode: 'decision',
        title: 'Merge or keep?',
        body: `For each pair, decide: merge as duplicates, keep both, or something else.

1. The same PDF uploaded twice by two different people.
2. Leave Policy 2022 and Leave Policy 2025 — 88% similar.
3. The same FAQ answer in English and in Hindi.
4. A 12-message email thread where each reply quotes everything before it.
5. One help article reachable at \`/help/refunds\` and \`/help/refunds?ref=footer\`.`,
        answer: `1. **Merge.** Keep one copy; store both uploaders as sources if that matters for
   permissions.
2. **Keep both, with version metadata.** Filter to the latest by default; allow the old one
   for "what did the 2022 policy say?" questions.
3. **Keep both.** They serve different users, and they're not near-duplicates by word
   overlap anyway. Tag each with its language.
4. **Strip the quoted text from each message**, keeping only what's new in it. Otherwise
   the first message is effectively indexed twelve times.
5. **Merge by canonical URL:** strip tracking parameters (or read the page's
   \`rel=canonical\` link) before hashing, and the duplicate never enters.`,
      },
      {
        mode: 'break',
        title: 'Clean too hard',
        body: `Set the boilerplate threshold to 20% of pages instead of 50%, and the near-duplicate
threshold to 0.7 instead of 0.9. Re-ingest and re-run your golden set.

Find at least one real fact that disappeared, and explain how it happened.`,
        answer: `What typically disappears:

- **Repeated table headers or section labels** that appear on many pages of a long table
  get stripped as "headers" — and the rows lose their column names.
- **Recurring but meaningful lines**, like a clause repeated on many pages of a contract
  ("Subject to clause 4.2"), vanish.
- At 0.7 similarity, **different versions or sibling documents** (two regional policies
  that share most of their wording) get merged, and one region's answers now come from
  the other region's document.

You find it by the golden set dropping, and by reading the removed-text sample. Two
habits follow: change cleaning thresholds only with the eval running, and always keep
the removed-text log.`,
      },
    ],
  },
  {
    id: 's3.3.t4',
    moduleId: 's3.3',
    title: 'Metadata design',
    outcome: `You can design a corpus's metadata before ingesting it, so filtering by date, source, section, tenant and permission works from day one.`,
    minutes: 35,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
    ],
    animations: [],
    analogy: `Adding a \`createdAt\` field to a MongoDB collection after a year in production: old
documents don't have it, and backfilling is guesswork. Metadata is the same. Whatever you
didn't store at ingestion time, you can't filter on later.`,
    notes: `## The highest-return 30 minutes in RAG

Metadata is what makes these possible:

- **Filters:** "only 2025 policies", "only the Pune office", "only product X".
- **Permissions:** only retrieve what this user may see.
- **Citations:** a clickable page and section, not just a file name.
- **Freshness:** prefer the latest version.
- **Deletes and updates:** find every chunk that came from this document.
- **Debugging:** which pipeline version and model produced this chunk?

---

## The field list

| Field | Used for |
|---|---|
| \`source_uri\`, \`title\` | citations, updates, dedup |
| \`section_path\` | citations, chunk context ("Leave › Probation") |
| \`page_start\`, \`page_end\` | clickable page citations |
| \`doc_type\`, \`language\` | filters, routing |
| \`effective_date\`, \`version\`, \`is_latest\` | freshness and version filters |
| \`tenant_id\` | isolating customers from each other |
| \`acl_groups\` | per-user permissions |
| \`content_hash\` | change detection, dedup |
| \`pipeline_version\`, \`embedding_model\` | re-processing, migrations |

---

## The schema

\`\`\`sql
CREATE TABLE documents (
  id               uuid PRIMARY KEY,
  tenant_id        uuid NOT NULL,
  source_uri       text NOT NULL,
  title            text,
  doc_type         text,
  version          text,
  effective_date   date,
  is_latest        boolean NOT NULL DEFAULT true,
  acl_groups       text[] NOT NULL,
  content_hash     text NOT NULL,
  pipeline_version int  NOT NULL,
  UNIQUE (tenant_id, source_uri)
);

CREATE TABLE chunks (
  id              bigserial PRIMARY KEY,
  document_id     uuid NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  tenant_id       uuid NOT NULL,          -- copied here so searches filter without a join
  chunk_index     int  NOT NULL,
  section_path    text[],
  page_start      int,
  page_end        int,
  text            text NOT NULL,
  embedding       vector(1024),
  embedding_model text NOT NULL,
  UNIQUE (document_id, chunk_index)
);
\`\`\`

\`ON DELETE CASCADE\` means deleting a document removes its chunks — one statement for a delete.

---

## Filters in the query

\`\`\`sql
SELECT c.id, c.text, d.title, c.section_path, c.page_start
FROM chunks c
JOIN documents d ON d.id = c.document_id
WHERE c.tenant_id = $1
  AND d.acl_groups && $2        -- the user shares at least one group
  AND d.is_latest
ORDER BY c.embedding <=> $3
LIMIT 20;
\`\`\`

\`&&\` is Postgres's "arrays overlap" operator. Filters and approximate vector search interact
in a way that can quietly return fewer results than you asked for — Module 5 covers that.

---

## What the model sees vs what you filter on

- **Give the model:** title, section path, date, page. They help it answer ("as of the 2025
  policy…") and cite.
- **Keep out of the prompt:** IDs, ACL groups, hashes, tenant IDs. They're noise to the
  model, and some are sensitive.

---

## Where metadata comes from

1. **The source system** — Google Drive, Confluence and SharePoint APIs give the owner,
   modified time and permissions.
2. **The document** — title, headings, dates in the text.
3. **A model** — document type or effective date, extracted with structured outputs
   (Stage 2) and validated. Cheap with a small model, run once per document.`,
    docs: [
      {
        label: 'PostgreSQL — array operators (&&)',
        url: 'https://www.postgresql.org/docs/current/functions-array.html',
      },
      {
        label: 'PostgreSQL — row security policies',
        url: 'https://www.postgresql.org/docs/current/ddl-rowsecurity.html',
      },
    ],
    glossary: [
      {
        term: 'metadata',
        def: 'Data about a chunk or document — its source, date, section, owner, permissions.',
      },
      {
        term: 'tenant',
        def: 'One customer\'s isolated slice of a shared system.',
      },
      {
        term: 'ACL',
        def: 'Access control list — who is allowed to see something.',
      },
      {
        term: 'row-level security',
        def: 'Postgres policies that filter rows per user automatically, even if a query forgets to.',
      },
      {
        term: 'section path',
        def: 'The chain of headings above a chunk, like Leave › Probation.',
      },
    ],
    check: [
      {
        q: 'Why copy `tenant_id` onto the chunks table?',
        a: `So the vector search can filter by tenant without a join, which keeps the query simple and fast and makes tenant filtering hard to forget.`,
      },
      {
        q: 'What does `acl_groups && $2` check?',
        a: `That the document's groups and the user's groups overlap — the user belongs to at least one group allowed to see it.`,
      },
      {
        q: 'Which metadata should go into the prompt, and which should stay out?',
        a: `Title, section path, date and page help the model answer and cite. IDs, ACLs, hashes and tenant IDs stay out.`,
      },
      {
        q: 'Why is metadata cheap now and expensive later?',
        a: `Adding a field later means re-ingesting or backfilling every document, often by guessing. At ingestion time it's one more column.`,
      },
    ],
    practice: [
      {
        mode: 'spec',
        title: 'Design the metadata for p-3.1',
        body: `Take the corpus you'll use for p-3.1. Write its metadata spec: every field, where its
value comes from (source system, the document, or a model), and whether it's used for
filtering, display, or both.

Then list three questions users will ask that your metadata makes possible.`,
        answer: `A strong spec reads like this (adapt to your corpus):

| Field | Source | Filter | Display |
|---|---|---|---|
| \`title\` | document / file name | | ✓ |
| \`section_path\` | headings during parsing | | ✓ |
| \`page_start\`/\`page_end\` | parser | | ✓ (citation link) |
| \`doc_type\` (policy, contract, FAQ…) | small-model classification | ✓ | |
| \`effective_date\` | regex, then a model if missing | ✓ | ✓ |
| \`version\`, \`is_latest\` | file name / document control table | ✓ | ✓ |
| \`acl_groups\` | source permissions | ✓ | |
| \`content_hash\`, \`pipeline_version\`, \`embedding_model\` | pipeline | internal | |

Three questions it enables:

- "What did the **2023** travel policy say about per-diem?" → \`effective_date\` filter.
- "Show me only **contracts** that mention indemnity" → \`doc_type\` filter.
- "Where exactly does it say that?" → page + section citation.

The review question to ask yourself: which field would be most painful to add in six
months? Build that one first.`,
      },
      {
        mode: 'read',
        title: 'What can\'t this system do?',
        body: `An existing system stores exactly this per chunk: \`{"filename": "policy_v3_final_FINAL.pdf", "chunk_id": 1832}\`.

List every request from users or the business that this makes impossible or fragile.`,
        answer: `- **"Only current policies"** — no version or date field. The version is buried in a
  messy file name.
- **"Only documents I'm allowed to see"** — no permissions at all.
- **"Show me the page"** — no page numbers, so citations can only name a file.
- **"Which section says this?"** — no section path.
- **"Delete everything from this document"** — possible by file name, but fragile:
  renaming the file breaks it, and two files can share a name.
- **"Which chunks came from the old parser?"** — no pipeline version, so a partial
  re-ingest can't be tracked.
- **"Separate customer A's data from B's"** — no tenant.

Every item here is a re-ingest of the whole corpus to fix. That's the argument for
designing metadata first.`,
      },
      {
        mode: 'decision',
        title: 'Where do permissions live?',
        body: `Three proposals for enforcing document permissions:

A. Filter in the SQL query with \`acl_groups && user_groups\`.
B. Retrieve the top 20 without filtering, then drop the ones the user can't see in Python.
C. Pass everything to the model with a note: "Don't reveal documents from HR-restricted."

Rank them and explain.`,
        answer: `**A is correct; B is a weaker fallback; C is never acceptable.**

- **A** enforces permissions before anything leaves the database. Add Postgres row-level
  security as a second layer, so a forgotten \`WHERE\` can't leak.
- **B** leaks nothing to the user, but restricted text still passes through your app
  (logs, traces, caches), and the user can get **fewer than 20 results** — sometimes
  none — when most of the top 20 is restricted.
- **C** puts restricted text in the prompt and relies on the model to keep a secret. A
  prompt injection or a clever question gets it out. The rule: **the model must never
  see what the user isn't allowed to see.**`,
      },
    ],
  },
  {
    id: 's3.3.t5',
    moduleId: 's3.3',
    title: 'Incremental sync',
    outcome: `You can keep the index in step with a changing source — adds, edits and deletes — without re-processing everything, and re-running a sync is always safe.`,
    minutes: 35,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
    ],
    animations: ['anim-incremental-sync'],
    analogy: `\`git status\` compares what you have with what's there and only touches what changed. And
like a \`git pull\` you can run twice without harm, a sync must be safe to repeat.`,
    notes: `## Four things can happen to a source document

1. **Added** — new file.
2. **Changed** — same file, new content.
3. **Deleted** — gone from the source.
4. **Metadata changed** — renamed, moved, permissions changed, content untouched.

A sync has to handle all four. Most first versions only handle the first.

---

## Detecting change cheaply

Check the cheap signal first, then confirm:

1. The source's own signal — modified time, ETag, version ID, a change feed.
2. A **content hash** of the file or its extracted text. Same hash → skip.

The hash is the one you trust: modified times change when someone opens and re-saves a
file without editing it.

---

## Replacing a changed document

The simplest correct approach: replace all its chunks **in one transaction**.

\`\`\`python
async with conn.transaction():
    await conn.execute("DELETE FROM chunks WHERE document_id = $1", doc_id)
    await conn.executemany(INSERT_CHUNK, new_rows)
    await conn.execute(
        "UPDATE documents SET content_hash = $2, pipeline_version = $3 WHERE id = $1",
        doc_id, new_hash, PIPELINE_VERSION,
    )
\`\`\`

Readers never see a half-updated document. And with the embedding cache from Module 2,
chunks whose text didn't change cost nothing to "re-embed".

---

## Deletes: the event sources don't send

Most sources won't tell you a file was deleted. The pattern is **mark and sweep**:

1. Every full sync stamps each document it sees with the sync's ID.
2. After a *successful* sync, delete documents from that source with an older stamp.

The guard that matters: **if the sync saw far fewer documents than last time, don't
sweep.** An expired token that lists zero files must not delete your whole index.

Use change feeds or webhooks where the source offers them — faster, and less work for both
sides.

---

## Safe to run twice

**Idempotent** means running the same sync again changes nothing:

- documents are upserted on \`(tenant_id, source_uri)\`
- chunks are keyed on \`(document_id, chunk_index)\`
- unchanged hashes are skipped

Then a crashed sync can simply be re-run. No clean-up scripts, no "did it run twice?"

---

## Two special cases

**Permission changes are urgent.** When someone loses access, the index should reflect it
within minutes. Sync permissions as a separate, frequent job that only updates metadata —
no parsing, no embedding.

**Pipeline changes.** When the chunker or cleaner changes, bump \`PIPELINE_VERSION\`. A
background job re-processes older documents, a few at a time. Mixed chunking during the
transition is fine. A mixed **embedding model** is not — that needs the blue/green switch
from Module 2.`,
    docs: [
      {
        label: 'PostgreSQL — INSERT ... ON CONFLICT (upsert)',
        url: 'https://www.postgresql.org/docs/current/sql-insert.html',
      },
      {
        label: 'Google Drive API — tracking changes',
        url: 'https://developers.google.com/workspace/drive/api/guides/manage-changes',
      },
    ],
    glossary: [
      {
        term: 'incremental sync',
        def: 'Updating the index with only what changed, instead of rebuilding everything.',
      },
      {
        term: 'idempotent',
        def: 'Safe to run again: repeating the operation leaves the same result.',
      },
      {
        term: 'mark and sweep',
        def: 'Stamp everything you see, then remove what wasn\'t stamped.',
      },
      {
        term: 'soft delete',
        def: 'Marking something deleted and hiding it, before actually removing it later.',
      },
      {
        term: 'change feed',
        def: 'A source\'s stream of what changed, so you don\'t have to re-list everything.',
      },
    ],
    check: [
      {
        q: 'Why confirm a change with a content hash instead of trusting the modified time?',
        a: `Modified times change without real edits (re-saves, copies). The hash changes only when the content does.`,
      },
      {
        q: 'Why replace a document\'s chunks inside a transaction?',
        a: 'So readers never see a half-updated document — old chunks deleted but new ones not yet inserted.',
      },
      {
        q: 'What guard stops mark-and-sweep from deleting the whole index?',
        a: `Only sweep after a successful sync, and skip the sweep if it saw far fewer documents than the previous sync.`,
      },
      {
        q: 'Why sync permissions separately from content?',
        a: `Permission changes are urgent and need no parsing or embedding. A small, frequent metadata-only job applies them within minutes.`,
      },
    ],
    practice: [
      {
        mode: 'primitive',
        title: 'Write the diff',
        body: `Without AI: \`diff(previous: dict[str, str], current: dict[str, str])\`, where each maps a
document URI to its content hash. Return four sets: added, changed, deleted, unchanged.

Then add the guard: raise an error instead of returning deletes if \`current\` has fewer
than 50% of \`previous\`'s documents.`,
        answer: `\`\`\`python
class SuspiciousSync(Exception):
    pass

def diff(previous: dict[str, str], current: dict[str, str], min_share: float = 0.5):
    if previous and len(current) < len(previous) * min_share:
        raise SuspiciousSync(f"saw {len(current)} documents, expected ~{len(previous)}")

    prev, cur = previous.keys(), current.keys()
    added = cur - prev
    deleted = prev - cur
    both = prev & cur
    changed = {u for u in both if previous[u] != current[u]}
    unchanged = both - changed
    return added, changed, deleted, unchanged
\`\`\`

Dict key views support set operations directly (\`-\`, \`&\`), which keeps it short.

The guard raises instead of silently skipping, so a failed listing becomes a visible
alert, not a quiet "0 deleted". A human can then decide whether the mass delete was real
(someone archived a whole folder).`,
      },
      {
        mode: 'break',
        title: 'The sweep that deleted everything',
        body: `Monday 02:00: the Drive connector's token expired. The API returned an empty listing
without an error. The nightly sync treated every document as deleted and removed all of
them. At 09:00, every answer was "I couldn't find that in the documents."

List every safeguard that would have prevented or limited this.`,
        answer: `- **Treat an empty or tiny listing as a failure** — the 50% guard from the previous
  exercise.
- **Check the listing call properly:** an expired token should raise; if the client
  swallows it, validate that the response looks complete (a page count, a total, a
  root folder that exists).
- **Soft delete first:** mark documents \`deleted_at = now()\` and exclude them from
  search, but purge only after a delay (say 7 days). A restore is then one \`UPDATE\`.
- **Alert on large deltas:** "sync deleted 100% of documents" should page someone, not
  wait for users.
- **A golden-set smoke test after each sync:** five questions that must still retrieve
  their sources. It would have failed at 02:05.

The general lesson: a destructive step should be the most defended step in a pipeline.`,
      },
      {
        mode: 'decision',
        title: 'Access removed at 10:00',
        body: `At 10:00, an employee moves teams and loses access to the Finance folder. Your content
sync runs nightly. When should they stop getting Finance answers, and how do you design for it?`,
        answer: `**Target: within minutes, not overnight.** Access removal is a security event.

Design:

1. A **permissions sync** separate from the content sync: it polls the source's
   permission changes (or receives webhooks) every few minutes and updates only
   \`acl_groups\` on documents. No parsing, no embedding — cheap enough to run often.
2. **User group membership** looked up per request from the identity provider, cached
   briefly (a few minutes at most).
3. For **high-stakes sources**, check permissions against the source at query time for
   the final few documents, before they enter the prompt.

And test it: a script that removes a test user's access and asserts their Finance
questions stop retrieving Finance documents within the target time.`,
      },
    ],
  },
  {
    id: 's3.3.t6',
    moduleId: 's3.3',
    title: 'The ingestion pipeline',
    outcome: `You can run ingestion as a queue of resumable jobs, with retries, a dead-letter list and a view of exactly what failed and why.`,
    minutes: 40,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
    ],
    animations: ['anim-ingest-jobs'],
    analogy: `An e-commerce order: placed → paid → packed → shipped. Each step is recorded, a failed
payment is retried, a stuck order shows up for support. Documents move through parse →
chunk → embed → index in exactly the same way.`,
    notes: `## Why not a script

A script that loops over 8,000 files:

- dies at file 3,812 on one malformed PDF, and you start again from zero
- leaves no record of which files failed, or why
- can't run on two machines at once
- hits the embedding rate limit and crashes instead of waiting

A pipeline makes each document a **job** with a **status**. Failures are isolated,
retried, and visible.

---

## The job table

\`\`\`sql
CREATE TABLE ingest_jobs (
  id           bigserial PRIMARY KEY,
  document_uri text NOT NULL,
  stage        text NOT NULL DEFAULT 'parse',   -- parse, chunk, embed, index, done
  status       text NOT NULL DEFAULT 'queued',  -- queued, running, failed, dead, done
  attempts     int  NOT NULL DEFAULT 0,
  locked_until timestamptz,
  last_error   text,
  created_at   timestamptz NOT NULL DEFAULT now()
);
\`\`\`

Claiming work safely, with several workers:

\`\`\`sql
UPDATE ingest_jobs
SET status = 'running', attempts = attempts + 1,
    locked_until = now() + interval '10 minutes'
WHERE id = (
  SELECT id FROM ingest_jobs
  WHERE status = 'queued'
     OR (status = 'running' AND locked_until < now())   -- a crashed worker's job
  ORDER BY created_at
  FOR UPDATE SKIP LOCKED
  LIMIT 1
)
RETURNING id, document_uri, stage;
\`\`\`

\`SKIP LOCKED\` lets many workers pull from one table without ever grabbing the same job.

---

## The worker loop

1. Claim a job.
2. Run **its current stage**, and save that stage's output (parsed text, chunk rows…).
3. Advance \`stage\`, set \`status = 'queued'\` — or \`done\` after the last stage.
4. On error: store \`last_error\`, requeue with a backoff delay; after N attempts, set
   \`status = 'dead'\`.

Because each stage saves its output, a retry resumes **where it failed**. A 429 from the
embedding API retries the embed step, not the 40-second parse.

---

## Limits and backpressure

- Cap how many **embed** steps run at once (your rate limit), separately from parsing
  (your CPU).
- Give each job a **timeout and size limit** — one 900 MB scan shouldn't stall a worker
  for an hour.
- Retry transient failures (429, 5xx, timeouts). Don't retry permanent ones (encrypted
  PDF, unsupported format) — send them straight to \`dead\` with a clear reason.

---

## See what's happening

A few queries answer most questions:

\`\`\`sql
SELECT stage, status, count(*) FROM ingest_jobs GROUP BY 1, 2;   -- where is everything?

SELECT left(last_error, 80) AS error, count(*)                   -- why do things fail?
FROM ingest_jobs WHERE status = 'dead' GROUP BY 1 ORDER BY 2 DESC;
\`\`\`

Plus the silent-failure checks: **documents that produced zero chunks**, and documents
with very few characters per page. Alert when the dead share or the oldest queued job's age
crosses a line.

---

## Which queue

- **Postgres table + \`SKIP LOCKED\`** — no new infrastructure; fine for thousands of
  documents a day.
- **Redis-based queues** (arq, RQ) or **Celery** — when you already run Redis or need more
  throughput.
- **Cloud queues** (SQS) or **workflow engines** (Temporal) — for large scale or long,
  multi-step flows with many external calls.

Start with the Postgres table. It's the easiest to inspect — you query it with SQL.`,
    docs: [
      {
        label: 'PostgreSQL — SELECT ... FOR UPDATE SKIP LOCKED',
        url: 'https://www.postgresql.org/docs/current/sql-select.html#SQL-FOR-UPDATE-SHARE',
      },
      {
        label: 'arq — async job queue for Python',
        url: 'https://arq-docs.helpmanual.io/',
      },
    ],
    glossary: [
      {
        term: 'job',
        def: 'One unit of work in a queue — here, one document moving through the stages.',
      },
      {
        term: 'lease',
        def: 'A time-limited claim on a job; if the worker dies, the job becomes available again.',
      },
      {
        term: 'dead-letter',
        def: 'Where jobs go after too many failures, kept for inspection instead of retried forever.',
      },
      {
        term: 'backpressure',
        def: 'Slowing intake when a later step can\'t keep up.',
      },
      {
        term: 'poison message',
        def: 'A job that fails every time and can block a queue if not handled.',
      },
    ],
    check: [
      {
        q: 'What does `FOR UPDATE SKIP LOCKED` do in the claim query?',
        a: `Locks the chosen row and makes other workers skip rows that are already locked, so two workers never claim the same job.`,
      },
      {
        q: 'Why save each stage\'s output?',
        a: `So a retry resumes from the failed stage instead of redoing everything — a rate-limited embed doesn't re-run the parse.`,
      },
      {
        q: 'Which failures should not be retried?',
        a: `Permanent ones: encrypted or corrupt files, unsupported formats. Send them straight to dead with a clear reason.`,
      },
      {
        q: 'Name a silent failure the job statuses alone won\'t show.',
        a: `A document that 'succeeded' but produced zero chunks — or a scan with a few characters per page that never got OCR'd.`,
      },
    ],
    practice: [
      {
        mode: 'spec',
        title: 'Spec the job table and worker',
        body: `Write the spec for your ingestion jobs: the table, the claim query, the worker loop, the
retry policy (which errors, how many attempts, what backoff), and what each stage saves.
Have AI implement it.

Then write two tests before trusting it: kill a worker mid-job, and ingest a file that
always crashes the parser.`,
        answer: `The spec should pin down:

- **Table** as in the slides, plus \`next_attempt_at\` for backoff (claim only jobs where
  \`next_attempt_at <= now()\`).
- **Retry policy:** transient errors (429, 5xx, timeouts) → retry with exponential
  backoff plus jitter, up to 5 attempts; permanent errors → \`dead\` immediately.
- **Stage outputs:** parse → extracted markdown saved (object storage or a table);
  chunk → chunk rows without vectors; embed → vectors filled in; index → document marked
  live. Each write is idempotent (upsert or delete-then-insert in a transaction).

**Test 1 — kill a worker mid-job:** start a job, kill the process, wait past
\`locked_until\`, start another worker. Expected: it re-claims the job and finishes, with
no duplicate chunks (idempotent writes are what guarantee that).

**Test 2 — poison file:** a file that always crashes the parser. Expected: 5 attempts
(or fewer for a permanent error), then \`dead\` with the error message, **while other jobs
keep flowing.** If other jobs stall, the worker isn't isolating failures.`,
      },
      {
        mode: 'break',
        title: 'The poison document',
        body: `A user uploads a 900 MB scanned PDF. Your worker loads the whole file into memory and
the process is killed for running out of memory. The job's lease expires; another worker
claims it and dies the same way. Then another.

What happens to the rest of the queue, and what are the fixes?`,
        answer: `What happens: every worker in turn claims the poison job, dies, and restarts. Its
\`attempts\` counter may never increment properly (the process died before recording the
failure). **The whole pipeline stalls behind one file.**

Fixes, in layers:

1. **Increment \`attempts\` when claiming** (as in the claim query), not after failing —
   so a job that kills its worker still counts toward the limit and ends up \`dead\`.
2. **Check size and page count before parsing.** Over a limit → a separate, slower path
   with more memory, or reject with a clear message to the user.
3. **Stream page by page** instead of loading the whole file.
4. **Isolate the parse step** in a subprocess with a memory limit, so a crash kills the
   subprocess, not the worker.
5. **Alert** when the same job has been claimed several times.

The first fix is the most important, and the most commonly missed.`,
      },
      {
        mode: 'tool',
        title: 'Build the failures view',
        body: `Write the SQL for a small ingestion dashboard: jobs by stage and status, the top dead
reasons, the age of the oldest queued job, and documents that finished with zero chunks.`,
        answer: `\`\`\`sql
-- 1. Where is everything?
SELECT stage, status, count(*) FROM ingest_jobs GROUP BY 1, 2 ORDER BY 1, 2;

-- 2. Why do jobs die?
SELECT left(last_error, 100) AS error, count(*) AS jobs
FROM ingest_jobs WHERE status = 'dead'
GROUP BY 1 ORDER BY 2 DESC LIMIT 10;

-- 3. Is the queue keeping up?
SELECT now() - min(created_at) AS oldest_queued
FROM ingest_jobs WHERE status = 'queued';

-- 4. Silent failures: finished, but nothing searchable
SELECT d.source_uri
FROM documents d
LEFT JOIN chunks c ON c.document_id = d.id
GROUP BY d.id, d.source_uri
HAVING count(c.id) = 0;
\`\`\`

Put these on one admin page (FastAPI + a template is plenty), and wire two alerts: dead
jobs above a few percent of the day's jobs, and the oldest queued job older than an
hour. Query 4 is the one that catches the bugs nobody reports.`,
      },
    ],
  },
];
