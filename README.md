# Plateforme Web

### Déploiement

```bash
docker compose up -d
npx prisma migrate dev --name init
```

```bash
docker compose down --remove-orphans
```