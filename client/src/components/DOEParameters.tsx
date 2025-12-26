/**
 * DOEParameters Component
 * DOE Design Tool: Parameter input panel for diffractive optical elements
 * - Basic parameters: working distance, wavelength, mode, device size/shape
 * - Advanced parameters: mode-specific inputs for all DOE types
 * - Fabrication simulator
 * - Preview button
 */

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useLanguage } from "@/contexts/LanguageContext";
import { ChevronDown, ChevronRight, Eye, Sparkles, Settings2, Layers, Factory, Info, Upload, X } from "lucide-react";
import { useState, useEffect, useMemo, useRef } from "react";

// DOE mode types
export type DOEMode = 
  | "diffuser" 
  | "1d_splitter" 
  | "2d_spot_projector" 
  | "lens" 
  | "lens_array"
  | "prism" 
  | "custom";

export interface DOEParams {
  // Basic parameters
  workingDistance: string;
  workingDistanceUnit: string;
  wavelength: string;
  mode: DOEMode;
  deviceDiameter: string;
  deviceShape: "circular" | "square";
  
  // 2D Spot Projector specific
  arrayRows: string;
  arrayCols: string;
  targetType: "size" | "angle";
  targetSize: string;
  targetAngle: string;
  tolerance: string;
  
  // Diffuser specific
  diffuserShape?: "circular" | "square";
  diffuserAngle?: string;
  diffuserSize?: string;
  diffuserTargetType?: "size" | "angle";
  diffuserTolerance?: string;
  
  // 1D Splitter specific
  splitterCount?: string;
  splitterAngle?: string;
  splitterSize?: string;
  splitterTargetType?: "size" | "angle";
  splitterTolerance?: string;
  
  // Lens specific
  lensFocalLength?: string;
  lensSpecialFunction?: "none" | "extended_dof" | "multi_wavelength";
  lensExtendedDOF?: string;
  lensMultiWavelength?: string;
  lensType?: "normal" | "cylindrical_x" | "cylindrical_y";
  
  // Lens Array specific
  lensArraySize?: string;
  lensArrayFocalLength?: string;
  lensArraySpecialFunction?: "none" | "extended_dof" | "multi_wavelength";
  lensArrayExtendedDOF?: string;
  lensArrayMultiWavelength?: string;
  lensArrayType?: "normal" | "cylindrical_x" | "cylindrical_y";
  
  // Prism specific
  prismDeflectionAngle?: string;
  prismTolerance?: string;
  
  // Custom Pattern specific
  customPatternFile?: File | null;
  customPatternPreset?: "none" | "cross" | "ring" | "grid";
  customResizeMode?: "percentage" | "pixels";
  customResizePercentage?: string;
  customResizeWidth?: string;
  customResizeHeight?: string;
  customPatternPreview?: string;
  customPatternInfo?: { maxPixelValue: number; brightnessPercent: number; width: number; height: number };
  customAngle?: string;
  customSize?: string;
  customTargetType?: "size" | "angle";
  customTolerance?: string;
  
  // Fabrication simulator
  fabricationEnabled?: boolean;
  fabricationRecipe?: string;
}

interface DOEParametersProps {
  params: DOEParams;
  onParamsChange: (params: DOEParams) => void;
  onPreview: () => void;
  onOptimize: () => void;
  isOptimizing?: boolean;
}

const DISTANCE_PRESETS = [
  { value: "1cm", label: "1 cm" },
  { value: "1in", label: "1 in" },
  { value: "10cm", label: "10 cm" },
  { value: "1ft", label: "1 ft" },
  { value: "1m", label: "1 m" },
  { value: "inf", label: "∞ (Infinity)" },
];

const WAVELENGTH_PRESETS = [
  { value: "405nm", label: "405 nm (Violet)" },
  { value: "450nm", label: "450 nm (Blue)" },
  { value: "532nm", label: "532 nm (Green)" },
  { value: "633nm", label: "633 nm (Red HeNe)" },
  { value: "650nm", label: "650 nm (Red)" },
  { value: "850nm", label: "850 nm (NIR)" },
  { value: "1064nm", label: "1064 nm (Nd:YAG)" },
  { value: "1550nm", label: "1550 nm (Telecom)" },
];

const DIAMETER_PRESETS = [
  { value: "6.35mm", label: "6.35 mm (1/4\")" },
  { value: "12.7mm", label: "12.7 mm (1/2\")" },
  { value: "25.4mm", label: "25.4 mm (1\")" },
  { value: "50.8mm", label: "50.8 mm (2\")" },
];

const FABRICATION_RECIPES = [
  { value: "ideal", labelEn: "Ideal (No fabrication effects)", labelZh: "理想（无加工影响）", labelKo: "이상적 (가공 영향 없음)" },
  { value: "binary", labelEn: "Binary Phase (2 levels)", labelZh: "二元相位（2级）", labelKo: "이진 위상 (2레벨)" },
  { value: "multilevel4", labelEn: "Multi-level (4 levels)", labelZh: "多级相位（4级）", labelKo: "다단계 (4레벨)" },
  { value: "multilevel8", labelEn: "Multi-level (8 levels)", labelZh: "多级相位（8级）", labelKo: "다단계 (8레벨)" },
  { value: "multilevel16", labelEn: "Multi-level (16 levels)", labelZh: "多级相位（16级）", labelKo: "다단계 (16레벨)" },
  { value: "grayscale", labelEn: "Grayscale (256 levels)", labelZh: "灰度（256级）", labelKo: "그레이스케일 (256레벨)" },
];

// Helper function to parse value with unit
function parseValueWithUnit(value: string | number): { value: number; unit: string } {
  // Convert to string if it's a number
  const strValue = String(value);
  const match = strValue.match(/^([\d.]+)\s*([a-zA-Z°]+)?$/);
  if (match) {
    return { value: parseFloat(match[1]), unit: match[2] || "" };
  }
  return { value: 0, unit: "" };
}

// Convert to mm
function convertToMm(value: string | number): number {
  const parsed = parseValueWithUnit(value);
  const unit = parsed.unit.toLowerCase();
  switch (unit) {
    case "m": return parsed.value * 1000;
    case "cm": return parsed.value * 10;
    case "mm": return parsed.value;
    case "um": case "µm": return parsed.value / 1000;
    case "in": return parsed.value * 25.4;
    case "ft": return parsed.value * 304.8;
    default: return parsed.value;
  }
}

// Convert to nm
function convertToNm(value: string | number): number {
  const parsed = parseValueWithUnit(value);
  const unit = parsed.unit.toLowerCase();
  switch (unit) {
    case "nm": return parsed.value;
    case "um": case "µm": return parsed.value * 1000;
    case "mm": return parsed.value * 1e6;
    default: return parsed.value;
  }
}

