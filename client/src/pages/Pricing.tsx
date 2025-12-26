/**
 * Pricing Page - DOE Studio Pricing Information
 * Shows optimization credits and fabrication services pricing (informational only)
 */

import Header from "@/components/Header";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import {
  Check,
  Zap,
  Package,
  Truck,
  Clock,
  AlertCircle,
  Sparkles,
  CircleDot,
  ArrowRight,
  Mail
} from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

export default function Pricing() {
  const { language } = useLanguage();
  const [currency, setCurrency] = useState<"usd" | "cny">("usd");

  const t = (en: string, zh: string, ko?: string) => {
    if (language === "zh") return zh;
    if (language === "ko") return ko || en;
    return en;
  };

  // Pricing data
  const optimizationPlans = [
    {
      id: "free",
      name: t("Free", "免费", "무료"),
      description: t("Get started with DOE design", "开始DOE设计", "DOE 설계 시작하기"),
      price: { usd: 0, cny: 0 },
      credits: 10,
      features: [
        t("10 optimization runs", "10次优化运行", "10회 최적화 실행"),
        t("Basic DOE types", "基础DOE类型", "기본 DOE 유형"),
        t("PNG export", "PNG导出", "PNG 내보내기"),
        t("Community support", "社区支持", "커뮤니티 지원"),
      ],
      cta: t("Get Started", "开始使用", "시작하기"),
      popular: false,
    },
    {
      id: "basic",
      name: t("Basic Pack", "基础包", "기본 패키지"),
      description: t("For regular users", "适合常规用户", "일반 사용자용"),
      price: { usd: 2, cny: 10 },
      credits: 25,
      features: [
        t("25 optimization runs", "25次优化运行", "25회 최적화 실행"),
        t("All DOE types", "所有DOE类型", "모든 DOE 유형"),
        t("PNG & JSON export", "PNG和JSON导出", "PNG & JSON 내보내기"),
        t("Email support", "邮件支持", "이메일 지원"),
        t("Fabrication simulator", "加工模拟器", "가공 시뮬레이터"),
      ],
      cta: t("Coming Soon", "即将推出", "곧 출시"),
      popular: true,
    },
  ];

  const fabricationServices = [
    {
      size: '1/2"',
      sizeMm: "12.7mm",
      price: { usd: 350, cny: 2450 },
      description: t("Compact size for prototyping", "紧凑尺寸，适合原型设计", "프로토타이핑용 소형 크기"),
    },
    {
      size: '1"',
      sizeMm: "25.4mm",
      price: { usd: 400, cny: 2800 },
      description: t("Standard size for most applications", "标准尺寸，适合大多数应用", "대부분의 응용 프로그램에 적합한 표준 크기"),
    },
    {
      size: '2"',
      sizeMm: "50.8mm",
      price: { usd: 500, cny: 3500 },
      description: t("Large format for high-power systems", "大尺寸，适合高功率系统", "고출력 시스템용 대형 포맷"),
    },
    {
      size: '4"',
      sizeMm: "101.6mm",
      price: { usd: 600, cny: 4200 },
      description: t("Extra large for industrial applications", "超大尺寸，适合工业应用", "산업용 초대형"),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="container py-16">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500/20 rounded-full text-teal-300 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              {t("Pricing", "定价", "가격")}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {t("Simple, Transparent Pricing", "简单透明的定价", "간단하고 투명한 가격")}
            </h1>
            <p className="text-xl text-slate-300 mb-8">
              {t(
                "Pay only for what you use. No hidden fees, no subscriptions.",
                "按需付费。无隐藏费用，无订阅。",
                "사용한 만큼만 지불하세요. 숨겨진 비용이나 구독이 없습니다."
              )}
            </p>

            {/* Currency Toggle */}
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full p-1">
              <button
                onClick={() => setCurrency("usd")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  currency === "usd"
                    ? "bg-white text-slate-900"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                USD ($)
              </button>
              <button
                onClick={() => setCurrency("cny")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  currency === "cny"
                    ? "bg-white text-slate-900"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                CNY (¥)
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="container py-16">
        {/* Optimization Credits Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-teal-100 text-teal-700 rounded-full text-sm font-medium mb-4">
              <Zap className="w-4 h-4" />
              {t("Optimization Credits", "优化额度", "최적화 크레딧")}
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              {t("GPU-Accelerated Optimization", "GPU加速优化", "GPU 가속 최적화")}
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              {t(
                "Each optimization run uses our powerful GPU servers to compute the optimal phase pattern for your DOE design.",
                "每次优化运行使用我们强大的GPU服务器为您的DOE设计计算最优相位图案。",
                "각 최적화 실행은 강력한 GPU 서버를 사용하여 DOE 설계에 최적의 위상 패턴을 계산합니다."
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {optimizationPlans.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-white rounded-3xl border-2 p-8 transition-all ${
                  plan.popular
                    ? "border-teal-500 shadow-xl shadow-teal-500/10"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-sm font-medium rounded-full">
                    {t("Most Popular", "最受欢迎", "가장 인기")}
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                  <p className="text-slate-500 text-sm">{plan.description}</p>
                </div>

                <div className="text-center mb-6">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-slate-900">
                      {currency === "usd" ? "$" : "¥"}
                      {plan.price[currency]}
                    </span>
                  </div>
                  <p className="text-slate-500 mt-2">
                    {plan.credits} {t("optimization credits", "次优化额度", "회 최적화 크레딧")}
                  </p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3 text-slate-600">
                      <Check className="w-5 h-5 text-teal-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/studio">
                  <Button
                    className={`w-full h-12 text-base ${
                      plan.popular
                        ? "bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-900"
                    }`}
                  >
                    {plan.id === "free" ? plan.cta : t("Try Free First", "先免费试用", "먼저 무료 체험")}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* DOE Fabrication Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-violet-100 text-violet-700 rounded-full text-sm font-medium mb-4">
              <Package className="w-4 h-4" />
              {t("DOE Fabrication", "DOE加工", "DOE 제조")}
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              {t("Professional DOE Manufacturing", "专业DOE制造", "전문 DOE 제조")}
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              {t(
                "Turn your designs into real optical elements. High-precision fabrication with fast turnaround.",
                "将您的设计变为真实的光学元件。高精度加工，快速交付。",
                "디자인을 실제 광학 요소로 변환하세요. 고정밀 제조 및 빠른 납기."
              )}
            </p>
          </div>

          {/* Delivery Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Truck className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-1">
                  {t("Standard Delivery", "标准交付", "표준 배송")}
                </h4>
                <p className="text-slate-500 text-sm">
                  {t("7 business days", "7个工作日", "영업일 기준 7일")}
                </p>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-6 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-1">
                  {t("Rush Delivery", "加急交付", "긴급 배송")}
                </h4>
                <p className="text-slate-500 text-sm">
                  {t("3 business days (+100% fee)", "3个工作日（+100%费用）", "영업일 기준 3일 (+100% 요금)")}
                </p>
              </div>
            </div>
          </div>

          {/* Reference Pricing Table */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden max-w-4xl mx-auto mb-8">
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <h3 className="font-semibold text-slate-700 text-center">
                {t("Reference Pricing", "参考价格", "참고 가격")}
              </h3>
            </div>
            <div className="grid grid-cols-4 gap-4 p-6 bg-slate-50 border-b border-slate-200 font-semibold text-slate-700">
              <div>{t("Size", "尺寸", "크기")}</div>
              <div>{t("Diameter", "直径", "직경")}</div>
              <div>{t("Standard Price", "标准价格", "표준 가격")}</div>
              <div>{t("Rush Price", "加急价格", "긴급 가격")}</div>
            </div>
            {fabricationServices.map((service, index) => (
              <div
                key={service.size}
                className={`grid grid-cols-4 gap-4 p-6 items-center ${
                  index !== fabricationServices.length - 1 ? "border-b border-slate-100" : ""
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <CircleDot className="w-5 h-5 text-violet-500" />
                    <span className="font-semibold text-slate-900">{service.size}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 ml-7">{service.description}</p>
                </div>
                <div className="text-slate-600">{service.sizeMm}</div>
                <div className="font-semibold text-slate-900">
                  {currency === "usd" ? "$" : "¥"}
                  {service.price[currency]}
                </div>
                <div>
                  <span className="font-semibold text-amber-600">
                    {currency === "usd" ? "$" : "¥"}
                    {service.price[currency] * 2}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Contact for Orders */}
          <div className="text-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white h-14 px-8 text-lg gap-2"
              onClick={() => window.location.href = 'mailto:contact@doestudio.com?subject=DOE Fabrication Inquiry'}
            >
              <Mail className="w-5 h-5" />
              {t("Contact for Orders", "联系订购", "주문 문의")}
            </Button>
          </div>

          {/* Fabrication Note */}
          <div className="max-w-4xl mx-auto mt-6">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-medium mb-1">{t("Important Notes", "重要说明", "중요 사항")}</p>
                <ul className="list-disc list-inside space-y-1 text-amber-700">
                  <li>{t("Prices are per unit and include standard shipping", "价格为单件价格，包含标准运费", "가격은 단위당이며 표준 배송이 포함됩니다")}</li>
                  <li>{t("Rush delivery adds 100% to the base price", "加急交付在基础价格上加收100%", "긴급 배송은 기본 가격에 100%가 추가됩니다")}</li>
                  <li>{t("Custom sizes and bulk orders available upon request", "可根据需求提供定制尺寸和批量订单", "맞춤 크기 및 대량 주문은 요청 시 가능합니다")}</li>
                  <li>{t("Online payment coming soon", "在线支付即将推出", "온라인 결제 곧 출시 예정")}</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">
              {t("Ready to Start Designing?", "准备开始设计？", "디자인을 시작할 준비가 되셨나요?")}
            </h2>
            <p className="text-slate-300 mb-8 max-w-xl mx-auto">
              {t(
                "Sign up now and get 10 free optimization credits to try DOE Studio.",
                "立即注册，获得10次免费优化额度体验DOE Studio。",
                "지금 가입하고 DOE Studio를 체험할 수 있는 10회 무료 최적화 크레딧을 받으세요."
              )}
            </p>
            <Link href="/studio">
              <Button size="lg" className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white h-14 px-8 text-lg gap-2">
                {t("Go to Studio", "进入工作室", "스튜디오로 이동")}
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </section>
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
              © 2024 DOE Studio. {t("All rights reserved.", "保留所有权利。", "모든 권리 보유.")}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
