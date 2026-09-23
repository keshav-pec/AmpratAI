import type { Topic } from '@/lib/types';

const deck = { kind: 'deck' as const, label: 'Slides', reason: 'written for you, always current' };
const find = (label: string, query: string, channel: string, reason: string) =>
  ({ kind: 'find' as const, label, query, channel, reason });

export const s1_3: Topic[] = [
  {
    id: 's1.3.t1',
    moduleId: 's1.3',
    title: 'asyncio, and how it differs from the Node event loop',
    outcome: 'You can explain what await does, and spot the blocking call that freezes your whole server.',
    minutes: 40,
    sources: [
      deck,
      find('Visual', 'python asyncio tutorial event loop', 'ArjanCodes', 'clear diagrams, production framing'),
      find('Deeper', 'python asyncio internals coroutines', 'mCoding', 'what is actually happening underneath'),
    ],
    animations: ['anim-event-loop'],
    analogy: `You already know this model. One thread, an event loop, callbacks that run when
IO finishes. Python's version has the same shape. There is exactly one difference that will
cost you time, and it is the reason this topic is forty minutes rather than ten.`,
    notes: `## The same idea you already use

    async def get_user(id: str) -> dict:
        async with httpx.AsyncClient() as c:
            r = await c.get(f"/users/{id}")
            return r.json()

If you read that as JavaScript, you read it correctly. \`async def\` is \`async function\`.
\`await\` is \`await\`. One thread, cooperative multitasking, IO does not block.

---

## The one real difference

In Node, almost everything in the standard library is already non-blocking. You have to try
quite hard to freeze the loop.

In Python, **most libraries have both a blocking version and an async version, and the
blocking one is usually the famous one.**

    import requests          # blocking — the one every tutorial uses
    import httpx             # has an async version

    time.sleep(2)            # blocking — freezes everything
    await asyncio.sleep(2)   # yields — lets other work run

    psycopg2                 # blocking
    asyncpg                  # async

So this is a real bug you will write:

    @app.get("/slow")
    async def slow():
        r = requests.get("https://api.example.com")   # blocking, inside async
        return r.json()

It works. It passes your test. Then under load your whole server stalls, because every one
of those calls holds the single thread for the full round trip, and no other request can be
served meanwhile.

**The rule: inside \`async def\`, every IO call must be awaited.** If you cannot await it,
it is the wrong library.

---

## Nothing runs until you await it

    async def work():
        print("working")

    work()            # nothing happens — you made a coroutine object
    await work()      # now it runs

In JS, calling an async function starts it immediately and gives you a promise. In Python,
calling it gives you a coroutine that has not started. This catches people: you call three
functions expecting them to be in flight, and they have not begun.

To start something without waiting for it right now:

    task = asyncio.create_task(work())     # now it is running
    ...
    await task                             # collect the result later

That is the closest thing to "fire it off and keep the promise".

---

## Sequential by accident

    # 3 seconds — one after another
    a = await fetch(url_a)
    b = await fetch(url_b)
    c = await fetch(url_c)

    # 1 second — all at once
    a, b, c = await asyncio.gather(fetch(url_a), fetch(url_b), fetch(url_c))

This is the single biggest performance mistake in AI code. Embedding 500 chunks one await at
a time takes minutes. The same work with \`gather\` and a concurrency limit takes seconds.
You will write that exact loop in Stage 3.

---

## How to spot a blocking call

Ask three questions about any line inside an \`async def\`:

1. Does it touch the network, the disk, or a database?
2. Is it awaited?
3. If not — is there an async version of that library?

If the answer to 1 is yes and 2 is no, you have found the bug. The fix is almost always
swapping the library: \`requests\` to \`httpx\`, \`psycopg2\` to \`asyncpg\`, \`time.sleep\`
to \`asyncio.sleep\`.

For a blocking thing you genuinely cannot replace — a CPU-heavy library, say — push it off
the loop:

    result = await asyncio.to_thread(slow_blocking_function, arg)`,
    docs: [
      { label: 'Python docs — asyncio', url: 'https://docs.python.org/3/library/asyncio.html' },
      { label: 'Python docs — developing with asyncio (read this one)', url: 'https://docs.python.org/3/library/asyncio-dev.html' },
    ],
    glossary: [
      { term: 'coroutine', def: 'What calling an async function gives you. It has not started running yet.' },
      { term: 'event loop', def: 'The single-threaded scheduler that runs coroutines and resumes them when their IO finishes.' },
      { term: 'blocking call', def: 'Code that holds the thread while it waits, so nothing else can run.' },
      { term: 'create_task', def: 'Starts a coroutine running now, and gives you a handle to await later.' },
      { term: 'gather', def: 'Runs several coroutines at the same time and waits for all of them.' },
      { term: 'to_thread', def: 'Runs a blocking function on a separate thread so the event loop stays free.' },
    ],
    check: [
      { q: 'What happens when you call an async function without awaiting it?', a: 'You get a coroutine object and nothing runs. Different from JS, where the function body starts immediately.' },
      { q: 'Why is `requests.get` inside an async function a bug?', a: 'It is blocking. It holds the only thread for the whole round trip, so no other request can be served.' },
      { q: 'What is the difference between three awaits in a row and gather?', a: 'Three awaits run one after another. gather runs them at the same time. For network work that is the difference between 3 seconds and 1.' },
      { q: 'How do you run a blocking library you cannot replace?', a: 'asyncio.to_thread, which moves it off the event loop.' },
      { q: 'What three questions find a blocking call?', a: 'Does it do IO? Is it awaited? Is there an async version of the library?' },
    ],
    practice: [
      {
        mode: 'read',
        title: 'Find the freeze',
        body: `Three endpoints. One of them stalls the server under load. Which, and why?

    @app.get("/a")
    async def a():
        return await db.fetch("select 1")

    @app.get("/b")
    async def b():
        return requests.get("https://example.com").json()

    @app.get("/c")
    def c():
        return requests.get("https://example.com").json()

The third one is the interesting case — note that it is \`def\`, not \`async def\`. Work out
what FastAPI does with a plain \`def\` handler before you answer.`,
        answer: `- **\`/a\` is fine.** It awaits an async database call.
- **\`/b\` freezes the server.** It is an \`async def\` handler making a blocking \`requests.get\`, so it holds the only event-loop thread for the whole round trip. Under load, every other request waits behind it.
- **\`/c\` is acceptable, but limited.** It is a plain \`def\`, and FastAPI runs plain handlers in a thread pool, so the event loop is not blocked. The catch is capacity: the pool is a fixed size (about 40 threads by default), so under heavy load requests queue up waiting for a free thread.

So the ranking is **\`/a\` best, \`/c\` tolerable, \`/b\` broken.** The subtle part: \`/b\` *looks* more modern than \`/c\`, and it is worse.`,
      },
      {
        mode: 'primitive',
        title: 'Prove it to yourself',
        body: `Write two endpoints: one that does \`await asyncio.sleep(3)\`, one that does
\`time.sleep(3)\`. Start the server. Hit each one from two terminals at the same time and
time the responses.

The async one serves both in about 3 seconds. The blocking one takes 6. Watching that
happen once is worth more than reading about it five times.`,
        answer: `\`\`\`python
import asyncio, time
from fastapi import FastAPI

app = FastAPI()

@app.get("/async")
async def a():
    await asyncio.sleep(3)
    return {"ok": True}

@app.get("/blocking")
async def b():
    time.sleep(3)
    return {"ok": True}
\`\`\`

\`\`\`bash
time (curl -s localhost:8000/async & curl -s localhost:8000/async & wait)        # ~3s
time (curl -s localhost:8000/blocking & curl -s localhost:8000/blocking & wait)  # ~6s
\`\`\`

Two conditions for the demonstration to work:

- \`/blocking\` must be \`async def\`. A plain \`def\` runs in the thread pool and hides the problem.
- Run a single uvicorn worker, which is the default.`,
      },
      {
        mode: 'spec',
        title: 'Spec a concurrent fetcher, then review',
        body: `Spec it first: fetch a list of URLs concurrently, return results in the same order
as the input, and do not let one failure lose the others.

Have AI write it. Then check the two things it usually gets wrong:
- Does the output order match the input order, or the completion order?
- Does one exception cancel everything, or are failures returned alongside successes?

Look up what \`return_exceptions=True\` does in \`gather\` and decide whether you want it.`,
        answer: `\`\`\`python
import asyncio, httpx

async def fetch_all(urls: list[str], limit: int = 10) -> list[str | BaseException]:
    sem = asyncio.Semaphore(limit)
    async with httpx.AsyncClient(timeout=10) as client:
        async def one(url: str) -> str:
            async with sem:
                r = await client.get(url)
                r.raise_for_status()
                return r.text
        return await asyncio.gather(*(one(u) for u in urls), return_exceptions=True)
\`\`\`

Your two checks:

- **Order.** \`gather\` returns results in *input* order, whatever order they finish in. AI versions that use \`as_completed\` give completion order and silently scramble which result belongs to which URL.
- **Failures.** Without \`return_exceptions=True\`, the first failure raises and you lose every other result — while the other requests keep running unsupervised. With it, a failure sits in its slot as an exception object.

Also check that it has a timeout, a concurrency limit, and **one** shared client rather than one per URL.`,
      },
      {
        mode: 'break',
        title: 'Break it',
        body: `Take a working async endpoint and drop a \`time.sleep(5)\` in the middle. Load it
with ten concurrent requests and watch the total time. Then swap it for
\`await asyncio.sleep(5)\` and measure again.`,
        answer: `With \`time.sleep(5)\` and ten concurrent requests, total time is roughly **50 seconds**. The requests are served one after another, because each one holds the event loop for five seconds.

Swap in \`await asyncio.sleep(5)\` and all ten finish in about **5 seconds**. Each request parks while it waits, and the loop moves on to the next.

That ten-to-one gap is what happens to your API the moment one blocking call slips into an async handler.`,
      },
    ],
  },

  {
    id: 's1.3.t2',
    moduleId: 's1.3',
    title: 'gather, TaskGroup and cancellation',
    outcome: 'You can run many things at once and handle the case where one of them fails.',
    minutes: 35,
    sources: [
      deck,
      find('Deeper', 'python asyncio taskgroup structured concurrency', 'mCoding', 'why TaskGroup replaced the old patterns'),
    ],
    animations: [],
    analogy: `\`gather\` is \`Promise.all\`. \`gather(..., return_exceptions=True)\` is
\`Promise.allSettled\`. \`TaskGroup\` has no JS equivalent yet — it is the version that
cleans up properly when something fails.`,
    notes: `## gather: run them all

    results = await asyncio.gather(
        embed(batch_1),
        embed(batch_2),
        embed(batch_3),
    )

Results come back **in the order you passed them in**, not the order they finished. That is
worth knowing — it means you can zip them back against your inputs safely.

---

## What happens when one fails

By default, the first exception propagates immediately:

    await asyncio.gather(a(), b(), c())    # b raises -> you get b's exception

But here is the part that surprises people: **the other tasks keep running**. They are not
cancelled. You have lost your handle on them, and they carry on in the background, possibly
spending money on model calls whose results nobody will read.

The gentler form:

    results = await asyncio.gather(a(), b(), c(), return_exceptions=True)
    # -> [result_a, SomeError(...), result_c]

Now failures arrive as values in the list. You decide what to do with each. For a batch of
500 embedding calls, this is almost always what you want — one bad document should not lose
the other 499.

---

## TaskGroup: the version that cleans up

    async with asyncio.TaskGroup() as tg:
        t1 = tg.create_task(a())
        t2 = tg.create_task(b())
        t3 = tg.create_task(c())

    # all finished here; t1.result() etc. are available

If any task raises, the TaskGroup **cancels the others** and then raises. No orphaned tasks,
no calls still running in the background.

That is the difference, and it matters when the tasks cost money. Use \`TaskGroup\` when a
failure means the whole batch is pointless. Use \`gather(return_exceptions=True)\` when each
item stands alone.

---

## Timeouts

    async with asyncio.timeout(10):
        result = await slow_thing()

After ten seconds the inner operation is cancelled and you get a \`TimeoutError\`. Wrap
every external call in one. A model API that hangs without a timeout will hold a request
open until something else times out first — usually your load balancer, usually at 60
seconds, usually while the user has already left.

---

## Cancellation is an exception

When a task is cancelled, \`CancelledError\` is raised inside it. Your cleanup still runs:

    try:
        await call_model(prompt)
    except asyncio.CancelledError:
        log.info("user cancelled, stopping upstream call")
        raise                      # always re-raise it

**Never swallow \`CancelledError\`.** Catch it to clean up, then re-raise. Swallowing it
leaves the runtime thinking a task is alive when it is not.

This becomes concrete in Stage 2. A user clicks "stop" on a streaming answer, the request is
cancelled, and your job is to make sure that cancellation actually reaches the provider —
otherwise you keep paying for tokens nobody will ever see.`,
    docs: [
      { label: 'asyncio — task groups', url: 'https://docs.python.org/3/library/asyncio-task.html#task-groups' },
      { label: 'asyncio — timeouts', url: 'https://docs.python.org/3/library/asyncio-task.html#timeouts' },
    ],
    glossary: [
      { term: 'gather', def: 'Runs coroutines concurrently and returns their results in input order.' },
      { term: 'return_exceptions', def: 'Makes gather return failures as values instead of raising.' },
      { term: 'TaskGroup', def: 'Runs tasks concurrently and cancels the rest if one fails.' },
      { term: 'CancelledError', def: 'Raised inside a task when it is cancelled. Catch to clean up, then re-raise.' },
      { term: 'asyncio.timeout', def: 'Cancels whatever is inside the block after a set number of seconds.' },
    ],
    check: [
      { q: 'What order do gather results come back in?', a: 'The order you passed them in, not the order they completed.' },
      { q: 'When one task in a plain gather fails, what happens to the others?', a: 'They keep running, unsupervised. You have lost your handle on them but they are still spending time and money.' },
      { q: 'When would you choose TaskGroup over gather?', a: 'When a single failure makes the whole batch pointless, so you want the rest cancelled.' },
      { q: 'Why must you re-raise CancelledError?', a: 'Swallowing it leaves the runtime believing the task is still alive. Catch it to clean up, then re-raise.' },
      { q: 'What happens without a timeout on a model call?', a: 'A hung request stays open until something further out times out — often 60 seconds later, long after the user gave up.' },
    ],
    practice: [
      {
        mode: 'read',
        title: 'Predict the behaviour',
        body: `For each, say what the caller sees and what happens to the tasks that did not fail:

    await asyncio.gather(ok(), boom(), ok())
    await asyncio.gather(ok(), boom(), ok(), return_exceptions=True)

    async with asyncio.TaskGroup() as tg:
        tg.create_task(ok()); tg.create_task(boom()); tg.create_task(ok())

The middle one is the one people get wrong. What type are the items in the returned list?`,
        answer: `1. **\`gather(ok(), boom(), ok())\`** — the caller gets \`boom\`'s exception raised at the \`await\`. The two \`ok()\` tasks are **not cancelled**: they carry on running in the background and their results are thrown away.
2. **With \`return_exceptions=True\`** — nothing is raised. You get back a list like \`[result, BoomError(...), result]\`, and the middle item is an **exception object**, returned rather than raised. Check each item with \`isinstance(r, BaseException)\`.
3. **\`TaskGroup\`** — when \`boom\` fails, the group cancels the other tasks and then raises an **\`ExceptionGroup\`** that wraps the error.

That last detail matters. A plain \`except BoomError\` will *not* catch it. You need \`except* BoomError\`, or you catch the \`ExceptionGroup\` and look inside.`,
      },
      {
        mode: 'spec',
        title: 'Batch embedding with partial failure',
        body: `Spec: embed 500 chunks concurrently. One chunk is malformed and will always fail.
The other 499 must still be embedded and stored. The failure must be recorded with enough
detail to retry it later.

Have AI implement it. Then check: is the failed chunk distinguishable from a chunk that
embedded to an empty vector? Could you retry just that one without redoing the other 499?`,
        answer: `\`\`\`python
from dataclasses import dataclass

@dataclass
class EmbedFailure:
    chunk_id: str
    error: str

async def embed_all(chunks, limit=10):
    sem = asyncio.Semaphore(limit)
    async def one(c):
        async with sem:
            vec = await embed(c.text)
            if len(vec) != DIMENSIONS:
                raise ValueError(f"got {len(vec)} dimensions, expected {DIMENSIONS}")
            return vec

    results = await asyncio.gather(*(one(c) for c in chunks), return_exceptions=True)
    stored, failed = [], []
    for c, r in zip(chunks, results):
        if isinstance(r, BaseException):
            failed.append(EmbedFailure(c.id, repr(r)))
        else:
            stored.append((c.id, r))
    await save_vectors(stored)
    await save_failures(failed)      # retry these ids later, alone
\`\`\`

Your checks:

- **Distinguishable from an empty vector.** A failure is an exception object that gets recorded with its chunk id. The length check turns an empty or wrong-sized vector into a failure too, instead of storing garbage.
- **Retrying only the failure.** The failures table holds ids, so a retry job re-embeds just those.

Note \`BaseException\`, not \`Exception\`: \`CancelledError\` is a \`BaseException\`, and it can appear in the results too.`,
      },
      {
        mode: 'decision',
        title: 'Which primitive?',
        body: `For each, choose gather, gather with return_exceptions, or TaskGroup, and defend it
in one line:

1. Fan out one question to three models and show whichever answers best
2. Embed 10,000 documents overnight
3. Call three tools an agent asked for, where the agent cannot proceed without all three
4. Warm three caches at startup`,
        answer: `1. **Fan out to three models and show the best** → \`gather(..., return_exceptions=True)\`. One model failing should not throw away the other two answers.
2. **Embed 10,000 documents overnight** → \`gather(..., return_exceptions=True)\` behind a semaphore. Every item is independent, so record failures and retry them later.
3. **An agent needs all three tool results** → \`TaskGroup\`. One failure makes the step pointless, so cancel the rest and stop spending.
4. **Warm three caches at startup** → it depends. Use \`TaskGroup\` if the app cannot serve without them, so it fails fast. Use \`gather(return_exceptions=True)\` if they are best-effort.

The question behind every choice: **is partial success useful?** If yes, gather with exceptions returned. If no, TaskGroup.`,
      },
    ],
  },

  {
    id: 's1.3.t3',
    moduleId: 's1.3',
    title: 'Bounded concurrency with Semaphore',
    outcome: 'You can run many calls at once without getting rate-limited, and you understand why the highest setting is not the fastest.',
    minutes: 30,
    sources: [deck],
    animations: ['anim-semaphore'],
    analogy: `You have probably throttled a queue in Node with p-limit or a hand-rolled
counter. Same thing. The interesting part is not the mechanism, it is the number you choose
— and why bigger is not better.`,
    notes: `## The naive version breaks

    await asyncio.gather(*[embed(c) for c in chunks])      # 5000 chunks

Five thousand simultaneous requests. Your provider returns 429. Your retries add more
requests. Your laptop runs out of sockets. The job fails after spending real money.

---

## The fix is six lines

    sem = asyncio.Semaphore(10)

    async def embed_one(chunk):
        async with sem:                 # wait here if 10 are already in flight
            return await embed(chunk)

    results = await asyncio.gather(*[embed_one(c) for c in chunks])

All 5000 tasks are created, but only 10 are ever running. The rest wait their turn at the
semaphore. Memory stays flat, the provider stays happy.

---

## Why the highest number is not the fastest

Push the slider in the animation past the server's capacity and watch what happens.

Above the limit the server accepts, every extra request becomes a 429. Every 429 becomes a
retry. Every retry is another request. You end up doing **more total work** and finishing
**later** than if you had simply stayed under the limit.

The fastest setting is the highest one that does not get rejected. Finding it is a
measurement, not a guess — start at 5, watch your error rate, move up until 429s appear,
then come back down.

---

## The numbers that constrain you

Model providers rate-limit on two axes at once:

- **requests per minute** — how many calls
- **tokens per minute** — how much text, which is usually the one you hit first

A batch of long documents can be well under the request limit and far over the token limit.
So your concurrency limit is not one fixed number — it depends on how big each call is. In
Stage 2 you will meet this properly; for now, know that the two limits exist and that the
token one is the one that surprises people.

---

## Where you will use this

Every single batch operation from Stage 3 onward:

- embedding a corpus
- re-ranking candidates
- running an eval suite over 100 questions
- an agent making several tool calls at once

One \`Semaphore\` created at module level, shared by everything that calls one provider. Not
one per function — one per provider, because the rate limit is per provider.`,
    docs: [
      { label: 'asyncio — Semaphore', url: 'https://docs.python.org/3/library/asyncio-sync.html#semaphore' },
    ],
    glossary: [
      { term: 'Semaphore', def: 'A counter that lets only N things run at once; the rest wait.' },
      { term: '429', def: 'The HTTP status for "too many requests". You are being rate-limited.' },
      { term: 'requests per minute', def: 'A cap on how many calls you may make.' },
      { term: 'tokens per minute', def: 'A cap on how much text you may send and receive. Usually the one you hit first.' },
    ],
    check: [
      { q: 'Why is unlimited concurrency slower than limited concurrency?', a: 'Above the server\'s capacity everything extra is rejected, each rejection becomes a retry, and you do more total work for a later finish.' },
      { q: 'How many tasks exist when you gather 5000 chunks behind a Semaphore(10)?', a: 'All 5000 exist, but only 10 are running. The rest are waiting at the semaphore.' },
      { q: 'Which rate limit usually bites first, requests or tokens?', a: 'Tokens. Long documents can be far under the request limit and far over the token limit.' },
      { q: 'Where should the Semaphore live?', a: 'One per provider, shared by everything that calls it — because the limit is per provider, not per function.' },
    ],
    practice: [
      {
        mode: 'primitive',
        title: 'Write the bounded map by hand',
        body: `No AI. Write \`bounded_map(fn, items, limit)\` that runs \`fn\` over every item with
at most \`limit\` running at once, returns results in input order, and returns failures as
values rather than losing the batch.

This is one of the ten primitives, and you will genuinely reuse it in Stage 3.`,
        answer: `\`\`\`python
import asyncio

async def bounded_map(fn, items, limit):
    sem = asyncio.Semaphore(limit)
    async def run(item):
        async with sem:
            return await fn(item)
    return await asyncio.gather(*(run(i) for i in items), return_exceptions=True)
\`\`\`

- **Input order is preserved**, because \`gather\` returns results in the order it was given.
- **Failures come back as values**, in their slots.
- **At most \`limit\` calls run** at any moment.

One limit worth knowing: this creates a coroutine for every item up front. That is fine for thousands. For millions, use a fixed pool of workers pulling from an \`asyncio.Queue\`, so memory stays flat.`,
      },
      {
        mode: 'tool',
        title: 'Find your real limit',
        body: `Against any public API with a rate limit (a free tier is ideal), run 200 requests at
concurrency 2, then 5, 10, 20, 50. Record total time and error count at each.

Plot it or just read the numbers. Find the point where it stops getting faster and starts
getting worse. That shape is the lesson, and it is the same shape for every provider you
will use.`,
        answer: `The shape you should see:

- **Total time falls** as concurrency rises…
- **…until you hit the rate limit.** Then 429s appear, and time flattens or *rises* as retries pile up.

Pick the highest setting with close to zero errors, then back off about 20% for headroom. Your limit is shared with anything else using the same key, and it changes when you move to a different tier.

The usual snags:

- **Limits are often per model**, so a number you measured on one model does not carry over.
- **A tokens-per-minute limit** can bite long before the requests limit, if your requests are large.
- **A free tier's limit** can be so low that concurrency 2 is already too much. That is real data, not a broken test.`,
      },
      {
        mode: 'decision',
        title: 'One semaphore or several?',
        body: `Your app calls Anthropic for generation, Voyage for embeddings, and your own
database. Some requests use all three.

How many semaphores, what limits, and where do they live? Defend it in four sentences. Then
say what changes when you add a second tenant whose traffic must not starve the first.`,
        answer: `One semaphore **per external dependency, each with its own limit**:

- One for Anthropic — and if you use several models, often one per model, because providers usually rate-limit per model.
- One for Voyage, for embeddings.
- **None for the database.** The connection pool is already a semaphore; adding another just double-limits it.

They live at app level (module scope or \`app.state\`), shared by every request. A semaphore created inside a request limits nothing.

With a second tenant, a single shared semaphore lets tenant A's overnight batch job starve tenant B's live chat. Two fixes, usually both:

- **Per-tenant limits** inside the global provider limit.
- **Separate lanes**: interactive traffic gets reserved capacity, and batch work gets whatever is left.`,
      },
    ],
  },

  {
    id: 's1.3.t4',
    moduleId: 's1.3',
    title: 'httpx: timeouts, pooling, and retries with jitter',
    outcome: 'Your HTTP calls fail in ways you chose, instead of ways you discover in production.',
    minutes: 35,
    sources: [deck],
    animations: ['anim-backoff'],
    analogy: `Axios with interceptors, except you are going to write the retry logic yourself
once so that you understand what every SDK is doing for you afterwards.`,
    notes: `## Use one client, not one per request

    # wrong — new connection pool every call
    async def get(url):
        async with httpx.AsyncClient() as c:
            return await c.get(url)

    # right — one pool, reused
    client = httpx.AsyncClient(timeout=10.0)

Creating a client per request throws away connection pooling and TLS session reuse. At low
volume you will not notice. At 50 requests a second you will.

In FastAPI, create the client on startup and close it on shutdown, using the lifespan hook
you will meet in the FastAPI module.

---

## Timeouts are four numbers, not one

    timeout = httpx.Timeout(connect=3.0, read=30.0, write=10.0, pool=5.0)

- **connect** — how long to wait for the connection to open
- **read** — how long to wait for data once connected
- **write** — how long to send the request
- **pool** — how long to wait for a free connection from the pool

For model calls, \`read\` is the one that matters and it needs to be generous — a long
generation genuinely takes 60 seconds. But a **streaming** call is different: you want a
short timeout on the gap between tokens, not on the whole response.

Never leave the timeout at the default. \`httpx\` defaults to 5 seconds, which will cut off
legitimate model responses; and if you set \`timeout=None\` to fix that, a hung connection
now waits forever.

---

## Which errors are worth retrying

    retry:        429, 500, 502, 503, 504, connect errors, read timeouts
    do not retry: 400, 401, 403, 404, 422, content filtered

Retrying a 400 just sends the same broken request again. Retrying a 401 will not find a new
API key. Only retry things that might be different next time.

---

## Backoff, and why jitter matters

    delay = base * (2 ** attempt)        # 1s, 2s, 4s, 8s

Sensible. But if 500 clients all hit the same failure at the same moment, all 500 wait
exactly one second and all 500 return at exactly the same instant — and kill the server that
was just about to recover.

    delay = base * (2 ** attempt) * random.uniform(0.5, 1.5)

That is jitter. Same retry count, arrivals spread across a window. Step through the
animation and watch the arrival spike flatten.

**Every retry you ever write gets jitter.** There is no situation where you want 500 clients
synchronised.

---

## Respect Retry-After

When a server sends \`Retry-After: 30\`, it is telling you exactly when to come back. Use it
instead of your own formula. Ignoring it is how you get rate-limited harder.

---

## A note on SDKs

The Anthropic and OpenAI SDKs have retries built in. You still need to understand this,
because you will tune their settings, because you will call things that are not those SDKs,
and because when your bill spikes from a retry storm you need to recognise the shape.`,
    docs: [
      { label: 'httpx — async client', url: 'https://www.python-httpx.org/async/' },
      { label: 'httpx — timeouts', url: 'https://www.python-httpx.org/advanced/timeouts/' },
    ],
    glossary: [
      { term: 'connection pool', def: 'Reused open connections, so you do not pay for a new handshake every call.' },
      { term: 'exponential backoff', def: 'Waiting twice as long after each failed attempt.' },
      { term: 'jitter', def: 'A random factor on the wait, so retrying clients do not all return at the same instant.' },
      { term: 'Retry-After', def: 'A response header telling you exactly how long to wait. Obey it.' },
      { term: 'thundering herd', def: 'Many clients retrying in sync and re-overloading a recovering server.' },
    ],
    check: [
      { q: 'Why one client instead of one per request?', a: 'Connection pooling and TLS reuse. A new client per call throws both away.' },
      { q: 'Which timeout matters most for a model call, and what is different when streaming?', a: 'The read timeout. When streaming, you want a timeout on the gap between tokens rather than on the whole response.' },
      { q: 'Name three status codes you should never retry.', a: '400, 401, 404 — anything where the same request will fail the same way.' },
      { q: 'What does jitter prevent?', a: 'A thundering herd: every client returning at the same instant and re-killing the server.' },
      { q: 'What should you do when you see Retry-After?', a: 'Use it instead of your own backoff formula.' },
    ],
    practice: [
      {
        mode: 'primitive',
        title: 'Write the retry wrapper by hand',
        body: `One of the ten primitives. Write an async \`with_retry(fn, attempts=4)\` that:
- retries only on 429, 5xx, connect errors and read timeouts
- waits \`base * 2**attempt\` with a random factor between 0.5 and 1.5
- honours \`Retry-After\` when present
- raises the last error if every attempt fails
- logs each retry with the attempt number and the delay

You will reuse this in every stage from here on.`,
        answer: `\`\`\`python
import asyncio, random, httpx

RETRY_STATUS = {429, 500, 502, 503, 504}

async def with_retry(send, attempts=4, base=0.5, sleep=asyncio.sleep):
    for attempt in range(attempts):
        try:
            response = await send()
            response.raise_for_status()
            return response
        except httpx.HTTPStatusError as e:
            last = attempt == attempts - 1
            if e.response.status_code not in RETRY_STATUS or last:
                raise
            retry_after = e.response.headers.get("retry-after", "")
            delay = float(retry_after) if retry_after.isdigit() \\
                else base * 2**attempt * random.uniform(0.5, 1.5)
        except (httpx.ConnectError, httpx.ReadTimeout):
            if attempt == attempts - 1:
                raise
            delay = base * 2**attempt * random.uniform(0.5, 1.5)
        log.warning("retrying", attempt=attempt + 1, delay=round(delay, 2))
        await sleep(delay)
\`\`\`

Three design points:

- **\`send\` is a function that makes the request**, not a request object. Each attempt needs a fresh request.
- **\`sleep\` is a parameter**, so tests can pass a fake that records delays instead of actually waiting.
- **\`Retry-After\` can also be a date.** This version falls back to the backoff formula in that case. It is also worth putting a ceiling on any single wait.`,
      },
      {
        mode: 'read',
        title: 'What is wrong with each',
        body: `    # 1
    for i in range(5):
        try: return await call()
        except Exception: await asyncio.sleep(1)

    # 2
    client = httpx.AsyncClient(timeout=None)

    # 3
    except httpx.HTTPStatusError: return await call()

Snippet 1 has three problems, not one. Find all three.`,
        answer: `**Snippet 1** has three problems:

- It retries **every** exception — including 400s, 401s, and your own \`TypeError\` bugs.
- The wait is a **fixed** one second: no backoff, no jitter, so a herd of clients stays synchronised.
- After the fifth failure it drops out of the loop and **returns \`None\`** silently. The error vanishes.

**Snippet 2:** \`timeout=None\` means a hung connection waits forever, holding a worker hostage.

**Snippet 3:** it retries once, immediately, with no delay, and **without checking the status** — so a 400 gets resent. If that retry fails too, the exception escapes anyway. It is all of the downsides of retrying with none of the benefits.`,
      },
      {
        mode: 'tool',
        title: 'See a herd happen',
        body: `Write a tiny local server that fails the first 3 seconds and then recovers. Hit it
with 200 concurrent clients that retry with fixed backoff and no jitter. Log arrival times.

Now add jitter and run it again. Compare the two arrival histograms. This is a ten-minute
exercise that makes the animation permanent.`,
        answer: `Without jitter, the arrival log shows **tall spikes**. Nearly all 200 clients arrive at about 1s, then together again at about 3s, then again at about 7s — the cumulative backoff steps. If the server comes back up around 3s, the second spike lands right on it.

With jitter, the same retries **smear out** across each window. The peak arrival rate drops sharply, and the server copes.

To make the effect visible, the server has to be load-sensitive. The simplest way: reject any request that arrives while more than N are already in flight. A server that simply fails for 3 seconds and then succeeds regardless will not show the re-kill.`,
      },
    ],
  },

  {
    id: 's1.3.t5',
    moduleId: 's1.3',
    title: 'Async generators and streaming',
    outcome: 'You can stream data from an async source, through your server, to a browser — the shape of every AI chat interface.',
    minutes: 35,
    sources: [deck],
    animations: [],
    analogy: `A Node readable stream piped through Express to the client. Same pipeline, same
backpressure questions, and the part you already know — consuming it in React — is the part
most Python developers get wrong.`,
    notes: `## An async generator is the two things you already know, together

A generator pauses at \`yield\`. An async function pauses at \`await\`. An async generator
does both:

    async def stream_model(prompt: str):
        async with client.messages.stream(prompt=prompt) as stream:
            async for event in stream:
                yield event.text

    async for chunk in stream_model("explain RAG"):
        print(chunk, end="", flush=True)

Note \`async for\` rather than \`for\`. That is the only new syntax in this topic.

---

## The full path, end to end

This is what you will build in Stage 2, and it is worth seeing whole now:

    provider  ->  your async generator  ->  FastAPI  ->  browser  ->  React state

    @app.post("/chat")
    async def chat(body: ChatIn):
        async def events():
            async for chunk in stream_model(body.prompt):
                yield f"data: {json.dumps({'text': chunk})}\\n\\n"
            yield "data: [DONE]\\n\\n"

        return StreamingResponse(events(), media_type="text/event-stream")

That format — \`data: ...\` followed by a blank line — is Server-Sent Events. It is a plain
text protocol over ordinary HTTP, and the browser has a built-in client for it.

---

## Why streaming matters more here than in web work

Perceived speed is about **time to first token**, not total time.

A response that starts appearing in 400ms and finishes in 9 seconds feels fast. The same
answer delivered complete at 3 seconds feels slow. Users watch words appear and read along.

This is the clearest case where your React experience is worth money: most AI engineers can
produce the tokens and cannot build the interface that makes them feel instant.

---

## Cancellation is the part people skip

When the user clicks stop, the browser closes the connection. FastAPI cancels your generator
and \`CancelledError\` is raised inside it.

If you do not handle that, the upstream call to the provider keeps going. The tokens keep
being generated. You keep paying for an answer nobody will ever see.

    async def events():
        try:
            async for chunk in stream_model(prompt):
                yield ...
        except asyncio.CancelledError:
            await stream.close()            # actually stop the upstream call
            raise

In Stage 2 one of the acceptance criteria is proving, in your logs, that cancelling actually
stopped the billing. This is why.

---

## Two traps

**Buffering proxies.** Some proxies hold your response until it is complete, which silently
turns streaming into non-streaming. If it works locally and not in production, this is
usually why. \`X-Accel-Buffering: no\` is the common fix.

**Errors mid-stream.** You already sent a 200 and half an answer. You cannot now send a 500.
So send the error as an event in the stream and let the interface show it inline. Design for
this from the start.`,
    docs: [
      { label: 'PEP 525 — asynchronous generators', url: 'https://peps.python.org/pep-0525/' },
      { label: 'MDN — Server-Sent Events', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events' },
    ],
    glossary: [
      { term: 'async generator', def: 'A function that is both async and uses yield. Consumed with `async for`.' },
      { term: 'SSE', def: 'Server-Sent Events. A simple one-way streaming format over plain HTTP.' },
      { term: 'time to first token', def: 'How long until the first piece of the answer appears. What users actually feel.' },
      { term: 'buffering proxy', def: 'A proxy that holds the whole response before forwarding, silently breaking streaming.' },
    ],
    check: [
      { q: 'What makes an async generator different from a normal one?', a: 'It can await between yields, so it can pull from the network. You consume it with `async for`.' },
      { q: 'Why does streaming feel faster even when total time is longer?', a: 'Users perceive time to first token. Words appearing at 400ms feels faster than a complete answer at 3 seconds.' },
      { q: 'What happens if you ignore cancellation in a streaming endpoint?', a: 'The upstream generation continues and you keep paying for tokens nobody will see.' },
      { q: 'How do you report an error halfway through a stream?', a: 'As an event inside the stream. You already sent a 200, so you cannot change the status code.' },
      { q: 'It streams locally but not in production. First thing to check?', a: 'A buffering proxy holding the response until it completes.' },
    ],
    practice: [
      {
        mode: 'primitive',
        title: 'Write the SSE formatter by hand',
        body: `One of the ten primitives. Write a function that takes an async generator of strings
and yields correctly formatted SSE frames: \`data: <json>\` followed by a blank line, plus a
final done event.

Get the newlines exactly right. A single missing blank line means the browser buffers
forever and you spend an hour blaming the network.`,
        answer: `\`\`\`python
import json
from collections.abc import AsyncIterator

async def sse(chunks: AsyncIterator[str]) -> AsyncIterator[str]:
    async for text in chunks:
        yield f"data: {json.dumps({'text': text})}\\n\\n"
    yield "data: [DONE]\\n\\n"
\`\`\`

**Why \`json.dumps\` rather than the raw text:** model output contains newlines. A raw newline inside \`data:\` ends that line early and breaks the frame — in SSE, every line of an event needs its own \`data:\` prefix. JSON encodes the newline as \`\\n\`, so each event stays on one line.

The blank line — the second \`\\n\` — is what tells the browser the event is complete. Without it, the browser just keeps waiting.`,
      },
      {
        mode: 'spec',
        title: 'Stream something end to end',
        body: `Spec then build, with AI: a FastAPI endpoint that streams a slow counter (one number
a second for ten seconds) over SSE, and a tiny HTML page that shows them as they arrive.

No model involved yet — you are proving the pipe works. When you add a real model in Stage 2,
only one line changes.

Then test cancellation: close the page halfway and confirm from the server logs that the
generator stopped.`,
        answer: `Server:

\`\`\`python
@app.get("/count")
async def count(request: Request):
    async def gen():
        for i in range(1, 11):
            if await request.is_disconnected():
                log.info("client_gone", at=i)
                return
            yield f"data: {json.dumps({'n': i})}\\n\\n"
            await asyncio.sleep(1)
        yield "data: [DONE]\\n\\n"
    return StreamingResponse(gen(), media_type="text/event-stream",
                             headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})
\`\`\`

Page:

\`\`\`html
<pre id="out"></pre>
<script>
  const es = new EventSource('/count');
  es.onmessage = (e) => {
    if (e.data === '[DONE]') return es.close();
    document.getElementById('out').textContent += JSON.parse(e.data).n + ' ';
  };
</script>
\`\`\`

The snag most people hit: **\`EventSource\` reconnects automatically** when the server closes the stream. Forget \`es.close()\` on \`[DONE]\` and the count starts over from 1, forever. Real chat interfaces use \`fetch\` with a reader instead, which also allows POST.

Close the tab halfway and you should see \`client_gone\` in the server log.`,
      },
      {
        mode: 'break',
        title: 'Break it',
        body: `Remove the blank line after \`data:\` and watch the browser receive nothing. Put it
back. Then make the generator raise halfway and observe what the client sees — it is not a
500, and understanding why is the point.`,
        answer: `**No blank line after \`data:\`** — the browser never sees the end of an event, so nothing ever displays. The connection is open and bytes are arriving; the parser is just still waiting for the terminator.

**The generator raises halfway** — the client sees the stream simply stop. \`EventSource\` fires \`onerror\` and tries to reconnect; a \`fetch\` reader either finishes early or gets a network error.

The status is still **200**. The status line and headers were sent before the first event, so it is too late to change them. That is why errors after the first byte have to travel **inside** the stream, as an event the interface knows how to show.`,
      },
    ],
  },

  {
    id: 's1.3.t6',
    moduleId: 's1.3',
    title: 'Threads, processes and the GIL — in one page',
    outcome: 'You can pick between async, threads and processes without a long argument about it.',
    minutes: 20,
    sources: [deck],
    animations: [],
    analogy: `Node has one thread plus worker threads for CPU work. Python has the same
split, with one extra rule — the GIL — that explains why threads do not help with
computation.`,
    notes: `## The rule

Python has a Global Interpreter Lock. Only one thread executes Python code at a time, even
on a sixteen-core machine.

So:

- **Waiting on the network or disk** — threads are fine, and async is better
- **Doing actual computation** — threads do not help at all; you need processes

---

## The decision, in three lines

    waiting on IO, lots of it        -> async        (your default in this work)
    one blocking library you cannot replace -> asyncio.to_thread
    real CPU work                    -> ProcessPoolExecutor

---

## Why async is the default here

Almost everything in AI engineering is waiting: waiting for a model, waiting for a database,
waiting for an embedding API. Very little is computation. That is why the entire ecosystem
is async-first and why this module spent five topics on it.

---

## The exception you will actually meet

PDF parsing and OCR in Stage 3 are genuinely CPU-bound. Parsing 500 PDFs will peg one core
and, if you do it inside your async server, stall every request while it runs.

The fix is not a thread. It is either a process pool:

    from concurrent.futures import ProcessPoolExecutor
    loop = asyncio.get_running_loop()
    with ProcessPoolExecutor() as pool:
        text = await loop.run_in_executor(pool, parse_pdf, path)

or — better, and what you will actually do — a **background worker** outside the web
process entirely. Ingestion is a job, not a request. Stage 5 covers queues properly.

---

## What about the GIL going away?

Recent Python versions have an experimental build without the GIL. Interesting, not yet
relevant. Nothing in this path depends on it, and the decision table above does not change
for the work you are doing.`,
    docs: [
      { label: 'Python docs — concurrent.futures', url: 'https://docs.python.org/3/library/concurrent.futures.html' },
      { label: 'asyncio — running blocking code', url: 'https://docs.python.org/3/library/asyncio-dev.html#running-blocking-code' },
    ],
    glossary: [
      { term: 'GIL', def: 'The lock that means only one thread runs Python code at a time.' },
      { term: 'IO-bound', def: 'Spending most of the time waiting on the network or disk.' },
      { term: 'CPU-bound', def: 'Spending most of the time computing. Threads do not help; processes do.' },
      { term: 'ProcessPoolExecutor', def: 'Runs work in separate processes, sidestepping the GIL.' },
    ],
    check: [
      { q: 'Why do threads not speed up computation in Python?', a: 'The GIL lets only one thread run Python bytecode at a time.' },
      { q: 'What is the default choice for AI engineering work, and why?', a: 'Async — because nearly everything is waiting on a network call, not computing.' },
      { q: 'Where does PDF parsing belong?', a: 'Out of the web process entirely — a background worker. A process pool is the in-between answer.' },
    ],
    practice: [
      {
        mode: 'decision',
        title: 'Pick the right tool',
        body: `For each, choose async, to_thread, a process pool, or a background worker, and say
why in one line:

1. Calling five model APIs at once
2. Parsing 500 PDFs
3. Computing cosine similarity over 100,000 vectors in Python
4. One legacy library that only has a blocking client
5. Resizing uploaded images
6. Running a 200-question eval suite against a model API`,
        answer: `1. **Five model APIs at once** → async, with \`gather\`. It is pure waiting on the network.
2. **Parsing 500 PDFs** → a background worker. It is heavy CPU work that does not belong inside the web process; use a process pool within that worker if you need the speed.
3. **Cosine similarity over 100,000 vectors** → neither threads nor a pool. Use **numpy**, which does the maths in C, or let **pgvector** do it in the database. This is the trick answer: don't compute it in Python loops at all.
4. **A legacy blocking client** → \`asyncio.to_thread\`.
5. **Resizing uploaded images** → a background worker. It is CPU-bound, and the user does not need to wait for it.
6. **A 200-question eval suite against a model API** → async with a semaphore. It is waiting on the network — and it belongs in a job or a CI step, not inside a request.`,
      },
      {
        mode: 'read',
        title: 'Why is this slow?',
        body: `    async def handler(req):
        return await asyncio.gather(*[
            asyncio.to_thread(heavy_math, x) for x in range(8)
        ])

Eight threads, eight cores, and it is barely faster than doing them one at a time. Explain
why in one sentence, then say what you would do instead.`,
        answer: `\`heavy_math\` is pure-Python computation, and the **GIL** lets only one thread run Python code at a time. So the eight threads take turns, running effectively one after another — plus some switching overhead.

Instead:

- run it in a **\`ProcessPoolExecutor\`**, via \`loop.run_in_executor(pool, heavy_math, x)\`, or
- vectorise it with **numpy**, which releases the GIL while it computes, or
- move it out of the request into a **worker**.`,
      },
    ],
  },
];
