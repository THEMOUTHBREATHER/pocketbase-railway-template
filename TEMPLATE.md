# Railway Template Guide

This repository is the deployable source for a Railway PocketBase template.
Railway stores the marketplace template metadata in Template Composer, so keep
this repo focused on the source image, runtime defaults, validation, and
operator documentation.

## Template Composer

Create the template from a working Railway project:

1. Create a Railway project and add one service named `pocketbase`.
2. Set the source repository to this repo and branch `main`.
3. Use the Dockerfile builder. The committed `railway.json` sets
   `build.builder` to `DOCKERFILE` and `build.dockerfilePath` to `Dockerfile`.
4. Attach Volume to the `pocketbase` service at `/pb/pb_data`.
5. Add the service variable `RAILWAY_RUN_UID=0`.
6. Enable public networking on port `8080`.
7. Keep the healthcheck path as `/api/health`.
8. Publish the project as a template in Railway Template Composer.

## Required Service Settings

| Setting | Value |
| --- | --- |
| Service name | `pocketbase` |
| Source | `github.com/yunyu950908/pocketbase-railway-template` |
| Branch | `main` |
| Builder | Dockerfile |
| Public port | `8080` |
| Healthcheck path | `/api/health` |
| Attach Volume mount path | `/pb/pb_data` |
| Required variable | `RAILWAY_RUN_UID=0` |

## Runtime Variables

The template must set `RAILWAY_RUN_UID=0` when a Railway Volume is attached.
The other variables are optional overrides for operators who need to customize
paths or local runtime behavior:

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `8080` | Provided by Railway at runtime. |
| `PB_DATA_DIR` | `/pb/pb_data` | Persistent SQLite, uploaded files, and app state. |
| `PB_HOOKS_DIR` | `/pb/pb_hooks` | JavaScript hooks copied from the repo. |
| `PB_MIGRATIONS_DIR` | `/pb/pb_migrations` | Migration files copied from the repo. |
| `PB_PUBLIC_DIR` | `/pb/pb_public` | Static files copied from the repo. |
| `RAILWAY_RUN_UID` | `0` | Lets the service write to Railway's root-mounted Volume. |

## First-Run Notes

After deploying the template, open the generated Railway domain and visit `/_/`
to create the first PocketBase admin account.

Do not store production data in the repository. Runtime data belongs only in
the Railway Volume mounted at `/pb/pb_data`.
