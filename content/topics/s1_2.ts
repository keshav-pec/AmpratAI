import type { Topic } from '@/lib/types';

const deck = { kind: 'deck' as const, label: 'Slides', reason: 'written for you, always current' };
const find = (label: string, query: string, channel: string, reason: string) =>
  ({ kind: 'find' as const, label, query, channel, reason });

export const s1_2: Topic[] = [
  {
    id: 's1.2.t1',
    moduleId: 's1.2',
    title: 'Models, validation, and getting data in and out',
    outcome: 'You can define a pydantic model, validate messy input with it, and turn it back into JSON.',
    minutes: 40,
    sources: [
      deck,
      find('Visual', 'pydantic v2 tutorial', 'ArjanCodes', 'practical walkthrough with real examples'),
    ],
    animations: ['anim-pydantic'],
    analogy: `You know the problem already. In Express you get \`req.body\` and it is
whatever the client felt like sending, so you reach for Zod or Joi and write a schema.
Pydantic is that, except the schema is just a class with type annotations — and the rest of
the Python AI ecosystem is built on top of it.`,
    notes: `## The one-minute version

    from pydantic import BaseModel

    class Resume(BaseModel):
        name: str
        years: int
        email: str | None = None

    r = Resume.model_validate({"name": "Keshav", "years": "3"})

    r.name      # "Keshav"
    r.years     # 3        <- the string "3" became the number 3
    r.email     # None

You wrote type annotations. Pydantic turned them into a runtime check. That is the whole
idea, and it is why this module matters more than it looks.

---

## The three methods you will use constantly

    Resume.model_validate(some_dict)      # dict  -> model, validating on the way
    Resume.model_validate_json(raw_text)  # JSON string -> model
    r.model_dump()                        # model -> dict
    r.model_dump_json()                   # model -> JSON string

\`model_dump()\` has two options worth knowing now:

    r.model_dump(exclude_none=True)   # drop keys that are None
    r.model_dump(mode="json")         # make dates and UUIDs JSON-safe

That second one saves you from "Object of type datetime is not JSON serializable", which
you will otherwise meet at an inconvenient moment.

---

## When validation fails you get data, not a crash

    from pydantic import ValidationError

    try:
        Resume.model_validate({"years": "many"})
    except ValidationError as e:
        print(e.errors())

    [
      {"type": "missing",     "loc": ("name",),  "msg": "Field required"},
      {"type": "int_parsing", "loc": ("years",), "msg": "Input should be a valid integer..."}
    ]

Look closely at that. It is a **list of structured errors**, each naming the exact field and
the exact problem.

This is not a small detail. In Stage 2 you will ask a model for JSON, it will get a field
wrong, and you will paste this error straight back into a follow-up prompt: "you returned
this, here is what was invalid, try again". The model fixes its own mistake because the
error is precise. That trick only works because the error is structured.

---

## Nested models just work

    class Role(BaseModel):
        company: str
        title: str
        months: int

    class Resume(BaseModel):
        name: str
        roles: list[Role] = []

    Resume.model_validate({
        "name": "Keshav",
        "roles": [{"company": "X", "title": "SDE", "months": "18"}],
    })

The nested dict became a \`Role\` object, and \`"18"\` became \`18\`. Errors from deep inside
report their full path — \`("roles", 0, "months")\` — so you always know where the bad data
was.

---

## Coercion: helpful, until it is not

By default pydantic converts when it safely can: \`"3"\` to \`3\`, \`1\` to \`True\`.

Sometimes you do not want that. A model that returns \`"unknown"\` for a salary should fail,
not become something else.

    class Strict(BaseModel):
        model_config = {"strict": True}
        years: int        # now "3" is an error, not a conversion

Use strict mode when the input comes from a model rather than a person. People mistype;
models confabulate, and you would rather see the failure.

---

## Extra fields

By default, unknown keys are silently ignored. Two other choices:

    model_config = {"extra": "forbid"}   # unknown key -> error
    model_config = {"extra": "allow"}    # unknown key -> kept on the object

Use \`forbid\` for anything an AI model produces. If it invents a field you did not ask for,
you want to know immediately — that is usually the first sign your prompt has drifted.`,
    docs: [
      { label: 'Pydantic — models', url: 'https://docs.pydantic.dev/latest/concepts/models/' },
      { label: 'Pydantic — conversion table', url: 'https://docs.pydantic.dev/latest/concepts/conversion_table/' },
    ],
    glossary: [
      { term: 'BaseModel', def: 'The class you inherit from to get validation, parsing and serialisation.' },
      { term: 'model_validate', def: 'Takes untrusted data and returns a checked, typed object — or raises.' },
      { term: 'model_dump', def: 'Turns the object back into a plain dict or JSON string.' },
      { term: 'coercion', def: 'Automatically converting a value to the declared type, like "3" to 3.' },
      { term: 'ValidationError', def: 'The exception raised on bad input. Carries a list of structured, per-field errors.' },
      { term: 'strict mode', def: 'Turns coercion off, so a wrong type is an error rather than a conversion.' },
    ],
    check: [
      { q: 'What is the difference between model_validate and model_validate_json?', a: 'One takes a dict, the other takes a raw JSON string. The second skips a parse step and gives better error positions.' },
      { q: 'Why is a structured ValidationError more useful than a generic exception?', a: 'It names the exact field and reason, so you can show a precise message — or hand it back to a model and ask it to fix its own output.' },
      { q: 'When would you turn strict mode on?', a: 'When the input comes from a model rather than a person. You want a confident wrong value to fail loudly.' },
      { q: 'What does extra="forbid" protect you from?', a: 'A model inventing fields you never asked for, which is usually the first sign the prompt has drifted.' },
      { q: 'What does mode="json" do in model_dump?', a: 'Converts non-JSON types like datetime and UUID into JSON-safe values.' },
    ],
    practice: [
      {
        mode: 'primitive',
        title: 'Model a resume by hand',
        body: `No AI. Write models for a resume: name, email, years of experience, a list of
skills, and a list of roles where each role has company, title and months.

Then feed it three dicts: one clean, one with the years as a string, one missing the name.
Print \`e.errors()\` for the failure and read it carefully. You will see this error shape
again in Stage 2 and you want it to look familiar.`,
      },
      {
        mode: 'read',
        title: 'Predict the result',
        body: `For each, say whether it validates, and what the value ends up as:

    class M(BaseModel):
        a: int
        b: bool
        c: list[str] = []

    M.model_validate({"a": "7", "b": 1})
    M.model_validate({"a": 7.0, "b": True})
    M.model_validate({"a": "seven", "b": True})
    M.model_validate({"a": 1, "b": True, "d": "extra"})

Then run them. The fourth one is the one worth thinking about — what happened to \`d\`?`,
      },
      {
        mode: 'spec',
        title: 'Spec a model for messy real input',
        body: `You are parsing job postings. Fields: title, company, location, minimum years,
maximum years, skills, whether remote is allowed, and a salary range that is often missing
or written as free text like "12-18 LPA".

Write the spec first — what is required, what defaults exist, what happens to the salary
string. Then have AI implement it, and check specifically: does a missing salary produce
\`None\` or an invented number? Does "12-18 LPA" get parsed or rejected? Is either behaviour
the one you specified?`,
      },
      {
        mode: 'break',
        title: 'Break it',
        body: `Take a working model and send it a nested list where one element deep inside is the
wrong type. Print the error and find the \`loc\` path. Then set \`extra="forbid"\` and send
an unexpected key. Read both errors — you are learning to read the format, not to avoid it.`,
      },
    ],
  },

  {
    id: 's1.2.t2',
    moduleId: 's1.2',
    title: 'Constraints, validators, and closed vocabularies',
    outcome: 'You can express real rules in a model — ranges, formats, allowed values — instead of checking them by hand later.',
    minutes: 35,
    sources: [deck],
    animations: ['anim-pydantic'],
    analogy: `The Zod chain you already write — \`z.string().min(1).max(200)\` — is the
\`Field(...)\` argument here. The difference is that the constraints sit next to the type
annotation instead of replacing it.`,
    notes: `## Field constraints

    from pydantic import BaseModel, Field

    class Chunk(BaseModel):
        text: str = Field(min_length=1, max_length=4000)
        page: int = Field(ge=1)                       # greater or equal
        score: float = Field(ge=0.0, le=1.0)          # between 0 and 1
        source: str = Field(pattern=r"^[a-z0-9_/-]+$")

\`ge\`, \`gt\`, \`le\`, \`lt\`, \`min_length\`, \`max_length\`, \`pattern\`. That covers most
of what you need.

\`Field\` also carries documentation:

    query: str = Field(description="The user's question, in their own words")

That description is not decoration. FastAPI puts it in the API docs, and — this is the part
that matters later — when a model of this shape becomes a **tool schema** in Stage 4, the
description is what tells the AI what to put in the field. A vague description there is a
vague prompt.

---

## Literal: the closed vocabulary

    from typing import Literal

    class Match(BaseModel):
        decision: Literal["strong", "possible", "no"]

Now \`"maybe"\` is a validation error, not a new category that quietly appears in your
database.

This one technique prevents a whole class of AI bug. Ask a model to classify something into
three buckets and it will eventually invent a fourth. With \`Literal\`, that attempt fails
loudly at your boundary instead of spreading through your system.

---

## Custom validators

When a rule needs actual logic:

    from pydantic import field_validator

    class Resume(BaseModel):
        email: str

        @field_validator("email")
        @classmethod
        def must_look_like_email(cls, v: str) -> str:
            if "@" not in v:
                raise ValueError("not an email address")
            return v.strip().lower()

Two things happen there: it rejects bad values, and it **normalises** good ones. Returning a
cleaned value is half the point — trim the whitespace, lowercase the email, strip the
currency symbol.

For rules that span fields, validate the whole model:

    from pydantic import model_validator

    class Range(BaseModel):
        min_years: int
        max_years: int

        @model_validator(mode="after")
        def check_order(self):
            if self.min_years > self.max_years:
                raise ValueError("min_years cannot exceed max_years")
            return self

---

## Where this pays off

In Stage 2 you will extract structured data from resumes with a model. Without constraints,
a confident hallucination — "years: 300", "decision: definitely" — flows straight into your
database and you find out weeks later.

With constraints, it fails at the boundary, you catch the error, and you can hand it back to
the model to correct. Same amount of code. Completely different failure mode.`,
    docs: [
      { label: 'Pydantic — fields', url: 'https://docs.pydantic.dev/latest/concepts/fields/' },
      { label: 'Pydantic — validators', url: 'https://docs.pydantic.dev/latest/concepts/validators/' },
    ],
    glossary: [
      { term: 'Field', def: 'Adds constraints and documentation to a model field.' },
      { term: 'ge / le', def: 'Greater-or-equal and less-or-equal bounds for numbers.' },
      { term: 'field_validator', def: 'A function that checks or cleans one field.' },
      { term: 'model_validator', def: 'A check that runs across several fields at once.' },
      { term: 'closed vocabulary', def: 'A fixed set of allowed values, expressed with Literal.' },
    ],
    check: [
      { q: 'Why is Literal so useful when a model produces the value?', a: 'Models invent categories. Literal turns an invented one into a loud error at your boundary instead of a new row in your database.' },
      { q: 'What can a field validator do besides reject?', a: 'Normalise. Trim whitespace, lowercase, strip symbols — return a cleaned value.' },
      { q: 'When do you need a model_validator instead of a field_validator?', a: 'When the rule involves more than one field, like min being less than max.' },
      { q: 'Why does the description on a Field matter more later?', a: 'It becomes part of the tool schema an AI reads, so it is effectively a prompt. Vague description, vague behaviour.' },
    ],
    practice: [
      {
        mode: 'spec',
        title: 'Constrain a match result',
        body: `Spec a model for one resume-to-job match: a score between 0 and 1, a decision from
a fixed set of three, a list of matched requirements each citing a resume line number, and a
short reason with a maximum length.

Have AI implement it. Then try to break it with the kind of output a model actually
produces: a score of 1.5, a decision of "likely", a citation pointing at line -1. Confirm
each one fails. If any slips through, fix the constraint.`,
      },
      {
        mode: 'read',
        title: 'Which of these pass?',
        body: `Given \`score: float = Field(ge=0, le=1)\` and \`kind: Literal["a","b"]\`, which
validate?

    {"score": 1, "kind": "a"}
    {"score": "0.5", "kind": "b"}
    {"score": 1.01, "kind": "a"}
    {"score": 0.5, "kind": "A"}

The last one is the interesting case. Is case-sensitivity what you want here, and what would
you do about it?`,
      },
      {
        mode: 'decision',
        title: 'Reject or normalise?',
        body: `For each of these inputs, decide whether your validator should reject it or clean
it, and say why in one line: \` keshav@x.com \`, \`KESHAV@X.COM\`, \`+91 98765 43210\`,
\`"12-18 LPA"\`, \`"about 3 years"\`.

There is no single right answer. What matters is that you can defend the line you drew —
and that you never silently turn "about 3 years" into the number 3 without recording that
you guessed.`,
      },
    ],
  },

  {
    id: 's1.2.t3',
    moduleId: 's1.2',
    title: 'Settings and secrets with pydantic-settings',
    outcome: 'Your configuration is typed, validated at startup, and never a bare os.environ lookup buried in a function.',
    minutes: 25,
    sources: [deck],
    animations: [],
    analogy: `You have written \`process.env.API_KEY\` and discovered at 2am that it was
undefined in production. This is the fix: declare every setting once, validate them all when
the process starts, and fail immediately with a clear message instead of failing later with
a confusing one.`,
    notes: `## The pattern

    from pydantic_settings import BaseSettings, SettingsConfigDict
    from pydantic import Field

    class Settings(BaseSettings):
        model_config = SettingsConfigDict(env_file=".env", extra="ignore")

        anthropic_api_key: str
        database_url: str
        default_model: str = "claude-haiku-4-5-20251001"
        max_tokens: int = Field(default=1024, ge=1, le=64000)
        request_timeout_s: float = 30.0

    settings = Settings()

Reads from real environment variables first, then from \`.env\`. Names map case-insensitively,
so \`anthropic_api_key\` picks up \`ANTHROPIC_API_KEY\`.

---

## Why this beats os.environ

- **It fails at startup.** A missing key raises when the process boots, not on the first
  request at midnight.
- **It is typed.** \`max_tokens\` is an int, not the string \`"1024"\` that silently breaks
  arithmetic later.
- **It is validated.** \`ge=1, le=64000\` catches a typo in the env file.
- **It is discoverable.** One class lists every setting your app has. No hunting through
  the codebase for stray lookups.

---

## Secrets

    from pydantic import SecretStr

    class Settings(BaseSettings):
        anthropic_api_key: SecretStr

    print(settings.anthropic_api_key)                  # **********
    settings.anthropic_api_key.get_secret_value()      # the real thing

\`SecretStr\` stops the key appearing in a log line, a traceback, or an error you paste into
a chat. It is a small guard and it has saved a lot of people from a leaked key.

---

## The rules that keep you safe

1. \`.env\` is in \`.gitignore\`. Always. Check this before your first commit, not after.
2. Commit a \`.env.example\` with the names and no values, so the next person knows what is needed.
3. Never pass keys to the browser. In Stage 2 your React app talks to your own API, and your API talks to the model provider. The key never leaves the server.
4. Build the \`Settings\` object once, at startup, and pass it around — do not construct it inside request handlers.`,
    docs: [
      { label: 'pydantic-settings', url: 'https://docs.pydantic.dev/latest/concepts/pydantic_settings/' },
    ],
    glossary: [
      { term: 'BaseSettings', def: 'A model whose values come from environment variables and .env files.' },
      { term: 'SecretStr', def: 'A string that hides itself when printed or logged.' },
      { term: '.env.example', def: 'A committed template listing the names of required settings, with no real values.' },
    ],
    check: [
      { q: 'What is the main advantage over reading os.environ directly?', a: 'You fail at startup with a clear message, with types and validation, and every setting is declared in one place.' },
      { q: 'What does SecretStr protect against?', a: 'A key showing up in a log line, a traceback, or something you paste somewhere.' },
      { q: 'Why must the API key never reach the browser?', a: 'Anyone can read it from the network tab and spend your money. The browser talks to your API; only your API talks to the provider.' },
    ],
    practice: [
      {
        mode: 'tool',
        title: 'Set up settings properly once',
        body: `In a scratch project: create a \`Settings\` class with a required API key, a
database URL, and a model name with a default. Add \`.env\` to \`.gitignore\` and commit a
\`.env.example\`.

Now delete the key from \`.env\` and start the app. Read the error. That clear startup
failure is the entire point of this topic.`,
      },
      {
        mode: 'read',
        title: 'Find the leak',
        body: `What is wrong with each?

    logger.info(f"calling model with key {settings.api_key}")
    return {"config": settings.model_dump()}
    NEXT_PUBLIC_ANTHROPIC_KEY=sk-ant-...

The third one is not Python at all, and it is the most dangerous. Say why.`,
      },
    ],
  },

  {
    id: 's1.2.t4',
    moduleId: 's1.2',
    title: 'Why the whole AI ecosystem is built on this',
    outcome: 'You can see the same pydantic model behind a FastAPI route, a structured model output, and an agent tool schema.',
    minutes: 25,
    sources: [deck],
    animations: ['anim-pydantic'],
    analogy: `One schema, used four ways. Like a TypeScript type that also generates your
API validation, your OpenAPI docs and your form validation — except here it also generates
the instructions an AI model reads.`,
    notes: `## The same class, four jobs

Define it once:

    class SearchArgs(BaseModel):
        query: str = Field(description="What to search for, in the user's own words")
        limit: int = Field(default=5, ge=1, le=50, description="How many results to return")

### 1. A FastAPI request body

    @app.post("/search")
    async def search(args: SearchArgs):
        ...

FastAPI validates the incoming JSON against it, returns a 422 with a precise error if it is
wrong, and generates the API documentation from it. You wrote no validation code.

### 2. A structured model output

    resp = client.messages.create(..., tools=[...])
    args = SearchArgs.model_validate(resp.content[0].input)

You ask a model for JSON. The model is enthusiastic and occasionally wrong. The model class
is the boundary where wrong becomes an error you can handle.

### 3. A tool schema for an agent

    SearchArgs.model_json_schema()

    {
      "properties": {
        "query": {"type": "string", "description": "What to search for, in the user's own words"},
        "limit": {"type": "integer", "default": 5, "minimum": 1, "maximum": 50, ...}
      },
      "required": ["query"]
    }

That JSON Schema is exactly what you hand to a model when you give it a tool. **The
descriptions you wrote are now prompts.** In Stage 4 you will learn that a tool description
without units — "temperature" rather than "temperature in Celsius" — produces wrong calls at
3am. This is where that description comes from.

### 4. Your own internal contract

Every function that passes this object around knows its shape, and your editor knows it too.

---

## Why to care now

You will meet pydantic in FastAPI request bodies, in every provider SDK's response objects,
in LangGraph's agent state, in tool definitions, in eval datasets, and in settings. It is
not one library among many. It is the shared vocabulary.

Time spent here is not time spent on a library. It is time spent on the thing every later
stage assumes you already have.

---

## A habit to start now

When you are about to write a function that takes a dict, ask whether it should take a
model instead. Usually it should. The dict version works until something upstream changes
shape and you find out three functions later, with a \`KeyError\` and no idea who sent it.`,
    docs: [
      { label: 'Pydantic — JSON schema', url: 'https://docs.pydantic.dev/latest/concepts/json_schema/' },
      { label: 'FastAPI — request body', url: 'https://fastapi.tiangolo.com/tutorial/body/' },
    ],
    glossary: [
      { term: 'JSON Schema', def: 'A standard description of a data shape. Pydantic generates it from your model.' },
      { term: 'tool schema', def: 'The JSON Schema you give a model so it knows what arguments a tool takes.' },
      { term: 'boundary', def: 'The single place where untrusted data becomes trusted, typed data.' },
    ],
    check: [
      { q: 'Name four places the same pydantic model gets used.', a: 'FastAPI request validation, parsing structured model output, generating a tool schema for an agent, and as an internal typed contract.' },
      { q: 'Why do Field descriptions matter more in a tool schema than in API docs?', a: 'Because a model reads them to decide what to pass. The description is effectively a prompt.' },
      { q: 'What goes wrong with passing dicts around instead of models?', a: 'Shape changes are silent. You find out later, somewhere else, with a KeyError and no idea what sent it.' },
    ],
    practice: [
      {
        mode: 'primitive',
        title: 'Generate a tool schema by hand',
        body: `No AI. Write a pydantic model for a "look up order" tool: an order id, an optional
include-history flag, and a max number of line items. Give every field a description with
units or format where relevant.

Print \`model_json_schema()\` and read the output line by line. In Stage 4 you will hand this
exact structure to a model. Knowing what is in it now means the frameworks will not look
like magic then.`,
      },
      {
        mode: 'decision',
        title: 'Write descriptions that a model can follow',
        body: `Here are three field descriptions. For each, say what a model could plausibly get
wrong, then rewrite it:

- \`"the date"\`
- \`"temperature"\`
- \`"limit"\`

Compare your rewrites against the rule: could someone who has never seen your system pass
the right value using only this sentence?`,
      },
    ],
  },
];
