import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { 
  Home, 
  FileText, 
  Search, 
  Calendar,
  User,
  Tag,
  ArrowRight,
  Menu as MenuIcon,
  X,
  LogIn
} from 'lucide-react';
import { Badge } from '../ui/badge';
import { SEOHead, generatePageSEO, generateArticleSEO } from '../seo/SEOHead';

interface Article {
  id: string;
  title: string;
  summary: string;
  content: string;
  author: string;
  status: string;
  categories: string[];
  publishedDate?: string;
  createdAt: string;
}

interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  status: string;
  publishedDate?: string;
}

interface MenuItem {
  title: string;
  targetUrl: string;
  ignorarFilhosNoMenu: boolean;
  filhos: MenuItem[] | null;
  href: string;
  id?: string;
}

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
}

export function PublicSite() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [currentView, setCurrentView] = useState<'home' | 'article' | 'page'>('home');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [homePage, setHomePage] = useState<HomePage | null>(null);

  useEffect(() => {
    loadContent();
    loadHomePage();
  }, []);

  const loadHomePage = () => {
    const stored = localStorage.getItem('homepage');
    if (stored) {
      try {
        setHomePage(JSON.parse(stored));
      } catch (error) {
        console.error('Erro ao carregar página inicial:', error);
      }
    }
  };

  const loadContent = () => {
    // Load published articles
    const storedArticles = localStorage.getItem('articles');
    if (storedArticles) {
      const allArticles = JSON.parse(storedArticles);
      const published = allArticles.filter((a: Article) => a.status === 'published');
      setArticles(published);
    }

    // Load published pages
    const storedPages = localStorage.getItem('pages');
    if (storedPages) {
      const allPages = JSON.parse(storedPages);
      const published = allPages.filter((p: Page) => p.status === 'published');
      setPages(published);
    }

    // Load menu (use first/main menu)
    const storedMenus = localStorage.getItem('menus');
    if (storedMenus) {
      const menus = JSON.parse(storedMenus);
      if (menus.length > 0) {
        setMenuItems(menus[0].items || []);
      }
    }
  };

  const openArticle = (article: Article) => {
    setSelectedArticle(article);
    setCurrentView('article');
    setMobileMenuOpen(false);
  };

  const openPage = (href: string) => {
    // Try to find page by slug matching href
    const page = pages.find(p => `/${p.slug}` === href || p.slug === href);
    if (page) {
      setSelectedPage(page);
      setCurrentView('page');
      setMobileMenuOpen(false);
    }
  };

  const goHome = () => {
    setCurrentView('home');
    setSelectedArticle(null);
    setSelectedPage(null);
    setMobileMenuOpen(false);
  };

  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.summary.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderMenu = () => (
    <nav className="space-y-1">
      <button
        onClick={goHome}
        className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
          currentView === 'home' ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-gray-100'
        }`}
      >
        <Home className="w-5 h-5" />
        <span>Início</span>
      </button>
      {menuItems.map(item => (
        <div key={item.id || item.href}>
          <button
            onClick={() => item.href === '/' ? goHome() : openPage(item.href)}
            className="w-full flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors text-left"
          >
            <FileText className="w-5 h-5" />
            <span>{item.title}</span>
          </button>
          {item.filhos && item.filhos.length > 0 && !item.ignorarFilhosNoMenu && (
            <div className="ml-6 space-y-1 mt-1">
              {item.filhos.map(filho => (
                <button
                  key={filho.id || filho.href}
                  onClick={() => openPage(filho.href)}
                  className="w-full flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors text-left text-sm"
                >
                  {filho.title}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </nav>
  );

  const renderHome = () => (
    <>
      <SEOHead 
        config={{
          title: homePage?.seo.metaTitle || 'Portal CMS - Notícias e Conteúdo',
          description: homePage?.seo.metaDescription || 'Fique por dentro das últimas novidades e atualizações do nosso portal',
          keywords: homePage?.seo.keywords.join(', ') || 'notícias, portal, conteúdo, atualizações',
          robots: 'index, follow',
          ogType: 'website',
          ogTitle: homePage?.title || 'Portal CMS - Seu Portal de Notícias',
          ogDescription: homePage?.description || 'Fique por dentro das últimas novidades e atualizações',
          twitterCard: 'summary_large_image',
          schemaType: 'WebPage'
        }}
      />
      <div className="space-y-8">
        {/* Custom Sections from HomePage Editor */}
        {homePage && homePage.sections
          .filter(s => s.enabled)
          .sort((a, b) => a.order - b.order)
          .map((section) => (
            <div
              key={section.id}
              className="rounded-xl overflow-hidden"
              style={{
                backgroundColor: section.style?.backgroundColor,
                color: section.style?.textColor,
                padding: section.style?.padding,
                textAlign: section.style?.alignment as any,
                backgroundImage: section.backgroundImage ? `url(${section.backgroundImage})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              {section.type !== 'custom' ? (
                <div className={section.style?.alignment === 'center' ? 'text-center' : ''}>
                  {section.image && (
                    <img
                      src={section.image}
                      alt={section.title}
                      className={`mb-4 rounded ${
                        section.style?.alignment === 'center' ? 'max-w-md mx-auto' : 'max-w-md'
                      }`}
                    />
                  )}
                  <h1 className="text-3xl md:text-4xl mb-4">{section.title}</h1>
                  {section.subtitle && (
                    <p className="text-xl opacity-90 mb-4">{section.subtitle}</p>
                  )}
                  {section.content && (
                    <p className={`mb-6 ${section.style?.alignment === 'center' ? 'max-w-2xl mx-auto' : 'max-w-2xl'}`}>
                      {section.content}
                    </p>
                  )}
                  
                  {/* Search box for hero sections */}
                  {section.type === 'hero' && (
                    <div className={`relative max-w-xl ${section.style?.alignment === 'center' ? 'mx-auto' : ''}`}>
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 opacity-70" />
                      <Input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar notícias..."
                        className="pl-10 bg-white/20 border-white/30 placeholder:text-white/70"
                        style={{ color: section.style?.textColor }}
                      />
                    </div>
                  )}
                  
                  {section.link && (
                    <a
                      href={section.link.url}
                      target={section.link.openInNewTab ? '_blank' : '_self'}
                      rel="noopener noreferrer"
                      className="inline-block px-6 py-3 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors mt-4"
                    >
                      {section.link.text}
                    </a>
                  )}
                </div>
              ) : (
                <div dangerouslySetInnerHTML={{ __html: section.customHTML || '' }} />
              )}
            </div>
          ))}

        {/* Default Hero if no custom homepage */}
        {!homePage && (
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl p-8 md:p-12">
            <h1 className="text-3xl md:text-4xl mb-4">Portal de Notícias</h1>
            <p className="text-lg opacity-90 mb-6">
              Fique por dentro das últimas novidades e atualizações
            </p>
            <div className="relative max-w-xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 opacity-70" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar notícias..."
                className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-white/70"
              />
            </div>
          </div>
        )}

        {/* Articles Grid */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Últimas Notícias</h2>
          {filteredArticles.length === 0 ? (
            <Card className="p-12 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm ? 'Nenhuma notícia encontrada' : 'Nenhuma notícia publicada ainda'}
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map(article => (
                <Card
                  key={article.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => openArticle(article)}
                >
                  <CardHeader>
                    <div className="flex gap-2 mb-2 flex-wrap">
                      {article.categories?.map(cat => (
                        <Badge key={cat} variant="secondary" className="text-xs">
                          {cat}
                        </Badge>
                      ))}
                    </div>
                    <CardTitle className="line-clamp-2">{article.title}</CardTitle>
                    <CardDescription className="line-clamp-3">
                      {article.summary}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{article.author}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(article.publishedDate || article.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );

  const renderArticle = () => {
    if (!selectedArticle) return null;

    return (
      <>
        <SEOHead config={generateArticleSEO(selectedArticle)} />
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" onClick={goHome} className="mb-6">
            <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
            Voltar
          </Button>

          <article className="bg-white rounded-xl shadow-sm p-8">
          <div className="mb-6">
            <div className="flex gap-2 mb-4 flex-wrap">
              {selectedArticle.categories?.map(cat => (
                <Badge key={cat} className="text-sm">
                  <Tag className="w-3 h-3 mr-1" />
                  {cat}
                </Badge>
              ))}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {selectedArticle.title}
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              {selectedArticle.summary}
            </p>
            <div className="flex items-center gap-6 text-gray-500 pb-6 border-b">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" />
                <span>{selectedArticle.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>
                  {new Date(selectedArticle.publishedDate || selectedArticle.createdAt).toLocaleDateString('pt-BR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </div>

          <div className="prose max-w-none">
            <div dangerouslySetInnerHTML={{ __html: selectedArticle.content }} />
          </div>
        </article>
        </div>
      </>
    );
  };

  const renderPage = () => {
    if (!selectedPage) return null;

    return (
      <>
        <SEOHead config={generatePageSEO(selectedPage)} />
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" onClick={goHome} className="mb-6">
            <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
            Voltar
          </Button>

          <article className="bg-white rounded-xl shadow-sm p-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
            {selectedPage.title}
          </h1>
          <div className="prose max-w-none">
            <div dangerouslySetInnerHTML={{ __html: selectedPage.content }} />
          </div>
        </article>
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer" onClick={goHome}>
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Portal CMS</span>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <MenuIcon className="w-6 h-6" />
              )}
            </Button>

            {/* Desktop Stats & Login */}
            <div className="hidden md:flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>{articles.length} Notícias</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>{pages.length} Páginas</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/login')}
                className="ml-2"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Login
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar - Desktop */}
          <aside className="hidden md:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Navegação</CardTitle>
                </CardHeader>
                <CardContent>
                  {renderMenu()}
                </CardContent>
              </Card>
            </div>
          </aside>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)}>
              <div className="bg-white w-64 h-full p-4" onClick={(e) => e.stopPropagation()}>
                <h3 className="font-bold text-lg mb-4">Navegação</h3>
                {renderMenu()}
              </div>
            </div>
          )}

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {currentView === 'home' && renderHome()}
            {currentView === 'article' && renderArticle()}
            {currentView === 'page' && renderPage()}
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/login')}
              className="mb-2"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Acessar Painel Administrativo
            </Button>
            <div className="text-center text-gray-600">
              <p>&copy; {new Date().getFullYear()} Portal CMS. Todos os direitos reservados.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}