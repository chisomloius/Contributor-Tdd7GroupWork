# SassyDoc Generator — Comprehensive MVP Feature & Specification Matrix

This document defines the definitive, non-negotiable functional layout, backend architecture, API contracts, and deployment checklist for the SassyDoc Generator MVP. Every page layout view, API endpoint, database schema, monitoring tracking variable, log entry metric, and validation rule outlined below must be completely generated without omission.

---

## EXECUTIVE SUMMARY

**What It Does:**
- Users log in with a username (stateless session)
- Users input a feature description and pick a category (auth, database, api, docker, general)
- Backend regex-matches the category and generates dual markdown outputs: technical blueprint + user manual
- Generated docs appear instantly in a dual-tab preview
- Users can export as HTML, copy to clipboard, or share (WhatsApp/Teams redirects)
- All generation actions log to a telemetry stream for audit trails

**Tech Stack:**
- **Frontend:** Vite + React (plain CSS, no external UI framework)
- **Backend:** FastAPI + SQLAlchemy ORM
- **Database:** SQLite (`local_mvp.db`)
- **Processing:** Local regex-only (no external LLMs or APIs)

---

## SECTION 1: SPA VIEWPORTS & LAYOUT STATES (FRONTEND)

The user interface must be structured as a high-fidelity React Single Page Application (SPA) that seamlessly switches layout frames using client-side memory states managed via React Context.

### 1.1 Stateless Authentication Frame (Login Page)

**Route:** `/` (default) or `/login`

**UI Presentation:**
- A crisp, minimalist center-card panel overlaying the deep slate canvas background.
- Card width: 400px on desktop, 90vw on mobile (responsive).
- Background: Dark slate gray (`#1a1f3a`).
- Card background: Pure white (`#ffffff`).

**Form Mechanics:**
- Text input field labeled `"Username"` (placeholder: "Enter your username")
- Optional text input field labeled `"Access Workspace Key"` (placeholder: "Optional key")
- Primary action button labeled **"Secure Entrance"** (background: neon violet `#7c3aed`, hover: scale-110, active: scale-95 with 150ms ease-out transition)
- Form validation: Username must be 1-50 characters, no validation on access key

**State Logic:**
- On form submit, call POST `/api/users/login` with payload: `{ username: string, access_key?: string }`
- On success (200), store response `session_token` in React Context
- Update global user context with `{ user_id, username, session_token }`
- Redirect to `/dashboard` route
- On failure (400/500), display error message in red text below the form

**Error Handling:**
- Empty username: Show inline validation error "Username required"
- Network error: Show "Connection failed. Please try again."
- Server error (500): Show "Server error. Please refresh and retry."

---

### 1.2 The Multi-Panel Master Dashboard

**Route:** `/dashboard` (protected, requires `session_token` in Context)

**Overall Layout:**
- **Desktop (>768px):** Two-column split layout (60% left workspace, 40% right preview)
- **Mobile (<768px):** Vertical stack (workspace, then preview below)
- **Header Section:** Spans full width
- **Bottom Section:** Spans full width

---

#### 1.2.1 Administrative Monitoring & Telemetry Header

**Location:** Top of dashboard, full width

**Purpose:** Display real-time analytical metrics fetched on dashboard load via GET `/api/dashboard/metrics`

**Components (Left-to-Right Grid):**

1. **Total Generations Indicator**
   - Label: "Total Generations"
   - Value: Number (e.g., "24")
   - Fetched from: `metrics.total_generations`
   - Styling: Large bold number, smaller gray label below

2. **Classification Ratio Card**
   - Label: "Dev Blueprints vs User Guides"
   - Display: "Dev: 15 | User: 9"
   - Fetched from: `metrics.dev_vs_user_split` (object with `dev_count`, `user_count`)
   - Styling: Side-by-side counters with divider

3. **Active Categories Meter**
   - Label: "Categories Used"
   - Value: Number (e.g., "4")
   - Derived from: `metrics.unique_categories` array length
   - Styling: Number with list of category pills below (e.g., auth, api, database)

**Styling:**
- Background: Light gray (`#f5f5f5`)
- Card padding: 20px
- Grid gap: 20px
- Responsive: Stack vertically on mobile

**Data Refresh:**
- Fetch on dashboard mount (React useEffect)
- Cache in Context (no refresh on every render)
- Show loading spinner while metrics load

---

#### 1.2.2 Active Generator Workspace Panel (Left Side / Desktop Split)

**Location:** Left 60% on desktop, top on mobile

**Components (Vertical Stack):**

1. **Input Area**
   - Label: "Describe Your Feature"
   - Textarea element: 8 rows, max-width 100%
   - Placeholder: "Paste your feature notes, architecture overview, or API description..."
   - Max length: 1000 characters
   - Character counter below: "250 / 1000"
   - Styling: Border `#e0e0e0`, focus: border `#7c3aed`

2. **Category Picker**
   - Label: "Select Category"
   - Dropdown (select element) with options:
     ```
     - authentication (keyword: "auth")
     - database_layers (keyword: "database")
     - api_endpoints (keyword: "api")
     - containerization (keyword: "docker")
     - general_system (keyword: "default")
     ```
   - Default selection: "general_system"
   - Styling: Dark background, light text, neon violet focus border

