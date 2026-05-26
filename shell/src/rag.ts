import type { EmbeddingIndex, IndexedDoc } from './types'

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

// Positive boost on keyword match; penalty when keywords don't match
// (penalizes broad-vocabulary docs that dominate raw TF-IDF).
type BoostConfig = { terms: string[]; multiplier: number; penalty?: number }

const BOOSTS: Record<string, BoostConfig> = {
  // Primary diagram types — 6x boost, no penalty
  'sequence-diagram': {
    terms: ['sequence', 'message', 'login', 'auth', 'authenticate', 'call', 'request', 'response', 'return', 'session', 'token', 'jwt', 'credential', 'participant'],
    multiplier: 6.0,
  },
  'activity-diagram-beta': {
    terms: ['activity', 'workflow', 'process', 'pipeline', 'checkout', 'step', 'flow', 'decision', 'branch', 'approval', 'ci/cd', 'cd pipeline', 'deploy', 'build', 'test', 'stage', 'release', 'promote', 'production', 'docker', 'github actions', 'jenkins', 'lint', 'compile'],
    multiplier: 8.0,
  },
  'component-diagram': {
    terms: ['component', 'service', 'topology', 'microservice', 'architecture', 'module', 'dependency', 'system design', 'integration', 'gateway', 'route', 'api', 'database', 'broker', 'queue'],
    multiplier: 6.0,
  },
  'class-diagram': {
    terms: ['class', 'domain model', 'entity', 'attribute', 'method', 'inherit', 'abstract', 'relation', 'object', 'interface', 'getter', 'setter'],
    multiplier: 6.0,
  },
  'deployment-diagram': {
    terms: ['deploy', 'zone', 'server', 'node', 'infrastructure', 'host', 'cdn', 'availability', 'replica', 'cluster', 'load balancer'],
    multiplier: 6.0,
  },
  // Specialized types — 4x boost, no penalty
  'state-diagram': {
    terms: ['state', 'lifecycle', 'transition', 'status', 'event', 'idle', 'active'],
    multiplier: 4.0,
  },
  'er-diagram': {
    terms: ['entity relationship', 'er', 'entity'],
    multiplier: 4.0, penalty: 0.3,
  },
  'gantt-diagram': {
    terms: ['gantt', 'timeline', 'project plan', 'schedule', 'milestone'],
    multiplier: 4.0,
  },
  'mindmap-diagram': {
    terms: ['mindmap', 'mind map', 'brainstorm'],
    multiplier: 4.0,
  },
  // Broad-vocabulary / utility docs — 6x boost on match, 0.2x penalty otherwise
  'timing-diagram': {
    terms: ['timing', 'time diagram', 'clock', 'signal'],
    multiplier: 6.0, penalty: 0.2,
  },
  'use-case-diagram': {
    terms: ['actor', 'use case', 'usecase'],
    multiplier: 4.0, penalty: 0.3,
  },
  'object-diagram': {
    terms: ['object diagram', 'instance', 'snapshot'],
    multiplier: 4.0, penalty: 0.3,
  },
  'archimate-diagram': {
    terms: ['archimate', 'enterprise architecture'],
    multiplier: 4.0, penalty: 0.3,
  },
  'files-diagram': {
    terms: ['file', 'directory', 'folder', 'tree', 'path'],
    multiplier: 4.0, penalty: 0.2,
  },
  'ie-diagram': {
    terms: ['information engineering', 'ie diagram'],
    multiplier: 4.0, penalty: 0.2,
  },
  'yaml': {
    terms: ['yaml', 'yml', 'yaml data'],
    multiplier: 4.0, penalty: 0.2,
  },
  'json': {
    terms: ['json', 'json data'],
    multiplier: 4.0, penalty: 0.2,
  },
  'salt': {
    terms: ['wireframe', 'mockup', 'salt', 'ui design'],
    multiplier: 4.0, penalty: 0.2,
  },
  'ditaa': {
    terms: ['ditaa', 'ascii art'],
    multiplier: 4.0, penalty: 0.2,
  },
  'ebnf': {
    terms: ['ebnf', 'grammar', 'syntax rule'],
    multiplier: 4.0, penalty: 0.2,
  },
  'regex': {
    terms: ['regex', 'regular expression'],
    multiplier: 4.0, penalty: 0.2,
  },
  'creole': {
    terms: ['creole', 'wiki markup'],
    multiplier: 4.0, penalty: 0.2,
  },
  'ascii-math': {
    terms: ['math', 'latex', 'formula', 'equation'],
    multiplier: 4.0, penalty: 0.2,
  },
  'nwdiag': {
    terms: ['network diagram', 'nwdiag', 'network topology'],
    multiplier: 4.0, penalty: 0.3,
  },
  'wbs-diagram': {
    terms: ['wbs', 'work breakdown', 'breakdown structure'],
    multiplier: 4.0, penalty: 0.2,
  },
  'sprite': {
    terms: ['sprite', 'icon', 'stereotype'],
    multiplier: 4.0, penalty: 0.2,
  },
  'openiconic': {
    terms: ['openiconic', 'icon set'],
    multiplier: 4.0, penalty: 0.2,
  },
  'link': {
    terms: ['hyperlink', 'url', 'link'],
    multiplier: 4.0, penalty: 0.2,
  },
  'chart-diagram': {
    terms: ['chart', 'graph', 'plot', 'bar chart', 'pie chart'],
    multiplier: 4.0, penalty: 0.3,
  },
  'chronology-diagram': {
    terms: ['chronology', 'chronological'],
    multiplier: 4.0, penalty: 0.2,
  },
  'activity-diagram-legacy': {
    terms: ['legacy activity', 'old activity'],
    multiplier: 1.0, penalty: 0.3,
  },
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9_]+/)
    .filter((t) => t.length >= 2 && !STOP_WORDS.has(t))
}

