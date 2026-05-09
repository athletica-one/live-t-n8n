# Development Notes

This package is published as a production-first npm package. End users should
not enter backend or frontend URLs manually.

## Local build overrides

To build against non-production infrastructure, set build-time environment
variables before running `npm run build`:

```bash
LIVE_T_API_BASE_URL="http://localhost:9091" \
LIVE_T_WEB_BASE_URL="http://localhost:5173" \
npm run build
```

These values are compiled into `dist`. They are not runtime credential fields.

## Tarball install

For local development or closed test environments:

```bash
cd /Users/nikotron/git/live-t-n8n
npm pack
```

Install the tarball in a self-hosted n8n container:

```bash
docker cp n8n-nodes-live-t-0.1.0.tgz n8n:/tmp/
docker exec -it n8n sh
mkdir -p /home/node/.n8n/nodes
cd /home/node/.n8n/nodes
npm install /tmp/n8n-nodes-live-t-0.1.0.tgz
exit
docker restart n8n
```

## Production publishing

The GitHub Actions publish workflow expects:

- `LIVE_T_API_BASE_URL`
- `LIVE_T_WEB_BASE_URL`
- `LIVE_T_REQUIRE_PROD_CONFIG=true`

Configure the two URLs as repository variables. The workflow fails if release
builds still point at placeholder `.invalid` hosts or use non-HTTPS URLs.
