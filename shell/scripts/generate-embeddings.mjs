/**
 * Generate TF-IDF embeddings from the PlantUML syntax corpus.
 *
 * Reads mind/memory/*.md, tokenizes into domain-specific terms, computes
 * TF-IDF vectors, and writes shell/public/embeddings-index.json.
 *
 * Usage: node scripts/generate-embeddings.mjs
 */

import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { basename, join, resolve } from 'node:path'

const MEMORY_DIR = resolve(import.meta.dirname, '../../mind/memory')
const OUTPUT = resolve(import.meta.dirname, '../public/embeddings-index.json')
const TOP_K = 3 // default retrieval count

// English stop words
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
  'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
  'could', 'should', 'may', 'might', 'can', 'shall', 'you', 'your',
  'yours', 'he', 'she', 'it', 'its', 'they', 'them', 'their', 'this',
  'that', 'these', 'those', 'not', 'no', 'nor', 'so', 'if', 'then',
  'than', 'too', 'very', 'just', 'about', 'above', 'after', 'again',
  'all', 'also', 'any', 'as', 'because', 'before', 'between', 'both',
  'each', 'few', 'more', 'most', 'other', 'some', 'such', 'only',
  'own', 'same', 'into', 'over', 'under', 'up', 'out', 'off', 'down',
  'here', 'there', 'when', 'where', 'why', 'how', 'which', 'who',
  'whom', 'what', 'while', 'during', 'through', 'until', 'we', 'our',
  'i', 'me', 'my', 'myself', 'us', 'our', 'ours', 'ourselves',
])

function extractText(markdown) {
  // Remove fenced code blocks (preserve the content — PlantUML syntax is valuable)
  let text = markdown.replace(/```[\s\S]*?```/g, (match) => {
    // Keep only the content, strip the fences
    return match.slice(3, -3).replace(/^[a-z]*\n?/i, '')
  })

  // Remove HTML-like tags (<plantuml>, </plantuml>)
  text = text.replace(/<\/?[a-z]+>/gi, ' ')

  // Remove markdown headings (keep the content)
  text = text.replace(/^#{1,6}\s+/gm, '')

  // Remove backtick inline code markers
  text = text.replace(/`{1,2}/g, '')

  // Remove link syntax [text](url) — keep text
  text = text.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')

  // Remove image syntax ![alt](url)
  text = text.replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')

  // Remove bold/italic markers
  text = text.replace(/\*{1,3}/g, '')

  // Remove horizontal rules
  text = text.replace(/^[-*_]{3,}\s*$/gm, '')

  // Remove special PlantUML markers
  text = text.replace(/@startuml|@enduml/gi, ' ')

  return text
}

function tokenize(text) {
  const tokens = text
    .toLowerCase()
    .split(/[^a-z0-9_]+/)
    .filter((t) => t.length >= 2 && !STOP_WORDS.has(t))

  return tokens
}

function main() {
  const files = readdirSync(MEMORY_DIR).filter((f) => f.endsWith('.md'))

  console.log(`Processing ${files.length} corpus files...`)

  const documents = []
  const docTermCounts = [] // token -> count per doc
  const globalDocFreq = new Map() // term -> number of docs containing it

  for (const filename of files) {
    const path = join(MEMORY_DIR, filename)
    const raw = readFileSync(path, 'utf-8')
    const text = extractText(raw)
    const tokens = tokenize(text)

    // Extract title from first ## heading in the raw markdown
    const titleMatch = raw.match(/^## (.+)$/m)
    const title = titleMatch ? titleMatch[1].trim() : basename(filename, '.md')

    // Doc ID from filename
    const id = basename(filename, '.md')

    // Term frequency for this doc
    const termFreq = new Map()
    for (const t of tokens) {
      termFreq.set(t, (termFreq.get(t) || 0) + 1)
    }

    // Track global document frequency
    for (const t of termFreq.keys()) {
      globalDocFreq.set(t, (globalDocFreq.get(t) || 0) + 1)
    }

    // Store raw content for prompt building
    // Keep the first 8000 chars max to keep index size manageable
    const content = raw.length > 8000 ? raw.slice(0, 8000) + '\n[...truncated]' : raw

    docTermCounts.push({
      id,
      title,
      content,
      tf: termFreq,
      tokenCount: tokens.length,
    })

    console.log(`  ${id}: ${tokens.length} tokens, ${termFreq.size} unique`)
  }

  // Build vocabulary (all unique terms that appear in at least 2 docs)
  const N = documents.length === 0 ? 0 : docTermCounts.length
  const vocabulary = []
  const vocabIndex = new Map()

  for (const [term, df] of globalDocFreq) {
    if (df >= 2 && term.length >= 2) {
      vocabIndex.set(term, vocabulary.length)
      vocabulary.push(term)
    }
  }

  console.log(`Vocabulary: ${vocabulary.length} terms (appearing in >= 2 docs)`)

  // Compute IDF
  const idf = new Array(vocabulary.length)
  for (let i = 0; i < vocabulary.length; i++) {
    const df = globalDocFreq.get(vocabulary[i])
    idf[i] = Math.log((N + 1) / (df + 1)) + 1 // smooth IDF
  }

  // Compute TF-IDF vectors for each document
  for (const doc of docTermCounts) {
    const vector = new Array(vocabulary.length).fill(0)
    for (const [term, count] of doc.tf) {
      const idx = vocabIndex.get(term)
      if (idx !== undefined) {
        const tf = count / doc.tokenCount
        vector[idx] = tf * idf[idx]
      }
    }
    documents.push({
      id: doc.id,
      title: doc.title,
      content: doc.content,
      vector,
    })
  }

  const index = {
    vocabulary,
    idf,
    docs: documents,
    topK: TOP_K,
  }

  writeFileSync(OUTPUT, JSON.stringify(index))
  console.log(`\nWritten ${(JSON.stringify(index).length / 1024).toFixed(1)} KB to ${OUTPUT}`)
}

main()
