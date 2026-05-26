import { useCallback, useEffect, useRef, useState } from 'react'
import type { ConnectionSettings, DemoScenario, WorkerReply } from './types'
import { ConnectionPanel } from './components/ConnectionPanel'
import { DemoTiles } from './components/DemoTiles'
import { PromptInput } from './components/PromptInput'
import { DiagramView } from './components/DiagramView'
import './App.css'

const STORAGE_KEY = 'pinchu…tion'
const MAX_RETRIES = 2

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
  const [retrying, setRetrying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const workerRef = useRef<Worker | null>(null)
  const retryCountRef = useRef(0)

  const handleConnectionChange = useCallback((s: ConnectionSettings) => {
    setConnection(s)
    saveSettings(s)
  }, [])

  const getWorker = useCallback(() => {
    if (!workerRef.current) {
      workerRef.current = new Worker(
        new URL('./worker.ts', import.meta.url),
        { type: 'module' },
      )
    }
    return workerRef.current
  }, [])

  useEffect(() => {
    return () => {
      workerRef.current?.terminate()
    }
  }, [])

  // Attach a one-shot message listener to the worker
  const listenOnce = useCallback((onResult: (plantuml: string) => void) => {
    const worker = getWorker()
    const handler = (e: MessageEvent<WorkerReply>) => {
      worker.removeEventListener('message', handler)

      if (e.data.kind === 'result') {
        onResult(e.data.plantuml)
      } else {
        setError(e.data.message)
        setLoading(false)
        setRetrying(false)
      }
    }
    worker.addEventListener('message', handler)
  }, [getWorker])

  const handleGenerate = useCallback(() => {
    const scenario = prompt.trim()
    if (!scenario) return
    if (!connection.endpoint || !connection.apiKey) {
      setError('Please configure your endpoint URL and API key in the Connection panel.')
      return
    }

    setLoading(true)
    setRetrying(false)
    setError(null)
    setPlantuml(null)
    retryCountRef.current = 0

    listenOnce((newPlantuml) => {
      setPlantuml(newPlantuml)
      setError(null)
      setLoading(false)
      setRetrying(false)
    })

    getWorker().postMessage({
      kind: 'generate',
      scenario,
      connection,
    })
  }, [prompt, connection, getWorker, listenOnce])

  const handleRenderError = useCallback((plantumlCode: string, renderError: string) => {
    if (retryCountRef.current >= MAX_RETRIES) {
      setError(`Render error persists after ${MAX_RETRIES} attempts: ${renderError}`)
      setPlantuml(plantumlCode) // keep the last attempt visible in source view
      setLoading(false)
      setRetrying(false)
      return
    }

    retryCountRef.current++
    setLoading(true)
    setRetrying(true)
    setPlantuml(null)
    setError(null)

    listenOnce((newPlantuml) => {
      setPlantuml(newPlantuml)
      setError(null)
      setLoading(false)
      setRetrying(false)
    })

    getWorker().postMessage({
      kind: 'retry',
      scenario: prompt.trim(),
      connection,
    })
  }, [prompt, connection, getWorker, listenOnce])

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
          retrying={retrying}
          error={error}
          onRenderError={handleRenderError}
        />
      </main>
    </>
  )
}
