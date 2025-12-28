# Changelog - wfh

记录 wfh 分支的所有更改。格式遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)。

## [Unreleased]

### Added
- 添加协作工作流文件 (#9bbb149)
- 实现基于 Supabase 的邮箱认证系统
- 添加邮箱登录/注册页面 (LoginEmail.tsx)
- 创建 Supabase 认证服务模块 (supabase-auth.ts)
- 添加邮箱认证 API 端点 (auth-email.ts)
- 实现邮箱验证、密码重置功能
- 添加邮箱认证测试脚本和报告

### Changed
- 更新团队职责说明文档 (#94aea4f)
- 更新 Claude 文档并清理过时文档 (#b7a1786)
- 更改应用标题 (#beb8e28)
- 更新数据库 schema 支持邮箱认证字段
- 改进登录页面 UI，添加邮箱登录入口

### Fixed
- 修复模板加载类型错误 (#0578c61)
- 修复 Lucia 认证数据库架构问题并改进用户体验 (#10dabb8)
- 修复 TypeScript 类型错误 (useNavigate 导入)
- 修复前端路由跳转问题

### Removed

---

## 记录规范

每次提交后，在对应分类下添加一行：
- **Added**: 新功能
- **Changed**: 功能变更
- **Fixed**: Bug 修复
- **Removed**: 删除的功能

格式：`- 简短描述 (#commit-hash 或 PR 链接)`
