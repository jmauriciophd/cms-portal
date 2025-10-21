import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { 
  Home, 
  Save, 
  Eye, 
  Upload, 
  Link as LinkIcon, 
  Image as ImageIcon, 
  Type, 
  Layout,
  Palette,
  Settings,
  FileText,
  Undo,
  Redo
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';

interface HomeSection {
  id: string;
  type: 'hero' | 'features' | 'content' | 'gallery' | 'cta' | 'custom';
  title: string;
  subtitle?: string;
  content?: string;
  image?: string;
  backgroundImage?: string;
  link?: {
    text: string;
    url: string;
    openInNewTab: boolean;
  };
  style?: {
    backgroundColor?: string;
    textColor?: string;
    padding?: string;
    alignment?: 'left' | 'center' | 'right';
  };
  enabled: boolean;
  order: number;
  customHTML?: string;
}

interface HomePage {
  id: string;
  siteId?: string;
  title: string;
  description: string;
  sections: HomeSection[];
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
  theme: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
  };
  updatedAt: string;
  updatedBy?: string;
}

interface HomePageEditorProps {
  siteId?: string;
}

export function HomePageEditor({ siteId }: HomePageEditorProps) {
  const [homePage, setHomePage] = useState<HomePage | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showMediaSelector, setShowMediaSelector] = useState(false);
  const [mediaTarget, setMediaTarget] = useState<{ sectionId: string; field: 'image' | 'backgroundImage' } | null>(null);
  const [history, setHistory] = useState<HomePage[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  useEffect(() => {
    loadHomePage();
  }, [siteId]);

  const getStorageKey = () => {
    return siteId ? `site-${siteId}-homepage` : 'homepage';
  };

  const loadHomePage = () => {
    const stored = localStorage.getItem(getStorageKey());
    if (stored) {
      const loaded = JSON.parse(stored);
      setHomePage(loaded);
      setHistory([loaded]);
      setHistoryIndex(0);
    } else {
      // Criar homepage padrão
      const defaultHomePage = createDefaultHomePage();
      setHomePage(defaultHomePage);
      setHistory([defaultHomePage]);
      setHistoryIndex(0);
    }
  };

  const createDefaultHomePage = (): HomePage => {
    return {
      id: `homepage-${Date.now()}`,
      siteId,
      title: 'Bem-vindo ao Portal',
      description: 'Sistema de Gerenciamento de Conteúdo',
      sections: [
        {
          id: 'hero-1',
          type: 'hero',
          title: 'Bem-vindo ao Portal CMS',
          subtitle: 'Sistema completo de gerenciamento de conteúdo',
          content: 'Crie, gerencie e publique conteúdo de forma fácil e intuitiva.',
          image: '',
          backgroundImage: '',
          link: {
            text: 'Começar Agora',
            url: '/dashboard',
            openInNewTab: false
          },
          style: {
            backgroundColor: '#667eea',
            textColor: '#ffffff',
            padding: '80px 20px',
            alignment: 'center'
          },
          enabled: true,
          order: 0
        },
        {
          id: 'features-1',
          type: 'features',
          title: 'Recursos Principais',
          subtitle: 'Tudo o que você precisa em um só lugar',
          content: 'Editor visual, gerenciamento de mídia, SEO otimizado e muito mais.',
          style: {
            backgroundColor: '#ffffff',
            textColor: '#333333',
            padding: '60px 20px',
            alignment: 'center'
          },
          enabled: true,
          order: 1
        },
        {
          id: 'cta-1',
          type: 'cta',
          title: 'Pronto para começar?',
          content: 'Acesse o painel administrativo e comece a criar conteúdo incrível.',
          link: {
            text: 'Acessar Dashboard',
            url: '/dashboard',
            openInNewTab: false
          },
          style: {
            backgroundColor: '#f7fafc',
            textColor: '#2d3748',
            padding: '60px 20px',
            alignment: 'center'
          },
          enabled: true,
          order: 2
        }
      ],
      seo: {
        metaTitle: 'Portal CMS - Sistema de Gerenciamento de Conteúdo',
        metaDescription: 'Crie e gerencie seu conteúdo de forma profissional',
        keywords: ['cms', 'portal', 'conteúdo', 'gerenciamento']
      },
      theme: {
        primaryColor: '#667eea',
        secondaryColor: '#764ba2',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      },
      updatedAt: new Date().toISOString()
    };
  };

  const saveHomePage = (pageData: HomePage = homePage!) => {
    if (!pageData) return;

    const updated = {
      ...pageData,
      updatedAt: new Date().toISOString()
    };

    localStorage.setItem(getStorageKey(), JSON.stringify(updated));
    setHomePage(updated);

    // Adicionar ao histórico
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(updated);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);

    toast.success('Página inicial salva com sucesso!');
  };

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setHomePage(history[newIndex]);
      localStorage.setItem(getStorageKey(), JSON.stringify(history[newIndex]));
      toast.success('Desfeito');
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setHomePage(history[newIndex]);
      localStorage.setItem(getStorageKey(), JSON.stringify(history[newIndex]));
      toast.success('Refeito');
    }
  };

  const updateSection = (sectionId: string, updates: Partial<HomeSection>) => {
    if (!homePage) return;

    const updatedSections = homePage.sections.map(section =>
      section.id === sectionId ? { ...section, ...updates } : section
    );

    const updated = { ...homePage, sections: updatedSections };
    saveHomePage(updated);
  };

  const addSection = (type: HomeSection['type']) => {
    if (!homePage) return;

    const newSection: HomeSection = {
      id: `section-${Date.now()}`,
      type,
      title: `Nova Seção ${type}`,
      content: 'Conteúdo da seção',
      style: {
        backgroundColor: '#ffffff',
        textColor: '#333333',
        padding: '40px 20px',
        alignment: 'center'
      },
      enabled: true,
      order: homePage.sections.length
    };

    const updated = {
      ...homePage,
      sections: [...homePage.sections, newSection]
    };

    saveHomePage(updated);
    setSelectedSection(newSection.id);
  };

  const deleteSection = (sectionId: string) => {
    if (!homePage) return;
    if (!confirm('Deseja realmente excluir esta seção?')) return;

    const updatedSections = homePage.sections.filter(s => s.id !== sectionId);
    const updated = { ...homePage, sections: updatedSections };
    saveHomePage(updated);

    if (selectedSection === sectionId) {
      setSelectedSection(null);
    }
  };

  const moveSection = (sectionId: string, direction: 'up' | 'down') => {
    if (!homePage) return;

    const sections = [...homePage.sections];
    const index = sections.findIndex(s => s.id === sectionId);
    
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === sections.length - 1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [sections[index], sections[newIndex]] = [sections[newIndex], sections[index]];

    // Atualizar ordem
    sections.forEach((section, idx) => {
      section.order = idx;
    });

    const updated = { ...homePage, sections };
    saveHomePage(updated);
  };

  const handleMediaSelect = (file: any) => {
    if (!mediaTarget || !homePage) return;

    const imageUrl = file.url || `/media/${file.name}`;
    updateSection(mediaTarget.sectionId, {
      [mediaTarget.field]: imageUrl
    });

    setShowMediaSelector(false);
    setMediaTarget(null);
  };

  const currentSection = selectedSection 
    ? homePage?.sections.find(s => s.id === selectedSection) 
    : null;

  if (!homePage) {
    return <div className="p-8">Carregando...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-gray-900 mb-2 flex items-center gap-2">
            <Home className="w-6 h-6" />
            Editor da Página Inicial
          </h1>
          <p className="text-gray-600">
            Personalize o conteúdo, imagens e links da página inicial do site
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={undo}
            disabled={historyIndex <= 0}
            title="Desfazer"
          >
            <Undo className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            title="Refazer"
          >
            <Redo className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowPreview(true)}
          >
            <Eye className="w-4 h-4 mr-2" />
            Visualizar
          </Button>
          <Button onClick={() => saveHomePage()}>
            <Save className="w-4 h-4 mr-2" />
            Salvar Alterações
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sections List */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Seções da Página</CardTitle>
              <CardDescription>
                Arraste para reordenar ou clique para editar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {homePage.sections
                .sort((a, b) => a.order - b.order)
                .map((section) => (
                  <div
                    key={section.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      selectedSection === section.id
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedSection(section.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={section.enabled ? 'default' : 'secondary'}>
                            {section.type}
                          </Badge>
                          {!section.enabled && (
                            <Badge variant="outline">Desativada</Badge>
                          )}
                        </div>
                        <p className="font-medium text-sm">{section.title}</p>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            moveSection(section.id, 'up');
                          }}
                          disabled={section.order === 0}
                        >
                          ↑
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            moveSection(section.id, 'down');
                          }}
                          disabled={section.order === homePage.sections.length - 1}
                        >
                          ↓
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  const type = prompt('Tipo de seção (hero, features, content, gallery, cta, custom):') as HomeSection['type'] | null;
                  if (type && ['hero', 'features', 'content', 'gallery', 'cta', 'custom'].includes(type)) {
                    addSection(type);
                  }
                }}
              >
                <Layout className="w-4 h-4 mr-2" />
                Adicionar Seção
              </Button>
            </CardContent>
          </Card>

          {/* Global Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Configurações Globais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Título do Site</Label>
                <Input
                  value={homePage.title}
                  onChange={(e) => saveHomePage({ ...homePage, title: e.target.value })}
                />
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea
                  value={homePage.description}
                  onChange={(e) => saveHomePage({ ...homePage, description: e.target.value })}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Section Editor */}
        <div className="lg:col-span-2">
          {currentSection ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Editar Seção: {currentSection.title}</CardTitle>
                    <CardDescription>
                      Tipo: {currentSection.type}
                    </CardDescription>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteSection(currentSection.id)}
                  >
                    Excluir Seção
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="content" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="content">
                      <FileText className="w-4 h-4 mr-2" />
                      Conteúdo
                    </TabsTrigger>
                    <TabsTrigger value="style">
                      <Palette className="w-4 h-4 mr-2" />
                      Estilo
                    </TabsTrigger>
                    <TabsTrigger value="advanced">
                      <Settings className="w-4 h-4 mr-2" />
                      Avançado
                    </TabsTrigger>
                  </TabsList>

                  {/* Content Tab */}
                  <TabsContent value="content" className="space-y-4">
                    <div>
                      <Label>Título da Seção</Label>
                      <Input
                        value={currentSection.title}
                        onChange={(e) => updateSection(currentSection.id, { title: e.target.value })}
                      />
                    </div>

                    {currentSection.type !== 'custom' && (
                      <>
                        <div>
                          <Label>Subtítulo</Label>
                          <Input
                            value={currentSection.subtitle || ''}
                            onChange={(e) => updateSection(currentSection.id, { subtitle: e.target.value })}
                          />
                        </div>

                        <div>
                          <Label>Conteúdo</Label>
                          <Textarea
                            value={currentSection.content || ''}
                            onChange={(e) => updateSection(currentSection.id, { content: e.target.value })}
                            rows={4}
                          />
                        </div>

                        {/* Image Upload */}
                        <div>
                          <Label>Imagem Principal</Label>
                          <div className="flex gap-2">
                            <Input
                              value={currentSection.image || ''}
                              onChange={(e) => updateSection(currentSection.id, { image: e.target.value })}
                              placeholder="URL da imagem"
                            />
                            <Button
                              variant="outline"
                              onClick={() => {
                                setMediaTarget({ sectionId: currentSection.id, field: 'image' });
                                setShowMediaSelector(true);
                              }}
                            >
                              <ImageIcon className="w-4 h-4" />
                            </Button>
                          </div>
                          {currentSection.image && (
                            <img
                              src={currentSection.image}
                              alt="Preview"
                              className="mt-2 max-w-full h-32 object-cover rounded border"
                            />
                          )}
                        </div>

                        {/* Background Image */}
                        <div>
                          <Label>Imagem de Fundo</Label>
                          <div className="flex gap-2">
                            <Input
                              value={currentSection.backgroundImage || ''}
                              onChange={(e) => updateSection(currentSection.id, { backgroundImage: e.target.value })}
                              placeholder="URL da imagem de fundo"
                            />
                            <Button
                              variant="outline"
                              onClick={() => {
                                setMediaTarget({ sectionId: currentSection.id, field: 'backgroundImage' });
                                setShowMediaSelector(true);
                              }}
                            >
                              <ImageIcon className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Link */}
                        {(currentSection.type === 'hero' || currentSection.type === 'cta') && (
                          <div className="space-y-2 border-t pt-4">
                            <Label>Link de Ação</Label>
                            <div className="space-y-2">
                              <Input
                                placeholder="Texto do botão"
                                value={currentSection.link?.text || ''}
                                onChange={(e) => updateSection(currentSection.id, {
                                  link: { ...currentSection.link!, text: e.target.value }
                                })}
                              />
                              <Input
                                placeholder="URL do link"
                                value={currentSection.link?.url || ''}
                                onChange={(e) => updateSection(currentSection.id, {
                                  link: { ...currentSection.link!, url: e.target.value }
                                })}
                              />
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={currentSection.link?.openInNewTab || false}
                                  onCheckedChange={(checked) => updateSection(currentSection.id, {
                                    link: { ...currentSection.link!, openInNewTab: checked }
                                  })}
                                />
                                <Label>Abrir em nova aba</Label>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {currentSection.type === 'custom' && (
                      <div>
                        <Label>HTML Personalizado</Label>
                        <Textarea
                          value={currentSection.customHTML || ''}
                          onChange={(e) => updateSection(currentSection.id, { customHTML: e.target.value })}
                          rows={10}
                          className="font-mono text-sm"
                          placeholder="<div>Seu HTML aqui...</div>"
                        />
                      </div>
                    )}

                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded">
                      <Switch
                        checked={currentSection.enabled}
                        onCheckedChange={(checked) => updateSection(currentSection.id, { enabled: checked })}
                      />
                      <Label>Seção ativada</Label>
                    </div>
                  </TabsContent>

                  {/* Style Tab */}
                  <TabsContent value="style" className="space-y-4">
                    <div>
                      <Label>Cor de Fundo</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={currentSection.style?.backgroundColor || '#ffffff'}
                          onChange={(e) => updateSection(currentSection.id, {
                            style: { ...currentSection.style, backgroundColor: e.target.value }
                          })}
                          className="w-20"
                        />
                        <Input
                          value={currentSection.style?.backgroundColor || '#ffffff'}
                          onChange={(e) => updateSection(currentSection.id, {
                            style: { ...currentSection.style, backgroundColor: e.target.value }
                          })}
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Cor do Texto</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={currentSection.style?.textColor || '#333333'}
                          onChange={(e) => updateSection(currentSection.id, {
                            style: { ...currentSection.style, textColor: e.target.value }
                          })}
                          className="w-20"
                        />
                        <Input
                          value={currentSection.style?.textColor || '#333333'}
                          onChange={(e) => updateSection(currentSection.id, {
                            style: { ...currentSection.style, textColor: e.target.value }
                          })}
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Espaçamento (Padding)</Label>
                      <Input
                        value={currentSection.style?.padding || '40px 20px'}
                        onChange={(e) => updateSection(currentSection.id, {
                          style: { ...currentSection.style, padding: e.target.value }
                        })}
                        placeholder="40px 20px"
                      />
                    </div>

                    <div>
                      <Label>Alinhamento</Label>
                      <div className="flex gap-2">
                        {(['left', 'center', 'right'] as const).map((align) => (
                          <Button
                            key={align}
                            variant={currentSection.style?.alignment === align ? 'default' : 'outline'}
                            onClick={() => updateSection(currentSection.id, {
                              style: { ...currentSection.style, alignment: align }
                            })}
                            className="flex-1 capitalize"
                          >
                            {align}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  {/* Advanced Tab */}
                  <TabsContent value="advanced" className="space-y-4">
                    <div>
                      <Label>ID da Seção</Label>
                      <Input value={currentSection.id} disabled className="bg-gray-50" />
                    </div>
                    <div>
                      <Label>Ordem</Label>
                      <Input value={currentSection.order} disabled className="bg-gray-50" />
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Layout className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  Selecione uma seção à esquerda para editar
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Visualização da Página Inicial</DialogTitle>
            <DialogDescription>
              Preview de como a página será exibida para os visitantes
            </DialogDescription>
          </DialogHeader>

          <div className="border rounded-lg overflow-hidden">
            {homePage.sections
              .filter(s => s.enabled)
              .sort((a, b) => a.order - b.order)
              .map((section) => (
                <div
                  key={section.id}
                  style={{
                    backgroundColor: section.style?.backgroundColor,
                    color: section.style?.textColor,
                    padding: section.style?.padding,
                    textAlign: section.style?.alignment,
                    backgroundImage: section.backgroundImage ? `url(${section.backgroundImage})` : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  {section.type !== 'custom' ? (
                    <>
                      {section.image && (
                        <img
                          src={section.image}
                          alt={section.title}
                          className="max-w-md mx-auto mb-4 rounded"
                        />
                      )}
                      <h2 className="text-3xl mb-2">{section.title}</h2>
                      {section.subtitle && (
                        <p className="text-xl opacity-90 mb-4">{section.subtitle}</p>
                      )}
                      {section.content && (
                        <p className="max-w-2xl mx-auto mb-6">{section.content}</p>
                      )}
                      {section.link && (
                        <a
                          href={section.link.url}
                          target={section.link.openInNewTab ? '_blank' : '_self'}
                          rel="noopener noreferrer"
                          className="inline-block px-6 py-3 bg-white text-gray-900 rounded hover:bg-gray-100 transition-colors"
                        >
                          {section.link.text}
                        </a>
                      )}
                    </>
                  ) : (
                    <div dangerouslySetInnerHTML={{ __html: section.customHTML || '' }} />
                  )}
                </div>
              ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Media Library Selector */}
      {showMediaSelector && (
        <Dialog open={showMediaSelector} onOpenChange={setShowMediaSelector}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Adicionar Imagem</DialogTitle>
              <DialogDescription>
                Cole a URL da imagem ou faça upload
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>URL da Imagem</Label>
                <Input
                  placeholder="https://exemplo.com/imagem.jpg"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const url = e.currentTarget.value;
                      if (url && mediaTarget) {
                        updateSection(mediaTarget.sectionId, {
                          [mediaTarget.field]: url
                        });
                        setShowMediaSelector(false);
                        setMediaTarget(null);
                      }
                    }
                  }}
                />
                <p className="text-sm text-gray-500 mt-2">
                  Pressione Enter para confirmar
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}