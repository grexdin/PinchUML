/**
 * Web Worker — all API calls run here for API key isolation.
 *
 * The main thread posts { kind: 'generate', scenario, connection }.
 * This worker does retrieval + LLM generation and posts back the result.
 * The API key never leaves this worker's memory.
 */

import type { ConnectionSettings, EmbeddingIndex, IndexedDoc, WorkerReply } from './types'
import { retrieve } from './rag'

let indexCache: EmbeddingIndex | null = null
let indexLoading: Promise<EmbeddingIndex> | null = null

async function loadIndex(): Promise<EmbeddingIndex> {
  if (indexCache) return indexCache
  if (indexLoading) return indexLoading

  indexLoading = fetch('/embeddings-index.json')
    .then((res) => {
      if (!res.ok) throw new Error(`Failed to load index: ${res.status}`)
      return res.json() as Promise<EmbeddingIndex>
    })
    .then((index) => {
      indexCache = index
      return index
    })

  return indexLoading
}

// Trim doc content to keep the prompt focused. The first portion of each
// reference doc contains the most important syntax patterns and examples.
function trimContent(content: string, maxLen = 2000): string {
  if (content.length <= maxLen) return content
  return content.slice(0, maxLen) + '\n\n[...truncated]'
}

function buildSystemPrompt(docs: IndexedDoc[], scenario: string): string {
  const docSections = docs
    .map((doc) => `## ${doc.title}\n\n${trimContent(doc.content)}`)
    .join('\n\n---\n\n')

  return `You are a PlantUML diagram generator. Output ONLY valid PlantUML code.
No markdown fences, no explanation — just the code wrapped in @startuml ... @enduml.

## Diagram type selection

Choose the right diagram type based on the user's description. Pick the simplest,
most reliable type that fits — do not reach for obscure types unless asked by name.

- **Sequence diagram**: interactions, message flows, API calls, login/auth, request-response.
  Use \`participant\`, \`->\` for messages, \`-->\` for returns, \`activate\`/\`deactivate\`.
- **Activity diagram**: workflows, processes, pipelines, decision trees, checkout flows.
  Use \`:step;\` syntax, \`if/else/endif\` for branches, \`repeat\`/\`repeatwhile\` for loops.
  Start with \`start\` and end with \`stop\` (or \`end\`). Never use \`(*)\` — that is legacy syntax.
  Every activity diagram must have exactly ONE \`start\` and ONE \`stop\`/\`end\`.
  Never copy-paste the same logic block — use a loop or a merge/decision instead.
- **Component diagram**: system architecture, microservices, service topology.
  Use \`[Component]\` or \`component\` keyword, arrows for relationships.
- **Class diagram**: domain models, entities, object structures, inheritance.
  Use \`class\` keyword, \`+\` \`-\` \`#\` for visibility, relationships with arrows.
- **Deployment diagram**: infrastructure, servers, nodes, cloud architecture.
  Use \`node\`, \`artifact\`, \`database\`, \`cloud\`.

Default to sequence diagrams for any interaction or message flow. They are the most
reliable type. Do NOT use timing, Gantt, mindmap, or other rare diagram types unless
the user's request explicitly names them.

## Reference Documentation

Use the syntax patterns below as your authoritative reference. Copy the exact forms
shown — do not invent keywords or structures that are not in these docs.

${docSections}

## Rules

1. Output ONLY the PlantUML code — no markdown fences, no explanation text.
2. Always wrap in @startuml ... @enduml.
3. Copy syntax patterns exactly from the reference docs above.
4. Include a \`title\` on the first line after @startuml.
5. Keep the diagram clean and readable. Avoid overly complex structures.
6. Use skinparam or style directives from the reference when they add clarity.

## User Request

${scenario}

## PlantUML Code`
}

async function callLLM(
  scenario: string,
  connection: ConnectionSettings,
  index: EmbeddingIndex,
): Promise<string> {
  const { docs } = retrieve(index, scenario, 5)
  const systemPrompt = buildSystemPrompt(docs, scenario)

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 60000)

  try {
    const response = await fetch(connection.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${connection.apiKey}`,
      },
      body: JSON.stringify({
        model: connection.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: scenario },
        ],
        temperature: 0.2,
        max_tokens: 8192,
      }),
      signal: controller.signal,
    })

    if (!response.ok) {
      const body = await response.text().catch(() => '')
      if (response.status === 401 || response.status === 403) {
        throw new Error('Authentication failed — check your API key')
      }
      if (response.status === 404) {
        throw new Error('Endpoint not found — check the URL (did you include /v1/chat/completions?)')
      }
      if (response.status === 429) {
        throw new Error('Rate limited — wait a moment and try again')
      }
      throw new Error(
        `Endpoint returned ${response.status}: ${body.slice(0, 300)}`,
      )
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>
      error?: { message: string }
    }

    if (data.error) {
      throw new Error(`LLM error: ${data.error.message}`)
    }

    let content = data.choices?.[0]?.message?.content
    if (!content) {
      throw new Error('LLM returned empty response')
    }

    // Strip code fences if present
    content = content.trim()
    if (content.startsWith('```')) {
      content = content
        .replace(/^```[\w]*\n?/i, '')
        .replace(/\n?```$/i, '')
        .trim()
    }

    // Ensure @startuml/@enduml wrappers
    if (!content.startsWith('@startuml')) {
      content = `@startuml\n${content}`
    }
    if (!content.endsWith('@enduml')) {
      content = `${content}\n@enduml`
    }

    return content
  } finally {
    clearTimeout(timeout)
  }
}

self.onmessage = async (event: MessageEvent) => {
  const { kind, scenario, connection } = event.data

  // Both 'generate' and 'retry' run the full RAG pipeline fresh.
  // A retry is just another attempt from scratch — the LLM gets a
  // different random seed and may produce correct output on the second try.
  if (kind === 'generate' || kind === 'retry') {
    if (!scenario || !connection?.endpoint || !connection?.apiKey || !connection?.model) {
      const reply: WorkerReply = {
        kind: 'error',
        message: 'Missing scenario, endpoint, API key, or model',
      }
      self.postMessage(reply)
      return
    }

    try {
      const index = await loadIndex()
      const result = await callLLM(scenario, connection, index)
      const reply: WorkerReply = { kind: 'result', plantuml: result }
      self.postMessage(reply)
    } catch (err) {
      let message: string
      if (err instanceof TypeError && err.message.includes('fetch')) {
        message = 'Network error — check your endpoint URL and that the server allows cross-origin requests (CORS)'
      } else if (err instanceof DOMException && err.name === 'AbortError') {
        message = 'Request timed out after 60 seconds'
      } else {
        message = err instanceof Error ? err.message : String(err)
      }
      const reply: WorkerReply = { kind: 'error', message }
      self.postMessage(reply)
    }
    return
  }
}
