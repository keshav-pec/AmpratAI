import type { Topic } from '@/lib/types';

export const s2_4: Topic[] = [
  {
    id: 's2.4.t1',
    moduleId: 's2.4',
    title: 'Three ways to get structured output — and what each guarantees',
    outcome: `You can choose how to get JSON from a model, and say precisely what the API guarantees and what it leaves to you.`,
    minutes: 35,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
    ],
    animations: [],
    analogy: `You know the difference between a TypeScript type and a runtime check. The compiler
guarantees shape; it doesn't know that \`age\` should be under 120. Structured outputs work
the same way: the API guarantees the shape, and your code still owns the rules.`,
    notes: `## Way 1: ask nicely, then parse

\`\`\`
Return a JSON object with fields name, email and years. Output only JSON.
\`\`\`

It works most of the time. Then one response in two hundred has a sentence before the
JSON, or a trailing comma, or is cut off — and your parser crashes in production. Older
code piled workarounds on top: pre-filled assistant turns, stop sequences, regex
extraction, parse-and-retry loops. On current Claude models, pre-filling the assistant's
reply isn't even allowed any more.

---

## Way 2: structured outputs — the schema is enforced

You give the API a JSON Schema, and the model's output is **constrained to it** while it is
generated.

\`\`\`python
response = client.messages.create(
    model="claude-haiku-4-5",
    max_tokens=2048,
    messages=[{"role": "user", "content": f"Extract the contact details:\\n{text}"}],
    output_config={"format": {"type": "json_schema", "schema": {
        "type": "object",
        "properties": {"name": {"type": "string"}, "email": {"type": "string"}},
        "required": ["name", "email"],
        "additionalProperties": False,
    }}},
)
data = json.loads(response.content[0].text)
\`\`\`

Valid JSON, the right fields, the right types — by construction, not by hope.

---

## Way 3: strict tool use

When the structured data is the *arguments to an action* — "book this slot", "look up this
order" — define a tool with \`"strict": True\`. Its arguments are guaranteed to match the
tool's schema. Stage 4 covers tools properly.

**Rule of thumb:** extracting data → structured outputs. Deciding to take an action → a
strict tool.

---

## What the guarantee does *not* cover

The API enforces **shape**. It does not enforce:

- **Number ranges and string lengths** — \`minimum\`, \`maximum\`, \`maxLength\` aren't supported in the enforced schema
- **Your business rules** — "min_years ≤ max_years", "this citation exists in the document"
- **Truth** — a perfectly valid field can hold an invented phone number
- **Enum capitalisation** — a value can come back differing only in capital letters

And when \`stop_reason\` is \`max_tokens\` or \`refusal\`, the output may not match the schema
at all. **Check the stop reason first, every time.**`,
    docs: [
      {
        label: 'Anthropic — structured outputs',
        url: 'https://platform.claude.com/docs/en/build-with-claude/structured-outputs',
      },
    ],
    glossary: [
      {
        term: 'structured outputs',
        def: 'An API mode where the model\'s output is constrained to a JSON Schema you provide.',
      },
      {
        term: 'strict tool use',
        def: 'A tool definition whose arguments are guaranteed to match its schema.',
      },
      {
        term: 'JSON Schema',
        def: 'A standard way to describe the shape of JSON data.',
      },
      {
        term: 'prefill',
        def: 'An old trick of starting the model\'s reply for it. Rejected by current Claude models.',
      },
    ],
    check: [
      {
        q: 'What does structured output guarantee?',
        a: 'That the output is valid JSON matching the schema\'s structure and types.',
      },
      {
        q: 'Name three things it does not guarantee.',
        a: `Number ranges and string lengths, business rules across fields, and truthfulness — also exact enum capitalisation.`,
      },
      {
        q: 'When can a structured output fail to match the schema?',
        a: 'When stop_reason is max_tokens (cut off) or refusal.',
      },
      {
        q: 'When would you use a strict tool instead of structured outputs?',
        a: 'When the structured data is the arguments for an action the model decides to take.',
      },
    ],
    practice: [
      {
        mode: 'read',
        title: 'Which approach, and what can still go wrong?',
        body: `For each, pick way 1, 2 or 3, and name one thing that can still go wrong:

1. Extracting line items from invoices into your database
2. A chat assistant that can book a demo slot on the user's request
3. A one-off script to tag 50 blog posts for your own site`,
        answer: `1. **Structured outputs.** Still possible: plausible but wrong values (a misread total), and a cut-off response on a very long invoice if \`max_tokens\` is too low. Validate totals against the sum of line items in code.
2. **A strict tool.** Still possible: the model books a slot the user didn't clearly ask for. Validate the slot exists, and confirm with the user before booking (Stage 4).
3. **Way 1 is fine**, honestly — or structured outputs, which costs nothing extra. For fifty items you'll eyeball the results anyway.

The judgement: the guarantee matters in proportion to how much unattended code consumes
the output.`,
      },
      {
        mode: 'tool',
        title: 'Break \'ask nicely\', then fix it',
        body: `Run 50 extractions with way 1 (instructions only) on a small model, deliberately using
messy inputs — resumes with tables, emoji, quoted text. Count parse failures. Then switch
to structured outputs and run the same 50.`,
        answer: `With instructions only, expect a handful of failures — text before or after the JSON,
markdown code fences around it, occasionally an unescaped quote inside a string. The
exact count varies by model and input; any non-zero number is a production incident
waiting to happen.

With structured outputs, **parse failures should be zero** — except responses cut off
by \`max_tokens\`, which your stop-reason check should now catch and report.

What does *not* change: wrong values. If the model misread a date in way 1, it can
misread it in way 2. That's the next topics.`,
      },
    ],
  },
  {
    id: 's2.4.t2',
    moduleId: 's2.4',
    title: 'Pydantic as the contract',
    outcome: `You can use one pydantic model to request, validate and type a model's output — and you know which of its rules the API enforces.`,
    minutes: 30,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
    ],
    animations: [],
    analogy: `In Stage 1 you learned that pydantic is the shared language of the AI ecosystem. This is
where that pays off: the same model class describes what you ask for, checks what comes
back, and gives you a typed object to work with.`,
    notes: `## The one-liner

\`\`\`python
from pydantic import BaseModel, Field

class Contact(BaseModel):
    name: str
    email: str
    years_experience: int = Field(ge=0, le=60)

response = client.messages.parse(
    model="claude-haiku-4-5",
    max_tokens=2048,
    messages=[{"role": "user", "content": f"Extract the contact:\\n{resume}"}],
    output_format=Contact,
)
contact = response.parsed_output      # a validated Contact
\`\`\`

---

## What parse() does for you

1. **Converts** your model to a JSON Schema
2. **Removes** rules the API can't enforce — like \`ge=0, le=60\` — and writes them into the field's description as a hint instead ("must be at most 60")
3. **Sends** the simplified schema, so the shape is enforced
4. **Validates** the response against your **full** model, all rules included

So the model sees the rule as guidance, and your code enforces it strictly. Both halves
matter.

---

## Two layers, one class

\`\`\`
API guarantees:      it's a Contact-shaped object with the right types
pydantic enforces:   years_experience is between 0 and 60,
                     any field_validator or model_validator you wrote
\`\`\`

If the second layer fails, validation raises — and that failure is the input to the
repair loop in the next topic.

---

## Write descriptions — they are prompts

\`\`\`python
notice_days: int | None = Field(
    default=None,
    description="Notice period in days, as stated. null if the resume doesn't say.",
)
\`\`\`

The description travels with the schema and is read by the model. "null if the resume
doesn't say" is your escape hatch, placed exactly where it applies.

---

## Missing is not zero

Make "not stated" representable — \`int | None\` — and say what \`None\` means. A field typed
plain \`int\` forces the model to put *some* number there, and it will. That's how invented
data gets into databases.`,
    docs: [
      {
        label: 'Anthropic — structured outputs',
        url: 'https://platform.claude.com/docs/en/build-with-claude/structured-outputs',
      },
      {
        label: 'Pydantic — fields',
        url: 'https://docs.pydantic.dev/latest/concepts/fields/',
      },
    ],
    glossary: [
      {
        term: 'parsed_output',
        def: 'The validated pydantic object the SDK\'s parse() method returns.',
      },
      {
        term: 'schema transformation',
        def: 'The SDK removing rules the API can\'t enforce, and moving them into field descriptions.',
      },
      {
        term: 'Field description',
        def: 'Text attached to a schema field that the model reads as guidance.',
      },
    ],
    check: [
      {
        q: 'What does parse() do with a rule like le=60?',
        a: `Removes it from the schema sent to the API, adds it to the field description as a hint, and then enforces it when validating the response.`,
      },
      {
        q: 'Which layer enforces business rules like min ≤ max?',
        a: 'Your pydantic model\'s validators, on your side — not the API.',
      },
      {
        q: 'Why should a field be `int | None` rather than `int` when data may be missing?',
        a: `A plain int forces the model to produce some number, which invents data. None lets it say 'not stated'.`,
      },
      {
        q: 'Where is the best place for a field-specific escape hatch?',
        a: 'In that field\'s description, e.g. \'null if the resume doesn\'t say\'.',
      },
    ],
    practice: [
      {
        mode: 'spec',
        title: 'Model a job posting for extraction',
        body: `Write the pydantic model for extracting a job posting: title, company, location or
remote, min and max years, must-have skills, nice-to-have skills, and salary. Give every
field a description that works as an instruction. Decide what "not stated" looks like for
each field.

Then run it through \`client.messages.parse()\` on three real postings, one of which
doesn't mention salary.`,
        answer: `\`\`\`python
from typing import Literal
from pydantic import BaseModel, Field, model_validator

class JobPosting(BaseModel):
    title: str = Field(description="Job title exactly as written.")
    company: str | None = Field(None, description="Hiring company. null if it's a recruiter posting with no company named.")
    work_mode: Literal["onsite", "hybrid", "remote", "not_stated"] = Field(
        description="Where the work happens, as stated in the posting.")
    location: str | None = Field(None, description="City for onsite or hybrid roles; null if remote or not stated.")
    min_years: int | None = Field(None, ge=0, le=40, description="Minimum years of experience required; null if not stated.")
    max_years: int | None = Field(None, ge=0, le=40, description="Maximum years, if a range is given; null otherwise.")
    must_have: list[str] = Field(description="Skills stated as required. Empty list if none are stated.")
    nice_to_have: list[str] = Field(description="Skills stated as preferred or a plus.")
    salary_text: str | None = Field(None, description="Salary exactly as written, e.g. '12-18 LPA'; null if not stated.")

    @model_validator(mode="after")
    def years_ordered(self):
        if self.min_years is not None and self.max_years is not None and self.min_years > self.max_years:
            raise ValueError("min_years cannot exceed max_years")
        return self
\`\`\`

Decisions worth defending:

- **\`work_mode\` has an explicit \`not_stated\` value**, so "not mentioned" is never silently turned into "onsite".
- **Salary is kept as text** — parsing "12-18 LPA" into numbers is a separate, testable step in your code, not something to trust the model with inline.

On the posting without a salary, \`salary_text\` should come back \`null\`. If it contains
an invented figure, the description isn't doing its job — strengthen it, and add a
check that the salary text appears in the source.`,
      },
      {
        mode: 'read',
        title: 'Which rules does the API enforce?',
        body: `For this model, sort each constraint into "enforced by the API while generating" or
"enforced only when pydantic validates afterwards":

\`\`\`python
class Score(BaseModel):
    label: Literal["strong", "possible", "no"]
    value: float = Field(ge=0, le=1)
    reasons: list[str] = Field(min_length=1, max_length=3)
    summary: str = Field(max_length=300)
\`\`\``,
        answer: `**Enforced by the API while generating:** the object shape, the field types, and
\`label\` being one of the three values — enums are supported, though capitalisation isn't
guaranteed.

**Enforced only by pydantic afterwards:**

- \`value\` between 0 and 1 — numeric ranges aren't supported in the enforced schema
- \`reasons\` having at most 3 items — array limits beyond "at least 0 or 1" aren't supported, so only a minimum of one item can be enforced by the API
- \`summary\` being at most 300 characters — string lengths aren't supported

So three of the rules can be broken by the model and will surface as validation errors
in your code. That's normal — and it's why the next topic exists.`,
      },
    ],
  },
  {
    id: 's2.4.t3',
    moduleId: 's2.4',
    title: 'Repair loops: fixing meaning, not syntax',
    outcome: `You can recover automatically when a model's output is well-formed but breaks your rules — with a hard limit, so a stubborn failure fails honestly.`,
    minutes: 35,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
    ],
    animations: ['anim-repair-loop'],
    analogy: `Like a form that shows "email is invalid" under the field instead of rejecting the whole
submission. You tell the model exactly which field broke which rule, and it fixes that —
usually on the first try, because a precise error is the clearest instruction there is.`,
    notes: `## What's left to repair

With structured outputs, **syntax errors are gone**. What remains are meaning errors:

- a score of 1.4 when the limit is 1
- \`min_years\` greater than \`max_years\`
- a citation pointing at a resume line that doesn't exist
- a category differing only in capitals

These are what your pydantic validators catch.

---

## The loop

\`\`\`python
from anthropic import transform_schema
from pydantic import ValidationError

schema = transform_schema(Match.model_json_schema())

async def extract(text: str, attempts: int = 2) -> Match:
    messages = [{"role": "user", "content": f"<resume>{text}</resume>\\n\\nAssess the match."}]
    for attempt in range(attempts):
        r = await client.messages.create(
            model="claude-haiku-4-5", max_tokens=2048, messages=messages,
            output_config={"format": {"type": "json_schema", "schema": schema}},
        )
        if r.stop_reason != "end_turn":
            raise ExtractionFailed(f"stopped early: {r.stop_reason}")
        raw = r.content[0].text
        try:
            return Match.model_validate_json(raw)
        except ValidationError as e:
            messages += [
                {"role": "assistant", "content": raw},
                {"role": "user", "content": f"That output broke these rules:\\n{e}\\nReturn a corrected version."},
            ]
    raise ExtractionFailed("still invalid after repair")
\`\`\`

---

## Four rules for a good repair loop

1. **Feed back the exact error.** Pydantic's message names the field and the rule. That's precisely what the model needs.
2. **Cap the attempts** — usually one repair. A second failure is information, not a reason to keep paying.
3. **Check \`stop_reason\` first.** A truncated response isn't a meaning error, and repairing it wastes a call.
4. **Fail honestly.** After the cap, return a clear failure your app can route to a human or a fallback — never a half-valid object.

---

## Log every repair

Track how often repairs happen, and on which rule. If 10% of extractions need a repair on
the same field, that's not a loop problem — the prompt or field description is unclear.
Fix the cause, and watch the repair rate fall.

---

## Some checks need the source

"This citation's line number exists in the resume" can't be expressed in a schema — the
model doesn't have access to your validator's data. Pass context into validation
(pydantic supports a \`context\` argument), or check it straight after, in code. Stage 3 leans
on this heavily for citations.`,
    docs: [
      {
        label: 'Anthropic — structured outputs',
        url: 'https://platform.claude.com/docs/en/build-with-claude/structured-outputs',
      },
      {
        label: 'Pydantic — validators',
        url: 'https://docs.pydantic.dev/latest/concepts/validators/',
      },
    ],
    glossary: [
      {
        term: 'repair loop',
        def: 'Sending a validation error back to the model once, asking for a corrected output.',
      },
      {
        term: 'meaning error',
        def: 'Output that is well-formed but breaks a rule — a range, a cross-field check, a citation.',
      },
      {
        term: 'repair rate',
        def: 'The share of calls that needed a repair. A rising rate points at an unclear prompt or field.',
      },
    ],
    check: [
      {
        q: 'What kind of errors do repair loops fix once you use structured outputs?',
        a: 'Meaning errors — broken ranges, cross-field rules, invalid citations — not syntax errors.',
      },
      {
        q: 'Why feed back pydantic\'s exact error message?',
        a: 'It names the field and the rule that broke, which is the clearest instruction for fixing it.',
      },
      {
        q: 'How many repair attempts should you usually allow?',
        a: 'One. A second failure is a signal to fail honestly and investigate.',
      },
      {
        q: 'What does a high repair rate on one field tell you?',
        a: 'The prompt or that field\'s description is unclear — fix the cause rather than relying on the loop.',
      },
    ],
    practice: [
      {
        mode: 'primitive',
        title: 'Write the repair loop by hand',
        body: `Without AI, write \`extract_with_repair(client, model_cls, prompt, attempts=2)\`. It must:
check the stop reason, validate with the pydantic class, feed back the exact error once,
and raise a clear exception when it still fails. It should also return how many attempts
were used, for logging.`,
        answer: `\`\`\`python
from anthropic import transform_schema
from pydantic import BaseModel, ValidationError

class ExtractionFailed(Exception): ...

async def extract_with_repair(client, model_cls: type[BaseModel], prompt: str,
                              attempts: int = 2, model: str = "claude-haiku-4-5"):
    schema = transform_schema(model_cls.model_json_schema())
    messages = [{"role": "user", "content": prompt}]
    last_error = None
    for attempt in range(1, attempts + 1):
        r = await client.messages.create(
            model=model, max_tokens=4096, messages=messages,
            output_config={"format": {"type": "json_schema", "schema": schema}},
        )
        if r.stop_reason != "end_turn":
            raise ExtractionFailed(f"attempt {attempt}: stopped with {r.stop_reason}")
        raw = next(b.text for b in r.content if b.type == "text")
        try:
            return model_cls.model_validate_json(raw), attempt
        except ValidationError as e:
            last_error = e
            messages += [
                {"role": "assistant", "content": raw},
                {"role": "user", "content": f"That output broke these rules:\\n{e}\\n"
                                            "Return a corrected version of the whole object."},
            ]
    raise ExtractionFailed(f"invalid after {attempts} attempts: {last_error}")
\`\`\`

Checks on yours:

- **The stop-reason check comes before validation.** A \`refusal\` or \`max_tokens\` is not repairable by feedback.
- **The failed output is sent back as the assistant turn**, so the model sees what it wrote. That makes the correction precise.
- **It asks for the whole object again**, not just the broken field, so the result validates as a unit.
- **The attempt count is returned** — your repair-rate metric depends on it.`,
      },
      {
        mode: 'tool',
        title: 'Measure your repair rate',
        body: `Run your P2.2 extraction over your golden set with the repair loop. Log for each item:
attempts used, and which field failed validation on the first try. Then fix the most
common failure in the field description and run it again.`,
        answer: `Expect most items to validate on the first attempt, and a small share to need one
repair. Group the first-attempt failures by field — usually one or two fields account for
most of them.

A typical example: \`years_experience\` failing because the resume says "3+ years" or
"since 2021". Improving the description — "whole years, rounded down; if only a start
year is given, compute from it; null if unclear" — should make that field's failures
mostly disappear.

**The repair loop is your safety net; the repair rate is your to-do list.**`,
      },
    ],
  },
  {
    id: 's2.4.t4',
    moduleId: 's2.4',
    title: 'Closed vocabularies: enums, \'other\' and \'unknown\'',
    outcome: `You can force a model's answers into a fixed set of categories — including honest ways to say 'none of these' and 'can't tell'.`,
    minutes: 25,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
    ],
    animations: [],
    analogy: `A \`<select>\` element instead of a free-text box. You decide the options; the user can't
invent a new one. Enums do that for a model — and just like a select, you need an "Other"
option or people pick something wrong.`,
    notes: `## Why free text drifts

Ask for a department as free text and, over a thousand calls, you'll get "Engineering",
"engineering", "Eng", "Software Engineering", "Tech". Five spellings, one meaning, and a
dashboard that counts them separately.

---

## A closed set

\`\`\`python
class Ticket(BaseModel):
    category: Literal["billing", "delivery", "refund", "product_question", "other"]
    confidence: Literal["high", "low"]
\`\`\`

The model can only choose from your list. Invented categories become impossible, not just
discouraged.

---

## Always include the exits

- **\`other\`** — for inputs that fit none of your categories. Without it, the model forces them into the nearest wrong bucket, and you never learn you're missing a category.
- **\`unknown\` or \`not_stated\`** — for information that isn't present. Different from "other": it means the input doesn't say.

Review what lands in \`other\` weekly. When a theme appears there often, it deserves its own
category.

---

## The capitalisation caveat

Even with structured outputs, a value can come back differing **only in capital letters**
from your enum. Protect yourself:

- Use **lowercase snake_case** enum values — \`product_question\`, not \`Product Question\`
- Normalise before validating:

\`\`\`python
@field_validator("category", mode="before")
@classmethod
def lower(cls, v):
    return v.lower() if isinstance(v, str) else v
\`\`\`

- Never have two values that differ only in case

---

## Keep the list short and distinct

Eight clearly different categories beat twenty overlapping ones. If *you* would hesitate
between two categories for a real example, the model will too — merge them, or describe the
boundary.`,
    docs: [
      {
        label: 'Anthropic — structured outputs',
        url: 'https://platform.claude.com/docs/en/build-with-claude/structured-outputs',
      },
      {
        label: 'Pydantic — validators',
        url: 'https://docs.pydantic.dev/latest/concepts/validators/',
      },
    ],
    glossary: [
      {
        term: 'enum',
        def: 'A field that may only take one of a fixed list of values.',
      },
      {
        term: 'closed vocabulary',
        def: 'A fixed set of allowed labels, so the model cannot invent new ones.',
      },
      {
        term: 'before-validator',
        def: 'A pydantic validator that runs on the raw value before type checking — useful for normalising.',
      },
    ],
    check: [
      {
        q: 'Why include an \'other\' category?',
        a: `So inputs that fit nothing aren't forced into the nearest wrong category — and so you can discover missing categories.`,
      },
      {
        q: 'What is the difference between \'other\' and \'not_stated\'?',
        a: `'Other' means it fits none of your categories; 'not_stated' means the input doesn't contain the information.`,
      },
      {
        q: 'How do you protect against enum capitalisation drift?',
        a: `Use lowercase enum values, normalise case in a before-validator, and never have two values differing only by case.`,
      },
      {
        q: 'Two of your categories keep getting confused. What do you do?',
        a: 'Merge them, or describe the boundary between them — if you\'d hesitate, the model will too.',
      },
    ],
    practice: [
      {
        mode: 'spec',
        title: 'Design a ticket taxonomy',
        body: `For a D2C clothing brand's support inbox, design the category enum. Include the exits.
Then write the one-sentence description of each category that goes in the schema, and
name the pair you expect to be confused most often.`,
        answer: `\`\`\`python
Category = Literal[
    "order_status",      # where is my order, delivery date questions
    "return_exchange",   # wants to return or swap an item, including size issues
    "refund_status",     # a return or cancellation already happened; asking about the money
    "damaged_or_wrong",  # received a damaged, defective or wrong item
    "payment_issue",     # charged twice, payment failed, COD problems
    "product_question",  # pre-purchase questions about size, fabric, stock
    "account",           # login, address, profile changes
    "other",             # none of the above
]
\`\`\`

The pair most likely to be confused: **\`return_exchange\` and \`refund_status\`**. "I
returned it last week, where's my money?" mentions a return but is a refund question.
That boundary — *has the return already happened?* — belongs in both descriptions.

And watch \`damaged_or_wrong\` versus \`return_exchange\`: a customer with a damaged item
often *asks* for a return. Decide which one wins — usually damaged, because it changes
who pays for the return shipping — and write that down.`,
      },
      {
        mode: 'read',
        title: 'What goes wrong in each?',
        body: `1. The enum is \`["Refund", "refund_request", "Refunds"]\`.
2. The enum has no "other". A new product line launches, and the "product_question" count doubles overnight.
3. The enum is fine, but values sometimes arrive as "Order_status" and validation fails.`,
        answer: `1. **Near-duplicate values.** Three spellings of one idea — the model picks inconsistently, and case-only differences break validation. Keep one: \`refund_request\`.
2. **No exit.** Questions about the new line fit nothing, so they are forced into the nearest category. Add \`other\`, and review it — the new line probably needs its own category.
3. **Capitalisation drift,** which structured outputs don't prevent. Lowercase the value in a before-validator.`,
      },
    ],
  },
  {
    id: 's2.4.t5',
    moduleId: 's2.4',
    title: 'Streaming structured output',
    outcome: `You can show a structured result filling in as it streams — and you know which parts are safe to act on before it finishes.`,
    minutes: 30,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
    ],
    animations: [],
    analogy: `You've used optimistic UI: show the result before the server confirms, reconcile after. Streaming
structured output is the read-only version — display fields as they arrive, but only *act* on
the object once it's complete and validated.`,
    notes: `## Why stream structured output at all

A detailed extraction can take several seconds. Streaming lets the interface show fields as
they fill in — the candidate's name first, then their skills — instead of a blank screen and
then everything at once.

---

## Partial JSON is not valid JSON

Mid-stream, the text looks like this:

\`\`\`
{"name": "Keshav Sharma", "skills": ["Python", "Rea
\`\`\`

\`json.loads\` fails on it. You need a parser that accepts incomplete JSON and gives you
what it has so far. Pydantic's core can do that:

\`\`\`python
from pydantic_core import from_json

buffer = ""
async for text in stream.text_stream:
    buffer += text
    partial = from_json(buffer, allow_partial=True)   # dict with whatever is complete
    send_to_ui(partial)
\`\`\`

---

## Display, don't decide

A partial object can be **wrong in ways that fix themselves**: a string still growing, a list
missing items, a number not finished (\`12\` on its way to \`120\`).

So the rule is simple:

- **Show** partial values, visibly marked as in progress
- **Act** — save, score, send, charge — only on the final object, after pydantic validation passes

---

## Order fields for the reader

With structured outputs, required fields come out first, in schema order, followed by
optional ones. Put the fields the user most wants to see **first in your model** so they
appear first.

---

## When to skip it

If the output is small, or nobody watches it arrive — a background job, a batch — don't
stream. Streaming adds complexity that only pays off when a person is waiting.`,
    docs: [
      {
        label: 'Anthropic — streaming messages',
        url: 'https://platform.claude.com/docs/en/build-with-claude/streaming',
      },
      {
        label: 'Pydantic — JSON parsing',
        url: 'https://docs.pydantic.dev/latest/concepts/json/',
      },
    ],
    glossary: [
      {
        term: 'partial JSON',
        def: 'Incomplete JSON from a stream that hasn\'t finished yet.',
      },
      {
        term: 'allow_partial',
        def: 'A pydantic-core parsing option that accepts incomplete JSON and returns what is complete so far.',
      },
      {
        term: 'field completeness',
        def: 'Whether a streamed field has finished — known only once something follows it.',
      },
    ],
    check: [
      {
        q: 'Why can\'t json.loads parse a mid-stream structured output?',
        a: 'Mid-stream the JSON is incomplete — unterminated strings and unclosed brackets.',
      },
      {
        q: 'What is safe to do with a partial object?',
        a: `Display it, marked as in progress. Saving, scoring or acting must wait for the final validated object.`,
      },
      {
        q: 'How can you control which fields appear first?',
        a: 'Put them first in the model — required fields stream first, in schema order.',
      },
      {
        q: 'When is streaming structured output not worth it?',
        a: 'When the output is small or nobody is watching it arrive, such as background or batch jobs.',
      },
    ],
    practice: [
      {
        mode: 'read',
        title: 'What will the user see?',
        body: `A streaming extraction sends partial objects to the UI after every text piece, and the UI
shows \`years_experience\` in a large font. Users report two things:

1. The number flickers from 1 to 12 during extraction.
2. Once, a candidate's experience was saved as 1 year when the recruiter navigated away
   mid-stream.

What happened in each case, and what should the UI have done?`,
        answer: `1. **The flicker:** the partial parser surfaced an **unfinished number**. \`1\` was the
   start of \`12\` — the parser can't know a number is complete until something follows
   it.
2. **The bad save:** the UI **acted on partial data** — it saved whatever it held when
   the component unmounted, and at that moment the field read \`1\`.

What the UI should do:

- Mark in-progress fields visibly, and only render a field's value once it is
  **complete** — the next key has started, or the stream has ended.
- **Save only the final validated object.** On unmount mid-stream, save nothing, or
  cancel the extraction.`,
      },
      {
        mode: 'spec',
        title: 'Spec a streaming extraction endpoint',
        body: `Spec an SSE endpoint that streams a resume extraction: it sends \`partial\` events with the
in-progress object, and a single \`final\` event with the validated object — or an \`error\`
event if validation fails after one repair. Have AI build it, then review how it decides a
field is complete.`,
        answer: `Event contract:

\`\`\`
data: {"type": "partial", "fields": {...}, "complete": ["name", "email"]}
data: {"type": "final", "result": {...}}
data: {"type": "error", "message": "could not extract a valid profile"}
\`\`\`

A reasonable completeness rule: **a field is complete once a later key has begun, or the
stream has ended** — because the parser can't know a string or number is finished until
something follows it.

Review points:

- **The \`final\` event is sent only after pydantic validation passes** — the repair loop runs after the stream ends, not during it.
- **The partial parser handles each text piece in constant-ish time** — reparsing the whole buffer every token is fine for a few KB; for large outputs, throttle partial events to a few per second.
- **The frontend only saves on \`final\`** — check that the generated React code doesn't save partial state on unmount.`,
      },
    ],
  },
];
