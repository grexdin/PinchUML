/// <reference types="vite/client" />

declare module '/teavm/js/plantuml.js' {
  export function render(
    lines: string[],
    elementId: string,
    options?: { dark?: boolean },
  ): void
}
