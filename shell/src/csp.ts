/**
 * Dynamic Content Security Policy management.
 *
 * The meta CSP is the only policy (no server headers), so the browser
 * respects runtime modifications. We start strict and add the user's
 * LLM endpoint origin when configured.
 */

const META_ID = 'csp-meta'

const BASE_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
  "connect-src 'self' https://kroki.io",
  "worker-src 'self' blob:",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://kroki.io",
].join('; ')

function getMeta(): HTMLMetaElement | null {
  return document.getElementById(META_ID) as HTMLMetaElement | null
}

function updateMeta(content: string) {
  const meta = getMeta()
  if (meta) {
    meta.content = content
  }
}

export function initCSP() {
  if (!getMeta()) {
    const meta = document.createElement('meta')
    meta.id = META_ID
    meta.httpEquiv = 'Content-Security-Policy'
    meta.content = BASE_POLICY
    document.head.appendChild(meta)
  }
}

export function allowEndpoint(url: string) {
  try {
    const origin = new URL(url).origin
    if (!origin || origin === 'null' || origin === self.location.origin) return

    const policy = BASE_POLICY.replace(
      "connect-src 'self' https://kroki.io",
      `connect-src 'self' https://kroki.io ${origin}`,
    )
    updateMeta(policy)
  } catch {
    // Invalid URL — don't update CSP
  }
}
