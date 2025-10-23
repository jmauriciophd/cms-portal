/**
 * External Resources Manager
 * Gerenciamento de CSS, JavaScript e HTML externos com aplicação seletiva por página
 */

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import { 
  Code, 
  FileCode, 
  Globe, 
  Plus, 
  Trash2, 
  Save,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  Shield,
  Zap,
  Settings
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '../ui/dialog';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '../ui/alert';
import { Checkbox } from '../ui/checkbox';

interface ExternalResource {
  id: string;
  type: 'css' | 'javascript' | 'html';
  name: string;
  description: string;
  enabled: boolean;
  content: string;
  loadMethod: 'inline' | 'link' | 'import' | 'async' | 'defer' | 'module' | 'iframe' | 'object';
  applyTo: 'all' | 'specific';
  specificPages: string[];
  position: 'head' | 'body-start' | 'body-end';
  priority: number;
  securitySettings: {
    cors: boolean;
    https: boolean;
    integrity?: string;
    sandbox?: string;
    referrerPolicy?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export function ExternalResourcesManager() {
  const [resources, setResources] = useState<ExternalResource[]>([]);
  const [pages, setPages] = useState<any[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingResource, setEditingResource] = useState<ExternalResource | null>(null);
  const [activeTab, setActiveTab] = useState<'css' | 'javascript' | 'html'>('css');
  const [showExamples, setShowExamples] = useState(false);

  useEffect(() => {
    loadResources();
    loadPages();
  }, []);

  const loadResources = () => {
    const stored = localStorage.getItem('external_resources');
    if (stored) {
      setResources(JSON.parse(stored));
    }
  };

  const loadPages = () => {
    const stored = localStorage.getItem('pages');
    if (stored) {
      setPages(JSON.parse(stored));
    }
  };

  const saveResources = (updatedResources: ExternalResource[]) => {
    localStorage.setItem('external_resources', JSON.stringify(updatedResources));
    setResources(updatedResources);
  };

  const handleAddNew = () => {
    const newResource: ExternalResource = {
      id: `resource-${Date.now()}`,
      type: activeTab,
      name: '',
      description: '',
      enabled: true,
      content: '',
      loadMethod: activeTab === 'css' ? 'link' : activeTab === 'javascript' ? 'async' : 'iframe',
      applyTo: 'all',
      specificPages: [],
      position: 'head',
      priority: 50,
      securitySettings: {
        cors: true,
        https: true
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setEditingResource(newResource);
    setShowDialog(true);
  };

  const handleEdit = (resource: ExternalResource) => {
    setEditingResource({ ...resource });
    setActiveTab(resource.type);
    setShowDialog(true);
  };

  const handleSave = () => {
    if (!editingResource) return;

    if (!editingResource.name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    if (!editingResource.content.trim()) {
      toast.error('Conteúdo é obrigatório');
      return;
    }

    const existing = resources.find(r => r.id === editingResource.id);
    let updatedResources: ExternalResource[];

    if (existing) {
      updatedResources = resources.map(r => 
        r.id === editingResource.id 
          ? { ...editingResource, updatedAt: new Date().toISOString() }
          : r
      );
      toast.success('Recurso atualizado com sucesso!');
    } else {
      updatedResources = [...resources, editingResource];
      toast.success('Recurso adicionado com sucesso!');
    }

    saveResources(updatedResources);
    setShowDialog(false);
    setEditingResource(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Deseja realmente excluir este recurso?')) {
      const updatedResources = resources.filter(r => r.id !== id);
      saveResources(updatedResources);
      toast.success('Recurso excluído com sucesso!');
    }
  };

  const handleToggleEnabled = (id: string) => {
    const updatedResources = resources.map(r =>
      r.id === id ? { ...r, enabled: !r.enabled } : r
    );
    saveResources(updatedResources);
  };

  const getCSSExamples = () => `<!-- 1. Link Crítico (bloqueante, para estilos essenciais) -->
<link rel="stylesheet" href="https://cdn.example.com/critical.css">

<!-- 2. Link com Preload (não bloqueante, carrega em paralelo) -->
<link rel="preload" as="style" href="https://cdn.example.com/non-critical.css"
      onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="https://cdn.example.com/non-critical.css"></noscript>

<!-- 3. Link com Integridade SRI (segurança) -->
<link rel="stylesheet" 
      href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
      integrity="sha384-..." 
      crossorigin="anonymous">

<!-- 4. CSS Inline (para estilos críticos pequenos) -->
<style>
  .custom-header { 
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 2rem;
  }
</style>

<!-- 5. @import (evitar em produção, causa bloqueio em cascata) -->
<style>
  @import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600&display=swap");
</style>`;

  const getJavaScriptExamples = () => `<!-- 1. Script Bloqueante Tradicional (usar apenas se necessário no início) -->
<script src="https://cdn.example.com/critical.js"></script>

<!-- 2. Script Async (baixa em paralelo, executa quando pronto - para analytics) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=UA-XXXXX"></script>

<!-- 3. Script Defer (baixa em paralelo, executa após DOM - preferencial) -->
<script defer src="https://cdn.example.com/app.js"></script>

<!-- 4. ES6 Module com Preload -->
<link rel="modulepreload" href="/assets/js/main.js">
<script type="module" src="/assets/js/main.js"></script>

<!-- 5. Module com Fallback para navegadores antigos -->
<script type="module" src="/modern.js"></script>
<script nomodule src="/legacy.js"></script>

<!-- 6. Script com SRI e CORS -->
<script defer 
        src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
        integrity="sha384-..."
        crossorigin="anonymous"></script>

<!-- 7. Script Inline -->
<script>
  // Configuração global
  window.APP_CONFIG = {
    apiUrl: 'https://api.example.com',
    version: '1.0.0'
  };
</script>`;

  const getHTMLExamples = () => `<!-- 1. Iframe com Lazy Loading e Sandbox -->
<iframe 
  src="https://servicos.exemplo.gov.br/widget.html"
  title="Widget de serviços"
  width="100%"
  height="420"
  loading="lazy"
  referrerpolicy="no-referrer"
  sandbox="allow-scripts allow-same-origin"
  allow="clipboard-read; clipboard-write"
></iframe>

<!-- 2. Object para HTML/PDF (com fallback) -->
<object data="/fragments/menu.html" type="text/html" width="100%" height="150">
  <p>Não foi possível carregar o menu. 
     <a href="/sitemap.html">Ver mapa do site</a>
  </p>
</object>

<!-- 3. Embed para conteúdo multimídia -->
<embed 
  src="/widgets/calendar.html" 
  type="text/html" 
  width="300" 
  height="400"
/>

<!-- 4. Template HTML (não renderiza, usado por JavaScript) -->
<template id="card-template">
  <div class="card">
    <h3 class="card-title"></h3>
    <p class="card-content"></p>
  </div>
</template>

<!-- 5. Iframe com CSP restritivo -->
<iframe 
  src="https://maps.google.com/maps?q=..."
  width="600"
  height="450"
  style="border:0;"
  allowfullscreen=""
  loading="lazy"
  referrerpolicy="no-referrer-when-downgrade"
></iframe>`;

  const getBestPractices = (type: 'css' | 'javascript' | 'html') => {
    switch (type) {
      case 'css':
        return [
          '✅ Use preload para CSS não crítico',
          '✅ Inline estilos críticos (< 14KB)',
          '✅ Minimize uso de @import (causa bloqueio)',
          '✅ Use media queries para carregamento condicional',
          '⚠️ Verifique CORS e HTTPS',
          '⚠️ Use SRI (Subresource Integrity) para CDNs'
        ];
      case 'javascript':
        return [
          '✅ Prefira defer para scripts gerais',
          '✅ Use async para scripts independentes (analytics)',
          '✅ Use type="module" para código moderno',
          '✅ Adicione nomodule como fallback',
          '⚠️ Nunca bloqueie o carregamento inicial',
          '⚠️ Use SRI para CDNs externos',
          '⚠️ Sanitize entrada de dados externos'
        ];
      case 'html':
        return [
          '✅ Use loading="lazy" em iframes',
          '✅ Sempre defina sandbox para iframes externos',
          '✅ Configure referrerPolicy adequadamente',
          '✅ Forneça fallback para object/embed',
          '⚠️ Valide origem do conteúdo (CORS)',
          '⚠️ Evite iframes de sites não confiáveis',
          '⚠️ Use Content Security Policy (CSP)'
        ];
    }
  };

  const getSecurityTips = () => [
    '🔒 HTTPS: Sempre use HTTPS para recursos externos',
    '🔒 CORS: Configure Cross-Origin Resource Sharing',
    '🔒 SRI: Use Subresource Integrity para CDNs',
    '🔒 CSP: Configure Content Security Policy headers',
    '🔒 Sandbox: Restrinja capacidades de iframes',
    '🔒 Sanitização: Valide e sanitize todo conteúdo externo'
  ];

  const filteredResources = resources.filter(r => r.type === activeTab);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Recursos Externos
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie CSS, JavaScript e HTML externos com controle de segurança e performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowExamples(!showExamples)}
          >
            <Code className="w-4 h-4 mr-2" />
            {showExamples ? 'Ocultar' : 'Ver'} Exemplos
          </Button>
          <Button onClick={handleAddNew}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Recurso
          </Button>
        </div>
      </div>

      {/* Security Alert */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertTitle>Segurança e Performance</AlertTitle>
        <AlertDescription>
          Recursos externos podem afetar segurança e performance. Configure CORS, HTTPS, SRI e sandbox adequadamente.
        </AlertDescription>
      </Alert>

      {/* Examples Panel */}
      {showExamples && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCode className="w-5 h-5" />
              Exemplos e Boas Práticas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="css">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="css">CSS</TabsTrigger>
                <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                <TabsTrigger value="html">HTML</TabsTrigger>
              </TabsList>

              <TabsContent value="css" className="space-y-4">
                <div>
                  <h4 className="mb-2 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Métodos de Importação CSS
                  </h4>
                  <Textarea
                    value={getCSSExamples()}
                    readOnly
                    rows={15}
                    className="font-mono text-xs"
                  />
                </div>
                <div>
                  <h4 className="mb-2">Boas Práticas</h4>
                  <ul className="space-y-1 text-sm">
                    {getBestPractices('css').map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="javascript" className="space-y-4">
                <div>
                  <h4 className="mb-2 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Métodos de Inclusão JavaScript
                  </h4>
                  <Textarea
                    value={getJavaScriptExamples()}
                    readOnly
                    rows={18}
                    className="font-mono text-xs"
                  />
                </div>
                <div>
                  <h4 className="mb-2">Boas Práticas</h4>
                  <ul className="space-y-1 text-sm">
                    {getBestPractices('javascript').map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="html" className="space-y-4">
                <div>
                  <h4 className="mb-2 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Métodos de Incorporação HTML
                  </h4>
                  <Textarea
                    value={getHTMLExamples()}
                    readOnly
                    rows={20}
                    className="font-mono text-xs"
                  />
                </div>
                <div>
                  <h4 className="mb-2">Boas Práticas</h4>
                  <ul className="space-y-1 text-sm">
                    {getBestPractices('html').map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
              </TabsContent>
            </Tabs>

            <Separator className="my-4" />

            <div>
              <h4 className="mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Considerações de Segurança
              </h4>
              <ul className="space-y-1 text-sm">
                {getSecurityTips().map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resources List */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="css">
            CSS ({resources.filter(r => r.type === 'css').length})
          </TabsTrigger>
          <TabsTrigger value="javascript">
            JavaScript ({resources.filter(r => r.type === 'javascript').length})
          </TabsTrigger>
          <TabsTrigger value="html">
            HTML ({resources.filter(r => r.type === 'html').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4 mt-4">
          {filteredResources.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground mb-4">
                  Nenhum recurso {activeTab === 'css' ? 'CSS' : activeTab === 'javascript' ? 'JavaScript' : 'HTML'} configurado
                </p>
                <Button onClick={handleAddNew}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Primeiro Recurso
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredResources
                .sort((a, b) => b.priority - a.priority)
                .map(resource => (
                  <Card key={resource.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4>{resource.name}</h4>
                            <Badge variant={resource.enabled ? 'default' : 'secondary'}>
                              {resource.enabled ? 'Ativo' : 'Inativo'}
                            </Badge>
                            <Badge variant="outline">{resource.loadMethod}</Badge>
                            <Badge variant="outline">{resource.position}</Badge>
                            {resource.applyTo === 'specific' && (
                              <Badge variant="outline">
                                {resource.specificPages.length} página(s)
                              </Badge>
                            )}
                          </div>
                          
                          {resource.description && (
                            <p className="text-sm text-muted-foreground mb-2">
                              {resource.description}
                            </p>
                          )}

                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Prioridade: {resource.priority}</span>
                            {resource.securitySettings.cors && <span>✅ CORS</span>}
                            {resource.securitySettings.https && <span>✅ HTTPS</span>}
                            {resource.securitySettings.integrity && <span>✅ SRI</span>}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Switch
                            checked={resource.enabled}
                            onCheckedChange={() => handleToggleEnabled(resource.id)}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(resource)}
                          >
                            <Settings className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(resource.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingResource?.name ? 'Editar Recurso' : 'Novo Recurso'}
            </DialogTitle>
            <DialogDescription>
              Configure o recurso externo e escolha onde será aplicado
            </DialogDescription>
          </DialogHeader>

          {editingResource && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <Label>Nome do Recurso *</Label>
                  <Input
                    value={editingResource.name}
                    onChange={(e) => setEditingResource({
                      ...editingResource,
                      name: e.target.value
                    })}
                    placeholder="Ex: Bootstrap CSS, Google Analytics, Widget de Mapa"
                  />
                </div>

                <div>
                  <Label>Descrição</Label>
                  <Textarea
                    value={editingResource.description}
                    onChange={(e) => setEditingResource({
                      ...editingResource,
                      description: e.target.value
                    })}
                    placeholder="Descreva o propósito deste recurso..."
                    rows={2}
                  />
                </div>
              </div>

              <Separator />

              {/* Content */}
              <div className="space-y-4">
                <div>
                  <Label>
                    {editingResource.type === 'css' && 'URL ou Código CSS *'}
                    {editingResource.type === 'javascript' && 'URL ou Código JavaScript *'}
                    {editingResource.type === 'html' && 'URL ou Código HTML *'}
                  </Label>
                  <Textarea
                    value={editingResource.content}
                    onChange={(e) => setEditingResource({
                      ...editingResource,
                      content: e.target.value
                    })}
                    placeholder={
                      editingResource.type === 'css'
                        ? 'https://cdn.example.com/styles.css ou .class { ... }'
                        : editingResource.type === 'javascript'
                        ? 'https://cdn.example.com/script.js ou console.log(...)'
                        : 'https://example.com/widget.html ou <iframe>...</iframe>'
                    }
                    rows={8}
                    className="font-mono text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Método de Carregamento</Label>
                    <Select
                      value={editingResource.loadMethod}
                      onValueChange={(value) => setEditingResource({
                        ...editingResource,
                        loadMethod: value as any
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {editingResource.type === 'css' && (
                          <>
                            <SelectItem value="link">Link (Bloqueante)</SelectItem>
                            <SelectItem value="inline">Inline (Crítico)</SelectItem>
                            <SelectItem value="import">@import (Evitar)</SelectItem>
                          </>
                        )}
                        {editingResource.type === 'javascript' && (
                          <>
                            <SelectItem value="defer">Defer (Recomendado)</SelectItem>
                            <SelectItem value="async">Async (Analytics)</SelectItem>
                            <SelectItem value="module">ES Module</SelectItem>
                            <SelectItem value="inline">Inline</SelectItem>
                          </>
                        )}
                        {editingResource.type === 'html' && (
                          <>
                            <SelectItem value="iframe">IFrame</SelectItem>
                            <SelectItem value="object">Object</SelectItem>
                            <SelectItem value="inline">Inline</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Posição</Label>
                    <Select
                      value={editingResource.position}
                      onValueChange={(value) => setEditingResource({
                        ...editingResource,
                        position: value as any
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="head">&lt;head&gt; (Início)</SelectItem>
                        <SelectItem value="body-start">&lt;body&gt; (Início)</SelectItem>
                        <SelectItem value="body-end">&lt;body&gt; (Final)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Prioridade (0-100)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={editingResource.priority}
                    onChange={(e) => setEditingResource({
                      ...editingResource,
                      priority: parseInt(e.target.value) || 50
                    })}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Maior prioridade = carrega primeiro
                  </p>
                </div>
              </div>

              <Separator />

              {/* Pages Selection */}
              <div className="space-y-4">
                <div>
                  <Label>Aplicar em:</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="apply-all"
                        checked={editingResource.applyTo === 'all'}
                        onChange={() => setEditingResource({
                          ...editingResource,
                          applyTo: 'all',
                          specificPages: []
                        })}
                      />
                      <label htmlFor="apply-all" className="text-sm">
                        Todas as páginas
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="apply-specific"
                        checked={editingResource.applyTo === 'specific'}
                        onChange={() => setEditingResource({
                          ...editingResource,
                          applyTo: 'specific'
                        })}
                      />
                      <label htmlFor="apply-specific" className="text-sm">
                        Páginas específicas
                      </label>
                    </div>
                  </div>
                </div>

                {editingResource.applyTo === 'specific' && (
                  <div className="border rounded-lg p-4">
                    <Label className="mb-2 block">Selecione as páginas:</Label>
                    <ScrollArea className="h-48">
                      <div className="space-y-2">
                        {pages.length === 0 ? (
                          <p className="text-sm text-muted-foreground">
                            Nenhuma página criada ainda
                          </p>
                        ) : (
                          pages.map(page => (
                            <div key={page.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`page-${page.id}`}
                                checked={editingResource.specificPages.includes(page.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setEditingResource({
                                      ...editingResource,
                                      specificPages: [...editingResource.specificPages, page.id]
                                    });
                                  } else {
                                    setEditingResource({
                                      ...editingResource,
                                      specificPages: editingResource.specificPages.filter(id => id !== page.id)
                                    });
                                  }
                                }}
                              />
                              <label
                                htmlFor={`page-${page.id}`}
                                className="text-sm cursor-pointer"
                              >
                                {page.title} <span className="text-muted-foreground">({page.slug})</span>
                              </label>
                            </div>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </div>

              <Separator />

              {/* Security Settings */}
              <div className="space-y-4">
                <h4 className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Configurações de Segurança
                </h4>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="cors">Verificar CORS</Label>
                    <Switch
                      id="cors"
                      checked={editingResource.securitySettings.cors}
                      onCheckedChange={(checked) => setEditingResource({
                        ...editingResource,
                        securitySettings: {
                          ...editingResource.securitySettings,
                          cors: checked
                        }
                      })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="https">Requerer HTTPS</Label>
                    <Switch
                      id="https"
                      checked={editingResource.securitySettings.https}
                      onCheckedChange={(checked) => setEditingResource({
                        ...editingResource,
                        securitySettings: {
                          ...editingResource.securitySettings,
                          https: checked
                        }
                      })}
                    />
                  </div>

                  {editingResource.type !== 'html' && (
                    <div>
                      <Label>SRI Hash (Subresource Integrity)</Label>
                      <Input
                        value={editingResource.securitySettings.integrity || ''}
                        onChange={(e) => setEditingResource({
                          ...editingResource,
                          securitySettings: {
                            ...editingResource.securitySettings,
                            integrity: e.target.value
                          }
                        })}
                        placeholder="sha384-..."
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Hash para validar integridade do recurso
                      </p>
                    </div>
                  )}

                  {editingResource.type === 'html' && editingResource.loadMethod === 'iframe' && (
                    <>
                      <div>
                        <Label>Sandbox (separado por espaço)</Label>
                        <Input
                          value={editingResource.securitySettings.sandbox || ''}
                          onChange={(e) => setEditingResource({
                            ...editingResource,
                            securitySettings: {
                              ...editingResource.securitySettings,
                              sandbox: e.target.value
                            }
                          })}
                          placeholder="allow-scripts allow-same-origin"
                        />
                      </div>

                      <div>
                        <Label>Referrer Policy</Label>
                        <Select
                          value={editingResource.securitySettings.referrerPolicy || 'no-referrer'}
                          onValueChange={(value) => setEditingResource({
                            ...editingResource,
                            securitySettings: {
                              ...editingResource.securitySettings,
                              referrerPolicy: value
                            }
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="no-referrer">no-referrer</SelectItem>
                            <SelectItem value="no-referrer-when-downgrade">no-referrer-when-downgrade</SelectItem>
                            <SelectItem value="origin">origin</SelectItem>
                            <SelectItem value="origin-when-cross-origin">origin-when-cross-origin</SelectItem>
                            <SelectItem value="same-origin">same-origin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Salvar Recurso
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}