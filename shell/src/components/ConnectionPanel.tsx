import { useEffect, useMemo } from 'react'
import type { ConnectionSettings } from '../types'
import { allowEndpoint } from '../csp'

interface Props {
  settings: ConnectionSettings
  onChange: (s: ConnectionSettings) => void
}

function validateUrl(url: string): string | null {
  if (!url) return null
  try {
    const parsed = new URL(url)
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return 'URL must use http:// or https://'
    }
    return null
  } catch {
    return 'Invalid URL format'
  }
}

export function ConnectionPanel({ settings, onChange }: Props) {
  const update = (patch: Partial<ConnectionSettings>) =>
    onChange({ ...settings, ...patch })

  const urlError = useMemo(() => validateUrl(settings.endpoint), [settings.endpoint])

  // Dynamically update CSP to allow the configured endpoint
  useEffect(() => {
    if (settings.endpoint && !urlError) {
      allowEndpoint(settings.endpoint)
    }
  }, [settings.endpoint, urlError])

  return (
    <details className="connection-panel">
      <summary>
        Connection
        {settings.endpoint && !urlError && (
          <span className="conn-badge">configured</span>
        )}
        {urlError && (
          <span className="conn-badge error">{urlError}</span>
        )}
      </summary>
      <form
        className="connection-form"
        onSubmit={(e) => e.preventDefault()}
      >
        <label>
          Endpoint URL
          <input
            type="url"
            placeholder="https://api.openai.com/v1/chat/completions"
            value={settings.endpoint}
            onChange={(e) => update({ endpoint: e.target.value })}
          />
        </label>
        <label>
          API Key
          <input
            type="password"
            placeholder="sk-..."
            value={settings.apiKey}
            onChange={(e) => update({ apiKey: e.target.value })}
          />
        </label>
        <label>
          Model
          <input
            type="text"
            placeholder="gpt-4o"
            value={settings.model}
            onChange={(e) => update({ model: e.target.value })}
          />
        </label>
      </form>
    </details>
  )
}
