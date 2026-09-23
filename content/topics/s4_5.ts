import type { Topic } from '@/lib/types';

export const s4_5: Topic[] = [
  {
    id: 's4.5.t1',
    moduleId: 's4.5',
    title: 'LangGraph: state, nodes and edges',
    outcome: `You can rebuild your hand-written agent as a LangGraph graph — typed state, node functions, conditional edges — and map every part back to the loop you already wrote.`,
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
        query: 'LangGraph tutorial state nodes edges agent',
        channel: 'LangChain',
        reason: 'the official introduction to building with LangGraph',
      },
    ],
    animations: ['anim-langgraph-state'],
    analogy: `React components with state. Each component is a function; state flows in, updates flow
out; the framework decides when to re-run what. LangGraph does this for agent steps: each
node is a function over shared state, and edges decide which runs next.`,
    notes: `## Why a framework now

You've written the loop by hand, so you know what it does. LangGraph gives you, ready-made,
the parts that took effort:

- **persistence** after every step (topic 2)
- **interrupts** for human approval (topic 3)
- **streaming** of steps and tokens (topic 4)
- an explicit **graph** you can draw, test and extend

In exchange, you learn its model: **state**, **nodes**, **edges**.

---

## State

\`\`\`python
from typing import Annotated, TypedDict
from langgraph.graph.message import add_messages

class State(TypedDict):
    messages: Annotated[list, add_messages]   # reducer: append, don't replace
    ticket_id: str
\`\`\`

Nodes return **partial updates**. The reducer decides how an update merges: \`add_messages\`
appends new messages; a plain field is overwritten.

---

## Nodes and edges

\`\`\`python
from langchain_anthropic import ChatAnthropic
from langgraph.graph import StateGraph, START, END
from langgraph.prebuilt import ToolNode, tools_condition

llm = ChatAnthropic(model="claude-sonnet-5").bind_tools(TOOLS)

def agent(state: State):
    return {"messages": [llm.invoke(state["messages"])]}

builder = StateGraph(State)
builder.add_node("agent", agent)
builder.add_node("tools", ToolNode(TOOLS))
builder.add_edge(START, "agent")
builder.add_conditional_edges("agent", tools_condition)   # -> "tools" or END
builder.add_edge("tools", "agent")
graph = builder.compile()

graph.invoke({"messages": [("user", "Where is ORD-10492?")], "ticket_id": "T-88"})
\`\`\`

---

## Map it to your loop

| Your loop | LangGraph |
|---|---|
| \`messages\` list | \`State["messages"]\` with \`add_messages\` |
| call the model | the \`agent\` node |
| \`if stop_reason == "tool_use"\` | \`tools_condition\` (a conditional edge) |
| run tools, append results | the \`tools\` node (\`ToolNode\`) |
| \`for step in range(max_steps)\` | \`recursion_limit\` in the run config |

Same loop, drawn as a graph.

---

## Beyond the loop

The graph earns its keep when the flow has **structure**: a \`check_eligibility\` node that
always runs before \`propose_refund\`; an \`approve\` node that pauses; a \`draft_reply\` chain at
the end. Code-defined steps around a model-driven core — the mix p-4.1 needs.

LangGraph doesn't require LangChain models: a node can call the Anthropic SDK directly.
The prebuilt pieces (\`ToolNode\`, \`tools_condition\`) just save typing.`,
    docs: [
      {
        label: 'LangGraph documentation',
        url: 'https://langchain-ai.github.io/langgraph/',
      },
      {
        label: 'LangGraph — graph API concepts',
        url: 'https://langchain-ai.github.io/langgraph/concepts/low_level/',
      },
    ],
    glossary: [
      {
        term: 'StateGraph',
        def: 'LangGraph\'s graph builder, parameterised by a typed state.',
      },
      {
        term: 'reducer',
        def: 'A function that decides how a node\'s update merges into existing state.',
      },
      {
        term: 'conditional edge',
        def: 'An edge that chooses the next node from the current state.',
      },
      {
        term: 'ToolNode',
        def: 'A prebuilt LangGraph node that runs the tool calls in the last message.',
      },
    ],
    check: [
      {
        q: 'What does the `add_messages` reducer do?',
        a: `Merges a node's returned messages into state by appending (and updating by id) instead of overwriting the list.`,
      },
      {
        q: 'Which part of LangGraph replaces `if stop_reason == \'tool_use\'`?',
        a: `A conditional edge — tools_condition routes to the tools node if the last message has tool calls, otherwise to END.`,
      },
      {
        q: 'What limits the number of steps in a LangGraph run?',
        a: 'The recursion_limit in the run\'s config.',
      },
      {
        q: 'Do LangGraph nodes have to use LangChain model classes?',
        a: 'No — a node is a plain function and can call any SDK, such as the Anthropic SDK directly.',
      },
    ],
    practice: [
      {
        mode: 'tool',
        title: 'Port your agent',
        body: `Rebuild your hand-written support agent (two tools) as a LangGraph graph. Run the same
three tasks as before and compare the traces step by step. Then add an explicit
\`check_eligibility\` node that always runs before any refund proposal.`,
        answer: `What you should see:

- The same tool calls in the same order for the same tasks (allowing for normal model
  variation) — proof the graph is your loop.
- LangGraph's messages are LangChain message objects (\`AIMessage\`, \`ToolMessage\`), not
  Anthropic dicts — the adapter layer the framework adds.

For the explicit node: route from the agent to \`check_eligibility\` when the model
proposes a refund (a conditional edge on a structured "intent" field, or on a
\`propose_refund\` tool call), and from there to the refund step only if eligible. Now
"eligibility is always checked first" is a property of the **graph**, not a hope about
the prompt — the core argument for graph-shaped agents.`,
      },
      {
        mode: 'read',
        title: 'Predict the state',
        body: `\`\`\`python
class State(TypedDict):
    messages: Annotated[list, add_messages]
    attempts: int

def agent(state):  return {"messages": [ai_msg], "attempts": state["attempts"] + 1}
def tools(state):  return {"messages": [tool_msg]}
\`\`\`

Starting from \`{"messages": [user_msg], "attempts": 0}\`, the graph runs agent → tools →
agent → END. What is the final state?`,
        answer: `- \`messages\`: \`[user_msg, ai_msg, tool_msg, ai_msg]\` — four messages. \`add_messages\`
  appends each node's returned list.
- \`attempts\`: **2** — a plain field is overwritten by each update; the agent node ran
  twice (0 → 1 → 2), and the tools node didn't touch it.

The rule to remember: annotated fields merge through their reducer; plain fields take
the last value written. Forgetting the reducer on \`messages\` is a classic bug — each
node would *replace* the history with its one new message.`,
      },
    ],
  },
  {
    id: 's4.5.t2',
    moduleId: 's4.5',
    title: 'Checkpointing with Postgres',
    outcome: `You can persist every step of a LangGraph run in Postgres, resume a thread after a crash, and inspect or replay its history.`,
    minutes: 35,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
    ],
    animations: [],
    analogy: `Autosave in a game. After every level, the game writes your progress; if the power cuts,
you continue from the last save, not from level one. A checkpointer is autosave for agent
runs.`,
    notes: `## What a checkpointer does

After every step, LangGraph saves the full state — messages, fields, which node runs next —
keyed by a **thread ID**. With a checkpointer:

- a run can **resume** after a crash or restart
- a conversation can **continue** days later on the same thread
- you can **inspect** any past step, and even replay from it

It's the event table you built by hand in Module 3, done for you.

---

## Postgres setup

\`\`\`python
from langgraph.checkpoint.postgres import PostgresSaver

with PostgresSaver.from_conn_string(DB_URI) as checkpointer:
    checkpointer.setup()                        # creates its tables (once)
    graph = builder.compile(checkpointer=checkpointer)

    config = {"configurable": {"thread_id": "ticket-T-88"}}
    graph.invoke({"messages": [("user", "Where is ORD-10492?")]}, config)
\`\`\`

For FastAPI, use \`AsyncPostgresSaver\` from \`langgraph.checkpoint.postgres.aio\`. It lives in
the \`langgraph-checkpoint-postgres\` package.

---

## Threads and resuming

- **One thread per ticket** (or per conversation). The thread ID is your key.
- **Resume after a crash:** invoke again with \`None\` as input and the same thread — it
  continues from the last saved step.
- **Continue a conversation:** invoke with a new user message on the same thread; the saved
  messages are already there.

---

## Looking back

\`\`\`python
state = graph.get_state(config)                  # the latest checkpoint
for snap in graph.get_state_history(config):     # newest first
    print(snap.config["configurable"]["checkpoint_id"], snap.next)
\`\`\`

You can re-run from an earlier checkpoint (pass its \`checkpoint_id\` in the config) —
useful for debugging "what if the tool had returned something else?"

---

## What checkpointing doesn't do

- It doesn't make **tool side effects** safe to replay. If a step crashed after the payment
  API call but before the checkpoint, the step re-runs. Idempotency keys (Module 3) are
  still your job.
- It stores **everything** in state — including personal data in messages. Apply the same
  retention and access rules as any customer data.`,
    docs: [
      {
        label: 'LangGraph — persistence',
        url: 'https://langchain-ai.github.io/langgraph/concepts/persistence/',
      },
      {
        label: 'langgraph-checkpoint-postgres on PyPI',
        url: 'https://pypi.org/project/langgraph-checkpoint-postgres/',
      },
    ],
    glossary: [
      {
        term: 'checkpointer',
        def: 'A LangGraph component that saves the full state after every step.',
      },
      {
        term: 'thread',
        def: 'A persisted run or conversation, identified by a thread ID.',
      },
      {
        term: 'super-step',
        def: 'One round of node execution in LangGraph, after which state is checkpointed.',
      },
      {
        term: 'time travel',
        def: 'Inspecting or re-running a graph from an earlier checkpoint.',
      },
    ],
    check: [
      {
        q: 'What key identifies a persisted conversation or run in LangGraph?',
        a: 'The thread_id in the run config.',
      },
      {
        q: 'How do you resume a crashed run?',
        a: `Invoke the graph again with None as input and the same thread_id; it continues from the last checkpoint.`,
      },
      {
        q: 'Does checkpointing make tool calls safe to replay?',
        a: `No — a step that crashed after an external call re-runs, so side-effecting tools still need idempotency keys.`,
      },
    ],
    practice: [
      {
        mode: 'tool',
        title: 'Crash and resume',
        body: `Add \`PostgresSaver\` to your graph. Start a run that needs three tool steps, and kill the
process during the second. Restart and resume with \`invoke(None, config)\`. Then print
the thread's history with \`get_state_history\`.`,
        answer: `Expected: the resumed run continues from the last completed step and finishes; the
history shows one checkpoint per super-step, newest first, each with \`next\` naming the
node that would run after it.

Look at the tables \`setup()\` created (checkpoints and their writes) — the saved state is
serialised, and it includes every message. That's why the retention point matters.

Then compare with your hand-built event log: LangGraph saved more (full state per step)
with less code; your version stored exactly what you chose, in a shape your dashboard
can query directly. p-4.1's README should say which you'd pick for production, and why.`,
      },
      {
        mode: 'decision',
        title: 'Thread design',
        body: `Choose the thread ID scheme for each:

1. Each support ticket is handled by one agent run, possibly over two days.
2. A customer chats with the assistant on the website, on and off, across a week.
3. A nightly batch job runs the agent over 500 tickets.`,
        answer: `1. **\`ticket-{ticket_id}\`** — one thread per ticket; approvals and resumes attach to it.
2. **\`chat-{customer_id}-{conversation_id}\`** — a new conversation ID when the customer
   starts over, so old context doesn't leak into unrelated chats (and old threads can
   expire under a retention policy).
3. **\`batch-{date}-{ticket_id}\`** — one thread per item, so one failure doesn't affect
   the others and each can resume independently.

Never share one thread across different customers — state includes their messages.`,
      },
    ],
  },
  {
    id: 's4.5.t3',
    moduleId: 's4.5',
    title: 'Interrupts: pausing for a person',
    outcome: `You can pause a LangGraph run for human approval with interrupt(), resume it with the decision, and avoid the re-execution trap that catches most people.`,
    minutes: 35,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
    ],
    animations: ['anim-human-in-loop'],
    analogy: `A form that says "Submitted — waiting for manager approval". The process doesn't hold a
thread open for hours; it saves where it is, and continues when the manager clicks. That's
an interrupt.`,
    notes: `## interrupt() and Command(resume=...)

\`\`\`python
from langgraph.types import interrupt, Command

def approve_refund(state: State):
    proposal = state["proposed_refund"]
    decision = interrupt({                      # pauses the run right here
        "action": "refund",
        "order_id": proposal["order_id"],
        "amount_inr": proposal["amount_inr"],
    })
    if decision["approved"]:
        return {"refund_status": "approved",
                "amount_inr": decision.get("amount_inr", proposal["amount_inr"])}
    return {"refund_status": "rejected"}
\`\`\`

The run stops; the payload you passed to \`interrupt()\` comes back to the caller (under
\`__interrupt__\`) for your UI to show. Later:

\`\`\`python
graph.invoke(Command(resume={"approved": True}), config)   # same thread_id
\`\`\`

Interrupts need a checkpointer — the pause is a saved state.

---

## The re-execution trap

On resume, LangGraph **re-runs the node from its beginning**; \`interrupt()\` then returns the
resume value instead of pausing. So anything **before** \`interrupt()\` in that node runs
twice.

\`\`\`python
def bad(state):
    send_email_to_manager(...)       # runs again on resume: two emails
    decision = interrupt({...})
\`\`\`

Rules: keep the node that interrupts small; put side effects **after** the interrupt, in
the next node, or make them idempotent.

---

## Where to put the gate

- A dedicated **approval node** between "propose" and "execute" makes the gate visible in
  the graph — and impossible to route around.
- Or interrupt **inside a tool** for tool-level approval.

Either way, the executed action uses the **decision's** values (possibly edited by the
person), validated again.

---

## Beyond approve/reject

The same mechanism handles:

- **edits** — the person changes the amount before approving
- **clarifying questions** — interrupt with a question, resume with the answer
- **review of a draft** — pause before sending a reply, resume with the edited text`,
    docs: [
      {
        label: 'LangGraph — human-in-the-loop and interrupts',
        url: 'https://langchain-ai.github.io/langgraph/concepts/human_in_the_loop/',
      },
    ],
    glossary: [
      {
        term: 'interrupt',
        def: 'A LangGraph call that pauses a run and returns a payload to the caller.',
      },
      {
        term: 'Command(resume=...)',
        def: 'How you continue an interrupted run, passing the person\'s decision.',
      },
      {
        term: 're-execution',
        def: 'On resume, the interrupted node runs again from its start.',
      },
    ],
    check: [
      {
        q: 'What do you pass to resume an interrupted run?',
        a: 'Command(resume=<value>) with the same thread_id; the value becomes interrupt()\'s return value.',
      },
      {
        q: 'Why do interrupts require a checkpointer?',
        a: `A pause is a saved state: the run must be stored so it can continue later, possibly in another process.`,
      },
      {
        q: 'What\'s the re-execution trap?',
        a: `On resume the interrupting node re-runs from the start, so code before interrupt() — like sending an email — executes twice.`,
      },
      {
        q: 'Why use a dedicated approval node?',
        a: 'It makes the gate an explicit, unavoidable part of the graph between proposing and executing.',
      },
    ],
    practice: [
      {
        mode: 'tool',
        title: 'Add the approval node to p-4.1',
        body: `Add \`propose_refund → approve_refund → execute_refund\` to your graph, with \`interrupt()\`
in \`approve_refund\`. Build a tiny FastAPI endpoint that lists pending interrupts and
accepts a decision. Test: approve, edit-and-approve, reject — and restart the server
between pausing and deciding.`,
        answer: `Checks that show it's right:

- **Pause:** after the first \`invoke\`, the result contains \`__interrupt__\` with your
  payload; the run's state shows \`approve_refund\` as next.
- **Restart:** stop the server, start it again, list pending approvals — the refund is
  still there (it lives in Postgres).
- **Approve / edit / reject:** \`execute_refund\` runs only on approve, with the edited
  amount if given (re-validated against the policy cap); on reject, the graph routes to
  drafting a "not eligible" reply.
- **Trap check:** put a counter or log line before \`interrupt()\` and confirm it runs twice
  across pause and resume — then make sure nothing with side effects sits there.

Record the flow as a short screen capture for the README: pending → restart → approve →
refund executed once.`,
      },
      {
        mode: 'read',
        title: 'Spot the bug',
        body: `\`\`\`python
def approve_refund(state):
    approval_id = db.insert_pending_approval(state["proposed_refund"])
    notify_slack(f"Refund needs approval: {approval_id}")
    decision = interrupt({"approval_id": approval_id})
    return {"refund_status": "approved" if decision["approved"] else "rejected"}
\`\`\`

What happens on resume, and how do you fix it?`,
        answer: `On resume the node re-runs from the top: a **second pending-approval row** is inserted
and a **second Slack message** is sent, before \`interrupt()\` returns the decision. The
decision then applies to the new row's ID, and the first row stays pending forever.

Fixes:

- Move the insert and notification into a **previous node** (\`request_approval\`), so the
  interrupting node contains only \`interrupt()\` and the result handling.
- Or make them idempotent: an insert keyed by \`(thread_id, proposal hash)\` with
  \`ON CONFLICT DO NOTHING\`, and a notification sent only if the row was newly created.`,
      },
    ],
  },
  {
    id: 's4.5.t4',
    moduleId: 's4.5',
    title: 'Streaming, and the framework landscape',
    outcome: `You can stream a graph's steps and tokens to a UI, and place the other agent frameworks in one sentence each — then write the hand-written-vs-LangGraph comparison for p-4.1.`,
    minutes: 30,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
    ],
    animations: [],
    analogy: `A food-delivery app shows "order accepted → being prepared → out for delivery" as it
happens, instead of a spinner and then "delivered". Streaming an agent shows its steps as
they happen — which is what makes a slow agent feel trustworthy rather than broken.`,
    notes: `## Stream modes

\`\`\`python
for mode, chunk in graph.stream(inputs, config, stream_mode=["updates", "messages"]):
    if mode == "updates":
        print("step:", chunk)          # which node ran, and what it changed
    else:
        token, meta = chunk
        print(token.content, end="")   # model tokens as they're generated
\`\`\`

| Mode | Gives you |
|---|---|
| \`values\` | the full state after each step |
| \`updates\` | only what each node changed |
| \`messages\` | model tokens as they arrive |
| \`custom\` | your own events, sent from inside nodes |

For p-4.1's dashboard: \`updates\` drives the tool timeline; \`messages\` drives live text.
Send both over server-sent events from FastAPI (Stage 2's streaming, again).

---

## The landscape, one line each

- **LangGraph** — low-level graphs with persistence, interrupts and streaming. What you're
  learning.
- **LangChain's agent helpers** — prebuilt agents built on LangGraph; less code, less
  control.
- **Claude Agent SDK** — the harness behind Claude Code as a library: built-in file, shell
  and web tools, subagents, MCP.
- **Anthropic Managed Agents** — Anthropic runs the loop and hosts a sandbox for tools;
  you configure the agent.
- **OpenAI Agents SDK** — agents, hand-offs between agents, guardrails and tracing.
- **Pydantic AI** — typed, Pydantic-first agents.
- **CrewAI** — role-based multi-agent teams.
- **Google's ADK** and **Microsoft's Agent Framework** — each ecosystem's own toolkit.
- **Temporal / DBOS** — durable execution for any code, agents included.

These change fast. What transfers is the loop, tools, state, persistence and approval —
which you now understand underneath all of them.

---

## Hand-written vs LangGraph: the p-4.1 comparison

Write it honestly, from your own two implementations:

| | Hand-written | LangGraph |
|---|---|---|
| Lines of code | | |
| Persistence and resume | you built it | checkpointer |
| Approval | your events + worker | \`interrupt()\` |
| Streaming | your SSE | stream modes |
| Debugging | your logs | state history |
| Lock-in and upgrades | none | framework versions |

A thoughtful table here is one of the strongest signals in the whole portfolio — it shows
you understand what frameworks do, rather than only how to call them.`,
    docs: [
      {
        label: 'LangGraph — streaming',
        url: 'https://langchain-ai.github.io/langgraph/concepts/streaming/',
      },
      {
        label: 'Claude Agent SDK overview',
        url: 'https://code.claude.com/docs/en/agent-sdk/overview',
      },
      {
        label: 'OpenAI Agents SDK',
        url: 'https://openai.github.io/openai-agents-python/',
      },
    ],
    glossary: [
      {
        term: 'stream mode',
        def: 'What LangGraph streams: full state, per-node updates, model tokens or custom events.',
      },
      {
        term: 'server-sent events',
        def: 'A simple HTTP streaming format for sending events from server to browser.',
      },
      {
        term: 'agent framework',
        def: 'A library that provides the agent loop and its surrounding machinery.',
      },
    ],
    check: [
      {
        q: 'Which stream modes would you use for a tool timeline and live text?',
        a: 'updates for the per-node timeline and messages for model tokens.',
      },
      {
        q: 'What\'s the difference between the values and updates modes?',
        a: 'values sends the full state after each step; updates sends only what each node changed.',
      },
      {
        q: 'What transfers between agent frameworks?',
        a: 'The underlying ideas — the loop, tools, state, persistence, approval and streaming.',
      },
    ],
    practice: [
      {
        mode: 'tool',
        title: 'Stream to the dashboard',
        body: `Add a FastAPI endpoint that runs your graph and streams both \`updates\` and \`messages\`
as server-sent events, each tagged with its type. Build a minimal page that shows a
tool timeline and the live reply.`,
        answer: `Shape of the endpoint:

\`\`\`python
@app.get("/runs/{thread_id}/stream")
async def stream(thread_id: str):
    config = {"configurable": {"thread_id": thread_id}}
    async def events():
        async for mode, chunk in graph.astream(None, config,
                                               stream_mode=["updates", "messages"]):
            if mode == "updates":
                yield f"event: step\\ndata: {json.dumps(summarise(chunk))}\\n\\n"
            else:
                token, _ = chunk
                if token.content:
                    yield f"event: token\\ndata: {json.dumps(text_of(token))}\\n\\n"
    return StreamingResponse(events(), media_type="text/event-stream")
\`\`\`

\`summarise\` turns a node update into a small, safe record (node name, tool names and
arguments, sizes — not raw personal data). \`text_of\` extracts text, since Claude
messages can carry content as a list of blocks. On the page, \`EventSource\` listens for
\`step\` and \`token\` events. This becomes the live half of p-4.1's dashboard.`,
      },
      {
        mode: 'decision',
        title: 'Which framework for which team?',
        body: `1. A startup building a customer-facing agent that needs approvals and must survive
   deploys.
2. A team that wants a coding/filesystem agent running on their own servers, fast.
3. A team that wants an agent with a sandbox but doesn't want to run any infrastructure.
4. You, for p-4.1.`,
        answer: `1. **LangGraph** (or a hand-written loop plus a durable execution engine) — persistence,
   interrupts and streaming are exactly its strengths.
2. **Claude Agent SDK** — the file, shell and web tools and subagents come built in.
3. **Managed Agents** — Anthropic runs the loop and hosts the sandbox.
4. **Both a hand-written loop and LangGraph** — that's the assignment, because the
   comparison itself is the learning and the portfolio signal.`,
      },
    ],
  },
];
