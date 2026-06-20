# SassyDoc Generator — Global Coding Instructions

This document enforces the global technical parameters, design constraints, and code style rules for the SassyDoc Generator development sprint. All AI-generated and human-authored code must comply with these metrics.

---

## 1. Core Technology Frameworks & Versions

- **Backend Runtime:** Python (version >= 3.11) managed via the `uv` package manager engine.
- **Backend API Layer:** FastAPI framework using asynchronous endpoint routing configurations.
- **Validation Engine:** Pydantic v2 schemas for inbound and outbound strict data type validation.
- **Database Mapping:** SQLAlchemy 2.0 ORM handling declarative state transformations over local SQLite storage files.
- **Frontend App Frame:** React 18+ running on the Vite compiler system.
- **Styling Architecture:** Tailwind CSS utility classes utilizing custom configuration layout bounds.

---

## 2. Code Style & Conciseness Constraints

- **Eliminate Boilerplate:** Code must remain tight, modular, and minimal. Avoid heavy nested conditions or repetitive layout functions.
- **Asynchronous Execution:** All FastAPI endpoints dealing with request routing or database lookups must explicitly use `async def` handling patterns.
- **Type Guarding:** Declare explicit input and output typing signatures across both Python endpoints and React hooks. Omit loose typing catch-alls like `any`.
- **Dependency Isolation:** Database operations must pass through FastAPI injection protocols via the defined `get_db` session loop hook.

---

## 3. UI Design System & Micro-Interactions

To secure a highly superlative, responsive, and tactile dashboard workspace, apply these constraints strictly across the components:

- **Mobile-First Structural Scaling:** Components must layout vertically as blocks for single mobile dimensions (under 768px viewports). Scale components to an aligned multi-column workspace grid on desktop screens.
- **High-Contrast Dark Theme Canvas Palette:**
  - Base Platform Canvas: Deep slate gray `#1e293b` backgrounds.
  - Interactive Panel Modules: Stark white backgrounds for high text legibility.
  - Focus Elements & CTA Selections: Vivid electric neon violet `#7c3aed` accents.
- **Micro-Animations & Feedback:** All buttons, dashboard menu options, and modal sliders must implement a responsive scale shrink transition on mouse clicks to deliver a tactile feel:
  ```css
  /* Tailwind CSS helper sequence equivalent */
  @apply transform active:scale-95 transition-all duration-150 ease-out;