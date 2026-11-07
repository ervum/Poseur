# Modifications Ledger

This document tracks all architectural modifications, renames, and structural realignments performed across the repository.

---

## 2026-10-04: Monorepo Package Alignment & Architectural Documentation

### Rationale
Standardized monorepo naming conventions across shared packages and applications to ensure consistency across the workspace, align with workspace design standards, and establish formal agent lifecycle documentation.

### Modifications Summary

1. **Renamed Packages & Directories**:
   - `packages/shared-configuration` &rarr; `packages/shared` (`@ervum/shared`)
   - `portfolio-server` &rarr; `server` (`server`)
   - `portfolio-client` &rarr; `client` (`client`)

2. **Configuration & Dependency Updates**:
   - `pnpm-workspace.yaml`: Updated workspace directory mappings to `client`, `server`, and `packages/*`.
   - `package.json`: Updated root workspace paths, start/dev filter targets, and scripts.
   - `client/angular.json`: Updated project name to `client` and build targets to `client:build:production` / `client:build:development`.
   - `client/public/manifest.webmanifest`: Updated application `name` and `short_name` to `client`.
   - `client/package.json` & `server/package.json`: Updated internal dependency to `@ervum/shared: "workspace:*"`.
   - `client/tsconfig.json` & `server/tsconfig.json`: Updated compiler path mappings and project references to `../packages/shared`.
   - `client/src/app/core/services/authentication/authentication.ts`: Updated import to `@ervum/shared`.
   - `server/src/app.module.ts` & `server/src/main.ts`: Updated imports to `@ervum/shared`.

3. **Database Readiness (`database-up.mjs`)**:
   - Implemented dynamic import with fallback for `@ervum/shared` runtime secrets, preventing premature module resolution failures when packages are unbuilt.

4. **VS Code Task Integration (`.vscode/tasks.json`)**:
   - Renamed tasks to standardized labels: `Packages: Watch`, `Client: Start`, `Server: Start`, and `Development: All`.

5. **Documentation & Architectural Mapping**:
   - Created `.agents/ARCHITECTURE.md` establishing the authoritative structural topography, module relationships, and data pipelines from top to bottom.
   - Updated root `README.md` to reflect new directory structures, workflows, and test commands.

---

## 2026-10-04: Workspace Junction Repair & Build Cache Remediation

### Rationale
Resolved "Access is denied" and "Cannot read directory '..'" build errors encountered during `pnpm client:start` (`ng serve`) following the earlier monorepo package renaming.

### Modifications Summary

1. **Cache Purge**:
   - Removed corrupted/stale `client/.angular` cache leftover from the pre-rename project structure (`portfolio-client`).

2. **NTFS Workspace Junction Realignment**:
   - Removed broken junction `client/node_modules/@ervum/shared-configuration` and recreated `client/node_modules/@ervum/shared` pointing to `packages/shared`.
   - Removed broken junction `server/node_modules/@ervum/shared-configuration` and recreated `server/node_modules/@ervum/shared` pointing to `packages/shared`.
   - Removed broken junctions `node_modules/.pnpm/node_modules/portfolio-client` and `portfolio-server` and recreated junctions for `client` and `server`.

3. **Verification**:
   - Executed client production and server bundle compilation successfully with zero errors.

---

## 2026-10-04: Rollup Native Bindings Package Repair

### Rationale
Resolved `Cannot find module @rollup/rollup-win32-x64-msvc` error encountered during `ng serve --hmr` (`pnpm client:start`).

### Modifications Summary

1. **Restored Missing Package Metadata**:
   - Created missing `package.json` for `@rollup/rollup-win32-x64-msvc@4.52.3` pointing to native binary `./rollup.win32-x64-msvc.node`.

2. **Verification**:
   - Verified native module loading, `rollup@4.52.3`, and `vite@7.1.11` resolution via `@angular/build` with zero errors.

---

## 2026-10-20: Frontend Coding Standard & Author Trait Codification (`/learn`)

### Rationale
Analyzed the Angular 20 / TypeScript / HTML / SCSS frontend (`client/`) and shared workspace packages (`@ervum/types`, `@ervum/constants`, `@ervum/shared`) to codify the author's cross-language coding traits (adapted from their Luau coding standard) alongside frontend-specific architectural and formatting invariants.

### Modifications Summary

