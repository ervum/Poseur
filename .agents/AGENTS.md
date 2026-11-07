# Roblox Luau Coding Standard & Architectural Guidelines

Every Luau script or module created or modified in this workspace must adhere strictly to the author's idiosyncratic style, architectural philosophy, and formatting invariants.

---

### 1. File Initialization & Pragmas
- **Line 1**: Every file MUST begin with `--!strict` followed by an empty line (`1 \n`).
- Every variable, parameter, return value, and placeholder discard token must be explicitly typed.

---

### 2. Spatial Architecture & Logical Sectioning (Soft vs. Hard Newlines)
Code readability is spatial geometry. Whitespace signifies semantic distance:
- **Soft Sectioning (`1 \n` / 1 empty line)**: Used inside functions and local scopes to separate logical sub-steps within the same operational unit (e.g., variable preparation -> core logic -> diagnostics/logging).
  - **Operational Isolation**: Within any block or scope, distinct operational phases (state mutation, external call, diagnostic logging, and return) must NEVER be visually glued together on adjacent lines.
  - **Terminal Return Isolation**: A `return` or `return <value>` at the end of a block or function must always be preceded by an empty line (`1 \n`) if any statements precede it in that scope.
  - **Canonical Example**:
    ```luau
    -- CORRECT:
    LastKnownScriptHashes[RelativePath] = nil;

    print(`[Silicon Export] Synchronized deletion of <{BaseName}> to local disk.`);

    return;

    -- INCORRECT (FORBIDDEN):
    LastKnownScriptHashes[RelativePath] = nil;
    print(`[Silicon Export] Synchronized deletion of <{BaseName}> to local disk.`);
    return;
    ```
- **Hard Sectioning (`3 \n` / 3 empty lines)**: Used at the outermost module scope to delineate major macroscopic chapters of the file:
  - File pragma & imports -> `3 \n`
  - Service locators & dependencies -> `3 \n`
  - Settings, definitions & configuration tables -> `3 \n`
  - Function declarations -> `3 \n`
  - Event listeners & main execution code -> `3 \n`
  - Final module return

---

### 3. Semicolons & Single-Line Guard Termination
- **Mandatory Statement Semicolons**: Every statement, variable assignment, function call, and multiline return must terminate with a semicolon (`;`).
- **No Semicolons After `end`**: The `end` keyword inherently signifies closure; placing a semicolon after `end` is forbidden.
- **Single-Line Guard Exception**: In single-line guard statements (`if ... then break end`, `if ... then continue end`, `if ... then return end`), semicolons are completely omitted from the line.

---

### 4. Expression Isolation (Parenthesitis vs. Atomic Syntax)
Code is categorized as either **atomic** (already resolved values, literals, identifiers, or natural English logic) or an **expression** (an unsolved operation or compound lookup that yields a result):
- **Must Wrap in `(...)`**:
  - Member access on dependencies and instances: `(Dependencies.Import)`, `(script.Name)`, `(Player.Character)`
  - Enum items: `(Enum.HttpContentType.ApplicationJson)`
  - Arithmetic and math bounds: `(#PathObjects - 1)`, `for i = 0, (math.huge) do`
  - Mathematical computations: subdivide compound math into nested logical components:
    `local Obtained: boolean = (((1 / Chance) * Luck) > 50.0);`
- **Do NOT Wrap**:
  - Implicit boundaries: Function call arguments already possess an enclosing boundary: `foo(bar.baz)` (never `foo((bar.baz))`).
  - English logical keywords: `and`, `or`, and `not` represent grammatical glue, not mathematical expressions:
    `local Fallback: Instance = Primary or Default;`

---

### 5. Columnar Alignment & Table Formatting
- **Tables Only**: Columnar alignment of `=` and `:` is **strictly reserved for tables** (dictionaries, configurations, and type definitions). General procedural variable declarations use standard single-space formatting.
- **Trailing Commas**: Multiline table declarations must include a trailing comma on the final entry. Single-line table declarations omit trailing commas.
- **Spaced Empty Tables**: Empty tables are always written with an internal space: `{ }` (never `{}`).

---

