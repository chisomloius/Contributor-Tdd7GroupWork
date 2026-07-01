import re
from typing import Dict

def generate_mock_documentation(user_input: str, selected_category: str = "general_system") -> Dict[str, str]:
    normalized = user_input.lower()
    
    mappings = [
        {
            "target": "authentication",
            "keywords": [r"\bauth\b", r"\blogin\b", r"\bsecure\b", r"\buser\b", r"\bjwt\b"],
            "title": "Authentication & Authorization Engine",
            "technical": "### Technical Blueprint: JWT & Stateless Session Management\n- **Token Exchange:** Stateless OAuth2 Bearer strings utilizing `PyJWT` signed with HS256 hashing keys.\n- **Storage Rules:** Micro-session objects mapped on stateless memory; tokens sit inside secure, HttpOnly, SameSite=Strict cookies.\n- **Context Guards:** FastAPI dependency-injection gates (`Depends(get_current_user)`) validate token signatures.",
            "user": "### User Guide: Accessing Your Dashboard Safely\n- **Signing In:** Navigate to the login screen, enter your assigned credentials, and press **Secure Login**.\n- **Session Duration:** For your data protection, your digital session auto-expires after 30 minutes of inactivity."
        },
        {
            "target": "database_layers",
            "keywords": [r"\bdb\b", r"\bdatabase\b", r"\bsql\b", r"\bstore\b", r"\btables\b", r"\bpostgres\b"],
            "title": "Relational Data Modeling & Access Layers",
            "technical": "### Technical Blueprint: SQLAlchemy ORM Configuration\n- **Engine Bindings:** Declarative base structures handling automatic thread session pools via context managers.\n- **Optimization:** Explicit foreign-key indexing on high-frequency reference columns; cascading deletions enforced at database boundaries.\n- **Migrations:** Managed natively through Alembic versioning files tracking declarative schema changes.",
            "user": "### User Guide: Managing System Data\n- **Data Safety:** The system automatically saves and backups your configurations in real time as you edit.\n- **Searching Records:** Use the central search field on the workspace page to instantly scan through document records."
        },
        {
            "target": "api_endpoints",
            "keywords": [r"\bapi\b", r"\brouter\b", r"\bendpoint\b", r"\bjson\b", r"\brestful\b", r"\bfastapi\b"],
            "title": "RESTful API Integration Layer",
            "technical": "### Technical Blueprint: FastAPI Router & Pydantic v2 Gateway\n- **Payload Verification:** Pydantic schema engines validate inbound JSON bodies, throwing explicit 422 errors on typing mismatches.\n- **Rate Limiting:** IP-throttling middleware restricts endpoints to 60 requests per minute to preserve engine throughput.\n- **Documentation:** Structured schemas dynamically update OpenAPI definitions at the server `/docs` route.",
            "user": "### User Guide: Connecting Third-Party Developer Tools\n- **Developer Access:** Software keys can be requested directly inside your account profile tab.\n- **Interface Protocol:** The tool processes data using clean JSON payloads, making integration with external systems effortless."
        },
        {
            "target": "containerization",
            "keywords": [r"\bdocker\b", r"\bcontainer\b", r"\bcompose\b", r"\bwsl\b"],
            "title": "Containerization & Isolated Deployments",
            "technical": "### Technical Blueprint: Multi-Stage Container Blueprints\n- **Build Architecture:** Base images utilize python-slim configurations; compilation steps utilize fast cached layer storage paths.\n- **Runtime Security:** Operational layers explicitly discard compilation dependencies and run tasks under non-root system users.\n- **Volume Overlays:** Development orchestrations deploy explicit host folder attachments to facilitate immediate hot-reloads.",
            "user": "### User Guide: Running the App Anywhere\n- **One-Click Run:** Ensure your local Docker Desktop window is active, then click your startup launcher script.\n- **Isolated Workspaces:** The container ensures your system setup never interferes with other software running on your computer."
        },
        {
            "target": "azure_infrastructure",
            "keywords": [r"\bazure\b", r"\bcloud\b", r"\bwebapp\b", r"\bcosmos\b"],
            "title": "Azure Cloud Infrastructure & Architecture Services",
            "technical": "### Technical Blueprint: Azure App Service & Cloud Engine Topology\n- **Deployment Targets:** Production runtimes resolve directly to Linux-based Azure WebApps using asynchronous system configurations.\n- **Storage Nodes:** Configuration streams bind dynamically to Azure CosmosDB containers utilizing isolated connection routing keys.\n- **VNet Isolation:** Core components execute completely inside managed private network perimeters.",
            "user": "### User Guide: Cloud Environments Infrastructure Monitor\n- **Deployment Automation:** Updates pull automatically from the main repository branch straight to active cloud slots.\n- **System Up-Time:** Architecture instances scale dynamically across global zones to safeguard asset availability."
        },
        {
            "target": "security_compliance",
            "keywords": [r"\bsecurity\b", r"\bencryption\b", r"\bcompliance\b", r"\bcors\b", r"\bhash\b"],
            "title": "Security & Encryption Compliance Metrics",
            "technical": "### Technical Blueprint: Advanced Vault Encryption Operations\n- **Data Masking:** Sensitive string payloads are encoded utilizing salted cryptographic schemes prior to transaction hooks.\n- **CORS Policies:** Middleware configurations strictly isolate cross-origin requests to trusted production origins.\n- **Audit Trails:** Every internal document event generates a high-fidelity audit trail mapping user parameters.",
            "user": "### User Guide: Data Security Protections\n- **Information Guardrails:** System layers protect private workspaces by denying unauthorized token access.\n- **Compliance Checks:** Application code logic follows clean handling patterns to comply with active data security requirements."
        },
        {
            "target": "cicd_pipelines",
            "keywords": [r"\bcicd\b", r"\bpipeline\b", r"\bworkflow\b", r"\bgithub actions\b"],
            "title": "CI/CD Deployment Pipelines & Automatic Workflows",
            "technical": "### Technical Blueprint: Automated Integration Run Loops\n- **Lint Testing:** Pull requests trigger automatic syntax verification jobs checking code compliance flags.\n- **Build Artifacts:** Compilation workers package verified source directories cleanly into lightweight production layers.\n- **Release Management:** Successful master updates distribute straight to development clusters without active down-time.",
            "user": "### User Guide: Tracking Automated Releases\n- **Status Notifications:** System delivery progress streams dashboard notices as code transitions complete.\n- **Version Control:** Changes are versioned sequentially, allowing team administrators to execute rollbacks easily."
        },
        {
            "target": "data_engineering",
            "keywords": [r"\bdata engineering\b", r"\bpipeline\b", r"\betl\b", r"\bstream\b", r"\bparquet\b"],
            "title": "Data Engineering & Analytical Pipeline Layers",
            "technical": "### Technical Blueprint: ETL Batch Stream Architecture\n- **Parsing Engine:** Raw incoming data strings convert seamlessly into columnar Parquet files via asynchronous pipeline blocks.\n- **State Aggregation:** Buffer records group into daily partitions to expedite downstream analytical queries.\n- **Memory Throttling:** Buffer chunks utilize iterative generators to secure standard compute limits.",
            "user": "### User Guide: Processing Analytical Data Sets\n- **Data Operations:** System workflows compute batch information automatically in background execution layers.\n- **Historical Summaries:** Analytical telemetry counters aggregate live operational indicators into the master tracking board."
        },
        {
            "target": "automated_testing",
            "keywords": [r"\btesting\b", r"\bpytest\b", r"\bunit test\b", r"\bmock\b"],
            "title": "Automated Testing Suites & Coverage Metrics",
            "technical": "### Technical Blueprint: Isolated PyTest Assert Environments\n- **Mock Interfaces:** External service components are completely simulated via decoupled test fixtures.\n- **Coverage Goals:** Operational route handlers track statements closely to satisfy a 90% verification threshold.\n- **Database Rollbacks:** Transaction layers initiate testing scopes inside sandbox files that clear on task completion.",
            "user": "### User Guide: Running System System Verifications\n- **Automated Validation:** Test parameters execute silently during builds to shield user layouts from code faults.\n- **Error Reports:** Troubleshooting monitors map logic failures explicitly to isolate layout issues quickly."
        }
    ]
    
    # Check if input matches any entry keywords
    chosen = next(
        (entry for entry in mappings if any(re.search(pattern, normalized) for pattern in entry["keywords"])),
        None
    )
    
    # Fallback to selected category value or default if keyword check misses
    if not chosen:
        target_cat = selected_category if selected_category in [m["target"] for m in mappings] else "general_system"
        chosen = next((m for m in mappings if m["target"] == target_cat), None)

    if not chosen: # Ultimate generic fallback
        chosen = {
            "title": "General System Documentation Workspace",
            "technical": "### Technical Blueprint: Generic Application Architecture Matrix\n- **Pipeline Loop:** Context streams are parsed using standard string regex utilities to determine functional categories.\n- **State Management:** Document states commit automatically to active session records with matching timestamps.",
            "user": "### User Guide: Working in Your Documentation Workspace\n- **Creating Content:** Drop a basic outline of your feature into the generator input box and tap **Generate Documentation**."
        }

    return {
        "title": chosen["title"],
        "technical_output": chosen["technical"],
        "user_output": chosen["user"],
    }