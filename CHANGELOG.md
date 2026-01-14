# Changelog

All notable changes to the TALA project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### To Be Implemented
- Database seeding automation
- Production authentication flow
- Rate limiting middleware
- API versioning strategy
- Automated integration tests

---

## [1.0.0] - 2026-01-14

### 🎉 Initial Release
First production-ready version of TALA multi-tenant accounting system with BIR compliance.

---

## [0.9.0] - 2026-01-14

### Added - Swagger/OpenAPI Documentation
- Interactive API documentation at `/api-docs` endpoint
- Swagger UI Express integration with OpenAPI 3.0.0 specification
- JSDoc annotations for automatic spec generation
- Documented endpoints: Health, Chart of Accounts, Reports
- Schema definitions for all API models (ChartOfAccount, JournalEntry, Reports)
- "Try it out" interactive testing feature
- OpenAPI JSON spec export at `/api-docs.json`
- User guide documentation in Docusaurus (`api-documentation.md`)

### Changed
- Updated API index route to include `/api-docs` endpoint reference
- Enhanced route documentation with comprehensive Swagger annotations
- Modified sidebar to include API Documentation in Technical section

---

## [0.8.0] - 2026-01-14

### Added - Documentation Infrastructure Fixes
- Created landing page (`index.md`) for Docusaurus site
- Added "Home" entry to sidebar navigation
- Comprehensive quick start guide on landing page

### Fixed
- Navigation text readability (light mode color scheme)
- Page Not Found errors on home link clicks
- Docusaurus navbar styling for better contrast
- Component Details section rendering in architecture overview
- Removed conflicting ASCII art from markdown files

### Changed
- Updated `custom.css` with proper light/dark mode colors
- Modified navbar configuration for better UX
- Improved sidebar organization with home link

---

## [0.7.0] - 2026-01-14

### Fixed - MDX Compilation Errors
- Fixed 5 critical MDX parsing errors across documentation files
- Resolved `Could not parse expression with acorn` error in `annex-c1-process-flow.md`
- Fixed JSX interpretation of angle brackets (`<5 minutes` → "Under 5 minutes")
- Corrected curly brace handling in diagram legends
- Fixed literal `\n` characters in Mermaid graph definitions
- Removed ASCII art diagrams conflicting with MDX parser

### Changed
- Converted inline JSON examples to descriptive text
- Replaced comparison operators with plain English ("Under" instead of "<")
- Wrapped diagram symbols in inline code blocks
- Fixed disaster-recovery.md flowchart syntax

---

## [0.6.0] - 2026-01-14

### Added - Development Authentication Bypass
- Implemented `DISABLE_AUTH=true` environment variable for development mode
- Added bypass logic in `TenantScope.ts` middleware (4 functions):
  - `verifyJWT()` - Injects dummy JWT payload
  - `validateTenantScope()` - Injects dev tenant context
  - `requirePermission()` - Skips permission checks
  - `validateTenantIdParam()` - Skips tenant ID validation
- Added bypass logic in `AuditLogger.ts` to prevent FK violations
- Dummy values: `userId: 'dev-user'`, `tenantId: 'dev-tenant'`

### Changed
- Updated `docker-compose.yml` with `DISABLE_AUTH` environment variable
- Modified API routes to work without real authentication in dev mode

### Security
- ⚠️ Authentication bypass only for development - must disable in production

---

## [0.5.0] - 2026-01-14

### Fixed - Docker Service Health Issues

#### Web Service (Port 3000)
- Fixed "Connection Refused" error
- Created missing Next.js app directory structure
- Added `app/layout.tsx` with root layout
- Added `app/page.tsx` with home page

#### Docs Service (Port 3002)
- Fixed "Empty Response" error
- Changed invalid `--hostname` flag to `--host 0.0.0.0`
- Removed duplicate theme declaration in `docusaurus.config.js`
- Fixed `prism-react-renderer` import for v2.3.0

#### pgAdmin Service (Port 5050)
- Fixed container restart loop
- Changed invalid email from `admin@tala.local` to `admin@example.com`

#### API Service (Port 3001)
- Fixed health route duplicate path issue
- Restructured `health.ts` router exports
- Fixed `accounting-cached.ts` import statement (named import for AuditLogger)

### Changed
- All 6 Docker services now healthy and accessible
- Updated Dockerfile entrypoints for proper service startup

---

## [0.4.0] - 2026-01-14

