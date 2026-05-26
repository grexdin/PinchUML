export interface ConnectionSettings {
  endpoint: string
  apiKey: string
  model: string
}

export interface DemoScenario {
  label: string
  prompt: string
  diagramType: string
}

export interface IndexedDoc {
  id: string
  title: string
  content: string
  vector: number[]
}

export interface EmbeddingIndex {
  vocabulary: string[]
  idf: number[]
  docs: IndexedDoc[]
}

export interface WorkerRequest {
  kind: 'generate'
  scenario: string
  connection: ConnectionSettings
}

export interface WorkerResponse {
  kind: 'result'
  plantuml: string
}

export interface WorkerError {
  kind: 'error'
  message: string
}

export type WorkerMessage = WorkerRequest
export type WorkerReply = WorkerResponse | WorkerError