1. **Workspace & Directory Rule Updates**:
   - `.agents/AGENTS.md`: Appended **Section 18 (`Frontend TypeScript, Angular, HTML & SCSS Coding Standard (client/)`)** covering exhaustive explicit typing, monadic nullability wrappers (`Nullable<T>`, `Undefinable<T>`), parenthesized unions/3-parentheses function types, `StringBooleanType` indexing, spatial `3 \n` vs. `1 \n` sectioning, expression isolation ("parenthesitis"), strict `PascalCase` + FULL CAPS acronyms, spaced `=` in HTML bindings, PascalCase `Fancy*` selectors, `cqmin` container-query geometry, masked PNG icons, three-tier theme cascading, dark-mode extension defense, and `[1]` error interpolation, while keeping the file strictly within the 24,000-byte per-file rule cap.
   - `client/AGENTS.md`: Created dedicated directory-scoped frontend rulebook containing the full expanded specification and code examples.

2. **Architectural Documentation Synchronization**:
   - `.agents/ARCHITECTURE.md`: Added `client/AGENTS.md` to the monorepo structural overview.
   - `.agents/MODIFICATIONS.md`: Recorded this ledger entry.


---

## 2026-10-20: Full-Site UI/UX Modernization & Visual System Upgrade

### Rationale
Modernized the visual identity, typography, iconography, navigation shell, and responsive layout across the Angular 20 SSR frontend (`client/`) and shared workspace packages (`@ervum/types`, `@ervum/constants`). Replaced placeholder copy and `~3.3 MB` of raster PNG icons with crisp vector SVGs (`~5.5 KB`), introduced a cohesive violet-indigo brand accent (`#8b7cff` dark / `#5b47e0` light) over the Lumina/Obsidian dual-theme architecture, unified scattered corner controls into a floating glass top bar + responsive side/bottom dock, and implemented a real portfolio landing hero.

### Modifications Summary

1. **Shared Workspace Packages (`packages/`)**:
   - `packages/types/src/index.ts`: Added `IconNameType` union (18 icons) and extended `FancyUIElementStyleType` to `('Standard' | 'Backgroundless' | 'Accent')`.
   - `packages/constants/src/index.ts`: Added `IconsBasePath`, `IconFileExtension`, `CompactViewportMaximumWidth`, `HeroContactURL`, and `HeroTechnologyStack`.

2. **Design Tokens, Layout & Typography (`client/src/app/shared/styles/`, `client/src/styles.scss`, `client/src/index.html`)**:
   - `client/src/index.html`: Loaded `Inter:wght@300..800` and `Space Grotesk:wght@500;600;700`, updated `<title>` to `Ervum`, and added `meta[name="theme-color"]` + `meta[name="description"]`.
   - `client/src/app/shared/styles/variables.scss`: Added display font, fluid typography scale, spacing scale (`--space-1`..`--space-8`), surface/control radii, shell dimensions, and brand accent tokens (`--accent-brand`, `--accent-brand-soft`, `--accent-brand-glow`, `--focus-ring`, `--surface-highlight`, `--elevation-surface`) for both `Theme--Primary` and `Theme--Secondary`.
   - `client/src/app/shared/styles/layout.scss` (**Created**) & `index.scss`: Added `@mixin Compact`, `@mixin PageShell`, `@mixin GlassSurface`, and `@mixin FocusRing`.
   - `client/src/app/shared/styles/typography.scss`: Added `.Text-Display`, `.Text-Title`, `.Text-Eyebrow`, and `.Text-Gradient`.
   - `client/src/styles.scss`: Added `@media (prefers-reduced-motion: reduce)`, brand text selection styling, custom scrollbar, and centralized `:focus-visible` focus rings.

3. **Vector SVG Icon System (`client/src/assets/icons/`, `client/src/app/shared/utilities/icons.ts`)**:
   - Created 18 geometric SVG icons (`arrow.svg`, `at.svg`, `checkmark.svg`, `crossmark.svg`, `envelope.svg`, `eye.svg`, `hidden.svg`, `house.svg`, `key.svg`, `lock.svg`, `logo.svg`, `moon.svg`, `next-arrow.svg`, `phone.svg`, `shaftless-arrow.svg`, `shaftless-next-arrow.svg`, `sun.svg`, `user.svg`) and removed all 18 legacy `.png` files.
   - Created `client/src/app/shared/utilities/icons.ts` exporting `ResolveIconURL`.

