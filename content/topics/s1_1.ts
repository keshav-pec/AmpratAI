import type { Topic } from '@/lib/types';

const deck = { kind: 'deck' as const, label: 'Slides', reason: 'written for you, always current' };
const find = (label: string, query: string, channel: string, reason: string) =>
  ({ kind: 'find' as const, label, query, channel, reason });

export const s1_1: Topic[] = [
  {
    id: 's1.1.t1',
    moduleId: 's1.1',
    title: 'Decorators and what they are really doing',
    outcome: 'You can read any decorator you meet in AI code, and write one that wraps a function.',
    minutes: 35,
    sources: [
      deck,
      find('Visual', 'python decorators explained', 'Corey Schafer', 'slower, with live examples'),
      find('Deeper', 'python decorators functools wraps advanced', 'mCoding', 'edge cases and why functools.wraps matters'),
    ],
    animations: [],
    analogy: `You have written this in Express without calling it a decorator:

    app.get('/users', requireAuth, handler)

\`requireAuth\` wraps \`handler\`. It runs first, can reject the request, and can pass
control on. A Python decorator is the same idea with different syntax — the wrapper is
named above the function instead of beside it.`,
    notes: `## What you will actually see

Open almost any AI library and you meet this immediately:

    @app.get("/health")
    async def health():
        return {"ok": True}

    @retry(attempts=3)
    def call_model(prompt): ...

    @property
    def total_cost(self): ...

If \`@something\` is a mystery, half of FastAPI and most agent frameworks look like magic.
They are not magic. This is the whole trick.

---

## A decorator is a function that takes a function

    def shout(fn):
        def wrapper(*args, **kwargs):
            result = fn(*args, **kwargs)
            return result.upper()
        return wrapper

    @shout
    def greet(name):
        return f"hello {name}"

    greet("keshav")     # "HELLO KESHAV"

\`@shout\` above \`greet\` means exactly one thing:

    greet = shout(greet)

That is the entire feature. The name \`greet\` now points at \`wrapper\`, and \`wrapper\`
remembers the original function.

---

## Why \`*args, **kwargs\`

The wrapper does not know what arguments the function it wraps will take. So it accepts
anything and passes it straight through.

\`*args\` collects positional arguments into a tuple. \`**kwargs\` collects keyword
arguments into a dict. In JS you would write \`(...args)\` — Python splits it into two
because Python has real keyword arguments.

---

## Decorators that take arguments

This trips up everyone once. A decorator with arguments needs one more layer:

    def retry(attempts):
        def decorator(fn):
            def wrapper(*args, **kwargs):
                for i in range(attempts):
                    try:
                        return fn(*args, **kwargs)
                    except Exception:
                        if i == attempts - 1:
                            raise
            return wrapper
        return decorator

    @retry(attempts=3)
    def flaky(): ...

Read it outside-in. \`retry(attempts=3)\` runs first and returns \`decorator\`. Then
\`decorator(flaky)\` runs and returns \`wrapper\`. Three layers, because there are three
things to remember: the settings, the function, and the call.

You will write almost exactly this in Stage 2, for retrying model calls.

---

## The bug you will hit: the name disappears

    @shout
    def greet(name): ...

    print(greet.__name__)    # "wrapper", not "greet"

The original function's name, docstring and signature are gone. That breaks logging, breaks
debuggers, and breaks FastAPI's automatic documentation.

The fix is one line:

    from functools import wraps

    def shout(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs): ...
        return wrapper

\`@wraps(fn)\` copies the metadata across. Use it in every decorator you write. Always.

---

## What decorators are used for in AI code

- **Routing** — \`@app.post("/chat")\` registers the function with FastAPI
- **Retries and timeouts** — wrapping a model call
- **Caching** — \`@lru_cache\` on an expensive pure function
- **Cost and latency tracking** — measure before and after, log the difference
- **Tool registration** — agent frameworks use \`@tool\` to collect functions into a registry

That last one is worth noticing now. When you see \`@tool\` in Stage 4, it is doing what
you just learned: taking your function, reading its signature, and putting it in a list.`,
    docs: [
      { label: 'Python docs — functools.wraps', url: 'https://docs.python.org/3/library/functools.html#functools.wraps' },
      { label: 'PEP 318 — decorators (the original proposal)', url: 'https://peps.python.org/pep-0318/' },
    ],
    glossary: [
      { term: 'decorator', def: 'A function that takes a function and returns a replacement for it.' },
      { term: 'wrapper', def: 'The replacement function a decorator returns. It usually calls the original somewhere inside.' },
      { term: '*args', def: 'Collects any positional arguments into a tuple.' },
      { term: '**kwargs', def: 'Collects any keyword arguments into a dict.' },
      { term: 'functools.wraps', def: 'Copies name, docstring and signature from the original function onto the wrapper.' },
    ],
    check: [
      { q: 'What does @shout above a function actually do?', a: 'It rebinds the name: `greet = shout(greet)`. Nothing else.' },
      { q: 'Why does a decorator with arguments need three levels of function?', a: 'One level captures the settings, one captures the function, one handles the call. Each level returns the next.' },
      { q: 'What breaks if you forget functools.wraps?', a: 'The wrapped function loses its name, docstring and signature. Logs get useless, and FastAPI cannot generate correct docs.' },
      { q: 'Why does the wrapper take *args and **kwargs?', a: 'It has no idea what arguments the function it wraps takes, so it accepts anything and forwards it.' },
      { q: 'Where will you meet decorators in AI work?', a: 'Route registration, retry wrappers, caching, cost tracking, and tool registration in agent frameworks.' },
    ],
    practice: [
      {
        mode: 'primitive',
        title: 'Write a timing decorator by hand',
        body: `No AI for this one — it is 12 lines and it makes everything else readable.

Write \`@timed\` that prints how long the wrapped function took, in milliseconds, and
returns the original result unchanged. Use \`functools.wraps\`. Then check that
\`fn.__name__\` still prints the original name.`,
      },
      {
        mode: 'read',
        title: 'Predict the output',
        body: `Without running it, say what this prints and why:

    def double(fn):
        def wrapper(x):
            return fn(x) * 2
        return wrapper

    @double
    @double
    def add_one(x):
        return x + 1

    print(add_one(3))

Then run it. If you were wrong, work out which decorator is applied first.`,
      },
      {
        mode: 'spec',
        title: 'Spec a retry decorator, then review what AI writes',
        body: `Write the spec first, in plain English: how many attempts, which exceptions are
retried, how long it waits between attempts, what happens on the final failure, and what it
logs.

Then have AI implement it. Now review it against your spec and answer:
- Does it retry on \`KeyboardInterrupt\`? It should not.
- Does it preserve the function metadata?
- Does the wait grow between attempts, or is it fixed?
- What happens if \`attempts=0\`?

Fix whatever it got wrong. The reviewing is the exercise.`,
      },
      {
        mode: 'break',
        title: 'Break it',
        body: `Take your \`@timed\` decorator and remove \`functools.wraps\`. Now decorate a
function and try to use it with FastAPI, or just print \`help(fn)\`. Watch the information
vanish. Put it back.`,
      },
    ],
  },

  {
    id: 's1.1.t2',
    moduleId: 's1.1',
    title: 'Context managers and cleanup',
    outcome: 'You can use `with` confidently and write your own context manager for setup and teardown.',
    minutes: 30,
    sources: [
      deck,
      find('Visual', 'python context managers with statement', 'Corey Schafer', 'worked through slowly'),
    ],
    animations: [],
    analogy: `In Node you write try/finally to make sure a connection closes even when
something throws. Python has a dedicated syntax for that pattern, and every resource in the
standard library supports it. \`with\` is try/finally with the boilerplate removed.`,
    notes: `## The problem it solves

    f = open("data.txt")
    text = f.read()          # if this throws...
    f.close()                # ...this never runs

The file handle leaks. Do that a few thousand times in a long-running server and you run
out of file descriptors.

---

## The fix

    with open("data.txt") as f:
        text = f.read()
    # f is closed here, whether read() worked or threw

\`with\` guarantees the cleanup. This is why you will almost never see a bare \`open()\` in
real Python.

---

## Where it shows up in AI work

    with open("prompt.txt") as f: ...                  # files
    async with httpx.AsyncClient() as client: ...      # connection pools
    with Session(engine) as session: ...               # database sessions
    with tracer.start_span("retrieval"): ...           # tracing spans

That last one matters. In Stage 5 you will wrap retrieval and model calls in spans, and the
span closes itself when the block ends — including when the block throws, which is exactly
when you most want the trace.

---

## Writing your own

The short way, and the one you will use:

    from contextlib import contextmanager
    import time

    @contextmanager
    def timer(label):
        start = time.perf_counter()
        try:
            yield                                # the body of the with block runs here
        finally:
            ms = (time.perf_counter() - start) * 1000
            print(f"{label}: {ms:.0f}ms")

    with timer("embedding"):
        embed(documents)

Everything before \`yield\` is setup. Everything after is teardown. The \`try/finally\`
makes the teardown run even if the body throws.

---

## The async version

Anything that talks to the network has an async form:

    from contextlib import asynccontextmanager

    @asynccontextmanager
    async def client():
        c = httpx.AsyncClient(timeout=10)
        try:
            yield c
        finally:
            await c.aclose()

    async with client() as c:
        r = await c.get(url)

You will use \`async with\` constantly from Stage 2 onward — every provider SDK and every
HTTP client is built this way.

---

## The rule

If something needs to be closed, released, flushed or ended, there is a context manager for
it. If you find yourself writing try/finally around a resource, you are writing a context
manager by hand.`,
    docs: [
      { label: 'Python docs — contextlib', url: 'https://docs.python.org/3/library/contextlib.html' },
      { label: 'Python docs — the with statement', url: 'https://docs.python.org/3/reference/compound_stmts.html#with' },
    ],
    glossary: [
      { term: 'context manager', def: 'An object that runs setup when a `with` block starts and teardown when it ends, even on an error.' },
      { term: 'yield', def: 'In a context manager, the point where the body of the `with` block runs.' },
      { term: 'async with', def: 'The same thing for resources whose setup or teardown needs to await something.' },
    ],
    check: [
      { q: 'What does `with` guarantee that a plain function call does not?', a: 'That the teardown runs even if the body raises an exception.' },
      { q: 'In a @contextmanager function, what does the code after `yield` do?', a: 'It is the teardown. It runs when the `with` block exits.' },
      { q: 'Why wrap the yield in try/finally?', a: 'Without it, an exception inside the `with` block skips your cleanup entirely.' },
      { q: 'Name three things in AI code that are context managers.', a: 'HTTP clients, database sessions, and tracing spans. Also files.' },
    ],
    practice: [
      {
        mode: 'primitive',
        title: 'Write a timer context manager',
        body: `By hand. \`with timer("label"):\` prints the elapsed milliseconds when the block
ends. Make sure it still prints when the body raises — test that deliberately.`,
      },
      {
        mode: 'read',
        title: 'Spot the leak',
        body: `What is wrong with this, and when does it bite?

    def fetch_all(urls):
        client = httpx.Client()
        results = [client.get(u) for u in urls]
        client.close()
        return results

Answer in one sentence, then rewrite it correctly.`,
      },
      {
        mode: 'tool',
        title: 'Find the context managers you already depend on',
        body: `Open the docs for \`httpx\`, \`sqlalchemy\` and any tracing library. For each,
find the recommended way to create a client or session. Note how many of them are context
managers. This is the convention, not a nicety.`,
      },
    ],
  },

  {
    id: 's1.1.t3',
    moduleId: 's1.1',
    title: 'Generators and yield',
    outcome: 'You understand how `yield` produces values lazily — the mechanism behind every streaming response you will build.',
    minutes: 35,
    sources: [
      deck,
      find('Visual', 'python generators yield explained', 'Corey Schafer', 'good pacing, clear examples'),
      find('Deeper', 'python generators iterators deep dive', 'mCoding', 'the protocol underneath'),
    ],
    animations: [],
    analogy: `This is the Python version of a Node readable stream. A normal function is
\`res.json(everything)\`. A generator is \`res.write(chunk)\` in a loop. Same difference:
one holds it all in memory and arrives at once, the other trickles out.`,
    notes: `## Two ways to produce a list

Eager — build it all, then return it:

    def squares(n):
        out = []
        for i in range(n):
            out.append(i * i)
        return out

    squares(10_000_000)      # builds 10 million numbers in memory first

Lazy — produce one at a time:

    def squares(n):
        for i in range(n):
            yield i * i

    for s in squares(10_000_000):   # one number in memory at a time
        ...

The only change is \`yield\` instead of \`append\` and \`return\`. That single keyword turns
the function into a **generator**.

---

## What yield actually does

Calling a generator function runs **none** of its body. It hands you a generator object.

    g = squares(3)
    print(g)          # <generator object ...>

The body runs a piece at a time, each time you ask for the next value:

    next(g)   # runs up to the first yield, gives 0, then pauses
    next(g)   # resumes where it paused, gives 1, pauses again
    next(g)   # gives 4
    next(g)   # raises StopIteration

The function is frozen between yields, with all its local variables intact. That pause-and-
resume is the same mechanism \`await\` uses, which is why this topic comes before async.

---

## Why this matters for AI work

Two reasons, and you will hit both.

**Streaming responses.** A model sends its answer token by token. You do not want to wait
for all of it, and you do not want to hold it all before showing it:

    def stream_answer(prompt):
        for event in client.messages.stream(prompt):
            yield event.text

    for chunk in stream_answer("explain RAG"):
        print(chunk, end="", flush=True)

**Large files.** In Stage 3 you ingest documents that do not fit in memory:

    def read_chunks(path, size=800):
        with open(path) as f:
            while block := f.read(size):
                yield block

Millions of words, constant memory.

---

## The gotcha: a generator is used up

    g = squares(3)
    list(g)    # [0, 1, 4]
    list(g)    # []  — empty, it is exhausted

If you need the values twice, store them in a list. This catches people who loop over a
generator to count things and then loop again to use them, and get nothing the second time.

---

## Generator expressions

Same idea, shorter, for simple cases:

    total = sum(len(c) for c in chunks)        # lazy, no list built

The square brackets version builds a real list; the round brackets version does not. For a
million items that is the difference between 80MB and nothing.

---

## Where this goes next

In the async module you meet \`async def\` with \`yield\` — an async generator. That is
literally how you will stream model output through FastAPI to a React page. Everything in
this topic transfers directly.`,
    docs: [
      { label: 'Python docs — generators', url: 'https://docs.python.org/3/tutorial/classes.html#generators' },
      { label: 'PEP 255 — simple generators', url: 'https://peps.python.org/pep-0255/' },
    ],
    glossary: [
      { term: 'generator', def: 'A function that uses `yield`. Calling it returns an object that produces values one at a time.' },
      { term: 'lazy', def: 'Values are computed only when asked for, not all up front.' },
      { term: 'StopIteration', def: 'The signal a generator raises when it has no more values. `for` loops handle it for you.' },
      { term: 'exhausted', def: 'A generator that has produced all its values. It cannot be restarted.' },
    ],
    check: [
      { q: 'What happens when you call a generator function?', a: 'Nothing in the body runs. You get a generator object back.' },
      { q: 'What is kept alive between two yields?', a: 'All the local variables and the exact position in the function. It is paused, not restarted.' },
      { q: 'Why can you not loop over the same generator twice?', a: 'It is exhausted after the first pass. Convert to a list if you need it again.' },
      { q: 'What is the difference between [x for x in y] and (x for x in y)?', a: 'The first builds a full list in memory; the second is a lazy generator.' },
      { q: 'How does this connect to streaming a model response?', a: 'Each token arrives as a chunk; you yield it onward immediately instead of collecting the whole answer first.' },
    ],
    practice: [
      {
        mode: 'primitive',
        title: 'Write a chunking generator',
        body: `By hand, no AI. Write \`read_chunks(path, size)\` that yields fixed-size pieces of a
text file, and never holds more than one piece in memory.

Then add \`overlap\`: each chunk repeats the last N characters of the previous one. Keep it
correct at the boundaries — the last chunk should not be padded, and a file shorter than one
chunk should yield exactly one chunk.

You will use this exact function again in Stage 3.`,
      },
      {
        mode: 'read',
        title: 'Predict the output',
        body: `What does this print?

    def counter():
        print("starting")
        for i in range(3):
            print("about to yield", i)
            yield i

    g = counter()
    print("created")
    print(next(g))
    print(next(g))

Pay attention to the order of the lines. That order is the whole lesson.`,
      },
      {
        mode: 'spec',
        title: 'Spec a batched generator, then check the AI version',
        body: `Spec: \`batched(items, n)\` yields lists of at most n items from any iterable,
including a generator, without loading everything into memory.

Have AI write it. Then check the cases it probably missed: an empty input, a final partial
batch, and an input that is itself a generator. Fix what is wrong.`,
      },
      {
        mode: 'break',
        title: 'Break it',
        body: `Write a generator over a list of 5 items. Loop over it, count the items, then loop
again and print them. Explain to yourself why the second loop prints nothing, then fix it in
two different ways.`,
      },
    ],
  },

  {
    id: 's1.1.t4',
    moduleId: 's1.1',
    title: 'Type hints, generics and Protocol',
    outcome: 'You can read and write Python types the way you read and write TypeScript — including the parts that differ.',
    minutes: 40,
    sources: [
      deck,
      find('Visual', 'python type hints tutorial mypy', 'ArjanCodes', 'practical, opinionated, close to production style'),
    ],
    animations: [],
    analogy: `This is TypeScript with three differences: the types live in the same file as the
code (no separate .d.ts), they are ignored at runtime unless a library chooses to read them,
and pydantic *does* read them — which is the whole reason they matter in AI work.`,
    notes: `## The basics map almost one to one

    TypeScript                    Python
    ---------------------------   ---------------------------------
    string                        str
    number                        int  /  float
    boolean                       bool
    string[]                      list[str]
    Record<string, number>        dict[str, int]
    [string, number]              tuple[str, int]
    string | null                 str | None
    "a" | "b"                     Literal["a", "b"]
    unknown                       object
    any                           Any

Written out:

    def top_k(query: str, k: int = 5) -> list[str]:
        ...

Read it exactly as you would the TypeScript.

---

## Nothing is enforced at runtime

This runs without complaint:

    def greet(name: str) -> str:
        return name

    greet(42)        # returns 42. No error.

Python does not check types when it runs. A type checker checks them before you run —
\`pyright\` or \`mypy\`, the same job \`tsc\` does. Set one up and treat its output as errors.

**The exception that matters:** pydantic and FastAPI read your annotations and *do* enforce
them, at the edges of your program. That is why the next module is the important one.

---

## Optional does not mean optional

A common misread:

    def f(name: str | None): ...        # name is REQUIRED, and may be None
    def g(name: str = "x"): ...         # name is OPTIONAL, defaults to "x"

\`str | None\` is about the *value*. A default is about whether you must pass it. They are
independent, and mixing them up produces confusing errors in FastAPI request models.

(You will also see \`Optional[str]\`. Same thing, older syntax.)

---

## Literal — narrow strings to a fixed set

    from typing import Literal

    Provider = Literal["anthropic", "openai", "gemini"]

    def call(provider: Provider, prompt: str) -> str: ...

    call("anthropic", "hi")     # fine
    call("antropic", "hi")      # type checker catches the typo

You will use this constantly: model names, roles, statuses, tool names. It is the same as a
TypeScript string union, and it turns a class of silent bugs into caught ones.

---

## Generics

    def first(items: list[T]) -> T | None: ...

To make that work you declare the type variable:

    from typing import TypeVar
    T = TypeVar("T")

    def first(items: list[T]) -> T | None:
        return items[0] if items else None

On Python 3.12 and later there is shorter syntax:

    def first[T](items: list[T]) -> T | None: ...

Which reads almost exactly like TypeScript.

---

## Protocol — structural typing, like a TS interface

This is the one that feels most familiar and is least known by Python beginners.

    from typing import Protocol

    class Embedder(Protocol):
        def embed(self, texts: list[str]) -> list[list[float]]: ...

Any class with a matching \`embed\` method satisfies \`Embedder\`. It does not need to
inherit from it, import it, or know it exists. That is structural typing — exactly how
TypeScript interfaces work.

Why it matters: in Stage 2 you will write one interface over three model providers. A
Protocol is how you describe "anything with these methods" without forcing every provider
into an inheritance tree.

---

## The habit worth building now

Annotate every function you write. Run the type checker. It costs seconds and it catches
the class of bug that is most annoying in AI code: a function that returns \`str | None\`
where the caller assumed \`str\`, which blows up only on the request where the model
returned nothing.`,
    docs: [
      { label: 'Python docs — typing', url: 'https://docs.python.org/3/library/typing.html' },
      { label: 'mypy cheat sheet', url: 'https://mypy.readthedocs.io/en/stable/cheat_sheet_py3.html' },
      { label: 'Pyright', url: 'https://microsoft.github.io/pyright/' },
    ],
    glossary: [
      { term: 'type hint', def: 'An annotation saying what type a value should be. Ignored when Python runs, checked by a tool beforehand.' },
      { term: 'Literal', def: 'A type that allows only specific values, like a TypeScript string union.' },
      { term: 'TypeVar', def: 'A named placeholder type, used to write generic functions.' },
      { term: 'Protocol', def: 'Structural typing: any object with the right methods matches, without inheriting anything.' },
      { term: 'pyright / mypy', def: 'Type checkers. They do for Python what tsc does for TypeScript.' },
    ],
    check: [
      { q: 'Does Python check type hints at runtime?', a: 'No. A separate tool checks them before you run. Pydantic and FastAPI are the exception — they read the annotations and enforce them at the boundary.' },
      { q: 'What is the difference between `x: str | None` and `x: str = "a"`?', a: 'The first is required but may be None. The second is optional with a default. They are unrelated.' },
      { q: 'When would you use Literal?', a: 'When a string can only be one of a fixed set — model names, roles, statuses. It catches typos at check time.' },
      { q: 'How is Protocol different from inheriting a base class?', a: 'Protocol matches on shape, not lineage. A class satisfies it just by having the right methods.' },
      { q: 'Why does any of this matter more in AI code than in a script?', a: 'Because pydantic turns annotations into runtime validation, and that validation is what stops malformed model output reaching your database.' },
    ],
    practice: [
      {
        mode: 'read',
        title: 'Translate the signature',
        body: `Write the TypeScript equivalent of each:

    def search(q: str, k: int = 5, filters: dict[str, str] | None = None) -> list[tuple[str, float]]: ...
    def route(provider: Literal["anthropic", "openai"], stream: bool) -> None: ...
    def first[T](xs: list[T]) -> T | None: ...

Then say which arguments are required and which are optional in each.`,
      },
      {
        mode: 'spec',
        title: 'Define a Protocol for an embedder',
        body: `Write a \`Protocol\` describing anything that can turn a list of strings into a list
of vectors, plus report its dimension count.

Then have AI write two classes that satisfy it — one calling a real API, one returning fake
vectors for tests — without either of them importing your Protocol. Run \`pyright\` and
confirm both are accepted.

This is exactly the shape of the provider abstraction you build in Stage 2.`,
      },
      {
        mode: 'tool',
        title: 'Put a type checker in your loop',
        body: `Install \`pyright\` (or \`mypy\`) in a scratch project. Write a function with a
deliberate type error — return \`None\` from something annotated \`-> str\`. Confirm the
checker catches it. Then wire it into your editor so you see it as you type, the way you
already do with TypeScript.`,
      },
    ],
  },

  {
    id: 's1.1.t5',
    moduleId: 's1.1',
    title: 'The traps that catch JavaScript developers',
    outcome: 'You recognise the six Python behaviours that will otherwise cost you an afternoon each.',
    minutes: 30,
    sources: [
      deck,
      find('Deeper', 'python gotchas mutable default arguments', 'mCoding', 'short, precise, corrects the usual misconceptions'),
    ],
    animations: [],
    analogy: `Every language has a handful of behaviours that are perfectly logical once
explained and completely baffling before. These are Python's. You already survived JS
equality and \`this\` — this is a shorter list.`,
    notes: `## 1. Mutable default arguments

The classic. This is wrong:

    def add_tag(tag, tags=[]):
        tags.append(tag)
        return tags

    add_tag("a")     # ["a"]
    add_tag("b")     # ["a", "b"]   <- not what you expected

The default value is created **once**, when the function is defined — not on each call. So
every call shares the same list.

The fix:

    def add_tag(tag, tags=None):
        tags = tags or []
        tags.append(tag)
        return tags

Rule: never use a list, dict or set as a default. Use \`None\` and build it inside.

---

## 2. Assignment never copies

    a = [1, 2, 3]
    b = a
    b.append(4)
    print(a)        # [1, 2, 3, 4]

Same as JS objects. But it catches people because Python has no \`const\`, so nothing
signals that \`b\` is the same list. To copy: \`b = a.copy()\` or \`b = list(a)\`. For
nested structures, \`copy.deepcopy(a)\`.

---

## 3. Truthiness is not the same as JS

    ""      falsy        ""          falsy
    0       falsy        0           falsy
    []      FALSY        []          truthy in JS
    {}      FALSY        {}          truthy in JS
    None    falsy        null        falsy

The two in capitals bite. In JS you check \`if (arr.length)\`. In Python \`if arr:\` is
idiomatic and correct — empty containers are falsy.

But be careful with this one:

    if not results:          # true for [] AND for None
    if results is None:      # true only for None

When a function can return either "no results" or "did not run", check explicitly.

---

## 4. \`is\` versus \`==\`

\`==\` compares values. \`is\` compares identity — whether they are literally the same
object. Use \`is\` only for \`None\`, \`True\` and \`False\`:

    if x is None: ...        # correct
    if name is "keshav": ... # wrong, and sometimes accidentally works

That "sometimes works" is why it is dangerous. Small integers and short strings are cached
by Python, so \`is\` can appear to work in a test and fail in production.

---

## 5. Late binding in closures

    fns = [lambda: i for i in range(3)]
    print([f() for f in fns])       # [2, 2, 2]  — not [0, 1, 2]

The lambda looks up \`i\` when it is *called*, by which point the loop has finished. Exactly
the same trap as \`var\` in a JS loop.

The fix — capture the value as a default argument:

    fns = [lambda i=i: i for i in range(3)]

You will meet this when building a list of tool handlers in Stage 4.

---

## 6. Integer division and float surprises

    7 / 2      # 3.5   — always a float
    7 // 2     # 3     — floor division
    -7 // 2    # -4    — floors toward negative infinity, not toward zero

The last one differs from JS's \`Math.trunc\` behaviour. It matters when you compute chunk
counts or token budgets — \`//\` on a negative number does not round the way you expect.

---

## Bonus: no ++ and no semicolons

There is no \`i++\`. Write \`i += 1\`. Semicolons are legal and nobody uses them. Indentation
is the block syntax, so a stray space is a syntax error — let the formatter handle it and
never think about it again.`,
    docs: [
      { label: 'Python docs — default argument values', url: 'https://docs.python.org/3/tutorial/controlflow.html#default-argument-values' },
      { label: 'Python docs — copy module', url: 'https://docs.python.org/3/library/copy.html' },
    ],
    glossary: [
      { term: 'mutable default', def: 'A list or dict used as a default argument. It is shared across every call to that function.' },
      { term: 'identity (is)', def: 'Whether two names point at the same object, as opposed to equal values.' },
      { term: 'late binding', def: 'A closure looks up the variable when it runs, not when it was created.' },
      { term: 'floor division (//)', def: 'Integer division that rounds toward negative infinity.' },
    ],
    check: [
      { q: 'Why does a list default argument accumulate across calls?', a: 'The default is evaluated once at definition time, so every call shares one list.' },
      { q: 'Which is truthy in JS but falsy in Python?', a: 'Empty lists and empty dicts.' },
      { q: 'When should you use `is`?', a: 'Only for None, True and False. Use == for everything else.' },
      { q: 'What does [lambda: i for i in range(3)] produce when called?', a: '[2, 2, 2]. The lambdas read `i` when called, after the loop finished.' },
      { q: 'What is -7 // 2?', a: '-4. Floor division rounds toward negative infinity, not toward zero.' },
    ],
    practice: [
      {
        mode: 'read',
        title: 'Find the bug in each',
        body: `Six snippets, one bug each. Say what goes wrong and when.

    # 1
    def collect(x, seen=set()):
        seen.add(x); return seen

    # 2
    config = defaults
    config["model"] = "haiku"

    # 3
    if not chunks:
        raise ValueError("retrieval failed")

    # 4
    if provider is "anthropic": ...

    # 5
    handlers = [lambda: name for name in tool_names]

    # 6
    pages = -total // per_page

Number 3 is the subtle one. Think about what an empty result legitimately means.`,
      },
      {
        mode: 'primitive',
        title: 'Fix them all',
        body: `Rewrite all six correctly, by hand. Then write one small test per fix that fails
against the original version. The test is the part that proves you understood it.`,
      },
      {
        mode: 'decision',
        title: 'Empty versus missing',
        body: `Your retrieval function can return: results, no matching results, or "the search
backend was down". Right now it returns a list either way.

Decide how you will represent those three outcomes, and defend it in three sentences. There
is more than one reasonable answer — what matters is that the caller cannot confuse a real
empty result with a failure. You will make this exact decision again in Stage 3.`,
      },
    ],
  },
];
