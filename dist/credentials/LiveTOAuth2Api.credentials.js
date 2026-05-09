"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiveTOAuth2Api = void 0;
const liveTReleaseConfig_1 = require("../config/liveTReleaseConfig");
class LiveTOAuth2Api {
    constructor() {
        this.name = "liveTOAuth2Api";
        this.extends = ["oAuth2Api"];
        this.displayName = "Live.t OAuth2 API";
        this.documentationUrl = liveTReleaseConfig_1.liveTDocumentationUrl;
        this.properties = [
            {
                displayName: "Client ID",
                name: "clientId",
                type: "string",
                default: "",
                required: true,
            },
            {
                displayName: "Client Secret",
                name: "clientSecret",
                type: "string",
                typeOptions: { password: true },
                default: "",
                required: true,
            },
            {
                displayName: "Authorization URL",
                name: "authUrl",
                type: "hidden",
                default: `${liveTReleaseConfig_1.liveTWebBaseUrl}/oauth/authorize`,
                required: true,
            },
            {
                displayName: "Access Token URL",
                name: "accessTokenUrl",
                type: "hidden",
                default: `${liveTReleaseConfig_1.liveTApiBaseUrl}/oauth/token`,
                required: true,
            },
            {
                displayName: "Scope",
                name: "scope",
                type: "hidden",
                default: "automation:read automation:write",
            },
            {
                displayName: "Auth URI Query Parameters",
                name: "authQueryParameters",
                type: "hidden",
                default: "",
            },
            {
                displayName: "Authentication",
                name: "authentication",
                type: "hidden",
                default: "body",
            },
        ];
        this.authenticate = {
            type: "generic",
            properties: {
                headers: {
                    Authorization: "=Bearer {{$credentials.oauthTokenData.access_token}}",
                },
            },
        };
        this.test = {
            request: {
                baseURL: liveTReleaseConfig_1.liveTApiBaseUrl,
                url: "/n8n/auth/test",
                method: "GET",
            },
        };
    }
}
exports.LiveTOAuth2Api = LiveTOAuth2Api;