3. **Trigger Actions**
   - Primary button: **"Generate SassyDoc"**
     - Background: Neon violet (`#7c3aed`)
     - Hover: Brightness 110%
     - Active: `scale-95` with 150ms transition
     - On click:
       1. Validate prompt length (min 5 chars) — show error if empty
       2. Disable button, show spinner
       3. Call POST `/api/docs/generate`
       4. On success: populate preview pane, enable button
       5. On error: show error message, enable button
   - Secondary button: **"Clear"** (resets form)
     - Background: Gray (`#cccccc`)
     - Clears textarea and resets category to default

**State Tracking:**
- Store in Context: `dashboard.isLoading`, `dashboard.generatedDoc`

---

#### 1.2.3 Live Interactive Preview Canvas (Right Side / Desktop Split)

**Location:** Right 40% on desktop, bottom on mobile

**Purpose:** Display generated dual markdown outputs in tabbed interface

**Components:**

1. **Tab Toggle Bar**
   - Two tabs: "Technical Blueprint" | "Non-Technical User Manual"
   - Active tab: Neon violet underline, bold text
   - Inactive tab: Gray text, light border
   - On click: Update Context `dashboard.activeTab` and re-render

2. **Technical Blueprint Pane (Tab 1)**
   - Rendered from: `generatedDoc.technical_output` (markdown string)
   - Styling:
     - Background: White
     - Font: Monospace (courier new) for code blocks
     - Padding: 15px
     - Max-height: 400px, overflow-y scroll
     - Render markdown as pre-formatted text (preserve line breaks, code blocks)

3. **Non-Technical User Manual Pane (Tab 2)**
   - Rendered from: `generatedDoc.user_output` (markdown string)
   - Styling:
     - Background: White
     - Font: System sans-serif for readability
     - Padding: 15px
     - Max-height: 400px, overflow-y scroll

4. **Export & Action Panel Grid**
   - Location: Below tabs, 3-column grid on desktop, stacked on mobile
   - Buttons:

   **a) Convert to HTML Button**
   - Label: "📥 Download HTML"
   - On click:
     1. Get active tab content (technical or user output)
     2. Wrap in basic HTML template:
        ```html
        <!DOCTYPE html>
        <html>
        <head>
          <title>SassyDoc Export</title>
          <style>
            body { font-family: sans-serif; margin: 20px; line-height: 1.6; }
            pre { background: #f5f5f5; padding: 10px; overflow-x: auto; }
          </style>
        </head>
        <body>
          <h1>Generated Documentation</h1>
          <div><!-- MARKDOWN CONTENT HERE --></div>
        </body>
        </html>
        ```
     3. Create Blob, trigger browser download: `filename: "sassydoc_export_${timestamp}.html"`

   **b) Copy to Clipboard Button**
   - Label: "📋 Copy to Clipboard"
   - On click:
     1. Get active tab content
     2. Use `navigator.clipboard.writeText()`
     3. Show success toast: "Copied to clipboard!" (disappear after 2s)

   **c) WhatsApp Redirect Button**
   - Label: "💬 Share to WhatsApp"
   - On click:
     1. Get first 100 chars of active tab content as summary
     2. Build WhatsApp URL: `https://wa.me/?text=${encodeURIComponent(summary)}`
     3. Open in new window

   **d) Teams Distribution Button**
   - Label: "👥 Copy for Teams"
   - On click:
     1. Same as "Copy to Clipboard"
     2. Show message: "Ready to paste in Microsoft Teams"

**Styling:**
- All buttons: Padding 10px 15px, border-radius 4px, cursor pointer
- Primary action color: Neon violet (`#7c3aed`)
- Secondary action color: Gray (`#cccccc`)

---

#### 1.2.4 System Telemetry & Logging Stream Ledger (Bottom Section)

**Location:** Bottom of dashboard, full width, appears below workspace/preview split

**Purpose:** Display audit trail of all user actions in current session

**UI Component:** Terminal-style scrollable list container

**Specifications:**
- Height: 150px (fixed)
- Overflow: scroll
- Background: Dark gray (`#2a2a2a`)
- Text: Light gray (`#cccccc`)
- Font: Monospace (courier new), 12px

**Data Source:** Fetch via GET `/api/logs/recent?user_id={user_id}&limit=5`

**Log Entry Format (per line):**
```
[HH:MM:SS] | [USERNAME] | [ACTION] | [CATEGORY] | [STATUS]
```

**Example Output:**
```
[14:23:45] | john_doe | GENERATION | auth | SUCCESS
[14:22:10] | john_doe | HTML_EXPORT | api | SUCCESS
[14:21:55] | john_doe | GENERATION | database | SUCCESS
[14:20:30] | john_doe | TEAMS_SHARE | default | SUCCESS
[14:19:15] | john_doe | GENERATION | docker | SUCCESS
```

**Action Types** (logged to system_logs table):
- `GENERATION`: Successful doc generation
- `HTML_EXPORT`: User exported to HTML
- `CLIPBOARD_COPY`: User copied to clipboard
- `WHATSAPP_SHARE`: User clicked WhatsApp
- `TEAMS_SHARE`: User clicked Teams
- `LOGIN`: User logged in
- `LOGOUT`: User logged out

**Status Types:**
- `SUCCESS`: Action completed
- `FAILED`: Action failed (error logged)
- `ROUTE_MOCK_FALLBACK`: Regex didn't match specific category, used default