### 6. Comment Taxonomy & Symbol Mentions
- **Permanent Architectural Comments**: Always use a triple-hyphen arrow: `---> <Explanation>`.
- **Temporary / Action Comments**: Use standard double hyphens: `-- TODO: <Note>`.
- **Multiline Comments**: Enclosed in three brackets: `--[[[ ... ]]]--`.
- **Symbol Delimiters**: When referencing functions, variables, instances, or types inside comments, enclose them in angle brackets `<Symbol>` or backticks \`Symbol\`.

---

### 7. Variable Naming Conventions
- **Unused Placeholders**: Unused variables must be named `_` and **must still be explicitly typed** (`_: number`).
- **Descriptive PascalCase**: Variables must be written in full, unabbreviated **PascalCase**, even if long (`PlayerCharacter`, `ExportDebounceTime`). Never abbreviate local variables inside statement scopes (e.g., do not write `local CN = ...`; write `local ClassName: string = ...`).
- **Exception A (Roblox Services & Core Singletons)**: Abbreviated to standard capital initials:
  `WS` (Workspace), `SSS` (ServerScriptService), `HRP` (HumanoidRootPart), `CHS` (ChangeHistoryService), `SES` (ScriptEditorService), `HTTP` (HttpService), `RS` (RunService), `D` (Debris).
- **Exception B (Loop Iterators)**: Temporal, universally understood indices `i`, `j`, `k` are permitted.
- **THE ABSOLUTE BAN ON `v`**: The variable name `v` is strictly forbidden. Values must always be given a descriptive name reflecting their type (e.g., `ChildInstance`, `PlayerEntity`, `Connection`).
- **Exception C (English Acronyms & Initialisms)**: Standard English acronyms (`ID`, `TV`, `URL`, `HTTP`, `JSON`, `API`, `UI`, `GUI`, `FPS`, `UUID`, `RGB`) are always written in **FULL CAPS** with **NO underscores or hyphens**:
  `PlayerID`, `PlaceID`, `AssetID`, `SmartTV`, `TargetURL`, `JSONPayload`, `UserUI`, `TargetFPS`.

---

### 8. Luau Type System Idiosyncrasies
- **Tail-Casting Anonymous Values**: Anonymous table literals, anonymous closure returns, and pure type modules must use tail casting (`:: <Type>;`) to enforce explicit contracts. Named returns (`return Connect;`, `return Table;`) never use tail casts.
- **Optional Index Keys**: Maps and arrays must type keys with optional markers to reflect nullable lookups in strict mode: `{ [string?]: any }`, `{ [number?]: RBXScriptConnection }`.
- **Spaced Variadics**: Variadic arguments and returns must have internal padding: `(( ... any) -> ( ... any))`.
- **Explicit Parentheses on Return Types**: Because `()` signifies void, functions returning values must enclose their return type in parentheses: `(): ()`, `(): (boolean)`, `(): (Instance, number)`.
- **The 3-Parentheses Function Type Rule**: Function signatures assigned to types or variables must consist of three pairs of parentheses:
  `((Params) -> (Returns))`
  Example:
  ```luau
  type ActionCallback = ((Instance, number?) -> (boolean));
  local Handler: ((string) -> ()) = (Dependencies.Handler);
  ```

---

### 9. Standard Library Shadowing
- Never shadow global libraries (`table`, `math`, `os`, `string`) as a performance micro-optimization.
- Only shadow and reassign a global library if you are **actively adding, modifying, or monkey-patching methods** on that global within the module.

---

### 10. Data Structures, Traversal & Expression Idioms
- **Zero-Indexed Traversal**: Mathematical offsets, chunk pagination, and hierarchical traversal structures explicitly start at index `0`:
  `local Paths: { [number?]: Instance } = { [0] = RootInstance };`
  `for Index: number = 0, (math.huge) do`
- **Boolean Normalization**:
  - Default true: `Variable = (Variable ~= false);`
  - Default false: `Variable = Variable or false;`
  - Prefer ternary assignments: `Result = Condition and TrueValue or FalseValue;`
- **String Literals vs. Interpolation**:
  - Plain strings use single quotes: `'Heartbeat'`, `'Script'`, `'POSTGETData'`.
  - Dynamic strings with embedded variables or inline ternaries use backticks:
    `print(`Successfully transferred {Count} item{(Count ~= 1) and 's' or ''}!`);`

---

### 11. Serialization Metaproperties & Control Sentinels
- Engine/metadata fields use double underscores: `__Properties__`, `__Attributes__`, `__Tags__`, `__Source__`, `__DuplicatedIndex__`, `__Unnamed__`.
- Execution control sentinels use uppercase bracketed strings: `'{STOP UNTIL TIMEOUT}'`, `'{RETURNED ARGUMENTS}'`, `'{NO TIMEOUT}'`.

---

### 12. Globalization & Unification (Zero Literal Repetition)
Never repeat literals, magic numbers, or hardcoded strings across operational scripts. Centralize all static data into single-source-of-truth modules:
1. **Geometric / Dimensional Tables**: Group axis and component names (`{ 'X', 'Y', 'Z' }`) into a centralized `Dimensions` module.
2. **Units & Mathematical Ratios**: Group conversion ratios (e.g., `SecondsPerMinute = 60`, `SecondsPerHour = 3600`) into a `TimeUnits` or `Conversion` module.
3. **Gameplay & Policy Configuration**: Decouple limits (e.g., `MaxJumpCount`, `SprintSpeed`) into dedicated `Settings` or `Configurations` modules.
4. **Localization & Human Text**: Place all player-facing and system notification text into dedicated language dictionaries (`English`, `Spanish`).

---

### 13. Polyglot Parity: Python & Tooling Scripts
When authoring or modifying Python scripts (e.g., companion daemons like `Silicon/Silicon.py`, automation utilities) in this workspace, the author's architectural philosophy and formatting invariants apply with equal force:
1. **Mandatory Statement Semicolons**: Every statement, variable assignment, import, function call, and return must terminate with a semicolon (`;`). (No semicolons after `def`, `class`, `if:`, `for:`, `while:`, `try:`, `except:`).
2. **Strict PascalCase Only**: All variables, parameters, functions, classes, and exception handles (`except Exception as Error:`) must use unabbreviated **PascalCase**. Snake_case and camelCase are strictly forbidden.
3. **Parenthesized Return Types**: Function return type annotations must be wrapped in parentheses: `def Handler(...) -> (None):`, `def Check() -> (bool):`.
4. **Spatial Geometry**:
   - `3 \n` between macroscopic chapters (Imports -> Globals/Tables -> Functions -> Main block).
   - `1 \n` between operational steps within functions.
5. **Columnar Alignment & Collections**: Columnar alignment of `:` is strictly reserved for dictionaries. Spaced empty collections `{ }`, `[ ]` and trailing commas on multiline dictionaries are mandatory.

---

### 14. Canonical Base-Unit Architecture & Consolidated Descriptors (Anti-Bloat Invariant)
Never generate hundreds of lines of fragmented, repetitive getter functions that branch across the same units or entities with hardcoded magic numbers.

- **1. Canonical Base-Unit Single Source of Truth (SSOT)**:
  - Every physical, spatial, temporal, dimensional, or domain quantity (Area, Distance, Radius, Volume, Time, Currency, Weight) MUST have exactly ONE designated **canonical Base Unit** (e.g., `SquareMeters`, `Meters`, `Seconds`, `Cents`).
  - All default values, minimums, maximums, steps, tolerances, and thresholds MUST be declared and stored **exclusively in this Base Unit**.
  - **Absolute Ban on Hardcoded Derived Units**: Writing separate numbers, magic constants, or inline fallback ladders for secondary or derived units (`SquareFeet`, `SquareYards`, `Hectares`, `Acres`) is strictly forbidden.
- **2. Single Centralized Conversion Engine**:
  - All conversions from the base unit to secondary units MUST flow through a single centralized conversion function or conversion factor map (e.g., `ConvertBaseUnitTo(Value, TargetUnit)` or `UnitConversionFactors[TargetUnit]`).
  - Never scatter ad-hoc multipliers, manual rounding hacks, or custom division formulas across individual accessor functions.
- **3. The Consolidation Invariant (Ban on Parallel Variant Functions)**:
  - **Strictly Forbidden**: Creating multiple parallel functions that query the same domain concept for different facets or bounds (e.g., writing `GetMapRadiusMinimumUnitValue(Unit)`, `GetMapRadiusMaximumUnitValue(Unit)`, `GetMapRadiusStepUnitValue(Unit)`).
  - **Mandatory Consolidation**: All related properties, bounds, or facets MUST be consolidated into **EXACTLY ONE function** returning a typed composite descriptor:
    ```typescript
    // TypeScript / Polyglot:
    export interface MapRadiusBoundsDescriptor {
      Minimum: number;
      Maximum: number;
      Step:    number;
    }

    export function GetMapRadiusBounds(TargetUnit: AreaMeasurementUnitType): (MapRadiusBoundsDescriptor) {
      return {
        Minimum: ConvertSquareMetersToUnit((DefaultMapRadiusBoundsInBaseUnit.Minimum), TargetUnit),
        Maximum: ConvertSquareMetersToUnit((DefaultMapRadiusBoundsInBaseUnit.Maximum), TargetUnit),
        Step:    ConvertSquareMetersToUnit((DefaultMapRadiusBoundsInBaseUnit.Step), TargetUnit),
      };
    }
    ```
    ```luau
    -- Luau:
    export type MapRadiusBoundsDescriptor = {
      Minimum: number,
      Maximum: number,
      Step:    number,
    };

    local function GetMapRadiusBounds(TargetUnit: AreaMeasurementUnitType): (MapRadiusBoundsDescriptor)
      return {
        Minimum = ConvertSquareMetersToUnit((DefaultMapRadiusBoundsInBaseUnit.Minimum), TargetUnit),
        Maximum = ConvertSquareMetersToUnit((DefaultMapRadiusBoundsInBaseUnit.Maximum), TargetUnit),
        Step    = ConvertSquareMetersToUnit((DefaultMapRadiusBoundsInBaseUnit.Step), TargetUnit),
      };
    end
    ```
- **4. Anti-Bloat Litmus Test**:
  - If you find yourself writing repetitive `if (Unit === ...) return ...` or `switch (Unit)` ladders across multiple functions for the same concept, you are violating this invariant. Stop immediately, define a single canonical base unit, write a single conversion function, and collapse the functions into a single descriptor getter.

---

### 15. Search Before Creating & Strict SSOT Enforcement (Anti-Duplication Invariant)
- **Mandatory Pre-Creation Search**: NEVER declare a new constant, dropdown list, option array, conversion factor, type, or dictionary without first thoroughly searching the codebase (`packages/constants`, `packages/types`, and shared services) to determine whether that concept, list, or mapping table already exists.
- **Canonical Extension Over Duplication**: When a concept or definition exists (e.g. `AreaUnitDropdownItems`, `AreaMeasurementUnitType`), always reuse, extend, or alias that canonical source. Writing isolated, parallel, or slightly divergent copies (such as declaring a separate `LotDimensionsUnitDropdownItems` when `AreaUnitDropdownItems` already exists) is strictly forbidden.
- **Single Source of Truth Unification**: Every shared domain list or set of options must live in exactly one location in `packages/constants` or `packages/types`, from which all components, services, and consumers import and derive.

---

### 16. Custom Dialogs & Modal Invariant (Absolute Ban on Native Browser Dialogs)
- **Zero Native Dialogs**: Calling `window.confirm()`, `window.alert()`, `window.prompt()`, or any default browser popup is **strictly forbidden across the entire repository**.
- **Modern Bespoke Dialogs**: All user confirmations, alerts, destructive action verifications, and prompts MUST use custom, modern-looking modals/dialogs styled with glassmorphism, accent highlights, and full design system integration (e.g. `FancyContainer`, dedicated confirmation modals).

---

### 17. Operational Lifecycle & Architectural Documentation (`ARCHITECTURE` & `MODIFICATIONS`)

Every agent operating within this workspace must adhere strictly to the following lifecycle workflow involving `.agents/ARCHITECTURE` and `.agents/MODIFICATIONS`:

- **1. Pre-Work Invariant (Token Optimization via Architecture Map)**:
  - Before starting any operational task, coding, or invoking expensive, wide-scope codebase searches or greps, you MUST first read `.agents/ARCHITECTURE`.
  - Use `.agents/ARCHITECTURE` as the primary structural outline to locate relevant components, services, models, and data (e.g., locating where placeholder or mocked information lives). Only perform targeted searches if specific symbol details are absent from the document.
- **2. Pre-Commit Invariant (Ledger Verification)**:
  - Before staging, committing, or pushing any code changes, you MUST read `.agents/MODIFICATIONS`.
  - Review the documented list of changes to formulate precise, truthful, and comprehensive commit messages matching the project's conventional commit standards.
- **3. Post-Work Invariant 1 (Modifications Ledger Update)**:
  - At the conclusion of every work session or task, you MUST update `.agents/MODIFICATIONS` by appending a structured entry with the latest changes made, files modified/created/deleted, and rationale.
- **4. Post-Work Invariant 2 (Architecture Map Synchronization)**:
  - At the conclusion of every work session or task, you MUST review and update `.agents/ARCHITECTURE` to reflect any new files, structural realignments, dependency changes (which file requires which), or component responsibilities, describing scripts from top to bottom.

---

### 18. Frontend TypeScript, Angular, HTML & SCSS Coding Standard (`client/`)

Every TypeScript file, Angular artifact, HTML template, and SCSS stylesheet in `client/` and `packages/` must adhere to these frontend invariants (see `client/AGENTS.md` for expanded examples):

#### 18.1 Exhaustive Explicit Typing & Type System Idiosyncrasies
- **Zero Implicit Inference**: Every `const`/`let`, property, parameter, return type, `inject()`, `signal()`, `computed()`, `input()`, `model()`, and inline callback parameter/return MUST have an explicit type annotation (`private readonly InterfaceService: InterfaceService = inject(InterfaceService);`, `public readonly IsLoggedIn: WritableSignal<boolean> = signal<boolean>(false);`).
- **Inline `type` Imports**: Use inline `type` modifiers for signal/metadata types (`import { Component, inject, signal, computed, type Signal, type WritableSignal, type InputSignal } from '@angular/core';`).
- **Monadic Nullability Wrappers**: Never write raw `T | null` or `T | undefined` unions in application files; import `Nullable<T>`, `Undefinable<T>`, `Voidable<T>`, and `Void` from `@ervum/types`.
- **Parenthesized Unions, Intersections & 3-Parentheses Function Types**: Wrap union/intersection type aliases in outer parentheses (`export type FancyUIElementTypeType = ('Primary' | 'Secondary');`) and function types in 3 pairs of parentheses (`export type AnyFunction = ((...Arguments: any[]) => (any));`).
- **Naming Suffixes & Semicolons**: Union/config types end with `Type` (including `FancyUIElementTypeType`); metadata/error contracts end with `Descriptor` (`FieldErrorDescriptor`). Terminate all `type` and `interface` declarations with `;` (`};`).
- **`StringBooleanType` Indexing**: Map boolean states to configuration tuples via `StringBooleanType` (`'True' | 'False'`) and `ParseBoolean(b: boolean): StringBooleanType` instead of `if/else` ladders.

#### 18.2 Spatial Architecture, Sectioning & Expression Isolation
- **Indentation**: `2` spaces for TypeScript (`.ts`); `4` spaces for HTML (`.html`) and SCSS (`.scss`).
- **Hard (`3 \n`) vs. Soft (`1 \n`) Sectioning**: Use `3 \n` between imports, top-level constants, and `@Component`/`@Injectable`, and in `.scss` between `@use ... as s;`, `:host`, and class rules. Use `1 \n` to group imports by origin (`@angular/*` -> `@ervum/*` -> `rxjs` -> components -> directives -> services/i18n), group `@Component.imports`, and isolate operational phases and terminal `return` statements.
- **Single-Line Guards & Relays**: Keep short guards (`if (!this.IsBrowser) return;`) and 1-line `@Output()` relays (`public OnFocus(): void { this.Focus.emit(); }`) on one line.
- **Expression Isolation ("Parenthesitis")**: Wrap compound expressions, member lookups, signal calls in comparisons, nullish coalescing chains, and object spreads in `(...)` (`if ((this.IconStatus) === 'Exiting')`, `(((this.EmailTextbox?.InputValue) ?? '').trim())`, `...(this.GetBaseClasses)`).

#### 18.3 Naming & Comment Taxonomy
- **Strict Unabbreviated `PascalCase`**: All local variables, parameters, properties, methods, getters, signals, `input()`/`model()`, and `@Output()` emitters MUST use full `PascalCase` (`BoundingRectangle`, `ErrorObject`, `ToggleInterfaceTypeWithTransition`). `camelCase`/`snake_case` are forbidden (except Angular lifecycle hooks `ngOnInit`, `ngAfterViewInit`, `ngOnChanges`, `ngOnDestroy`).
- **Acronyms in FULL CAPS**: Keep `ID`, `URL`, `HTTP`, `RGB`, `HSL`, `CSS`, `UI`, `DOM`, `NG`, `DTO`, `SSR` in FULL CAPS (`PlatformID`, `AnimationFrameID`, `DatabaseURL`, `HTTP`, `HSLToRGB`, `ApplyCSSVariables`, `GetUIType`, `NGStylesType`). `InterfaceService.T` is the sole single-letter signal alias (active `TranslationDictionary`).
- **Structural Comments**: Use mirrored slash headers in type files (`///   Client Types   \\\`, `/////   Fancy Textbox   \\\\\`), `// #region <Name>` / `// #endregion` in complex classes, and `/* --- Section Name --- */` (preceded by `3 \n`) in `.scss`.

#### 18.4 Angular Template (`.html`) Formatting Invariants
- **Spaced `=` in All Attributes & Bindings**: Every HTML attribute, `[property]`, `(event)`, and `[(twoWay)]` binding MUST have a single space around `=`:
  `<FancyMinibutton class = "Back-Minibutton" [class.Home] = "SelectedIndex() === 0" (click) = "NavigateBack()">`
- **PascalCase Selectors & Modern Control Flow**: Standalone UI components use PascalCase tags (`<FancyButton>`, `<FancyTextbox>`, `<FancyDropdown>`, `<FancyCheckbox>`, `<FancyMinibutton>`, `<FancyMultibutton>`, `<FancyContainer>`, `<FancyTooltip>`, `<Aurora>`, `<DeepBackground>`) and directives (`[FancyTypewriter]`, `FancySlideUpDown`). Always use `@if`, `@else`, and `@for (Item of Items(); track $index)` (never `*ngIf`/`*ngFor`). Separate attribute groups on multi-line elements with `1 \n`.

#### 18.5 SCSS, Design Tokens & Visual Architecture
- **Shared Styles Barrel & Naming**: Begin every component stylesheet with `@use '.../shared/styles' as s;` + `3 \n`. CSS classes use `PascalCase-Hyphenated` (`Content-Section-Wrapper`), `--` for variants (`FancyButton--Primary`), and `Is-*`/`Has-*` for states (`.Is-Open`, `.Is-Drawn`). SCSS variables use `$PascalCase-Hyphenated`; CSS custom properties use `--kebab-case`.
- **Layout, `cqmin` & Masked Icons**: Separate property groups with `1 \n` and prefer `place-content`/`place-items`. Use `container-type: size` with `cqmin` radii (`--radius-standard`, `--radius-pill`), moving parent `FancyContainer` surface styles to `::before` (`inset: 0; z-index: -1`) when nesting. Render icons via `@include s.MaskedIcon($URL, currentColor)` and compute dynamic geometry in CSS `calc()` via custom properties (`--selected-index`, `--button-count`, `--mouse-x`).

#### 18.6 Frontend UX & Behavioral Invariants
- **Three-Tier Theme Cascading**: Represent themes as `'Primary'` (Lumina dark) and `'Secondary'` (Obsidian light), cascading `GlobalType` (`InterfaceService.InterfaceType`) and optional `Type` input into `EffectiveType`.
- **Browser Chrome & Extension Lockdown**: Suppress native popups, native input/autofill icons, and autofill color flashes. Maintain `BlockDarkModeExtensions` protections (`darkreader-lock`, `color-scheme: only dark/light !important`).
- **Choreographed Motion, SSR & Error Registry**: Route changes must use `NavigationService.NavigateWithAnimation()` and `AnimationGuard` (`800ms` exit via `FancySlideUpDown`). Bind dynamic UI text to `[FancyTypewriter]`. Persist SSR state via `TransferState` (`makeStateKey`). Map errors through `ErrorRegistry` (`00_000`, `01_000`–`01_007`) and `TranslationDictionary` with `[1]` field replacement (auto-lowercased mid-sentence).



