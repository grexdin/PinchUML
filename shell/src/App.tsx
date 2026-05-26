import { demos } from './demos'
import type { DemoScenario } from './types'
import './App.css'

function App() {
  return (
    <>
      <header className="app-header">
        <h1>PinchUML</h1>
        <span className="subtitle">
          Generate PlantUML diagrams from plain English. No server, no setup.
        </span>
      </header>

      <main className="app-main">
        <details className="connection-panel">
          <summary>Connection</summary>
          <form className="connection-form" onSubmit={(e) => e.preventDefault()}>
            <label>
              Endpoint URL
              <input type="url" placeholder="https://api.openai.com" />
            </label>
            <label>
              API Key
              <input type="password" placeholder="sk-..." />
            </label>
            <label>
              Model
              <input type="text" placeholder="gpt-4o" />
            </label>
          </form>
        </details>

        <div className="demos-row">
          {demos.map((d: DemoScenario) => (
            <button key={d.label} type="button" className="demo-chip">
              {d.label}
            </button>
          ))}
        </div>

        <div className="prompt-area">
          <textarea
            className="prompt-input"
            placeholder="Describe your diagram in plain English..."
            rows={4}
          />
          <button type="button" className="generate-btn">
            Generate
          </button>
        </div>

        <div className="diagram-panel">
          <div id="diagram-output" className="diagram-output">
            <p className="placeholder">Your diagram will appear here</p>
          </div>
        </div>
      </main>
    </>
  )
}

export default App
