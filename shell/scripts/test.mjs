/**
 * PinchUML test harness — tests RAG retrieval quality for all demos.
 * Run from shell/:
 *   node scripts/test.mjs                                     # retrieval only
 *   PINCHUML_ENDPOINT="https://..." PINCHUML_KEY="sk-..." node scripts/test.mjs  # full test
 */

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
  'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
  'could', 'should', 'may', 'might', 'can', 'shall', 'you', 'your',
  'it', 'its', 'they', 'them', 'their', 'this', 'that', 'these', 'those',
  'not', 'no', 'nor', 'so', 'if', 'then', 'than', 'too', 'very', 'just',
])

const BOOSTS = {
  'sequence-diagram': { terms: ['sequence', 'message', 'login', 'auth', 'authenticate', 'call', 'request', 'response', 'return', 'session', 'token', 'jwt', 'credential', 'participant'], multiplier: 6.0 },
  'activity-diagram-beta': { terms: ['activity', 'workflow', 'process', 'pipeline', 'checkout', 'step', 'flow', 'decision', 'branch', 'approval', 'ci/cd', 'cd pipeline', 'deploy', 'build', 'test', 'stage', 'release', 'promote', 'production', 'docker', 'github actions', 'jenkins', 'lint', 'compile'], multiplier: 8.0 },
  'component-diagram': { terms: ['component', 'service', 'topology', 'microservice', 'architecture', 'module', 'dependency', 'gateway', 'route', 'api', 'database', 'broker', 'queue'], multiplier: 6.0 },
  'class-diagram': { terms: ['class', 'domain model', 'entity', 'attribute', 'method', 'inherit', 'abstract', 'relation', 'object', 'interface'], multiplier: 6.0 },
  'deployment-diagram': { terms: ['deploy', 'zone', 'server', 'node', 'infrastructure', 'host', 'cdn', 'availability', 'replica', 'cluster', 'load balancer'], multiplier: 6.0 },
  'timing-diagram': { terms: ['timing', 'time diagram', 'clock', 'signal'], multiplier: 6.0, penalty: 0.2 },
  'use-case-diagram': { terms: ['actor', 'use case', 'usecase'], multiplier: 4.0, penalty: 0.3 },
  'object-diagram': { terms: ['object diagram', 'instance', 'snapshot'], multiplier: 4.0, penalty: 0.3 },
  'archimate-diagram': { terms: ['archimate', 'enterprise architecture'], multiplier: 4.0, penalty: 0.3 },
  'files-diagram': { terms: ['file', 'directory', 'folder', 'tree', 'path'], multiplier: 4.0, penalty: 0.2 },
  'ie-diagram': { terms: ['information engineering', 'ie diagram'], multiplier: 4.0, penalty: 0.2 },
  'yaml': { terms: ['yaml', 'yml', 'yaml data'], multiplier: 4.0, penalty: 0.2 },
  'json': { terms: ['json', 'json data'], multiplier: 4.0, penalty: 0.2 },
  'salt': { terms: ['wireframe', 'mockup', 'salt', 'ui design'], multiplier: 4.0, penalty: 0.2 },
  'ditaa': { terms: ['ditaa', 'ascii art'], multiplier: 4.0, penalty: 0.2 },
  'ebnf': { terms: ['ebnf', 'grammar', 'syntax rule'], multiplier: 4.0, penalty: 0.2 },
  'regex': { terms: ['regex', 'regular expression'], multiplier: 4.0, penalty: 0.2 },
  'creole': { terms: ['creole', 'wiki markup'], multiplier: 4.0, penalty: 0.2 },
  'state-diagram': { terms: ['state', 'lifecycle', 'transition', 'status', 'event', 'idle', 'active'], multiplier: 4.0 },
  'er-diagram': { terms: ['entity relationship', 'er', 'entity'], multiplier: 4.0, penalty: 0.3 },
  'gantt-diagram': { terms: ['gantt', 'timeline', 'project plan', 'schedule', 'milestone'], multiplier: 4.0 },
  'mindmap-diagram': { terms: ['mindmap', 'mind map', 'brainstorm'], multiplier: 4.0 },
  'ascii-math': { terms: ['math', 'latex', 'formula', 'equation'], multiplier: 4.0, penalty: 0.2 },
  'nwdiag': { terms: ['network diagram', 'nwdiag', 'network topology'], multiplier: 4.0, penalty: 0.3 },
  'wbs-diagram': { terms: ['wbs', 'work breakdown', 'breakdown structure'], multiplier: 4.0, penalty: 0.2 },
  'sprite': { terms: ['sprite', 'icon', 'stereotype'], multiplier: 4.0, penalty: 0.2 },
  'openiconic': { terms: ['openiconic', 'icon set'], multiplier: 4.0, penalty: 0.2 },
  'link': { terms: ['hyperlink', 'url', 'link'], multiplier: 4.0, penalty: 0.2 },
  'chart-diagram': { terms: ['chart', 'graph', 'plot', 'bar chart', 'pie chart'], multiplier: 4.0, penalty: 0.3 },
  'chronology-diagram': { terms: ['chronology', 'chronological'], multiplier: 4.0, penalty: 0.2 },
  'activity-diagram-legacy': { terms: ['legacy activity', 'old activity'], multiplier: 1.0, penalty: 0.3 },
}

