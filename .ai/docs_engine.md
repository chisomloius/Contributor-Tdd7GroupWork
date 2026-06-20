# SassyDoc Generator — Deterministic Engine Specifications

Since this application runs without live LLM network tokens, this document serves as the structural specification sheet for the local processing engine located at `backend/app/services/doc_engine.py`. GitHub Copilot must parse these matrices to build the backend keyword-matching module.

---

## 1. Matching Logic Rules
The engine must export a core function `generate_mock_documentation(user_input: str) -> dict`. This function applies lower-case normalization to the inbound prompt string and executes regex evaluation scans (`re.search()`) matching against the matrices below.

---

## 2. Template Matrix Mappings

### Matrix 1: Keyword Target `auth` (Matches: auth, login, secure, user)
- **Title:** Authentication & Authorization Engine
- **Technical Blueprint:**

### Technical Blueprint: JWT & Stateless Session Management
- **Token Exchange:** Stateless OAuth2 Bearer strings utilizing `PyJWT` signed with HS256 hashing keys.
- **Storage Rules:** Micro-session objects mapped on stateless memory; tokens must sit inside secure, HttpOnly, SameSite=Strict cookies to eliminate XSS surface areas.
- **Context Guards:** FastAPI dependency-injection gates (`Depends(get_current_user)`) validate token signatures before passing controls.

User Guide:
### User Guide: Accessing Your Dashboard Safely
- **Signing In:** Navigate to the login screen, enter your assigned credentials, and press **Secure Login**. 
- **Session Duration:** For your data protection, your digital session auto-expires after 30 minutes of inactivity.
- **Troubleshooting:** If you see an 'Access Denied' flag, clear your browser cookies and try again.
Matrix 2: Keyword Target database (Matches: db, database, sql, store, tables)
Title: Relational Data Modeling & Access Layers

Technical Blueprint:
### Technical Blueprint: SQLite / PostgreSQL Schema Configuration
- **Engine Bindings:** SQLAlchemy ORM Declarative base structures handling automatic thread session pools via context managers.
- **Optimization:** Explicit foreign-key indexing on high-frequency reference columns; cascading deletions enforced at database cluster limits.
- **Migrations:** Managed natively through Alembic versioning files tracking declarative schema changes.

User Guide:
### User Guide: Managing System Data
- **Data Safety:** The system automatically saves and backups your configurations in real time as you edit.
- **Searching Records:** Use the central search field on the admin page to instantly scan through document categories.
- **Data Limits:** Your personal dashboard can track up to 10,000 document generations simultaneously.

Matrix 3: Keyword Target api (Matches: api, router, endpoint, json, restful)
Title: RESTful API Integration Layer

Technical Blueprint:
### Technical Blueprint: FastAPI Router & Pydantic v2 Gateway
- **Payload Verification:** Pydantic schema engines validate inbound JSON bodies, throwing explicit 422 errors on typing mismatches.
- **Rate Limiting:** IP-throttling middleware restricts endpoints to 60 requests per minute to preserve engine throughput.
- **Documentation:** Structured schemas dynamically update OpenAPI definitions at the server `/docs` route.

User Guide:
### User Guide: Connecting Third-Party Developer Tools
- **Developer Access:** Software keys can be requested directly inside your account profile tab.
- **Interface Protocol:** The tool processes data using clean JSON payloads, making integration with external systems effortless.
- **Error Signals:** If a request fails, the application panel will flash a distinct red notice outlining the exact fix required.

Matrix 4: Keyword Target docker (Matches: docker, container, compose, wsl)
Title: Containerization & Isolated Deployments

Technical Blueprint:
### Technical Blueprint: Multi-Stage Container Blueprints
- **Build Architecture:** Base images utilize python-slim configurations; compilation steps utilize fast cached layer storage paths.
- **Runtime Security:** Operational layers explicitly discard compilation dependencies and run tasks under non-root system users.
- **Volume Overlays:** Development orchestrations deploy explicit host folder attachments to facilitate immediate code compilation hot-reloads.

User Guide:
### User Guide: Running the App Anywhere
- **One-Click Run:** Ensure your local Docker Desktop window is active, then click your startup launcher script.
- **Isolated Workspaces:** The container ensures your system setup never interferes with other software running on your computer.
- **Updates:** Pulling the latest changes from your team repository updates the configuration instantly.

Matrix 5: Fallback Track default (Matches: Everything Else)
Title: General System Documentation Workspace

Technical Blueprint:
### Technical Blueprint: Generic Application Architecture Matrix
- **Pipeline Loop:** Context streams are parsed using standard string regex utilities to determine functional categories.
- **State Management:** Document states commit automatically to active session records with matching timestamps.
- **Formatting Protocols:** Output structures convert raw markdown arrays to universal client strings.

User Guide:
### User Guide: Working in Your Documentation Workspace
- **Creating Content:** Drop a basic outline of your feature into the generator input box and tap **Generate Documentation**.
- **Exporting Files:** Click the built-in action icons to download your finalized text as raw HTML or pristine PDF layouts.
- **Quick Distribution:** Use the direct channel triggers to transmit documentation text to WhatsApp grids or Microsoft Teams threads instantly.