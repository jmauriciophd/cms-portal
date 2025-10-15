/**
 * GERENCIADOR DE LINKS
 * 
 * Interface completa para visualizar, criar, editar e verificar links
 * do sistema, incluindo links internos e externos.
 */

import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import {
  Link as LinkIcon,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  File,
  Plus,
  Search,
  RefreshCw,
  Download,
  Upload,
  Trash2,
  Edit,
  Copy,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp,
  Filter,
  Eye,
  MoreVertical,
  Share2,
  BarChart3,
  Globe,
  Home,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { LinkManagementService, Link } from '../../services/LinkManagementService';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../ui/breadcrumb';
import { usePermissions } from '../auth/PermissionsContext';

interface LinkManagerProps {
  currentUser: any;
}

export function LinkManager({ currentUser }: LinkManagerProps) {
  const { can } = usePermissions();
  const [links, setLinks] = useState<Link[]>([]);
  const [filteredLinks, setFilteredLinks] = useState<Link[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'internal' | 'external'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | Link['status']>('all');
  const [filterResource, setFilterResource] = useState<'all' | Link['resourceType']>('all');
  const [selectedLink, setSelectedLink] = useState<Link | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showStatsDialog, setShowStatsDialog] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  // Novo link
  const [newLink, setNewLink] = useState({
    title: '',
    url: '',
    description: '',
    tags: '',
    autoCheck: true,
    checkFrequency: 24
  });

  useEffect(() => {
    loadLinks();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [links, searchTerm, filterType, filterStatus, filterResource]);

  const loadLinks = () => {
    const allLinks = LinkManagementService.getAllLinks();
    setLinks(allLinks);
  };

  const applyFilters = () => {
    let filtered = [...links];

    // Filtro de busca
    if (searchTerm) {
      filtered = LinkManagementService.searchLinks(searchTerm);
    }

    // Filtro de tipo
    if (filterType !== 'all') {
      filtered = filtered.filter(l => l.type === filterType);
    }

    // Filtro de status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(l => l.status === filterStatus);
    }

    // Filtro de recurso
    if (filterResource !== 'all') {
      filtered = filtered.filter(l => l.resourceType === filterResource);
    }

    setFilteredLinks(filtered);
  };

  const handleCreateExternalLink = () => {
    if (!newLink.title || !newLink.url) {
      toast.error('Preencha título e URL');
      return;
    }

    const link = LinkManagementService.createExternalLink({
      title: newLink.title,
      url: newLink.url,
      description: newLink.description || undefined,
      tags: newLink.tags ? newLink.tags.split(',').map(t => t.trim()) : undefined,
      autoCheck: newLink.autoCheck,
      checkFrequency: newLink.checkFrequency
    });

    toast.success('Link criado com sucesso!');
    setShowAddDialog(false);
    setNewLink({
      title: '',
      url: '',
      description: '',
      tags: '',
      autoCheck: true,
      checkFrequency: 24
    });
    loadLinks();
  };

  const handleUpdateLink = () => {
    if (!selectedLink) return;

    LinkManagementService.saveLink(selectedLink);
    toast.success('Link atualizado!');
    setShowEditDialog(false);
    setSelectedLink(null);
    loadLinks();
  };

  const handleDeleteLink = () => {
    if (!selectedLink) return;

    LinkManagementService.deleteLink(selectedLink.id);
    toast.success('Link excluído!');
    setShowDeleteDialog(false);
    setSelectedLink(null);
    loadLinks();
  };

  const handleCheckLink = async (linkId: string) => {
    const link = links.find(l => l.id === linkId);
    if (!link || link.type !== 'external') {
      toast.error('Apenas links externos podem ser verificados');
      return;
    }

    setIsChecking(true);
    try {
      const result = await LinkManagementService.checkExternalLink(linkId);
      
      if (result.status === 'active') {
        toast.success('Link está ativo!');
      } else if (result.status === 'redirect') {
        toast.info(`Link redireciona para: ${result.redirectTo}`);
      } else {
        toast.error(`Link quebrado: ${result.errorMessage}`);
      }
      
      loadLinks();
    } catch (error) {
      toast.error('Erro ao verificar link');
    } finally {
      setIsChecking(false);
    }
  };

  const handleCheckAllLinks = async () => {
    setIsChecking(true);
    toast.info('Verificando todos os links externos...');
    
    try {
      const results = await LinkManagementService.checkAllExternalLinks();
      const broken = results.filter(r => r.status === 'broken').length;
      const active = results.filter(r => r.status === 'active').length;
      
      toast.success(`Verificação concluída! ${active} ativos, ${broken} quebrados`);
      loadLinks();
    } catch (error) {
      toast.error('Erro ao verificar links');
    } finally {
      setIsChecking(false);
    }
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('Link copiado!');
  };

  const handleExportLinks = () => {
    const json = LinkManagementService.exportLinks();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `links-export-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Links exportados!');
  };

  const handleImportLinks = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const json = e.target?.result as string;
      const result = LinkManagementService.importLinks(json);
      
      if (result.success) {
        toast.success(`${result.count} links importados!`);
        if (result.errors.length > 0) {
          toast.warning(`${result.errors.length} erros encontrados`);
        }
        loadLinks();
      } else {
        toast.error('Erro ao importar links');
      }
    };
    reader.readAsText(file);
  };

  const getStatusIcon = (status: Link['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'broken':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'redirect':
        return <TrendingUp className="w-4 h-4 text-blue-600" />;
    }
  };

  const getStatusBadge = (status: Link['status']) => {
    const variants: Record<Link['status'], any> = {
      active: 'default',
      broken: 'destructive',
      pending: 'secondary',
      redirect: 'outline'
    };

    const labels: Record<Link['status'], string> = {
      active: 'Ativo',
      broken: 'Quebrado',
      pending: 'Pendente',
      redirect: 'Redirecionamento'
    };

    return (
      <Badge variant={variants[status]} className="flex items-center gap-1">
        {getStatusIcon(status)}
        {labels[status]}
      </Badge>
    );
  };

  const getResourceIcon = (resourceType: Link['resourceType']) => {
    switch (resourceType) {
      case 'page':
        return <FileText className="w-4 h-4" />;
      case 'article':
        return <FileText className="w-4 h-4 text-green-600" />;
      case 'image':
        return <ImageIcon className="w-4 h-4 text-purple-600" />;
      case 'pdf':
        return <File className="w-4 h-4 text-red-600" />;
      case 'file':
        return <File className="w-4 h-4" />;
      default:
        return <LinkIcon className="w-4 h-4" />;
    }
  };

  const stats = LinkManagementService.getStatistics();

  if (!can('links', 'view')) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Acesso Negado</h3>
            <p className="text-gray-600">Você não tem permissão para visualizar links.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-gray-900 mb-2">Gerenciamento de Links</h1>
            <p className="text-gray-600">Gerencie todos os links internos e externos do sistema</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleExportLinks}
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            
            <label>
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImportLinks}
              />
              <Button variant="outline" as="span">
                <Upload className="w-4 h-4 mr-2" />
                Importar
              </Button>
            </label>

            {can('links', 'create') && (
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Link Externo
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Criar Link Externo</DialogTitle>
                    <DialogDescription>
                      Adicione um link externo para monitoramento
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div>
                      <Label>Título *</Label>
                      <Input
                        placeholder="Nome do link"
                        value={newLink.title}
                        onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label>URL *</Label>
                      <Input
                        placeholder="https://exemplo.com"
                        value={newLink.url}
                        onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label>Descrição</Label>
                      <Textarea
                        placeholder="Descrição do link"
                        value={newLink.description}
                        onChange={(e) => setNewLink({ ...newLink, description: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label>Tags (separadas por vírgula)</Label>
                      <Input
                        placeholder="tag1, tag2, tag3"
                        value={newLink.tags}
                        onChange={(e) => setNewLink({ ...newLink, tags: e.target.value })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>Verificar automaticamente</Label>
                      <Switch
                        checked={newLink.autoCheck}
                        onCheckedChange={(checked) => setNewLink({ ...newLink, autoCheck: checked })}
                      />
                    </div>

                    {newLink.autoCheck && (
                      <div>
                        <Label>Frequência de verificação (horas)</Label>
                        <Input
                          type="number"
                          min="1"
                          value={newLink.checkFrequency}
                          onChange={(e) => setNewLink({ ...newLink, checkFrequency: parseInt(e.target.value) })}
                        />
                      </div>
                    )}
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleCreateExternalLink}>
                      Criar Link
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink className="flex items-center gap-1 cursor-pointer">
                <Home className="w-4 h-4" />
                Início
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="w-4 h-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage>Links</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total de Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.total}</div>
              <LinkIcon className="w-8 h-8 text-blue-600" />
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs text-gray-600">
              <Badge variant="secondary">{stats.internal} internos</Badge>
              <Badge variant="outline">{stats.external} externos</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-green-600" />
                  Ativos
                </span>
                <span className="font-semibold">{stats.active}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1">
                  <XCircle className="w-3 h-3 text-red-600" />
                  Quebrados
                </span>
                <span className="font-semibold">{stats.broken}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Páginas:</span>
                <span className="font-semibold">{stats.byResourceType.page}</span>
              </div>
              <div className="flex justify-between">
                <span>Matérias:</span>
                <span className="font-semibold">{stats.byResourceType.article}</span>
              </div>
              <div className="flex justify-between">
                <span>Imagens:</span>
                <span className="font-semibold">{stats.byResourceType.image}</span>
              </div>
              <div className="flex justify-between">
                <span>PDFs:</span>
                <span className="font-semibold">{stats.byResourceType.pdf}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl font-bold">{stats.totalClicks}</div>
              <BarChart3 className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-xs text-gray-600">Total de cliques registrados</p>
            {stats.needingCheck > 0 && (
              <Badge variant="secondary" className="mt-2">
                {stats.needingCheck} precisam verificação
              </Badge>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar links..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="internal">Internos</SelectItem>
                <SelectItem value="external">Externos</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos status</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="broken">Quebrados</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="redirect">Redirecionando</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterResource} onValueChange={(value: any) => setFilterResource(value)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos recursos</SelectItem>
                <SelectItem value="page">Páginas</SelectItem>
                <SelectItem value="article">Matérias</SelectItem>
                <SelectItem value="image">Imagens</SelectItem>
                <SelectItem value="pdf">PDFs</SelectItem>
                <SelectItem value="file">Arquivos</SelectItem>
                <SelectItem value="custom">Customizados</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={handleCheckAllLinks}
              disabled={isChecking}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
              Verificar Todos
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Links Table */}
      <Card>
        <CardContent className="p-0">
          {filteredLinks.length === 0 ? (
            <div className="p-12 text-center">
              <LinkIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum link encontrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Link
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Recurso
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Cliques
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredLinks.map((link) => (
                    <tr key={link.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-3">
                          {link.type === 'internal' ? (
                            <LinkIcon className="w-5 h-5 text-blue-600 mt-0.5" />
                          ) : (
                            <ExternalLink className="w-5 h-5 text-purple-600 mt-0.5" />
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-gray-900 truncate">
                              {link.title}
                            </div>
                            <div className="text-sm text-gray-500 truncate" title={link.url}>
                              {link.url}
                            </div>
                            {link.description && (
                              <div className="text-xs text-gray-400 mt-1">
                                {link.description}
                              </div>
                            )}
                            {link.tags && link.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {link.tags.map((tag, i) => (
                                  <Badge key={i} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={link.type === 'internal' ? 'default' : 'outline'}>
                          {link.type === 'internal' ? 'Interno' : 'Externo'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getResourceIcon(link.resourceType)}
                          <span className="text-sm capitalize">{link.resourceType}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(link.status)}
                        {link.validation?.lastChecked && (
                          <div className="text-xs text-gray-500 mt-1">
                            Verificado {new Date(link.validation.lastChecked).toLocaleDateString('pt-BR')}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-semibold">{link.analytics?.clickCount || 0}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => window.open(link.url, '_blank')}>
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Abrir Link
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleCopyLink(link.url)}>
                              <Copy className="w-4 h-4 mr-2" />
                              Copiar URL
                            </DropdownMenuItem>
                            {link.type === 'external' && (
                              <DropdownMenuItem onClick={() => handleCheckLink(link.id)}>
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Verificar Status
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            {can('links', 'edit') && (
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedLink(link);
                                  setShowEditDialog(true);
                                }}
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                            )}
                            {can('links', 'delete') && link.type === 'external' && (
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedLink(link);
                                  setShowDeleteDialog(true);
                                }}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {selectedLink && showEditDialog && (
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Link</DialogTitle>
              <DialogDescription>
                Atualize as informações do link
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label>Título</Label>
                <Input
                  value={selectedLink.title}
                  onChange={(e) => setSelectedLink({ ...selectedLink, title: e.target.value })}
                />
              </div>

              <div>
                <Label>URL</Label>
                <Input
                  value={selectedLink.url}
                  onChange={(e) => setSelectedLink({ ...selectedLink, url: e.target.value })}
                  disabled={selectedLink.type === 'internal'}
                />
              </div>

              <div>
                <Label>Descrição</Label>
                <Textarea
                  value={selectedLink.description || ''}
                  onChange={(e) => setSelectedLink({ ...selectedLink, description: e.target.value })}
                />
              </div>

              {selectedLink.type === 'external' && (
                <>
                  <div className="flex items-center justify-between">
                    <Label>Verificação automática</Label>
                    <Switch
                      checked={selectedLink.validation?.autoCheck || false}
                      onCheckedChange={(checked) => setSelectedLink({
                        ...selectedLink,
                        validation: { ...selectedLink.validation!, autoCheck: checked }
                      })}
                    />
                  </div>

                  {selectedLink.validation?.autoCheck && (
                    <div>
                      <Label>Frequência (horas)</Label>
                      <Input
                        type="number"
                        value={selectedLink.validation.checkFrequency}
                        onChange={(e) => setSelectedLink({
                          ...selectedLink,
                          validation: {
                            ...selectedLink.validation!,
                            checkFrequency: parseInt(e.target.value)
                          }
                        })}
                      />
                    </div>
                  )}
                </>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleUpdateLink}>
                Salvar Alterações
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Link?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O link "{selectedLink?.title}" será permanentemente excluído.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteLink} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
