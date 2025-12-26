/**
 * CollapsibleSidebar Component
 * DOE Design Tool: Collapsible sidebar for design list
 * - Can be collapsed to save space
 * - Shows design list when expanded
 */

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Link } from "wouter";

export interface Design {
  id: string;
  name: string;
  updatedAt: string;
  mode: string;
  status: "draft" | "optimized";
}

interface CollapsibleSidebarProps {
  designs: Design[];
  selectedId?: string;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onNewDesign?: () => void;
}

export default function CollapsibleSidebar({
  designs,
  selectedId,
  isCollapsed,
  onToggleCollapse,
  onNewDesign,
}: CollapsibleSidebarProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isCollapsed) {
    return (
      <aside className="w-12 border-r border-border bg-white flex flex-col h-full transition-all duration-200">
        <div className="p-2 flex flex-col items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={onToggleCollapse}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="default"
            className="h-8 w-8 rounded-lg bg-foreground hover:bg-foreground/90"
            onClick={onNewDesign}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto px-1 py-2">
          {designs.map((design) => {
            const isSelected = design.id === selectedId;
            return (
              <Link key={design.id} href={`/studio/${design.id}`}>
                <div
                  className={`w-8 h-8 rounded-lg mb-1 flex items-center justify-center text-xs font-medium cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-foreground text-background"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  title={design.name}
                >
                  {design.name.charAt(0).toUpperCase()}
                </div>
              </Link>
            );
          })}
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-[200px] border-r border-border bg-white flex flex-col h-full transition-all duration-200">
      {/* Header */}
      <div className="p-3 flex items-center justify-between border-b border-border">
        <h2 className="font-semibold text-sm text-foreground">Designs</h2>
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="default"
            className="h-7 w-7 rounded-md bg-foreground hover:bg-foreground/90"
            onClick={onNewDesign}
          >
            <Plus className="w-3.5 h-3.5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={onToggleCollapse}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Filter */}
      <div className="px-3 py-2">
        <Select defaultValue="all">
          <SelectTrigger className="w-full h-8 text-xs bg-white">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">All ({designs.length})</SelectItem>
            <SelectItem value="draft" className="text-xs">Drafts</SelectItem>
            <SelectItem value="optimized" className="text-xs">Optimized</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Design List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-2">
        {designs.map((design) => {
          const isSelected = design.id === selectedId;
          return (
            <Link key={design.id} href={`/studio/${design.id}`}>
              <div
                className={`p-2.5 rounded-lg mb-1 cursor-pointer transition-all ${
                  isSelected
                    ? "bg-gray-100 border border-gray-200"
                    : "hover:bg-gray-50 border border-transparent"
                }`}
              >
                <div className="font-medium text-xs text-foreground truncate">
                  {design.name}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-muted-foreground truncate">
                    {design.mode}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                    design.status === "optimized" 
                      ? "bg-green-100 text-green-700" 
                      : "bg-gray-100 text-gray-600"
                  }`}>
                    {design.status}
                  </span>
                </div>
                <div className="text-[10px] text-muted-foreground mt-1">
                  {formatDate(design.updatedAt)}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border">
        <div className="text-[10px] text-muted-foreground">
          {designs.length} design{designs.length !== 1 ? "s" : ""}
        </div>
      </div>
    </aside>
  );
}
