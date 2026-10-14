// Film gliding and pointer-light treatment adapted from Floating Astronaut (MIT).
// Lifecycle cleanup is added for this site's Astro ClientRouter.
let cleanup: (() => void) | undefined

function initializePortfolio() {
  cleanup?.()
  const controller = new AbortController()
  const { signal } = controller
  const motion = matchMedia('(prefers-reduced-motion: reduce)')
  const fine = matchMedia('(hover: hover) and (pointer: fine)')
  const header = document.querySelector<HTMLElement>('[data-float-header]')
  const video = document.querySelector<HTMLVideoElement>('[data-film]')
  let frame = 0
  let playhead = 0
  let target = 0
  let last = 0
  let inFlight = false
  let motionPaused = false
  let observer: IntersectionObserver | undefined
  let resizeObserver: ResizeObserver | undefined

  // Mark only off-screen content as pending so first-paint text never disappears.
  if (!motion.matches && 'IntersectionObserver' in window) {
    observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) {
        entry.target.classList.remove('is-pending')
        observer?.unobserve(entry.target)
      }
    }, { threshold: .08 })
    document.querySelectorAll<HTMLElement>('.reveal').forEach(el => {
      if (el.getBoundingClientRect().top > innerHeight) {
        el.classList.add('is-pending')
        observer?.observe(el)
      }
    })
  }

  document.querySelector<HTMLAnchorElement>('#language-toggle')?.addEventListener('click', event => {
    const link = event.currentTarget as HTMLAnchorElement
    try { localStorage.setItem('site-language', link.dataset.language || 'zh') } catch { /* Storage may be unavailable. */ }
  }, { signal })

  const resetCards = () => document.querySelectorAll<HTMLElement>('[data-tilt]').forEach(card => {
    card.style.removeProperty('transform')
  })
  document.querySelectorAll<HTMLElement>('[data-tilt]').forEach(card => {
    card.addEventListener('pointermove', event => {
      if (!fine.matches || motion.matches || motionPaused) return
      const box = card.getBoundingClientRect()
      const x = Math.max(0, Math.min(1, (event.clientX - box.left) / box.width))
      const y = Math.max(0, Math.min(1, (event.clientY - box.top) / box.height))
      card.style.transform = `perspective(1000px) translateY(-4px) rotateX(${(0.5 - y) * 6}deg) rotateY(${(x - .5) * 6}deg)`
      card.style.setProperty('--tilt-x', `${x * 100}%`)
      card.style.setProperty('--tilt-y', `${y * 100}%`)
    }, { signal })
    card.addEventListener('pointerleave', () => card.style.removeProperty('transform'), { signal })
    card.addEventListener('blur', () => card.style.removeProperty('transform'), { signal })
  })

  // Keep one seek in flight. RAF stops when the playhead reaches the scroll target.
  const tick = (now: number) => {
    frame = 0
    if (!video || motion.matches || motionPaused || document.hidden) return
    const dt = last ? Math.min(64, now - last) : 16
    last = now
    playhead += (target - playhead) * (1 - Math.pow(.5, dt / 110))
    if (Math.abs(target - playhead) < .025) playhead = target
    if (!inFlight && video.readyState >= 1 && Math.abs(video.currentTime - playhead) > .035) {
      inFlight = true
      video.currentTime = playhead
    }
    if (playhead !== target) frame = requestAnimationFrame(tick)
    else last = 0
  }
  const onScroll = () => {
    header?.toggleAttribute('data-scrolled', scrollY > 24)
    if (!video || motion.matches || motionPaused || !Number.isFinite(video.duration)) return
    const range = Math.max(1, document.documentElement.scrollHeight - innerHeight)
    target = Math.min(1, Math.max(0, scrollY / range)) * Math.max(0, video.duration - .1)
    if (!frame && !document.hidden) frame = requestAnimationFrame(tick)
  }
  const startFilm = () => {
    if (!video || motion.matches) return
    if (!video.getAttribute('src')) {
      video.src = matchMedia('(pointer: coarse)').matches ? video.dataset.srcMobile! : video.dataset.srcDesktop!
      video.load()
    }
    onScroll()
  }
  const prime = () => {
    if (!video || motion.matches || !video.paused) return
    void video.play().then(() => {
      video.pause()
      onScroll()
    }).catch(() => { /* Low Power Mode: retain the poster. */ })
  }
  const motionToggle = document.querySelector<HTMLButtonElement>('[data-motion-toggle]')
  motionToggle?.addEventListener('click', () => {
    motionPaused = !motionPaused
    document.documentElement.classList.toggle('motion-paused', motionPaused)
    motionToggle.setAttribute('aria-pressed', String(motionPaused))
    motionToggle.textContent = (motionPaused ? motionToggle.dataset.resumeLabel : motionToggle.dataset.pauseLabel) || ''
    if (motionPaused) { cancelAnimationFrame(frame); frame = 0; resetCards() }
    else onScroll()
  }, { signal })
  video?.addEventListener('loadeddata', () => {
    video.parentElement?.classList.add('is-ready')
    onScroll()
  }, { signal })
  video?.addEventListener('seeked', () => {
    inFlight = false
    if (!frame && Math.abs(video.currentTime - target) > .035) onScroll()
  }, { signal })
  video?.addEventListener('error', () => video.parentElement?.classList.remove('is-ready'), { signal })
  window.addEventListener('touchstart', prime, { once: true, passive: true, signal })
  window.addEventListener('scroll', onScroll, { passive: true, signal })
  window.addEventListener('resize', onScroll, { passive: true, signal })
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(frame); frame = 0; last = 0 }
    else onScroll()
  }, { signal })
  motion.addEventListener('change', () => {
    resetCards()
    if (motion.matches) {
      cancelAnimationFrame(frame); frame = 0
      video?.pause()
      document.querySelectorAll('.is-pending').forEach(el => el.classList.remove('is-pending'))
    } else startFilm()
  }, { signal })
  if ('ResizeObserver' in window) {
    resizeObserver = new ResizeObserver(onScroll)
    resizeObserver.observe(document.body)
  }
  onScroll()
  startFilm()
  cleanup = () => {
    controller.abort()
    cancelAnimationFrame(frame)
    observer?.disconnect()
    resizeObserver?.disconnect()
    video?.pause()
    document.documentElement.classList.remove('motion-paused')
  }
}

document.addEventListener('astro:page-load', initializePortfolio)
document.addEventListener('astro:before-swap', () => cleanup?.())
