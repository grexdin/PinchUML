import { useCallback, useEffect, useRef, useState } from 'react'
import type { ConnectionSettings, DemoScenario, WorkerReply } from './types'
import { ConnectionPanel } from './components/ConnectionPanel'
import { DemoTiles } from './components/DemoTiles'
import { PromptInput } from './components/PromptInput'
import { DiagramView } from './components/DiagramView'
import './App.css'

const STORAGE_KEY = 'pinchuml-connection'

function loadSettings(): ConnectionSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as ConnectionSettings
  } catch { /* corrupted */ }
  return { endpoint: '', apiKey: '', model: 'gpt-4o' }
}

function saveSettings(s: ConnectionSettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
  } catch { /* quota exceeded */ }
}

export default function App() {
  const [connection, setConnection] = useState<ConnectionSettings>(loadSettings)
  const [prompt, setPrompt] = useState('')
  const [plantuml, setPlantuml] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const workerRef = useRef<Worker | null>(null)

  // Persist connection settings
  const handleConnectionChange = useCallback((s: ConnectionSettings) => {
    setConnection(s)
    saveSettings(s)
  }, [])

  // Create worker lazily
  const getWorker = useCallback(() => {
    if (!workerRef.current) {
      workerRef.current = new Worker(
        new URL('./worker.ts', import.meta.url),
        { type: 'module' },
      )
    }
    return workerRef.current
  }, [])

  // Clean up worker on unmount
  useEffect(() => {
    return () => {
      workerRef.current?.terminate()
    }
  }, [])

  const handleGenerate = useCallback(() => {
    const scenario = prompt.trim()
    if (!scenario) return
    if (!connection.endpoint || !connection.apiKey) {
      setError('Please configure your endpoint URL and API key in the Connection panel.')
      return
    }

    setLoading(true)
    setError(null)
    setPlantuml(null)

    const worker = getWorker()

    const onMessage = (e: MessageEvent<WorkerReply>) => {
      worker.removeEventListener('message', onMessage)

      if (e.data.kind === 'result') {
        setPlantuml(e.data.plantuml)
        setError(null)
      } else {
        setError(e.data.message)
      }

      setLoading(false)
    }

    worker.addEventListener('message', onMessage)
    worker.postMessage({
      kind: 'generate',
      scenario,
      connection,
    })
  }, [prompt, connection, getWorker])

  const handleDemoSelect = useCallback((demo: DemoScenario) => {
    setPrompt(demo.prompt)
    setPlantuml(null)
    setError(null)
  }, [])

  const isConfigured = Boolean(connection.endpoint && connection.apiKey)

  return (
    <>
      <header className="app-header">
        <h1>PinchUML</h1>
        <span className="subtitle">
          Generate PlantUML diagrams from plain English
        </span>
      </header>

      <main className="app-main">
        <ConnectionPanel
          settings={connection}
          onChange={handleConnectionChange}
        />

        <DemoTiles onSelect={handleDemoSelect} />

        {!isConfigured && (
          <div className="config-notice">
            Configure your endpoint URL and API key in the{' '}
            <strong>Connection</strong> panel above to get started.
            Your key stays in a Web Worker and never touches a server but yours.
          </div>
        )}

        <PromptInput
          value={prompt}
          onChange={setPrompt}
          onGenerate={handleGenerate}
          loading={loading}
          disabled={!isConfigured}
        />

        <DiagramView
          plantuml={plantuml}
          loading={loading}
          error={error}
        />
      </main>
    </>
  )
}
