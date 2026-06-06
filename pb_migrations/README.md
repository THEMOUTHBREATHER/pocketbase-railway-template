# PocketBase Migrations

Place generated PocketBase migration files in this directory.

The Docker image copies this directory to `/pb/pb_migrations` and the entrypoint
starts PocketBase with `--migrationsDir=/pb/pb_migrations`.
