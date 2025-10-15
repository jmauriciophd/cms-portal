import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Check, X, Layout, Lock } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Template } from '../templates/TemplateManager';

interface AdvancedTemplateSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'article' | 'page';
  onSelectTemplates: (templates: {
    header?: Template;
    content?: Template;
    footer?: Template;
  }) => void;
}

export function AdvancedTemplateSelector({ 
  open, 
  onOpenChange, 
  type, 
  onSelectTemplates 
}: AdvancedTemplateSelectorProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedHeader, setSelectedHeader] = useState<Template | null>(null);
  const [selectedContent, setSelectedContent] = useState<Template | null>(null);
  const [selectedFooter, setSelectedFooter] = useState<Template | null>(null);
  const [activeTab, setActiveTab] = useState<'header' | 'content' | 'footer'>('content');

  useEffect(() => {
    if (open) {
      loadTemplates();
    }
  }, [open]);

  const loadTemplates = () => {
    const stored = localStorage.getItem('templates');
    if (stored) {
      const allTemplates: Template[] = JSON.parse(stored);
      setTemplates(allTemplates);
    }
  };

  const headerTemplates = templates.filter(t => t.type === 'header');
  const contentTemplates = templates.filter(t => t.type === type);
  const footerTemplates = templates.filter(t => t.type === 'footer');

  const handleConfirm = () => {
    if (!selectedContent && !selectedHeader && !selectedFooter) {
      toast.error('Selecione pelo menos um template');
      return;
    }

    onSelectTemplates({
      header: selectedHeader || undefined,
      content: selectedContent || undefined,
      footer: selectedFooter || undefined
    });
    onOpenChange(false);
    
    const parts = [];
    if (selectedHeader) parts.push('cabeçalho');
    if (selectedContent) parts.push('conteúdo');
    if (selectedFooter) parts.push('rodapé');
    
    toast.success(`Templates aplicados: ${parts.join(', ')}`);
  };

  const handleSkip = () => {
    onSelectTemplates({});
    onOpenChange(false);
  };

  const renderTemplateCard = (
    template: Template,
    isSelected: boolean,
    onSelect: () => void
  ) => (
    <Card
      key={template.id}
      className={`cursor-pointer transition-all ${
        isSelected
          ? 'border-indigo-500 ring-2 ring-indigo-200'
          : 'hover:border-gray-300'
      }`}
      onClick={onSelect}
    >
      <CardHeader className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-sm flex items-center gap-2">
              {template.name}
              {template.locked && (
                <Lock className="w-3 h-3 text-amber-500" title="Bloqueado para edição" />
              )}
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              {template.description}
            </CardDescription>
          </div>
          {isSelected && (
            <div className="bg-indigo-500 rounded-full p-1">
              <Check className="w-3 h-3 text-white" />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {/* Preview */}
        <div className="w-full h-24 bg-gray-100 rounded border flex items-center justify-center mb-2">
          <Layout className="w-6 h-6 text-gray-300" />
        </div>

        {/* Info */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{template.components?.length || 0} componentes</span>
          {template.locked && (
            <Badge variant="outline" className="text-xs">
              🔒 Protegido
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layout className="w-5 h-5" />
            Selecionar Templates (Avançado)
          </DialogTitle>
          <DialogDescription>
            Escolha templates para cabeçalho, conteúdo e rodapé separadamente.
            Templates de estrutura (cabeçalho/rodapé) ficam bloqueados para edição.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="header" className="relative">
              Cabeçalho
              {selectedHeader && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-500 rounded-full" />
              )}
            </TabsTrigger>
            <TabsTrigger value="content" className="relative">
              Conteúdo
              {selectedContent && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-500 rounded-full" />
              )}
            </TabsTrigger>
            <TabsTrigger value="footer" className="relative">
              Rodapé
              {selectedFooter && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-500 rounded-full" />
              )}
            </TabsTrigger>
          </TabsList>

          {/* Header Tab */}
          <TabsContent value="header" className="mt-4">
            <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                🔒 <strong>Templates de cabeçalho são bloqueados:</strong> Você não poderá editar 
                os componentes do cabeçalho após aplicá-lo. Isso mantém a consistência visual.
              </p>
            </div>
            <ScrollArea className="h-[400px]">
              {headerTemplates.length === 0 ? (
                <div className="text-center py-12">
                  <Layout className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">Nenhum template de cabeçalho disponível</p>
                  <p className="text-sm text-gray-400">
                    Crie templates de cabeçalho em Gerenciar Templates
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4 p-1">
                  {/* Opção "Nenhum" */}
                  <Card
                    className={`cursor-pointer transition-all ${
                      !selectedHeader
                        ? 'border-indigo-500 ring-2 ring-indigo-200'
                        : 'hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedHeader(null)}
                  >
                    <CardHeader className="p-4">
                      <CardTitle className="text-sm">Sem Cabeçalho</CardTitle>
                      <CardDescription className="text-xs">
                        Não usar template de cabeçalho
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="w-full h-24 bg-gray-50 rounded border border-dashed flex items-center justify-center">
                        <X className="w-6 h-6 text-gray-300" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  {headerTemplates.map(template =>
                    renderTemplateCard(
                      template,
                      selectedHeader?.id === template.id,
                      () => setSelectedHeader(template)
                    )
                  )}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="mt-4">
            <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                📝 <strong>Template de conteúdo:</strong> Define a estrutura do seu {type === 'page' ? 'página' : 'artigo'}. 
                Você poderá editar todos os componentes.
              </p>
            </div>
            <ScrollArea className="h-[400px]">
              {contentTemplates.length === 0 ? (
                <div className="text-center py-12">
                  <Layout className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">Nenhum template de {type === 'page' ? 'página' : 'artigo'} disponível</p>
                  <p className="text-sm text-gray-400">
                    Crie templates em Gerenciar Templates
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4 p-1">
                  {/* Opção "Nenhum" */}
                  <Card
                    className={`cursor-pointer transition-all ${
                      !selectedContent
                        ? 'border-indigo-500 ring-2 ring-indigo-200'
                        : 'hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedContent(null)}
                  >
                    <CardHeader className="p-4">
                      <CardTitle className="text-sm">Em Branco</CardTitle>
                      <CardDescription className="text-xs">
                        Começar do zero
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="w-full h-24 bg-gray-50 rounded border border-dashed flex items-center justify-center">
                        <X className="w-6 h-6 text-gray-300" />
                      </div>
                    </CardContent>
                  </Card>

                  {contentTemplates.map(template =>
                    renderTemplateCard(
                      template,
                      selectedContent?.id === template.id,
                      () => setSelectedContent(template)
                    )
                  )}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          {/* Footer Tab */}
          <TabsContent value="footer" className="mt-4">
            <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                🔒 <strong>Templates de rodapé são bloqueados:</strong> Você não poderá editar 
                os componentes do rodapé após aplicá-lo. Isso mantém a consistência visual.
              </p>
            </div>
            <ScrollArea className="h-[400px]">
              {footerTemplates.length === 0 ? (
                <div className="text-center py-12">
                  <Layout className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">Nenhum template de rodapé disponível</p>
                  <p className="text-sm text-gray-400">
                    Crie templates de rodapé em Gerenciar Templates
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4 p-1">
                  {/* Opção "Nenhum" */}
                  <Card
                    className={`cursor-pointer transition-all ${
                      !selectedFooter
                        ? 'border-indigo-500 ring-2 ring-indigo-200'
                        : 'hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedFooter(null)}
                  >
                    <CardHeader className="p-4">
                      <CardTitle className="text-sm">Sem Rodapé</CardTitle>
                      <CardDescription className="text-xs">
                        Não usar template de rodapé
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="w-full h-24 bg-gray-50 rounded border border-dashed flex items-center justify-center">
                        <X className="w-6 h-6 text-gray-300" />
                      </div>
                    </CardContent>
                  </Card>

                  {footerTemplates.map(template =>
                    renderTemplateCard(
                      template,
                      selectedFooter?.id === template.id,
                      () => setSelectedFooter(template)
                    )
                  )}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {/* Summary */}
        <div className="border-t pt-4">
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <h4 className="text-sm font-medium mb-2">Templates Selecionados:</h4>
            <div className="space-y-1 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Cabeçalho:</span>
                <span className="font-medium">
                  {selectedHeader ? (
                    <span className="flex items-center gap-1">
                      {selectedHeader.name}
                      <Lock className="w-3 h-3 text-amber-500" />
                    </span>
                  ) : (
                    <span className="text-gray-400">Nenhum</span>
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Conteúdo:</span>
                <span className="font-medium">
                  {selectedContent ? selectedContent.name : <span className="text-gray-400">Nenhum</span>}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Rodapé:</span>
                <span className="font-medium">
                  {selectedFooter ? (
                    <span className="flex items-center gap-1">
                      {selectedFooter.name}
                      <Lock className="w-3 h-3 text-amber-500" />
                    </span>
                  ) : (
                    <span className="text-gray-400">Nenhum</span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={handleSkip}>
              <X className="w-4 h-4 mr-2" />
              Começar do Zero
            </Button>
            <Button 
              onClick={handleConfirm}
              disabled={!selectedContent && !selectedHeader && !selectedFooter}
            >
              <Check className="w-4 h-4 mr-2" />
              Aplicar Templates
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
