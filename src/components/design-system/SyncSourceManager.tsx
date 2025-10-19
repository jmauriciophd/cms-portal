import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { 
  Plus, 
  RefreshCw, 
  Trash2, 
  GitBranch, 
  Link as LinkIcon, 
  FileCode,
  Check,
  X,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { 
  SyncSource, 
  SyncResult, 
  FigmaConfig, 
  GitHubConfig, 
  URLConfig,
  designSystemSyncService 
} from '../../services/DesignSystemSyncService';
import { toast } from 'sonner@2.0.3';

interface SyncSourceManagerProps {
  sources: SyncSource[];
  history: SyncResult[];
  onSync: (sourceId: string) => void;
  onUpdate: () => void;
}

export function SyncSourceManager({ sources, history, onSync, onUpdate }: SyncSourceManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [sourceType, setSourceType] = useState<'figma' | 'github' | 'url'>('figma');
  const [sourceName, setSourceName] = useState('');
  
  // Figma
  const [figmaFileKey, setFigmaFileKey] = useState('');
  const [figmaToken, setFigmaToken] = useState('');
  
  // GitHub
  const [githubOwner, setGithubOwner] = useState('');
  const [githubRepo, setGithubRepo] = useState('');
  const [githubBranch, setGithubBranch] = useState('main');
  const [githubPath, setGithubPath] = useState('tokens.json');
  const [githubToken, setGithubToken] = useState('');
  
  // URL
  const [url, setUrl] = useState('');
  
  // Auto sync
  const [autoSync, setAutoSync] = useState(false);
  const [syncInterval, setSyncInterval] = useState(60);

  const handleAddSource = () => {
    if (!sourceName) {
      toast.error('Nome da fonte é obrigatório');
      return;
    }

    let config: FigmaConfig | GitHubConfig | URLConfig;

    if (sourceType === 'figma') {
      if (!figmaFileKey || !figmaToken) {
        toast.error('Preencha todos os campos do Figma');
        return;
      }
      config = {
        fileKey: figmaFileKey,
        accessToken: figmaToken
      };
    } else if (sourceType === 'github') {
      if (!githubOwner || !githubRepo || !githubPath) {
        toast.error('Preencha todos os campos do GitHub');
        return;
      }
      config = {
        owner: githubOwner,
        repo: githubRepo,
        branch: githubBranch,
        path: githubPath,
        token: githubToken || undefined
      };
    } else {
      if (!url) {
        toast.error('URL é obrigatória');
        return;
      }
      config = { url };
    }

    const source: SyncSource = {
      type: sourceType,
      id: `${sourceType}-${Date.now()}`,
      name: sourceName,
      config,
      enabled: true,
      autoSync,
      syncInterval: autoSync ? syncInterval : undefined
    };

    designSystemSyncService.addSource(source);
    
    // Reset form
    setShowAddForm(false);
    setSourceName('');
    setFigmaFileKey('');
    setFigmaToken('');
    setGithubOwner('');
    setGithubRepo('');
    setGithubBranch('main');
    setGithubPath('tokens.json');
    setGithubToken('');
    setUrl('');
    setAutoSync(false);
    setSyncInterval(60);
    
    toast.success('Fonte adicionada com sucesso!');
    onUpdate();
  };

  const handleRemoveSource = (sourceId: string) => {
    designSystemSyncService.removeSource(sourceId);
    toast.success('Fonte removida!');
    onUpdate();
  };

  const handleToggleSource = (sourceId: string, enabled: boolean) => {
    designSystemSyncService.updateSource(sourceId, { enabled });
    toast.success(`Fonte ${enabled ? 'ativada' : 'desativada'}!`);
    onUpdate();
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('pt-BR');
  };

  return (
    <div className="space-y-6">
      {/* Add Source Button */}
      {!showAddForm && (
        <Button onClick={() => setShowAddForm(true)} className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Fonte de Sincronização
        </Button>
      )}

      {/* Add Source Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Nova Fonte de Sincronização</CardTitle>
            <CardDescription>
              Conecte seu Design System a fontes externas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Source Type */}
            <div className="space-y-2">
              <Label>Tipo de Fonte</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={sourceType === 'figma' ? 'default' : 'outline'}
                  onClick={() => setSourceType('figma')}
                  className="w-full"
                >
                  <FileCode className="w-4 h-4 mr-2" />
                  Figma
                </Button>
                <Button
                  variant={sourceType === 'github' ? 'default' : 'outline'}
                  onClick={() => setSourceType('github')}
                  className="w-full"
                >
                  <GitBranch className="w-4 h-4 mr-2" />
                  GitHub
                </Button>
                <Button
                  variant={sourceType === 'url' ? 'default' : 'outline'}
                  onClick={() => setSourceType('url')}
                  className="w-full"
                >
                  <LinkIcon className="w-4 h-4 mr-2" />
                  URL
                </Button>
              </div>
            </div>

            {/* Source Name */}
            <div className="space-y-2">
              <Label htmlFor="sourceName">Nome da Fonte</Label>
              <Input
                id="sourceName"
                value={sourceName}
                onChange={(e) => setSourceName(e.target.value)}
                placeholder="Meu Design System"
              />
            </div>

            {/* Figma Fields */}
            {sourceType === 'figma' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="figmaFileKey">File Key</Label>
                  <Input
                    id="figmaFileKey"
                    value={figmaFileKey}
                    onChange={(e) => setFigmaFileKey(e.target.value)}
                    placeholder="Ex: abc123def456"
                  />
                  <p className="text-xs text-gray-500">
                    Encontre na URL do Figma: figma.com/file/FILE_KEY/...
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="figmaToken">Access Token</Label>
                  <Input
                    id="figmaToken"
                    type="password"
                    value={figmaToken}
                    onChange={(e) => setFigmaToken(e.target.value)}
                    placeholder="Seu token de acesso"
                  />
                  <p className="text-xs text-gray-500">
                    Gere em: figma.com/developers/api#access-tokens
                  </p>
                </div>
              </>
            )}

            {/* GitHub Fields */}
            {sourceType === 'github' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="githubOwner">Owner</Label>
                    <Input
                      id="githubOwner"
                      value={githubOwner}
                      onChange={(e) => setGithubOwner(e.target.value)}
                      placeholder="username ou org"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="githubRepo">Repositório</Label>
                    <Input
                      id="githubRepo"
                      value={githubRepo}
                      onChange={(e) => setGithubRepo(e.target.value)}
                      placeholder="repo-name"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="githubBranch">Branch</Label>
                    <Input
                      id="githubBranch"
                      value={githubBranch}
                      onChange={(e) => setGithubBranch(e.target.value)}
                      placeholder="main"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="githubPath">Caminho do Arquivo</Label>
                    <Input
                      id="githubPath"
                      value={githubPath}
                      onChange={(e) => setGithubPath(e.target.value)}
                      placeholder="tokens.json"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="githubToken">Token (Opcional)</Label>
                  <Input
                    id="githubToken"
                    type="password"
                    value={githubToken}
                    onChange={(e) => setGithubToken(e.target.value)}
                    placeholder="Para repos privados"
                  />
                </div>
              </>
            )}

            {/* URL Fields */}
            {sourceType === 'url' && (
              <div className="space-y-2">
                <Label htmlFor="url">URL do Design System</Label>
                <Input
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/tokens.json"
                />
              </div>
            )}

            {/* Auto Sync */}
            <div className="flex items-center justify-between p-4 border rounded-md">
              <div>
                <p className="font-medium">Sincronização Automática</p>
                <p className="text-sm text-gray-600">
                  Atualizar automaticamente em intervalos regulares
                </p>
              </div>
              <Switch
                checked={autoSync}
                onCheckedChange={setAutoSync}
              />
            </div>

            {autoSync && (
              <div className="space-y-2">
                <Label htmlFor="syncInterval">Intervalo (minutos)</Label>
                <Input
                  id="syncInterval"
                  type="number"
                  value={syncInterval}
                  onChange={(e) => setSyncInterval(Number(e.target.value))}
                  min="1"
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <Button onClick={handleAddSource} className="flex-1">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Fonte
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowAddForm(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sources List */}
      <Card>
        <CardHeader>
          <CardTitle>Fontes Configuradas</CardTitle>
          <CardDescription>
            {sources.length} fonte(s) de sincronização
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sources.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              Nenhuma fonte configurada
            </p>
          ) : (
            <div className="space-y-4">
              {sources.map(source => (
                <Card key={source.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium">{source.name}</h3>
                          <Badge variant="outline">{source.type}</Badge>
                          {source.enabled ? (
                            <Badge variant="default">
                              <Check className="w-3 h-3 mr-1" />
                              Ativo
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <X className="w-3 h-3 mr-1" />
                              Inativo
                            </Badge>
                          )}
                        </div>
                        {source.lastSync && (
                          <p className="text-sm text-gray-600">
                            Última sync: {formatTimestamp(source.lastSync)}
                          </p>
                        )}
                        {source.autoSync && (
                          <p className="text-sm text-gray-600">
                            <Clock className="w-3 h-3 inline mr-1" />
                            Auto-sync: a cada {source.syncInterval} minutos
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onSync(source.id)}
                          disabled={!source.enabled}
                        >
                          <RefreshCw className="w-4 h-4 mr-1" />
                          Sincronizar
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveSource(source.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={source.enabled}
                        onCheckedChange={(checked) => handleToggleSource(source.id, checked)}
                      />
                      <span className="text-sm text-gray-600">
                        {source.enabled ? 'Desativar' : 'Ativar'} fonte
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sync History */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Sincronizações</CardTitle>
          <CardDescription>
            Últimas {history.length} sincronizações
          </CardDescription>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              Nenhuma sincronização realizada
            </p>
          ) : (
            <div className="space-y-3">
              {history.slice(0, 10).map((result, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {result.success ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <X className="w-4 h-4 text-red-600" />
                          )}
                          <p className="font-medium">{result.source}</p>
                          <p className="text-sm text-gray-600">
                            {formatTimestamp(result.timestamp)}
                          </p>
                        </div>
                        {result.success && result.newVersion && (
                          <p className="text-sm text-green-600">
                            ✓ Versão {result.newVersion} criada
                          </p>
                        )}
                        {result.changes && result.changes.length > 0 && (
                          <p className="text-sm text-gray-600">
                            {result.changes.length} mudança(s) aplicada(s)
                          </p>
                        )}
                        {result.errors && result.errors.length > 0 && (
                          <div className="mt-2">
                            {result.errors.map((error, i) => (
                              <p key={i} className="text-sm text-red-600">
                                ✗ {error}
                              </p>
                            ))}
                          </div>
                        )}
                        {result.warnings && result.warnings.length > 0 && (
                          <div className="mt-2">
                            {result.warnings.map((warning, i) => (
                              <p key={i} className="text-sm text-amber-600">
                                <AlertTriangle className="w-3 h-3 inline mr-1" />
                                {warning}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                      <Badge variant={result.success ? 'default' : 'destructive'}>
                        {result.success ? 'Sucesso' : 'Falha'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
