# WHU project source review

Reviewed on 2026-10-31 against `/Users/chenpeihua/project/WHU project`.
This is an editorial evidence map for the portfolio, not a runtime acceptance report
for the archived applications. Source projects were read without executing their code.

## Coverage and website mapping

| Source directory | Website entry | Decision |
| --- | --- | --- |
| `fuzz/anza-fuzz-master` | `/projects/ragfuzz` | Expand existing bilingual entry with concrete AST, slicing, retrieval, generation, compilation, and coverage stages. The internal AnzaFuzz name is explained. |
| `fuzz/anza-fuzz-test` | Same RAGFUZZ entry | Companion build/corpus artifacts, not a separate portfolio project. |
| `PIMoG` | `/projects/pimog` | Add a research-practice entry; correct “screen recording” to screen shooting. Credit Fang et al.’s ACM MM 2022 implementation. |
| `ncc-bus` | `/projects/ncc-bus` | Add a frontend engineering entry covering passenger, driver, and administrator interfaces. |
| `Python-RAT` | `/projects/python-rat` | Add an open-source security lab entry with GUI and separate protection prototype. Credit the original MIT project. |
| `TradingAgents/TradingAgents` | `/projects/tradingagents` | Add an open-source financial research practice entry based on archived `cn-0.1.15`; credit TradingAgents-CN and Tauric Research. |

All entries have Chinese bodies and English `sectionsEn`, descriptions, summaries,
and tags. Existing Mimic-Talker and Holdem entries are retained: their source is
not supplied in this directory, so this review does not assert new verification
of their implementations. The published collection now contains seven projects.

## Evidence by project

### RAGFUZZ

- `README.md`: custom AnzaFuzz commands and integration with OSS-Fuzz.
- `infra/ast_helper_anza.py`: libclang traversal, function metadata, caller/callee
  relationships, structure definitions, backward slices, JSON knowledge base.
- `infra/rag_helper_anza.py`: metadata-bearing LangChain documents, embeddings,
  persistent Chroma, retrieval capped at three snippets, model invocation.
- `infra/configuration_anza.py`: per-library configuration, prompts, retry limits,
  container reuse, and target adaptations including tinyxml2 and cJSON.
- `infra/helper_anza.py`: `create_info_anza`, `llm_fuzz_anza`, Docker compilation,
  AddressSanitizer configuration, success/failure/prompt directories, coverage tools.
- Important boundary: failed compilation triggers regeneration with the same prompt.
  Compiler diagnostics are not added to a repair prompt. No new coverage uplift,
  benchmark result, or vulnerability count is inferred.
- Dates, award, and Wuhan University deployment are retained from the existing
  portfolio; those biographical claims are not independently proven by source code.

### PIMoG

- `README.md`: explicit attribution to the 2022 paper and separate train/embed/test modes.
- `model.py`: multi-scale U-Net-style encoder, 30-bit message, residual decoder,
  discriminator, encoder/noise/decoder composition.
- `Noise_Layer.py`: perspective, illumination, moiré, and Gaussian noise.
- `solver.py`: message/image/adversarial losses, input-gradient mask and external
  image mask, checkpoint loading and evaluation routines.
- `data_loader.py`, `main.py`: mask input, watermark matrix, configuration and modes.
- `PerspectiveTransformation/*.m`, saved checkpoint and example result images:
  perspective recovery and experiment artifacts.
- Existing 2023 exchange dates are retained as personal context. The methods are
  attributed to PIMoG rather than described as personally invented. No paper
  accuracy is reused as an independently reproduced personal result.

### NCC Bus

- `app.js`, `app.json`, `pages/home`, `pages/my`, `pages/editProfile`: global and
  local state, role-specific components, profile/email flows, navigation.
- `components/student-reservation`: today/tomorrow selection, route filtering,
  seat normalization, reservation creation/cancellation, history and token requests.
- `components/driver-home`, `pages/driver/bus-management`: seat/boarding views,
  QR scanning, token verification requests, manual entry.
- `components/admin-home`, `pages/admin/schedule-management`: route/schedule
  views, create/delete/status endpoints and periodic-day controls.
- `pages/admin/invitation`, `pages/admin/statistics`: invitation generation and
  reservation/boarding statistics.
- `utils/api.js`, `utils/storage.js`, QR utilities, WXML and WXSS: CloudBase/mock
  request paths, frontend persistence, presentation and boarding-code rendering.
- `architecture.md`, `task.md`, `api_response_example.md`, `my-page-refactor-report.md`
  were checked against code; plans are not treated as implemented backend behavior.
- Important boundaries: no backend source; role checks are frontend checks. Temporary
  user components are incomplete. The schedule-edit save binding refers to an absent
  `updateSchedule` handler. Teacher priority, penalties, queue reorder and notifications
  are requirements, not source-verified server features. No launch/user metrics or
  personal project dates are invented.

### Python-RAT

