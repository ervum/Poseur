# Portfolio Platform (Monorepo)

A modern, full-stack web application and interactive portfolio platform. The system features a modular architecture combining an Angular 20 Server-Side Rendered (SSR) frontend, a high-performance NestJS backend with TypeORM persistence over PostgreSQL, and centralized domain packages for types, constants, and shared configurations.

---

## 🌟 Key Features

- **Full-Stack Monorepo Architecture**: Clean separation of concerns across frontend client, backend server, and reusable shared packages managed via `pnpm` workspaces.
- **Server-Side Rendering (SSR) & Hydration**: Angular 20 application with standalone components, SSR engine (`@angular/ssr`), and server-side route pre-rendering.
- **Bespoke Standalone UI Library**: Custom-crafted glassmorphism design system without native browser popups or unstyled form controls (`FancyButton`, `FancyDropdown`, `FancyCheckbox`, `FancyMinibutton`, `FancyMultibutton`, `FancyTextbox`, `FancyTooltip`, `FancyContainer`, `Aurora`, `DeepBackground`).
- **Robust User Authentication & Account Recovery**: Comprehensive user registration, credential verification, and flexible multi-field recovery flows (username, phone, email, password).
- **Global Error Code Architecture**: Deterministic, centralized error code mapping (`00_000`, `01_000` through `01_007`) integrated between backend validation pipes and frontend form descriptors.
- **Theme & Extension Defense**: Custom theme engine supporting seamless circular ripple transitions between modes, with built-in defense against conflicting third-party browser extensions.
- **Internationalization (i18n)**: Reactive client translation layer with multilingual dictionaries and dynamic language switcher.

---

## 🏗️ Architecture & Workspace Structure

This repository is structured as a scalable TypeScript monorepo managed with `pnpm` workspaces:

```
├── .agents/                    # Agent guidelines, architecture maps, and standards
│   ├── AGENTS.md               # Monorepo coding rules and architectural standards
│   └── ARCHITECTURE.md         # Top-to-bottom structural architectural map
├── client/                     # Frontend Angular 20 application (SSR)
│   ├── src/                    # Angular standalone components, services, and SCSS
│   ├── public/                 # Static web assets, manifest.webmanifest, and PWA icons
│   └── angular.json            # Angular application build and SSR configuration
├── server/                     # Backend NestJS application
│   ├── src/                    # Controllers, entities, DTOs, and services
│   └── test/                   # Unit and end-to-end test suites
├── packages/                   # Shared workspace packages
│   ├── constants/              # Centralized Single Source of Truth (SSOT) constants (@ervum/constants)
│   ├── types/                  # Shared domain types, interfaces, and contracts (@ervum/types)
│   └── shared/                 # Shared client/server runtime configuration & database defaults (@ervum/shared)
├── .vscode/                    # Editor tasks and workspace configuration
│   └── tasks.json              # VS Code tasks (Packages: Watch, Client: Start, Server: Start, Development: All)
├── docker-compose.dev.yml      # Local PostgreSQL container service configuration
├── docker.env                  # Local PostgreSQL container environment variables
├── database-up.mjs             # Database readiness, schema validation, and Docker Compose launcher
└── package.json                # Root workspace configuration and scripts
```

### Shared Packages

- **`@ervum/constants`** (`packages/constants`): Centralizes shared constants, priority maps, and color configuration.
- **`@ervum/types`** (`packages/types`): Exposes shared TypeScript interfaces, error code registries, DTO contracts, and UI element types across client and server.
- **`@ervum/shared`** (`packages/shared`): Exposes shared client and server runtime configuration, port resolvers, proxy paths, and database defaults.

---

## 📋 Prerequisites

Ensure the following tools are installed in your environment:

- **Node.js**: Version `20.x` or higher (LTS recommended)
- **pnpm**: Version `10.0.0` or higher
- **Git**: For version control
- **Docker Desktop** (Optional): For automatic local PostgreSQL container orchestration

Verify versions with:

```bash
node -v
pnpm -v
```

---

## 🚀 Getting Started

### 1. Install Dependencies

Install all dependencies across the monorepo:

```bash
pnpm install
```

### 2. Environment Variables & Database Setup

Local development automatically uses fallback secrets declared in `@ervum/shared` and creates a local `docker.env` for PostgreSQL. You can customize connection parameters using environment variables:

```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=Administrator
DATABASE_PASSWORD=Pass
DATABASE_NAME=Database
```

---

## 🛠️ Building the Project

### Build All Workspaces

To compile all shared packages, backend server, and frontend client in topological order:

```bash
pnpm build
```

### Build Individual Packages

Target specific components using pnpm filters:

- **Shared Packages**:
  ```bash
  pnpm --filter "@ervum/*" build
  ```

- **Backend Server**:
  ```bash
  pnpm --filter "server" build
  ```

- **Frontend Client**:
  ```bash
  pnpm --filter "client" build
  ```

---

## 🧪 Testing

Execute automated unit tests on the backend server:

```bash
pnpm --filter "server" test
```

To run tests with coverage metrics:

```bash
pnpm --filter "server" test:cov
```

---

## 💻 Local Development Workflow

Run individual components or parallel development processes:

1. **Initialize Database**:
   ```bash
   pnpm db:up
   ```

2. **Watch Shared Packages**:
   ```bash
   pnpm packages:watch
   ```

3. **Start Frontend Client**:
   ```bash
   pnpm client:start
   ```

4. **Start Backend in Development Mode**:
   ```bash
   pnpm server:start:dev
   ```

> **Note**: For concurrent local development, run `pnpm dev:all` to initiate database readiness, package watching, server reload, and client development concurrently.

### Visual Studio Code Tasks

Preconfigured tasks in `.vscode/tasks.json` provide dedicated terminal panels for each service:

- **`Packages: Watch`**: Continuously builds shared packages (`@ervum/*`) on source changes.
- **`Client: Start`**: Runs the Angular frontend development server on port 4200.
- **`Server: Start`**: Prepares database readiness and runs the NestJS backend with hot reload.
- **`Development: All`**: Concurrently orchestrates `Packages: Watch`, `Client: Start`, and `Server: Start` in dedicated terminals.

---

## 🤖 Agent Architecture & Coding Standards

All autonomous agents and contributors must adhere strictly to the workspace coding standards and architectural invariants documented in `.agents/`:

- **Coding Standards**: [.agents/AGENTS.md](file:///c:/Users/Ervum/OneDrive/Documents/Projects/Portfolio/.agents/AGENTS.md)
- **Architectural Topography**: [.agents/ARCHITECTURE.md](file:///c:/Users/Ervum/OneDrive/Documents/Projects/Portfolio/.agents/ARCHITECTURE.md)