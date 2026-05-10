"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiveTTrigger = void 0;
const liveTReleaseConfig_1 = require("../config/liveTReleaseConfig");
const LiveTTransport_1 = require("./LiveTTransport");
class LiveTTrigger {
    constructor() {
        this.description = {
            displayName: "Live.τ Trigger",
            name: "liveTTrigger",
            icon: "file:live-t.png",
            group: ["trigger"],
            version: 1,
            subtitle: '={{$parameter["eventGroup"]}}',
            description: "Starts a workflow when Live.τ automation events are delivered",
            defaults: {
                name: "Live.τ Trigger",
            },
            inputs: [],
            outputs: ["main"],
            credentials: [
                {
                    name: "liveTOAuth2Api",
                    required: true,
                },
            ],
            webhooks: [
                {
                    name: "default",
                    httpMethod: "POST",
                    responseMode: "onReceived",
                    path: "live-t",
                },
            ],
            properties: [
                {
                    displayName: "Event Group",
                    name: "eventGroup",
                    type: "options",
                    options: [
                        {
                            name: "Checkpoint Action",
                            value: "checkpoint_action",
                        },
                        {
                            name: "Session Lifecycle",
                            value: "session_event",
                        },
                        {
                            name: "Suunto Workout",
                            value: "suunto_workout",
                        },
                    ],
                    default: "checkpoint_action",
                    required: true,
                },
            ],
        };
        this.webhookMethods = {
            default: {
                async checkExists() {
                    const staticData = this.getWorkflowStaticData("node");
                    return Boolean(staticData.subscriptionId);
                },
                async create() {
                    const eventGroup = this.getNodeParameter("eventGroup");
                    const webhookUrl = this.getNodeWebhookUrl("default");
                    const response = await this.helpers.requestOAuth2.call(this, "liveTOAuth2Api", {
                        method: "POST",
                        url: `${liveTReleaseConfig_1.liveTApiBaseUrl}${(0, LiveTTransport_1.endpointFor)(eventGroup)}`,
                        body: {
                            targetUrl: webhookUrl,
                        },
                        json: true,
                    });
                    const staticData = this.getWorkflowStaticData("node");
                    staticData.subscriptionId = response.id;
                    staticData.secret = response.secret;
                    return true;
                },
                async delete() {
                    const eventGroup = this.getNodeParameter("eventGroup");
                    const staticData = this.getWorkflowStaticData("node");
                    const subscriptionId = staticData.subscriptionId;
                    if (!subscriptionId) {
                        return true;
                    }
                    await this.helpers.requestOAuth2.call(this, "liveTOAuth2Api", {
                        method: "DELETE",
                        url: `${liveTReleaseConfig_1.liveTApiBaseUrl}${(0, LiveTTransport_1.endpointFor)(eventGroup)}/${subscriptionId}`,
                        json: true,
                    });
                    delete staticData.subscriptionId;
                    delete staticData.secret;
                    return true;
                },
            },
        };
    }
    async trigger() {
        const eventGroup = this.getNodeParameter("eventGroup");
        const sample = await this.helpers.requestOAuth2.call(this, "liveTOAuth2Api", {
            method: "GET",
            url: `${liveTReleaseConfig_1.liveTApiBaseUrl}${(0, LiveTTransport_1.sampleEndpointFor)(eventGroup)}`,
            json: true,
        });
        return {
            manualTriggerResponse: Promise.resolve([
                this.helpers.returnJsonArray([(0, LiveTTransport_1.normalizeEvent)(sample)]),
            ]),
        };
    }
    async webhook() {
        const req = this.getRequestObject();
        const body = this.getBodyData();
        const staticData = this.getWorkflowStaticData("node");
        const secret = staticData.secret;
        const headers = req.headers;
        const bodyForSignature = (0, LiveTTransport_1.rawBody)(req, body);
        const valid = (0, LiveTTransport_1.verifySignature)({
            secret: secret || "",
            timestamp: headers["x-live-t-timestamp"],
            signature: headers["x-live-t-signature"],
            body: bodyForSignature,
        });
        if (!valid) {
            const res = this.getResponseObject();
            res.status(401).json({ error: "invalid_signature" });
            return {
                noWebhookResponse: true,
            };
        }
        return {
            workflowData: [this.helpers.returnJsonArray([(0, LiveTTransport_1.normalizeEvent)(body)])],
        };
    }
}
exports.LiveTTrigger = LiveTTrigger;