4. **Standalone Components & Atmosphere (`client/src/app/shared/components/standalone/`)**:
   - Updated `FancyButton`, `FancyTextbox`, `FancyMultibutton`, `FancyMinibutton`, `FancyCheckbox`, `FancyDropdown`, and `FancyContainer` to use `ResolveIconURL`, SVG masks, the `'Accent'` CTA style, and brand-accent focus/selected/checked states.
   - Updated `Aurora` (`aurora.ts`) to constrain sphere hues to the curated `210°–315°` blue-indigo-violet band and honor `prefers-reduced-motion: reduce`.
   - Updated `DeepBackground` (`deep-background.scss`) with layered ambient radial glows and subtle SVG `feTurbulence` film grain.

5. **Internationalization, App Shell & Views (`client/src/app/`)**:
   - `core/internationalization/default.ts` & `es.ts`: Updated `PageName` to `'Ervum'` and added English/Spanish hero, authentication, and profile copy.
   - `app.html`, `app.ts`, `app.scss`: Unified navigation into `.Shell-TopBar` and responsive `.Shell-Dock` (switching `RouteSelector-Multibutton` orientation via `matchMedia`).
   - `home/home.html`, `home/home.ts`, `home/home.scss`: Built the portfolio landing hero with eyebrow badge, gradient headline, tagline, dual CTAs, and tech-stack chips.
   - `authentication/`, `authentication/recovery/`, `profile/`: Modernized cards, typography, responsive layouts, and brand-accent primary actions.

---

## 2026-10-20: Poseur Rebrand, Dual-State Stroked/Filled SVGs, Unified Atmosphere, Zoneless Performance Overhaul & Centered Top-Bar Dock

### Rationale
Executed five targeted enhancements: (1) rebranded the webpage title, wordmark, auth-card eyebrow, and PWA manifest to `"Poseur"` while preserving `"Hi, I'm Ervum."` in the hero headline; (2) introduced dual-state stroked (`<name>.svg`) and filled (`<name>-filled.svg`) SVG icons across all interactive components (`FancyMultibutton`, `FancyTextbox`, `FancyButton`, `FancyMinibutton`, `FancyDropdown`, `FancyCheckbox`, and `.Shell-Brand-Mark`) with smooth `0.28s` opacity cross-fading; (3) merged `<DeepBackground/>` and `<Aurora/>` into a single `<Atmosphere/>` component with 100% pixel parity (`isolation: isolate` on `.Atmosphere-Base`); (4) eliminated rendering lag on non-hardware-accelerated and GPU browsers via Zoneless Angular (`provideZonelessChangeDetection()`), native Web Animations API (`Element.animate()`) replacing `@angular/animations` (`-148.44 kB` raw / `-31.26 kB` gzipped initial bundle reduction), a self-parking `requestAnimationFrame` loop + passive `pointermove` listener, removal of nested `backdrop-filter` and `transition: all`, and `PerformanceService` auto-detecting software/slow rendering (`UNMASKED_RENDERER_WEBGL` + 45-frame rAF probe) to freeze `.Atmosphere-Sphere` and `.Hero-Eyebrow-Pulse` animations while keeping all `backdrop-filter` blurs intact; and (5) centered `.Shell-Dock` inside `.Shell-TopBar` via a 3-column CSS Grid (`minmax(0, 1fr) auto minmax(0, 1fr)`).

### Modifications Summary

1. **Shared Workspace Packages (`packages/`)**:
   - `packages/types/src/index.ts`: Added `SlideStateType`, `IconVariantType`, `IconVariantsDescriptor`, `AtmospherePalettePairDescriptor`, and `AtmosphereStateDescriptor`.
   - `packages/constants/src/index.ts`: Added `IconFilledSuffix` (`'-filled'`), `RouteTransitionDurationMilliseconds` (`800`), `RouteTransitionEasing`, `ReducedEffectsFrameBudgetMilliseconds` (`28`), `ReducedEffectsProbeFrameCount` (`45`), and `SoftwareRendererSignatures`.

2. **Brand Rebrand to `"Poseur"` (`client/`)**:
   - `client/src/app/core/internationalization/default.ts` & `es.ts`: Updated `PageName` to `'Poseur'` while keeping `HeroHeadlineAccent: 'Ervum.'`.
   - `client/src/index.html` & `client/public/manifest.webmanifest`: Updated `<title>`, meta description, `name`, and `short_name` to `"Poseur"`.

