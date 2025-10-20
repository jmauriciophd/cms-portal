import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Switch } from '../ui/switch';
import { Save, Code, Palette, Database, FileCode, Shield, Sparkles, Users, History, RefreshCw, Link as LinkIcon, Upload } from 'lucide-react';
import { PermissionsManager } from './PermissionsManager';
import { AIProviderConfig } from '../ai/AIProviderConfig';
import { usePermissions, withPermission } from '../auth/PermissionsContext';
import { toast } from 'sonner@2.0.3';
import { SecurityMonitor } from '../security/SecurityMonitor';
import { UserManager } from '../users/UserManager';
import { ContentSyncManager } from '../content/ContentSyncManager';
import { LinkManager } from '../links/LinkManager';
import { BatchImportManager } from '../batch-import/BatchImportManager';

interface Settings {
  siteName: string;
  siteDescription: string;
  customCSS: string;
  customJS: string;
  customHTML: string;
  customFields: Array<{
    id: string;
    name: string;
    type: string;
    label: string;
  }>;
  templates: Array<{
    id: string;
    name: string;
    content: string;
  }>;
}

interface SystemSettingsProps {
  currentUser?: any;
}

export function SystemSettings({ currentUser }: SystemSettingsProps = {}) {
  const { hasPermission } = usePermissions();
  
  const [settings, setSettings] = useState<Settings>({
    siteName: 'Portal CMS',
    siteDescription: 'Sistema de Gerenciamento de Conteúdo',
    customCSS: '',
    customJS: '',
    customHTML: '',
    customFields: [],
    templates: []
  });

  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState('text');
  const [newFieldLabel, setNewFieldLabel] = useState('');

  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateContent, setNewTemplateContent] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    const stored = localStorage.getItem('settings');
    if (stored) {
      setSettings(JSON.parse(stored));
    }
  };

  const saveSettings = () => {
    localStorage.setItem('settings', JSON.stringify(settings));
    toast.success('Configurações salvas com sucesso!');
  };

  const addCustomField = () => {
    if (!newFieldName || !newFieldLabel) {
      toast.error('Preencha todos os campos');
      return;
    }

    const newField = {
      id: Date.now().toString(),
      name: newFieldName,
      type: newFieldType,
      label: newFieldLabel
    };

    setSettings({
      ...settings,
      customFields: [...settings.customFields, newField]
    });

    setNewFieldName('');
    setNewFieldLabel('');
    toast.success('Campo personalizado adicionado!');
  };

  const deleteCustomField = (id: string) => {
    setSettings({
      ...settings,
      customFields: settings.customFields.filter(f => f.id !== id)
    });
    toast.success('Campo removido!');
  };

  const addTemplate = () => {
    if (!newTemplateName || !newTemplateContent) {
      toast.error('Preencha o nome e conteúdo do template');
      return;
    }

    const newTemplate = {
      id: Date.now().toString(),
      name: newTemplateName,
      content: newTemplateContent
    };

    setSettings({
      ...settings,
      templates: [...settings.templates, newTemplate]
    });

    setNewTemplateName('');
    setNewTemplateContent('');
    toast.success('Template criado com sucesso!');
  };

  const deleteTemplate = (id: string) => {
    setSettings({
      ...settings,
      templates: settings.templates.filter(t => t.id !== id)
    });
    toast.success('Template removido!');
  };

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `settings-${Date.now()}.json`;
    link.click();
    toast.success('Configurações exportadas!');
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-gray-900 mb-2">Configurações do Sistema</h1>
          <p className="text-gray-600">Personalize e configure seu portal</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportSettings}>
            Exportar JSON
          </Button>
          <Button onClick={saveSettings}>
            <Save className="w-4 h-4 mr-2" />
            Salvar Tudo
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-11 gap-1 h-auto">
          <TabsTrigger value="general">
            <Database className="w-4 h-4 mr-2" />
            Geral
          </TabsTrigger>
          <TabsTrigger value="customization">
            <Code className="w-4 h-4 mr-2" />
            CSS/JS
          </TabsTrigger>
          <TabsTrigger value="fields">
            <FileCode className="w-4 h-4 mr-2" />
            Campos
          </TabsTrigger>
          <TabsTrigger value="templates">
            <Palette className="w-4 h-4 mr-2" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="ai">
            <Sparkles className="w-4 h-4 mr-2" />
            IA
          </TabsTrigger>
          {hasPermission('settings.permissions') && (
            <TabsTrigger value="permissions">
              <Shield className="w-4 h-4 mr-2" />
              Permissões
            </TabsTrigger>
          )}
          {hasPermission('users.view') && (
            <TabsTrigger value="users">
              <Users className="w-4 h-4 mr-2" />
              Usuários
            </TabsTrigger>
          )}
          {hasPermission('security.view') && (
            <TabsTrigger value="security">
              <History className="w-4 h-4 mr-2" />
              Segurança
            </TabsTrigger>
          )}
          <TabsTrigger value="sync">
            <RefreshCw className="w-4 h-4 mr-2" />
            Sincronização
          </TabsTrigger>
          <TabsTrigger value="links">
            <LinkIcon className="w-4 h-4 mr-2" />
            Links
          </TabsTrigger>
          <TabsTrigger value="batch-import">
            <Upload className="w-4 h-4 mr-2" />
            Importação em Lote
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Gerais</CardTitle>
              <CardDescription>Informações básicas do portal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="siteName">Nome do Site</Label>
                <Input
                  id="siteName"
                  value={settings.siteName}
                  onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="siteDescription">Descrição do Site</Label>
                <Textarea
                  id="siteDescription"
                  value={settings.siteDescription}
                  onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Customization */}
        <TabsContent value="customization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>CSS Personalizado</CardTitle>
              <CardDescription>Adicione estilos customizados ao seu portal</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={settings.customCSS}
                onChange={(e) => setSettings({ ...settings, customCSS: e.target.value })}
                placeholder=".custom-class { color: blue; }"
                rows={10}
                className="font-mono text-sm"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>JavaScript Personalizado</CardTitle>
              <CardDescription>Adicione scripts customizados (use com cuidado)</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={settings.customJS}
                onChange={(e) => setSettings({ ...settings, customJS: e.target.value })}
                placeholder="console.log('Custom script');"
                rows={10}
                className="font-mono text-sm"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>HTML Personalizado</CardTitle>
              <CardDescription>Adicione HTML customizado às páginas</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={settings.customHTML}
                onChange={(e) => setSettings({ ...settings, customHTML: e.target.value })}
                placeholder="<div>Custom HTML</div>"
                rows={10}
                className="font-mono text-sm"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Custom Fields */}
        <TabsContent value="fields">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Adicionar Campo Personalizado</CardTitle>
                <CardDescription>Crie novos campos para suas matérias e páginas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fieldName">Nome do Campo (ID)</Label>
                  <Input
                    id="fieldName"
                    value={newFieldName}
                    onChange={(e) => setNewFieldName(e.target.value)}
                    placeholder="meu_campo"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fieldLabel">Label do Campo</Label>
                  <Input
                    id="fieldLabel"
                    value={newFieldLabel}
                    onChange={(e) => setNewFieldLabel(e.target.value)}
                    placeholder="Meu Campo"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fieldType">Tipo do Campo</Label>
                  <select
                    id="fieldType"
                    value={newFieldType}
                    onChange={(e) => setNewFieldType(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="text">Texto</option>
                    <option value="textarea">Área de Texto</option>
                    <option value="number">Número</option>
                    <option value="date">Data</option>
                    <option value="checkbox">Checkbox</option>
                  </select>
                </div>

                <Button onClick={addCustomField} className="w-full">
                  Adicionar Campo
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Campos Personalizados Ativos</CardTitle>
                <CardDescription>
                  {settings.customFields.length} campo(s) configurado(s)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {settings.customFields.map((field) => (
                    <Card key={field.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="mb-1">{field.label}</p>
                            <p className="text-xs text-gray-500">
                              ID: {field.name} • Tipo: {field.type}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteCustomField(field.id)}
                            className="text-red-600"
                          >
                            Remover
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {settings.customFields.length === 0 && (
                    <p className="text-center text-gray-500 py-8">
                      Nenhum campo personalizado configurado
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Templates */}
        <TabsContent value="templates">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Criar Template</CardTitle>
                <CardDescription>Templates reutilizáveis para páginas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="templateName">Nome do Template</Label>
                  <Input
                    id="templateName"
                    value={newTemplateName}
                    onChange={(e) => setNewTemplateName(e.target.value)}
                    placeholder="Meu Template"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="templateContent">Conteúdo HTML</Label>
                  <Textarea
                    id="templateContent"
                    value={newTemplateContent}
                    onChange={(e) => setNewTemplateContent(e.target.value)}
                    placeholder="<div>Template HTML...</div>"
                    rows={12}
                    className="font-mono text-sm"
                  />
                </div>

                <Button onClick={addTemplate} className="w-full">
                  Criar Template
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Templates Disponíveis</CardTitle>
                <CardDescription>
                  {settings.templates.length} template(s) criado(s)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {settings.templates.map((template) => (
                    <Card key={template.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <p className="font-medium">{template.name}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteTemplate(template.id)}
                            className="text-red-600"
                          >
                            Remover
                          </Button>
                        </div>
                        <div className="bg-gray-100 p-2 rounded text-xs font-mono overflow-auto max-h-32">
                          {template.content}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {settings.templates.length === 0 && (
                    <p className="text-center text-gray-500 py-8">
                      Nenhum template criado
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* AI Configuration */}
        <TabsContent value="ai">
          <AIProviderConfig />
        </TabsContent>

        {/* Permissions Management - Admin Only */}
        {hasPermission('settings.permissions') && (
          <TabsContent value="permissions">
            <PermissionsManager />
          </TabsContent>
        )}

        {/* Users Management - Admin Only */}
        {hasPermission('users.view') && (
          <TabsContent value="users">
            <UserManager />
          </TabsContent>
        )}

        {/* Security Monitor - Admin Only */}
        {hasPermission('security.view') && (
          <TabsContent value="security">
            <SecurityMonitor />
          </TabsContent>
        )}

        {/* Content Sync */}
        <TabsContent value="sync">
          <ContentSyncManager />
        </TabsContent>

        {/* Link Manager */}
        <TabsContent value="links">
          <LinkManager currentUser={currentUser} />
        </TabsContent>

        {/* Batch Import Manager */}
        <TabsContent value="batch-import">
          <BatchImportManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
