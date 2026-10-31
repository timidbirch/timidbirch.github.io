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
- `src/components/portfolio/ProjectCards.astro`: shared project cards for the homepage and listing.
- `src/components/portfolio/ProjectReferences.astro`: bilingual upstream references, separate from personal source links.
- `src/components/portfolio/ProjectShowcase.astro` and `demos/`: bilingual interactive project previews, source walkthroughs and experiment comparisons.
- `src/styles/project-showcase.css`: isolated demo styles and container-based responsive layouts.
- `src/layouts/Header.astro`: navigation order and locale-aware links.
- `src/styles/portfolio.css`: design tokens, glass surfaces, responsive layout, and reduced-motion styles.
- `src/scripts/portfolio.ts`: scroll-film seeking, card tilt, reveals, motion pause, and ClientRouter cleanup.

## Content

Keep writing projects in `src/content/projects/<slug>/index.mdx` and experience
in `src/content/experiences/<slug>/index.mdx`. Existing bilingual frontmatter and
routes are preserved. Project and experience counts on the homepage are computed
from published content, never hardcoded.

Homepage featured projects are selected by content slug; the full listing includes
all published entries. Unknown project dates are omitted. The current preview covers
are browser captures of the portfolio demos; their labels identify demonstrations,
real experiment materials, and conceptual walkthroughs. Older SVG architecture
illustrations remain in the content folders as source assets.
See `docs/WHU_PROJECT_REVIEW.md` for the source-to-portfolio review and attribution decisions.

Project details lead with `#project-preview`, followed by optional original material
in `#project-materials` and the written case study in `#project-implementation`.
NCC Bus, research-report and remote-administration demos use local fixtures only;
they make no cloud, model, finance or remote-endpoint requests. The bus demo shares
its reservation/boarding state across three role views. Research reports export
the selected preset modules as a labelled Markdown sample. The security UI simulates
session and monitoring records without executing the source application's actions.

PIMoG renders the unmodified five-panel experiment strip using CSS views, with a
keyboard-accessible comparison slider. RAGFUZZ includes a real archived driver
excerpt; remaining stage views are conceptual. Mimic-Talker and Holdem explorers
explain the documented pipeline/architecture and do not run those models or game
engines. Holdem's existing real screenshots are retained. Upstream image provenance
and license copies are recorded in `public/licenses/project-visuals.md`.

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

## Blog and Obsidian

The `/blog` and `/en/blog` pages share the `posts` content collection. Blog cards
support combined title/description/tag search and tag filtering; article pages
include a heading-based table of contents. The interface is bilingual, but note
bodies retain their declared original language. No existing vault notes were
published with the initial blog scaffold.

Four topic sections are configured in `src/lib/blog-categories.ts`: technology,
finance, product, and learning. `/blog/category/<id>` and the mirrored English
routes filter published posts by their `category` frontmatter. The overview shows
all posts; legacy labels are normalized, and unknown labels fall back to learning
so no published post disappears. Section cards always display real counts,
including zero, without importing vault folders.

`npm run blog:sync` selectively exports notes with `publish: true` from the local
Obsidian vault. It never modifies the source vault, follows symlinks, copies
unselected notes, or recursively publishes linked notes. Only referenced raster
images are exported. `--dry-run` previews without writing. Generated files are
tracked in `scripts/obsidian-manifest.json`; unpublishing requires another sync
and deployment. CI builds only committed exports and never reads the vault.
See `BLOG_GUIDE.md` for the full writing and publishing workflow.

## Publishing the website

Run `npm run build`, commit changes, and push `main`. The workflow at
`.github/workflows/deploy.yml` builds and deploys to GitHub Pages automatically.
