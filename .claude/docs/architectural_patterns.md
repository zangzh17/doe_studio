# 架构模式与约定

本文档描述了 DOE Studio 代码库中使用的重复性架构模式、设计决策和约定。

## 1. tRPC API 架构

**模式**: 使用 tRPC 进行类型安全的 API 通信，基于中间件的身份验证。

**核心文件**:
- server/_core/trpc.ts:1-46 - tRPC 配置和程序定义
- server/routers.ts:1-215 - 包含所有端点的 API 路由器
- client/src/lib/trpc.ts:1-5 - 客户端 tRPC 设置
- client/src/main.tsx - tRPC 客户端初始化

**实现细节**:
- 三种不同访问级别的程序类型:
  - `publicProcedure` - 无需身份验证
  - `protectedProcedure` - 需要已认证用户 (server/_core/trpc.ts:28)
  - `adminProcedure` - 需要管理员角色 (server/_core/trpc.ts:30-45)
- 用于身份验证检查的中间件链 (server/_core/trpc.ts:13-26)
- 路由器组合模式 (server/routers.ts:36-212)
- 使用 SuperJSON 进行数据转换
- 使用 Zod 模式进行输入验证 (server/routers.ts:19-34)

**使用模式**:
```typescript
// 服务端: 定义具有类型化输入/输出的端点
router({
  feature: router({
    action: protectedProcedure
      .input(z.object({ ... }))
      .mutation(async ({ ctx, input }) => { ... })
  })
})

// 客户端: 类型安全的使用
const { data } = trpc.feature.action.useMutation();
```

## 2. 数据库仓库模式

**模式**: 使用 Drizzle ORM 的集中式数据访问层，具有延迟连接初始化。

**核心文件**:
- drizzle/schema.ts:1-120 - 数据表结构定义
- server/db.ts:1-180 - 数据库操作
- server/_core/context.ts - 将数据库注入请求上下文

**实现细节**:
- Schema 优先的方法，使用 TypeScript 类型推断
- 延迟数据库连接 (server/db.ts:8-18)
- 仓库函数封装所有查询
- 驼峰式命名约定
- 为 Insert/Select 操作导出类型

**约定**:
- 所有数据库访问都通过 server/db.ts 函数进行
- 永远不要在路由器或业务逻辑中编写原始 SQL 查询
- 使用 Drizzle 的类型安全查询构建器
- 优雅地处理空数据库，记录警告

## 3. Lucia 身份验证模式

**模式**: 使用 Lucia Auth 进行基于会话的身份验证，支持 OAuth 提供商（Google、微信）。

**核心文件**:
- server/_core/lucia.ts:1-77 - Lucia 配置和适配器设置
- server/_core/oauth-providers.ts:1-90 - OAuth 提供商实现
- server/_core/auth.ts:1-275 - OAuth 路由和回调
- server/_core/context.ts:1-55 - 请求上下文中的会话验证
- drizzle/schema.ts:31-64 - Sessions 和 OAuth accounts 表

**实现细节**:
- Lucia Auth 与 Drizzle MySQL 适配器 (server/_core/lucia.ts:16-25)
- 具有可配置属性的会话 cookie (server/_core/lucia.ts:30-38)
- 从数据库映射用户属性 (server/_core/lucia.ts:39-48)
- 通过 Arctic 库实现 Google OAuth (server/_core/oauth-providers.ts:10-14)
- 自定义微信 OAuth 实现 (server/_core/oauth-providers.ts:21-87)

**OAuth 流程**:
```
1. 用户点击登录按钮 → /api/auth/google 或 /api/auth/wechat
2. 生成 state 并重定向到 OAuth 提供商
3. 提供商回调 → /api/auth/{provider}/callback
4. 用 code 交换 token，获取用户信息
5. 在数据库中创建/更新用户和 OAuth 账户
6. 创建 Lucia 会话并设置 cookie
7. 重定向到 /studio
```

**会话验证** (server/_core/context.ts:16-42):
```
1. 从 cookie 中提取会话 ID (doe_session)
2. 使用 Lucia 验证会话
3. 将用户注入 tRPC 上下文
4. 如需要则刷新会话
```

**核心数据表**:
- `users` - 用户账户，使用字符串 ID (varchar)
- `sessions` - Lucia 会话，带有过期时间
- `oauthAccounts` - 将 OAuth 提供商链接到用户

## 4. React Context + 自定义 Hooks 模式

**模式**: 带有伴随自定义 hooks 的 Context 提供者，用于类型安全的全局状态访问。

**核心文件**:
- client/src/contexts/ThemeContext.tsx
- client/src/contexts/LanguageContext.tsx
- client/src/App.tsx:32-42 - Provider 组合

