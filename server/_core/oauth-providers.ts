/**
 * OAuth Providers Configuration
 * Google and WeChat OAuth implementations
 */

import { Google } from "arctic";
import { ENV } from "./env";

// Google OAuth Provider
export const googleAuth = new Google(
  ENV.GOOGLE_CLIENT_ID || "",
  ENV.GOOGLE_CLIENT_SECRET || "",
  `${ENV.BASE_URL || "http://localhost:3000"}/api/auth/google/callback`
);

/**
 * WeChat OAuth Provider (Custom Implementation)
 * WeChat uses a non-standard OAuth flow
 */
export class WeChatAuth {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor(clientId: string, clientSecret: string, redirectUri: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.redirectUri = redirectUri;
  }

  /**
   * Generate WeChat OAuth authorization URL
   */
  createAuthorizationURL(state: string): URL {
    const url = new URL("https://open.weixin.qq.com/connect/qrconnect");
    url.searchParams.set("appid", this.clientId);
    url.searchParams.set("redirect_uri", this.redirectUri);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", "snsapi_login");
    url.searchParams.set("state", state);
    url.hash = "wechat_redirect";
    return url;
  }

  /**
   * Exchange authorization code for access token
   */
  async validateAuthorizationCode(code: string): Promise<WeChatTokens> {
    const url = new URL("https://api.weixin.qq.com/sns/oauth2/access_token");
    url.searchParams.set("appid", this.clientId);
    url.searchParams.set("secret", this.clientSecret);
    url.searchParams.set("code", code);
    url.searchParams.set("grant_type", "authorization_code");

    const response = await fetch(url.toString());
    const data = await response.json();

    if (data.errcode) {
      throw new Error(`WeChat OAuth error: ${data.errmsg}`);
    }

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
      openId: data.openid,
      unionId: data.unionid,
      scope: data.scope,
    };
  }

  /**
   * Get WeChat user info
   */
  async getUserInfo(accessToken: string, openId: string): Promise<WeChatUser> {
    const url = new URL("https://api.weixin.qq.com/sns/userinfo");
    url.searchParams.set("access_token", accessToken);
    url.searchParams.set("openid", openId);

    const response = await fetch(url.toString());
    const data = await response.json();

    if (data.errcode) {
      throw new Error(`WeChat user info error: ${data.errmsg}`);
    }

    return {
      openId: data.openid,
      unionId: data.unionid,
      nickname: data.nickname,
      sex: data.sex,
      province: data.province,
      city: data.city,
      country: data.country,
      headImgUrl: data.headimgurl,
      privilege: data.privilege,
    };
  }
}

export interface WeChatTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  openId: string;
  unionId?: string;
  scope: string;
}

export interface WeChatUser {
  openId: string;
  unionId?: string;
  nickname: string;
  sex: number;
  province: string;
  city: string;
  country: string;
  headImgUrl: string;
  privilege: string[];
}

// WeChat OAuth Provider instance
export const wechatAuth = new WeChatAuth(
  ENV.WECHAT_APP_ID || "",
  ENV.WECHAT_APP_SECRET || "",
  `${ENV.BASE_URL || "http://localhost:3000"}/api/auth/wechat/callback`
);
