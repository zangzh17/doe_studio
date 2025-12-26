# DOE Studio 项目文件结构详解

本文档面向**开发经验较少的开发者**，详细介绍 DOE Studio 项目的完整文件结构，解释每个文件和目录的作用，并提供常见修改任务的指南。

---

## 目录

1. [项目整体结构](#1-项目整体结构)
2. [前端目录详解 (client/)](#2-前端目录详解-client)
3. [后端目录详解 (server/)](#3-后端目录详解-server)
4. [数据库目录详解 (drizzle/)](#4-数据库目录详解-drizzle)
5. [配置文件详解](#5-配置文件详解)
6. [文档目录详解 (docs/)](#6-文档目录详解-docs)
7. [常见修改任务指南](#7-常见修改任务指南)
8. [文件命名规范](#8-文件命名规范)

---

## 1. 项目整体结构

DOE Studio 是一个**全栈 Web 应用**，采用前后端分离架构。下面是项目的顶层目录结构：

```
raioptics_clone/
├── client/                 # 前端代码（React + TypeScript）
├── server/                 # 后端代码（Node.js + Express + tRPC）
├── drizzle/                # 数据库 Schema 和迁移
├── shared/                 # 前后端共享的代码
├── storage/                # S3 存储相关
├── docs/                   # 开发文档
├── dist/                   # 构建输出（自动生成）
├── node_modules/           # 依赖包（自动生成）
├── package.json            # 项目配置和依赖
├── tsconfig.json           # TypeScript 配置
├── vite.config.ts          # Vite 构建配置
├── drizzle.config.ts       # Drizzle ORM 配置
├── vitest.config.ts        # 测试配置
├── .env                    # 环境变量（需手动创建）
├── todo.md                 # 开发任务清单
└── DEVELOPMENT_GUIDE.md    # 主开发指南
```

### 1.1 技术栈概览

| 层级 | 技术 | 说明 |
|------|------|------|
| **前端框架** | React 19 | 用户界面构建 |
| **样式** | Tailwind CSS 4 | 原子化 CSS 框架 |
| **UI 组件** | shadcn/ui | 可定制的组件库 |
| **状态管理** | React Context + tRPC | 全局状态和服务器状态 |
| **后端框架** | Express + tRPC | API 服务 |
| **数据库** | PostgreSQL + Drizzle | 数据持久化 |
| **构建工具** | Vite | 快速开发和构建 |
| **语言** | TypeScript | 类型安全 |

---

## 2. 前端目录详解 (client/)

前端代码位于 `client/` 目录，采用标准的 React 项目结构。

```
client/
├── index.html              # HTML 入口文件
├── public/                 # 静态资源
│   └── favicon.ico         # 网站图标
└── src/                    # 源代码
    ├── main.tsx            # React 入口
    ├── App.tsx             # 根组件和路由
    ├── index.css           # 全局样式
    ├── const.ts            # 常量定义
    ├── pages/              # 页面组件
    ├── components/         # 可复用组件
    ├── contexts/           # React Context
    ├── hooks/              # 自定义 Hooks
    ├── lib/                # 工具函数
    └── _core/              # 核心功能（认证等）
```

### 2.1 入口文件

**`client/index.html`** - HTML 模板

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>DOE Studio</title>
    <!-- 可以在这里添加 Google Fonts 等外部资源 -->
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**`client/src/main.tsx`** - React 入口

这个文件初始化 React 应用，配置 tRPC 客户端和全局 Provider：

```typescript
// 主要职责：
// 1. 创建 tRPC 客户端
// 2. 配置 QueryClient（React Query）
// 3. 处理未授权错误的自动重定向
// 4. 渲染根组件
```

**`client/src/App.tsx`** - 路由配置

定义应用的所有路由：

```typescript
// 当前路由：
// /          - 首页 (Home)
// /studio    - 设计列表 (Studio)
// /studio/:id - 设计编辑器 (StudioEditor)
// /pricing   - 定价页面 (Pricing)
// /docs      - 文档页面 (Docs)
// *          - 404 页面 (NotFound)
```

### 2.2 页面组件 (pages/)

每个页面对应一个独立的路由。

```
pages/
├── Home.tsx              # 首页/Landing Page
├── Studio.tsx            # 设计列表页（我的设计 + 模板）
├── StudioEditor.tsx      # 设计编辑器（参数输入 + 结果展示）
├── Pricing.tsx           # 定价页面（Credits + 代工服务）
├── Docs.tsx              # 文档页面（快速入门 + FAQ）
├── DOEStudio.tsx         # 旧版编辑器（已弃用）
├── ComponentShowcase.tsx # 组件展示页（开发用）
└── NotFound.tsx          # 404 页面
```

**关键页面详解**：

| 页面 | 文件 | 主要功能 |
|------|------|----------|
| **Studio.tsx** | 设计列表 | 显示用户设计和模板，支持新建、删除、使用模板 |
| **StudioEditor.tsx** | 编辑器 | 左侧参数面板 + 右侧结果面板，支持预览和优化 |
| **Pricing.tsx** | 定价 | Credits 购买 + DOE 代工服务订购 |

### 2.3 组件目录 (components/)

可复用的 UI 组件。

```
components/
├── ui/                   # shadcn/ui 基础组件
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── input.tsx
│   ├── select.tsx
│   ├── tabs.tsx
│   └── ...               # 更多基础组件
├── Header.tsx            # 顶部导航栏
├── CollapsibleSidebar.tsx # 可折叠侧边栏
├── DOEParameters.tsx     # DOE 参数输入组件（核心）
├── DOEResults.tsx        # DOE 结果展示组件（核心）
├── DesignCard.tsx        # 设计卡片
├── DesignsSidebar.tsx    # 设计列表侧边栏
├── OpticalViewer.tsx     # 光学系统可视化
├── ErrorBoundary.tsx     # 错误边界
├── DashboardLayout.tsx   # 仪表板布局
└── Map.tsx               # 地图组件
```

**核心组件详解**：

**`DOEParameters.tsx`** - 参数输入组件

这是最复杂的组件之一，处理所有 DOE 类型的参数输入：

```typescript
// 主要功能：
// 1. 基本参数（工作距离、波长、器件尺寸等）
// 2. 模式特定参数（根据 DOE 类型显示不同选项）
// 3. 容差计算和实时提示
// 4. Fabrication Simulator
// 5. 预览和优化按钮
```

**`DOEResults.tsx`** - 结果展示组件

显示预览和优化结果：

```typescript
// 主要功能：
// 1. Preview Summary（参数摘要、警告信息）
// 2. 优化结果（相位图、光强分布、效率统计）
// 3. Plotly 图表渲染
// 4. 3D 可视化
```

### 2.4 上下文 (contexts/)

React Context 用于全局状态管理。

```
contexts/
├── LanguageContext.tsx   # 多语言支持（英/中/韩）
└── ThemeContext.tsx      # 主题切换（明/暗）
```

**`LanguageContext.tsx`** 示例：

```typescript
// 支持的语言
type Language = 'en' | 'zh' | 'ko';

// 翻译数据结构
const translations = {
  en: {
    'nav.home': 'Home',
    'nav.studio': 'Studio',
    // ...
  },
  zh: {
    'nav.home': '首页',
    'nav.studio': '工作室',
    // ...
  },
  ko: {
    'nav.home': '홈',
    'nav.studio': '스튜디오',
    // ...
  }
};
```

### 2.5 样式文件 (index.css)

全局样式和 Tailwind 配置：

```css
/* client/src/index.css */

/* Tailwind 基础层 */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* 自定义 CSS 变量（颜色主题） */
:root {
  --background: oklch(98% 0.01 240);
  --foreground: oklch(20% 0.02 240);
  --primary: oklch(55% 0.15 220);
  /* ... 更多颜色变量 */
}

.dark {
  --background: oklch(15% 0.02 240);
  --foreground: oklch(95% 0.01 240);
  /* ... 暗色主题变量 */
}
```

---

## 3. 后端目录详解 (server/)

后端代码位于 `server/` 目录，使用 Express + tRPC 架构。

```
server/
├── _core/                # 核心服务（框架级别）
│   ├── index.ts          # 服务器入口
│   ├── context.ts        # tRPC 上下文
│   ├── trpc.ts           # tRPC 配置
│   ├── env.ts            # 环境变量
│   ├── oauth.ts          # OAuth 认证
│   ├── cookies.ts        # Cookie 处理
│   ├── llm.ts            # LLM 集成
│   ├── imageGeneration.ts # 图片生成
│   ├── notification.ts   # 通知服务
│   └── ...
├── stripe/               # Stripe 支付
│   ├── checkout.ts       # Checkout 会话
│   ├── products.ts       # 产品定义
│   └── webhook.ts        # Webhook 处理
├── routers.ts            # API 路由定义
├── db.ts                 # 数据库操作
├── storage.ts            # S3 存储
├── index.ts              # 旧入口（已弃用）
├── auth.logout.test.ts   # 认证测试
└── designs.test.ts       # 设计 API 测试
```

### 3.1 核心服务 (_core/)

这些文件是框架级别的，通常不需要修改。

| 文件 | 作用 |
|------|------|
| `index.ts` | 服务器启动入口 |
| `context.ts` | 创建请求上下文（用户信息、数据库连接） |
| `trpc.ts` | tRPC 配置和 Procedure 定义 |
| `env.ts` | 环境变量类型定义和验证 |
| `oauth.ts` | OAuth 认证流程 |

### 3.2 API 路由 (routers.ts)

所有 API 端点定义在这个文件中：

```typescript
// server/routers.ts

export const appRouter = router({
  // 认证相关
  auth: router({
    me: publicProcedure.query(/* 获取当前用户 */),
    logout: protectedProcedure.mutation(/* 登出 */),
  }),
  
  // 设计相关
  designs: router({
    list: protectedProcedure.query(/* 获取用户设计列表 */),
    get: protectedProcedure.input(z.object({ id: z.number() })).query(/* 获取单个设计 */),
    create: protectedProcedure.input(/* schema */).mutation(/* 创建设计 */),
    update: protectedProcedure.input(/* schema */).mutation(/* 更新设计 */),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(/* 删除设计 */),
  }),
  
  // 模板相关
  templates: router({
    list: publicProcedure.query(/* 获取模板列表 */),
  }),
  
  // 支付相关
  payments: router({
    createCheckout: protectedProcedure.input(/* schema */).mutation(/* 创建支付会话 */),
  }),
});
```

### 3.3 数据库操作 (db.ts)

封装所有数据库查询：

```typescript
// server/db.ts

// 用户操作
export async function getUserByOpenId(openId: string) { /* ... */ }
export async function createUser(data: NewUser) { /* ... */ }
export async function updateUserCredits(userId: number, delta: number) { /* ... */ }

// 设计操作
export async function getDesignsByUserId(userId: number) { /* ... */ }
export async function getDesignById(id: number) { /* ... */ }
export async function createDesign(data: NewDesign) { /* ... */ }
export async function updateDesign(id: number, data: Partial<Design>) { /* ... */ }
export async function deleteDesign(id: number) { /* ... */ }

// 模板操作
export async function getTemplates() { /* ... */ }
```

### 3.4 Stripe 支付 (stripe/)

支付相关的代码：

```
stripe/
├── products.ts   # 产品和价格定义
├── checkout.ts   # 创建 Checkout 会话
└── webhook.ts    # 处理支付完成事件
```

---

## 4. 数据库目录详解 (drizzle/)

数据库 Schema 和迁移文件。

```
drizzle/
├── schema.ts             # 表结构定义
├── relations.ts          # 表关系定义
├── meta/                 # 迁移元数据
│   └── _journal.json     # 迁移历史
└── migrations/           # SQL 迁移文件
    └── 0000_xxx.sql      # 自动生成的迁移
```

### 4.1 Schema 定义 (schema.ts)

```typescript
// drizzle/schema.ts

import { mysqlTable, varchar, int, text, timestamp, mysqlEnum } from 'drizzle-orm/mysql-core';

// 用户表
export const users = mysqlTable('users', {
  id: int('id').primaryKey().autoincrement(),
  openId: varchar('open_id', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }),
  email: varchar('email', { length: 255 }),
  avatar: varchar('avatar', { length: 500 }),
  credits: int('credits').default(10),
  role: mysqlEnum('role', ['user', 'admin']).default('user'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 设计表
export const designs = mysqlTable('designs', {
  id: int('id').primaryKey().autoincrement(),
  userId: int('user_id').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  mode: varchar('mode', { length: 50 }).notNull(),
  parameters: text('parameters'),
  previewData: text('preview_data'),
  optimizationData: text('optimization_data'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 订单表
export const orders = mysqlTable('orders', {
  id: int('id').primaryKey().autoincrement(),
  userId: int('user_id').notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  amount: int('amount').notNull(),
  status: varchar('status', { length: 50 }).default('pending'),
  stripeSessionId: varchar('stripe_session_id', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
});
```

---

## 5. 配置文件详解

### 5.1 package.json

项目配置和依赖管理：

```json
{
  "name": "raioptics_clone",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "NODE_ENV=development tsx watch server/_core/index.ts",
    "build": "vite build && esbuild server/_core/index.ts ...",
    "start": "NODE_ENV=production node dist/index.js",
    "test": "vitest run",
    "db:push": "drizzle-kit generate && drizzle-kit migrate"
  },
  "dependencies": {
    // 前端依赖
    "react": "^19.2.1",
    "react-dom": "^19.2.1",
    "wouter": "^3.3.5",           // 路由
    "lucide-react": "^0.453.0",   // 图标
    "plotly.js-dist-min": "...",  // 图表
    
    // 后端依赖
    "@trpc/server": "^11.6.0",
    "drizzle-orm": "^0.44.5",
    "express": "^4.21.2",
    
    // 支付
    "stripe": "^17.7.0",
    
    // 工具
    "zod": "^4.1.12",             // 数据验证
    "superjson": "^1.13.3"        // JSON 序列化
  }
}
```

### 5.2 tsconfig.json

TypeScript 配置：

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "strict": true,
    "paths": {
      "@/*": ["./client/src/*"],
      "@shared/*": ["./shared/*"]
    }
  }
}
```

### 5.3 vite.config.ts

Vite 构建配置：

```typescript
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'client/src'),
      '@shared': path.resolve(__dirname, 'shared'),
    },
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3001'  // API 代理
    }
  }
});
```

### 5.4 drizzle.config.ts

Drizzle ORM 配置：

```typescript
export default defineConfig({
  schema: './drizzle/schema.ts',
  out: './drizzle/migrations',
  dialect: 'mysql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

---

## 6. 文档目录详解 (docs/)

开发文档集合。

```
docs/
├── DEPLOYMENT_GUIDE.md         # 部署指南（本文档）
├── DATABASE_GUIDE.md           # 数据库管理指南
├── PROJECT_STRUCTURE_GUIDE.md  # 项目结构详解（本文档）
├── PYTHON_BACKEND_GUIDE.md     # Python 后端集成指南
├── PLOTLY_CHARTS_GUIDE.md      # Plotly 图表指南
├── TEMPLATES_AND_PARAMS_GUIDE.md # 模板和参数指南
├── AUTH_AND_USER_GUIDE.md      # 认证系统指南
└── PAYMENT_SYSTEM_GUIDE.md     # 支付系统指南
```

---

## 7. 常见修改任务指南

### 7.1 添加新的 DOE 类型

**步骤 1：更新参数组件**

编辑 `client/src/components/DOEParameters.tsx`：

```typescript
// 1. 添加新模式到类型定义
type DOEMode = 'diffuser' | '1d_splitter' | '2d_spot' | 'lens' | 'lens_array' | 'prisms' | 'custom' | 'new_mode';

// 2. 添加模式特定参数
const renderModeSpecificParams = () => {
  switch (mode) {
    // ... 现有模式
    case 'new_mode':
      return (
        <div>
          {/* 新模式的参数输入 */}
        </div>
      );
  }
};
```

**步骤 2：更新结果组件**

编辑 `client/src/components/DOEResults.tsx`：

```typescript
// 添加新模式的结果展示逻辑
```

**步骤 3：添加翻译**

编辑 `client/src/contexts/LanguageContext.tsx`：

```typescript
const translations = {
  en: {
    'mode.new_mode': 'New Mode',
    // ...
  },
  zh: {
    'mode.new_mode': '新模式',
    // ...
  },
  ko: {
    'mode.new_mode': '새 모드',
    // ...
  }
};
```

### 7.2 添加新的 API 端点

**步骤 1：定义数据库操作**

编辑 `server/db.ts`：

```typescript
export async function getNewData() {
  return db.select().from(newTable);
}
```

**步骤 2：添加 tRPC 路由**

编辑 `server/routers.ts`：

```typescript
export const appRouter = router({
  // ... 现有路由
  newFeature: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getNewData();
    }),
  }),
});
```

**步骤 3：在前端调用**

```typescript
// 在组件中
const { data, isLoading } = trpc.newFeature.list.useQuery();
```

### 7.3 修改页面样式

**全局样式**：编辑 `client/src/index.css`

```css
/* 修改主色调 */
:root {
  --primary: oklch(55% 0.20 180);  /* 更改色相值 */
}
```

**组件样式**：直接在组件中使用 Tailwind 类

```tsx
<div className="bg-primary text-white p-4 rounded-lg">
  {/* 内容 */}
</div>
```

### 7.4 添加新页面

**步骤 1：创建页面组件**

创建 `client/src/pages/NewPage.tsx`：

```typescript
export default function NewPage() {
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold">New Page</h1>
    </div>
  );
}
```

**步骤 2：添加路由**

编辑 `client/src/App.tsx`：

```typescript
import NewPage from './pages/NewPage';

// 在 Route 组件中添加
<Route path="/new-page" component={NewPage} />
```

**步骤 3：添加导航链接**

编辑 `client/src/components/Header.tsx`：

```typescript
<Link href="/new-page">New Page</Link>
```

### 7.5 添加新的数据库表

**步骤 1：定义 Schema**

编辑 `drizzle/schema.ts`：

```typescript
export const newTable = mysqlTable('new_table', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
```

**步骤 2：运行迁移**

```bash
pnpm db:push
```

**步骤 3：添加数据库操作**

编辑 `server/db.ts`：

```typescript
import { newTable } from '../drizzle/schema';

export async function createNewRecord(name: string) {
  return db.insert(newTable).values({ name });
}
```

---

## 8. 文件命名规范

### 8.1 命名约定

| 类型 | 约定 | 示例 |
|------|------|------|
| **React 组件** | PascalCase | `DOEParameters.tsx` |
| **页面组件** | PascalCase | `StudioEditor.tsx` |
| **工具函数** | camelCase | `utils.ts` |
| **常量文件** | camelCase | `const.ts` |
| **类型定义** | PascalCase | `types.ts` |
| **测试文件** | `*.test.ts` | `auth.logout.test.ts` |
| **CSS 文件** | kebab-case | `index.css` |

### 8.2 目录约定

| 目录 | 用途 |
|------|------|
| `pages/` | 页面级组件，对应路由 |
| `components/` | 可复用组件 |
| `components/ui/` | 基础 UI 组件（shadcn/ui） |
| `contexts/` | React Context |
| `hooks/` | 自定义 Hooks |
| `lib/` | 工具函数 |
| `_core/` | 框架级代码（不要修改） |

### 8.3 导入路径

使用路径别名简化导入：

```typescript
// 使用别名
import { Button } from '@/components/ui/button';
import { useAuth } from '@/_core/hooks/useAuth';
import { CONSTANTS } from '@shared/const';

// 而不是相对路径
import { Button } from '../../../components/ui/button';
```

---

## 附录：快速参考表

### 文件位置速查

| 要修改的内容 | 文件位置 |
|--------------|----------|
| 首页内容 | `client/src/pages/Home.tsx` |
| 导航栏 | `client/src/components/Header.tsx` |
| DOE 参数输入 | `client/src/components/DOEParameters.tsx` |
| DOE 结果展示 | `client/src/components/DOEResults.tsx` |
| 路由配置 | `client/src/App.tsx` |
| 全局样式 | `client/src/index.css` |
| 多语言翻译 | `client/src/contexts/LanguageContext.tsx` |
| API 路由 | `server/routers.ts` |
| 数据库操作 | `server/db.ts` |
| 数据库表结构 | `drizzle/schema.ts` |
| 环境变量 | `.env` |

---

**文档版本**：1.0  
**最后更新**：2024年12月  
**作者**：Manus AI