**实现细节**:
- 使用 TypeScript 接口定义 Context
- 带有 props 的 Provider 组件
- 自定义 hook 强制使用 provider
- LocalStorage 持久化客户端偏好设置
- 在 App 根部组合 Provider

**模式结构**:
```
1. 定义 context 类型接口
2. 创建具有 undefined 默认值的 context
3. Provider 组件管理状态
4. 自定义 hook 验证 context 可用性
5. 如果在 provider 外使用 hook 则抛出错误
```

## 5. 路径别名配置

**模式**: 一致使用路径别名以在整个代码库中实现更清晰的导入。

**核心文件**:
- vite.config.ts:14-19 - Vite 别名配置
- tsconfig.json - TypeScript 路径映射

**别名**:
- `@/` → `client/src/` (vite.config.ts:16)
- `@shared/` → `shared/` (vite.config.ts:17)
- `@assets/` → `attached_assets/` (vite.config.ts:18)

**使用约定**:
- 对于跨目录导入始终使用别名
- 永远不要使用 `../../../` 这样的相对路径
- 示例:
  - `import { Button } from '@/components/ui/button'`
  - `import { UNAUTHED_ERR_MSG } from '@shared/const'`

## 6. Zod Schema 验证模式

**模式**: 使用与路由器共置的 Zod schemas 进行请求验证。

**核心文件**:
- server/routers.ts:19-34 - DOE 参数 schema
- server/routers.ts:65-100 - procedures 中的输入验证

**实现细节**:
- 在路由器文件顶部定义 schemas (server/routers.ts:19-34)
- 在 procedures 上使用 `.input()` 进行验证
- 跨多个端点重用 schemas
- 使用 `.optional()` 定义可选字段
- 为受限值使用枚举验证

**优势**:
- 从 schema 到 TypeScript 的类型推断
- 在 API 边界进行运行时验证
- 自文档化的 API 契约

## 7. 错误边界模式

**模式**: React 错误边界优雅地捕获和处理组件错误。

**核心文件**:
- client/src/components/ErrorBoundary.tsx
- client/src/App.tsx:32 - 根级错误边界

**约定**:
- 在 ErrorBoundary 中包装整个应用
- 可以嵌套边界以实现细粒度的错误处理
- 防止组件错误导致整个应用崩溃

## 8. 代码组织 - _core 约定

**模式**: 在 `_core/` 目录中隔离框架和基础设施代码。

**位置**:
- server/_core/ - 服务器基础设施 (tRPC, auth, context, Lucia)
- client/src/_core/ - 客户端基础设施 (hooks)
- shared/_core/ - 共享工具和错误

**约定**:
- _core 目录包含框架级别的代码
- 应用业务逻辑保持在 _core 之外
- _core 文件应该很少需要修改
- 示例:
  - server/_core/trpc.ts - tRPC 设置
  - server/_core/lucia.ts - 认证配置
  - server/_core/context.ts - 请求上下文

## 9. 数据库 Schema 模式

**模式**: 一致的表设计，具有通用列和命名约定。

**核心文件**:
- drizzle/schema.ts:1-120

**核心数据表**:
- `users` - 用户账户（字符串 ID，用于 Lucia 兼容性）
- `sessions` - Lucia 会话存储
- `oauthAccounts` - OAuth 提供商链接（复合键: provider + providerUserId）
- `doeDesigns` - 用户的 DOE 设计（int ID，string userId 外键）
- `doeTemplates` - 预配置的模板

**约定**:
- 用户 ID 是 varchar（字符串）以兼容 Lucia (schema.ts:9)
- 其他实体使用自增 int ID (schema.ts:69, 97)
- 时间戳列: `createdAt`, `updatedAt` (schema.ts:20-22)
- 外键使用 `userId` 命名 (schema.ts:35, 53, 72)
- 枚举用于受限值 (schema.ts:17, 78)
- JSON 列用于灵活数据 (schema.ts:80-84)
- 驼峰式列名匹配 TypeScript

**标准字段**:
```typescript
id: varchar("id", { length: 255 }).primaryKey()  // 用于 users
id: int("id").autoincrement().primaryKey()       // 用于其他表
createdAt: timestamp("createdAt").defaultNow().notNull()
updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
```

## 10. React Query 集成模式

**模式**: TanStack Query (React Query) 与 tRPC 集成用于服务器状态管理。

**核心文件**:
- client/src/main.tsx - QueryClient 设置
- client/src/lib/trpc.ts - tRPC React 集成

**实现细节**:
- 单一 QueryClient 实例
- 全局错误订阅
- 查询和变更缓存监控
- 自动错误日志
- Provider 包装

