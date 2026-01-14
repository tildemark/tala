# TALA Documentation

> **TALA** — Multi-tenant accounting system with BIR compliance, cryptographic audit trails, and role-based access control.

## 📚 Documentation Overview

This documentation covers the complete architecture, implementation, and compliance aspects of the TALA accounting system.

### Quick Navigation

#### 🏛️ Compliance (BIR)
Documentation for Philippine Bureau of Internal Revenue (BIR) compliance requirements.

- **[Annex C-1: Process Flow](compliance/annex-c1-process-flow.md)** — Transaction workflow with security gates
- **[Annex B: Functional Checklist](compliance/annex-b-functional-checklist.md)** — 52 BIR requirements tracking
- **[Disaster Recovery](compliance/disaster-recovery.md)** — Backup procedures and RPO/RTO targets

#### 🔧 Technical Documentation
Architecture, setup guides, and technical implementation details.

- **[Architecture Overview](technical/architecture-overview.md)** — System design and components
- **[ERD: Tenant Isolation](technical/erd-tenant-isolation.md)** — 18-table database schema
- **[Transaction Lifecycle](technical/transaction-lifecycle.md)** — State diagrams and workflows
- **[Setup Guide](technical/setup-guide.md)** — Installation and configuration
- **[Docker Guide](technical/docker-guide.md)** — Container orchestration

#### 🚀 Caching & Performance
Redis integration and performance optimization.

- **[Redis Caching Overview](caching/redis-caching-overview.md)** — Cache strategy and architecture
- **[Caching Guide](caching/redis-caching-guide.md)** — Implementation details
- **[Quick Reference](caching/redis-caching-quick-reference.md)** — Common patterns and commands

#### 🔄 Operations
Deployment, testing, and operational procedures.

- **[Redis Deployment Tests](operations/redis-deployment-test-results.md)** — Test results and validation

---

## 🎯 Key Features

### Multi-Tenancy
- Complete tenant isolation with tenant_id foreign keys
- Middleware-enforced access control
- Shared infrastructure with logical separation

### Security
- JWT authentication with refresh tokens
- Role-based access control (RBAC) with 10+ permissions
- Cryptographic audit chain with SHA-256 hashing
- Data encryption and masking for sensitive fields

### Compliance
- Immutable audit trails
- Double-entry accounting validation
- BIR Form 2307 support
- Disaster recovery procedures

### Performance
- Redis caching for financial reports
- Cache-aside pattern with tenant prefixing
- Sub-second response times for cached queries

---

## 🛠️ Technology Stack

- **Backend**: Express.js, TypeScript, Prisma ORM
- **Database**: PostgreSQL 15 (18 tables)
- **Cache**: Redis 7
- **Frontend**: Next.js 14 (in progress)
- **Docs**: Docusaurus 3 with Mermaid diagrams
- **Infrastructure**: Docker Compose

---

## 🚀 Quick Start

```bash
# Clone and install
git clone https://github.com/your-org/tala
cd tala
pnpm install

# Start all services
docker compose up -d

# Access services
# API: http://localhost:3001
# Web: http://localhost:3000
# Docs: http://localhost:3002
# pgAdmin: http://localhost:5050
```

---

## 📖 Documentation Structure

This documentation is organized into four main categories accessible via the sidebar:

1. **Compliance (BIR)** — Philippine regulatory requirements and evidence
2. **Technical** — Architecture, schemas, and implementation guides
3. **Caching & Performance** — Redis integration and optimization
4. **Operations** — Deployment, testing, and maintenance

Use the sidebar navigation to explore specific topics, or search using the search bar (Ctrl+K).

---

**Last Updated**: 2026-01-14  
**Version**: 1.0.0  
**Maintained by**: TALA Development Team
