# PocketBase Hooks

Place PocketBase JavaScript hook files in this directory.

The Docker image copies this directory to `/pb/pb_hooks` and the entrypoint
starts PocketBase with `--hooksDir=/pb/pb_hooks`.
