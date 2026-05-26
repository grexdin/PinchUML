import { useCallback, useEffect, useId, useRef, useState } from 'react'

const KROKI_SVG = 'https://kroki.io/plantuml/svg'

interface TeaVMRenderer {
  render: (lines: string[], elementId: string, options?: { dark?: boolean }) => void
}

// Try TeaVM first. We construct a full URL dynamically so Vite doesn't try
// to statically analyze the import (public/ JS cannot be imported in dev).
async function loadRenderer(): Promise<TeaVMRenderer> {
  const url = self.location.origin + '/teavm/js/plantuml.js'
  return import(/* @vite-ignore */ url)
}

// Kroki fallback: POST raw PlantUML, get SVG back.
// Used when TeaVM crashes (produces no SVG at all).
async function renderViaKroki(plantuml: string, outputId: string): Promise<boolean> {
  try {
    const res = await fetch(KROKI_SVG, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: plantuml,
    })
    if (!res.ok) return false
    const svgText = await res.text()
    const container = document.getElementById(outputId)
    if (!container) return false
    container.innerHTML = svgText
    return true
  } catch {
    return false
  }
}

function detectRenderError(container: HTMLElement): string | null {
  const svg = container.querySelector('svg')
  if (!svg) return null // Will trigger fallback, not error
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
  const [serverRender, setServerRender] = useState(false)
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

  useEffect(() => {
    const handler = (e: ErrorEvent) => {
      if (e.filename?.includes('plantuml.js') && e.message?.includes('$jsException')) {
        e.preventDefault()
        const src = plantumlRef.current
        if (src && errorReportedRef.current !== src) {
          errorReportedRef.current = src
          onRenderErrorRef.current(src, 'Render engine crashed — falling back to server renderer')
        }
      }
    }
    window.addEventListener('error', handler)
    return () => window.removeEventListener('error', handler)
  }, [])

  // Main render effect
  useEffect(() => {
    if (!plantuml || !rendererRef.current) return
    if (mode !== 'diagram') return

    const container = document.getElementById(outputId)
    const needsRender = !container?.querySelector('svg')
    if (!needsRender && plantuml === renderedRef.current) return

    renderedRef.current = plantuml
    errorReportedRef.current = ''
    setServerRender(false)

    const dark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const lines = plantuml.split('\n')

    // Step 1: try TeaVM
    const timer = setTimeout(() => {
      try { rendererRef.current?.(lines, outputId, { dark }) } catch { /* swallow */ }

      // Step 2: after a delay, check if TeaVM produced anything
      setTimeout(async () => {
        const container = document.getElementById(outputId)
        if (!container) return

        const hasSvg = container.querySelector('svg')

        if (!hasSvg) {
          // Step 3: TeaVM produced nothing — try Kroki fallback
          setServerRender(true)
          const ok = await renderViaKroki(plantuml, outputId)
          if (ok) {
            setServerRender(false)
            return
          }
          // Both renderers failed
          errorReportedRef.current = plantuml
          onRenderError(plantuml, 'Both TeaVM and Kroki renderers failed')
          setServerRender(false)
          return
        }

        // TeaVM produced SVG — check for error text
        if (errorReportedRef.current) return // already reported via $jsException
        const err = detectRenderError(container)
        if (err) {
          errorReportedRef.current = plantuml
          onRenderError(plantuml, err)
        }
      }, 600)
    }, 100)

    return () => clearTimeout(timer)
  }, [plantuml, mode, outputId, onRenderError])

  const handleExportPng = useCallback(async () => {
    const container = document.getElementById(outputId)
    const svg = container?.querySelector('svg')
    if (!svg) return

    // Clone the SVG and set explicit dimensions from viewBox for high-res export
    const clone = svg.cloneNode(true) as SVGElement
    const viewBox = svg.getAttribute('viewBox') || '0 0 800 400'
    const [, , vbW, vbH] = viewBox.split(/\s+/).map(Number)
    const scale = 3 // 3x for crisp PNG at retina resolutions
    const w = vbW * scale
    const h = vbH * scale

    clone.setAttribute('width', String(w))
    clone.setAttribute('height', String(h))

    const svgStr = new XMLSerializer().serializeToString(clone)
    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)

    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')!
      // White background for PNG
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
  }, [outputId])

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
        <div>
          {serverRender && <div className="server-render-note">Rendering via server…</div>}
          <div id={outputId} className="diagram-output" />
        </div>
      ) : (
        <pre className="diagram-source"><code>{plantuml}</code></pre>
      )}
    </div>
  )
}
