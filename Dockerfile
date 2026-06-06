# syntax=docker/dockerfile:1.7

# PocketBase does not publish an official Docker image. This template downloads
# the upstream release artifact directly and verifies it against the release
# checksums before copying the binary into a small runtime image.
FROM alpine:3.21 AS downloader

ARG PB_VERSION=0.39.1
ARG TARGETOS=linux
ARG TARGETARCH=amd64

RUN apk add --no-cache ca-certificates curl unzip

WORKDIR /tmp/pocketbase

RUN set -eux; \
    case "${TARGETARCH}" in \
      amd64|arm64) PB_ARCH="${TARGETARCH}" ;; \
      arm/v7) PB_ARCH="armv7" ;; \
      *) echo "Unsupported TARGETARCH: ${TARGETARCH}" >&2; exit 1 ;; \
    esac; \
    PB_ZIP="pocketbase_${PB_VERSION}_${TARGETOS}_${PB_ARCH}.zip"; \
    PB_URL="https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/${PB_ZIP}"; \
    curl -fsSLo "${PB_ZIP}" "${PB_URL}"; \
    curl -fsSLo checksums.txt "https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/checksums.txt"; \
    grep " ${PB_ZIP}$" checksums.txt | sha256sum -c -; \
    unzip "${PB_ZIP}" -d /out; \
    chmod +x /out/pocketbase

FROM alpine:3.21

RUN apk add --no-cache ca-certificates tzdata \
    && addgroup -S pocketbase \
    && adduser -S -G pocketbase -h /pb pocketbase

WORKDIR /pb

COPY --from=downloader /out/pocketbase /usr/local/bin/pocketbase
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
COPY pb_hooks ./pb_hooks
COPY pb_migrations ./pb_migrations
COPY pb_public ./pb_public

RUN chmod +x /usr/local/bin/docker-entrypoint.sh \
    && mkdir -p /pb/pb_data \
    && chown -R pocketbase:pocketbase /pb

USER pocketbase

ENV PB_DATA_DIR=/pb/pb_data \
    PB_HOOKS_DIR=/pb/pb_hooks \
    PB_MIGRATIONS_DIR=/pb/pb_migrations \
    PB_PUBLIC_DIR=/pb/pb_public

EXPOSE 8080

ENTRYPOINT ["docker-entrypoint.sh"]
