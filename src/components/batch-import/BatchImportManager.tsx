import React, { useState, useEffect } from 'react';
import { 
  Play, Pause, Square, RefreshCw, Download, Upload, Settings, 
  CheckCircle, XCircle, Clock, AlertTriangle, BarChart3, FileText,
  Filter, Search, Eye, Edit2, Trash2, Plus, ChevronRight, Database,
  Globe, Rss, Code, Zap, TrendingUp, Users, Calendar, Activity
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  Legend, ResponsiveContainer 
} from 'recharts';
import { BatchImportService, ImportJob, SourceProfile, DiscoveredItem, ReviewItem, SourceType, JobStatus } from '../../services/BatchImportService';
import { toast } from 'sonner@2.0.3';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const SOURCE_TYPE_ICONS: Record<SourceType, React.ReactNode> = {
  'wordpress': <Database className="h-4 w-4" />,
  'html': <Globe className="h-4 w-4" />,
  'rss': <Rss className="h-4 w-4" />,
  'json-api': <Code className="h-4 w-4" />,
  'sitemap': <FileText className="h-4 w-4" />
};

const STATUS_CONFIG: Record<JobStatus, { label: string; color: string; icon: React.ReactNode }> = {
  'pending': { label: 'Pendente', color: 'bg-gray-500', icon: <Clock className="h-3 w-3" /> },
  'running': { label: 'Executando', color: 'bg-blue-500', icon: <Activity className="h-3 w-3 animate-pulse" /> },
  'paused': { label: 'Pausado', color: 'bg-yellow-500', icon: <Pause className="h-3 w-3" /> },
  'completed': { label: 'Concluído', color: 'bg-green-500', icon: <CheckCircle className="h-3 w-3" /> },
  'failed': { label: 'Falhou', color: 'bg-red-500', icon: <XCircle className="h-3 w-3" /> },
  'cancelled': { label: 'Cancelado', color: 'bg-gray-500', icon: <Square className="h-3 w-3" /> }
};

