# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a SvelteKit web platform for 3D model viewing and management. The application features user authentication (JWT + Google OAuth), 3D model uploads, and a Three.js-based 3D editor/viewer. It uses PostgreSQL for data persistence and MinIO for object storage.

## Development Commands

### Initial Setup
```bash
# Start Docker services (PostgreSQL, Prisma Studio, MinIO)
docker compose up -d

# Run database migrations
npx prisma migrate dev

# Install dependencies (if needed)
npm install
```

### Daily Development
```bash
# Start development server (runs on http://localhost:5173)
npm run dev

# Type checking
npm run check

# Type checking with watch mode
npm run check:watch

# Build for production
npm run build

# Preview production build
npm run preview
```

### Database Management
```bash
# Apply migrations
npx prisma migrate dev

# Create a new migration
npx prisma migrate dev --name <migration_name>

# Access Prisma Studio (http://localhost:5555)
# Already running via docker-compose

# Generate Prisma Client after schema changes
npx prisma generate
```

### Docker Services
```bash
# Stop all services
docker compose down --remove-orphans

# View logs
docker compose logs -f

# Restart specific service
docker compose restart <service_name>
```

Services exposed:
- PostgreSQL: `localhost:5432` (user: admin, password: admin, db: webplatform)
- Prisma Studio: `http://localhost:5555`
- MinIO Console: `http://localhost:9001` (credentials: admin/admin12345)
- MinIO API: `http://localhost:9000`

## Architecture

### Tech Stack
- **Frontend**: SvelteKit 2 + Svelte 5, TailwindCSS 4, SMUI components
- **Backend**: SvelteKit server-side routes (API endpoints)
- **Database**: PostgreSQL with Prisma ORM
- **Object Storage**: MinIO (S3-compatible)
- **3D Rendering**: Three.js with OrbitControls
- **Authentication**: JWT + Google OAuth (via jsonwebtoken)
- **Email**: Resend API

### Route Structure

The app uses SvelteKit's file-based routing with a group layout for authenticated pages:

- `routes/(app)/` - Protected pages requiring authentication:
  - `/login`, `/signup` - Authentication pages
  - `/profile` - User profile management
  - `/models3D` - Browse 3D models
  - `/editor` - 3D model editor
  - `/forgotPassword`, `/resetPassword` - Password recovery

- `routes/api/` - REST API endpoints:
  - `/api/auth/*` - Authentication (status, Google OAuth)
  - `/api/login`, `/api/signup`, `/api/logout` - Auth operations
  - `/api/upload` - File uploads to MinIO
  - `/api/models/*` - 3D model CRUD operations
  - `/api/user-models` - User-specific models
  - `/api/change-password`, `/api/change-username` - Profile updates

### Authentication Flow

1. **JWT-based session**: Stored in HTTP-only cookies
2. **Server hook** (`src/hooks.server.ts`): Verifies JWT on every request and populates `event.locals.user`
3. **Layout server load** (`routes/(app)/+layout.server.ts`): Provides `isAuthenticated` to protected routes
4. **Google OAuth**: Handled via `/api/auth/google` and callback at `/auth/callback`

### Database Schema (Prisma)

Core models:
- `User` - User accounts (email, username, password hash)
- `Device` - Physical devices with serial numbers
- `DeviceModel` - Device model types
- `UserDevice` - Junction table for user-device pairing

### MinIO Object Storage

**Bucket structure**:
- `public` - Publicly accessible demo models (read-only policy)
- `user-{userId}` - Private buckets for each user's uploads

**Key functions** (in `src/lib/server/minio.ts`):
- `initializeBuckets()` - Creates public bucket with read policy
- `syncStaticModelsToMinio()` - Syncs `static/assets/model3D/` to MinIO on startup
- `ensureUserBucket(userId)` - Creates user-specific bucket
- `uploadFile()` - Uploads with automatic WHATWG ReadableStream conversion
- `getPresignedUrl()` - Generates temporary access URLs

**Content types supported**: `.glb`, `.gltf`, `.ply`, `.jpg`, `.png`, `.webp`

### 3D Editor/Viewer

The `Editor` class (`src/lib/editor/editor.ts`) provides a Three.js scene with:
- Perspective camera with OrbitControls
- Dark background (RGB: 0.02, 0.02, 0.02)
- Grid helper (20x20)
- Default camera position with configurable distance and angle
- Auto-resize handling

Used in:
- `src/lib/components/3DViewver/3DViewverComponent.svelte`
- `src/lib/components/Model3DPopup/Model3DPopupComponent.svelte`

### Component Structure

Components are organized by feature in `src/lib/components/`:
- `3DViewver/` - Main 3D viewer component
- `Model3DPopup/` - Modal for 3D model preview
- `ModelCard/`, `ModelFilters/` - 3D model browsing UI
- `Header/`, `Footer/` - Layout components
- `TextField/`, `Button/`, `Card/` - Reusable UI primitives
- `ChangePasswordModal/` - Profile management

### State Management

- **Theme**: use shadcn-svelte with text file shadcn-doc.txt as documentation, use colors from app.css
- **User session**: Server-side via `event.locals.user` (populated by hooks)

### Environment Variables

Required in `.env`:
```
DATABASE_URL="postgresql://..."
JWT_SECRET="..."
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GOOGLE_REDIRECT_URI="..."
RESEND_API_KEY="..."
MINIO_ENDPOINT="localhost"
MINIO_PORT="9000"
MINIO_USE_SSL="false"
MINIO_ACCESS_KEY="admin"
MINIO_SECRET_KEY="admin12345"
```

### Important Implementation Notes

1. **Prisma Client**: Singleton instance in `src/lib/server/prisma.ts`
2. **MinIO initialization**: Runs automatically on server startup via `hooks.server.ts`
3. **Static model sync**: Models in `static/assets/model3D/` are auto-synced to MinIO public bucket
4. **Stream conversion**: MinIO uploadFile handles both Node.js and WHATWG ReadableStreams
5. **JWT verification**: Custom middleware in `src/lib/server/jwtVerify.ts`

### Testing

No test setup currently configured. To add tests, consider:
- `vitest` for unit/integration tests
- `@playwright/test` for E2E tests