3. **Dual-State Stroked ↔ Filled SVG Icon System (`client/src/assets/icons/`, `client/src/app/shared/`)**:
   - Created 18 `<name>-filled.svg` icons alongside the 18 stroked `<name>.svg` icons (`36` SVGs total).
   - `client/src/app/shared/utilities/icons.ts`: Replaced `ResolveIconURL` with `ResolveIconVariants` and `GetIconVariantStyles`.
   - `client/src/app/shared/styles/variables.scss` & `mixins.scss`: Added `$Icons-Base-Path`, `$Icon-Filled-Suffix`, `$Duration-Icon-Swap` (`--duration-icon-swap`), `@function IconURL($Name, $Variant)`, `@mixin DualStateIcon`, and `@mixin IconFilled`.
   - Wired dual-state icons into `FancyMultibutton`, `FancyButton`, `FancyMinibutton`, `FancyTextbox`, `FancyDropdown`, `FancyCheckbox`, and `.Shell-Brand-Mark`.

4. **Unified `<Atmosphere/>` Component & `PerformanceService` (`client/src/app/`)**:
   - Created `client/src/app/core/services/performance/performance.ts` (`PerformanceService`) to detect software WebGL renderers or slow frame budgets (`> 28ms` median over 45 frames) and apply `:root.Effects--Reduced`.
   - Created `client/src/app/shared/components/standalone/atmosphere/atmosphere.{ts,html,scss,spec.ts}` (`AtmosphereComponent`) merging `DeepBackground` and `Aurora` with a single `TransferState` key (`Atmosphere-State`), passive `pointermove` tracking, and a self-parking `requestAnimationFrame` loop.
   - Deleted legacy `client/src/app/shared/components/standalone/aurora/` and `client/src/app/shared/components/standalone/deep-background/`.

5. **Zoneless Change Detection, Native WAAPI & Centered Top-Bar Dock (`client/`)**:
   - `client/src/app/app.config.ts`, `client/angular.json`, `client/package.json`: Replaced `provideZoneChangeDetection` + `provideAnimations` with `provideZonelessChangeDetection()` and removed `zone.js` and `@angular/animations`.
   - `client/src/app/shared/directives/slide-up-down/slide-up-down.directive.ts`, `navigation.ts`, `animation.guard.ts`: Replaced `AnimationBuilder` with native `Element.animate()` and centralized `RouteTransitionDurationMilliseconds`.
   - `client/src/app/shared/directives/typewriter/typewriter.directive.ts`: Replaced `innerText` with `textContent` to avoid forced layout reflows.
   - `client/src/app/app.html`, `app.ts`, `app.scss`, `shared/styles/layout.scss`: Centered `.Shell-Dock` inside `.Shell-TopBar` using a 3-column CSS Grid, set `RouteSelector-Multibutton` to horizontal across all viewports, displayed uppercase language codes (`EN`/`ES`) on compact viewports, and made `PageShell` horizontal padding symmetric.

---

## 2026-10-20: Cross-Project Performance Synthesis (Idle/Contention Lifecycle, Hybrid Blurless Sphere Fallback, Frame-Latched Pointer & Scoped Glass Blurs)

### Rationale
Synthesized the six additional performance optimizations identified during the cross-project audit with `Real Estate` (`background_layers_plan.md`) into `Poseur` (`client/` and `@ervum/constants`): (1) added an idle/scroll/visibility/contention state machine (`.Is-Idle`, `.Is-Scrolling`, `.Is-Hidden`, `:root.Is-Transitioning`, `:root:has(.FancyDropdown--Open)`) so `.Atmosphere-Sphere` (`Aurora-BlobFloat`) and `.Hero-Eyebrow-Pulse` (`Hero-Pulse`) pause when the user is inactive (`2.5s`), scrolling (`120ms` settle), hidden, or mid-transition; (2) implemented a hybrid sphere rasterization strategy that keeps `filter: blur(50px)` + `cqmin` on GPU hardware and automatically falls back to `filter: none; container-type: normal;` with soft 4-stop radial gradients (`GenerateSoftBlurlessGradient()`) under `:root.Effects--Reduced`, eliminating the `50px` Gaussian blur kernel and container-query layout cost on software renderers; (3) cached viewport dimensions via `ResizeObserver`, coalesced `250–1000 Hz` `pointermove` events to a single per-frame normalization + `Math.atan2` pass, and bypassed `pointermove` listeners on coarse-pointer (`(hover: none), (pointer: coarse)`) devices; (4) scoped `backdrop-filter: blur(var(--container-blur)) saturate(140%)` strictly to top-level glass surfaces (`:host-context(FancyContainer, .Shell-TopBar)` in `container.scss`) while preserving frosted glass on floating `.FancyDropdown-List` and `.FancyTooltip-Content` overlays, removing `12+` redundant nested `40px` blur passes; (5) rewrote `TypewriterAnimator` to use a single vsync-coalesced `requestAnimationFrame` loop and bypassed typewriter/view-transition animations under `Effects--Reduced`; and (6) replaced permanent `@HostListener('document:keydown')` and `@HostListener('document:click')` decorators in `app.ts` and `dropdown.ts` with native listeners (only attached when `IsOpen()` is `true` for `FancyDropdown`).

