import type { Topic } from '@/lib/types';

const deck = { kind: 'deck' as const, label: 'Slides', reason: 'written for you, always current' };
const find = (label: string, query: string, channel: string, reason: string) =>
  ({ kind: 'find' as const, label, query, channel, reason });

export const s1_4: Topic[] = [
  {
    id: 's1.4.t1',
    moduleId: 's1.4',
    title: 'uv, pyproject and never thinking about environments again',
    outcome: 'You can start a Python project in thirty seconds and know exactly which packages it has.',
    minutes: 25,
    sources: [
      deck,
      find('Visual', 'uv python package manager tutorial', 'ArjanCodes', 'sees it in a real workflow'),
    ],
    animations: [],
    analogy: `npm gave you \`package.json\` and a lockfile and you stopped thinking about it.
Python spent fifteen years without that. \`uv\` is the tool that finally fixed it — it is
npm plus nvm, and it is genuinely fast.`,
    notes: `## Why Python environments have a reputation

Historically: \`pip\` installs into whatever Python is on your PATH, globally, with no
lockfile. Two projects with different versions of the same library break each other. This is
why every Python tutorial starts with three lines about virtual environments.

\`uv\` replaces all of it.

---

## The whole workflow

    uv init my-api          # create the project
    cd my-api
    uv add fastapi uvicorn httpx pydantic-settings
    uv add --dev pytest pytest-asyncio ruff
    uv run uvicorn main:app --reload

That is it. No \`python -m venv\`, no \`source .venv/bin/activate\`, no remembering which
environment you are in. \`uv run\` uses the project's environment automatically.

---

## What the files mean

**pyproject.toml** — your \`package.json\`. Dependencies, dev dependencies, project
metadata, and tool configuration all in one file.

**uv.lock** — your \`package-lock.json\`. Exact versions of everything, including transitive
dependencies. **Commit it.** It is what makes your Docker build reproducible.

**.venv/** — the installed packages. Never commit it. \`uv\` manages it for you.

---

## The commands you will use

    uv add <pkg>              # install and record it
    uv add --dev <pkg>        # dev-only dependency
    uv remove <pkg>
    uv sync                   # install exactly what the lockfile says
    uv run <command>          # run inside the project environment
    uv python install 3.12    # install a Python version, like nvm

\`uv sync\` is the one your Dockerfile and your CI use. It installs the locked versions and
nothing else.

---

## Why speed matters here

\`uv\` resolves and installs ten to a hundred times faster than \`pip\`. That sounds like a
nicety until you are rebuilding a Docker image that installs forty packages on every push.
The difference is a two-minute CI run versus a twenty-second one, and that difference
changes how often you are willing to test things.

---

## One thing to watch

Some tutorials and older Dockerfiles still use \`pip install -r requirements.txt\`. That
still works and you will see it everywhere. If you need to hand someone a requirements file:

    uv export --no-dev > requirements.txt`,
    docs: [
      { label: 'uv documentation', url: 'https://docs.astral.sh/uv/' },
      { label: 'Python packaging — pyproject.toml', url: 'https://packaging.python.org/en/latest/guides/writing-pyproject-toml/' },
    ],
    glossary: [
      { term: 'uv', def: 'A fast Python package and project manager. Replaces pip, venv and pyenv.' },
      { term: 'pyproject.toml', def: 'The project manifest — the Python equivalent of package.json.' },
      { term: 'uv.lock', def: 'Exact resolved versions of every dependency. Commit it.' },
      { term: 'uv sync', def: 'Installs exactly what the lockfile specifies. What CI and Docker use.' },
      { term: 'virtual environment', def: 'An isolated set of installed packages for one project.' },
    ],
    check: [
      { q: 'Which two files do you commit, and which do you not?', a: 'Commit pyproject.toml and uv.lock. Never commit .venv/.' },
      { q: 'What is the difference between uv add and uv sync?', a: 'add installs a new package and updates the lockfile; sync installs exactly what the lockfile already says.' },
      { q: 'Why does install speed actually matter?', a: 'Because it is on the critical path of every Docker build and every CI run, so it changes how often you are willing to test.' },
    ],
    practice: [
      {
        mode: 'tool',
        title: 'Start a project the fast way',
        body: `Create a new project with \`uv\`, add \`fastapi\`, \`httpx\` and \`pydantic-settings\`,
plus \`pytest\` and \`ruff\` as dev dependencies. Write a one-line script and run it with
\`uv run\`.

Then open \`pyproject.toml\` and \`uv.lock\` and read them. You are looking for the same
structure you already know from \`package.json\`.`,
        answer: `\`\`\`bash
uv init my-api && cd my-api
uv add fastapi httpx pydantic-settings
uv add --dev pytest ruff
echo 'print("hello from uv")' > hello.py
uv run python hello.py
\`\`\`

In \`pyproject.toml\` you should see your runtime packages under \`[project] dependencies\`, and the dev tools under \`[dependency-groups] dev\`. \`uv.lock\` pins the exact version of every package, including the ones you never asked for, with hashes.

The usual snags:

- **Running \`python hello.py\`** instead of \`uv run python hello.py\`. That uses the system Python, which does not have your packages.
- **Forgetting to commit \`uv.lock\`.** Your Docker build then resolves fresh versions, and "works on my machine" is back.`,
      },
      {
        mode: 'tool',
        title: 'Prove the isolation',
        body: `Make two projects that need different versions of the same library — pin different
versions of \`httpx\`. Confirm both work, and that neither affects the other or your system
Python. This is the problem the tool exists to solve, and seeing it once is enough.`,
        answer: `\`\`\`bash
uv init a && cd a && uv add "httpx==0.27.*" && uv run python -c "import httpx; print(httpx.__version__)"
cd .. && uv init b && cd b && uv add "httpx==0.28.*" && uv run python -c "import httpx; print(httpx.__version__)"
\`\`\`

Each prints its own version. Each project has its own \`.venv\`, and neither touches the other.

Your system Python, with \`python -c "import httpx"\`, most likely fails with \`ModuleNotFoundError\`. That is the correct result, not a problem: nothing leaked into it.`,
      },
    ],
  },

  {
    id: 's1.4.t2',
    moduleId: 's1.4',
    title: 'ruff, and stopping arguments about formatting',
    outcome: 'Your code is linted and formatted automatically, and you never think about style again.',
    minutes: 15,
    sources: [deck],
    animations: [],
    analogy: `ESLint plus Prettier, in one tool, roughly a hundred times faster. Same
decision you already made in JS: pick the defaults, turn on format-on-save, stop
discussing it.`,
    notes: `## Two jobs, one tool

    ruff check .          # lint: finds bugs and bad patterns
    ruff check --fix .    # fix the ones it can
    ruff format .         # format: whitespace, quotes, line length

---

## Put it in pyproject.toml

    [tool.ruff]
    line-length = 100
    target-version = "py312"

    [tool.ruff.lint]
    select = ["E", "F", "I", "UP", "B", "ASYNC"]

What those mean:

- **E, F** — the standard errors and likely bugs
- **I** — import sorting
- **UP** — rewrites old syntax to modern equivalents
- **B** — common bug patterns, including the mutable default argument trap
- **ASYNC** — **turn this one on.** It catches blocking calls inside async functions, which
  is the single most expensive mistake in this whole stage

That last rule alone justifies setting this up. A linter that catches
\`time.sleep\` in an async handler is cheaper than discovering it under load.

---

## Run it on save, and in CI

Format on save in your editor. Then in CI:

    ruff check .
    ruff format --check .

The \`--check\` form fails the build if anything is unformatted, rather than reformatting
it. Same pattern you use with Prettier.

---

## The point

This is a ten-minute setup that pays for itself the first time it catches a blocking call or
a mutable default. It is not about aesthetics.`,
    docs: [
      { label: 'Ruff documentation', url: 'https://docs.astral.sh/ruff/' },
      { label: 'Ruff rules', url: 'https://docs.astral.sh/ruff/rules/' },
    ],
    glossary: [
      { term: 'ruff', def: 'A fast Python linter and formatter. ESLint and Prettier in one.' },
      { term: 'rule selector', def: 'A short code like "B" or "ASYNC" that turns on a family of checks.' },
    ],
    check: [
      { q: 'Which ruff rule family is most valuable for this work, and why?', a: 'ASYNC — it catches blocking calls inside async functions, the most expensive mistake in Stage 1.' },
      { q: 'What does ruff format --check do differently in CI?', a: 'It fails rather than reformatting, so unformatted code cannot merge.' },
    ],
    practice: [
      {
        mode: 'tool',
        title: 'Set it up once',
        body: `Add \`ruff\` to a project with the config above. Write a function with a mutable
default argument and a \`time.sleep\` inside an \`async def\`. Run \`ruff check .\` and
confirm it flags both.

Then turn on format-on-save in your editor and forget about it.`,
        answer: `With \`select = ["E", "F", "I", "UP", "B", "ASYNC"]\`, \`ruff check .\` should flag both:

- **\`B006\`** — do not use mutable data structures for argument defaults
- **\`ASYNC251\`** — \`time.sleep\` called inside an async function

The usual snags:

- **Config under the wrong table.** Rule selection lives under \`[tool.ruff.lint]\`; older examples put \`select\` directly under \`[tool.ruff]\`.
- **The editor extension reading a different config** from the one CI uses, so the two disagree.

When both flags appear, you have a linter that catches the two most expensive mistakes in Stage 1 before they run.`,
      },
    ],
  },

  {
    id: 's1.4.t3',
    moduleId: 's1.4',
    title: 'pytest, async tests, and faking HTTP',
    outcome: 'You can test async code and model calls without hitting a real API or spending money.',
    minutes: 35,
    sources: [
      deck,
      find('Visual', 'pytest tutorial fixtures python', 'Corey Schafer', 'covers fixtures well'),
    ],
    animations: [],
    analogy: `Jest, with two differences worth knowing: assertions are plain \`assert\`
statements, and fixtures replace \`beforeEach\` with something more composable.`,
    notes: `## The basics

    # test_chunking.py
    def test_overlap_is_exact():
        chunks = chunk("abcdefghij", size=4, overlap=2)
        assert chunks == ["abcd", "cdef", "efgh", "ghij"]

Files named \`test_*.py\`, functions named \`test_*\`, plain \`assert\`. Run with
\`uv run pytest\`. When an assert fails, pytest shows you both sides of the comparison
without you writing a matcher.

---

## Fixtures instead of beforeEach

    import pytest

    @pytest.fixture
    def sample_docs():
        return ["doc one", "doc two"]

    def test_embedding_count(sample_docs):
        assert len(embed(sample_docs)) == 2

Ask for a fixture by naming it as an argument. Fixtures can depend on other fixtures, and
can clean up after themselves with \`yield\` — the context manager pattern again.

---

## Parametrize instead of a loop

    @pytest.mark.parametrize("size,overlap,expected", [
        (4, 0, 3),
        (4, 2, 4),
        (100, 0, 1),
    ])
    def test_chunk_counts(size, overlap, expected):
        assert len(chunk(TEXT, size, overlap)) == expected

Three separate tests, named individually, each failing independently. Much better than one
test with a loop, because you see exactly which case broke.

---

## Async tests

    # pyproject.toml
    [tool.pytest.ini_options]
    asyncio_mode = "auto"

Then just write them:

    async def test_fetch():
        result = await fetch("https://example.com")
        assert result.status_code == 200

With \`asyncio_mode = "auto"\` you do not need a decorator on every test.

---

## Never call a real API in a test

Three reasons: it costs money, it is slow, and it is non-deterministic — the model returns
something different tomorrow and your test fails for no reason.

With \`respx\`, you fake the HTTP layer:

    import respx, httpx

    @respx.mock
    async def test_model_call():
        respx.post("https://api.anthropic.com/v1/messages").mock(
            return_value=httpx.Response(200, json={"content": [{"text": "hi"}]})
        )
        assert await call_model("hello") == "hi"

Now you can test the interesting cases cheaply: what happens on a 429, on a timeout, on
malformed JSON, on a truncated response. Those are the paths that break in production, and
they are impossible to trigger reliably against a real API.

---

## What to test in AI code

Not "does the model give a good answer" — that is evaluation, and it is a different thing
you will build in Stage 3.

Test the deterministic parts:

- your chunking produces the boundaries you expect
- your parser handles a malformed response without crashing
- your retry logic retries 429 and does not retry 400
- your cost calculation is right
- your prompt template renders correctly with awkward input`,
    docs: [
      { label: 'pytest documentation', url: 'https://docs.pytest.org/' },
      { label: 'respx — mock httpx', url: 'https://lundberg.github.io/respx/' },
    ],
    glossary: [
      { term: 'fixture', def: 'Reusable setup a test asks for by naming it as an argument.' },
      { term: 'parametrize', def: 'Runs the same test over several inputs, as separate named tests.' },
      { term: 'respx', def: 'A library that intercepts httpx calls so you can fake API responses.' },
      { term: 'asyncio_mode = auto', def: 'A pytest setting that lets you write async tests without a decorator.' },
    ],
    check: [
      { q: 'Why not call a real model API in a test?', a: 'It costs money, it is slow, and the output changes — so the test fails for reasons unrelated to your code.' },
      { q: 'What should you test in AI code, if not answer quality?', a: 'The deterministic parts: chunk boundaries, parsing, retry rules, cost maths, prompt rendering. Answer quality belongs in evaluation.' },
      { q: 'What does parametrize give you over a loop inside a test?', a: 'Separate named tests that fail independently, so you see exactly which case broke.' },
    ],
    practice: [
      {
        mode: 'primitive',
        title: 'Test your chunker properly',
        body: `Take the chunking generator you wrote earlier. Write parametrized tests for: exact
overlap, a document shorter than one chunk, an empty document, overlap equal to size (what
should that even do?), and a document that divides exactly.

That fifth case is the one that usually reveals an off-by-one.`,
        answer: `\`\`\`python
import pytest

@pytest.mark.parametrize("text,size,overlap,expected", [
    ("abcdefghij", 4, 2, ["abcd", "cdef", "efgh", "ghij"]),   # exact overlap
    ("abc",        10, 2, ["abc"]),                           # shorter than one chunk
    ("",            4, 0, []),                                # empty document
    ("abcdefgh",    4, 0, ["abcd", "efgh"]),                  # divides exactly
    ("abcdefgh",    4, 2, ["abcd", "cdef", "efgh"]),          # divides exactly, with overlap
])
def test_chunks(text, size, overlap, expected):
    assert list(chunk_text(text, size, overlap)) == expected

def test_overlap_must_be_smaller_than_size():
    with pytest.raises(ValueError):
        list(chunk_text("abcdef", 3, 3))
\`\`\`

- **Overlap equal to size** means every step moves forward by zero characters. That is never meaningful, so reject it.
- **The last case is the off-by-one detector.** A buggy chunker emits a fourth chunk, \`"gh"\`, which is only the overlap tail.`,
      },
      {
        mode: 'spec',
        title: 'Test failure paths without a real API',
        body: `Spec the behaviour first: what should your client do on a 429 with Retry-After, a
500, a connection timeout, and a 200 containing malformed JSON?

Then have AI write the tests using \`respx\`. Review them: does each test actually assert
the behaviour you specified, or just that it did not crash? That distinction is where most
generated tests are weak.`,
        answer: `Spec first — this is where the value is:

- **429 with \`Retry-After: 2\`** → wait exactly 2 seconds, retry, then succeed
- **500** → retry up to N times, then raise \`ProviderUnavailable\`
- **Timeout** → retried like a 500
- **200 with malformed JSON** → do not retry; raise \`ProviderBadResponse\`
- **Request body missing a field** → your API returns 422, and the provider is never called

\`\`\`python
@respx.mock
async def test_429_waits_for_retry_after():
    route = respx.post(URL).mock(side_effect=[
        httpx.Response(429, headers={"retry-after": "2"}),
        httpx.Response(200, json=OK_BODY),
    ])
    delays = []
    async def fake_sleep(d): delays.append(d)

    result = await call_model("hi", sleep=fake_sleep)

    assert result == "hi"
    assert route.call_count == 2
    assert delays == [2.0]
\`\`\`

Weak generated tests look like this:

- \`assert result is not None\`, or \`pytest.raises(Exception)\` — they prove only that *something* happened
- no check on \`route.call_count\`, so a client that never retries still passes
- mocking your own function instead of the HTTP layer, so the retry code is never exercised

That is why \`sleep\` is injectable. Patching \`asyncio.sleep\` globally can interfere with the test runner itself.`,
      },
      {
        mode: 'tool',
        title: 'Run it in CI',
        body: `Add a GitHub Actions workflow that runs \`uv sync\`, \`ruff check\`,
\`ruff format --check\` and \`pytest\`. Push a deliberately broken commit and watch it fail.

In Stage 3 you will add an eval gate to this same pipeline. Getting the pipeline existing
now means that is a small change later.`,
        answer: `\`\`\`yaml
# .github/workflows/ci.yml
name: ci
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: astral-sh/setup-uv@v6
      - run: uv sync --frozen
      - run: uv run ruff check .
      - run: uv run ruff format --check .
      - run: uv run pytest -q
\`\`\`

A deliberately broken commit should turn the check red on the pull request.

- **\`--frozen\`** fails the build if \`uv.lock\` is out of date with \`pyproject.toml\` — which is exactly what you want in CI.
- **\`uv sync\` installs the dev group by default**, so \`pytest\` and \`ruff\` are available.

Use the current major version of each action when you set this up.`,
      },
    ],
  },

  {
    id: 's1.4.t4',
    moduleId: 's1.4',
    title: 'Structured logging and not leaking secrets',
    outcome: 'Your logs are searchable, and your API keys are not in them.',
    minutes: 25,
    sources: [deck],
    animations: [],
    analogy: `You have probably used \`console.log\` in production and regretted it. Same
lesson, higher stakes — here a careless log line can contain a customer's document, a
user's question, or a key worth real money.`,
    notes: `## Log objects, not sentences

    # hard to search
    print(f"called {model} and it took {ms}ms costing {cost}")

    # searchable, filterable, aggregatable
    log.info("model_call", model=model, latency_ms=ms, cost_inr=cost,
             prompt_version="v3", tokens_in=1240, tokens_out=310)

The second version is one line of JSON. You can filter by model, sum the cost, chart the p95
latency, and find every call that used prompt version 3. The first version you can only read.

This matters more than usual in AI work, because the questions you will ask your logs are
quantitative: what did today cost, which endpoint is slow, did quality drop after that
prompt change.

---

## What to log on every model call

From the very first call you make in Stage 2:

    request id · model · prompt version · tokens in · tokens out
    cost · latency · time to first token · finish reason · error type

This is the raw material for the cost dashboard you build in Stage 5. Start logging it now
and that dashboard is a query rather than a retrofit.

---

## What never to log

- **API keys.** Use \`SecretStr\` so they cannot be printed by accident.
- **Whole prompts containing user data.** Log a hash, a length, and the prompt version.
- **Whole model responses.** Same reason.
- **Retrieved document text.** In Stage 3 your chunks are someone's private documents.

The realistic failure is not malice. It is \`log.info(f"request: {body}")\` during
debugging, which then ships. Once it is in your log store it is in backups, in your log
provider, and in whatever you pasted into a chat while asking for help.

---

## Correlation IDs

Give every request an id at the edge and attach it to every log line, every span, every
model call:

    log.info("retrieval", request_id=rid, chunks=5, recall_at_5=0.8)
    log.info("generation", request_id=rid, tokens_out=310)

When a user says "it gave me a wrong answer at 3pm", one id lets you pull the entire
journey — which chunks were retrieved, what prompt was built, what the model returned.
Without it you are guessing.

---

## Levels, used properly

    debug    local development only
    info     normal events worth counting — a model call, a retrieval
    warning  something recovered — a retry, a fallback, a cache miss storm
    error    something failed and a user noticed

If everything is \`info\`, nothing is. The discipline pays off when you set up alerts in
Stage 5.`,
    docs: [
      { label: 'structlog', url: 'https://www.structlog.org/' },
      { label: 'OWASP — logging cheat sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html' },
    ],
    glossary: [
      { term: 'structured logging', def: 'Logging key-value data, usually as JSON, instead of formatted sentences.' },
      { term: 'correlation ID', def: 'One id attached to every log line for a single request, so you can reconstruct its whole journey.' },
      { term: 'finish reason', def: 'Why a model stopped — finished, hit the token limit, called a tool, was filtered.' },
    ],
    check: [
      { q: 'Why log key-value data rather than sentences?', a: 'Because the questions you will ask are quantitative — total cost, p95 latency, which prompt version — and you cannot aggregate prose.' },
      { q: 'Name four things never to log.', a: 'API keys, full prompts with user data, full model responses, and retrieved document text.' },
      { q: 'What does a correlation ID buy you?', a: 'The ability to reconstruct one request end to end from a single id when a user reports a bad answer.' },
      { q: 'Why does logging cost and tokens from day one matter?', a: 'Your Stage 5 cost dashboard becomes a query over existing data rather than a retrofit.' },
    ],
    practice: [
      {
        mode: 'tool',
        title: 'Set up structured logging',
        body: `Configure \`structlog\` to output JSON. Log a fake model call with model, tokens,
cost, latency and a request id. Pipe the output through \`jq\` and filter by model name.

That filtering is the whole point — confirm it works before you have thousands of lines.`,
        answer: `\`\`\`python
import structlog

structlog.configure(processors=[
    structlog.contextvars.merge_contextvars,
    structlog.processors.add_log_level,
    structlog.processors.TimeStamper(fmt="iso"),
    structlog.processors.JSONRenderer(),
])
log = structlog.get_logger()

log.info("model_call", model="claude-haiku-4-5", tokens_in=1240, tokens_out=310,
         cost_inr=0.41, latency_ms=820, request_id="r-123")
\`\`\`

\`\`\`bash
uv run python app.py | jq 'select(.model == "claude-haiku-4-5")'
uv run python app.py | jq -s 'map(.cost_inr // 0) | add'     # total spend
\`\`\`

If \`jq\` shows parse errors, something is still printing plain text into the same stream — a stray \`print\`, or a library's own logger. Route everything through one logger.`,
      },
      {
        mode: 'read',
        title: 'Find the leak in each',
        body: `    log.info(f"prompt: {prompt}")
    log.debug("client", headers=request.headers)
    log.error(f"failed: {exc}", extra={"body": request_body})
    print(settings.model_dump())

Say what leaks in each case, and what you would log instead. The fourth one leaks
more than it looks like it should.`,
        answer: `1. **\`log.info(f"prompt: {prompt}")\`** — the full prompt, including user data, goes into your logs, and as unstructured text you cannot filter. Log \`prompt_version\`, token count and \`request_id\` instead.
2. **\`log.debug("client", headers=request.headers)\`** — \`Authorization\` headers, API keys and cookies. Log an allowlist, such as \`user-agent\`, or header *names* only.
3. **\`log.error(f"failed: {exc}", extra={"body": request_body})\`** — the whole request body: documents, personal data. The exception message may carry data too. Log the error *type*, \`request_id\` and route.
4. **\`print(settings.model_dump())\`** — every setting. \`SecretStr\` fields stay masked, but the database URL with its password is a plain string and prints in full, along with anything else not typed as a secret. That is the argument for making every secret a \`SecretStr\`: the one field typed that way is the one that didn't leak.`,
      },
      {
        mode: 'decision',
        title: 'What would you need at 3am?',
        body: `A user reports that your app gave a wrong answer about their insurance policy
yesterday at 3pm. You have their email and nothing else.

List exactly the log fields you would need to reconstruct what happened — without storing
the document text itself. Then check your current logging plan against that list. Whatever
is missing is what you add before Stage 3.`,
        answer: `Fields you would need, while storing **references rather than content**:

- \`request_id\`, \`user_id\` / \`tenant_id\`, timestamp, route
- the query's hash and length — or the query itself, if your retention policy allows it
- retrieval: \`chunk_id\`s, scores, \`doc_id\` and \`doc_version\` for each returned chunk
- \`prompt_version\`, model and parameters
- \`tokens_in\`, \`tokens_out\`, \`finish_reason\`, latency
- any fallback taken, any error type
- any feedback events on that response

Chunk ids plus document versions let you fetch the **exact** text the model saw, from the source store, without ever logging it. Add a way to go from the user's email to their \`request_id\`s, and "what happened at 3pm yesterday" becomes a query instead of a guess.`,
      },
    ],
  },
];