- `README.md`, `LICENSE`: upstream author FZGbzuw412 and MIT foundation.
- `server.py`, `client.pyw`: Windows TCP request/response architecture and management operations.
- `rat_gui.py`: Tkinter controls, background connection/command threads, response panel.
- `protect.py`: psutil process/network polling, confirmation dialog, logging,
  process termination on denial, status window.
- Important boundaries: the monitor is separate from action execution, the registry
  monitor is a placeholder, and arbitrary connection selection cannot reliably identify
  a specific session. No comprehensive prevention or endpoint-security claim is made.
  No operational commands, payloads, or downloadable client binaries are published.

### TradingAgents

- `README.md`, `README-ORIGINAL.md`, `ACKNOWLEDGMENTS.md`, `VERSION`: upstream
  lineage and archived version. No Git history is supplied to separate personal
  edits from upstream implementation, so the entry is framed as practice.
- `tradingagents/graph/setup.py`, `conditional_logic.py`, `trading_graph.py`,
  agent/state modules: analyst/tool loops, sequential analyst stages, bull/bear
  and risk debates, bounded iterations and shared state.
- `tradingagents/dataflows/data_source_manager.py` and data adapters: source
  selection and fallback. `db_cache_manager.py`: MongoDB/Redis persistence/cache.
- `web/app.py`, `web/utils/analysis_runner.py`, progress and results components:
  configuration, progress, analysis results and export interface.
- `web/utils/report_exporter.py`, `scripts/concat_reports_to_word.py`: modular
  report assembly and format conversion. Existing report/export files provide
  artifacts, not validated investment results.
- Important boundaries: no claim to have authored the multi-agent framework, no
  inference of parallel analyst execution, brokerage integration, verified backtest,
  or realized return. Unknown personal dates are omitted.

## Publication boundaries

The website contains edited descriptions, original demo presentation code,
browser captures, one original PIMoG experiment strip, and one explicitly credited
TradingAgents-CN README screenshot. License copies and image provenance are retained
under `public/licenses/`. Older original architecture SVGs remain available as source assets.
Environment files, API credentials, CloudBase identifiers, account/session data,
raw logs, financial research outputs, binaries, and third-party source archives
are not copied into public assets. External project links are labelled as upstream
references rather than personal source repositories. The portfolio's GitHub Pages
deployment workflow is preserved.

## Website validation

- `ASTRO_TELEMETRY_DISABLED=1 npm run build`: passes with zero Astro errors,
  warnings, or hints; 51 static pages and the bilingual Pagefind index are generated.
- Built-output checks: seven cards per locale; fourteen detail pages with headings,
  existing image assets, language toggles and valid local links; homepage count and
  featured-project destinations match the collection.
- Browser checks: desktop project listing, PIMoG detail and language switching,
  plus 390-pixel English detail/listing and homepage. Checked pages have no horizontal
  overflow. Original schematic covers render successfully.
- Archived project applications were not executed; runtime and deployment claims
  for those applications remain outside these website checks.

## Interactive presentation update

- Every project now has a bilingual interactive showcase. Project navigation separates
  the demo, implementation and optional original materials.
- NCC Bus: browser adaptation based on the original WXML views and source workflows.
  Fixture state covers reservations, cancellation, boarding tokens, verification,
  seat counts and administrator route navigation. This does not execute WeChat APIs.
- PIMoG: the original five-panel output is rendered unchanged, with a comparison
  slider and output selection. The original 128 × 128 resolution of each panel is
  stated; no new model inference or benchmark is implied.
- TradingAgents: an original upstream Streamlit screenshot and a separate local
  report specimen. Users can select preset modules, inspect the selected sections,
  and download the labelled fictional Markdown sample.
- Python-RAT: browser interface study of `rat_gui.py` and `protect.py`. Sessions,
  process records and allow/deny logs are simulated entirely inside React state.
  No remote-management code or network listeners are exposed.
- RAGFUZZ: clickable stages include an excerpt of the actual archived
  `projects/tinyxml2/Success/xmltest_tinyxml2_163.cpp` file. Flow diagrams are labelled
  as conceptual rather than runtime logs or new compiler results.
- Mimic-Talker and Holdem: clickable documented pipeline/architecture views; the
  former generates no audio/video and the latter retains existing real game captures.
- Six project covers were captured from these browser-rendered components. The
  list labels identify browser demos, experiments, source explorers and interface studies.

Interactive verification covered reservation/seat decrement, driver token verification,
boarding-state update, cancellation/seat restoration, report module selection and
export contents, experiment output selection and keyboard slider movement, source
stage navigation, and simulated monitoring consent/logging. All seven English
showcases were checked at 390-pixel width without horizontal overflow. Chinese
booking controls and language switching were checked as well. A decorative waveform
initialization mismatch was fixed by using integer pixel heights; rechecked navigation
and interaction produced no new hydration errors.
