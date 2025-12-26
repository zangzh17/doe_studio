/**
 * DesignsSidebar Component
 * Neo-Industrial Design: Clean sidebar with design list
 * - Header with title and add button
 * - Filter dropdown
 * - Design items list with selection state
 */

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { Link } from "wouter";

export interface Design {
  id: string;
  name: string;
  updatedAt: string;
  surfaceCount: number;
  status: "draft" | "published";
}

interface DesignsSidebarProps {
  designs: Design[];
  selectedId?: string;
  onNewDesign?: () => void;
}

export default function DesignsSidebar({
  designs,
  selectedId,
  onNewDesign,
}: DesignsSidebarProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <aside className="w-[220px] border-r border-border bg-white flex flex-col h-full">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <h2 className="font-semibold text-foreground">Designs</h2>
        <Button
          size="icon"
          variant="default"
          className="h-8 w-8 rounded-lg bg-foreground hover:bg-foreground/90"
          onClick={onNewDesign}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Filter */}
      <div className="px-4 pb-3">
        <Select defaultValue="all">
          <SelectTrigger className="w-full h-9 text-sm bg-white">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All ({designs.length})</SelectItem>
            <SelectItem value="draft">Drafts</SelectItem>
            <SelectItem value="published">Published</SelectItem>
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
                className={`p-3 rounded-lg mb-1 cursor-pointer transition-all ${
                  isSelected
                    ? "bg-gray-100 border border-gray-200"
                    : "hover:bg-gray-50 border border-transparent"
                }`}
              >
                <div className="font-medium text-sm text-foreground truncate">
                  {design.name}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {formatDate(design.updatedAt)}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="text-xs text-muted-foreground">
          {designs.length} design{designs.length !== 1 ? "s" : ""}
        </div>
      </div>
    </aside>
  );
}
