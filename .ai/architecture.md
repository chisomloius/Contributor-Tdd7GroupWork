# SassyDoc Generator — System Architecture

This document defines the structural blueprint, data relationships, design tokens, and local communication networks for the SassyDoc Generator MVP.

---

## 1. High-Level Component Topology

- **Frontend Client (Vite + React):** A single-page application (SPA) acting as a responsive dashboard. It handles UI interaction states, dynamic rendering of generated content tabs, client-side PDF/HTML exports, and localized template caching.
- **Backend Core API (FastAPI):** An asynchronous framework processing API payloads, executing local regex logic routing, managing SQLite state commits, and compiling telemetry indicators.
- **Data Engine Layer (Local Mock Services):** A zero-dependency matching matrix (`app/services/doc_engine.py`) that handles text processing entirely inside memory loops to remove internet dependency during the development sprint.
- **Database Engine (SQLite):** An embedded file-based relational system storage engine (`local_mvp.db`) managed via an SQLAlchemy Object-Relational Mapper (ORM) tracking platform usage telemetry.

---

## 2. Information Pipeline & Data Flow

1. **Request Action:** A user fills the generation workspace prompt block, picks a functional classification category, and clicks the submit interaction panel.
2. **Gateway Transport:** The frontend intercepts the submit event and sends an asynchronous HTTP POST request to `http://localhost:8000/api/docs/generate`.
3. **Regex Interception Loop:** - FastAPI captures the payload and passes the raw text into the `doc_engine` module.
   - The engine evaluates string patterns via regex to identify focal categories (e.g., `auth`, `database`, `api`, `docker`).
4. **State Persistence & Storage:** - The backend passes the compiled text content into an SQLAlchemy session.
   - The record commits to the `documents` SQLite database table.
5. **Payload Processing UI Response:** The backend spits back a clean JSON output containing the structured technical data schemas alongside the non-technical manuals. React maps these components into independent scannable panels instantly.

---

## 3. Database Schema Models (SQLAlchemy Relational Structures)

The database framework uses an auto-initializing local SQLite engine to preserve operational logs without external servers.

### Table Name: `documents`
| Column Name | Data Type | Key Attribute | Description |
| :--- | :--- | :--- | :--- |
| `id` | Integer | Primary Key (Auto-Increment) | Distinct identity value for tracking records. |
| `title` | String (255) | None | The matched framework header title string. |
| `category` | String (100) | None | User-assigned application bucket category classification. |
| `technical_output` | Text | None | Rich markdown payload explicitly detailing developer specs. |
| `user_output` | Text | None | Clear markdown payload structuring user onboarding views. |
| `timestamp` | DateTime | None | Time logging marker indicating item creation sequence. |

---

## 4. UI Layout Framework & Design Tokens

To achieve a crisp, superlative user interaction footprint, all component templates must strictly apply these constraints:

- **Mobile-First Scaling Framework:** Vertical block stacks for single viewports (under 768px width layout thresholds) scaling smoothly to independent side-by-side workspace split windows on desktop interfaces.
- **Visual Color Matrix Palette:**
  - Background Matrix Grid: Dark slate gray canvas foundations.
  - Content Panel Boxes: Pure white modules offering massive stark visual legibility.
  - Call-To-Action Borders & Elements: Deep electric neon violet accent lines.
- **Micro-Animations:** Buttons and modal interactive selectors must use immediate responsive scale transitions on mouse clicks (`transform active:scale-95 transition-all duration-150 ease-out`).

---

## 5. Development Workspace Isolation Paths

- **Workspace Path Mapping (`.vscode/settings.json`):** Ensures paths look directly inside the `/backend` virtual environment target folder. It adds the local workspace roots into Python search lists to eliminate cross-subfolder import line issues.
- **Hot-Reload Volumes:** Both native runners use local system change listeners, enabling code adjustments to re-compile layout frames inside the active live viewport loops instantly.

---

## 6. Project Structure
SassyDocs/
├── .ai/                            # AI System Prompt Window & Constraints
│   ├── instructions.md             # Core design tokens, uv dependencies & stack bounds
│   ├── checks.md                   # 5-hour Definition of Done sprint milestones
│   └── architecture.md             # Database relationship flows, routing & VS Code maps
│
├── .github/                        # GitHub Open-Source & Platform Sync
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md           # Standardized bug tracking issue form
│   │   └── feature_request.md      # Standardized user feature form
│   ├── prompts/
│   │   └── generate-mvp.prompt.md  # The Executable Copilot macro file (/generate-mvp)
│   ├── PULL_REQUEST_TEMPLATE.md    # Code compliance gate before team merges
│   └── workflows/
│       └── validations.yml         # Auto-triggers code validation workflows
│
├── .vscode/                        # Local Team IDE Settings Sync
│   └── settings.json               # Fixes Python pathings, formatting on save & lint markers
│
├── backend/                        # Modular FastAPI Application Layer
│   ├── app/
│   │   ├── core/
│   │   │   ├── config.py           # Local environment configurations
│   │   │   └── database.py         # SQLite engine creation and session generation
│   │   ├── models/                 # Database tables (SQLAlchemy)
│   │   ├── schemas/                # Inbound/Outbound constraints (Pydantic v2)
│   │   ├── services/
│   │   │   └── doc_engine.py       # High-fidelity mock documentation engine
│   │   ├── routers/
│   │   │   ├── docs.py             # Telemetry logging and generation routes
│   │   │   └── health.py           # Database integration verification checks
│   │   └── main.py                 # Core initialization with open local host CORS loops
│   ├── tests/
│   │   └── test_main.py            # Automated backend endpoints tests (Pytest via uv)
│   └── pyproject.toml              # Modern Python package manager declarative block
│
├── frontend/                       # React Frontend UI Layer
│   ├── src/
│   │   ├── components/             # High-fidelity interactive panels and modals
│   │   └── App.jsx                 # Mobile-first core UI dashboard view
│   ├── tests/
│   │   └── api.spec.js             # End-to-end user browser testing flows (Playwright)
│   ├── package.json                # Frontend module manifest script
│   └── vite.config.js              # Polling parameters allowing Docker mount hot-reloads
│
├── .gitignore                      # Exclusion matrix for developer sandboxes
└── README.md                       # Comprehensive 3-step teammate local startup runbook