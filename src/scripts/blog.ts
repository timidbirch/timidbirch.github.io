export {}

let cleanup: (() => void) | undefined
function setupBlog() {
  cleanup?.()
  const root = document.querySelector<HTMLElement>('[data-blog]')
  if (!root) return
  const controller = new AbortController()
  const search = root.querySelector<HTMLInputElement>('[data-blog-search]')
  const buttons = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-blog-tag]'))
  const cards = Array.from(root.querySelectorAll<HTMLElement>('[data-blog-card]'))
  const count = root.querySelector<HTMLElement>('[data-blog-count]')
  const empty = root.querySelector<HTMLElement>('[data-blog-no-results]')
  let tag = ''
  function filter() {
    const query = (search?.value || '').trim().normalize('NFKC').toLocaleLowerCase()
    let visible = 0
    cards.forEach((card) => {
      const tags: string[] = JSON.parse(card.dataset.tags || '[]')
      const matches = (!tag || tags.includes(tag)) && (card.dataset.search || '').normalize('NFKC').toLocaleLowerCase().includes(query)
      card.hidden = !matches
      if (matches) visible++
    })
    if (count) count.textContent = `${visible} ${visible === 1 ? count.dataset.unitOne : count.dataset.unit}`
    if (empty) empty.hidden = cards.length === 0 || visible > 0
  }
  search?.addEventListener('input', filter, { signal: controller.signal })
  buttons.forEach((button) =>
    button.addEventListener(
      'click',
      () => {
        tag = button.dataset.blogTag || ''
        buttons.forEach((item) => item.setAttribute('aria-pressed', String(item === button)))
        filter()
      },
      { signal: controller.signal }
    )
  )
  filter()
  cleanup = () => controller.abort()
}
document.addEventListener('astro:page-load', setupBlog)
document.addEventListener('astro:before-swap', () => cleanup?.())
