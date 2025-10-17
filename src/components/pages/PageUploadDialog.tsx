import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { 
  Upload, 
  FileJson, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  FileText,
  AlertCircle,
  Info
} from 'lucide-react';
import { PageVersionService, type PageData, type UploadResult } from '../../services/PageVersionService';
import { toast } from 'sonner@2.0.3';

interface PageUploadDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (page: PageData) => void;
}

export function PageUploadDialog({ open, onClose, onSuccess }: PageUploadDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadResult(null);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.name.endsWith('.json')) {
      setSelectedFile(file);
      setUploadResult(null);
    } else {
      toast.error('Formato inválido', {
        description: 'Use apenas arquivos .json'
      });
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleUpload = async (replaceExisting: boolean = false, existingPageId?: string) => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      // Simular progresso
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      let result: UploadResult;
      
      if (replaceExisting && existingPageId) {
        result = await PageVersionService.uploadPageWithReplace(selectedFile, true, existingPageId);
      } else {
        result = await PageVersionService.uploadPage(selectedFile);
      }

      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadResult(result);

      if (result.success) {
        toast.success('Upload concluído!', {
          description: result.action === 'created' 
            ? 'Página criada com sucesso' 
            : 'Página atualizada com sucesso'
        });

        setTimeout(() => {
          if (result.page) {
            onSuccess(result.page);
            handleClose();
          }
        }, 1500);
      } else if (result.conflict) {
        setShowConflictDialog(true);
      } else {
        toast.error('Erro no upload', {
          description: result.error
        });
      }
    } catch (error: any) {
      toast.error('Erro ao fazer upload', {
        description: error.message
      });
      setUploadResult({
        success: false,
        action: 'cancelled',
        error: error.message
      });
    } finally {
      setUploading(false);
    }
  };

  const handleConflictResolve = (action: 'replace' | 'cancel') => {
    if (action === 'replace' && uploadResult?.conflict?.existingPage) {
      handleUpload(true, uploadResult.conflict.existingPage.id);
      setShowConflictDialog(false);
    } else {
      setShowConflictDialog(false);
      setSelectedFile(null);
      setUploadResult(null);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setUploadResult(null);
    setShowConflictDialog(false);
    setUploadProgress(0);
    onClose();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <>
      <Dialog open={open && !showConflictDialog} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-blue-600" />
              Fazer Upload de Página
            </DialogTitle>
            <DialogDescription>
              Importe uma página exportada anteriormente
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Alert informativo */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <strong>Formatos aceitos:</strong> Arquivos .json exportados pelo sistema
                <br />
                <strong>Tamanho máximo:</strong> 10MB
                <br />
                <strong>Versionamento:</strong> Uma nova versão será criada automaticamente
              </AlertDescription>
            </Alert>

            {/* Área de upload */}
            {!selectedFile && !uploadResult && (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <FileJson className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-700 mb-2">
                  Clique para selecionar ou arraste um arquivo aqui
                </p>
                <p className="text-sm text-gray-500">
                  Apenas arquivos .json
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            )}

            {/* Arquivo selecionado */}
            {selectedFile && !uploadResult && (
              <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <FileJson className="h-8 w-8 text-blue-600 flex-shrink-0 mt-1" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {selectedFile.name}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {formatFileSize(selectedFile.size)}
                      </p>
                      <Badge className="mt-2" variant="outline">
                        Pronto para upload
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedFile(null)}
                    disabled={uploading}
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>

                {/* Progresso */}
                {uploading && (
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Processando...</span>
                      <span className="font-medium">{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} />
                  </div>
                )}
              </div>
            )}

            {/* Resultado */}
            {uploadResult && (
              <Alert variant={uploadResult.success ? 'default' : 'destructive'}>
                {uploadResult.success ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                <AlertDescription>
                  <div className="space-y-2">
                    {uploadResult.success ? (
                      <>
                        <p className="font-medium">Upload concluído com sucesso!</p>
                        {uploadResult.page && (
                          <div className="text-sm text-gray-700 space-y-1">
                            <p><strong>Título:</strong> {uploadResult.page.title}</p>
                            <p><strong>Slug:</strong> {uploadResult.page.slug}</p>
                            {uploadResult.version && (
                              <p><strong>Versão:</strong> v{uploadResult.version.versionNumber}</p>
                            )}
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <p className="font-medium">Erro no upload</p>
                        <p className="text-sm">{uploadResult.error}</p>
                      </>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={uploading}
            >
              {uploadResult?.success ? 'Fechar' : 'Cancelar'}
            </Button>
            {selectedFile && !uploadResult && (
              <Button
                onClick={() => handleUpload()}
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Fazer Upload
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Conflito */}
      <Dialog open={showConflictDialog} onOpenChange={() => setShowConflictDialog(false)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Página Já Existe
            </DialogTitle>
            <DialogDescription>
              Uma página com o mesmo slug já existe no sistema
            </DialogDescription>
          </DialogHeader>

          {uploadResult?.conflict && (
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-medium mb-2">Detalhes do conflito:</p>
                  <div className="text-sm space-y-1">
                    <p><strong>Slug:</strong> {uploadResult.conflict.existingPage.slug}</p>
                    <p><strong>Título atual:</strong> {uploadResult.conflict.existingPage.title}</p>
                    <p><strong>Status:</strong> {uploadResult.conflict.existingPage.status}</p>
                    <p><strong>Última atualização:</strong> {new Date(uploadResult.conflict.existingPage.updatedAt).toLocaleString('pt-BR')}</p>
                  </div>
                </AlertDescription>
              </Alert>

              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Atenção:</strong> Se você escolher substituir, a página atual será movida para o histórico de versões, mas seu conteúdo será completamente substituído pelo conteúdo do arquivo importado.
                </AlertDescription>
              </Alert>

              <div className="bg-gray-50 border rounded-lg p-4 space-y-2">
                <p className="font-medium text-sm">O que será feito:</p>
                <ul className="text-sm space-y-1 list-disc list-inside text-gray-700">
                  <li>A versão atual será salva no histórico</li>
                  <li>O conteúdo será substituído pelo arquivo importado</li>
                  <li>Uma nova versão será criada automaticamente</li>
                  <li>Você poderá restaurar a versão anterior se necessário</li>
                </ul>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => handleConflictResolve('cancel')}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleConflictResolve('replace')}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Substituir Página
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
