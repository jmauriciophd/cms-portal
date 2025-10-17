import { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import { 
  RotateCw, 
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  ZoomIn, 
  ZoomOut, 
  Crop,
  Save,
  X,
  Undo,
  Redo,
  Download,
  Scissors,
  Contrast,
  Sparkles,
  Maximize2,
  Info
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner@2.0.3';
import { AuditService } from '../../services/AuditService';
import { SecurityService } from '../../services/SecurityService';

interface ImageEditorProps {
  imageUrl: string;
  imageName: string;
  onSave: (editedImageUrl: string, editedImageName: string) => void;
  onClose: () => void;
}

interface ImageState {
  dataUrl: string;
  width: number;
  height: number;
}

export function ImageEditor({ imageUrl, imageName, onSave, onClose }: ImageEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Image info
  const [originalSize, setOriginalSize] = useState({ width: 0, height: 0, bytes: 0 });
  const [currentSize, setCurrentSize] = useState({ width: 0, height: 0, bytes: 0 });
  
  // Edit states
  const [rotation, setRotation] = useState(0);
  const [flipHorizontal, setFlipHorizontal] = useState(false);
  const [flipVertical, setFlipVertical] = useState(false);
  const [scale, setScale] = useState(100);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [hue, setHue] = useState(0);
  const [blur, setBlur] = useState(0);
  const [filter, setFilter] = useState<'none' | 'grayscale' | 'sepia' | 'invert' | 'vintage' | 'warm' | 'cool'>('none');
  
  // Resize states
  const [newWidth, setNewWidth] = useState<number>(0);
  const [newHeight, setNewHeight] = useState<number>(0);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  
  // Crop states
  const [isCropping, setIsCropping] = useState(false);
  const [cropStart, setCropStart] = useState({ x: 0, y: 0 });
  const [cropEnd, setCropEnd] = useState({ x: 0, y: 0 });
  const [cropRect, setCropRect] = useState<{ x: number, y: number, width: number, height: number } | null>(null);
  
  // History for undo/redo
  const [history, setHistory] = useState<ImageState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // Save dialog
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [exportFormat, setExportFormat] = useState<'png' | 'jpg' | 'webp'>('png');
  const [quality, setQuality] = useState(95);

  useEffect(() => {
    loadImage();
  }, [imageUrl]);

  useEffect(() => {
    if (image) {
      renderImage();
      updateCurrentSize();
    }
  }, [image, rotation, flipHorizontal, flipVertical, scale, brightness, contrast, saturation, hue, blur, filter, newWidth, newHeight]);

  const loadImage = () => {
    setLoading(true);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setImage(img);
      setOriginalSize({ 
        width: img.width, 
        height: img.height,
        bytes: estimateImageSize(img.width, img.height)
      });
      setNewWidth(img.width);
      setNewHeight(img.height);
      setLoading(false);
      
      // Save initial state to history
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL('image/png');
        addToHistory({ dataUrl, width: img.width, height: img.height });
      }
    };
    img.onerror = () => {
      setLoading(false);
      toast.error('Erro ao carregar imagem');
    };
    img.src = imageUrl;
  };

  const estimateImageSize = (width: number, height: number, format: string = 'png'): number => {
    // Estimativa aproximada do tamanho em bytes
    const pixelCount = width * height;
    const bytesPerPixel = format === 'jpg' ? 0.5 : format === 'webp' ? 0.3 : 4;
    return Math.round(pixelCount * bytesPerPixel);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const addToHistory = (state: ImageState) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(state);
    // Limitar histórico a 20 estados
    if (newHistory.length > 20) {
      newHistory.shift();
    }
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const updateCurrentSize = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    setCurrentSize({
      width: canvas.width,
      height: canvas.height,
      bytes: estimateImageSize(canvas.width, canvas.height, exportFormat)
    });
  };

  const renderImage = () => {
    const canvas = canvasRef.current;
    const previewCanvas = previewCanvasRef.current;
    if (!canvas || !previewCanvas || !image) return;

    const ctx = canvas.getContext('2d');
    const previewCtx = previewCanvas.getContext('2d');
    if (!ctx || !previewCtx) return;

    // Calculate dimensions based on resize settings
    const targetWidth = newWidth || image.width;
    const targetHeight = newHeight || image.height;

    // Set canvas size
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    
    // Set preview canvas size (scaled down)
    const maxPreviewSize = 800;
    const scaleFactor = Math.min(maxPreviewSize / targetWidth, maxPreviewSize / targetHeight, 1);
    previewCanvas.width = targetWidth * scaleFactor;
    previewCanvas.height = targetHeight * scaleFactor;

    // Clear canvases
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);

    // Apply transformations to both canvases
    [ctx, previewCtx].forEach((context, idx) => {
      const currentCanvas = idx === 0 ? canvas : previewCanvas;
      const currentScale = idx === 0 ? 1 : scaleFactor;
      
      context.save();
      
      // Center and apply transformations
      context.translate(currentCanvas.width / 2, currentCanvas.height / 2);
      
      // Rotation
      context.rotate((rotation * Math.PI) / 180);
      
      // Flip
      const flipX = flipHorizontal ? -1 : 1;
      const flipY = flipVertical ? -1 : 1;
      context.scale(flipX * (scale / 100), flipY * (scale / 100));
      
      // Apply filters
      let filterStr = '';
      if (brightness !== 100) filterStr += `brightness(${brightness}%) `;
      if (contrast !== 100) filterStr += `contrast(${contrast}%) `;
      if (saturation !== 100) filterStr += `saturate(${saturation}%) `;
      if (hue !== 0) filterStr += `hue-rotate(${hue}deg) `;
      if (blur > 0) filterStr += `blur(${blur}px) `;
      
      switch (filter) {
        case 'grayscale':
          filterStr += 'grayscale(100%)';
          break;
        case 'sepia':
          filterStr += 'sepia(100%)';
          break;
        case 'invert':
          filterStr += 'invert(100%)';
          break;
        case 'vintage':
          filterStr += 'sepia(50%) contrast(120%) brightness(90%)';
          break;
        case 'warm':
          filterStr += 'sepia(20%) saturate(130%) hue-rotate(-10deg)';
          break;
        case 'cool':
          filterStr += 'saturate(110%) hue-rotate(10deg) brightness(105%)';
          break;
      }
      
      context.filter = filterStr;
      
      // Draw image
      const width = targetWidth * currentScale;
      const height = targetHeight * currentScale;
      context.drawImage(image, -width / 2, -height / 2, width, height);
      
      context.restore();
    });

    // Draw crop rectangle on preview
    if (cropRect && previewCtx) {
      previewCtx.strokeStyle = '#4F46E5';
      previewCtx.lineWidth = 2;
      previewCtx.setLineDash([5, 5]);
      previewCtx.strokeRect(
        cropRect.x * scaleFactor,
        cropRect.y * scaleFactor,
        cropRect.width * scaleFactor,
        cropRect.height * scaleFactor
      );
      previewCtx.setLineDash([]);
      
      // Add semi-transparent overlay outside crop area
      previewCtx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      previewCtx.fillRect(0, 0, previewCanvas.width, cropRect.y * scaleFactor);
      previewCtx.fillRect(0, cropRect.y * scaleFactor, cropRect.x * scaleFactor, cropRect.height * scaleFactor);
      previewCtx.fillRect((cropRect.x + cropRect.width) * scaleFactor, cropRect.y * scaleFactor, previewCanvas.width, cropRect.height * scaleFactor);
      previewCtx.fillRect(0, (cropRect.y + cropRect.height) * scaleFactor, previewCanvas.width, previewCanvas.height);
    }
  };

  const handleRotate = (degrees: number) => {
    setRotation((prev) => (prev + degrees) % 360);
  };

  const handleFlipHorizontal = () => {
    setFlipHorizontal(!flipHorizontal);
  };

  const handleFlipVertical = () => {
    setFlipVertical(!flipVertical);
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 10, 200));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 10, 10));
  };

  const handleWidthChange = (value: number) => {
    setNewWidth(value);
    if (maintainAspectRatio && image) {
      const aspectRatio = image.width / image.height;
      setNewHeight(Math.round(value / aspectRatio));
    }
  };

  const handleHeightChange = (value: number) => {
    setNewHeight(value);
    if (maintainAspectRatio && image) {
      const aspectRatio = image.width / image.height;
      setNewWidth(Math.round(value * aspectRatio));
    }
  };

  const handleReset = () => {
    setRotation(0);
    setFlipHorizontal(false);
    setFlipVertical(false);
    setScale(100);
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setHue(0);
    setBlur(0);
    setFilter('none');
    setCropRect(null);
    if (image) {
      setNewWidth(image.width);
      setNewHeight(image.height);
    }
    toast.success('Edições resetadas');
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const state = history[newIndex];
      restoreFromState(state);
      setHistoryIndex(newIndex);
      toast.success('Ação desfeita');
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const state = history[newIndex];
      restoreFromState(state);
      setHistoryIndex(newIndex);
      toast.success('Ação refeita');
    }
  };

  const restoreFromState = (state: ImageState) => {
    const img = new Image();
    img.onload = () => {
      setImage(img);
      setNewWidth(state.width);
      setNewHeight(state.height);
    };
    img.src = state.dataUrl;
  };

  const startCrop = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isCropping) return;
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setCropStart({ x, y });
    setCropEnd({ x, y });
  };

  const updateCrop = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isCropping || cropStart.x === 0) return;
    
    const canvas = previewCanvasRef.current;
    if (!canvas || !image) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setCropEnd({ x, y });
    
    // Calculate crop rectangle
    const cropX = Math.min(cropStart.x, x);
    const cropY = Math.min(cropStart.y, y);
    const cropWidth = Math.abs(x - cropStart.x);
    const cropHeight = Math.abs(y - cropStart.y);
    
    // Scale to original image size
    const scaleFactor = canvas.width / (newWidth || image.width);
    setCropRect({
      x: cropX / scaleFactor,
      y: cropY / scaleFactor,
      width: cropWidth / scaleFactor,
      height: cropHeight / scaleFactor
    });
    
    renderImage();
  };

  const endCrop = () => {
    if (cropRect && cropRect.width > 10 && cropRect.height > 10) {
      applyCrop();
    }
    setCropStart({ x: 0, y: 0 });
    setCropEnd({ x: 0, y: 0 });
  };

  const applyCrop = () => {
    if (!cropRect || !image) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Create a new canvas with cropped dimensions
    const croppedCanvas = document.createElement('canvas');
    croppedCanvas.width = Math.round(cropRect.width);
    croppedCanvas.height = Math.round(cropRect.height);
    const croppedCtx = croppedCanvas.getContext('2d');
    
    if (!croppedCtx) return;

    // Draw cropped portion
    croppedCtx.drawImage(
      canvas,
      Math.round(cropRect.x),
      Math.round(cropRect.y),
      Math.round(cropRect.width),
      Math.round(cropRect.height),
      0,
      0,
      Math.round(cropRect.width),
      Math.round(cropRect.height)
    );

    // Update image
    const img = new Image();
    img.onload = () => {
      setImage(img);
      setNewWidth(croppedCanvas.width);
      setNewHeight(croppedCanvas.height);
      setCropRect(null);
      setIsCropping(false);
      
      // Add to history
      const dataUrl = croppedCanvas.toDataURL('image/png');
      addToHistory({ dataUrl, width: croppedCanvas.width, height: croppedCanvas.height });
      
      toast.success('Imagem cortada com sucesso!');
    };
    img.src = croppedCanvas.toDataURL('image/png');
  };

  const handleSaveClick = () => {
    setShowSaveDialog(true);
  };

  const handleSaveConfirm = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setSaving(true);
    
    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Determine MIME type and quality
      let mimeType = 'image/png';
      let qualityValue = 1;
      
      if (exportFormat === 'jpg') {
        mimeType = 'image/jpeg';
        qualityValue = quality / 100;
      } else if (exportFormat === 'webp') {
        mimeType = 'image/webp';
        qualityValue = quality / 100;
      }
      
      const editedImageUrl = canvas.toDataURL(mimeType, qualityValue);
      const extension = exportFormat === 'jpg' ? 'jpg' : exportFormat;
      const baseName = imageName.replace(/\.[^/.]+$/, '');
      const editedName = `${baseName}-editado.${extension}`;
      
      // Audit log
      const user = SecurityService.getCurrentUser();
      AuditService.log({
        action: 'image_edited',
        userId: user?.id || 'system',
        details: {
          originalName: imageName,
          editedName,
          format: exportFormat,
          originalSize: originalSize,
          newSize: currentSize
        },
        severity: 'info'
      });
      
      onSave(editedImageUrl, editedName);
      toast.success('Imagem salva com sucesso!');
      setShowSaveDialog(false);
      
      // Close editor after short delay
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      toast.error('Erro ao salvar imagem');
      console.error('Erro ao salvar:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[98vh]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div>
          <h2 className="text-lg">Editor de Imagem</h2>
          <p className="text-sm text-gray-500">{imageName}</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleUndo} 
            disabled={historyIndex <= 0}
          >
            <Undo className="w-4 h-4 mr-2" />
            Desfazer
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRedo} 
            disabled={historyIndex >= history.length - 1}
          >
            <Redo className="w-4 h-4 mr-2" />
            Refazer
          </Button>
          <Button variant="outline" size="sm" onClick={handleReset}>
            <X className="w-4 h-4 mr-2" />
            Resetar
          </Button>
          <Button size="sm" onClick={handleSaveClick} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            Salvar
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Preview Area */}
        <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center p-4 overflow-auto">
          {loading ? (
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Carregando imagem...</p>
            </div>
          ) : (
            <>
              <div className="relative mb-4">
                <canvas
                  ref={previewCanvasRef}
                  className={`max-w-full max-h-[85vh] shadow-2xl rounded-lg ${isCropping ? 'cursor-crosshair' : ''}`}
                  onMouseDown={startCrop}
                  onMouseMove={updateCrop}
                  onMouseUp={endCrop}
                  style={{
                    background: 'repeating-conic-gradient(#e5e7eb 0% 25%, #f3f4f6 0% 50%) 50% / 20px 20px'
                  }}
                />
                {isCropping && (
                  <div className="absolute top-4 left-4 bg-black bg-opacity-75 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-2">
                    <Scissors className="w-4 h-4" />
                    Arraste para selecionar a área de corte
                  </div>
                )}
              </div>
              
              {/* Image Info */}
              <Card className="w-full max-w-md">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Info className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">Dimensões:</span>
                    </div>
                    <span className="font-mono">{currentSize.width} × {currentSize.height} px</span>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Controls Panel */}
        <div className="w-80 border-l overflow-y-auto bg-white">
          <Tabs defaultValue="adjust" className="h-full">
            <TabsList className="w-full grid grid-cols-4 rounded-none border-b">
              <TabsTrigger value="adjust" className="text-xs">
                <Contrast className="w-4 h-4 mr-1" />
                Ajustar
              </TabsTrigger>
              <TabsTrigger value="filters" className="text-xs">
                <Sparkles className="w-4 h-4 mr-1" />
                Filtros
              </TabsTrigger>
              <TabsTrigger value="transform" className="text-xs">
                <RotateCw className="w-4 h-4 mr-1" />
                Transformar
              </TabsTrigger>
              <TabsTrigger value="resize" className="text-xs">
                <Maximize2 className="w-4 h-4 mr-1" />
                Redimensionar
              </TabsTrigger>
            </TabsList>

            <TabsContent value="adjust" className="p-4 space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Brilho</Label>
                  <Badge variant="secondary">{brightness}%</Badge>
                </div>
                <Slider
                  value={[brightness]}
                  onValueChange={([value]) => setBrightness(value)}
                  min={0}
                  max={200}
                  step={1}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Contraste</Label>
                  <Badge variant="secondary">{contrast}%</Badge>
                </div>
                <Slider
                  value={[contrast]}
                  onValueChange={([value]) => setContrast(value)}
                  min={0}
                  max={200}
                  step={1}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Saturação</Label>
                  <Badge variant="secondary">{saturation}%</Badge>
                </div>
                <Slider
                  value={[saturation]}
                  onValueChange={([value]) => setSaturation(value)}
                  min={0}
                  max={200}
                  step={1}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Matiz</Label>
                  <Badge variant="secondary">{hue}°</Badge>
                </div>
                <Slider
                  value={[hue]}
                  onValueChange={([value]) => setHue(value)}
                  min={0}
                  max={360}
                  step={1}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Desfoque</Label>
                  <Badge variant="secondary">{blur}px</Badge>
                </div>
                <Slider
                  value={[blur]}
                  onValueChange={([value]) => setBlur(value)}
                  min={0}
                  max={10}
                  step={0.5}
                />
              </div>
            </TabsContent>

            <TabsContent value="filters" className="p-4 space-y-3">
              <p className="text-sm text-gray-600 mb-4">Selecione um filtro para aplicar</p>
              
              {[
                { id: 'none', name: 'Original', desc: 'Sem filtro', gradient: 'from-gray-200 to-gray-400' },
                { id: 'grayscale', name: 'Preto e Branco', desc: 'Tons de cinza', gradient: 'from-gray-400 to-gray-600' },
                { id: 'sepia', name: 'Sépia', desc: 'Tom envelhecido', gradient: 'from-amber-200 to-amber-600' },
                { id: 'vintage', name: 'Vintage', desc: 'Estilo retrô', gradient: 'from-orange-200 to-red-400' },
                { id: 'warm', name: 'Quente', desc: 'Tons quentes', gradient: 'from-yellow-300 to-orange-500' },
                { id: 'cool', name: 'Frio', desc: 'Tons frios', gradient: 'from-blue-300 to-cyan-500' },
                { id: 'invert', name: 'Inverter', desc: 'Cores invertidas', gradient: 'from-blue-600 to-purple-600' }
              ].map((f) => (
                <Card 
                  key={f.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${filter === f.id ? 'ring-2 ring-indigo-600' : ''}`}
                  onClick={() => setFilter(f.id as any)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 bg-gradient-to-br ${f.gradient} rounded ${f.id === 'grayscale' ? 'grayscale' : ''}`} />
                      <div>
                        <p className="font-medium">{f.name}</p>
                        <p className="text-xs text-gray-500">{f.desc}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="transform" className="p-4 space-y-4">
              <div>
                <Label className="mb-3 block">Rotação</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={() => handleRotate(90)} variant="outline" size="sm">
                    <RotateCw className="w-4 h-4 mr-2" />
                    90° →
                  </Button>
                  <Button onClick={() => handleRotate(-90)} variant="outline" size="sm">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    ← 90°
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">Rotação atual: {rotation}°</p>
              </div>

              <div>
                <Label className="mb-3 block">Espelhar</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    onClick={handleFlipHorizontal} 
                    variant={flipHorizontal ? 'default' : 'outline'} 
                    size="sm"
                  >
                    <FlipHorizontal className="w-4 h-4 mr-2" />
                    Horizontal
                  </Button>
                  <Button 
                    onClick={handleFlipVertical} 
                    variant={flipVertical ? 'default' : 'outline'} 
                    size="sm"
                  >
                    <FlipVertical className="w-4 h-4 mr-2" />
                    Vertical
                  </Button>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Escala</Label>
                  <Badge variant="secondary">{scale}%</Badge>
                </div>
                <div className="flex gap-2 mb-2">
                  <Button onClick={handleZoomOut} variant="outline" size="sm">
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <Button onClick={handleZoomIn} variant="outline" size="sm">
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                </div>
                <Slider
                  value={[scale]}
                  onValueChange={([value]) => setScale(value)}
                  min={10}
                  max={200}
                  step={5}
                />
              </div>

              <div className="pt-4 border-t">
                <Label className="mb-3 block">Cortar Imagem</Label>
                <Button 
                  onClick={() => setIsCropping(!isCropping)} 
                  variant={isCropping ? 'default' : 'outline'}
                  className="w-full"
                  size="sm"
                >
                  <Crop className="w-4 h-4 mr-2" />
                  {isCropping ? 'Modo de Corte Ativo' : 'Ativar Modo de Corte'}
                </Button>
                {isCropping && (
                  <p className="text-xs text-gray-500 mt-2">
                    Clique e arraste na imagem para selecionar a área
                  </p>
                )}
                {cropRect && (
                  <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
                    <p>Área selecionada:</p>
                    <p className="font-mono">{Math.round(cropRect.width)} × {Math.round(cropRect.height)} px</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="resize" className="p-4 space-y-4">
              <div className="space-y-4">
                <div>
                  <Label className="mb-2 block">Largura (px)</Label>
                  <input
                    type="number"
                    value={newWidth}
                    onChange={(e) => handleWidthChange(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border rounded-md"
                    min="1"
                  />
                </div>

                <div>
                  <Label className="mb-2 block">Altura (px)</Label>
                  <input
                    type="number"
                    value={newHeight}
                    onChange={(e) => handleHeightChange(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border rounded-md"
                    min="1"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="aspect-ratio"
                    checked={maintainAspectRatio}
                    onChange={(e) => setMaintainAspectRatio(e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="aspect-ratio" className="cursor-pointer">
                    Manter proporção
                  </Label>
                </div>

                <div className="p-3 bg-blue-50 rounded-lg text-sm">
                  <p className="text-gray-700 mb-1">Tamanho original:</p>
                  <p className="font-mono text-indigo-700">
                    {originalSize.width} × {originalSize.height} px
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    {formatFileSize(originalSize.bytes)}
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Hidden canvas for full-size rendering */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Save Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Salvar Imagem Editada</DialogTitle>
            <DialogDescription>
              Escolha o formato e qualidade para exportação
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label className="mb-2 block">Formato de Exportação</Label>
              <Select value={exportFormat} onValueChange={(value: any) => setExportFormat(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="png">PNG (melhor qualidade)</SelectItem>
                  <SelectItem value="jpg">JPG (menor tamanho)</SelectItem>
                  <SelectItem value="webp">WebP (moderna)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(exportFormat === 'jpg' || exportFormat === 'webp') && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Qualidade</Label>
                  <Badge variant="secondary">{quality}%</Badge>
                </div>
                <Slider
                  value={[quality]}
                  onValueChange={([value]) => setQuality(value)}
                  min={1}
                  max={100}
                  step={1}
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Original</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  <p className="text-xs text-gray-600">Dimensões:</p>
                  <p className="font-mono text-sm">{originalSize.width} × {originalSize.height}</p>
                  <p className="text-xs text-gray-600 mt-2">Tamanho:</p>
                  <p className="font-mono text-sm">{formatFileSize(originalSize.bytes)}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Editada</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  <p className="text-xs text-gray-600">Dimensões:</p>
                  <p className="font-mono text-sm">{currentSize.width} × {currentSize.height}</p>
                  <p className="text-xs text-gray-600 mt-2">Tamanho estimado:</p>
                  <p className="font-mono text-sm">{formatFileSize(estimateImageSize(currentSize.width, currentSize.height, exportFormat))}</p>
                </CardContent>
              </Card>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={handleSaveConfirm} disabled={saving}>
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Salvando...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Salvar Cópia
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Progress overlay when saving */}
      {saving && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-80">
            <CardContent className="p-6">
              <p className="text-center mb-4">Salvando imagem editada...</p>
              <Progress value={66} className="mb-2" />
              <p className="text-xs text-center text-gray-500">
                Aplicando edições e otimizando ({exportFormat.toUpperCase()})
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
