# SassyDoc Generator — 5-Hour MVP Milestone Gates

This document establishes the strict Definition of Done (DoD) checklist for the SassyDoc Generator sprint. Use these validation gates iteratively to test functionality during development.

---

## 🏁 Phase 1: Environment & Path Validation (Hour 1)
- [ ] Local workspace folder tree completely matches the repository architecture topology map.
- [ ] Root `.gitignore` correctly prevents local SQLite data engines (`local_mvp.db`) and `.venv` cache environments from being tracked.
- [ ] The `.vscode/settings.json` profile successfully maps the Python interpreter and extra paths, clearing all red module import lines.

## ⚙️ Phase 2: Backend API Gateway Compliance (Hour 2)
- [ ] Executing `uv run uvicorn` successfully boots the API framework on `http://localhost:8000`.
- [ ] Navigating to `/docs` renders the FastAPI interactive Swagger UI with clear schemas for the `/api/docs/generate` endpoint.
- [ ] Inbound JSON payloads lacking a `prompt` string throw an explicit `400 Bad Request` or `422 Unprocessable Entity` validation flag.
- [ ] The database engine successfully creates the `documents` table inside `local_mvp.db` automatically upon server initialization.

## 🎨 Phase 3: Superlative Mobile-First UI Compliance (Hour 3-4)
- [ ] Executing `npm run dev` successfully hosts the Vite asset framework client on `http://localhost:5173`.
- [ ] The interface structure fits perfectly inside mobile viewport limits down to a sharp 390px horizontal threshold without breaking layout modules.
- [ ] Clicking interactive panels or buttons triggers a fluid responsive micro-scale animation layout contraction (`active:scale-95`).
- [ ] The documentation workspace implements a split-screen or separate tabs rendering technical blueprints on one panel and user manuals on another.

## 🔄 Phase 4: Full-Stack Integration & Quality Gates (Hour 5)
- [ ] Submitting a prompt via the React front-face smoothly routes requests to the backend loop and avoids CORS port rejection blocks.
- [ ] The Admin dashboard correctly pulls from the telemetry endpoint, displaying updated data totals for all document generations.
- [ ] Clicking the export action selectors instantly downloads the active content workspace text as a clean static HTML string or a functional file.
- [ ] Running `uv run pytest` returns 100% green compliance metrics across your mock system test scripts.