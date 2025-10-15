import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '../ui/sheet';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';
import { 
  FileText, 
  Layout, 
  Image, 
  Users, 
  TrendingUp, 
  Eye,
  Plus,
  Edit,
  Trash,
  Upload,
  Settings,
  Lightbulb,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  FolderPlus,
  Link,
  Menu as MenuIcon,
  Activity as ActivityIcon,
  BarChart3,
  Lock,
  Shield
} from 'lucide-react';
import { usePermissions } from '../auth/PermissionsContext';
import { useRealtimeStats, useRealtimeViewsHistory, ConnectionStatus } from '../hooks/useRealTimeData';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner@2.0.3';

interface Activity {
  id: string;
  type: 'article' | 'page' | 'file' | 'user' | 'menu' | 'link';
  action: 'created' | 'updated' | 'deleted' | 'published';
  title: string;
  user: string;
  timestamp: string;
  status?: string;
}

interface QuickAction {
  title: string;
  description: string;
  icon: any;
  action: () => void;
  color: string;
  requiredPermission: string;
}

interface DashboardHomeProps {
  currentUser: any;
  onNavigate: (section: string) => void;
}

export function DashboardHome({ currentUser, onNavigate }: DashboardHomeProps) {
  const { hasPermission, canViewWidget, currentUser: permUser } = usePermissions();
  
  const [showTips, setShowTips] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [stats, setStats] = useState({
    articles: { total: 0, published: 0, draft: 0 },
    pages: { total: 0, published: 0, draft: 0 },
    files: { total: 0, images: 0 },
    users: { total: 0, active: 0 },
  });

  // Tempo Real - Estatísticas de Visualização
  const realtimeEnabled = hasPermission('dashboard.realtime');
  const { 
    data: realtimeStats, 
    isLoading: realtimeLoading, 
    isConnected: realtimeConnected,
    lastUpdate: realtimeLastUpdate,
    refresh: refreshRealtime
  } = useRealtimeStats(realtimeEnabled);

  // Histórico de visualizações para gráfico
  const {
    history: viewsHistory
  } = useRealtimeViewsHistory(10, realtimeEnabled);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    // Load real data from localStorage
    const articles = JSON.parse(localStorage.getItem('articles') || '[]');
    const pages = JSON.parse(localStorage.getItem('pages') || '[]');
    const files = JSON.parse(localStorage.getItem('files') || '[]');
    const users = JSON.parse(localStorage.getItem('users') || '[]');

    // Calculate stats
    setStats({
      articles: {
        total: articles.length,
        published: articles.filter((a: any) => a.status === 'published').length,
        draft: articles.filter((a: any) => a.status === 'draft').length
      },
      pages: {
        total: pages.length,
        published: pages.filter((p: any) => p.status === 'published').length,
        draft: pages.filter((p: any) => p.status === 'draft').length
      },
      files: {
        total: files.length,
        images: files.filter((f: any) => f.type === 'file' && f.mimeType?.startsWith('image/')).length
      },
      users: {
        total: users.length,
        active: users.filter((u: any) => u.status === 'active').length
      },
    });

    // Load activities
    const storedActivities = localStorage.getItem('dashboardActivities');
    if (storedActivities) {
      setActivities(JSON.parse(storedActivities));
    } else {
      // Generate mock activities
      generateMockActivities();
    }
  };

  const generateMockActivities = () => {
    const mockActivities: Activity[] = [
      {
        id: '1',
        type: 'article',
        action: 'published',
        title: 'Nova política de privacidade atualizada',
        user: 'Admin',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        status: 'success'
      },
      {
        id: '2',
        type: 'page',
        action: 'created',
        title: 'Página de Contato',
        user: 'Editor',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      },
      {
        id: '3',
        type: 'file',
        action: 'updated',
        title: 'banner-principal.jpg',
        user: 'Admin',
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      },
      {
        id: '4',
        type: 'user',
        action: 'created',
        title: 'Novo usuário: João Silva',
        user: 'Admin',
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      },
      {
        id: '5',
        type: 'article',
        action: 'updated',
        title: 'Guia de início rápido',
        user: 'Editor',
        timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
      },
    ];

    setActivities(mockActivities);
    localStorage.setItem('dashboardActivities', JSON.stringify(mockActivities));
  };

  const quickActions: QuickAction[] = [
    {
      title: 'Nova Matéria',
      description: 'Criar um novo artigo ou notícia',
      icon: FileText,
      action: () => onNavigate('articles'),
      color: 'bg-blue-500',
      requiredPermission: 'content.create',
    },
    {
      title: 'Nova Página',
      description: 'Criar uma nova página no site',
      icon: Layout,
      action: () => onNavigate('pages'),
      color: 'bg-purple-500',
      requiredPermission: 'content.create',
    },
    {
      title: 'Upload de Arquivo',
      description: 'Enviar imagens e documentos',
      icon: Upload,
      action: () => onNavigate('files'),
      color: 'bg-green-500',
      requiredPermission: 'files.upload',
    },
    {
      title: 'Gerenciar Usuários',
      description: 'Adicionar e editar usuários',
      icon: Users,
      action: () => onNavigate('users'),
      color: 'bg-orange-500',
      requiredPermission: 'users.view',
    },
    {
      title: 'Configurações',
      description: 'Ajustar configurações do sistema',
      icon: Settings,
      action: () => onNavigate('settings'),
      color: 'bg-gray-500',
      requiredPermission: 'settings.view',
    },
    {
      title: 'Novo Menu',
      description: 'Criar estrutura de menu',
      icon: MenuIcon,
      action: () => onNavigate('menus'),
      color: 'bg-indigo-500',
      requiredPermission: 'content.create',
    },
  ];

  const tips = [
    {
      id: '1',
      category: 'Produtividade',
      title: 'Use atalhos de teclado',
      description: 'Pressione Ctrl+S para salvar rapidamente ao editar conteúdo.',
      icon: Lightbulb,
    },
    {
      id: '2',
      category: 'SEO',
      title: 'Otimize suas imagens',
      description: 'Comprima imagens antes do upload para melhorar o tempo de carregamento.',
      icon: Image,
    },
    {
      id: '3',
      category: 'Conteúdo',
      title: 'Salve rascunhos frequentemente',
      description: 'Use a função de auto-save ou salve manualmente para não perder trabalho.',
      icon: FileText,
    },
    {
      id: '4',
      category: 'Organização',
      title: 'Use pastas no gerenciador de arquivos',
      description: 'Organize seus arquivos em pastas para facilitar a localização.',
      icon: FolderPlus,
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'article': return FileText;
      case 'page': return Layout;
      case 'file': return Image;
      case 'user': return User;
      case 'menu': return MenuIcon;
      case 'link': return Link;
      default: return ActivityIcon;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'created': return 'text-green-600';
      case 'updated': return 'text-blue-600';
      case 'deleted': return 'text-red-600';
      case 'published': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const getActionText = (action: string) => {
    switch (action) {
      case 'created': return 'criou';
      case 'updated': return 'atualizou';
      case 'deleted': return 'excluiu';
      case 'published': return 'publicou';
      default: return action;
    }
  };

  const formatRelativeTime = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

    if (diffInSeconds < 60) return 'agora mesmo';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min atrás`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h atrás`;
    return `${Math.floor(diffInSeconds / 86400)}d atrás`;
  };

  // Preparar dados para o gráfico
  const chartData = viewsHistory.slice().reverse().map((entry, index) => ({
    time: new Date(entry.timestamp).toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    views: entry.views,
    visitors: entry.visitors,
  }));

  // Check if user has dashboard access
  if (!hasPermission('dashboard.view')) {
    return (
      <div className="p-8">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-8 text-center">
            <Lock className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-900 mb-2">Acesso Negado</h2>
            <p className="text-red-700">
              Você não tem permissão para acessar o dashboard. 
              Entre em contato com o administrador do sistema.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header com Role Badge */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 mb-2">
            Bem-vindo, {currentUser?.name || 'Usuário'}!
          </h1>
          <p className="text-gray-600">
            Aqui está um resumo das suas atividades e do sistema
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="gap-2">
            <Shield className="w-3 h-3" />
            {permUser?.role === 'admin' ? 'Administrador' : 
             permUser?.role === 'editor' ? 'Editor' : 'Visualizador'}
          </Badge>
          {hasPermission('dashboard.quicktips') && (
            <Button variant="outline" onClick={() => setShowTips(true)}>
              <Lightbulb className="w-4 h-4 mr-2" />
              Dicas Rápidas
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards - Widget */}
      {canViewWidget('stats') && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Artigos */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Artigos
              </CardTitle>
              <FileText className="w-4 h-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.articles.total}</div>
              <div className="flex gap-4 mt-2 text-sm">
                <span className="text-green-600">
                  {stats.articles.published} publicados
                </span>
                <span className="text-gray-500">
                  {stats.articles.draft} rascunhos
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Páginas */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Páginas
              </CardTitle>
              <Layout className="w-4 h-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.pages.total}</div>
              <div className="flex gap-4 mt-2 text-sm">
                <span className="text-green-600">
                  {stats.pages.published} publicadas
                </span>
                <span className="text-gray-500">
                  {stats.pages.draft} rascunhos
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Arquivos */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Arquivos
              </CardTitle>
              <Image className="w-4 h-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.files.total}</div>
              <div className="flex gap-4 mt-2 text-sm">
                <span className="text-blue-600">
                  {stats.files.images} imagens
                </span>
                <span className="text-gray-500">
                  {stats.files.total - stats.files.images} outros
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Usuários */}
          {hasPermission('users.view') && (
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Usuários
                </CardTitle>
                <Users className="w-4 h-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stats.users.total}</div>
                <div className="flex gap-4 mt-2 text-sm">
                  <span className="text-green-600">
                    {stats.users.active} ativos
                  </span>
                  <span className="text-gray-500">
                    {stats.users.total - stats.users.active} inativos
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Visualizações em Tempo Real - Widget */}
      {canViewWidget('views') && hasPermission('dashboard.realtime') && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Visualizações em Tempo Real
                  <Badge variant="secondary" className="ml-2">
                    Atualização Automática
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Dados atualizados automaticamente a cada 3 segundos
                </CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <ConnectionStatus 
                  isConnected={realtimeConnected} 
                  lastUpdate={realtimeLastUpdate} 
                />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={refreshRealtime}
                  disabled={realtimeLoading}
                >
                  Atualizar
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {realtimeStats && (
              <>
                {/* Stats */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600">
                      {realtimeStats.views.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Visualizações</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-3xl font-bold text-green-600">
                      {realtimeStats.visitors.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Visitantes</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-3xl font-bold text-purple-600">
                      {realtimeStats.pageViews.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Páginas Vistas</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-3xl font-bold text-orange-600">
                      {Math.floor(realtimeStats.avgDuration / 60)}:{(realtimeStats.avgDuration % 60).toString().padStart(2, '0')}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Duração Média</div>
                  </div>
                </div>

                {/* Chart */}
                {chartData.length > 0 && (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="time" 
                          stroke="#6b7280"
                          fontSize={12}
                        />
                        <YAxis stroke="#6b7280" fontSize={12} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #e5e7eb',
                            borderRadius: '6px'
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="views" 
                          stroke="#3b82f6" 
                          fillOpacity={1}
                          fill="url(#colorViews)"
                          strokeWidth={2}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="visitors" 
                          stroke="#10b981" 
                          fillOpacity={1}
                          fill="url(#colorVisitors)"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Atividades Recentes - Widget */}
        {canViewWidget('activity') && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Atividades Recentes
              </CardTitle>
              <CardDescription>
                Últimas ações realizadas no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {activities.map((activity) => {
                    const Icon = getActivityIcon(activity.type);
                    return (
                      <div key={activity.id} className="flex gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm">
                            <span className="font-medium text-gray-900">{activity.user}</span>
                            {' '}
                            <span className={getActionColor(activity.action)}>
                              {getActionText(activity.action)}
                            </span>
                            {' '}
                            <span className="text-gray-600">{activity.title}</span>
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatRelativeTime(activity.timestamp)}
                          </p>
                        </div>
                        {activity.status === 'success' && (
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* Atalhos Rápidos - Widget */}
        {canViewWidget('shortcuts') && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Ações Rápidas
              </CardTitle>
              <CardDescription>
                Acesse rapidamente as funcionalidades mais usadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {quickActions
                  .filter(action => hasPermission(action.requiredPermission))
                  .map((action) => {
                    const Icon = action.icon;
                    return (
                      <Button
                        key={action.title}
                        variant="outline"
                        className="h-auto flex flex-col items-start p-4 hover:shadow-md transition-all"
                        onClick={action.action}
                      >
                        <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center mb-3`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-gray-900 mb-1">
                            {action.title}
                          </div>
                          <div className="text-xs text-gray-600">
                            {action.description}
                          </div>
                        </div>
                      </Button>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dicas Rápidas - Sheet */}
      {hasPermission('dashboard.quicktips') && (
        <Sheet open={showTips} onOpenChange={setShowTips}>
          <SheetContent className="w-full sm:max-w-xl">
            <SheetHeader>
              <SheetTitle>Dicas Rápidas</SheetTitle>
              <SheetDescription>
                Sugestões para melhorar sua produtividade no sistema
              </SheetDescription>
            </SheetHeader>
            <ScrollArea className="h-[calc(100vh-180px)] mt-6">
              <div className="space-y-4 pr-4">
                {tips.map((tip) => {
                  const Icon = tip.icon;
                  return (
                    <Card key={tip.id}>
                      <CardContent className="p-4">
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                            <Icon className="w-5 h-5 text-amber-600" />
                          </div>
                          <div className="flex-1">
                            <Badge variant="secondary" className="mb-2 text-xs">
                              {tip.category}
                            </Badge>
                            <h4 className="font-medium text-gray-900 mb-1">
                              {tip.title}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {tip.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
