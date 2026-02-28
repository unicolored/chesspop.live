# AGENTS.md - ChessPop.live Development Guide

## Project Overview

- **Framework**: Angular 19 with standalone components
- **Language**: TypeScript (strict mode enabled)
- **Styling**: TailwindCSS + DaisyUI
- **Testing**: Karma + Jasmine
- **Build**: Angular CLI
- **Package Manager**: Yarn (v4.9.1)

> **Note**: This project uses Yarn instead of npm. Run commands with `yarn` instead of `npm`.

## Commands

### Development

```bash
yarn start          # Start dev server on http://localhost:4200
yarn watch          # Build in watch mode
```

### Building

```bash
yarn build          # Development build
yarn prod           # Production build to dist/app/browser
yarn deploy         # Build + deploy to GitHub Pages (ngh)
yarn deploy:cf      # Build + deploy to Cloudflare Pages
```

### Testing

```bash
yarn test           # Run all tests (watch mode)
yarn test -- --no-watch --browsers=ChromeHeadless  # Single run
```

To run a **single test file**, use:

```bash
yarn test -- --include="**/theme.service.spec.ts"
```

To run a **single test**, use `.only`:

```bash
it('should create', () => { ... })  // Add .only temporarily
```

### Code Quality

```bash
yarn check      # Check formatting with Prettier
yarn format     # Auto-format code with Prettier
```

---

## Code Style Guidelines

### General

- Use **Angular 19 standalone components** (no NgModules unless required)
- Enable **strict mode** in TypeScript (`strict: true`)
- Use **signals** for component state (`signal()`, `computed()`, `effect()`)

### Imports

- Use **barrel exports** where appropriate
- Import paths: relative for same module, absolute for app-wide (`@angular/core`, `./service/...`)
- Use **standalone component imports** - add components to `imports: []` array
- Order imports: Angular, External libraries, App imports

### Naming Conventions

- **Components**: `PascalCase` - `LiveComponent`, `ThemeToggleComponent`
- **Services**: `PascalCase` ending with `Service` - `ThemeService`, `StreamService`
- **Files**: `kebab-case` - `live.component.ts`, `theme.service.ts`
- **Interfaces**: `PascalCase` - `LiveFeed`, `Player`
- **Booleans**: Prefix with `is`, `has`, `should` - `isDarkMode`, `hasError`

### Types

- Always define **return types** for functions
- Use **explicit types** over `any`
- Use **interfaces** for object shapes (not `type` unless union types needed)
- Enable strict template checking: `strictTemplates: true`

### Templates

- Use **strict template type checking**
- Avoid template type guessing
- Use **control flow syntax** (`@if`, `@for`) over `*ngIf`, `*ngFor`

### Error Handling

- Use **RxJS error handlers** in subscriptions:

```typescript
.subscribe({
  next: (data) => { ... },
  error: (err) => console.error('Error:', err),
})
```

- Always handle **platform checks** for browser-only code:

```typescript
if (isPlatformBrowser(this.platformID)) { ... }
```

### Testing

- Use **Jasmine** with **TestBed**
- Follow naming: `describe('ComponentName', () => { ... })`
- Use `fixture.detectChanges()` for change detection
- Test both success and error cases

### CSS / Styling

- Use **TailwindCSS utility classes** in templates
- DaisyUI components for UI elements
- Prettier plugin for Tailwind sorts classes automatically

### RxJS

- Always **unsubscribe** from subscriptions (`takeUntil`, `destroy$` pattern)
- Use `Subject<void>` for cleanup:

```typescript
private destroy$ = new Subject<void>();

ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}
```

### Console

- Avoid `console.log` in production code
- Use `console.error` for actual errors
- Remove debug logs before committing

---

## Project Structure

```
src/
├── app/
│   ├── board/           # Chess board related code
│   ├── component/       # Reusable components
│   │   └── players/    # Player display components
│   ├── pages/           # Route pages
│   │   └── page-live/  # Live TV page
│   └── service/         # Angular services
├── public/              # Static assets
└── styles.css           # Global TailwindCSS styles
```

## Key Dependencies

- `@angular/core` (v19)
- `chessfield` - 3D chess visualization
- `chessground` - Chess UI library
- `daisyui` - TailwindCSS component library