function dot(a: number[], b: number[]): number {
  let sum = 0
  for (let i = 0; i < a.length; i++) sum += a[i] * b[i]
  return sum
}

function norm(v: number[]): number {
  let sum = 0
  for (let i = 0; i < v.length; i++) sum += v[i] * v[i]
  return Math.sqrt(sum)
}

function computeBoost(docId: string, queryLower: string): number {
  const config = BOOSTS[docId]
  if (!config) return 1.0

  for (const term of config.terms) {
    if (queryLower.includes(term)) return config.multiplier
  }
  // No keyword match → apply penalty if configured
  return config.penalty ?? 1.0
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
    return { docs: docs.slice(0, topK), debug: ['No matching vocabulary terms'] }
  }

  const queryLower = scenario.toLowerCase()

  const scored = docs.map((doc) => {
    const baseScore = dot(queryVec, doc.vector) / (queryNorm * norm(doc.vector))
    const factor = computeBoost(doc.id, queryLower)
    return { doc, score: baseScore * factor, boosted: factor > 1.0 }
  })

  scored.sort((a, b) => b.score - a.score)

  // Force-include: if a keyword-matched doc didn't make the top K,
  // insert it, replacing the lowest-ranked non-boosted doc.
  const boostedIds = new Set(
    scored.filter((s) => s.boosted).map((s) => s.doc.id),
  )

  const result = scored.slice(0, topK)
  const resultIds = new Set(result.map((s) => s.doc.id))

  for (const bid of boostedIds) {
    if (resultIds.has(bid)) continue
    // Replace the lowest non-boosted doc
    for (let i = result.length - 1; i >= 0; i--) {
      if (!boostedIds.has(result[i].doc.id)) {
        const replacement = scored.find((s) => s.doc.id === bid)
        if (replacement) { result[i] = replacement; resultIds.add(bid) }
        break
      }
    }
  }

  // Move the MOST boosted doc to position 0 (top) so the LLM sees
  // the right diagram type's reference first.
  let bestBoostIdx = -1
  let bestBoostVal = 0
  for (let i = 0; i < result.length; i++) {
    if (result[i].boosted) {
      const factor = computeBoost(result[i].doc.id, queryLower)
      if (factor > bestBoostVal) {
        bestBoostVal = factor
        bestBoostIdx = i
      }
    }
  }
  if (bestBoostIdx > 0) {
    const [top] = result.splice(bestBoostIdx, 1)
    result.unshift(top)
  }

  const debug = result.map(
    (s) => `${s.doc.title} (${s.score.toFixed(3)}${s.boosted ? ' \u2605' : ''})`,
  )

  return { docs: result.map((s) => s.doc), debug }
}
