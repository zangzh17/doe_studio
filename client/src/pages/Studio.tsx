/**
 * Studio Page - DOE Design List View
 * Shows all user designs and templates with cards
 */

import { useAuth } from "@/_core/hooks/useAuth";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { Plus, Search, Grid3X3, List, Trash2, Loader2, LayoutTemplate, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";

export default function Studio() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { t, language } = useLanguage();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showNewDesignDialog, setShowNewDesignDialog] = useState(false);
  const [newDesignName, setNewDesignName] = useState("");
  const [newDesignMode, setNewDesignMode] = useState("2d_spot_projector");
  const [deleteDesignId, setDeleteDesignId] = useState<number | null>(null);
  const [showTemplates, setShowTemplates] = useState(true);

  // Mode display names with i18n
  const getModeDisplayName = (mode: string) => {
    const modeMap: Record<string, string> = {
      diffuser: t("mode.diffuser"),
      "1d_splitter": t("mode.1dSplitter"),
      "2d_spot_projector": t("mode.2dSpot"),
      lens: t("mode.lens"),
      prism: t("mode.prism"),
      custom: t("mode.custom"),
    };
    return modeMap[mode] || mode;
  };

  // Fetch designs
  const {
    data: designs = [],
    isLoading: designsLoading,
    refetch: refetchDesigns,
  } = trpc.designs.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Fetch templates
  const { data: templates = [], isLoading: templatesLoading } =
    trpc.templates.list.useQuery();

  // Create design mutation
  const createDesign = trpc.designs.create.useMutation({
    onSuccess: (data) => {
      toast.success(language === "zh" ? "设计已创建" : "Design created");
      refetchDesigns();
      setShowNewDesignDialog(false);
      setNewDesignName("");
      setLocation(`/studio/${data.id}`);
    },
    onError: (error) => {
      toast.error(`${language === "zh" ? "创建失败" : "Failed to create"}: ${error.message}`);
    },
  });

  // Create from template mutation
  const createFromTemplate = trpc.designs.createFromTemplate.useMutation({
    onSuccess: (data) => {
      toast.success(language === "zh" ? "已从模板创建设计" : "Design created from template");
      refetchDesigns();
      setLocation(`/studio/${data.id}`);
    },
    onError: (error) => {
      toast.error(`${language === "zh" ? "创建失败" : "Failed to create"}: ${error.message}`);
    },
  });

  // Delete design mutation
  const deleteDesign = trpc.designs.delete.useMutation({
    onSuccess: () => {
      toast.success(language === "zh" ? "设计已删除" : "Design deleted");
      refetchDesigns();
      setDeleteDesignId(null);
    },
    onError: (error) => {
      toast.error(`${language === "zh" ? "删除失败" : "Failed to delete"}: ${error.message}`);
    },
  });

  const filteredDesigns = designs.filter((design) => {
    const matchesSearch = design.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || design.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleNewDesign = () => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }
    // Generate default name based on current design count
    const defaultName = language === "zh"
      ? `设计 ${designs.length + 1}`
      : `Design ${designs.length + 1}`;
    setNewDesignName(defaultName);
    setShowNewDesignDialog(true);
  };

  const handleCreateDesign = () => {
    if (!newDesignName.trim()) {
      toast.error(language === "zh" ? "请输入设计名称" : "Please enter a design name");
      return;
    }
    createDesign.mutate({
      name: newDesignName.trim(),
      mode: newDesignMode,
    });
  };

  const handleUseTemplate = (templateId: number) => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }
    createFromTemplate.mutate({ templateId });
  };

  const handleDeleteDesign = (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteDesignId(id);
  };

  const confirmDelete = () => {
    if (deleteDesignId) {
      deleteDesign.mutate({ id: deleteDesignId });
    }
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString(language === "zh" ? "zh-CN" : "en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const isLoading = authLoading || designsLoading;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="container py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{t("studio.myDesigns")}</h1>
            <p className="text-slate-500 mt-1">
              {t("studio.myDesignsDesc")}
            </p>
          </div>
          <Button
            onClick={handleNewDesign}
            className="gap-2 bg-gradient-to-r from-teal-500 to-cyan-600 text-white hover:from-teal-600 hover:to-cyan-700 shadow-md shadow-teal-500/20"
          >
            <Plus className="w-4 h-4" />
            {t("studio.newDesign")}
          </Button>
        </div>

        {/* Filters & Search - User Designs Section */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder={t("studio.searchDesigns")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white border-slate-200 focus:border-teal-400 focus:ring-teal-400"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40 bg-white border-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("studio.allDesigns")}</SelectItem>
              <SelectItem value="draft">{t("studio.drafts")}</SelectItem>
              <SelectItem value="optimized">{t("studio.optimized")}</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              className={`h-8 w-8 rounded-lg ${viewMode === "grid" ? "bg-white shadow-sm" : ""}`}
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              className={`h-8 w-8 rounded-lg ${viewMode === "list" ? "bg-white shadow-sm" : ""}`}
              onClick={() => setViewMode("list")}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
          </div>
        )}

        {/* Empty State for User Designs */}
        {!isLoading && filteredDesigns.length === 0 && isAuthenticated && (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-slate-200 mb-8">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mb-4">
              <LayoutTemplate className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {t("studio.noDesigns")}
            </h3>
            <p className="text-slate-500 mb-6 max-w-sm">
              {t("studio.noDesignsHint")}
            </p>
            <Button onClick={handleNewDesign} className="gap-2 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700">
              <Plus className="w-4 h-4" />
              {t("studio.newDesign")}
            </Button>
          </div>
        )}

        {/* Not Logged In State */}
        {!isLoading && !isAuthenticated && (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-slate-200 mb-8">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-100 to-cyan-100 flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-teal-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {language === "zh" ? "登录以查看您的设计" : "Sign in to view your designs"}
            </h3>
            <p className="text-slate-500 mb-6 max-w-sm">
              {language === "zh" ? "登录后可以创建、保存和管理您的DOE设计" : "Sign in to create, save, and manage your DOE designs"}
            </p>
            <Button 
              onClick={() => window.location.href = getLoginUrl()}
              className="gap-2 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700"
            >
              {language === "zh" ? "登录 / 注册" : "Sign In / Sign Up"}
            </Button>
          </div>
        )}

        {/* User Designs Grid */}
        {!isLoading && viewMode === "grid" && filteredDesigns.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
            {filteredDesigns.map((design) => (
              <Link key={design.id} href={`/studio/${design.id}`}>
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl hover:border-teal-300 transition-all duration-300 cursor-pointer group">
                  <div className="aspect-[4/3] bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(20,184,166,0.05),transparent_70%)]" />
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="12" cy="12" r="10" />
                        <circle cx="12" cy="12" r="6" />
                        <circle cx="12" cy="12" r="2" />
                      </svg>
                    </div>
                    {design.status === "optimized" && (
                      <div className="absolute top-3 right-3 px-2.5 py-1 bg-gradient-to-r from-emerald-500 to-green-500 text-white text-xs font-medium rounded-full shadow-md">
                        {t("studio.optimized")}
                      </div>
                    )}
                    {design.status === "draft" && (
                      <div className="absolute top-3 right-3 px-2.5 py-1 bg-slate-500 text-white text-xs font-medium rounded-full">
                        {t("studio.draft")}
                      </div>
                    )}
                    <button
                      onClick={(e) => handleDeleteDesign(design.id, e)}
                      className="absolute bottom-3 right-3 p-2 bg-white/80 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-sm text-slate-900 truncate">
                      {design.name}
                    </h3>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-slate-500">
                        {getModeDisplayName(design.mode)}
                      </span>
                      <span className="text-xs text-slate-400">
                        {formatDate(design.updatedAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* User Designs List */}
        {!isLoading && viewMode === "list" && filteredDesigns.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-8">
            {filteredDesigns.map((design, index) => (
              <Link key={design.id} href={`/studio/${design.id}`}>
                <div
                  className={`flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors cursor-pointer group ${
                    index !== filteredDesigns.length - 1 ? "border-b border-slate-100" : ""
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-teal-500/20">
                    <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="12" cy="12" r="10" />
                      <circle cx="12" cy="12" r="6" />
                      <circle cx="12" cy="12" r="2" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 truncate">
                      {design.name}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {getModeDisplayName(design.mode)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    {design.status === "optimized" ? (
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                        {t("studio.optimized")}
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">
                        {t("studio.draft")}
                      </span>
                    )}
                    <span className="text-sm text-slate-400 hidden sm:block">
                      {formatDate(design.updatedAt)}
                    </span>
                    <button
                      onClick={(e) => handleDeleteDesign(design.id, e)}
                      className="p-2 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Templates Section - At Bottom */}
        {templates.length > 0 && (
          <div className="mt-8 pt-8 border-t border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {t("studio.templates")}
                  </h2>
                  <p className="text-sm text-slate-500">
                    {language === "zh" ? "从预配置模板快速开始" : "Quick start from pre-configured templates"}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTemplates(!showTemplates)}
                className="text-slate-500 hover:text-slate-700 gap-1"
              >
                {showTemplates ? (
                  <>
                    {t("studio.hide")}
                    <ChevronUp className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    {t("studio.show")}
                    <ChevronDown className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
            {showTemplates && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl hover:border-violet-300 transition-all duration-300 cursor-pointer group"
                    onClick={() => handleUseTemplate(template.id)}
                  >
                    <div className="aspect-[4/3] bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.1),transparent_70%)]" />
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center shadow-lg shadow-violet-500/20 group-hover:scale-110 transition-transform duration-300">
                        <LayoutTemplate className="w-7 h-7 text-white" />
                      </div>
                      <div className="absolute top-3 right-3 px-2.5 py-1 bg-gradient-to-r from-violet-500 to-purple-600 text-white text-xs font-medium rounded-full shadow-md">
                        {t("studio.template")}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-sm text-slate-900 truncate">
                        {template.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 truncate">
                        {template.description || getModeDisplayName(template.mode)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* New Design Dialog */}
      <Dialog open={showNewDesignDialog} onOpenChange={setShowNewDesignDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("studio.createNew")}</DialogTitle>
            <DialogDescription>
              {t("studio.createNewDesc")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t("studio.designName")}</Label>
              <Input
                id="name"
                placeholder={t("studio.designNamePlaceholder")}
                value={newDesignName}
                onChange={(e) => setNewDesignName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mode">{t("studio.doeType")}</Label>
              <Select value={newDesignMode} onValueChange={setNewDesignMode}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="diffuser">{t("mode.diffuser")}</SelectItem>
                  <SelectItem value="1d_splitter">{t("mode.1dSplitter")}</SelectItem>
                  <SelectItem value="2d_spot_projector">{t("mode.2dSpot")}</SelectItem>
                  <SelectItem value="lens">{t("mode.lens")}</SelectItem>
                  <SelectItem value="prism">{t("mode.prism")}</SelectItem>
                  <SelectItem value="custom">{t("mode.custom")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDesignDialog(false)}>
              {t("studio.cancel")}
            </Button>
            <Button
              onClick={handleCreateDesign}
              disabled={createDesign.isPending}
              className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700"
            >
              {createDesign.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {t("studio.create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDesignId !== null} onOpenChange={() => setDeleteDesignId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("studio.deleteDesign")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("studio.deleteConfirm")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("studio.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteDesign.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {t("studio.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