**Data Refresh:**
- Fetch on component mount
- Re-fetch after every successful generation (POST /api/docs/generate)
- Manual refresh button: "🔄 Refresh Logs"

**Styling:**
- Each log line: Padding 8px
- Alternating rows: Light alternation (every other line slightly different shade)
- Timestamp: Bright cyan (`#00ffff`)
- Action: Bold white
- Status SUCCESS: Green text (`#00ff00`)
- Status FAILED: Red text (`#ff0000`)

---

#### 1.2.5 Logout Button

**Location:** Top-right corner of dashboard

**Label:** "Logout"

**On Click:**
1. Clear React Context (user, dashboard, logs)
2. Remove `session_token` from localStorage (if stored there)
3. Redirect to `/login`

---

## SECTION 2: HARDWARE SERVICE LAYER & API ENGINE (BACKEND)

### 2.1 Relational Database Topography (SQLite - `local_mvp.db`)

SQLAlchemy must declare three tables with the following schemas:

#### Table A: `users` (User Tracking & Auditing)

```python
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
```

**Purpose:** Track all users who have logged in. Minimal data for MVP (no passwords, no encryption).

**Indexes:** `username` (for fast lookup on login)

---

#### Table B: `documents` (Generation Tracking)

```python
class Document(Base):
    __tablename__ = "documents"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    title = Column(String(255), nullable=True)
    category = Column(String(100), nullable=False)
    prompt_input = Column(Text, nullable=False)
    technical_output = Column(Text, nullable=False)
    user_output = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
```

**Purpose:** Store all generated documentation records with links to user.

**Relationships:** `user_id` → Foreign Key to `users.id`

**Indexes:** `(user_id, created_at)` for fast queries per user

---

#### Table C: `system_logs` (Telemetry Tracking & Audit Trails)

```python
class SystemLog(Base):
    __tablename__ = "system_logs"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(50), nullable=False)
    action_type = Column(String(50), nullable=False)
    target_category = Column(String(100), nullable=True)
    execution_status = Column(String(20), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
```

**Purpose:** Audit trail of all user actions (logins, generations, exports, etc.).

**Indexes:** `(username, timestamp)` for fast log retrieval

---

### 2.2 Processing Pipeline Logic (`app/services/doc_engine.py`)

**Core Function Signature:**
```python
def generate_mock_documentation(user_input: str, category: str) -> dict:
    """
    Takes user prompt and category, returns dual markdown outputs.
    
    Args:
        user_input: Raw text from user (1000 char max)
        category: Selected category ("auth", "database", "api", "docker", "general")
    
    Returns:
        {
            "title": str,
            "technical_output": str,
            "user_output": str,
            "matched_category": str
        }
    """
```

**Processing Steps:**

1. **Normalize Input:**
   - Convert `user_input` to lowercase
   - Convert `category` to lowercase

2. **Category Validation:**
   - If category is one of: `["auth", "database", "api", "docker"]` → use that
   - Otherwise → default to `"general"`

3. **Keyword Regex Matching (Fallback if needed):**
   - If category is generic, apply regex scan:
     ```python
     if re.search(r'\b(auth|login|secure|user)\b', user_input.lower()):
         category = "auth"
     elif re.search(r'\b(db|database|sql|store|table)\b', user_input.lower()):
         category = "database"
     elif re.search(r'\b(api|router|endpoint|json|restful)\b', user_input.lower()):
         category = "api"
     elif re.search(r'\b(docker|container|compose|wsl)\b', user_input.lower()):
         category = "docker"
     else:
         category = "general"
     ```

4. **Lookup Template Matrix:**
   - Match category to template block from `docs_engine.md` Sections 2.1-2.5
   - Extract `technical_blueprint` and `user_guide` strings

5. **Generate Title:**
   - Extract first 50 chars of `user_input`, trim to sentence boundary
   - Or use default: `"{category} Documentation - {timestamp}"`

6. **Return Compiled Dict:**
   ```python
   {
       "title": "Authentication & Authorization Engine",
       "technical_output": "### Technical Blueprint: JWT & Stateless...",
       "user_output": "### User Guide: Accessing Your Dashboard Safely...",
       "matched_category": "auth"
   }
   ```

**Error Handling:**
- If `user_input` is empty or < 5 chars → Raise `ValueError("Prompt too short")`
- If template lookup fails → Return default template
- All errors caught by FastAPI exception handler (see Section 2.4)

---

### 2.3 FastAPI Route Definitions (`app/routers/docs.py` and `app/routers/health.py`)

#### Route 1: POST `/api/users/login`

**Purpose:** Authenticate user (stateless, no password validation)

**Request Body (Pydantic Schema):**
```python
class LoginPayload(BaseModel):
    username: str = Field(..., min_length=1, max_length=50)
    access_key: Optional[str] = Field(None, max_length=100)
```

**Response (200 OK):**
```python
class LoginResponse(BaseModel):
    user_id: int
    username: str
    session_token: str  # JWT or simple UUID
    message: str = "Login successful"
```

**Logic:**
1. Query `users` table for username
2. If not found → Create new user record, commit to DB
3. Generate `session_token` (use `uuid.uuid4().hex` for MVP, or simple JWT)
4. Store token in React Context (frontend responsibility)
5. Return user_id, username, session_token

