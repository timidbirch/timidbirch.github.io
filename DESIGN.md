# Portfolio design and maintenance

The website uses the floating-glass, scroll-film direction from
[Floating Astronaut Portfolio](https://github.com/floating-astronaut/astro-portfolio-template),
adapted to the existing Astro 6 bilingual content collections and GitHub Pages deployment.
Reference revision: `c743aab2ab820e97d51f93142cc3a117b31f6daf`.
The original MIT notice is retained at `public/licenses/floating-astronaut.txt`.
The original Litos license remains in `LICENSE`.

## Main files

- `src/components/portfolio/Home.astro`: bilingual homepage; latest experience is loaded automatically.
- `src/components/portfolio/Experience.astro` and `ExperienceCards.astro`: experience listing and cards.
- `src/components/portfolio/Projects.astro`: project listing and images.
- `src/layouts/Header.astro`: navigation order and locale-aware links.
- `src/styles/portfolio.css`: design tokens, glass surfaces, responsive layout, and reduced-motion styles.
- `src/scripts/portfolio.ts`: scroll-film seeking, card tilt, reveals, motion pause, and ClientRouter cleanup.

## Content

Keep writing projects in `src/content/projects/<slug>/index.mdx` and experience
in `src/content/experiences/<slug>/index.mdx`. Existing bilingual frontmatter and
routes are preserved. Project and experience counts on the homepage are computed
from published content, never hardcoded.

## Background film

The files in `public/media/film/` are the template's generated abstract demo film,
not personal footage. Desktop loads the 1080p file; coarse-pointer devices load
the smaller 540p file. Scroll drives the paused video with a smoothed playhead and
one seek at a time. Failed playback falls back to the poster. Reduced-motion
visitors keep the static poster and do not download the video. The on-page motion
control pauses the film, orb animation, marquee, and pointer tilt.

To customize the film, replace the two MP4 files and poster with appropriately
licensed footage. Encode frequent keyframes for responsive seeking. Reference
the upstream `media-src/build-film.sh` for encoding settings.

## View counts

`ANALYTICS_CONFIG.vercount.enabled` in `src/config.ts` enables the footer's
site-wide and current-page view counts. `src/scripts/view-counts.ts` records one
view per Astro page navigation through Vercount's public v2 API. Anchor changes
do not add views. Development mode and hosts other than the configured live host
are excluded. Trailing slashes are normalized; query strings and fragments are
not sent. Chinese and English URLs have separate page totals but share the site
total. These are page views, not unique visitor counts, and historical traffic
before enabling the counter is not reconstructed.

The service receives the public page URL and the normal connection metadata of
the browser request. A host-scoped `vercount_uv_…` first-party cookie matches the
provider's anonymous visitor marker (one-year lifetime); no visitor identities
or site credentials are sent. Failed requests leave an em dash with an
unavailable status rather than a fabricated number. The provider's auto-counting
script must not be enabled alongside this handler, or views would be doubled.

## Publishing

Run `npm run build`, commit changes, and push `main`. The workflow at
`.github/workflows/deploy.yml` builds and deploys to GitHub Pages automatically.
