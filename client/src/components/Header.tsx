/**
 * Header Component
 * DOE Design Tool: Clean header with navigation and language switcher
 */

import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/contexts/LanguageContext";
import { getLoginUrl } from "@/const";
import { ChevronDown, LogOut, Settings, User, HelpCircle, Globe, Waves } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function Header() {
  const [location, setLocation] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const navLinks = [
    { href: "/", label: t("nav.home") },
    { href: "/studio", label: t("nav.studio") },
    { href: "/docs", label: t("nav.docs") },
    { href: "/pricing", label: t("nav.pricing") },
  ];

  const handleSignIn = () => {
    window.location.href = getLoginUrl();
  };

  const handleSignOut = async () => {
    await logout();
    window.location.href = "/";
  };

  const cycleLanguage = () => {
    if (language === "en") {
      setLanguage("zh");
    } else if (language === "zh") {
      setLanguage("ko");
    } else {
      setLanguage("en");
    }
  };

  const getLanguageLabel = () => {
    switch (language) {
      case "en": return "EN";
      case "zh": return "中文";
      case "ko": return "한국어";
      default: return "EN";
    }
  };

  const handleHelpClick = () => {
    setLocation("/docs?section=faq");
  };

  return (
    <header className="h-14 border-b border-border bg-background/80 backdrop-blur-md flex items-center justify-between px-4 sticky top-0 z-50">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-md shadow-teal-500/20">
          <Waves className="w-5 h-5 text-white" strokeWidth={2} />
        </div>
        <span className="font-bold text-lg text-foreground hidden sm:inline tracking-tight">
          DOE Studio
        </span>
      </Link>

      {/* Navigation */}
      <nav className="flex items-center gap-0.5">
        {navLinks.map((link) => {
          const isActive = link.href === "/" 
            ? location === "/" 
            : location.startsWith(link.href);
          return (
            <Link key={link.href} href={link.href}>
              <span
                className={`px-3.5 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                {link.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Right Side: Language + Help + Account */}
      <div className="flex items-center gap-1.5">
        {/* Language Switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground hover:text-foreground rounded-lg"
            >
              <Globe className="w-4 h-4" />
              <span className="text-xs font-medium">{getLanguageLabel()}</span>
              <ChevronDown className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32 rounded-xl">
            <DropdownMenuItem 
              className={`rounded-lg ${language === "en" ? "bg-accent" : ""}`}
              onClick={() => setLanguage("en")}
            >
              English
            </DropdownMenuItem>
            <DropdownMenuItem 
              className={`rounded-lg ${language === "zh" ? "bg-accent" : ""}`}
              onClick={() => setLanguage("zh")}
            >
              中文
            </DropdownMenuItem>
            <DropdownMenuItem 
              className={`rounded-lg ${language === "ko" ? "bg-accent" : ""}`}
              onClick={() => setLanguage("ko")}
            >
              한국어
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Help Button - redirects to FAQ */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 rounded-lg"
          onClick={handleHelpClick}
        >
          <HelpCircle className="w-4 h-4 text-muted-foreground" />
        </Button>

        {isAuthenticated ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 rounded-lg">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-sm">
                  <span className="text-xs font-semibold text-white">
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                </div>
                <span className="hidden sm:inline text-sm font-medium">
                  {t("nav.account")}
                </span>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl">
              <DropdownMenuItem className="rounded-lg">
                <User className="w-4 h-4 mr-2" />
                {t("nav.profile")}
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-lg">
                <Settings className="w-4 h-4 mr-2" />
                {t("nav.settings")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive rounded-lg" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                {t("nav.signOut")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleSignIn} className="rounded-lg">
              {t("nav.signIn")}
            </Button>
            <Link href="/studio">
              <Button size="sm" className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white hover:from-teal-600 hover:to-cyan-700 rounded-lg shadow-md shadow-teal-500/20">
                {t("home.startDesigning")}
              </Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
