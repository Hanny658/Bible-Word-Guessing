# Bible Word Daily · 字里经心

A small daily Bible-themed word game built with Next.js. Every UTC day selects one of 580 four-to-seven-letter answers, gives players a length-based number of attempts, and reveals a short English or Chinese explanation with a KJV sample verse.

## Run locally

```bash
pnpm install
pnpm dev
```

Open <http://localhost:3000>. No account, database, or environment variables are required.

## Data flow

- `data/answers.json` is committed runtime data and is imported through a `server-only` module.
- `GET /api/daily` returns the UTC day's single answer and reveal content.
- `public/words/v1/guesses-{4,5,6,7}.txt` contains static acceptable guesses. The browser downloads only the list matching today's answer length.
- Board progress and language preference are stored only in the browser's `localStorage`.
- `.doc/bible_word_candidates.csv` remains an ignored working document and is not required by production builds.

The ordinary English guesses come from [`word-list`](https://github.com/sindresorhus/word-list), an MIT-licensed word list. Bible answer terms are added to that set during generation.

## Data maintenance

```bash
pnpm data:import    # import working CSV, preserving existing explanations
pnpm data:words     # regenerate the four versioned guess lists
pnpm data:validate  # validate all answers and answer/guess-set invariants
```

When the answer data or word lists change, create a new dataset version instead of replacing files under `public/words/v1`, because v1 assets are served with immutable cache headers.

## Verification

```bash
pnpm test
pnpm lint
pnpm build
```

`pnpm build` uses Next.js's webpack builder because the default Turbopack production build did not complete reliably in the original Windows workspace. Development still uses the default Next.js dev server.
