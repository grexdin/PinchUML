const META_ID = 'csp-meta'

const BASE_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
  "connect-src 'self'",
  "worker-src 'self' blob:",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
].join('; ')

function getMeta(): HTMLMetaElement | null {
  return document.getElementById(META_ID) as HTMLMetaElement | null
}

function updateMeta(content: string) {
  const meta = getMeta()
  if (meta) meta.content = content
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
      "connect-src 'self'",
      `connect-src 'self' ${origin}`,
    )
    updateMeta(policy)
  } catch { /* invalid URL */ }
}
