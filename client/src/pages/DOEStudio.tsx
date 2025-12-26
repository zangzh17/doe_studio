/**
 * DOEStudio Page - DOE Design Editor
 * Layout: Collapsible sidebar + Two-column main area (Parameters 2 : Results 3)
 */

import { useAuth } from "@/_core/hooks/useAuth";
import CollapsibleSidebar from "@/components/CollapsibleSidebar";
import DOEParameters, { DOEParams } from "@/components/DOEParameters";
import DOEResults, { PreviewData, OptimizationResult } from "@/components/DOEResults";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { ChevronLeft, Download, Save, Loader2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { Link, useParams, useLocation } from "wouter";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";

// Default DOE parameters
const defaultParams: DOEParams = {
  workingDistance: "inf",
  workingDistanceUnit: "mm",
  wavelength: "532nm",
  mode: "2d_spot_projector",
  deviceDiameter: "12.7mm",
  deviceShape: "circular",
  arrayRows: "50",
  arrayCols: "50",
  targetType: "angle",
  targetSize: "100mm",
  targetAngle: "30deg",
  tolerance: "1",
  fabricationEnabled: false,
  fabricationRecipe: "",
};

// Generate mock phase map data
function generateMockPhaseMap(size: number): number[][] {
  const data: number[][] = [];
  for (let i = 0; i < size; i++) {
    const row: number[] = [];
    for (let j = 0; j < size; j++) {
      const x = (j - size / 2) / size;
      const y = (i - size / 2) / size;
      const r = Math.sqrt(x * x + y * y);
      const theta = Math.atan2(y, x);
      const phase = (Math.sin(r * 20 + theta * 3) + 1) * 127.5;
      row.push(Math.floor(phase));
    }
    data.push(row);
  }
  return data;
}

// Generate mock intensity distribution
function generateMockIntensity(rows: number, cols: number): number[][] {
  const data: number[][] = [];
  for (let i = 0; i < rows; i++) {
    const row: number[] = [];
    for (let j = 0; j < cols; j++) {
      const base = 1.0;
      const noise = (Math.random() - 0.5) * 0.1;
      row.push(base + noise);
    }
    data.push(row);
  }
  return data;
}

// Generate mock order energies
function generateMockOrderEnergies(count: number): { order: string; energy: number }[] {
  const energies: { order: string; energy: number }[] = [];
  for (let i = -Math.floor(count / 2); i <= Math.floor(count / 2); i++) {
    energies.push({
      order: i.toString(),
      energy: i === 0 ? 0.02 : 0.8 + Math.random() * 0.2,
    });
  }
  return energies;
}

// Parse distance value and convert to mm
function parseDistanceToMm(value: string): number | null {
  if (value.toLowerCase() === "inf") return null;
  
  const match = value.match(/^([\d.]+)\s*(mm|cm|m|in|ft)?$/i);
  if (!match) return null;
  
  const num = parseFloat(match[1]);
  const unit = (match[2] || "mm").toLowerCase();
  
  const conversions: Record<string, number> = {
    mm: 1,
    cm: 10,
    m: 1000,
    in: 25.4,
    ft: 304.8,
  };
  
  return num * (conversions[unit] || 1);
}

// Calculate full angle from target size and working distance
function calculateFullAngle(targetSize: string, workingDistance: string): string | null {
  const distanceMm = parseDistanceToMm(workingDistance);
  if (distanceMm === null) return null;
  
  const sizeMatch = targetSize.match(/^([\d.]+)\s*(mm|cm|m|in|ft)?$/i);
  if (!sizeMatch) return null;
  
  const sizeNum = parseFloat(sizeMatch[1]);
  const sizeUnit = (sizeMatch[2] || "mm").toLowerCase();
  
  const conversions: Record<string, number> = {
    mm: 1,
    cm: 10,
    m: 1000,
    in: 25.4,
    ft: 304.8,
  };
  
  const sizeMm = sizeNum * (conversions[sizeUnit] || 1);
  const halfAngleRad = Math.atan((sizeMm / 2) / distanceMm);
  const fullAngleDeg = (halfAngleRad * 180 / Math.PI) * 2;
  
  return fullAngleDeg.toFixed(2);
}

export default function DOEStudio() {
  const params = useParams<{ id: string }>();
  const designId = params.id ? parseInt(params.id) : null;
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [designName, setDesignName] = useState("Untitled Design");
  // Default collapsed on mobile
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1024;
    }
    return false;
  });
  const [doeParams, setDoeParams] = useState<DOEParams>(defaultParams);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Fetch designs list
  const { data: designs = [], refetch: refetchDesigns } = trpc.designs.list.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  // Fetch current design
  const { data: currentDesign, isLoading: designLoading } = trpc.designs.get.useQuery(
    { id: designId! },
    { enabled: isAuthenticated && designId !== null }
  );

  // Update design mutation
  const updateDesign = trpc.designs.update.useMutation({
    onSuccess: () => {
      toast.success("Design saved");
      setHasUnsavedChanges(false);
      refetchDesigns();
    },
    onError: (error) => {
      toast.error(`Failed to save: ${error.message}`);
    },
  });

  // Create design mutation
  const createDesign = trpc.designs.create.useMutation({
    onSuccess: (data) => {
      toast.success("Design created");
      refetchDesigns();
      setLocation(`/studio/${data.id}`);
    },
    onError: (error) => {
      toast.error(`Failed to create design: ${error.message}`);
    },
  });

  // Load design data when fetched
  useEffect(() => {
    if (currentDesign) {
      setDesignName(currentDesign.name);
      if (currentDesign.parameters) {
        setDoeParams({ ...defaultParams, ...(currentDesign.parameters as DOEParams) });
      }
      if (currentDesign.previewData) {
        setPreviewData(currentDesign.previewData as PreviewData);
      }
      if (currentDesign.optimizationResult) {
        setOptimizationResult(currentDesign.optimizationResult as OptimizationResult);
      }
    }
  }, [currentDesign]);

  // Track changes
  const handleParamsChange = useCallback((newParams: DOEParams) => {
    setDoeParams(newParams);
    setHasUnsavedChanges(true);
  }, []);

  const handlePreview = () => {
    const rows = parseInt(doeParams.arrayRows) || 50;
    const cols = parseInt(doeParams.arrayCols) || 50;
    const totalSpots = rows * cols;
    
    const diameterMatch = doeParams.deviceDiameter.match(/(\d+\.?\d*)/);
    const diameter = diameterMatch ? parseFloat(diameterMatch[1]) : 12.7;
    const pixelPitch = (diameter / 1000 / Math.max(rows, cols)).toFixed(2);
    
    // Calculate angle based on target type
    let angle: number;
    let equivalentFullAngle: string | null = null;
    
    if (doeParams.targetType === "size" && doeParams.workingDistance.toLowerCase() !== "inf") {
      equivalentFullAngle = calculateFullAngle(doeParams.targetSize, doeParams.workingDistance);
      angle = equivalentFullAngle ? parseFloat(equivalentFullAngle) : 30;
    } else {
      const angleMatch = doeParams.targetAngle.match(/(\d+\.?\d*)/);
      angle = angleMatch ? parseFloat(angleMatch[1]) : 30;
    }
    
    const warnings: string[] = [];
    if (angle > 45) {
      warnings.push("Large diffraction angle (>45°) may result in reduced efficiency and increased aberrations.");
    }
    if (parseFloat(doeParams.tolerance) < 0.5) {
      warnings.push("Very tight tolerance (<0.5%) may require significantly longer optimization time.");
    }
    if (totalSpots > 10000) {
      warnings.push("Large array size may require extended computation time for optimization.");
    }

    // Calculate actual tolerance based on mode
    const wavelengthMatch = doeParams.wavelength.match(/(\d+\.?\d*)/);
    const wavelengthNm = wavelengthMatch ? parseFloat(wavelengthMatch[1]) : 532;
    const tolerancePercent = parseFloat(doeParams.tolerance) || 1;
    
    const halfAngleRad = (angle * Math.PI) / 180;
    const minToleranceAngle = (wavelengthNm / 1e6) / (diameter / 1000) / Math.cos(halfAngleRad) / halfAngleRad;
    const minToleranceAngleDeg = (minToleranceAngle * 180) / Math.PI;
    const actualToleranceAngle = (tolerancePercent / 100) * angle;
    
    // Calculate mode-specific metrics
    let effectivePixels: number | undefined;
    let maxSplits: number | undefined;
    let maxArraySize: number | undefined;
    
    const maxPixelCount = 3000;
    if (doeParams.mode === "custom") {
      effectivePixels = Math.floor(angle / minToleranceAngleDeg);
    } else if (doeParams.mode === "1d_splitter") {
      maxSplits = Math.floor(angle / minToleranceAngleDeg);
    } else if (doeParams.mode === "2d_spot_projector") {
      maxArraySize = Math.floor(Math.sqrt(angle / minToleranceAngleDeg));
    }

    const newPreviewData: PreviewData = {
      isValid: true,
      summary: {
        totalSpots,
        pixelPitch: `${pixelPitch} mm`,
        diffractionAngle: `${angle.toFixed(2)}°`,
        fullAngle: `${(angle * 2).toFixed(2)}°`,
        estimatedEfficiency: "~75-85%",
        computationTime: totalSpots > 5000 ? "~5-10 min" : "~1-3 min",
        equivalentFullAngle: equivalentFullAngle ? `${equivalentFullAngle}°` : undefined,
        actualTolerance: `${actualToleranceAngle.toFixed(3)}°`,
        effectivePixels,
        maxSplits,
        maxArraySize,
        doeMode: doeParams.mode,
      },
      warnings,
    };

    setPreviewData(newPreviewData);
    setHasUnsavedChanges(true);
    toast.success("Preview generated");
  };

  const handleOptimize = () => {
    // Auto-run preview if not done yet
    if (!previewData) {
      handlePreview();
      toast.info("Running preview first...");
      // Delay optimization to allow preview to complete
      setTimeout(() => {
        runOptimization();
      }, 500);
      return;
    }
    runOptimization();
  };

  const runOptimization = () => {
    setIsOptimizing(true);
    
    setTimeout(() => {
      const rows = parseInt(doeParams.arrayRows) || 50;
      const cols = parseInt(doeParams.arrayCols) || 50;
      
      const newResult: OptimizationResult = {
        phaseMap: generateMockPhaseMap(256),
        targetIntensity: generateMockIntensity(rows, cols),
        actualIntensity: generateMockIntensity(rows, cols),
        orderEnergies: generateMockOrderEnergies(11),
        efficiency: {
          totalEfficiency: 0.78 + Math.random() * 0.1,
          uniformityError: 0.02 + Math.random() * 0.03,
          zerothOrderLeakage: 0.01 + Math.random() * 0.02,
        },
      };
      
      setOptimizationResult(newResult);
      setIsOptimizing(false);
      setHasUnsavedChanges(true);
      toast.success("Optimization complete!");
    }, 2500);
  };

  const handleSave = () => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }

    if (designId) {
      updateDesign.mutate({
        id: designId,
        name: designName,
        parameters: doeParams,
        previewData: previewData || undefined,
        optimizationResult: optimizationResult || undefined,
        status: optimizationResult ? "optimized" : "draft",
      });
    }
  };

  const handleExport = () => {
    toast.success("Export started - Phase map will be downloaded");
  };

  const handleNewDesign = () => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }
    createDesign.mutate({
      name: "Untitled Design",
      mode: "2d_spot_projector",
    });
  };

  // Convert designs to sidebar format
  const sidebarDesigns = designs.map((d) => ({
    id: d.id.toString(),
    name: d.name,
    updatedAt: new Date(d.updatedAt).toISOString().split("T")[0],
    mode: d.mode,
    status: d.status as "draft" | "optimized",
  }));

  const isLoading = authLoading || designLoading;

  return (
    <div className="min-h-screen h-screen flex flex-col bg-gray-50">
      <Header />

      <div className="flex-1 flex overflow-hidden">
        {/* Collapsible Sidebar */}
        <CollapsibleSidebar
          designs={sidebarDesigns}
          selectedId={designId?.toString()}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          onNewDesign={handleNewDesign}
        />

        {/* Main Editor Area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Editor Header */}
          <div className="h-12 border-b border-border flex items-center justify-between px-4 bg-white">
            <div className="flex items-center gap-2">
              <Link href="/studio">
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              </Link>
              <Input
                value={designName}
                onChange={(e) => {
                  setDesignName(e.target.value);
                  setHasUnsavedChanges(true);
                }}
                className="h-8 w-48 font-medium border-transparent hover:border-border focus:border-ring bg-transparent text-sm"
              />
              {hasUnsavedChanges && (
                <span className="text-xs text-muted-foreground">• Unsaved</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 h-8 text-xs"
                onClick={handleSave}
                disabled={updateDesign.isPending || !isAuthenticated}
              >
                {updateDesign.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                Save
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 h-8 text-xs"
                onClick={handleExport}
                disabled={!optimizationResult}
              >
                <Download className="w-3.5 h-3.5" />
                Export
              </Button>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Two-Column Content - Responsive */}
          {!isLoading && (
            <div className="flex-1 flex flex-col lg:flex-row overflow-auto lg:overflow-hidden">
              {/* Left Column: Parameters (2/5 = 40%) */}
              <div className="w-full lg:w-2/5 border-b lg:border-b-0 lg:border-r border-border lg:overflow-y-auto p-4 bg-gray-50 shrink-0">
                <div className="max-w-lg mx-auto pb-4 lg:pb-8">
                  <h2 className="text-lg font-semibold mb-4">DOE Parameters</h2>
                  <DOEParameters
                    params={doeParams}
                    onParamsChange={handleParamsChange}
                    onPreview={handlePreview}
                    onOptimize={handleOptimize}
                    isOptimizing={isOptimizing}
                  />
                </div>
              </div>

              {/* Right Column: Results (3/5 = 60%) */}
              <div className="w-full lg:w-3/5 lg:overflow-y-auto p-4 bg-white shrink-0 min-h-[50vh] lg:min-h-0">
                <div className="max-w-2xl mx-auto pb-8">
                  <h2 className="text-lg font-semibold mb-4">Results</h2>
                  <DOEResults
                    previewData={previewData}
                    optimizationResult={optimizationResult}
                    isOptimizing={isOptimizing}
                  />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
