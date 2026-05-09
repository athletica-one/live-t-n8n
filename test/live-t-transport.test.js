"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const {
  endpointFor,
  normalizeEvent,
  signatureFor,
  verifySignature,
} = require("../dist/nodes/LiveTTransport");
const {
  liveTApiBaseUrl,
  liveTDocumentationUrl,
  liveTWebBaseUrl,
} = require("../dist/config/liveTReleaseConfig");
const {
  LiveTOAuth2Api,
} = require("../dist/credentials/LiveTOAuth2Api.credentials");

test("endpointFor maps trigger groups to n8n backend hooks", () => {
  assert.equal(
    endpointFor("checkpoint_action"),
    "/n8n/hooks/checkpoint-action",
  );
  assert.equal(endpointFor("session_event"), "/n8n/hooks/session-event");
  assert.equal(endpointFor("suunto_workout"), "/n8n/hooks/suunto-workout");
});

test("credential exposes only client credentials as visible fields", () => {
  const credential = new LiveTOAuth2Api();
  const visiblePropertyNames = credential.properties
    .filter((property) => property.type !== "hidden")
    .map((property) => property.name);

  assert.deepEqual(visiblePropertyNames, ["clientId", "clientSecret"]);
});

test("credential hidden URLs resolve from release config", () => {
  const credential = new LiveTOAuth2Api();
  const authUrl = credential.properties.find((property) => property.name === "authUrl");
  const accessTokenUrl = credential.properties.find(
    (property) => property.name === "accessTokenUrl",
  );

  assert.equal(authUrl.default, `${liveTWebBaseUrl}/oauth/authorize`);
  assert.equal(accessTokenUrl.default, `${liveTApiBaseUrl}/oauth/token`);
  assert.equal(credential.test.request.baseURL, liveTApiBaseUrl);
  assert.equal(credential.documentationUrl, liveTDocumentationUrl);
});

test("verifySignature accepts valid HMAC", () => {
  const secret = "test-secret";
  const timestamp = "1777569704568";
  const body = JSON.stringify({ id: "event-1" });
  const signature = signatureFor(secret, timestamp, body);
  assert.equal(
    verifySignature({
      secret,
      timestamp,
      signature,
      body,
      nowMs: Number(timestamp),
    }),
    true,
  );
});

test("verifySignature rejects invalid HMAC", () => {
  const timestamp = "1777569704568";
  assert.equal(
    verifySignature({
      secret: "test-secret",
      timestamp,
      signature: "sha256=bad",
      body: "{}",
      nowMs: Number(timestamp),
    }),
    false,
  );
});

test("verifySignature rejects stale timestamps", () => {
  const secret = "test-secret";
  const timestamp = "1777569704568";
  const body = "{}";
  assert.equal(
    verifySignature({
      secret,
      timestamp,
      signature: signatureFor(secret, timestamp, body),
      body,
      nowMs: Number(timestamp) + 10 * 60 * 1000,
    }),
    false,
  );
});

test("normalizeEvent returns object payloads unchanged", () => {
  const event = { id: "event-1", event_type: "session.start" };
  assert.deepEqual(normalizeEvent(event), event);
});

test("normalizeEvent preserves session lifecycle location and GeoJSON links", () => {
  const event = {
    id: "event-1",
    event_type: "session.stop",
    location: {
      lat: 55.7558,
      lon: 37.6173,
      alt: 150,
    },
    links: {
      geojson: "https://api.example.test/sessions/session-123.geojson",
    },
    data: {
      location: {
        lat: 55.7558,
        lon: 37.6173,
        alt: 150,
      },
      geojson_url: "https://api.example.test/sessions/session-123.geojson",
    },
  };

  assert.deepEqual(normalizeEvent(event), event);
});

test("normalizeEvent preserves suunto workout FIT payloads", () => {
  const event = {
    id: "event-1",
    event_type: "suunto.workout.synced",
    data: {
      suunto_workout_id: "workout-123",
      fit: {
        status: "proxy_available",
        download_url: "https://api.example.test/fit/workout-123",
      },
    },
  };

  assert.deepEqual(normalizeEvent(event), event);
});
