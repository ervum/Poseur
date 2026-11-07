# Frontend TypeScript, Angular, HTML & SCSS Coding Standard (`client/`)

Every TypeScript file, Angular component/service/directive, HTML template, and SCSS stylesheet created or modified in `client/` must adhere strictly to the author's idiosyncratic style, architectural philosophy, and formatting invariants.

---

### 1. Exhaustive Explicit Typing & Type System Idiosyncrasies
- **Zero Implicit Inference**: Every variable (`const`, `let`), class property, parameter, return type, `inject()` property, `signal()`, `computed()`, `input()`, `model()`, and inline callback parameter/return MUST have an explicit type annotation:
  ```typescript
  private readonly InterfaceService: InterfaceService = inject(InterfaceService);
  public readonly IsLoggedIn: WritableSignal<boolean> = signal<boolean>(false);
  public EffectiveType: Signal<FancyUIElementTypeType> = computed((): FancyUIElementTypeType => (this.Type() ?? this.GlobalType()));
  ```
- **Inline `type` Imports**: Signal and metadata types from `@angular/core` or local modules must use inline `type` modifiers:
  `import { Component, inject, signal, computed, type Signal, type WritableSignal, type InputSignal } from '@angular/core';`
- **Monadic Nullability Wrappers**: Never write raw `T | null` or `T | undefined` unions in application files. Always import and use `Nullable<T>`, `Undefinable<T>`, `Voidable<T>`, and `Void` from `@ervum/types`.
- **Parenthesized Unions, Intersections & 3-Parentheses Function Types**:
  - Wrap union and intersection type aliases in outer parentheses:
    `export type FancyUIElementTypeType = ('Primary' | 'Secondary');`
    `export type ServerConfigurationType = (ConfigurationType & SecretsType);`
  - Wrap function type signatures in three pairs of parentheses:
    `export type AnyFunction = ((...Arguments: any[]) => (any));`
- **Type & Interface Naming Suffixes**:
  - Union and configuration types must end with `Type` (even if the stem ends with `Type`, e.g., `FancyUIElementTypeType`).
  - Structured metadata/error/badge contracts must end with `Descriptor` (`FieldErrorDescriptor`, `ErrorInformationDescriptor`).
- **Interface & Type Semicolons**: Terminate all `type` aliases and `interface` declarations with a trailing semicolon (`};`).
- **`StringBooleanType` Indexing**: When mapping boolean states to configuration tuples, index by `StringBooleanType` (`'True' | 'False'`) via a `ParseBoolean(b: boolean): StringBooleanType` helper rather than branching with `if/else`.

---

### 2. Spatial Architecture & Logical Sectioning
- **Indentation**:
  - **TypeScript (`.ts`)**: `2` spaces.
  - **HTML Templates (`.html`) & SCSS (`.scss`)**: `4` spaces.
- **Hard Sectioning (`3 \n` / 3 empty lines)**: Used at the outermost file scope to separate macroscopic chapters:
  - Between the import block and top-level constants or `@Component` / `@Injectable` / `@Directive` decorators.
  - Between top-level constants/interfaces and the class decorator.
  - In `.scss` files: between `@use ... as s;` and `:host` or the first rule block, and between `:host` blocks and element class rules.
  - In `@ervum/types`: between major domain categories.
- **Soft Sectioning (`1 \n` / 1 empty line)**:
  - **Import Grouping**: Separate imports by origin with `1 \n`: (1) `@angular/*`, (2) `@ervum/*`, (3) third-party libraries (`rxjs`), (4) relative components, (5) relative directives, (6) relative services/i18n.
  - **Decorator `imports` Array**: Group `CommonModule`/`RouterOutlet`, background components, standalone `Fancy*` components, and directives with `1 \n` inside `@Component({ imports: [...] })`.
  - **Operational & Terminal Return Isolation**: Separate variable preparation, state mutation, and side effects with `1 \n`. Always precede a block's final `return` with `1 \n` if statements precede it.
