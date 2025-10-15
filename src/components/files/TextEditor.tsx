import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Save, X } from 'lucide-react';

interface TextEditorProps {
  file?: {
    id: string;
    name: string;
    content?: string;
  };
  currentPath: string;
  onSave: (name: string, content: string) => void;
  onClose: () => void;
}

export function TextEditor({ file, currentPath, onSave, onClose }: TextEditorProps) {
  const [fileName, setFileName] = useState(file?.name || 'novo-documento.txt');
  const [content, setContent] = useState(file?.content || '');

  const handleSave = () => {
    if (!fileName.trim()) {
      alert('Digite um nome para o arquivo');
      return;
    }
    
    // Garantir extensão .txt
    let finalName = fileName.trim();
    if (!finalName.endsWith('.txt')) {
      finalName += '.txt';
    }
    
    onSave(finalName, content);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {file ? 'Editar Arquivo de Texto' : 'Novo Arquivo de Texto'}
          </DialogTitle>
          <DialogDescription>
            Caminho: {currentPath}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Nome do Arquivo</Label>
            <Input
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="documento.txt"
            />
            <p className="text-xs text-gray-500 mt-1">
              A extensão .txt será adicionada automaticamente se não especificada
            </p>
          </div>

          <div className="flex-1">
            <Label>Conteúdo</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Digite o conteúdo do arquivo..."
              rows={20}
              className="font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              {content.length} caracteres
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
