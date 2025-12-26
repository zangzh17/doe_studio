# DOE Studio TODO

## Phase 1: 全栈升级和数据持久化
- [x] 升级为全栈项目（web-db-user）
- [x] 创建DOE设计数据库表
- [x] 创建DOE模板数据库表
- [x] 实现设计CRUD API
- [x] 实现模板API
- [x] 编写单元测试

## Phase 2: 布局和响应式设计
- [x] 调整左右栏比例为2:3
- [x] 移动端响应式布局（垂直堆叠）
- [x] 左侧Designs栏可折叠

## Phase 3: 中英文切换
- [x] 完善LanguageContext
- [x] 右上角添加语言切换按钮
- [x] 所有界面文本国际化

## Phase 4: 功能完善
- [x] 角度计算逻辑（有限远时显示等效full angle）
- [x] Target Angle改为Full Angle
- [x] 设计列表显示模板
- [x] 模板使用功能

## Phase 5: Fabrication Simulator
- [x] 添加Fabrication Simulator模块
- [x] 工艺选项（recipe）菜单
- [x] 模拟加工后结果提示

## Phase 6: 视觉优化
- [x] 优化整体设计风格
- [x] Landing Page视觉冲击力提升
- [x] 动画和微交互

## Phase 7: 前端集成数据库
- [x] Studio页面集成设计列表API
- [x] DOEStudio页面集成设计保存API
- [x] 新建设计功能
- [x] 删除设计功能

## Phase 8: 问题修复和优化

### 移动端问题
- [x] 移动端默认收起左侧Designs栏
- [x] 修复Results区域滚动问题
- [x] 响应式垂直堆叠布局修复

### 中文界面
- [x] My Designs页面中文翻译

### 模板系统
- [x] 添加模板数据示例 (8个模板)
- [x] 完善模板文档说明

### 界面风格调整
- [x] 调整Studio界面风格 (青色/蓝绿色主题)
- [x] 调整元素和图标风格
- [x] 调整My Designs界面风格

### 开发文档
- [x] 扩充开发文档 (DEVELOPMENT_GUIDE.md)
- [x] 添加更多代码示例
- [x] 添加开发建议

## Phase 9: 新功能开发 (已完成)

### My Designs页面布局
- [x] 用户设计放在上部
- [x] 模板放在底部

### Docs页面
- [x] 创建Docs页面框架
- [x] 添加基础文档内容

### Pricing页面
- [x] 设计Pricing页面
- [x] 免费用户10次优化额度
- [x] 付费用户$2/¥10购买25次额度
- [x] DOE代工服务定价（1/2in, 1in, 2in, 4in）
- [x] 加急服务选项

### 支付系统
- [x] 集成Stripe支付
- [x] 实现优化额度购买
- [x] 实现代工服务购买

### 用户认证说明
- [x] 说明现有认证系统使用方法 (DEVELOPMENT_GUIDE.md)

## Phase 10: 功能优化和完善 (已完成)

### DOE Manufacturing订购流程
- [x] 添加设计选择功能（读取用户设计列表）
- [x] 根据设计尺寸显示价格预估
- [x] 添加加急选项下拉菜单
- [x] 实现报价单PDF下载功能
- [x] 价格列表改为参考价格展示，移除订购按钮

### 优化流程改进
- [x] 点击Optimize时自动先运行Preview

### 用户认证系统
- [x] 说明现有OAuth系统使用方式
- [x] 文档中说明邮箱验证码配置
- [x] 文档中说明Google登录配置
- [ ] 未登录用户访问Studio等页面重定向到登录 (待实现)

### UI修复
- [x] 帮助按钮重定向到Docs FAQ页面

### 国际化
- [x] 添加韩语支持

## Phase 11: DOE类型参数完善 (已完成)

### Diffuser参数
- [x] 扩散形状选择（圆形/方形）
- [x] 扩散角度（全角）或扩散尺寸输入
- [x] 容差输入

### 1D Splitter参数
- [x] 分束数目输入（默认5）
- [x] 分束角度覆盖（全角）或投射尺寸
- [x] 容差输入

### Lens参数
- [x] 焦距输入（默认50mm）
- [x] 特殊功能选项（扩展焦深/多波长）
- [x] 多焦深/多波长输入框
- [x] 实时计算参考原始焦深估计
- [x] 实时计算最大衍射角估计
- [x] 透镜类型选择（普通/柱面X/柱面Y）

### Prisms参数
- [x] 偏离角度输入
- [x] 容差输入

### Custom Pattern参数
- [x] 图片上传功能（bmp/tif格式）
- [x] 预设pattern选择（十字/环形）
- [x] resize策略（比例/尺寸）
- [x] 非方形自动填充提示
- [x] 处理后图案预览
- [x] 工作距离、角度覆盖、容差

### Lens Array参数（新增）
- [x] 阵列规模输入（如5对应5x5）
- [x] 焦距输入
- [x] 特殊功能选项
- [x] 等效孔径计算

### 容差逻辑修改
- [x] 实时计算预估最小容差
- [x] 角度情况公式：lambda/D/cos(theta)/theta
- [x] 尺寸情况公式：D/N/target_size
- [x] 显示最大像素数/分束数目/规模

### Preview优化
- [x] 最大衍射角改为半角
- [x] 与Equivalent Full Angle合并显示
- [x] 显示实际容差
- [x] 显示目标面有效像素数（pattern情况）


## Phase 12: UI修复和详细开发文档 (已完成)

### UI修复
- [x] Max Array Size、Equivalent (from size)移到输入框附近
- [x] Preview显示实际容差/实际像素数
- [x] Pattern预览图放在target size下面，显示resize后图像
- [x] Pattern预览显示最大像素值和亮度百分比
- [x] Max splits提示放在splits输入框旁边
- [x] 修复容差计算公式（无量纲比例，单位%）

### 详细开发文档（零基础）
- [x] Python/PyTorch后端集成指南 (docs/PYTHON_BACKEND_GUIDE.md)
- [x] Plotly图表开发和数据传入指南 (docs/PLOTLY_CHARTS_GUIDE.md)
- [x] 模板管理（新增/修改/删除）指南 (docs/TEMPLATES_AND_PARAMS_GUIDE.md)
- [x] 认证系统配置指南（Google/邮箱/微信） (docs/AUTH_AND_USER_GUIDE.md)
- [x] 用户管理指南（删除/新增/管理数据） (docs/AUTH_AND_USER_GUIDE.md)
- [x] 非Manus OAuth认证接口配置 (docs/AUTH_AND_USER_GUIDE.md)
- [x] DOE参数修改指南（新增/删除/默认值） (docs/TEMPLATES_AND_PARAMS_GUIDE.md)
- [x] 支付系统部署指南 (docs/PAYMENT_SYSTEM_GUIDE.md)
