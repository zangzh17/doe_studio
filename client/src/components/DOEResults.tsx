/**
 * DOEResults Component
 * DOE Design Tool: Results display panel
 * - Preview summary with warnings
 * - Optimization results: phase map, intensity distribution, energy heatmap, bar chart, efficiency stats
 * - Checkbox controls for showing/hiding different visualizations
 */

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useLanguage } from "@/contexts/LanguageContext";
import { AlertTriangle, ChevronDown, ChevronRight, FileImage, BarChart3, Grid3X3, Info, Box } from "lucide-react";
import { useState } from "react";
import Plot from "react-plotly.js";

export interface PreviewData {
  isValid: boolean;
  summary: {
    totalSpots: number;
    pixelPitch: string;
    diffractionAngle: string;  // Max diffraction half-angle
    fullAngle: string;  // Full angle (2x half-angle)
    estimatedEfficiency: string;
    computationTime: string;
    equivalentFullAngle?: string;  // Calculated from target size + working distance
    actualTolerance?: string;  // Actual tolerance in angle or size units
    effectivePixels?: number;  // For custom pattern mode
    maxSplits?: number;  // For 1D splitter mode
    maxArraySize?: number;  // For 2D spot projector mode
    doeMode?: string;  // Current DOE mode for conditional display
  };
  warnings: string[];
}

export interface OptimizationResult {
  phaseMap: number[][];  // 2D array for grayscale phase map
  targetIntensity: number[][];
  actualIntensity: number[][];
  orderEnergies: { order: string; energy: number }[];
  efficiency: {
    totalEfficiency: number;
    uniformityError: number;
    zerothOrderLeakage: number;
  };
}

interface DOEResultsProps {
  previewData: PreviewData | null;
  optimizationResult: OptimizationResult | null;
  isOptimizing?: boolean;
}

