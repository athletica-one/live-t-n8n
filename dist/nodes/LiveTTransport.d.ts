import type { IDataObject } from "n8n-workflow";
export type EventGroup = "checkpoint_action" | "session_event" | "suunto_workout";
export declare function endpointFor(eventGroup: EventGroup): string;
export declare function signatureFor(secret: string, timestamp: string, body: string | Buffer): string;
export declare function verifySignature(params: {
    secret: string;
    timestamp?: string | string[];
    signature?: string | string[];
    body: string | Buffer;
    nowMs?: number;
    toleranceMs?: number;
}): boolean;
export declare function rawBody(req: {
    rawBody?: Buffer | string;
    body?: unknown;
}, parsedBody: unknown): string | Buffer;
export declare function normalizeEvent(body: unknown): IDataObject;
