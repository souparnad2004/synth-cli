# synth-cli

Ask one question, get the best of several AI models.

`synth-cli` is a command-line tool that fires your prompt at **multiple AI
providers at once** — OpenAI, Google Gemini, and a free OpenRouter model — then
has a judge model synthesize the strongest, most accurate final answer from all
of their responses.

## Features

- ⚡ **Parallel fan-out** — every provider is queried simultaneously
- 🧠 **Collaborative synthesis** — a final pass merges, corrects, and dedupes the answers
- 🆓 **Free model included** via OpenRouter (`poolside/laguna-s-2.1:free`)
- 📦 **Zero runtime config** — reads keys from `.env` or real environment variables

## Requirements

- **Node.js 20.6+** (uses `process.loadEnvFile`)
- **[pnpm](https://pnpm.io) 9+**

## Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Create your environment file and add your API keys
cp .env.example .env
#    → fill in at least one of: OPENAI_API_KEY, GEMINI_API_KEY, OPENROUTER_API_KEY

# 3. Build
pnpm build
```

> ⚠️ A provider whose key is missing will fail its request — and since the CLI
> currently exits when **any** provider errors, make sure every key you intend to
> use is present.

## Usage

```bash
# via pnpm (loads .env for you)
pnpm start -- "What is the difference between TCP and UDP?"

# or directly (the script loads .env itself)
node dist/index.js "What is the difference between TCP and UDP?"

# run from TypeScript sources after a build
node --env-file=.env dist/index.js "your question"
```

The CLI:

1. prints `Asking: <question>...`
2. queries every provider in parallel
3. hands all answers to a final "comparison" pass
4. streams the single consolidated answer to stdout

**Exit codes** — `0` on success, `1` on usage error (no question given) or when a
provider request fails.

## Configuration

Keys are read from `.env` (loaded automatically by the script) or from existing
environment variables (which always win).

| Variable              | Provider                   | Model                    | Where to get the key            |
| --------------------- | -------------------------- | ------------------------ | ------------------------------- |
| `OPENAI_API_KEY`      | OpenAI                     | `gpt-4o-mini`            | https://platform.openai.com     |
| `GEMINI_API_KEY`      | Google Gemini             | `gemini-3.6-flash`       | https://aistudio.google.com     |
| `OPENROUTER_API_KEY`  | OpenRouter (free model)    | `poolside/laguna-s-2.1:free` | https://openrouter.ai       |

## How it works

```
                  ┌───────────────┐
  your question ─▶│   synth-cli   │
                  └───────┬───────┘
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
     OpenAI           Gemini             OpenRouter
  gpt-4o-mini    gemini-3.6-flash    laguna-s-2.1:free
        │                  │                  │
        └──────────────────┴──────────────────┘
                       (answers)
                           │
                           ▼
           OpenAI gpt-4o-mini  "comparison" pass
                  (streams the final answer)
```

1. **Fan-out** — all providers are asked in parallel via `Promise.allSettled`.
2. **Guard** — a failed provider prints the provider-specific error, the raw
   reason, and a remedy hint, then the process exits with code `1`.
3. **Synthesis** — the `ComparisonProvider` evaluates accuracy, relevance,
   completeness, and reasoning across all answers, corrects mistakes, and
   streams one final answer (no model names, no comparison chatter).

## Project layout

```
synth-cli/
├── src/
│   ├── index.ts               # CLI entry point: loads .env, parses args, orchestrates
│   └── providers/
│       ├── types.ts           # AIProvider / AIResponse interfaces
│       ├── openai.ts          # OpenAI provider (gpt-4o-mini)
│       ├── gemini.ts          # Google Gemini provider (gemini-3.6-flash)
│       ├── freeModel.ts       # OpenRouter free-model provider
│       └── comparison.ts      # Final answer synthesizer (streams output)
├── dist/                      # Build output (gitignored)
├── .env                       # Your API keys (gitignored)
├── .env.example               # Key template — copy to .env
├── package.json
├── pnpm-workspace.yaml
└── tsconfig.json
```

## Troubleshooting

- **`Provider returned error` + `Tip: ...`** — the CLI prints a remedy hint from
  the provider. Most often a missing, expired, or mis-scoped API key. Double-check
  `.env` and regenerate the key if needed.
- **`Usage: node index.js 'question'`** — you forgot the question text; put it in
  quotes: `pnpm start -- "your question"`.
- **Keys not picked up** — make sure `.env` lives in the project root (next to
  `package.json`) and that `pnpm build` re-ran after any source changes.

## License

ISC