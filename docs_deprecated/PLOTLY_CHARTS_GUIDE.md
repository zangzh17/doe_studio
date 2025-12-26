# Plotly 图表开发详细指南

本文档面向**零基础**读者，详细介绍如何在 DOE Studio 中使用 Plotly 创建和修改数据可视化图表。

---

## 目录

1. [概述](#1-概述)
2. [Plotly 基础](#2-plotly-基础)
3. [当前图表实现](#3-当前图表实现)
4. [修改现有图表](#4-修改现有图表)
5. [添加新图表](#5-添加新图表)
6. [从后端接收数据](#6-从后端接收数据)
7. [常见图表类型](#7-常见图表类型)
8. [样式定制](#8-样式定制)
9. [性能优化](#9-性能优化)

---

## 1. 概述

### 1.1 什么是 Plotly？

Plotly 是一个强大的交互式图表库，支持：
- 2D 图表（折线图、柱状图、热力图等）
- 3D 图表（曲面图、散点图等）
- 交互功能（缩放、平移、悬停提示等）

### 1.2 项目中的图表位置

所有图表代码位于：
```
client/src/components/DOEResults.tsx
```

### 1.3 当前实现的图表

| 图表名称 | 类型 | 用途 |
|---------|------|------|
| 目标面光强分布 | 热力图 (Heatmap) | 显示优化后的光强分布 |
| 各级次能量热图 | 热力图 (Heatmap) | 显示各衍射级次的能量分布 |
| 各级次能量条形图 | 条形图 (Bar) | 比较各级次的能量大小 |

---

## 2. Plotly 基础

### 2.1 安装

项目已安装 Plotly，如需重新安装：

```bash
cd /home/ubuntu/raioptics_clone
pnpm add plotly.js-dist-min react-plotly.js
pnpm add -D @types/react-plotly.js
```

### 2.2 基本使用

```tsx
// 导入 Plotly
import Plot from 'react-plotly.js';

// 基本用法
<Plot
  data={[
    {
      x: [1, 2, 3, 4],
      y: [10, 15, 13, 17],
      type: 'scatter',
      mode: 'lines+markers',
      marker: { color: 'red' },
    },
  ]}
  layout={{
    width: 500,
    height: 400,
    title: 'My Chart',
  }}
/>
```

### 2.3 核心概念

**data（数据）**：定义要绘制的数据和图表类型
```tsx
data={[
  {
    x: [...],           // X 轴数据
    y: [...],           // Y 轴数据
    z: [[...]],         // Z 轴数据（用于热力图、3D图）
    type: 'scatter',    // 图表类型
    mode: 'lines',      // 绘制模式
    marker: {...},      // 标记样式
    line: {...},        // 线条样式
  }
]}
```

**layout（布局）**：定义图表的外观和布局
```tsx
layout={{
  width: 500,           // 宽度
  height: 400,          // 高度
  title: 'Chart Title', // 标题
  xaxis: {...},         // X 轴配置
  yaxis: {...},         // Y 轴配置
  margin: {...},        // 边距
  paper_bgcolor: '...',  // 背景色
  plot_bgcolor: '...',   // 绘图区背景色
}}
```

**config（配置）**：定义交互行为
```tsx
config={{
  displayModeBar: true,  // 显示工具栏
  responsive: true,      // 响应式
  scrollZoom: true,      // 滚轮缩放
}}
```

---

## 3. 当前图表实现

### 3.1 文件位置

```
client/src/components/DOEResults.tsx
```

### 3.2 目标面光强分布（热力图）

**代码位置**：约第 400-450 行

```tsx
// 目标面光强分布热力图
<Plot
  data={[
    {
      z: optimizeData.intensityDistribution,  // 二维数组
      type: 'heatmap',
      colorscale: 'Viridis',  // 颜色方案
      showscale: true,        // 显示色标
    },
  ]}
  layout={{
    title: {
      text: t('intensityDistribution'),
      font: { size: 14 },
    },
    width: 350,
    height: 300,
    margin: { l: 50, r: 50, t: 40, b: 40 },
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent',
    xaxis: {
      title: 'X (pixels)',
      color: '#666',
    },
    yaxis: {
      title: 'Y (pixels)',
      color: '#666',
    },
  }}
  config={{
    displayModeBar: false,
    responsive: true,
  }}
/>
```

### 3.3 各级次能量热图

**代码位置**：约第 460-510 行

```tsx
// 将一维数组转换为二维数组（5x5）
const energyMatrix = [];
for (let i = 0; i < 5; i++) {
  energyMatrix.push(optimizeData.orderEnergies.slice(i * 5, (i + 1) * 5));
}

<Plot
  data={[
    {
      z: energyMatrix,
      type: 'heatmap',
      colorscale: 'RdYlGn',  // 红-黄-绿颜色方案
      showscale: true,
      text: energyMatrix.map(row => row.map(v => v.toFixed(2))),
      texttemplate: '%{text}',
      hovertemplate: 'Order (%{x}, %{y}): %{z:.3f}<extra></extra>',
    },
  ]}
  layout={{
    title: {
      text: t('orderEnergyHeatmap'),
      font: { size: 14 },
    },
    width: 350,
    height: 300,
    margin: { l: 50, r: 50, t: 40, b: 40 },
    xaxis: {
      title: 'X Order',
      tickvals: [0, 1, 2, 3, 4],
      ticktext: ['-2', '-1', '0', '+1', '+2'],
    },
    yaxis: {
      title: 'Y Order',
      tickvals: [0, 1, 2, 3, 4],
      ticktext: ['-2', '-1', '0', '+1', '+2'],
    },
  }}
/>
```

### 3.4 各级次能量条形图

**代码位置**：约第 520-570 行

```tsx
<Plot
  data={[
    {
      x: optimizeData.orderEnergies.map((_, i) => `Order ${i - 12}`),
      y: optimizeData.orderEnergies,
      type: 'bar',
      marker: {
        color: optimizeData.orderEnergies.map(v => 
          v > 0.8 ? '#22c55e' :  // 绿色（高效率）
          v > 0.5 ? '#eab308' :  // 黄色（中等）
          '#ef4444'              // 红色（低效率）
        ),
      },
    },
  ]}
  layout={{
    title: {
      text: t('orderEnergyBar'),
      font: { size: 14 },
    },
    width: 700,
    height: 250,
    margin: { l: 50, r: 20, t: 40, b: 60 },
    xaxis: {
      title: 'Diffraction Order',
      tickangle: -45,
    },
    yaxis: {
      title: 'Normalized Energy',
      range: [0, 1],
    },
  }}
/>
```

---

## 4. 修改现有图表

### 4.1 修改颜色方案

**步骤**：

1. 打开 `client/src/components/DOEResults.tsx`
2. 找到要修改的图表
3. 修改 `colorscale` 属性

**可用的颜色方案**：

| 名称 | 描述 | 适用场景 |
|------|------|---------|
| `Viridis` | 蓝-绿-黄 | 科学数据（默认推荐） |
| `Plasma` | 紫-橙-黄 | 高对比度数据 |
| `Inferno` | 黑-红-黄 | 热量分布 |
| `RdYlGn` | 红-黄-绿 | 正负值对比 |
| `Blues` | 白-蓝 | 单一变量 |
| `Hot` | 黑-红-黄-白 | 热力分布 |
| `Jet` | 蓝-青-黄-红 | 传统科学图表 |

**示例**：将光强分布图改为 `Plasma` 颜色方案

```tsx
// 修改前
colorscale: 'Viridis',

// 修改后
colorscale: 'Plasma',
```

### 4.2 修改图表尺寸

```tsx
layout={{
  width: 500,   // 修改宽度
  height: 400,  // 修改高度
  // ...
}}
```

### 4.3 修改标题

```tsx
layout={{
  title: {
    text: '新标题',           // 修改标题文字
    font: { 
      size: 16,              // 字体大小
      color: '#333',         // 字体颜色
      family: 'Arial',       // 字体
    },
  },
  // ...
}}
```

### 4.4 修改坐标轴

```tsx
layout={{
  xaxis: {
    title: 'X Axis Label',    // X 轴标题
    range: [0, 100],          // X 轴范围
    tickvals: [0, 25, 50, 75, 100],  // 刻度值
    ticktext: ['0', '25', '50', '75', '100'],  // 刻度文字
    showgrid: true,           // 显示网格
    gridcolor: '#eee',        // 网格颜色
    zeroline: true,           // 显示零线
  },
  yaxis: {
    title: 'Y Axis Label',
    // ... 同上
  },
}}
```

---

## 5. 添加新图表

### 5.1 添加折线图

**场景**：显示优化过程中的效率变化

**步骤**：

1. 在 `DOEResults.tsx` 中添加新的图表组件

```tsx
// 在 OptimizeData 接口中添加新字段
interface OptimizeData {
  // ... 现有字段
  convergenceHistory?: number[];  // 收敛历史
}

// 在渲染部分添加新图表
{optimizeData.convergenceHistory && (
  <div className="bg-white rounded-lg p-4 shadow-sm">
    <Plot
      data={[
        {
          x: optimizeData.convergenceHistory.map((_, i) => i + 1),
          y: optimizeData.convergenceHistory,
          type: 'scatter',
          mode: 'lines',
          line: {
            color: '#0d9488',
            width: 2,
          },
          name: 'Efficiency',
        },
      ]}
      layout={{
        title: {
          text: 'Optimization Convergence',
          font: { size: 14 },
        },
        width: 400,
        height: 250,
        margin: { l: 50, r: 20, t: 40, b: 40 },
        xaxis: {
          title: 'Iteration',
        },
        yaxis: {
          title: 'Efficiency (%)',
          range: [0, 100],
        },
        paper_bgcolor: 'transparent',
        plot_bgcolor: 'transparent',
      }}
      config={{
        displayModeBar: false,
        responsive: true,
      }}
    />
  </div>
)}
```

### 5.2 添加 3D 曲面图

**场景**：显示相位分布的 3D 视图

```tsx
// 3D 相位分布图
<Plot
  data={[
    {
      z: phaseData,  // 二维数组
      type: 'surface',
      colorscale: 'Viridis',
      contours: {
        z: {
          show: true,
          usecolormap: true,
          highlightcolor: "#42f462",
          project: { z: true }
        }
      },
    },
  ]}
  layout={{
    title: {
      text: '3D Phase Distribution',
      font: { size: 14 },
    },
    width: 500,
    height: 400,
    scene: {
      xaxis: { title: 'X' },
      yaxis: { title: 'Y' },
      zaxis: { title: 'Phase (rad)' },
      camera: {
        eye: { x: 1.5, y: 1.5, z: 1.2 }
      }
    },
    margin: { l: 0, r: 0, t: 40, b: 0 },
  }}
  config={{
    responsive: true,
  }}
/>
```

### 5.3 添加饼图

**场景**：显示能量分布比例

```tsx
// 能量分布饼图
<Plot
  data={[
    {
      values: [signalEnergy, noiseEnergy, lossEnergy],
      labels: ['Signal', 'Noise', 'Loss'],
      type: 'pie',
      marker: {
        colors: ['#22c55e', '#eab308', '#ef4444'],
      },
      textinfo: 'label+percent',
      hoverinfo: 'label+value+percent',
    },
  ]}
  layout={{
    title: {
      text: 'Energy Distribution',
      font: { size: 14 },
    },
    width: 350,
    height: 300,
    margin: { l: 20, r: 20, t: 40, b: 20 },
    showlegend: true,
    legend: {
      orientation: 'h',
      y: -0.1,
    },
  }}
  config={{
    displayModeBar: false,
    responsive: true,
  }}
/>
```

### 5.4 添加散点图

**场景**：显示各光斑位置和强度

```tsx
// 光斑位置散点图
<Plot
  data={[
    {
      x: spotPositions.map(p => p.x),
      y: spotPositions.map(p => p.y),
      mode: 'markers',
      type: 'scatter',
      marker: {
        size: spotPositions.map(p => p.intensity * 10),
        color: spotPositions.map(p => p.intensity),
        colorscale: 'Viridis',
        showscale: true,
        colorbar: {
          title: 'Intensity',
        },
      },
      text: spotPositions.map(p => `Intensity: ${p.intensity.toFixed(3)}`),
      hoverinfo: 'text+x+y',
    },
  ]}
  layout={{
    title: {
      text: 'Spot Positions',
      font: { size: 14 },
    },
    width: 400,
    height: 400,
    xaxis: {
      title: 'X Position (mm)',
      scaleanchor: 'y',
    },
    yaxis: {
      title: 'Y Position (mm)',
    },
  }}
/>
```

---

## 6. 从后端接收数据

### 6.1 数据流程

```
Python 后端 ──(JSON)──> Node.js 服务器 ──(tRPC)──> React 前端 ──> Plotly 图表
```

### 6.2 后端返回数据格式

在 `python_backend/main.py` 中定义返回数据：

```python
class OptimizeResponse(BaseModel):
    phase_image: str                        # Base64 图像
    intensity_distribution: List[List[float]]  # 二维数组
    order_energies: List[float]             # 一维数组
    efficiency: float                       # 单个数值
    uniformity: float                       # 单个数值
    computation_time: float                 # 单个数值
    convergence_history: List[float]        # 新增：收敛历史
```

### 6.3 前端接收数据

在 `DOEStudio.tsx` 中：

```tsx
// 定义数据类型
interface OptimizeData {
  phaseImage: string;
  intensityDistribution: number[][];
  orderEnergies: number[];
  efficiency: number;
  uniformity: number;
  computationTime: number;
  convergenceHistory?: number[];  // 新增
}

// 接收后端数据
const result = await optimizeMutation.mutateAsync({...});

setOptimizeData({
  phaseImage: result.phase_image,
  intensityDistribution: result.intensity_distribution,
  orderEnergies: result.order_energies,
  efficiency: result.efficiency,
  uniformity: result.uniformity,
  computationTime: result.computation_time,
  convergenceHistory: result.convergence_history,  // 新增
});
```

### 6.4 传递数据到图表组件

在 `DOEResults.tsx` 中：

```tsx
interface DOEResultsProps {
  optimizeData: OptimizeData | null;
  // ...
}

export function DOEResults({ optimizeData, ... }: DOEResultsProps) {
  // 使用 optimizeData 中的数据
  return (
    <Plot
      data={[{
        z: optimizeData.intensityDistribution,
        // ...
      }]}
    />
  );
}
```

---

## 7. 常见图表类型

### 7.1 图表类型速查表

| 类型 | type 值 | 适用场景 |
|------|---------|---------|
| 折线图 | `scatter` + `mode: 'lines'` | 趋势、时间序列 |
| 散点图 | `scatter` + `mode: 'markers'` | 相关性、分布 |
| 柱状图 | `bar` | 比较、分类 |
| 热力图 | `heatmap` | 二维分布 |
| 等高线图 | `contour` | 二维分布（等值线） |
| 3D 曲面 | `surface` | 三维分布 |
| 3D 散点 | `scatter3d` | 三维点分布 |
| 饼图 | `pie` | 比例、组成 |
| 直方图 | `histogram` | 频率分布 |
| 箱线图 | `box` | 统计分布 |

### 7.2 完整示例代码

**热力图（带等高线）**：

```tsx
<Plot
  data={[
    {
      z: data2D,
      type: 'heatmap',
      colorscale: 'Viridis',
      showscale: true,
      contours: {
        coloring: 'heatmap',
        showlabels: true,
        labelfont: { size: 10, color: 'white' },
      },
    },
  ]}
  layout={{
    title: 'Heatmap with Contours',
    width: 500,
    height: 400,
  }}
/>
```

**多系列折线图**：

```tsx
<Plot
  data={[
    {
      x: xData,
      y: series1,
      type: 'scatter',
      mode: 'lines',
      name: 'Series 1',
      line: { color: '#0d9488', width: 2 },
    },
    {
      x: xData,
      y: series2,
      type: 'scatter',
      mode: 'lines',
      name: 'Series 2',
      line: { color: '#f59e0b', width: 2, dash: 'dash' },
    },
  ]}
  layout={{
    title: 'Multi-series Line Chart',
    width: 600,
    height: 400,
    legend: {
      x: 0,
      y: 1,
      bgcolor: 'rgba(255,255,255,0.8)',
    },
  }}
/>
```

**堆叠柱状图**：

```tsx
<Plot
  data={[
    {
      x: categories,
      y: values1,
      type: 'bar',
      name: 'Category A',
      marker: { color: '#0d9488' },
    },
    {
      x: categories,
      y: values2,
      type: 'bar',
      name: 'Category B',
      marker: { color: '#f59e0b' },
    },
  ]}
  layout={{
    title: 'Stacked Bar Chart',
    barmode: 'stack',  // 'stack' 或 'group'
    width: 500,
    height: 400,
  }}
/>
```

---

## 8. 样式定制

### 8.1 主题颜色

DOE Studio 使用青色/蓝绿色主题，建议图表配色：

```tsx
const themeColors = {
  primary: '#0d9488',      // 主色（青色）
  secondary: '#14b8a6',    // 次色
  accent: '#2dd4bf',       // 强调色
  success: '#22c55e',      // 成功（绿色）
  warning: '#eab308',      // 警告（黄色）
  error: '#ef4444',        // 错误（红色）
  neutral: '#6b7280',      // 中性（灰色）
};
```

### 8.2 统一样式模板

创建一个样式模板文件：

```tsx
// client/src/lib/plotlyTheme.ts

export const plotlyTheme = {
  layout: {
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent',
    font: {
      family: 'Inter, system-ui, sans-serif',
      color: '#374151',
    },
    title: {
      font: {
        size: 14,
        color: '#111827',
      },
    },
    xaxis: {
      gridcolor: '#e5e7eb',
      linecolor: '#d1d5db',
      tickcolor: '#9ca3af',
    },
    yaxis: {
      gridcolor: '#e5e7eb',
      linecolor: '#d1d5db',
      tickcolor: '#9ca3af',
    },
    margin: { l: 50, r: 20, t: 40, b: 40 },
  },
  config: {
    displayModeBar: false,
    responsive: true,
  },
};

// 使用方式
import { plotlyTheme } from '@/lib/plotlyTheme';

<Plot
  data={[...]}
  layout={{
    ...plotlyTheme.layout,
    title: { text: 'My Chart', ...plotlyTheme.layout.title },
    width: 400,
    height: 300,
  }}
  config={plotlyTheme.config}
/>
```

### 8.3 响应式设计

```tsx
// 使用 useEffect 监听窗口大小
const [chartWidth, setChartWidth] = useState(400);

useEffect(() => {
  const handleResize = () => {
    const container = document.getElementById('chart-container');
    if (container) {
      setChartWidth(container.clientWidth - 40);
    }
  };
  
  handleResize();
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);

<div id="chart-container" className="w-full">
  <Plot
    data={[...]}
    layout={{
      width: chartWidth,
      height: chartWidth * 0.75,  // 保持宽高比
      // ...
    }}
    config={{ responsive: true }}
  />
</div>
```

---

## 9. 性能优化

### 9.1 大数据量处理

当数据量很大时（如 1024x1024 的热力图），可以进行下采样：

```tsx
// 下采样函数
function downsample2D(data: number[][], factor: number): number[][] {
  const rows = data.length;
  const cols = data[0].length;
  const newRows = Math.floor(rows / factor);
  const newCols = Math.floor(cols / factor);
  
  const result: number[][] = [];
  for (let i = 0; i < newRows; i++) {
    const row: number[] = [];
    for (let j = 0; j < newCols; j++) {
      // 取平均值
      let sum = 0;
      for (let di = 0; di < factor; di++) {
        for (let dj = 0; dj < factor; dj++) {
          sum += data[i * factor + di][j * factor + dj];
        }
      }
      row.push(sum / (factor * factor));
    }
    result.push(row);
  }
  return result;
}

// 使用
const displayData = data.length > 256 
  ? downsample2D(data, Math.ceil(data.length / 256))
  : data;
```

### 9.2 延迟渲染

使用 `useMemo` 缓存图表数据：

```tsx
const chartData = useMemo(() => {
  if (!optimizeData) return null;
  
  return [
    {
      z: optimizeData.intensityDistribution,
      type: 'heatmap',
      colorscale: 'Viridis',
    },
  ];
}, [optimizeData]);

const chartLayout = useMemo(() => ({
  width: 400,
  height: 300,
  // ...
}), []);

{chartData && (
  <Plot data={chartData} layout={chartLayout} />
)}
```

### 9.3 条件渲染

只在需要时渲染图表：

```tsx
// 使用 checkbox 控制显示
const [showCharts, setShowCharts] = useState({
  intensity: true,
  orderHeatmap: true,
  orderBar: false,
  convergence: false,
});

{showCharts.intensity && (
  <Plot data={intensityData} layout={intensityLayout} />
)}
```

---

## 参考资料

1. [Plotly.js 官方文档](https://plotly.com/javascript/)
2. [React-Plotly.js GitHub](https://github.com/plotly/react-plotly.js)
3. [Plotly 颜色方案](https://plotly.com/python/builtin-colorscales/)
4. [Plotly 图表类型](https://plotly.com/javascript/basic-charts/)
