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
  Menu as MenuIcon
} from 'lucide-react';

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
  roles: string[];
}

interface DashboardHomeProps {
  currentUser: any;
  onNavigate: (section: string) => void;
}

export function DashboardHome({ currentUser, onNavigate }: DashboardHomeProps) {
  const [showTips, setShowTips] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [stats, setStats] = useState({
    articles: { total: 0, published: 0, draft: 0 },
    pages: { total: 0, published: 0, draft: 0 },
    files: { total: 0, images: 0 },
    users: { total: 0, active: 0 },
    views: { total: 0, thisMonth: 0 }
  });

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
      views: {
        total: Math.floor(Math.random() * 10000) + 5000,
        thisMonth: Math.floor(Math.random() * 2000) + 500
      }
    });

    // Generate activities from real data
    const recentActivities: Activity[] = [];

    // Add article activities
    articles.slice(0, 2).forEach((article: any) => {
      recentActivities.push({
        id: `article-${article.id}`,
        type: 'article',
        action: article.status === 'published' ? 'published' : 'created',
        title: article.title,
        user: article.author || 'Sistema',
        timestamp: article.updatedAt || article.createdAt,
        status: article.status
      });
    });

    // Add page activities
    pages.slice(0, 1).forEach((page: any) => {
      recentActivities.push({
        id: `page-${page.id}`,
        type: 'page',
        action: page.status === 'published' ? 'published' : 'created',
        title: page.title,
        user: currentUser.name,
        timestamp: page.updatedAt || page.createdAt,
        status: page.status
      });
    });

    // Add file activities
    files.slice(0, 1).forEach((file: any) => {
      recentActivities.push({
        id: `file-${file.id}`,
        type: 'file',
        action: 'created',
        title: file.name,
        user: currentUser.name,
        timestamp: file.createdAt,
      });
    });

    // Add user activities if admin
    if (currentUser.role === 'admin') {
      users.slice(0, 1).forEach((user: any) => {
        recentActivities.push({
          id: `user-${user.id}`,
          type: 'user',
          action: 'created',
          title: `Usuário ${user.name}`,
          user: 'Sistema',
          timestamp: user.createdAt,
        });
      });
    }

    // Sort by timestamp and get last 5
    recentActivities.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    setActivities(recentActivities.slice(0, 5));
  };

  // Quick actions based on user role
  const getQuickActions = (): QuickAction[] => {
    const actions: QuickAction[] = [];

    // Actions for editors and admins
    if (currentUser.role === 'editor' || currentUser.role === 'admin') {
      actions.push({
        title: 'Criar Matéria',
        description: 'Nova matéria/notícia',
        icon: FileText,
        action: () => onNavigate('articles'),
        color: 'bg-blue-500',
        roles: ['editor', 'admin']
      });
    }

    // Actions for admins only
    if (currentUser.role === 'admin') {
      actions.push(
        {
          title: 'Nova Página',
          description: 'Criar página customizada',
          icon: Layout,
          action: () => onNavigate('pages'),
          color: 'bg-green-500',
          roles: ['admin']
        },
        {
          title: 'Upload Arquivo',
          description: 'Enviar imagens/arquivos',
          icon: Upload,
          action: () => onNavigate('files'),
          color: 'bg-purple-500',
          roles: ['admin']
        },
        {
          title: 'Gerenciar Usuários',
          description: 'Adicionar/editar usuários',
          icon: Users,
          action: () => onNavigate('users'),
          color: 'bg-orange-500',
          roles: ['admin']
        }
      );
    }

    // Actions for all users
    actions.push({
      title: 'Configurações',
      description: 'Personalizar sistema',
      icon: Settings,
      action: () => onNavigate('settings'),
      color: 'bg-gray-500',
      roles: ['viewer', 'editor', 'admin']
    });

    return actions;
  };

  // Tips based on user role
  const getTipsByRole = () => {
    const baseTips = [
      {
        icon: '📝',
        title: 'Editor Visual',
        description: 'Use o editor drag-and-drop para criar páginas com mais de 50 componentes disponíveis.',
        color: 'bg-blue-50'
      },
      {
        icon: '🎨',
        title: 'Templates Prontos',
        description: 'Economize tempo usando templates pré-configurados para artigos e páginas.',
        color: 'bg-purple-50'
      }
    ];

    if (currentUser.role === 'editor' || currentUser.role === 'admin') {
      baseTips.push({
        icon: '📰',
        title: 'Criar Matérias',
        description: 'Use Ctrl+S para salvar rascunhos. O sistema salva automaticamente a cada 30 segundos.',
        color: 'bg-green-50'
      });
    }

    if (currentUser.role === 'admin') {
      baseTips.push(
        {
          icon: '🔒',
          title: 'Controle de Acesso',
          description: 'Configure permissões granulares por usuário e defina papéis personalizados.',
          color: 'bg-orange-50'
        },
        {
          icon: '📊',
          title: 'Versionamento',
          description: 'Todo conteúdo possui histórico. Você pode restaurar versões anteriores a qualquer momento.',
          color: 'bg-indigo-50'
        },
        {
          icon: '🚀',
          title: 'Deploy Automático',
          description: 'Alterações são publicadas automaticamente. Use "Rascunho" para trabalhar sem publicar.',
          color: 'bg-pink-50'
        }
      );
    }

    baseTips.push({
      icon: '💡',
      title: 'Atalhos de Teclado',
      description: 'Pressione "?" em qualquer tela para ver os atalhos disponíveis.',
      color: 'bg-yellow-50'
    });

    return baseTips;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'article': return FileText;
      case 'page': return Layout;
      case 'file': return Image;
      case 'user': return User;
      case 'menu': return MenuIcon;
      case 'link': return Link;
      default: return FileText;
    }
  };

  const getActivityColor = (action: string) => {
    switch (action) {
      case 'published': return 'text-green-600';
      case 'created': return 'text-blue-600';
      case 'updated': return 'text-orange-600';
      case 'deleted': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getActivityLabel = (action: string) => {
    switch (action) {
      case 'published': return 'Publicado';
      case 'created': return 'Criado';
      case 'updated': return 'Atualizado';
      case 'deleted': return 'Excluído';
      default: return action;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffInMs = now.getTime() - then.getTime();
    const diffInMins = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMins < 1) return 'Agora mesmo';
    if (diffInMins < 60) return `${diffInMins} min atrás`;
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    if (diffInDays === 1) return 'Ontem';
    if (diffInDays < 7) return `${diffInDays} dias atrás`;
    return then.toLocaleDateString('pt-BR');
  };

  const displayStats = [
    { 
      icon: FileText, 
      label: 'Matérias', 
      value: stats.articles.total.toString(), 
      change: `${stats.articles.published} publicadas`, 
      color: 'bg-blue-500',
      trend: stats.articles.published > 0 ? '+' + Math.floor((stats.articles.published / stats.articles.total) * 100) + '%' : '0%'
    },
    { 
      icon: Layout, 
      label: 'Páginas', 
      value: stats.pages.total.toString(), 
      change: `${stats.pages.published} publicadas`, 
      color: 'bg-green-500',
      trend: stats.pages.published > 0 ? '+' + Math.floor((stats.pages.published / stats.pages.total) * 100) + '%' : '0%'
    },
    { 
      icon: Image, 
      label: 'Arquivos', 
      value: stats.files.total.toString(), 
      change: `${stats.files.images} imagens`, 
      color: 'bg-purple-500',
      trend: '+' + stats.files.total
    },
    { 
      icon: Eye, 
      label: 'Visualizações', 
      value: (stats.views.total / 1000).toFixed(1) + 'k', 
      change: `+${stats.views.thisMonth} este mês`, 
      color: 'bg-orange-500',
      trend: '+12%'
    },
  ];

  const quickActions = getQuickActions();
  const tips = getTipsByRole();

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 mb-2">
            Bem-vindo de volta, {currentUser.name}! 👋
          </h1>
          <p className="text-gray-600">
            Aqui está um resumo do seu portal • {currentUser.role === 'admin' ? 'Administrador' : currentUser.role === 'editor' ? 'Editor' : 'Visualizador'}
          </p>
        </div>
        
        {/* Tips Button */}
        <Button 
          variant="outline" 
          onClick={() => setShowTips(true)}
          className="gap-2"
        >
          <Lightbulb className="w-4 h-4" />
          Dicas Rápidas
        </Button>
      </div>

      {/* Quick Actions */}
      {quickActions.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={index}
                  onClick={action.action}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all hover:border-indigo-300 bg-white group"
                >
                  <div className={`${action.color} p-3 rounded-lg mb-3 w-fit group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="font-medium text-gray-900 text-sm mb-1">
                    {action.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {action.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {displayStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {stat.trend}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.change}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity & System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity - 2 columns */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Atividade Recente
                </CardTitle>
                <CardDescription>Últimas 5 atividades do sistema</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => onNavigate('articles')}>
                Ver todas
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {activities.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Nenhuma atividade recente</p>
                <p className="text-sm">Comece criando conteúdo!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activities.map((activity) => {
                  const Icon = getActivityIcon(activity.type);
                  return (
                    <div 
                      key={activity.id} 
                      className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0 hover:bg-gray-50 p-2 rounded-lg transition-colors"
                    >
                      <div className={`p-2 rounded-lg bg-gray-100 ${getActivityColor(activity.action)}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-gray-900 truncate">
                            {activity.title}
                          </p>
                          {activity.status && (
                            <Badge 
                              variant={activity.status === 'published' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {activity.status === 'published' ? 'Publicado' : 'Rascunho'}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          {getActivityLabel(activity.action)} por {activity.user} • {formatTimeAgo(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Status - 1 column */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Status do Sistema
            </CardTitle>
            <CardDescription>Tudo funcionando perfeitamente</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium">Sistema Online</span>
                </div>
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span className="text-sm font-medium">Backup Ativo</span>
                </div>
                <CheckCircle className="w-4 h-4 text-blue-600" />
              </div>

              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full" />
                  <span className="text-sm font-medium">Cache Otimizado</span>
                </div>
                <CheckCircle className="w-4 h-4 text-purple-600" />
              </div>

              <div className="pt-4 border-t">
                <p className="text-xs text-gray-500 mb-2">Espaço em Uso</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full transition-all" 
                    style={{ width: `${Math.min((stats.files.total / 500) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600">
                  {stats.files.total} de 500 arquivos ({Math.floor((stats.files.total / 500) * 100)}%)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tips Modal (Sheet) */}
      <Sheet open={showTips} onOpenChange={setShowTips}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              Dicas Rápidas
            </SheetTitle>
            <SheetDescription>
              Dicas personalizadas para o seu perfil: {currentUser.role === 'admin' ? 'Administrador' : currentUser.role === 'editor' ? 'Editor' : 'Visualizador'}
            </SheetDescription>
          </SheetHeader>

          <ScrollArea className="h-[calc(100vh-120px)] mt-6 pr-4">
            <div className="space-y-4">
              {tips.map((tip, index) => (
                <div key={index} className={`p-4 rounded-lg ${tip.color} border border-gray-200`}>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{tip.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {tip.title}
                      </h3>
                      <p className="text-sm text-gray-700">
                        {tip.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Additional context-specific tip */}
              <div className="p-4 rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🎯</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Seu Próximo Passo
                    </h3>
                    <p className="text-sm text-gray-700 mb-3">
                      {currentUser.role === 'admin' 
                        ? 'Configure os usuários e permissões do sistema para sua equipe.'
                        : currentUser.role === 'editor'
                        ? 'Crie sua primeira matéria usando o editor visual avançado.'
                        : 'Explore o sistema e familiarize-se com as funcionalidades disponíveis.'}
                    </p>
                    {currentUser.role !== 'viewer' && (
                      <Button 
                        size="sm" 
                        onClick={() => {
                          setShowTips(false);
                          onNavigate(currentUser.role === 'admin' ? 'users' : 'articles');
                        }}
                        className="w-full"
                      >
                        {currentUser.role === 'admin' ? 'Gerenciar Usuários' : 'Criar Matéria'}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
}