// Convert to degrees
function convertToDegrees(value: string | number): number {
  const parsed = parseValueWithUnit(value);
  const unit = parsed.unit.toLowerCase();
  if (unit === "rad") return parsed.value * 180 / Math.PI;
  return parsed.value;
}

// Calculate minimum tolerance as dimensionless ratio (percentage)
// For angle mode: lambda / D / cos(theta) / theta (all in radians)
// For size mode: D / N / target_size (dimensionless)
function calculateMinTolerancePercent(
  wavelengthNm: number,
  diameterMm: number,
  maxHalfAngleDeg: number,
  targetSizeMm: number | null,
  workingDistanceMm: number | null,
  isAngleMode: boolean,
  maxPixels: number = 3000
): { minTolerancePercent: number; maxEffectivePixels: number } {
  const lambdaMm = wavelengthNm / 1e6;
  
  if (isAngleMode && maxHalfAngleDeg > 0) {
    // For angle mode: lambda / D / cos(theta) / theta
    // Result is dimensionless ratio
    const thetaRad = maxHalfAngleDeg * Math.PI / 180;
    const minToleranceRatio = lambdaMm / diameterMm / Math.cos(thetaRad) / thetaRad;
    const minTolerancePercent = minToleranceRatio * 100;
    // Max effective pixels = full angle range / min tolerance
    const fullAngleRad = maxHalfAngleDeg * 2 * Math.PI / 180;
    const maxEffectivePixels = Math.floor(fullAngleRad / (minToleranceRatio * fullAngleRad));
    return { minTolerancePercent, maxEffectivePixels: Math.min(maxEffectivePixels, maxPixels) };
  } else if (!isAngleMode && targetSizeMm !== null && targetSizeMm > 0) {
    // For size mode: D / N / target_size
    // This gives minimum resolvable size, convert to percentage of target
    const minResolvableSizeMm = diameterMm / maxPixels;
    const minTolerancePercent = (minResolvableSizeMm / targetSizeMm) * 100;
    const maxEffectivePixels = Math.floor(targetSizeMm / minResolvableSizeMm);
    return { minTolerancePercent, maxEffectivePixels: Math.min(maxEffectivePixels, maxPixels) };
  }
  
  return { minTolerancePercent: 0.1, maxEffectivePixels: maxPixels };
}

// Calculate equivalent full angle from size and distance
function calculateEquivalentAngle(targetSizeMm: number, workingDistanceMm: number): number {
  if (workingDistanceMm <= 0) return 0;
  const halfAngleRad = Math.atan((targetSizeMm / 2) / workingDistanceMm);
  return halfAngleRad * 2 * 180 / Math.PI; // Full angle in degrees
}

