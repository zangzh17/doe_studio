/**
 * Login Page - OAuth Login Options
 * Provides Google and WeChat OAuth login buttons
 */

import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "wouter";

// Simple SVG icons for OAuth providers
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function WeChatIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="#07C160">
      <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.49.49 0 0 1 .176-.553c1.527-1.123 2.49-2.782 2.49-4.618 0-3.37-3.064-6.126-7.048-6.126zm-2.925 2.939c.533 0 .969.44.969.98a.975.975 0 0 1-.969.983.976.976 0 0 1-.969-.982c0-.54.435-.981.97-.981zm4.846 0c.535 0 .969.44.969.98a.975.975 0 0 1-.969.983.976.976 0 0 1-.969-.982c0-.54.436-.981.97-.981z"/>
    </svg>
  );
}

export default function Login() {
  const { isAuthenticated, loading } = useAuth();
  const { t, language } = useLanguage();
  const [, setLocation] = useLocation();

  // Redirect to studio if already authenticated
  useEffect(() => {
    if (isAuthenticated && !loading) {
      setLocation("/studio");
    }
  }, [isAuthenticated, loading, setLocation]);

  const handleGoogleLogin = () => {
    window.location.href = "/api/auth/google";
  };

  const handleWeChatLogin = () => {
    window.location.href = "/api/auth/wechat";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="w-full max-w-md mx-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {language === "en" ? "Sign in to DOE Studio" : "登录 DOE Studio"}
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              {language === "en"
                ? "Choose your preferred login method"
                : "选择您的登录方式"}
            </p>
          </div>

          {/* OAuth Buttons */}
          <div className="space-y-4">
            <Button
              onClick={handleGoogleLogin}
              variant="outline"
              className="w-full h-12 text-base font-medium gap-3 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              <GoogleIcon className="h-5 w-5" />
              {language === "en" ? "Continue with Google" : "使用 Google 登录"}
            </Button>

            <Button
              onClick={handleWeChatLogin}
              variant="outline"
              className="w-full h-12 text-base font-medium gap-3 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              <WeChatIcon className="h-5 w-5" />
              {language === "en" ? "Continue with WeChat" : "使用微信登录"}
            </Button>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-700" />
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            {language === "en"
              ? "By signing in, you agree to our Terms of Service and Privacy Policy"
              : "登录即表示您同意我们的服务条款和隐私政策"}
          </p>
        </div>
      </div>
    </div>
  );
}