### Modifications Summary

1. **Shared Constants (`packages/constants/src/index.ts`)**:
   - Added `AtmosphereIdleTimeoutMilliseconds = 2500`, `AtmosphereScrollSettleMilliseconds = 120`, and `'mesa offscreen'` in `SoftwareRendererSignatures`.

2. **Atmosphere Contention Lifecycle, Hybrid Blurless Spheres, Frame-Latched Pointer & SSR `untracked` Guard (`client/src/app/shared/components/standalone/atmosphere/`, `home.scss`)**:
   - `atmosphere.ts`: Added `ResizeObserver` viewport dimension caching, raw `ClientX`/`ClientY` latching in `pointermove` with once-per-frame normalization + `Math.atan2` in `UpdateSmoothedValues()`, `(hover: none), (pointer: coarse)` listener bypass, `.Is-Idle`/`.Is-Scrolling`/`.Is-Hidden` host classes, and reactive sphere gradient regeneration via `GenerateSoftBlurlessGradient()` when `PerformanceService.IsReducedEffects()` is active. Wrapped `this.Spheres()` reads and `RegenerateGradients()` in `untracked(...)` (and guarded constructor `effect()` regeneration with `this.IsBrowser`) to prevent synchronous self-triggering `effect()` loops during Zoneless SSR.
   - `atmosphere.scss` & `home.scss`: Paused `Aurora-BlobFloat` and `Hero-Pulse` on `.Is-Idle`, `.Is-Scrolling`, `.Is-Hidden`, `:root.Is-Transitioning`, and `:root:has(.FancyDropdown--Open)`, and replaced `filter: blur(50px)` + `container-type: size` with `filter: none; container-type: normal; border-radius: 50%; transform: scale(1.35); animation: none;` under `:root.Effects--Reduced`.

3. **Scoped `backdrop-filter` & CSS / Output Cleanup (`container.scss`, `dropdown.scss`, `tooltip.scss`, `tooltip.ts`, `textbox.scss`, `button.scss`, `textbox.ts`)**:
   - `container.scss`: Disabled nested `backdrop-filter` inside parent `<FancyContainer>`s and `.Shell-TopBar` via `&:host-context(FancyContainer, .Shell-TopBar)`.
   - `dropdown.scss` & `tooltip.scss`: Explicitly preserved `backdrop-filter: blur(var(--container-blur)) saturate(140%)` on floating `.FancyDropdown-List` and `.FancyTooltip-Content`, and removed `will-change: transform; transform-style: preserve-3d;` from `:host` in `dropdown.scss`.
   - `tooltip.ts`: Guarded the 600ms fade-out `setTimeout` in `effect()` with `(typeof window !== 'undefined')` and `untracked(() => this.DisplayedMessage()) !== ''`, and registered `clearTimeout` via `OnCleanup`.
   - `textbox.scss`, `button.scss`, `textbox.ts`: Disabled `backdrop-filter` on `.FancyTextbox-Wrapper` and `.FancyButton--Accent`, and removed unused `@Output() Move` / `OnMove()` from `TextboxComponent`.

4. **Vsync-Coalesced `TypewriterAnimator`, `InterfaceService` & Zero-Overhead Document Listeners (`typewriter.ts`, `typewriter.directive.ts`, `interface.ts`, `app.ts`, `dropdown.ts`)**:
   - `typewriter.ts`: Replaced per-character `setTimeout` promises with a single vsync-coalesced `requestAnimationFrame` elapsed-time loop, guarded by `typeof window === 'undefined'` for SSR safety.
   - `interface.ts` & `typewriter.directive.ts`: Added `EffectiveTypewriter` computed signal (disabled under `IsReducedEffects()`), bypassed `document.startViewTransition` when `IsReducedEffects()` is `true`, and synced `:root.Is-Transitioning`.
   - `app.ts` & `dropdown.ts`: Replaced `@HostListener('document:keydown')` and `@HostListener('document:click')` with native DOM listeners (`dropdown.ts` attaches its outside-click listener via `effect()` only while `IsOpen()` is `true`).

