"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.endpointFor = endpointFor;
exports.signatureFor = signatureFor;
exports.verifySignature = verifySignature;
exports.rawBody = rawBody;
exports.normalizeEvent = normalizeEvent;
const crypto_1 = require("crypto");
function endpointFor(eventGroup) {
    if (eventGroup === "checkpoint_action") {
        return "/n8n/hooks/checkpoint-action";
    }
    if (eventGroup === "suunto_workout") {
        return "/n8n/hooks/suunto-workout";
    }
    return "/n8n/hooks/session-event";
}
function signatureFor(secret, timestamp, body) {
    const digest = (0, crypto_1.createHmac)("sha256", secret)
        .update(`${timestamp}.`)
        .update(body)
        .digest("hex");
    return `sha256=${digest}`;
}
function verifySignature(params) {
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
    const expected = Buffer.from(signatureFor(params.secret, timestamp, params.body));
    const actual = Buffer.from(signature);
    return expected.length === actual.length && (0, crypto_1.timingSafeEqual)(expected, actual);
}
function rawBody(req, parsedBody) {
    if (req.rawBody) {
        return req.rawBody;
    }
    return JSON.stringify(parsedBody ?? {});
}
function normalizeEvent(body) {
    if (body && typeof body === "object" && !Array.isArray(body)) {
        return body;
    }
    return { data: body };
}
function firstHeader(value) {
    return Array.isArray(value) ? value[0] : value;
}
