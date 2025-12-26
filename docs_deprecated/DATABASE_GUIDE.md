# DOE Studio 数据库管理指南

本文档面向**数据库新手**，详细介绍如何管理 DOE Studio 的数据库，包括本地开发环境配置、生产环境管理、数据备份恢复、以及常见问题排查。

---

## 目录

1. [数据库基础概念](#1-数据库基础概念)
2. [本地数据库部署](#2-本地数据库部署)
3. [数据库 Schema 管理](#3-数据库-schema-管理)
4. [常用数据库操作](#4-常用数据库操作)
5. [生产环境数据库](#5-生产环境数据库)
6. [数据备份与恢复](#6-数据备份与恢复)
7. [性能优化](#7-性能优化)
8. [常见问题排查](#8-常见问题排查)

---

## 1. 数据库基础概念

### 1.1 什么是数据库

数据库是存储和管理数据的系统。DOE Studio 使用 **PostgreSQL**（也称 Postgres），这是一个开源的关系型数据库，以其可靠性和功能丰富著称。

### 1.2 关键术语解释

| 术语 | 解释 | 类比 |
|------|------|------|
| **数据库** | 存储数据的容器 | 一个文件柜 |
| **表（Table）** | 存储特定类型数据的结构 | 文件柜中的一个抽屉 |
| **行（Row）** | 表中的一条记录 | 抽屉中的一个文件夹 |
| **列（Column）** | 数据的属性 | 文件夹上的标签 |
| **主键（Primary Key）** | 唯一标识一行的列 | 文件夹的编号 |
| **外键（Foreign Key）** | 关联其他表的列 | 指向其他文件夹的引用 |
| **Schema** | 数据库结构的定义 | 文件柜的设计图 |
| **迁移（Migration）** | Schema 的版本化变更 | 改造文件柜的步骤 |

### 1.3 DOE Studio 的数据库结构

DOE Studio 使用以下主要表：

```
┌─────────────────────────────────────────────────────────────┐
│                        数据库结构                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐      ┌─────────────┐      ┌─────────────┐ │
│  │    users    │      │   designs   │      │   orders    │ │
│  ├─────────────┤      ├─────────────┤      ├─────────────┤ │
│  │ id          │◄────►│ user_id     │      │ user_id     │ │
│  │ open_id     │      │ id          │◄────►│ design_id   │ │
│  │ name        │      │ name        │      │ id          │ │
│  │ email       │      │ mode        │      │ status      │ │
│  │ credits     │      │ parameters  │      │ amount      │ │
│  │ role        │      │ created_at  │      │ created_at  │ │
│  └─────────────┘      └─────────────┘      └─────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. 本地数据库部署

### 2.1 方法一：使用 Docker（推荐新手）

Docker 可以让您在几分钟内启动一个隔离的 PostgreSQL 实例，不会影响系统其他部分。

**第一步：安装 Docker**

访问 [Docker 官网](https://www.docker.com/products/docker-desktop/) 下载并安装 Docker Desktop。

**第二步：启动 PostgreSQL 容器**

打开终端，运行以下命令：

```bash
# 创建并启动 PostgreSQL 容器
docker run --name doe-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=your_secure_password \
  -e POSTGRES_DB=doe_studio \
  -p 5432:5432 \
  -v doe_postgres_data:/var/lib/postgresql/data \
  -d postgres:15
```

**参数解释**：

| 参数 | 说明 |
|------|------|
| `--name doe-postgres` | 容器名称，方便后续管理 |
| `-e POSTGRES_USER=postgres` | 数据库用户名 |
| `-e POSTGRES_PASSWORD=...` | 数据库密码（请更改为安全密码） |
| `-e POSTGRES_DB=doe_studio` | 创建的数据库名 |
| `-p 5432:5432` | 端口映射（主机:容器） |
| `-v doe_postgres_data:...` | 数据持久化卷 |
| `-d postgres:15` | 后台运行 PostgreSQL 15 |

**第三步：验证容器运行**

```bash
# 查看运行中的容器
docker ps

# 应该看到类似输出：
# CONTAINER ID   IMAGE         COMMAND                  STATUS          PORTS
# abc123...      postgres:15   "docker-entrypoint..."   Up 2 minutes    0.0.0.0:5432->5432/tcp
```

**第四步：配置环境变量**

在项目的 `.env` 文件中设置：

```env
DATABASE_URL=postgresql://postgres:your_secure_password@localhost:5432/doe_studio
```

### 2.2 方法二：直接安装 PostgreSQL

如果您不想使用 Docker，可以直接安装 PostgreSQL。

**Windows 安装**：

1. 访问 [PostgreSQL 下载页面](https://www.postgresql.org/download/windows/)
2. 下载并运行安装程序
3. 安装过程中：
   - 记住您设置的密码
   - 保持默认端口 5432
   - 选择安装 pgAdmin（图形化管理工具）

**Mac 安装**：

```bash
# 使用 Homebrew
brew install postgresql@15

# 启动服务
brew services start postgresql@15

# 创建数据库
createdb doe_studio
```

**Linux (Ubuntu) 安装**：

```bash
# 安装 PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# 启动服务
sudo systemctl start postgresql
sudo systemctl enable postgresql

# 创建数据库
sudo -u postgres createdb doe_studio
```

### 2.3 常用 Docker 命令

| 命令 | 说明 |
|------|------|
| `docker start doe-postgres` | 启动容器 |
| `docker stop doe-postgres` | 停止容器 |
| `docker restart doe-postgres` | 重启容器 |
| `docker logs doe-postgres` | 查看日志 |
| `docker exec -it doe-postgres psql -U postgres` | 进入 PostgreSQL 命令行 |

---

## 3. 数据库 Schema 管理

### 3.1 什么是 Drizzle ORM

DOE Studio 使用 **Drizzle ORM** 管理数据库。ORM（Object-Relational Mapping）让您可以用 TypeScript 代码定义和操作数据库，而不需要直接写 SQL。

### 3.2 Schema 文件位置

数据库结构定义在 `drizzle/schema.ts` 文件中：

```typescript
// drizzle/schema.ts
import { mysqlTable, varchar, int, text, timestamp } from 'drizzle-orm/mysql-core';

// 用户表
export const users = mysqlTable('users', {
  id: int('id').primaryKey().autoincrement(),
  openId: varchar('open_id', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }),
  email: varchar('email', { length: 255 }),
  credits: int('credits').default(10),
  role: varchar('role', { length: 50 }).default('user'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 设计表
export const designs = mysqlTable('designs', {
  id: int('id').primaryKey().autoincrement(),
  userId: int('user_id').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  mode: varchar('mode', { length: 50 }).notNull(),
  parameters: text('parameters'), // JSON 格式存储
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
```

### 3.3 修改 Schema

当您需要添加新字段或新表时：

**第一步：编辑 Schema 文件**

```typescript
// 例如：给 users 表添加 avatar 字段
export const users = mysqlTable('users', {
  // ... 现有字段
  avatar: varchar('avatar', { length: 500 }), // 新增字段
});
```

**第二步：生成并应用迁移**

```bash
# 生成迁移文件并应用到数据库
pnpm db:push
```

**注意**：`db:push` 命令会直接修改数据库结构。在生产环境中，建议使用更谨慎的迁移流程。

### 3.4 查看迁移历史

迁移文件存储在 `drizzle/migrations/` 目录中。每个迁移文件记录了一次 Schema 变更。

---

## 4. 常用数据库操作

### 4.1 使用 Drizzle Studio（图形界面）

Drizzle 提供了一个可视化工具来查看和编辑数据：

```bash
# 启动 Drizzle Studio
pnpm drizzle-kit studio
```

打开浏览器访问 `https://local.drizzle.studio`，您可以：

- 浏览所有表和数据
- 添加、编辑、删除记录
- 执行自定义 SQL 查询

### 4.2 在代码中操作数据库

数据库操作函数定义在 `server/db.ts` 中：

```typescript
// server/db.ts
import { db } from './_core/context';
import { users, designs } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

// 查询用户
export async function getUserByOpenId(openId: string) {
  const result = await db.select().from(users).where(eq(users.openId, openId));
  return result[0];
}

// 创建设计
export async function createDesign(userId: number, name: string, mode: string, parameters: object) {
  const result = await db.insert(designs).values({
    userId,
    name,
    mode,
    parameters: JSON.stringify(parameters),
  });
  return result;
}

// 更新设计
export async function updateDesign(id: number, data: Partial<typeof designs.$inferInsert>) {
  await db.update(designs).set(data).where(eq(designs.id, id));
}

// 删除设计
export async function deleteDesign(id: number) {
  await db.delete(designs).where(eq(designs.id, id));
}
```

### 4.3 常用 SQL 查询

如果您需要直接执行 SQL，可以使用 Drizzle Studio 或连接到数据库：

```sql
-- 查看所有用户
SELECT * FROM users;

-- 查看特定用户的设计
SELECT * FROM designs WHERE user_id = 1;

-- 统计每种模式的设计数量
SELECT mode, COUNT(*) as count FROM designs GROUP BY mode;

-- 查看最近创建的设计
SELECT * FROM designs ORDER BY created_at DESC LIMIT 10;

-- 更新用户 Credits
UPDATE users SET credits = credits + 25 WHERE id = 1;
```

### 4.4 使用 psql 命令行

```bash
# 连接到数据库（Docker）
docker exec -it doe-postgres psql -U postgres -d doe_studio

# 连接到数据库（直接安装）
psql -U postgres -d doe_studio

# 常用 psql 命令
\dt          # 列出所有表
\d users     # 查看 users 表结构
\q           # 退出
```

---

## 5. 生产环境数据库

### 5.1 托管数据库服务对比

在生产环境中，推荐使用托管数据库服务，而不是自己管理服务器。

| 服务 | 免费额度 | 优点 | 缺点 |
|------|----------|------|------|
| **Supabase** | 500MB | PostgreSQL，有 UI | 免费版限制多 |
| **PlanetScale** | 5GB | MySQL，自动扩展 | 不支持外键 |
| **Railway** | 1GB | 简单，与部署集成 | 免费额度小 |
| **Neon** | 3GB | PostgreSQL，Serverless | 冷启动延迟 |
| **AWS RDS** | 无 | 企业级，可靠 | 需要配置 |

### 5.2 使用 Supabase（推荐新手）

**第一步：创建项目**

1. 访问 [Supabase](https://supabase.com/)
2. 注册并创建新项目
3. 等待数据库初始化（约 2 分钟）

**第二步：获取连接字符串**

1. 进入项目 Settings > Database
2. 复制 Connection string (URI)
3. 格式类似：`postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres`

**第三步：配置环境变量**

在生产环境中设置：

```env
DATABASE_URL=postgresql://postgres:your_password@db.xxx.supabase.co:5432/postgres?sslmode=require
```

**注意**：生产环境必须启用 SSL（`?sslmode=require`）。

**第四步：初始化表结构**

```bash
# 在本地运行，会连接到远程数据库
DATABASE_URL="your_production_url" pnpm db:push
```

### 5.3 数据库安全最佳实践

1. **使用强密码**：至少 16 个字符，包含大小写字母、数字和特殊字符
2. **启用 SSL**：确保连接字符串包含 `?sslmode=require`
3. **限制 IP 访问**：在数据库控制台配置允许的 IP 地址
4. **定期轮换密码**：每 90 天更换一次数据库密码
5. **最小权限原则**：应用只需要读写权限，不需要管理员权限

---

## 6. 数据备份与恢复

### 6.1 手动备份

**使用 pg_dump（命令行）**：

```bash
# 导出整个数据库
pg_dump -U postgres -h localhost -d doe_studio > backup_$(date +%Y%m%d).sql

# 仅导出数据（不含结构）
pg_dump -U postgres -h localhost -d doe_studio --data-only > data_backup.sql

# 仅导出特定表
pg_dump -U postgres -h localhost -d doe_studio -t designs > designs_backup.sql
```

**使用 Docker**：

```bash
# 备份
docker exec doe-postgres pg_dump -U postgres doe_studio > backup.sql

# 恢复
docker exec -i doe-postgres psql -U postgres doe_studio < backup.sql
```

### 6.2 自动备份脚本

创建 `scripts/backup.sh`：

```bash
#!/bin/bash

# 配置
BACKUP_DIR="/path/to/backups"
DB_NAME="doe_studio"
DB_USER="postgres"
RETENTION_DAYS=30

# 创建备份目录
mkdir -p $BACKUP_DIR

# 生成备份文件名
BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_$(date +%Y%m%d_%H%M%S).sql.gz"

# 执行备份并压缩
pg_dump -U $DB_USER $DB_NAME | gzip > $BACKUP_FILE

# 删除旧备份
find $BACKUP_DIR -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup completed: $BACKUP_FILE"
```

**设置定时任务（Linux）**：

```bash
# 编辑 crontab
crontab -e

# 添加每日凌晨 2 点备份
0 2 * * * /path/to/scripts/backup.sh
```

### 6.3 恢复数据

```bash
# 从 SQL 文件恢复
psql -U postgres -d doe_studio < backup.sql

# 从压缩文件恢复
gunzip -c backup.sql.gz | psql -U postgres -d doe_studio

# 恢复到新数据库
createdb doe_studio_restored
psql -U postgres -d doe_studio_restored < backup.sql
```

### 6.4 使用托管服务的备份

大多数托管数据库服务提供自动备份：

| 服务 | 备份频率 | 保留期 | 恢复方式 |
|------|----------|--------|----------|
| Supabase | 每日 | 7 天 | 控制台一键恢复 |
| PlanetScale | 每日 | 7 天 | 分支恢复 |
| Railway | 每日 | 7 天 | 控制台恢复 |
| AWS RDS | 可配置 | 可配置 | 快照恢复 |

---

## 7. 性能优化

### 7.1 添加索引

索引可以显著提高查询速度。在 Schema 中添加索引：

```typescript
// drizzle/schema.ts
import { index } from 'drizzle-orm/mysql-core';

export const designs = mysqlTable('designs', {
  // ... 字段定义
}, (table) => ({
  // 为常用查询字段添加索引
  userIdIdx: index('user_id_idx').on(table.userId),
  modeIdx: index('mode_idx').on(table.mode),
  createdAtIdx: index('created_at_idx').on(table.createdAt),
}));
```

### 7.2 查询优化

**避免 N+1 查询问题**：

```typescript
// ❌ 不好：每个用户执行一次查询
const users = await db.select().from(users);
for (const user of users) {
  const designs = await db.select().from(designs).where(eq(designs.userId, user.id));
}

// ✅ 好：使用 JOIN 一次查询
const result = await db
  .select()
  .from(users)
  .leftJoin(designs, eq(users.id, designs.userId));
```

**只查询需要的字段**：

```typescript
// ❌ 不好：查询所有字段
const designs = await db.select().from(designs);

// ✅ 好：只查询需要的字段
const designs = await db
  .select({ id: designs.id, name: designs.name })
  .from(designs);
```

### 7.3 连接池配置

在高并发场景下，配置连接池很重要：

```typescript
// server/_core/context.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,        // 最大连接数
  idleTimeoutMillis: 30000,  // 空闲超时
  connectionTimeoutMillis: 2000,  // 连接超时
});

export const db = drizzle(pool);
```

---

## 8. 常见问题排查

### 8.1 连接被拒绝

**错误信息**：`ECONNREFUSED 127.0.0.1:5432`

**可能原因和解决方案**：

| 原因 | 解决方案 |
|------|----------|
| PostgreSQL 未运行 | `docker start doe-postgres` 或 `brew services start postgresql` |
| 端口被占用 | `lsof -i :5432` 查看占用进程 |
| 防火墙阻止 | 检查防火墙设置 |
| Docker 网络问题 | 使用 `host.docker.internal` 代替 `localhost` |

### 8.2 认证失败

**错误信息**：`password authentication failed for user "postgres"`

**解决方案**：

1. 确认 `.env` 中的密码正确
2. 重置密码：
   ```bash
   # Docker
   docker exec -it doe-postgres psql -U postgres
   ALTER USER postgres PASSWORD 'new_password';
   ```

### 8.3 数据库不存在

**错误信息**：`database "doe_studio" does not exist`

**解决方案**：

```bash
# 创建数据库
docker exec -it doe-postgres createdb -U postgres doe_studio

# 或使用 psql
docker exec -it doe-postgres psql -U postgres -c "CREATE DATABASE doe_studio;"
```

### 8.4 迁移失败

**错误信息**：`relation "xxx" already exists`

**解决方案**：

1. 检查数据库中是否已有该表
2. 如果是开发环境，可以删除表重新迁移：
   ```sql
   DROP TABLE IF EXISTS xxx CASCADE;
   ```
3. 如果是生产环境，手动调整迁移文件

### 8.5 SSL 连接问题

**错误信息**：`SSL connection is required`

**解决方案**：

在连接字符串中添加 SSL 参数：

```env
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
```

### 8.6 查询超时

**错误信息**：`Query read timeout`

**可能原因和解决方案**：

1. **查询太慢**：添加索引或优化查询
2. **数据量太大**：添加分页
3. **连接池耗尽**：增加连接池大小
4. **网络问题**：检查网络延迟

---

## 附录：有用的工具和资源

### 图形化数据库管理工具

| 工具 | 平台 | 特点 |
|------|------|------|
| **pgAdmin** | 全平台 | PostgreSQL 官方工具 |
| **DBeaver** | 全平台 | 支持多种数据库 |
| **TablePlus** | Mac/Windows | 界面美观，付费 |
| **Drizzle Studio** | Web | 与 Drizzle ORM 集成 |

### 学习资源

- [PostgreSQL 官方文档](https://www.postgresql.org/docs/)
- [Drizzle ORM 文档](https://orm.drizzle.team/)
- [SQL 教程 - W3Schools](https://www.w3schools.com/sql/)

---

**文档版本**：1.0  
**最后更新**：2024年12月  
**作者**：Manus AI
