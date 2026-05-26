import { useCallback, useEffect, useId, useRef, useState } from 'react'

interface TeaVMRenderer {
  render: (lines: string[], elementId: string, options?: { dark?: boolean }) => void
}

// Dynamic import of public/ asset — resolved at runtime, not bundled
async function loadRenderer(): Promise<TeaVMRenderer> {
  // @ts-expect-error public/ asset
  return import(/* @vite-ignore */ '/teavm/js/plantuml.js')
}

interface Props {
  plantuml: string | null
  loading: boolean
  error: string | null
}

type ViewMode = 'diagram' | 'source'

export function DiagramView({ plantuml, loading, error }: Props) {
  const outputId = useId().replace(/:/g, '')
  const [mode, setMode] = useState<ViewMode>('diagram')
  const [copied, setCopied] = useState(false)
  const rendererRef = useRef<((lines: string[], id: string, opts?: { dark?: boolean }) => void) | null>(null)
  const renderedRef = useRef('')
  const preloadStarted = useRef(false)

  // Preload the TeaVM renderer module on mount
  useEffect(() => {
    if (preloadStarted.current) return
    preloadStarted.current = true
    loadRenderer()
      .then((mod) => {
        rendererRef.current = mod.render
      })
      .catch((err) => {
        console.error('Failed to load PlantUML renderer:', err)
      })
  }, [])

  // Render when plantuml changes
  useEffect(() => {
    if (!plantuml || !rendererRef.current) return

    // Skip if already rendered the same source
    if (plantuml === renderedRef.current && mode === 'diagram') return
    renderedRef.current = plantuml

    if (mode !== 'diagram') return

    const dark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const lines = plantuml.split('\n')

    // Small delay to ensure DOM is ready after React render
    const timer = setTimeout(() => {
      try {
        rendererRef.current?.(lines, outputId, { dark })
      } catch (err) {
        console.error('Render error:', err)
      }
    }, 50)

    return () => clearTimeout(timer)
  }, [plantuml, mode, outputId])

  const handleCopy = useCallback(async () => {
    if (!plantuml) return
    try {
      await navigator.clipboard.writeText(plantuml)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = plantuml
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [plantuml])

  if (loading) {
    return (
      <div className="diagram-panel">
        <div className="diagram-status">
          <div className="spinner" />
          <span>Generating diagram…</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="diagram-panel">
        <div className="diagram-status error">
          <span className="error-icon">!</span>
          <div>
            <strong>Error</strong>
            <p>{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!plantuml) {
    return (
      <div className="diagram-panel">
        <div className="diagram-status">
          <span className="placeholder">Your diagram will appear here</span>
        </div>
      </div>
    )
  }

  return (
    <div className="diagram-panel">
      <div className="diagram-toolbar">
        <div className="view-tabs">
          <button
            type="button"
            className={mode === 'diagram' ? 'active' : ''}
            onClick={() => setMode('diagram')}
          >
            Diagram
          </button>
          <button
            type="button"
            className={mode === 'source' ? 'active' : ''}
            onClick={() => setMode('source')}
          >
            Source
          </button>
        </div>
        <button type="button" className="copy-btn" onClick={handleCopy}>
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      {mode === 'diagram' ? (
        <div
          id={outputId}
          className="diagram-output"
        />
      ) : (
        <pre className="diagram-source">
          <code>{plantuml}</code>
        </pre>
      )}
    </div>
  )
}
