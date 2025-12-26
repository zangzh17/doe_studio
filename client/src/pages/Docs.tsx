/**
 * Docs Page - Documentation for DOE Studio
 * Provides user guides, API documentation, and tutorials
 */

import Header from "@/components/Header";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  Book, 
  Lightbulb, 
  Code, 
  Zap, 
  FileText, 
  Video,
  ChevronRight,
  Search,
  ExternalLink,
  BookOpen,
  Cpu,
  Settings,
  HelpCircle
} from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Docs() {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState("getting-started");

  const t = (en: string, zh: string) => language === "zh" ? zh : en;

  // Documentation sections
  const sections = [
    {
      id: "getting-started",
      icon: BookOpen,
      title: t("Getting Started", "快速入门"),
      description: t("Learn the basics of DOE Studio", "了解DOE Studio的基础知识"),
    },
    {
      id: "doe-types",
      icon: Lightbulb,
      title: t("DOE Types", "DOE类型"),
      description: t("Understanding different DOE modes", "了解不同的DOE模式"),
    },
    {
      id: "parameters",
      icon: Settings,
      title: t("Parameters Guide", "参数指南"),
      description: t("Configure your DOE design parameters", "配置DOE设计参数"),
    },
    {
      id: "optimization",
      icon: Cpu,
      title: t("Optimization", "优化算法"),
      description: t("GPU-accelerated optimization algorithms", "GPU加速优化算法"),
    },
    {
      id: "api",
      icon: Code,
      title: t("API Reference", "API参考"),
      description: t("Integrate DOE Studio into your workflow", "将DOE Studio集成到您的工作流程"),
    },
    {
      id: "faq",
      icon: HelpCircle,
      title: t("FAQ", "常见问题"),
      description: t("Frequently asked questions", "常见问题解答"),
    },
  ];

  // Quick links
  const quickLinks = [
    { title: t("Create your first design", "创建您的第一个设计"), href: "/studio" },
    { title: t("View templates", "查看模板"), href: "/studio" },
    { title: t("Pricing plans", "定价方案"), href: "/pricing" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="container py-16">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500/20 rounded-full text-teal-300 text-sm font-medium mb-6">
              <Book className="w-4 h-4" />
              {t("Documentation", "文档中心")}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {t("DOE Studio Documentation", "DOE Studio 文档")}
            </h1>
            <p className="text-xl text-slate-300 mb-8">
              {t(
                "Everything you need to design, optimize, and manufacture diffractive optical elements.",
                "设计、优化和制造衍射光学元件所需的一切。"
              )}
            </p>
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder={t("Search documentation...", "搜索文档...")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 bg-white/10 border-white/20 text-white placeholder:text-slate-400 text-lg rounded-2xl"
              />
            </div>
          </div>
        </div>
      </div>

      <main className="container py-12">
        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {quickLinks.map((link, index) => (
            <a
              key={index}
              href={link.href}
              className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 hover:border-teal-300 hover:shadow-lg transition-all group"
            >
              <span className="font-medium text-slate-900">{link.title}</span>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-teal-500 group-hover:translate-x-1 transition-all" />
            </a>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <nav className="sticky top-8 space-y-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                    activeSection === section.id
                      ? "bg-teal-50 text-teal-700 border border-teal-200"
                      : "hover:bg-slate-100 text-slate-600"
                  }`}
                >
                  <section.icon className="w-5 h-5" />
                  <span className="font-medium">{section.title}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl border border-slate-200 p-8">
              {/* Getting Started */}
              {activeSection === "getting-started" && (
                <div className="prose prose-slate max-w-none">
                  <h1>{t("Getting Started with DOE Studio", "DOE Studio 快速入门")}</h1>
                  
                  <p className="lead">
                    {t(
                      "DOE Studio is a professional platform for designing diffractive optical elements (DOEs) with GPU-accelerated optimization and real-time preview capabilities.",
                      "DOE Studio 是一个专业的衍射光学元件（DOE）设计平台，具有 GPU 加速优化和实时预览功能。"
                    )}
                  </p>

                  <h2>{t("What is a DOE?", "什么是DOE？")}</h2>
                  <p>
                    {t(
                      "A Diffractive Optical Element (DOE) is a thin optical component that uses diffraction to shape light. Unlike traditional refractive optics (lenses), DOEs can create complex light patterns, split beams, or shape laser profiles with minimal thickness and weight.",
                      "衍射光学元件（DOE）是一种利用衍射来整形光束的薄型光学元件。与传统的折射光学器件（透镜）不同，DOE 可以以最小的厚度和重量创建复杂的光图案、分束或整形激光轮廓。"
                    )}
                  </p>

                  <h2>{t("Creating Your First Design", "创建您的第一个设计")}</h2>
                  <ol>
                    <li>
                      <strong>{t("Sign in to your account", "登录您的账户")}</strong>
                      <p>{t("Click the Account button in the top right corner to sign in or create an account.", "点击右上角的账户按钮登录或创建账户。")}</p>
                    </li>
                    <li>
                      <strong>{t("Go to Studio", "进入工作室")}</strong>
                      <p>{t("Navigate to the Studio page from the main menu.", "从主菜单导航到工作室页面。")}</p>
                    </li>
                    <li>
                      <strong>{t("Create a new design or use a template", "创建新设计或使用模板")}</strong>
                      <p>{t("Click 'New Design' to start from scratch, or select a template to begin with pre-configured parameters.", "点击'新建设计'从头开始，或选择模板以预配置参数开始。")}</p>
                    </li>
                    <li>
                      <strong>{t("Configure parameters", "配置参数")}</strong>
                      <p>{t("Set your working distance, wavelength, DOE type, and other parameters.", "设置工作距离、波长、DOE类型和其他参数。")}</p>
                    </li>
                    <li>
                      <strong>{t("Preview and optimize", "预览和优化")}</strong>
                      <p>{t("Click Preview to see a summary, then Optimize to run the GPU-accelerated algorithm.", "点击预览查看摘要，然后点击优化运行 GPU 加速算法。")}</p>
                    </li>
                  </ol>

                  <div className="bg-teal-50 border border-teal-200 rounded-xl p-6 my-6">
                    <h4 className="text-teal-800 font-semibold mb-2 flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      {t("Pro Tip", "专业提示")}
                    </h4>
                    <p className="text-teal-700 mb-0">
                      {t(
                        "Free users get 10 optimization runs. Upgrade to get more optimization credits and access to advanced features.",
                        "免费用户可获得 10 次优化运行。升级以获得更多优化额度和高级功能。"
                      )}
                    </p>
                  </div>
                </div>
              )}

              {/* DOE Types */}
              {activeSection === "doe-types" && (
                <div className="prose prose-slate max-w-none">
                  <h1>{t("DOE Types", "DOE 类型")}</h1>
                  
                  <p className="lead">
                    {t(
                      "DOE Studio supports various types of diffractive optical elements for different applications.",
                      "DOE Studio 支持多种类型的衍射光学元件，适用于不同的应用场景。"
                    )}
                  </p>

                  <h2>{t("2D Spot Projector", "二维点阵投影器")}</h2>
                  <p>
                    {t(
                      "Creates a 2D array of spots from a single laser beam. Commonly used in 3D sensing, structured light, and LiDAR applications.",
                      "从单个激光束创建二维点阵。常用于 3D 传感、结构光和 LiDAR 应用。"
                    )}
                  </p>
                  <ul>
                    <li>{t("Configurable array size (e.g., 50×50, 100×100)", "可配置阵列大小（如 50×50、100×100）")}</li>
                    <li>{t("Adjustable target angle or size", "可调目标角度或尺寸")}</li>
                    <li>{t("Uniform intensity distribution", "均匀的光强分布")}</li>
                  </ul>

                  <h2>{t("1D Splitter", "一维分束器")}</h2>
                  <p>
                    {t(
                      "Splits a laser beam into multiple beams along one axis. Used for line generation and multi-beam applications.",
                      "将激光束沿一个轴分成多束。用于线生成和多光束应用。"
                    )}
                  </p>

                  <h2>{t("Diffuser", "匀光片")}</h2>
                  <p>
                    {t(
                      "Creates uniform illumination patterns. Available in Gaussian (circular) and top-hat (square) profiles.",
                      "创建均匀的照明图案。可选高斯（圆形）和平顶（方形）轮廓。"
                    )}
                  </p>

                  <h2>{t("Diffractive Lens", "衍射透镜")}</h2>
                  <p>
                    {t(
                      "A thin lens that uses diffraction instead of refraction to focus light. Ideal for compact optical systems.",
                      "使用衍射而非折射来聚焦光线的薄透镜。适用于紧凑型光学系统。"
                    )}
                  </p>

                  <h2>{t("Prism / Beam Deflector", "棱镜/光束偏转器")}</h2>
                  <p>
                    {t(
                      "Deflects a beam by a specified angle. Useful for beam steering and alignment applications.",
                      "将光束偏转指定角度。适用于光束转向和对准应用。"
                    )}
                  </p>

                  <h2>{t("Custom Pattern", "自定义图案")}</h2>
                  <p>
                    {t(
                      "Design DOEs for arbitrary target patterns. Upload your own target image or define custom intensity distributions.",
                      "为任意目标图案设计 DOE。上传您自己的目标图像或定义自定义光强分布。"
                    )}
                  </p>
                </div>
              )}

              {/* Parameters Guide */}
              {activeSection === "parameters" && (
                <div className="prose prose-slate max-w-none">
                  <h1>{t("Parameters Guide", "参数指南")}</h1>
                  
                  <h2>{t("Basic Parameters", "基本参数")}</h2>
                  
                  <h3>{t("Working Distance", "工作距离")}</h3>
                  <p>
                    {t(
                      "The distance from the DOE to the target plane. Enter 'inf' for far-field (infinity) applications, or specify a finite distance with units (e.g., '100mm', '1m', '1ft').",
                      "从 DOE 到目标平面的距离。对于远场（无穷远）应用输入 'inf'，或指定带单位的有限距离（如 '100mm'、'1m'、'1ft'）。"
                    )}
                  </p>
                  <div className="bg-slate-100 rounded-lg p-4 my-4">
                    <p className="text-sm text-slate-600 mb-0">
                      <strong>{t("Supported units:", "支持的单位：")}</strong> mm, cm, m, in, ft
                    </p>
                  </div>

                  <h3>{t("Wavelength", "波长")}</h3>
                  <p>
                    {t(
                      "The operating wavelength of your laser source. Common values include 532nm (green), 635nm (red), 850nm (NIR), and 940nm (NIR).",
                      "激光光源的工作波长。常用值包括 532nm（绿色）、635nm（红色）、850nm（近红外）和 940nm（近红外）。"
                    )}
                  </p>

                  <h3>{t("Device Diameter", "器件直径")}</h3>
                  <p>
                    {t(
                      "The physical size of the DOE. Standard sizes include 1/2 inch (12.7mm), 1 inch (25.4mm), and 2 inch (50.8mm).",
                      "DOE 的物理尺寸。标准尺寸包括 1/2 英寸（12.7mm）、1 英寸（25.4mm）和 2 英寸（50.8mm）。"
                    )}
                  </p>

                  <h2>{t("2D Spot Projector Settings", "二维点阵投影器设置")}</h2>
                  
                  <h3>{t("Array Size", "阵列规模")}</h3>
                  <p>
                    {t(
                      "The number of rows and columns in the spot array. Larger arrays require more computation time.",
                      "点阵的行数和列数。较大的阵列需要更多的计算时间。"
                    )}
                  </p>

                  <h3>{t("Target Specification", "目标规格")}</h3>
                  <p>
                    {t(
                      "Choose between specifying the target size (for finite working distance) or the full angle (for infinite working distance).",
                      "选择指定目标尺寸（用于有限工作距离）或全角（用于无限工作距离）。"
                    )}
                  </p>

                  <h3>{t("Tolerance", "容差")}</h3>
                  <p>
                    {t(
                      "The acceptable deviation from the target pattern, expressed as a percentage. Lower tolerance requires more optimization iterations.",
                      "与目标图案的可接受偏差，以百分比表示。较低的容差需要更多的优化迭代。"
                    )}
                  </p>
                </div>
              )}

              {/* Optimization */}
              {activeSection === "optimization" && (
                <div className="prose prose-slate max-w-none">
                  <h1>{t("Optimization Algorithms", "优化算法")}</h1>
                  
                  <p className="lead">
                    {t(
                      "DOE Studio uses GPU-accelerated algorithms to compute optimal phase patterns for your DOE designs.",
                      "DOE Studio 使用 GPU 加速算法为您的 DOE 设计计算最优相位图案。"
                    )}
                  </p>

                  <h2>{t("Gerchberg-Saxton Algorithm", "Gerchberg-Saxton 算法")}</h2>
                  <p>
                    {t(
                      "The GS algorithm is an iterative Fourier transform algorithm that alternates between the near-field (DOE plane) and far-field (target plane) to find the optimal phase distribution.",
                      "GS 算法是一种迭代傅里叶变换算法，在近场（DOE 平面）和远场（目标平面）之间交替，以找到最优相位分布。"
                    )}
                  </p>

                  <h2>{t("IFTA (Iterative Fourier Transform Algorithm)", "IFTA（迭代傅里叶变换算法）")}</h2>
                  <p>
                    {t(
                      "An enhanced version of the GS algorithm with additional constraints and feedback mechanisms for improved convergence.",
                      "GS 算法的增强版本，具有额外的约束和反馈机制，以改善收敛性。"
                    )}
                  </p>

                  <h2>{t("Optimization Credits", "优化额度")}</h2>
                  <table>
                    <thead>
                      <tr>
                        <th>{t("Plan", "方案")}</th>
                        <th>{t("Credits", "额度")}</th>
                        <th>{t("Price", "价格")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{t("Free", "免费")}</td>
                        <td>10</td>
                        <td>$0</td>
                      </tr>
                      <tr>
                        <td>{t("Basic Pack", "基础包")}</td>
                        <td>25</td>
                        <td>$2 / ¥10</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* API Reference */}
              {activeSection === "api" && (
                <div className="prose prose-slate max-w-none">
                  <h1>{t("API Reference", "API 参考")}</h1>
                  
                  <p className="lead">
                    {t(
                      "Integrate DOE Studio into your workflow using our REST API.",
                      "使用我们的 REST API 将 DOE Studio 集成到您的工作流程中。"
                    )}
                  </p>

                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 my-6">
                    <h4 className="text-amber-800 font-semibold mb-2">
                      {t("Coming Soon", "即将推出")}
                    </h4>
                    <p className="text-amber-700 mb-0">
                      {t(
                        "The API is currently under development. Contact us for early access.",
                        "API 目前正在开发中。联系我们获取早期访问权限。"
                      )}
                    </p>
                  </div>

                  <h2>{t("Planned Endpoints", "计划的端点")}</h2>
                  <ul>
                    <li><code>POST /api/designs</code> - {t("Create a new design", "创建新设计")}</li>
                    <li><code>GET /api/designs/:id</code> - {t("Get design details", "获取设计详情")}</li>
                    <li><code>POST /api/designs/:id/optimize</code> - {t("Run optimization", "运行优化")}</li>
                    <li><code>GET /api/designs/:id/phase-map</code> - {t("Download phase map", "下载相位图")}</li>
                  </ul>
                </div>
              )}

              {/* FAQ */}
              {activeSection === "faq" && (
                <div className="prose prose-slate max-w-none">
                  <h1>{t("Frequently Asked Questions", "常见问题")}</h1>
                  
                  <h3>{t("What file formats can I export?", "我可以导出哪些文件格式？")}</h3>
                  <p>
                    {t(
                      "Currently, you can export phase maps as PNG images. GDSII and DXF export for manufacturing is coming soon.",
                      "目前，您可以将相位图导出为 PNG 图像。用于制造的 GDSII 和 DXF 导出即将推出。"
                    )}
                  </p>

                  <h3>{t("How long does optimization take?", "优化需要多长时间？")}</h3>
                  <p>
                    {t(
                      "Optimization time depends on the array size and complexity. A typical 50×50 array takes about 10-30 seconds with GPU acceleration.",
                      "优化时间取决于阵列大小和复杂性。使用 GPU 加速，典型的 50×50 阵列大约需要 10-30 秒。"
                    )}
                  </p>

                  <h3>{t("Can I manufacture my DOE designs?", "我可以制造我的 DOE 设计吗？")}</h3>
                  <p>
                    {t(
                      "Yes! We offer DOE fabrication services. Visit our Pricing page for details on sizes and pricing.",
                      "是的！我们提供 DOE 加工服务。访问我们的定价页面了解尺寸和价格详情。"
                    )}
                  </p>

                  <h3>{t("What is the fabrication simulator?", "什么是加工模拟器？")}</h3>
                  <p>
                    {t(
                      "The fabrication simulator models how manufacturing processes affect your DOE design, helping you predict real-world performance before ordering.",
                      "加工模拟器模拟制造过程如何影响您的 DOE 设计，帮助您在订购前预测实际性能。"
                    )}
                  </p>

                  <h3>{t("Do you support custom patterns?", "你们支持自定义图案吗？")}</h3>
                  <p>
                    {t(
                      "Yes, you can upload custom target patterns or define arbitrary intensity distributions. Contact us for complex custom requirements.",
                      "是的，您可以上传自定义目标图案或定义任意光强分布。对于复杂的自定义需求，请联系我们。"
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 mt-16">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                  <path d="M12 6v12M6 12h12" />
                </svg>
              </div>
              <span className="font-semibold">DOE Studio</span>
            </div>
            <p className="text-slate-400 text-sm">
              © 2024 DOE Studio. {t("All rights reserved.", "保留所有权利。")}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
