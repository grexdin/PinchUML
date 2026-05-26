import { useEffect, useRef } from 'react'

interface Props {
  value: string
  onChange: (v: string) => void
  onGenerate: () => void
  loading: boolean
  disabled: boolean
}

export function PromptInput({ value, onChange, onGenerate, loading, disabled }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        onGenerate()
      }
    }
    el.addEventListener('keydown', handler)
    return () => el.removeEventListener('keydown', handler)
  }, [onGenerate])

  const canGenerate = value.trim().length > 0 && !disabled

  return (
    <div className="prompt-area">
      <textarea
        ref={ref}
        className="prompt-input"
        placeholder="Describe your diagram in plain English...&#10;e.g. Show a user logging in via an auth service that validates a JWT and queries a database"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        disabled={loading}
      />
      <div className="prompt-actions">
        <span className="shortcut-hint">Ctrl+Enter to generate</span>
        <button
          type="button"
          className="generate-btn"
          onClick={onGenerate}
          disabled={!canGenerate}
        >
          {loading ? 'Generating…' : 'Generate'}
        </button>
      </div>
    </div>
  )
}
