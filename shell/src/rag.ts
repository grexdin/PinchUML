import type { EmbeddingIndex, IndexedDoc } from './types'

/**
 * Retrieve the most relevant PlantUML syntax documents for a user scenario.
 *
 * Uses TF-IDF cosine similarity against a precomputed corpus index.
 * Designed to run inside a Web Worker — no DOM or network access needed.
 */

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
  'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
  'could', 'should', 'may', 'might', 'can', 'shall', 'you', 'your',
  'it', 'its', 'they', 'them', 'their', 'this', 'that', 'these', 'those',
  'not', 'no', 'nor', 'so', 'if', 'then', 'than', 'too', 'very', 'just',
  'about', 'above', 'after', 'again', 'all', 'also', 'any', 'as',
  'because', 'before', 'between', 'both',
])

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9_]+/)
    .filter((t) => t.length >= 2 && !STOP_WORDS.has(t))
}

function dot(a: number[], b: number[]): number {
  let sum = 0
  for (let i = 0; i < a.length; i++) {
    sum += a[i] * b[i]
  }
  return sum
}

function norm(v: number[]): number {
  let sum = 0
  for (let i = 0; i < v.length; i++) {
    sum += v[i] * v[i]
  }
  return Math.sqrt(sum)
}

export function retrieve(
  index: EmbeddingIndex,
  scenario: string,
  topK: number = 3,
): { docs: IndexedDoc[]; debug: string[] } {
  const { vocabulary, idf, docs } = index

  // Tokenize and build query TF vector
  const queryTokens = tokenize(scenario)
  const queryTf = new Map<string, number>()
  for (const t of queryTokens) {
    queryTf.set(t, (queryTf.get(t) || 0) + 1)
  }

  // Build query TF-IDF vector
  const queryVec = new Array(vocabulary.length).fill(0)
  for (let i = 0; i < vocabulary.length; i++) {
    const term = vocabulary[i]
    const tf = (queryTf.get(term) || 0) / queryTokens.length
    queryVec[i] = tf * idf[i]
  }

  const queryNorm = norm(queryVec)
  if (queryNorm === 0) {
    // No matching terms — fall back to first N docs
    return {
      docs: docs.slice(0, topK),
      debug: ['No matching vocabulary terms'],
    }
  }

  // Cosine similarity against each doc
  const scored = docs.map((doc) => ({
    doc,
    score: dot(queryVec, doc.vector) / (queryNorm * norm(doc.vector)),
  }))

  scored.sort((a, b) => b.score - a.score)

  // Debug info for panel
  const debug = scored.slice(0, topK).map(
    (s) => `${s.doc.title} (${s.score.toFixed(3)})`,
  )

  return {
    docs: scored.slice(0, topK).map((s) => s.doc),
    debug,
  }
}
