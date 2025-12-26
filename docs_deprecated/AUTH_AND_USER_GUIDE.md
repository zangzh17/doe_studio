# 认证系统和用户管理详细指南

本文档面向**零基础**读者，详细介绍 DOE Studio 的用户认证系统、用户管理操作，以及如何配置自定义认证方式（Google、邮箱、微信等）。

---

## 目录

1. [概述](#1-概述)
2. [当前认证系统架构](#2-当前认证系统架构)
3. [用户管理操作](#3-用户管理操作)
4. [配置 Google 登录](#4-配置-google-登录)
5. [配置邮箱验证码登录](#5-配置邮箱验证码登录)
6. [配置微信登录](#6-配置微信登录)
7. [替换为自定义认证系统](#7-替换为自定义认证系统)
8. [部署前检查清单](#8-部署前检查清单)

---

## 1. 概述

### 1.1 当前认证方式

DOE Studio 目前使用 **Manus OAuth** 作为认证系统，这是 Manus 平台提供的内置认证服务。

| 特性 | 说明 |
|-----|------|
| 认证方式 | OAuth 2.0 |
| 支持的登录方式 | Manus 账号 |
| 用户数据存储 | PostgreSQL 数据库 |
| Session 管理 | JWT Token |

### 1.2 相关文件

| 文件路径 | 作用 |
|---------|------|
| `client/src/hooks/useAuth.ts` | 前端认证 Hook |
| `server/_core/auth.ts` | 后端认证中间件 |
| `drizzle/schema.ts` | 用户表结构 |
| `server/db.ts` | 用户数据库操作 |

### 1.3 用户数据表结构

```sql
-- users 表
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  open_id TEXT UNIQUE NOT NULL,      -- OAuth 用户 ID
  name TEXT,                          -- 用户名
  email TEXT,                         -- 邮箱
  avatar TEXT,                        -- 头像 URL
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- user_credits 表（优化额度）
CREATE TABLE user_credits (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  credits INTEGER DEFAULT 10,         -- 剩余额度
  total_purchased INTEGER DEFAULT 0,  -- 累计购买
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 2. 当前认证系统架构

### 2.1 认证流程

```
用户点击"登录"
       │
       v
重定向到 Manus OAuth 页面
       │
       v
用户在 Manus 登录/注册
       │
       v
Manus 返回授权码
       │
       v
后端用授权码换取 Token
       │
       v
后端创建/更新用户记录
       │
       v
返回 JWT Token 给前端
       │
       v
前端存储 Token，用户登录成功
```

### 2.2 前端认证 Hook

```typescript
// client/src/hooks/useAuth.ts

import { useEffect, useState } from 'react';

export interface User {
  id: number;
  openId: string;
  name: string | null;
  email: string | null;
  avatar: string | null;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 检查登录状态
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = () => {
    // 重定向到 OAuth 登录页面
    window.location.href = '/api/auth/login';
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    window.location.href = '/';
  };

  return { user, isLoading, login, logout, isAuthenticated: !!user };
}
```

### 2.3 后端认证中间件

```typescript
// server/_core/auth.ts

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    openId: string;
  };
}

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
```

---

## 3. 用户管理操作

### 3.1 查看所有用户

**方法一：通过数据库面板**

1. 打开 Management UI → Database
2. 选择 `users` 表
3. 查看所有用户记录

**方法二：通过 SQL**

```sql
-- 查看所有用户
SELECT * FROM users ORDER BY created_at DESC;

-- 查看用户及其额度
SELECT 
  u.id,
  u.name,
  u.email,
  uc.credits,
  uc.total_purchased
FROM users u
LEFT JOIN user_credits uc ON u.id = uc.user_id
ORDER BY u.created_at DESC;
```

### 3.2 手动添加用户

```sql
-- 添加新用户
INSERT INTO users (open_id, name, email)
VALUES ('manual_user_001', 'Test User', 'test@example.com')
RETURNING id;

-- 为新用户添加初始额度
INSERT INTO user_credits (user_id, credits, total_purchased)
VALUES (1, 10, 0);  -- 假设新用户 ID 为 1
```

### 3.3 修改用户信息

```sql
-- 修改用户名
UPDATE users SET name = 'New Name' WHERE id = 1;

-- 修改邮箱
UPDATE users SET email = 'new@example.com' WHERE id = 1;

-- 增加用户额度
UPDATE user_credits 
SET credits = credits + 25, total_purchased = total_purchased + 25
WHERE user_id = 1;
```

### 3.4 删除用户

```sql
-- 删除用户（需要先删除关联数据）

-- 1. 删除用户的设计
DELETE FROM doe_designs WHERE user_id = 1;

-- 2. 删除用户的额度记录
DELETE FROM user_credits WHERE user_id = 1;

-- 3. 删除用户的支付记录
DELETE FROM payments WHERE user_id = 1;

-- 4. 删除用户
DELETE FROM users WHERE id = 1;
```

**注意**：删除用户是不可逆操作，建议先备份数据。

### 3.5 批量操作

```sql
-- 为所有用户增加 5 次免费额度
UPDATE user_credits SET credits = credits + 5;

-- 查找没有额度记录的用户并创建
INSERT INTO user_credits (user_id, credits, total_purchased)
SELECT id, 10, 0 FROM users
WHERE id NOT IN (SELECT user_id FROM user_credits);

-- 删除超过 1 年未登录的用户
DELETE FROM users 
WHERE updated_at < NOW() - INTERVAL '1 year';
```

---

## 4. 配置 Google 登录

### 4.1 前置条件

1. Google Cloud Console 账号
2. 已创建 Google Cloud 项目
3. 已启用 Google+ API

### 4.2 创建 OAuth 凭据

**步骤 1**：访问 Google Cloud Console

1. 打开 https://console.cloud.google.com/
2. 选择或创建项目
3. 进入 "APIs & Services" → "Credentials"

**步骤 2**：创建 OAuth 2.0 客户端 ID

1. 点击 "Create Credentials" → "OAuth client ID"
2. 选择 "Web application"
3. 填写名称（如 "DOE Studio"）
4. 添加授权重定向 URI：
   - 开发环境：`http://localhost:3000/api/auth/google/callback`
   - 生产环境：`https://your-domain.com/api/auth/google/callback`
5. 点击 "Create"
6. 记录 Client ID 和 Client Secret

### 4.3 安装依赖

```bash
cd /home/ubuntu/raioptics_clone
pnpm add passport passport-google-oauth20 @types/passport @types/passport-google-oauth20
```

### 4.4 创建 Google 认证路由

```typescript
// server/auth/google.ts

import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Router } from 'express';
import { db } from '../db';
import { users } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

const router = Router();

// 配置 Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // 查找或创建用户
      const googleId = `google_${profile.id}`;
      let user = await db.query.users.findFirst({
        where: eq(users.openId, googleId),
      });

      if (!user) {
        // 创建新用户
        const [newUser] = await db.insert(users).values({
          openId: googleId,
          name: profile.displayName,
          email: profile.emails?.[0]?.value,
          avatar: profile.photos?.[0]?.value,
        }).returning();
        
        user = newUser;

        // 创建初始额度
        await db.insert(userCredits).values({
          userId: user.id,
          credits: 10,
          totalPurchased: 0,
        });
      }

      done(null, user);
    } catch (error) {
      done(error as Error);
    }
  }
));

// 登录路由
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
}));

// 回调路由
router.get('/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    const user = req.user as any;
    
    // 生成 JWT
    const token = jwt.sign(
      { id: user.id, openId: user.openId },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    // 设置 Cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 天
    });

    // 重定向到首页
    res.redirect('/studio');
  }
);

export default router;
```

### 4.5 注册路由

```typescript
// server/_core/index.ts

import googleAuth from '../auth/google';

// 在 app 配置中添加
app.use('/api/auth', googleAuth);
```

### 4.6 配置环境变量

在 Manus Management UI → Settings → Secrets 中添加：

| 变量名 | 值 |
|-------|-----|
| GOOGLE_CLIENT_ID | 从 Google Console 获取 |
| GOOGLE_CLIENT_SECRET | 从 Google Console 获取 |
| GOOGLE_CALLBACK_URL | https://your-domain.com/api/auth/google/callback |

### 4.7 更新前端登录按钮

```tsx
// client/src/components/LoginButton.tsx

export function LoginButton() {
  return (
    <div className="space-y-2">
      <Button
        onClick={() => window.location.href = '/api/auth/google'}
        className="w-full"
      >
        <GoogleIcon className="mr-2 h-4 w-4" />
        Continue with Google
      </Button>
    </div>
  );
}
```

---

## 5. 配置邮箱验证码登录

### 5.1 前置条件

1. SMTP 邮件服务（如 SendGrid、Mailgun、阿里云邮件）
2. 发送邮箱账号

### 5.2 安装依赖

```bash
pnpm add nodemailer @types/nodemailer
```

### 5.3 创建验证码表

```sql
-- 添加验证码表
CREATE TABLE email_verifications (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_email_verifications_email ON email_verifications(email);
CREATE INDEX idx_email_verifications_expires ON email_verifications(expires_at);
```

### 5.4 创建邮箱认证路由

```typescript
// server/auth/email.ts

import { Router } from 'express';
import nodemailer from 'nodemailer';
import { db } from '../db';
import { users, emailVerifications, userCredits } from '../../drizzle/schema';
import { eq, and, gt } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

const router = Router();

// 配置邮件发送器
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// 生成 6 位验证码
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// 发送验证码
router.post('/email/send-code', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Invalid email' });
    }

    // 生成验证码
    const code = generateCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 分钟有效

    // 保存到数据库
    await db.insert(emailVerifications).values({
      email,
      code,
      expiresAt,
    });

    // 发送邮件
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@doestudio.com',
      to: email,
      subject: 'DOE Studio - 登录验证码',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0d9488;">DOE Studio 登录验证码</h2>
          <p>您的验证码是：</p>
          <div style="background: #f0fdfa; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #0d9488;">
            ${code}
          </div>
          <p style="color: #666; margin-top: 20px;">
            验证码有效期为 10 分钟，请尽快使用。<br>
            如果您没有请求此验证码，请忽略此邮件。
          </p>
        </div>
      `,
    });

    res.json({ success: true, message: 'Code sent' });
  } catch (error) {
    console.error('Send code error:', error);
    res.status(500).json({ error: 'Failed to send code' });
  }
});

// 验证码登录
router.post('/email/verify', async (req, res) => {
  try {
    const { email, code } = req.body;

    // 查找有效的验证码
    const verification = await db.query.emailVerifications.findFirst({
      where: and(
        eq(emailVerifications.email, email),
        eq(emailVerifications.code, code),
        eq(emailVerifications.used, false),
        gt(emailVerifications.expiresAt, new Date())
      ),
    });

    if (!verification) {
      return res.status(400).json({ error: 'Invalid or expired code' });
    }

    // 标记验证码为已使用
    await db.update(emailVerifications)
      .set({ used: true })
      .where(eq(emailVerifications.id, verification.id));

    // 查找或创建用户
    const emailId = `email_${email}`;
    let user = await db.query.users.findFirst({
      where: eq(users.openId, emailId),
    });

    if (!user) {
      const [newUser] = await db.insert(users).values({
        openId: emailId,
        email,
        name: email.split('@')[0],
      }).returning();
      
      user = newUser;

      // 创建初始额度
      await db.insert(userCredits).values({
        userId: user.id,
        credits: 10,
        totalPurchased: 0,
      });
    }

    // 生成 JWT
    const token = jwt.sign(
      { id: user.id, openId: user.openId },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ success: true, user });
  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
});

export default router;
```

### 5.5 配置环境变量

| 变量名 | 说明 | 示例值 |
|-------|------|--------|
| SMTP_HOST | SMTP 服务器地址 | smtp.sendgrid.net |
| SMTP_PORT | SMTP 端口 | 587 |
| SMTP_SECURE | 是否使用 SSL | false |
| SMTP_USER | SMTP 用户名 | apikey |
| SMTP_PASS | SMTP 密码 | SG.xxxxx |
| SMTP_FROM | 发件人地址 | noreply@doestudio.com |

### 5.6 前端邮箱登录组件

```tsx
// client/src/components/EmailLogin.tsx

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export function EmailLogin() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [isLoading, setIsLoading] = useState(false);

  const sendCode = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/email/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setStep('code');
        toast.success('验证码已发送到您的邮箱');
      } else {
        toast.error('发送失败，请重试');
      }
    } catch (error) {
      toast.error('网络错误');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCode = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/email/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });

      if (response.ok) {
        toast.success('登录成功');
        window.location.href = '/studio';
      } else {
        toast.error('验证码错误或已过期');
      }
    } catch (error) {
      toast.error('网络错误');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {step === 'email' ? (
        <>
          <Input
            type="email"
            placeholder="请输入邮箱"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button
            onClick={sendCode}
            disabled={!email || isLoading}
            className="w-full"
          >
            {isLoading ? '发送中...' : '获取验证码'}
          </Button>
        </>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            验证码已发送到 {email}
          </p>
          <Input
            type="text"
            placeholder="请输入 6 位验证码"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            maxLength={6}
          />
          <Button
            onClick={verifyCode}
            disabled={code.length !== 6 || isLoading}
            className="w-full"
          >
            {isLoading ? '验证中...' : '登录'}
          </Button>
          <Button
            variant="link"
            onClick={() => setStep('email')}
            className="w-full"
          >
            返回修改邮箱
          </Button>
        </>
      )}
    </div>
  );
}
```

---

## 6. 配置微信登录

### 6.1 前置条件

1. 微信开放平台账号（https://open.weixin.qq.com/）
2. 已创建网站应用并通过审核
3. 已获取 AppID 和 AppSecret

### 6.2 安装依赖

```bash
pnpm add axios
```

### 6.3 创建微信认证路由

```typescript
// server/auth/wechat.ts