function tokenize(text) {
  return text.toLowerCase().split(/[^a-z0-9_]+/).filter(t => t.length >= 2 && !STOP_WORDS.has(t))
}

function dot(a, b) { let sum = 0; for (let i = 0; i < a.length; i++) sum += a[i] * b[i]; return sum }
function norm(v) { let sum = 0; for (let i = 0; i < v.length; i++) sum += v[i] * v[i]; return Math.sqrt(sum) }

function computeBoost(docId, queryLower) {
  const config = BOOSTS[docId]
  if (!config) return 1.0
  for (const term of config.terms) {
    if (queryLower.includes(term)) return config.multiplier
  }
  return config.penalty ?? 1.0
}

function retrieve(index, scenario, topK = 6) {
  const { vocabulary, idf, docs } = index
  const tokens = tokenize(scenario)
  const tf = new Map()
  for (const t of tokens) tf.set(t, (tf.get(t) || 0) + 1)

  const queryVec = new Array(vocabulary.length).fill(0)
  for (let i = 0; i < vocabulary.length; i++) {
    queryVec[i] = ((tf.get(vocabulary[i]) || 0) / tokens.length) * idf[i]
  }

  const queryNorm = norm(queryVec)
  if (queryNorm === 0) return { docs: docs.slice(0, topK) }

  const queryLower = scenario.toLowerCase()
  const scored = docs.map(doc => {
    const baseScore = dot(queryVec, doc.vector) / (queryNorm * norm(doc.vector))
    const factor = computeBoost(doc.id, queryLower)
    return { doc, score: baseScore * factor, boosted: factor > 1.0 }
  })
  scored.sort((a, b) => b.score - a.score)

  // Force-include boosted docs
  const boostedIds = new Set(scored.filter(s => s.boosted).map(s => s.doc.id))
  const result = scored.slice(0, topK)
  const resultIds = new Set(result.map(s => s.doc.id))
  for (const bid of boostedIds) {
    if (resultIds.has(bid)) continue
    for (let i = result.length - 1; i >= 0; i--) {
      if (!boostedIds.has(result[i].doc.id)) {
        const rep = scored.find(s => s.doc.id === bid)
        if (rep) { result[i] = rep; resultIds.add(bid) }
        break
      }
    }
  }
  return { docs: result.map(s => s.doc), debug: result.map(s => `${s.doc.title} ${s.score.toFixed(3)}${s.boosted ? ' \u2605' : ''}`) }
}

