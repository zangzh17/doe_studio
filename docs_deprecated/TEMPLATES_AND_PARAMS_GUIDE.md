# 模板管理和参数修改详细指南

本文档面向**零基础**读者，详细介绍如何管理 DOE 设计模板以及修改各种 DOE 类型的参数配置。

---

## 目录

1. [概述](#1-概述)
2. [模板系统架构](#2-模板系统架构)
3. [添加新模板](#3-添加新模板)
4. [修改现有模板](#4-修改现有模板)
5. [删除模板](#5-删除模板)
6. [DOE 参数系统](#6-doe-参数系统)
7. [添加新参数](#7-添加新参数)
8. [修改默认值](#8-修改默认值)
9. [删除参数](#9-删除参数)
10. [国际化支持](#10-国际化支持)

---

## 1. 概述

### 1.1 什么是模板？

模板是预设的 DOE 设计配置，用户可以基于模板快速创建新设计，而不需要从头配置所有参数。

### 1.2 当前模板

| 模板名称 | DOE 类型 | 描述 |
|---------|---------|------|
| 50×50 Spot Array | 2D Spot Projector | 标准点阵投影 |
| 100×100 High Density | 2D Spot Projector | 高密度点阵 |
| 5-Way 1D Splitter | 1D Splitter | 5路分束器 |
| Gaussian Diffuser | Diffuser | 高斯匀光片 |
| f/50 Focusing Lens | Lens | 聚焦透镜 |
| 5×5 Lens Array | Lens Array | 微透镜阵列 |
| 10° Beam Deflector | Prisms | 光束偏转器 |
| Cross Pattern | Custom Pattern | 十字图案 |

### 1.3 相关文件

| 文件路径 | 作用 |
|---------|------|
| `drizzle/schema.ts` | 数据库表结构定义 |
| `server/db.ts` | 数据库操作函数 |
| `server/routers.ts` | API 路由定义 |
| `client/src/pages/Studio.tsx` | 模板列表显示 |
| `client/src/components/DOEParameters.tsx` | 参数输入组件 |

---

## 2. 模板系统架构

### 2.1 数据库表结构

模板存储在 `doe_templates` 表中：

```typescript
// drizzle/schema.ts

export const doeTemplates = pgTable("doe_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),           // 模板名称
  description: text("description"),        // 模板描述
  mode: text("mode").notNull(),           // DOE 类型
  params: jsonb("params").notNull(),      // 参数 JSON
  thumbnail: text("thumbnail"),           // 缩略图 URL
  category: text("category"),             // 分类
  isPublic: boolean("is_public").default(true),  // 是否公开
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
```

### 2.2 参数 JSON 结构

```json
{
  "wavelength": "532",
  "diameter": "12.7",
  "shape": "circular",
  "workingDistance": "100",
  "mode": "2d_spot_projector",
  "arraySize": "50x50",
  "targetType": "angle",
  "targetValue": "10",
  "tolerance": "1"
}
```

### 2.3 数据流程

```
数据库 (doe_templates)
        │
        v
服务器 (server/routers.ts - getTemplates)
        │
        v
前端 (Studio.tsx - useQuery)
        │
        v
用户界面 (模板卡片列表)
        │
        v (用户点击"使用模板")
        │
新建设计 (复制模板参数)
```

---

## 3. 添加新模板

### 方法一：通过 SQL 直接插入（推荐）

这是最简单的方法，适合添加单个或少量模板。

**步骤 1**：准备模板数据

```sql
-- 示例：添加一个新的 3×3 点阵模板
INSERT INTO doe_templates (name, description, mode, params, category, is_public)
VALUES (
  '3×3 Spot Array',
  'Simple 3×3 spot array for testing',
  '2d_spot_projector',
  '{
    "wavelength": "532",
    "diameter": "12.7",
    "shape": "circular",
    "workingDistance": "100",
    "mode": "2d_spot_projector",
    "arraySize": "3x3",
    "targetType": "angle",
    "targetValue": "5",
    "tolerance": "1"
  }'::jsonb,
  'Spot Projector',
  true
);
```

**步骤 2**：执行 SQL

有两种方式执行：

**方式 A：使用 Manus 数据库面板**
1. 打开项目的 Management UI
2. 点击 "Database" 面板
3. 在 SQL 编辑器中粘贴上述 SQL
4. 点击执行

**方式 B：使用命令行**
```bash
# 连接数据库（需要数据库连接信息）
psql "postgresql://user:password@host:port/database?sslmode=require"

# 执行 SQL
INSERT INTO doe_templates ...
```

### 方法二：通过种子脚本批量添加

适合一次性添加多个模板。

**步骤 1**：创建种子脚本

```javascript
// scripts/seed-templates.mjs

import pg from 'pg';
const { Client } = pg;

// 数据库连接（从环境变量获取）
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// 模板数据
const templates = [
  {
    name: '3×3 Spot Array',
    description: 'Simple 3×3 spot array for testing',
    mode: '2d_spot_projector',
    params: {
      wavelength: '532',
      diameter: '12.7',
      shape: 'circular',
      workingDistance: '100',
      mode: '2d_spot_projector',
      arraySize: '3x3',
      targetType: 'angle',
      targetValue: '5',
      tolerance: '1'
    },
    category: 'Spot Projector',
    isPublic: true
  },
  {
    name: '7-Way Splitter',
    description: '7-way beam splitter',
    mode: '1d_splitter',
    params: {
      wavelength: '532',
      diameter: '12.7',
      shape: 'circular',
      workingDistance: 'inf',
      mode: '1d_splitter',
      splitCount: '7',
      targetType: 'angle',
      targetValue: '15',
      tolerance: '1'
    },
    category: 'Splitter',
    isPublic: true
  },
  // 添加更多模板...
];

async function seedTemplates() {
  try {
    await client.connect();
    console.log('Connected to database');

    for (const template of templates) {
      const query = `
        INSERT INTO doe_templates (name, description, mode, params, category, is_public)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT DO NOTHING
      `;
      
      await client.query(query, [
        template.name,
        template.description,
        template.mode,
        JSON.stringify(template.params),
        template.category,
        template.isPublic
      ]);
      
      console.log(`Added template: ${template.name}`);
    }

    console.log('All templates added successfully');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

seedTemplates();
```

**步骤 2**：运行脚本

```bash
cd /home/ubuntu/raioptics_clone
node scripts/seed-templates.mjs
```

### 方法三：通过 API 添加

如果您想通过程序添加模板，可以调用 API。

**步骤 1**：在 `server/routers.ts` 中添加创建模板的路由（如果不存在）

```typescript
// server/routers.ts

createTemplate: protectedProcedure
  .input(z.object({
    name: z.string(),
    description: z.string().optional(),
    mode: z.string(),
    params: z.any(),
    category: z.string().optional(),
    isPublic: z.boolean().default(true),
  }))
  .mutation(async ({ input }) => {
    const result = await db.insert(doeTemplates).values({
      name: input.name,
      description: input.description,
      mode: input.mode,
      params: input.params,
      category: input.category,
      isPublic: input.isPublic,
    }).returning();
    
    return result[0];
  }),
```

**步骤 2**：从前端调用

```typescript
const createTemplateMutation = trpc.templates.createTemplate.useMutation();

await createTemplateMutation.mutateAsync({
  name: '3×3 Spot Array',
  description: 'Simple 3×3 spot array',
  mode: '2d_spot_projector',
  params: { /* ... */ },
  category: 'Spot Projector',
  isPublic: true,
});
```

---

## 4. 修改现有模板

### 4.1 通过 SQL 修改

```sql
-- 修改模板名称
UPDATE doe_templates
SET name = 'New Template Name'
WHERE id = 1;

-- 修改模板参数
UPDATE doe_templates
SET params = '{
  "wavelength": "633",
  "diameter": "25.4",
  ...
}'::jsonb
WHERE name = '50×50 Spot Array';

-- 修改单个参数字段
UPDATE doe_templates
SET params = params || '{"wavelength": "633"}'::jsonb
WHERE id = 1;
```

### 4.2 通过数据库面板修改

1. 打开 Management UI → Database
2. 找到 `doe_templates` 表
3. 点击要修改的行
4. 编辑字段值
5. 保存更改

---

## 5. 删除模板

### 5.1 通过 SQL 删除

```sql
-- 按 ID 删除
DELETE FROM doe_templates WHERE id = 1;

-- 按名称删除
DELETE FROM doe_templates WHERE name = 'Template Name';

-- 删除所有非公开模板
DELETE FROM doe_templates WHERE is_public = false;
```

### 5.2 注意事项

删除模板不会影响已经基于该模板创建的用户设计，因为用户设计会复制模板的参数，而不是引用模板。

---

## 6. DOE 参数系统

### 6.1 参数定义位置

所有 DOE 参数在以下文件中定义：

```
client/src/components/DOEParameters.tsx
```

### 6.2 参数类型定义

```typescript
// DOEParams 接口定义了所有可能的参数
export interface DOEParams {
  // 基础参数（所有 DOE 类型共用）
  wavelength: string;        // 波长 (nm)
  diameter: string;          // 器件直径 (mm)
  shape: string;             // 形状 ('circular' | 'square')
  workingDistance: string;   // 工作距离 (mm 或 'inf')
  mode: string;              // DOE 类型
  
  // 2D Spot Projector 特有参数
  arraySize?: string;        // 阵列规模 (如 '50x50')
  targetType?: string;       // 目标类型 ('angle' | 'size')
  targetValue?: string;      // 目标值
  tolerance?: string;        // 容差 (%)
  
  // Diffuser 特有参数
  diffuserShape?: string;    // 扩散形状
  diffusionAngle?: string;   // 扩散角度
  
  // 1D Splitter 特有参数
  splitCount?: string;       // 分束数目
  
  // Lens 特有参数
  focalLength?: string;      // 焦距 (mm)
  lensType?: string;         // 透镜类型
  specialFunction?: string;  // 特殊功能
  specialValues?: string;    // 特殊功能参数
  
  // Lens Array 特有参数
  arrayScale?: string;       // 阵列规模
  
  // Prisms 特有参数
  deflectionAngle?: string;  // 偏离角度
  
  // Custom Pattern 特有参数
  patternPreset?: string;    // 预设图案
  patternFile?: File;        // 上传的图案文件
  resizeMode?: string;       // resize 模式
  resizeValue?: string;      // resize 值
  
  // Fabrication Simulator 参数
  fabricationEnabled?: boolean;
  fabricationRecipe?: string;
}
```

### 6.3 默认值定义

```typescript
// 在 DOEParameters.tsx 中的 defaultParams
const defaultParams: DOEParams = {
  wavelength: '532',
  diameter: '12.7',
  shape: 'circular',
  workingDistance: 'inf',
  mode: '2d_spot_projector',
  arraySize: '50x50',
  targetType: 'angle',
  targetValue: '10',
  tolerance: '1',
  splitCount: '5',
  focalLength: '50',
  lensType: 'normal',
  specialFunction: 'none',
  arrayScale: '5',
  deflectionAngle: '10',
  diffuserShape: 'circular',
  diffusionAngle: '30',
  patternPreset: 'none',
  resizeMode: 'percentage',
  resizeValue: '100',
  fabricationEnabled: false,
  fabricationRecipe: 'standard_binary',
};
```

---

## 7. 添加新参数

### 7.1 示例：为 Lens 添加 "数值孔径" 参数

**步骤 1**：更新类型定义

```typescript
// client/src/components/DOEParameters.tsx

export interface DOEParams {
  // ... 现有参数
  
  // 新增：数值孔径
  numericalAperture?: string;
}
```

**步骤 2**：添加默认值

```typescript
const defaultParams: DOEParams = {
  // ... 现有默认值
  
  numericalAperture: '0.1',  // 新增默认值
};
```

**步骤 3**：添加 UI 组件

在 `DOEParameters.tsx` 中找到 Lens 参数部分，添加输入框：

```tsx
{/* 数值孔径输入 */}
{params.mode === 'lens' && (
  <div className="space-y-2">
    <Label htmlFor="numericalAperture">
      {t('numericalAperture')}
    </Label>
    <Input
      id="numericalAperture"
      type="number"
      step="0.01"
      min="0.01"
      max="1"
      value={params.numericalAperture || '0.1'}
      onChange={(e) => onParamsChange({
        ...params,
        numericalAperture: e.target.value
      })}
      placeholder="0.1"
    />
    <p className="text-xs text-muted-foreground">
      Typical range: 0.01 - 1.0
    </p>
  </div>
)}
```

**步骤 4**：添加翻译

在 `client/src/contexts/LanguageContext.tsx` 中添加：

```typescript
const translations = {
  en: {
    // ... 现有翻译
    numericalAperture: 'Numerical Aperture',
  },
  zh: {
    // ... 现有翻译
    numericalAperture: '数值孔径',
  },
  ko: {
    // ... 现有翻译
    numericalAperture: '개구수',
  },
};
```

**步骤 5**：更新后端（如果需要）

如果后端需要使用这个参数，在 `python_backend/main.py` 中更新：

```python
class DOEParams(BaseModel):
    # ... 现有参数
    numerical_aperture: Optional[float] = None
```

---

## 8. 修改默认值

### 8.1 修改基础参数默认值

在 `DOEParameters.tsx` 中找到 `defaultParams` 对象：

```typescript
// 修改前
const defaultParams: DOEParams = {
  wavelength: '532',  // 绿光
  diameter: '12.7',   // 1/2 英寸
  // ...
};

// 修改后（例如改为红光和 1 英寸）
const defaultParams: DOEParams = {
  wavelength: '633',  // 红光
  diameter: '25.4',   // 1 英寸
  // ...
};
```

### 8.2 修改下拉菜单选项

**波长预设选项**：

```tsx
// 找到波长下拉菜单部分
const wavelengthPresets = [
  { value: '405', label: '405 nm (Violet)' },
  { value: '450', label: '450 nm (Blue)' },
  { value: '532', label: '532 nm (Green)' },
  { value: '633', label: '633 nm (Red)' },
  { value: '850', label: '850 nm (NIR)' },
  { value: '1064', label: '1064 nm (IR)' },
  { value: '1550', label: '1550 nm (Telecom)' },  // 新增
];
```

**工作距离预设选项**：

```tsx
const distancePresets = [
  { value: '10', label: '1 cm' },
  { value: '25.4', label: '1 in' },
  { value: '100', label: '10 cm' },
  { value: '304.8', label: '1 ft' },
  { value: '1000', label: '1 m' },
  { value: 'inf', label: '∞ (Infinity)' },
];
```

**器件尺寸预设选项**：

```tsx
const diameterPresets = [
  { value: '6.35', label: '1/4 in (6.35 mm)' },
  { value: '12.7', label: '1/2 in (12.7 mm)' },
  { value: '25.4', label: '1 in (25.4 mm)' },
  { value: '50.8', label: '2 in (50.8 mm)' },
  { value: '76.2', label: '3 in (76.2 mm)' },  // 新增
  { value: '101.6', label: '4 in (101.6 mm)' },
];
```

### 8.3 修改特定 DOE 类型的默认值

**示例：修改 1D Splitter 的默认分束数**

```typescript
// 找到 splitCount 的默认值
const defaultParams: DOEParams = {
  // ...
  splitCount: '5',  // 修改前：5
  // splitCount: '7',  // 修改后：7
};
```

**示例：修改 Lens 的默认焦距**

```typescript
const defaultParams: DOEParams = {
  // ...
  focalLength: '50',  // 修改前：50mm
  // focalLength: '100',  // 修改后：100mm
};
```

---

## 9. 删除参数

### 9.1 完全删除参数

**步骤 1**：从类型定义中移除

```typescript
export interface DOEParams {
  // 删除这一行
  // someParameter?: string;
}
```

**步骤 2**：从默认值中移除

```typescript
const defaultParams: DOEParams = {
  // 删除这一行
  // someParameter: 'default',
};
```

**步骤 3**：从 UI 中移除

找到并删除对应的 JSX 代码块。

**步骤 4**：从翻译中移除

在 `LanguageContext.tsx` 中删除对应的翻译键。

### 9.2 隐藏参数（保留但不显示）

如果只想暂时隐藏参数，可以用条件渲染：

```tsx
{/* 用 false 条件隐藏 */}
{false && (
  <div className="space-y-2">
    <Label>Hidden Parameter</Label>
    <Input ... />
  </div>
)}

{/* 或者用环境变量控制 */}
{import.meta.env.VITE_SHOW_ADVANCED_PARAMS === 'true' && (
  <div className="space-y-2">
    <Label>Advanced Parameter</Label>
    <Input ... />
  </div>
)}
```

---

## 10. 国际化支持

### 10.1 翻译文件位置

```
client/src/contexts/LanguageContext.tsx
```

### 10.2 添加新翻译

```typescript
const translations = {
  en: {
    // 基础参数
    wavelength: 'Wavelength',
    diameter: 'Device Diameter',
    shape: 'Device Shape',
    workingDistance: 'Working Distance',
    
    // DOE 类型
    diffuser: 'Diffuser',
    splitter1d: '1D Splitter',
    spotProjector2d: '2D Spot Projector',
    lens: 'Diffractive Lens',
    lensArray: 'Lens Array',
    prisms: 'Prisms',
    customPattern: 'Custom Pattern',
    
    // 新增翻译键
    newParameter: 'New Parameter',
  },
  zh: {
    wavelength: '工作波长',
    diameter: '器件直径',
    shape: '器件形状',
    workingDistance: '工作距离',
    
    diffuser: '匀光片',
    splitter1d: '一维分束器',
    spotProjector2d: '二维点阵投影',
    lens: '衍射透镜',
    lensArray: '透镜阵列',
    prisms: '棱镜',
    customPattern: '自定义图案',
    
    newParameter: '新参数',
  },
  ko: {
    wavelength: '파장',
    diameter: '소자 직경',
    shape: '소자 형상',
    workingDistance: '작동 거리',
    
    diffuser: '확산기',
    splitter1d: '1D 분할기',
    spotProjector2d: '2D 스팟 프로젝터',
    lens: '회절 렌즈',
    lensArray: '렌즈 어레이',
    prisms: '프리즘',
    customPattern: '사용자 정의 패턴',
    
    newParameter: '새 매개변수',
  },
};
```

### 10.3 使用翻译

```tsx
import { useLanguage } from '@/contexts/LanguageContext';

function MyComponent() {
  const { t } = useLanguage();
  
  return (
    <Label>{t('wavelength')}</Label>
  );
}
```

### 10.4 添加新语言

**步骤 1**：更新语言类型

```typescript
export type Language = 'en' | 'zh' | 'ko' | 'ja';  // 添加日语
```

**步骤 2**：添加翻译

```typescript
const translations = {
  en: { /* ... */ },
  zh: { /* ... */ },
  ko: { /* ... */ },
  ja: {  // 新增日语
    wavelength: '波長',
    diameter: 'デバイス直径',
    // ... 所有翻译键
  },
};
```

**步骤 3**：更新语言选择器

在 `Header.tsx` 中添加新语言选项：

```tsx
const languages = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },  // 新增
];
```

---

## 附录：完整模板示例

### A.1 2D Spot Projector 模板

```json
{
  "name": "100×100 High Density Array",
  "description": "High density spot array for structured light applications",
  "mode": "2d_spot_projector",
  "params": {
    "wavelength": "850",
    "diameter": "25.4",
    "shape": "circular",
    "workingDistance": "500",
    "mode": "2d_spot_projector",
    "arraySize": "100x100",
    "targetType": "size",
    "targetValue": "200",
    "tolerance": "0.5"
  },
  "category": "Spot Projector",
  "is_public": true
}
```

### A.2 Diffuser 模板

```json
{
  "name": "30° Circular Diffuser",
  "description": "Circular diffuser with 30° full angle",
  "mode": "diffuser",
  "params": {
    "wavelength": "532",
    "diameter": "12.7",
    "shape": "circular",
    "workingDistance": "inf",
    "mode": "diffuser",
    "diffuserShape": "circular",
    "targetType": "angle",
    "targetValue": "30",
    "tolerance": "2"
  },
  "category": "Diffuser",
  "is_public": true
}
```

### A.3 Lens 模板

```json
{
  "name": "f/100 Extended DOF Lens",
  "description": "Focusing lens with extended depth of focus",
  "mode": "lens",
  "params": {
    "wavelength": "532",
    "diameter": "12.7",
    "shape": "circular",
    "workingDistance": "inf",
    "mode": "lens",
    "focalLength": "100",
    "lensType": "normal",
    "specialFunction": "extended_dof",
    "specialValues": "95,100,105"
  },
  "category": "Lens",
  "is_public": true
}
```

### A.4 Custom Pattern 模板

```json
{
  "name": "Ring Pattern",
  "description": "Concentric ring pattern for alignment",
  "mode": "custom_pattern",
  "params": {
    "wavelength": "633",
    "diameter": "25.4",
    "shape": "circular",
    "workingDistance": "100",
    "mode": "custom_pattern",
    "patternPreset": "ring",
    "resizeMode": "percentage",
    "resizeValue": "100",
    "targetType": "angle",
    "targetValue": "20",
    "tolerance": "1"
  },
  "category": "Custom Pattern",
  "is_public": true
}
```

---

## 参考资料

1. [Drizzle ORM 文档](https://orm.drizzle.team/)
2. [PostgreSQL JSON 操作](https://www.postgresql.org/docs/current/functions-json.html)
3. [React Hook Form](https://react-hook-form.com/)
4. [i18n 最佳实践](https://phrase.com/blog/posts/react-i18n-best-practices/)
