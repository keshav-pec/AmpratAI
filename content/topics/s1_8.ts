import type { Topic } from '@/lib/types';

const deck = { kind: 'deck' as const, label: 'Slides', reason: 'written for you, always current' };
const find = (label: string, query: string, channel: string, reason: string) =>
  ({ kind: 'find' as const, label, query, channel, reason });

export const s1_8: Topic[] = [
  {
    id: 's1.8.t1',
    moduleId: 's1.8',
    title: 'What a token is, and why JSON costs more than prose',
    outcome: 'You can estimate what a request will cost before you make it, and you know why output format is a cost decision.',
    minutes: 40,
    sources: [
      deck,
      find('Visual', 'what are tokens LLM tokenization explained', '3Blue1Brown or Andrej Karpathy', 'visual intuition for the pieces'),
    ],
    animations: ['anim-tokens'],
    analogy: `You already know that a string is bytes underneath and that UTF-8 makes some
characters cost more than others. This is the same shape of idea one level up: the model
does not see characters, it sees pieces, and some text makes far more pieces than you would
guess.`,
    notes: `## The model never sees your text

    "The refund policy is 30 days"

becomes something like

    ["The", " refund", " policy", " is", " ", "30", " days"]      7 tokens
    [976, 22752, 4947, 374, 220, 966, 2919]                        as numbers

Every piece is a **token**. The model reads and writes tokens, and you are billed per token
in both directions.

---

## The rough numbers worth memorising

- English prose: about **1.3 tokens per word**, or 4 characters per token
- Code: about **2 to 2.5×** more tokens for the same information
- JSON: similar to code — all those braces, quotes and colons are tokens
- Hindi and most non-Latin scripts: about **2.5 to 3.5×** more than English

A 500-page PDF is roughly 250,000 tokens. That is why you cannot simply put it in the prompt,
and it is where Stage 3 begins.

---

## Why this is an engineering decision, not a detail

Ask a model for an answer as a paragraph, and again as JSON. The JSON version costs perhaps
twice as much for the same content. Multiply by a million requests a month and that is a
real line in a budget.

It cuts the other way too. If you ask for prose and then need to parse it, you pay in
reliability instead of tokens. In Stage 2 you will make this trade deliberately, per feature,
rather than by accident.

The same logic explains why you should not ask a model to repeat your input back to you, why
shorter field names in a schema are cheaper, and why "think step by step" has a price
attached.

---

## Input and output are priced differently

Output is typically **3 to 5 times more expensive per token** than input.

So a long prompt with a short answer is cheap. A short prompt that produces a long answer is
not. This is unintuitive when you come from web development, where payload direction rarely
matters, and it changes how you design a feature.

---

## Context window

The context window is the total number of tokens the model can look at in one go: your
system prompt, the conversation, any retrieved documents, the question, **and** the space
reserved for the answer.

It is a budget with a hard edge. When you exceed it, something has to go — and the only
question is whether you chose what, or a framework chose for you. That is the whole subject
of context engineering in Stage 3.

---

## Count before you send

Every provider has a token counting endpoint or library. Use it when you are assembling a
prompt from retrieved documents, because that is the moment when a prompt can silently
double in size.

The rule that follows: **never build a prompt without knowing how big it is.**`,
    docs: [
      { label: 'Anthropic — token counting', url: 'https://docs.anthropic.com/en/docs/build-with-claude/token-counting' },
      { label: 'Anthropic — pricing', url: 'https://www.anthropic.com/pricing' },
    ],
    glossary: [
      { term: 'token', def: 'A piece of text — roughly a short word or part of one. What models read and what you are billed for.' },
      { term: 'tokenizer', def: 'The component that cuts text into tokens.' },
      { term: 'context window', def: 'The total tokens a model can consider at once, including the space for its answer.' },
      { term: 'input vs output tokens', def: 'Both are billed; output typically costs several times more per token.' },
    ],
    check: [
      { q: 'Roughly how many tokens is a 500-page PDF, and why does that matter?', a: 'About 250,000. It does not fit in a prompt, which is the reason retrieval exists.' },
      { q: 'Why does asking for JSON cost more than asking for a paragraph?', a: 'Braces, quotes, colons and field names are all tokens. Roughly double for the same content.' },
      { q: 'Which direction is more expensive, and what does that change?', a: 'Output, typically 3 to 5 times per token. A long prompt with a short answer is cheap; the reverse is not.' },
      { q: 'What is actually in the context window?', a: 'System prompt, conversation history, retrieved text, the question, and the reserved space for the answer.' },
      { q: 'When is it most important to count tokens?', a: 'When assembling a prompt from retrieved documents, because that is when it can silently double.' },
    ],
    practice: [
      {
        mode: 'tool',
        title: 'Tokenize things yourself',
        body: `Use a provider's token counting API or a local tokenizer. Count tokens for:
an English paragraph, the same content as JSON, a Python function, a Hindi paragraph, and a
page of a real PDF.

Write down the ratio for each against the English baseline. You now have your own numbers
rather than my estimates, which is better.`,
        answer: `Rough ratios against the English prose baseline — yours will differ by tokenizer:

| Content | Tokens compared with English prose |
|---|---|
| English prose | 1× |
| The same content as JSON | about 1.5–2.5× |
| Python code | about 1.5–2.5× |
| Hindi, Devanagari script | about 2–4× (newer tokenizers do much better) |
| A page from a real PDF | depends on layout — table and header noise adds up |

**The snag:** different providers use different tokenizers. The same text gives different counts on different models, so always count with the tokenizer of the model you will actually call. Anthropic has a token-counting endpoint for exactly this.`,
      },
      {
        mode: 'primitive',
        title: 'Write a token budgeter by hand',
        body: `One of the ten primitives.

Write \`fit(system, history, chunks, question, window, reserve_output)\` that returns the
subset of \`chunks\` that fits, given everything else and the space reserved for the answer.

Decide what happens when even one chunk does not fit, and make it explicit rather than
silently truncating. You will use this in Stage 3, and that decision is the interesting part.`,
        answer: `\`\`\`python
class ContextOverflow(Exception): ...

def fit(system, history, chunks, question, window, reserve_output, count):
    fixed = count(system) + count(question) + sum(count(m) for m in history)
    budget = window - reserve_output - fixed
    if budget <= 0:
        raise ContextOverflow(f"no room for context: fixed parts use {fixed} tokens")

    chosen, used = [], 0
    for chunk in chunks:                 # chunks arrive best-first
        n = count(chunk)
        if used + n > budget:
            break                        # a policy choice — see below
        chosen.append(chunk)
        used += n

    if chunks and not chosen:
        raise ContextOverflow("the most relevant chunk does not fit on its own")
    return chosen
\`\`\`

The decisions you had to make:

- **\`break\` or \`continue\`?** \`break\` keeps a strict relevance order. \`continue\` skips an oversized chunk to fit smaller, less relevant ones. Either is defensible — pick one on purpose.
- **Who shrinks when history is too long?** Usually the oldest turns get trimmed or summarised before the retrieved evidence does.
- **Never cut a chunk mid-sentence** to squeeze it in. A half-sentence is worse than no sentence.
- **Raise, don't hide.** "Nothing fits" should be an error you can see, not an empty context the model then answers from nothing.`,
      },
      {
        mode: 'decision',
        title: 'Price a feature',
        body: `A resume matcher processes 900 resumes a month. Each one sends about 2,000 tokens in
and gets about 400 tokens out.

Look up current per-million prices for one cheap model and one expensive one, and work out
the monthly cost for each. Then say what changes if you switch the output from JSON to a
compact format, and whether that is worth doing.

There is no trick here. The point is that you can now answer a cost question that most
candidates cannot.`,
        answer: `The volume:

- **Input:** 900 × 2,000 = 1.8M tokens a month
- **Output:** 900 × 400 = 0.36M tokens a month

With illustrative prices — always check the current ones:

- **A small model at $1 in / $5 out per million:** 1.8 × $1 + 0.36 × $5 = **$3.60 a month** — a few hundred rupees.
- **A large model at $5 in / $25 out:** 1.8 × $5 + 0.36 × $25 = **$18 a month**.

Switching from JSON to a compact output format might save 30–40% of output tokens — well under a dollar a month on the small model. **Not worth the engineering at this volume**; at a million resumes a month it would be.

The levers that matter more here:

- **Batch processing.** Anthropic's Message Batches API is 50% cheaper for work that doesn't need an instant answer — and resume processing doesn't.
- **Prompt caching** for the fixed instruction block at the start of every request.

The point is being able to answer the question at all. Most candidates can't.`,
      },
    ],
  },

  {
    id: 's1.8.t2',
    moduleId: 's1.8',
    title: 'Next-token prediction, and why models make things up',
    outcome: 'You can explain hallucination mechanically, and say which mitigations actually work.',
    minutes: 35,
    sources: [
      deck,
      find('Visual', 'how large language models work intro', 'Andrej Karpathy', 'the clearest high-level explanation available'),
    ],
    animations: [],
    analogy: `Autocomplete, trained on an enormous amount of text, run repeatedly. That
sounds dismissive and it is not meant to be — it is genuinely the mechanism, and holding it
in your head explains almost every strange behaviour you will meet.`,
    notes: `## The mechanism

Given some text, the model produces a probability for every possible next token.

    "The capital of France is"  ->   " Paris"  92%
                                     " a"       3%
                                     " located" 2%
                                     ...

It picks one, appends it, and does the whole thing again with the longer text. That loop is
the entire process.

---

## Why that produces hallucination

The model is always answering the question *"what text would plausibly come next?"* — never
*"what is true?"*

Ask about your company's refund policy. The model has seen thousands of refund policies. A
plausible continuation exists and it is fluent, specific and confident. It is also invented,
because your policy was never in its training data.

**Hallucination is not a bug in the ordinary sense.** It is the same mechanism that produces
correct answers, applied where the model has no grounding. Which is why "tell it not to
hallucinate" does not work — you are asking it to know something it has no way to know.

---

## What actually helps

**Give it the facts.** Retrieval puts your actual documents in the prompt, so the plausible
continuation is the correct one. This is the single biggest lever, and it is Stage 3.

**Give it an exit.** "If the answer is not in the provided documents, reply NOT_FOUND."
Without it, the most plausible continuation of a question is always an answer. With it,
NOT_FOUND becomes an acceptable continuation. Cheap and surprisingly effective.

**Ask for citations.** Requiring a quote from the source makes fabrication harder and
verification possible.

**Constrain the output.** A \`Literal\` type with three allowed values cannot become a
fourth category. Validation at the boundary.

**Check afterwards.** Verify that claims appear in the source. This is what faithfulness
scoring does in Stage 3.

---

## What does not help

- Telling it to be accurate
- Telling it not to make things up
- Asking "are you sure?" — it will often change a correct answer to a wrong one
- Assuming a bigger model fixes it. Bigger models hallucinate more fluently.

---

## The related thing: confidence is not calibrated

A model sounds equally certain whether it is right or wrong. There is no tone change, no
hedging that correlates with accuracy.

For you this means: **never use the model's confidence as a signal.** If you need to know
whether an answer is reliable, you need an external check — a citation that resolves, a
value that validates, a second model scoring it against the source.

That idea is the foundation of everything in Stage 3's evaluation module. Fluency is not
evidence.`,
    docs: [
      { label: 'Anthropic — reduce hallucinations', url: 'https://docs.anthropic.com/en/docs/test-and-evaluate/strengthen-guardrails/reduce-hallucinations' },
      { label: 'Jay Alammar — the Illustrated Transformer', url: 'https://jalammar.github.io/illustrated-transformer/' },
    ],
    glossary: [
      { term: 'next-token prediction', def: 'The model produces a probability for each possible next token, picks one, and repeats.' },
      { term: 'hallucination', def: 'A fluent, confident, invented answer. The same mechanism as a correct answer, without grounding.' },
      { term: 'grounding', def: 'Giving the model the actual source material so the plausible answer is the true one.' },
      { term: 'escape hatch', def: 'An explicit permitted answer like NOT_FOUND, so the model is not forced to invent.' },
      { term: 'calibration', def: 'Whether expressed confidence matches actual accuracy. In these models, it does not.' },
    ],
    check: [
      { q: 'Explain hallucination in one sentence, mechanically.', a: 'The model predicts plausible next text, and where it has no grounding a plausible answer is still fluent and confident — just invented.' },
      { q: 'Why does "do not hallucinate" not work?', a: 'You are asking it to know something it has no way to know. The instruction does not supply the missing information.' },
      { q: 'What are the three most effective mitigations?', a: 'Give it the real documents, give it an explicit escape hatch, and verify the output against the source.' },
      { q: 'Why should you never trust the model\'s expressed confidence?', a: 'It is not calibrated. It sounds identical whether it is right or wrong, so you need an external check.' },
      { q: 'Does a bigger model solve hallucination?', a: 'No — it hallucinates more fluently, which is worse for you, not better.' },
    ],
    practice: [
      {
        mode: 'tool',
        title: 'Make one happen on purpose',
        body: `Ask any model a specific factual question about something it cannot know — a policy
at a company you invent, the contents of a document you have not shown it, a made-up section
number of a real regulation.

Note how specific and confident the answer is. Then ask the same question with the escape
hatch: "if you do not know, reply NOT_FOUND."

Compare. That difference is one sentence of prompt, and it is the cheapest reliability win
you will ever get.`,
        answer: `Without an escape hatch, you should get a **specific, confident, invented** answer — a clause number, a figure, a date. With "if you do not know, reply NOT_FOUND", you should usually get \`NOT_FOUND\`.

The escape hatch works best combined with:

- the actual documents, when you have them
- the instruction "answer only from the provided documents"

Decide whether general knowledge is allowed at all. A support bot answering about *your* refund policy should never fall back on "refund policies in general".`,
      },
      {
        mode: 'decision',
        title: 'Pick the mitigation',
        body: `For each, say which mitigation applies and why:

1. A support bot invents a refund window
2. A resume parser reports a phone number that is not on the resume
3. A classifier returns a category you never defined
4. A summariser adds a fact the document does not contain

Each of these has a different right answer, and you will implement all four in Stages 2 and 3.`,
        answer: `1. **A support bot invents a refund window** → give it the real policy (retrieval), plus an escape hatch, plus a required citation.
2. **A resume parser reports a phone number that is not on the resume** → **check the value against the source.** After normalising, the number must actually appear in the document text; if not, it is \`null\`. The instruction helps, but the check is the real fix.
3. **A classifier returns a category you never defined** → a closed vocabulary — \`Literal\`, an enum, or the schema of a tool the model has to call — plus a repair loop when it fails.
4. **A summariser adds a fact** → a faithfulness check: break the summary into claims and verify each one against the source, with a judge model or a claim-checking step. Also tell it to use only information in the text.

Each fix sits in a different place — the prompt, the schema, or a check after the model — and you will build all four in Stages 2 and 3.`,
      },
      {
        mode: 'read',
        title: 'Why does asking "are you sure?" backfire?',
        body: `Think it through mechanically, given what you now know about next-token prediction.
What text plausibly follows a challenge to a previous statement — in the training data, in
human conversation?

Write two sentences. Then test it: get a model to give a correct answer, challenge it, and
see what happens.`,
        answer: `Think about what text usually follows a challenge. In books, forums and conversations, "are you sure?" is usually followed by a correction or a concession. So the **most plausible continuation** after a challenge is to change the answer — whether the first answer was right or not.

On top of that, preference tuning rewards being agreeable, which pushes the same way. The name for this is **sycophancy**.

When you test it, you will often see a correct answer flip to a wrong one.

Better ways to check an answer:

- ask for the **evidence** — a quote or a citation you can verify
- ask the question **again, independently**, and compare the two answers`,
      },
    ],
  },

  {
    id: 's1.8.t3',
    moduleId: 's1.8',
    title: 'What an embedding is, and what similarity means',
    outcome: 'You can explain why "refund policy" finds "money-back terms" — and why it sometimes confidently finds the wrong document.',
    minutes: 40,
    sources: [
      deck,
      find('Visual', 'word embeddings vector explained', '3Blue1Brown', 'the best visual treatment of vector space'),
      find('Deeper', 'text embeddings explained semantic search', 'Jay Alammar or similar', 'written, with diagrams'),
    ],
    animations: [],
    analogy: `You have used a database index: turn a value into something sortable, then look
it up fast. An embedding is the same move for *meaning* — turn a piece of text into a
position, then find things nearby.`,
    notes: `## Meaning as coordinates

An embedding model turns text into a list of numbers:

    "refund policy"      ->  [0.021, -0.44, 0.13, ... ]     1536 numbers
    "money-back terms"   ->  [0.019, -0.41, 0.15, ... ]     very close
    "office cafeteria"   ->  [-0.33, 0.28, -0.07, ... ]     far away

Think of each text as a point in a space with 1536 axes. You cannot picture that, and you do
not need to. The only thing that matters is **distance**: texts that mean similar things end
up close together.

---

## Why 1536 numbers instead of 3

Meaning has many independent dimensions — topic, tone, formality, tense, specificity, domain.
Three numbers cannot hold that. A thousand or so can hold enough that "close together"
reliably means "about the same thing".

You will never inspect those numbers individually, and none of them corresponds to a word you
could name. Do not go looking for meaning in dimension 412.

---

## Cosine similarity, without the maths

Two vectors point in directions. Cosine similarity measures the **angle** between them, not
the distance.

    same direction        similarity 1.0    same meaning
    perpendicular         similarity 0.0    unrelated
    opposite              similarity -1.0   rarely meaningful in practice

Angle rather than length is the point: a one-line question and a five-paragraph answer about
the same subject should match, even though one is much "bigger" than the other. Using angle
makes length irrelevant.

Practical note: if both vectors are normalised to length 1 — most libraries do this — then
cosine similarity is just the dot product, which is why embedding code is so fast.

---

## How search works

1. Embed every chunk of your documents, once. Store the vectors.
2. When a question arrives, embed the question.
3. Find the stored vectors closest to it.
4. Those chunks are your search results.

That is all retrieval is. Everything else in Stage 3 — chunking, hybrid search, reranking —
is making those four steps work well on messy real data.

---

## Where it fails, and this is important

**Exact identifiers.** "Order AB-19472" has almost no semantic content. It will happily match
other order numbers. Keyword search finds it instantly. This is why hybrid search exists.

**Negation.** "policies that do not cover flooding" and "policies that cover flooding" embed
very close together. The model captures topic well and logic poorly.

**Numbers and dates.** "under 30 days" and "under 90 days" are nearly identical vectors, and
completely different answers.

**Domain mismatch.** A general embedding model on heavy legal or medical text performs worse
than you expect, because the distinctions that matter in that domain were not what the model
was trained to separate.

---

## Two rules to carry forward

**Embeddings from different models are not comparable.** Never mix them in one index.
Changing embedding model means re-embedding everything — which is why you store the model
name next to the vector.

**Similar is not the same as correct.** The nearest chunk is the nearest one, not necessarily
one that answers the question. If nothing relevant exists, retrieval still returns five
confident results. Measuring that gap is what evaluation is for.`,
    docs: [
      { label: 'Anthropic — embeddings', url: 'https://docs.anthropic.com/en/docs/build-with-claude/embeddings' },
      { label: 'pgvector — README', url: 'https://github.com/pgvector/pgvector' },
    ],
    glossary: [
      { term: 'embedding', def: 'A list of numbers representing the meaning of a piece of text.' },
      { term: 'dimension', def: 'One of the numbers in the vector. 1536 is a common count.' },
      { term: 'cosine similarity', def: 'The angle between two vectors. 1 is identical direction, 0 is unrelated.' },
      { term: 'normalisation', def: 'Scaling a vector to length 1, so only its direction matters.' },
      { term: 'semantic search', def: 'Finding text by meaning rather than by matching words.' },
    ],
    check: [
      { q: 'Why measure the angle rather than the distance?', a: 'So length does not matter — a short question and a long answer on the same topic should still match.' },
      { q: 'Give a query where embedding search fails badly.', a: 'An exact order number or product code. It carries no semantic meaning, so it matches other codes instead.' },
      { q: 'Why do "covers flooding" and "does not cover flooding" embed closely?', a: 'Embeddings capture topic well and logic poorly. Negation barely moves the vector.' },
      { q: 'Can you mix vectors from two embedding models in one index?', a: 'No. They are not comparable. Changing model means re-embedding everything, which is why you store the model name with the vector.' },
      { q: 'If nothing relevant exists in your corpus, what does search return?', a: 'The five nearest chunks, confidently. Nearest is not the same as correct — measuring that gap is what evaluation is for.' },
    ],
    practice: [
      {
        mode: 'primitive',
        title: 'Cosine similarity, by hand',
        body: `Four lines, no libraries. Write \`cosine(a, b)\`.

Then check: identical vectors, perpendicular vectors, opposite vectors. And answer this —
if both inputs are already normalised, what does your function reduce to? That is why
embedding search is fast.`,
        answer: `\`\`\`python
import math

def cosine(a: list[float], b: list[float]) -> float:
    dot = sum(x * y for x, y in zip(a, b, strict=True))
    return dot / (math.sqrt(sum(x * x for x in a)) * math.sqrt(sum(y * y for y in b)))
\`\`\`

- identical vectors → **1**
- perpendicular → **0**
- opposite → **−1**

If both inputs are already normalised, the denominator is 1 and **this is just the dot product**. Normalise once when you store a vector, and every search after that is a cheap multiply-and-add. That is why embedding search is fast.

The fuller version in s1.6.t5 also guards against zero vectors.`,
      },
      {
        mode: 'tool',
        title: 'Find the failure modes yourself',
        body: `Embed about twenty short sentences from a domain you know. Include deliberate traps:
a pair differing only by negation, a pair differing only by a number, and an exact
identifier.

Compute the similarity matrix and look at it. Find the pair that is closest but means the
opposite, and the pair that should match but does not.

Those two pairs are the argument for everything in Stage 3. Finding them yourself is worth
far more than reading about them.`,
        answer: `What you should find:

- **The negation pair** — "covers flooding" and "does not cover flooding" — scores **very high**, often above 0.85. Meaning-wise they are opposites.
- **The number pair** — "under 30 days" and "under 90 days" — scores **very high**.
- **The exact identifier** — an order number — sits near other identifiers, not near the text about that specific order.
- **Real paraphrases** score high, as they should.

The snag: raw similarity values are **model-specific**. Some models put almost everything between 0.7 and 0.9. Compare **rankings** within one model — which pair came top — rather than fixed thresholds, and never carry a threshold over from one model to another.`,
      },
      {
        mode: 'decision',
        title: 'Which search for which query?',
        body: `For each, say whether keyword search, vector search, or both are needed:

1. "What is the refund window?"
2. "Status of order AB-19472"
3. "Policies that exclude flood damage"
4. "Section 4.2.1"
5. "Can I get my money back?"

Then say what your answer implies about how you should build retrieval in Stage 3.`,
        answer: `1. **"What is the refund window?"** → both, with vector search leading.
2. **"Status of order AB-19472"** → neither, really. This is a **database lookup**, not retrieval — in an agent, it is a tool call. Keyword search is the fallback if it must go through the search index.
3. **"Policies that exclude flood damage"** → both, plus a **reranker**. Negation is hard for either one alone.
4. **"Section 4.2.1"** → keyword search, or better a **metadata filter** on the section path. A section number is an identifier.
5. **"Can I get my money back?"** → vector search. It is a paraphrase of "refund".

The implication for Stage 3: build **hybrid** retrieval, keep **metadata filters** for identifiers, add a **reranker**, and send some questions to a **structured lookup** instead of retrieval. That last one is the routing idea from s3.7.`,
      },
    ],
  },

  {
    id: 's1.8.t4',
    moduleId: 's1.8',
    title: 'Temperature, attention, and how models get trained',
    outcome: 'You can close this module knowing enough to build, and can explain each idea to a friend in two minutes.',
    minutes: 40,
    sources: [
      deck,
      find('Visual', 'transformers attention explained visually', '3Blue1Brown', 'watch once, do not take notes, do not do exercises'),
    ],
    animations: [],
    analogy: `This is the last topic before you start building. The goal is a working mental
model, not expertise. If you find yourself wanting to derive something, you have gone past
the point of usefulness for this role.`,
    notes: `## Temperature

At each step the model has a probability for every possible next token. Temperature reshapes
that distribution before one is picked.

    temperature 0      always take the most likely token
    temperature 1      sample according to the probabilities as they are
    temperature 1.5+   flatten the distribution; unlikely tokens become possible

Ranges differ by provider: Anthropic's API goes from 0 to 1, while OpenAI's and Gemini's go
up to 2.

What to use:

- **Extraction, classification, structured output: 0.** You want the same answer every time.
- **Writing, brainstorming, variety: 0.7 to 1.**
- **Above 1.2:** your JSON parser is now a lottery ticket.

One correction to a common belief: **temperature 0 is not "accurate mode".** It is "most
likely mode". The most likely answer can be confidently wrong. It is deterministic, not
correct — and even then, not perfectly deterministic, because of how the maths is executed
at scale.

---

## Attention, at the level you need

When the model processes a word, it looks at the other words in the context and weighs how
relevant each one is.

    "The chunk did not fit because it was too large."

To handle "it", the model attends strongly to "chunk". That weighting is attention. Doing it
across many positions at once, in many layers, is what a transformer is.

Two consequences you will actually feel:

- **Cost grows faster than length.** Attention compares positions against each other, so doubling the context more than doubles the work. This is why long-context calls are expensive.
- **Position matters.** Models attend more reliably to the beginning and end of a long context than the middle. That is the "lost in the middle" effect, and in Stage 3 it is why you put the question *after* the retrieved documents.

That is enough. You do not need the matrix multiplication.

---

## How a model got to be the way it is

Three stages, one paragraph each.

**Pretraining.** Predict the next token, over an enormous amount of text. This is where
language, facts and reasoning ability come from. It costs a very large amount of money and
you will never do it.

**Instruction tuning.** Fine-tune on examples of instructions and good responses. This is
what turns a text predictor into something that answers your question instead of continuing
it.

**Preference tuning.** Humans compare pairs of responses; the model is trained toward the
preferred ones. This is where helpfulness, tone and refusals come from.

Why this matters to you: the model's behaviour is **learned from examples of what good
responses look like**. That is why showing it examples in a prompt works so well — you are
using the same mechanism it was trained with.

---

## Stop here

You now have the mental model. Specifically, you can explain:

- what a token is and why it costs money
- why models hallucinate, and what actually helps
- what an embedding is and what similarity means
- what temperature does
- roughly what attention does and why position matters
- roughly how a model is trained

That is the whole budget for this module, and it is enough to build everything in the
remaining stages.

**If you find yourself opening a linear algebra course, this module has failed.** You are
building the car, not the engine. Go and build something.`,
    docs: [
      { label: 'Anthropic — prompt engineering overview', url: 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview' },
      { label: 'Jay Alammar — the Illustrated Transformer', url: 'https://jalammar.github.io/illustrated-transformer/' },
    ],
    glossary: [
      { term: 'temperature', def: 'How much randomness is used when picking the next token.' },
      { term: 'attention', def: 'The mechanism that weighs how relevant each part of the context is to each other part.' },
      { term: 'pretraining', def: 'Learning to predict the next token over a vast amount of text.' },
      { term: 'instruction tuning', def: 'Training on instruction-and-response examples, so it answers rather than continues.' },
      { term: 'preference tuning', def: 'Training toward responses humans preferred. Where tone and refusals come from.' },
      { term: 'lost in the middle', def: 'Models attend less reliably to the middle of a long context than the ends.' },
    ],
    check: [
      { q: 'What temperature for structured extraction, and why?', a: '0 — you want the same output for the same input. Note that this is "most likely", not "accurate".' },
      { q: 'Why does a long context cost more than proportionally?', a: 'Attention compares positions against each other, so the work grows faster than the length.' },
      { q: 'Where should the question go relative to retrieved documents, and why?', a: 'After them. Models attend more reliably to the end of a long context than the middle.' },
      { q: 'Why does showing examples in a prompt work so well?', a: 'Instruction and preference tuning taught the model from examples of good responses. Few-shot prompting uses the same mechanism.' },
      { q: 'What is the stop condition for this whole module?', a: 'Being able to explain tokens, hallucination, embeddings, temperature and attention to a non-technical friend. Then stop and go build.' },
    ],
    practice: [
      {
        mode: 'tool',
        title: 'Feel temperature',
        body: `Send the same prompt ten times at temperature 0, then ten times at 1.0, then five
times at 1.5. Ask for JSON each time. (Anthropic's API stops at 1.0, so use an OpenAI or
Gemini model for the 1.5 run.)

Count how many parse successfully at each setting. That number is your argument for
temperature 0 in extraction, and you will have measured it rather than been told it.`,
        answer: `What you should see:

- **Temperature 0:** all ten parse, and the outputs are nearly identical.
- **Temperature 1.0:** most still parse, with noticeably varied content.
- **Temperature 1.5:** failures climb — missing brackets, extra commentary.

Three details:

- **Anthropic's API only goes up to 1.0**, so the 1.5 run needs a model whose API allows it — OpenAI's and Gemini's go to 2.
- **With enforced structured output** — a schema the API guarantees — parsing stays at 100% at any temperature. The randomness moves into the *values* instead.
- **Some reasoning models ignore or restrict temperature** entirely. Check the model's documentation before drawing conclusions.`,
      },
      {
        mode: 'decision',
        title: 'Explain it to someone',
        body: `Out loud, to a person or a recording, in two minutes each: what a token is, why models
make things up, what an embedding is, and what temperature does.

No notes. If you stall on one, that is the one to revisit — and it is the only reliable
signal you have that this module is finished.`,
        answer: `Model two-minute versions — yours should sound like you, not like these:

- **Token:** "The model doesn't read letters or words. It reads chunks of text, a bit like syllables, each turned into a number. You pay per chunk, and some text, like code or Hindi, breaks into more chunks than English."
- **Why models make things up:** "It's autocomplete. It always writes whatever sounds most likely to come next. If it doesn't know your company's policy, the most likely-sounding answer is still a confident, specific one — just invented."
- **Embedding:** "It turns a sentence into a position on a huge map of meaning. Sentences that mean similar things land close together, so you can find related text by looking nearby — even if it uses different words."
- **Temperature:** "It's a randomness dial. At zero it always picks the most likely next word. Turn it up and it takes more chances — good for brainstorming, bad for anything that has to be exact."

If you stalled on one, that is the topic to revisit before moving on.`,
      },
      {
        mode: 'read',
        title: 'Predict the behaviour',
        body: `For each, say what will happen and why, using only what you learned in this module:

1. A 100-page document in the prompt, with the question at the very top
2. Temperature 1.4 with a strict JSON schema
3. Asking a model for a page number from a document you did not give it
4. The same prompt, same model, same temperature 0, run twice`,
        answer: `1. **A 100-page document with the question at the very top** → weaker, vaguer answers. Models attend less reliably to instructions buried far from where they start writing. Put the question **after** the documents.
2. **Temperature 1.4 with a strict JSON schema** → if the API **enforces** the schema, the JSON stays valid but the values get erratic. If it doesn't, expect parse failures. And on Anthropic's API, 1.4 is simply rejected — the limit is 1.0.
3. **Asking for a page number from a document you didn't provide** → it will often invent a plausible page number. There is nothing to ground the answer in, and no escape hatch was offered.
4. **The same prompt twice, at temperature 0** → usually identical, but **not guaranteed**. Tiny numeric differences in how requests are batched on the provider's hardware can change a token, and after that the text can drift. Never build anything that depends on exact repeatability.`,
      },
    ],
  },
];