**模式**:
```
1. 创建 QueryClient
2. 订阅缓存事件
3. 全局处理错误
4. 在 providers 中包装应用 (tRPC + QueryClient)
```

## 11. Monorepo 结构模式

**模式**: 客户端、服务器和共享代码在单个仓库中，具有明确的边界。

**结构**:
- `client/` - React 前端 (vite.config.ts:22)
- `server/` - Express + tRPC 后端
- `shared/` - 客户端和服务器共用的代码
- `drizzle/` - 数据库 schema 和迁移
- 根级配置文件

**优势**:
- 客户端和服务器之间共享类型
- 单一依赖管理 (package.json)
- 统一构建流程

## 12. 环境变量模式

**模式**: 通过集中式配置进行类型安全的环境变量访问。

**核心文件**:
- server/_core/env.ts - 环境变量定义

**必需变量**:
```
DATABASE_URL          # MySQL 连接字符串
BASE_URL              # 应用基础 URL (http://localhost:3000)
GOOGLE_CLIENT_ID      # Google OAuth client ID
GOOGLE_CLIENT_SECRET  # Google OAuth client secret
WECHAT_APP_ID         # 微信 OAuth app ID
WECHAT_APP_SECRET     # 微信 OAuth app secret
ADMIN_EMAIL           # 管理员用户邮箱
JWT_SECRET            # 会话的 cookie secret
```

**约定**:
- 所有环境变量通过 ENV 对象访问 (server/_core/env.ts)
- 为必需变量定义类型
- 永远不要在业务逻辑中直接访问 process.env

## 13. 数据库类型兼容性模式 ⭐

**模式**: 确保数据库表之间的类型一致性，特别是用户 ID 字段。

**关键原则**:
- Lucia Auth 要求用户 ID 必须是 `varchar(255)`，不能是 `int`
- 所有引用 users.id 的外键必须使用相同的 `varchar(255)` 类型


**相关文件**:
- drizzle/schema.ts:9 - users.id 定义
- drizzle/schema.ts:35 - sessions.userId 外键
- drizzle/schema.ts:53 - oauth_accounts.userId 外键
- drizzle/schema.ts:72 - doe_designs.userId 外键

## 14. 模板参数类型灵活性模式 ⭐

**模式**: 处理数据库存储的数值和 UI 显示的字符串之间的类型差异。

**问题背景**:
- 数据库中的 DOE 模板参数存储为纯数字（例如 `workingDistance: 100`）
- UI 组件期望带单位的字符串（例如 `"100mm"`）
- 需要灵活处理两种类型以避免运行时错误

**解决方案**: 类型联合和安全转换

```typescript
// ✅ 接受字符串或数字
function parseValueWithUnit(value: string | number): { value: number; unit: string } {
  const strValue = String(value);  // 安全转换为字符串
  const match = strValue.match(/^([\d.]+)\s*([a-zA-Z°]+)?$/);
  if (match) {
    return { value: parseFloat(match[1]), unit: match[2] || "" };
  }
  return { value: 0, unit: "" };
}

// ✅ 安全检查无限距离
const isInfiniteDistance = String(params.workingDistance || "").toLowerCase() === "inf";
```

**单位转换函数** (client/src/components/DOEParameters.tsx):
- `convertToMm(value: string | number)` - 转换为毫米
- `convertToNm(value: string | number)` - 转换为纳米
- `convertToDegrees(value: string | number)` - 转换为角度

**最佳实践**:
1. 在调用字符串方法前始终使用 `String()` 转换
2. 使用类型联合 `string | number` 而不是假设单一类型
3. 提供默认值处理 `undefined/null` 情况
4. 在解析前验证输入格式

**相关文件**:
- client/src/components/DOEParameters.tsx:100-150 - 类型转换函数
- drizzle/schema.ts:102-111 - 模板参数 JSON 存储

## 15. 数据库迁移工作流 ⭐

**模式**: 安全且一致的数据库 schema 变更流程。

**标准工作流**:
```bash
# 1. 修改 schema 定义
# 编辑 drizzle/schema.ts

# 2. 生成并应用迁移
pnpm db:push

# 3. 验证变更
# 运行应用并测试受影响的功能
```

**迁移配置** (drizzle.config.ts):
```typescript
export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle/migrations",  // 迁移文件输出目录
  dialect: "mysql",
  dbCredentials: {
    url: connectionString,
  },
});
```

**常见迁移场景**:

1. **修改列类型** (例如 int → varchar):
```javascript
await connection.execute(`
  ALTER TABLE doe_designs
  MODIFY COLUMN userId varchar(255) NOT NULL
`);
```

