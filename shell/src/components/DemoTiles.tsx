import type { DemoScenario } from '../types'
import { demos } from '../demos'

interface Props {
  onSelect: (demo: DemoScenario) => void
}

export function DemoTiles({ onSelect }: Props) {
  return (
    <div className="demos-row">
      {demos.map((demo) => (
        <button
          key={demo.label}
          type="button"
          className="demo-chip"
          onClick={() => onSelect(demo)}
          title={demo.prompt}
        >
          {demo.label}
        </button>
      ))}
    </div>
  )
}
