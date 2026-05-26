# PinchUML

A browser-based PlantUML editor. Open it, point at any OpenAI-compatible LLM endpoint, and generate diagrams from plain-English scenarios. No server, no setup— your API key never touches a backend you don't control.

---

## What this is about

LLMs are capable of generating PlantUML, but without the right syntax context the output is often naive, syntactically wrong, or visually unappealing. I found myself reaching for the manual every time because the syntax and rules for each diagram type are unique. It was frustrating, yet the potential was clearly there.

PinchUML solves this by mechanically routing the right reference material into the prompt. You type a scenario, the app finds the most relevant syntax docs from the full PlantUML corpus, and feeds them to the LLM as a system prompt. The result: diagrams that are accurate, properly structured, and visually coherent.

This project is also about something broader. AI is practical now in a way it wasn't even a year ago. The tools exist for anyone to build things that would have taken entire teams. The limiting factor is no longer technical capability — it is the ability to spot a real problem, understand the domain, and build a focused solution around it. PinchUML is that process applied to one concrete friction point. The real output is not the code; it is the methodology: identify the gap, understand the domain, build a prototype, iterate.

---

## Architecture

### Core principle

The webapp ships with the full PlantUML syntax corpus as precomputed embeddings. The user provides only an LLM endpoint URL.

- **Zero-trust.**: The API key never lives in main-thread memory. All API calls (retrieval + generation) run inside a Web Worker. No server, except for the end user's endpoint, ever sees it.
- **BYO-LLM.**: Compatible with any OpenAI-style endpoint.
- **Embeddings: TF-IDF, planned semantic.** . A future upgrade will regenerate with `text-embedding-3-small`.
- **TF-IDF (Term Frequency-Inverse Document Frequency)**: The shipped index uses keyword-based TF-IDF vectors, which works well for a domain-specific corpus
- **Static deploy.**: Diagram rendering fully in the browser via TeaVM compilation.

---

## Repository layout

```
pinchuml/
├── shell/                  # The webapp — built and deployed to gh-pages
│   ├── public/
│   │   ├── plantuml.js    # TeaVM PlantUML → SVG renderer
│   │   ├── viz-global.js  # Graphviz library
│   │   ├── *.min.js       # Sprite libraries (IBM, AWS, Azure, etc.)
│   │   └── embeddings-index.json  # Precomputed TF-IDF vectors
│   ├── src/
│   │   ├── components/    # React components (Header, PromptInput, DiagramView)
│   │   ├── rag.ts         # RAG pipeline: embed → retrieve → build prompt (fallback)
│   │   ├── worker.ts      # Web Worker — all API calls run here (key isolation)
│   │   ├── demos.ts       # Built-in demo scenarios for quick testing
│   │   ├── App.tsx        # Main orchestrator
│   │   └── index.css      # Dark/light mode styles
│   ├── vite.config.ts     # Dev proxy: /v1/* → localhost:18789
│   ├── index.html
│   └── package.json
│
└── mind/                  # Developer workspace (not distributed)
    ├── memory/
    │   └── *.md           # Preprocessed PlantUML syntax references
    └── test-pipeline.sh   # Automated curl-based pipeline test
```

### The webapp

A Vite + React + TypeScript single-page PlantUML editor. Bundled assets include:

- **TeaVM renderer**: a Java-to-JS compiled PlantUML engine loaded lazily at runtime. Runs entirely in the browser. Zero server calls for rendering.
- **Syntax corpus**: precomputed embedding vectors shipped as a static asset.
- **Connection UI** — collapsible panel for endpoint URL, API key (Web Worker isolated), and model name.
- **Demo scenarios** — built-in prompts covering sequence, activity, component, and class diagrams.
- **CSP headers** — Content Security Policy meta tag restricts connect-src, script-src, and worker-src.

### `mind/` — developer workspace

TODO (this section covers the use of openclaw for agentic development

---

## How it works end-to-end

### For the user

1. Open the app in a browser.
2. Enter an OpenAI-compatible endpoint URL and API key.
3. Pick a model name.
4. Type a scenario in plain English: *"Show a user logging in, the auth service validates JWT, and the API returns user data."* — or click a demo chip.
5. Press Ctrl+Enter or click Generate.
6. The app retrieves the most relevant syntax docs, builds a strict system prompt, and sends it to the LLM.
7. The returned PlantUML code is rendered as SVG in-browser via the TeaVM engine. Copy, save, or edit the diagram.

### Under the hood

Steps 1–4 run inside a **Web Worker** so the API key never touches main-thread memory. TF-IDF (Term Frequency-Inverse Document Frequency):

1. **Embed** — the scenario is embedded locally.
2. **Retrieve** — cosine similarity selects the top-k most relevant syntax documents.
3. **Prompt** — the selected docs form the system prompt.
4. **Generate** — `POST /v1/chat/completions` returns the PlantUML code.
5. **Render** — the TeaVM engine converts the code to SVG in-browser.


