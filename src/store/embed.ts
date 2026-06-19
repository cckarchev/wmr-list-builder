// The builder is embedded as an iframe on the cckarchev site. The host page
// passes the parent's own base URL via ?embed=<url-encoded>. We capture it once
// at startup (see initEmbed call in main.tsx) so it survives in-app navigation,
// which drops query params. The Share button uses it to emit a cckarchev link.

const ALLOWED_HOSTS = new Set(['cckarchev.ar', 'www.cckarchev.ar']);

let embedBase: string | null = null;

function validate(raw: string): string | null {
  try {
    const url = new URL(raw);
    if (url.protocol !== 'https:') return null;
    if (!ALLOWED_HOSTS.has(url.hostname)) return null;
    return raw;
  } catch {
    return null;
  }
}

export function initEmbed(search: string = window.location.search): void {
  const raw = new URLSearchParams(search).get('embed');
  embedBase = raw ? validate(raw) : null;
}

export function getEmbedBase(): string | null {
  return embedBase;
}
