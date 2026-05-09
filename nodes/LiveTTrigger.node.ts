import type {
  IDataObject,
  IHookFunctions,
  INodeType,
  INodeTypeDescription,
  IWebhookFunctions,
  IWebhookResponseData,
} from "n8n-workflow";
import { liveTApiBaseUrl } from "../config/liveTReleaseConfig";

import {
  endpointFor,
  normalizeEvent,
  rawBody,
  verifySignature,
} from "./LiveTTransport";

export class LiveTTrigger implements INodeType {
  description: INodeTypeDescription = {
    displayName: "Live.τ Trigger",
    name: "liveTTrigger",
    icon: "file:live-t.png",
    group: ["trigger"],
    version: 1,
    subtitle: '={{$parameter["eventGroup"]}}',
    description:
      "Starts a workflow when Live.τ automation events are delivered",
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

  webhookMethods = {
    default: {
      async checkExists(this: IHookFunctions): Promise<boolean> {
        const staticData = this.getWorkflowStaticData("node");
        return Boolean(staticData.subscriptionId);
      },

      async create(this: IHookFunctions): Promise<boolean> {
        const eventGroup = this.getNodeParameter("eventGroup") as
          | "checkpoint_action"
          | "session_event"
          | "suunto_workout";
        const webhookUrl = this.getNodeWebhookUrl("default");
        const response = await this.helpers.requestOAuth2.call(
          this,
          "liveTOAuth2Api",
          {
            method: "POST",
            url: `${liveTApiBaseUrl}${endpointFor(eventGroup)}`,
            body: {
              targetUrl: webhookUrl,
            },
            json: true,
          },
        );
        const staticData = this.getWorkflowStaticData("node");
        staticData.subscriptionId = response.id;
        staticData.secret = response.secret;
        return true;
      },

      async delete(this: IHookFunctions): Promise<boolean> {
        const eventGroup = this.getNodeParameter("eventGroup") as
          | "checkpoint_action"
          | "session_event"
          | "suunto_workout";
        const staticData = this.getWorkflowStaticData("node");
        const subscriptionId = staticData.subscriptionId as string | undefined;
        if (!subscriptionId) {
          return true;
        }
        await this.helpers.requestOAuth2.call(this, "liveTOAuth2Api", {
          method: "DELETE",
          url: `${liveTApiBaseUrl}${endpointFor(eventGroup)}/${subscriptionId}`,
          json: true,
        });
        delete staticData.subscriptionId;
        delete staticData.secret;
        return true;
      },
    },
  };

  async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
    const req = this.getRequestObject();
    const body = this.getBodyData();
    const staticData = this.getWorkflowStaticData("node");
    const secret = staticData.secret as string | undefined;
    const headers = req.headers as IDataObject;
    const bodyForSignature = rawBody(
      req as { rawBody?: Buffer | string },
      body,
    );

    const valid = verifySignature({
      secret: secret || "",
      timestamp: headers["x-live-t-timestamp"] as string | string[] | undefined,
      signature: headers["x-live-t-signature"] as string | string[] | undefined,
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
      workflowData: [this.helpers.returnJsonArray([normalizeEvent(body)])],
    };
  }
}