### Added - Mermaid Diagram Visualizations
- Created ERD diagram for tenant isolation (18-table schema)
- Created BIR Annex C-1 process flow with 6 security gates
- Created transaction lifecycle diagrams (state + sequence)
- Converted architecture overview from ASCII to Mermaid (2 diagrams)
- Converted Redis caching overview from ASCII to Mermaid (3 diagrams)
- Converted RBAC implementation guide diagrams (2 diagrams)
- Created comprehensive Annex B functional checklist with 3 diagrams

### Changed
- Replaced ASCII diagrams with interactive Mermaid visualizations
- Enhanced diagram aesthetics with color coding
- Added hover tooltips and zoom capabilities

### Documentation
- 15+ new Mermaid diagrams across 7 files
- Interactive diagram features enabled
- Color-coded components by function

---

## [0.3.0] - 2026-01-14

### Added - Documentation Structure
- Migrated 21+ markdown files into Docusaurus
- Organized documentation into 4 categories:
  - Compliance (BIR) - 3 files
  - Technical - 11 files
  - Caching & Performance - 9 files
  - Operations - 1 file
- Created comprehensive sidebar navigation
- Added cross-references between documentation pages

### Changed
- Consolidated scattered markdown files into single docs site
- Updated file paths and internal links
- Improved documentation discoverability

---

## [0.2.0] - 2026-01-14

### Added - Docusaurus Integration
- Installed Docusaurus 3.2.1 with Mermaid support
- Added `@docusaurus/theme-mermaid` for diagram rendering
- Created custom indigo/zinc color theme
- Configured Mermaid markdown support

### Configuration
- Created `docusaurus.config.js` with full configuration
- Created `sidebars.js` with category structure
- Created `custom.css` with branded color scheme
- Set up docs-as-code architecture

---

## [0.1.0] - 2026-01-14

### Added - Initial Project Setup
- Multi-tenant accounting system architecture
- Express.js API with TypeScript
- Next.js 14 frontend (basic structure)
- PostgreSQL 15 database with Prisma ORM
- Redis 7 for caching
- Docker Compose orchestration (6 services)
- 18-table database schema with tenant isolation
- RBAC middleware with 10+ permissions
- Cryptographic audit logging with SHA-256 hash chain
- Double-entry accounting validation
- BIR Form 2307 support
- Financial report endpoints with Redis caching
- Health check and readiness probes

### Packages Created
- `@tala/api` - Express.js backend
- `@tala/web` - Next.js frontend
- `@tala/database` - Prisma schema and client
- `@tala/audit` - Audit logger with hash chain
- `@tala/auth` - TenantScope middleware + RBAC
- `@tala/shared` - Security utilities
- `@tala/cache` - Redis service wrapper

### Infrastructure
- Docker Compose with 6 services
- PostgreSQL with persistent volume
- Redis with optimized configuration
- pgAdmin for database management
- Multi-stage Docker builds
- Development entrypoint scripts

---

## Versioning Strategy

### Major Version (X.0.0)
- Breaking API changes
- Database schema breaking changes
- Major architecture refactoring
- Removal of deprecated features

### Minor Version (0.X.0)
- New features (backwards compatible)
- New API endpoints
- New documentation sections
- Performance improvements
- Non-breaking enhancements

### Patch Version (0.0.X)
- Bug fixes
- Documentation typos
- Security patches
- Dependency updates
- Configuration tweaks

---

## Version Tags

```bash
# Tag a new version
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0

# List all versions
git tag -l

# View version details
git show v1.0.0
```

---

## Links

- **Repository**: (Add your Git repository URL)
- **Documentation**: http://localhost:3002
- **API Documentation**: http://localhost:3001/api-docs
- **Issue Tracker**: (Add issue tracker URL)

---

[Unreleased]: https://github.com/your-org/tala/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/your-org/tala/releases/tag/v1.0.0
[0.9.0]: https://github.com/your-org/tala/releases/tag/v0.9.0
[0.8.0]: https://github.com/your-org/tala/releases/tag/v0.8.0
[0.7.0]: https://github.com/your-org/tala/releases/tag/v0.7.0
[0.6.0]: https://github.com/your-org/tala/releases/tag/v0.6.0
[0.5.0]: https://github.com/your-org/tala/releases/tag/v0.5.0
[0.4.0]: https://github.com/your-org/tala/releases/tag/v0.4.0
[0.3.0]: https://github.com/your-org/tala/releases/tag/v0.3.0
[0.2.0]: https://github.com/your-org/tala/releases/tag/v0.2.0
[0.1.0]: https://github.com/your-org/tala/releases/tag/v0.1.0
