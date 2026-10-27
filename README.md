# ChessPop 🍿 Live

**ChessPop** displays live chess games in an interactive 3D view. Pick a Lichess TV channel, grab some popcorn, and enjoy the show.

The 3D board is powered by [Chessfield](https://www.npmjs.com/package/chessfield). Live game data comes from [lichess.org/tv](https://lichess.org/tv).

## Routes

| Route    | Layout                                                                                           |
| -------- | ------------------------------------------------------------------------------------------------ |
| `/`      | Full-screen watch layout: 3D board, sidebar on desktop, popcorn menu on mobile/tablet, no navbar |
| `/about` | Project information with navbar                                                                  |
| `/help`  | Mouse and touch controls with navbar                                                             |

## Requirements

- Node.js 24 (see `.nvmrc`)
- pnpm 12 (see `packageManager` in `package.json`)

## Commands

```bash
pnpm install       # install dependencies
pnpm dev           # development server with local SSL
pnpm format        # format with oxfmt
pnpm check-format  # verify formatting
pnpm lint          # lint with oxlint
pnpm lint:fix      # lint and apply safe fixes
pnpm test          # unit tests, headless, one shot
pnpm test:watch    # unit tests in watch mode
pnpm test:coverage # unit tests with coverage
pnpm dist          # production build
```

## Testing

Unit tests use Karma + Jasmine and run in Chrome. `pnpm test` runs once with `ChromeHeadless`; `pnpm test:watch` keeps Karma running while developing.

## Deployment

```bash
mise run deploy
```

This builds the production app and deploys `dist/app/browser` with Wrangler.

## Credits

- Stream reader: [browser-ndjson-stream-reader.js](https://gist.github.com/ornicar/a097406810939cf7be1df8ea30e94f3e)
- [DaisyUI](https://github.com/saadeghi/daisyui)
- Popcorn favicon from [favicon.io](https://favicon.io/)
- [Angular CLI](https://github.com/angular/angular-cli)
- [Chessfield](https://www.npmjs.com/package/chessfield)