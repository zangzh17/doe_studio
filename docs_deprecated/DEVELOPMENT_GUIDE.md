# DOE Studio 开发指南

本文档详细介绍 DOE Studio 项目的架构、代码结构、以及后续开发指南。

---

## 目录

1. [项目概述](#项目概述)
2. [技术栈](#技术栈)
3. [项目结构](#项目结构)
4. [数据库设计](#数据库设计)
5. [前端组件详解](#前端组件详解)
6. [后端API接口](#后端api接口)
7. [Preview Schematic 绘制详解](#preview-schematic-绘制详解)
8. [Plotly 图表绘制详解](#plotly-图表绘制详解)
9. [后端计算接口开发](#后端计算接口开发)
10. [模板系统详解](#模板系统详解)
11. [国际化系统](#国际化系统)
12. [开发示例](#开发示例)
13. [部署指南](#部署指南)
14. [常见问题](#常见问题)

---

## 项目概述

DOE Studio 是一个用于设计衍射光学元件（Diffractive Optical Elements）的 Web 应用。它提供了参数配置、实时预览、GPU 加速优化和结果分析等功能。

**主要功能模块：**

| 模块 | 描述 | 状态 |
|------|------|------|
| 设计列表 | 管理用户的 DOE 设计，支持创建、编辑、删除 | ✅ 已完成 |
| 模板系统 | 预配置的 DOE 设计模板，便于快速开始 | ✅ 已完成 |
| 参数配置 | 工作距离、波长、DOE 类型、器件尺寸等 | ✅ 已完成 |
| 预览计算 | 根据参数计算预估结果，显示警告信息 | ⚠️ 前端模拟 |
| 优化引擎 | GPU 加速的相位优化算法 | ⚠️ 待后端实现 |
| 结果分析 | 相位图、光强分布、效率统计等可视化 | ✅ 已完成（模拟数据） |

---

## 技术栈

### 前端技术

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 19 | UI 框架 |
| TypeScript | 5.6 | 类型安全 |
| Tailwind CSS | 4 | 样式系统 |
| shadcn/ui | - | UI 组件库 |
| Plotly.js | - | 数据可视化 |
| Wouter | 3.x | 路由 |
| tRPC | - | API 客户端 |

### 后端技术

| 技术 | 版本 | 用途 |
|------|------|------|
| Node.js | 22 | 运行时 |
| Express | 4.x | HTTP 服务器 |
| tRPC | - | API 服务端 |
| Drizzle ORM | - | 数据库 ORM |
| TiDB | - | MySQL 兼容数据库 |

### 计算后端（待实现）

| 技术 | 用途 |
|------|------|
| Python 3.10+ | 计算后端语言 |
| FastAPI | HTTP API 框架 |
| PyTorch | GPU 加速计算 |
| NumPy | 数值计算 |

---

## 项目结构

```
raioptics_clone/
├── client/                          # 前端代码
│   ├── src/
│   │   ├── components/              # React 组件
│   │   │   ├── DOEParameters.tsx    # 参数输入组件 (核心)
│   │   │   ├── DOEResults.tsx       # 结果展示组件 (核心)
│   │   │   ├── CollapsibleSidebar.tsx # 可折叠侧边栏
│   │   │   ├── Header.tsx           # 页头导航
│   │   │   └── ui/                  # shadcn/ui 组件
│   │   ├── contexts/
│   │   │   ├── LanguageContext.tsx  # 国际化上下文 (核心)
│   │   │   └── ThemeContext.tsx     # 主题上下文
│   │   ├── pages/
│   │   │   ├── Home.tsx             # 首页/Landing Page
│   │   │   ├── Studio.tsx           # 设计列表页
│   │   │   └── DOEStudio.tsx        # 设计编辑器页 (核心)
│   │   ├── lib/
│   │   │   └── trpc.ts              # tRPC 客户端配置
│   │   ├── App.tsx                  # 应用入口和路由
│   │   └── index.css                # 全局样式和主题变量
│   └── index.html
├── server/                          # 后端代码
│   ├── routers.ts                   # tRPC 路由定义 (核心)
│   ├── db.ts                        # 数据库操作函数
│   └── index.ts                     # 服务器入口
├── drizzle/
│   └── schema.ts                    # 数据库表结构定义 (核心)
├── scripts/
│   └── seed-templates.mjs           # 模板数据种子脚本
├── DEVELOPMENT_GUIDE.md             # 本文档
├── todo.md                          # 任务跟踪
└── package.json
```

---

## 数据库设计

### doe_designs 表

存储用户的 DOE 设计数据。

```typescript
// drizzle/schema.ts
export const doeDesigns = mysqlTable("doe_designs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),           // 关联用户
  name: varchar("name", { length: 255 }).notNull(),
  mode: varchar("mode", { length: 64 }).notNull(),  // DOE 类型
  status: mysqlEnum("status", ["draft", "optimized"]).default("draft"),
  parameters: json("parameters"),             // DOE 参数 JSON
  previewData: json("previewData"),           // 预览数据 JSON
  optimizationResult: json("optimizationResult"), // 优化结果 JSON
  phaseMapUrl: text("phaseMapUrl"),           // 相位图 S3 URL
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
});
```

**parameters JSON 结构示例：**

```json
{
  "workingDistance": "inf",
  "workingDistanceUnit": "mm",
  "wavelength": "532nm",
  "mode": "2d_spot_projector",
  "deviceDiameter": "12.7mm",
  "deviceShape": "circular",
  "arrayRows": "50",
  "arrayCols": "50",
  "targetType": "angle",
  "targetAngle": "30deg",
  "tolerance": "1",
  "fabricationEnabled": false,
  "fabricationRecipe": ""
}
```

### doe_templates 表

存储预配置的 DOE 设计模板。

```typescript
export const doeTemplates = mysqlTable("doe_templates", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  mode: varchar("mode", { length: 64 }).notNull(),
  category: varchar("category", { length: 64 }),
  parameters: json("parameters").notNull(),   // 预配置参数
  thumbnailUrl: text("thumbnailUrl"),
  isActive: boolean("isActive").default(true),
  displayOrder: int("displayOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
});
```

---

## 前端组件详解

### DOEParameters 组件

**位置：** `client/src/components/DOEParameters.tsx`

该组件负责所有 DOE 参数的输入，包括基本参数、专用设置和加工模拟器。

**参数类型定义：**

```typescript
export interface DOEParams {
  // 基本参数
  workingDistance: string;      // 工作距离，支持 "inf" 或带单位数值
  workingDistanceUnit: string;  // 单位：mm, cm, m, in, ft
  wavelength: string;           // 波长，如 "532nm"
  mode: string;                 // DOE 类型
  deviceDiameter: string;       // 器件直径
  deviceShape: "circular" | "square";
  
  // 2D Spot Projector 特定参数
  arrayRows: string;            // 阵列行数
  arrayCols: string;            // 阵列列数
  targetType: "size" | "angle"; // 目标类型
  targetSize: string;           // 目标尺寸
  targetAngle: string;          // 目标角度（全角）
  tolerance: string;            // 容差百分比
  
  // Fabrication Simulator
  fabricationEnabled: boolean;  // 是否启用加工模拟
  fabricationRecipe: string;    // 加工工艺配方
}
```

**DOE 模式列表：**

| 模式值 | 英文名称 | 中文名称 |
|--------|----------|----------|
| `diffuser` | Diffuser | 匀光片 |
| `1d_splitter` | 1D Splitter | 一维分束器 |
| `2d_spot_projector` | 2D Spot Projector | 二维点阵投影器 |
| `lens` | Diffractive Lens | 衍射透镜 |
| `prism` | Prism | 棱镜 |
| `custom` | Custom Pattern | 自定义图案 |

**添加新的 DOE 模式步骤：**

1. 在 `DOEParameters.tsx` 的 `modeOptions` 数组中添加新模式
2. 在 `renderModeSpecificSettings()` 函数中添加对应的参数输入 UI
3. 在 `LanguageContext.tsx` 中添加对应的翻译键

### DOEResults 组件

**位置：** `client/src/components/DOEResults.tsx`

该组件负责显示预览摘要和优化结果，包括各种 Plotly 图表。

**数据类型定义：**

```typescript
export interface PreviewData {
  totalSpots: number;           // 总光斑数
  pixelPitch: string;           // 像素间距
  diffractionAngle: string;     // 衍射角
  estimatedEfficiency: string;  // 预估效率
  computeTime: string;          // 计算时间
  equivalentFullAngle?: string; // 等效全角（有限远时）
  warnings: string[];           // 警告信息
}

export interface OptimizationResult {
  phaseMap: number[][];         // 相位图数据 (0-255)
  intensityDistribution: number[][]; // 光强分布
  orderEnergies: { order: string; energy: number }[];
  efficiency: {
    total: number;
    uniformity: number;
    zeroOrder: number;
  };
}
```

---

## 后端API接口

### tRPC 路由

**位置：** `server/routers.ts`

**设计相关接口：**

| 接口 | 方法 | 输入 | 输出 | 描述 |
|------|------|------|------|------|
| `designs.list` | Query | - | `Design[]` | 获取当前用户的所有设计 |
| `designs.get` | Query | `{ id: number }` | `Design` | 获取单个设计详情 |
| `designs.create` | Mutation | `{ name, mode }` | `Design` | 创建新设计 |
| `designs.update` | Mutation | `{ id, data }` | `Design` | 更新设计参数和结果 |
| `designs.delete` | Mutation | `{ id: number }` | `void` | 删除设计 |
| `designs.createFromTemplate` | Mutation | `{ templateId }` | `Design` | 从模板创建设计 |

**模板相关接口：**

| 接口 | 方法 | 输入 | 输出 | 描述 |
|------|------|------|------|------|
| `templates.list` | Query | - | `Template[]` | 获取所有活跃模板 |
| `templates.get` | Query | `{ id: number }` | `Template` | 获取单个模板详情 |

---

## Preview Schematic 绘制详解

Preview Schematic 是在 `DOEResults.tsx` 中使用 SVG 绘制的光学系统示意图。

### 当前实现

当前的示意图是简化版本，绘制了基本的光学元件和光线：

```typescript
// DOEResults.tsx 中的 Schematic 组件
const Schematic = () => (
  <svg viewBox="0 0 400 200" className="w-full h-auto">
    {/* DOE 元件 - 青色矩形 */}
    <rect x="50" y="60" width="20" height="80" fill="#0d9488" rx="2" />
    
    {/* 入射光线 - 从左侧进入 */}
    <line x1="0" y1="100" x2="50" y2="100" stroke="#0d9488" strokeWidth="2" />
    
    {/* 衍射光线 - 扇形展开 */}
    {[-2, -1, 0, 1, 2].map((order, i) => {
      const angle = order * 10 * (Math.PI / 180);  // 每级次10度
      const endX = 70 + 300 * Math.cos(angle);
      const endY = 100 - 300 * Math.sin(angle);
      return (
        <line 
          key={i}
          x1="70" y1="100" 
          x2={endX} y2={endY}
          stroke={order === 0 ? "#94a3b8" : "#0d9488"}
          strokeWidth={order === 0 ? "1" : "2"}
          strokeDasharray={order === 0 ? "4" : "0"}
        />
      );
    })}
    
    {/* 目标面 - 右侧垂直线 */}
    <line x1="350" y1="20" x2="350" y2="180" stroke="#64748b" strokeWidth="2" />
  </svg>
);
```

### 根据实际参数绘制

要根据实际 DOE 参数绘制准确的示意图，需要实现以下逻辑：

**1. 衍射角计算函数：**

```typescript
// 解析波长字符串，返回 nm
function parseWavelength(s: string): number {
  const match = s.match(/^([\d.]+)\s*(nm|um|μm)?$/i);
  if (match) {
    const value = parseFloat(match[1]);
    const unit = (match[2] || "nm").toLowerCase();
    if (unit === "um" || unit === "μm") return value * 1000;
    return value;
  }
  return 532; // 默认值
}

// 解析角度字符串，返回度
function parseAngle(s: string): number {
  const match = s.match(/^([\d.]+)\s*(deg|°)?$/i);
  if (match) return parseFloat(match[1]);
  return 30; // 默认值
}

// 解析距离字符串，返回 mm
function parseDistance(s: string): number | null {
  if (s.toLowerCase() === "inf") return null;
  const match = s.match(/^([\d.]+)\s*(mm|cm|m|in|ft)?$/i);
  if (match) {
    const value = parseFloat(match[1]);
    const unit = (match[2] || "mm").toLowerCase();
    const conversions: Record<string, number> = {
      mm: 1, cm: 10, m: 1000, in: 25.4, ft: 304.8,
    };
    return value * (conversions[unit] || 1);
  }
  return 1000;
}

// 计算衍射角（基于光栅方程）
function calculateDiffractionAngles(
  params: DOEParams, 
  previewData: PreviewData
): number[] {
  const wavelength = parseWavelength(params.wavelength); // nm
  const targetAngle = parseAngle(params.targetAngle);    // 度
  const rows = parseInt(params.arrayRows);
  const cols = parseInt(params.arrayCols);
  
  // 计算每个级次的角度
  const angles: number[] = [];
  const maxOrder = Math.max(rows, cols) / 2;
  
  // 简化模型：线性分布
  for (let m = -maxOrder; m <= maxOrder; m++) {
    const angle = targetAngle * (m / maxOrder);
    angles.push(angle);
  }
  
  return angles;
}
```

**2. 改进的 Schematic 组件：**

```typescript
interface SchematicProps {
  params: DOEParams;
  previewData: PreviewData | null;
}

const Schematic = ({ params, previewData }: SchematicProps) => {
  // 计算衍射角
  const targetAngle = parseAngle(params.targetAngle);
  const rows = parseInt(params.arrayRows) || 50;
  const cols = parseInt(params.arrayCols) || 50;
  
  // 生成光线数据（限制显示数量）
  const maxDisplayRays = 11;
  const step = Math.max(1, Math.floor(rows / maxDisplayRays));
  const rays: number[] = [];
  
  for (let i = -Math.floor(rows / 2); i <= Math.floor(rows / 2); i += step) {
    const angle = (targetAngle / 2) * (i / (rows / 2));
    rays.push(angle);
  }
  
  // 计算工作距离
  const distance = parseDistance(params.workingDistance);
  const isInfinite = distance === null;
  
  return (
    <svg viewBox="0 0 400 200" className="w-full h-auto bg-slate-50 rounded-lg">
      {/* 背景网格 */}
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" strokeWidth="0.5"/>
        </pattern>
      </defs>
      <rect width="400" height="200" fill="url(#grid)" />
      
      {/* 入射光线 */}
      <line x1="0" y1="100" x2="50" y2="100" 
            stroke="#0d9488" strokeWidth="3" 
            markerEnd="url(#arrowhead)" />
      
      {/* DOE 元件 */}
      <rect x="50" y="40" width="15" height="120" 
            fill="#0d9488" fillOpacity="0.3" 
            stroke="#0d9488" strokeWidth="2" rx="2" />
      <text x="57" y="170" fontSize="10" fill="#0d9488" textAnchor="middle">
        DOE
      </text>
      
      {/* 衍射光线 */}
      {rays.map((angle, i) => {
        const rad = angle * (Math.PI / 180);
        const length = isInfinite ? 280 : Math.min(280, distance! / 5);
        const endX = 65 + length * Math.cos(rad);
        const endY = 100 - length * Math.sin(rad);
        const isZeroOrder = Math.abs(angle) < 0.5;
        
        return (
          <g key={i}>
            <line 
              x1="65" y1="100" 
              x2={endX} y2={endY}
              stroke={isZeroOrder ? "#94a3b8" : "#ef4444"}
              strokeWidth={isZeroOrder ? "1" : "1.5"}
              strokeDasharray={isZeroOrder ? "4" : "0"}
              opacity={0.4 + 0.6 * (1 - Math.abs(angle) / (targetAngle / 2))}
            />
            {/* 光斑点 */}
            <circle cx={endX} cy={endY} r="3" 
                    fill={isZeroOrder ? "#94a3b8" : "#ef4444"} 
                    opacity="0.8" />
          </g>
        );
      })}
      
      {/* 目标面 */}
      <line x1="350" y1="20" x2="350" y2="180" 
            stroke="#64748b" strokeWidth="2" strokeDasharray="5,5" />
      <text x="360" y="100" fontSize="10" fill="#64748b" 
            transform="rotate(90, 360, 100)">
        Target Plane
      </text>
      
      {/* 角度标注 */}
      <path d={`M 65 100 L 95 100 A 30 30 0 0 0 ${65 + 30 * Math.cos(targetAngle / 2 * Math.PI / 180)} ${100 - 30 * Math.sin(targetAngle / 2 * Math.PI / 180)}`}
            fill="none" stroke="#64748b" strokeWidth="1" />
      <text x="100" y="85" fontSize="9" fill="#64748b">
        {targetAngle}°
      </text>
      
      {/* 箭头定义 */}
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" 
                refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#0d9488" />
        </marker>
      </defs>
    </svg>
  );
};
```

**3. 在 DOEResults 中使用：**

```typescript
// DOEResults.tsx
export default function DOEResults({ 
  previewData, 
  optimizationResult,
  params  // 新增参数
}: DOEResultsProps) {
  return (
    <div>
      {/* 预览摘要 */}
      {previewData && (
        <div className="mb-6">
          <h3>Preview Summary</h3>
          {/* ... 摘要信息 ... */}
          
          {/* 示意图 */}
          <div className="mt-4">
            <Schematic params={params} previewData={previewData} />
          </div>
        </div>
      )}
      
      {/* 优化结果 */}
      {optimizationResult && (
        // ... 图表 ...
      )}
    </div>
  );
}
```

---

## Plotly 图表绘制详解

### 图表类型和用途

| 图表 | Plotly 类型 | 用途 | 数据格式 |
|------|-------------|------|----------|
| 相位图 | `heatmap` | 显示 DOE 相位分布 | `number[][]` (0-255) |
| 光强分布 | `heatmap` | 显示目标面光强 | `number[][]` (归一化) |
| 能量热图 | `heatmap` | 显示各级次能量 | `number[][]` |
| 能量条形图 | `bar` | 比较各级次能量 | `{order, energy}[]` |

### 相位图绘制

```typescript
import Plot from "react-plotly.js";

interface PhaseMapProps {
  data: number[][];  // 256x256 或更大的二维数组，值范围 0-255
  title?: string;
}

const PhaseMapChart = ({ data, title = "Phase Map" }: PhaseMapProps) => {
  return (
    <Plot
      data={[
        {
          z: data,
          type: "heatmap",
          colorscale: "Greys",  // 灰度色阶
          zmin: 0,
          zmax: 255,
          showscale: true,
          colorbar: {
            title: { text: "Phase (0-255)", side: "right" },
            tickvals: [0, 64, 128, 192, 255],
            ticktext: ["0", "π/2", "π", "3π/2", "2π"],
          },
        },
      ]}
      layout={{
        title: { text: title, font: { size: 14 } },
        margin: { t: 40, r: 60, b: 40, l: 40 },
        xaxis: { 
          title: "X (pixels)",
          scaleanchor: "y",  // 保持纵横比
        },
        yaxis: { 
          title: "Y (pixels)",
        },
        paper_bgcolor: "transparent",
        plot_bgcolor: "transparent",
      }}
      config={{ 
        responsive: true, 
        displayModeBar: true,
        modeBarButtonsToRemove: ["lasso2d", "select2d"],
      }}
      style={{ width: "100%", height: "350px" }}
    />
  );
};
```

### 光强分布图绘制

```typescript
interface IntensityMapProps {
  data: number[][];  // 归一化的光强数据
  title?: string;
}

const IntensityMapChart = ({ data, title = "Intensity Distribution" }: IntensityMapProps) => {
  return (
    <Plot
      data={[
        {
          z: data,
          type: "heatmap",
          colorscale: "Hot",  // 热力图色阶
          showscale: true,
          colorbar: {
            title: { text: "Intensity (a.u.)", side: "right" },
          },
        },
      ]}
      layout={{
        title: { text: title, font: { size: 14 } },
        margin: { t: 40, r: 60, b: 40, l: 40 },
        xaxis: { 
          title: "X Order",
          scaleanchor: "y",
        },
        yaxis: { 
          title: "Y Order",
        },
      }}
      config={{ responsive: true, displayModeBar: false }}
      style={{ width: "100%", height: "350px" }}
    />
  );
};
```

### 能量条形图绘制

```typescript
interface OrderEnergy {
  order: string;  // 如 "-25", "0", "25"
  energy: number; // 归一化能量 0-1
}

interface EnergyBarChartProps {
  data: OrderEnergy[];
  title?: string;
}

const EnergyBarChart = ({ data, title = "Order Energies" }: EnergyBarChartProps) => {
  // 按级次排序
  const sortedData = [...data].sort((a, b) => parseInt(a.order) - parseInt(b.order));
  
  return (
    <Plot
      data={[
        {
          x: sortedData.map(d => d.order),
          y: sortedData.map(d => d.energy),
          type: "bar",
          marker: {
            color: sortedData.map(d => 
              d.order === "0" ? "#94a3b8" : "#0d9488"
            ),
          },
          text: sortedData.map(d => `${(d.energy * 100).toFixed(1)}%`),
          textposition: "outside",
        },
      ]}
      layout={{
        title: { text: title, font: { size: 14 } },
        margin: { t: 40, r: 20, b: 60, l: 50 },
        xaxis: { 
          title: "Diffraction Order",
          tickangle: -45,
        },
        yaxis: { 
          title: "Relative Energy",
          range: [0, 1.1],
        },
        bargap: 0.3,
      }}
      config={{ responsive: true, displayModeBar: false }}
      style={{ width: "100%", height: "300px" }}
    />
  );
};
```

### 数据从后端传入

**1. 定义 API 响应类型：**

```typescript
// shared/types.ts
export interface OptimizationResponse {
  success: boolean;
  result: {
    phaseMap: number[][];           // 256x256 相位数组
    intensityDistribution: number[][]; // 目标面光强
    orderEnergies: Array<{
      order: string;
      energy: number;
    }>;
    efficiency: {
      total: number;
      uniformity: number;
      zeroOrder: number;
    };
    phaseMapUrl?: string;           // S3 存储的相位图 URL
  };
}
```

**2. 在组件中使用 tRPC 获取数据：**

```typescript
// DOEStudio.tsx
import { trpc } from "@/lib/trpc";

function DOEStudio() {
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  
  // 优化 mutation
  const optimizeMutation = trpc.designs.optimize.useMutation({
    onSuccess: (data) => {
      setOptimizationResult(data.result);
      toast.success("Optimization completed!");
    },
    onError: (error) => {
      toast.error(`Optimization failed: ${error.message}`);
    },
  });
  
  const handleOptimize = async () => {
    await optimizeMutation.mutateAsync({
      designId: currentDesignId,
      iterations: 100,
    });
  };
  
  return (
    <div>
      <button onClick={handleOptimize} disabled={optimizeMutation.isPending}>
        {optimizeMutation.isPending ? "Optimizing..." : "Optimize"}
      </button>
      
      {optimizationResult && (
        <DOEResults 
          optimizationResult={optimizationResult}
          params={currentParams}
        />
      )}
    </div>
  );
}
```

---

## 后端计算接口开发

### 架构设计

推荐使用 Python FastAPI 作为计算后端，通过 HTTP API 与 Node.js 主服务器通信。

```
┌─────────────────┐     HTTP      ┌─────────────────┐
│   Node.js       │ ──────────▶  │   Python        │
│   (tRPC API)    │              │   (FastAPI)     │
│                 │ ◀──────────  │   + PyTorch     │
└─────────────────┘              └─────────────────┘
         │                                │
         │                                │
         ▼                                ▼
    ┌─────────┐                    ┌─────────────┐
    │  TiDB   │                    │    GPU      │
    │ Database│                    │  (CUDA)     │
    └─────────┘                    └─────────────┘
```

### Python 后端目录结构

```
python_backend/
├── main.py                     # FastAPI 入口
├── routers/
│   ├── __init__.py
│   ├── preview.py              # 预览计算路由
│   └── optimize.py             # 优化计算路由
├── algorithms/
│   ├── __init__.py
│   ├── gs_algorithm.py         # Gerchberg-Saxton 算法
│   ├── ifta.py                 # IFTA 算法
│   ├── diffuser.py             # 匀光片算法
│   └── utils.py                # 工具函数
├── models/
│   ├── __init__.py
│   └── schemas.py              # Pydantic 数据模型
├── tests/
│   ├── test_preview.py
│   └── test_optimize.py
├── requirements.txt
└── Dockerfile
```

### FastAPI 完整示例

**main.py:**

```python
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Literal
import numpy as np
import torch
import time

app = FastAPI(
    title="DOE Optimization API",
    description="Backend API for DOE design optimization",
    version="1.0.0",
)

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== 数据模型 ====================

class DOEParams(BaseModel):
    working_distance: str = Field(..., description="Working distance, e.g., 'inf' or '100mm'")
    wavelength: str = Field(..., description="Wavelength, e.g., '532nm'")
    mode: Literal["diffuser", "1d_splitter", "2d_spot_projector", "lens", "prism", "custom"]
    device_diameter: str = Field(..., description="Device diameter, e.g., '12.7mm'")
    device_shape: Literal["circular", "square"]
    array_rows: int = Field(50, ge=1, le=1000)
    array_cols: int = Field(50, ge=1, le=1000)
    target_type: Literal["size", "angle"]
    target_angle: Optional[str] = None
    target_size: Optional[str] = None
    tolerance: float = Field(1.0, ge=0.1, le=10.0)
    fabrication_enabled: bool = False
    fabrication_recipe: Optional[str] = None

class PreviewRequest(BaseModel):
    params: DOEParams

class PreviewResponse(BaseModel):
    total_spots: int
    pixel_pitch: str
    diffraction_angle: str
    estimated_efficiency: str
    compute_time: str
    equivalent_full_angle: Optional[str] = None
    warnings: List[str]

class OptimizeRequest(BaseModel):
    params: DOEParams
    iterations: int = Field(100, ge=10, le=1000)
    resolution: int = Field(256, ge=64, le=1024)

class OrderEnergy(BaseModel):
    order: str
    energy: float

class EfficiencyMetrics(BaseModel):
    total: float
    uniformity: float
    zero_order: float

class OptimizeResponse(BaseModel):
    phase_map: List[List[int]]
    intensity_distribution: List[List[float]]
    order_energies: List[OrderEnergy]
    efficiency: EfficiencyMetrics
    computation_time: float

# ==================== 工具函数 ====================

def parse_wavelength(s: str) -> float:
    """解析波长字符串，返回 nm"""
    import re
    match = re.match(r"([\d.]+)\s*(nm|um|μm)?", s.lower())
    if match:
        value = float(match.group(1))
        unit = match.group(2) or "nm"
        if unit in ["um", "μm"]:
            value *= 1000
        return value
    return 532.0

def parse_angle(s: str) -> float:
    """解析角度字符串，返回度"""
    import re
    match = re.match(r"([\d.]+)\s*(deg|°)?", s.lower())
    if match:
        return float(match.group(1))
    return 30.0

def parse_distance(s: str) -> Optional[float]:
    """解析距离字符串，返回 mm，inf 返回 None"""
    if s.lower() == "inf":
        return None
    import re
    match = re.match(r"([\d.]+)\s*(mm|cm|m|in|ft)?", s.lower())
    if match:
        value = float(match.group(1))
        unit = match.group(2) or "mm"
        conversions = {"mm": 1, "cm": 10, "m": 1000, "in": 25.4, "ft": 304.8}
        return value * conversions.get(unit, 1)
    return 1000.0

def create_target_pattern(params: DOEParams, resolution: int, device) -> torch.Tensor:
    """创建目标图案"""
    pattern = torch.zeros(resolution, resolution, device=device)
    
    if params.mode == "2d_spot_projector":
        rows, cols = params.array_rows, params.array_cols
        
        # 计算光斑位置
        center = resolution // 2
        target_angle = parse_angle(params.target_angle or "30deg")
        
        # 将角度转换为频率空间的位置
        max_freq = resolution // 2 - 10
        
        for i in range(rows):
            for j in range(cols):
                # 归一化位置 [-1, 1]
                y_norm = (i - rows / 2 + 0.5) / (rows / 2)
                x_norm = (j - cols / 2 + 0.5) / (cols / 2)
                
                # 转换为频率空间坐标
                fy = int(center + y_norm * max_freq * (target_angle / 45))
                fx = int(center + x_norm * max_freq * (target_angle / 45))
                
                if 0 <= fy < resolution and 0 <= fx < resolution:
                    # 创建高斯光斑
                    for dy in range(-2, 3):
                        for dx in range(-2, 3):
                            ny, nx = fy + dy, fx + dx
                            if 0 <= ny < resolution and 0 <= nx < resolution:
                                dist = np.sqrt(dy**2 + dx**2)
                                pattern[ny, nx] += np.exp(-dist**2 / 2)
    
    elif params.mode == "diffuser":
        # 均匀圆形分布
        center = resolution // 2
        radius = resolution // 4
        y, x = torch.meshgrid(
            torch.arange(resolution, device=device),
            torch.arange(resolution, device=device),
            indexing="ij"
        )
        dist = torch.sqrt((y - center)**2 + (x - center)**2)
        pattern = (dist < radius).float()
    
    # 归一化
    if pattern.max() > 0:
        pattern = pattern / pattern.max()
    
    return pattern

# ==================== API 端点 ====================

@app.get("/health")
async def health_check():
    """健康检查"""
    return {
        "status": "healthy",
        "cuda_available": torch.cuda.is_available(),
        "device": "cuda" if torch.cuda.is_available() else "cpu",
    }

@app.post("/api/preview", response_model=PreviewResponse)
async def preview(request: PreviewRequest):
    """预计算，返回摘要信息和警告"""
    params = request.params
    
    # 解析参数
    wavelength_nm = parse_wavelength(params.wavelength)
    target_angle = parse_angle(params.target_angle or "30deg")
    distance = parse_distance(params.working_distance)
    
    # 计算总光斑数
    total_spots = params.array_rows * params.array_cols
    
    # 计算像素间距（假设 256 像素分辨率）
    device_diameter = parse_distance(params.device_diameter) or 12.7
    pixel_pitch = device_diameter / 256 * 1000  # μm
    
    # 计算等效全角（有限远时）
    equivalent_full_angle = None
    if distance is not None and params.target_type == "size":
        target_size = parse_distance(params.target_size or "100mm") or 100
        half_angle = np.arctan(target_size / 2 / distance) * 180 / np.pi
        equivalent_full_angle = f"{2 * half_angle:.1f}°"
        target_angle = 2 * half_angle
    
    # 检查警告
    warnings = []
    
    if target_angle > 60:
        warnings.append("Diffraction angle exceeds 60°, efficiency may be significantly reduced")
    elif target_angle > 45:
        warnings.append("Large diffraction angle (>45°), consider paraxial approximation limits")
    
    if params.tolerance < 0.5:
        warnings.append("Tolerance below 0.5% may require longer optimization time")
    
    if total_spots > 10000:
        warnings.append(f"Large array ({total_spots} spots) may require extended computation")
    
    if pixel_pitch < 1:
        warnings.append("Pixel pitch below 1μm may be challenging to fabricate")
    
    # 估算计算时间
    base_time = 10  # 基础时间（秒）
    spot_factor = total_spots / 2500  # 光斑数量因子
    compute_time = base_time * spot_factor
    
    return PreviewResponse(
        total_spots=total_spots,
        pixel_pitch=f"{pixel_pitch:.2f} μm",
        diffraction_angle=f"{target_angle:.1f}°",
        estimated_efficiency="75-85%",
        compute_time=f"~{int(compute_time)}s",
        equivalent_full_angle=equivalent_full_angle,
        warnings=warnings,
    )

@app.post("/api/optimize", response_model=OptimizeResponse)
async def optimize(request: OptimizeRequest):
    """执行 DOE 优化"""
    start_time = time.time()
    params = request.params
    resolution = request.resolution
    iterations = request.iterations
    
    # 选择设备
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    
    # 创建目标图案
    target = create_target_pattern(params, resolution, device)
    target_amplitude = torch.sqrt(target + 1e-10)
    
    # 初始化相位（随机）
    phase = torch.rand(resolution, resolution, device=device) * 2 * np.pi
    
    # GS 算法迭代
    for i in range(iterations):
        # 近场：单位振幅 + 当前相位
        near_field = torch.exp(1j * phase)
        
        # 传播到远场
        far_field = torch.fft.fftshift(torch.fft.fft2(near_field))
        
        # 应用目标振幅约束，保持相位
        far_field_constrained = target_amplitude * torch.exp(1j * torch.angle(far_field))
        
        # 反向传播
        near_field_new = torch.fft.ifft2(torch.fft.ifftshift(far_field_constrained))
        
        # 更新相位
        phase = torch.angle(near_field_new)
    
    # 计算最终远场
    final_near_field = torch.exp(1j * phase)
    final_far_field = torch.fft.fftshift(torch.fft.fft2(final_near_field))
    intensity = torch.abs(final_far_field) ** 2
    
    # 转换为 8-bit 相位图
    phase_normalized = ((phase.cpu().numpy() + np.pi) / (2 * np.pi) * 255).astype(int)
    phase_map = phase_normalized.tolist()
    
    # 归一化光强分布
    intensity_np = intensity.cpu().numpy()
    intensity_normalized = (intensity_np / intensity_np.max()).tolist()
    
    # 计算各级次能量
    order_energies = []
    center = resolution // 2
    max_order = min(params.array_rows, params.array_cols) // 2
    
    for m in range(-5, 6):
        # 简化：从中心区域采样
        idx = center + int(m * resolution / 20)
        if 0 <= idx < resolution:
            energy = float(intensity_np[center, idx] / intensity_np.max())
            order_energies.append(OrderEnergy(order=str(m), energy=energy))
    
    # 计算效率指标
    total_efficiency = float(intensity_np.sum() / (resolution * resolution))
    target_region = target.cpu().numpy() > 0.1
    signal_energy = intensity_np[target_region].sum() if target_region.any() else 0
    uniformity = 1 - float(intensity_np[target_region].std() / intensity_np[target_region].mean()) if target_region.any() else 0
    zero_order = float(intensity_np[center, center] / intensity_np.sum())
    
    computation_time = time.time() - start_time
    
    return OptimizeResponse(
        phase_map=phase_map,
        intensity_distribution=intensity_normalized,
        order_energies=order_energies,
        efficiency=EfficiencyMetrics(
            total=min(0.95, total_efficiency * 10),
            uniformity=max(0, min(1, uniformity)),
            zero_order=zero_order,
        ),
        computation_time=computation_time,
    )

# ==================== 启动 ====================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

**requirements.txt:**

```
fastapi>=0.100.0
uvicorn>=0.23.0
pydantic>=2.0.0
numpy>=1.24.0
torch>=2.0.0
```

### Node.js 调用 Python API

在 `server/routers.ts` 中添加调用逻辑：

```typescript
// server/routers.ts
import axios from "axios";
import { z } from "zod";

const PYTHON_API_URL = process.env.PYTHON_API_URL || "http://localhost:8000";

// 添加到 appRouter
export const appRouter = router({
  designs: router({
    // ... 现有路由 ...
    
    // 预览计算
    preview: protectedProcedure
      .input(z.object({
        designId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        // 获取设计
        const design = await getDesignById(input.designId);
        if (!design) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        
        // 转换参数格式
        const params = {
          working_distance: design.parameters.workingDistance,
          wavelength: design.parameters.wavelength,
          mode: design.parameters.mode,
          device_diameter: design.parameters.deviceDiameter,
          device_shape: design.parameters.deviceShape,
          array_rows: parseInt(design.parameters.arrayRows),
          array_cols: parseInt(design.parameters.arrayCols),
          target_type: design.parameters.targetType,
          target_angle: design.parameters.targetAngle,
          target_size: design.parameters.targetSize,
          tolerance: parseFloat(design.parameters.tolerance),
          fabrication_enabled: design.parameters.fabricationEnabled,
          fabrication_recipe: design.parameters.fabricationRecipe,
        };
        
        try {
          // 调用 Python API
          const response = await axios.post(
            `${PYTHON_API_URL}/api/preview`,
            { params },
            { timeout: 30000 }
          );
          
          // 更新设计的预览数据
          await updateDesign(input.designId, {
            previewData: response.data,
          });
          
          return response.data;
        } catch (error) {
          console.error("Preview API error:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to compute preview",
          });
        }
      }),
    
    // 优化计算
    optimize: protectedProcedure
      .input(z.object({
        designId: z.number(),
        iterations: z.number().min(10).max(1000).default(100),
      }))
      .mutation(async ({ ctx, input }) => {
        const design = await getDesignById(input.designId);
        if (!design) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        
        const params = {
          working_distance: design.parameters.workingDistance,
          wavelength: design.parameters.wavelength,
          mode: design.parameters.mode,
          device_diameter: design.parameters.deviceDiameter,
          device_shape: design.parameters.deviceShape,
          array_rows: parseInt(design.parameters.arrayRows),
          array_cols: parseInt(design.parameters.arrayCols),
          target_type: design.parameters.targetType,
          target_angle: design.parameters.targetAngle,
          target_size: design.parameters.targetSize,
          tolerance: parseFloat(design.parameters.tolerance),
          fabrication_enabled: design.parameters.fabricationEnabled,
          fabrication_recipe: design.parameters.fabricationRecipe,
        };
        
        try {
          const response = await axios.post(
            `${PYTHON_API_URL}/api/optimize`,
            { params, iterations: input.iterations },
            { timeout: 300000 }  // 5分钟超时
          );
          
          // 可选：保存相位图到 S3
          // const phaseMapUrl = await uploadPhaseMap(response.data.phase_map);
          
          // 更新设计
          await updateDesign(input.designId, {
            status: "optimized",
            optimizationResult: response.data,
            // phaseMapUrl,
          });
          
          return response.data;
        } catch (error) {
          console.error("Optimize API error:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Optimization failed",
          });
        }
      }),
  }),
});
```

---

## 模板系统详解

### 现有模板列表

数据库中已添加以下模板：

| ID | 名称 | 模式 | 描述 |
|----|------|------|------|
| 1 | 50×50 Spot Array | 2d_spot_projector | 标准50×50点阵，适用于结构光应用 |
| 2 | 100×100 High-Density Array | 2d_spot_projector | 高密度100×100点阵，适用于高分辨率3D重建 |
| 3 | 1D Line Splitter (1×7) | 1d_splitter | 一维7点分束器，常用于激光线生成 |
| 4 | Gaussian Diffuser (10°) | diffuser | 10°高斯匀光片，创建均匀圆形照明 |
| 5 | Square Diffuser (20°×20°) | diffuser | 20°×20°方形匀光片，适用于矩形照明 |
| 6 | Diffractive Lens (f=100mm) | lens | 100mm焦距衍射透镜 |
| 7 | 5° Beam Deflector | prism | 5°光束偏转棱镜 |
| 8 | LiDAR Pattern (31×31) | 2d_spot_projector | 汽车LiDAR优化点阵 |

### 添加新模板

**方法一：通过 SQL 直接插入**

```sql
INSERT INTO doe_templates (
  name, 
  description, 
  mode, 
  category, 
  parameters, 
  isActive, 
  displayOrder, 
  createdAt, 
  updatedAt
) VALUES (
  'My Custom Template',
  'Description of the template for users to understand its purpose',
  '2d_spot_projector',
  'spot_projector',
  '{
    "workingDistance": "inf",
    "workingDistanceUnit": "mm",
    "wavelength": "532nm",
    "mode": "2d_spot_projector",
    "deviceDiameter": "12.7mm",
    "deviceShape": "circular",
    "arrayRows": "30",
    "arrayCols": "30",
    "targetType": "angle",
    "targetAngle": "20deg",
    "tolerance": "1",
    "fabricationEnabled": false,
    "fabricationRecipe": ""
  }',
  true,
  10,
  NOW(),
  NOW()
);
```

**方法二：通过 Manus 数据库面板**

1. 在 Manus 管理界面中打开 Database 面板
2. 选择 `doe_templates` 表
3. 点击 "Add Row" 添加新记录
4. 填写各字段值

**方法三：通过种子脚本**

编辑 `scripts/seed-templates.mjs`：

```javascript
// scripts/seed-templates.mjs
import pg from "pg";

const templates = [
  // 现有模板...
  
  // 添加新模板
  {
    name: "Custom 20×20 Array",
    description: "Custom 20×20 spot array for specific application",
    mode: "2d_spot_projector",
    category: "spot_projector",
    parameters: JSON.stringify({
      workingDistance: "500mm",
      workingDistanceUnit: "mm",
      wavelength: "635nm",
      mode: "2d_spot_projector",
      deviceDiameter: "10mm",
      deviceShape: "circular",
      arrayRows: "20",
      arrayCols: "20",
      targetType: "angle",
      targetAngle: "15deg",
      tolerance: "2",
      fabricationEnabled: false,
      fabricationRecipe: "",
    }),
    isActive: true,
    displayOrder: 9,
  },
];

async function seedTemplates() {
  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  
  await client.connect();
  
  for (const template of templates) {
    await client.query(`
      INSERT INTO doe_templates (name, description, mode, category, parameters, isActive, displayOrder, createdAt, updatedAt)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      ON CONFLICT (name) DO UPDATE SET
        description = $2,
        parameters = $5,
        updatedAt = NOW()
    `, [
      template.name,
      template.description,
      template.mode,
      template.category,
      template.parameters,
      template.isActive,
      template.displayOrder,
    ]);
  }
  
  await client.end();
  console.log("Templates seeded successfully!");
}

seedTemplates().catch(console.error);
```

运行：`node scripts/seed-templates.mjs`

### 模板参数说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `name` | string | ✅ | 模板名称，显示在卡片标题 |
| `description` | string | ✅ | 模板描述，显示在卡片下方 |
| `mode` | string | ✅ | DOE 类型，必须是有效的模式值 |
| `category` | string | ❌ | 分类，用于筛选 |
| `parameters` | JSON | ✅ | 预配置参数，格式与 DOEParams 对应 |
| `isActive` | boolean | ❌ | 是否显示，默认 true |
| `displayOrder` | number | ❌ | 显示顺序，数字越小越靠前 |

---

## 国际化系统

### 翻译文件结构

位置：`client/src/contexts/LanguageContext.tsx`

```typescript
export const translations = {
  en: {
    // 通用
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.delete": "Delete",
    "common.loading": "Loading...",
    
    // 导航
    "nav.home": "Home",
    "nav.studio": "Studio",
    "nav.docs": "Docs",
    "nav.pricing": "Pricing",
    
    // Studio 页面
    "studio.myDesigns": "My Designs",
    "studio.newDesign": "New Design",
    "studio.templates": "Templates",
    "studio.hideTemplates": "Hide",
    "studio.showTemplates": "Show",
    
    // 参数
    "params.basicParams": "Basic Parameters",
    "params.workingDistance": "Working Distance",
    "params.wavelength": "Wavelength",
    "params.doeMode": "DOE Mode",
    "params.deviceDiameter": "Device Diameter",
    "params.deviceShape": "Device Shape",
    "params.circular": "Circular",
    "params.square": "Square",
    
    // 2D Spot Projector
    "params.arraySize": "Array Size (rows × cols)",
    "params.targetSpec": "Target Specification",
    "params.targetSize": "Target Size",
    "params.fullAngle": "Full Angle",
    "params.tolerance": "Tolerance",
    
    // Fabrication
    "params.fabricationSimulator": "Fabrication Simulator",
    "params.enableFabrication": "Enable fabrication simulation",
    "params.recipe": "Recipe",
    
    // 结果
    "results.title": "Results",
    "results.noResults": "No Results",
    "results.previewSummary": "Preview Summary",
    "results.optimizationResults": "Optimization Results",
    "results.phaseMap": "Phase Map",
    "results.intensityDistribution": "Intensity Distribution",
    "results.orderEnergies": "Order Energies",
    "results.efficiency": "Efficiency",
    
    // 按钮
    "button.preview": "Preview",
    "button.optimize": "Optimize",
    "button.export": "Export",
  },
  
  zh: {
    // 通用
    "common.save": "保存",
    "common.cancel": "取消",
    "common.delete": "删除",
    "common.loading": "加载中...",
    
    // 导航
    "nav.home": "首页",
    "nav.studio": "工作室",
    "nav.docs": "文档",
    "nav.pricing": "定价",
    
    // Studio 页面
    "studio.myDesigns": "我的设计",
    "studio.newDesign": "新建设计",
    "studio.templates": "模板",
    "studio.hideTemplates": "隐藏",
    "studio.showTemplates": "显示",
    
    // 参数
    "params.basicParams": "基本参数",
    "params.workingDistance": "工作距离",
    "params.wavelength": "工作波长",
    "params.doeMode": "DOE模式",
    "params.deviceDiameter": "器件直径",
    "params.deviceShape": "器件形状",
    "params.circular": "圆形",
    "params.square": "方形",
    
    // 2D Spot Projector
    "params.arraySize": "阵列规模 (行×列)",
    "params.targetSpec": "规格",
    "params.targetSize": "目标尺寸",
    "params.fullAngle": "全角",
    "params.tolerance": "容差",
    
    // Fabrication
    "params.fabricationSimulator": "加工模拟器",
    "params.enableFabrication": "启用加工模拟",
    "params.recipe": "工艺配方",
    
    // 结果
    "results.title": "结果",
    "results.noResults": "暂无结果",
    "results.previewSummary": "预览摘要",
    "results.optimizationResults": "优化结果",
    "results.phaseMap": "相位图",
    "results.intensityDistribution": "光强分布",
    "results.orderEnergies": "级次能量",
    "results.efficiency": "效率",
    
    // 按钮
    "button.preview": "预览",
    "button.optimize": "优化",
    "button.export": "导出",
  },
};
```

### 添加新翻译

1. 在 `translations.en` 中添加英文键值对
2. 在 `translations.zh` 中添加对应的中文翻译
3. 在组件中使用 `t("key")` 获取翻译

```typescript
// 组件中使用
import { useLanguage } from "@/contexts/LanguageContext";

function MyComponent() {
  const { t, language, setLanguage } = useLanguage();
  
  return (
    <div>
      <h1>{t("params.basicParams")}</h1>
      <button onClick={() => setLanguage(language === "en" ? "zh" : "en")}>
        {language === "en" ? "中文" : "English"}
      </button>
    </div>
  );
}
```

---

## 开发示例

### 示例1：添加新的 DOE 模式 "Vortex Beam"

**步骤1：更新 DOEParameters.tsx**

```typescript
// 在 modeOptions 数组中添加
const modeOptions = [
  // ... 现有选项
  { value: "vortex", labelEn: "Vortex Beam", labelZh: "涡旋光束" },
];

// 在 renderModeSpecificSettings 中添加
{params.mode === "vortex" && (
  <div className="space-y-4">
    <div>
      <Label>{t("params.topologicalCharge")}</Label>
      <Input
        type="number"
        value={params.topologicalCharge || "1"}
        onChange={(e) => onChange({ ...params, topologicalCharge: e.target.value })}
        min={-10}
        max={10}
      />
      <p className="text-xs text-muted-foreground mt-1">
        {t("params.topologicalChargeHint")}
      </p>
    </div>
  </div>
)}
```

**步骤2：更新类型定义**

```typescript
// DOEParams 接口添加
export interface DOEParams {
  // ... 现有字段
  topologicalCharge?: string;  // 涡旋光束拓扑荷
}
```

**步骤3：添加翻译**

```typescript
// LanguageContext.tsx
en: {
  // ...
  "params.topologicalCharge": "Topological Charge",
  "params.topologicalChargeHint": "Integer value, positive for right-handed, negative for left-handed",
},
zh: {
  // ...
  "params.topologicalCharge": "拓扑荷",
  "params.topologicalChargeHint": "整数值，正数为右旋，负数为左旋",
},
```

**步骤4：更新 Python 后端**

```python
# algorithms/vortex.py
def create_vortex_pattern(params, resolution, device):
    """创建涡旋光束目标图案"""
    charge = int(params.topological_charge or 1)
    
    y, x = torch.meshgrid(
        torch.linspace(-1, 1, resolution, device=device),
        torch.linspace(-1, 1, resolution, device=device),
        indexing="ij"
    )
    
    theta = torch.atan2(y, x)
    r = torch.sqrt(x**2 + y**2)
    
    # 涡旋相位
    vortex_phase = charge * theta
    
    # 环形强度分布
    ring_width = 0.2
    ring_radius = 0.5
    intensity = torch.exp(-((r - ring_radius) / ring_width)**2)
    
    return intensity, vortex_phase
```

### 示例2：添加新的分析图表

**在 DOEResults.tsx 中添加极坐标图：**

```typescript
// 添加新的图表组件
const PolarEfficiencyChart = ({ 
  data 
}: { 
  data: { angle: number; efficiency: number }[] 
}) => {
  return (
    <Plot
      data={[
        {
          type: "scatterpolar",
          mode: "lines+markers",
          r: data.map(d => d.efficiency),
          theta: data.map(d => d.angle),
          fill: "toself",
          fillcolor: "rgba(13, 148, 136, 0.2)",
          line: { color: "#0d9488" },
        },
      ]}
      layout={{
        title: { text: "Angular Efficiency Distribution" },
        polar: {
          radialaxis: {
            visible: true,
            range: [0, 1],
          },
        },
        showlegend: false,
      }}
      config={{ responsive: true }}
      style={{ width: "100%", height: "350px" }}
    />
  );
};

// 在 showOptions 中添加
const [showOptions, setShowOptions] = useState({
  phaseMap: true,
  intensity: true,
  orderEnergies: true,
  efficiency: true,
  polarEfficiency: false,  // 新增
});
```

---

## 部署指南

### 环境变量

```env
# 数据库（必需）
DATABASE_URL=mysql://user:password@host:port/database

# Python API（可选，用于实际计算）
PYTHON_API_URL=http://localhost:8000

# JWT 密钥（已自动配置）
JWT_SECRET=xxx

# S3 存储（已内置）
# 使用 storagePut/storageGet 函数
```

### 本地开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 数据库迁移
pnpm db:push

# 类型检查
pnpm check

# 运行测试
pnpm test
```

### Python 后端部署

```bash
# 创建虚拟环境
python -m venv venv
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt

# 启动服务
uvicorn main:app --host 0.0.0.0 --port 8000

# 或使用 Docker
docker build -t doe-optimizer .
docker run -p 8000:8000 --gpus all doe-optimizer
```

### 发布到 Manus

1. 保存检查点：在开发完成后调用 `webdev_save_checkpoint`
2. 点击 UI 中的 "Publish" 按钮
3. 配置自定义域名（可选）

---

## 常见问题

### Q: 如何调试 Plotly 图表？

在浏览器控制台中检查 Plotly 数据：

```javascript
// 获取图表数据
const plot = document.querySelector('.js-plotly-plot');
console.log(plot.data, plot.layout);

// 或使用 Plotly 方法
Plotly.toImage(plot, { format: 'png', width: 800, height: 600 });
```

### Q: 如何测试移动端布局？

1. 使用 Chrome DevTools 的设备模拟器（F12 → Toggle device toolbar）
2. 测试常见断点：375px (iPhone), 768px (iPad), 1024px (Desktop)
3. 检查 Tailwind 响应式类是否正确应用

### Q: 如何添加新的 DOE 类型？

1. 在 `DOEParameters.tsx` 中添加模式选项
2. 在 `renderModeSpecificSettings()` 中添加参数 UI
3. 在 `LanguageContext.tsx` 中添加翻译
4. 在 Python 后端添加对应的优化算法
5. 更新 `create_target_pattern()` 函数

### Q: 优化速度太慢怎么办？

1. 减少迭代次数（iterations）
2. 降低分辨率（resolution）
3. 确保使用 GPU（检查 `torch.cuda.is_available()`）
4. 考虑使用更高效的算法（如 IFTA）

### Q: 如何导出相位图？

目前前端支持将 Plotly 图表导出为 PNG。要导出原始数据：

```typescript
// 在 DOEStudio.tsx 中添加导出功能
const handleExport = () => {
  if (!optimizationResult) return;
  
  // 导出为 JSON
  const blob = new Blob(
    [JSON.stringify(optimizationResult.phaseMap)],
    { type: "application/json" }
  );
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "phase_map.json";
  a.click();
};
```

---

## 联系方式

如有问题或建议，请通过以下方式联系：

- 项目 Issues
- 开发者邮箱

---

*文档版本：2.0*
*最后更新：2024年12月*


---

## 用户认证系统

DOE Studio 使用 Manus OAuth 进行用户认证，已预配置完成，无需额外设置。

### 认证流程

```
用户点击登录 → 重定向到 Manus OAuth → 授权后回调 → 创建/更新用户 → 设置 Session Cookie
```

### 使用 useAuth Hook

```typescript
// 在任何组件中获取当前用户信息
import { useAuth } from "@/_core/hooks/useAuth";

function MyComponent() {
  const { user, isLoading, isAuthenticated } = useAuth();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <div>Please sign in</div>;
  }
  
  return (
    <div>
      <p>Welcome, {user?.name}</p>
      <p>Email: {user?.email}</p>
      <p>Credits: {user?.optimizationCredits}</p>
    </div>
  );
}
```

### 用户数据结构

```typescript
interface User {
  id: number;                    // 数据库主键
  openId: string;                // Manus OAuth ID
  name: string | null;           // 用户名
  email: string | null;          // 邮箱
  role: "user" | "admin";        // 角色
  optimizationCredits: number;   // 剩余优化额度
  stripeCustomerId: string | null; // Stripe 客户 ID
  createdAt: Date;
  updatedAt: Date;
  lastSignedIn: Date;
}
```

### 保护路由

```typescript
// 在 tRPC 路由中使用 protectedProcedure
import { protectedProcedure } from "./_core/trpc";

export const appRouter = router({
  // 需要登录才能访问的接口
  designs: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      // ctx.user 已验证存在
      return await getDoeDesignsByUserId(ctx.user.id);
    }),
  }),
});
```

### 登录/登出

登录和登出由 Header 组件中的 `<AccountButton />` 处理，无需手动实现。

---

## Stripe 支付系统

DOE Studio 集成了 Stripe 支付，支持优化额度购买和 DOE 加工服务订购。

### 环境变量

以下环境变量已自动配置：

| 变量名 | 描述 |
|--------|------|
| `STRIPE_SECRET_KEY` | Stripe 服务端密钥 |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe 客户端公钥 |
| `STRIPE_WEBHOOK_SECRET` | Webhook 签名密钥 |

### 产品配置

产品和价格定义在 `server/stripe/products.ts`：

```typescript
export const PRODUCTS = {
  // 优化额度
  CREDITS_BASIC: {
    id: "credits_basic",
    name: "Basic Optimization Pack",
    description: "25 GPU-accelerated optimization runs",
    credits: 25,
    price: {
      usd: 200,   // $2.00 (单位：分)
      cny: 1000,  // ¥10.00 (单位：分)
    },
  },
  
  // DOE 加工服务
  FABRICATION_ONE_INCH: {
    id: "fab_1in",
    name: 'DOE Fabrication - 1"',
    description: "25.4mm diameter DOE fabrication",
    size: "1in",
    price: {
      usd: 40000,  // $400.00
      cny: 280000, // ¥2800.00
    },
    rushMultiplier: 2,  // 加急费 100%
    standardDays: 7,
    rushDays: 3,
  },
  // ... 更多产品
};
```

### 前端调用支付

```typescript
import { trpc } from "@/lib/trpc";

function PurchaseButton() {
  const createCheckout = trpc.payment.createCreditsCheckout.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        window.open(data.url, "_blank");
      }
    },
  });
  
  const handlePurchase = () => {
    createCheckout.mutate({
      productId: "credits_basic",
      currency: "usd",
    });
  };
  
  return (
    <button onClick={handlePurchase}>
      Buy 25 Credits - $2.00
    </button>
  );
}
```

### Webhook 处理

Webhook 端点位于 `/api/stripe/webhook`，自动处理以下事件：

| 事件 | 处理逻辑 |
|------|----------|
| `checkout.session.completed` | 创建订单记录，增加用户额度或创建加工订单 |
| `payment_intent.succeeded` | 记录支付成功 |
| `payment_intent.payment_failed` | 更新订单状态为失败 |

### 测试支付

1. 使用测试卡号：`4242 4242 4242 4242`
2. 有效期：任意未来日期
3. CVC：任意 3 位数
4. 邮编：任意 5 位数

### 上线准备

1. 在 Stripe Dashboard 完成 KYC 验证
2. 获取生产环境密钥
3. 在 Settings → Payment 中更新密钥

---

## 数据库表结构（完整）

### users 表

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  openId VARCHAR(64) NOT NULL UNIQUE,
  name TEXT,
  email VARCHAR(320),
  loginMethod VARCHAR(64),
  role ENUM('user', 'admin') DEFAULT 'user' NOT NULL,
  stripeCustomerId VARCHAR(255),
  optimizationCredits INT DEFAULT 10 NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  lastSignedIn TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
```

### orders 表

```sql
CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  stripePaymentIntentId VARCHAR(255),
  stripeSessionId VARCHAR(255),
  orderType ENUM('credits', 'fabrication') NOT NULL,
  status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending' NOT NULL,
  amount INT NOT NULL,
  currency VARCHAR(3) DEFAULT 'usd' NOT NULL,
  details JSON,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
);
```

### fabrication_orders 表

```sql
CREATE TABLE fabrication_orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  orderId INT NOT NULL,
  userId INT NOT NULL,
  designId INT,
  size VARCHAR(16) NOT NULL,
  quantity INT DEFAULT 1 NOT NULL,
  isRush BOOLEAN DEFAULT FALSE NOT NULL,
  status ENUM('pending', 'in_production', 'shipped', 'delivered') DEFAULT 'pending' NOT NULL,
  shippingAddress JSON,
  trackingNumber VARCHAR(255),
  estimatedDelivery TIMESTAMP,
  notes TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
);
```

---

## 添加新模板

### 方法 1：通过 SQL 直接插入

```sql
INSERT INTO doe_templates (name, description, mode, category, parameters, displayOrder, isActive)
VALUES (
  'My Custom Template',
  'Description of the template',
  '2d_spot_projector',
  'Spot Projector',
  '{"workingDistance":"inf","wavelength":"532nm","mode":"2d_spot_projector","deviceDiameter":"12.7mm","deviceShape":"circular","arrayRows":"100","arrayCols":"100","targetType":"angle","targetAngle":"30deg","tolerance":"1"}',
  100,
  TRUE
);
```

### 方法 2：通过管理员 API

```typescript
// 需要管理员权限
const createTemplate = trpc.templates.create.useMutation();

createTemplate.mutate({
  name: "My Custom Template",
  description: "Description of the template",
  mode: "2d_spot_projector",
  category: "Spot Projector",
  parameters: {
    workingDistance: "inf",
    wavelength: "532nm",
    mode: "2d_spot_projector",
    deviceDiameter: "12.7mm",
    deviceShape: "circular",
    arrayRows: "100",
    arrayCols: "100",
    targetType: "angle",
    targetAngle: "30deg",
    tolerance: "1",
  },
  displayOrder: 100,
});
```

### 模板参数说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | ✅ | 模板名称 |
| description | string | ❌ | 模板描述 |
| mode | string | ✅ | DOE 类型 |
| category | string | ❌ | 分类（用于筛选） |
| parameters | JSON | ✅ | 预配置参数 |
| thumbnailUrl | string | ❌ | 缩略图 URL |
| displayOrder | number | ❌ | 排序权重（小的在前） |
| isActive | boolean | ❌ | 是否显示 |

---

## 常见问题

### Q: 如何修改默认免费额度？

修改 `drizzle/schema.ts` 中的默认值：

```typescript
optimizationCredits: int("optimizationCredits").default(10).notNull(),
```

然后运行 `pnpm db:push` 更新数据库。

### Q: 如何添加新的 DOE 类型？

1. 在 `DOEParameters.tsx` 中添加新的模式选项
2. 在 `LanguageContext.tsx` 中添加翻译
3. 在 Python 后端添加对应的算法实现

### Q: 如何修改价格？

修改 `server/stripe/products.ts` 中的价格配置，无需重新部署。

### Q: 如何查看支付日志？

1. 查看服务器日志中的 `[Webhook]` 前缀
2. 访问 Stripe Dashboard → Developers → Webhooks

---

*文档最后更新：2024年12月*


---

## 用户认证系统

DOE Studio 使用 Manus 内置的 OAuth 认证系统，支持多种登录方式。

### 认证架构

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   前端应用      │────▶│  Manus OAuth     │────▶│   用户数据库    │
│   (React)       │     │  Portal          │     │   (PostgreSQL)  │
└─────────────────┘     └──────────────────┘     └─────────────────┘
        │                        │
        │                        ▼
        │               ┌──────────────────┐
        └──────────────▶│   后端 API       │
                        │   (tRPC)         │
                        └──────────────────┘
```

### 环境变量配置

项目已自动注入以下认证相关环境变量：

| 变量名 | 说明 |
|--------|------|
| `OAUTH_SERVER_URL` | OAuth 服务器地址 |
| `VITE_OAUTH_PORTAL_URL` | 前端登录门户地址 |
| `JWT_SECRET` | JWT 签名密钥 |
| `OWNER_OPEN_ID` | 项目所有者 ID |
| `OWNER_NAME` | 项目所有者名称 |

### 前端使用

**1. 使用 useAuth Hook：**

```typescript
import { useAuth } from "@/_core/hooks/useAuth";

function MyComponent() {
  const { 
    user,           // 当前用户信息
    isAuthenticated, // 是否已登录
    isLoading,      // 加载状态
    logout,         // 登出函数
  } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <LoginButton />;
  }

  return <div>Welcome, {user.name}!</div>;
}
```

**2. 跳转到登录页：**

```typescript
import { getLoginUrl } from "@/const";

function LoginButton() {
  const handleLogin = () => {
    // 跳转到 OAuth 登录页面
    window.location.href = getLoginUrl();
  };

  return <Button onClick={handleLogin}>Sign In</Button>;
}
```

**3. 保护路由：**

```typescript
// 在需要登录的页面中
function ProtectedPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // 未登录时跳转到登录页
      window.location.href = getLoginUrl();
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading || !isAuthenticated) {
    return <LoadingSpinner />;
  }

  return <div>Protected Content</div>;
}
```

### 后端使用

**1. 受保护的 API 路由：**

```typescript
// server/routers.ts
import { protectedProcedure, publicProcedure } from "./_core/trpc";

export const appRouter = router({
  // 公开路由 - 无需登录
  templates: router({
    list: publicProcedure.query(async () => {
      return await getTemplates();
    }),
  }),

  // 受保护路由 - 需要登录
  designs: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      // ctx.user 包含当前用户信息
      return await getDesignsByUserId(ctx.user.id);
    }),

    create: protectedProcedure
      .input(z.object({ name: z.string() }))
      .mutation(async ({ ctx, input }) => {
        return await createDesign({
          userId: ctx.user.id,
          name: input.name,
        });
      }),
  }),
});
```

**2. 获取用户信息：**

```typescript
// 在 protectedProcedure 中，ctx.user 包含：
interface User {
  id: string;        // 用户唯一 ID
  openId: string;    // OAuth Open ID
  name: string;      // 用户名
  email?: string;    // 邮箱（如果提供）
  avatar?: string;   // 头像 URL
}
```

### 支持的登录方式

Manus OAuth 系统支持以下登录方式：

| 方式 | 说明 | 配置要求 |
|------|------|----------|
| 邮箱验证码 | 用户输入邮箱，接收验证码登录 | 默认启用 |
| Google | Google 账号登录 | 需要配置 Google OAuth |
| GitHub | GitHub 账号登录 | 需要配置 GitHub OAuth |
| 微信 | 微信扫码登录 | 需要配置微信开放平台 |

### 配置第三方登录（需要单独部署）

如果您需要自定义登录方式或自行部署认证服务，请参考以下步骤：

**1. 配置 Google OAuth：**

```bash
# 在 Google Cloud Console 创建 OAuth 2.0 凭据
# https://console.cloud.google.com/apis/credentials

# 设置环境变量
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_CALLBACK_URL=https://your-domain.com/auth/google/callback
```

**2. 配置邮箱验证码：**

```bash
# 需要配置 SMTP 服务
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=noreply@your-domain.com
```

**3. 自定义认证服务（高级）：**

如果需要完全自定义认证逻辑，您需要：

1. 部署独立的认证服务器
2. 实现 OAuth 2.0 / OpenID Connect 协议
3. 更新环境变量指向您的认证服务器

```bash
OAUTH_SERVER_URL=https://your-auth-server.com
VITE_OAUTH_PORTAL_URL=https://your-auth-server.com/login
```

### 用户数据存储

用户数据存储在 `users` 表中：

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  "openId" VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  email VARCHAR(255),
  avatar TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);
```

用户的设计数据通过 `userId` 关联：

```sql
CREATE TABLE doe_designs (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  -- ... 其他字段
);
```

### 常见问题

**Q: 如何在本地开发时测试登录？**

A: Manus 开发服务器会自动处理认证。在预览 URL 中，您可以正常使用登录功能。

**Q: 如何获取当前用户的优化额度？**

A: 使用 tRPC 查询：

```typescript
const { data: credits } = trpc.payment.getCredits.useQuery();
// credits = { optimizationCredits: 10, ... }
```

**Q: 如何检查用户是否有权限执行某操作？**

A: 在后端使用 protectedProcedure，它会自动验证用户身份。对于更细粒度的权限控制：

```typescript
protectedProcedure.mutation(async ({ ctx, input }) => {
  // 检查用户是否是设计的所有者
  const design = await getDesign(input.designId);
  if (design.userId !== ctx.user.id) {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
  // ... 执行操作
});
```

---

## Stripe 支付系统

DOE Studio 集成了 Stripe 支付系统，支持优化额度购买和 DOE 加工服务订购。

### 支付架构

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   前端应用      │────▶│  后端 API        │────▶│   Stripe API    │
│   (React)       │     │  (tRPC)          │     │                 │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                │                        │
                                ▼                        ▼
                        ┌──────────────────┐     ┌─────────────────┐
                        │   数据库         │◀────│  Webhook        │
                        │   (PostgreSQL)   │     │  (支付回调)     │
                        └──────────────────┘     └─────────────────┘
```

### 环境变量

| 变量名 | 说明 |
|--------|------|
| `STRIPE_SECRET_KEY` | Stripe 密钥（后端使用） |
| `STRIPE_WEBHOOK_SECRET` | Webhook 签名密钥 |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe 公钥（前端使用） |

### 产品配置

产品定义在 `server/stripe/products.ts`：

```typescript
export const PRODUCTS = {
  // 优化额度
  credits_basic: {
    name: "Basic Credits Pack",
    description: "25 optimization credits",
    price: { usd: 200, cny: 1000 }, // 分为单位
    credits: 25,
  },

  // DOE 加工服务
  fab_0.5in: {
    name: "DOE Fabrication - 1/2 inch",
    description: "12.7mm diameter DOE element",
    price: { usd: 35000, cny: 245000 }, // 分为单位
  },
  // ... 更多产品
};
```

### 支付流程

**1. 创建支付会话：**

```typescript
// 前端调用
const createCheckout = trpc.payment.createCreditsCheckout.useMutation({
  onSuccess: (data) => {
    // 跳转到 Stripe 支付页面
    window.open(data.url, "_blank");
  },
});

// 触发支付
createCheckout.mutate({
  productId: "credits_basic",
  currency: "usd",
});
```

**2. Webhook 处理：**

支付完成后，Stripe 会调用 Webhook 通知后端：

```typescript
// server/stripe/webhook.ts
app.post("/api/stripe/webhook", async (req, res) => {
  const event = stripe.webhooks.constructEvent(
    req.body,
    req.headers["stripe-signature"],
    process.env.STRIPE_WEBHOOK_SECRET
  );

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    // 更新用户额度或创建订单
    await handlePaymentSuccess(session);
  }
});
```

### 测试支付

1. 访问 Stripe 测试沙盒认领链接（在项目配置中提供）
2. 使用测试卡号：`4242 4242 4242 4242`
3. 任意有效期和 CVC

### 报价单生成

报价单使用 HTML 模板生成，可在浏览器中打印为 PDF：

```typescript
// 报价单模板位置标记
// TEMPLATE_MARKER: Company info section
// TEMPLATE_MARKER: Customer info section
// TEMPLATE_MARKER: Additional line items
// TEMPLATE_MARKER: Footer contact info

// 修改报价单模板：
// 1. 打开 client/src/pages/Pricing.tsx
// 2. 找到 generateQuotePDF 函数
// 3. 修改 htmlContent 中的模板内容
```

---

## 部署指南

### Manus 平台部署

1. 在 Manus 管理界面点击 "Publish" 按钮
2. 等待构建完成
3. 访问分配的域名

### 自定义域名

1. 在 Settings > Domains 中添加自定义域名
2. 配置 DNS 记录指向 Manus 服务器
3. 等待 SSL 证书自动配置

### Python 后端部署

如果您实现了 Python 优化后端，需要单独部署：

**方式一：Docker 部署**

```dockerfile
# Dockerfile
FROM pytorch/pytorch:2.0.0-cuda11.7-cudnn8-runtime

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**方式二：云服务部署**

推荐使用支持 GPU 的云服务：
- AWS EC2 (p3/p4 实例)
- Google Cloud (A100/T4 实例)
- Azure (NC 系列)
- Lambda Labs
- RunPod

部署后，更新环境变量：

```bash
PYTHON_API_URL=https://your-python-api.com
```

---

## 常见问题

### Q: 如何调试前端组件？

A: 使用 React DevTools 和浏览器开发者工具。在组件中添加 `console.log` 或使用断点调试。

### Q: 如何添加新的 API 端点？

A: 在 `server/routers.ts` 中添加新的 tRPC 路由，然后在前端使用 `trpc.xxx.useQuery()` 或 `trpc.xxx.useMutation()` 调用。

### Q: 如何修改数据库结构？

A: 
1. 编辑 `drizzle/schema.ts`
2. 运行 `pnpm db:push` 应用更改

### Q: 如何添加新的翻译？

A: 在 `client/src/contexts/LanguageContext.tsx` 的 `translations` 对象中添加新的键值对。

### Q: 如何自定义报价单模板？

A: 在 `client/src/pages/Pricing.tsx` 中找到 `generateQuotePDF` 函数，修改 `htmlContent` 中的 HTML 模板。搜索 `TEMPLATE_MARKER` 注释找到可修改的位置。

### Q: 如何测试 Stripe 支付？

A: 
1. 认领 Stripe 测试沙盒
2. 使用测试卡号 `4242 4242 4242 4242`
3. 在 Stripe Dashboard 查看测试交易

---

*文档最后更新：2024年12月*
