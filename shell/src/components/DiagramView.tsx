import { useCallback, useEffect, useId, useRef, useState } from 'react'

interface TeaVMRenderer {
  render: (lines: string[], elementId: string, options?: { dark?: boolean }) => void
}

// Load the TeaVM renderer from public/.
// We construct a full URL dynamically so Vite doesn't try to statically
// analyze the import — public/ JS cannot be imported by Vite in dev mode.
async function loadRenderer(): Promise<TeaVMRenderer> {
  const url = self.location.origin + '/teavm/js/plantuml.js'
  return import(/* @vite-ignore */ url)
}

function detectRenderError(container: HTMLElement): string | null {
  const svg = container.querySelector('svg')
  if (!svg) return 'No SVG output produced'

  const text = svg.textContent || ''

  // PlantUML errors typically contain "Syntax Error" or "Error:" in the rendered output
  const syntaxMatch = text.match(/Syntax Error[?:]?\s*(.+?)(?:\n|$)/i)
  if (syntaxMatch) return syntaxMatch[1].trim() || 'Syntax error in PlantUML code'

  // If there are no diagram shapes, it's likely just an error message
  const hasShapes = svg.querySelector('path, rect, polygon, ellipse, line, polyline')
  if (!hasShapes && text.length < 500) {
    const clean = text.replace(/\s+/g, ' ').trim()
    if (clean) return clean.slice(0, 300)
    return 'No diagram elements rendered — possible syntax error'
  }

  return null
}

interface Props {
  plantuml: string | null
  loading: boolean
  error: string | null
  retrying: boolean
  onRenderError: (plantuml: string, errorMsg: string) => void
}

type ViewMode = 'diagram' | 'source'

export function DiagramView({ plantuml, loading, error, retrying, onRenderError }: Props) {
  const outputId = useId().replace(/:/g, '')
  const [mode, setMode] = useState<ViewMode>('diagram')
  const [copied, setCopied] = useState(false)
  const rendererRef = useRef<((lines: string[], id: string, opts?: { dark?: boolean }) => void) | null>(null)
  const renderedRef = useRef('')
  const preloadStarted = useRef(false)
  const errorReportedRef = useRef('')

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
    errorReportedRef.current = ''

    if (mode !== 'diagram') return

    const dark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const lines = plantuml.split('\n')

    const timer = setTimeout(() => {
      try {
        rendererRef.current?.(lines, outputId, { dark })
      } catch (err) {
        console.error('Render error:', err)
        return
      }

      // Check for render errors after a short delay to let the SVG settle
      setTimeout(() => {
        const container = document.getElementById(outputId)
        if (!container) return
        // Don't double-report the same error
        if (errorReportedRef.current === plantuml) return

        const renderError = detectRenderError(container)
        if (renderError) {
          errorReportedRef.current = plantuml
          onRenderError(plantuml, renderError)
        }
      }, 100)
    }, 50)

    return () => clearTimeout(timer)
  }, [plantuml, mode, outputId, onRenderError])

  const handleCopy = useCallback(async () => {
    if (!plantuml) return
    try {
      await navigator.clipboard.writeText(plantuml)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
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
          <span>{retrying ? 'Fixing syntax error…' : 'Generating diagram…'}</span>
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
