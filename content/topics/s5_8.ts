import type { Topic } from '@/lib/types';

export const s5_8: Topic[] = [
  {
    id: 's5.8.t1',
    moduleId: 's5.8',
    title: 'The fine-tuning decision',
    outcome: `You can decide whether fine-tuning is justified — after prompting, examples, retrieval and structured outputs — and explain why most teams shouldn't, yet.`,
    minutes: 25,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
    ],
    animations: [],
    analogy: `Rebuilding your kitchen because the dal is too salty. Maybe — but first try less salt, a
better recipe, fresher ingredients. Fine-tuning is the kitchen rebuild: sometimes right,
usually not the first fix.`,
    notes: `## The ladder: climb it in order

1. **A better prompt** — context, examples of the format, clear success criteria.
2. **Few-shot examples**, chosen per request (Stage 2).
3. **Retrieval**, for knowledge the model lacks (Stage 3).
4. **Structured outputs and tools**, for format and exact computation.
5. **A bigger or different model**, if the budget allows.
6. **Then** consider fine-tuning.

Each rung is cheaper to try, easier to change, and doesn't lock you to one model version.

---

## Real reasons to fine-tune

- **Rigid behaviour at high volume** — a narrow classification or extraction run millions of
  times, where a small tuned model matches a large prompted one at a fraction of the cost and
  latency.
- **Domain language** the model keeps getting wrong despite good prompts.
- **Distillation** — teach a small model to imitate a large one on one narrow task.

Not a reason: "teach it our documents". That's retrieval's job (Stage 3's comparison).

---

## Why most teams shouldn't — yet

- **Data:** you need hundreds to thousands of **high-quality, reviewed** examples, plus a
  separate eval set. Most teams have neither.
- **Evaluation:** without a strong eval, you can't tell whether the tuned model is better —
  or just different.
- **Maintenance:** new base models arrive often; a tuned model must be re-trained and
  re-evaluated to keep up, while a prompt usually just works on the new model.
- **Serving:** a self-hosted model means GPUs, scaling and monitoring you now own.

---

## The honest interview answer

*"I'd exhaust prompting, examples and retrieval first, with an eval set to measure each step.
I'd fine-tune when a narrow, high-volume task needs a smaller, cheaper, faster model and I
have enough reviewed data — and I'd keep the prompted large model as the baseline to beat."*`,
    docs: [
      {
        label: 'OpenAI — model optimization guide',
        url: 'https://platform.openai.com/docs/guides/model-optimization',
      },
      {
        label: 'Hugging Face — PEFT',
        url: 'https://huggingface.co/docs/peft',
      },
    ],
    glossary: [
      {
        term: 'fine-tuning',
        def: 'Training a model further on your own examples, changing its weights.',
      },
      {
        term: 'distillation',
        def: 'Training a smaller model to imitate a larger one on a task.',
      },
      {
        term: 'baseline',
        def: 'The simpler approach any new approach must beat on the eval.',
      },
    ],
    check: [
      {
        q: 'What comes before fine-tuning on the ladder?',
        a: `A better prompt, per-request few-shot examples, retrieval, structured outputs and tools, and possibly a different model.`,
      },
      {
        q: 'Why is fine-tuning the wrong way to add knowledge of your documents?',
        a: `Retrieval handles knowledge better: it's updatable, citable and permission-aware; fine-tuning bakes facts into weights and goes stale.`,
      },
      {
        q: 'Name the strongest real reason to fine-tune.',
        a: `A narrow, high-volume task where a small tuned model can match a large prompted one at far lower cost and latency.`,
      },
      {
        q: 'Why does fine-tuning add maintenance cost?',
        a: `Each new base model means re-training and re-evaluating the tuned model, whereas a prompt usually carries over.`,
      },
    ],
    practice: [
      {
        mode: 'decision',
        title: 'Fine-tune or not?',
        body: `1. Support tickets must be classified into 14 categories; 2 million a month; a prompted
   small model gets 91% and you need 96%.
2. The assistant doesn't know your company's new product line.
3. Answers must always follow a 5-part template; the prompted model follows it 97% of the
   time.
4. A legal-drafting tool whose outputs "don't sound like our firm".`,
        answer: `1. **A good candidate — after trying cheaper fixes.** First: better category definitions,
   per-request examples of confusable categories, a stronger model on the hard cases. If
   that stalls below 96% and you have (or can label) a few thousand examples, fine-tuning a
   small model is justified by the volume.
2. **No — retrieval.** Knowledge that changes belongs in documents, not weights.
3. **No — structured outputs** (or a template filled by the model's structured fields)
   make it 100%, today.
4. **Maybe, later.** Style is a real fine-tuning use, but first try examples of the firm's
   own documents in the prompt. If that doesn't hold, and you have hundreds of approved
   past drafts, a style fine-tune is reasonable.`,
      },
      {
        mode: 'read',
        title: 'Critique this proposal',
        body: `A team writes: "Our HR assistant sometimes invents policy details. We'll fine-tune an open
model on our 300 policy documents so it knows them properly. Budget: two engineers for a
month, plus GPU costs."

What would you say, and what would you propose instead?`,
        answer: `**The diagnosis doesn't match the cure.** Invented policy details are a **grounding**
problem: the model answers without (or beyond) the right passages. Fine-tuning on the
documents doesn't give citations, goes stale when a policy changes, can't respect who may
see which policy, and tends to blur similar facts together — it may invent *more*
confidently.

Propose instead, cheapest first:

1. **Measure it:** a golden set with unanswerable questions; faithfulness and citation
   checks (Stage 3).
2. **Fix retrieval:** structure-aware chunks, hybrid search, reranking, version filters —
   most invented details trace back to missing or outdated passages.
3. **Fix generation:** a grounding instruction with an escape hatch, citations (the
   Citations API), and a faithfulness gate.

Two engineers for a week on those will likely do more than a month of fine-tuning. If a
narrow behaviour problem remains afterwards (say, a strict answer format at huge volume),
*that* could be a fine-tuning candidate — with the eval already in place to prove it helps.`,
      },
    ],
  },
  {
    id: 's5.8.t2',
    moduleId: 's5.8',
    title: 'SFT, DPO and LoRA, conceptually',
    outcome: `You can explain supervised fine-tuning, preference tuning and LoRA in plain words — what data each needs and what each changes — without training anything yet.`,
    minutes: 30,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
      {
        kind: 'find',
        label: 'Visual',
        query: 'LoRA explained low rank adaptation visually',
        channel: '',
        reason: 'a visual explanation of low-rank adapters',
      },
    ],
    animations: ['anim-lora-adapter'],
    analogy: `Teaching a new cook: first by showing ideal dishes and saying "make it like this" (SFT);
then by tasting two versions and saying "this one, not that one" (preference tuning). And
instead of retraining the whole cook, you give them a small recipe card that adjusts their
habits for your restaurant (LoRA).`,
    notes: `## SFT: learn from examples

**Supervised fine-tuning** trains on pairs: an input, and the **ideal output**.

\`\`\`json
{"messages": [
  {"role": "user", "content": "Ticket: my parcel says delivered but I never got it"},
  {"role": "assistant", "content": "not_delivered"}]}
\`\`\`

The model learns to produce outputs like yours. Quality of the examples is everything: it
learns your mistakes as faithfully as your successes.

---

## Preference tuning: learn from comparisons

Sometimes it's easier to say which of two outputs is better than to write the perfect one.

- **DPO** (Direct Preference Optimization) trains on triples: prompt, **chosen** output,
  **rejected** output. It nudges the model toward the chosen kind, without training a
  separate reward model.
- **RLHF** trains a reward model on preferences, then optimises against it — more complex.
- Reinforcement learning with **verifiable rewards** (right answer, passing tests) is how many
  reasoning models are trained.

---

## LoRA: tune a small add-on, not the whole model

A model's big weight matrices have millions of numbers each. **LoRA** freezes them and learns
a small **low-rank** correction for each: two thin matrices, A and B, whose product is added
to the original.

For one 4,096 × 4,096 matrix:

- full fine-tuning: 4,096 × 4,096 = **16.8 million** trainable numbers
- LoRA with rank 16: 16 × (4,096 + 4,096) = **131,072** — about **0.8%**

So training needs far less memory, and the result is a small **adapter** file you can load on
top of the base model — even several adapters for several tasks.

---

## QLoRA: even less memory

Load the frozen base model in **4-bit** precision and train LoRA adapters on top. The QLoRA
paper fine-tuned a 65-billion-parameter model on a single 48 GB GPU. For you, it means small
models can be tuned on a free or cheap cloud GPU.

---

## What changes, and what doesn't

Tuning shifts **behaviour** — format, style, a narrow skill. It's poor at adding **facts** and
can make other abilities slightly worse (it "forgets" a little). Always evaluate the tuned
model on the task **and** on a few general checks.`,
    docs: [
      {
        label: 'LoRA paper (Hu et al., 2021)',
        url: 'https://arxiv.org/abs/2106.09685',
      },
      {
        label: 'DPO paper (Rafailov et al., 2023)',
        url: 'https://arxiv.org/abs/2305.18290',
      },
      {
        label: 'QLoRA paper (Dettmers et al., 2023)',
        url: 'https://arxiv.org/abs/2305.14314',
      },
    ],
    glossary: [
      {
        term: 'SFT',
        def: 'Supervised fine-tuning: training on input and ideal-output pairs.',
      },
      {
        term: 'DPO',
        def: 'Direct Preference Optimization: training on chosen versus rejected outputs.',
      },
      {
        term: 'LoRA',
        def: 'Low-Rank Adaptation: training small add-on matrices while the base weights stay frozen.',
      },
      {
        term: 'QLoRA',
        def: 'LoRA on top of a base model loaded in 4-bit precision.',
      },
      {
        term: 'adapter',
        def: 'The small set of trained LoRA weights, loaded on top of a base model.',
      },
    ],
    check: [
      {
        q: 'What data does SFT need?',
        a: 'Pairs of inputs and ideal outputs.',
      },
      {
        q: 'What data does DPO need, and what does it avoid?',
        a: 'Triples of prompt, chosen output and rejected output; it avoids training a separate reward model.',
      },
      {
        q: 'How many trainable numbers does rank-16 LoRA add to a 4,096 × 4,096 matrix?',
        a: '16 × (4,096 + 4,096) = 131,072 — about 0.8% of the 16.8 million in the full matrix.',
      },
      {
        q: 'What does QLoRA change?',
        a: `The frozen base model is loaded in 4-bit precision, cutting memory so larger models can be tuned on a single GPU.`,
      },
    ],
    practice: [
      {
        mode: 'primitive',
        title: 'Count LoRA\'s parameters',
        body: `Without AI: \`lora_share(d, k, r)\` returns LoRA's trainable parameters for one d × k
matrix and its share of the full matrix. Then estimate a whole model: 28 layers, each with
7 adapted matrices of about 896 × 896 (roughly a 0.5B model's attention and MLP projections
— use that as a simplification), at rank 16.`,
        answer: `\`\`\`python
def lora_share(d: int, k: int, r: int):
    lora = r * (d + k)
    return lora, lora / (d * k)

print(lora_share(4096, 4096, 16))           # (131072, 0.0078)

per_matrix, _ = lora_share(896, 896, 16)    # 28,672
total = 28 * 7 * per_matrix
print(total)                                 # 5,619,712 — about 5.6 million
\`\`\`

About **5.6 million** trainable numbers against roughly half a billion in the model — around
1%. (Real MLP matrices are wider than 896 × 896, so the true count is somewhat higher; the
order of magnitude is what matters.) That's why LoRA training fits on a small GPU: the
optimiser only tracks the adapters, and the adapter file is a few megabytes to tens of
megabytes, not gigabytes.`,
      },
      {
        mode: 'decision',
        title: 'Which method?',
        body: `1. You have 3,000 tickets with correct category labels.
2. You have 800 pairs of draft replies where support staff marked one as better.
3. You want the model to write in your firm's style, and have 400 approved documents.`,
        answer: `1. **SFT** — input/ideal-output pairs are exactly its data. (With LoRA, on a small model.)
2. **DPO** — preference pairs are exactly its data; it learns what "better" means to your
   team without a hand-written ideal for every case.
3. **SFT on the approved documents** (as ideal outputs for their prompts or briefs), then
   possibly DPO later if staff start rating drafts. But first: try the examples in the
   prompt (s5.8.t1) — 400 documents may be enough for good few-shot selection.`,
      },
    ],
  },
  {
    id: 's5.8.t3',
    moduleId: 's5.8',
    title: 'One small LoRA run — then stop',
    outcome: `You have fine-tuned one small open model with LoRA on a narrow task, compared it honestly with prompted models, and can talk about it from experience.`,
    minutes: 60,
    sources: [
      {
        kind: 'deck',
        label: 'Slides',
        reason: 'written for you, always current',
      },
      {
        kind: 'find',
        label: 'Visual',
        query: 'fine-tune small LLM with LoRA TRL Colab tutorial',
        channel: '',
        reason: 'a hands-on run on a free GPU',
      },
    ],
    animations: [],
    analogy: `Learning to change a car tyre once. You'll probably call roadside assistance most of the
time — but having done it yourself, you understand what's involved and can judge the people
doing it for you.`,
    notes: `## The task

Pick something **narrow** with a clear right answer:

- classify support tickets into your categories, or
- extract fields from invoices into a fixed JSON shape.

---

## The data

- 500–1,000 examples. Label them with a strong model **and review a sample by hand** — errors
  in the data become errors in the model.
- Hold out 20% as a test set you never train on.
- Chat format, one example per line:

\`\`\`json
{"messages": [{"role": "user", "content": "Ticket: ..."},
              {"role": "assistant", "content": "not_delivered"}]}
\`\`\`

---

## The training

With Hugging Face TRL and PEFT on a free cloud GPU:

\`\`\`python
from datasets import load_dataset
from peft import LoraConfig
from trl import SFTConfig, SFTTrainer

ds = load_dataset("json", data_files={"train": "train.jsonl", "test": "test.jsonl"})

trainer = SFTTrainer(
    model="Qwen/Qwen2.5-0.5B-Instruct",          # or another small open model
    train_dataset=ds["train"],
    args=SFTConfig(output_dir="out", num_train_epochs=2,
                   per_device_train_batch_size=8, learning_rate=2e-4),
    peft_config=LoraConfig(r=16, lora_alpha=32, lora_dropout=0.05,
                           target_modules="all-linear", task_type="CAUSAL_LM"),
)
trainer.train()
trainer.save_model("out/adapter")
\`\`\`

(Library APIs change between versions — check the TRL docs for the version you install.)

---

## The comparison — the real deliverable

On the held-out test set:

| Model | accuracy | latency | cost per 1,000 |
|---|---|---|---|
| base small model, prompted | | | |
| **small model + your LoRA** | | | |
| Haiku 4.5, prompted with examples | | | |

Plus: a few general questions to the tuned model, to see what it "forgot".

---

## Then stop

The goal isn't to become an ML training engineer in this roadmap. It's to be able to say, from
experience: what data it took, what it cost, how much it helped over prompting, and when you'd
recommend it. Write that up in one page, and move on to Stage 6.`,
    docs: [
      {
        label: 'Hugging Face TRL — SFT trainer',
        url: 'https://huggingface.co/docs/trl/sft_trainer',
      },
      {
        label: 'Hugging Face PEFT — LoRA',
        url: 'https://huggingface.co/docs/peft/conceptual_guides/lora',
      },
    ],
    glossary: [
      {
        term: 'held-out test set',
        def: 'Examples kept out of training, used only to measure the result.',
      },
      {
        term: 'overfitting',
        def: 'Learning the training examples too closely, so performance on new data drops.',
      },
      {
        term: 'epoch',
        def: 'One full pass over the training data.',
      },
      {
        term: 'TRL',
        def: 'Hugging Face\'s library for training language models with SFT, DPO and more.',
      },
    ],
    check: [
      {
        q: 'Why hold out 20% of the data?',
        a: `To measure the tuned model on examples it never trained on — otherwise you can't tell learning from memorising.`,
      },
      {
        q: 'Why review a sample of model-generated labels?',
        a: 'Label errors become model errors; the tuned model learns mistakes as faithfully as correct answers.',
      },
      {
        q: 'What three models should the comparison include?',
        a: `The base small model prompted, the small model with your LoRA adapter, and a prompted API model like Haiku 4.5 with examples.`,
      },
      {
        q: 'What\'s the real deliverable of this exercise?',
        a: `An honest comparison and a one-page write-up: data needed, cost, gain over prompting, and when you'd recommend fine-tuning.`,
      },
    ],
    practice: [
      {
        mode: 'tool',
        title: 'Run it and compare',
        body: `Do the run above on your chosen task. Fill in the comparison table on the held-out set,
test five general questions for forgetting, and write a one-page summary: data, training
time and cost, results, and your recommendation.`,
        answer: `What typical results look like:

- **Base small model, prompted:** clearly the weakest — small models struggle with many
  categories from instructions alone.
- **Small model + LoRA:** a large jump, often close to the prompted API model on this one
  narrow task — and much faster and cheaper per request if you serve it yourself at volume.
- **Haiku 4.5 with examples:** strong with no training at all, and no infrastructure.

The general-question check usually shows the tuned model has become narrower (it may answer
unrelated questions with a category label).

A good write-up concludes with numbers and a condition: "LoRA on a 0.5B model reached 94%
vs Haiku's 95%, at a fraction of the per-request cost — worth it above roughly N million
requests a month, if we're willing to run GPUs. Below that, the prompted API model wins."`,
      },
      {
        mode: 'read',
        title: 'What went wrong in this run?',
        body: `Training loss dropped smoothly to near zero. On the held-out set, accuracy is 62% — worse
than the prompted base model (70%). The training data was 300 examples, generated by a
model and not reviewed; 4 epochs.

What are the likely causes, and what do you try?`,
        answer: `Likely causes:

- **Overfitting:** near-zero training loss on 300 examples for 4 epochs means it memorised
  them. It learned the training set, not the task.
- **Noisy labels:** unreviewed model-generated labels — some fraction wrong — taught
  confidently.
- **Too little data** for the number of categories, or unbalanced categories (the model
  learned to over-predict the common ones).

Try, in order: **review and fix labels** (even 300 good labels beat 300 noisy ones); **more
data** for weak categories; **fewer epochs** (1–2) and watch the held-out score during
training, not just training loss; then compare again. And keep the honest conclusion open:
if it still can't beat the prompted model, the answer is "don't fine-tune this task".`,
      },
    ],
  },
];
