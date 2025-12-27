# 更新 CHANGELOG

根据最近的 git 提交记录，更新当前用户的 CHANGELOG 文件。

## 执行步骤

1. 首先确定当前分支名称（zzh 或 wfh）来确定要更新哪个 CHANGELOG 文件
2. 获取自上次 CHANGELOG 更新以来的所有提交：
   ```bash
   git log --oneline --since="$(git log -1 --format=%ci -- CHANGELOG/)"
   ```
   如果上述命令无结果，获取最近 10 条提交：
   ```bash
   git log --oneline -10
   ```
3. 分析每个提交的类型：
   - `feat` / `add` → Added
   - `fix` → Fixed
   - `change` / `update` / `refactor` → Changed
   - `remove` / `delete` → Removed
4. 读取对应的 CHANGELOG 文件（`CHANGELOG/zzh.md` 或 `CHANGELOG/wfh.md`）
5. 在 `## [Unreleased]` 下的对应分类中添加新条目
6. 格式：`- 描述 (#短hash)`

## 示例输出

```markdown
## [Unreleased]

### Added
- 添加用户登录功能 (#abc1234)
- 新增模板选择页面 (#def5678)

### Fixed
- 修复表单验证错误 (#ghi9012)
```

## 注意事项

- 只更新当前用户的 CHANGELOG 文件
- 保持描述简洁（一行）
- 如果提交信息不够清晰，可以查看具体的 diff 来理解变更内容
- 不要删除已有的条目，只添加新条目