- **Semicolons & Single-Line Guards**:
  - Every statement must end with `;`.
  - Short guard clauses (`if (!this.IsBrowser) return;`, `if (Event.key !== 'Tab') return;`) and trivial 1-line `@Output()` relay methods (`public OnFocus(): void { this.Focus.emit(); }`) are written on a single line.

---

### 3. Expression Isolation ("Parenthesitis")
Wrap compound expressions, member lookups, signal invocations inside comparisons, nullish coalescing chains, and object spreads in `(...)`:
- **Member & Signal Lookups in Expressions**:
  `private readonly DatabaseURL: string = (Configuration.SlashedProxyURL);`
  `if ((this.IconStatus) === 'Exiting')`
  `this.IsVisible = !(this.IsVisible);`
- **Nullish Coalescing & Optional Chaining**:
  `const Value: string = (((this.EmailTextbox?.InputValue) ?? '').trim());`
  `Item.Action(...((Item.ActionArguments) ?? []));`
- **Compound Conditionals & Spreads**:
  `if ((Event.key === 'Enter') || (Event.key === ' '))`
  `...(this.GetBaseClasses),`

---

### 4. Naming Conventions
- **Strict Unabbreviated `PascalCase`**:
  - All local variables, function/method parameters, class properties, methods, getters, signals, `input()` / `model()` properties, and `@Output()` emitters MUST use full, unabbreviated `PascalCase` (`BoundingRectangle`, `CurrentLanguage`, `ErrorObject`, `HandleUserButtonNavigation`, `ToggleInterfaceTypeWithTransition`). `camelCase` and `snake_case` are forbidden (except required Angular lifecycle hooks like `ngOnInit`, `ngAfterViewInit`, `ngOnChanges`, `ngOnDestroy`).
- **Acronyms in FULL CAPS**:
  - Standard acronyms (`ID`, `URL`, `HTTP`, `RGB`, `HSL`, `CSS`, `UI`, `DOM`, `NG`, `DTO`, `SSR`) must remain in FULL CAPS: `PlatformID`, `AnimationFrameID`, `DatabaseURL`, `HTTP`, `HSLToRGB`, `ApplyCSSVariables`, `GetUIType`, `NGStylesType`.
- **Placeholders & Loop Variables**:
  - Unused variables use `_`.
  - Numeric loops use `for (let i: number = 0; ...; i++)`. `for...of` loops use descriptive PascalCase nouns (`for (const FormField of this.TargetFormFields)`). The variable name `v` is strictly forbidden.
- **Translation Signal Exception**: `InterfaceService.T` is the canonical shorthand signal for the active `TranslationDictionary`.

---

### 5. Comment Taxonomy & Structural Folding
- **Type File Banners**: Use symmetrical mirrored slash headers in shared type files:
  - Major chapter: `///          Client Types          \\\`
  - Sub-chapter: `/////        Fancy Textbox       \\\\\`
- **Class Anatomy Regions**: Segment non-trivial components using `// #region <Name>` and `// #endregion` in standard order: `Configuration & State`, `Logic & Helpers`, `Style & Class Getters`, `Inputs`, `Outputs`, `Lifecycle & View Access`, `Event Handlers`.
- **SCSS Section Headers**: Use `/* --- Section Name --- */` separated by `3 \n` before the header.
- **JSDoc**: Document public/private methods, signals, and inputs with concise `/** ... */` docblocks.

---

### 6. Angular Template (`.html`) Formatting Invariants
- **Spaced `=` in All Attributes & Bindings**: Every HTML attribute, `[property]`, `(event)`, and `[(twoWay)]` binding MUST have a single space before and after `=`:
  ```html
  <FancyMinibutton
      class = "Back-Minibutton"
      [class.Home] = "SelectedIndex() === 0"
      [Tabindex] = "SelectedIndex() === 0 ? -1 : 0"
      Icon = "/assets/icons/shaftless-next-arrow.png"
      (click) = "NavigateBack()">
  </FancyMinibutton>
  ```
