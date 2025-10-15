import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Search, Layout, Check, X } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  description: string;
  type: 'article' | 'page' | 'email';
  components: any[];
  thumbnail?: string;
  isDefault?: boolean;
  status: 'draft' | 'published';
  createdAt: string;
}

interface TemplateSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'article' | 'page';
  onSelectTemplate: (template: Template | null) => void;
}

export function TemplateSelector({ open, onOpenChange, type, onSelectTemplate }: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  useEffect(() => {
    if (open) {
      loadTemplates();
    }
  }, [open, type]);

  const loadTemplates = () => {
    const stored = localStorage.getItem('templates');
    if (stored) {
      const allTemplates: Template[] = JSON.parse(stored);
      // Filtrar por tipo e apenas publicados
      const filtered = allTemplates.filter(
        t => t.type === type && t.status === 'published'
      );
      setTemplates(filtered);

      // Auto-selecionar template padrão se existir
      const defaultTemplate = filtered.find(t => t.isDefault);
      if (defaultTemplate) {
        setSelectedTemplate(defaultTemplate);
      }
    }
  };

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleConfirm = () => {
    onSelectTemplate(selectedTemplate);
    onOpenChange(false);
  };

  const handleSkip = () => {
    onSelectTemplate(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layout className="w-5 h-5" />
            Selecionar Template
          </DialogTitle>
          <DialogDescription>
            Escolha um template para começar ou pule para criar do zero
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Templates Grid */}
          <ScrollArea className="h-[400px]">
            {filteredTemplates.length === 0 ? (
              <div className="text-center py-12">
                <Layout className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">
                  {searchTerm ? 'Nenhum template encontrado' : 'Nenhum template disponível'}
                </p>
                <p className="text-sm text-gray-400">
                  {!searchTerm && 'Crie templates em Gerenciar Templates'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 p-1">
                {filteredTemplates.map((template) => (
                  <Card
                    key={template.id}
                    className={`cursor-pointer transition-all ${
                      selectedTemplate?.id === template.id
                        ? 'border-indigo-500 ring-2 ring-indigo-200'
                        : 'hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base flex items-center gap-2">
                            {template.name}
                            {template.isDefault && (
                              <Badge variant="default" className="text-xs">
                                Padrão
                              </Badge>
                            )}
                          </CardTitle>
                          <CardDescription className="text-xs mt-1">
                            {template.description}
                          </CardDescription>
                        </div>
                        {selectedTemplate?.id === template.id && (
                          <div className="bg-indigo-500 rounded-full p-1">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {/* Thumbnail */}
                        {template.thumbnail ? (
                          <img
                            src={template.thumbnail}
                            alt={template.name}
                            className="w-full h-32 object-cover rounded border"
                          />
                        ) : (
                          <div className="w-full h-32 bg-gray-100 rounded border flex items-center justify-center">
                            <Layout className="w-8 h-8 text-gray-300" />
                          </div>
                        )}

                        {/* Info */}
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{template.components?.length || 0} componentes</span>
                          <span>
                            {new Date(template.createdAt).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button variant="outline" onClick={handleSkip}>
              <X className="w-4 h-4 mr-2" />
              Começar do Zero
            </Button>
            <Button onClick={handleConfirm} disabled={!selectedTemplate}>
              <Check className="w-4 h-4 mr-2" />
              Usar Template Selecionado
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