import { Router } from 'express';
import axios from 'axios';
import { db } from '../db';
import { users, userCredits } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

const router = Router();

const WECHAT_APP_ID = process.env.WECHAT_APP_ID!;
const WECHAT_APP_SECRET = process.env.WECHAT_APP_SECRET!;
const WECHAT_REDIRECT_URI = process.env.WECHAT_REDIRECT_URI!;

// 微信登录入口
router.get('/wechat', (req, res) => {
  const state = Math.random().toString(36).substring(7);
  
  // 保存 state 到 session 或 cookie（用于防止 CSRF）
  res.cookie('wechat_state', state, { maxAge: 5 * 60 * 1000 });

  const authUrl = `https://open.weixin.qq.com/connect/qrconnect?` +
    `appid=${WECHAT_APP_ID}` +
    `&redirect_uri=${encodeURIComponent(WECHAT_REDIRECT_URI)}` +
    `&response_type=code` +
    `&scope=snsapi_login` +
    `&state=${state}` +
    `#wechat_redirect`;

  res.redirect(authUrl);
});

// 微信回调
router.get('/wechat/callback', async (req, res) => {
  try {
    const { code, state } = req.query;

    // 验证 state
    if (state !== req.cookies.wechat_state) {
      return res.status(400).send('Invalid state');
    }

    // 用 code 换取 access_token
    const tokenResponse = await axios.get(
      `https://api.weixin.qq.com/sns/oauth2/access_token?` +
      `appid=${WECHAT_APP_ID}` +
      `&secret=${WECHAT_APP_SECRET}` +
      `&code=${code}` +
      `&grant_type=authorization_code`
    );

    const { access_token, openid } = tokenResponse.data;

    if (!access_token || !openid) {
      throw new Error('Failed to get access token');
    }

    // 获取用户信息
    const userResponse = await axios.get(
      `https://api.weixin.qq.com/sns/userinfo?` +
      `access_token=${access_token}` +
      `&openid=${openid}`
    );

    const wechatUser = userResponse.data;

    // 查找或创建用户
    const wechatId = `wechat_${openid}`;
    let user = await db.query.users.findFirst({
      where: eq(users.openId, wechatId),
    });

    if (!user) {
      const [newUser] = await db.insert(users).values({
        openId: wechatId,
        name: wechatUser.nickname,
        avatar: wechatUser.headimgurl,
      }).returning();
      
      user = newUser;

      // 创建初始额度
      await db.insert(userCredits).values({
        userId: user.id,
        credits: 10,
        totalPurchased: 0,
      });
    }

    // 生成 JWT
    const token = jwt.sign(
      { id: user.id, openId: user.openId },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.redirect('/studio');
  } catch (error) {
    console.error('WeChat auth error:', error);
    res.redirect('/login?error=wechat_failed');
  }
});

export default router;
```

### 6.4 配置环境变量

| 变量名 | 说明 |
|-------|------|
| WECHAT_APP_ID | 微信开放平台 AppID |
| WECHAT_APP_SECRET | 微信开放平台 AppSecret |
| WECHAT_REDIRECT_URI | 回调地址，如 https://your-domain.com/api/auth/wechat/callback |

### 6.5 前端微信登录按钮

```tsx
<Button
  onClick={() => window.location.href = '/api/auth/wechat'}
  className="w-full bg-green-500 hover:bg-green-600"
>
  <WechatIcon className="mr-2 h-4 w-4" />
  微信登录
</Button>
```

---

## 7. 替换为自定义认证系统

如果您不想使用 Manus OAuth，可以完全替换为自定义认证系统。

### 7.1 移除 Manus OAuth

**步骤 1**：删除 Manus OAuth 相关代码

```typescript
// server/_core/index.ts
// 删除或注释掉 Manus OAuth 相关的路由和中间件
```

**步骤 2**：更新前端 useAuth Hook

```typescript
// client/src/hooks/useAuth.ts

// 移除 Manus OAuth 相关逻辑
// 改为使用自定义认证端点
```

### 7.2 创建统一登录页面

```tsx
// client/src/pages/Login.tsx

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmailLogin } from '@/components/EmailLogin';

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-cyan-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">登录 DOE Studio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* 第三方登录 */}
            <div className="space-y-2">
              <Button
                onClick={() => window.location.href = '/api/auth/google'}
                variant="outline"
                className="w-full"
              >
                <GoogleIcon className="mr-2 h-4 w-4" />
                使用 Google 登录
              </Button>
              
              <Button
                onClick={() => window.location.href = '/api/auth/wechat'}
                variant="outline"
                className="w-full"
              >
                <WechatIcon className="mr-2 h-4 w-4" />
                使用微信登录
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  或使用邮箱
                </span>
              </div>
            </div>

            {/* 邮箱登录 */}
            <EmailLogin />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

