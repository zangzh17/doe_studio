/**
 * Home Page - DOE Studio Landing
 * Modern landing page with teal/cyan theme
 */

import { useAuth } from "@/_core/hooks/useAuth";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  ArrowRight, 
  Zap, 
  Target, 
  Layers, 
  BarChart3,
  Sparkles,
  Grid3X3,
  Focus,
  Aperture,
  Triangle,
  Shapes,
  Play,
  CheckCircle2,
  Waves,
  Cpu,
  Eye,
  Download
} from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const { t, language } = useLanguage();

  const features = [
    {
      icon: Target,
      title: t("home.feature1.title"),
      description: t("home.feature1.desc"),
    },
    {
      icon: Zap,
      title: t("home.feature2.title"),
      description: t("home.feature2.desc"),
    },
    {
      icon: Layers,
      title: t("home.feature3.title"),
      description: t("home.feature3.desc"),
    },
    {
      icon: BarChart3,
      title: t("home.feature4.title"),
      description: t("home.feature4.desc"),
    },
  ];

  const doeTypes = [
    { icon: Aperture, name: t("home.type.diffuser"), desc: t("home.type.diffuserDesc"), color: "from-rose-400 to-pink-500" },
    { icon: Grid3X3, name: t("home.type.1dSplitter"), desc: t("home.type.1dSplitterDesc"), color: "from-amber-400 to-orange-500" },
    { icon: Sparkles, name: t("home.type.2dSpot"), desc: t("home.type.2dSpotDesc"), color: "from-teal-400 to-cyan-500" },
    { icon: Focus, name: t("home.type.lens"), desc: t("home.type.lensDesc"), color: "from-blue-400 to-indigo-500" },
    { icon: Triangle, name: t("home.type.prism"), desc: t("home.type.prismDesc"), color: "from-violet-400 to-purple-500" },
    { icon: Shapes, name: t("home.type.custom"), desc: t("home.type.customDesc"), color: "from-slate-400 to-slate-600" },
  ];

  const steps = [
    { 
      step: "01", 
      icon: Target,
      title: language === "en" ? "Configure" : "配置参数",
      desc: language === "en" 
        ? "Set working distance, wavelength, DOE type, and target specifications"
        : "设置工作距离、波长、DOE类型和目标规格"
    },
    { 
      step: "02", 
      icon: Eye,
      title: language === "en" ? "Preview" : "预览检查",
      desc: language === "en"
        ? "Review summary with warnings before optimization"
        : "优化前查看摘要和警告信息"
    },
    { 
      step: "03", 
      icon: Cpu,
      title: language === "en" ? "Optimize" : "优化生成",
      desc: language === "en"
        ? "GPU-accelerated optimization generates phase map"
        : "GPU加速优化生成相位图"
    },
    { 
      step: "04", 
      icon: Download,
      title: language === "en" ? "Export" : "导出结果",
      desc: language === "en"
        ? "Download phase map and analysis reports"
        : "下载相位图和分析报告"
    },
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-4 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          {/* Animated gradient orbs */}
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-teal-500/20 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-500/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-teal-600/10 rounded-full blur-[120px]" />
          
          {/* Dot pattern */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 container max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/10 backdrop-blur-sm border border-teal-500/20 text-teal-300 text-sm font-medium mb-8 animate-fade-in">
            <Waves className="w-4 h-4" />
            {t("home.badge")}
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
            {language === "en" ? (
              <>
                Design DOEs with
                <br />
                <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  Precision
                </span>
              </>
            ) : (
              <>
                <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  精准
                </span>
                设计衍射光学元件
              </>
            )}
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            {t("home.subtitle")}
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/studio">
              <Button 
                size="lg" 
                className="gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600 px-8 py-6 text-lg font-semibold rounded-xl shadow-2xl shadow-teal-500/30 transition-all hover:scale-105"
              >
                {t("home.startDesigning")}
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/docs">
              <Button 
                size="lg" 
                variant="outline" 
                className="gap-2 border-slate-600 text-slate-200 hover:bg-slate-800 px-8 py-6 text-lg rounded-xl"
              >
                <Play className="w-5 h-5" />
                {t("home.documentation")}
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
            {[
              { value: "6+", label: language === "en" ? "DOE Types" : "DOE类型" },
              { value: "GPU", label: language === "en" ? "Accelerated" : "加速优化" },
              { value: "Real-time", label: language === "en" ? "Preview" : "实时预览" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-slate-600 flex items-start justify-center p-2">
            <div className="w-1.5 h-2.5 bg-teal-400 rounded-full" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 bg-slate-50 relative">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t("home.featuresTitle")}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {language === "en" 
                ? "Powerful tools designed for professional optical engineers"
                : "为专业光学工程师设计的强大工具"
              }
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group relative p-8 bg-white rounded-2xl border border-slate-200 hover:shadow-xl hover:shadow-teal-500/10 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center mb-6 shadow-lg shadow-teal-500/20 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DOE Types Section */}
      <section className="py-24 px-4 bg-white">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t("home.typesTitle")}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("home.typesSubtitle")}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {doeTypes.map((type) => (
              <Link key={type.name} href="/studio">
                <div className="group p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 cursor-pointer">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${type.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                    <type.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="font-semibold text-foreground mb-1">{type.name}</div>
                  <div className="text-sm text-muted-foreground">{type.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-24 px-4 bg-slate-50">
        <div className="container max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {language === "en" ? "Simple 4-Step Workflow" : "简单四步流程"}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((item, index) => (
              <div key={item.step} className="relative text-center p-6 bg-white rounded-2xl border border-slate-200">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 text-white mb-4 shadow-lg shadow-teal-500/20">
                  <item.icon className="w-6 h-6" />
                </div>
                <div className="text-xs font-bold text-teal-600 mb-2">{item.step}</div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-teal-500/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-[100px]" />
        </div>
        
        <div className="relative z-10 container max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            {language === "en" ? "Ready to Design?" : "准备好开始设计了吗？"}
          </h2>
          <p className="text-slate-300 mb-8 text-lg">
            {language === "en" 
              ? "Start creating professional DOE designs today with our intuitive tools."
              : "立即使用我们直观的工具开始创建专业的DOE设计。"
            }
          </p>
          <Link href="/studio">
            <Button 
              size="lg" 
              className="gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600 px-10 py-6 text-lg font-semibold rounded-xl shadow-2xl shadow-teal-500/30"
            >
              {t("home.startDesigning")}
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-slate-900 border-t border-slate-800">
        <div className="container max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
                <Waves className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white">DOE Studio</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-400">
              <Link href="/docs" className="hover:text-white transition-colors">
                {t("nav.docs")}
              </Link>
              <Link href="/pricing" className="hover:text-white transition-colors">
                {t("nav.pricing")}
              </Link>
              <span>© 2024 DOE Studio</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
