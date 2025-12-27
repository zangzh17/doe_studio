# DOE Studio 协作指南

## 团队成员
- **zzh**: 分支 `zzh`
- **wfh**: 分支 `wfh`

## 分支策略

```
master              ← 稳定分支，只接受合并
  ├── zzh           ← zzh 的开发分支
  └── wfh           ← wfh 的开发分支
```

## 分工职责

### zzh - 计算与优化引擎

| 模块 | 职责 | 关键文件 |
|------|------|----------|
| Python 计算后端 | DOE 优化算法、GPU 加速计算 | `python/` (待建) |
| 绘图与可视化 | Plotly 图表、3D 预览 | `client/src/components/` 绘图相关 |
| 计算数据处理 | 参数转换、结果解析 | `shared/`, API 数据接口 |
| Serverless GPU | Modal/云函数部署 | 部署配置、API 集成 |
| 前端参数接口 | tRPC 计算相关端点 | `server/routers.ts` 计算部分 |

### wfh - 系统与用户体验

| 模块 | 职责 | 关键文件 |
|------|------|----------|
| UI/UX | 界面细节、交互优化 | `client/src/pages/`, `components/` |
| Bug 修复 | 系统稳定性、问题排查 | 全局 |
| 用户系统 | 登录、注册、邮箱验证 | `server/_core/auth.ts`, `lucia.ts` |
| 邮件系统 | 通知、验证邮件 | `server/` 邮件服务 (待建) |
| 定价系统 | 套餐、积分、支付 | `server/routers.ts`, `drizzle/schema.ts` |
| 数据库 | Schema 设计、迁移 | `drizzle/schema.ts`, `server/db.ts` |

## 接口约定

### zzh → wfh 的接口
- 计算 API 的输入/输出格式
- 优化任务状态更新
- 结果数据结构

### wfh → zzh 的接口
- 用户积分/权限查询
- 任务创建时的用户验证
- 数据库存储格式

## 当前任务

| 成员 | 当前任务 | 状态 |
|------|----------|------|
| zzh  | 待定 | - |
| wfh  | 待定 | - |

## 工作流程

### 日常开发
1. 在自己的分支上开发
2. 每次完成功能后更新 `CHANGELOG/{你的代号}.md`
3. 提交信息格式：`type(模块): 描述 [代号]`
   - 例：`feat(auth): 添加微信登录 [zzh]`

### 同步主分支
```bash
git fetch origin
git rebase origin/master
```

### 合并到 master（由合并者执行）
1. 确保 `pnpm check` 通过
2. 确保 `pnpm test` 通过
3. 合并分支到 master
4. 整理 CHANGELOG 到主版本（如需要）
5. 更新 CLAUDE.md（如有架构变更）

## 文件冲突预防

### 避免同时修改的文件
- `CLAUDE.md` - 仅在合并时更新
- `drizzle/schema.ts` - 修改前先沟通
- `server/routers.ts` - 尽量在不同区域添加

### 各自独立维护的文件
- `CHANGELOG/zzh.md` / `CHANGELOG/wfh.md`
- 各自负责的页面和组件

## 合并检查清单

- [ ] `pnpm check` 类型检查通过
- [ ] `pnpm test` 测试通过
- [ ] 更新 CHANGELOG
- [ ] 更新 CLAUDE.md（如有架构变更）
- [ ] 无合并冲突

## 沟通规范

重大变更前先沟通：
- 数据库 schema 变更
- 共享组件修改
- API 接口变更
- 依赖升级
