# Supabase 邮箱认证集成指南

## 🎯 概述

本指南将帮助你将 DOE Studio 的认证系统迁移到 Supabase 的邮箱认证系统，支持邮箱注册、登录、验证和密码找回功能。

## 📋 步骤清单

### 1. Supabase 控制台配置

1. 访问 [Supabase 控制台](https://app.supabase.com)
2. 注册账户并创建新项目
3. 进入 Authentication → Providers → Email
4. 启用 "Confirm email" 选项（可选，但推荐）
5. 配置 SMTP 邮件服务（可选，可以使用 Supabase 的默认服务）
6. 获取项目配置信息：
   - 进入 Settings → API
   - 复制 "Project URL"
   - 复制 "anon key"（匿名密钥）

### 2. 环境变量配置

复制 `.env.template` 为 `.env` 并填写：

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
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

## 📁 新增文件

- `server/_core/supabase-auth.ts` - Supabase 认证服务
- `server/_core/auth-email.ts` - 邮箱认证路由
- `server/_core/session.ts` - 会话管理工具
- `client/src/pages/LoginEmail.tsx` - 邮箱登录页面
- `.env.template` - 环境变量模板
- `SUPABASE_INTEGRATION_GUIDE.md` - 完整集成指南

## 📁 修改文件

- `drizzle/schema.ts` - 添加邮箱验证字段
- `server/db.ts` - 添加用户管理函数
- `server/_core/env.ts` - 添加 Supabase 配置
- `server/_core/index.ts` - 集成新认证路由
- `client/src/App.tsx` - 添加新路由
- `client/src/pages/Login.tsx` - 添加邮箱登录入口

## 🔍 故障排除

### 常见问题

1. **无法连接到 Supabase**
   - 检查 SUPABASE_URL 和 SUPABASE_ANON_KEY 是否正确
   - 确保网络可以访问 Supabase
   - 检查项目是否已启用邮箱认证

2. **邮件发送失败**
   - 检查 Supabase 控制台中的 SMTP 配置
   - 验证发件人邮箱地址
   - 检查垃圾邮件文件夹

3. **数据库迁移失败**
   - 确保 DATABASE_URL 正确
   - 检查数据库连接权限

## 📚 相关文档

- [Supabase 官方文档](https://supabase.com/docs)
- [Supabase Auth 指南](https://supabase.com/docs/guides/auth)
- [Supabase JavaScript SDK](https://supabase.com/docs/reference/javascript)

## 🎉 完成

恭喜！你已经成功将 DOE Studio 的认证系统迁移到 Supabase。用户现在可以使用邮箱注册、登录和找回密码了。

## 🔗 访问方式

- 主登录页面：`http://localhost:3000/login`
- 邮箱登录页面：`http://localhost:3000/login-email`

OAuth 登录（Google、微信）仍然可用，用户可以选择使用邮箱或第三方登录。

有任何问题或需要进一步的帮助，请随时告诉我！

## 📖 参考资料

- [阿里云 RDS Supabase 认证配置（中文）](https://help.aliyun.com/zh/rds/apsaradb-rds-for-postgresql/authentication)
- [邮件服务最佳实践（Resend + Supabase）](https://juejin.cn/post/7582067084840206390)
- [2025 最新完整实战（Vue3 + 邮箱 + 魔链）](https://blog.csdn.net/Java_GodZ/article/details/154736630)