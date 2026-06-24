import re
from typing import Dict


def generate_mock_documentation(user_input: str) -> Dict[str, str]:
    normalized = user_input.lower()
    mappings = [
        {
            "target": "auth",
            "keywords": [r"\bauth\b", r"\blogin\b", r"\bsecure\b", r"\buser\b"],
            "title": "Authentication & Authorization Engine",
            "technical": (
                "### Technical Blueprint: JWT & Stateless Session Management\n"
                "- Token Exchange: Stateless OAuth2 Bearer strings utilizing PyJWT signed with HS256 hashing keys.\n"
                "- Storage Rules: Micro-session objects mapped on stateless memory; tokens must sit inside secure, HttpOnly, SameSite=Strict cookies to eliminate XSS surface areas.\n"
                "- Context Guards: FastAPI dependency-injection gates (Depends(get_current_user)) validate token signatures before passing controls.\n"
            ),
            "user": (
                "### User Guide: Accessing Your Dashboard Safely\n"
                "- Signing In: Navigate to the login screen, enter your assigned credentials, and press Secure Login.\n"
                "- Session Duration: For your data protection, your digital session auto-expires after 30 minutes of inactivity.\n"
                "- Troubleshooting: If you see an 'Access Denied' flag, clear your browser cookies and try again.\n"
            ),
        },
        {
            "target": "database",
            "keywords": [r"\bdb\b", r"\bdatabase\b", r"\bsql\b", r"\bstore\b", r"\btables\b"],
            "title": "Relational Data Modeling & Access Layers",
            "technical": (
                "### Technical Blueprint: SQLite / PostgreSQL Schema Configuration\n"
                "- Engine Bindings: SQLAlchemy ORM Declarative base structures handling automatic thread session pools via context managers.\n"
                "- Optimization: Explicit foreign-key indexing on high-frequency reference columns; cascading deletions enforced at database cluster limits.\n"
                "- Migrations: Managed natively through Alembic versioning files tracking declarative schema changes.\n"
            ),
            "user": (
                "### User Guide: Managing System Data\n"
                "- Data Safety: The system automatically saves and backups your configurations in real time as you edit.\n"
                "- Searching Records: Use the central search field on the admin page to instantly scan through document categories.\n"
                "- Data Limits: Your personal dashboard can track up to 10,000 document generations simultaneously.\n"
            ),
        },
        {
            "target": "api",
            "keywords": [r"\bapi\b", r"\brouter\b", r"\bendpoints\b", r"\bjson\b", r"\brestful\b"],
            "title": "RESTful API Integration Layer",
            "technical": (
                "### Technical Blueprint: FastAPI Router & Pydantic v2 Gateway\n"
                "- Payload Verification: Pydantic schema engines validate inbound JSON bodies, throwing explicit 422 errors on typing mismatches.\n"
                "- Rate Limiting: IP-throttling middleware restricts endpoints to 60 requests per minute to preserve engine throughput.\n"
                "- Documentation: Structured schemas dynamically update OpenAPI definitions at the server /docs route.\n"
            ),
            "user": (
                "### User Guide: Connecting Third-Party Developer Tools\n"
                "- Developer Access: Software keys can be requested directly inside your account profile tab.\n"
                "- Interface Protocol: The tool processes data using clean JSON payloads, making integration with external systems effortless.\n"
                "- Error Signals: If a request fails, the application panel will flash a distinct red notice outlining the exact fix required.\n"
            ),
        },
        {
            "target": "docker",
            "keywords": [r"\bdocker\b", r"\bcontainer\b", r"\bcompose\b", r"\bwsl\b"],
            "title": "Containerization & Isolated Deployments",
            "technical": (
                "### Technical Blueprint: Multi-Stage Container Blueprints\n"
                "- Build Architecture: Base images utilize python-slim configurations; compilation steps utilize fast cached layer storage paths.\n"
                "- Runtime Security: Operational layers explicitly discard compilation dependencies and run tasks under non-root system users.\n"
                "- Volume Overlays: Development orchestrations deploy explicit host folder attachments to facilitate immediate code compilation hot-reloads.\n"
            ),
            "user": (
                "### User Guide: Running the App Anywhere\n"
                "- One-Click Run: Ensure your local Docker Desktop window is active, then click your startup launcher script.\n"
                "- Isolated Workspaces: The container ensures your system setup never interferes with other software running on your computer.\n"
                "- Updates: Pulling the latest changes from your team repository updates the configuration instantly.\n"
            ),
        },
    ]

    chosen = next(
        (entry for entry in mappings if any(re.search(pattern, normalized) for pattern in entry["keywords"])),
        None,
    )

    if not chosen:
        chosen = {
            "title": "General System Documentation Workspace",
            "technical": (
                "### Technical Blueprint: Generic Application Architecture Matrix\n"
                "- Pipeline Loop: Context streams are parsed using standard string regex utilities to determine functional categories.\n"
                "- State Management: Document states commit automatically to active session records with matching timestamps.\n"
                "- Formatting Protocols: Output structures convert raw markdown arrays to universal client strings.\n"
            ),
            "user": (
                "### User Guide: Working in Your Documentation Workspace\n"
                "- Creating Content: Drop a basic outline of your feature into the generator input box and tap Generate Documentation.\n"
                "- Exporting Files: Click the built-in action icons to download your finalized text as raw HTML or pristine PDF layouts.\n"
                "- Quick Distribution: Use the direct channel triggers to transmit documentation text to WhatsApp grids or Microsoft Teams threads instantly.\n"
            ),
        }

    return {
        "title": chosen["title"],
        "technical_output": chosen["technical"],
        "user_output": chosen["user"],
    }
