import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { FileText, Layout, Image, Users, TrendingUp, Eye } from 'lucide-react';

interface DashboardHomeProps {
  currentUser: any;
}

export function DashboardHome({ currentUser }: DashboardHomeProps) {
  const stats = [
    { icon: FileText, label: 'Matérias', value: '24', change: '+3 esta semana', color: 'bg-blue-500' },
    { icon: Layout, label: 'Páginas', value: '12', change: '+2 esta semana', color: 'bg-green-500' },
    { icon: Image, label: 'Arquivos', value: '156', change: '+15 este mês', color: 'bg-purple-500' },
    { icon: Eye, label: 'Visualizações', value: '5.2k', change: '+12% este mês', color: 'bg-orange-500' },
  ];

  const recentArticles = [
    { title: 'Nova funcionalidade lançada', author: 'Admin', date: '2 horas atrás', status: 'Publicado' },
    { title: 'Tutorial de configuração', author: 'Editor', date: '5 horas atrás', status: 'Rascunho' },
    { title: 'Anúncio importante', author: 'Admin', date: '1 dia atrás', status: 'Publicado' },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2">Bem-vindo, {currentUser.name}!</h1>
        <p className="text-gray-600">Aqui está um resumo do seu portal</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-gray-900 mb-1">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.change}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
            <CardDescription>Últimas matérias criadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentArticles.map((article, index) => (
                <div key={index} className="flex items-start justify-between pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="flex-1">
                    <p className="mb-1">{article.title}</p>
                    <p className="text-xs text-gray-500">
                      Por {article.author} • {article.date}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    article.status === 'Publicado' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {article.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dicas Rápidas</CardTitle>
            <CardDescription>Como usar o sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm mb-1">📝 Criar Matérias</p>
                <p className="text-xs text-gray-600">Use o editor para criar e publicar notícias com preview em tempo real</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="text-sm mb-1">🎨 Editor de Páginas</p>
                <p className="text-xs text-gray-600">Arraste e solte componentes para criar páginas personalizadas</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm mb-1">🖼️ Gerenciar Arquivos</p>
                <p className="text-xs text-gray-600">Organize suas imagens em pastas e categorias</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
