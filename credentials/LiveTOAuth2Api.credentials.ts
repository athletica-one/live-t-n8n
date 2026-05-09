import type {
  IAuthenticateGeneric,
  ICredentialTestRequest,
  ICredentialType,
  INodeProperties,
} from "n8n-workflow";
import {
  liveTApiBaseUrl,
  liveTDocumentationUrl,
  liveTWebBaseUrl,
} from "../config/liveTReleaseConfig";

export class LiveTOAuth2Api implements ICredentialType {
  name = "liveTOAuth2Api";
  extends = ["oAuth2Api"];
  displayName = "Live.t OAuth2 API";
  documentationUrl = liveTDocumentationUrl;

  properties: INodeProperties[] = [
    {
      displayName: "Grant Type",
      name: "grantType",
      type: "hidden",
      default: "pkce",
    },
    {
      displayName: "Client ID",
      name: "clientId",
      type: "hidden",
      default: "live-t-n8n",
    },
    {
      displayName: "Client Secret",
      name: "clientSecret",
      type: "hidden",
      default: "",
    },
    {
      displayName: "Authorization URL",
      name: "authUrl",
      type: "hidden",
      default: `${liveTWebBaseUrl}/oauth/authorize`,
      required: true,
    },
    {
      displayName: "Access Token URL",
      name: "accessTokenUrl",
      type: "hidden",
      default: `${liveTApiBaseUrl}/oauth/token`,
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

  authenticate: IAuthenticateGeneric = {
    type: "generic",
    properties: {
      headers: {
        Authorization: "=Bearer {{$credentials.oauthTokenData.access_token}}",
      },
    },
  };

  test: ICredentialTestRequest = {
    request: {
      baseURL: liveTApiBaseUrl,
      url: "/n8n/auth/test",
      method: "GET",
    },
  };
}