**Error Handling:**
- Invalid username format (not matching min/max) → 422 Unprocessable Entity
- Database error → 500 Internal Server Error

---

#### Route 2: POST `/api/docs/generate`

**Purpose:** Generate documentation for a given prompt and category

**Request Body (Pydantic Schema):**
```python
class GenerateDocPayload(BaseModel):
    prompt: str = Field(..., min_length=5, max_length=1000)
    category: str = Field(...)  # "auth", "database", "api", "docker", "general"
    user_id: int = Field(...)
```

**Response (200 OK):**
```python
class GenerateDocResponse(BaseModel):
    doc_id: int
    title: str
    category: str
    technical_output: str
    user_output: str
    created_at: str  # ISO format timestamp
```

**Logic:**
1. Validate `GenerateDocPayload` (Pydantic auto-validation)
2. Verify `user_id` exists in `users` table
3. Call `doc_engine.generate_mock_documentation(prompt, category)`
4. Create `Document` record:
   ```python
   doc = Document(
       user_id=user_id,
       title=generated_doc["title"],
       category=generated_doc["matched_category"],
       prompt_input=prompt,
       technical_output=generated_doc["technical_output"],
       user_output=generated_doc["user_output"]
   )
   db.add(doc)
   db.commit()
   ```
5. Create `SystemLog` record:
   ```python
   log = SystemLog(
       username=user.username,  # fetch user
       action_type="GENERATION",
       target_category=generated_doc["matched_category"],
       execution_status="SUCCESS"
   )
   db.add(log)
   db.commit()
   ```
6. Return `GenerateDocResponse` with doc_id and outputs

**Error Handling:**
- Invalid payload → 422
- User not found → 404 Not Found
- Prompt too short → 400 Bad Request with message "Prompt must be at least 5 characters"
- Database error → 500 with message "Generation failed"

---

#### Route 3: GET `/api/dashboard/metrics`

**Purpose:** Fetch aggregated metrics for dashboard header

**Query Parameters:**
```python
user_id: int  # Required
```

**Response (200 OK):**
```python
class MetricsResponse(BaseModel):
    total_generations: int
    dev_vs_user_split: dict  # {"dev_count": int, "user_count": int}
    unique_categories: list  # ["auth", "api", ...]
```

**Logic:**
1. Verify `user_id` exists
2. Query `documents` table WHERE `user_id = user_id`:
   - Count total rows → `total_generations`
   - Count WHERE `category IN ["auth", "api", "docker"]` → `dev_count` (technical)
   - Count WHERE `category IN ["general"]` → `user_count` (non-technical)
   - Distinct categories → `unique_categories` array
3. Return `MetricsResponse`

**Pseudo SQL:**
```sql
SELECT 
  COUNT(*) as total_generations,
  SUM(CASE WHEN category IN ('auth', 'api', 'docker') THEN 1 ELSE 0 END) as dev_count,
  SUM(CASE WHEN category IN ('general') THEN 1 ELSE 0 END) as user_count,
  GROUP_CONCAT(DISTINCT category) as unique_categories
FROM documents
WHERE user_id = ?
```

---

#### Route 4: GET `/api/logs/recent`

**Purpose:** Fetch recent system logs for telemetry stream

**Query Parameters:**
```python
user_id: int  # Required
limit: int = 5  # Default 5, max 20
```

**Response (200 OK):**
```python
class LogEntry(BaseModel):
    timestamp: str  # ISO format
    username: str
    action_type: str
    target_category: Optional[str]
    execution_status: str

class LogsResponse(BaseModel):
    logs: list[LogEntry]
```

**Logic:**
1. Query `system_logs` table WHERE `username = user.username`:
   - Order by `timestamp` DESC
   - Limit to `limit` parameter (max 20)
2. Return `LogsResponse` with logs array

**Pseudo SQL:**
```sql
SELECT timestamp, username, action_type, target_category, execution_status
FROM system_logs
WHERE username = ?
ORDER BY timestamp DESC
LIMIT ?
```

---

#### Route 5: GET `/api/health`

**Purpose:** Verify backend and database connectivity

**Response (200 OK):**
```python
class HealthResponse(BaseModel):
    status: str  # "healthy" or "unhealthy"
    database: str  # "connected" or "error"
    timestamp: str
```

**Logic:**
1. Try to query `SELECT 1` from any table (e.g., `users`)
2. If successful → `database: "connected"`, `status: "healthy"`
3. If error → `database: "error"`, `status: "unhealthy"`
4. Return response

**Used for:** Frontend to check backend availability on app load

---

### 2.4 FastAPI Exception Handler & Error Responses

**Global Exception Handler (add to `main.py`):**

```python
from fastapi import HTTPException, status
from fastapi.responses import JSONResponse

@app.exception_handler(ValueError)
async def value_error_handler(request, exc):
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"detail": str(exc)}
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error"}
    )
```

**Standard Error Response Format:**
```json
{
    "detail": "Error message here",
    "timestamp": "ISO format timestamp"
}
```

---

### 2.5 CORS Configuration (`app/main.py`)

**Enable CORS for localhost development:**

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## SECTION 3: FRONTEND STATE MANAGEMENT (REACT CONTEXT)

### 3.1 Global Context Shape

**Context Provider Component:** `src/context/AppContext.jsx`

