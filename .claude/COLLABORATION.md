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

## 当前分工

| 成员 | 负责模块 | 当前任务 |
|------|----------|----------|
| zzh  | TBD      | TBD      |
| wfh  | TBD      | TBD      |

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