### 7.3 添加登录保护路由

```tsx
// client/src/components/ProtectedRoute.tsx

import { useAuth } from '@/hooks/useAuth';
import { Redirect } from 'wouter';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  return <>{children}</>;
}
```

```tsx
// client/src/App.tsx

import { ProtectedRoute } from '@/components/ProtectedRoute';

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/docs" component={Docs} />
      <Route path="/pricing" component={Pricing} />
      
      {/* 需要登录的路由 */}
      <Route path="/studio">
        <ProtectedRoute>
          <Studio />
        </ProtectedRoute>
      </Route>
      <Route path="/studio/:id">
        <ProtectedRoute>
          <DOEStudio />
        </ProtectedRoute>
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}
```

---

## 8. 部署前检查清单

### 8.1 安全检查

| 检查项 | 说明 | 状态 |
|-------|------|------|
| JWT_SECRET | 使用强随机字符串，至少 32 字符 | [ ] |
| HTTPS | 生产环境必须使用 HTTPS | [ ] |
| Cookie 安全 | 设置 httpOnly、secure、sameSite | [ ] |
| CORS | 配置正确的跨域策略 | [ ] |
| 速率限制 | 防止暴力破解 | [ ] |

### 8.2 环境变量检查

```bash
# 必需的环境变量
JWT_SECRET=your-strong-secret-key-at-least-32-chars
DATABASE_URL=postgresql://...

# Google 登录（如果启用）
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
GOOGLE_CALLBACK_URL=https://your-domain.com/api/auth/google/callback

# 邮箱登录（如果启用）
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=xxx
SMTP_FROM=noreply@your-domain.com

# 微信登录（如果启用）
WECHAT_APP_ID=xxx
WECHAT_APP_SECRET=xxx
WECHAT_REDIRECT_URI=https://your-domain.com/api/auth/wechat/callback
```

### 8.3 数据库检查

```sql
-- 检查用户表结构
\d users

-- 检查索引
\di

-- 检查外键约束
SELECT * FROM information_schema.table_constraints 
WHERE table_name = 'users';
```

### 8.4 测试检查

| 测试项 | 说明 | 状态 |
|-------|------|------|
| 新用户注册 | 各种登录方式都能创建新用户 | [ ] |
| 现有用户登录 | 登录后能正确识别用户 | [ ] |
| Token 刷新 | Token 过期后能正确处理 | [ ] |
| 登出功能 | 登出后 Token 失效 | [ ] |
| 保护路由 | 未登录用户被正确重定向 | [ ] |

---

## 参考资料

1. [Google OAuth 2.0 文档](https://developers.google.com/identity/protocols/oauth2)
2. [微信开放平台文档](https://developers.weixin.qq.com/doc/oplatform/Website_App/WeChat_Login/Wechat_Login.html)
3. [Nodemailer 文档](https://nodemailer.com/)
4. [JWT 最佳实践](https://auth0.com/blog/jwt-authentication-best-practices/)
5. [OWASP 认证安全指南](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
