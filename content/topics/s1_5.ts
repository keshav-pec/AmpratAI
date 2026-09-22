import type { Topic } from '@/lib/types';

const deck = { kind: 'deck' as const, label: 'Slides', reason: 'written for you, always current' };
const find = (label: string, query: string, channel: string, reason: string) =>
  ({ kind: 'find' as const, label, query, channel, reason });

export const s1_5: Topic[] = [
  {
    id: 's1.5.t1',
    moduleId: 's1.5',
    title: 'Routes, models and documentation you get for free',
    outcome: 'You can build a typed, validated, self-documenting API — and see why it is less code than Express.',
    minutes: 30,
    sources: [
      deck,
      find('Visual', 'fastapi tutorial build api', 'ArjanCodes', 'production-shaped, not a toy demo'),
    ],
    animations: [],
    analogy: `Express, with the validation, the docs and the types already done. The
\`app.get\` you know becomes \`@app.get\`, and the Zod schema you would have written becomes
the type annotation on the argument.`,
    notes: `## Side by side

Express:

    app.post('/search', (req, res) => {
      const { query, limit = 5 } = req.body
      if (!query) return res.status(400).json({ error: 'query required' })
      if (typeof limit !== 'number') return res.status(400).json({ error: 'bad limit' })
      res.json(search(query, limit))
    })

FastAPI:

    class SearchIn(BaseModel):
        query: str
        limit: int = Field(default=5, ge=1, le=50)

    @app.post("/search")
    async def search(body: SearchIn) -> list[Hit]:
        return do_search(body.query, body.limit)

The validation is gone because the model does it. A bad request gets a 422 with a precise
per-field error, automatically. The response type is checked too.

---

## And you get the docs

Start the server and open \`/docs\`. There is a full interactive API explorer, generated
from your models, that you can make real requests from. \`/openapi.json\` has the machine
readable version, which means you can generate a typed TypeScript client for your React app
from it.

That last part is worth pausing on: your React code can be type-safe against your Python API
with no manual work.

---

## Routers keep it organised

    # routers/chat.py
    router = APIRouter(prefix="/chat", tags=["chat"])

    @router.post("/stream")
    async def stream(body: ChatIn): ...

    # main.py
    app.include_router(chat.router)

Same idea as \`express.Router()\`.

---

## Status codes and errors

    from fastapi import HTTPException

    @app.get("/docs/{doc_id}")
    async def get_doc(doc_id: str) -> Doc:
        doc = await db.find(doc_id)
        if not doc:
            raise HTTPException(status_code=404, detail="document not found")
        return doc

You raise rather than return. That means an error deep in a helper function propagates
correctly without threading a response object through every layer — a real improvement on
the Express pattern.

---

## async def or def?

Write \`async def\` for handlers that await something, which is nearly all of yours.

If you write plain \`def\`, FastAPI runs it in a thread pool, so it does not block the loop —
which sounds safe, but it means a slow blocking handler quietly eats thread-pool capacity.
Prefer \`async def\` plus async libraries throughout.`,
    docs: [
      { label: 'FastAPI — first steps', url: 'https://fastapi.tiangolo.com/tutorial/first-steps/' },
      { label: 'FastAPI — request body', url: 'https://fastapi.tiangolo.com/tutorial/body/' },
    ],
    glossary: [
      { term: 'path operation', def: 'FastAPI\'s name for a route — one function attached to one method and path.' },
      { term: 'APIRouter', def: 'Groups related routes, like express.Router().' },
      { term: 'HTTPException', def: 'Raise it anywhere to produce an HTTP error response.' },
      { term: 'OpenAPI', def: 'The machine-readable API description FastAPI generates from your models.' },
      { term: '422', def: 'The status returned when a request body fails validation.' },
    ],
    check: [
      { q: 'Where did the validation code go?', a: 'Into the pydantic model. FastAPI validates the body against it and returns a 422 with per-field detail automatically.' },
      { q: 'What can you do with /openapi.json?', a: 'Generate a typed client for your React app, so the frontend is type-safe against the Python API with no manual work.' },
      { q: 'Why prefer async def over def for handlers?', a: 'A plain def runs in a thread pool; a slow blocking handler quietly eats that pool. Async all the way through avoids it.' },
    ],
    practice: [
      {
        mode: 'spec',
        title: 'Port one Express route',
        body: `Take one real route from an existing project of yours — ideally one with a body, a
query parameter and an error case.

Write the pydantic models first, by hand. Then have AI write the FastAPI handler. Compare
line counts with the original and note specifically which lines disappeared and why.`,
      },
      {
        mode: 'tool',
        title: 'Read your own generated docs',
        body: `Run the server, open \`/docs\`, and make a request from the page. Then send a
deliberately invalid body and read the 422 response carefully — it is the same structured
error shape from the pydantic module.

Finally, open \`/openapi.json\` and find your model in it.`,
      },
    ],
  },

  {
    id: 's1.5.t2',
    moduleId: 's1.5',
    title: 'Dependency injection — the concept Express does not have',
    outcome: 'You can share database sessions, clients, auth and per-request budgets without global variables.',
    minutes: 35,
    sources: [deck],
    animations: [],
    analogy: `Express middleware attaches things to \`req\` and hopes everyone downstream
knows they are there. FastAPI makes it explicit: a handler declares what it needs as an
argument, and the framework provides it. It is middleware with types and without the
implicit shared object.`,
    notes: `## The basic shape

    async def get_db() -> AsyncIterator[AsyncSession]:
        async with SessionLocal() as session:
            yield session

    @app.get("/docs")
    async def list_docs(db: AsyncSession = Depends(get_db)) -> list[Doc]:
        return await db.query(...)

The handler says "I need a database session". FastAPI calls \`get_db\`, passes the result
in, and — because of the \`yield\` — runs the cleanup after the response is sent. That is the
context manager pattern again, wired into the request lifecycle.

---

## Dependencies compose

    async def current_user(token: str = Depends(oauth2)) -> User: ...

    async def current_tenant(user: User = Depends(current_user)) -> Tenant: ...

    @app.get("/search")
    async def search(tenant: Tenant = Depends(current_tenant)): ...

Each layer declares what it needs. FastAPI resolves the chain. If the same dependency
appears twice in one request it is only computed once.

---

## Why this matters more in AI work than in a CRUD app

Three things you will want on every AI request, and dependencies are how you get them
cleanly:

**A per-request budget.**

    async def budget(tenant: Tenant = Depends(current_tenant)) -> Budget:
        b = await load_budget(tenant.id)
        if b.spent_today > b.daily_limit:
            raise HTTPException(429, "daily budget exhausted")
        return b

Now every endpoint that takes \`budget\` cannot run over the limit, and you did not remember
to check anywhere.

**The tenant filter.** In Stage 3 you will do retrieval that must never cross tenants. If
the tenant comes from a dependency rather than from the request body, a handler cannot
forget to apply it — and "forgot the tenant filter" is the most expensive bug in multi-tenant
AI products.

**Shared clients.** One model client, one HTTP client, created at startup, injected where
needed. Not a global, not one per request.

---

## Testing gets easier

    app.dependency_overrides[get_db] = lambda: fake_session

One line swaps the real database for a fake one in tests. No monkeypatching, no import
juggling. This is the practical payoff and it is significant.

---

## Route-level and app-level dependencies

When you do not need the value, only the check:

    @app.get("/admin", dependencies=[Depends(require_admin)])

Or apply one to everything:

    app = FastAPI(dependencies=[Depends(verify_api_key)])`,
    docs: [
      { label: 'FastAPI — dependencies', url: 'https://fastapi.tiangolo.com/tutorial/dependencies/' },
      { label: 'FastAPI — testing with overrides', url: 'https://fastapi.tiangolo.com/advanced/testing-dependencies/' },
    ],
    glossary: [
      { term: 'dependency', def: 'A function whose result FastAPI computes and passes into your handler.' },
      { term: 'Depends', def: 'Marks an argument as something the framework should provide.' },
      { term: 'dependency override', def: 'Swapping a dependency for a fake one, usually in tests.' },
      { term: 'yield dependency', def: 'A dependency that sets up, hands over a value, then cleans up after the response.' },
    ],
    check: [
      { q: 'How is this different from Express middleware?', a: 'The handler declares what it needs and receives it as a typed argument, instead of hoping something earlier attached it to req.' },
      { q: 'How does a dependency prevent the missing-tenant-filter bug?', a: 'The tenant comes from the dependency chain rather than the request, so a handler cannot forget to apply it.' },
      { q: 'What happens with the code after yield in a dependency?', a: 'It runs as cleanup after the response is sent.' },
      { q: 'What does dependency_overrides give you in tests?', a: 'A one-line swap of a real database or client for a fake, without monkeypatching.' },
    ],
    practice: [
      {
        mode: 'spec',
        title: 'Build a budget dependency',
        body: `Spec it: every request to a model endpoint must check that the caller is under
their daily rupee limit, record what the request costs afterwards, and reject with a clear
message when over.

Have AI implement it as a dependency. Then check the hard part: where does the *after* part
happen, given that you only know the cost once the call is finished? There is more than one
reasonable answer — pick one and say why.`,
      },
      {
        mode: 'read',
        title: 'Trace the resolution order',
        body: `Given \`search(tenant = Depends(current_tenant))\`, \`current_tenant(user =
Depends(current_user))\` and \`current_user(token = Depends(oauth2))\`:

What order do they run in? If \`current_user\` appears in two different dependencies for the
same request, how many times does it run? What happens to the chain if \`oauth2\` raises?`,
      },
      {
        mode: 'tool',
        title: 'Override one in a test',
        body: `Write a handler that depends on a database session. Write a test that overrides it
with a fake, and assert the handler works without a database running at all.

That test running with no database is the thing to notice.`,
      },
    ],
  },

  {
    id: 's1.5.t3',
    moduleId: 's1.5',
    title: 'Middleware, error handling and CORS',
    outcome: 'Every request is logged with a correlation id, every error returns a sensible shape, and your React app can actually call your API.',
    minutes: 25,
    sources: [deck],
    animations: [],
    analogy: `Express middleware, same position in the stack, slightly different syntax —
and CORS will bite you in exactly the same way it always has.`,
    notes: `## Middleware wraps every request

    @app.middleware("http")
    async def add_request_id(request: Request, call_next):
        rid = str(uuid.uuid4())
        request.state.request_id = rid
        start = time.perf_counter()

        response = await call_next(request)

        response.headers["X-Request-ID"] = rid
        log.info("request", request_id=rid, path=request.url.path,
                 status=response.status_code,
                 ms=round((time.perf_counter() - start) * 1000))
        return response

That is the correlation id from the logging topic, created once at the edge and available
everywhere downstream via \`request.state\`.

---

## Error handlers give errors one shape

    @app.exception_handler(ValidationError)
    async def on_validation_error(request: Request, exc: ValidationError):
        return JSONResponse(
            status_code=422,
            content={"error": "invalid_input", "detail": exc.errors(),
                     "request_id": request.state.request_id},
        )

One consistent error shape across the whole API means your React code writes one error
handler instead of five. Always include the request id — when a user reports a problem, that
id is how you find it.

---

## CORS

Your React app on port 3000 calling your API on port 8000 is a cross-origin request. Without
this you get the browser error you have seen a hundred times:

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000", "https://yourapp.com"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

**Do not use \`allow_origins=["*"]\` with \`allow_credentials=True\`.** The browser rejects
that combination anyway, and reaching for the wildcard to make an error go away is how
people end up with an API any website can call with the user's cookies.

---

## Lifespan: start and stop things once

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        app.state.http = httpx.AsyncClient(timeout=30)
        yield
        await app.state.http.aclose()

    app = FastAPI(lifespan=lifespan)

This is where your HTTP client, database pool and model client get created — once, at
startup — and closed cleanly on shutdown. Again: the context manager shape, now at
application scope.

---

## One warning about streaming

Middleware that reads or rewrites the response body will **break streaming**, because it
waits for the whole body before passing it on. Keep your logging middleware to headers and
status only. This is a real bug that is hard to diagnose, because everything looks correct
except the streaming.`,
    docs: [
      { label: 'FastAPI — middleware', url: 'https://fastapi.tiangolo.com/tutorial/middleware/' },
      { label: 'FastAPI — CORS', url: 'https://fastapi.tiangolo.com/tutorial/cors/' },
      { label: 'FastAPI — lifespan events', url: 'https://fastapi.tiangolo.com/advanced/events/' },
    ],
    glossary: [
      { term: 'middleware', def: 'Code that runs around every request and response.' },
      { term: 'request.state', def: 'A place to attach per-request data, like a correlation id.' },
      { term: 'exception handler', def: 'A function that converts a kind of exception into a consistent HTTP response.' },
      { term: 'CORS', def: 'The browser rule that stops one origin calling another unless the server allows it.' },
      { term: 'lifespan', def: 'Startup and shutdown hooks for the whole application.' },
    ],
    check: [
      { q: 'Where should the correlation id be created?', a: 'In middleware, at the edge, so every downstream log line and trace can carry it.' },
      { q: 'Why is allow_origins=["*"] with credentials wrong?', a: 'The browser rejects that combination, and wanting it usually means you are about to let any site call your API with the user\'s cookies.' },
      { q: 'What belongs in lifespan?', a: 'Things created once and closed cleanly: the HTTP client, the database pool, model clients.' },
      { q: 'How can middleware break streaming?', a: 'If it reads or rewrites the response body it waits for the whole body first, which turns a stream into a single late response.' },
    ],
    practice: [
      {
        mode: 'tool',
        title: 'Wire the request id through',
        body: `Add middleware that generates a request id, puts it on \`request.state\`, returns it
as a header, and includes it in a structured log line. Then log something from inside a
handler with the same id.

Make a request and confirm you can follow it through both log lines by the id alone.`,
      },
      {
        mode: 'break',
        title: 'Break streaming with middleware',
        body: `Add a streaming endpoint. Then add middleware that reads the response body. Watch
the stream stop being a stream. Remove it.

Ten minutes now saves an afternoon in Stage 2.`,
      },
      {
        mode: 'decision',
        title: 'Design your error shape',
        body: `Decide the single JSON shape every error from your API will use. It must cover:
validation failure, not found, rate limited, provider outage, and an unexpected crash.

Write it down. Then say which fields the React app actually branches on, and which are only
for you. Keeping those two sets separate is the difference between an error contract and a
dump.`,
      },
    ],
  },

  {
    id: 's1.5.t4',
    moduleId: 's1.5',
    title: 'Streaming responses with SSE',
    outcome: 'You can stream from a FastAPI endpoint to a browser — the exact pipe every AI chat interface needs.',
    minutes: 35,
    sources: [deck],
    animations: [],
    analogy: `\`res.write()\` in a loop, with a tiny text protocol on top and a built-in
browser client. You have done the React half before; this is the server half.`,
    notes: `## The endpoint

    from fastapi.responses import StreamingResponse

    @app.post("/chat")
    async def chat(body: ChatIn, request: Request):
        async def events():
            async for chunk in stream_model(body.prompt):
                if await request.is_disconnected():
                    break
                yield f"data: {json.dumps({'text': chunk})}\\n\\n"
            yield "data: [DONE]\\n\\n"

        return StreamingResponse(events(), media_type="text/event-stream")

Three things are load-bearing:

1. **The media type** must be \`text/event-stream\`
2. **Every message ends with a blank line** — that is \`\\n\\n\`. Miss it and the browser
   buffers forever while you debug the wrong thing.
3. **The disconnect check** stops work when the user goes away

---

## The browser side

    const res = await fetch('/chat', { method: 'POST', body: JSON.stringify({prompt}),
                                        signal: controller.signal })
    const reader = res.body.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      // split on \\n\\n, parse each "data: ..." line, append to state
    }

You use \`fetch\` with a reader rather than \`EventSource\`, because \`EventSource\` cannot
do POST and cannot set headers. \`controller.abort()\` is your stop button.

---

## Headers that save you an afternoon

    headers={
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",       # tells nginx not to buffer
    }

That last one is the difference between streaming working locally and not working behind a
proxy in production. Set it now.

---

## Errors after you have already started

You sent a 200 and half an answer. You cannot change the status now. So send the error as an
event:

    yield f"data: {json.dumps({'error': 'provider timeout'})}\\n\\n"

Your React code checks each event for an \`error\` key and renders it inline. Design this in
from the beginning — retrofitting it means touching both sides.

---

## Heartbeats

If the model thinks for thirty seconds before producing anything, some proxies close an idle
connection. Send a comment line periodically to keep it alive:

    yield ": keep-alive\\n\\n"

Lines starting with a colon are comments. The browser ignores them; the proxy sees traffic.

---

## What you are actually building toward

In Stage 2 this endpoint calls a real model, tracks tokens and cost per message, and shows
a live rupee counter in the interface. The pipe you build here does not change. Getting it
right now means that stage is about the model, not about plumbing.`,
    docs: [
      { label: 'FastAPI — streaming responses', url: 'https://fastapi.tiangolo.com/advanced/custom-response/#streamingresponse' },
      { label: 'MDN — using Server-Sent Events', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events' },
    ],
    glossary: [
      { term: 'StreamingResponse', def: 'A FastAPI response that sends an async generator\'s output as it is produced.' },
      { term: 'text/event-stream', def: 'The media type that tells the browser this is Server-Sent Events.' },
      { term: 'X-Accel-Buffering', def: 'A header telling nginx not to buffer the response.' },
      { term: 'heartbeat', def: 'A periodic comment line that keeps an idle connection open.' },
      { term: 'is_disconnected', def: 'A check that tells you the client has gone away, so you can stop working.' },
    ],
    check: [
      { q: 'What are the three things that must be right for SSE to work?', a: 'The media type, the blank line after every message, and not buffering the response anywhere in between.' },
      { q: 'Why fetch with a reader rather than EventSource?', a: 'EventSource cannot do POST or set headers, and you need both.' },
      { q: 'How do you report an error halfway through a stream?', a: 'As an event inside the stream, because the 200 has already been sent.' },
      { q: 'What is a heartbeat for?', a: 'Keeping a connection alive through proxies while the model is still thinking and producing nothing.' },
    ],
    practice: [
      {
        mode: 'spec',
        title: 'Build the pipe with no model in it',
        body: `Spec and build: an endpoint that streams the numbers 1 to 20, one every 300ms, and a
minimal HTML page that appends them as they arrive.

Then add: a stop button that aborts the fetch, a server-side disconnect check that logs when
it fires, and an error injected at number 12 that the page renders inline.

When you plug a model into this in Stage 2, one line changes.`,
      },
      {
        mode: 'break',
        title: 'Break it three ways',
        body: `One at a time, then undo each:
1. Remove the blank line after \`data:\`
2. Change the media type to \`application/json\`
3. Remove the disconnect check, close the page mid-stream, and watch the server keep working

The third one is the one that costs money in Stage 2.`,
      },
    ],
  },

  {
    id: 's1.5.t5',
    moduleId: 's1.5',
    title: 'Auth: API keys and JWT',
    outcome: 'You can protect endpoints, and you know exactly where a model provider key may and may not go.',
    minutes: 25,
    sources: [deck],
    animations: [],
    analogy: `You have done JWT in Express. The mechanics transfer directly. The new part is
a rule specific to AI apps, and getting it wrong is expensive in a very literal sense.`,
    notes: `## API key auth, as a dependency

    from fastapi.security import APIKeyHeader

    api_key_header = APIKeyHeader(name="X-API-Key")

    async def require_key(key: str = Depends(api_key_header)) -> str:
        if not secrets.compare_digest(key, settings.api_key.get_secret_value()):
            raise HTTPException(401, "invalid api key")
        return key

    @app.post("/chat", dependencies=[Depends(require_key)])
    async def chat(...): ...

Note \`compare_digest\` rather than \`==\`. It compares in constant time, so an attacker
cannot learn the key one character at a time from response timing. Small detail, standard
practice.

---

## JWT, the same as you know it

    payload = jwt.decode(token, settings.jwt_secret, algorithms=["HS256"])

Everything you know applies: short expiry, verify the signature, never trust a claim you did
not sign. The library is different, the thinking is identical.

---

## The rule that is specific to AI apps

**Your model provider key never leaves your server. Ever.**

Not in the React bundle. Not in a \`NEXT_PUBLIC_\` variable. Not in a header your frontend
sets. Not "just for the demo".

Anyone who opens the network tab can take it and spend your money — and unlike a leaked
database read-only key, this one has a direct rupee cost with no ceiling until you notice.

The shape is always:

    browser  ->  your API (your auth)  ->  provider (your key, server side only)

The browser authenticates to *you*. You authenticate to the provider. Two separate things.

---

## Per-user limits belong here too

Once requests are identified, you can enforce what matters:

- requests per minute, per user
- rupees per day, per user
- which models a given user may reach

This is the dependency from the previous topic, made real. In Stage 5 it becomes proper
multi-tenant isolation; for now, even a single-user app benefits from a daily spend cap —
one runaway loop while testing an agent can cost more than you expect.

---

## Minimum viable safety for a personal project

Even for something only you use:

1. One API key, checked with \`compare_digest\`
2. A daily rupee cap that returns 429 when exceeded
3. Rate limit by IP
4. Provider key server-side only

Four things. An afternoon. They protect a public demo from becoming someone else's free
model access.`,
    docs: [
      { label: 'FastAPI — security', url: 'https://fastapi.tiangolo.com/tutorial/security/' },
      { label: 'OWASP — API security top 10', url: 'https://owasp.org/API-Security/editions/2023/en/0x11-t10/' },
    ],
    glossary: [
      { term: 'compare_digest', def: 'A constant-time string comparison, so timing cannot leak the secret.' },
      { term: 'JWT', def: 'A signed token carrying claims about the user.' },
      { term: 'provider key', def: 'Your model API key. Server-side only, always.' },
      { term: 'spend cap', def: 'A hard limit on money per period, enforced before the call is made.' },
    ],
    check: [
      { q: 'Why compare_digest instead of ==?', a: 'It compares in constant time, so response timing cannot reveal the key character by character.' },
      { q: 'Where may a model provider key appear?', a: 'Only on your server. Never in the bundle, never in an environment variable exposed to the browser, never in a header the frontend sets.' },
      { q: 'What are the two separate authentications in an AI app?', a: 'The browser authenticates to your API; your API authenticates to the provider. They are unrelated credentials.' },
      { q: 'Why does even a personal project need a spend cap?', a: 'One runaway agent loop can spend a lot before you notice, and a public demo with no cap is free model access for anyone who finds it.' },
    ],
    practice: [
      {
        mode: 'tool',
        title: 'Protect an endpoint properly',
        body: `Add API key auth to an endpoint using a dependency and \`compare_digest\`. Confirm
that a missing key gives 401 and a wrong key gives 401 with the same message and timing.

Then add a simple in-memory daily spend counter that returns 429 past a limit you set, and
test that it trips.`,
      },
      {
        mode: 'read',
        title: 'Which of these leaks the key?',
        body: `    NEXT_PUBLIC_ANTHROPIC_API_KEY=sk-ant-...
    fetch('https://api.anthropic.com/v1/messages', { headers: { 'x-api-key': key } })
    const res = await fetch('/api/chat', { body: JSON.stringify({ prompt }) })
    app.get('/config', () => ({ model: settings.model, key: settings.api_key }))

Two of these are fine and two are not. Say which, and what an attacker does with each.`,
      },
    ],
  },

  {
    id: 's1.5.t6',
    moduleId: 's1.5',
    title: 'Testing a FastAPI app',
    outcome: 'You can test your whole API — including streaming and failure paths — without a running server or a real provider.',
    minutes: 25,
    sources: [deck],
    animations: [],
    analogy: `Supertest, with dependency injection making the fakes much easier to install.`,
    notes: `## The client

    import httpx
    from httpx import ASGITransport

    async def test_health():
        transport = ASGITransport(app=app)
        async with httpx.AsyncClient(transport=transport, base_url="http://test") as c:
            r = await c.get("/health")
            assert r.status_code == 200

No server runs. Requests go straight into the app object. Tests are fast enough to run on
save.

---

## Replace the real things

    app.dependency_overrides[get_db] = lambda: fake_session
    app.dependency_overrides[get_model_client] = lambda: FakeModel()

This is the payoff from the dependency module. Your fake model client returns a canned
answer instantly, so your API tests cost nothing and never flake.

Clear the overrides between tests, or one test's fake leaks into the next.

---

## Test the failures, not just the happy path

The happy path rarely breaks. These do:

    422   body missing a required field
    401   no API key
    429   over the spend cap
    404   unknown id
    500   provider raised — does your handler turn it into something sensible?
          provider timed out — does the request end, or hang?
          provider returned malformed JSON — is that a 500 or a clean error?

That last group is where AI APIs actually fail, and where a generated test suite usually
has nothing.

---

## Testing a stream

    async with c.stream("POST", "/chat", json={"prompt": "hi"}) as r:
        chunks = [line async for line in r.aiter_lines()]

    assert any("data:" in c for c in chunks)
    assert chunks[-2] == "data: [DONE]"

Worth asserting: that more than one chunk arrived (proving it actually streamed rather than
arriving in one lump), and that the done event is present.

---

## What good coverage looks like here

Not a percentage. A list:

- every endpoint, happy path
- every validation rule you care about
- every error branch you wrote
- the streaming endpoint, including a mid-stream error
- your retry logic, with a faked 429`,
    docs: [
      { label: 'FastAPI — testing', url: 'https://fastapi.tiangolo.com/tutorial/testing/' },
      { label: 'httpx — ASGI transport', url: 'https://www.python-httpx.org/async/#calling-into-python-web-apps' },
    ],
    glossary: [
      { term: 'ASGITransport', def: 'Lets httpx call your app directly, with no network and no server.' },
      { term: 'dependency_overrides', def: 'Swaps a dependency for a fake, per test.' },
      { term: 'aiter_lines', def: 'Iterates a streaming response line by line.' },
    ],
    check: [
      { q: 'Why does ASGITransport make tests fast?', a: 'No server and no network — requests go straight into the app object.' },
      { q: 'What must you remember between tests that use overrides?', a: 'Clear them, or one test\'s fake leaks into the next.' },
      { q: 'What proves an endpoint actually streamed?', a: 'That more than one chunk arrived, rather than the whole body appearing at once.' },
      { q: 'Which failure paths matter most in an AI API?', a: 'Provider error, provider timeout, and malformed provider output — the three that generated test suites usually skip.' },
    ],
    practice: [
      {
        mode: 'spec',
        title: 'Test the failure paths',
        body: `For one endpoint that calls a model, spec the expected behaviour for: a 429 from the
provider, a timeout, malformed JSON in the response, and a body missing a required field.

Have AI write the tests with faked responses. Then review each one and ask: is it asserting
the behaviour I specified, or just that nothing threw? Rewrite the weak ones.`,
      },
      {
        mode: 'tool',
        title: 'Test the stream',
        body: `Write a test for your streaming endpoint that asserts multiple chunks arrived, the
done event is present, and a mid-stream error is delivered as an event rather than a
connection drop.`,
      },
    ],
  },
];
