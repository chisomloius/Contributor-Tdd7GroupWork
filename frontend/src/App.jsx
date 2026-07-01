import { useEffect, useMemo, useState } from "react"
import "./App.css"

const categories = [
  { label: "Authentication", value: "authentication", icon: "🔑" },
  { label: "Database Layers", value: "database_layers", icon: "🗄️" },
  { label: "API Endpoints", value: "api_endpoints", icon: "⚡" },
  { label: "Containerization", value: "containerization", icon: "🐳" },
  { label: "Azure Infrastructure", value: "azure_infrastructure", icon: "☁️" },
  { label: "Security & Compliance", value: "security_compliance", icon: "🛡️" },
  { label: "CI/CD Pipelines", value: "cicd_pipelines", icon: "🔄" },
  { label: "Data Engineering", value: "data_engineering", icon: "📊" },
  { label: "Automated Testing", value: "automated_testing", icon: "🧪" },
  { label: "General System", value: "general_system", icon: "⚙️" },
]

const jobRoles = [
  "Chief Technology Officer",
  "Senior Data Engineer",
  "AI Engineer",
  "Software Engineer",
  "Solutions Architect",
  "Product Manager",
]

const initialUser = {
  username: "",
  accessKey: "",
  sessionToken: "",
  userId: null,
  full_name: "",
  job_role: "",
  loggedIn: false,
}

