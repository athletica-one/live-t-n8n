import type { IHookFunctions, INodeType, INodeTypeDescription, ITriggerFunctions, ITriggerResponse, IWebhookFunctions, IWebhookResponseData } from "n8n-workflow";
export declare class LiveTTrigger implements INodeType {
    description: INodeTypeDescription;
    webhookMethods: {
        default: {
            checkExists(this: IHookFunctions): Promise<boolean>;
            create(this: IHookFunctions): Promise<boolean>;
            delete(this: IHookFunctions): Promise<boolean>;
        };
    };
    trigger(this: ITriggerFunctions): Promise<ITriggerResponse>;
    webhook(this: IWebhookFunctions): Promise<IWebhookResponseData>;
}
