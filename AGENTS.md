# AGENTS.md — ChessPop.live

Guidance for coding agents working in this repo. Prefer this file over README for _how to change the app_.

## Product

ChessPop is a **spectator** site: live Lichess TV games rendered on an interactive 3D board. People watch, orbit the camera, and switch channels. They do not play.

Live site: [chesspop.live](https://chesspop.live). Local: `https://localhost:4200`.

## Stack

| Piece           | This repo                                                                                                                                     |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| App             | Angular 22, standalone components, TypeScript `strict` + `strictTemplates`                                                                    |
| Package manager | **pnpm 9.15** (default node_modules linker).                                                                                                  |
| Node            | `24.19.0` via mise                                                                                                                            |
| UI              | Tailwind CSS 4 + DaisyUI 5 (`light` / `dark`)                                                                                                 |
| Icons           | `@lucide/angular` (ISC). Per-icon standalone components.                                                                                      |
| 3D board        | `chessfield` (`setFen`, `configUpdate`). `chessground` is a **types** dependency of Chessfield, not a board we mount.                         |
| Live data       | Browser `fetch` of Lichess TV **NDJSON**                                                                                                      |
| SSR             | `@angular/ssr` + Express (`src/server.ts`). Prerender is on. WebGL, streams, `document`, `localStorage`, and `AudioContext` are browser-only. |
| Tests           | Karma + Jasmine. Specs are mostly CLI scaffolds and some are stale.                                                                           |
| Format          | Prettier + `prettier-plugin-tailwindcss` (`.prettierrc`)                                                                                      |
| Deploy          | Cloudflare Pages via Wrangler. Output: `dist/app/browser`.                                                                                    |

Angular CLI project name: `chesspop.live`. Dev server: host `0.0.0.0`, port `4200`, started with `--no-hmr`.