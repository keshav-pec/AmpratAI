import type { Topic } from '@/lib/types';

export const s2_6: Topic[] = [
  {
    id: 's2.6.t1',
    moduleId: 's2.6',
    title: 'Images in prompts',
    outcome: `You can send images to a model, predict what they'll cost, and decide when plain OCR is the better tool.`,
    minutes: 30,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
    ],
    animations: [],
    analogy: `You've optimised images for the web: resize before upload, don't ship a 6000-pixel photo
to a 300-pixel slot. Images sent to a model follow the same logic, except the cost is tokens
instead of bandwidth.`,
    notes: `## Sending an image

\`\`\`python
import base64

data = base64.standard_b64encode(open("receipt.jpg", "rb").read()).decode()

r = await client.messages.create(
    model="claude-haiku-4-5",
    max_tokens=1024,
    messages=[{"role": "user", "content": [
        {"type": "image", "source": {"type": "base64", "media_type": "image/jpeg", "data": data}},
        {"type": "text", "text": "What is the total amount on this receipt?"},
    ]}],
)
\`\`\`

A message's content becomes a **list of blocks** — image first, then the question. Images
placed before the text tend to work best.

---

## What an image costs

The model sees an image as a grid of 28×28-pixel patches, and each patch is a token:

\`\`\`
tokens ≈ ceil(width / 28) × ceil(height / 28)
1000 × 1000 px  →  36 × 36  =  1,296 tokens
\`\`\`

Very large images are scaled down to the model's maximum resolution first, so a huge photo
doesn't cost unlimited tokens — but you pay the upload and the processing. **Resize before
sending** to the smallest size that keeps the detail you need.

---

## When to use OCR instead

Reading text out of a clean scan is a job for OCR, which is cheap and fast. Use a model
when the task needs *understanding*:

- **OCR:** extracting printed text from clean documents at volume
- **Model:** reading a messy handwritten note, interpreting a chart, understanding a form's layout, answering a question about what's in a photo

A common pattern: OCR first, and send the image to a model only for pages where OCR
confidence is low.

---

## Limits worth knowing

- Requests with many images have stricter per-image size limits — resize to at most 2000 px per side if you send more than twenty
- Every image you resend in conversation history is paid for again — don't keep old images in the history if they're no longer needed`,
    docs: [
      {
        label: 'Anthropic — vision',
        url: 'https://platform.claude.com/docs/en/build-with-claude/vision',
      },
    ],
    glossary: [
      {
        term: 'vision',
        def: 'A model\'s ability to take images as input.',
      },
      {
        term: 'image block',
        def: 'One image in a message\'s content list.',
      },
      {
        term: 'OCR',
        def: 'Optical character recognition — extracting printed text from images, cheaply and quickly.',
      },
    ],
    check: [
      {
        q: 'Roughly how many tokens is a 1000×1000 image?',
        a: 'About 1,296 — the image is split into 28×28-pixel patches, 36 by 36.',
      },
      {
        q: 'Where should the image go relative to the question?',
        a: 'Before the text question.',
      },
      {
        q: 'When is OCR the better tool?',
        a: `Extracting printed text from clean documents at volume. Use a model when the task needs understanding — messy handwriting, charts, layout, photos.`,
      },
      {
        q: 'Why remove old images from conversation history?',
        a: 'Every image in the history is paid for again on each request.',
      },
    ],
    practice: [
      {
        mode: 'tool',
        title: 'Measure image cost at three sizes',
        body: `Send the same receipt photo at three sizes — the original, 1024 px on the long side, and
512 px — and ask for the total each time. Record input tokens and whether the answer was
right.`,
        answer: `Input tokens should drop sharply with size, roughly following the patch formula — until
the original is larger than the model's maximum resolution, at which point it's scaled
down anyway and costs about the same as the capped size.

Correctness usually holds at 1024 px for a typical receipt and may fail at 512 px if the
numbers become too small. **The smallest size that still reads correctly is the one to
use** — and you only find it by testing on your real images.`,
      },
      {
        mode: 'decision',
        title: 'Model or OCR?',
        body: `For each, choose OCR, a model, or both, and say why in one line:

1. Digitising 40,000 typed rental agreements for keyword search
2. Reading doctors' handwritten prescriptions
3. Checking whether a product photo shows the item the seller listed
4. Extracting the table of fees from scanned university notices`,
        answer: `1. **OCR.** Clean typed text at high volume; a model would multiply the cost for no gain.
2. **A model** — handwriting like this defeats most OCR — and a human check, because a misread medicine name is dangerous.
3. **A model.** It's a visual understanding question; OCR has nothing to read.
4. **Both.** OCR for the text, then a model to rebuild the table structure where OCR loses the layout — or send the page image directly for pages where OCR fails.`,
      },
    ],
  },
  {
    id: 's2.6.t2',
    moduleId: 's2.6',
    title: 'PDFs: send the file, or extract the text?',
    outcome: `You can choose between sending a PDF directly and extracting its text yourself, based on what the task needs and what it costs.`,
    minutes: 30,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
    ],
    animations: [],
    analogy: `You could send a whole database dump to the frontend and filter it there — or query for
what you need. Sending a PDF to a model is the first option. Sometimes that's right; for a
large corpus it never is.`,
    notes: `## Sending a PDF directly

\`\`\`python
pdf = base64.standard_b64encode(open("policy.pdf", "rb").read()).decode()

content = [
    {"type": "document", "source": {"type": "base64", "media_type": "application/pdf", "data": pdf}},
    {"type": "text", "text": "What does this policy exclude?"},
]
\`\`\`

The model processes **each page as both text and an image**, so it can read charts, tables
and layout — not just the characters.

---

## What that costs

Because every page is also an image, a PDF costs far more than its text alone — several
times more, depending on the page. The documentation's example: a three-page PDF is
roughly 1,000 tokens as extracted text, and roughly 7,000 with full visual processing.

Limits: 32 MB per request, and up to 600 pages (100 on models with smaller context
windows) — though a dense PDF can fill the context window well before that.

---

## The decision

**Send the PDF when** it's one or a few documents, the layout or charts matter, and the
question is about the whole document — "summarise this contract", "what does this chart
show".

**Extract the text yourself when** you have many documents, the same documents are asked
about repeatedly, or you only need the relevant parts. That's retrieval — **Stage 3** — and
it is how you'd handle 500 pages of regulations: extract once, chunk, embed, and send only
the few relevant passages per question.

---

## Citations

For questions over documents you send, you can turn on **citations**: the model's answer
comes back with pointers to the exact passages — page numbers for PDFs — it relied on. That
is the verifiable-answer behaviour your P3.1 project needs, available natively when you send
the documents directly.`,
    docs: [
      {
        label: 'Anthropic — PDF support',
        url: 'https://platform.claude.com/docs/en/build-with-claude/pdf-support',
      },
      {
        label: 'Anthropic — citations',
        url: 'https://platform.claude.com/docs/en/build-with-claude/citations',
      },
    ],
    glossary: [
      {
        term: 'document block',
        def: 'A PDF or text document included in a message\'s content.',
      },
      {
        term: 'citations',
        def: 'Pointers in an answer to the exact source passages it used.',
      },
      {
        term: 'text extraction',
        def: 'Pulling the text out of a PDF yourself, losing layout and images.',
      },
    ],
    check: [
      {
        q: 'Why does a PDF sent directly cost more than its text?',
        a: 'Each page is processed as both text and an image.',
      },
      {
        q: 'When is sending a PDF directly the right choice?',
        a: `For one or a few documents where layout or charts matter, and the question is about the whole document.`,
      },
      {
        q: 'When should you extract text yourself instead?',
        a: `For many documents, repeated questions over the same documents, or when only the relevant parts are needed — that's retrieval.`,
      },
      {
        q: 'What do citations add to an answer?',
        a: `Pointers to the exact passages — page numbers for PDFs — the answer relied on, so it can be verified.`,
      },
    ],
    practice: [
      {
        mode: 'tool',
        title: 'Compare the two approaches on one document',
        body: `Take a 10–20 page PDF with at least one table or chart. Ask the same three questions
twice: once sending the PDF, once sending text you extracted with \`pypdf\`. Record input
tokens and correctness for each.`,
        answer: `Expected:

- **Input tokens** are several times higher for the native PDF.
- **Plain-text questions** — "what is the notice period?" — are usually answered correctly both ways.
- **Table and chart questions** often fail on extracted text: \`pypdf\` flattens tables into a jumble of numbers, and charts vanish entirely. The native PDF handles them.

That split is the decision rule in practice: extracted text for text-heavy retrieval at
scale, native PDF (or page images) for the visual pages. Stage 3's ingestion module
builds exactly this hybrid.`,
      },
      {
        mode: 'decision',
        title: 'Price it',
        body: `A user uploads a 40-page PDF policy and asks 15 questions over a session. Compare the
input cost of (a) sending the PDF with every question versus (b) extracting and retrieving
three relevant pages' text per question. Assume about 2,300 tokens per page as a PDF and
about 500 per page as extracted text, on a model at $1 per million input tokens. Then say
what prompt caching would change about (a).`,
        answer: `**(a) PDF every time:** 40 × 2,300 = 92,000 tokens per question × 15 = **1.38M tokens ≈
$1.38.**

**(b) Retrieval:** 3 × 500 = 1,500 tokens per question × 15 = **22,500 tokens ≈ $0.02** —
plus a one-off extraction and embedding cost.

**With prompt caching on (a):** the PDF is an identical prefix on every question, so after
the first request it's read at about a tenth of the price — roughly 92,000 × 1.25 + 14 ×
92,000 × 0.1 ≈ 244,000 token-equivalents, **about $0.24**, as long as the questions arrive
within the cache lifetime. Much better — and still an order of magnitude more than
retrieval, and it doesn't scale to a whole library.

For one document in one session, caching (a) is simple and good. For a corpus, it's (b).`,
      },
    ],
  },
  {
    id: 's2.6.t3',
    moduleId: 's2.6',
    title: 'Audio: transcription as a pipeline step',
    outcome: `You can bring audio into an AI feature by transcribing it first — and you know what gets lost on the way.`,
    minutes: 25,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
    ],
    animations: [],
    analogy: `Much like converting an uploaded video to a web-friendly format before serving it: a
processing step in a pipeline, with its own cost and failure modes. For audio, the usual
step is turning speech into text before any model reasons about it.`,
    notes: `## The usual shape

\`\`\`
audio file → speech-to-text → transcript → model (summarise, extract, answer)
\`\`\`

Not every model accepts audio directly — Claude works with text and images — so the common
pattern is to transcribe first with a dedicated speech-to-text model (open-source Whisper,
or a hosted transcription API), then work with the transcript.

---

## What transcription loses

- **Who said what** — unless you add speaker separation ("diarisation")
- **Tone** — sarcasm, hesitation, emphasis
- **Accuracy on names and jargon** — company names, technical terms, Indian names spelled several ways
- **Code-switching** — conversations that move between Hindi and English mid-sentence are hard for many transcription models

Keep word-level timestamps if the tool gives them, so every quote in a summary can link back
to the moment in the recording.

---

## Where it matters for you

Interview recordings, support calls, meeting notes, voice messages from users who find
typing slow. For the capstone, voice notes from candidates are a realistic input.

Real-time voice — a live conversation with an assistant — is a different, harder problem,
because every step adds latency. It's in Stage 7 as a specialisation.`,
    docs: [
      {
        label: 'OpenAI Whisper (open source)',
        url: 'https://github.com/openai/whisper',
      },
    ],
    glossary: [
      {
        term: 'speech-to-text',
        def: 'Turning spoken audio into written text. Also called transcription.',
      },
      {
        term: 'diarisation',
        def: 'Separating a transcript by speaker — who said what.',
      },
      {
        term: 'code-switching',
        def: 'Moving between languages mid-conversation, such as Hindi and English.',
      },
    ],
    check: [
      {
        q: 'What is the common pipeline for audio?',
        a: 'Transcribe with a speech-to-text model first, then give the transcript to the language model.',
      },
      {
        q: 'Name three things transcription can lose.',
        a: 'Who said what, tone, and accuracy on names and jargon — also code-switched speech.',
      },
      {
        q: 'Why keep word-level timestamps?',
        a: 'So quotes in a summary can link back to the exact moment in the recording.',
      },
    ],
    practice: [
      {
        mode: 'tool',
        title: 'Summarise a recording with quotes that link back',
        body: `Transcribe a five-minute recording (a podcast clip works) with Whisper or a hosted API,
keeping timestamps. Then ask a model for three key points, each with a supporting quote.
Check each quote against the transcript and find its timestamp.`,
        answer: `What people usually find:

- **Most quotes match the transcript**, but some are paraphrased rather than exact — the model "cleaned up" the speech. Ask explicitly for verbatim quotes, and check them in code by searching the transcript.
- **Names are often mis-transcribed**, and the summary faithfully repeats the mistake. The model can't know the transcript is wrong.
- **Timestamps make verification quick** — seconds to jump to the moment and listen.

The lesson carries into Stage 3: an answer is only as good as the text it was grounded
on, and a verbatim-quote check in code catches the paraphrasing.`,
      },
      {
        mode: 'decision',
        title: 'Would you transcribe?',
        body: `For each, decide whether to transcribe-then-model, and name the biggest risk:

1. Summarising weekly team calls in English
2. Scoring spoken-English fluency for job candidates
3. Extracting action items from Hinglish customer calls`,
        answer: `1. **Yes.** Biggest risk: attributing a decision to the wrong person — add speaker labels.
2. **No — or not only.** Fluency lives in pronunciation, pace and hesitation, which a transcript throws away. It needs audio analysis, and it's a fairness-sensitive use: accents must not be scored as errors.
3. **Yes, carefully.** Biggest risk: poor transcription of code-switched speech. Test transcription quality on real calls first, before building anything on top.`,
      },
    ],
  },
];
