/**
 * PropertiesPanel Component
 * Neo-Industrial Design: Collapsible properties panel on the right
 * - Quick Preview with spot diagram
 * - Full Analysis button
 * - Optimize button
 * - System settings accordion
 * - Wavelengths accordion
 * - Fields accordion
 */

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { BarChart3, ChevronDown, ChevronRight, Layers, Settings2, Sparkles, X } from "lucide-react";
import { useState } from "react";

interface PropertiesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  systemData?: {
    surfaces: number;
    epd: string;
    rms: string;
    geo: string;
    rays: string;
  };
}

export default function PropertiesPanel({
  isOpen,
  onClose,
  systemData = {
    surfaces: 3,
    epd: "10.00 mm",
    rms: "3704.21 μm",
    geo: "5000.00 μm",
    rays: "347/256",
  },
}: PropertiesPanelProps) {
  const [quickPreviewOpen, setQuickPreviewOpen] = useState(true);
  const [systemOpen, setSystemOpen] = useState(false);
  const [wavelengthsOpen, setWavelengthsOpen] = useState(false);
  const [fieldsOpen, setFieldsOpen] = useState(false);

  if (!isOpen) return null;

  return (
    <aside className="w-[280px] border-l border-border bg-white flex flex-col h-full animate-slide-in-right">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-border">
        <h2 className="font-semibold text-foreground">Properties</h2>
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 hover:bg-gray-100"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Quick Preview Section */}
        <Collapsible open={quickPreviewOpen} onOpenChange={setQuickPreviewOpen}>
          <CollapsibleTrigger className="w-full p-4 flex items-center gap-2 hover:bg-gray-50 transition-colors">
            {quickPreviewOpen ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Quick Preview</span>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-4 pb-4">
              {/* Spot Diagram Preview */}
              <div className="bg-white border border-border rounded-lg p-3 mb-3">
                <div className="aspect-square relative flex items-center justify-center">
                  {/* Y axis label */}
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 text-[9px] text-muted-foreground" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg) translateX(50%)' }}>
                    Y (μm)
                  </div>
                  {/* Spot diagram visualization */}
                  <div className="w-full h-full border border-gray-200 rounded relative overflow-hidden bg-gray-50/50">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      {/* Grid lines */}
                      <line x1="50" y1="0" x2="50" y2="100" stroke="#e5e7eb" strokeWidth="0.5" />
                      <line x1="0" y1="50" x2="100" y2="50" stroke="#e5e7eb" strokeWidth="0.5" />
                      {/* Outer circle */}
                      <circle cx="50" cy="50" r="20" fill="#3b82f6" opacity="0.15" />
                      {/* Middle circle */}
                      <circle cx="50" cy="50" r="12" fill="#3b82f6" opacity="0.25" />
                      {/* Inner circle */}
                      <circle cx="50" cy="50" r="5" fill="#3b82f6" opacity="0.5" />
                      {/* Center point */}
                      <circle cx="50" cy="50" r="2" fill="#3b82f6" />
                      {/* Cross marker */}
                      <line x1="46" y1="50" x2="54" y2="50" stroke="#ec4899" strokeWidth="1.5" />
                      <line x1="50" y1="46" x2="50" y2="54" stroke="#ec4899" strokeWidth="1.5" />
                    </svg>
                  </div>
                  {/* X axis label */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-3 text-[9px] text-muted-foreground">
                    X (μm)
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-muted-foreground">RMS:</span>
                  <span className="font-mono text-foreground">{systemData.rms}</span>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <span className="text-muted-foreground">GEO:</span>
                  <span className="font-mono text-foreground">{systemData.geo}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground ml-4">Rays:</span>
                  <span className="font-mono text-foreground">{systemData.rays}</span>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Action Buttons */}
        <div className="px-4 pb-4 space-y-2">
          <Button variant="outline" className="w-full justify-start gap-2 h-9 text-sm">
            <BarChart3 className="w-4 h-4" />
            Full Analysis
          </Button>
          <Button variant="outline" className="w-full justify-start gap-2 h-9 text-sm">
            <Sparkles className="w-4 h-4" />
            Optimize
          </Button>
        </div>

        {/* System Section */}
        <Collapsible open={systemOpen} onOpenChange={setSystemOpen}>
          <CollapsibleTrigger className="w-full p-4 flex items-center gap-2 hover:bg-gray-50 transition-colors border-t border-border">
            {systemOpen ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
            <Settings2 className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">System</span>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-4 pb-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Surfaces</span>
                <span className="font-mono text-foreground">{systemData.surfaces}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">EPD</span>
                <span className="font-mono text-foreground">{systemData.epd}</span>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Wavelengths Section */}
        <Collapsible open={wavelengthsOpen} onOpenChange={setWavelengthsOpen}>
          <CollapsibleTrigger className="w-full p-4 flex items-center gap-2 hover:bg-gray-50 transition-colors border-t border-border">
            {wavelengthsOpen ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
            <Layers className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Wavelengths</span>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-4 pb-4">
              <div className="text-sm text-muted-foreground">
                Default wavelengths configured
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Fields Section */}
        <Collapsible open={fieldsOpen} onOpenChange={setFieldsOpen}>
          <CollapsibleTrigger className="w-full p-4 flex items-center gap-2 hover:bg-gray-50 transition-colors border-t border-border">
            {fieldsOpen ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
            <Layers className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Fields</span>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-4 pb-4">
              <div className="text-sm text-muted-foreground">
                Field angles and positions
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </aside>
  );
}