---

## 2026-10-21: Multi-Layer Procedural Background System & Interactive Background Designer Drawer

### Rationale
Ported the full 7-layer procedural background system (`BackgroundsComponent` + `DeepBackgroundComponent` + `Mesh`, `Aurora`, `Topographic`, `Cadastral`, `Blueprint`, `Silk`, `Spotlight` + `BackgroundDesignerPanelComponent`), supporting standalone UI primitives (`FancyIcon`, `FancyToggle`, `FancySlider`, `FancySidebar`), and core background services (`BackgroundService`, `BackgroundPointerService`) from `Real Estate` into `Poseur`, adapted to `Poseur`'s Lumina/Obsidian **Violet-Indigo** brand palette (`#8b7cff` / `#5b47e0` / `BackgroundAccentPalette`), bilingual (EN/ES) translation dictionaries, and SSR `TransferState` hydration, replacing the legacy `<Atmosphere/>` component.

### Modifications Summary

1. **Dual-State SVG Icons (`client/src/assets/icons/`, `client/src/app/shared/utilities/icons.ts`)**:
   - Created 20 dual-state SVG files (`contour`, `gradient`, `grid`, `layers`, `orbs`, `parcels`, `refresh`, `shuffle`, `spotlight`, `waves` + `-filled.svg` variants; `56` SVGs total).
   - `icons.ts`: Normalized `BaseName` to lowercase in `ResolveIconVariants` for case-insensitive icon name resolution.

2. **Shared Packages (`packages/types/src/index.ts`, `packages/constants/src/index.ts`)**:
   - `packages/types/src/index.ts`: Expanded `IconNameType` (28 icons), added `FancyIconNameType`, `FancyIconVariantType`, `FancySidebarSideType`, `FancySidebarModeType`, `ID?: string` on `FancyMultibuttonItemType`, `Colours?: string[]` on `BackgroundPalette`, `RGBColour`, and all procedural background types (`BackgroundLayerIDType`, `BackgroundMotionModeType`, `BackgroundConfigurationModeType`, `VisitorBackgroundPreferenceModeType`, `BackgroundScopeType`, `BackgroundLayerSettings`, `BackgroundLayerParameterBoundsDescriptor`, `BackgroundLayerRandomRangeDescriptor`, `BackgroundLayerDescriptor`, `BackgroundLayersMap`, `BackgroundConfiguration`, `VisitorBackgroundOverride`, `BackgroundAccentPaletteStop`, `BackgroundGoldPaletteStop`, `BackgroundTextDescriptor`).
   - `packages/constants/src/index.ts`: Added `BackgroundAccentPalette` (6 Lumina/Obsidian Violet-Indigo stops: `#8b7cff`, `#5b47e0`, `#6e8efb`, `#c4b5fd`, `#4338ca`, `#a855f7`, plus `BackgroundGoldPalette` alias), `BackgroundLayerIDOrder`, `BackgroundMotionModes`, `BackgroundEvolvingTargetFPS`, `BackgroundLayerDescriptors`, `DefaultBackgroundLayersMap`, `CloneBackgroundLayersMap`, `SanitizeBackgroundConfiguration`, `RollRandomBackgroundLayers`, `DefaultPublicBackgroundConfiguration`, `DefaultAdminBackgroundConfiguration`, `DefaultVisitorBackgroundOverride`, `BackgroundTextDictionary`, `BackgroundMotionMultibuttonItems`, and `GetBackgroundModeMultibuttonItems`.

3. **Bilingual Internationalization (`client/src/app/core/internationalization/default.ts`, `es.ts`)**:
   - Added English and Spanish translation keys for the background header button tooltip, drawer title/subtitle, mode & motion labels, reroll/reset actions, reduced-effects notice, and all 7 layer names and descriptions (`BackgroundLayer_<LayerID>_Name`, `BackgroundLayer_<LayerID>_Description`).