export default function DOEResults({
  previewData,
  optimizationResult,
  isOptimizing = false,
}: DOEResultsProps) {
  const { t, language } = useLanguage();
  const [summaryOpen, setSummaryOpen] = useState(true);
  const [resultsOpen, setResultsOpen] = useState(true);
  
  // Visibility toggles
  const [showPhaseMap, setShowPhaseMap] = useState(true);
  const [showTargetIntensity, setShowTargetIntensity] = useState(true);
  const [showEnergyHeatmap, setShowEnergyHeatmap] = useState(true);
  const [showEnergyBar, setShowEnergyBar] = useState(true);
  const [showEfficiencyStats, setShowEfficiencyStats] = useState(true);
  const [show3DView, setShow3DView] = useState(false);

  return (
    <div className="space-y-4">
      {/* Preview Summary Section */}
      {previewData && (
        <Collapsible open={summaryOpen} onOpenChange={setSummaryOpen}>
          <CollapsibleTrigger className="w-full p-3 flex items-center gap-2 hover:bg-gray-50 transition-colors rounded-lg border border-border bg-white">
            {summaryOpen ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
            <Info className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">{t("results.previewSummary")}</span>
            {previewData.warnings.length > 0 && (
              <span className="ml-auto flex items-center gap-1 text-amber-600 text-xs">
                <AlertTriangle className="w-3.5 h-3.5" />
                {previewData.warnings.length} {language === "en" ? "warning" : "警告"}{previewData.warnings.length > 1 && language === "en" ? "s" : ""}
              </span>
            )}
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="p-4 space-y-4 border border-t-0 border-border rounded-b-lg bg-white">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs text-muted-foreground">{t("results.totalSpots")}</div>
                  <div className="text-lg font-semibold font-mono">{previewData.summary.totalSpots.toLocaleString()}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs text-muted-foreground">{t("results.pixelPitch")}</div>
                  <div className="text-lg font-semibold font-mono">{previewData.summary.pixelPitch}</div>
                </div>
                
                {/* Max Half-Angle and Full Angle combined */}
                <div className="p-3 bg-gray-50 rounded-lg col-span-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-xs text-muted-foreground">
                        {language === "en" ? "Max Half-Angle" : language === "zh" ? "最大半角" : "최대 반각"}
                      </div>
                      <div className="text-lg font-semibold font-mono">{previewData.summary.diffractionAngle}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">
                        {language === "en" ? "Full Angle" : language === "zh" ? "全角" : "전체 각도"}
                      </div>
                      <div className="text-lg font-semibold font-mono">{previewData.summary.fullAngle}</div>
                    </div>
                  </div>
                  {/* Equivalent Full Angle - shown when target size is used */}
                  {previewData.summary.equivalentFullAngle && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <div className="text-xs text-indigo-600">
                        {language === "en" ? "Equivalent (from size)" : language === "zh" ? "等效角度（由尺寸计算）" : "등가 각도 (크기에서)"}
                      </div>
                      <div className="text-sm font-semibold font-mono text-indigo-700">
                        {previewData.summary.equivalentFullAngle}
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs text-muted-foreground">{t("results.estEfficiency")}</div>
                  <div className="text-lg font-semibold font-mono">{previewData.summary.estimatedEfficiency}</div>
                </div>
                
                {/* Actual Tolerance */}
                {previewData.summary.actualTolerance && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-muted-foreground">
                      {language === "en" ? "Actual Tolerance" : language === "zh" ? "实际容差" : "실제 허용 오차"}
                    </div>
                    <div className="text-lg font-semibold font-mono">{previewData.summary.actualTolerance}</div>
                  </div>
                )}
                
                {/* Mode-specific info */}
                {previewData.summary.effectivePixels && (
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <div className="text-xs text-purple-600">
                      {language === "en" ? "Effective Pixels" : language === "zh" ? "目标面有效像素" : "유효 픽셀"}
                    </div>
                    <div className="text-lg font-semibold font-mono text-purple-700">
                      {previewData.summary.effectivePixels.toLocaleString()}
                    </div>
                  </div>
                )}
                
                {previewData.summary.maxSplits && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="text-xs text-blue-600">
                      {language === "en" ? "Max Splits" : language === "zh" ? "最大分束数" : "최대 분할 수"}
                    </div>
                    <div className="text-lg font-semibold font-mono text-blue-700">
                      {previewData.summary.maxSplits}
                    </div>
                  </div>
                )}
                
                {previewData.summary.maxArraySize && (
                  <div className="p-3 bg-teal-50 rounded-lg">
                    <div className="text-xs text-teal-600">
                      {language === "en" ? "Max Array Size" : language === "zh" ? "最大阵列规模" : "최대 배열 크기"}
                    </div>
                    <div className="text-lg font-semibold font-mono text-teal-700">
                      {previewData.summary.maxArraySize}×{previewData.summary.maxArraySize}
                    </div>
                  </div>
                )}
                
                <div className="p-3 bg-gray-50 rounded-lg col-span-2">
                  <div className="text-xs text-muted-foreground">{t("results.compTime")}</div>
                  <div className="text-lg font-semibold font-mono">{previewData.summary.computationTime}</div>
                </div>
              </div>

              {/* Warnings */}
              {previewData.warnings.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">{t("results.warnings")}</div>
                  {previewData.warnings.map((warning, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800"
                    >
                      <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{warning}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Schematic */}
              <div className="border border-dashed border-border rounded-lg p-4 bg-gray-50">
                <div className="aspect-video flex items-center justify-center">
                  <svg viewBox="0 0 200 120" className="w-full h-full max-w-xs">
                    {/* DOE element */}
                    <rect x="30" y="30" width="10" height="60" fill="#3b82f6" opacity="0.3" stroke="#3b82f6" strokeWidth="1" />
                    <text x="35" y="105" fontSize="8" textAnchor="middle" fill="#6b7280">DOE</text>
                    
                    {/* Rays spreading out */}
                    <g stroke="#ef4444" strokeWidth="0.5" opacity="0.6">
                      <line x1="40" y1="40" x2="170" y2="20" />
                      <line x1="40" y1="50" x2="170" y2="40" />
                      <line x1="40" y1="60" x2="170" y2="60" />
                      <line x1="40" y1="70" x2="170" y2="80" />
                      <line x1="40" y1="80" x2="170" y2="100" />
                    </g>
                    
                    {/* Target plane */}
                    <line x1="170" y1="15" x2="170" y2="105" stroke="#6b7280" strokeWidth="1" strokeDasharray="3 2" />
                    <text x="175" y="60" fontSize="8" fill="#6b7280">{language === "en" ? "Target" : "目标"}</text>
                    
                    {/* Spot array indication */}
                    <g fill="#ef4444">
                      <circle cx="170" cy="20" r="2" />
                      <circle cx="170" cy="40" r="2" />
                      <circle cx="170" cy="60" r="2" />
                      <circle cx="170" cy="80" r="2" />
                      <circle cx="170" cy="100" r="2" />
                    </g>
                  </svg>
                </div>
                <p className="text-xs text-center text-muted-foreground mt-2">
                  {t("results.schematic")}
                </p>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Optimization Results Section */}
      {(optimizationResult || isOptimizing) && (
        <Collapsible open={resultsOpen} onOpenChange={setResultsOpen}>
          <CollapsibleTrigger className="w-full p-3 flex items-center gap-2 hover:bg-gray-50 transition-colors rounded-lg border border-border bg-white">
            {resultsOpen ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">{t("results.optimization")}</span>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="p-4 space-y-4 border border-t-0 border-border rounded-b-lg bg-white">
              {isOptimizing ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-10 h-10 border-4 border-foreground/20 border-t-foreground rounded-full animate-spin mb-4" />
                  <p className="text-sm text-muted-foreground">
                    {language === "en" ? "Optimizing DOE pattern..." : "正在优化DOE图案..."}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {language === "en" ? "This may take a few moments" : "这可能需要一些时间"}
                  </p>
                </div>
              ) : optimizationResult ? (
                <>
                  {/* Visibility Controls */}
                  <div className="flex flex-wrap gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="show-phase" checked={showPhaseMap} onCheckedChange={(c) => setShowPhaseMap(!!c)} />
                      <Label htmlFor="show-phase" className="text-xs cursor-pointer">{t("results.phaseMap")}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="show-target" checked={showTargetIntensity} onCheckedChange={(c) => setShowTargetIntensity(!!c)} />
                      <Label htmlFor="show-target" className="text-xs cursor-pointer">{t("results.targetIntensity")}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="show-heatmap" checked={showEnergyHeatmap} onCheckedChange={(c) => setShowEnergyHeatmap(!!c)} />
                      <Label htmlFor="show-heatmap" className="text-xs cursor-pointer">{t("results.energyHeatmap")}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="show-bar" checked={showEnergyBar} onCheckedChange={(c) => setShowEnergyBar(!!c)} />
                      <Label htmlFor="show-bar" className="text-xs cursor-pointer">{t("results.energyBar")}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="show-stats" checked={showEfficiencyStats} onCheckedChange={(c) => setShowEfficiencyStats(!!c)} />
                      <Label htmlFor="show-stats" className="text-xs cursor-pointer">{t("results.efficiencyStats")}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="show-3d" checked={show3DView} onCheckedChange={(c) => setShow3DView(!!c)} />
                      <Label htmlFor="show-3d" className="text-xs cursor-pointer">{t("results.3dView")}</Label>
                    </div>
                  </div>

                  {/* Phase Map */}
                  {showPhaseMap && (
                    <div className="border border-border rounded-lg overflow-hidden">
                      <div className="p-3 bg-gray-50 border-b border-border flex items-center gap-2">
                        <FileImage className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{t("results.phaseMap")} (8-bit)</span>
                      </div>
                      <div className="p-4">
                        <Plot
                          data={[
                            {
                              z: optimizationResult.phaseMap,
                              type: "heatmap",
                              colorscale: "Greys",
                              showscale: true,
                              colorbar: {
                                title: { text: language === "en" ? "Phase" : "相位", side: "right" },
                              }
                            },
                          ]}
                          layout={{
                            width: undefined,
                            height: 300,
                            margin: { l: 50, r: 50, t: 20, b: 50 },
                            xaxis: { title: { text: language === "en" ? "X (pixels)" : "X（像素）" } },
                            yaxis: { title: { text: language === "en" ? "Y (pixels)" : "Y（像素）" }, scaleanchor: "x" },
                          }}
                          config={{ responsive: true, displayModeBar: false }}
                          className="w-full"
                        />
                      </div>
                    </div>
                  )}

                  {/* Target Intensity */}
                  {showTargetIntensity && (
                    <div className="border border-border rounded-lg overflow-hidden">
                      <div className="p-3 bg-gray-50 border-b border-border flex items-center gap-2">
                        <Grid3X3 className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{t("results.targetIntensity")}</span>
                      </div>
                      <div className="p-4">
                        <Plot
                          data={[
                            {
                              z: optimizationResult.actualIntensity,
                              type: "heatmap",
                              colorscale: "Hot",
                              showscale: true,
                              colorbar: {
                                title: { text: language === "en" ? "Intensity" : "光强", side: "right" },
                              }
                            },
                          ]}
                          layout={{
                            width: undefined,
                            height: 300,
                            margin: { l: 50, r: 50, t: 20, b: 50 },
                            xaxis: { title: { text: "X" } },
                            yaxis: { title: { text: "Y" }, scaleanchor: "x" },
                          }}
                          config={{ responsive: true, displayModeBar: false }}
                          className="w-full"
                        />
                      </div>
                    </div>
                  )}

                  {/* Energy Heatmap by Order */}
                  {showEnergyHeatmap && (
                    <div className="border border-border rounded-lg overflow-hidden">
                      <div className="p-3 bg-gray-50 border-b border-border flex items-center gap-2">
                        <Grid3X3 className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{t("results.energyHeatmap")}</span>
                      </div>
                      <div className="p-4">
                        <Plot
                          data={[
                            {
                              z: optimizationResult.targetIntensity,
                              type: "heatmap",
                              colorscale: "Viridis",
                              showscale: true,
                            },
                          ]}
                          layout={{
                            width: undefined,
                            height: 250,
                            margin: { l: 50, r: 50, t: 20, b: 50 },
                            xaxis: { title: { text: language === "en" ? "Order X" : "级次 X" } },
                            yaxis: { title: { text: language === "en" ? "Order Y" : "级次 Y" }, scaleanchor: "x" },
                          }}
                          config={{ responsive: true, displayModeBar: false }}
                          className="w-full"
                        />
                      </div>
                    </div>
                  )}

                  {/* Energy Bar Chart */}
                  {showEnergyBar && (
                    <div className="border border-border rounded-lg overflow-hidden">
                      <div className="p-3 bg-gray-50 border-b border-border flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{t("results.energyBar")}</span>
                      </div>
                      <div className="p-4">
                        <Plot
                          data={[
                            {
                              x: optimizationResult.orderEnergies.map((d) => d.order),
                              y: optimizationResult.orderEnergies.map((d) => d.energy),
                              type: "bar",
                              marker: { color: "#3b82f6" },
                            },
                          ]}
                          layout={{
                            width: undefined,
                            height: 200,
                            margin: { l: 50, r: 20, t: 20, b: 50 },
                            xaxis: { title: { text: language === "en" ? "Diffraction Order" : "衍射级次" } },
                            yaxis: { title: { text: language === "en" ? "Relative Energy" : "相对能量" } },
                          }}
                          config={{ responsive: true, displayModeBar: false }}
                          className="w-full"
                        />
                      </div>
                    </div>
                  )}

                  {/* Efficiency Stats */}
                  {showEfficiencyStats && (
                    <div className="border border-border rounded-lg overflow-hidden">
                      <div className="p-3 bg-gray-50 border-b border-border flex items-center gap-2">
                        <Info className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{t("results.efficiencyStats")}</span>
                      </div>
                      <div className="p-4 grid grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-700 font-mono">
                            {(optimizationResult.efficiency.totalEfficiency * 100).toFixed(1)}%
                          </div>
                          <div className="text-xs text-green-600 mt-1">{t("results.totalEfficiency")}</div>
                        </div>
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-700 font-mono">
                            {(optimizationResult.efficiency.uniformityError * 100).toFixed(2)}%
                          </div>
                          <div className="text-xs text-blue-600 mt-1">{t("results.uniformityError")}</div>
                        </div>
                        <div className="text-center p-3 bg-amber-50 rounded-lg">
                          <div className="text-2xl font-bold text-amber-700 font-mono">
                            {(optimizationResult.efficiency.zerothOrderLeakage * 100).toFixed(2)}%
                          </div>
                          <div className="text-xs text-amber-600 mt-1">{t("results.zerothOrder")}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 3D View Placeholder */}
                  {show3DView && (
                    <div className="border border-border rounded-lg overflow-hidden">
                      <div className="p-3 bg-gray-50 border-b border-border flex items-center gap-2">
                        <Box className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{t("results.3dView")}</span>
                      </div>
                      <div className="p-4 h-64 flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800 rounded">
                        <div className="text-center text-white/70">
                          <Box className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p className="text-sm">{language === "en" ? "3D Interactive View" : "3D交互视图"}</p>
                          <p className="text-xs mt-1 opacity-70">
                            {language === "en" ? "Three.js visualization coming soon" : "Three.js可视化即将推出"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : null}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Empty State */}
      {!previewData && !optimizationResult && !isOptimizing && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <BarChart3 className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">{t("results.noResults")}</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            {t("results.noResultsHint")}
          </p>
        </div>
      )}
    </div>
  );
}
