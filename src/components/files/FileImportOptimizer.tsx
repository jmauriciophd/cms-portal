import { useState, useRef, useCallback } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Alert, 
  AlertDescription,
  AlertTitle 
} from '../ui/alert';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import {
  Upload,
  FileText,
  Image as ImageIcon,
  Code,
  FileJson,
  FileCode,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  FolderOpen,
  Settings,
  Loader2,
  Download,
  Sparkles,
  Zap,
  Shield
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import {
  FileOptimizationService,
  ProcessedFile,
  OptimizationLevel,
  FileCategory
} from '../../services/FileOptimizationService';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

interface FileImportOptimizerProps {
  open: boolean;
  onClose: () => void;
  onImport: (files: ImportedFile[]) => void;
  currentPath?: string;
}

export interface ImportedFile {
  name: string;
  content: string | ArrayBuffer;
  path: string;
  mimeType: string;
  size: number;
  optimized: boolean;
}

export function FileImportOptimizer({ open, onClose, onImport, currentPath = '/' }: FileImportOptimizerProps) {
  const [files, setFiles] = useState<ProcessedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [optimizationLevel, setOptimizationLevel] = useState<OptimizationLevel>('medium');
  const [selectedFile, setSelectedFile] = useState<ProcessedFile | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    setIsProcessing(true);
    const newFiles: ProcessedFile[] = [];

    try {
      toast.info(`Processando ${selectedFiles.length} arquivo(s)...`);

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        
        // Validação básica
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`${file.name}: Arquivo muito grande (máx 10MB)`);
          continue;
        }

        // Processar arquivo
        const processed = await FileOptimizationService.processFile(file, optimizationLevel);
        newFiles.push(processed);

        // Atualizar UI em tempo real
        setFiles(prev => [...prev, processed]);
      }

      if (newFiles.length > 0) {
        toast.success(`${newFiles.length} arquivo(s) processado(s) com sucesso!`);
      }

    } catch (error) {
      toast.error(`Erro ao processar arquivos: ${error}`);
    } finally {
      setIsProcessing(false);
    }
  }, [optimizationLevel]);

  const handleImport = useCallback(() => {
    const validFiles = files.filter(f => f.status === 'ready');
    
    if (validFiles.length === 0) {
      toast.warning('Nenhum arquivo válido para importar');
      return;
    }

    const imported: ImportedFile[] = validFiles.map(file => ({
      name: file.suggestedName,
      content: file.optimization.optimizedContent,
      path: file.finalPath || file.suggestedPath,
      mimeType: file.analysis.mimeType,
      size: file.optimization.optimizedSize,
      optimized: file.optimization.optimized
    }));

    onImport(imported);
    
    // Limpar e fechar
    setFiles([]);
    onClose();
    
    toast.success(`${imported.length} arquivo(s) importado(s) com sucesso!`, {
      description: `Redução total: ${calculateTotalReduction(validFiles)}`
    });
  }, [files, onImport, onClose]);

  const calculateTotalReduction = (processedFiles: ProcessedFile[]): string => {
    const totalOriginal = processedFiles.reduce((sum, f) => sum + f.optimization.originalSize, 0);
    const totalOptimized = processedFiles.reduce((sum, f) => sum + f.optimization.optimizedSize, 0);
    const reduction = totalOriginal > 0 ? ((1 - totalOptimized / totalOriginal) * 100).toFixed(1) : '0';
    return `${reduction}%`;
  };

  const updateFilePath = (fileIndex: number, newPath: string) => {
    setFiles(prev => prev.map((f, i) => 
      i === fileIndex ? { ...f, finalPath: newPath } : f
    ));
  };

  const getCategoryIcon = (category: FileCategory) => {
    const iconProps = { className: "h-5 w-5" };
    switch (category) {
      case 'page': return <FileText {...iconProps} />;
      case 'image': return <ImageIcon {...iconProps} />;
      case 'style': case 'script': return <Code {...iconProps} />;
      case 'data': return <FileJson {...iconProps} />;
      default: return <FileCode {...iconProps} />;
    }
  };

  const getStatusColor = (status: ProcessedFile['status']) => {
    switch (status) {
      case 'ready': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'analyzing': case 'optimizing': case 'validating': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Importação Inteligente de Arquivos
            </DialogTitle>
            <DialogDescription>
              Sistema avançado com identificação automática, otimização e validação
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 flex-1 overflow-hidden">
            {/* Área de Upload */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle>Selecionar Arquivos</CardTitle>
                  <div className="flex items-center gap-2">
                    <Label className="text-sm">Nível de Otimização:</Label>
                    <Select
                      value={optimizationLevel}
                      onValueChange={(v) => setOptimizationLevel(v as OptimizationLevel)}
                      disabled={isProcessing || files.length > 0}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Nenhuma</SelectItem>
                        <SelectItem value="light">Leve</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="aggressive">Agressiva</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div
                  className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="mb-2">
                    Clique para selecionar ou arraste arquivos aqui
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Suporta: HTML, CSS, JS, Imagens, JSON, Markdown e mais
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Máximo 10MB por arquivo
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFileSelect(e.target.files)}
                  disabled={isProcessing}
                />
              </CardContent>
            </Card>

            {/* Lista de Arquivos */}
            {files.length > 0 && (
              <Card className="flex-1 flex flex-col overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between">
                    <span>Arquivos ({files.length})</span>
                    <div className="flex items-center gap-2 text-sm font-normal">
                      <Badge variant="outline">
                        {files.filter(f => f.status === 'ready').length} prontos
                      </Badge>
                      <Badge variant="outline">
                        {files.filter(f => f.status === 'error').length} com erro
                      </Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden p-0">
                  <ScrollArea className="h-full px-6 pb-6">
                    <div className="space-y-3">
                      {files.map((file, index) => (
                        <Card key={index} className="overflow-hidden">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              {/* Ícone */}
                              <div className="flex-shrink-0 mt-1">
                                {getCategoryIcon(file.analysis.category)}
                              </div>

                              {/* Informações */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-medium truncate">{file.file.name}</h4>
                                    <p className="text-sm text-muted-foreground">
                                      {file.analysis.contentType}
                                      {file.analysis.characteristics.dimensions && (
                                        <> • {file.analysis.characteristics.dimensions.width}x{file.analysis.characteristics.dimensions.height}</>
                                      )}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {file.status === 'ready' && (
                                      <CheckCircle className="h-5 w-5 text-green-600" />
                                    )}
                                    {file.status === 'error' && (
                                      <XCircle className="h-5 w-5 text-red-600" />
                                    )}
                                    {['analyzing', 'optimizing', 'validating'].includes(file.status) && (
                                      <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                                    )}
                                  </div>
                                </div>

                                {/* Progress Bar */}
                                {file.status !== 'ready' && file.status !== 'error' && (
                                  <div className="mb-2">
                                    <Progress value={file.progress} className="h-1" />
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {file.status === 'analyzing' && 'Analisando arquivo...'}
                                      {file.status === 'optimizing' && 'Otimizando...'}
                                      {file.status === 'validating' && 'Validando...'}
                                    </p>
                                  </div>
                                )}

                                {/* Status e Métricas */}
                                {file.status === 'ready' && (
                                  <div className="space-y-2">
                                    {/* Badges */}
                                    <div className="flex flex-wrap gap-2">
                                      {file.optimization.optimized && (
                                        <Badge variant="secondary" className="text-xs">
                                          <Zap className="h-3 w-3 mr-1" />
                                          Otimizado {((1 - file.optimization.compressionRatio) * 100).toFixed(0)}%
                                        </Badge>
                                      )}
                                      {file.validation.isValid && (
                                        <Badge variant="secondary" className="text-xs">
                                          <Shield className="h-3 w-3 mr-1" />
                                          Validado
                                        </Badge>
                                      )}
                                      <Badge variant="outline" className="text-xs">
                                        Score: {file.validation.qualityScore.toFixed(0)}%
                                      </Badge>
                                    </div>

                                    {/* Avisos */}
                                    {file.validation.warnings.length > 0 && (
                                      <Alert variant="default" className="py-2">
                                        <AlertTriangle className="h-4 w-4" />
                                        <AlertDescription className="text-xs">
                                          {file.validation.warnings[0]}
                                          {file.validation.warnings.length > 1 && (
                                            <> (e mais {file.validation.warnings.length - 1})</>
                                          )}
                                        </AlertDescription>
                                      </Alert>
                                    )}

                                    {/* Seletor de Destino */}
                                    <div className="flex items-center gap-2">
                                      <FolderOpen className="h-4 w-4 text-muted-foreground" />
                                      <Input
                                        value={file.finalPath || file.suggestedPath}
                                        onChange={(e) => updateFilePath(index, e.target.value)}
                                        placeholder="Caminho de destino"
                                        className="h-8 text-sm"
                                      />
                                      {file.analysis.confidence < 0.7 && (
                                        <Badge variant="outline" className="text-xs whitespace-nowrap">
                                          Revisar
                                        </Badge>
                                      )}
                                    </div>

                                    {/* Ações */}
                                    <div className="flex gap-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                          setSelectedFile(file);
                                          setShowPreview(true);
                                        }}
                                      >
                                        <Eye className="h-4 w-4 mr-1" />
                                        Preview
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => {
                                          setSelectedFile(file);
                                        }}
                                      >
                                        <Settings className="h-4 w-4 mr-1" />
                                        Detalhes
                                      </Button>
                                    </div>
                                  </div>
                                )}

                                {/* Erro */}
                                {file.status === 'error' && file.error && (
                                  <Alert variant="destructive" className="py-2">
                                    <XCircle className="h-4 w-4" />
                                    <AlertDescription className="text-xs">
                                      {file.error}
                                    </AlertDescription>
                                  </Alert>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </div>

          <DialogFooter>
            <div className="flex items-center justify-between w-full">
              <div className="text-sm text-muted-foreground">
                {files.length > 0 && (
                  <>
                    Redução total: <strong>{calculateTotalReduction(files)}</strong>
                  </>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleImport}
                  disabled={files.filter(f => f.status === 'ready').length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Importar {files.filter(f => f.status === 'ready').length > 0 && 
                    `(${files.filter(f => f.status === 'ready').length})`}
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      {showPreview && selectedFile && (
        <PreviewDialog
          file={selectedFile}
          open={showPreview}
          onClose={() => {
            setShowPreview(false);
            setSelectedFile(null);
          }}
        />
      )}

      {/* Details Panel (opcional - pode ser expandido) */}
      {selectedFile && !showPreview && (
        <DetailsPanel
          file={selectedFile}
          open={!!selectedFile}
          onClose={() => setSelectedFile(null)}
        />
      )}
    </>
  );
}

// =============================================================================
// PREVIEW DIALOG
// =============================================================================

interface PreviewDialogProps {
  file: ProcessedFile;
  open: boolean;
  onClose: () => void;
}

function PreviewDialog({ file, open, onClose }: PreviewDialogProps) {
  const preview = file.preview;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Preview: {file.file.name}</DialogTitle>
          <DialogDescription>
            {file.analysis.contentType} • {formatBytes(file.optimization.optimizedSize)}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[60vh] w-full rounded border">
          {preview.type === 'html' && (
            <div className="p-4">
              <iframe
                srcDoc={preview.content}
                className="w-full h-full min-h-[500px] border-0"
                sandbox="allow-same-origin"
                title="HTML Preview"
              />
            </div>
          )}

          {preview.type === 'image' && (
            <div className="p-4 flex items-center justify-center bg-checkered">
              <img
                src={preview.content}
                alt="Preview"
                className="max-w-full h-auto"
              />
            </div>
          )}

          {(preview.type === 'text' || preview.type === 'json') && (
            <pre className="p-4 text-sm font-mono bg-muted/50">
              <code>{preview.content}</code>
            </pre>
          )}

          {preview.type === 'none' && (
            <div className="p-8 text-center text-muted-foreground">
              {preview.content}
            </div>
          )}
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// =============================================================================
// DETAILS PANEL
// =============================================================================

interface DetailsPanelProps {
  file: ProcessedFile;
  open: boolean;
  onClose: () => void;
}

function DetailsPanel({ file, open, onClose }: DetailsPanelProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Detalhes: {file.file.name}</DialogTitle>
          <DialogDescription>
            Informações completas sobre análise, otimização e validação
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="analysis" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="analysis">Análise</TabsTrigger>
            <TabsTrigger value="optimization">Otimização</TabsTrigger>
            <TabsTrigger value="validation">Validação</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[50vh] mt-4">
            <TabsContent value="analysis" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <InfoItem label="Categoria" value={file.analysis.contentType} />
                <InfoItem label="Tipo MIME" value={file.analysis.mimeType} />
                <InfoItem label="Tamanho Original" value={formatBytes(file.analysis.originalSize)} />
                <InfoItem label="Confiança" value={`${(file.analysis.confidence * 100).toFixed(0)}%`} />
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2">Características</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(file.analysis.characteristics).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-muted-foreground">{key}:</span>
                      <span>{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <InfoItem label="Destino Sugerido" value={file.suggestedPath} />
            </TabsContent>

            <TabsContent value="optimization" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <InfoItem label="Status" value={file.optimization.optimized ? 'Otimizado' : 'Original'} />
                <InfoItem label="Tempo" value={`${file.optimization.timeTaken}ms`} />
                <InfoItem label="Tamanho Original" value={formatBytes(file.optimization.originalSize)} />
                <InfoItem label="Tamanho Final" value={formatBytes(file.optimization.optimizedSize)} />
                <InfoItem 
                  label="Redução" 
                  value={`${((1 - file.optimization.compressionRatio) * 100).toFixed(2)}%`} 
                />
              </div>

              {file.optimization.appliedOptimizations.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-2">Otimizações Aplicadas</h4>
                    <ul className="space-y-1 text-sm">
                      {file.optimization.appliedOptimizations.map((opt, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                          {opt}
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}

              {file.optimization.logs.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-2">Logs</h4>
                    <div className="space-y-1 text-xs font-mono bg-muted p-2 rounded">
                      {file.optimization.logs.map((log, i) => (
                        <div key={i}>{log}</div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="validation" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <InfoItem 
                  label="Status" 
                  value={file.validation.isValid ? 'Válido' : 'Inválido'} 
                />
                <InfoItem 
                  label="Score de Qualidade" 
                  value={`${file.validation.qualityScore.toFixed(0)}%`} 
                />
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2">Verificações</h4>
                <div className="space-y-2">
                  {file.validation.checks.map((check, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      {check.status === 'valid' && <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />}
                      {check.status === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />}
                      {check.status === 'error' && <XCircle className="h-4 w-4 text-red-600 mt-0.5" />}
                      <div className="flex-1">
                        <div className="font-medium">{check.name}</div>
                        <div className="text-muted-foreground">{check.message}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {file.validation.suggestions.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-2">Sugestões</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {file.validation.suggestions.map((suggestion, i) => (
                        <li key={i}>• {suggestion}</li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <DialogFooter>
          <Button onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// =============================================================================
// UTILITÁRIOS
// =============================================================================

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
