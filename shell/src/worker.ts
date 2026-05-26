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

function buildFixPrompt(
  scenario: string,
  plantuml: string,
  renderError: string,
): string {
  return `You generated PlantUML code that has a syntax error. Fix it and output only the corrected code.

Original request: ${scenario}

Your PlantUML code that produced an error:
\`\`\`plantuml
${plantuml}
\`\`\`

Error from the PlantUML renderer:
${renderError}

Fix the errors and output ONLY the corrected PlantUML code, wrapped in @startuml ... @enduml. Do not include any explanation.`
}

async function callLLMFix(
  scenario: string,
  plantuml: string,
  renderError: string,
  connection: ConnectionSettings,
): Promise<string> {
  const prompt = buildFixPrompt(scenario, plantuml, renderError)

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
          { role: 'user', content: prompt },
        ],
        temperature: 0.1,
        max_tokens: 4096,
      }),
      signal: controller.signal,
    })

    if (!response.ok) {
      const body = await response.text().catch(() => '')
      throw new Error(
        `LLM returned ${response.status} on retry: ${body.slice(0, 200)}`,
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
      throw new Error('LLM returned empty response on retry')
    }

    content = content.trim()
    if (content.startsWith('```')) {
      content = content
        .replace(/^```[\w]*\n?/i, '')
        .replace(/\n?```$/i, '')
        .trim()
    }

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
  const { kind, scenario, connection, plantuml, renderError } = event.data

  if (kind === 'retry') {
    if (!plantuml || !renderError || !connection?.endpoint || !connection?.apiKey) {
      const reply: WorkerReply = {
        kind: 'error',
        message: 'Missing data for retry',
      }
      self.postMessage(reply)
      return
    }

    try {
      const fixed = await callLLMFix(scenario, plantuml, renderError, connection)
      const reply: WorkerReply = { kind: 'result', plantuml: fixed }
      self.postMessage(reply)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      const reply: WorkerReply = { kind: 'error', message }
      self.postMessage(reply)
    }
    return
  }

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
}