```javascript
const AppContextValue = {
  // User/Session State
  user: {
    id: null,           // int or null
    username: "",       // string
    session_token: "",  // string (JWT or UUID)
    isAuthenticated: false
  },

  // Dashboard State
  dashboard: {
    isLoading: false,        // boolean
    generatedDoc: {
      title: "",             // string
      technical_output: "",  // markdown string
      user_output: "",       // markdown string
      doc_id: null           // int or null
    },
    activeTab: "technical",  // "technical" or "user"
    metrics: {
      total_generations: 0,
      dev_vs_user_split: { dev_count: 0, user_count: 0 },
      unique_categories: []
    }
  },

  // Logs State
  logs: [
    // Array of log objects
    // { timestamp: "HH:MM:SS", username: "", action_type: "", target_category: "", execution_status: "" }
  ],

  // UI State
  ui: {
    successMessage: "",  // Flash messages
    errorMessage: "",
    toastVisible: false
  }
};
```

### 3.2 Context Provider Implementation

```javascript
import React, { createContext, useReducer } from "react";

export const AppContext = createContext();

const initialState = {
  user: { id: null, username: "", session_token: "", isAuthenticated: false },
  dashboard: {
    isLoading: false,
    generatedDoc: { title: "", technical_output: "", user_output: "", doc_id: null },
    activeTab: "technical",
    metrics: { total_generations: 0, dev_vs_user_split: {}, unique_categories: [] }
  },
  logs: [],
  ui: { successMessage: "", errorMessage: "", toastVisible: false }
};

const reducer = (state, action) => {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: action.payload };
    case "SET_LOADING":
      return { ...state, dashboard: { ...state.dashboard, isLoading: action.payload } };
    case "SET_GENERATED_DOC":
      return { ...state, dashboard: { ...state.dashboard, generatedDoc: action.payload } };
    case "SET_ACTIVE_TAB":
      return { ...state, dashboard: { ...state.dashboard, activeTab: action.payload } };
    case "SET_METRICS":
      return { ...state, dashboard: { ...state.dashboard, metrics: action.payload } };
    case "SET_LOGS":
      return { ...state, logs: action.payload };
    case "SHOW_SUCCESS":
      return { ...state, ui: { ...state.ui, successMessage: action.payload, toastVisible: true } };
    case "SHOW_ERROR":
      return { ...state, ui: { ...state.ui, errorMessage: action.payload, toastVisible: true } };
    case "CLEAR_TOAST":
      return { ...state, ui: { ...state.ui, toastVisible: false } };
    case "LOGOUT":
      return initialState;
    default:
      return state;
  }
};

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};
```

### 3.3 Custom Hook for Context Access

```javascript
import { useContext } from "react";

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used inside AppProvider");
  }
  return context;
};
```

---

## SECTION 4: DATA VALIDATION RULES (PYDANTIC SCHEMAS)

All input validation happens in `app/schemas/` directory.

### 4.1 Authentication Schemas (`app/schemas/auth.py`)

```python
from pydantic import BaseModel, Field
from typing import Optional

class LoginPayload(BaseModel):
    username: str = Field(..., min_length=1, max_length=50)
    access_key: Optional[str] = Field(None, max_length=100)

class LoginResponse(BaseModel):
    user_id: int
    username: str
    session_token: str
    message: str = "Login successful"
```

---

### 4.2 Documentation Generation Schemas (`app/schemas/docs.py`)

```python
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class GenerateDocPayload(BaseModel):
    prompt: str = Field(..., min_length=5, max_length=1000)
    category: str = Field(...)  # Will validate against allowed values
    user_id: int = Field(...)

    @property
    def allowed_categories(self):
        return ["auth", "database", "api", "docker", "general"]

class GenerateDocResponse(BaseModel):
    doc_id: int
    title: str
    category: str
    technical_output: str
    user_output: str
    created_at: str

class MetricsResponse(BaseModel):
    total_generations: int
    dev_vs_user_split: dict
    unique_categories: list
```

---

### 4.3 Logging Schemas (`app/schemas/logs.py`)

```python
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class LogEntry(BaseModel):
    timestamp: str
    username: str
    action_type: str
    target_category: Optional[str]
    execution_status: str

class LogsResponse(BaseModel):
    logs: list[LogEntry]
```

---

## SECTION 5: ERROR HANDLING LAYER

### 5.1 Documented Error Scenarios

**Scenario 1: No Category Match in doc_engine**
- Condition: User prompt doesn't match any keyword regex
- Handling: Use "default" matrix fallback (already specified in docs_engine.md)
- Log Status: `ROUTE_MOCK_FALLBACK`
- Frontend: Display notification "Using default template"

