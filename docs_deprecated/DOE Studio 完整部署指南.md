# DOE Studio 完整部署指南

本文档面向**零基础开发者**，详细介绍如何从零开始部署 DOE Studio 项目，包括本地开发环境搭建、各系统配置测试、生产环境部署，以及 GPU Serverless 资源建议。

---

## 目录

1. [前置知识和工具准备](#1-前置知识和工具准备)
2. [下载项目到本地](#2-下载项目到本地)
3. [本地开发环境搭建](#3-本地开发环境搭建)
4. [数据库配置](#4-数据库配置)
5. [用户认证系统配置](#5-用户认证系统配置)
6. [支付系统配置](#6-支付系统配置)
7. [功能测试清单](#7-功能测试清单)
8. [生产环境部署](#8-生产环境部署)
9. [GPU Serverless 资源建议](#9-gpu-serverless-资源建议)
10. [常见问题排查](#10-常见问题排查)

---

## 1. 前置知识和工具准备

### 1.1 需要了解的基础概念

在开始之前，您需要对以下概念有基本了解。如果您完全不熟悉，建议先花 30 分钟阅读相关入门教程。

| 概念 | 说明 | 推荐学习资源 |
|------|------|-------------|
| **Node.js** | JavaScript 运行时，用于运行服务器端代码 | [Node.js 官方入门](https://nodejs.org/en/learn/getting-started/introduction-to-nodejs) |
| **npm/pnpm** | Node.js 包管理器，用于安装依赖 | [pnpm 官方文档](https://pnpm.io/zh/motivation) |
| **PostgreSQL** | 关系型数据库，用于存储用户和设计数据 | [PostgreSQL 入门](https://www.postgresql.org/docs/current/tutorial.html) |
| **环境变量** | 存储敏感配置（如 API 密钥）的方式 | 见下文详细说明 |
| **终端/命令行** | 执行命令的工具 | Windows: PowerShell, Mac/Linux: Terminal |

### 1.2 需要安装的软件

请按顺序安装以下软件：

**第一步：安装 Node.js（版本 20 或更高）**

```bash
# 访问 https://nodejs.org 下载 LTS 版本
# 安装完成后验证：
node --version  # 应显示 v20.x.x 或更高
```

**第二步：安装 pnpm（推荐的包管理器）**

```bash
# 使用 npm 安装 pnpm
npm install -g pnpm

# 验证安装
pnpm --version  # 应显示 10.x.x 或更高
```

**第三步：安装 Git（版本控制工具）**

```bash
# 访问 https://git-scm.com 下载安装
# 验证安装
git --version
```

**第四步：安装代码编辑器**

推荐使用 [Visual Studio Code](https://code.visualstudio.com/)，并安装以下扩展：
- ESLint
- Prettier
- TypeScript Vue Plugin (Volar)
- Tailwind CSS IntelliSense

---

## 2. 下载项目到本地

### 2.1 从 Manus 导出项目

如果您是从 Manus 平台获取项目：

1. 在 Manus 界面点击 **Code** 面板
2. 点击 **Download All Files** 按钮
3. 解压下载的 ZIP 文件到您选择的目录

### 2.2 项目目录结构概览

解压后，您会看到以下目录结构：

```
raioptics_clone/
├── client/                 # 前端代码
│   ├── src/
│   │   ├── components/     # React 组件
│   │   ├── pages/          # 页面组件
│   │   ├── contexts/       # React 上下文
│   │   └── index.css       # 全局样式
│   └── index.html          # HTML 入口
├── server/                 # 后端代码
│   ├── _core/              # 核心服务（认证、数据库等）
│   ├── stripe/             # Stripe 支付相关
│   ├── db.ts               # 数据库操作
│   └── routers.ts          # API 路由
├── drizzle/                # 数据库 schema
├── docs/                   # 开发文档
├── package.json            # 项目配置
└── .env                    # 环境变量（需要创建）
```

---

## 3. 本地开发环境搭建

### 3.1 安装项目依赖

打开终端，进入项目目录：

```bash
# 进入项目目录
cd raioptics_clone

# 安装所有依赖（这可能需要几分钟）
pnpm install
```

**常见问题**：如果安装失败，尝试：
```bash
# 清除缓存后重试
pnpm store prune
pnpm install
```

### 3.2 创建环境变量文件

在项目根目录创建 `.env` 文件：

```bash
# Windows (PowerShell)
New-Item -Path .env -ItemType File

# Mac/Linux
touch .env
```

将以下内容复制到 `.env` 文件：

```env
# ========== 数据库配置 ==========
# 本地开发使用的 PostgreSQL 连接字符串
# 格式：postgresql://用户名:密码@主机:端口/数据库名
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/doe_studio

# ========== 认证配置 ==========
# JWT 密钥（用于用户会话，可以是任意随机字符串）
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# OAuth 配置（如果使用 Manus OAuth，保持默认）
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://manus.im

# ========== Stripe 支付配置 ==========
# 从 Stripe Dashboard 获取（测试模式）
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx

# ========== 应用配置 ==========
VITE_APP_TITLE=DOE Studio
VITE_APP_ID=doe-studio

# ========== Python 后端配置（可选）==========
# 如果您部署了 Python 优化后端
PYTHON_BACKEND_URL=http://localhost:8000
```

### 3.3 启动开发服务器

```bash
# 启动开发服务器
pnpm dev
```

如果一切正常，您会看到：
```
Server running on http://localhost:3000/
```

打开浏览器访问 `http://localhost:3000`，您应该能看到 DOE Studio 首页。

---

## 4. 数据库配置

### 4.1 本地 PostgreSQL 安装

**方法一：使用 Docker（推荐）**

如果您已安装 Docker，这是最简单的方式：

```bash
# 启动 PostgreSQL 容器
docker run --name doe-postgres \
  -e POSTGRES_PASSWORD=your_password \
  -e POSTGRES_DB=doe_studio \
  -p 5432:5432 \
  -d postgres:15

# 验证容器运行
docker ps
```

**方法二：直接安装 PostgreSQL**

1. 访问 [PostgreSQL 下载页面](https://www.postgresql.org/download/)
2. 下载并安装适合您操作系统的版本
3. 安装过程中设置密码（记住这个密码）
4. 安装完成后，创建数据库：

```bash
# 连接到 PostgreSQL
psql -U postgres

# 创建数据库
CREATE DATABASE doe_studio;

# 退出
\q
```

### 4.2 初始化数据库表

项目使用 Drizzle ORM 管理数据库。运行以下命令创建表：

```bash
# 推送 schema 到数据库
pnpm db:push
```

**成功输出示例**：
```
[✓] Changes applied to database
```

### 4.3 验证数据库连接

```bash
# 启动 Drizzle Studio（可视化数据库管理工具）
pnpm drizzle-kit studio
```

打开浏览器访问 `https://local.drizzle.studio`，您应该能看到数据库中的表。

---

## 5. 用户认证系统配置

### 5.1 认证系统概述

DOE Studio 支持多种认证方式：

| 认证方式 | 配置难度 | 说明 |
|----------|----------|------|
| Manus OAuth | 简单 | 默认集成，无需额外配置 |
| Google OAuth | 中等 | 需要在 Google Cloud Console 配置 |
| 邮箱验证码 | 中等 | 需要配置邮件服务（如 SendGrid） |
| 微信登录 | 复杂 | 需要微信开放平台账号 |

### 5.2 使用 Manus OAuth（默认）

如果您的项目部署在 Manus 平台，认证系统已自动配置。用户点击"登录"按钮即可使用 Manus 账号登录。

### 5.3 配置 Google OAuth

**第一步：创建 Google Cloud 项目**

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 启用 "Google+ API" 和 "Google Identity"

**第二步：创建 OAuth 凭据**

1. 进入 "APIs & Services" > "Credentials"
2. 点击 "Create Credentials" > "OAuth client ID"
3. 选择 "Web application"
4. 添加授权重定向 URI：
   - 本地开发：`http://localhost:3000/api/auth/callback/google`
   - 生产环境：`https://your-domain.com/api/auth/callback/google`
5. 复制 Client ID 和 Client Secret

**第三步：更新环境变量**

在 `.env` 文件中添加：

```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

### 5.4 测试认证系统

1. 启动开发服务器：`pnpm dev`
2. 访问 `http://localhost:3000`
3. 点击右上角 "Account" 按钮
4. 尝试登录/注册
5. 登录成功后，访问 `/studio` 应该能看到您的设计列表

---

## 6. 支付系统配置

### 6.1 Stripe 测试环境设置

**第一步：创建 Stripe 账号**

1. 访问 [Stripe Dashboard](https://dashboard.stripe.com/)
2. 注册账号（无需信用卡）
3. 确保处于 "Test mode"（左下角开关）

**第二步：获取 API 密钥**

1. 进入 "Developers" > "API keys"
2. 复制以下密钥：
   - Publishable key（以 `pk_test_` 开头）
   - Secret key（以 `sk_test_` 开头）

**第三步：配置 Webhook**

1. 进入 "Developers" > "Webhooks"
2. 点击 "Add endpoint"
3. 输入 Webhook URL：
   - 本地测试：使用 [Stripe CLI](https://stripe.com/docs/stripe-cli) 或 ngrok
   - 生产环境：`https://your-domain.com/api/stripe/webhook`
4. 选择要监听的事件：
   - `checkout.session.completed`
   - `payment_intent.succeeded`
5. 复制 Webhook signing secret（以 `whsec_` 开头）

**第四步：更新环境变量**

```env
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
```

### 6.2 本地测试 Webhook

使用 Stripe CLI 转发 Webhook 到本地：

```bash
# 安装 Stripe CLI
# Mac: brew install stripe/stripe-cli/stripe
# Windows: 下载安装包

# 登录
stripe login

# 转发 Webhook 到本地
stripe listen --forward-to localhost:3000/api/stripe/webhook

# 记录输出的 webhook signing secret，更新到 .env
```

### 6.3 测试支付流程

1. 访问 `/pricing` 页面
2. 点击 "Buy Credits" 按钮
3. 在 Stripe Checkout 页面使用测试卡号：
   - 卡号：`4242 4242 4242 4242`
   - 有效期：任意未来日期
   - CVC：任意 3 位数
4. 完成支付后，检查用户的 credits 是否增加

---

## 7. 功能测试清单

在部署到生产环境之前，请逐一测试以下功能：

### 7.1 基础功能测试

| 功能 | 测试步骤 | 预期结果 |
|------|----------|----------|
| 首页加载 | 访问 `/` | 显示 Landing Page |
| 语言切换 | 点击右上角语言按钮 | 界面文字切换为对应语言 |
| 导航 | 点击 Header 中的链接 | 正确跳转到对应页面 |
| 响应式布局 | 调整浏览器窗口大小 | 布局自适应变化 |

### 7.2 用户认证测试

| 功能 | 测试步骤 | 预期结果 |
|------|----------|----------|
| 登录 | 点击 Account > 登录 | 跳转到登录页面 |
| 注册 | 完成注册流程 | 成功创建账号 |
| 登出 | 点击 Account > 登出 | 返回未登录状态 |
| 会话保持 | 刷新页面 | 保持登录状态 |

### 7.3 设计功能测试

| 功能 | 测试步骤 | 预期结果 |
|------|----------|----------|
| 新建设计 | 点击 "New Design" | 创建新设计并跳转到编辑器 |
| 保存设计 | 修改参数后点击 "Save" | 显示保存成功提示 |
| 删除设计 | 点击设计卡片的删除按钮 | 设计从列表中移除 |
| 使用模板 | 点击模板的 "Use" 按钮 | 基于模板创建新设计 |

### 7.4 DOE 参数测试

| 功能 | 测试步骤 | 预期结果 |
|------|----------|----------|
| 模式切换 | 切换不同 DOE 模式 | 显示对应的参数选项 |
| 预览 | 点击 "Preview" 按钮 | 显示预览摘要和示意图 |
| 优化 | 点击 "Optimize" 按钮 | 显示优化结果（模拟数据） |
| 容差计算 | 输入参数 | 实时显示预估最小容差 |

### 7.5 支付功能测试

| 功能 | 测试步骤 | 预期结果 |
|------|----------|----------|
| 购买 Credits | 点击 "Buy Credits" | 跳转到 Stripe Checkout |
| 支付完成 | 使用测试卡完成支付 | Credits 增加 |
| 报价单下载 | 点击 "Download Quote" | 下载 PDF 文件 |

---

## 8. 生产环境部署

### 8.1 部署选项对比

| 平台 | 优点 | 缺点 | 推荐场景 |
|------|------|------|----------|
| **Manus** | 一键部署，自动配置 | 仅限 Manus 项目 | 快速上线 |
| **Vercel** | 免费额度，自动 CI/CD | 需要配置数据库 | 前端为主的项目 |
| **Railway** | 简单，支持数据库 | 免费额度有限 | 全栈项目 |
| **AWS/GCP** | 灵活，可扩展 | 配置复杂 | 大规模生产 |

### 8.2 使用 Manus 部署（推荐）

如果您的项目在 Manus 平台开发：

1. 确保已保存 Checkpoint
2. 点击界面右上角的 **Publish** 按钮
3. 等待部署完成
4. 获取公开访问链接

### 8.3 使用 Railway 部署

**第一步：准备项目**

确保 `package.json` 中有正确的构建和启动脚本：

```json
{
  "scripts": {
    "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "start": "NODE_ENV=production node dist/index.js"
  }
}
```

**第二步：创建 Railway 项目**

1. 访问 [Railway](https://railway.app/)
2. 点击 "New Project" > "Deploy from GitHub repo"
3. 连接您的 GitHub 仓库

**第三步：配置环境变量**

在 Railway Dashboard 中添加所有环境变量（与 `.env` 文件相同）。

**第四步：添加 PostgreSQL**

1. 在项目中点击 "New" > "Database" > "PostgreSQL"
2. Railway 会自动设置 `DATABASE_URL`

**第五步：部署**

Railway 会自动检测并部署。部署完成后，您会获得一个公开 URL。

### 8.4 生产环境检查清单

部署到生产环境前，请确保：

- [ ] 所有环境变量已正确配置
- [ ] 数据库已迁移（`pnpm db:push`）
- [ ] Stripe 已切换到生产模式（使用 `sk_live_` 密钥）
- [ ] Webhook URL 已更新为生产域名
- [ ] 已配置 HTTPS（大多数平台自动提供）
- [ ] 已测试所有关键功能

---

## 9. GPU Serverless 资源建议

### 9.1 为什么使用 Serverless GPU

DOE 相位优化需要 GPU 加速，但：
- 使用量可能很低（每天几次到几十次）
- 需要随时可用（用户不愿等待冷启动）
- 持续运行 GPU 实例成本高昂

Serverless GPU 是理想选择：按使用付费，同时保持可用性。

### 9.2 推荐的 Serverless GPU 平台

| 平台 | 冷启动时间 | 价格 | 特点 |
|------|------------|------|------|
| **Modal** | 1-3 秒 | $0.000016/秒 (T4) | 最快冷启动，Python 原生 |
| **Replicate** | 5-30 秒 | 按模型定价 | 简单 API，适合推理 |
| **RunPod** | 10-60 秒 | $0.00031/秒 (A4000) | 灵活，支持自定义镜像 |
| **AWS Lambda + EFS** | 30-120 秒 | 按使用付费 | 企业级，但冷启动慢 |

### 9.3 推荐方案：Modal

Modal 是目前冷启动最快的 Serverless GPU 平台，非常适合 DOE Studio 的使用场景。

**第一步：安装 Modal**

```bash
pip install modal
modal token new
```

**第二步：创建 Modal 应用**

创建 `python_backend/modal_app.py`：

```python
import modal

# 定义镜像（包含 PyTorch 和依赖）
image = modal.Image.debian_slim().pip_install(
    "torch",
    "numpy",
    "fastapi",
    "uvicorn"
)

# 创建应用
app = modal.App("doe-optimizer", image=image)

# GPU 函数
@app.function(gpu="T4", timeout=300)
def optimize_doe(params: dict) -> dict:
    import torch
    import numpy as np
    
    # 您的优化算法
    # ...
    
    return {
        "phase_map": phase_map.tolist(),
        "efficiency": efficiency,
        "uniformity": uniformity
    }

# Web 端点
@app.function()
@modal.web_endpoint(method="POST")
def api_optimize(params: dict):
    result = optimize_doe.remote(params)
    return result
```

**第三步：部署**

```bash
modal deploy python_backend/modal_app.py
```

**第四步：集成到前端**

更新 `.env`：

```env
PYTHON_BACKEND_URL=https://your-modal-app.modal.run
```

### 9.4 保持低延迟的技巧

1. **预热函数**：定期调用（如每 5 分钟）保持实例温暖
2. **使用 keep_warm**：Modal 支持 `keep_warm=1` 参数保持一个实例常驻
3. **优化镜像**：减小 Docker 镜像大小加快冷启动
4. **分离轻量操作**：Preview 计算不需要 GPU，可以在 Node.js 端完成

### 9.5 成本估算

假设每天 50 次优化，每次 30 秒：

| 平台 | 月成本估算 |
|------|-----------|
| Modal (T4) | ~$0.72 |
| RunPod (A4000) | ~$14 |
| 持续运行 T4 | ~$150+ |

---

## 10. 常见问题排查

### 10.1 数据库连接失败

**症状**：启动时报错 `ECONNREFUSED` 或 `Connection refused`

**解决方案**：
1. 确认 PostgreSQL 正在运行
2. 检查 `DATABASE_URL` 格式是否正确
3. 确认端口 5432 未被占用

```bash
# 检查 PostgreSQL 状态
# Docker:
docker ps | grep postgres

# 直接安装:
pg_isready -h localhost -p 5432
```

### 10.2 认证失败

**症状**：登录后立即被登出，或显示 "Unauthorized"

**解决方案**：
1. 检查 `JWT_SECRET` 是否设置
2. 确认 Cookie 设置正确（检查浏览器开发者工具）
3. 清除浏览器缓存和 Cookie

### 10.3 Stripe Webhook 不工作

**症状**：支付成功但 Credits 未增加

**解决方案**：
1. 检查 Webhook URL 是否正确
2. 确认 `STRIPE_WEBHOOK_SECRET` 正确
3. 查看 Stripe Dashboard 中的 Webhook 日志

```bash
# 本地测试时，确保 Stripe CLI 正在运行
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

### 10.4 构建失败

**症状**：`pnpm build` 报错

**解决方案**：
1. 检查 TypeScript 错误：`pnpm check`
2. 确保所有依赖已安装：`pnpm install`
3. 清除缓存重试：

```bash
rm -rf node_modules .pnpm-store
pnpm install
pnpm build
```

---

## 附录：环境变量完整列表

| 变量名 | 必需 | 说明 | 示例值 |
|--------|------|------|--------|
| `DATABASE_URL` | 是 | PostgreSQL 连接字符串 | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | 是 | JWT 签名密钥 | 随机字符串 |
| `STRIPE_SECRET_KEY` | 是* | Stripe 密钥 | `sk_test_xxx` |
| `STRIPE_WEBHOOK_SECRET` | 是* | Webhook 密钥 | `whsec_xxx` |
| `VITE_STRIPE_PUBLISHABLE_KEY` | 是* | Stripe 公钥 | `pk_test_xxx` |
| `GOOGLE_CLIENT_ID` | 否 | Google OAuth | `xxx.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | 否 | Google OAuth | 密钥字符串 |
| `PYTHON_BACKEND_URL` | 否 | Python 后端地址 | `http://localhost:8000` |

*如果不使用支付功能，可以省略 Stripe 相关变量。

---

**文档版本**：1.0  
**最后更新**：2024年12月  
**作者**：Manus AI
