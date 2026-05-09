# n8n Live.τ Nodes

Community node package for Live.τ automation events.

This package is intended for self-hosted n8n.

## Install

Install it in a self-hosted n8n container:

```bash
docker exec -it n8n sh
mkdir -p /home/node/.n8n/nodes
cd /home/node/.n8n/nodes
npm install n8n-nodes-live-t
exit
docker restart n8n
```

n8n notes:

- Unverified community nodes are not available on n8n Cloud.
- Docker deployments must persist `~/.n8n/nodes`, otherwise installed
  community packages can disappear when the container is recreated.

## Credentials

Create `Live.τ OAuth2 API` credentials:

- Client ID from your backend `OAUTH_CLIENTS_JSON` entry for `live-t-n8n`.
- Client secret from the same `OAUTH_CLIENTS_JSON` entry.

n8n generates the OAuth callback URL for the credential. In self-hosted n8n it
normally uses:

```text
https://<your-n8n-host>/rest/oauth2-credential/callback
```

Because every self-hosted instance has a different host, configure the backend
OAuth client with a redirect URI policy instead of listing every possible
callback:

```json
{
  "client_id": "live-t-n8n",
  "client_secret": "replace-with-secret",
  "name": "n8n",
  "redirect_uris": [],
  "redirect_uri_policy": {
    "type": "https_any_host",
    "path": "/rest/oauth2-credential/callback"
  },
  "scopes": ["automation:read", "automation:write"],
  "enabled": true
}
```

The node itself already knows the Live.τ API and web endpoints. Users should
not enter backend or frontend URLs manually.

## Trigger

Use `Live.τ Trigger` and choose:

- `Checkpoint action`
- `Session lifecycle`
- `Suunto workout`

Session lifecycle events are passed through unchanged. The backend may include
optional coordinates as `location.lat`, `location.lon`, `location.alt` or under
`data.location`, and `session.stop` may include a GeoJSON URL as
`data.geojson_url` or `links.geojson`.

The backend signs webhook deliveries with `x-live-t-timestamp` and
`x-live-t-signature`; the node verifies the HMAC before emitting items.

## Maintainers

Release and local-development notes live in [DEVELOPMENT.md](./DEVELOPMENT.md).