export default function DOEParameters({
  params,
  onParamsChange,
  onPreview,
  onOptimize,
  isOptimizing = false,
}: DOEParametersProps) {
  const { t, language } = useLanguage();
  const [basicOpen, setBasicOpen] = useState(true);
  const [advancedOpen, setAdvancedOpen] = useState(true);
  const [fabOpen, setFabOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const updateParam = <K extends keyof DOEParams>(key: K, value: DOEParams[K]) => {
    onParamsChange({ ...params, [key]: value });
  };

  const isInfiniteDistance = String(params.workingDistance || "").toLowerCase() === "inf" ||
                              String(params.workingDistance || "").toLowerCase() === "infinity";

  // Parse values for calculations
  const wavelengthNm = useMemo(() => convertToNm(params.wavelength || "532nm"), [params.wavelength]);
  const diameterMm = useMemo(() => convertToMm(params.deviceDiameter || "12.7mm"), [params.deviceDiameter]);
  const workingDistanceMm = useMemo(() => {
    if (isInfiniteDistance) return Infinity;
    return convertToMm(params.workingDistance || "100mm");
  }, [params.workingDistance, isInfiniteDistance]);
  const focalLengthMm = useMemo(() => convertToMm(params.lensFocalLength || "50mm"), [params.lensFocalLength]);
  const lensArrayFocalLengthMm = useMemo(() => convertToMm(params.lensArrayFocalLength || "50mm"), [params.lensArrayFocalLength]);
  const lensArraySizeNum = useMemo(() => parseInt(params.lensArraySize || "5") || 5, [params.lensArraySize]);

  // Calculate reference DOF for lens
  const referenceDOF = useMemo(() => {
    const lambdaMm = wavelengthNm / 1e6;
    const NA = (diameterMm / 2) / focalLengthMm;
    return lambdaMm / (NA * NA);
  }, [wavelengthNm, diameterMm, focalLengthMm]);

  // Calculate max diffraction angle for lens
  const maxDiffractionAngle = useMemo(() => {
    return Math.atan((diameterMm / 2) / focalLengthMm) * 180 / Math.PI;
  }, [diameterMm, focalLengthMm]);

  // Calculate reference DOF for lens array
  const lensArrayReferenceDOF = useMemo(() => {
    const lambdaMm = wavelengthNm / 1e6;
    const effectiveDiameter = diameterMm / lensArraySizeNum;
    const NA = (effectiveDiameter / 2) / lensArrayFocalLengthMm;
    return lambdaMm / (NA * NA);
  }, [wavelengthNm, diameterMm, lensArrayFocalLengthMm, lensArraySizeNum]);

  // Calculate max diffraction angle for lens array
  const lensArrayMaxDiffractionAngle = useMemo(() => {
    const effectiveDiameter = diameterMm / lensArraySizeNum;
    return Math.atan((effectiveDiameter / 2) / lensArrayFocalLengthMm) * 180 / Math.PI;
  }, [diameterMm, lensArrayFocalLengthMm, lensArraySizeNum]);

  // Helper function for language-specific labels
  const getLabel = (en: string, zh: string, ko: string) => {
    return language === "en" ? en : language === "zh" ? zh : ko;
  };

  // Calculate tolerance hints for different modes
  const getToleranceHint = useMemo(() => {
    return (targetType: "size" | "angle", angleStr: string, sizeStr: string) => {
      const isAngleMode = targetType === "angle";
      const maxHalfAngle = isAngleMode ? convertToDegrees(angleStr) / 2 : 0;
      const targetSizeMm = !isAngleMode ? convertToMm(sizeStr) : null;
      
      return calculateMinTolerancePercent(
        wavelengthNm,
        diameterMm,
        maxHalfAngle,
        targetSizeMm,
        isFinite(workingDistanceMm) ? workingDistanceMm : null,
        isAngleMode
      );
    };
  }, [wavelengthNm, diameterMm, workingDistanceMm]);

  // Calculate equivalent angle from size for display
  const getEquivalentAngle = useMemo(() => {
    return (sizeStr: string) => {
      if (!isFinite(workingDistanceMm) || workingDistanceMm <= 0) return null;
      const sizeMm = convertToMm(sizeStr);
      if (sizeMm <= 0) return null;
      return calculateEquivalentAngle(sizeMm, workingDistanceMm);
    };
  }, [workingDistanceMm]);

  // When working distance changes to infinity, force target type to angle
  useEffect(() => {
    if (isInfiniteDistance) {
      if (params.targetType === "size") updateParam("targetType", "angle");
      if (params.diffuserTargetType === "size") updateParam("diffuserTargetType", "angle");
      if (params.splitterTargetType === "size") updateParam("splitterTargetType", "angle");
      if (params.customTargetType === "size") updateParam("customTargetType", "angle");
    }
  }, [isInfiniteDistance]);

  // Handle file upload for custom pattern
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateParam("customPatternFile", file);
      updateParam("customPatternPreset", "none");
      
      // Create preview URL and analyze image
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          // Create canvas to analyze and resize image
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) return;
          
          // Get resize dimensions
          let targetWidth = img.width;
          let targetHeight = img.height;
          
          if (params.customResizeMode === "percentage") {
            const percent = parseFloat(params.customResizePercentage || "100") / 100;
            targetWidth = Math.round(img.width * percent);
            targetHeight = Math.round(img.height * percent);
          } else if (params.customResizeMode === "pixels") {
            targetWidth = parseInt(params.customResizeWidth || String(img.width)) || img.width;
            targetHeight = parseInt(params.customResizeHeight || String(img.height)) || img.height;
          }
          
          // Clamp to max 3000x3000
          targetWidth = Math.min(targetWidth, 3000);
          targetHeight = Math.min(targetHeight, 3000);
          
          // Make square by padding with black
          const maxDim = Math.max(targetWidth, targetHeight);
          canvas.width = maxDim;
          canvas.height = maxDim;
          
          // Fill with black
          ctx.fillStyle = "black";
          ctx.fillRect(0, 0, maxDim, maxDim);
          
          // Draw image centered
          const offsetX = (maxDim - targetWidth) / 2;
          const offsetY = (maxDim - targetHeight) / 2;
          ctx.drawImage(img, offsetX, offsetY, targetWidth, targetHeight);
          
          // Convert to grayscale and analyze
          const imageData = ctx.getImageData(0, 0, maxDim, maxDim);
          const data = imageData.data;
          let maxPixelValue = 0;
          
          for (let i = 0; i < data.length; i += 4) {
            // Convert to grayscale using luminance formula
            const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
            data[i] = gray;
            data[i + 1] = gray;
            data[i + 2] = gray;
            if (gray > maxPixelValue) maxPixelValue = gray;
          }
          
          ctx.putImageData(imageData, 0, 0);
          
          const previewUrl = canvas.toDataURL("image/png");
          updateParam("customPatternPreview", previewUrl);
          updateParam("customPatternInfo", {
            maxPixelValue,
            brightnessPercent: (maxPixelValue / 255) * 100,
            width: maxDim,
            height: maxDim
          });
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  // Re-process image when resize settings change
  useEffect(() => {
    if (params.customPatternFile) {
      const event = { target: { files: [params.customPatternFile] } } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileUpload(event);
    }
  }, [params.customResizeMode, params.customResizePercentage, params.customResizeWidth, params.customResizeHeight]);

  return (
    <div className="space-y-4">
      {/* Basic Parameters Section */}
      <Collapsible open={basicOpen} onOpenChange={setBasicOpen}>
        <CollapsibleTrigger className="w-full p-3 flex items-center gap-2 hover:bg-gray-50 transition-colors rounded-lg border border-border bg-white">
          {basicOpen ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
          <Settings2 className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">{t("basic.title")}</span>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="p-4 space-y-4 border border-t-0 border-border rounded-b-lg bg-white">
            {/* Working Distance */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">
                {t("basic.workingDistance")}
              </Label>
              <div className="flex gap-2">
                <Input
                  value={params.workingDistance}
                  onChange={(e) => updateParam("workingDistance", e.target.value)}
                  placeholder="100mm"
                  className="flex-1 h-9 text-sm font-mono"
                />
                <Select
                  value=""
                  onValueChange={(value) => updateParam("workingDistance", value)}
                >
                  <SelectTrigger className="w-32 h-9 text-sm">
                    <SelectValue placeholder={t("basic.presets")} />
                  </SelectTrigger>
                  <SelectContent>
                    {DISTANCE_PRESETS.map((preset) => (
                      <SelectItem key={preset.value} value={preset.value} className="text-sm">
                        {preset.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Wavelength */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">
                {t("basic.wavelength")}
              </Label>
              <div className="flex gap-2">
                <Input
                  value={params.wavelength}
                  onChange={(e) => updateParam("wavelength", e.target.value)}
                  placeholder="532nm"
                  className="flex-1 h-9 text-sm font-mono"
                />
                <Select
                  value=""
                  onValueChange={(value) => updateParam("wavelength", value)}
                >
                  <SelectTrigger className="w-40 h-9 text-sm">
                    <SelectValue placeholder={t("basic.presets")} />
                  </SelectTrigger>
                  <SelectContent>
                    {WAVELENGTH_PRESETS.map((preset) => (
                      <SelectItem key={preset.value} value={preset.value} className="text-sm">
                        {preset.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* DOE Mode */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">
                {t("basic.mode")}
              </Label>
              <Select
                value={params.mode}
                onValueChange={(value) => updateParam("mode", value as DOEMode)}
              >
                <SelectTrigger className="w-full h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="diffuser">{t("mode.diffuser")}</SelectItem>
                  <SelectItem value="1d_splitter">{t("mode.1dSplitter")}</SelectItem>
                  <SelectItem value="2d_spot_projector">{t("mode.2dSpot")}</SelectItem>
                  <SelectItem value="lens">{t("mode.lens")}</SelectItem>
                  <SelectItem value="lens_array">{t("mode.lensArray")}</SelectItem>
                  <SelectItem value="prism">{t("mode.prism")}</SelectItem>
                  <SelectItem value="custom">{t("mode.custom")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Device Diameter */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">
                {t("basic.diameter")}
              </Label>
              <div className="flex gap-2">
                <Input
                  value={params.deviceDiameter}
                  onChange={(e) => updateParam("deviceDiameter", e.target.value)}
                  placeholder="12.7mm"
                  className="flex-1 h-9 text-sm font-mono"
                />
                <Select
                  value=""
                  onValueChange={(value) => updateParam("deviceDiameter", value)}
                >
                  <SelectTrigger className="w-40 h-9 text-sm">
                    <SelectValue placeholder={t("basic.presets")} />
                  </SelectTrigger>
                  <SelectContent>
                    {DIAMETER_PRESETS.map((preset) => (
                      <SelectItem key={preset.value} value={preset.value} className="text-sm">
                        {preset.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Device Shape */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">
                {t("basic.shape")}
              </Label>
              <RadioGroup
                value={params.deviceShape}
                onValueChange={(value) => updateParam("deviceShape", value as "circular" | "square")}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="circular" id="shape-circular" />
                  <Label htmlFor="shape-circular" className="text-sm cursor-pointer">{t("shape.circular")}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="square" id="shape-square" />
                  <Label htmlFor="shape-square" className="text-sm cursor-pointer">{t("shape.square")}</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* ========== DIFFUSER PARAMETERS ========== */}
      {params.mode === "diffuser" && (
        <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
          <CollapsibleTrigger className="w-full p-3 flex items-center gap-2 hover:bg-gray-50 transition-colors rounded-lg border border-border bg-white">
            {advancedOpen ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
            <Layers className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">{getLabel("Diffuser Settings", "匀光片设置", "디퓨저 설정")}</span>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="p-4 space-y-4 border border-t-0 border-border rounded-b-lg bg-white">
              {/* Diffuser Shape */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  {getLabel("Diffusion Shape", "扩散形状", "확산 형상")}
                </Label>
                <RadioGroup
                  value={params.diffuserShape || "circular"}
                  onValueChange={(value) => updateParam("diffuserShape", value as "circular" | "square")}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="circular" id="diffuser-circular" />
                    <Label htmlFor="diffuser-circular" className="text-sm cursor-pointer">{t("shape.circular")}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="square" id="diffuser-square" />
                    <Label htmlFor="diffuser-square" className="text-sm cursor-pointer">{t("shape.square")}</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Target Type Selection */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  {getLabel("Target Specification", "目标规格", "목표 사양")}
                </Label>
                <RadioGroup
                  value={params.diffuserTargetType || "angle"}
                  onValueChange={(value) => updateParam("diffuserTargetType", value as "size" | "angle")}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="size" id="diffuser-target-size" disabled={isInfiniteDistance} />
                    <Label htmlFor="diffuser-target-size" className={`text-sm cursor-pointer ${isInfiniteDistance ? "text-muted-foreground" : ""}`}>
                      {getLabel("Diffusion Size", "扩散尺寸", "확산 크기")}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="angle" id="diffuser-target-angle" />
                    <Label htmlFor="diffuser-target-angle" className="text-sm cursor-pointer">
                      {getLabel("Full Angle", "全角", "전체 각도")}
                    </Label>
                  </div>
                </RadioGroup>
                {isInfiniteDistance && (
                  <p className="text-xs text-amber-600">{t("spot.infOnlyAngle")}</p>
                )}
              </div>

              {/* Size or Angle Input */}
              {(params.diffuserTargetType || "angle") === "size" && !isInfiniteDistance ? (
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">
                    {getLabel("Diffusion Size", "扩散尺寸", "확산 크기")}
                  </Label>
                  <Input
                    value={params.diffuserSize || ""}
                    onChange={(e) => updateParam("diffuserSize", e.target.value)}
                    placeholder="100mm"
                    className="h-9 text-sm font-mono"
                  />
                  {/* Equivalent angle display */}
                  {params.diffuserSize && getEquivalentAngle(params.diffuserSize) && (
                    <p className="text-xs text-blue-600">
                      {getLabel("Equivalent Full Angle:", "等效全角:", "등가 전체 각도:")} {getEquivalentAngle(params.diffuserSize)?.toFixed(2)}°
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">
                    {getLabel("Full Angle", "全角", "전체 각도")}
                  </Label>
                  <Input
                    value={params.diffuserAngle || ""}
                    onChange={(e) => updateParam("diffuserAngle", e.target.value)}
                    placeholder="30°"
                    className="h-9 text-sm font-mono"
                  />
                </div>
              )}

              {/* Tolerance with inline hint */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  {getLabel("Tolerance", "容差", "허용 오차")} (%)
                </Label>
                <Input
                  value={params.diffuserTolerance || ""}
                  onChange={(e) => updateParam("diffuserTolerance", e.target.value)}
                  placeholder="1"
                  className="w-24 h-9 text-sm font-mono"
                />
                {/* Min tolerance hint */}
                {(() => {
                  const hint = getToleranceHint(
                    params.diffuserTargetType || "angle",
                    params.diffuserAngle || "30",
                    params.diffuserSize || "100mm"
                  );
                  return (
                    <p className="text-xs text-muted-foreground">
                      {getLabel("Est. min tolerance:", "预估最小容差:", "예상 최소 허용 오차:")} {hint.minTolerancePercent.toFixed(3)}%
                      {" | "}
                      {getLabel("Max effective pixels:", "最大有效像素:", "최대 유효 픽셀:")} {hint.maxEffectivePixels}
                    </p>
                  );
                })()}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* ========== 1D SPLITTER PARAMETERS ========== */}
      {params.mode === "1d_splitter" && (
        <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
          <CollapsibleTrigger className="w-full p-3 flex items-center gap-2 hover:bg-gray-50 transition-colors rounded-lg border border-border bg-white">
            {advancedOpen ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
            <Layers className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">{getLabel("1D Splitter Settings", "一维分束器设置", "1D 분할기 설정")}</span>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="p-4 space-y-4 border border-t-0 border-border rounded-b-lg bg-white">
              {/* Split Count with max splits hint */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  {getLabel("Number of Splits", "分束数目", "분할 수")}
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={params.splitterCount || ""}
                    onChange={(e) => updateParam("splitterCount", e.target.value)}
                    placeholder="5"
                    className="w-24 h-9 text-sm font-mono"
                  />
                  {/* Max splits hint inline */}
                  {(() => {
                    const hint = getToleranceHint(
                      params.splitterTargetType || "angle",
                      params.splitterAngle || "30",
                      params.splitterSize || "100mm"
                    );
                    return (
                      <span className="text-xs text-muted-foreground">
                        {getLabel("Max:", "最大:", "최대:")} {hint.maxEffectivePixels}
                      </span>
                    );
                  })()}
                </div>
              </div>

              {/* Target Type Selection */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  {getLabel("Target Specification", "目标规格", "목표 사양")}
                </Label>
                <RadioGroup
                  value={params.splitterTargetType || "angle"}
                  onValueChange={(value) => updateParam("splitterTargetType", value as "size" | "angle")}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="size" id="splitter-target-size" disabled={isInfiniteDistance} />
                    <Label htmlFor="splitter-target-size" className={`text-sm cursor-pointer ${isInfiniteDistance ? "text-muted-foreground" : ""}`}>
                      {getLabel("Projection Size", "投射尺寸", "투사 크기")}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="angle" id="splitter-target-angle" />
                    <Label htmlFor="splitter-target-angle" className="text-sm cursor-pointer">
                      {getLabel("Full Angle Coverage", "全角覆盖", "전체 각도 범위")}
                    </Label>
                  </div>
                </RadioGroup>
                {isInfiniteDistance && (
                  <p className="text-xs text-amber-600">{t("spot.infOnlyAngle")}</p>
                )}
              </div>

              {/* Size or Angle Input */}
              {(params.splitterTargetType || "angle") === "size" && !isInfiniteDistance ? (
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">
                    {getLabel("Projection Size", "投射尺寸", "투사 크기")}
                  </Label>
                  <Input
                    value={params.splitterSize || ""}
                    onChange={(e) => updateParam("splitterSize", e.target.value)}
                    placeholder="100mm"
                    className="h-9 text-sm font-mono"
                  />
                  {/* Equivalent angle display */}
                  {params.splitterSize && getEquivalentAngle(params.splitterSize) && (
                    <p className="text-xs text-blue-600">
                      {getLabel("Equivalent Full Angle:", "等效全角:", "등가 전체 각도:")} {getEquivalentAngle(params.splitterSize)?.toFixed(2)}°
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">
                    {getLabel("Full Angle Coverage", "全角覆盖", "전체 각도 범위")}
                  </Label>
                  <Input
                    value={params.splitterAngle || ""}
                    onChange={(e) => updateParam("splitterAngle", e.target.value)}
                    placeholder="30°"
                    className="h-9 text-sm font-mono"
                  />
                </div>
              )}

              {/* Tolerance */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  {getLabel("Tolerance", "容差", "허용 오차")} (%)
                </Label>
                <Input
                  value={params.splitterTolerance || ""}
                  onChange={(e) => updateParam("splitterTolerance", e.target.value)}
                  placeholder="1"
                  className="w-24 h-9 text-sm font-mono"
                />
                {/* Min tolerance hint */}
                {(() => {
                  const hint = getToleranceHint(
                    params.splitterTargetType || "angle",
                    params.splitterAngle || "30",
                    params.splitterSize || "100mm"
                  );
                  return (
                    <p className="text-xs text-muted-foreground">
                      {getLabel("Est. min tolerance:", "预估最小容差:", "예상 최소 허용 오차:")} {hint.minTolerancePercent.toFixed(3)}%
                    </p>
                  );
                })()}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* ========== 2D SPOT PROJECTOR PARAMETERS ========== */}
      {params.mode === "2d_spot_projector" && (
        <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
          <CollapsibleTrigger className="w-full p-3 flex items-center gap-2 hover:bg-gray-50 transition-colors rounded-lg border border-border bg-white">
            {advancedOpen ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
            <Layers className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">{t("spot.settings")}</span>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="p-4 space-y-4 border border-t-0 border-border rounded-b-lg bg-white">
              {/* Array Size with max array hint */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  {t("spot.arraySize")}
                </Label>
                <div className="flex gap-2 items-center">
                  <Input
                    value={params.arrayRows}
                    onChange={(e) => updateParam("arrayRows", e.target.value)}
                    placeholder="50"
                    className="w-20 h-9 text-sm font-mono text-center"
                  />
                  <span className="text-muted-foreground">×</span>
                  <Input
                    value={params.arrayCols}
                    onChange={(e) => updateParam("arrayCols", e.target.value)}
                    placeholder="50"
                    className="w-20 h-9 text-sm font-mono text-center"
                  />
                  {/* Max array hint inline */}
                  {(() => {
                    const hint = getToleranceHint(
                      params.targetType,
                      params.targetAngle || "30",
                      params.targetSize || "100mm"
                    );
                    return (
                      <span className="text-xs text-muted-foreground ml-2">
                        {getLabel("Max:", "最大:", "최대:")} {hint.maxEffectivePixels}×{hint.maxEffectivePixels}
                      </span>
                    );
                  })()}
                </div>
              </div>

              {/* Target Type Selection */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  {t("spot.targetSpec")}
                </Label>
                <RadioGroup
                  value={params.targetType}
                  onValueChange={(value) => updateParam("targetType", value as "size" | "angle")}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="size" id="target-size" disabled={isInfiniteDistance} />
                    <Label htmlFor="target-size" className={`text-sm cursor-pointer ${isInfiniteDistance ? "text-muted-foreground" : ""}`}>
                      {t("spot.targetSize")}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="angle" id="target-angle" />
                    <Label htmlFor="target-angle" className="text-sm cursor-pointer">{t("spot.fullAngle")}</Label>
                  </div>
                </RadioGroup>
                {isInfiniteDistance && (
                  <p className="text-xs text-amber-600">{t("spot.infOnlyAngle")}</p>
                )}
              </div>

              {/* Target Size or Angle Input */}
              {params.targetType === "size" && !isInfiniteDistance ? (
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">
                    {t("spot.targetSize")}
                  </Label>
                  <Input
                    value={params.targetSize}
                    onChange={(e) => updateParam("targetSize", e.target.value)}
                    placeholder={t("spot.targetSizeHint")}
                    className="h-9 text-sm font-mono"
                  />
                  {/* Equivalent angle display */}
                  {params.targetSize && getEquivalentAngle(params.targetSize) && (
                    <p className="text-xs text-blue-600">
                      {getLabel("Equivalent Full Angle:", "等效全角:", "등가 전체 각도:")} {getEquivalentAngle(params.targetSize)?.toFixed(2)}°
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">
                    {t("spot.fullAngle")}
                  </Label>
                  <Input
                    value={params.targetAngle}
                    onChange={(e) => updateParam("targetAngle", e.target.value)}
                    placeholder={t("spot.fullAngleHint")}
                    className="h-9 text-sm font-mono"
                  />
                </div>
              )}

              {/* Tolerance */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  {t("spot.tolerance")} (%)
                </Label>
                <Input
                  value={params.tolerance}
                  onChange={(e) => updateParam("tolerance", e.target.value)}
                  placeholder="1"
                  className="w-24 h-9 text-sm font-mono"
                />
                {/* Min tolerance hint */}
                {(() => {
                  const hint = getToleranceHint(
                    params.targetType,
                    params.targetAngle || "30",
                    params.targetSize || "100mm"
                  );
                  return (
                    <p className="text-xs text-muted-foreground">
                      {getLabel("Est. min tolerance:", "预估最小容差:", "예상 최소 허용 오차:")} {hint.minTolerancePercent.toFixed(3)}%
                    </p>
                  );
                })()}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* ========== LENS PARAMETERS ========== */}
      {params.mode === "lens" && (
        <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
          <CollapsibleTrigger className="w-full p-3 flex items-center gap-2 hover:bg-gray-50 transition-colors rounded-lg border border-border bg-white">
            {advancedOpen ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
            <Layers className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">{getLabel("Lens Settings", "透镜设置", "렌즈 설정")}</span>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="p-4 space-y-4 border border-t-0 border-border rounded-b-lg bg-white">
              {/* Focal Length */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  {getLabel("Focal Length", "焦距", "초점 거리")}
                </Label>
                <Input
                  value={params.lensFocalLength || ""}
                  onChange={(e) => updateParam("lensFocalLength", e.target.value)}
                  placeholder="50mm"
                  className="h-9 text-sm font-mono"
                />
              </div>

              {/* Lens Type */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  {getLabel("Lens Type", "透镜类型", "렌즈 유형")}
                </Label>
                <Select
                  value={params.lensType || "normal"}
                  onValueChange={(value) => updateParam("lensType", value as "normal" | "cylindrical_x" | "cylindrical_y")}
                >
                  <SelectTrigger className="w-full h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">{getLabel("Normal Lens", "普通透镜", "일반 렌즈")}</SelectItem>
                    <SelectItem value="cylindrical_x">{getLabel("Cylindrical X", "柱面透镜 X", "원통형 X")}</SelectItem>
                    <SelectItem value="cylindrical_y">{getLabel("Cylindrical Y", "柱面透镜 Y", "원통형 Y")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Special Function */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  {getLabel("Special Function", "特殊功能", "특수 기능")}
                </Label>
                <Select
                  value={params.lensSpecialFunction || "none"}
                  onValueChange={(value) => updateParam("lensSpecialFunction", value as "none" | "extended_dof" | "multi_wavelength")}
                >
                  <SelectTrigger className="w-full h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{getLabel("None", "无", "없음")}</SelectItem>
                    <SelectItem value="extended_dof">{getLabel("Extended DOF", "扩展焦深", "확장 피사계 심도")}</SelectItem>
                    <SelectItem value="multi_wavelength">{getLabel("Multi-wavelength", "多波长", "다중 파장")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Extended DOF Input */}
              {params.lensSpecialFunction === "extended_dof" && (
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">
                    {getLabel("DOF Values (mm, comma-separated)", "焦深值（mm，逗号分隔）", "피사계 심도 값 (mm, 쉼표로 구분)")}
                  </Label>
                  <Input
                    value={params.lensExtendedDOF || ""}
                    onChange={(e) => updateParam("lensExtendedDOF", e.target.value)}
                    placeholder="0.1, 0.2, 0.5"
                    className="h-9 text-sm font-mono"
                  />
                </div>
              )}

              {/* Multi-wavelength Input */}
              {params.lensSpecialFunction === "multi_wavelength" && (
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">
                    {getLabel("Wavelengths (nm, comma-separated)", "波长值（nm，逗号分隔）", "파장 값 (nm, 쉼표로 구분)")}
                  </Label>
                  <Input
                    value={params.lensMultiWavelength || ""}
                    onChange={(e) => updateParam("lensMultiWavelength", e.target.value)}
                    placeholder="450, 532, 633"
                    className="h-9 text-sm font-mono"
                  />
                </div>
              )}

              {/* Reference Info */}
              <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <div className="text-xs text-blue-700 space-y-1">
                  <p>{getLabel("Reference DOF:", "参考焦深:", "참조 피사계 심도:")} {referenceDOF.toFixed(4)} mm</p>
                  <p>{getLabel("Max diffraction half-angle:", "最大衍射半角:", "최대 회절 반각:")} {maxDiffractionAngle.toFixed(2)}°</p>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* ========== LENS ARRAY PARAMETERS ========== */}
      {params.mode === "lens_array" && (
        <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
          <CollapsibleTrigger className="w-full p-3 flex items-center gap-2 hover:bg-gray-50 transition-colors rounded-lg border border-border bg-white">
            {advancedOpen ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
            <Layers className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">{getLabel("Lens Array Settings", "透镜阵列设置", "렌즈 어레이 설정")}</span>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="p-4 space-y-4 border border-t-0 border-border rounded-b-lg bg-white">
              {/* Array Size */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  {getLabel("Array Size (N×N)", "阵列规模（N×N）", "어레이 크기 (N×N)")}
                </Label>
                <Input
                  value={params.lensArraySize || ""}
                  onChange={(e) => updateParam("lensArraySize", e.target.value)}
                  placeholder="5"
                  className="w-24 h-9 text-sm font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  {getLabel("Effective aperture:", "等效孔径:", "유효 구경:")} {(diameterMm / lensArraySizeNum).toFixed(2)} mm
                </p>
              </div>

              {/* Focal Length */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  {getLabel("Focal Length", "焦距", "초점 거리")}
                </Label>
                <Input
                  value={params.lensArrayFocalLength || ""}
                  onChange={(e) => updateParam("lensArrayFocalLength", e.target.value)}
                  placeholder="50mm"
                  className="h-9 text-sm font-mono"
                />
              </div>

              {/* Lens Type */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  {getLabel("Lens Type", "透镜类型", "렌즈 유형")}
                </Label>
                <Select
                  value={params.lensArrayType || "normal"}
                  onValueChange={(value) => updateParam("lensArrayType", value as "normal" | "cylindrical_x" | "cylindrical_y")}
                >
                  <SelectTrigger className="w-full h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">{getLabel("Normal Lens", "普通透镜", "일반 렌즈")}</SelectItem>
                    <SelectItem value="cylindrical_x">{getLabel("Cylindrical X", "柱面透镜 X", "원통형 X")}</SelectItem>
                    <SelectItem value="cylindrical_y">{getLabel("Cylindrical Y", "柱面透镜 Y", "원통형 Y")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Special Function */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  {getLabel("Special Function", "特殊功能", "특수 기능")}
                </Label>
                <Select
                  value={params.lensArraySpecialFunction || "none"}
                  onValueChange={(value) => updateParam("lensArraySpecialFunction", value as "none" | "extended_dof" | "multi_wavelength")}
                >
                  <SelectTrigger className="w-full h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{getLabel("None", "无", "없음")}</SelectItem>
                    <SelectItem value="extended_dof">{getLabel("Extended DOF", "扩展焦深", "확장 피사계 심도")}</SelectItem>
                    <SelectItem value="multi_wavelength">{getLabel("Multi-wavelength", "多波长", "다중 파장")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Extended DOF Input */}
              {params.lensArraySpecialFunction === "extended_dof" && (
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">
                    {getLabel("DOF Values (mm, comma-separated)", "焦深值（mm，逗号分隔）", "피사계 심도 값 (mm, 쉼표로 구분)")}
                  </Label>
                  <Input
                    value={params.lensArrayExtendedDOF || ""}
                    onChange={(e) => updateParam("lensArrayExtendedDOF", e.target.value)}
                    placeholder="0.1, 0.2, 0.5"
                    className="h-9 text-sm font-mono"
                  />
                </div>
              )}

              {/* Multi-wavelength Input */}
              {params.lensArraySpecialFunction === "multi_wavelength" && (
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">
                    {getLabel("Wavelengths (nm, comma-separated)", "波长值（nm，逗号分隔）", "파장 값 (nm, 쉼표로 구분)")}
                  </Label>
                  <Input
                    value={params.lensArrayMultiWavelength || ""}
                    onChange={(e) => updateParam("lensArrayMultiWavelength", e.target.value)}
                    placeholder="450, 532, 633"
                    className="h-9 text-sm font-mono"
                  />
                </div>
              )}

              {/* Reference Info */}
              <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <div className="text-xs text-blue-700 space-y-1">
                  <p>{getLabel("Reference DOF (per lenslet):", "参考焦深（单透镜）:", "참조 피사계 심도 (렌즈렛당):")} {lensArrayReferenceDOF.toFixed(4)} mm</p>
                  <p>{getLabel("Max diffraction half-angle:", "最大衍射半角:", "최대 회절 반각:")} {lensArrayMaxDiffractionAngle.toFixed(2)}°</p>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* ========== PRISM PARAMETERS ========== */}
      {params.mode === "prism" && (
        <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
          <CollapsibleTrigger className="w-full p-3 flex items-center gap-2 hover:bg-gray-50 transition-colors rounded-lg border border-border bg-white">
            {advancedOpen ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
            <Layers className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">{getLabel("Prism Settings", "棱镜设置", "프리즘 설정")}</span>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="p-4 space-y-4 border border-t-0 border-border rounded-b-lg bg-white">
              {/* Deflection Angle */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  {getLabel("Deflection Angle", "偏离角度", "편향 각도")}
                </Label>
                <Input
                  value={params.prismDeflectionAngle || ""}
                  onChange={(e) => updateParam("prismDeflectionAngle", e.target.value)}
                  placeholder="10°"
                  className="h-9 text-sm font-mono"
                />
              </div>

              {/* Tolerance */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  {getLabel("Tolerance", "容差", "허용 오차")} (%)
                </Label>
                <Input
                  value={params.prismTolerance || ""}
                  onChange={(e) => updateParam("prismTolerance", e.target.value)}
                  placeholder="1"
                  className="w-24 h-9 text-sm font-mono"
                />
                {/* Min tolerance hint */}
                {(() => {
                  const prismAngle = convertToDegrees(params.prismDeflectionAngle || "10");
                  const hint = calculateMinTolerancePercent(wavelengthNm, diameterMm, prismAngle, null, null, true);
                  return (
                    <p className="text-xs text-muted-foreground">
                      {getLabel("Est. min tolerance:", "预估最小容差:", "예상 최소 허용 오차:")} {hint.minTolerancePercent.toFixed(3)}%
                    </p>
                  );
                })()}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* ========== CUSTOM PATTERN PARAMETERS ========== */}
      {params.mode === "custom" && (
        <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
          <CollapsibleTrigger className="w-full p-3 flex items-center gap-2 hover:bg-gray-50 transition-colors rounded-lg border border-border bg-white">
            {advancedOpen ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
            <Layers className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">{getLabel("Custom Pattern Settings", "自定义图案设置", "사용자 정의 패턴 설정")}</span>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="p-4 space-y-4 border border-t-0 border-border rounded-b-lg bg-white">
              {/* Pattern Upload or Preset */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  {getLabel("Pattern Source", "图案来源", "패턴 소스")}
                </Label>
                <div className="flex gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".bmp,.tif,.tiff,.png,.jpg,.jpeg"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    {getLabel("Upload Image", "上传图片", "이미지 업로드")}
                  </Button>
                  <Select
                    value={params.customPatternPreset || "none"}
                    onValueChange={(value) => {
                      updateParam("customPatternPreset", value as "none" | "cross" | "ring" | "grid");
                      if (value !== "none") {
                        updateParam("customPatternFile", null);
                        updateParam("customPatternPreview", undefined);
                        updateParam("customPatternInfo", undefined);
                      }
                    }}
                  >
                    <SelectTrigger className="w-40 h-9 text-sm">
                      <SelectValue placeholder={getLabel("Preset", "预设", "프리셋")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">{getLabel("None", "无", "없음")}</SelectItem>
                      <SelectItem value="cross">{getLabel("Cross Pattern", "十字图案", "십자 패턴")}</SelectItem>
                      <SelectItem value="ring">{getLabel("Ring Pattern", "环形图案", "링 패턴")}</SelectItem>
                      <SelectItem value="grid">{getLabel("Grid Pattern", "网格图案", "그리드 패턴")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {params.customPatternFile && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{params.customPatternFile.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => {
                        updateParam("customPatternFile", null);
                        updateParam("customPatternPreview", undefined);
                        updateParam("customPatternInfo", undefined);
                      }}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Resize Mode */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  {getLabel("Resize Strategy", "缩放策略", "크기 조정 전략")}
                </Label>
                <RadioGroup
                  value={params.customResizeMode || "percentage"}
                  onValueChange={(value) => updateParam("customResizeMode", value as "percentage" | "pixels")}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="percentage" id="resize-percentage" />
                    <Label htmlFor="resize-percentage" className="text-sm cursor-pointer">
                      {getLabel("Percentage", "百分比", "백분율")}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="pixels" id="resize-pixels" />
                    <Label htmlFor="resize-pixels" className="text-sm cursor-pointer">
                      {getLabel("Pixels", "像素", "픽셀")}
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Resize Input */}
              {(params.customResizeMode || "percentage") === "percentage" ? (
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">
                    {getLabel("Resize Percentage", "缩放比例", "크기 조정 백분율")}
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={params.customResizePercentage || ""}
                      onChange={(e) => updateParam("customResizePercentage", e.target.value)}
                      placeholder="100"
                      className="w-24 h-9 text-sm font-mono"
                    />
                    <span className="text-sm text-muted-foreground">%</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">
                    {getLabel("Target Size (max 3000×3000)", "目标尺寸（最大3000×3000）", "목표 크기 (최대 3000×3000)")}
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={params.customResizeWidth || ""}
                      onChange={(e) => updateParam("customResizeWidth", e.target.value)}
                      placeholder="1024"
                      className="w-24 h-9 text-sm font-mono"
                    />
                    <span className="text-muted-foreground">×</span>
                    <Input
                      value={params.customResizeHeight || ""}
                      onChange={(e) => updateParam("customResizeHeight", e.target.value)}
                      placeholder="1024"
                      className="w-24 h-9 text-sm font-mono"
                    />
                    <span className="text-sm text-muted-foreground">px</span>
                  </div>
                  {params.customResizeWidth && params.customResizeHeight && 
                   params.customResizeWidth !== params.customResizeHeight && (
                    <p className="text-xs text-amber-600">
                      {getLabel(
                        "Non-square image will be padded with black to form a square.",
                        "非方形图像将用黑色填充为方形。",
                        "정사각형이 아닌 이미지는 검은색으로 채워져 정사각형이 됩니다."
                      )}
                    </p>
                  )}
                </div>
              )}

              {/* Target Type Selection */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  {getLabel("Target Specification", "目标规格", "목표 사양")}
                </Label>
                <RadioGroup
                  value={params.customTargetType || "angle"}
                  onValueChange={(value) => updateParam("customTargetType", value as "size" | "angle")}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="size" id="custom-target-size" disabled={isInfiniteDistance} />
                    <Label htmlFor="custom-target-size" className={`text-sm cursor-pointer ${isInfiniteDistance ? "text-muted-foreground" : ""}`}>
                      {getLabel("Projection Size", "投射尺寸", "투사 크기")}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="angle" id="custom-target-angle" />
                    <Label htmlFor="custom-target-angle" className="text-sm cursor-pointer">
                      {getLabel("Full Angle Coverage", "全角覆盖", "전체 각도 범위")}
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Angle or Size Input */}
              {(params.customTargetType || "angle") === "angle" ? (
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">
                    {getLabel("Full Angle Coverage", "全角覆盖", "전체 각도 범위")}
                  </Label>
                  <Input
                    value={params.customAngle || ""}
                    onChange={(e) => updateParam("customAngle", e.target.value)}
                    placeholder="30°"
                    className="h-9 text-sm font-mono"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">
                    {getLabel("Projection Size", "投射尺寸", "투사 크기")}
                  </Label>
                  <Input
                    value={params.customSize || ""}
                    onChange={(e) => updateParam("customSize", e.target.value)}
                    placeholder="100mm"
                    className="h-9 text-sm font-mono"
                  />
                  {/* Equivalent angle display */}
                  {params.customSize && getEquivalentAngle(params.customSize) && (
                    <p className="text-xs text-blue-600">
                      {getLabel("Equivalent Full Angle:", "等效全角:", "등가 전체 각도:")} {getEquivalentAngle(params.customSize)?.toFixed(2)}°
                    </p>
                  )}
                </div>
              )}

              {/* Pattern Preview - placed after target size/angle */}
              {(params.customPatternPreview || params.customPatternPreset !== "none") && (
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">
                    {getLabel("Pattern Preview (Grayscale, Resized)", "图案预览（灰度，已缩放）", "패턴 미리보기 (그레이스케일, 크기 조정됨)")}
                  </Label>
                  <div className="flex gap-4 items-start">
                    <div className="w-32 h-32 border border-border rounded-lg overflow-hidden bg-gray-900 flex items-center justify-center shrink-0">
                      {params.customPatternPreview ? (
                        <img src={params.customPatternPreview} alt="Pattern" className="max-w-full max-h-full object-contain" />
                      ) : params.customPatternPreset === "cross" ? (
                        <div className="w-16 h-16 relative bg-gray-900">
                          <div className="absolute top-1/2 left-0 right-0 h-2 bg-white -translate-y-1/2" />
                          <div className="absolute left-1/2 top-0 bottom-0 w-2 bg-white -translate-x-1/2" />
                        </div>
                      ) : params.customPatternPreset === "ring" ? (
                        <div className="w-16 h-16 border-4 border-white rounded-full" />
                      ) : params.customPatternPreset === "grid" ? (
                        <div className="w-16 h-16 grid grid-cols-4 gap-1">
                          {Array(16).fill(0).map((_, i) => (
                            <div key={i} className="bg-white rounded-sm" />
                          ))}
                        </div>
                      ) : null}
                    </div>
                    {/* Image info */}
                    {params.customPatternInfo && (
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>{getLabel("Size:", "尺寸:", "크기:")} {params.customPatternInfo.width}×{params.customPatternInfo.height} px</p>
                        <p>{getLabel("Max pixel value:", "最大像素值:", "최대 픽셀 값:")} {params.customPatternInfo.maxPixelValue}</p>
                        <p>{getLabel("Brightness:", "亮度:", "밝기:")} {params.customPatternInfo.brightnessPercent.toFixed(1)}%</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tolerance */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">
                  {getLabel("Tolerance", "容差", "허용 오차")} (%)
                </Label>
                <Input
                  value={params.customTolerance || ""}
                  onChange={(e) => updateParam("customTolerance", e.target.value)}
                  placeholder="1"
                  className="w-24 h-9 text-sm font-mono"
                />
                {/* Min tolerance and max pixels hint */}
                {(() => {
                  const hint = getToleranceHint(
                    params.customTargetType || "angle",
                    params.customAngle || "30",
                    params.customSize || "100mm"
                  );
                  return (
                    <p className="text-xs text-muted-foreground">
                      {getLabel("Est. min tolerance:", "预估最小容差:", "예상 최소 허용 오차:")} {hint.minTolerancePercent.toFixed(3)}%
                      {" | "}
                      {getLabel("Max pixels:", "最大像素:", "최대 픽셀:")} {hint.maxEffectivePixels}
                    </p>
                  );
                })()}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Fabrication Simulator Section */}
      <Collapsible open={fabOpen} onOpenChange={setFabOpen}>
        <CollapsibleTrigger className="w-full p-3 flex items-center gap-2 hover:bg-gray-50 transition-colors rounded-lg border border-border bg-white">
          {fabOpen ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}
          <Factory className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">{t("fab.title")}</span>
          {params.fabricationEnabled && (
            <span className="ml-auto text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
              {language === "en" ? "Active" : language === "zh" ? "已启用" : "활성화"}
            </span>
          )}
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="p-4 space-y-4 border border-t-0 border-border rounded-b-lg bg-white">
            {/* Enable Checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="fab-enable"
                checked={params.fabricationEnabled || false}
                onCheckedChange={(checked) => updateParam("fabricationEnabled", checked === true)}
              />
              <Label htmlFor="fab-enable" className="text-sm cursor-pointer">
                {t("fab.enable")}
              </Label>
            </div>

            {/* Recipe Selection */}
            {params.fabricationEnabled && (
              <>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">
                    {t("fab.recipe")}
                  </Label>
                  <Select
                    value={params.fabricationRecipe || "ideal"}
                    onValueChange={(value) => updateParam("fabricationRecipe", value)}
                  >
                    <SelectTrigger className="w-full h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FABRICATION_RECIPES.map((recipe) => (
                        <SelectItem key={recipe.value} value={recipe.value} className="text-sm">
                          {language === "en" ? recipe.labelEn : language === "zh" ? recipe.labelZh : recipe.labelKo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg">
                  <Info className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                  <p className="text-xs text-amber-700">
                    {t("fab.hint")}
                  </p>
                </div>
              </>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <Button
          onClick={onPreview}
          variant="outline"
          className="flex-1 gap-2"
        >
          <Eye className="w-4 h-4" />
          {t("action.preview")}
        </Button>
        <Button
          onClick={onOptimize}
          disabled={isOptimizing}
          className="flex-1 gap-2 bg-foreground text-background hover:bg-foreground/90"
        >
          <Sparkles className="w-4 h-4" />
          {isOptimizing ? t("action.optimizing") : t("action.optimize")}
        </Button>
      </div>
    </div>
  );
}