export function BatchImportManager() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [jobs, setJobs] = useState<ImportJob[]>([]);
  const [profiles, setProfiles] = useState<SourceProfile[]>([]);
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>([]);
  const [selectedJob, setSelectedJob] = useState<ImportJob | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<SourceProfile | null>(null);
  const [selectedReviewItem, setSelectedReviewItem] = useState<ReviewItem | null>(null);
  
  const [showNewJobDialog, setShowNewJobDialog] = useState(false);
  const [showNewProfileDialog, setShowNewProfileDialog] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [showJobDetailsDialog, setShowJobDetailsDialog] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'all'>('all');

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 2000); // Auto-refresh
    return () => clearInterval(interval);
  }, []);

  const loadData = () => {
    setJobs(BatchImportService.getJobs());
    setProfiles(BatchImportService.getProfiles());
    setReviewItems(BatchImportService.getItemsForReview());
  };

  const metrics = BatchImportService.getMetrics();

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // ========================================================================
  // DASHBOARD
  // ========================================================================

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total de Jobs</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{metrics.totalJobs}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.activeJobs} ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Itens Importados</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{metrics.importedItems}</div>
            <p className="text-xs text-muted-foreground">
              de {metrics.totalItems} totais
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Taxa de Sucesso</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{metrics.successRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Confiança: {(metrics.avgConfidence * 100).toFixed(0)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Pendentes de Revisão</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{metrics.pendingReview}</div>
            <p className="text-xs text-muted-foreground">
              Requerem atenção
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Importações (Últimos 30 dias)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metrics.timeline}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Line type="monotone" dataKey="discovered" stroke="#8884d8" name="Descobertos" />
                <Line type="monotone" dataKey="imported" stroke="#82ca9d" name="Importados" />
                <Line type="monotone" dataKey="failed" stroke="#ff8042" name="Falhas" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance por Fonte</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={Object.entries(metrics.bySource).map(([name, data]) => ({ name, ...data }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="imported" fill="#82ca9d" name="Importados" />
                <Bar dataKey="items" fill="#8884d8" name="Total" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Jobs recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Jobs Recentes</CardTitle>
          <CardDescription>Últimos jobs de importação</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {jobs.slice(0, 5).map(job => (
              <div 
                key={job.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer"
                onClick={() => {
                  setSelectedJob(job);
                  setShowJobDetailsDialog(true);
                }}
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className={`w-2 h-2 rounded-full ${STATUS_CONFIG[job.status].color}`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span>{job.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {STATUS_CONFIG[job.status].label}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {job.progress.imported} de {job.progress.total} importados
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={job.progress.percentage} className="w-32" />
                  <span className="text-sm">{job.progress.percentage}%</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // ========================================================================
  // JOBS
  // ========================================================================

  const renderJobs = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as JobStatus | 'all')}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="running">Executando</SelectItem>
              <SelectItem value="paused">Pausado</SelectItem>
              <SelectItem value="completed">Concluído</SelectItem>
              <SelectItem value="failed">Falhou</SelectItem>
              <SelectItem value="cancelled">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setShowNewJobDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Job
        </Button>
      </div>

      <div className="space-y-3">
        {filteredJobs.map(job => (
          <Card key={job.id}>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg">{job.name}</h3>
                      <Badge variant="outline" className="flex items-center gap-1">
                        {STATUS_CONFIG[job.status].icon}
                        {STATUS_CONFIG[job.status].label}
                      </Badge>
                      {job.config.dryRun && (
                        <Badge variant="secondary">Dry Run</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(job.createdAt).toLocaleString('pt-BR')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {job.createdBy}
                      </span>
                      {job.metrics.duration && (
                        <span>
                          Duração: {Math.round(job.metrics.duration / 60000)}min
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {job.status === 'running' && (
                      <>
                        <Button size="sm" variant="outline" onClick={() => {
                          BatchImportService.pauseJob(job.id);
                          loadData();
                          toast.success('Job pausado');
                        }}>
                          <Pause className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => {
                          BatchImportService.cancelJob(job.id);
                          loadData();
                          toast.warning('Job cancelado');
                        }}>
                          <Square className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    {(job.status === 'pending' || job.status === 'paused') && (
                      <Button size="sm" onClick={() => {
                        BatchImportService.startJob(job.id);
                        loadData();
                        toast.info('Job iniciado');
                      }}>
                        <Play className="h-4 w-4 mr-2" />
                        Iniciar
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => {
                      setSelectedJob(job);
                      setShowJobDetailsDialog(true);
                    }}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => {
                      if (confirm('Tem certeza que deseja excluir este job?')) {
                        BatchImportService.deleteJob(job.id);
                        loadData();
                        toast.success('Job excluído');
                      }
                    }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progresso</span>
                    <span>{job.progress.percentage}%</span>
                  </div>
                  <Progress value={job.progress.percentage} />
                  
                  <div className="grid grid-cols-5 gap-2 text-xs text-center">
                    <div>
                      <div className="text-muted-foreground">Descobertos</div>
                      <div>{job.progress.discovered}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Mapeados</div>
                      <div>{job.progress.mapped}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Revisão</div>
                      <div className="text-yellow-600">{job.progress.pendingReview}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Importados</div>
                      <div className="text-green-600">{job.progress.imported}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Falhas</div>
                      <div className="text-red-600">{job.progress.failed}</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    Taxa de sucesso: {job.metrics.successRate.toFixed(1)}%
                  </div>
                  <div className="flex items-center gap-1">
                    <BarChart3 className="h-3 w-3" />
                    Confiança média: {(job.metrics.avgConfidence * 100).toFixed(0)}%
                  </div>
                  {job.metrics.errors > 0 && (
                    <div className="flex items-center gap-1 text-red-600">
                      <AlertTriangle className="h-3 w-3" />
                      {job.metrics.errors} erros
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  // ========================================================================
  // PROFILES
  // ========================================================================

  const renderProfiles = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg">Perfis de Fonte</h3>
          <p className="text-sm text-muted-foreground">
            Configure fontes de importação
          </p>
        </div>
        <Button onClick={() => setShowNewProfileDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Perfil
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {profiles.map(profile => (
          <Card key={profile.id}>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-accent rounded-lg">
                      {SOURCE_TYPE_ICONS[profile.type]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4>{profile.name}</h4>
                        {profile.enabled ? (
                          <Badge variant="default" className="bg-green-500">Ativo</Badge>
                        ) : (
                          <Badge variant="secondary">Inativo</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{profile.domain}</p>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => {
                    setSelectedProfile(profile);
                    setShowNewProfileDialog(true);
                  }}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tipo:</span>
                    <span className="capitalize">{profile.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">URL Base:</span>
                    <span className="truncate max-w-48">{profile.baseUrl}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rate Limit:</span>
                    <span>{profile.rateLimit.requestsPerSecond} req/s</span>
                  </div>
                </div>

                {profile.stats && (
                  <>
                    <Separator />
                    <div className="grid grid-cols-2 gap-4 text-center text-sm">
                      <div>
                        <div className="text-muted-foreground">Descobertos</div>
                        <div>{profile.stats.totalDiscovered}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Importados</div>
                        <div className="text-green-600">{profile.stats.totalImported}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Taxa Sucesso</div>
                        <div>{profile.stats.successRate.toFixed(1)}%</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Confiança</div>
                        <div>{(profile.stats.avgConfidence * 100).toFixed(0)}%</div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  // ========================================================================
  // REVISÃO HUMANA
  // ========================================================================

  const renderReview = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg">Revisão Humana</h3>
          <p className="text-sm text-muted-foreground">
            {reviewItems.length} itens aguardando revisão
          </p>
        </div>
      </div>

      {reviewItems.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
            <h3 className="text-lg mb-2">Tudo revisado!</h3>
            <p className="text-muted-foreground">
              Não há itens pendentes de revisão no momento.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {reviewItems.map(item => (
            <Card key={item.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h4>{item.normalized?.title || item.extracted?.title || 'Sem título'}</h4>
                      {item.mapped && (
                        <Badge variant={item.mapped.confidence.overall >= 0.8 ? 'default' : 'secondary'}>
                          Confiança: {(item.mapped.confidence.overall * 100).toFixed(0)}%
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {item.normalized?.excerpt || item.extracted?.excerpt}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{item.url}</span>
                      {item.extracted?.author && <span>Por: {item.extracted.author}</span>}
                      {item.extracted?.publishedDate && (
                        <span>{new Date(item.extracted.publishedDate).toLocaleDateString('pt-BR')}</span>
                      )}
                    </div>

                    {item.mapped?.violations && item.mapped.violations.length > 0 && (
                      <div className="flex items-start gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                        <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                        <div>
                          <div className="text-yellow-900">Problemas detectados:</div>
                          <ul className="list-disc list-inside text-yellow-700">
                            {item.mapped.violations.map((v, i) => (
                              <li key={i}>{v}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => {
                        setSelectedReviewItem(item);
                        setShowReviewDialog(true);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Revisar
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        BatchImportService.approveItem(item.id);
                        loadData();
                        toast.success('Item aprovado');
                      }}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Aprovar
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        BatchImportService.rejectItem(item.id, 'Rejeitado manualmente');
                        loadData();
                        toast.warning('Item rejeitado');
                      }}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  // ========================================================================
  // DIALOGS
  // ========================================================================

  const renderNewJobDialog = () => (
    <Dialog open={showNewJobDialog} onOpenChange={setShowNewJobDialog}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Novo Job de Importação</DialogTitle>
          <DialogDescription>
            Configure um novo job para importar conteúdo
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          
          const job = BatchImportService.createJob({
            name: formData.get('name') as string,
            sourceProfileIds: [formData.get('sourceProfile') as string],
            config: {
              incremental: formData.get('incremental') === 'on',
              dryRun: formData.get('dryRun') === 'on',
              autoApprove: formData.get('autoApprove') === 'on',
              confidenceThreshold: parseFloat(formData.get('confidenceThreshold') as string || '0.8'),
              maxItems: parseInt(formData.get('maxItems') as string || '0') || undefined
            }
          });
          
          setShowNewJobDialog(false);
          toast.success('Job criado com sucesso!');
          
          if (formData.get('startNow') === 'on') {
            BatchImportService.startJob(job.id);
            toast.info('Job iniciado');
          }
          
          loadData();
        }}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nome do Job</Label>
              <Input id="name" name="name" required placeholder="Importação WordPress Portal" />
            </div>
            
            <div>
              <Label htmlFor="sourceProfile">Perfil de Fonte</Label>
              <Select name="sourceProfile" required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um perfil" />
                </SelectTrigger>
                <SelectContent>
                  {profiles.filter(p => p.enabled).map(profile => (
                    <SelectItem key={profile.id} value={profile.id}>
                      {profile.name} ({profile.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="confidenceThreshold">Limiar de Confiança</Label>
                <Input 
                  id="confidenceThreshold" 
                  name="confidenceThreshold" 
                  type="number" 
                  min="0" 
                  max="1" 
                  step="0.1" 
                  defaultValue="0.8" 
                />
              </div>
              
              <div>
                <Label htmlFor="maxItems">Máximo de Itens (0 = ilimitado)</Label>
                <Input 
                  id="maxItems" 
                  name="maxItems" 
                  type="number" 
                  min="0" 
                  defaultValue="0" 
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="incremental">Importação Incremental</Label>
                <Switch id="incremental" name="incremental" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="dryRun">Dry Run (não importar)</Label>
                <Switch id="dryRun" name="dryRun" />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="autoApprove">Aprovação Automática</Label>
                <Switch id="autoApprove" name="autoApprove" />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="startNow">Iniciar Imediatamente</Label>
                <Switch id="startNow" name="startNow" defaultChecked />
              </div>
            </div>
          </div>
          
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => setShowNewJobDialog(false)}>
              Cancelar
            </Button>
            <Button type="submit">Criar Job</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );

  const renderReviewDialog = () => {
    if (!selectedReviewItem) return null;
    
    const [editedData, setEditedData] = useState(selectedReviewItem.mapped?.fields || {});
    
    return (
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Revisar Item</DialogTitle>
            <DialogDescription>
              Compare e edite os dados mapeados pela IA
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="h-[60vh]">
            <div className="space-y-6 pr-4">
              {/* Confiança */}
              <div className="p-4 bg-accent rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span>Confiança Geral</span>
                  <Badge variant={selectedReviewItem.mapped!.confidence.overall >= 0.8 ? 'default' : 'secondary'}>
                    {(selectedReviewItem.mapped!.confidence.overall * 100).toFixed(0)}%
                  </Badge>
                </div>
                <Progress value={selectedReviewItem.mapped!.confidence.overall * 100} />
              </div>
              
              {/* Comparação lado a lado */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="mb-3">Dados Extraídos</h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <Label>Título</Label>
                      <div className="p-2 bg-muted rounded">{selectedReviewItem.normalized?.title}</div>
                    </div>
                    <div>
                      <Label>Resumo</Label>
                      <div className="p-2 bg-muted rounded line-clamp-3">{selectedReviewItem.normalized?.excerpt}</div>
                    </div>
                    <div>
                      <Label>Autor</Label>
                      <div className="p-2 bg-muted rounded">{selectedReviewItem.normalized?.author || 'N/A'}</div>
                    </div>
                    <div>
                      <Label>Categorias</Label>
                      <div className="p-2 bg-muted rounded">
                        {selectedReviewItem.normalized?.categories.join(', ') || 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="mb-3">Dados Mapeados (Editável)</h4>
                  <div className="space-y-3">
                    <div>
                      <Label>Título</Label>
                      <Input 
                        value={editedData.title || ''} 
                        onChange={(e) => setEditedData({...editedData, title: e.target.value})}
                      />
                      <div className="text-xs text-muted-foreground mt-1">
                        Confiança: {(selectedReviewItem.mapped!.confidence.byField.title * 100).toFixed(0)}%
                      </div>
                    </div>
                    <div>
                      <Label>Resumo</Label>
                      <Textarea 
                        value={editedData.excerpt || ''} 
                        onChange={(e) => setEditedData({...editedData, excerpt: e.target.value})}
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label>Autor</Label>
                      <Input 
                        value={editedData.author || ''} 
                        onChange={(e) => setEditedData({...editedData, author: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>Slug</Label>
                      <Input 
                        value={editedData.slug || ''} 
                        onChange={(e) => setEditedData({...editedData, slug: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Violações */}
              {selectedReviewItem.mapped?.violations && selectedReviewItem.mapped.violations.length > 0 && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
                  <h4 className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    Problemas Detectados
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-yellow-900">
                    {selectedReviewItem.mapped.violations.map((v, i) => (
                      <li key={i}>{v}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Conteúdo completo */}
              <div>
                <Label>Conteúdo HTML</Label>
                <Textarea 
                  value={editedData.body_html || ''} 
                  onChange={(e) => setEditedData({...editedData, body_html: e.target.value})}
                  rows={10}
                  className="font-mono text-xs"
                />
              </div>
            </div>
          </ScrollArea>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                BatchImportService.rejectItem(selectedReviewItem.id, 'Rejeitado na revisão');
                setShowReviewDialog(false);
                loadData();
                toast.warning('Item rejeitado');
              }}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Rejeitar
            </Button>
            <Button 
              onClick={() => {
                BatchImportService.approveItem(selectedReviewItem.id, { fields: editedData } as any);
                setShowReviewDialog(false);
                loadData();
                toast.success('Item aprovado com edições');
              }}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Aprovar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  const renderJobDetailsDialog = () => {
    if (!selectedJob) return null;
    
    const jobItems = BatchImportService.getItemsByJob(selectedJob.id);
    
    return (
      <Dialog open={showJobDetailsDialog} onOpenChange={setShowJobDetailsDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{selectedJob.name}</DialogTitle>
            <DialogDescription>
              Detalhes e itens do job
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="items" className="flex-1">
            <TabsList>
              <TabsTrigger value="items">Itens ({jobItems.length})</TabsTrigger>
              <TabsTrigger value="logs">Logs ({selectedJob.logs.length})</TabsTrigger>
              <TabsTrigger value="errors">Erros ({selectedJob.errors.length})</TabsTrigger>
              <TabsTrigger value="config">Configuração</TabsTrigger>
            </TabsList>
            
            <TabsContent value="items" className="mt-4">
              <ScrollArea className="h-[50vh]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>URL</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Confiança</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {jobItems.slice(0, 50).map(item => (
                      <TableRow key={item.id}>
                        <TableCell className="max-w-md truncate">{item.url}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.status}</Badge>
                        </TableCell>
                        <TableCell>
                          {item.mapped?.confidence.overall 
                            ? `${(item.mapped.confidence.overall * 100).toFixed(0)}%`
                            : 'N/A'
                          }
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {item.status === 'pending-review' && (
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => {
                                  setSelectedReviewItem(item as ReviewItem);
                                  setShowReviewDialog(true);
                                }}
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => {
                                BatchImportService.reprocessItem(item.id);
                                loadData();
                                toast.info('Item em reprocessamento');
                              }}
                            >
                              <RefreshCw className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="logs" className="mt-4">
              <ScrollArea className="h-[50vh]">
                <div className="space-y-2">
                  {selectedJob.logs.map(log => (
                    <div 
                      key={log.id} 
                      className={`p-3 rounded border-l-4 ${
                        log.level === 'error' ? 'border-red-500 bg-red-50' :
                        log.level === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                        'border-blue-500 bg-blue-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              {log.stage}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(log.timestamp).toLocaleString('pt-BR')}
                            </span>
                          </div>
                          <div className="text-sm">{log.message}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="errors" className="mt-4">
              <ScrollArea className="h-[50vh]">
                {selectedJob.errors.length === 0 ? (
                  <div className="text-center p-8 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
                    Nenhum erro encontrado
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedJob.errors.map(error => (
                      <div key={error.id} className="p-4 bg-red-50 border border-red-200 rounded">
                        <div className="flex items-start gap-3">
                          <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">{error.stage}</Badge>
                              <span className="text-xs text-muted-foreground">
                                {new Date(error.timestamp).toLocaleString('pt-BR')}
                              </span>
                              {error.retryCount > 0 && (
                                <Badge variant="secondary">
                                  {error.retryCount} tentativas
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-red-900">{error.error}</div>
                            {error.itemId && (
                              <div className="text-xs text-red-700 mt-1">Item: {error.itemId}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="config" className="mt-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Incremental</Label>
                    <div className="p-2 bg-muted rounded">
                      {selectedJob.config.incremental ? 'Sim' : 'Não'}
                    </div>
                  </div>
                  <div>
                    <Label>Dry Run</Label>
                    <div className="p-2 bg-muted rounded">
                      {selectedJob.config.dryRun ? 'Sim' : 'Não'}
                    </div>
                  </div>
                  <div>
                    <Label>Aprovação Automática</Label>
                    <div className="p-2 bg-muted rounded">
                      {selectedJob.config.autoApprove ? 'Sim' : 'Não'}
                    </div>
                  </div>
                  <div>
                    <Label>Limiar de Confiança</Label>
                    <div className="p-2 bg-muted rounded">
                      {(selectedJob.config.confidenceThreshold * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label>Perfis de Fonte</Label>
                  <div className="space-y-2 mt-2">
                    {selectedJob.sourceProfileIds.map(id => {
                      const profile = profiles.find(p => p.id === id);
                      return profile ? (
                        <div key={id} className="p-2 bg-muted rounded flex items-center gap-2">
                          {SOURCE_TYPE_ICONS[profile.type]}
                          {profile.name}
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    );
  };

  const renderNewProfileDialog = () => (
    <Dialog open={showNewProfileDialog} onOpenChange={setShowNewProfileDialog}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {selectedProfile ? 'Editar Perfil' : 'Novo Perfil de Fonte'}
          </DialogTitle>
          <DialogDescription>
            Configure uma fonte de importação
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          
          BatchImportService.saveProfile({
            id: selectedProfile?.id,
            name: formData.get('name') as string,
            domain: formData.get('domain') as string,
            type: formData.get('type') as SourceType,
            baseUrl: formData.get('baseUrl') as string,
            enabled: formData.get('enabled') === 'on',
            rateLimit: {
              requestsPerSecond: parseFloat(formData.get('rateLimit') as string || '2'),
              concurrent: parseInt(formData.get('concurrent') as string || '3')
            },
            config: {}
          });
          
          setShowNewProfileDialog(false);
          setSelectedProfile(null);
          loadData();
          toast.success(selectedProfile ? 'Perfil atualizado!' : 'Perfil criado!');
        }}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nome</Label>
              <Input 
                id="name" 
                name="name" 
                required 
                defaultValue={selectedProfile?.name}
                placeholder="WordPress - Portal Exemplo" 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="domain">Domínio</Label>
                <Input 
                  id="domain" 
                  name="domain" 
                  required
                  defaultValue={selectedProfile?.domain}
                  placeholder="portal.exemplo.gov.br" 
                />
              </div>
              
              <div>
                <Label htmlFor="type">Tipo</Label>
                <Select name="type" defaultValue={selectedProfile?.type || 'wordpress'}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wordpress">WordPress</SelectItem>
                    <SelectItem value="html">HTML/Scraping</SelectItem>
                    <SelectItem value="rss">RSS/Atom</SelectItem>
                    <SelectItem value="json-api">JSON API</SelectItem>
                    <SelectItem value="sitemap">Sitemap</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="baseUrl">URL Base</Label>
              <Input 
                id="baseUrl" 
                name="baseUrl" 
                required
                defaultValue={selectedProfile?.baseUrl}
                placeholder="https://portal.exemplo.gov.br" 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rateLimit">Requisições por Segundo</Label>
                <Input 
                  id="rateLimit" 
                  name="rateLimit" 
                  type="number" 
                  min="1" 
                  max="10"
                  defaultValue={selectedProfile?.rateLimit.requestsPerSecond || 2}
                />
              </div>
              
              <div>
                <Label htmlFor="concurrent">Requisições Concorrentes</Label>
                <Input 
                  id="concurrent" 
                  name="concurrent" 
                  type="number" 
                  min="1" 
                  max="10"
                  defaultValue={selectedProfile?.rateLimit.concurrent || 3}
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="enabled">Ativo</Label>
              <Switch 
                id="enabled" 
                name="enabled" 
                defaultChecked={selectedProfile?.enabled ?? true}
              />
            </div>
          </div>
          
          <DialogFooter className="mt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setShowNewProfileDialog(false);
                setSelectedProfile(null);
              }}
            >
              Cancelar
            </Button>
            <Button type="submit">
              {selectedProfile ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );

  // ========================================================================
  // RENDER PRINCIPAL
  // ========================================================================

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl mb-2">Importação em Lote</h2>
        <p className="text-muted-foreground">
          Sistema de importação inteligente com mapeamento por IA para múltiplas fontes
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="dashboard">
            <BarChart3 className="h-4 w-4 mr-2" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="jobs">
            <Activity className="h-4 w-4 mr-2" />
            Jobs ({jobs.length})
          </TabsTrigger>
          <TabsTrigger value="review">
            <Eye className="h-4 w-4 mr-2" />
            Revisão ({reviewItems.length})
          </TabsTrigger>
          <TabsTrigger value="profiles">
            <Settings className="h-4 w-4 mr-2" />
            Perfis ({profiles.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-6">
          {renderDashboard()}
        </TabsContent>

        <TabsContent value="jobs" className="mt-6">
          {renderJobs()}
        </TabsContent>

        <TabsContent value="review" className="mt-6">
          {renderReview()}
        </TabsContent>

        <TabsContent value="profiles" className="mt-6">
          {renderProfiles()}
        </TabsContent>
      </Tabs>

      {renderNewJobDialog()}
      {renderNewProfileDialog()}
      {renderReviewDialog()}
      {renderJobDetailsDialog()}
    </div>
  );
}
