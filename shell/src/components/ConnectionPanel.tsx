import type { ConnectionSettings } from '../types'

interface Props {
  settings: ConnectionSettings
  onChange: (s: ConnectionSettings) => void
}

export function ConnectionPanel({ settings, onChange }: Props) {
  const update = (patch: Partial<ConnectionSettings>) =>
    onChange({ ...settings, ...patch })

  return (
    <details className="connection-panel">
      <summary>
        Connection
        {settings.endpoint && (
          <span className="conn-badge">configured</span>
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