- **PascalCase Component & Directive Selectors**:
  - Standalone UI components use PascalCase element selectors (`<FancyButton>`, `<FancyTextbox>`, `<FancyDropdown>`, `<FancyCheckbox>`, `<FancyMinibutton>`, `<FancyMultibutton>`, `<FancyContainer>`, `<FancyTooltip>`, `<Aurora>`, `<DeepBackground>`).
  - Directives use `[FancyTypewriter]` and `FancySlideUpDown`.
- **Modern Control Flow Only**: Always use `@if`, `@else`, and `@for (Item of Items(); track $index)`. Never use `*ngIf` or `*ngFor`.
- **Vertical Attribute Grouping**: On multi-line elements, separate template refs (`#Ref`), DOM/a11y attributes, `[ngClass]`/`[ngStyle]`, data inputs, pointer events, keyboard events, and focus events with `1 \n` blank lines.

---

### 7. SCSS, Design Tokens & Visual Architecture
- **Shared Styles Barrel**: Every component stylesheet must begin with `@use '.../shared/styles' as s;` followed by `3 \n`.
- **Class & Token Naming**:
  - **CSS Classes**: `PascalCase-Hyphenated` (`Content-Section-Wrapper`, `Input-Field-Tooltip`), with `--` for variants/states (`FancyButton--Primary`, `Section--Loading`, `Hovering--First`) and `Is-*` / `Has-*` for boolean states (`.Is-Open`, `.Is-Drawn`, `.Is-SignUp`).
  - **SCSS Variables**: `$PascalCase-Hyphenated` (`$Radius-Standard`, `$Easing-Standard`, `$Slot-Width`).
  - **CSS Custom Properties**: `--kebab-case` (`--radius-standard`, `--surface-background`, `--edge-colour`).
- **Declaration Grouping**: Inside rule blocks, separate layout (`display: flex; place-content: center; place-items: center;`), positioning (`position`, `z-index`), dimensions (`width`, `height`, `padding`), surface/glassmorphism (`background-color`, `backdrop-filter`, `border`, `border-radius`), and transitions (`transition`, `transform`) with `1 \n`. Prefer `place-content` and `place-items` over separate `justify-content`/`align-items`.
- **Container Query (`cqmin`) Radii & Pseudo-Element Reset**: Use `container-type: size` with `cqmin` border radii (`--radius-standard`, `--radius-pill`). When nesting inside `FancyContainer`, move parent background/border to `::before` (`inset: 0; z-index: -1`) so child `cqmin` units resolve accurately.
- **Masked PNG Icons & CSS-Driven Math**: Render icons via `@include s.MaskedIcon($URL, currentColor)`. Drive dynamic component geometry (multibutton highlights, aurora parallax) by binding numeric state to CSS custom properties (`--selected-index`, `--button-count`, `--mouse-x`) and computing layout in CSS `calc()`.

---

### 8. Frontend UX & Behavioral Invariants
- **Three-Tier Theme Cascading**: Always represent themes as `'Primary'` (Lumina dark) and `'Secondary'` (Obsidian light), cascading `GlobalType` (`InterfaceService.InterfaceType`) and optional local `Type` input into `EffectiveType`.
- **Browser Chrome & Extension Lockdown**: Never use native browser popups (`alert`, `confirm`, `prompt`) or native input controls/autofill chrome. Maintain `BlockDarkModeExtensions` protections (`darkreader-lock`, `color-scheme: only dark/light !important`).
- **Choreographed Motion & SSR Hydration**:
  - Route changes must flow through `NavigationService.NavigateWithAnimation()` and `AnimationGuard` (`800ms` exit transition via `FancySlideUpDown`).
  - Dynamic UI text must bind `[FancyTypewriter]` for smooth delete-and-type transitions.
  - Persist randomized visual state (`Aurora`, `DeepBackground`) and user preferences across SSR hydration via `TransferState` (`makeStateKey`).
- **Deterministic Error Registry & `[1]` Interpolation**: Map all validation and backend errors through `ErrorRegistry` (`00_000`, `01_000`–`01_007`) and `TranslationDictionary`, using `[1]` for dynamic field name replacement (lowercased automatically when mid-sentence).