4. **Core Background Services (`client/src/app/core/services/background/`)**:
   - Created `background.ts` (`BackgroundService`) managing visitor override state (`localStorage`), random session rolls (`sessionStorage` + SSR `TransferState`), scope configurations, and drawer open state (`IsDrawerOpen`).
   - Created `background-pointer.ts` (`BackgroundPointerService`) managing shared `ResizeObserver` viewport tracking, passive `pointermove` latching, self-parking `requestAnimationFrame` smoothing, and `.Is-Idle`/`.Is-Scrolling`/`.Is-Hidden` host contention classes.

5. **Supporting Standalone UI Components (`client/src/app/shared/components/standalone/`)**:
   - Updated `minibutton/` (`minibutton.ts`, `minibutton.html`, `minibutton.scss`) to support `[Active]`, `[Typewriter]`, click-emitted `(Activate)`, and icon + label pill layouts.
   - Created `icon/` (`icon.ts`, `icon.html`, `icon.scss` -> `<FancyIcon>`).
   - Created `toggle/` (`toggle.ts`, `toggle.html`, `toggle.scss` -> `<FancyToggle>`).
   - Created `slider/` (`slider.ts`, `slider.html`, `slider.scss` -> `<FancySlider>`).
   - Created `sidebar/` (`sidebar.ts`, `sidebar.html`, `sidebar.scss` -> `<FancySidebar>`).

6. **Procedural Backgrounds & Designer Panel (`client/src/app/shared/components/standalone/backgrounds/`, `client/src/app/app.*`)**:
   - Created `backgrounds.{ts,html,scss}` (`<Backgrounds>`), `shared/background-layer.scss`, `shared/procedural.ts` (`SimplexNoiseField`, `GenerateTopographicContours`, `GenerateCadastralParcels`, `GenerateSilkWavePaths`), `deep-background/`, `mesh/`, `aurora/`, `topographic/`, `cadastral/`, `blueprint/`, `silk/`, `spotlight/`, and `designer-panel/` (`<BackgroundDesignerPanel>`).
   - Updated `app.ts`, `app.html`, and `app.scss` to replace `<Atmosphere/>` with `<Backgrounds/>`, add the top-bar background drawer toggle button (`Icon = "layers"`), and mount `<FancySidebar>` housing `<BackgroundDesignerPanel>`.
   - Deleted legacy `client/src/app/shared/components/standalone/atmosphere/`.

---

## 2026-10-31: Workspace Junction & Binary Shim Re-Linking (`C:\Dev\Portfolio` -> `C:\Dev\Poseur`)

### Rationale
After the workspace root directory was renamed from `C:\Dev\Portfolio` to `C:\Dev\Poseur`, Windows NTFS directory junctions inside `node_modules` and `.bin` CLI wrapper scripts (`nest`, `ng`, `tsc`) still referenced absolute paths under `C:\Dev\Portfolio\node_modules\.pnpm\...`, causing `MODULE_NOT_FOUND` failures across `pnpm server:start:dev`, `pnpm client:start`, `pnpm packages:watch`, and `pg` resolution in `database-up.mjs`.

### Modifications Summary

1. **Workspace Dependency & Binary Re-Linking (`node_modules/`, `packages/*/dist/`)**:
   - Re-installed all `pnpm` workspace dependencies (`pnpm install`) to regenerate Windows NTFS junctions and `.bin` shims (`nest`, `ng`, `tsc`, `pg`) pointing to `C:\Dev\Poseur`.
   - Rebuilt `@ervum/types`, `@ervum/constants`, and `@ervum/shared` (`pnpm --filter "@ervum/*" build`) and verified PostgreSQL schema health via `pnpm db:up`.

2. **Architecture Map Path Synchronization (`.agents/ARCHITECTURE.md`)**:
   - Updated `@ervum/constants`, `@ervum/types`, and `@ervum/shared` file links from `file:///c:/Dev/Portfolio/...` to `file:///c:/Dev/Poseur/...`.


---

## 2026-10-31: Phase 0 — Quick Fixes, Validator SSOT, Recovery Consolidation & Drawer Focus Trapping

### Rationale
Executed Phase 0 of the improvement roadmap to resolve UX regressions, eliminate hardcoded literals and duplicated branch ladders (Rules 12, 14, and 15), parallelize backend uniqueness/recovery queries, localize all recovery outputs in English and Spanish, and trap `Tab` focus inside the open `<FancySidebar>` drawer without per-ancestor `getComputedStyle` layout thrashing.

### Modifications Summary

