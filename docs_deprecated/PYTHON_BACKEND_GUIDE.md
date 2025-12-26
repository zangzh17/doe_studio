# Python/PyTorch 后端集成详细指南

本文档面向**零基础**读者，详细介绍如何为 DOE Studio 添加 Python/PyTorch 计算后端。文档假设您对 Python、PyTorch、FastAPI 以及前后端通信几乎没有任何经验。

---

## 目录

1. [概述](#1-概述)
2. [环境准备](#2-环境准备)
3. [项目结构](#3-项目结构)
4. [创建 FastAPI 后端](#4-创建-fastapi-后端)
5. [实现 DOE 优化算法](#5-实现-doe-优化算法)
6. [前端调用后端 API](#6-前端调用后端-api)
7. [数据格式说明](#7-数据格式说明)
8. [部署配置](#8-部署配置)
9. [常见问题](#9-常见问题)

---

## 1. 概述

### 1.1 当前架构

DOE Studio 目前是一个**纯前端应用**，所有计算都是模拟数据。要实现真正的 DOE 相位优化，需要添加 Python 后端：

```
┌─────────────────────────────────────────────────────────────────┐
│                        当前架构（模拟数据）                        │
├─────────────────────────────────────────────────────────────────┤
│  浏览器 (React) ──> Node.js 服务器 ──> 返回模拟数据              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        目标架构（真实计算）                        │
├─────────────────────────────────────────────────────────────────┤
│  浏览器 (React) ──> Node.js 服务器 ──> Python FastAPI ──> PyTorch │
│                                              │                   │
│                                              v                   │
│                                        GPU 计算                  │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 技术栈说明

| 组件 | 技术 | 作用 |
|------|------|------|
| 前端 | React + TypeScript | 用户界面 |
| 前端服务器 | Node.js + Express | 提供静态文件和 API 代理 |
| 计算后端 | Python + FastAPI | 接收计算请求，调用优化算法 |
| 优化引擎 | PyTorch | GPU 加速的相位优化计算 |

---

## 2. 环境准备

### 2.1 安装 Python

如果您的服务器没有 Python，请先安装：

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install python3.11 python3.11-venv python3-pip

# 验证安装
python3.11 --version  # 应显示 Python 3.11.x
```

### 2.2 创建虚拟环境

虚拟环境可以隔离项目依赖，避免与系统 Python 冲突：

```bash
# 进入项目目录
cd /home/ubuntu/raioptics_clone

# 创建 Python 后端目录
mkdir -p python_backend
cd python_backend

# 创建虚拟环境
python3.11 -m venv venv

# 激活虚拟环境
source venv/bin/activate

# 激活后，命令行前面会显示 (venv)
```

### 2.3 安装依赖

创建 `requirements.txt` 文件：

```bash
# 创建 requirements.txt
cat > requirements.txt << 'EOF'
fastapi==0.109.0
uvicorn[standard]==0.27.0
torch>=2.0.0
numpy>=1.24.0
scipy>=1.10.0
pillow>=9.5.0
python-multipart>=0.0.6
pydantic>=2.0.0
EOF

# 安装依赖
pip install -r requirements.txt
```

**依赖说明：**
- `fastapi`: Web 框架，用于创建 API
- `uvicorn`: ASGI 服务器，用于运行 FastAPI
- `torch`: PyTorch，用于 GPU 加速计算
- `numpy`: 数值计算库
- `scipy`: 科学计算库
- `pillow`: 图像处理库
- `python-multipart`: 处理文件上传

---

## 3. 项目结构

完成后的项目结构如下：

```
raioptics_clone/
├── client/                    # 前端代码
│   └── src/
│       ├── components/
│       │   ├── DOEParameters.tsx   # 参数输入组件
│       │   └── DOEResults.tsx      # 结果展示组件
│       └── pages/
│           └── DOEStudio.tsx       # Studio 主页面
├── server/                    # Node.js 服务器
│   ├── routers.ts             # tRPC 路由
│   └── _core/
│       └── index.ts           # 服务器入口
├── python_backend/            # Python 后端（新建）
│   ├── venv/                  # 虚拟环境
│   ├── requirements.txt       # Python 依赖
│   ├── main.py                # FastAPI 入口
│   ├── algorithms/            # 优化算法
│   │   ├── __init__.py
│   │   ├── gs_algorithm.py    # GS 算法
│   │   ├── ifta.py            # IFTA 算法
│   │   └── utils.py           # 工具函数
│   └── models/                # 数据模型
│       ├── __init__.py
│       └── doe_params.py      # DOE 参数定义
└── docs/                      # 文档
    └── PYTHON_BACKEND_GUIDE.md
```

---

## 4. 创建 FastAPI 后端

### 4.1 创建入口文件 `main.py`

```python
# python_backend/main.py

"""
DOE Studio Python 后端
======================
这是 FastAPI 应用的入口文件，负责：
1. 定义 API 路由
2. 处理跨域请求 (CORS)
3. 接收前端参数并调用优化算法
"""

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, List
import numpy as np
import base64
from io import BytesIO
from PIL import Image

# 导入优化算法（稍后创建）
from algorithms.gs_algorithm import optimize_doe
from algorithms.utils import generate_phase_image

# 创建 FastAPI 应用实例
app = FastAPI(
    title="DOE Studio Backend",
    description="Python 后端，用于 DOE 相位优化计算",
    version="1.0.0"
)

# 配置跨域请求（允许前端访问）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境应限制为具体域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# 数据模型定义
# ============================================================

class DOEParams(BaseModel):
    """DOE 设计参数"""
    mode: str  # 'diffuser', '1d_splitter', '2d_spot_projector', 'lens', 'lens_array', 'prisms', 'custom_pattern'
    wavelength: float  # 波长，单位 nm
    diameter: float  # 器件直径，单位 mm
    shape: str  # 'circular' 或 'square'
    working_distance: Optional[float] = None  # 工作距离，单位 mm，None 表示无穷远
    
    # 2D Spot Projector 特有参数
    array_size: Optional[str] = None  # 如 "50x50"
    target_type: Optional[str] = None  # 'angle' 或 'size'
    target_value: Optional[float] = None  # 角度(度) 或 尺寸(mm)
    tolerance: Optional[float] = None  # 容差百分比
    
    # Diffuser 特有参数
    diffuser_shape: Optional[str] = None  # 'circular' 或 'square'
    diffusion_angle: Optional[float] = None  # 扩散角度
    
    # 1D Splitter 特有参数
    split_count: Optional[int] = None  # 分束数目
    
    # Lens 特有参数
    focal_length: Optional[float] = None  # 焦距，单位 mm
    lens_type: Optional[str] = None  # 'normal', 'cylindrical_x', 'cylindrical_y'
    special_function: Optional[str] = None  # 'none', 'extended_dof', 'multi_wavelength'
    special_values: Optional[str] = None  # 逗号分隔的值
    
    # Lens Array 特有参数
    array_scale: Optional[int] = None  # 阵列规模，如 5 表示 5x5
    
    # Prisms 特有参数
    deflection_angle: Optional[float] = None  # 偏离角度
    
    # Custom Pattern 特有参数
    pattern_data: Optional[str] = None  # Base64 编码的图像数据


class PreviewRequest(BaseModel):
    """预览请求"""
    params: DOEParams


class OptimizeRequest(BaseModel):
    """优化请求"""
    params: DOEParams
    max_iterations: int = 100  # 最大迭代次数


class PreviewResponse(BaseModel):
    """预览响应"""
    total_spots: Optional[int] = None
    pixel_pitch: float
    max_diffraction_angle: float  # 半角，单位度
    full_angle: float  # 全角，单位度
    estimated_efficiency: float
    estimated_time: float  # 预估计算时间，单位秒
    actual_tolerance: float  # 实际容差
    effective_pixels: Optional[int] = None  # 目标面有效像素数
    warnings: List[str] = []


class OptimizeResponse(BaseModel):
    """优化响应"""
    phase_image: str  # Base64 编码的相位图
    intensity_distribution: List[List[float]]  # 目标面光强分布
    order_energies: List[float]  # 各级次能量
    efficiency: float  # 总效率
    uniformity: float  # 均匀性
    computation_time: float  # 实际计算时间


# ============================================================
# API 路由
# ============================================================

@app.get("/")
async def root():
    """健康检查"""
    return {"status": "ok", "message": "DOE Studio Backend is running"}


@app.post("/api/preview", response_model=PreviewResponse)
async def preview(request: PreviewRequest):
    """
    预览计算
    ---------
    根据用户输入的参数，快速计算预估值，不进行实际优化。
    
    参数:
        request: 包含 DOE 参数的请求对象
    
    返回:
        PreviewResponse: 预览结果，包含预估效率、计算时间等
    """
    params = request.params
    warnings = []
    
    # 基础计算
    wavelength_mm = params.wavelength * 1e-6  # nm -> mm
    diameter = params.diameter
    
    # 计算像素间距（假设 1024x1024 分辨率）
    resolution = 1024
    pixel_pitch = diameter / resolution  # mm
    
    # 计算最大衍射角（半角）
    # sin(theta) = lambda / (2 * pixel_pitch)
    sin_theta = wavelength_mm / (2 * pixel_pitch)
    if sin_theta > 1:
        sin_theta = 1
        warnings.append("Pixel pitch too large, diffraction angle limited")
    max_diffraction_angle = np.degrees(np.arcsin(sin_theta))
    
    # 根据模式计算特定参数
    total_spots = None
    effective_pixels = None
    actual_tolerance = params.tolerance or 1.0
    
    if params.mode == '2d_spot_projector' and params.array_size:
        # 解析阵列规模
        parts = params.array_size.lower().replace('*', 'x').split('x')
        if len(parts) == 2:
            nx, ny = int(parts[0]), int(parts[1])
            total_spots = nx * ny
            effective_pixels = nx * ny
    
    elif params.mode == '1d_splitter':
        total_spots = params.split_count or 5
        effective_pixels = params.split_count or 5
    
    elif params.mode == 'custom_pattern':
        # 对于自定义图案，有效像素数取决于图案分辨率
        effective_pixels = resolution * resolution
    
    # 计算全角
    full_angle = max_diffraction_angle * 2
    
    # 预估效率（简化模型）
    estimated_efficiency = 0.85 - 0.05 * (max_diffraction_angle / 30)
    if estimated_efficiency < 0.5:
        estimated_efficiency = 0.5
        warnings.append("Large diffraction angle may reduce efficiency")
    
    # 预估计算时间（基于分辨率和迭代次数）
    estimated_time = (resolution / 1024) ** 2 * 10  # 秒
    
    # 检查衍射角是否过大
    if max_diffraction_angle > 45:
        warnings.append("Diffraction angle exceeds 45°, consider reducing target size")
    
    return PreviewResponse(
        total_spots=total_spots,
        pixel_pitch=pixel_pitch * 1000,  # mm -> μm
        max_diffraction_angle=max_diffraction_angle,
        full_angle=full_angle,
        estimated_efficiency=estimated_efficiency * 100,
        estimated_time=estimated_time,
        actual_tolerance=actual_tolerance,
        effective_pixels=effective_pixels,
        warnings=warnings
    )


@app.post("/api/optimize", response_model=OptimizeResponse)
async def optimize(request: OptimizeRequest):
    """
    执行优化
    ---------
    使用 GS 算法或 IFTA 算法计算最优相位分布。
    
    参数:
        request: 包含 DOE 参数和优化设置的请求对象
    
    返回:
        OptimizeResponse: 优化结果，包含相位图、光强分布等
    """
    import time
    start_time = time.time()
    
    params = request.params
    max_iterations = request.max_iterations
    
    # 调用优化算法
    result = optimize_doe(params, max_iterations)
    
    computation_time = time.time() - start_time
    
    # 生成相位图的 Base64 编码
    phase_image_base64 = generate_phase_image(result['phase'])
    
    return OptimizeResponse(
        phase_image=phase_image_base64,
        intensity_distribution=result['intensity'].tolist(),
        order_energies=result['order_energies'],
        efficiency=result['efficiency'],
        uniformity=result['uniformity'],
        computation_time=computation_time
    )


@app.post("/api/upload-pattern")
async def upload_pattern(file: UploadFile = File(...)):
    """
    上传自定义图案
    --------------
    接收用户上传的图案文件，进行预处理并返回处理后的图像。
    
    参数:
        file: 上传的图像文件（支持 BMP, TIF, PNG, JPG）
    
    返回:
        处理后的图像信息
    """
    # 读取图像
    contents = await file.read()
    image = Image.open(BytesIO(contents))
    
    # 转换为灰度图
    if image.mode != 'L':
        image = image.convert('L')
    
    # 获取图像信息
    width, height = image.size
    max_pixel = np.array(image).max()
    brightness_percentage = (max_pixel / 255) * 100
    
    # 转换为 Base64
    buffered = BytesIO()
    image.save(buffered, format="PNG")
    image_base64 = base64.b64encode(buffered.getvalue()).decode()
    
    return {
        "width": width,
        "height": height,
        "max_pixel_value": int(max_pixel),
        "brightness_percentage": round(brightness_percentage, 1),
        "image_data": f"data:image/png;base64,{image_base64}",
        "is_square": width == height,
        "needs_padding": width != height
    }


# ============================================================
# 启动服务器
# ============================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

### 4.2 创建算法目录和文件

```bash
# 创建算法目录
mkdir -p algorithms
touch algorithms/__init__.py
```

### 4.3 创建 GS 算法文件 `algorithms/gs_algorithm.py`

```python
# python_backend/algorithms/gs_algorithm.py

"""
Gerchberg-Saxton (GS) 算法实现
==============================
GS 算法是一种迭代傅里叶变换算法，用于计算产生目标光强分布的相位分布。

算法原理：
1. 从随机相位开始
2. 在目标平面施加振幅约束
3. 反向传播到 DOE 平面
4. 在 DOE 平面施加相位约束
5. 重复直到收敛
"""

import numpy as np
import torch
from typing import Dict, Any, Optional

# 检查是否有 GPU 可用
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")


def create_target_pattern(mode: str, params: Any, resolution: int = 1024) -> np.ndarray:
    """
    根据 DOE 模式创建目标光强分布
    
    参数:
        mode: DOE 模式 ('2d_spot_projector', 'diffuser', '1d_splitter', etc.)
        params: DOE 参数对象
        resolution: 分辨率
    
    返回:
        target: 目标光强分布，形状为 (resolution, resolution)
    """
    target = np.zeros((resolution, resolution), dtype=np.float32)
    center = resolution // 2
    
    if mode == '2d_spot_projector':
        # 解析阵列规模
        if params.array_size:
            parts = params.array_size.lower().replace('*', 'x').split('x')
            nx, ny = int(parts[0]), int(parts[1])
        else:
            nx, ny = 50, 50
        
        # 计算点阵位置
        spacing_x = resolution // (nx + 1)
        spacing_y = resolution // (ny + 1)
        
        for i in range(nx):
            for j in range(ny):
                x = spacing_x * (i + 1)
                y = spacing_y * (j + 1)
                # 每个点是一个小高斯
                target[y-2:y+3, x-2:x+3] = 1.0
    
    elif mode == 'diffuser':
        # 均匀扩散
        shape = params.diffuser_shape or 'circular'
        if shape == 'circular':
            # 圆形扩散
            y, x = np.ogrid[:resolution, :resolution]
            r = np.sqrt((x - center)**2 + (y - center)**2)
            radius = resolution // 3
            target[r < radius] = 1.0
        else:
            # 方形扩散
            size = resolution // 3
            target[center-size:center+size, center-size:center+size] = 1.0
    
    elif mode == '1d_splitter':
        # 一维分束
        n_splits = params.split_count or 5
        spacing = resolution // (n_splits + 1)
        for i in range(n_splits):
            x = spacing * (i + 1)
            target[center-2:center+3, x-2:x+3] = 1.0
    
    elif mode == 'lens':
        # 聚焦透镜 - 中心一个点
        target[center-5:center+6, center-5:center+6] = 1.0
    
    elif mode == 'prisms':
        # 棱镜 - 偏移的点
        offset = resolution // 4
        target[center-2:center+3, center+offset-2:center+offset+3] = 1.0
    
    else:
        # 默认：中心点
        target[center-5:center+6, center-5:center+6] = 1.0
    
    # 归一化
    if target.max() > 0:
        target = target / target.max()
    
    return target


def gs_algorithm(
    target: np.ndarray,
    max_iterations: int = 100,
    convergence_threshold: float = 1e-6
) -> Dict[str, Any]:
    """
    Gerchberg-Saxton 算法
    
    参数:
        target: 目标光强分布
        max_iterations: 最大迭代次数
        convergence_threshold: 收敛阈值
    
    返回:
        字典，包含：
        - phase: 相位分布 (0-2π)
        - intensity: 实际光强分布
        - efficiency: 效率
        - uniformity: 均匀性
    """
    resolution = target.shape[0]
    
    # 转换为 PyTorch 张量
    target_tensor = torch.from_numpy(target).to(device)
    target_amplitude = torch.sqrt(target_tensor)
    
    # 初始化随机相位
    phase = torch.rand(resolution, resolution, device=device) * 2 * np.pi
    
    # 输入光场（假设均匀照明）
    input_amplitude = torch.ones(resolution, resolution, device=device)
    
    prev_error = float('inf')
    
    for iteration in range(max_iterations):
        # 1. 构造 DOE 平面的复振幅
        doe_field = input_amplitude * torch.exp(1j * phase)
        
        # 2. 傅里叶变换到目标平面
        target_field = torch.fft.fftshift(torch.fft.fft2(doe_field))
        
        # 3. 在目标平面施加振幅约束
        target_phase = torch.angle(target_field)
        constrained_field = target_amplitude * torch.exp(1j * target_phase)
        
        # 4. 逆傅里叶变换回 DOE 平面
        doe_field_new = torch.fft.ifft2(torch.fft.ifftshift(constrained_field))
        
        # 5. 在 DOE 平面施加相位约束（保持相位，振幅设为1）
        phase = torch.angle(doe_field_new)
        
        # 计算误差
        output_intensity = torch.abs(target_field) ** 2
        error = torch.mean((output_intensity - target_tensor) ** 2).item()
        
        # 检查收敛
        if abs(prev_error - error) < convergence_threshold:
            print(f"Converged at iteration {iteration}")
            break
        prev_error = error
    
    # 最终结果
    doe_field_final = input_amplitude * torch.exp(1j * phase)
    target_field_final = torch.fft.fftshift(torch.fft.fft2(doe_field_final))
    output_intensity = torch.abs(target_field_final) ** 2
    
    # 计算效率
    total_output = output_intensity.sum().item()
    target_region = target_tensor > 0.1
    signal_power = output_intensity[target_region].sum().item()
    efficiency = signal_power / total_output if total_output > 0 else 0
    
    # 计算均匀性
    if target_region.sum() > 0:
        signal_values = output_intensity[target_region]
        uniformity = 1 - (signal_values.std() / signal_values.mean()).item()
    else:
        uniformity = 0
    
    # 转换回 numpy
    phase_np = phase.cpu().numpy()
    intensity_np = output_intensity.cpu().numpy()
    
    # 相位归一化到 0-2π
    phase_np = phase_np % (2 * np.pi)
    
    return {
        'phase': phase_np,
        'intensity': intensity_np,
        'efficiency': efficiency,
        'uniformity': max(0, uniformity)
    }


def optimize_doe(params: Any, max_iterations: int = 100) -> Dict[str, Any]:
    """
    DOE 优化主函数
    
    参数:
        params: DOE 参数对象
        max_iterations: 最大迭代次数
    
    返回:
        优化结果字典
    """
    resolution = 1024
    
    # 创建目标图案
    target = create_target_pattern(params.mode, params, resolution)
    
    # 运行 GS 算法
    result = gs_algorithm(target, max_iterations)
    
    # 计算各级次能量（简化版本）
    intensity = result['intensity']
    center = resolution // 2
    
    # 采样一些级次的能量
    order_energies = []
    for i in range(-5, 6):
        for j in range(-5, 6):
            x = center + i * (resolution // 20)
            y = center + j * (resolution // 20)
            if 0 <= x < resolution and 0 <= y < resolution:
                energy = intensity[y, x]
                order_energies.append(float(energy))
    
    result['order_energies'] = order_energies[:25]  # 取前25个
    
    return result
```

### 4.4 创建工具函数 `algorithms/utils.py`

```python
# python_backend/algorithms/utils.py

"""
工具函数
========
包含图像生成、数据转换等辅助函数。
"""

import numpy as np
import base64
from io import BytesIO
from PIL import Image


def generate_phase_image(phase: np.ndarray) -> str:
    """
    将相位数组转换为 8-bit 灰度图像的 Base64 编码
    
    参数:
        phase: 相位数组，范围 0-2π
    
    返回:
        Base64 编码的 PNG 图像字符串
    """
    # 归一化到 0-255
    phase_normalized = (phase / (2 * np.pi) * 255).astype(np.uint8)
    
    # 创建 PIL 图像
    image = Image.fromarray(phase_normalized, mode='L')
    
    # 转换为 Base64
    buffered = BytesIO()
    image.save(buffered, format="PNG")
    image_base64 = base64.b64encode(buffered.getvalue()).decode()
    
    return f"data:image/png;base64,{image_base64}"


def resize_pattern(image: np.ndarray, target_size: int, max_size: int = 3000) -> np.ndarray:
    """
    调整图案大小
    
    参数:
        image: 输入图像数组
        target_size: 目标大小
        max_size: 最大允许大小
    
    返回:
        调整后的图像数组
    """
    # 限制最大大小
    target_size = min(target_size, max_size)
    
    # 使用 PIL 调整大小
    pil_image = Image.fromarray(image)
    pil_image = pil_image.resize((target_size, target_size), Image.Resampling.LANCZOS)
    
    return np.array(pil_image)


def pad_to_square(image: np.ndarray) -> np.ndarray:
    """
    将非方形图像填充为方形（用黑色填充）
    
    参数:
        image: 输入图像数组
    
    返回:
        方形图像数组
    """
    h, w = image.shape[:2]
    
    if h == w:
        return image
    
    size = max(h, w)
    
    if len(image.shape) == 3:
        padded = np.zeros((size, size, image.shape[2]), dtype=image.dtype)
    else:
        padded = np.zeros((size, size), dtype=image.dtype)
    
    # 居中放置原图
    y_offset = (size - h) // 2
    x_offset = (size - w) // 2
    padded[y_offset:y_offset+h, x_offset:x_offset+w] = image
    
    return padded
```

---

## 5. 实现 DOE 优化算法

### 5.1 算法原理

GS 算法（Gerchberg-Saxton Algorithm）是一种经典的相位恢复算法，其核心思想是：

1. **正向传播**：从 DOE 平面到目标平面（傅里叶变换）
2. **振幅约束**：在目标平面用期望的振幅替换计算的振幅
3. **反向传播**：从目标平面回到 DOE 平面（逆傅里叶变换）
4. **相位提取**：在 DOE 平面只保留相位信息

### 5.2 算法流程图

```
┌─────────────────┐
│   初始随机相位    │
└────────┬────────┘
         │
         v
┌─────────────────┐
│  构造复振幅场    │  A_doe = exp(i * phase)
└────────┬────────┘
         │
         v
┌─────────────────┐
│   傅里叶变换     │  A_target = FFT(A_doe)
└────────┬────────┘
         │
         v
┌─────────────────┐
│  施加振幅约束    │  A_target' = |target| * exp(i * arg(A_target))
└────────┬────────┘
         │
         v
┌─────────────────┐
│   逆傅里叶变换   │  A_doe' = IFFT(A_target')
└────────┬────────┘
         │
         v
┌─────────────────┐
│   提取相位      │  phase = arg(A_doe')
└────────┬────────┘
         │
         v
    收敛？ ──No──> 回到步骤2
         │
        Yes
         │
         v
┌─────────────────┐
│   输出相位图     │
└─────────────────┘
```

### 5.3 不同 DOE 类型的目标图案

| DOE 类型 | 目标图案描述 | 示例 |
|---------|-------------|------|
| 2D Spot Projector | NxM 点阵 | 50x50 均匀分布的点 |
| Diffuser | 均匀圆形/方形区域 | 圆形均匀光斑 |
| 1D Splitter | 一排等间距的点 | 5个等间距点 |
| Lens | 中心单点 | 聚焦点 |
| Prisms | 偏移的单点 | 偏离中心的点 |
| Custom Pattern | 用户上传的图案 | 任意灰度图 |

---

## 6. 前端调用后端 API

### 6.1 修改 Node.js 服务器代理请求

在 `server/routers.ts` 中添加代理路由：

```typescript
// server/routers.ts

import { initTRPC } from "@trpc/server";
import { z } from "zod";
import axios from "axios";  // 需要安装: pnpm add axios

// Python 后端地址
const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || "http://localhost:8000";

// ... 现有代码 ...

// 添加 DOE 计算路由
export const doeRouter = router({
  // 预览计算
  preview: publicProcedure
    .input(z.object({
      params: z.any()
    }))
    .mutation(async ({ input }) => {
      try {
        const response = await axios.post(
          `${PYTHON_BACKEND_URL}/api/preview`,
          input,
          { timeout: 30000 }
        );
        return response.data;
      } catch (error) {
        console.error("Preview error:", error);
        throw new Error("Preview calculation failed");
      }
    }),

  // 优化计算
  optimize: publicProcedure
    .input(z.object({
      params: z.any(),
      max_iterations: z.number().optional().default(100)
    }))
    .mutation(async ({ input }) => {
      try {
        const response = await axios.post(
          `${PYTHON_BACKEND_URL}/api/optimize`,
          input,
          { timeout: 300000 }  // 5分钟超时
        );
        return response.data;
      } catch (error) {
        console.error("Optimize error:", error);
        throw new Error("Optimization failed");
      }
    }),
});

// 合并路由
export const appRouter = router({
  // ... 现有路由 ...
  doe: doeRouter,
});
```

### 6.2 修改前端调用

在 `client/src/pages/DOEStudio.tsx` 中修改 Preview 和 Optimize 函数：

```typescript
// client/src/pages/DOEStudio.tsx

// 导入 tRPC hooks
import { trpc } from "@/lib/trpc";

// 在组件内部
const previewMutation = trpc.doe.preview.useMutation();
const optimizeMutation = trpc.doe.optimize.useMutation();

// Preview 函数
const handlePreview = async () => {
  setIsPreviewLoading(true);
  try {
    const result = await previewMutation.mutateAsync({
      params: {
        mode: params.mode,
        wavelength: parseFloat(params.wavelength),
        diameter: parseFloat(params.diameter),
        shape: params.shape,
        working_distance: params.workingDistance === 'inf' 
          ? null 
          : parseFloat(params.workingDistance),
        array_size: params.arraySize,
        target_type: params.targetType,
        target_value: parseFloat(params.targetValue),
        tolerance: parseFloat(params.tolerance),
        // ... 其他参数
      }
    });
    
    setPreviewData({
      totalSpots: result.total_spots,
      pixelPitch: result.pixel_pitch,
      maxDiffractionAngle: result.max_diffraction_angle,
      fullAngle: result.full_angle,
      estimatedEfficiency: result.estimated_efficiency,
      estimatedTime: result.estimated_time,
      actualTolerance: result.actual_tolerance,
      effectivePixels: result.effective_pixels,
      warnings: result.warnings,
    });
  } catch (error) {
    toast.error("Preview calculation failed");
    console.error(error);
  } finally {
    setIsPreviewLoading(false);
  }
};

// Optimize 函数
const handleOptimize = async () => {
  // 如果没有预览数据，先运行预览
  if (!previewData) {
    await handlePreview();
  }
  
  setIsOptimizing(true);
  try {
    const result = await optimizeMutation.mutateAsync({
      params: {
        mode: params.mode,
        wavelength: parseFloat(params.wavelength),
        diameter: parseFloat(params.diameter),
        shape: params.shape,
        // ... 其他参数
      },
      max_iterations: 100
    });
    
    setOptimizeData({
      phaseImage: result.phase_image,
      intensityDistribution: result.intensity_distribution,
      orderEnergies: result.order_energies,
      efficiency: result.efficiency,
      uniformity: result.uniformity,
      computationTime: result.computation_time,
    });
  } catch (error) {
    toast.error("Optimization failed");
    console.error(error);
  } finally {
    setIsOptimizing(false);
  }
};
```

---

## 7. 数据格式说明

### 7.1 请求数据格式

**Preview 请求：**

```json
{
  "params": {
    "mode": "2d_spot_projector",
    "wavelength": 532,
    "diameter": 12.7,
    "shape": "circular",
    "working_distance": 100,
    "array_size": "50x50",
    "target_type": "angle",
    "target_value": 10,
    "tolerance": 1
  }
}
```

**Optimize 请求：**

```json
{
  "params": {
    "mode": "2d_spot_projector",
    "wavelength": 532,
    "diameter": 12.7,
    "shape": "circular",
    "working_distance": 100,
    "array_size": "50x50",
    "target_type": "angle",
    "target_value": 10,
    "tolerance": 1
  },
  "max_iterations": 100
}
```

### 7.2 响应数据格式

**Preview 响应：**

```json
{
  "total_spots": 2500,
  "pixel_pitch": 12.4,
  "max_diffraction_angle": 1.23,
  "full_angle": 2.46,
  "estimated_efficiency": 85.5,
  "estimated_time": 10.5,
  "actual_tolerance": 1.0,
  "effective_pixels": 2500,
  "warnings": []
}
```

**Optimize 响应：**

```json
{
  "phase_image": "data:image/png;base64,iVBORw0KGgo...",
  "intensity_distribution": [[0.1, 0.2, ...], ...],
  "order_energies": [0.85, 0.84, 0.86, ...],
  "efficiency": 85.5,
  "uniformity": 92.3,
  "computation_time": 12.34
}
```

---

## 8. 部署配置

### 8.1 启动 Python 后端

```bash
# 进入 Python 后端目录
cd /home/ubuntu/raioptics_clone/python_backend

# 激活虚拟环境
source venv/bin/activate

# 启动服务器
python main.py

# 或使用 uvicorn 直接启动（支持热重载）
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 8.2 配置环境变量

在项目根目录的 `.env` 文件中添加：

```bash
# Python 后端地址
PYTHON_BACKEND_URL=http://localhost:8000
```

### 8.3 使用 systemd 管理服务（生产环境）

创建服务文件 `/etc/systemd/system/doe-backend.service`：

```ini
[Unit]
Description=DOE Studio Python Backend
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/raioptics_clone/python_backend
Environment="PATH=/home/ubuntu/raioptics_clone/python_backend/venv/bin"
ExecStart=/home/ubuntu/raioptics_clone/python_backend/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
```

启动服务：

```bash
sudo systemctl daemon-reload
sudo systemctl enable doe-backend
sudo systemctl start doe-backend
sudo systemctl status doe-backend
```

### 8.4 使用 Nginx 反向代理（可选）

如果需要通过同一个域名访问前端和后端，可以配置 Nginx：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }

    # Python 后端
    location /api/ {
        proxy_pass http://localhost:8000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_read_timeout 300s;  # 优化计算可能需要较长时间
    }
}
```

---

## 9. 常见问题

### Q1: 如何检查 Python 后端是否正常运行？

访问 `http://localhost:8000/` 或 `http://localhost:8000/docs`（FastAPI 自动生成的 API 文档）。

### Q2: GPU 加速不工作怎么办？

1. 检查 PyTorch 是否正确安装 GPU 版本：
   ```python
   import torch
   print(torch.cuda.is_available())  # 应该返回 True
   ```

2. 如果返回 False，重新安装 GPU 版本的 PyTorch：
   ```bash
   pip install torch --index-url https://download.pytorch.org/whl/cu118
   ```

### Q3: 优化计算超时怎么办？

1. 减少迭代次数
2. 降低分辨率
3. 增加前端和 Nginx 的超时时间

### Q4: 如何添加新的优化算法？

1. 在 `algorithms/` 目录下创建新文件，如 `ifta.py`
2. 实现与 `gs_algorithm.py` 相同的接口
3. 在 `main.py` 中导入并使用新算法

---

## 参考资料

1. [FastAPI 官方文档](https://fastapi.tiangolo.com/)
2. [PyTorch 官方文档](https://pytorch.org/docs/)
3. [Gerchberg-Saxton 算法论文](https://www.osapublishing.org/ol/abstract.cfm?uri=ol-3-1-27)
4. [DOE 设计原理](https://www.rp-photonics.com/diffractive_optical_elements.html)