**Scenario 2: User Not Found on Login**
- Condition: User queries POST `/api/users/login` with new username
- Handling: Create new user record automatically, return session_token
- Log Status: `SUCCESS`
- Frontend: Transparent (user doesn't know)

**Scenario 3: Database Transaction Fails**
- Condition: SQLAlchemy commit() raises exception
- Handling: Catch exception, rollback transaction, return 500 error
- Log Status: `FAILED`
- Frontend: Show error toast "Generation failed. Please try again."

**Scenario 4: Empty Prompt Input**
- Condition: User clicks "Generate" with 0 chars in textarea
- Handling: Frontend validates, shows inline error "Minimum 5 characters required"
- Log Status: N/A (never sent to backend)
- Frontend: Disable submit button until valid

**Scenario 5: Regex Match Ambiguity**
- Condition: User prompt matches multiple categories (e.g., "auth api database")
- Handling: Match FIRST occurrence in keyword priority order:
  1. Auth keywords first
  2. Database keywords second
  3. API keywords third
  4. Docker keywords fourth
  5. Default fallback last
- Log Status: `SUCCESS`
- Frontend: Transparent

**Scenario 6: Invalid Session Token**
- Condition: Frontend sends request with expired/invalid token
- Handling: Return 401 Unauthorized
- Log Status: N/A
- Frontend: Redirect to login page, show "Session expired. Please login again."

**Scenario 7: Network Error**
- Condition: Frontend cannot reach backend (no internet, backend down)
- Handling: Frontend catch error, show toast
- Log Status: N/A
- Frontend: Show "Connection error. Please check your connection and retry."

---

### 5.2 Error Response Format (All 4xx/5xx)

**Standard Format:**
```json
{
  "detail": "Human-readable error message",
  "error_code": "CATEGORY_CODE",
  "timestamp": "2024-01-15T14:23:45Z"
}
```

**Example:**
```json
{
  "detail": "User not found",
  "error_code": "USER_NOT_FOUND",
  "timestamp": "2024-01-15T14:23:45Z"
}
```

---

## SECTION 6: SESSION & TOKEN MANAGEMENT

### 6.1 Session Token Lifecycle

**Token Creation:**
- On successful login (POST `/api/users/login`)
- Generate: `session_token = uuid.uuid4().hex` (32-char random string)
- Alternative (if using JWT): Sign with secret key, expiration 24 hours

**Token Storage (Frontend):**
- Store in React Context (in-memory)
- Optional: Also store in localStorage for page refresh persistence
- **Do NOT send token in headers** for MVP (keep it simple)
- Pass token in request body only if needed (for explicit session validation)

**Token Validation:**
- On dashboard load: Check if `user.session_token` exists in Context
- If missing/empty: Redirect to login
- Backend does NOT verify token integrity (MVP simplification)

**Token Expiration:**
- No automatic expiration for MVP (kept in memory, lost on browser refresh)
- Manual logout: User clicks "Logout" button, Context cleared

---

### 6.2 Session Context Check (React)

```javascript
// Add to App.jsx or create ProtectedRoute component
import { useAppContext } from "./context/AppContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const ProtectedRoute = ({ children }) => {
  const { state } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!state.user.isAuthenticated || !state.user.session_token) {
      navigate("/login");
    }
  }, [state.user.isAuthenticated, navigate]);

  return state.user.isAuthenticated ? children : null;
};
```

---

## SECTION 7: FALLBACK BEHAVIOR & EDGE CASES

### 7.1 When No Documents Exist

**Scenario:** New user logs in, has 0 generated documents

**Metrics Behavior:**
```json
{
  "total_generations": 0,
  "dev_vs_user_split": { "dev_count": 0, "user_count": 0 },
  "unique_categories": []
}
```

**UI Display:**
- Header shows "0" for all counters
- Category pills section shows "No categories yet"
- No error message (graceful)

---

### 7.2 When Multiple Categories Match

**Example:** User input: "I need a docker containerized auth API"

**Matches:** docker, auth, api (all three)

**Resolution:** Use FIRST match in priority order:
1. Check for `auth` keywords → MATCH → Use auth template
2. (Don't check further)

**Log Entry:** category = "auth", status = "SUCCESS"

---

### 7.3 When Database Corrupted

**Scenario:** SQLite file corrupted or schema mismatch

**Recovery (MVP):**
1. Try to query `SELECT 1 FROM users`
2. If fails → Return 500 error with message "Database connection failed"
3. Frontend shows: "System error. Please refresh page."
4. Manual fix: Delete `local_mvp.db`, restart backend (auto-recreates)

---

### 7.4 When Export Fails

**Scenario:** Browser cannot create Blob or trigger download

**Handling:**
1. Catch error in try/catch block
2. Show error toast: "Export failed. Please try again or copy to clipboard."
3. Fallback: User can still copy to clipboard instead

---

### 7.5 When Logs Table Grows Large

**Scenario:** After many generations, system_logs has 10k+ rows

**Optimization (MVP):**
- Fetch only `LIMIT 5` most recent logs
- No pagination (keep it simple)
- Optional: Add background job to prune logs older than 7 days (post-MVP)

---

## SECTION 8: SUCCESS CRITERIA CHECKLIST

**Each item below must be tested and working before demo:**

### Frontend Checklist
- [ ] User can navigate to `/login` page
- [ ] Login form accepts username (1-50 chars), validates on submit
- [ ] Submit calls POST `/api/users/login`, success redirects to `/dashboard`
- [ ] Dashboard loads with metrics header (total, split, categories)
- [ ] Textarea accepts text input, shows character counter (0-1000)
- [ ] Category dropdown has 5 options, defaults to "general"
- [ ] "Generate SassyDoc" button disabled when prompt < 5 chars
- [ ] Generate button shows spinner while loading
- [ ] Success: Generated doc appears in preview panes (both tabs)
- [ ] Technical tab shows technical markdown, User tab shows user guide
- [ ] "Download HTML" button downloads file named `sassydoc_export_[timestamp].html`
- [ ] "Copy to Clipboard" button copies content and shows toast
- [ ] "Share to WhatsApp" button opens WhatsApp with summary
- [ ] "Copy for Teams" button copies and shows confirmation
- [ ] Telemetry stream shows 5 most recent logs formatted correctly
- [ ] Dashboard responsive: single column on mobile, split on desktop
- [ ] Logout button clears context and redirects to login
- [ ] Error messages display in red text (not as exceptions)
- [ ] Network errors show user-friendly message, not console errors

### Backend Checklist
- [ ] FastAPI server starts on `http://localhost:8000`
- [ ] GET `/api/health` returns 200 with `{ "status": "healthy", "database": "connected" }`
- [ ] SQLite database creates `local_mvp.db` with 3 tables (users, documents, system_logs)
- [ ] POST `/api/users/login` with valid username creates user, returns session_token
- [ ] POST `/api/docs/generate` with valid payload generates and stores document
- [ ] GET `/api/dashboard/metrics` returns correct counts from documents table
- [ ] GET `/api/logs/recent` returns last 5 system_logs sorted by timestamp DESC
- [ ] All routes return proper JSON responses (no HTML errors)
- [ ] Invalid payloads return 422 with Pydantic validation errors
- [ ] Missing user_id returns 404 Not Found
- [ ] Database transactions commit successfully (no rollback errors)
- [ ] Regex matching in doc_engine works for all 5 templates (auth, database, api, docker, general)
- [ ] Fallback to default template when no match
- [ ] System logs record action_type correctly (GENERATION, HTML_EXPORT, etc.)
- [ ] CORS enabled: frontend can reach backend without CORS errors

### Integration Checklist
- [ ] Full end-to-end flow works: Login → Generate → Export → Logout
- [ ] Multiple generations by same user all appear in metrics count
- [ ] Metrics header updates after each generation (re-fetch or cache?)
- [ ] Telemetry stream updates after each generation action
- [ ] Page refresh doesn't lose session (if using localStorage)
- [ ] Page refresh loses session (if only using memory context) — OK for MVP
- [ ] No console errors or warnings (clean runtime)
- [ ] No SQL injection vulnerabilities (SQLAlchemy + Pydantic prevent this)

### Performance Checklist
- [ ] Backend response time < 500ms for /api/docs/generate
- [ ] Dashboard metrics load < 200ms
- [ ] UI renders without lag (no blocking operations)

---

## SECTION 9: LOCKED DEPENDENCIES

**Backend (`backend/pyproject.toml`):**

```toml
[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[project]
name = "sassydoc-generator"
version = "0.1.0"
description = "SassyDoc Generator MVP"

dependencies = [
    "fastapi==0.104.1",
    "uvicorn[standard]==0.24.0",
    "sqlalchemy==2.0.23",
    "pydantic==2.4.2",
    "python-multipart==0.0.6",
]

[project.optional-dependencies]
dev = [
    "pytest==7.4.3",
    "pytest-asyncio==0.21.1",
    "httpx==0.25.0",
]
```

**Frontend (`frontend/package.json`):**

```json
{
  "name": "sassydoc-frontend",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.18.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.0.0"
  }
}
```

---

## SECTION 10: LOCAL TESTING CHECKLIST

**Before final demo, run these tests:**

### Backend Tests

```bash
# 1. Health check
curl http://localhost:8000/api/health

# 2. Login test
curl -X POST http://localhost:8000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"username": "test_user"}'

# 3. Generate doc test
curl -X POST http://localhost:8000/api/docs/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "I need authentication with JWT tokens",
    "category": "auth",
    "user_id": 1
  }'

# 4. Metrics test
curl http://localhost:8000/api/dashboard/metrics?user_id=1

# 5. Logs test
curl http://localhost:8000/api/logs/recent?user_id=1&limit=5

# 6. Run pytest
cd backend
uv run pytest tests/ -v
```

### Frontend Tests

```bash
# 1. Dev server starts
cd frontend
npm run dev
# Should start on http://localhost:5173

# 2. Open in browser, check:
# - Login page loads
# - Can type username
# - Can login and reach dashboard
# - Dashboard shows metrics (even if 0)
# - Can type in textarea
# - Can select category
# - Can generate doc
# - Preview panes render
# - Export buttons work

# 3. Browser DevTools Console
# - No errors
# - No warnings (or acceptable warnings)
# - Network tab shows successful requests to /api/*
```

### End-to-End Flow

```
1. Start backend: cd backend && uv run uvicorn app.main:app --reload
2. Start frontend: cd frontend && npm run dev
3. Open browser: http://localhost:5173
4. Follow happy path:
   a. Login with username "demo_user"
   b. Generate: "Implement OAuth2 authentication"
   c. Select category: "auth"
   d. Click "Generate SassyDoc"
   e. Wait for response (should be <500ms)
   f. See dual-tab preview
   g. Click "Download HTML"
   h. Check Downloads folder
   i. Open downloaded HTML in new tab
   j. Click "Logout"
   k. Should redirect to login

5. Repeat for each category (database, api, docker, general)
6. Check database: sqlite3 backend/local_mvp.db ".tables"
   Should see: users, documents, system_logs
7. Query database: sqlite3 backend/local_mvp.db "SELECT COUNT(*) FROM documents;"
   Should show generation count
```

---

## SECTION 11: 5-HOUR SPRINT BREAKDOWN

**Suggested task allocation with full team:**

| Hour | Task | Owner(s) | Deliverable | Status |
|------|------|----------|-------------|--------|
| **0-0.5h** | Database schema + SQLAlchemy models | Backend Lead | `app/models/__init__.py` with User, Document, SystemLog classes | ✓ Test: `python -c "from app.models import User, Document, SystemLog"` |
| **0.5-1.5h** | FastAPI core setup + /api/users/login route | Backend Lead | `app/main.py` with CORS, `/api/users/login` endpoint working | ✓ Test: `curl -X POST http://localhost:8000/api/users/login -d '{"username": "test"}'` |
| **0.5-1.5h** | React scaffolding + Login page UI | Frontend Lead | `src/App.jsx`, `src/components/LoginPage.jsx`, routing setup | ✓ Test: `npm run dev`, see login form on http://localhost:5173 |
| **1.5-2.5h** | /api/docs/generate route + doc_engine.py | Backend Lead | Core generation logic working | ✓ Test: POST request returns dual markdown outputs |
| **1.5-2.5h** | Dashboard UI (workspace + preview panes) | Frontend Lead | `src/components/Dashboard.jsx` with textarea, dropdown, tabs | ✓ Test: See all 4 UI sections render |
| **2.5-3.5h** | Wire frontend ↔ backend API calls | Both | Login flow, generate flow, metrics flow | ✓ Test: End-to-end login → generate → preview |
| **3.5-4.5h** | Export buttons + telemetry stream | Frontend + Backend | HTML download, clipboard, logs rendering | ✓ Test: Download HTML file, see logs in stream |
| **4.5-5h** | CSS polish + error handling + final testing | Both | Styling, error messages, responsive layout | ✓ Test: Full demo flow without errors |

---

## SECTION 12: OUT OF SPRINT SCOPE DEPLOYMENTS

**To guarantee the project is finalized within the 5-hour window, explicitly reject these blocks:**

- [ ] **External Web API Call Dependencies:** Banned. Do not include live network calls to Gemini, OpenAI, or any third-party LLM servers. All documentation generation is regex-based locally.

- [ ] **User Password Encryption Modules:** Banned. MVP uses stateless session (username only, no passwords, no hashing).

- [ ] **Server-Side File Conversions:** Banned. All markdown-to-HTML parsing and downloads must handle execution on the client browser (JavaScript only). Backend never touches files.

- [ ] **Programmatic Template Addition:** Banned. Templates are hardcoded in `docs_engine.py` from the 5 matrices (auth, database, api, docker, general). No dynamic template creation.

- [ ] **Multi-Tenancy:** Banned. Single deployment, single database, no organizational hierarchy.

- [ ] **Advanced Exports (PDF, DOCX):** Banned. Only HTML + clipboard copy. PDF generation is post-MVP.

- [ ] **Email Notifications:** Banned. No mail server integration.

- [ ] **Real-Time Collaboration:** Banned. Single-user per session only.

- [ ] **Auth0 / OAuth2 Integration:** Banned. Stateless session only.

- [ ] **Caching Layer (Redis):** Banned. In-memory React state + SQLite only.

- [ ] **Containerization (Docker):** Banned for MVP deployment. Built and tested locally only.

- [ ] **CI/CD Pipeline:** Banned. Manual testing only.

---

## SECTION 13: PROJECT FOLDER STRUCTURE (Reference)

```
SassyDocs/
├── backend/
│   ├── app/
│   │   ├── core/
│   │   │   ├── config.py           # Environment variables
│   │   │   └── database.py         # SQLAlchemy engine + session factory
│   │   ├── models/
│   │   │   └── __init__.py         # User, Document, SystemLog (SQLAlchemy)
│   │   ├── schemas/
│   │   │   ├── auth.py             # LoginPayload, LoginResponse
│   │   │   ├── docs.py             # GenerateDocPayload, GenerateDocResponse, MetricsResponse
│   │   │   └── logs.py             # LogEntry, LogsResponse
│   │   ├── services/
│   │   │   └── doc_engine.py       # generate_mock_documentation()
│   │   ├── routers/
│   │   │   ├── docs.py             # POST /api/docs/generate, GET /api/dashboard/metrics, GET /api/logs/recent
│   │   │   ├── auth.py             # POST /api/users/login
│   │   │   └── health.py           # GET /api/health
│   │   └── main.py                 # FastAPI app, CORS, exception handlers
│   ├── tests/
│   │   ├── test_main.py            # Route tests (pytest)
│   │   └── test_doc_engine.py      # Regex matching tests
│   ├── local_mvp.db                # SQLite database (auto-created)
│   └── pyproject.toml              # Dependencies
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── LoginPage.jsx       # Login form
│   │   │   ├── Dashboard.jsx       # Main dashboard with all 4 sections
│   │   │   ├── PreviewPane.jsx     # Dual-tab preview
│   │   │   ├── TelemetryStream.jsx # Logs display
│   │   │   └── Header.jsx          # Metrics counters
│   │   ├── context/
│   │   │   └── AppContext.jsx      # React Context for state management
│   │   ├── App.jsx                 # Main app component + routing
│   │   └── index.css               # Global styles
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
│
├── .gitignore
└── README.md                       # 3-step startup instructions
```

---
