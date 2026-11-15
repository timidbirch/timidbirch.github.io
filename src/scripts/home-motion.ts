import { animate, inView, scroll, stagger } from 'motion'

const EASE = [0.22, 1, 0.36, 1] as const
const SPRING = { type: 'spring' as const, stiffness: 135, damping: 20, mass: 0.9 }
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)')
const root = document.documentElement

function clearPending() {
  root.classList.remove('motion-pending', 'reveal-pending')
}

function resetRevealStyles(items: HTMLElement[]) {
  for (const el of items) {
    el.style.opacity = ''
    el.style.transform = ''
    el.style.willChange = ''
  }
}

type MotionStore = {
  bound: boolean
  cleanups: Array<() => void>
}

const store = ((window as Window & { __homeMotionStore?: MotionStore }).__homeMotionStore ??= {
  bound: false,
  cleanups: [],
})

function init() {
  const page = document.querySelector<HTMLElement>('.guest-home')
  if (!page || reduceMotion.matches) {
    clearPending()
    return
  }
  if (page.dataset.motionInit === '1') {
    return
  }
  page.dataset.motionInit = '1'

  root.dataset.homeMotion = '1'

  const hero = page.querySelector<HTMLElement>('.space-hero')
  const avatar = page.querySelector<HTMLElement>('.hero-avatar')
  const byline = page.querySelector<HTMLElement>('.hero-byline')
  const title = page.querySelector<HTMLElement>('.space-hello h1')
  const context = page.querySelector<HTMLElement>('.hero-context')
  const stats = page.querySelector<HTMLElement>('.hero-stats')
  const socials = Array.from(page.querySelectorAll<HTMLElement>('.hero-socials a'))
  const revealItems = Array.from(page.querySelectorAll<HTMLElement>('[data-reveal]'))

  let entrancePlayed = false
  try {
    entrancePlayed = new URLSearchParams(location.search).get('motion') !== 'replay' && sessionStorage.getItem('home-entrance') === 'played'
  } catch {}

  const playEntrance = async () => {
    const jobs: Promise<unknown>[] = []

    if (avatar) {
      jobs.push(
        animate(
          avatar,
          { opacity: [0, 1], y: [14, 0], scale: [0.86, 1] },
          {
            ...SPRING,
            delay: 0.04,
            opacity: { duration: 0.5, ease: EASE },
          }
        ).finished
      )
    }

    if (byline) {
      jobs.push(
        animate(byline, { opacity: [0, 1], y: [10, 0] }, { ...SPRING, delay: 0.12, opacity: { duration: 0.5, ease: EASE } }).finished
      )
    }

    if (title) {
      jobs.push(
        animate(
          title,
          { opacity: [0, 1], y: [18, 0], filter: ['blur(7px)', 'blur(0px)'] },
          {
            ...SPRING,
            delay: 0.16,
            opacity: { duration: 0.6, ease: EASE },
            filter: { duration: 0.65, ease: EASE },
          }
        ).finished
      )
    }

    if (context) {
      jobs.push(
        animate(context, { opacity: [0, 1], y: [14, 0] }, { ...SPRING, delay: 0.26, opacity: { duration: 0.55, ease: EASE } }).finished
      )
    }

    if (stats) {
      jobs.push(
        animate(stats, { opacity: [0, 1], y: [10, 0] }, { ...SPRING, delay: 0.38, opacity: { duration: 0.5, ease: EASE } }).finished
      )
    }

    if (socials.length) {
      jobs.push(
        animate(
          socials,
          { opacity: [0, 1], y: [8, 0], scale: [0.9, 1] },
          {
            ...SPRING,
            delay: stagger(0.055, { startDelay: 0.46 }),
            opacity: { duration: 0.45, ease: EASE },
          }
        ).finished
      )
    }

    await Promise.all(jobs)
    // A lingering inline blur(0px) creates a compositing layer that can look soft
    // on some GPUs. Hand the title back to CSS once the entrance is done.
    if (title) title.style.filter = ''
    try {
      sessionStorage.setItem('home-entrance', 'played')
    } catch {}
  }

  const setupHeroParallax = () => {
    if (!hero) return

    const layers: Array<[HTMLElement | null, number, number]> = [
      [byline, -52, 0],
      [title, -40, 0],
      [context, -28, 0.1],
      [avatar, -72, 0],
      [stats, -18, 0.4],
    ]

    // Percent offsets keep the range tied to the hero height and avoid Chromium's
    // native ViewTimeline "exit" range, which starts this hero at ~50% progress.
    const range: Array<`${number}%`> = ['0%', '100%']

    for (const [el, distance, endOpacity] of layers) {
      if (!el) continue
      store.cleanups.push(
        scroll(animate(el, { y: [0, distance], opacity: [1, endOpacity] }, { ease: 'linear' }), {
          target: hero,
          offset: range,
        })
      )
    }
  }

  const setupReveals = () => {
    if (!revealItems.length) return

    for (const el of revealItems) {
      el.style.opacity = '0'
      el.style.transform = 'translateY(18px)'
      el.style.willChange = 'opacity, transform'
    }

    requestAnimationFrame(() => root.classList.remove('reveal-pending'))

    for (const el of revealItems) {
      let stop: (() => void) | undefined
      stop = inView(
        el,
        () => {
          stop?.()
          animate(el, { opacity: [0, 1], y: [18, 0] }, { duration: 0.62, ease: EASE }).finished.finally(() => {
            el.style.opacity = ''
            el.style.transform = ''
            el.style.willChange = ''
          })
        },
        { margin: '0px 0px -8% 0px' }
      )
      store.cleanups.push(() => stop?.())
    }
  }

  const run = async () => {
    try {
      setupReveals()

      if (entrancePlayed) {
        root.classList.remove('motion-pending')
      } else {
        await playEntrance()
        root.classList.remove('motion-pending')
      }

      setupHeroParallax()
    } catch {
      clearPending()
      if (title) title.style.filter = ''
      resetRevealStyles(revealItems)
    }
  }

  run()
}

if (!store.bound) {
  store.bound = true
  document.addEventListener('astro:before-swap', () => {
    for (const cleanup of store.cleanups) cleanup()
    store.cleanups = []
  })
  document.addEventListener('astro:page-load', init)
}

init()
