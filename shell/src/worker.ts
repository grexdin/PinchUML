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

  // Fetch from origin root — public/ is served at / in both dev and production
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

function buildSystemPrompt(docs: IndexedDoc[], scenario: string): string {
  const docSections = docs
    .map((doc) => `## ${doc.title}\n\n${doc.content}`)
    .join('\n\n---\n\n')

  return `You are a PlantUML diagram generator. Generate valid, well-structured PlantUML code based on the user's description.

Follow the syntax rules and patterns shown in the reference documentation below. This is the authoritative guide — use it.

## Reference Documentation

${docSections}

## Rules

1. Output ONLY the PlantUML code — no explanation, no markdown fences.
2. Always wrap in @startuml ... @enduml.
3. Use proper syntax exactly as shown in the reference docs.
4. Include a title using the title keyword.
5. Keep the diagram clean, properly aligned, and readable.
6. If the user describes a sequence, use -> for messages, --> for dotted returns.
7. For components use [name] or component keyword.
8. For classes use proper UML notation with + - # visibility markers.
9. For activities use :step; syntax with if/else/endif for branches.
10. Use skinparam or style directives from the reference if helpful.

## User Request

${scenario}

## PlantUML Code`
}

async function callLLM(
  scenario: string,
  connection: ConnectionSettings,
  index: EmbeddingIndex,
): Promise<string> {
  const { docs } = retrieve(index, scenario, 3)
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
        max_tokens: 4096,
      }),
      signal: controller.signal,
    })

    if (!response.ok) {
      const body = await response.text().catch(() => '')
      throw new Error(
        `LLM endpoint returned ${response.status}: ${body.slice(0, 300)}`,
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

  if (kind !== 'generate') {
    return
  }

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
    const plantuml = await callLLM(scenario, connection, index)
    const reply: WorkerReply = { kind: 'result', plantuml }
    self.postMessage(reply)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    const reply: WorkerReply = { kind: 'error', message }
    self.postMessage(reply)
  }
}