2. **重建表** (当列类型不兼容时):
```javascript
// 1. 检查表是否为空（安全性检查）
const [rows] = await connection.execute('SELECT COUNT(*) as count FROM users');
if (rows[0].count > 0) {
  throw new Error('Table has data, migration unsafe');
}

// 2. 删除依赖表（按正确顺序）
await connection.execute('DROP TABLE IF EXISTS oauth_accounts');
await connection.execute('DROP TABLE IF EXISTS sessions');
await connection.execute('DROP TABLE IF EXISTS users');

// 3. 使用新 schema 重建
await connection.execute(`CREATE TABLE users (...)`);
```

3. **添加外键约束**:
```javascript
await connection.execute(`
  ALTER TABLE sessions
  ADD CONSTRAINT sessions_userId_fkey
  FOREIGN KEY (userId) REFERENCES users(id)
  ON DELETE CASCADE
`);
```

**迁移最佳实践**:
- ✅ 始终先备份生产数据
- ✅ 在开发环境测试迁移
- ✅ 使用事务包装多个变更（如果数据库支持）
- ✅ 验证外键约束已正确添加
- ✅ 检查索引是否按预期创建
- ❌ 不要在有数据的表上执行破坏性操作（除非已备份）
- ❌ 不要跳过迁移步骤直接修改生产数据库

**故障排查**:
- **错误**: "Table doesn't exist" → 运行 `pnpm db:push` 应用迁移
- **错误**: "Column type mismatch" → 检查 schema 定义与实际表结构
- **错误**: "Foreign key constraint fails" → 确认引用的表和列存在且类型匹配

## 16. 类型强制转换最佳实践 ⭐

**模式**: 在数据库数值类型和应用类型之间安全地转换。

**关键原则**:
1. **不要假设类型** - 使用类型守卫和验证
2. **提供后备值** - 处理 undefined/null 情况
3. **显式转换** - 使用 `String()`, `Number()`, `Boolean()` 而不是隐式强制转换

**示例模式**:

```typescript
// ✅ 安全的字符串转换
const strValue = String(value ?? "");  // 处理 null/undefined

// ✅ 安全的数字转换
const numValue = Number(value) || 0;  // 提供默认值

// ✅ 安全的布尔转换
const boolValue = Boolean(value ?? false);

// ✅ JSON 解析带错误处理
let params = {};
try {
  params = typeof design.parameters === "string"
    ? JSON.parse(design.parameters)
    : design.parameters;
} catch (error) {
  console.error("Invalid JSON:", error);
  params = {};
}

// ✅ 可选链和空值合并
const distance = params?.workingDistance ?? "100mm";

// ❌ 避免直接调用字符串方法
params.workingDistance.toLowerCase()  // 如果是数字会崩溃

// ✅ 先转换再调用
String(params.workingDistance).toLowerCase()
```

**数据库到应用的转换**:
```typescript
// 从数据库读取（可能是任何类型）
const dbValue: any = row.parameters;

// 安全解析
const parameters = (() => {
  if (typeof dbValue === 'string') {
    try { return JSON.parse(dbValue); }
    catch { return {}; }
  }
  return dbValue ?? {};
})();

// 访问嵌套属性时使用可选链
const distance = parameters?.workingDistance;

// 在使用前验证类型
if (typeof distance === 'number' || typeof distance === 'string') {
  const mm = convertToMm(distance);
}
```

**相关模式**:
- 类型守卫: `typeof value === "string"`
- 类型断言: `value as Type` (谨慎使用)
- 类型谓词: `function isString(value: any): value is string`
- Zod 验证: 在 API 边界验证类型

## 附加约定

### 文件命名
- React 组件: PascalCase (DOEParameters.tsx)
- 工具文件: camelCase (db.ts, const.ts)
- 页面: PascalCase (Home.tsx, Studio.tsx, Login.tsx)
- 测试文件: *.test.ts 后缀

### 导入顺序（观察到的模式）
1. 外部包 (@trpc, react, lucia 等)
2. 内部别名 (@/, @shared/)
3. 相对导入 (./components)
4. CSS 导入 (./index.css)

### 注释
- 表 schema 使用 JSDoc (drizzle/schema.ts)
- 复杂逻辑使用内联注释
- 优先使用类型注解而不是注释

### 身份验证模式
- 用户 ID 在整个代码库中始终是字符串 (varchar)
- 会话 cookie 名称: `doe_session`
- OAuth state cookies: `google_oauth_state`, `wechat_oauth_state`
- 通过 `user.role === "admin"` 检查管理员

### 会话管理
- 会话有效期: 30 天（可在 server/_core/lucia.ts:32 配置）
- Cookie 属性: secure (生产环境), sameSite: "lax"
- 自动会话刷新在接近过期时触发
