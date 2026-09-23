import type { Topic } from '@/lib/types';

export const s2_1: Topic[] = [
  {
    id: 's2.1.t1',
    moduleId: 's2.1',
    title: 'Your first call — to three providers',
    outcome: `You can call Anthropic, OpenAI and Gemini from Python, and say exactly how their request shapes differ.`,
    minutes: 35,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
      {
        kind: 'find',
        label: 'Visual',
        query: 'Anthropic API Python quickstart messages',
        channel: 'Anthropic',
        reason: 'the official walkthrough, short',
      },
    ],
    animations: [],
    analogy: `You have called REST APIs a hundred times: build a JSON body, POST it, read the JSON back.
A model call is exactly that. The only new parts are the *shape* of the body — a list of
messages with roles — and the fact that three providers chose three slightly different shapes.`,
    notes: `## It is just an HTTP call

\`\`\`python
import anthropic

client = anthropic.Anthropic()        # reads ANTHROPIC_API_KEY from the environment

response = client.messages.create(
    model="claude-haiku-4-5",
    max_tokens=1024,
    system="You are a concise assistant for a hiring product.",
    messages=[{"role": "user", "content": "Summarise this job post in one line: ..."}],
)

print(response.content[0].text)
\`\`\`

Four things go in: **which model**, **the most it may write** (\`max_tokens\`), **standing
instructions** (\`system\`), and **the conversation** (\`messages\`). One response comes out.

---

## Roles: who said what

A conversation is a list. Each item has a role:

- **user** — what the person (or your code) says
- **assistant** — what the model said earlier

\`\`\`python
messages = [
    {"role": "user", "content": "My name is Keshav."},
    {"role": "assistant", "content": "Nice to meet you, Keshav."},
    {"role": "user", "content": "What is my name?"},
]
\`\`\`

**The API has no memory.** Every call sends the whole conversation again. "Chat history"
is just a list you store and resend. That is why long conversations get expensive: turn 20
pays for turns 1 to 19 again.

---

## The same call, three shapes

| | Anthropic | OpenAI | Gemini |
|---|---|---|---|
| Standing instructions | top-level \`system\` | \`instructions\` (Responses API) or a \`system\`/\`developer\` message | \`system_instruction\` in the config |
| Conversation | \`messages\` | \`input\` | \`contents\` |
| The answer | \`response.content[...]\` blocks | \`response.output_text\` | \`response.text\` |
| Output cap | \`max_tokens\` (required) | optional | optional |

Same idea, different field names. That table is the whole reason your Stage 2 project has
**one internal interface** in front of all three: your app talks to your interface, and
small adapters translate.

---

## Why \`content\` is a list

Anthropic returns a *list of blocks*, not a string:

\`\`\`python
for block in response.content:
    if block.type == "text":
        print(block.text)
\`\`\`

Most of the time there is one text block. But when the model thinks, calls a tool, or
cites a document, you get several blocks of different types. Code that does
\`response.content[0].text\` works in the demo and breaks the first time the model uses a
tool. **Loop over blocks and check the type.**

---

## Where the key lives

The SDK reads \`ANTHROPIC_API_KEY\` from the environment — which is your pydantic-settings
setup from Stage 1. The key stays on your server. The browser talks to *your* API, never
to the provider.

For async code (your FastAPI app), use the async client:

\`\`\`python
client = anthropic.AsyncAnthropic()
response = await client.messages.create(...)
\`\`\``,
    docs: [
      {
        label: 'Anthropic — getting started with the API',
        url: 'https://platform.claude.com/docs/en/api/getting-started',
      },
      {
        label: 'OpenAI — API reference',
        url: 'https://platform.openai.com/docs',
      },
      {
        label: 'Gemini API — docs',
        url: 'https://ai.google.dev/gemini-api/docs',
      },
    ],
    glossary: [
      {
        term: 'system prompt',
        def: 'Standing instructions that apply to the whole conversation.',
      },
      {
        term: 'message',
        def: 'One turn in the conversation, with a role: user or assistant.',
      },
      {
        term: 'stateless',
        def: 'The API remembers nothing between calls. You resend the history every time.',
      },
      {
        term: 'content block',
        def: 'One typed piece of a response — text, thinking, a tool call, and so on.',
      },
      {
        term: 'adapter',
        def: 'A small piece of code that translates your own interface to one provider\'s API.',
      },
    ],
    check: [
      {
        q: 'What four things does every Anthropic request carry?',
        a: `The model, \`max_tokens\`, the system prompt (optional but almost always used), and the list of messages.`,
      },
      {
        q: 'Why does a long conversation cost more on every turn?',
        a: 'The API is stateless, so each call resends the entire history. Turn 20 pays again for turns 1 to 19.',
      },
      {
        q: 'Why is `response.content[0].text` a bug waiting to happen?',
        a: `Content is a list of typed blocks. When the model thinks or calls a tool, the first block may not be text. Loop and check \`block.type\`.`,
      },
      {
        q: 'Why build one internal interface over three providers?',
        a: `They use different field names for the same ideas. Your app should depend on one shape of your own; small adapters translate to each provider.`,
      },
    ],
    practice: [
      {
        mode: 'spec',
        title: 'Write the adapter interface',
        body: `Before writing any provider code, write the interface your app will use. It needs to
handle: a system prompt, a list of turns, a model name, an output cap, and a result that
includes the text *and* the token counts.

Write it as a pydantic model for the request, one for the result, and a \`Protocol\` for the
client. Then have AI write the Anthropic adapter against it. Check: does the adapter leak
any Anthropic-specific shape (a content-block list, the \`usage\` object) into your result
type?`,
        answer: `\`\`\`python
from typing import Literal, Protocol
from pydantic import BaseModel

class Turn(BaseModel):
    role: Literal["user", "assistant"]
    text: str

class ChatRequest(BaseModel):
    model: str
    system: str | None = None
    turns: list[Turn]
    max_output_tokens: int = 1024

class ChatResult(BaseModel):
    text: str
    input_tokens: int
    output_tokens: int
    stop: Literal["done", "truncated", "tool", "refused", "other"]
    provider: str

class ChatClient(Protocol):
    async def complete(self, req: ChatRequest) -> ChatResult: ...
\`\`\`

The review check is the point: your \`ChatResult\` must not contain provider objects. The
Anthropic adapter joins the text blocks into one string, copies \`usage.input_tokens\` and
\`usage.output_tokens\` into plain ints, and maps \`stop_reason\` — \`end_turn\` to \`done\`,
\`max_tokens\` to \`truncated\`, \`refusal\` to \`refused\`.

A leaky version returns \`response.content\` or \`response.usage\` directly. It works until
you add the second provider, and then every caller has to know which provider answered.`,
      },
      {
        mode: 'tool',
        title: 'Make the same call three ways',
        body: `Get a key for at least two of the three providers (Gemini's free tier is easiest). Send
the same system prompt and question to each, and print the text and the token counts.

Note one difference you did not expect in each SDK.`,
        answer: `What you should end up noticing:

- **Anthropic** requires \`max_tokens\`; the others don't. Forget it and you get a 400.
- **The system prompt goes in a different place** in each one.
- **Token counts differ for identical text**, because each provider has its own tokenizer. That is why cost comparisons need each provider's own counts.
- **The response objects differ.** Anthropic gives a block list; the other two offer a convenience property that joins the text for you.

The usual snag: an OpenAI or Gemini example from an older tutorial uses an older SDK
style. Check the provider's current quickstart before copying code — these SDKs changed
noticeably in 2025.`,
      },
      {
        mode: 'read',
        title: 'What does the model see on turn 3?',
        body: `Your code keeps \`history\`, a list. On each turn it appends the user message, calls the
model with \`messages=history\`, and appends the answer.

After three turns, how many messages are sent in the third call, and roughly how many
tokens are billed as input if each message is about 200 tokens and the system prompt is
500?`,
        answer: `The third call sends **5 messages**: user 1, assistant 1, user 2, assistant 2, user 3.

Input tokens are roughly 500 (system) + 5 × 200 = **1,500**. The first call was about
700 and the second about 1,100. The system prompt and the old turns are paid for again
every time.

This is why prompt caching (later in this stage) matters so much for chat: most of every
request is a prefix the provider has seen before.`,
      },
    ],
  },
  {
    id: 's2.1.t2',
    moduleId: 's2.1',
    title: 'Tokens, context windows and pricing in practice',
    outcome: `You can predict the cost and the size of a request before you send it — and you know the one question to ask about every context window.`,
    minutes: 35,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
    ],
    animations: ['anim-tokens', 'anim-context-budget'],
    analogy: `In Stage 1 you learned what a token is. This is the practical version: the same idea you
know from cloud bills — you pay per unit, the units have prices, and you should know the
number before the invoice does.`,
    notes: `## Current prices, roughly

Per million tokens, at the time of writing — always check the pricing page:

| Model | Input | Output | Context window |
|---|---|---|---|
| Claude Haiku 4.5 | $1 | $5 | 200K |
| Claude Sonnet 5 | $2 | $10 | 1M |
| Claude Opus 5 | $5 | $25 | 1M |

Two things to take from the table. **Output costs five times input** on every row. And the
jump between models is large: the same work on Opus costs five times what it costs on Haiku.

---

## Do the arithmetic once, by hand

A resume summariser: 2,000 tokens in, 300 out, on Haiku.

\`\`\`
input:  2,000 / 1,000,000 × $1 = $0.002
output:   300 / 1,000,000 × $5 = $0.0015
total per call                 ≈ $0.0035   (about 30 paise)
\`\`\`

At 10,000 resumes a month that is $35. On Opus it would be $175. Now you can decide
whether Opus is *worth* $140 a month for this feature — a real decision, instead of a
default.

---

## Count before you send

\`\`\`python
count = client.messages.count_tokens(
    model="claude-haiku-4-5",
    system=system_prompt,
    messages=messages,
)
print(count.input_tokens)
\`\`\`

Use the provider's own counter. Tokenizers differ between providers — and between
generations of the same provider — so a count from one model is only an estimate for
another.

---

## A context window is a budget, not a goal

"1M context" means you *can* send a million tokens. It does not mean you should:

- **Cost** — a million input tokens on Opus is $5, for one request.
- **Latency** — the model must read all of it before it writes anything.
- **Quality** — models use the start and end of a long context more reliably than the middle.

The one question to ask about any context window: **what is actually in it, and did
something choose that on purpose?** In Stage 3 you will make that choice deliberately
with retrieval, instead of pasting everything in.

---

## The window includes the answer

The model's output shares the window with the input. If the window is 200K and you send
199K, there is room for a 1K answer and no more. Always leave space for \`max_tokens\`.`,
    docs: [
      {
        label: 'Anthropic — pricing',
        url: 'https://www.anthropic.com/pricing',
      },
      {
        label: 'Anthropic — token counting',
        url: 'https://platform.claude.com/docs/en/build-with-claude/token-counting',
      },
      {
        label: 'Anthropic — context windows',
        url: 'https://platform.claude.com/docs/en/build-with-claude/context-windows',
      },
    ],
    glossary: [
      {
        term: 'input tokens',
        def: 'Tokens you send: system prompt, history, documents, question.',
      },
      {
        term: 'output tokens',
        def: 'Tokens the model writes. About five times the price of input tokens.',
      },
      {
        term: 'context window',
        def: 'The most tokens a model can handle in one request, input and output together.',
      },
      {
        term: 'count_tokens',
        def: 'An API call that tells you a request\'s input size before you send it.',
      },
    ],
    check: [
      {
        q: 'On current Claude models, how does output price compare to input price?',
        a: 'Output is five times the input price per token, on every tier.',
      },
      {
        q: 'What does a 1M context window guarantee?',
        a: `Only that a request that large is accepted. It says nothing about whether filling it is affordable, fast, or good for quality.`,
      },
      {
        q: 'Why use the provider\'s own token counter?',
        a: `Tokenizers differ between providers and between model generations, so another counter only gives an estimate.`,
      },
      {
        q: 'Where does the model\'s answer live, relative to the window?',
        a: 'Inside it. Input plus output must fit, so you always reserve room for `max_tokens`.',
      },
    ],
    practice: [
      {
        mode: 'decision',
        title: 'Price three features',
        body: `Using the table in the slides, estimate the monthly cost of each on Haiku 4.5 and on
Opus 5:

1. A chat assistant: 30,000 messages a month, 1,500 tokens in, 250 out
2. A document summariser: 2,000 PDFs a month, 20,000 tokens in, 800 out
3. A classifier: 500,000 emails a month, 300 tokens in, 5 out

Then say which one you would never run on Opus, and why.`,
        answer: `| Feature | Tokens in / out per month | Haiku 4.5 | Opus 5 |
|---|---|---|---|
| Chat | 45M / 7.5M | $45 + $37.5 = **$82.5** | $225 + $187.5 = **$412.5** |
| Summariser | 40M / 1.6M | $40 + $8 = **$48** | $200 + $40 = **$240** |
| Classifier | 150M / 2.5M | $150 + $12.5 = **$162.5** | $750 + $62.5 = **$812.5** |

**The classifier** is the one to keep off Opus. It is high volume, the task is simple,
and nearly all of its cost is input. A small model usually classifies emails as well as a
large one, so the extra $650 a month buys little.

The instinct to take away: **multiply before you choose**. The feature that looks cheapest
per call — five output tokens — is the most expensive per month.`,
      },
      {
        mode: 'tool',
        title: 'Count tokens for your own prompts',
        body: `Take three real prompts from a project idea of yours. Count each with
\`client.messages.count_tokens\` on Haiku 4.5, and again on a Claude 5 model. Record both
counts and the difference.`,
        answer: `You should see **different counts for the same text** on the two models. Newer Claude
models use a different tokenizer from Haiku 4.5, and it can produce noticeably more tokens
for the same text.

The lesson is not the exact ratio, which varies with the text. It is that **a cost
estimate is tied to a model**. When you switch models, re-count — do not reuse the old
number.

A snag: \`count_tokens\` is itself an API call. It is free, but rate-limited, so don't put
it in a hot loop — count once per prompt template, then estimate the variable parts.`,
      },
      {
        mode: 'read',
        title: 'Why did this request fail?',
        body: `A request to a model with a 200K context window sends 196,000 input tokens with
\`max_tokens=8000\`. It is rejected. Why, and what are two fixes?`,
        answer: `Input plus the requested output would be 204,000 tokens — more than the 200K window. The
output space counts too.

Fixes:

- **Send less.** Retrieve the relevant parts instead of the whole document. This is almost always the right fix, because it also cuts cost and improves quality.
- **Ask for less output** — lower \`max_tokens\` so the total fits. Only if the answer genuinely needs little room.

(Switching to a model with a bigger window also works, and is usually the most expensive
way to avoid thinking about what the model actually needs to see.)`,
      },
    ],
  },
  {
    id: 's2.1.t3',
    moduleId: 's2.1',
    title: 'Sampling settings — and why the newest models took them away',
    outcome: 'You know what temperature does, which models accept it, and what to use instead when they don\'t.',
    minutes: 30,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
    ],
    animations: ['anim-temperature'],
    analogy: `In Stage 1 you learned temperature as a randomness dial. The practical twist in 2026 is
that the dial is disappearing: Anthropic's newest models reject it outright. Like a
deprecated config flag in a library you depend on — you need to know it existed, why it
went, and what replaced it.`,
    notes: `## The classic dials

At each step the model has a probability for every possible next token. Sampling settings
decide how it picks one:

- **temperature** — reshapes the probabilities. Low sharpens them toward the top choice; high flattens them.
- **top_p** — only consider the smallest set of tokens whose probabilities add up to p.
- **top_k** — only consider the k most likely tokens.
- **stop sequences** — stop writing the moment a given string appears.
- **max_tokens** — a hard cap on output length.

Step through the animation: as temperature rises, the top token's share falls and the long
tail gets a real chance.

---

## Which models accept what

- **Claude Haiku 4.5** and older Claude models accept \`temperature\` from 0 to 1.
- **Claude's newest models** — Opus 4.7 and later, Sonnet 5, Opus 5 — **reject** \`temperature\`, \`top_p\` and \`top_k\` with a 400 error.
- **Reasoning models on other providers** also restrict or ignore temperature.

The reason: models that think before answering already manage their own exploration.
Letting you push randomness into that process mostly made results worse.

---

## What you use instead

**For consistent output:** constrain the *format*, not the randomness. A schema-enforced
structured output (later in this stage) gives you valid JSON every time, whatever the
sampling.

**For more or less deliberation:** the **effort** setting on newer Claude models — covered
two topics from now. It trades thoroughness against cost, which is what people were
usually trying to do with temperature anyway.

**For variety** (brainstorming, several drafts): ask for several distinct options in one
response, or make several calls with different instructions.

---

## Two settings that still matter everywhere

**\`max_tokens\`** is a cost cap and a truncation risk at the same time. Set it too low and
JSON gets cut off mid-object. Set it generously and rely on the model to stop on its own —
it does.

**Stop sequences** end output at a marker you choose, such as \`</answer>\`. Useful when you
parse a tagged format and don't want anything after the closing tag.

---

## Determinism is not on offer

Even at temperature 0, on models that still accept it, the same prompt can occasionally
produce different output. Requests are batched on shared hardware, and tiny numeric
differences can flip a token. **Never build anything that depends on an exact repeat.**
Build checks — validation, evaluation — that tolerate variation.`,
    docs: [
      {
        label: 'Anthropic — Messages API reference',
        url: 'https://platform.claude.com/docs/en/api/messages',
      },
      {
        label: 'Anthropic — models overview',
        url: 'https://platform.claude.com/docs/en/about-claude/models/overview',
      },
    ],
    glossary: [
      {
        term: 'temperature',
        def: 'How strongly sampling favours the most likely tokens. Rejected by Claude\'s newest models.',
      },
      {
        term: 'top_p / top_k',
        def: 'Other ways to limit which tokens can be picked. Also rejected by the newest Claude models.',
      },
      {
        term: 'stop sequence',
        def: 'A string that ends the output the moment it would appear. Not included in the text.',
      },
      {
        term: 'max_tokens',
        def: 'A hard cap on output length. Too low truncates the answer.',
      },
    ],
    check: [
      {
        q: 'What happens if you send temperature to Claude Opus 5?',
        a: 'A 400 error. Claude\'s newest models reject temperature, top_p and top_k.',
      },
      {
        q: 'How do you get consistent output format without temperature 0?',
        a: `Constrain the format itself with schema-enforced structured output. That guarantees valid structure regardless of sampling.`,
      },
      {
        q: 'Why is temperature 0 not a determinism guarantee?',
        a: `Batched inference on shared hardware introduces tiny numeric differences that can occasionally change a token.`,
      },
      {
        q: 'What does max_tokens trade off?',
        a: 'It caps cost, but set too low it truncates output — for example cutting JSON off mid-object.',
      },
    ],
    practice: [
      {
        mode: 'tool',
        title: 'Hit the 400 on purpose',
        body: `Send the same request twice: once to \`claude-haiku-4-5\` with \`temperature=0.2\`, and once
to \`claude-sonnet-5\` with the same setting. Read the error on the second one carefully.

Then remove \`temperature\` from the second request and add a stop sequence of
\`"</answer>"\`, asking the model to wrap its answer in \`<answer>\` tags.`,
        answer: `- The Haiku request succeeds.
- The Sonnet 5 request fails with a **400 invalid request error** saying the sampling parameter isn't supported for that model.

With the stop sequence, the response ends right before \`</answer>\` — the stop string
itself is **not** included in the text. \`stop_reason\` is \`"stop_sequence"\` and
\`stop_sequence\` tells you which one fired.

The lesson for your provider adapter: **sampling settings are per-model capabilities**,
not universal knobs. An adapter that always sends \`temperature\` breaks the day you
upgrade the model.`,
      },
      {
        mode: 'decision',
        title: 'What would you use instead?',
        body: `For each goal, the old habit was a temperature setting. Say what you would do on a
current Claude model instead:

1. "Always return valid JSON for this extraction"
2. "Give me five different headline ideas"
3. "Think harder about this tricky contract clause"
4. "Be a bit more creative in the marketing copy"`,
        answer: `1. **Structured output with a schema.** Validity is guaranteed by the API, not hoped for.
2. **Ask for five distinct options in one response**, with an instruction that they differ in angle — or run a few calls with different instructions.
3. **Raise the effort setting** (or use a stronger model). That buys deliberation, which temperature never did.
4. **Say so in the prompt** — describe the tone, give an example of the register you want. Prompting steers style far more precisely than randomness ever did.

The pattern: temperature was a blunt stand-in for four different things. Each now has a
direct control.`,
      },
    ],
  },
  {
    id: 's2.1.t4',
    moduleId: 's2.1',
    title: 'Stop reasons and usage: reading the response properly',
    outcome: `You can tell from a response why it ended and what it cost — and your code branches on that instead of assuming success.`,
    minutes: 30,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
    ],
    animations: [],
    analogy: `An HTTP 200 does not mean you got what you wanted. Like an Express handler that returns 200
with \`{error: ...}\` inside, a model response can succeed at the transport level and still be
truncated, refused, or waiting for a tool. The stop reason is where it tells you.`,
    notes: `## Every response says why it stopped

\`\`\`python
response.stop_reason
\`\`\`

| Value | What it means | What your code should do |
|---|---|---|
| \`end_turn\` | Finished naturally | Use the answer |
| \`max_tokens\` | Hit your output cap mid-thought | Treat as incomplete — never parse it as if whole |
| \`stop_sequence\` | Hit one of your stop strings | Expected, if you set one |
| \`tool_use\` | Wants you to run a tool | Run it, send back the result (Stage 4) |
| \`pause_turn\` | Paused a long server-side task | Send the turn back to let it continue |
| \`refusal\` | Declined for safety reasons | Show a clear message; check \`stop_details\` |

---

## The \`max_tokens\` trap

\`\`\`python
data = json.loads(response.content[0].text)
\`\`\`

If \`stop_reason\` is \`max_tokens\`, that JSON was cut off, and this line throws — or worse,
a lenient parser accepts half an object. **Check the stop reason before you parse.**

\`\`\`python
if response.stop_reason == "max_tokens":
    raise TruncatedResponse(f"hit max_tokens={max_tokens}")
\`\`\`

Then fix the cause: raise \`max_tokens\`, or ask for a shorter output.

---

## Usage: the bill, per request

\`\`\`python
u = response.usage
u.input_tokens                  # uncached input
u.output_tokens                 # what the model wrote, including any thinking
u.cache_creation_input_tokens   # input written to the cache on this call
u.cache_read_input_tokens       # input served from the cache (much cheaper)
\`\`\`

Log these on **every** call, with the model name and your prompt version. That one log
line is the raw material for your cost dashboard in Stage 5.

---

## Turn usage into rupees

\`\`\`python
PRICES = {"claude-haiku-4-5": (1.00, 5.00)}   # $ per 1M tokens, input and output

def cost_usd(model: str, u) -> float:
    p_in, p_out = PRICES[model]
    cached = (u.cache_read_input_tokens or 0) * p_in * 0.1
    written = (u.cache_creation_input_tokens or 0) * p_in * 1.25
    return (u.input_tokens * p_in + cached + written + u.output_tokens * p_out) / 1_000_000
\`\`\`

Cache reads cost about a tenth of normal input, and cache writes a quarter more than
normal input — which is why caching the right prefix saves so much.

---

## Refusals are a normal outcome

A refusal is not an exception — it arrives as a 200 with \`stop_reason == "refusal"\`. Your
interface needs a designed state for it: a short, honest message, not a spinner that never
ends or a blank bubble.`,
    docs: [
      {
        label: 'Anthropic — handling stop reasons',
        url: 'https://platform.claude.com/docs/en/api/handling-stop-reasons',
      },
      {
        label: 'Anthropic — Messages API reference',
        url: 'https://platform.claude.com/docs/en/api/messages',
      },
    ],
    glossary: [
      {
        term: 'stop_reason',
        def: 'Why the model stopped: finished, hit the cap, wants a tool, refused, and so on.',
      },
      {
        term: 'usage',
        def: 'The token counts for one call — the basis of its cost.',
      },
      {
        term: 'cache read',
        def: 'Input served from the provider\'s prompt cache, billed at about a tenth of the normal rate.',
      },
      {
        term: 'refusal',
        def: 'The model declining a request. Arrives as a normal response, not an error.',
      },
    ],
    check: [
      {
        q: 'A response has stop_reason max_tokens. What must your code not do?',
        a: 'Parse or use it as if complete. It was cut off; treat it as an error or retry with more room.',
      },
      {
        q: 'Which usage fields do you need to compute the cost of one call?',
        a: `input_tokens, output_tokens, cache_creation_input_tokens and cache_read_input_tokens, plus the model's prices.`,
      },
      {
        q: 'How does a refusal arrive?',
        a: 'As a normal 200 response with stop_reason refusal — not as an exception.',
      },
      {
        q: 'Roughly what do cache reads cost compared with normal input?',
        a: 'About a tenth of the normal input price.',
      },
    ],
    practice: [
      {
        mode: 'primitive',
        title: 'Write the cost function by hand',
        body: `Write \`cost_usd(model, usage)\` without AI. It must handle cached reads, cache writes,
normal input and output, and raise a clear error for an unknown model.

Test it with a fake usage object: 1,000 input, 2,000 cache read, 0 cache write, 500
output, on a model priced $1 in and $5 out.`,
        answer: `\`\`\`python
from dataclasses import dataclass

PRICES = {"claude-haiku-4-5": (1.00, 5.00), "claude-sonnet-5": (2.00, 10.00),
          "claude-opus-5": (5.00, 25.00)}

def cost_usd(model: str, u) -> float:
    if model not in PRICES:
        raise KeyError(f"no price for model {model!r} — add it before calling")
    p_in, p_out = PRICES[model]
    total = (
        u.input_tokens * p_in
        + (u.cache_read_input_tokens or 0) * p_in * 0.10
        + (u.cache_creation_input_tokens or 0) * p_in * 1.25
        + u.output_tokens * p_out
    )
    return total / 1_000_000

@dataclass
class U:
    input_tokens: int; output_tokens: int
    cache_read_input_tokens: int = 0; cache_creation_input_tokens: int = 0

cost_usd("claude-haiku-4-5", U(1000, 500, cache_read_input_tokens=2000))
# (1000×1 + 2000×0.1 + 0 + 500×5) / 1e6 = (1000 + 200 + 2500) / 1e6 = 0.0037
\`\`\`

Expected: **$0.0037**.

Two details worth keeping:

- **Raise on an unknown model.** A silent zero makes a new model look free on your dashboard.
- **Write-cost multiplier.** This uses the 5-minute cache price (1.25×); a one-hour cache write costs 2×.`,
      },
      {
        mode: 'read',
        title: 'What went wrong in each?',
        body: `1. The code parses every response as JSON. One day in five hundred it crashes with "Unterminated string".
2. The chat UI shows an empty bubble for some questions.
3. The cost dashboard shows a new model as costing nothing.`,
        answer: `1. **Truncation.** Those responses have \`stop_reason == "max_tokens"\` — the JSON was cut off. Check the stop reason before parsing, and raise \`max_tokens\` or shorten the requested output.
2. **Unhandled stop reasons.** Likely \`refusal\`, or \`tool_use\` with no text block. The UI assumed a text block always exists. Design an explicit state for each stop reason.
3. **A silent default price of zero** for unknown models. Make the cost function raise on a model it has no price for.`,
      },
      {
        mode: 'tool',
        title: 'Log a complete usage line',
        body: `Wrap one real call so that it logs, as structured JSON: model, prompt version,
stop_reason, all four usage numbers, cost in USD and in rupees, and latency in
milliseconds.`,
        answer: `\`\`\`python
import time, structlog
log = structlog.get_logger()
USD_TO_INR = 88.0   # keep this in settings, and update it

async def complete_logged(client, *, model, prompt_version, **kwargs):
    start = time.perf_counter()
    r = await client.messages.create(model=model, **kwargs)
    u = r.usage
    usd = cost_usd(model, u)
    log.info("model_call", model=model, prompt_version=prompt_version,
             stop_reason=r.stop_reason,
             input_tokens=u.input_tokens, output_tokens=u.output_tokens,
             cache_read=u.cache_read_input_tokens or 0,
             cache_write=u.cache_creation_input_tokens or 0,
             cost_usd=round(usd, 6), cost_inr=round(usd * USD_TO_INR, 4),
             latency_ms=round((time.perf_counter() - start) * 1000))
    return r
\`\`\`

Keep the exchange rate as a setting, not a constant buried in code — it changes, and your
rupee figures should be traceable to the rate you used.`,
      },
    ],
  },
  {
    id: 's2.1.t5',
    moduleId: 's2.1',
    title: 'Thinking and effort: paying for reasoning on purpose',
    outcome: `You can decide when a model should think before answering, control how much, and account for what it costs.`,
    minutes: 35,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
    ],
    animations: [],
    analogy: `Think of a code review. A quick glance catches typos; a careful read catches the bug in the
retry logic. Both are useful — the careful one costs more of someone's time. Thinking models
let you choose which kind of review you are paying for.`,
    notes: `## What "thinking" means

A thinking model works through the problem before it writes the answer — breaking it down,
checking itself, considering options. You see the answer; the reasoning happens first.

On current Claude models this is **adaptive**: the model decides how much to think based on
how hard the request is.

\`\`\`python
response = client.messages.create(
    model="claude-sonnet-5",
    max_tokens=16000,
    thinking={"type": "adaptive"},
    output_config={"effort": "medium"},
    messages=[{"role": "user", "content": "Is this refund policy clause ambiguous? ..."}],
)
\`\`\`

---

## Effort is the dial

\`effort\` sets how thorough the model is: \`low\`, \`medium\`, \`high\`, \`xhigh\`, \`max\`.

- **low** — quick, terse, fewer tool calls. Good for classification and simple extraction.
- **medium** — a sensible middle for most product features.
- **high** — careful work; the default on most current models.
- **xhigh / max** — for hard problems where being right matters more than cost.

Effort changes cost because thinking tokens are **billed as output tokens** — the expensive
kind.

---

## You don't see the raw reasoning

Thinking arrives as \`thinking\` blocks in the response. By default on current models their
text is empty — the reasoning happened and was billed, but isn't shown. You can ask for a
readable summary:

\`\`\`python
thinking={"type": "adaptive", "display": "summarized"}
\`\`\`

If you show reasoning to users, turn on the summary. Otherwise a long think looks like a
long silent pause in your interface.

---

## When thinking pays for itself

**Worth it:** multi-step reasoning, careful reading of dense text (contracts, regulations),
code, anything where a wrong answer is expensive.

**Not worth it:** classification, simple extraction, reformatting, short factual lookups.
Low effort, or a small model, does these as well for much less.

**Measure, don't guess.** Run your eval set (Stage 3) at two effort levels and compare
quality and cost. Often a newer model at low effort beats an older model at high effort.

---

## Model differences you will trip on

- **Claude Opus 5** thinks by default; omitting \`thinking\` still gives you adaptive thinking.
- **Claude Haiku 4.5** does not support \`effort\`. It uses an older style: \`thinking={"type": "enabled", "budget_tokens": 2048}\`, where the budget must be below \`max_tokens\`.
- **The older fixed-budget style is rejected** by the newest models.

Same lesson as sampling settings: capabilities are per model. Your adapter must know which
model it is talking to.`,
    docs: [
      {
        label: 'Anthropic — extended thinking',
        url: 'https://platform.claude.com/docs/en/build-with-claude/extended-thinking',
      },
      {
        label: 'Anthropic — effort',
        url: 'https://platform.claude.com/docs/en/build-with-claude/effort',
      },
    ],
    glossary: [
      {
        term: 'thinking',
        def: 'Reasoning the model does before writing its answer. Billed as output tokens.',
      },
      {
        term: 'adaptive thinking',
        def: 'The model decides how much to think, based on the request.',
      },
      {
        term: 'effort',
        def: 'A setting from low to max that controls how thorough the model is.',
      },
      {
        term: 'thinking summary',
        def: 'A readable summary of the reasoning. The raw reasoning is never returned.',
      },
    ],
    check: [
      {
        q: 'How are thinking tokens billed?',
        a: 'As output tokens — the expensive kind.',
      },
      {
        q: 'What does effort control?',
        a: `How thorough the model is: how much it thinks and how many steps it takes. Higher effort costs more and is slower.`,
      },
      {
        q: 'Why can a long think look broken in a chat UI?',
        a: `By default the thinking text is empty, so the user sees nothing while the model reasons. Show a summary or a clear 'thinking' state.`,
      },
      {
        q: 'Name two tasks where thinking rarely pays for itself.',
        a: 'Classification and simple extraction — also reformatting and short lookups.',
      },
      {
        q: 'Why does your adapter need to know the exact model?',
        a: 'Thinking and effort settings differ per model; the wrong style returns a 400.',
      },
    ],
    practice: [
      {
        mode: 'tool',
        title: 'Measure effort on one hard question',
        body: `Pick a question with a real trap in it — a tricky policy clause, or a logic puzzle with
a tempting wrong answer. Run it on \`claude-sonnet-5\` at \`low\`, \`medium\` and \`high\`
effort, with \`display: "summarized"\`.

Record for each: right or wrong, output tokens, cost, and latency.`,
        answer: `The usual shape:

- **Output tokens and latency rise** with effort, sometimes steeply.
- **Correctness** often improves from low to medium on a genuinely tricky question, and flattens after that.
- The **thinking summary** at low effort is short and sometimes skips the trap entirely; at higher effort you can see it considered the alternative.

If all three levels got it right, your question was too easy to tell them apart — which is
itself the lesson: **effort only pays on problems hard enough to need it.**

A snag: one question is an anecdote. In Stage 3 you will run the same comparison over a
whole evaluation set before choosing a default.`,
      },
      {
        mode: 'decision',
        title: 'Choose effort per feature',
        body: `Pick an effort level — or "use a small model instead" — for each, and justify it in one line:

1. Tagging support tickets into eight categories
2. Checking whether a resume meets each must-have requirement of a job post
3. Drafting a friendly reply to a customer
4. Finding the clause in a 40-page contract that allows early termination`,
        answer: `1. **Small model, or low effort.** Simple, high volume; extra deliberation rarely changes a category.
2. **Medium.** Several requirements to check against evidence; errors are costly to candidates, but it is not deep reasoning.
3. **Low.** Tone and fluency, not reasoning. Style comes from the prompt.
4. **High.** Careful reading of dense, cross-referenced text, where missing the clause is the whole failure.

Other answers can be right. What matters is that you chose **per feature**, from the
cost of a mistake, rather than one global setting.`,
      },
      {
        mode: 'read',
        title: 'Why did this request fail?',
        body: `\`\`\`python
client.messages.create(
    model="claude-haiku-4-5",
    max_tokens=1024,
    thinking={"type": "enabled", "budget_tokens": 2048},
    messages=[...],
)
\`\`\`

It returns a 400. Why? And what fails if you send the same request to Claude Sonnet 5?`,
        answer: `**On Haiku 4.5:** \`budget_tokens\` must be *less than* \`max_tokens\`. Here 2,048 is bigger
than 1,024, so the request is invalid. Raise \`max_tokens\` above the budget — for example
\`max_tokens=4096\`.

**On Sonnet 5:** the fixed-budget style isn't accepted at all. Use
\`thinking={"type": "adaptive"}\` and control depth with \`output_config={"effort": ...}\`.

Two models, two different failures for the same code. That is why your adapter keeps a
small capability map per model.`,
      },
    ],
  },
  {
    id: 's2.1.t6',
    moduleId: 's2.1',
    title: 'Choosing a model, and living with rate limits',
    outcome: `You can pick a model per feature from capability, latency and cost — and your code survives rate limits instead of failing on them.`,
    minutes: 35,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
    ],
    animations: [],
    analogy: `You already pick database instance sizes: a small one for the admin panel, a big one for
the checkout service. Model choice is the same decision, made per feature, and just as
easy to over-provision by default.`,
    notes: `## Three questions, in this order

1. **What is the cheapest model that is good enough?** "Good enough" is measured on your own examples, not on a leaderboard.
2. **What latency does the user tolerate?** A chat reply needs a fast first token. An overnight batch doesn't care.
3. **What does a mistake cost?** A wrong ticket tag is cheap. A wrong answer about someone's insurance cover is not.

A common, sensible shape: **a small model for most traffic**, a large model where mistakes
are expensive, and measurement deciding the boundary.

---

## A starting map

| Job | Start with |
|---|---|
| Classification, tagging, routing | Haiku 4.5 |
| Extraction into a schema | Haiku 4.5; move up if accuracy falls short |
| Everyday chat, drafting, summaries | Sonnet 5 |
| Hard reasoning, dense documents, agents | Opus 5 |

This is a starting point for testing, not an answer. Stage 3 gives you the evaluation set
that decides it properly.

---

## Rate limits are normal, not exceptional

Providers cap how much you can send, usually per model and on several axes at once:

- **requests per minute**
- **input tokens per minute**
- **output tokens per minute**

Go over any of them and you get **429 Too Many Requests**, usually with a \`retry-after\`
header telling you how long to wait.

---

## The SDK already retries — know what it does

The Anthropic Python SDK retries connection errors, 408, 409, 429 and 5xx responses
automatically, **twice by default**, with backoff. You can tune it:

\`\`\`python
client = anthropic.AsyncAnthropic(max_retries=4, timeout=60.0)
\`\`\`

So your retry wrapper from Stage 1 is for *your* code paths and other APIs — don't stack a
second retry loop on top of the SDK's, or one failure becomes nine requests.

---

## What actually prevents 429s

- **A concurrency cap per model** — the semaphore from Stage 1.
- **Smaller requests** — the token limits usually bite before the request limit.
- **Caching** — on the Claude API, cache reads don't count toward the input-token limit on most models, so a well-cached prefix raises your effective throughput.
- **Batch work goes to the Batch API** — non-urgent jobs run at half price and out of your interactive limits.

And when a 429 does happen in a user-facing path, **degrade honestly**: a clear "busy,
retrying" state, not a spinner that never ends.`,
    docs: [
      {
        label: 'Anthropic — models overview',
        url: 'https://platform.claude.com/docs/en/about-claude/models/overview',
      },
      {
        label: 'Anthropic — rate limits',
        url: 'https://platform.claude.com/docs/en/api/rate-limits',
      },
      {
        label: 'Anthropic — errors',
        url: 'https://platform.claude.com/docs/en/api/errors',
      },
    ],
    glossary: [
      {
        term: 'rate limit',
        def: 'A cap on requests or tokens per minute. Exceeding it returns a 429.',
      },
      {
        term: 'retry-after',
        def: 'A response header saying how long to wait before trying again.',
      },
      {
        term: 'max_retries',
        def: 'How many times the SDK retries a failed request. Two by default.',
      },
      {
        term: 'Batch API',
        def: 'Asynchronous processing at half price, for work that doesn\'t need an instant answer.',
      },
    ],
    check: [
      {
        q: 'What three questions decide model choice, in order?',
        a: `The cheapest model that is good enough on your own examples, the latency the user tolerates, and what a mistake costs.`,
      },
      {
        q: 'Which rate limit usually bites first?',
        a: 'A token-per-minute limit, especially input tokens for long documents.',
      },
      {
        q: 'How many times does the Anthropic SDK retry by default, and on what?',
        a: 'Twice, on connection errors, 408, 409, 429 and 5xx.',
      },
      {
        q: 'Why not wrap the SDK call in your own retry loop as well?',
        a: 'Retries multiply: two layers of three attempts turn one failure into up to nine requests.',
      },
    ],
    practice: [
      {
        mode: 'decision',
        title: 'Choose a model per feature',
        body: `For a hiring product, choose a starting model for each feature and say what result would
make you move up or down:

1. Detecting the language of an uploaded resume
2. Extracting structured fields from a resume
3. Explaining to a candidate why they don't match a job
4. A recruiter's free-text search over 50,000 candidates`,
        answer: `1. **Haiku 4.5**, or no model — a language-detection library does this for free. Move up never.
2. **Haiku 4.5**, checked against your 30-resume golden set. Move to Sonnet 5 if field accuracy stays under your bar after prompt fixes.
3. **Sonnet 5.** It is candidate-facing and needs care and tone. Move to Opus 5 only if evaluation shows unfair or wrong explanations.
4. **Not a generation model at first** — this is retrieval (Stage 3). A model may rewrite the query or rerank results, and Haiku 4.5 is usually enough for that.

The point of the last one: the best model choice is sometimes **no model**, or a model
doing a small part of the job.`,
      },
      {
        mode: 'spec',
        title: 'Spec a model router',
        body: `Spec a tiny router: given a feature name, it returns the model, effort level (if any),
and \`max_tokens\` to use. It must also refuse to send \`effort\` to a model that doesn't
support it.

Have AI implement it, then check: what happens when someone adds a new model to the
config but forgets to say which capabilities it has?`,
        answer: `\`\`\`python
from pydantic import BaseModel

class ModelCaps(BaseModel):
    supports_effort: bool
    supports_temperature: bool

CAPS = {
    "claude-haiku-4-5": ModelCaps(supports_effort=False, supports_temperature=True),
    "claude-sonnet-5":  ModelCaps(supports_effort=True,  supports_temperature=False),
    "claude-opus-5":    ModelCaps(supports_effort=True,  supports_temperature=False),
}

class Route(BaseModel):
    model: str
    effort: str | None = None
    max_tokens: int

ROUTES = {
    "ticket_tag":    Route(model="claude-haiku-4-5", max_tokens=64),
    "resume_fields": Route(model="claude-haiku-4-5", max_tokens=2048),
    "gap_explainer": Route(model="claude-sonnet-5", effort="medium", max_tokens=4096),
}

def request_kwargs(feature: str) -> dict:
    r = ROUTES[feature]
    caps = CAPS[r.model]                      # KeyError if the model is unknown
    kw = {"model": r.model, "max_tokens": r.max_tokens}
    if r.effort:
        if not caps.supports_effort:
            raise ValueError(f"{r.model} does not support effort")
        kw["output_config"] = {"effort": r.effort}
    return kw
\`\`\`

**The forgotten-capabilities case:** a lookup that raises (\`CAPS[r.model]\`) fails loudly
at the first request, which is what you want. A version that uses \`CAPS.get(model,
default)\` silently assumes capabilities, and gets a 400 in production instead. Better
still, check at startup that every routed model has a capability entry.`,
      },
      {
        mode: 'tool',
        title: 'Watch the SDK retry',
        body: `Turn on the SDK's debug logging (\`ANTHROPIC_LOG=debug\` in the environment) and make a
burst of 30 concurrent calls with no semaphore on a low-limit key or a small model.
Find the retries in the log.`,
        answer: `In the debug output you should see requests that received a **429**, followed by the SDK
waiting and retrying — honouring \`retry-after\` when the server sends it.

Things to notice:

- Some requests succeed only on their second or third attempt, so their **latency is much higher** than the rest. Averages hide this; p95 shows it.
- With enough pressure, some requests exhaust their retries and raise \`anthropic.RateLimitError\`. Your code needs a path for that.
- Add a \`Semaphore(5)\` and run it again. The 429s should mostly disappear, and total time often improves.`,
      },
    ],
  },
];
