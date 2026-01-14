# 🐳 Docker Quick Reference

One-page cheat sheet for TALA Docker operations.

---

## 🚀 Getting Started

```powershell
# Start everything
docker compose up -d

# View logs
docker compose logs -f

# Stop everything
docker compose down
```

---

## 📦 Service URLs

| Service | URL | Credentials |
|---------|-----|-------------|
| **Web App** | http://localhost:3000 | - |
| **Documentation** | http://localhost:3002 | - |
| **API** | http://localhost:3001 | JWT Token |
| **pgAdmin** | http://localhost:5050 | admin@example.com / admin |
| **Database** | localhost:5432 | tala_user / tala_password |

---

## 🔧 Common Commands

### Container Management
```powershell
# Start all services
docker compose up -d

# Stop all services
docker compose stop

# Restart specific service
docker compose restart tala-api

# View running containers
docker compose ps

# View logs (all services)
docker compose logs -f

# View logs (specific service)
docker compose logs -f tala-api

# Remove all containers (keeps data)
docker compose down

# Remove containers and volumes (⚠️ destroys data)
docker compose down -v
```

### Database Operations
```powershell
# Connect to database
docker compose exec tala-db psql -U tala_user -d tala_db

# Run SQL query
docker compose exec tala-db psql -U tala_user -d tala_db -c "SELECT * FROM \"Tenant\""

# Backup database
docker compose exec tala-db pg_dump -U tala_user tala_db > backup.sql

# Restore database
docker compose exec -T tala-db psql -U tala_user tala_db < backup.sql

# View database logs
docker compose logs -f tala-db
```

### Prisma Commands
```powershell
# Generate Prisma client
docker compose exec tala-api npx prisma generate

# Run migrations
docker compose exec tala-api npx prisma migrate dev

# Push schema (development)
docker compose exec tala-api npx prisma db push

# Seed database
docker compose exec tala-api npm run seed --workspace=@tala/database

# Open Prisma Studio
docker compose exec tala-api npx prisma studio
# Access: http://localhost:5555

# View migration status
docker compose exec tala-api npx prisma migrate status
```

### API Operations
```powershell
# Access API shell
docker compose exec tala-api sh

# Check API health
curl http://localhost:3001/health

# View API environment
docker compose exec tala-api env

# Restart API
docker compose restart tala-api

# View API logs
docker compose logs -f tala-api
```

### Web Operations
```powershell
# Access web shell
docker compose exec tala-web sh

# Clear Next.js cache
docker compose exec tala-web rm -rf .next
docker compose restart tala-web

# View web logs
docker compose logs -f tala-web

# Restart web
docker compose restart tala-web
```

---

## 🛠️ Development Workflow

### Daily Startup
```powershell
cd c:\code\tala
docker compose up -d
docker compose logs -f
```

### Making Code Changes
- Edit files in `apps/api/src` or `apps/web/src`
- Changes auto-reload (no restart needed)
- Check logs for compilation status

### Database Schema Changes
```powershell
# 1. Edit prisma/schema.prisma
# 2. Push changes
docker compose exec tala-api npx prisma db push

# Or create migration
docker compose exec tala-api npx prisma migrate dev --name your_migration_name
```

### Daily Shutdown
```powershell
# Stop (keeps data)
docker compose stop

# Or stop and remove containers (keeps data)
docker compose down
```

---

## 🐛 Troubleshooting

### Service Won't Start
```powershell
# Check logs
docker compose logs tala-api

# Check status
docker compose ps

# Rebuild and restart
docker compose build tala-api
docker compose up -d tala-api
```

### Database Connection Issues
```powershell
# Verify database is healthy
docker compose ps tala-db

# Test connection
docker compose exec tala-db psql -U tala_user -d tala_db -c "SELECT 1"

# Check DATABASE_URL
docker compose exec tala-api env | grep DATABASE_URL
```

### Port Conflicts
Edit `.env`:
```env
DB_PORT=5433
API_PORT=3002
WEB_PORT=3100
PGADMIN_PORT=5051
```

Then restart:
```powershell
docker compose down
docker compose up -d
```

### Container Keeps Restarting
```powershell
# View exit reason
docker compose logs --tail=50 tala-api

# Check health status
docker inspect tala-api | findstr Health
```

### Out of Disk Space
```powershell
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Check disk usage
docker system df

# Full cleanup (⚠️ affects all Docker projects)
docker system prune -a --volumes
```

---

## 🔒 Production Checklist

Before deploying to production:

- [ ] Change all default passwords in `.env`
- [ ] Use strong JWT_SECRET (64+ characters)
- [ ] Use secure ENCRYPTION_KEY (32 characters)
- [ ] Set `NODE_ENV=production`
- [ ] Enable HTTPS with reverse proxy
- [ ] Configure backup schedule
- [ ] Set up monitoring/alerting
- [ ] Scan images: `docker scan tala-api`
- [ ] Use Docker secrets instead of .env
- [ ] Review security settings

---

## 📊 Monitoring

```powershell
# Real-time resource usage
docker stats

# Container processes
docker compose top

# Inspect container
docker inspect tala-api

# Check health
docker compose ps
```

---

## 💾 Backup & Restore

### Database Backup
```powershell
# Full backup
docker compose exec tala-db pg_dump -U tala_user tala_db > tala_backup_$(Get-Date -Format 'yyyyMMdd').sql

# Backup with compression
docker compose exec tala-db pg_dump -U tala_user tala_db | gzip > backup.sql.gz
```

### Database Restore
```powershell
# Restore from backup
docker compose exec -T tala-db psql -U tala_user tala_db < backup.sql

# Restore from compressed
gunzip -c backup.sql.gz | docker compose exec -T tala-db psql -U tala_user tala_db
```

### Volume Backup
```powershell
# Backup volume
docker run --rm -v tala-db-data:/data -v ${PWD}:/backup alpine tar czf /backup/db-volume.tar.gz /data

# Restore volume
docker run --rm -v tala-db-data:/data -v ${PWD}:/backup alpine tar xzf /backup/db-volume.tar.gz
```

---

## 🔑 Environment Variables

Key variables in `.env`:

```env
# Database
DB_NAME=tala_db
DB_USER=tala_user
DB_PASSWORD=change_me

# Security
JWT_SECRET=long-random-string
ENCRYPTION_KEY=32-character-key

# Ports
DB_PORT=5432
API_PORT=3001
WEB_PORT=3000
PGADMIN_PORT=5050
```

---

## 📚 Additional Resources

- Full guide: [DOCKER_GUIDE.md](DOCKER_GUIDE.md)
- Setup guide: [SETUP_GUIDE.md](SETUP_GUIDE.md)
- Implementation: [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md)

---

## ⚡ Power User Tips

```powershell
# Start with build
docker compose up -d --build

# Rebuild without cache
docker compose build --no-cache

# Scale service (horizontal scaling)
docker compose up -d --scale tala-api=3

# Follow logs with timestamps
docker compose logs -f -t tala-api

# Execute commands in running container
docker compose exec tala-api sh -c "npm list"

# Export container as image
docker commit tala-api tala-api-backup:latest

# View container diff
docker diff tala-api
```

---

**Need help?** See full documentation in [DOCKER_GUIDE.md](DOCKER_GUIDE.md)