1. **Shared Packages (`packages/types/src/index.ts`, `packages/constants/src/index.ts`)**:
   - `packages/types/src/index.ts`: Added `ErrorRegistry['01_008']` (invalid phone number), `RecoveryTargetType`, and changed `MatchedBy` on `RecoverUsernameResultItem`, `RecoverPhoneResultItem`, and `RecoverEmailResultItem` to `string[]`.
   - `packages/constants/src/index.ts`: Added `EmailValidationPattern`, `PhoneNumberValidationPattern`, `PhoneNumberMinimumDigits`, `PhoneNumberMaximumLength`, `PhoneNumberAllowedCharacters`, `PasswordMinimumLength`, `ErrorTooltipResetDelayMilliseconds`, `AuthenticationRedirectDelayMilliseconds`, `AuthenticationTabSwitchErrorDelayMilliseconds`, `IsValidEmailAddress`, and `IsValidPhoneNumber`.

2. **Bilingual Internationalization (`client/src/app/core/internationalization/default.ts`, `es.ts`)**:
   - Added `RecoveredUsername`, `RecoveredPhoneNumber`, `RecoveredEmail`, `RecoveredPassword`, `RecoveryMatchedFor`, `RecoveryMatchedJoiner`, and `Error_01_008` in both English and Spanish dictionaries.

3. **Authentication View Hygiene & Redirect (`client/src/app/authentication/authentication.ts`, `authentication.html`)**:
   - Added post-Sign-Up redirect (`500ms` animated transition to `profile`) via shared `CompleteAuthenticatedSession`.
   - Replaced untracked `setTimeout` error-reset timers with tracked `ErrorResetTimeoutID`, `TabSwitchTimeoutID`, and `NavigationTimeoutID` handles cleaned up via `DestroyRef`.
   - Removed sensitive payload `console.log`/`console.error` dumps and deleted the duplicated `ToggleTheme` method.
   - Bound `[OnlyAllow]` and `[MaximumLength]` on the phone textbox to `PhoneNumberAllowedCharacters` and `PhoneNumberMaximumLength`, and added phone validation (`01_008`) to Sign Up.

4. **Consolidated Account Recovery (`client/src/app/authentication/recovery/recovery.ts`, `recovery.html`, `server/src/authentication/`)**:
   - `recovery.ts` & `recovery.html`: Collapsed six parallel computed getters and the 150-line `HandleRecovery` branch ladder into a single consolidated `ActiveRecoveryDescriptor` computed signal (`RecoveryModeDescriptor`, Rule 14) and reactive `RecoveryResults` with `[FancyTypewriter]` labels and tracked error-reset timers.
   - `authentication.controller.ts` & `dto/*.ts`: Parallelized the three uniqueness queries in `Register` via `Promise.all`, collapsed `RecoverUsername`/`RecoverPhone`/`RecoverEmail` into `ResolveDualFieldRecovery` returning structured `MatchedBy: string[]`, and applied shared validation patterns in `RegisterDTO`, `LoginDTO`, and `Recover*DTO`.
   - `authentication.controller.spec.ts`, `server/package.json`, `server/test/jest-e2e.json`: Configured Jest `@ervum/*` module mapping and added unit tests covering concurrent registration uniqueness checks, login, and structured recovery responses.

5. **Focus Loop Optimization & Sidebar Trapping (`client/src/app/app.ts`)**:
   - Scoped `GetFocusableElements` to `<FancySidebar.FancySidebar--Open .FancySidebar-Drawer>` when `BackgroundService.IsDrawerOpen()` is active, and replaced the ancestor `getComputedStyle` walk with native `Element.checkVisibility({ checkOpacity: false, checkVisibilityCSS: true })`.

---

## 2026-11-07: Git Index Cleanup & Monorepo Synchronization

### Rationale
Aligned `.gitignore` whitelist rules with `.agents/ARCHITECTURE.md` and `.agents/MODIFICATIONS.md`, untracked legacy cached `packages/constants/node_modules/` and `packages/constants/dist/` artifacts from the Git index, and staged, committed, and pushed all accumulated monorepo architectural, UI/UX, performance, procedural background, and validation updates to `origin/main`.

### Modifications Summary

1. **Git Ignore & Index Hygiene (`.gitignore`, `packages/constants/`)**:
   - Added `!.agents/ARCHITECTURE.md` and `!.agents/MODIFICATIONS.md` to `.gitignore` so architectural and modification documentation is tracked alongside `.agents/AGENTS.md`.
   - Removed tracked `packages/constants/node_modules/` and `packages/constants/dist/` entries from the Git index (`git rm -r --cached`) while preserving local files on disk.
