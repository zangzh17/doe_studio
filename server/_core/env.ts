export const ENV = {
  // App configuration
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  isProduction: process.env.NODE_ENV === "production",
  BASE_URL: process.env.BASE_URL ?? "http://localhost:3000",

  // Google OAuth
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ?? "",
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ?? "",

  // WeChat OAuth
  WECHAT_APP_ID: process.env.WECHAT_APP_ID ?? "",
  WECHAT_APP_SECRET: process.env.WECHAT_APP_SECRET ?? "",

  // Admin configuration
  ADMIN_EMAIL: process.env.ADMIN_EMAIL ?? "",

  // Forge API (for DOE optimization, image generation, etc.)
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
};
