# MemFire Cloud 邮箱认证集成指南

## 🎯 概述

本指南将帮助你将 DOE Studio 的认证系统从 OAuth 迁移到 MemFire Cloud 的邮箱认证系统。

## 📋 步骤清单

### 1. MemFire Cloud 控制台配置

1. 访问 [MemFire Cloud 控制台](https://cloud.memfiredb.com)
2. 创建新项目
3. 启用邮箱认证提供商
4. 配置 SMTP 邮件服务（可以使用内置服务）
5. 获取项目 URL 和匿名密钥
6. 设置重定向 URL：
   - 开发环境：`http://localhost:3000`
   - 生产环境：`https://your-domain.com`

### 2. 环境变量配置

复制 `.env.template` 为 `.env` 并填写：

```env
MEMFIRE_URL=https://your-project.memfiredb.com
MEMFIRE_ANON_KEY=your-anon-key
```

### 3. 数据库迁移

运行数据库迁移以应用新的 schema：

```bash
pnpm db:push
```

### 4. 测试新功能

1. 访问 `http://localhost:3000/login`
2. 点击 "Continue with Email" 或 "使用邮箱登录"
3. 测试注册功能
4. 检查邮箱验证邮件
5. 测试登录功能
6. 测试密码重置功能

## 🔧 API 端点

新的邮箱认证 API 端点：

- `POST /api/auth/email/register` - 邮箱注册
- `POST /api/auth/email/login` - 邮箱登录
- `POST /api/auth/email/reset-password` - 请求密码重置
- `POST /api/auth/email/update-password` - 使用令牌更新密码
- `GET /api/auth/email/verify-email?token=` - 邮箱验证
- `POST /api/auth/email/resend-verification` - 重新发送验证邮件

## 🚀 新功能

1. **邮箱注册** - 用户可以使用邮箱和密码注册
2. **邮箱验证** - 自动发送验证邮件
3. **密码找回** - 通过邮件重置密码
4. **多语言支持** - 支持英文、中文、韩文

## 🔄 与现有 OAuth 的兼容性

- OAuth 登录（Google、微信）仍然可用
- 用户可以选择使用邮箱或 OAuth 登录
- 同一个邮箱地址只能注册一个账户

## 📁 新增文件

- `server/_core/memfire-auth.ts` - MemFire Cloud 认证服务
- `server/_core/auth-email.ts` - 邮箱认证路由
- `server/_core/session.ts` - 会话管理工具
- `client/src/pages/LoginEmail.tsx` - 邮箱登录页面

## 📁 修改文件

- `drizzle/schema.ts` - 添加邮箱验证字段
- `server/db.ts` - 添加用户管理函数
- `server/_core/env.ts` - 添加 MemFire 配置
- `server/_core/index.ts` - 集成新认证路由
- `client/src/App.tsx` - 添加新路由
- `client/src/pages/Login.tsx` - 添加邮箱登录入口

## 🔍 故障排除

### 常见问题

1. **无法连接到 MemFire Cloud**
   - 检查 MEMFIRE_URL 和 MEMFIRE_ANON_KEY 是否正确
   - 确保网络可以访问 MemFire Cloud

2. **邮件发送失败**
   - 检查 MemFire Cloud 控制台中的 SMTP 配置
   - 验证发件人邮箱地址

3. **数据库迁移失败**
   - 确保 DATABASE_URL 正确
   - 检查数据库连接权限

## 📚 相关文档

- [MemFire Cloud 文档](https://docs.memfiredb.com)
- [Supabase Auth 文档](https://supabase.com/docs/guides/auth)（MemFire Cloud 基于 Supabase）

## 🎉 完成

恭喜！你已经成功将 DOE Studio 的认证系统迁移到 MemFire Cloud。用户现在可以使用邮箱注册、登录和找回密码了。