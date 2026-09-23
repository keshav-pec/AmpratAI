import type { Topic } from '@/lib/types';

export const s2_2: Topic[] = [
  {
    id: 's2.2.t1',
    moduleId: 's2.2',
    title: 'How provider streaming works: events and deltas',
    outcome: 'You can read a raw model stream event by event, and you know which event carries what.',
    minutes: 30,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
    ],
    animations: [],
    analogy: `You have consumed a Node readable stream: \`data\` events with chunks, then \`end\`. A model
stream is the same idea with named event types — a start event, many small delta events,
and a stop event — sent as Server-Sent Events.`,
    notes: `## The easy way first

\`\`\`python
async with client.messages.stream(
    model="claude-haiku-4-5",
    max_tokens=2048,
    messages=[{"role": "user", "content": "Explain RAG in three sentences."}],
) as stream:
    async for text in stream.text_stream:
        print(text, end="", flush=True)
    final = await stream.get_final_message()

print(final.usage.output_tokens, final.stop_reason)
\`\`\`

\`text_stream\` gives you just the text pieces. \`get_final_message()\` gives you the whole
message afterwards — content, stop reason and usage — as if you had not streamed at all.

---

## What is actually on the wire

Underneath, the provider sends a sequence of typed events:

\`\`\`
message_start          the message begins; includes input token usage
content_block_start    a block begins (text, thinking, or a tool call)
content_block_delta    a small piece of that block  ← most events are these
content_block_delta    ...
content_block_stop     that block is complete
message_delta          stop_reason and final output token count
message_stop           done
\`\`\`

There are also occasional \`ping\` events to keep the connection alive, and possibly an
\`error\` event.

---

## Deltas come in kinds

A \`content_block_delta\` carries one of:

- **\`text_delta\`** — a few characters of answer text
- **\`thinking_delta\`** — a piece of reasoning, when thinking is shown
- **\`input_json_delta\`** — a piece of a tool call's arguments, as partial JSON

\`\`\`python
async for event in stream:
    if event.type == "content_block_delta" and event.delta.type == "text_delta":
        send_to_browser(event.delta.text)
\`\`\`

The helper's \`text_stream\` is exactly this filter, done for you.

---

## An error can arrive after a 200

The HTTP status arrived with the first byte, so a problem later in generation — the
service is overloaded, say — comes as an **\`error\` event inside the stream**. The SDK
turns it into an exception while you iterate.

This is why your own endpoint needs the same design as Stage 1: errors after the first
byte travel *inside* the stream as an event your interface knows how to show.

---

## Usage while streaming

Input tokens are known at \`message_start\`. Output tokens are only final at \`message_delta\`,
near the end. So cost logging for a streamed call happens **when the stream finishes** —
and must also happen when it is cancelled halfway, because the tokens generated so far
were still billed.`,
    docs: [
      {
        label: 'Anthropic — streaming messages',
        url: 'https://platform.claude.com/docs/en/build-with-claude/streaming',
      },
      {
        label: 'Anthropic Python SDK',
        url: 'https://github.com/anthropics/anthropic-sdk-python',
      },
    ],
    glossary: [
      {
        term: 'event',
        def: 'One typed message in the stream: a start, a delta, a stop, and so on.',
      },
      {
        term: 'delta',
        def: 'A small piece of a block — a few characters, or a fragment of JSON.',
      },
      {
        term: 'text_stream',
        def: 'The SDK helper that yields only the text pieces.',
      },
      {
        term: 'get_final_message',
        def: 'Returns the complete message after streaming finishes.',
      },
    ],
    check: [
      {
        q: 'What does get_final_message() give you after streaming?',
        a: 'The complete message — all content, stop reason and usage — as if you had not streamed.',
      },
      {
        q: 'Which event type carries most of the traffic?',
        a: 'content_block_delta, each with a small piece of text, thinking, or tool-call JSON.',
      },
      {
        q: 'How can an error arrive after a 200 status?',
        a: 'As an error event inside the stream, because the status line was already sent with the first byte.',
      },
      {
        q: 'When do you know the final output token count?',
        a: 'At the message_delta event near the end of the stream.',
      },
    ],
    practice: [
      {
        mode: 'tool',
        title: 'Print the raw events',
        body: `Stream a short answer and print every event's \`type\` — and for deltas, the delta type
too. Then ask for something that makes the model use a tool (if you have one defined) or
think, and compare the event sequence.`,
        answer: `For a plain answer you should see roughly:

\`\`\`
message_start
content_block_start      (text)
content_block_delta      (text_delta)   × many
content_block_stop
message_delta
message_stop
\`\`\`

With thinking shown, a **thinking block comes first**, with its own start, deltas and
stop, before the text block begins. With a tool call, a \`tool_use\` block streams its
arguments as \`input_json_delta\` pieces — partial JSON you must not parse until the block
stops.

Notice how many events a short answer produces. That is why your browser-side code
must be cheap per event (next topics).`,
      },
      {
        mode: 'read',
        title: 'Why is the logged cost wrong?',
        body: `\`\`\`python
async with client.messages.stream(...) as stream:
    async for text in stream.text_stream:
        yield text
final = await stream.get_final_message()
log_cost(final.usage)
\`\`\`

Costs in the dashboard are too low compared with the invoice. Nothing crashes. Why?`,
        answer: `When the user cancels, the generator is cancelled at a \`yield\`, the \`async with\` exits
early, and the lines after the loop **never run**. Every cancelled stream is billed for
the tokens it produced and **logged as nothing**.

Fix: record usage in a \`finally\`, from whatever the stream accumulated so far.

\`\`\`python
usage = None
try:
    async with client.messages.stream(...) as stream:
        async for text in stream.text_stream:
            yield text
        usage = (await stream.get_final_message()).usage
finally:
    log_cost(usage, cancelled=usage is None)
\`\`\`

For cancelled streams, log what you know — the input tokens and the characters sent so
far — and flag the row as partial. An undercounted dashboard is worse than a flagged
estimate.`,
      },
    ],
  },
  {
    id: 's2.2.t2',
    moduleId: 's2.2',
    title: 'From provider to FastAPI to the browser',
    outcome: `You can pass a model stream through your own API to a browser without buffering it anywhere along the way.`,
    minutes: 35,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
    ],
    animations: [],
    analogy: `You built this pipe in Stage 1 with a fake counter. Now the source is a real model. Nothing
about the pipe changes — which is exactly the point of having built it first.`,
    notes: `## Three hops, each able to break streaming

\`\`\`
provider  ──SSE──▶  your FastAPI  ──SSE──▶  browser
\`\`\`

Every hop must pass pieces through **as they arrive**. One component that collects the
whole thing first — a middleware, a proxy, a helper that returns a string — silently turns
streaming off.

---

## The endpoint

\`\`\`python
@app.post("/chat")
async def chat(body: ChatIn, client: AsyncAnthropic = Depends(get_client)):
    async def events():
        try:
            async with client.messages.stream(
                model=body.model, max_tokens=2048, system=SYSTEM,
                messages=[m.model_dump() for m in body.messages],
            ) as stream:
                async for text in stream.text_stream:
                    yield f"data: {json.dumps({'type': 'text', 'text': text})}\\n\\n"
                final = await stream.get_final_message()
                yield f"data: {json.dumps({'type': 'done', 'stop': final.stop_reason})}\\n\\n"
        except anthropic.APIError as e:
            yield f"data: {json.dumps({'type': 'error', 'message': 'model unavailable'})}\\n\\n"
            log.warning("stream_failed", error=type(e).__name__)

    return StreamingResponse(events(), media_type="text/event-stream",
                             headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})
\`\`\`

---

## Your events, not the provider's

Notice that the browser never sees Anthropic's event format. You translate into **your own**
small set: \`text\`, \`done\`, \`error\` — later \`tool\`, \`usage\`, \`citation\`.

Two reasons. Your React code stays the same if you switch provider. And you never leak
provider details — raw error bodies can contain fragments of your prompt.

---

## Don't forward provider errors verbatim

The user sees "model unavailable, retrying". Your logs get the exception type and request
id. The provider's full error message stays on the server.

---

## Check each hop

When streaming "doesn't work", find the hop that buffers:

1. \`curl -N\` your own endpoint directly. \`-N\` turns off curl's own buffering. Do tokens trickle in?
2. Then through your proxy or hosting platform. Still trickling?
3. Then the browser, with the Network tab's event-stream view.

The hop where trickling becomes one lump is your culprit.`,
    docs: [
      {
        label: 'FastAPI — streaming response',
        url: 'https://fastapi.tiangolo.com/advanced/custom-response/#streamingresponse',
      },
      {
        label: 'Anthropic — streaming messages',
        url: 'https://platform.claude.com/docs/en/build-with-claude/streaming',
      },
    ],
    glossary: [
      {
        term: 'hop',
        def: 'One step the stream passes through: provider, your API, a proxy, the browser.',
      },
      {
        term: 'event contract',
        def: 'The small set of event types your API promises the frontend.',
      },
      {
        term: 'curl -N',
        def: 'Tells curl not to buffer output, so you see a stream arrive as it does.',
      },
    ],
    check: [
      {
        q: 'What is the single rule for every hop in the pipeline?',
        a: `Pass each piece on as it arrives. One component that collects the whole response first turns streaming off for everything after it.`,
      },
      {
        q: 'Why translate provider events into your own event types?',
        a: `The frontend stays unchanged when you switch provider, and you avoid leaking provider details such as raw error bodies.`,
      },
      {
        q: 'How do you find which hop is buffering?',
        a: `Test each hop in turn — curl -N the endpoint directly, then through the proxy, then in the browser — and find where trickling becomes one lump.`,
      },
    ],
    practice: [
      {
        mode: 'spec',
        title: 'Wire a real model into your Stage 1 pipe',
        body: `Take the streaming endpoint you built in Stage 1 with a fake counter. Spec the change:
the source becomes a real model, the event types stay \`text\`, \`done\` and \`error\`, and
the \`done\` event now carries the stop reason and output token count.

Have AI make the change. Review: did the frontend need to change at all?`,
        answer: `The only server change is the source of the pieces — the fake counter loop becomes
\`async for text in stream.text_stream\` inside \`client.messages.stream(...)\`. The \`done\`
event grows two fields:

\`\`\`python
final = await stream.get_final_message()
yield f"data: {json.dumps({'type': 'done', 'stop': final.stop_reason, 'output_tokens': final.usage.output_tokens})}\\n\\n"
\`\`\`

**The frontend should need no change** beyond optionally displaying the new fields. If
the generated version changed the frontend's parser, it changed your event contract —
and that is what the review exists to catch.

Also check that the generated version still has the disconnect handling and the
\`X-Accel-Buffering: no\` header. Rewrites often drop both.`,
      },
      {
        mode: 'tool',
        title: 'Find the buffering hop',
        body: `Deploy the endpoint behind whatever you use in production — a platform proxy, nginx, a
CDN. Then test each hop with \`curl -N\` and note where tokens stop trickling.`,
        answer: `\`\`\`bash
curl -N -X POST localhost:8000/chat -H 'content-type: application/json' -d '{"messages":[...]}'
curl -N -X POST https://your-app.example.com/chat -H 'content-type: application/json' -d '{...}'
\`\`\`

If local trickles and deployed arrives in one lump, the culprit is between them. The
common causes:

- **Response compression** (gzip) at a proxy or CDN — it waits to fill a compression buffer
- **Proxy response buffering** — fixed by \`X-Accel-Buffering: no\` on nginx-based platforms
- **A serverless platform** that buffers function responses unless streaming is enabled for that route

Make sure the stream is not being gzip-compressed, and check your platform's docs for
its streaming setting.`,
      },
    ],
  },
  {
    id: 's2.2.t3',
    moduleId: 's2.2',
    title: 'Rendering streamed text in React without jank',
    outcome: 'You can render a fast stream of tokens smoothly — no stutter, no layout jumps, no broken markdown.',
    minutes: 35,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
    ],
    animations: [],
    analogy: `This is your home ground. Streaming text is a React performance problem with a twist:
state updates arrive dozens of times a second, and the content is markdown that is
*incomplete* for most of its life.`,
    notes: `## The naive version stutters

\`\`\`tsx
onText(t => setAnswer(prev => prev + t))   // one render per token
\`\`\`

Fifty tokens a second means fifty renders a second, each re-parsing the whole growing
markdown string. On a long answer the tab slows down while it streams.

---

## Batch into animation frames

Collect pieces in a ref, and update state at most once per frame:

\`\`\`tsx
const buffer = useRef('');
const frame = useRef<number | null>(null);

function onText(t: string) {
  buffer.current += t;
  if (frame.current === null) {
    frame.current = requestAnimationFrame(() => {
      frame.current = null;
      setAnswer(buffer.current);
    });
  }
}
\`\`\`

At most sixty renders a second, however fast tokens arrive — and usually far fewer.

---

## Markdown is broken most of the time

Mid-stream, the text often ends inside a code fence, a half-written table, or a
\`**bold\` with no closing marker. Rendering it as-is makes the layout flicker as the parser
changes its mind.

Practical fixes:

- **Close what's open before rendering** — if there is an odd number of code fences, append a closing one to the rendered copy (not to the stored text).
- **Render the completed part as markdown and the trailing line as plain text**, if flicker bothers you.
- **Memoise completed blocks**, so only the last block re-renders.

---

## Scroll that respects the reader

Auto-scroll to the bottom as text arrives — **unless the user has scrolled up**. Check
whether they were near the bottom before each update, and only then scroll. Nothing is more
annoying than being yanked down while reading paragraph two.

---

## States, not just text

A streamed answer has more states than "loading" and "done":

\`\`\`
sending → waiting for first token → streaming → done
                                 ↘ stopped by user
                                 ↘ error mid-stream
                                 ↘ refused
\`\`\`

Design each one. "Waiting for first token" deserves its own look — that gap is exactly
what the next topic measures.

---

## Accessibility

Put the streaming answer in a region with \`aria-live="polite"\`, and announce completion
rather than every token. A screen reader reading each token aloud is unusable.`,
    docs: [
      {
        label: 'MDN — requestAnimationFrame',
        url: 'https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame',
      },
      {
        label: 'MDN — ARIA live regions',
        url: 'https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Live_Regions',
      },
    ],
    glossary: [
      {
        term: 'requestAnimationFrame',
        def: 'A browser call that runs your code just before the next repaint — at most about 60 times a second.',
      },
      {
        term: 'aria-live',
        def: 'Marks a region whose changes screen readers should announce.',
      },
      {
        term: 'state machine',
        def: 'An explicit list of states and the moves between them, instead of loose booleans.',
      },
    ],
    check: [
      {
        q: 'Why does one setState per token cause stutter?',
        a: 'Each render re-parses the whole growing markdown string, dozens of times a second.',
      },
      {
        q: 'How do you cap renders during a stream?',
        a: 'Collect pieces in a ref and update state at most once per animation frame.',
      },
      {
        q: 'Why does streamed markdown flicker?',
        a: `Mid-stream it is incomplete — unclosed code fences, half tables — so the parser's output keeps changing shape.`,
      },
      {
        q: 'When should auto-scroll not scroll?',
        a: 'When the user has scrolled up to read. Only follow the stream if they were already near the bottom.',
      },
    ],
    practice: [
      {
        mode: 'spec',
        title: 'Spec a streaming message component',
        body: `Spec a \`StreamingMessage\` React component: it takes a stream of text pieces, renders
markdown, batches updates per frame, handles an unclosed code fence, respects the user's
scroll position, and shows the states from the slides.

Have AI build it. Then test it against a fake stream that sends 2,000 tokens quickly,
including a long code block.`,
        answer: `What a good implementation has, and what to check each one against:

- **Frame batching** — a ref buffer plus \`requestAnimationFrame\`. Check with React DevTools' profiler: renders should be far fewer than tokens.
- **Fence repair** — count the \`\`\` markers in the rendered copy; if odd, append one. Check that the *stored* text is never modified, or your saved message ends with a stray fence.
- **Scroll** — measure \`scrollHeight - scrollTop - clientHeight\` before the update; only scroll if it was under about 40px. Check by scrolling up mid-stream: you should stay put.
- **States** — an explicit state machine (\`idle | waiting | streaming | done | stopped | error | refused\`), not a pile of booleans. Check that "stopped" keeps the partial answer visible.

The usual generated weakness is the fence repair — it often appends to the stored text,
or doesn't handle a fence that opens on the very last line.`,
      },
      {
        mode: 'read',
        title: 'Find the bug',
        body: `\`\`\`tsx
useEffect(() => {
  bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
}, [answer]);
\`\`\`

Users complain that reading a long answer while it streams is impossible. Why? And what
does \`behavior: 'smooth'\` add to the problem?`,
        answer: `It scrolls to the bottom on **every** update, whether or not the user has scrolled up —
so anyone reading an earlier paragraph gets pulled away many times a second.

\`smooth\` makes it worse: each smooth scroll is an animation, and new updates start new
animations before the old ones finish, so the page judders.

Fix: only scroll when the user was already near the bottom, and use an instant scroll
while streaming.`,
      },
    ],
  },
  {
    id: 's2.2.t4',
    moduleId: 's2.2',
    title: 'Cancel means cancel: stopping upstream billing',
    outcome: 'When the user presses stop, the provider stops generating — and you can prove it in your logs.',
    minutes: 30,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
    ],
    animations: [],
    analogy: `Closing a browser tab in the middle of a large download: the server should notice and stop
sending. With a model the stakes are money — every token generated after the user left is
billed and thrown away.`,
    notes: `## Three things must all happen

1. **The browser** aborts its request — \`AbortController.abort()\`.
2. **Your server** notices the connection closed — Starlette cancels your generator.
3. **The provider call** is closed — so generation actually stops.

Most implementations get the first two and miss the third.

---

## Why the third one is automatic — if you use the context manager

\`\`\`python
async with client.messages.stream(...) as stream:
    async for text in stream.text_stream:
        yield text
\`\`\`

When your generator is cancelled, \`CancelledError\` is raised at the \`yield\`. It propagates
out of the \`async with\`, and leaving that block **closes the HTTP connection to the
provider**. The provider stops generating.

If you called the low-level \`create(stream=True)\` and kept the iterator somewhere without a
\`with\` block, nothing closes it promptly — and generation carries on unseen.

---

## What you still pay for

Cancelling stops *future* tokens. Tokens already generated are billed. So a stop button
saves the tail of long answers — which is exactly where the waste is when a user realises
after two lines that the answer is going the wrong way.

---

## Prove it

Log both sides:

\`\`\`python
try:
    async with client.messages.stream(...) as stream:
        async for text in stream.text_stream:
            sent += len(text)
            yield ...
except asyncio.CancelledError:
    log.info("stream_cancelled", chars_sent=sent, request_id=rid)
    raise
\`\`\`

Then compare: the output tokens billed for that request should be close to what was sent
before the cancel — not the full length of a complete answer.

---

## Always re-raise

Catch \`CancelledError\` to log, then **re-raise it**. Swallowing it tells the runtime the
task finished normally, and the framework's cleanup gets confused.`,
    docs: [
      {
        label: 'MDN — AbortController',
        url: 'https://developer.mozilla.org/en-US/docs/Web/API/AbortController',
      },
      {
        label: 'Anthropic — streaming messages',
        url: 'https://platform.claude.com/docs/en/build-with-claude/streaming',
      },
    ],
    glossary: [
      {
        term: 'AbortController',
        def: 'The browser API that cancels a fetch request.',
      },
      {
        term: 'CancelledError',
        def: 'Raised inside a task when it is cancelled. Log it, then re-raise it.',
      },
      {
        term: 'upstream',
        def: 'The service you call — here, the model provider.',
      },
    ],
    check: [
      {
        q: 'Name the three things that must happen for a stop to save money.',
        a: `The browser aborts, your server notices and cancels the generator, and the provider connection is closed so generation stops.`,
      },
      {
        q: 'Why does using the stream as a context manager matter?',
        a: `Cancellation propagates out of the async with block, and leaving it closes the provider connection, which stops generation.`,
      },
      {
        q: 'Which tokens are still billed after a cancel?',
        a: 'The ones already generated. Cancelling saves only the tokens that would have come after.',
      },
      {
        q: 'What must you do after catching CancelledError?',
        a: 'Re-raise it.',
      },
    ],
    practice: [
      {
        mode: 'tool',
        title: 'Prove cancellation stops billing',
        body: `Ask for a long answer — "write a 1,500-word essay" — and press stop after two seconds.
Compare your log of characters sent with the output tokens actually billed for that
request, from your usage logging or the provider console.`,
        answer: `What you should see: the billed output tokens are **close to what was generated before
the stop** — a few hundred tokens, not the 2,000 or so a complete essay needs. A few extra
tokens beyond what reached the browser is normal; they were in flight.

If the billed count matches a complete answer, the provider call was not closed. Check:

- Is the stream opened with \`async with\`? A bare iterator from \`create(stream=True)\` isn't closed for you.
- Is anything catching \`CancelledError\` and continuing?
- Is the generator actually being cancelled? A proxy that holds the connection open to your server means your server never learns the browser left.`,
      },
      {
        mode: 'break',
        title: 'Break it, then fix it',
        body: `Replace the \`async with\` with the low-level form and keep the iterator in a variable,
so nothing closes it when the request is cancelled. Repeat the cancellation test. Then
restore the context manager.`,
        answer: `With the context manager removed, cancelling the request stops *your* generator but
leaves the provider connection open until it is garbage-collected or times out.
Generation continues, and the billed output tokens climb towards a full answer.

This is the silent money leak: the UI looks right — the text stopped — and only the
invoice shows the difference.

The fix is the context manager, or an explicit \`await stream.close()\` in a \`finally\` if
you must use the low-level form.`,
      },
    ],
  },
  {
    id: 's2.2.t5',
    moduleId: 's2.2',
    title: 'Measuring and showing time to first token',
    outcome: `You can measure time to first token at each layer, show the user something useful while they wait, and know which part of the delay you can actually reduce.`,
    minutes: 30,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
    ],
    animations: ['anim-streaming-ttft'],
    analogy: `You already know Largest Contentful Paint from web performance — the moment the user sees
something real. Time to first token is the LCP of an AI feature.`,
    notes: `## Two numbers, not one

- **TTFT** — time to first token: request sent → first text appears
- **Total time** — request sent → last token

Users feel TTFT. A 9-second answer that starts at 0.4 seconds feels quick. A 3-second answer
that appears all at once after 3 seconds feels slow.

---

## Measure at every layer

\`\`\`
browser:   click → first token rendered          (what the user feels)
your API:  request in → first token sent out     (your overhead + provider)
provider:  your request → first token received   (the model's part)
\`\`\`

Log all three with the same request id. The gaps between them tell you where time goes:
slow retrieval before the call, a cold start, a proxy, or the model itself.

---

## What makes TTFT long

- **Input size** — the model reads everything before writing. A 100K-token prompt has a longer first-token delay than a 2K one.
- **Thinking** — reasoning happens before the answer. Higher effort means a longer wait for the first visible word.
- **Your own work before the call** — retrieval, database lookups, prompt assembly.
- **Queueing** — retries after a 429 add their whole wait to TTFT.

---

## What you can actually do

- **Cache the fixed prefix** (next module) — cached input is processed faster as well as more cheaply.
- **Send less** — retrieve the relevant parts instead of everything.
- **Start work in parallel** — kick off retrieval while you validate the request.
- **Pick effort per feature** — low effort for quick replies.
- **Show progress honestly** — "searching your documents…", then "writing…". A state that changes feels faster than a spinner that doesn't.

---

## Report percentiles, not averages

A mean TTFT of 600ms can hide that one request in twenty waits 6 seconds. Log every
request and look at p50 and p95. The p95 is the experience your most patient users are
forming an opinion from.`,
    docs: [
      {
        label: 'MDN — performance.now()',
        url: 'https://developer.mozilla.org/en-US/docs/Web/API/Performance/now',
      },
      {
        label: 'Anthropic — reducing latency',
        url: 'https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-latency',
      },
    ],
    glossary: [
      {
        term: 'TTFT',
        def: 'Time to first token: from sending the request to the first piece of the answer.',
      },
      {
        term: 'p95',
        def: 'The value 95% of requests are faster than. Shows the slow tail an average hides.',
      },
      {
        term: 'cold start',
        def: 'Extra delay when a stopped server instance must start before handling a request.',
      },
    ],
    check: [
      {
        q: 'Why do users care more about TTFT than total time?',
        a: `They start reading as soon as text appears. An answer that starts fast feels fast, even if it finishes later.`,
      },
      {
        q: 'Why measure at three layers?',
        a: 'The gaps between browser, API and provider timings show where the delay comes from.',
      },
      {
        q: 'Name three causes of a long TTFT.',
        a: `A large input, thinking before answering, and your own work before the call — also queueing after rate limits.`,
      },
      {
        q: 'Why report p95 rather than the average?',
        a: 'An average hides the slow tail that a meaningful share of users actually experiences.',
      },
    ],
    practice: [
      {
        mode: 'tool',
        title: 'Measure TTFT at all three layers',
        body: `Add timing to your chat endpoint: log provider TTFT (call start → first text piece) and
API TTFT (request received → first event sent). In the browser, measure click → first
rendered token with \`performance.now()\`. Send 30 requests and compute p50 and p95 of each.`,
        answer: `Server side:

\`\`\`python
t0 = time.perf_counter()
first = None
async with client.messages.stream(...) as stream:
    async for text in stream.text_stream:
        if first is None:
            first = time.perf_counter()
            log.info("ttft", provider_ms=round((first - t0) * 1000), request_id=rid)
        yield ...
\`\`\`

Browser side: \`const t0 = performance.now()\` on click; on the first text event,
\`performance.now() - t0\`.

Typical shape: browser TTFT is provider TTFT plus a small, steady overhead from your API.
**If the overhead is large, the cause is in your code** — retrieval, a slow database query,
a cold container — not in the model. That is the most common surprise, and the most
fixable.`,
      },
      {
        mode: 'decision',
        title: 'Where would you spend a day?',
        body: `Your p95 browser TTFT is 4.2 seconds. The breakdown at p95: retrieval 1.9s, prompt
assembly 0.1s, provider TTFT 1.8s, network and rendering 0.4s. You have one day. What do
you work on, and why?`,
        answer: `**Retrieval first.** It is the largest single part, it is your own code, and fixes are
within reach in a day: an index for the filter you use, fetching fewer candidates,
caching repeated queries, or starting retrieval in parallel with other setup.

Provider TTFT is almost as large, but your levers there — a smaller prompt, prompt
caching, lower effort — are worth doing next and mostly need measurement before changing.

Leave network and rendering; 0.4 seconds at p95 is reasonable.

The habit: **measure, then fix the biggest part you control.**`,
      },
    ],
  },
];
