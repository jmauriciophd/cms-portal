import { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import { 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Crop,
  Save,
  X,
  Undo,
  Image as ImageIcon,
  Scissors,
  Contrast,
  Sparkles
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { toast } from 'sonner@2.0.3';

interface ImageEditorProps {
  imageUrl: string;
  imageName: string;
  onSave: (editedImageUrl: string, editedImageName: string) => void;
  onClose: () => void;
}

export function ImageEditor({ imageUrl, imageName, onSave, onClose }: ImageEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Edit states
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(100);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [filter, setFilter] = useState<'none' | 'grayscale' | 'sepia' | 'invert' | 'blur' | 'vintage'>('none');
  
  // Crop states
  const [isCropping, setIsCropping] = useState(false);
  const [cropStart, setCropStart] = useState({ x: 0, y: 0 });
  const [cropEnd, setCropEnd] = useState({ x: 0, y: 0 });
  const [cropRect, setCropRect] = useState<{ x: number, y: number, width: number, height: number } | null>(null);
  
  // History for undo
  const [history, setHistory] = useState<string[]>([]);
  
  useEffect(() => {
    loadImage();
  }, [imageUrl]);

  useEffect(() => {
    if (image) {
      renderImage();
    }
  }, [image, rotation, scale, brightness, contrast, saturation, filter]);

  const loadImage = () => {
    setLoading(true);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setImage(img);
      setLoading(false);
      // Save initial state to history
      saveToHistory(imageUrl);
    };
    img.onerror = () => {
      setLoading(false);
      toast.error('Erro ao carregar imagem');
    };
    img.src = imageUrl;
  };

  const saveToHistory = (dataUrl: string) => {
    setHistory(prev => [...prev.slice(-9), dataUrl]); // Keep last 10 states
  };

  const renderImage = () => {
    const canvas = canvasRef.current;
    const previewCanvas = previewCanvasRef.current;
    if (!canvas || !previewCanvas || !image) return;

    const ctx = canvas.getContext('2d');
    const previewCtx = previewCanvas.getContext('2d');
    if (!ctx || !previewCtx) return;

    // Set canvas size
    canvas.width = image.width;
    canvas.height = image.height;
    
    // Set preview canvas size (scaled down)
    const maxPreviewSize = 800;
    const scaleFactor = Math.min(maxPreviewSize / image.width, maxPreviewSize / image.height, 1);
    previewCanvas.width = image.width * scaleFactor;
    previewCanvas.height = image.height * scaleFactor;

    // Clear canvases
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);

    // Apply transformations to both canvases
    [ctx, previewCtx].forEach((context, idx) => {
      const currentCanvas = idx === 0 ? canvas : previewCanvas;
      const currentScale = idx === 0 ? 1 : scaleFactor;
      
      context.save();
      
      // Center and rotate
      context.translate(currentCanvas.width / 2, currentCanvas.height / 2);
      context.rotate((rotation * Math.PI) / 180);
      context.scale(scale / 100, scale / 100);
      
      // Apply filters
      let filterStr = '';
      if (brightness !== 100) filterStr += `brightness(${brightness}%) `;
      if (contrast !== 100) filterStr += `contrast(${contrast}%) `;
      if (saturation !== 100) filterStr += `saturate(${saturation}%) `;
      
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
        case 'blur':
          filterStr += 'blur(2px)';
          break;
        case 'vintage':
          filterStr += 'sepia(50%) contrast(120%) brightness(90%)';
          break;
      }
      
      context.filter = filterStr;
      
      // Draw image
      const width = image.width * currentScale;
      const height = image.height * currentScale;
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
    }
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 10, 200));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 10, 10));
  };

  const handleReset = () => {
    setRotation(0);
    setScale(100);
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setFilter('none');
    setCropRect(null);
    toast.success('Edições resetadas');
  };

  const handleUndo = () => {
    if (history.length > 1) {
      const previousState = history[history.length - 2];
      setHistory(prev => prev.slice(0, -1));
      loadImage();
      toast.success('Ação desfeita');
    }
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
    if (!canvas) return;
    
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
    const scaleFactor = image ? (canvas.width / image.width) : 1;
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
    croppedCanvas.width = cropRect.width;
    croppedCanvas.height = cropRect.height;
    const croppedCtx = croppedCanvas.getContext('2d');
    
    if (!croppedCtx) return;

    // Draw cropped portion
    croppedCtx.drawImage(
      canvas,
      cropRect.x,
      cropRect.y,
      cropRect.width,
      cropRect.height,
      0,
      0,
      cropRect.width,
      cropRect.height
    );

    // Update image
    const img = new Image();
    img.onload = () => {
      setImage(img);
      setCropRect(null);
      setIsCropping(false);
      toast.success('Imagem cortada com sucesso!');
    };
    img.src = croppedCanvas.toDataURL('image/png');
  };

  const handleSave = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setSaving(true);
    
    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const editedImageUrl = canvas.toDataURL('image/png', 0.95);
      const editedName = imageName.replace(/\.[^/.]+$/, '') + '-edited.png';
      
      onSave(editedImageUrl, editedName);
      toast.success('Imagem salva com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar imagem');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[90vh]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h2 className="text-lg font-semibold">Editor de Imagem</h2>
          <p className="text-sm text-gray-500">{imageName}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleUndo} disabled={history.length <= 1}>
            <Undo className="w-4 h-4 mr-2" />
            Desfazer
          </Button>
          <Button variant="outline" onClick={handleReset}>
            <X className="w-4 h-4 mr-2" />
            Resetar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Salvar Edição
              </>
            )}
          </Button>
          <Button variant="ghost" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Preview Area */}
        <div className="flex-1 bg-gray-100 flex items-center justify-center p-4 overflow-auto">
          {loading ? (
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Carregando imagem...</p>
            </div>
          ) : (
            <div className="relative">
              <canvas
                ref={previewCanvasRef}
                className={`max-w-full max-h-[70vh] shadow-lg ${isCropping ? 'cursor-crosshair' : ''}`}
                onMouseDown={startCrop}
                onMouseMove={updateCrop}
                onMouseUp={endCrop}
              />
              {isCropping && (
                <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white px-3 py-2 rounded-lg text-sm">
                  <Scissors className="w-4 h-4 inline mr-2" />
                  Arraste para selecionar a área de corte
                </div>
              )}
            </div>
          )}
        </div>

        {/* Controls Panel */}
        <div className="w-80 border-l overflow-y-auto">
          <Tabs defaultValue="adjust" className="h-full">
            <TabsList className="w-full grid grid-cols-3">
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
            </TabsContent>

            <TabsContent value="filters" className="p-4 space-y-3">
              <p className="text-sm text-gray-600 mb-4">Selecione um filtro para aplicar</p>
              
              <Card 
                className={`cursor-pointer transition-all ${filter === 'none' ? 'ring-2 ring-indigo-600' : ''}`}
                onClick={() => setFilter('none')}
              >
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-400 rounded" />
                    <div>
                      <p className="font-medium">Original</p>
                      <p className="text-xs text-gray-500">Sem filtro</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer transition-all ${filter === 'grayscale' ? 'ring-2 ring-indigo-600' : ''}`}
                onClick={() => setFilter('grayscale')}
              >
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-600 rounded grayscale" />
                    <div>
                      <p className="font-medium">Preto e Branco</p>
                      <p className="text-xs text-gray-500">Tons de cinza</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer transition-all ${filter === 'sepia' ? 'ring-2 ring-indigo-600' : ''}`}
                onClick={() => setFilter('sepia')}
              >
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-200 to-amber-600 rounded sepia" />
                    <div>
                      <p className="font-medium">Sépia</p>
                      <p className="text-xs text-gray-500">Tom envelhecido</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer transition-all ${filter === 'vintage' ? 'ring-2 ring-indigo-600' : ''}`}
                onClick={() => setFilter('vintage')}
              >
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-200 to-red-400 rounded" />
                    <div>
                      <p className="font-medium">Vintage</p>
                      <p className="text-xs text-gray-500">Estilo retrô</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer transition-all ${filter === 'invert' ? 'ring-2 ring-indigo-600' : ''}`}
                onClick={() => setFilter('invert')}
              >
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded" />
                    <div>
                      <p className="font-medium">Inverter</p>
                      <p className="text-xs text-gray-500">Cores invertidas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="transform" className="p-4 space-y-4">
              <div>
                <Label className="mb-3 block">Rotação</Label>
                <div className="flex gap-2">
                  <Button onClick={handleRotate} className="flex-1">
                    <RotateCw className="w-4 h-4 mr-2" />
                    Girar 90°
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">Rotação atual: {rotation}°</p>
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
                >
                  <Crop className="w-4 h-4 mr-2" />
                  {isCropping ? 'Modo de Corte Ativo' : 'Ativar Modo de Corte'}
                </Button>
                {isCropping && (
                  <p className="text-xs text-gray-500 mt-2">
                    Clique e arraste na imagem para selecionar a área de corte
                  </p>
                )}
                {cropRect && (
                  <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
                    <p>Área selecionada:</p>
                    <p>{Math.round(cropRect.width)} × {Math.round(cropRect.height)} px</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Hidden canvas for full-size rendering */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Progress indicator when saving */}
      {saving && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-80">
            <CardContent className="p-6">
              <p className="text-center mb-4">Salvando imagem editada...</p>
              <Progress value={66} className="mb-2" />
              <p className="text-xs text-center text-gray-500">Aplicando edições e otimizando</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
