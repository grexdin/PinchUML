import { useCallback, useEffect, useId, useRef, useState } from 'react'

interface TeaVMRenderer {
  render: (lines: string[], elementId: string, options?: { dark?: boolean }) => void
}

async function loadRenderer(): Promise<TeaVMRenderer> {
  const url = import.meta.env.BASE_URL + 'teavm/js/plantuml.js'
  return import(/* @vite-ignore */ url)
}

function detectRenderError(container: HTMLElement): string | null {
  const svg = container.querySelector('svg')
  if (!svg) return 'No SVG output produced'
  const hasShapes = svg.querySelector('path, polygon, ellipse, line')
  if (hasShapes) return null
  const text = (svg.textContent || '').trim()
  if (text.length > 0) {
    return text.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim().slice(0, 500)
  }
  return 'Renderer produced no output'
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
  const rendererRef = useRef<TeaVMRenderer['render'] | null>(null)
  const renderedRef = useRef('')
  const preloadStarted = useRef(false)
  const errorReportedRef = useRef('')
  const plantumlRef = useRef(plantuml)
  const onRenderErrorRef = useRef(onRenderError)

  useEffect(() => { plantumlRef.current = plantuml }, [plantuml])
  useEffect(() => { onRenderErrorRef.current = onRenderError }, [onRenderError])

  useEffect(() => {
    if (preloadStarted.current) return
    preloadStarted.current = true
    loadRenderer().then((mod) => { rendererRef.current = mod.render }).catch(console.error)
  }, [])

  // Catch TeaVM's internal $jsException crashes and surface as render errors
  useEffect(() => {
    const handler = (e: ErrorEvent) => {
      if (e.filename?.includes('plantuml.js') && e.message?.includes('$jsException')) {
        e.preventDefault()
        const src = plantumlRef.current
        if (src && errorReportedRef.current !== src) {
          errorReportedRef.current = src
          onRenderErrorRef.current(src, 'Render engine crashed')
        }
      }
    }
    window.addEventListener('error', handler)
    return () => window.removeEventListener('error', handler)
  }, [])

  // Render when plantuml changes or mode switches back to diagram
  useEffect(() => {
    if (!plantuml || !rendererRef.current) return
    if (mode !== 'diagram') return

    const container = document.getElementById(outputId)
    const needsRender = !container?.querySelector('svg')
    if (!needsRender && plantuml === renderedRef.current) return

    renderedRef.current = plantuml
    errorReportedRef.current = ''

    const dark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const lines = plantuml.split('\n')

    const timer = setTimeout(() => {
      try { rendererRef.current?.(lines, outputId, { dark }) } catch { /* swallow */ }

      setTimeout(() => {
        const container = document.getElementById(outputId)
        if (!container) return
        if (errorReportedRef.current) return
        const err = detectRenderError(container)
        if (err) {
          errorReportedRef.current = plantuml
          onRenderError(plantuml, err)
        }
      }, 500)
    }, 100)

    return () => clearTimeout(timer)
  }, [plantuml, mode, outputId, onRenderError])

  const handleExportPng = useCallback(async () => {
    if (!plantuml || !rendererRef.current) return

    // Render off-screen in light mode for the export, regardless of user's theme
    const tmpId = `export-${outputId}`
    const tmpDiv = document.createElement('div')
    tmpDiv.id = tmpId
    tmpDiv.style.cssText = 'position:absolute;left:-9999px;top:0'
    document.body.appendChild(tmpDiv)

    const lines = plantuml.split('\n')
    rendererRef.current(lines, tmpId, { dark: false })

    // Poll until TeaVM produces SVG (max 3 seconds)
    const svg = await new Promise<SVGElement | null>((resolve) => {
      const start = Date.now()
      const poll = () => {
        const s = tmpDiv.querySelector('svg')
        if (s) return resolve(s)
        if (Date.now() - start > 3000) return resolve(null)
        setTimeout(poll, 50)
      }
      poll()
    })

    if (!svg) { document.body.removeChild(tmpDiv); return }

    const viewBox = svg.getAttribute('viewBox') || '0 0 800 400'
    const [, , vbW, vbH] = viewBox.split(/\s+/).map(Number)
    const scale = 3
    const w = vbW * scale
    const h = vbH * scale

    const clone = svg.cloneNode(true) as SVGElement
    clone.setAttribute('width', String(w))
    clone.setAttribute('height', String(h))
    document.body.removeChild(tmpDiv)

    const svgStr = new XMLSerializer().serializeToString(clone)
    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)

    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')!
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, w, h)
      ctx.drawImage(img, 0, 0, w, h)
      URL.revokeObjectURL(url)

      canvas.toBlob((pngBlob) => {
        if (!pngBlob) return
        const downloadUrl = URL.createObjectURL(pngBlob)
        const a = document.createElement('a')
        a.href = downloadUrl
        a.download = 'pinchuml-export.png'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(downloadUrl)
      }, 'image/png')
    }
    img.src = url
  }, [plantuml, outputId])

  const handleCopy = useCallback(async () => {
    if (!plantuml) return
    try {
      await navigator.clipboard.writeText(plantuml)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = plantuml
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [plantuml])

  if (loading) {
    return (
      <div className="diagram-panel">
        <div className="diagram-status">
          <div className="spinner" />
          <span>{retrying ? 'Retrying…' : 'Generating diagram…'}</span>
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
          <button type="button" className={mode === 'diagram' ? 'active' : ''} onClick={() => setMode('diagram')}>Diagram</button>
          <button type="button" className={mode === 'source' ? 'active' : ''} onClick={() => setMode('source')}>Source</button>
        </div>
        <button type="button" className="copy-btn" onClick={handleCopy}>{copied ? 'Copied!' : 'Copy'}</button>
        <button type="button" className="copy-btn export-btn" onClick={handleExportPng}>Export PNG</button>
      </div>

      {mode === 'diagram' ? (
        <div id={outputId} className="diagram-output" />
      ) : (
        <pre className="diagram-source"><code>{plantuml}</code></pre>
      )}
    </div>
  )
}
