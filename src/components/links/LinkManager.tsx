import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { 
  ExternalLink, 
  Link as LinkIcon, 
  Copy, 
  Trash, 
  Plus,
  Globe,
  Lock,
  Search,
  FileText,
  Folder,
  Eye
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner@2.0.3';

interface Link {
  id: string;
  title: string;
  path: string;
  type: 'internal' | 'external';
  category?: string;
  description?: string;
  createdAt: string;
}

interface LinkSettings {
  internalBase: string;
  externalBase: string;
}

export function LinkManager() {
  const [links, setLinks] = useState<Link[]>([]);
  const [settings, setSettings] = useState<LinkSettings>({
    internalBase: 'https://www.interno.stj.jus.br',
    externalBase: 'https://www.stj.jus.br'
  });
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'internal' | 'external'>('all');
  
  // Form states
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkPath, setNewLinkPath] = useState('');
  const [newLinkType, setNewLinkType] = useState<'internal' | 'external'>('external');
  const [newLinkCategory, setNewLinkCategory] = useState('');
  const [newLinkDescription, setNewLinkDescription] = useState('');

  // Load data from localStorage
  useEffect(() => {
    loadLinks();
    loadSettings();
  }, []);

  const loadLinks = () => {
    const stored = localStorage.getItem('links');
    if (stored) {
      setLinks(JSON.parse(stored));
    }
  };

  const loadSettings = () => {
    const stored = localStorage.getItem('linkSettings');
    if (stored) {
      setSettings(JSON.parse(stored));
    } else {
      // Salvar configurações padrão
      localStorage.setItem('linkSettings', JSON.stringify(settings));
    }
  };

  const saveLinks = (updatedLinks: Link[]) => {
    localStorage.setItem('links', JSON.stringify(updatedLinks));
    setLinks(updatedLinks);
  };

  const saveSettings = (updatedSettings: LinkSettings) => {
    localStorage.setItem('linkSettings', JSON.stringify(updatedSettings));
    setSettings(updatedSettings);
    toast.success('Configurações salvas com sucesso!');
  };

  const generateFullUrl = (link: Link): string => {
    const baseUrl = link.type === 'internal' ? settings.internalBase : settings.externalBase;
    const path = link.path.startsWith('/') ? link.path : `/${link.path}`;
    return `${baseUrl}${path}`;
  };

  const createLink = () => {
    if (!newLinkTitle.trim() || !newLinkPath.trim()) {
      toast.error('Preencha o título e o caminho do link');
      return;
    }

    const newLink: Link = {
      id: `link-${Date.now()}`,
      title: newLinkTitle,
      path: newLinkPath,
      type: newLinkType,
      category: newLinkCategory || undefined,
      description: newLinkDescription || undefined,
      createdAt: new Date().toISOString()
    };

    saveLinks([...links, newLink]);
    resetForm();
    setShowCreateDialog(false);
    toast.success('Link criado com sucesso!');
  };

  const deleteLink = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este link?')) {
      saveLinks(links.filter(l => l.id !== id));
      toast.success('Link excluído com sucesso!');
    }
  };

  const copyUrl = (link: Link) => {
    const fullUrl = generateFullUrl(link);
    navigator.clipboard.writeText(fullUrl)
      .then(() => {
        toast.success('URL copiada para a área de transferência!');
      })
      .catch(() => {
        toast.error('Não foi possível copiar a URL');
      });
  };

  const resetForm = () => {
    setNewLinkTitle('');
    setNewLinkPath('');
    setNewLinkType('external');
    setNewLinkCategory('');
    setNewLinkDescription('');
  };

  // Integração com arquivos e páginas
  const importFromFiles = () => {
    const files = JSON.parse(localStorage.getItem('files') || '[]');
    const newLinks: Link[] = [];

    files.forEach((file: any) => {
      if (file.type !== 'folder') {
        const link: Link = {
          id: `link-file-${file.id}`,
          title: file.name,
          path: file.path,
          type: 'external',
          category: 'Arquivos',
          description: `Arquivo importado: ${file.type}`,
          createdAt: new Date().toISOString()
        };
        newLinks.push(link);
      }
    });

    if (newLinks.length > 0) {
      saveLinks([...links, ...newLinks]);
      toast.success(`${newLinks.length} arquivo(s) importado(s) como links`);
    } else {
      toast.info('Nenhum arquivo encontrado para importar');
    }
  };

  const importFromPages = () => {
    const pages = JSON.parse(localStorage.getItem('pages') || '[]');
    const newLinks: Link[] = [];

    pages.forEach((page: any) => {
      const link: Link = {
        id: `link-page-${page.id}`,
        title: page.title,
        path: `/${page.slug}`,
        type: 'external',
        category: 'Páginas',
        description: `Página: ${page.status}`,
        createdAt: new Date().toISOString()
      };
      newLinks.push(link);
    });

    if (newLinks.length > 0) {
      saveLinks([...links, ...newLinks]);
      toast.success(`${newLinks.length} página(s) importada(s) como links`);
    } else {
      toast.info('Nenhuma página encontrada para importar');
    }
  };

  // Filtrar links
  const filteredLinks = links.filter(link => {
    const matchesSearch = link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         link.path.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || link.type === filterType;
    return matchesSearch && matchesType;
  });

  // Agrupar por categoria
  const groupedLinks = filteredLinks.reduce((acc, link) => {
    const category = link.category || 'Sem categoria';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(link);
    return acc;
  }, {} as { [key: string]: Link[] });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-gray-900 mb-2">Gerenciamento de Links</h1>
          <p className="text-gray-600">Configure links internos e externos do sistema</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={importFromFiles}>
            <Folder className="w-4 h-4 mr-2" />
            Importar Arquivos
          </Button>
          <Button variant="outline" onClick={importFromPages}>
            <FileText className="w-4 h-4 mr-2" />
            Importar Páginas
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Link
          </Button>
        </div>
      </div>

      <Tabs defaultValue="links" className="space-y-6">
        <TabsList>
          <TabsTrigger value="links">
            <LinkIcon className="w-4 h-4 mr-2" />
            Links
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Globe className="w-4 h-4 mr-2" />
            Configurações
          </TabsTrigger>
        </TabsList>

        {/* Tab: Links */}
        <TabsContent value="links" className="space-y-6">
          {/* Filtros */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Buscar links..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    <SelectItem value="external">Externos</SelectItem>
                    <SelectItem value="internal">Internos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Links */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {Object.entries(groupedLinks).map(([category, categoryLinks]) => (
              <div key={category} className="space-y-3">
                <h3 className="flex items-center gap-2 text-gray-700">
                  <Folder className="w-4 h-4" />
                  {category}
                  <Badge variant="secondary">{categoryLinks.length}</Badge>
                </h3>
                
                {categoryLinks.map(link => (
                  <Card key={link.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {link.type === 'internal' ? (
                              <Lock className="w-4 h-4 text-orange-600" />
                            ) : (
                              <Globe className="w-4 h-4 text-blue-600" />
                            )}
                            <span className="font-medium">{link.title}</span>
                            <Badge variant={link.type === 'internal' ? 'default' : 'secondary'}>
                              {link.type === 'internal' ? 'Interno' : 'Externo'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 font-mono break-all">
                            {generateFullUrl(link)}
                          </p>
                          {link.description && (
                            <p className="text-xs text-gray-500 mt-1">{link.description}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-1 mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyUrl(link)}
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Copiar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(generateFullUrl(link), '_blank')}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          Abrir
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteLink(link.id)}
                          className="text-red-600"
                        >
                          <Trash className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ))}

            {filteredLinks.length === 0 && (
              <div className="col-span-2">
                <Card>
                  <CardContent className="p-8 text-center text-gray-500">
                    <LinkIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>Nenhum link encontrado</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setShowCreateDialog(true)}
                    >
                      Criar primeiro link
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Tab: Configurações */}
        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Configurações de URL Base */}
            <Card>
              <CardHeader>
                <CardTitle>URLs Base do Sistema</CardTitle>
                <CardDescription>
                  Configure as URLs base para links internos e externos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="external-base">
                    <Globe className="w-4 h-4 inline mr-2" />
                    URL Base Externa (Público)
                  </Label>
                  <Input
                    id="external-base"
                    value={settings.externalBase}
                    onChange={(e) => setSettings({ ...settings, externalBase: e.target.value })}
                    placeholder="https://www.stj.jus.br"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    URL acessível publicamente pela internet
                  </p>
                </div>

                <div>
                  <Label htmlFor="internal-base">
                    <Lock className="w-4 h-4 inline mr-2" />
                    URL Base Interna (Rede Interna)
                  </Label>
                  <Input
                    id="internal-base"
                    value={settings.internalBase}
                    onChange={(e) => setSettings({ ...settings, internalBase: e.target.value })}
                    placeholder="https://www.interno.stj.jus.br"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    URL acessível apenas na rede interna
                  </p>
                </div>

                <Button onClick={() => saveSettings(settings)}>
                  Salvar Configurações
                </Button>
              </CardContent>
            </Card>

            {/* Preview das URLs */}
            <Card>
              <CardHeader>
                <CardTitle>Preview de URLs</CardTitle>
                <CardDescription>
                  Veja como as URLs serão geradas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <Globe className="w-4 h-4 text-blue-600" />
                    Exemplo: Link Externo
                  </Label>
                  <div className="bg-gray-50 p-3 rounded border">
                    <p className="text-sm font-mono break-all">
                      {settings.externalBase}/institucional/sobre
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Acessível por qualquer usuário na internet
                  </p>
                </div>

                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <Lock className="w-4 h-4 text-orange-600" />
                    Exemplo: Link Interno
                  </Label>
                  <div className="bg-orange-50 p-3 rounded border border-orange-200">
                    <p className="text-sm font-mono break-all">
                      {settings.internalBase}/sistemas/administrativo
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Acessível apenas por usuários na rede interna
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                  <h4 className="font-medium text-blue-900 mb-2">💡 Como funciona</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Links <strong>externos</strong> usam: {settings.externalBase}</li>
                    <li>• Links <strong>internos</strong> usam: {settings.internalBase}</li>
                    <li>• O caminho é anexado automaticamente</li>
                    <li>• URLs são geradas com base na estrutura de pastas</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Estatísticas */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Estatísticas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <LinkIcon className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-600">Total</span>
                    </div>
                    <p className="text-2xl font-bold">{links.length}</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Globe className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-blue-600">Externos</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">
                      {links.filter(l => l.type === 'external').length}
                    </p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Lock className="w-4 h-4 text-orange-600" />
                      <span className="text-sm text-orange-600">Internos</span>
                    </div>
                    <p className="text-2xl font-bold text-orange-600">
                      {links.filter(l => l.type === 'internal').length}
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Folder className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-600">Categorias</span>
                    </div>
                    <p className="text-2xl font-bold text-green-600">
                      {Object.keys(groupedLinks).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Link Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Criar Novo Link</DialogTitle>
            <DialogDescription>
              Configure um link interno ou externo para o sistema
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="link-title">Título *</Label>
              <Input
                id="link-title"
                value={newLinkTitle}
                onChange={(e) => setNewLinkTitle(e.target.value)}
                placeholder="Ex: Portal Principal, Sistema Administrativo"
              />
            </div>

            <div>
              <Label htmlFor="link-type">Tipo de Link *</Label>
              <Select value={newLinkType} onValueChange={(value: any) => setNewLinkType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="external">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Externo (Público)
                    </div>
                  </SelectItem>
                  <SelectItem value="internal">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Interno (Rede Interna)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                {newLinkType === 'external' 
                  ? `Usará: ${settings.externalBase}` 
                  : `Usará: ${settings.internalBase}`}
              </p>
            </div>

            <div>
              <Label htmlFor="link-path">Caminho (Path) *</Label>
              <Input
                id="link-path"
                value={newLinkPath}
                onChange={(e) => setNewLinkPath(e.target.value)}
                placeholder="/institucional/sobre ou /arquivos/documento.pdf"
              />
              <p className="text-xs text-gray-500 mt-1">
                Caminho relativo que será anexado à URL base
              </p>
            </div>

            <div>
              <Label htmlFor="link-category">Categoria</Label>
              <Input
                id="link-category"
                value={newLinkCategory}
                onChange={(e) => setNewLinkCategory(e.target.value)}
                placeholder="Ex: Institucional, Documentos, Sistemas"
              />
            </div>

            <div>
              <Label htmlFor="link-description">Descrição</Label>
              <Input
                id="link-description"
                value={newLinkDescription}
                onChange={(e) => setNewLinkDescription(e.target.value)}
                placeholder="Descrição opcional do link"
              />
            </div>

            {/* Preview */}
            <div className="bg-gray-50 border rounded-lg p-4">
              <Label className="mb-2 block">Preview da URL</Label>
              <p className="text-sm font-mono break-all text-indigo-600">
                {newLinkType === 'external' ? settings.externalBase : settings.internalBase}
                {newLinkPath.startsWith('/') ? newLinkPath : `/${newLinkPath || 'seu-caminho'}`}
              </p>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={createLink} className="flex-1">
                <Plus className="w-4 h-4 mr-2" />
                Criar Link
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateDialog(false);
                  resetForm();
                }}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
