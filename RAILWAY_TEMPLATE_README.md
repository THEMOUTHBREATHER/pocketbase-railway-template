# Deploy and Host PocketBase on Railway

Deploy a self-hosted PocketBase instance on Railway with a pinned upstream
release, Dockerfile builds, a public HTTPS endpoint, and persistent storage for
SQLite data and uploaded files.

## About Hosting PocketBase on Railway

PocketBase is an open-source backend in one Go binary. It includes a SQLite
database, authentication, file storage, realtime subscriptions, a JavaScript
hooks system, migrations, and an admin UI.

This Railway template runs PocketBase from the official GitHub release artifact
and verifies the release checksum during the Docker build. The service listens
on Railway's injected `$PORT`, exposes `/api/health` for deployment
healthchecks, and mounts a Railway Volume at `/pb/pb_data` so PocketBase state
survives redeploys.

After deployment, open the generated Railway domain and visit `/_/` to create
the first PocketBase admin account.

## Why Deploy PocketBase on Railway

Railway is a good fit for PocketBase because it can build from a Dockerfile,
provide HTTPS routing, inject runtime variables, restart unhealthy deployments,
and attach persistent storage without managing servers.

This template keeps the deployment small and understandable:

- One app service named `pocketbase`
- One persistent Railway Volume mounted at `/pb/pb_data`
- Dockerfile builder using a pinned PocketBase release
- Healthcheck path set to `/api/health`
- `RAILWAY_RUN_UID=0` set so the service can write to Railway's root-mounted
  Volume

## Common Use Cases

- Self-host a lightweight backend for prototypes, internal tools, or small apps.
- Run PocketBase collections, auth, realtime APIs, and file uploads on Railway.
- Test PocketBase hooks and migrations with a persistent deployment target.
- Use Railway as a simple managed runtime for a SQLite-backed service.

## Dependencies for PocketBase on Railway

PocketBase itself is downloaded from the official PocketBase GitHub release
during the Docker build. Runtime data is stored in the attached Railway Volume,
not in the Git repository.

### Deployment Dependencies

| Dependency | Purpose |
| --- | --- |
| PocketBase `v0.39.1` | Application binary downloaded and checksum-verified during build |
| Railway app service | Runs the PocketBase container |
| Railway Volume | Persists `/pb/pb_data` across redeploys |
| Railway public networking | Exposes the PocketBase HTTP API and admin UI |

