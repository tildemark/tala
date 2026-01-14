# 🐳 TALA Docker Deployment Guide

Complete guide for running TALA in Docker containers with orchestration.

---

## 📋 Table of Contents

- [Architecture Overview](#architecture-overview)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Services](#services)
- [Configuration](#configuration)
- [Development Workflow](#development-workflow)
- [Production Deployment](#production-deployment)
- [Troubleshooting](#troubleshooting)

---

## 🏗️ Architecture Overview

The TALA system is containerized into 5 services:

```
┌─────────────────────────────────────────────────────┐
│              Docker Network: tala-network           │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│  │  tala-web    │─────▶│  tala-api    │      │  tala-docs   │
│  │  Next.js     │      │  Express.js  │      │  Docusaurus  │
│  │  Port: 3000  │      │  Port: 3001  │      │  Port: 3002  │
│  └──────────────┘      └───────┬──────┘      └──────────────┘
│                                 │
│                                 ▼
│  ┌──────────────┐      ┌──────────────┐           │
│  │tala-pgadmin  │─────▶│   tala-db    │           │
│  │  pgAdmin 4   │      │ PostgreSQL15 │           │
│  │  Port: 5050  │      │  Port: 5432  │           │
│  └──────────────┘      └──────────────┘           │
│                                                     │
└─────────────────────────────────────────────────────┘

Volumes:
- tala-db-data (PostgreSQL persistent storage)
- tala-pgadmin-data (pgAdmin settings)
```

---

## ✅ Prerequisites

### Required Software

1. **Docker Desktop** (Windows/Mac) or **Docker Engine** (Linux)
   - Version 20.10.0 or higher
   - Download: https://docs.docker.com/get-docker/

2. **Docker Compose**
   - Version 2.0.0 or higher
   - Usually included with Docker Desktop

### Verify Installation

```powershell
# Check Docker version
docker --version
# Output: Docker version 24.0.0 or higher

# Check Docker Compose version
docker compose version
# Output: Docker Compose version v2.0.0 or higher

# Verify Docker is running
docker ps
# Should show empty list if no containers running
```

---

## 🚀 Quick Start

### 1. Clone and Configure

```powershell
# Navigate to TALA directory
cd c:\code\tala

# Copy Docker environment template
cp .env.docker .env

# Edit environment variables (optional)
notepad .env
```

### 2. Build and Start All Services

```powershell
# Build images and start all services
docker compose up -d

# Or build without cache (fresh build)
docker compose build --no-cache
docker compose up -d
```

### 3. Verify Services

```powershell
# Check running containers
docker compose ps

# Should show 5 services:
# - tala-db (healthy)
# - tala-api (healthy)
# - tala-web (healthy)
# - tala-docs (healthy)
# - tala-pgadmin (healthy)
```

### 4. Access Services

- **Web Application**: http://localhost:3000
- **API Server**: http://localhost:3001
- **Docs (Docusaurus)**: http://localhost:3002
- **pgAdmin**: http://localhost:5050
  - Email: `admin@tala.local`
  - Password: `admin`

---

## 🔧 Services

### tala-db (PostgreSQL 15)

**Purpose**: Primary database server with persistent storage

**Features**:
- PostgreSQL 15 Alpine (lightweight)
- Persistent volume: `tala-db-data`
- Health checks every 10s
- Automatic initialization with extensions (uuid-ossp, pg_trgm)

**Environment Variables**:
```env
POSTGRES_DB=tala_db
POSTGRES_USER=tala_user
POSTGRES_PASSWORD=tala_password_change_in_production
```

**Commands**:
```powershell
# View database logs
docker compose logs -f tala-db

# Connect to database
docker compose exec tala-db psql -U tala_user -d tala_db

# Backup database
docker compose exec tala-db pg_dump -U tala_user tala_db > backup.sql

# Restore database
docker compose exec -T tala-db psql -U tala_user tala_db < backup.sql
```

---

### tala-api (Express.js Backend)

**Purpose**: REST API server with Prisma ORM

**Features**:
- Express.js 4.22
- Automatic Prisma migrations on startup
- Database seeding with default data
- Hot reload in development (volume mounted)
- Health check endpoint: `/health`

**Environment Variables**:
```env
DATABASE_URL=postgresql://tala_user:password@tala-db:5432/tala_db
JWT_SECRET=your-secret-key
ENCRYPTION_KEY=32-character-key
API_PORT=3001
```

**Commands**:
```powershell
# View API logs
docker compose logs -f tala-api

# Restart API
docker compose restart tala-api

# Run Prisma commands
docker compose exec tala-api npx prisma studio
docker compose exec tala-api npx prisma migrate dev

# Access API shell

### tala-docs (Docusaurus Docs-as-Code)

**Purpose**: Serve technical and BIR compliance documentation (Annex B, Annex C-1, DR/Backup)

**Features**:
- Docusaurus 3 with Indigo/Zinc professional theme
- Docs-as-code under `apps/docs/docs`
- Hot reload in development via volume mount

**Environment Variables**:
```env
NODE_ENV=development
DOCS_PORT=3002
```

**Commands**:
```powershell
# View docs logs
docker compose logs -f tala-docs

# Restart docs
docker compose restart tala-docs

# Access docs shell
docker compose exec tala-docs sh
```

---
docker compose exec tala-api sh
```

---

### tala-web (Next.js Frontend)

**Purpose**: React-based web interface

**Features**:
- Next.js 14 with App Router
- Tailwind CSS styling
- Hot reload in development
- Optimized production builds

**Environment Variables**:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NODE_ENV=development
WEB_PORT=3000
```

**Commands**:
```powershell
# View web logs
docker compose logs -f tala-web

# Restart web server
docker compose restart tala-web

# Rebuild Next.js cache
docker compose exec tala-web rm -rf .next
docker compose restart tala-web

# Access web shell
docker compose exec tala-web sh
```

---

### tala-docs (Docusaurus Docs-as-Code)

**Purpose**: Serve technical and BIR compliance documentation (Annex B, Annex C-1, DR/Backup)

**Features**:
- Docusaurus 3 with Indigo/Zinc professional theme
- Docs-as-code under `apps/docs/docs`
- Hot reload in development via volume mount

**Environment Variables**:
```env
NODE_ENV=development
DOCS_PORT=3002
```

**Commands**:
```powershell
# View docs logs
docker compose logs -f tala-docs

# Restart docs
docker compose restart tala-docs

# Access docs shell
docker compose exec tala-docs sh
```

---

### tala-pgadmin (pgAdmin 4)

**Purpose**: Visual database management tool

**Features**:
- Web-based PostgreSQL admin interface
- Pre-configured TALA database connection
- Persistent settings storage

**Access**:
- URL: http://localhost:5050
- Email: `admin@tala.local`
- Password: `admin`

**Pre-configured Server**:
- Name: TALA Database
- Host: tala-db
- Port: 5432
- Username: tala_user
- Database: tala_db

**Commands**:
```powershell
# View pgAdmin logs
docker compose logs -f tala-pgadmin

# Reset pgAdmin data
docker compose down
docker volume rm tala-pgadmin-data
docker compose up -d tala-pgadmin
```

---

## ⚙️ Configuration

### Environment Variables

The `.env` file controls all service configurations:

```env
# Database
DB_NAME=tala_db
DB_USER=tala_user
DB_PASSWORD=strong_password_here

# API
JWT_SECRET=long-random-string-minimum-32-chars
ENCRYPTION_KEY=exactly-32-characters-key-here!!!

# Ports (change if conflicts)
DB_PORT=5432
API_PORT=3001
WEB_PORT=3000
DOCS_PORT=3002
PGADMIN_PORT=5050
```

### Port Conflicts

If default ports are in use:

```env
# Change ports in .env
DB_PORT=5433
API_PORT=3002
WEB_PORT=3100
DOCS_PORT=3102
PGADMIN_PORT=5051
```

Then restart:
```powershell
docker compose down
docker compose up -d
```

---

## 💻 Development Workflow

### Starting Development

```powershell
# Start all services
docker compose up -d

# Watch logs from all services
docker compose logs -f

# Watch specific service
docker compose logs -f tala-api
```

### Making Code Changes

**Hot Reload Enabled** - Changes are automatically detected:

1. Edit files in `apps/api/src`, `apps/web/src`, or `apps/docs`
2. Changes reflect automatically (no rebuild needed) for dev targets
3. Check logs for compilation status per service

### Running Database Commands

```powershell
# Create migration
docker compose exec tala-api npx prisma migrate dev --name add_new_field

# View database in Prisma Studio (http://localhost:5555)
docker compose exec tala-api npx prisma studio

# Seed database
docker compose exec tala-api npm run seed --workspace=@tala/database
```

### Debugging

```powershell
# Access container shell
docker compose exec tala-api sh

# Check environment variables
docker compose exec tala-api env

# Check network connectivity
docker compose exec tala-api ping tala-db

# View container resource usage
docker stats
```

### Stopping Services

```powershell
# Stop all services (keep data)
docker compose stop

# Stop and remove containers (keep data)
docker compose down

# Stop and remove everything (including volumes)
docker compose down -v
```

---

## 🚀 Production Deployment

### Build Production Images

```powershell
# Build production images
docker compose -f docker-compose.prod.yml build

# Or specify target stage
docker compose build --target production
```

### Production Environment

Create `.env.production`:

```env
NODE_ENV=production

# Strong passwords
DB_PASSWORD=use-strong-random-password
JWT_SECRET=use-long-random-string-minimum-64-characters
ENCRYPTION_KEY=use-32-character-strong-random-key!

# Production database
DATABASE_URL=postgresql://tala_user:password@tala-db:5432/tala_db

# API URL (use actual domain)
NEXT_PUBLIC_API_URL=https://api.yourdomain.com

# Disable telemetry
NEXT_TELEMETRY_DISABLED=1
```

### Deploy to Production

```powershell
# Load production environment
docker compose --env-file .env.production up -d

# Run database migrations (not push)
docker compose exec tala-api npx prisma migrate deploy

# Check health
docker compose ps
```

### Security Checklist

- [ ] Change all default passwords
- [ ] Use strong JWT secret (64+ characters)
- [ ] Use secure ENCRYPTION_KEY (32 characters)
- [ ] Enable HTTPS with reverse proxy (nginx/traefik)
- [ ] Configure firewall rules
- [ ] Set up backup schedule
- [ ] Enable Docker secrets instead of .env
- [ ] Use read-only file systems where possible
- [ ] Scan images for vulnerabilities: `docker scan tala-api`

---

## 🐛 Troubleshooting

### Service Won't Start

```powershell
# Check logs
docker compose logs tala-api

# Common issues:
# 1. Port conflict - change port in .env
# 2. Database not ready - wait for health check
# 3. Missing environment variables - check .env file
```

### Database Connection Failed

```powershell
# Verify database is healthy
docker compose ps tala-db

# Check database logs
docker compose logs tala-db

# Test connection manually
docker compose exec tala-db psql -U tala_user -d tala_db -c "SELECT 1"

# Verify DATABASE_URL in API
docker compose exec tala-api env | grep DATABASE_URL
```

### Prisma Migration Failed

```powershell
# Reset database (⚠️ destroys data)
docker compose exec tala-api npx prisma migrate reset

# Force push schema (development only)
docker compose exec tala-api npx prisma db push --accept-data-loss

# Check migration status
docker compose exec tala-api npx prisma migrate status
```

### Container Keeps Restarting

```powershell
# Check exit code
docker compose ps

# View last 100 log lines
docker compose logs --tail=100 tala-api

# Inspect container
docker inspect tala-api
```

### Out of Disk Space

```powershell
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# See disk usage
docker system df
```

### Network Issues

```powershell
# Verify network exists
docker network ls | findstr tala-network

# Inspect network
docker network inspect tala-network

# Restart networking
docker compose down
docker compose up -d
```

### Performance Issues

```powershell
# Check resource usage
docker stats

# Increase Docker memory limit (Docker Desktop → Settings → Resources)

# View container processes
docker compose top
```

---

## 📚 Additional Commands

### Backup & Restore

```powershell
# Real-time logs
docker compose logs -f --tail=100

# Resource monitoring
docker stats

# Inspect health checks
docker inspect tala-api | findstr Health
```

---

## 🔗 Quick Reference

| Service | URL | Credentials |
|---------|-----|-------------|
| Web App | http://localhost:3000 | - |
| API | http://localhost:3001 | JWT Token |
| pgAdmin | http://localhost:5050 | admin@tala.local / admin |
| Database | localhost:5432 | tala_user / tala_password |

---

## ✅ Next Steps

1. ✅ Docker services running
2. → Access http://localhost:3000
3. → Create first tenant
4. → Configure audit logging
5. → Test API endpoints
6. → Review pgAdmin interface

---

**Docker setup complete!** 🎉

For development guidance, see [README.md](README.md)  
For implementation details, see [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md)