function App() {
  // Authentication & Layout Configuration States
  const [user, setUser] = useState(initialUser)
  const [authMode, setAuthMode] = useState("login") // 'login' | 'signup'
  const [currentView, setCurrentView] = useState("hub") // 'hub' | 'generator' | 'admin'
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  // Document Engine States
  const [prompt, setPrompt] = useState("")
  const [category, setCategory] = useState("general_system")
  const [activeTab, setActiveTab] = useState("technical")
  const [generatedDoc, setGeneratedDoc] = useState({ title: "", technical_output: "", user_output: "" })
  const [searchQuery, setSearchQuery] = useState("")
  const [historicalDocs, setHistoricalDocs] = useState([])

  // Registration Form States
  const [regFullName, setRegFullName] = useState("")
  const [regJobRole, setRegJobRole] = useState(jobRoles[1]) // Default to Data Engineer

  // Telemetry & Error States
  const [metrics, setMetrics] = useState(null)
  const [logs, setLogs] = useState([])
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [toast, setToast] = useState("")

  useEffect(() => {
    if (user.loggedIn) {
      setCurrentView("hub")
      fetchMetrics()
      fetchLogs()
      fetchHistory()
    }
  }, [user.loggedIn])

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(""), 2000)
    return () => clearTimeout(timer)
  }, [toast])

  // Smart Initial Space Parser (e.g., "Chisom David" -> "CD")
  const userInitials = useMemo(() => {
    const name = user.full_name || user.username || ""
    if (!name.trim()) return "JD"
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }, [user.full_name, user.username])

  const charCount = useMemo(() => `${prompt.length} / 1000`, [prompt])

  async function fetchMetrics() {
    try {
      const response = await fetch("http://localhost:8000/api/dashboard/metrics")
      if (response.ok) {
        const data = await response.json()
        setMetrics(data)
      }
    } catch {
      setError("Unable to load platform diagnostic telemetry metrics.")
    }
  }

  async function fetchLogs() {
    if (!user.userId || !user.sessionToken) return
    try {
      const url = new URL("http://localhost:8000/api/logs/recent")
      url.searchParams.set("user_id", String(user.userId))
      url.searchParams.set("session_token", user.sessionToken)
      const response = await fetch(url.toString())
      if (response.ok) {
        const data = await response.json()
        setLogs(data.logs || [])
      }
    } catch {
      setError("Unable to load live auditing logs stream.")
    }
  }

  async function fetchHistory(query = "") {
    if (!user.sessionToken) return
    try {
      const url = new URL("http://localhost:8000/api/docs/search")
      url.searchParams.set("session_token", user.sessionToken)
      if (query.trim()) url.searchParams.set("q", query.trim())
      const response = await fetch(url.toString())
      if (response.ok) {
        const data = await response.json()
        setHistoricalDocs(data)
      }
    } catch {
      setError("History lookup stream disconnected.")
    }
  }

  async function handleAuthSubmit(event) {
    event.preventDefault()
    setError("")
    if (!user.username.trim()) return setError("Username target required.")

    const payload = {
      username: user.username.trim(),
      access_key: user.accessKey.trim() || undefined,
      is_signup: authMode === "signup",
      full_name: authMode === "signup" ? regFullName.trim() : undefined,
      job_role: authMode === "signup" ? regJobRole : undefined,
    }

    try {
      const response = await fetch("http://localhost:8000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      
      const data = await response.json()
      if (!response.ok) {
        return setError(data.detail || "Authentication verification gate denied access.")
      }

      setUser({
        username: data.username,
        accessKey: user.accessKey,
        sessionToken: data.session_token,
        userId: data.user_id,
        full_name: data.full_name || "",
        job_role: data.job_role || "",
        loggedIn: true,
      })
    } catch {
      setError("Local network route unavailable.")
    }
  }

  async function handleGenerate() {
    setError("")
    if (prompt.trim().length < 5) return setError("Describe features with min 5 characters.")
    setIsLoading(true)
    try {
      const response = await fetch("http://localhost:8000/api/docs/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim(), category, session_token: user.sessionToken }),
      })
      if (!response.ok) throw new Error()
      const data = await response.json()
      setGeneratedDoc(data)
      await fetchMetrics()
      await fetchLogs()
      await fetchHistory()
      setToast("SassyDoc Blueprint Compiled!")
    } catch {
      setError("Generation pipeline loop failed.")
    } finally {
      setIsLoading(false)
    }
  }

  function handleSearchChange(e) {
    const val = e.target.value
    setSearchQuery(val)
    fetchHistory(val)
  }

  function handleClear() {
    setPrompt("")
    setCategory("general_system")
    setGeneratedDoc({ title: "", technical_output: "", user_output: "" })
    setError("")
  }

  function handleLogout() {
    setUser(initialUser)
    setAuthMode("login")
    setCurrentView("hub")
    handleClear()
  }

  function activeContent() {
    return activeTab === "technical" ? generatedDoc.technical_output : generatedDoc.user_output
  }

  function downloadHtml() {
    const content = activeContent()
    if (!content) return
    const html = `<!DOCTYPE html><html><head><title>SassyDoc Export</title><style>body{font-family:sans-serif;margin:40px;line-height:1.6;background:#0f172a;color:#f8fafc;}pre{background:#1e293b;padding:20px;border-radius:8px;border:1px solid #334155;color:#e2e8f0;white-space:pre-wrap;}</style></head><body><h1>${generatedDoc.title || "Document Layout Blueprint"}</h1><pre>${content}</pre></body></html>`
    const blob = new Blob([html], { type: "text/html" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `sassydoc_${category}_${Date.now()}.html`
    link.click()
    URL.revokeObjectURL(link.href)
  }

  async function copyToClipboard(message) {
    const content = activeContent()
    if (!content) return
    try {
      await navigator.clipboard.writeText(content)
      setToast(message)
    } catch {
      setError("Clipboard access denied.")
    }
  }

  if (!user.loggedIn) {
    return (
      <div className="login-viewport">
        <div className="login-container">
          <div className="brand-logo-hero">
            <div className="app-logo-vector">⚡</div>
            <h1>SassyDoc Generator</h1>
            <p>Production Framework Architecture Blueprint Builder</p>
          </div>

          <div className="card login-card">
            <div className="auth-toggle-header">
              <button className={`auth-toggle-tab ${authMode === "login" ? "active" : ""}`} onClick={() => { setAuthMode("login"); setError(""); }}>Sign In</button>
              <button className={`auth-toggle-tab ${authMode === "signup" ? "active" : ""}`} onClick={() => { setAuthMode("signup"); setError(""); }}>Register Workspace</button>
            </div>

            <form onSubmit={handleAuthSubmit} className="form-grid">
              {authMode === "signup" && (
                <>
                  <label className="field-label-styled">Full Profile Name
                    <input type="text" value={regFullName} onChange={(e) => setRegFullName(e.target.value)} placeholder="e.g., Chisom David" required />
                  </label>
                  <label className="field-label-styled">Professional Domain Role
                    <select value={regJobRole} onChange={(e) => setRegJobRole(e.target.value)}>
                      {jobRoles.map(role => <option key={role} value={role}>{role}</option>)}
                    </select>
                  </label>
                </>
              )}
              <label className="field-label-styled">User ID Alias
                <input type="text" value={user.username} onChange={(e) => setUser(p => ({ ...p, username: e.target.value }))} placeholder="chisom_david" required />
              </label>
              <label className="field-label-styled">Access Protection Token
                <input type="password" value={user.accessKey} onChange={(e) => setUser(p => ({ ...p, accessKey: e.target.value }))} placeholder="••••••••" />
              </label>
              {error && <div className="error-alert-banner">{error}</div>}
              <button type="submit" className="primary-button full-width">
                {authMode === "login" ? "Verify Entrance ➔" : "Provision Environment ➔"}
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`app-layout-frame ${sidebarCollapsed ? "sidebar-closed" : ""}`}>
      {/* EXPANDED COLLAPSIBLE SIDEBAR CONTAINER */}
      <aside className="app-sidebar">
        <div className="sidebar-top">
          <div className="sidebar-brand">
            <div className="app-logo-micro">⚡</div>
            {!sidebarCollapsed && (
              <div className="brand-meta">
                <span className="brand-title">SassyDoc</span>
                <span className="brand-version">v1.2.0 Core</span>
              </div>
            )}
            <button className="sidebar-toggle-trigger" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
              {sidebarCollapsed ? "❯" : "❮"}
            </button>
          </div>

          <nav className="sidebar-links">
            <button className={`sidebar-nav-btn ${currentView === "hub" ? "active" : ""}`} onClick={() => setCurrentView("hub")} title="Hub Cockpit">
              <span className="nav-icon">📊</span> {!sidebarCollapsed && <span className="nav-text-node">Hub Cockpit</span>}
            </button>
            <button className={`sidebar-nav-btn ${currentView === "generator" ? "active" : ""}`} onClick={() => setCurrentView("generator")} title="Document Engine">
              <span className="nav-icon">📝</span> {!sidebarCollapsed && <span className="nav-text-node">Compile Specs</span>}
            </button>
            <button className={`sidebar-nav-btn ${currentView === "admin" ? "active" : ""}`} onClick={() => setCurrentView("admin")} title="Admin Operations">
              <span className="nav-icon">🛡️</span> {!sidebarCollapsed && <span className="nav-text-node">Admin Operations</span>}
            </button>
            <div className="sidebar-divider-node"></div>
            {/* INJECTED SUB-SYSTEM REGISTRIES */}
            {["Saved Repositories", "Global Search Index", "System Templates", "Telemetry Streams", "Team Matrix", "Export Registry", "CORS Configuration"].map((sub, i) => (
              <button key={i} className="sidebar-nav-btn sub-tier" disabled title={sub}>
                <span className="nav-icon">▪</span> {!sidebarCollapsed && <span className="nav-text-node">{sub}</span>}
              </button>
            ))}
          </nav>
        </div>

        <div className="sidebar-footer">
          <div className="user-profile-widget" onClick={() => setShowProfileMenu(!showProfileMenu)}>
            <div className="user-avatar">{userInitials}</div>
            {!sidebarCollapsed && (
              <div className="user-info">
                <span className="profile-name">{user.full_name || user.username}</span>
                <span className="profile-role">{user.job_role || "Operations"}</span>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* RE-ENGINEERED CONTAINER MATRIX */}
      <div className="main-viewport-content">
        <header className="top-status-bar">
          <div className="breadcrumbs">
            <span className="crumb-root">SassyDoc Server</span>
            <span className="crumb-divider">/</span>
            <span className="crumb-active">
              {currentView === "hub" ? "Dashboard Hub" : currentView === "generator" ? "Workspace Compiler" : "Admin Operations"}
            </span>
          </div>

          <div className="system-status-cluster">
            <span className="status-node pulse"></span>
            <span className="status-text">Local Engine Core Online</span>
            
            <div className="header-profile-dropdown-context">
              <button className="header-avatar-orb" onClick={() => setShowProfileMenu(!showProfileMenu)}>{userInitials}</button>
              {showProfileMenu && (
                <div className="topbar-context-menu">
                  <div className="dropdown-user-header">
                    <strong>{user.full_name}</strong>
                    <span>{user.job_role}</span>
                  </div>
                  <div className="menu-divider"></div>
                  <button onClick={() => { setCurrentView("hub"); setShowProfileMenu(false); }}>👤 User Profile</button>
                  <button onClick={() => { setCurrentView("generator"); setShowProfileMenu(false); }}>⚙️ Import Configurations</button>
                  <button onClick={() => { setCurrentView("admin"); setShowProfileMenu(false); }}>🛡️ High-Privilege Panel</button>
                  <div className="menu-divider"></div>
                  <button className="menu-logout-trigger" onClick={handleLogout}>🚪 Close Secure Session</button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* 1. BRAND NEW DEFAULT COCKPIT HUB MODULE */}
        {currentView === "hub" && (
          <div className="view-content-canvas animate-fade-in">
            <div className="hub-jumbotron-cta-card">
              <div className="jumbo-prose">
                <h2>Welcome back, {user.full_name || user.username}</h2>
                <p>Simultaneously engineer markdown specification frameworks and onboarding runbooks across 10 architectural categories.</p>
              </div>
              <button className="primary-button operational-jumbo-launcher" onClick={() => setCurrentView("generator")}>
                ✨ Launch Document Workspace Compiler ➔
              </button>
            </div>

            {/* PERFORMANCE METRICS LAYER */}
            <section className="metrics-row-grid">
              <div className="metric-card-styled">
                <div className="card-icon-wrap">📊</div>
                <div className="card-data-block">
                  <span className="m-metric-label">Total Volume Run</span>
                  <span className="m-metric-val">{metrics?.total_generations ?? "0"}</span>
                </div>
              </div>
              <div className="metric-card-styled">
                <div className="card-icon-wrap">⚖️</div>
                <div className="card-data-block">
                  <span className="m-metric-label">Blueprint Vector Allocation</span>
                  <span className="m-metric-val-split">
                    <span>Dev: <strong className="text-violet">{metrics?.dev_vs_user_split?.dev_count ?? "0"}</strong></span>
                    <span className="split-divider">|</span>
                    <span>User: <strong>{metrics?.dev_vs_user_split?.user_count ?? "0"}</strong></span>
                  </span>
                </div>
              </div>
              <div className="metric-card-styled">
                <div className="card-icon-wrap">🏗️</div>
                <div className="card-data-block">
                  <span className="m-metric-label">Mapped Category Containers</span>
                  <span className="m-metric-val">{metrics?.unique_categories?.length ?? "0"}</span>
                </div>
              </div>
            </section>

            {/* ASI-CHRONOUS HISTORY MATRIX LOOKUP */}
            <section className="panel-card-workspace history-lookup-matrix">
              <div className="history-header-search-row">
                <div>
                  <h3>Repository Query Registry</h3>
                  <p>Search, trace, and extract cached framework instances</p>
                </div>
                <input type="text" className="search-input-field" placeholder="🔍 Filter models by keyword, spec, or classification" value={searchQuery} onChange={handleSearchChange} />
              </div>

              <div className="history-results-scrollable">
                {historicalDocs.length === 0 ? (
                  <div className="empty-history-notice">No cached blueprint specifications found tracking that filter query.</div>
                ) : (
                  <div className="history-grid-layout">
                    {historicalDocs.map((doc) => (
                      <div key={doc.id} className="history-item-mini-card" onClick={() => {
                        setCategory(doc.category);
                        setPrompt(doc.prompt_text);
                        setGeneratedDoc({ title: doc.title, technical_output: doc.technical_output, user_output: doc.user_output });
                        setCurrentView("generator");
                      }}>
                        <div className="h-item-top">
                          <span className="h-category-tag">{doc.category.replace('_', ' ')}</span>
                          <span className="h-time-node">{new Date(doc.created_at).toLocaleDateString()}</span>
                        </div>
                        <h4>{doc.title}</h4>
                        <p className="h-prompt-trunc">{doc.prompt_text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>
        )}

        {/* 2. DUAL PANEL GENERATOR WORKSPACE VIEWER */}
        {currentView === "generator" && (
          <div className="view-content-canvas animate-fade-in">
            <div className="dashboard-workspace-split">
              <section className="panel-card-workspace">
                <div className="workspace-header-meta">
                  <h3>Configuration Workspace Parameters</h3>
                  <p>Define inputs to instantly parse contextual requirements mappings</p>
                </div>

                <div className="input-group-stack">
                  <label className="field-label-styled">Describe Feature Context Scope</label>
                  <textarea rows={6} maxLength={1000} value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Provide specific feature definitions, encryption patterns, access protocols, or deployment infrastructure specs..." />
                  <div className="textarea-footer-metrics">
                    {error && <span className="inline-error-msg">{error}</span>}
                    <span className="char-indicator-badge">{charCount}</span>
                  </div>
                </div>

                <div className="input-group-stack">
                  <label className="field-label-styled">Select Execution Target Pipeline</label>
                  <div className="category-interactive-grid">
                    {categories.map((item) => (
                      <button key={item.value} type="button" className={`category-badge-card ${category === item.value ? "selected" : ""}`} onClick={() => setCategory(item.value)}>
                        <span className="badge-icon">{item.icon}</span>
                        <span className="badge-label">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="workspace-action-footrow">
                  <button className="primary-button flex-fill" onClick={handleGenerate} disabled={isLoading || prompt.trim().length < 5}>
                    {isLoading ? "🔄 Processing Deterministic Matrix..." : "Compile SassyDoc Layout Blueprint"}
                  </button>
                  <button className="outline-button" onClick={handleClear} type="button">Reset Canvas</button>
                </div>
              </section>

              {/* SPLIT PANEL VIEW: DUAL OUTPUT PREVIEW CANVAS */}
              <section className="panel-card-workspace preview-flex-layout">
                <div className="canvas-pill-tabs-header">
                  <div className="pill-switch-container">
                    <button className={`pill-tab-toggle ${activeTab === "technical" ? "active" : ""}`} onClick={() => setActiveTab("technical")}>Technical System Specification</button>
                    <button className={`pill-tab-toggle ${activeTab === "user" ? "active" : ""}`} onClick={() => setActiveTab("user")}>Functional User Manual</button>
                  </div>
                </div>

                <div className="output-rendered-viewport">
                  {activeContent() ? (
                    <div className="markdown-prose-renderer">
                      {activeContent().split("\n").map((line, idx) => {
                        if (line.startsWith("###")) return <h3 key={idx} className="prose-h3">{line.replace("###", "").trim()}</h3>
                        if (line.startsWith("-")) return <li key={idx} className="prose-li">{line.replace("-", "").trim()}</li>
                        return <p key={idx} className="prose-p">{line}</p>
                      })}
                    </div>
                  ) : (
                    <div className="empty-preview-placeholder">
                      <span className="placeholder-large-icon">🔍</span>
                      <h4>No Specifications Compiled</h4>
                      <p>Populate configuration scopes on the left panel to execute framework extractions inside this canvas viewport.</p>
                    </div>
                  )}
                </div>

                <div className="action-button-export-grid">
                  <button className="export-action-node primary-fill" onClick={downloadHtml} disabled={!activeContent()}>📥 Download HTML</button>
                  <button className="export-action-node outline-slate" onClick={() => copyToClipboard("Copied successfully to local system clipboard buffer!")} disabled={!activeContent()}>📋 Copy Buffer</button>
                  <button className="export-action-node outline-slate" onClick={shareWhatsApp} disabled={!activeContent()}>💬 WhatsApp</button>
                  <button className="export-action-node outline-slate" onClick={() => copyToClipboard("Formatted channel string ready for integration inside Teams.")} disabled={!activeContent()}>👥 Teams Broadcast</button>
                </div>
              </section>
            </div>

            {/* LIVE TELEMETRY LOG LEDGER TERMINAL FOOTER */}
            <section className="terminal-ledger-wrapper">
              <div className="terminal-header-top">
                <div className="terminal-decorations"><span className="dot-dec red"></span><span className="dot-dec yellow"></span><span className="dot-dec green"></span></div>
                <span className="terminal-title-text">Live Auditing Architecture Pipeline Ledger</span>
              </div>
              <div className="terminal-console-screen">
                {logs.length === 0 ? (
                  <div className="terminal-log-row empty-state">⚡ Local loop diagnostic tunnel online. Pending structural compilation logs hooks...</div>
                ) : (
                  logs.map((entry, idx) => (
                    <div key={idx} className="terminal-log-row">
                      <span className="log-timestamp">[{new Date(entry.created_at).toLocaleTimeString()}]</span>
                      <span className="log-success-node">✔ [STABLE]</span>
                      <span className="log-body-stream">Action routing vector matched: <strong className="text-violet">{entry.action}</strong> ➔ {entry.detail}</span>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        )}

        {/* 3. ADMIN OPERATIONS HIGH-PRIVILEGE AGGREGATOR MODULE */}
        {currentView === "admin" && (
          <div className="view-content-canvas animate-fade-in">
            <div className="admin-placeholder-view">
              <h2>Aggregated Admin Operations & Global Multi-User Audit Log</h2>
              <p>This screen functions as your master telemetry console. It reads direct SQLite storage metrics, monitors multi-tenant session tokens, logs system errors, and tracks global usage metrics across your entire engineering team.</p>
              <div className="menu-divider" style={{ margin: "24px 0" }}></div>
              <button className="primary-button" onClick={() => setCurrentView("hub")}>➔ Return to Main Hub Cockpit</button>
            </div>
          </div>
        )
        }
      </div>

      {toast && <div className="toast-notification-banner animate-slide-up">{toast}</div>}
    </div>
  )
}

export default App