const demos = [
  { label: 'Auth flow',       type: 'sequence',    prompt: 'Show a user logging in: the client sends credentials to an Auth service, which returns a session token.' },
  { label: 'Checkout',        type: 'activity',    prompt: 'An e-commerce checkout: user reviews cart, pays, and the order is created. If payment fails, the user retries.' },
  { label: 'Microservices',   type: 'component',   prompt: 'An API Gateway routes to User Service and Order Service. Each service has its own database.' },
  { label: 'Library model',   type: 'class',       prompt: 'A library domain: Patron has many Loans. Each Loan has one Book. Show class relationships.' },
  { label: 'CI/CD',           type: 'activity',    prompt: 'A CI/CD pipeline: push code, run tests, build, deploy to staging, then promote to production.' },
  { label: 'Deployment',      type: 'deployment',  prompt: 'A web app across two zones, each with a load balancer and two web servers. Primary database is in zone A.' },
]

const index = JSON.parse(readFileSync(resolve(import.meta.dirname, '../public/embeddings-index.json'), 'utf-8'))
const endpoint = process.env.PINCHUML_ENDPOINT
const apiKey = process.env.PINCHUML_KEY

console.log('PinchUML Test Harness\n')
console.log(`Index: ${index.docs.length} docs, ${index.vocabulary.length} terms`)
console.log(`API:   ${endpoint ? 'configured' : 'not configured (retrieval-only mode)'}\n`)

let totalCorrect = 0
let totalFirstMatch = 0

for (const demo of demos) {
  const { docs, debug } = retrieve(index, demo.prompt)
  const topId = docs[0]?.id || '?'
  const firstOk = topId.includes(demo.type)
  const anyOk = docs.some(d => d.id.includes(demo.type))
  if (anyOk) totalCorrect++
  if (firstOk) totalFirstMatch++

  const status = firstOk ? '\u2713' : (anyOk ? '\u007E' : '\u2717')
  console.log(`${status} ${demo.label} [${demo.type}] \u2192 top: ${topId}`)
  console.log(`   ${debug.join(' | ')}`)

  if (endpoint && apiKey) {
    const docSections = docs.map(d => `## ${d.title}\n\n${d.content.slice(0, 1500)}`).join('\n\n---\n\n')
    const systemPrompt = `You are a PlantUML diagram generator. Output ONLY valid PlantUML code wrapped in @startuml ... @enduml. No markdown fences.\n\nThis is a ${demo.type} diagram.\n\n## Reference\n\n${docSections}\n\n## Rules\n1. Only PlantUML code.\n2. Wrap in @startuml/@enduml.\n3. Include a title.\n4. Keep it simple.\n5. Never use legacy (*) syntax.\n\n## Request\n${demo.prompt}\n\n## PlantUML Code`

    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 30000)
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ model: process.env.PINCHUML_MODEL || 'gpt-4o', messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: demo.prompt }], temperature: 0.2, max_tokens: 4096 }),
        signal: controller.signal,
      })
      clearTimeout(timeout)

      if (!res.ok) { console.log(`   \u26A0 HTTP ${res.status}`); console.log(''); continue }

      const data = await res.json()
      let content = data.choices?.[0]?.message?.content || ''
      content = content.trim()
      if (content.startsWith('```')) content = content.replace(/^```[\w]*\n?/i, '').replace(/\n?```$/i, '').trim()

      const issues = []
      if (!content.startsWith('@startuml')) issues.push('missing @startuml')
      if (!content.endsWith('@enduml')) issues.push('missing @enduml')
      if (content.includes('(*)')) issues.push('legacy (*)')
      if (content.includes('robust ') && !demo.prompt.includes('timing')) issues.push('unexpected timing keyword')
      if (content.includes('@startchen')) issues.push('chen ER')
      if (content.includes('@startyaml')) issues.push('yaml')
      if (content.includes('@startditaa')) issues.push('ditaa')

      if (issues.length === 0) {
        console.log(`   \u2713 Generated (${content.length} chars, ${data.usage?.completion_tokens || '?'} tokens)`)
      } else {
        console.log(`   \u2717 Issues: ${issues.join(', ')}`)
        console.log(`   Code: ${content.slice(0, 120).replace(/\n/g, '\u21B5')}...`)
      }
    } catch (err) {
      console.log(`   \u26A0 ${err.message.slice(0, 80)}`)
    }
  }
  console.log('')
}

console.log('\u2550'.repeat(50))
console.log(`Retrieval: ${totalCorrect}/${demos.length} correct, ${totalFirstMatch}/${demos.length} top match`)
