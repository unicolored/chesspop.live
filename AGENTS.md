# AGENTS.md — ChessPop.live

Guidance for coding agents working in this repo. Prefer this file over README for *how to change the app*. README is the public product blurb.

## Product

ChessPop is a **spectator** site: live Lichess TV games rendered on an interactive 3D board. People watch, orbit the camera, and switch channels. They do not play.

Live site: [chesspop.live](https://chesspop.live). Local: `http://localhost:4200`.

**Stay in that product.** Do not add a playable board, engine, accounts, or a second 2D chessground UI unless the user asks. Improve the live-watch loop: stream reliability, channel UX, player/clock info, camera/theme, and the 3D stage.

Chessfield is **GPL-3.0**. This app is a combined work — do not add dependencies whose licenses cannot be combined with GPL.

## Stack

| Piece | This repo |
|-------|-----------|
| App | Angular 20, standalone components, TypeScript `strict` + `strictTemplates` |
| Package manager | **Yarn 4.18** (Berry, `nodeLinker: node-modules`). Never npm/pnpm. |
| Node | `24.19.0` via mise |
| UI | Tailwind CSS 4 + DaisyUI 5 (`light` / `dark`) |
| 3D board | `chessfield` (`setFen`, `configUpdate`). `chessground` is a **types** dependency of Chessfield, not a board we mount. |
| Live data | Browser `fetch` of Lichess TV **NDJSON** |
| SSR | `@angular/ssr` + Express (`src/server.ts`). Prerender is on. WebGL, streams, `document`, `localStorage`, and `AudioContext` are browser-only. |
| Tests | Karma + Jasmine. Specs are mostly CLI scaffolds and some are stale. |
| Format | Prettier + `prettier-plugin-tailwindcss` (`.prettierrc`) |
| Deploy | Cloudflare Pages via Wrangler. Output: `dist/app/browser`. |

Angular CLI project name: `chesspop.live`. Dev server: host `0.0.0.0`, port `4200`, started with `--no-hmr`.

## Commands

```bash
yarn start          # ng serve on http://localhost:4200 (0.0.0.0, no HMR)
yarn watch          # ng build --watch --configuration development
yarn test           # Karma (watch). Headless once:
                    #   yarn test -- --no-watch --browsers=ChromeHeadless
                    # One file:
                    #   yarn test -- --include="**/theme.service.spec.ts"
yarn check          # Prettier check ./src
yarn format         # Prettier write ./src
yarn build          # mise → ng build --configuration production → dist/app/browser
yarn deploy         # mise → wrangler pages deploy (does NOT build; run yarn build first)
```

There is no `yarn prod` and no GitHub Pages (`ngh`) deploy. `script/cibuild.sh` still calls `yarn prod` — treat that script as stale.

Do not run `yarn deploy` or `script/release.sh` unless the user asked. Release script assumes git-flow branches (`next` / `main`) that may not match the current `develop` checkout.

## Layout

```
src/
  index.html                 # Dev HTML
  index-production.html      # Prod HTML (Umami). angular.json production uses this.
  styles.css                 # Tailwind + DaisyUI + dark variant
  server.ts / main.server.ts # SSR entry
  app/
    app.routes.ts            # Only "" and "about" (lazy)
    app.component.*          # Navbar, theme toggle, router-outlet
    pages/page-live/         # Home: stream + Chessfield + channel sidebar
    pages/about/             # Static about
    pages/widget/            # Not routed. Do not grow it unless wiring a route.
    pages/pages.service.ts   # Empty. Do not dump unrelated logic here.
    component/players/       # White/black cards; click emits camera color
    component/theme-toggle/  # Sound + light/dark
    service/stream.service.ts
    service/theme.service.ts
    service/audio.service.ts
    board/lichess.interface.ts   # Lichess TV payload types
    board/chessfield.*.ts        # Stale chessground-shaped copies. Prefer package types.
public/                      # Static assets + Cloudflare `_headers`
wrangler.toml                # Pages project chesspop-live
mise.toml                    # Node, ng, build, deploy
```

**Where to edit**

| Goal | Files |
|------|--------|
| New Lichess TV channel | `live.service.ts` (`liveList` + `LiveFeed` / `LiveType`) |
| Consume stream events | `live.component.ts`, `feed.interface.ts`, `board/lichess.interface.ts` |
| NDJSON reader | `stream.service.ts` only |
| 3D board init / FEN / camera | `live.component.ts` — types from `chessfield`, not local `board/chessfield.*` |
| Player chrome | `component/players/` |
| Theme / sound | `theme.service.ts`, `theme-toggle/`, `audio.service.ts`, `styles.css` |
| New page | `app.routes.ts` + `pages/<name>/`. Lazy `loadComponent` like existing routes. |
| Shell / nav | `app.component.html` |
| Prod analytics / third-party scripts | `src/index-production.html` only, not `index.html` |

## Runtime contracts

### Lichess TV

`LiveService` catalogs channels. Default is `Lichess-top` → `https://lichess.org/api/tv/feed`. Others: `/api/tv/{blitz,bullet,rapid}/feed`.

The browser reads a long-lived NDJSON body. Each non-empty line is one JSON object:

```ts
{ t: "featured" | "fen", d: LichessStreamData }
```

- `featured` — new game. `d.players[]` has `color`, `rating`, `user.{id,name,title?}`. `LiveComponent` writes this into the `players` signal.
- `fen` — a move. `d.fen` is the position. `d.lm` is last-move UCI (`e2e4`); split with `/.{1,2}/g` into `chessground` `Key[]` for `setFen`. `d.wc` / `d.bc` are clocks (already typed, unused in the UI).

Do not start this stream during SSR. `LiveComponent` already gates on `isPlatformBrowser`.

Lichess allows browser CORS for these feeds. Do not add an Angular proxy unless CORS actually breaks.

### Chessfield

Package export is `"chessfield"` only (plus `chessfield/style.css`). Do not deep-import `chessfield/dist/...` — `exports` will reject it.

```ts
import { Chessfield } from "chessfield";
```

Unions (read from `node_modules/chessfield/dist/resource/chessfield.types.d.ts`, do not recopy into `src/app/board/`):

- `Camera`: `"white" | "right" | "black" | "left" | "top"`
- `Angle`: `"left" | "center" | "right"`
- `Mode`: `"light" | "dark"`

Public API: `new Chessfield(el, config)`, `setFen(fen, lastMove?)`, `configUpdate(partial)`.

This app's board theme plugin is `chesspop` (cream / red / gold), default camera `white`, angle `right`. WebGL: construct only in the browser, after `#chessfield` exists (`viewChild` + `effect` today).

`configUpdate` camera vs mode are different fields. Passing `"dark"` / `"light"` as `camera` is invalid.

### Theme and sound

- DaisyUI theme = `data-theme="light"|"dark"` on `<html>`. Not a `.dark` class.
- Tailwind dark variant is wired in `styles.css` to `[data-theme=dark]`. Use `dark:` utilities against that.
- Preference: `localStorage.darkMode` (`"dark"` | `"light"`).
- Sound starts **off**. `AudioService` is a tiny oscillator; `initSounds(true)` creates `AudioContext`. `playSound` no-ops until that exists.

### Stream service

`StreamService` is a process-wide singleton with one `isStreaming` flag and one `reader`.

- `startTv(url)` while already streaming returns `of(null)` and does not open a second body.
- Channel switch **must** `stopTv()` (cancel the reader, clear the flag) before `startTv()`.
- A JSON parse error currently `error()`s the whole Subject and kills the feed. Prefer skip/log on a bad line.
- There is no reconnect when Lichess closes the stream.

## Conventions

Match nearby files. Do not impose a new architecture.

- Standalone components, `inject()`, `input()` / `output()`, signals + `computed()` / `effect()` for local state.
- Native control flow (`@if` / `@for` / `@defer`). No `*ngIf` / `*ngFor`. Class/style via `[class.x]` / `[style.x]`, not `ngClass` / `ngStyle`.
- Routes stay lazy-loaded.
- `providedIn: "root"` for app-wide services.
- Browser-only APIs behind `isPlatformBrowser(inject(PLATFORM_ID))`.
- Subscribe with `{ next, error }`. Unsubscribe on destroy (`takeUntil` + a Subject that is **recreated** if the same component starts another stream).
- Types: no `any`; `unknown` then narrow. Prefer `chessfield` / `chessground/types` over new parallel copies in `board/`.
- No `console.log` in committed code. `console.error` only for real failures.
- Inline templates for tiny components (see `PlayersComponent`). Keep `LiveComponent` template external.
- Do not set `standalone: true` on new components (it is the default). Existing `LiveComponent` still sets it — leave unless you are already editing that decorator.

Styling: Tailwind utilities in templates; DaisyUI for chrome (`navbar`, `btn`, `menu`, `prose` on About). Component CSS files exist for layout that utilities would bury (`live.component.css` uses `@apply`). Sort classes with Prettier, not by hand.

`LiveComponent` does **not** use `ChangeDetectionStrategy.OnPush`. Do not flip OnPush on the live page without verifying stream → board updates still render.

## Improving the project

Keep diffs scoped. High-value work, in order, if the user does not specify:

1. **Stream lifecycle** — `LiveComponent.loadChannel` / `resetFeed` vs `StreamService`. Today `subscription` is never assigned, so `resetFeed` often does not complete `destroy$`; when it does complete it, `destroy$` is not recreated. Channel switching and teardown are unreliable. Fix stop/start/unsubscribe/recreate together. Add reconnect with backoff when the NDJSON body ends.
2. **Chessfield typing** — drop `@ts-ignore` in `updateCamera`; import `Camera` / `Angle` / `Mode`. Split “rotate camera to a side” from “apply light/dark mode” (the theme `effect` currently calls `updateCamera("dark"|"light")`, which is the wrong field).
3. **Use data we already parse** — `wc` / `bc` clocks, game `id` (link to lichess.org), last-move fallback when `lm` is missing.
4. **More TV channels** through `LiveService` (classical, ultraBullet, chess960, …) without cloning stream code.
5. **Tests that match the UI** — `app.component.spec.ts` still expects CLI hello-world (`h1` / `chessfield-live`). Fix or delete it before adding more specs. New tests: `StreamService` line buffering, `LiveService` lookup, player mapping, theme persistence.
6. **Dead code** — unrouted `widget/`, empty `PagesService`, unused `FormsModule` / `ReactiveFormsModule` on `LiveComponent`, unused `player.component.html` stub, local `board/chessfield.*` if you have switched to package types.

When you touch `live.component.ts` or `stream.service.ts`, fix lifecycle in that same change rather than adding another flag.

## Verify

- After UI or stream changes: `yarn start` if it is not already running, then hit `/` and `/about` on port 4200. Switch channels, toggle theme and sound, drag the board.
- `yarn check` (or `yarn format`) on `src/` you edited.
- `yarn build` before claiming production is fine. Chessfield/WebGL will not fully exercise under SSR — confirm the browser bundle, not only the prerendered HTML.
- Do not add tests that freeze the old `chessfield-live` title or “Hello, …” copy.

## Do not

- Install with npm/pnpm or change `packageManager` without being asked.
- Commit `console.log`, leftover `standalone: true` debates, or new NgModules.
- Edit `node_modules/chessfield`. Change app usage or bump the package.
- Put Lichess fetches or `new Chessfield` in constructors that run on the server.
- Deploy, retag, or run git-flow release scripts unless the user asked.
- Expand `pages/widget/` as a side playground. Either route it as a real feature or leave it alone.
- Add analytics/scripts to `src/index.html` (dev). Production-only extras go in `index-production.html`.
