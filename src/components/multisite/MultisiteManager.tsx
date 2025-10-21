import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { 
  Globe, 
  Plus, 
  Trash, 
  Settings, 
  Copy, 
  Download, 
  Upload,
  Eye,
  EyeOff,
  Link as LinkIcon,
  Palette,
  FileText,
  BarChart,
  Check,
  X,
  Wrench,
  Save
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { multisiteService, Site, useMultisite } from '../../services/MultisiteService';
import { Progress } from '../ui/progress';

export function MultisiteManager() {
  const { currentSite, sites, switchSite, createSite, updateSite, deleteSite } = useMultisite();
  const [showNewSiteDialog, setShowNewSiteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showStatsDialog, setShowStatsDialog] = useState(false);
  const [editingSite, setEditingSite] = useState<Site | null>(null);
  const [selectedSiteForStats, setSelectedSiteForStats] = useState<string | null>(null);
  const [newSiteData, setNewSiteData] = useState({
    name: '',
    slug: '',
    description: '',
    domain: ''
  });

  useEffect(() => {
    // Inicializar serviço
    multisiteService.initialize();
  }, []);

  const handleCreateSite = () => {
    if (!newSiteData.name.trim()) {
      toast.error('Digite um nome para o site');
      return;
    }

    try {
      const site = createSite({
        name: newSiteData.name,
        slug: newSiteData.slug || undefined,
        description: newSiteData.description,
        domain: newSiteData.domain || undefined,
        status: 'active',
        settings: {
          language: 'pt-BR',
          timezone: 'America/Sao_Paulo',
          dateFormat: 'DD/MM/YYYY',
          siteTitle: newSiteData.name,
          siteDescription: newSiteData.description
        }
      });

      toast.success(`Site "${site.name}" criado com sucesso!`);
      setShowNewSiteDialog(false);
      setNewSiteData({ name: '', slug: '', description: '', domain: '' });
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar site');
    }
  };

  const handleUpdateSite = () => {
    if (!editingSite) return;

    try {
      updateSite(editingSite.id, editingSite);
      toast.success('Site atualizado com sucesso!');
      setShowEditDialog(false);
      setEditingSite(null);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar site');
    }
  };

  const handleDeleteSite = (siteId: string) => {
    const site = sites.find(s => s.id === siteId);
    if (!site) return;

    if (!confirm(`Tem certeza que deseja excluir o site "${site.name}"? Todos os dados serão perdidos permanentemente.`)) {
      return;
    }

    try {
      deleteSite(siteId);
      toast.success('Site excluído com sucesso');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir site');
    }
  };

  const handleDuplicateSite = (siteId: string) => {
    const site = sites.find(s => s.id === siteId);
    if (!site) return;

    const newName = prompt(`Digite o nome para o novo site (cópia de "${site.name}"):`, `${site.name} (Cópia)`);
    if (!newName) return;

    try {
      const duplicated = multisiteService.duplicateSite(siteId, newName);
      toast.success(`Site "${duplicated.name}" criado com sucesso!`);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao duplicar site');
    }
  };

  const handleExportSite = (siteId: string) => {
    const site = sites.find(s => s.id === siteId);
    if (!site) return;

    try {
      const exportData = multisiteService.exportSite(siteId);
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `site-${site.slug}-${Date.now()}.json`;
      link.click();
      toast.success('Site exportado com sucesso!');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao exportar site');
    }
  };

  const handleImportSite = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const jsonData = event.target?.result as string;
          const imported = multisiteService.importSite(jsonData);
          toast.success(`Site "${imported.name}" importado com sucesso!`);
        } catch (error: any) {
          toast.error(error.message || 'Erro ao importar site');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const getSiteStats = (siteId: string) => {
    return multisiteService.getSiteStats(siteId);
  };

  const getStatusColor = (status: Site['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: Site['status']) => {
    switch (status) {
      case 'active':
        return <Check className="w-3 h-3" />;
      case 'inactive':
        return <X className="w-3 h-3" />;
      case 'maintenance':
        return <Wrench className="w-3 h-3" />;
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-gray-900 mb-2 flex items-center gap-2">
            <Globe className="w-6 h-6" />
            Gerenciamento de Multisites
          </h1>
          <p className="text-gray-600">
            Gerencie múltiplos sites a partir de uma única instalação
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleImportSite}>
            <Upload className="w-4 h-4 mr-2" />
            Importar Site
          </Button>
          <Button onClick={() => setShowNewSiteDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Site
          </Button>
        </div>
      </div>

      {/* Current Site Indicator */}
      {currentSite && (
        <Card className="mb-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-indigo-600" />
                <div>
                  <p className="text-sm text-gray-600">Site Atual:</p>
                  <p className="font-medium text-gray-900">{currentSite.name}</p>
                </div>
              </div>
              <Badge className={getStatusColor(currentSite.status)}>
                {getStatusIcon(currentSite.status)}
                <span className="ml-1 capitalize">{currentSite.status}</span>
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sites Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sites.map((site) => {
          const stats = getSiteStats(site.id);
          const isCurrentSite = currentSite?.id === site.id;

          return (
            <Card 
              key={site.id} 
              className={`relative ${isCurrentSite ? 'border-indigo-500 border-2' : ''}`}
            >
              {isCurrentSite && (
                <div className="absolute top-2 right-2">
                  <Badge variant="default" className="bg-indigo-600">
                    Atual
                  </Badge>
                </div>
              )}

              <CardHeader>
                <CardTitle className="flex items-center gap-2 pr-16">
                  <Globe className="w-5 h-5" />
                  {site.name}
                </CardTitle>
                <CardDescription>{site.description || 'Sem descrição'}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge className={getStatusColor(site.status)}>
                    {getStatusIcon(site.status)}
                    <span className="ml-1 capitalize">{site.status}</span>
                  </Badge>
                  {site.domain && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <LinkIcon className="w-3 h-3" />
                      {site.domain}
                    </Badge>
                  )}
                </div>

                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Slug:</span>
                    <span className="font-mono">{site.slug}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Páginas:</span>
                    <span>{stats.pages}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Artigos:</span>
                    <span>{stats.articles}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Arquivos:</span>
                    <span>{stats.files}</span>
                  </div>
                </div>

                <div className="pt-4 border-t space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    {!isCurrentSite && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => switchSite(site.id)}
                        className="w-full"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Ativar
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingSite(site);
                        setShowEditDialog(true);
                      }}
                      className={isCurrentSite ? 'col-span-2' : ''}
                    >
                      <Settings className="w-3 h-3 mr-1" />
                      Editar
                    </Button>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedSiteForStats(site.id);
                        setShowStatsDialog(true);
                      }}
                      title="Estatísticas"
                    >
                      <BarChart className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDuplicateSite(site.id)}
                      title="Duplicar"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExportSite(site.id)}
                      title="Exportar"
                    >
                      <Download className="w-3 h-3" />
                    </Button>
                  </div>

                  {sites.length > 1 && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteSite(site.id)}
                      className="w-full"
                    >
                      <Trash className="w-3 h-3 mr-1" />
                      Excluir Site
                    </Button>
                  )}
                </div>

                <div className="text-xs text-gray-500">
                  Criado em {new Date(site.createdAt).toLocaleDateString('pt-BR')}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* New Site Dialog */}
      <Dialog open={showNewSiteDialog} onOpenChange={setShowNewSiteDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Criar Novo Site</DialogTitle>
            <DialogDescription>
              Configure um novo site no sistema multisite
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Nome do Site *</Label>
              <Input
                value={newSiteData.name}
                onChange={(e) => setNewSiteData({ ...newSiteData, name: e.target.value })}
                placeholder="Ex: Portal Institucional"
              />
            </div>

            <div>
              <Label>Slug (Identificador único)</Label>
              <Input
                value={newSiteData.slug}
                onChange={(e) => setNewSiteData({ ...newSiteData, slug: e.target.value })}
                placeholder="portal-institucional (gerado automaticamente se vazio)"
              />
            </div>

            <div>
              <Label>Domínio (opcional)</Label>
              <Input
                value={newSiteData.domain}
                onChange={(e) => setNewSiteData({ ...newSiteData, domain: e.target.value })}
                placeholder="www.meusite.com.br"
              />
            </div>

            <div>
              <Label>Descrição</Label>
              <Textarea
                value={newSiteData.description}
                onChange={(e) => setNewSiteData({ ...newSiteData, description: e.target.value })}
                placeholder="Descrição do site"
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleCreateSite} className="flex-1">
                <Plus className="w-4 h-4 mr-2" />
                Criar Site
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowNewSiteDialog(false);
                  setNewSiteData({ name: '', slug: '', description: '', domain: '' });
                }}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Site Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Site: {editingSite?.name}</DialogTitle>
            <DialogDescription>
              Configure as opções do site
            </DialogDescription>
          </DialogHeader>

          {editingSite && (
            <Tabs defaultValue="general" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="general">
                  <Settings className="w-4 h-4 mr-2" />
                  Geral
                </TabsTrigger>
                <TabsTrigger value="theme">
                  <Palette className="w-4 h-4 mr-2" />
                  Tema
                </TabsTrigger>
                <TabsTrigger value="settings">
                  <FileText className="w-4 h-4 mr-2" />
                  Configurações
                </TabsTrigger>
                <TabsTrigger value="features">
                  <Wrench className="w-4 h-4 mr-2" />
                  Recursos
                </TabsTrigger>
              </TabsList>

              {/* General Tab */}
              <TabsContent value="general" className="space-y-4">
                <div>
                  <Label>Nome do Site</Label>
                  <Input
                    value={editingSite.name}
                    onChange={(e) => setEditingSite({ ...editingSite, name: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Slug</Label>
                  <Input
                    value={editingSite.slug}
                    onChange={(e) => setEditingSite({ ...editingSite, slug: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Domínio</Label>
                  <Input
                    value={editingSite.domain || ''}
                    onChange={(e) => setEditingSite({ ...editingSite, domain: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Descrição</Label>
                  <Textarea
                    value={editingSite.description}
                    onChange={(e) => setEditingSite({ ...editingSite, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Status</Label>
                  <Select
                    value={editingSite.status}
                    onValueChange={(value: Site['status']) => 
                      setEditingSite({ ...editingSite, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="inactive">Inativo</SelectItem>
                      <SelectItem value="maintenance">Manutenção</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              {/* Theme Tab */}
              <TabsContent value="theme" className="space-y-4">
                <div>
                  <Label>Cor Primária</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={editingSite.theme.primaryColor}
                      onChange={(e) => setEditingSite({
                        ...editingSite,
                        theme: { ...editingSite.theme, primaryColor: e.target.value }
                      })}
                      className="w-20"
                    />
                    <Input
                      value={editingSite.theme.primaryColor}
                      onChange={(e) => setEditingSite({
                        ...editingSite,
                        theme: { ...editingSite.theme, primaryColor: e.target.value }
                      })}
                    />
                  </div>
                </div>

                <div>
                  <Label>Cor Secundária</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={editingSite.theme.secondaryColor}
                      onChange={(e) => setEditingSite({
                        ...editingSite,
                        theme: { ...editingSite.theme, secondaryColor: e.target.value }
                      })}
                      className="w-20"
                    />
                    <Input
                      value={editingSite.theme.secondaryColor}
                      onChange={(e) => setEditingSite({
                        ...editingSite,
                        theme: { ...editingSite.theme, secondaryColor: e.target.value }
                      })}
                    />
                  </div>
                </div>

                <div>
                  <Label>Logo URL</Label>
                  <Input
                    value={editingSite.theme.logo || ''}
                    onChange={(e) => setEditingSite({
                      ...editingSite,
                      theme: { ...editingSite.theme, logo: e.target.value }
                    })}
                    placeholder="https://exemplo.com/logo.png"
                  />
                </div>

                <div>
                  <Label>Favicon URL</Label>
                  <Input
                    value={editingSite.theme.favicon || ''}
                    onChange={(e) => setEditingSite({
                      ...editingSite,
                      theme: { ...editingSite.theme, favicon: e.target.value }
                    })}
                    placeholder="https://exemplo.com/favicon.ico"
                  />
                </div>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-4">
                <div>
                  <Label>Título do Site</Label>
                  <Input
                    value={editingSite.settings.siteTitle}
                    onChange={(e) => setEditingSite({
                      ...editingSite,
                      settings: { ...editingSite.settings, siteTitle: e.target.value }
                    })}
                  />
                </div>

                <div>
                  <Label>Descrição do Site</Label>
                  <Textarea
                    value={editingSite.settings.siteDescription}
                    onChange={(e) => setEditingSite({
                      ...editingSite,
                      settings: { ...editingSite.settings, siteDescription: e.target.value }
                    })}
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Idioma</Label>
                  <Select
                    value={editingSite.settings.language}
                    onValueChange={(value) => setEditingSite({
                      ...editingSite,
                      settings: { ...editingSite.settings, language: value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                      <SelectItem value="en-US">English (US)</SelectItem>
                      <SelectItem value="es-ES">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Fuso Horário</Label>
                  <Input
                    value={editingSite.settings.timezone}
                    onChange={(e) => setEditingSite({
                      ...editingSite,
                      settings: { ...editingSite.settings, timezone: e.target.value }
                    })}
                  />
                </div>

                <div>
                  <Label>Formato de Data</Label>
                  <Input
                    value={editingSite.settings.dateFormat}
                    onChange={(e) => setEditingSite({
                      ...editingSite,
                      settings: { ...editingSite.settings, dateFormat: e.target.value }
                    })}
                  />
                </div>
              </TabsContent>

              {/* Features Tab */}
              <TabsContent value="features" className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <Label>Blog / Artigos</Label>
                      <p className="text-sm text-gray-500">Habilitar sistema de blog e artigos</p>
                    </div>
                    <Switch
                      checked={editingSite.features.enableBlog}
                      onCheckedChange={(checked) => setEditingSite({
                        ...editingSite,
                        features: { ...editingSite.features, enableBlog: checked }
                      })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <Label>Páginas</Label>
                      <p className="text-sm text-gray-500">Habilitar criação de páginas</p>
                    </div>
                    <Switch
                      checked={editingSite.features.enablePages}
                      onCheckedChange={(checked) => setEditingSite({
                        ...editingSite,
                        features: { ...editingSite.features, enablePages: checked }
                      })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <Label>Biblioteca de Mídia</Label>
                      <p className="text-sm text-gray-500">Habilitar upload de arquivos e imagens</p>
                    </div>
                    <Switch
                      checked={editingSite.features.enableMedia}
                      onCheckedChange={(checked) => setEditingSite({
                        ...editingSite,
                        features: { ...editingSite.features, enableMedia: checked }
                      })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <Label>Comentários</Label>
                      <p className="text-sm text-gray-500">Habilitar sistema de comentários</p>
                    </div>
                    <Switch
                      checked={editingSite.features.enableComments}
                      onCheckedChange={(checked) => setEditingSite({
                        ...editingSite,
                        features: { ...editingSite.features, enableComments: checked }
                      })}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}

          <div className="flex gap-2 pt-4 border-t">
            <Button onClick={handleUpdateSite} className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              Salvar Alterações
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowEditDialog(false);
                setEditingSite(null);
              }}
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stats Dialog */}
      <Dialog open={showStatsDialog} onOpenChange={setShowStatsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Estatísticas do Site</DialogTitle>
            <DialogDescription>
              Informações e métricas do site selecionado
            </DialogDescription>
          </DialogHeader>

          {selectedSiteForStats && (() => {
            const site = sites.find(s => s.id === selectedSiteForStats);
            const stats = getSiteStats(selectedSiteForStats);
            
            if (!site) return null;

            return (
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-3">{site.name}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-3xl font-bold text-indigo-600">{stats.pages}</div>
                        <div className="text-sm text-gray-600">Páginas</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-3xl font-bold text-purple-600">{stats.articles}</div>
                        <div className="text-sm text-gray-600">Artigos</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-3xl font-bold text-blue-600">{stats.files}</div>
                        <div className="text-sm text-gray-600">Arquivos</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-3xl font-bold text-green-600">
                          {(stats.storage / 1024).toFixed(2)} KB
                        </div>
                        <div className="text-sm text-gray-600">Armazenamento</div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Informações</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">ID:</span>
                      <span className="font-mono">{site.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Slug:</span>
                      <span className="font-mono">{site.slug}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Criado em:</span>
                      <span>{new Date(site.createdAt).toLocaleString('pt-BR')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Atualizado em:</span>
                      <span>{new Date(site.updatedAt).toLocaleString('pt-BR')}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}