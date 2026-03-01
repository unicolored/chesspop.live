# AGENTS.md - ChessPop.live Development Guide

## Project Overview

- **Framework**: Angular 20 with standalone components
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

- Use **Angular 20 standalone components** (no NgModules unless required)
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

## Angular Best Practices

### TypeScript

- **Strict Type Checking**: Enable and adhere to strict type checking
- **Type Inference**: Let TypeScript infer types when obvious; avoid explicit types for simple assignments
- **Avoid `any`**: Use `unknown` when type is uncertain and must be handled safely

### Standalone Components

- Use standalone components, directives, and pipes. No `NgModules` for new features
- **Implicit Standalone**: Don't set `standalone: true` explicitly - it's the default
- Use **Signals** for reactive state management
- Implement **lazy loading** for feature routes
- Use **NgOptimizedImage** for static images
- Use `host` object in `@Component`/`@Directive` instead of `@HostBinding`/`@HostListener`

### Components

- **Single Responsibility**: Keep components small and focused
- **`input()` / `output()` Functions**: Prefer over `@Input()`/`@Output()` decorators
  ```typescript
  userId = input<string>("");
  userSelected = output<string>();
  ```
- **`computed()`**: Use for derived state based on signals
- **ChangeDetectionStrategy.OnPush**: Always use for performance
- **Inline Templates**: Prefer for small components
- **Reactive Forms**: Prefer over Template-driven forms for complex forms
- **No `ngClass` / `ngStyle`**: Use native `[class.xxx]` and `[style.xxx]` bindings instead

### State Management

- Use signals for local component state
- Use `computed()` for derived state
- State transformations should be pure functions (no side effects)
- **No `mutate` on signals** - use `update` or `set` instead

### Templates

- Keep templates simple - delegate complex logic to TypeScript
- Use **native control flow** (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use **async pipe** for observables to prevent memory leaks

### Services

- Single, well-defined responsibility
- Use `providedIn: 'root'` for singleton, tree-shakable services
- Prefer **`inject()` function** over constructor injection

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

- `@angular/core` (v20)
- `chessfield` - 3D chess visualization
- `chessground` - Chess UI library
- `daisyui` - TailwindCSS component library
