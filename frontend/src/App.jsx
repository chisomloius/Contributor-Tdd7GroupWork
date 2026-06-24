import { useEffect, useMemo, useState } from "react"
import "./App.css"

const categories = [
  { label: "Authentication", value: "authentication", icon: "🔑" },
  { label: "Database Layers", value: "database_layers", icon: "🗄️" },
  { label: "API Endpoints", value: "api_endpoints", icon: "⚡" },
  { label: "Containerization", value: "containerization", icon: "🐳" },
  { label: "General System", value: "general_system", icon: "⚙️" },
]

const initialUser = {
  username: "",
  accessKey: "",
  sessionToken: "",
  userId: null,
  loggedIn: false,
}

function App() {
  const [user, setUser] = useState(initialUser)
  const [mode, setMode] = useState("login") // 'login' | 'dashboard' | 'admin'
  const [prompt, setPrompt] = useState("")
  const [category, setCategory] = useState("general_system")
  const [activeTab, setActiveTab] = useState("technical")
  const [generatedDoc, setGeneratedDoc] = useState({ technical_output: "", user_output: "" })
  const [metrics, setMetrics] = useState(null)
  const [logs, setLogs] = useState([])
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [toast, setToast] = useState("")

  useEffect(() => {
    if (user.loggedIn) {
      setMode("dashboard")
      fetchMetrics()
      fetchLogs()
    }
  }, [user.loggedIn])

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(""), 2000)
    return () => clearTimeout(timer)
  }, [toast])

  const charCount = useMemo(() => `${prompt.length} / 1000`, [prompt])
  const userInitials = useMemo(() => user.username ? user.username.slice(0, 2).toUpperCase() : "JD", [user.username])

  async function fetchMetrics() {
    try {
      const response = await fetch("http://localhost:8000/api/dashboard/metrics")
      const data = await response.json()
      setMetrics(data)
    } catch {
      setError("Unable to load dashboard metrics.")
    }
  }

  async function fetchLogs() {
    if (!user.userId || !user.sessionToken) return
    try {
      const url = new URL("http://localhost:8000/api/logs/recent")
      url.searchParams.set("user_id", String(user.userId))
      url.searchParams.set("session_token", user.sessionToken)
      const response = await fetch(url.toString())
      const data = await response.json()
      setLogs(data.logs || [])
    } catch {
      setError("Unable to load recent activity.")
    }
  }

  async function handleLogin(event) {
    event.preventDefault()
    setError("")
    if (!user.username.trim()) {
      return setError("Username required")
    }

    try {
      const response = await fetch("http://localhost:8000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: user.username.trim(), access_key: user.accessKey.trim() || undefined }),
      })
      if (!response.ok) {
        return setError("Server error. Please refresh and retry.")
      }
      const data = await response.json()
      setUser({
        username: data.username,
        accessKey: user.accessKey,
        sessionToken: data.session_token,
        userId: data.user_id,
        loggedIn: true,
      })
    } catch {
      setError("Connection failed. Please try again.")
    }
  }

  async function handleGenerate() {
    setError("")
    if (prompt.trim().length < 5) {
      return setError("Describe your feature with at least 5 characters.")
    }
    setIsLoading(true)
    try {
      const response = await fetch("http://localhost:8000/api/docs/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim(), category, session_token: user.sessionToken }),
      })
      if (!response.ok) {
        setError("Generation failed. Please try again.")
        setIsLoading(false)
        return
      }
      const data = await response.json()
      setGeneratedDoc(data)
      await fetchMetrics()
      await fetchLogs()
    } catch {
      setError("Network unavailable. Please retry.")
    } finally {
      setIsLoading(false)
    }
  }

  function handleClear() {
    setPrompt("")
    setCategory("general_system")
    setGeneratedDoc({ technical_output: "", user_output: "" })
    setError("")
  }

  function handleLogout() {
    setUser(initialUser)
    setMode("login")
    handleClear()
  }

  function activeContent() {
    return activeTab === "technical" ? generatedDoc.technical_output : generatedDoc.user_output
  }

  function downloadHtml() {
    const content = activeContent()
    if (!content) return
    const html = `<!DOCTYPE html><html><head><title>SassyDoc Export</title><style>body{font-family:sans-serif;margin:40px;line-height:1.6;background:#0f172a;color:#f8fafc;}pre{background:#1e293b;padding:20px;border-radius:8px;border:1px solid #334155;overflow-x:auto;color:#e2e8f0;}</style></head><body><h1>Generated Documentation</h1><pre>${content}</pre></body></html>`
    const blob = new Blob([html], { type: "text/html" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `sassydoc_export_${Date.now()}.html`
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

  function shareWhatsApp() {
    const content = activeContent()
    if (!content) return
    const summary = content.slice(0, 100)
    window.open(`https://wa.me/?text=${encodeURIComponent(summary + "...")}`, "_blank")
  }

  if (mode === "login") {
    return (
      <div className="login-viewport">
        <div className="login-container">
          <div className="brand-logo-hero">
            <div className="app-logo-vector">
              <span className="logo-layers-icon">📚</span>
            </div>
            <h1>Sassy Doc Generator</h1>
            <p>Simultaneous Technical & Functional Manual Frameworks</p>
          </div>
          
          <div className="card login-card">
            <h2>Secure Workspace Gate</h2>
            <form onSubmit={handleLogin} className="form-grid">
              <label className="field-label">
                Username
                <input
                  type="text"
                  value={user.username}
                  onChange={(event) => setUser((prev) => ({ ...prev, username: event.target.value }))}
                  placeholder="e.g., chisom_david"
                  maxLength={50}
                  required
                />
              </label>
              <label className="field-label">
                Password
                <input
                  type="password"
                  value={user.accessKey}
                  onChange={(event) => setUser((prev) => ({ ...prev, accessKey: event.target.value }))}
                  placeholder="••••••••"
                />
              </label>
              {error && <div className="error-alert-banner">{error}</div>}
              <button type="submit" className="primary-button full-width">
                Login ➔
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="app-layout-frame">
      {/* LEFT NAVIGATION SIDEBAR */}
      <aside className="app-sidebar">
        <div className="sidebar-top">
          <div className="sidebar-brand">
            <div className="app-logo-micro">📚</div>
            <div className="brand-meta">
              <span className="brand-title">SassyDoc</span>
              <span className="brand-version">v1.0.0 Local</span>
            </div>
          </div>

          <nav className="sidebar-links">
            <button 
              className={`sidebar-nav-btn ${mode === "dashboard" ? "active" : ""}`}
              onClick={() => setMode("dashboard")}
            >
              <span className="nav-icon">💻</span> Workspace
            </button>
            <button 
              className={`sidebar-nav-btn ${mode === "admin" ? "active" : ""}`}
              onClick={() => setMode("admin")}
            >
              <span className="nav-icon">📊</span> Admin Audit Panel
            </button>
          </nav>
        </div>

        <div className="sidebar-footer">
          <div className="user-profile-widget">
            <div className="user-avatar">{userInitials}</div>
            <div className="user-info">
              <span className="profile-name">{user.username || "Chisom Okoye"}</span>
              <span className="profile-role">Data Engineer</span>
            </div>
            <button className="logout-btn" onClick={handleLogout} title="Log Out">
              🚪
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN VIEWPORT LAYOUT WRAPPER */}
      <div className="main-viewport-content">
        {/* TOP STATUS CONTROL BAR */}
        <header className="top-status-bar">
          <div className="breadcrumbs">
            <span className="crumb-root">SassyDoc</span>
            <span className="crumb-divider">/</span>
            <span className="crumb-active">{mode === "dashboard" ? "Workspace" : "Admin Operations"}</span>
          </div>
          <div className="system-status-cluster">
            <span className="status-node pulse"></span>
            <span className="status-text">System Local Host Active</span>
            <div className="header-avatar-orb">{userInitials}</div>
          </div>
        </header>

        {mode === "admin" ? (
          /* TEMPLATE PLACEHOLDER FOR UPCOMING AGGREGATED VIEWS */
          <div className="view-content-canvas animate-fade-in">
            <div className="admin-placeholder-view">
              <h2>Aggregated Admin Operations</h2>
              <p>This panel will monitor global database performance logs, cross-user generation metrics, and multi-tenant telemetry loops.</p>
              <button className="primary-button" onClick={() => setMode("dashboard")}>➔ Return to Generator Workspace</button>
            </div>
          </div>
        ) : (
          /* SINGLE USER GENERATOR DASHBOARD VIEW */
          <div className="view-content-canvas animate-fade-in">
            {/* PERFORMANCE METRICS BAR */}
            <section className="metrics-row-grid">
              <div className="metric-card-styled">
                <div className="card-icon-wrap">📈</div>
                <div className="card-data-block">
                  <span className="m-metric-label">Total Generations</span>
                  <span className="m-metric-val">{metrics?.total_generations ?? "0"}</span>
                </div>
              </div>
              <div className="metric-card-styled">
                <div className="card-icon-wrap">⚖️</div>
                <div className="card-data-block">
                  <span className="m-metric-label">Dev Blueprints vs User Manuals</span>
                  <span className="m-metric-val-split">
                    <span>Dev: <strong className="text-violet">{metrics?.dev_vs_user_split?.dev_count ?? "0"}</strong></span>
                    <span className="split-divider">|</span>
                    <span>User: <strong>{metrics?.dev_vs_user_split?.user_count ?? "0"}</strong></span>
                  </span>
                </div>
              </div>
              <div className="metric-card-styled">
                <div className="card-icon-wrap">🏷️</div>
                <div className="card-data-block">
                  <span className="m-metric-label">Active Target Containers</span>
                  <span className="m-metric-val">{metrics?.unique_categories?.length ?? "0"}</span>
                </div>
              </div>
            </section>

            {/* SPLIT ENGINE INTERFACE LAYOUT */}
            <div className="dashboard-workspace-split">
              {/* LAYOUT SIDE A: GENERATOR FORM REGION */}
              <section className="panel-card-workspace">
                <div className="workspace-header-meta">
                  <h3>Feature Parameter Configuration</h3>
                  <p>Input system criteria to extract deterministic documentation models</p>
                </div>

                <div className="input-group-stack">
                  <label className="field-label-styled">Describe Architectural Scope</label>
                  <textarea
                    rows={7}
                    maxLength={1000}
                    value={prompt}
                    onChange={(event) => setPrompt(event.target.value)}
                    placeholder="Describe architecture components, token flows, endpoints, tables, or deployment environments..."
                  />
                  <div className="textarea-footer-metrics">
                    {error && <span className="inline-error-msg">{error}</span>}
                    <span className="char-indicator-badge">{charCount}</span>
                  </div>
                </div>

                <div className="input-group-stack">
                  <label className="field-label-styled">Select Execution Target Context</label>
                  <div className="category-interactive-grid">
                    {categories.map((item) => (
                      <button
                        key={item.value}
                        type="button"
                        className={`category-badge-card ${category === item.value ? "selected" : ""}`}
                        onClick={() => setCategory(item.value)}
                      >
                        <span className="badge-icon">{item.icon}</span>
                        <span className="badge-label">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="workspace-action-footrow">
                  <button className="primary-button flex-fill" onClick={handleGenerate} disabled={isLoading}>
                    {isLoading ? (
                      <span className="loading-spinner-layout">🔄 Synchronizing Matrix...</span>
                    ) : (
                      "Generate Master SassyDoc"
                    )}
                  </button>
                  <button className="outline-button" onClick={handleClear} type="button">
                    Reset Canvas
                  </button>
                </div>
              </section>

              {/* LAYOUT SIDE B: HIGH-CONTRAST DUAL TAB CANVAS VIEW */}
              <section className="panel-card-workspace preview-flex-layout">
                <div className="canvas-pill-tabs-header">
                  <div className="pill-switch-container">
                    <button 
                      className={`pill-tab-toggle ${activeTab === "technical" ? "active" : ""}`} 
                      onClick={() => setActiveTab("technical")}
                    >
                      Technical Specification
                    </button>
                    <button 
                      className={`pill-tab-toggle ${activeTab === "user" ? "active" : ""}`} 
                      onClick={() => setActiveTab("user")}
                    >
                      Functional User Manual
                    </button>
                  </div>
                </div>

                <div className="output-rendered-viewport">
                  {activeContent() ? (
                    <div className="markdown-prose-renderer">
                      {activeContent().split("\n").map((line, idx) => {
                        if (line.startsWith("###")) {
                          return <h3 key={idx} className="prose-h3">{line.replace("###", "").trim()}</h3>
                        }
                        if (line.startsWith("-")) {
                          return <li key={idx} className="prose-li">{line.replace("-", "").trim()}</li>
                        }
                        return <p key={idx} className="prose-p">{line}</p>
                      })}
                    </div>
                  ) : (
                    <div className="empty-preview-placeholder">
                      <span className="placeholder-large-icon">🔍</span>
                      <h4>No Documentation Rendered Yet</h4>
                      <p>Configure inputs and execute generation parameters to map content blueprints inside this viewport.</p>
                    </div>
                  )}
                </div>

                <div className="action-button-export-grid">
                  <button className="export-action-node primary-fill" onClick={downloadHtml} disabled={!activeContent()}>
                    <span className="exp-icon">📥</span> Download HTML
                  </button>
                  <button className="export-action-node outline-slate" onClick={() => copyToClipboard("Copied successfully to local system buffer!")} disabled={!activeContent()}>
                    <span className="exp-icon">📋</span> Copy
                  </button>
                  <button className="export-action-node outline-slate" onClick={shareWhatsApp} disabled={!activeContent()}>
                    <span className="exp-icon">💬</span> Share WhatsApp
                  </button>
                  <button className="export-action-node outline-slate" onClick={() => copyToClipboard("Formatted channel string ready for integration inside Teams.")} disabled={!activeContent()}>
                    <span className="exp-icon">👥</span> Share Teams
                  </button>
                </div>
              </section>
            </div>

            {/* AUDIT SYSTEM LOG LEDGER TERMINAL CONTAINER */}
            <section className="terminal-ledger-wrapper">
              <div className="terminal-header-top">
                <div className="terminal-decorations">
                  <span className="dot-dec red"></span>
                  <span className="dot-dec yellow"></span>
                  <span className="dot-dec green"></span>
                </div>
                <span className="terminal-title-text">Live Auditing Pipeline Ledger</span>
              </div>
              <div className="terminal-console-screen">
                {logs.length === 0 ? (
                  <div className="terminal-log-row empty-state">⚡ Local loop diagnostic channel synchronized... Pending execution hooks.</div>
                ) : (
                  logs.map((entry, idx) => (
                    <div key={idx} className="terminal-log-row animate-fade-in">
                      <span className="log-timestamp">[{new Date(entry.created_at).toLocaleTimeString()}]</span>
                      <span className="log-success-node">✔ [STABLE]</span>
                      <span className="log-body-stream">Action event parsed: <strong className="text-violet">{entry.action}</strong> ➔ {entry.detail}</span>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        )}
      </div>

      {toast && <div className="toast-notification-banner animate-slide-up">{toast}</div>}
    </div>
  )
}

export default App