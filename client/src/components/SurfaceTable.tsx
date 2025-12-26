/**
 * SurfaceTable Component
 * Neo-Industrial Design: Precise data table with inline editing
 * - Compact rows with monospace numbers
 * - Inline input fields
 * - Material selector dropdown
 * - Row highlighting for stop surface
 */

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { CircleDot, Plus, Save, Trash2, X } from "lucide-react";

export interface Surface {
  id: string;
  label: string;
  type: string;
  radius: string;
  thickness: string;
  material: string;
  semiDia: string;
  conic: string;
  isStop?: boolean;
}

interface SurfaceTableProps {
  surfaces: Surface[];
  onSurfaceChange?: (id: string, field: keyof Surface, value: string) => void;
  onAddSurface?: () => void;
  onDeleteSurface?: (id: string) => void;
  onSetStop?: (id: string) => void;
  onSave?: () => void;
  onDiscard?: () => void;
}

export default function SurfaceTable({
  surfaces,
  onSurfaceChange,
  onAddSurface,
  onDeleteSurface,
  onSetStop,
  onSave,
  onDiscard,
}: SurfaceTableProps) {
  const materials = [
    { value: "AIR", label: "AIR (1.000)" },
    { value: "BK7", label: "BK7 (1.517)" },
    { value: "SF11", label: "SF11 (1.785)" },
    { value: "LASF9", label: "LASF9 (1.850)" },
    { value: "FK51A", label: "FK51A (1.487)" },
  ];

  return (
    <div className="border border-border rounded-lg bg-background overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-3 border-b border-border bg-white">
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 h-8 text-xs"
          onClick={onAddSurface}
        >
          <Plus className="w-3.5 h-3.5" />
          Add Surface
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 h-8 text-xs"
          onClick={onDeleteSurface ? () => onDeleteSurface("") : undefined}
        >
          <Trash2 className="w-3.5 h-3.5" />
          Delete
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 h-8 text-xs"
          onClick={onSetStop ? () => onSetStop("") : undefined}
        >
          <CircleDot className="w-3.5 h-3.5" />
          Set Stop
        </Button>
        
        <div className="flex-1" />
        
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 h-8 text-xs"
          onClick={onDiscard}
        >
          <X className="w-3.5 h-3.5" />
          Discard
        </Button>
        <Button
          size="sm"
          className="gap-1.5 h-8 text-xs bg-foreground text-background hover:bg-foreground/90"
          onClick={onSave}
        >
          <Save className="w-3.5 h-3.5" />
          Save
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-gray-50/80">
              <th className="text-left font-medium text-muted-foreground px-3 py-2.5 w-16 text-xs">
                #
              </th>
              <th className="text-left font-medium text-muted-foreground px-3 py-2.5 w-24 text-xs">
                Type
              </th>
              <th className="text-left font-medium text-muted-foreground px-3 py-2.5 text-xs">
                <span>Radius</span>
                <span className="text-[10px] text-muted-foreground/70 ml-1">(mm)</span>
              </th>
              <th className="text-left font-medium text-muted-foreground px-3 py-2.5 text-xs">
                <span>Thickness</span>
                <span className="text-[10px] text-muted-foreground/70 ml-1">(mm)</span>
              </th>
              <th className="text-left font-medium text-muted-foreground px-3 py-2.5 w-32 text-xs">
                Material
              </th>
              <th className="text-left font-medium text-muted-foreground px-3 py-2.5 text-xs">
                <span>Semi-Dia</span>
                <span className="text-[10px] text-muted-foreground/70 ml-1">(mm)</span>
              </th>
              <th className="text-left font-medium text-muted-foreground px-3 py-2.5 text-xs">
                Conic
              </th>
            </tr>
          </thead>
          <tbody>
            {surfaces.map((surface) => (
              <tr
                key={surface.id}
                className={`border-b border-border last:border-b-0 hover:bg-gray-50/50 transition-colors ${
                  surface.isStop ? "bg-yellow-50/70" : ""
                }`}
              >
                <td className="px-3 py-2">
                  <div className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-[11px] font-medium ${
                    surface.isStop 
                      ? "bg-yellow-200 text-yellow-800" 
                      : "bg-gray-100 text-gray-600"
                  }`}>
                    {surface.label}
                  </div>
                </td>
                <td className="px-3 py-2">
                  <span className="text-xs text-muted-foreground">
                    {surface.type}
                  </span>
                </td>
                <td className="px-1 py-1">
                  <Input
                    type="text"
                    value={surface.radius}
                    onChange={(e) =>
                      onSurfaceChange?.(surface.id, "radius", e.target.value)
                    }
                    className="h-8 font-mono text-xs border-transparent hover:border-border focus:border-ring bg-transparent px-2"
                  />
                </td>
                <td className="px-1 py-1">
                  <Input
                    type="text"
                    value={surface.thickness}
                    onChange={(e) =>
                      onSurfaceChange?.(surface.id, "thickness", e.target.value)
                    }
                    className="h-8 font-mono text-xs border-transparent hover:border-border focus:border-ring bg-transparent px-2"
                  />
                </td>
                <td className="px-1 py-1">
                  <Select
                    value={surface.material.split(" ")[0]}
                    onValueChange={(value) =>
                      onSurfaceChange?.(surface.id, "material", value)
                    }
                  >
                    <SelectTrigger className="h-8 text-xs border-transparent hover:border-border focus:border-ring bg-transparent">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {materials.map((mat) => (
                        <SelectItem key={mat.value} value={mat.value} className="text-xs">
                          {mat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-1 py-1">
                  <Input
                    type="text"
                    value={surface.semiDia}
                    onChange={(e) =>
                      onSurfaceChange?.(surface.id, "semiDia", e.target.value)
                    }
                    className="h-8 font-mono text-xs border-transparent hover:border-border focus:border-ring bg-transparent px-2"
                  />
                </td>
                <td className="px-1 py-1">
                  <Input
                    type="text"
                    value={surface.conic}
                    onChange={(e) =>
                      onSurfaceChange?.(surface.id, "conic", e.target.value)
                    }
                    className="h-8 font-mono text-xs border-transparent hover:border-border focus:border-ring bg-transparent px-2"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
