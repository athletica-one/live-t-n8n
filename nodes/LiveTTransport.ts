import { createHmac, timingSafeEqual } from "crypto";
import type { IDataObject } from "n8n-workflow";

export type EventGroup =
  | "checkpoint_action"
  | "session_event"
  | "suunto_workout";

export function endpointFor(eventGroup: EventGroup): string {
  if (eventGroup === "checkpoint_action") {
    return "/n8n/hooks/checkpoint-action";
  }
  if (eventGroup === "suunto_workout") {
    return "/n8n/hooks/suunto-workout";
  }
  return "/n8n/hooks/session-event";
}

export function sampleEndpointFor(eventGroup: EventGroup): string {
  return `${endpointFor(eventGroup)}/sample`;
}

export function signatureFor(
  secret: string,
  timestamp: string,
  body: string | Buffer,
): string {
  const digest = createHmac("sha256", secret)
    .update(`${timestamp}.`)
    .update(body)
    .digest("hex");
  return `sha256=${digest}`;
}

export function verifySignature(params: {
  secret: string;
  timestamp?: string | string[];
  signature?: string | string[];
  body: string | Buffer;
  nowMs?: number;
  toleranceMs?: number;
}): boolean {
  const timestamp = firstHeader(params.timestamp);
  const signature = firstHeader(params.signature);
  if (!params.secret || !timestamp || !signature) {
    return false;
  }

  const sentAt = Number(timestamp);
  const nowMs = params.nowMs ?? Date.now();
  const toleranceMs = params.toleranceMs ?? 5 * 60 * 1000;
  if (!Number.isFinite(sentAt) || Math.abs(nowMs - sentAt) > toleranceMs) {
    return false;
  }

  const expected = Buffer.from(
    signatureFor(params.secret, timestamp, params.body),
  );
  const actual = Buffer.from(signature);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export function rawBody(
  req: { rawBody?: Buffer | string; body?: unknown },
  parsedBody: unknown,
): string | Buffer {
  if (req.rawBody) {
    return req.rawBody;
  }
  return JSON.stringify(parsedBody ?? {});
}

export function normalizeEvent(body: unknown): IDataObject {
  if (body && typeof body === "object" && !Array.isArray(body)) {
    return body as IDataObject;
  }
  return { data: body as IDataObject[keyof IDataObject] };
}

function firstHeader(value?: string | string[]): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
