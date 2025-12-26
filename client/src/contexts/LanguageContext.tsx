/**
 * Language Context - Internationalization (i18n) support
 * Provides Chinese/English language switching
 */

import { createContext, useContext, useState, ReactNode } from "react";

type Language = "en" | "zh" | "ko";

interface Translations {
  [key: string]: {
    en: string;
    zh: string;
    ko?: string;
  };
}

// All translations
export const translations: Translations = {
  // Header
  "nav.home": { en: "Home", zh: "首页" },
  "nav.studio": { en: "Studio", zh: "工作室" },
  "nav.docs": { en: "Docs", zh: "文档" },
  "nav.pricing": { en: "Pricing", zh: "定价" },
  "nav.signIn": { en: "Sign in", zh: "登录" },
  "nav.account": { en: "Account", zh: "账户" },
  "nav.profile": { en: "Profile", zh: "个人资料" },
  "nav.settings": { en: "Settings", zh: "设置" },
  "nav.signOut": { en: "Sign out", zh: "退出登录" },
  
  // Home Page
  "home.badge": { en: "Diffractive Optical Element Design", zh: "衍射光学元件设计" },
  "home.title": { en: "Design DOEs with", zh: "精准设计" },
  "home.titleHighlight": { en: "Precision", zh: "衍射光学元件" },
  "home.subtitle": { en: "Professional diffractive optical element design studio with GPU-accelerated optimization, real-time preview, and comprehensive analysis tools.", zh: "专业的衍射光学元件设计工作室，提供GPU加速优化、实时预览和全面的分析工具。" },
  "home.startDesigning": { en: "Start Designing", zh: "开始设计" },
  "home.documentation": { en: "Documentation", zh: "查看文档" },
  "home.featuresTitle": { en: "Everything you need for DOE design", zh: "DOE设计所需的一切" },
  "home.feature1.title": { en: "Multiple DOE Types", zh: "多种DOE类型" },
  "home.feature1.desc": { en: "Design diffusers, beam splitters, spot projectors, diffractive lenses, and custom patterns.", zh: "设计匀光片、分束器、点阵投影器、衍射透镜和自定义图案。" },
  "home.feature2.title": { en: "GPU-Accelerated", zh: "GPU加速" },
  "home.feature2.desc": { en: "PyTorch-based optimization engine for fast, high-quality DOE design.", zh: "基于PyTorch的优化引擎，实现快速、高质量的DOE设计。" },
  "home.feature3.title": { en: "Real-time Preview", zh: "实时预览" },
  "home.feature3.desc": { en: "Instant feedback on design parameters with comprehensive warnings.", zh: "即时反馈设计参数，提供全面的警告提示。" },
  "home.feature4.title": { en: "Detailed Analysis", zh: "详细分析" },
  "home.feature4.desc": { en: "Phase maps, intensity distributions, efficiency metrics, and 3D visualization.", zh: "相位图、光强分布、效率指标和3D可视化。" },
  "home.typesTitle": { en: "Supported DOE Types", zh: "支持的DOE类型" },
  "home.typesSubtitle": { en: "Design a wide range of diffractive optical elements for various applications", zh: "设计各种应用场景的衍射光学元件" },
  "home.type.diffuser": { en: "Diffuser", zh: "匀光片" },
  "home.type.diffuserDesc": { en: "Uniform light distribution", zh: "均匀光分布" },
  "home.type.1dSplitter": { en: "1D Splitter", zh: "一维分束器" },
  "home.type.1dSplitterDesc": { en: "Linear beam splitting", zh: "线性分束" },
  "home.type.2dSpot": { en: "2D Spot Projector", zh: "二维点阵投影器" },
  "home.type.2dSpotDesc": { en: "Structured light patterns", zh: "结构光图案" },
  "home.type.lens": { en: "Diffractive Lens", zh: "衍射透镜" },
  "home.type.lensDesc": { en: "Focusing elements", zh: "聚焦元件" },
  "home.type.prism": { en: "Prisms", zh: "棱镜" },
  "home.type.prismDesc": { en: "Beam deflection", zh: "光束偏转" },
  "home.type.custom": { en: "Custom Pattern", zh: "自定义图案" },
  "home.type.customDesc": { en: "Arbitrary designs", zh: "任意设计" },
  "home.ctaTitle": { en: "Ready to design your DOE?", zh: "准备好设计您的DOE了吗？" },
  "home.ctaSubtitle": { en: "Start creating professional diffractive optical elements today.", zh: "立即开始创建专业的衍射光学元件。" },
  "home.openStudio": { en: "Open Studio", zh: "打开工作室" },
  "home.footer": { en: "© 2025 DOE Studio. All rights reserved.", zh: "© 2025 DOE Studio. 保留所有权利。" },
  
  // Studio Page
  "studio.myDesigns": { en: "My Designs", zh: "我的设计" },
  "studio.myDesignsDesc": { en: "Create and manage your DOE designs", zh: "创建和管理您的DOE设计" },
  "studio.newDesign": { en: "New Design", zh: "新建设计" },
  "studio.searchDesigns": { en: "Search designs...", zh: "搜索设计..." },
  "studio.allDesigns": { en: "All Designs", zh: "全部设计" },
  "studio.drafts": { en: "Drafts", zh: "草稿" },
  "studio.optimized": { en: "Optimized", zh: "已优化" },
  "studio.noDesigns": { en: "No designs found", zh: "未找到设计" },
  "studio.noDesignsHint": { en: "Create your first DOE design to get started", zh: "创建您的第一个DOE设计开始使用" },
  "studio.templates": { en: "Templates", zh: "模板" },
  "studio.templatesDesc": { en: "Start from a pre-configured template", zh: "从预配置模板开始" },
  "studio.hide": { en: "Hide", zh: "隐藏" },
  "studio.show": { en: "Show", zh: "显示" },
  "studio.template": { en: "Template", zh: "模板" },
  "studio.createNew": { en: "Create New Design", zh: "创建新设计" },
  "studio.createNewDesc": { en: "Enter a name and select the DOE type for your new design.", zh: "输入名称并选择DOE类型以创建新设计。" },
  "studio.designName": { en: "Design Name", zh: "设计名称" },
  "studio.designNamePlaceholder": { en: "My DOE Design", zh: "我的DOE设计" },
  "studio.doeType": { en: "DOE Type", zh: "DOE类型" },
  "studio.cancel": { en: "Cancel", zh: "取消" },
  "studio.create": { en: "Create", zh: "创建" },
  "studio.deleteDesign": { en: "Delete Design", zh: "删除设计" },
  "studio.deleteConfirm": { en: "Are you sure you want to delete this design? This action cannot be undone.", zh: "确定要删除此设计吗？此操作无法撤销。" },
  "studio.delete": { en: "Delete", zh: "删除" },
  "studio.draft": { en: "draft", zh: "草稿" },
  
  // DOE Editor
  "editor.designs": { en: "Designs", zh: "设计列表" },
  "editor.save": { en: "Save", zh: "保存" },
  "editor.export": { en: "Export", zh: "导出" },
  "editor.parameters": { en: "DOE Parameters", zh: "DOE参数" },
  "editor.results": { en: "Results", zh: "结果" },
  
  // Basic Parameters
  "basic.title": { en: "Basic Parameters", zh: "基本参数", ko: "기본 매개변수" },
  "basic.workingDistance": { en: "Working Distance", zh: "工作距离", ko: "작업 거리" },
  "basic.presets": { en: "Presets", zh: "预设", ko: "프리셋" },
  "basic.wavelength": { en: "Wavelength", zh: "工作波长", ko: "파장" },
  "basic.mode": { en: "DOE Mode", zh: "DOE模式", ko: "DOE 모드" },
  "basic.diameter": { en: "Device Diameter", zh: "器件直径", ko: "장치 직경" },
  "basic.shape": { en: "Device Shape", zh: "器件形状", ko: "장치 형상" },
  "shape.circular": { en: "Circular", zh: "圆形", ko: "원형" },
  "shape.square": { en: "Square", zh: "方形", ko: "정사각형" },
  "mode.lensArray": { en: "Lens Array", zh: "透镜阵列", ko: "렌즈 어레이" },
  "params.basic": { en: "Basic Parameters", zh: "基本参数" },
  "params.workingDistance": { en: "Working Distance", zh: "工作距离" },
  "params.workingDistanceHint": { en: "e.g., 10cm, 1ft, inf", zh: "例如：10cm, 1ft, inf" },
  "params.presets": { en: "Presets", zh: "预设" },
  "params.wavelength": { en: "Wavelength", zh: "工作波长" },
  "params.wavelengthHint": { en: "e.g., 532nm", zh: "例如：532nm" },
  "params.doeMode": { en: "DOE Mode", zh: "DOE模式" },
  "params.deviceDiameter": { en: "Device Diameter", zh: "器件直径" },
  "params.deviceDiameterHint": { en: "e.g., 12.7mm", zh: "例如：12.7mm" },
  "params.deviceShape": { en: "Device Shape", zh: "器件形状" },
  "params.circular": { en: "Circular", zh: "圆形" },
  "params.square": { en: "Square", zh: "方形" },
  
  // DOE Modes
  "mode.diffuser": { en: "Diffuser", zh: "匀光片" },
  "mode.1dSplitter": { en: "1D Splitter", zh: "一维分束器" },
  "mode.2dSpot": { en: "2D Spot Projector", zh: "二维点阵投影器" },
  "mode.lens": { en: "Diffractive Lens", zh: "衍射透镜" },
  "mode.prism": { en: "Prisms", zh: "棱镜" },
  "mode.custom": { en: "Custom Pattern", zh: "自定义图案" },
  
  // 2D Spot Projector Settings
  "spot.settings": { en: "2D Spot Projector Settings", zh: "二维点阵投影器设置" },
  "spot.arraySize": { en: "Array Size (Rows × Cols)", zh: "阵列规模（行×列）" },
  "spot.targetSpec": { en: "Target Specification", zh: "目标规格" },
  "spot.targetSize": { en: "Target Size", zh: "目标尺寸" },
  "spot.fullAngle": { en: "Full Angle", zh: "全角" },
  "spot.targetSizeHint": { en: "e.g., 100mm", zh: "例如：100mm" },
  "spot.fullAngleHint": { en: "e.g., 30° or 30deg", zh: "例如：30° 或 30deg" },
  "spot.equivalentAngle": { en: "Equivalent Full Angle", zh: "等效全角" },
  "spot.tolerance": { en: "Tolerance (%)", zh: "容差（%）" },
  "spot.infOnlyAngle": { en: "Only angle specification available for infinite working distance", zh: "无穷远工作距离只能指定角度" },
  
  // Fabrication Simulator
  "fab.title": { en: "Fabrication Simulator", zh: "加工模拟器" },
  "fab.enable": { en: "Enable fabrication simulation", zh: "启用加工模拟" },
  "fab.recipe": { en: "Process Recipe", zh: "工艺配方" },
  "fab.recipe.ideal": { en: "Ideal (No fabrication effects)", zh: "理想（无加工影响）" },
  "fab.recipe.binary": { en: "Binary Phase (2 levels)", zh: "二元相位（2级）" },
  "fab.recipe.multilevel4": { en: "Multi-level (4 levels)", zh: "多级相位（4级）" },
  "fab.recipe.multilevel8": { en: "Multi-level (8 levels)", zh: "多级相位（8级）" },
  "fab.recipe.multilevel16": { en: "Multi-level (16 levels)", zh: "多级相位（16级）" },
  "fab.recipe.grayscale": { en: "Grayscale (256 levels)", zh: "灰度（256级）" },
  "fab.hint": { en: "Simulation will show post-fabrication results", zh: "模拟将显示加工后的结果" },
  
  // Actions
  "action.preview": { en: "Preview", zh: "预览" },
  "action.optimize": { en: "Optimize", zh: "优化" },
  "action.optimizing": { en: "Optimizing...", zh: "优化中..." },
  
  // Results
  "results.noResults": { en: "No Results Yet", zh: "暂无结果" },
  "results.noResultsHint": { en: "Configure your DOE parameters and click 'Preview' to see a summary, then 'Optimize' to generate results.", zh: "配置DOE参数后点击'预览'查看摘要，然后点击'优化'生成结果。" },
  "results.previewSummary": { en: "Preview Summary", zh: "预览摘要" },
  "results.totalSpots": { en: "Total Spots", zh: "总光斑数" },
  "results.pixelPitch": { en: "Pixel Pitch", zh: "像素间距" },
  "results.maxAngle": { en: "Max Diffraction Angle", zh: "最大衍射角" },
  "results.estEfficiency": { en: "Est. Efficiency", zh: "预估效率" },
  "results.compTime": { en: "Est. Computation Time", zh: "预估计算时间" },
  "results.schematic": { en: "Schematic: DOE → Target Plane", zh: "示意图：DOE → 目标面" },
  "results.warnings": { en: "Warnings", zh: "警告" },
  "results.optimization": { en: "Optimization Results", zh: "优化结果" },
  "results.phaseMap": { en: "Phase Map", zh: "相位图" },
  "results.targetIntensity": { en: "Target Plane Intensity", zh: "目标面光强" },
  "results.energyHeatmap": { en: "Order Energy Distribution", zh: "级次能量分布" },
  "results.energyBar": { en: "Order Energies", zh: "级次能量" },
  "results.efficiencyStats": { en: "Efficiency Statistics", zh: "效率统计" },
  "results.3dView": { en: "3D View", zh: "3D视图" },
  "results.totalEfficiency": { en: "Total Efficiency", zh: "总效率" },
  "results.uniformityError": { en: "Uniformity Error", zh: "均匀性误差" },
  "results.zerothOrder": { en: "0th Order Leakage", zh: "零级泄漏" },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    // Try to get from localStorage
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("doe-studio-language");
      if (saved === "zh" || saved === "en") return saved;
    }
    return "en";
  });

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("doe-studio-language", lang);
    }
  };

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) {
      console.warn(`Missing translation for key: ${key}`);
      return key;
    }
    // For Korean, fallback to English if translation not available
    if (language === "ko") {
      return translation.ko || translation.en;
    }
    return translation[language];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
