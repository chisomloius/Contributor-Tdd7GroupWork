```markdown
# SassyDoc Generator — 5-Hour MVP

SassyDoc Generator helps teams automatically compile high-quality technical blueprints for engineers and client-ready onboarding manuals for non-technical stakeholders.

---

## 🛠️ Project Initialization

If you just cloned the repository, scaffold the workspace before running the app.

### 1. Initialize the Backend

From the repository root:

```bash
mkdir -p backend
cd backend
uv init --app --name app
cd ..
```

This creates the backend `pyproject.toml` and initial app structure.

### 2. Initialize the Frontend

From the repository root:

```bash
npm create vite@latest frontend -- --template react
cd frontend
npm install
cd ..
```

This sets up a React + Vite frontend ready for customization.

---

## 🚀 Run Locally (No Docker)

### 1. Start the Backend

Open a terminal, navigate to `/backend`, and run:

```bash
uv sync
uv run uvicorn app.main:app --reload --port 8000
```

- API docs: `http://localhost:8000/docs`
- Telemetry endpoint: `http://localhost:8000/api/docs/telemetry`

### 2. Start the Frontend

Open a second terminal, navigate to `/frontend`, and run:

```bash
npm install
npm run dev
```

- Frontend UI: `http://localhost:5173`

---

## 🐳 Run with Docker Compose

For a containerized setup, use Docker Desktop.

From the repository root:

```bash
docker compose up --build
```

Then access:

- Frontend: `http://localhost:5173`
- Backend docs: `http://localhost:8000/docs`

To stop the stack:

```bash
docker compose down
```

---

## 📂 Repository Overview

- `.ai-blueprint.md / .ai/` — architecture notes, compliance rules, and AI macros
- `backend/app/services/doc_engine.py` — local deterministic keyword matcher for documentation templates
- `backend/app/core/database.py` — creates `local_mvp.db` with generation metrics

---

## 🧪 Testing

Run these checks before pushing changes:

- Backend tests: `uv run pytest` (inside `/backend`)
- Frontend tests: `npx playwright test` (inside `/frontend`)
