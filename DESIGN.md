# Personal space design and maintenance

The site uses a seasonal background, a centered introduction, and paper-style
archives based on [Innei](https://innei.in/). Astro builds the Chinese and English
pages from the same published content.

- `src/layouts/Header.astro` contains the category and more menus.
- `src/components/space/Home.astro` displays recent writing and the latest album.
- `src/components/portfolio/BlogPost.astro` contains the reading layout and progress indicator.
- `src/components/photos/PhotoArchive.astro` provides the gallery and keyboard-operated photo viewer.
- `src/styles/space-shell.css` provides the shared visual styles and page transitions.

Project and work entries live in `src/content/projects` and
`src/content/experiences`. Add `updatedDate: YYYY-MM-DD` to a project entry to
include it in the timeline. Photo album titles, dates, and stable IDs live in
`src/lib/photos.ts`.

The articles and demos still use their existing routes. Project demos, artifacts,
and attribution are documented in `docs/WHU_PROJECT_REVIEW.md` and
`public/licenses/project-visuals.md`.

The footer controls the theme and background effects. Background particles are
shown without animation when the visitor requests reduced motion.

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
so no published post disappears. Category links display the corresponding published posts without importing vault folders.

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
