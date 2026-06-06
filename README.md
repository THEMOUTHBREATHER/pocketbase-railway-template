# PocketBase Railway Template

Deploy a production-oriented [PocketBase](https://pocketbase.io/) service on
Railway with a pinned upstream binary, checksum verification, a persistent data
Volume, and repeatable smoke tests.

This repo is designed to be used as the source repository for a Railway
Template. The deployable source lives here; the public template listing and
Volume attachment are configured in Railway Template Composer.

## What You Get

- PocketBase `v0.39.1` downloaded from the official GitHub release.
- Release checksum verification during the Docker build.
- Railway config-as-code in `railway.json`.
- A non-root runtime user in the image, with Railway's required Volume override
  documented for template deployments.
- Persistent data under `/pb/pb_data`, ready for a Railway Volume.
- Healthcheck at `/api/health`.
- Placeholder folders for `pb_hooks`, `pb_migrations`, and `pb_public`.
- Local Docker and Railway CLI smoke-test scripts.

## Repository Layout

```text
.
├── Dockerfile                  # Builds the PocketBase runtime image.
├── docker-entrypoint.sh        # Starts PocketBase with Railway-safe defaults.
├── railway.json                # Railway builder and deploy healthcheck config.
├── TEMPLATE.md                 # Railway Template Composer settings.
├── pb_hooks/                   # Optional JavaScript hooks.
├── pb_migrations/              # Optional PocketBase migrations.
├── pb_public/                  # Optional public static files.
├── scripts/
│   ├── docker-smoke-test.sh    # Builds and checks the container locally.
│   ├── railway-smoke-test.sh   # Creates a temporary Railway project and tests it.
│   └── validate-template.mjs   # Static template contract checks.
└── tests/                      # Node test runner checks for the template contract.
```

## Deploy From Railway

When this repo is published as a Railway Template, deploy it from the template
page. Until a template code exists, use `TEMPLATE.md` to create and publish the
template from a Railway project.

The template must attach a Railway Volume at:

```text
/pb/pb_data
```

PocketBase stores SQLite data, uploaded files, backups, logs, and other runtime
state there. Without this Volume, redeploys can discard data.

## Deploy With Railway CLI

For manual verification or a one-off deployment:

```bash
railway init --name my-pocketbase --json
railway add --service pocketbase --json
railway service link pocketbase
railway volume add --mount-path /pb/pb_data --json
railway variable set RAILWAY_RUN_UID=0 --service pocketbase --skip-deploys --json
railway domain --service pocketbase --port 8080 --json
railway up --ci -m "Deploy PocketBase"
```

After the deployment is healthy, open the generated domain and visit `/_/` to
create the first PocketBase admin account.

## Runtime Configuration

| Variable | Default | Description |
| --- | --- | --- |
| `PORT` | `8080` | Railway injects this value. Local Docker uses the fallback. |
| `PB_DATA_DIR` | `/pb/pb_data` | Persistent PocketBase runtime data. |
| `PB_HOOKS_DIR` | `/pb/pb_hooks` | JavaScript hook directory copied into the image. |
| `PB_MIGRATIONS_DIR` | `/pb/pb_migrations` | Migration directory copied into the image. |
| `PB_PUBLIC_DIR` | `/pb/pb_public` | Public static directory copied into the image. |
| `RAILWAY_RUN_UID` | `0` | Required on Railway because Volumes are mounted as root. |

## Local Validation

Run static contract checks:

```bash
npm test
npm run validate
```

Build and run the Docker image locally:

```bash
npm run smoke:docker
```

Run a temporary Railway deployment smoke test:

```bash
RAILWAY_SMOKE_CREATE_PROJECT=1 npm run smoke:railway
```

The Railway smoke test creates a temporary project, deploys this directory,
checks `https://<generated-domain>/api/health`, and requests deletion of the
project when it finishes. Set `KEEP_PROJECT=1` if you want to inspect the
project manually.

## Upgrade PocketBase

1. Check the latest PocketBase release.
2. Update `ARG PB_VERSION` in `Dockerfile`.
3. Update the expected version in `tests/template.test.mjs` and
   `scripts/validate-template.mjs`.
4. Run `npm test`, `npm run validate`, and `npm run smoke:docker`.
5. Run the Railway smoke test before publishing a new template revision.

## Operational Notes

- The Admin UI is available at `/_/`.
- The healthcheck endpoint is `/api/health`.
- Railway templates using the `/pb/pb_data` Volume must set
  `RAILWAY_RUN_UID=0`; otherwise the non-root image cannot write to the
  root-mounted Volume.
- Do not commit `pb_data`, local SQLite files, or `.env` files.
- For production email, configure SMTP in the PocketBase Admin UI after the
  first admin account is created.
