/**
 * DesignCard Component
 * Neo-Industrial Design: Clean card for design list display
 * - Title, surface count, status badge
 * - Updated date
 * - Hover effect
 */

import { Layers } from "lucide-react";
import { Link } from "wouter";

export interface DesignCardProps {
  id: string;
  name: string;
  surfaceCount: number;
  status: "draft" | "published";
  updatedAt: string;
}

export default function DesignCard({
  id,
  name,
  surfaceCount,
  status,
  updatedAt,
}: DesignCardProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Link href={`/studio/${id}`}>
      <div className="border border-border rounded-lg p-4 bg-background hover:border-foreground/20 hover:shadow-sm transition-all cursor-pointer group">
        <h3 className="font-medium text-foreground group-hover:text-foreground/80 transition-colors">
          {name}
        </h3>
        
        <div className="flex items-center gap-3 mt-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Layers className="w-3.5 h-3.5" />
            <span>{surfaceCount} surfaces</span>
          </div>
          
          <div
            className={`px-2 py-0.5 rounded text-xs font-medium ${
              status === "draft"
                ? "bg-amber-100 text-amber-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {status === "draft" ? "Draft" : "Published"}
          </div>
        </div>
        
        <div className="mt-3 text-xs text-muted-foreground">
          Updated {formatDate(updatedAt)}
        </div>
      </div>
    </Link>
  );
}
