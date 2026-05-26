import type { EmbeddingIndex, IndexedDoc } from './types'

/**
 * Retrieve the most relevant PlantUML syntax documents for a user scenario.
 *
 * Uses TF-IDF cosine similarity with keyword-based score boosting
 * to ensure the right diagram-type docs rank highest.
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

// Keyword boosts: if the query contains any of these terms, boost the
// corresponding doc's score by the multiplier. This prevents TF-IDF
// from retrieving irrelevant docs (e.g., YAML docs for a deployment query).
const BOOSTS: Record<string, { terms: string[]; multiplier: number }> = {
  'deployment-diagram': { terms: ['deploy', 'zone', 'server', 'node', 'infrastructure', 'host', 'cdn', 'availability', 'replica', 'cluster', 'load balancer'], multiplier: 4.0 },
  'sequence-diagram': { terms: ['sequence', 'message', 'login', 'auth', 'authenticate', 'call', 'request', 'response', 'return', 'session', 'token', 'jwt', 'credential'], multiplier: 4.0 },
  'class-diagram': { terms: ['class', 'domain model', 'entity', 'attribute', 'method', 'inherit', 'abstract', 'relation', 'object', 'interface', 'getter', 'setter'], multiplier: 4.0 },
  'component-diagram': { terms: ['component', 'service', 'topology', 'microservice', 'architecture', 'module', 'dependency', 'system design', 'integration', 'gateway', 'route', 'api', 'database', 'broker', 'queue'], multiplier: 4.0 },
  'activity-diagram': { terms: ['activity', 'workflow', 'process', 'pipeline', 'checkout', 'step', 'flow', 'decision', 'branch', 'approval'], multiplier: 4.0 },
  'state-diagram': { terms: ['state', 'lifecycle', 'transition', 'status', 'event', 'idle', 'active'], multiplier: 4.0 },
  'use-case-diagram': { terms: ['actor', 'use case', 'usecase'], multiplier: 4.0 },
  'er-diagram': { terms: ['entity relationship', 'er diagram', 'entity'], multiplier: 4.0 },
  'mindmap-diagram': { terms: ['mindmap', 'mind map', 'brainstorm'], multiplier: 4.0 },
  'gantt-diagram': { terms: ['gantt', 'timeline', 'project plan', 'schedule', 'milestone'], multiplier: 4.0 },
  'timing-diagram': { terms: ['timing', 'time diagram', 'clock', 'signal'], multiplier: 4.0 },
}

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

function computeBoost(docId: string, queryLower: string): number {
  const config = BOOSTS[docId]
  if (!config) return 1.0

  for (const term of config.terms) {
    if (queryLower.includes(term)) {
      return config.multiplier
    }
  }
  return 1.0
}

export function retrieve(
  index: EmbeddingIndex,
  scenario: string,
  topK: number = 5,
): { docs: IndexedDoc[]; debug: string[] } {
  const { vocabulary, idf, docs } = index

  const queryTokens = tokenize(scenario)
  const queryTf = new Map<string, number>()
  for (const t of queryTokens) {
    queryTf.set(t, (queryTf.get(t) || 0) + 1)
  }

  const queryVec = new Array(vocabulary.length).fill(0)
  for (let i = 0; i < vocabulary.length; i++) {
    const term = vocabulary[i]
    const tf = (queryTf.get(term) || 0) / queryTokens.length
    queryVec[i] = tf * idf[i]
  }

  const queryNorm = norm(queryVec)
  if (queryNorm === 0) {
    return {
      docs: docs.slice(0, topK),
      debug: ['No matching vocabulary terms'],
    }
  }

  const queryLower = scenario.toLowerCase()

  const scored = docs.map((doc) => {
    const baseScore = dot(queryVec, doc.vector) / (queryNorm * norm(doc.vector))
    const boost = computeBoost(doc.id, queryLower)
    return { doc, score: baseScore * boost }
  })

  scored.sort((a, b) => b.score - a.score)

  const debug = scored.slice(0, topK).map(
    (s) => `${s.doc.title} (${s.score.toFixed(3)})`,
  )

  return {
    docs: scored.slice(0, topK).map((s) => s.doc),
    debug,
  }
}
