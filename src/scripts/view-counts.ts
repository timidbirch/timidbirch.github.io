// Vercount's public v2 counter API. No secret or server is required.
// https://github.com/evannotfound/vercount
// Use our own route lifecycle handler rather than loading the auto-count script
// in parallel, which would record every navigation twice.
let lastPath: string | undefined
let activeRequest: AbortController | undefined

async function recordPageView() {
  const container = document.querySelector<HTMLElement>('[data-view-counts]')
  if (!container) return
  const en = container.dataset.locale === 'en'
  const status = container.querySelector<HTMLElement>('[data-view-count-status]')
  const message = (text: string) => {
    container.title = text
    if (status) status.textContent = text
  }
  if (import.meta.env.DEV || location.host !== container.dataset.siteHost) {
    message(en ? 'Statistics are recorded on the live website only.' : '仅在正式网站记录浏览量。')
    return
  }

  // GitHub Pages adds trailing slashes. Normalize them, and never send query
  // strings or fragments to the provider. Each language URL has its own count.
  const path = location.pathname.replace(/\/+$/, '') || '/'
  if (lastPath === path) return // Same-page anchor clicks do not create views.
  lastPath = path
  activeRequest?.abort()
  const controller = new AbortController()
  activeRequest = controller
  const timeout = window.setTimeout(() => controller.abort(), 15000)
  const url = new URL(path, location.origin).href

  // Match the provider's host-scoped anonymous visitor marker so a future
  // visitor-count display can use consistent data. Counts need no login.
  const cookieKey = `vercount_uv_${location.host.replace(/[^a-zA-Z0-9_-]/g, '_')}`
  let isNewUv = false
  try {
    isNewUv = !document.cookie.split(';').some(part => part.trim() === `${cookieKey}=1`)
  } catch { /* Page views still work when cookies are blocked. */ }

  try {
    const response = await fetch('https://events.vercount.one/api/v2/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, isNewUv }),
      signal: controller.signal,
      credentials: 'omit',
      referrerPolicy: 'strict-origin',
    })
    if (!response.ok) throw new Error(`Counter returned HTTP ${response.status}`)
    const result = await response.json()
    if (result.status === 'error') throw new Error('Counter rejected request')
    const counts = result.data ?? result
    // Never invent a zero if the service returned an invalid response.
    if (!['site_pv', 'page_pv'].every(key => Number.isSafeInteger(counts[key]) && counts[key] >= 0)) {
      throw new Error('Invalid counter response')
    }
    if (isNewUv) {
      try { document.cookie = `${cookieKey}=1; path=/; max-age=31536000; samesite=lax; secure` } catch { /* Optional marker. */ }
    }
    if (controller.signal.aborted || !container.isConnected) return
    const format = new Intl.NumberFormat(container.dataset.locale)
    document.querySelectorAll<HTMLElement>('[data-view-count]').forEach(element => {
      const key = element.dataset.viewCount
      if (key === 'site_pv' || key === 'page_pv') element.textContent = format.format(counts[key])
    })
    message(en ? 'Page view statistics updated.' : '浏览量已更新。')
  } catch (error) {
    // An earlier page's cancelled request must not update the new page's UI.
    if (container.isConnected) {
      message(en ? 'Statistics are temporarily unavailable.' : '浏览量暂时无法获取。')
      console.warn('[View counts]', error instanceof Error ? error.message : 'Request failed')
    }
  } finally {
    clearTimeout(timeout)
    if (activeRequest === controller) activeRequest = undefined
  }
}

document.addEventListener('astro:page-load', recordPageView)
document.addEventListener('astro:before-swap', () => activeRequest?.abort())
