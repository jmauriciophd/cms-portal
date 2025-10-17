import { useEffect } from 'react';

interface SEOConfig {
  // Básico
  title: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  robots?: string;
  author?: string;

  // Open Graph
  ogType?: 'website' | 'article' | 'product' | 'profile';
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  ogSiteName?: string;
  ogLocale?: string;

  // Twitter Card
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  twitterSite?: string;
  twitterCreator?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;

  // Article specific (for blog posts/articles)
  articlePublishedTime?: string;
  articleModifiedTime?: string;
  articleAuthor?: string;
  articleSection?: string;
  articleTags?: string[];

  // Schema.org JSON-LD
  schemaType?: 'WebPage' | 'Article' | 'NewsArticle' | 'BlogPosting' | 'Organization';
  schemaData?: any;
}

interface SEOHeadProps {
  config: SEOConfig;
  siteName?: string;
  siteUrl?: string;
  defaultImage?: string;
  twitterHandle?: string;
}

export function SEOHead({ 
  config, 
  siteName = 'Meu Portal',
  siteUrl = window.location.origin,
  defaultImage = `${window.location.origin}/default-og-image.jpg`,
  twitterHandle = '@meuportal'
}: SEOHeadProps) {
  
  useEffect(() => {
    // Atualizar título da página
    document.title = config.title;

    // Limpar meta tags existentes que vamos gerenciar
    const metaTagsToRemove = [
      'description', 'keywords', 'author', 'robots',
      'og:type', 'og:title', 'og:description', 'og:image', 'og:url', 'og:site_name', 'og:locale',
      'twitter:card', 'twitter:site', 'twitter:creator', 'twitter:title', 'twitter:description', 'twitter:image',
      'article:published_time', 'article:modified_time', 'article:author', 'article:section', 'article:tag'
    ];

    metaTagsToRemove.forEach(name => {
      const existing = document.querySelector(`meta[name="${name}"]`) || 
                      document.querySelector(`meta[property="${name}"]`);
      if (existing) {
        existing.remove();
      }
    });

    // Remover canonical link existente
    const existingCanonical = document.querySelector('link[rel="canonical"]');
    if (existingCanonical) {
      existingCanonical.remove();
    }

    // Remover JSON-LD scripts existentes
    const existingJsonLd = document.querySelectorAll('script[type="application/ld+json"]');
    existingJsonLd.forEach(script => script.remove());

    // === META TAGS BÁSICAS ===
    
    // Description
    if (config.description) {
      const metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      metaDesc.content = config.description;
      document.head.appendChild(metaDesc);
    }

    // Keywords (menos importante atualmente, mas ainda útil)
    if (config.keywords) {
      const metaKeywords = document.createElement('meta');
      metaKeywords.name = 'keywords';
      metaKeywords.content = config.keywords;
      document.head.appendChild(metaKeywords);
    }

    // Author
    if (config.author) {
      const metaAuthor = document.createElement('meta');
      metaAuthor.name = 'author';
      metaAuthor.content = config.author;
      document.head.appendChild(metaAuthor);
    }

    // Robots
    const metaRobots = document.createElement('meta');
    metaRobots.name = 'robots';
    metaRobots.content = config.robots || 'index, follow';
    document.head.appendChild(metaRobots);

    // Canonical URL
    const canonical = document.createElement('link');
    canonical.rel = 'canonical';
    canonical.href = config.canonical || window.location.href;
    document.head.appendChild(canonical);

    // === OPEN GRAPH TAGS ===
    
    const ogTitle = config.ogTitle || config.title;
    const ogDescription = config.ogDescription || config.description || '';
    const ogImage = config.ogImage || defaultImage;
    const ogUrl = config.ogUrl || window.location.href;
    const ogType = config.ogType || 'website';

    // OG Type
    const metaOgType = document.createElement('meta');
    metaOgType.setAttribute('property', 'og:type');
    metaOgType.content = ogType;
    document.head.appendChild(metaOgType);

    // OG Title
    const metaOgTitle = document.createElement('meta');
    metaOgTitle.setAttribute('property', 'og:title');
    metaOgTitle.content = ogTitle;
    document.head.appendChild(metaOgTitle);

    // OG Description
    if (ogDescription) {
      const metaOgDesc = document.createElement('meta');
      metaOgDesc.setAttribute('property', 'og:description');
      metaOgDesc.content = ogDescription;
      document.head.appendChild(metaOgDesc);
    }

    // OG Image
    if (ogImage) {
      const metaOgImage = document.createElement('meta');
      metaOgImage.setAttribute('property', 'og:image');
      metaOgImage.content = ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`;
      document.head.appendChild(metaOgImage);

      // OG Image Width & Height (recomendado para melhor preview)
      const metaOgImageWidth = document.createElement('meta');
      metaOgImageWidth.setAttribute('property', 'og:image:width');
      metaOgImageWidth.content = '1200';
      document.head.appendChild(metaOgImageWidth);

      const metaOgImageHeight = document.createElement('meta');
      metaOgImageHeight.setAttribute('property', 'og:image:height');
      metaOgImageHeight.content = '630';
      document.head.appendChild(metaOgImageHeight);
    }

    // OG URL
    const metaOgUrl = document.createElement('meta');
    metaOgUrl.setAttribute('property', 'og:url');
    metaOgUrl.content = ogUrl;
    document.head.appendChild(metaOgUrl);

    // OG Site Name
    const metaOgSiteName = document.createElement('meta');
    metaOgSiteName.setAttribute('property', 'og:site_name');
    metaOgSiteName.content = config.ogSiteName || siteName;
    document.head.appendChild(metaOgSiteName);

    // OG Locale
    const metaOgLocale = document.createElement('meta');
    metaOgLocale.setAttribute('property', 'og:locale');
    metaOgLocale.content = config.ogLocale || 'pt_BR';
    document.head.appendChild(metaOgLocale);

    // === ARTICLE SPECIFIC OG TAGS ===
    
    if (ogType === 'article') {
      // Published Time
      if (config.articlePublishedTime) {
        const metaPublished = document.createElement('meta');
        metaPublished.setAttribute('property', 'article:published_time');
        metaPublished.content = config.articlePublishedTime;
        document.head.appendChild(metaPublished);
      }

      // Modified Time
      if (config.articleModifiedTime) {
        const metaModified = document.createElement('meta');
        metaModified.setAttribute('property', 'article:modified_time');
        metaModified.content = config.articleModifiedTime;
        document.head.appendChild(metaModified);
      }

      // Author
      if (config.articleAuthor) {
        const metaArticleAuthor = document.createElement('meta');
        metaArticleAuthor.setAttribute('property', 'article:author');
        metaArticleAuthor.content = config.articleAuthor;
        document.head.appendChild(metaArticleAuthor);
      }

      // Section
      if (config.articleSection) {
        const metaSection = document.createElement('meta');
        metaSection.setAttribute('property', 'article:section');
        metaSection.content = config.articleSection;
        document.head.appendChild(metaSection);
      }

      // Tags
      if (config.articleTags && config.articleTags.length > 0) {
        config.articleTags.forEach(tag => {
          const metaTag = document.createElement('meta');
          metaTag.setAttribute('property', 'article:tag');
          metaTag.content = tag;
          document.head.appendChild(metaTag);
        });
      }
    }

    // === TWITTER CARD TAGS ===
    
    const twitterCard = config.twitterCard || (ogImage ? 'summary_large_image' : 'summary');
    const twitterTitle = config.twitterTitle || ogTitle;
    const twitterDescription = config.twitterDescription || ogDescription;
    const twitterImage = config.twitterImage || ogImage;

    // Twitter Card Type
    const metaTwitterCard = document.createElement('meta');
    metaTwitterCard.name = 'twitter:card';
    metaTwitterCard.content = twitterCard;
    document.head.appendChild(metaTwitterCard);

    // Twitter Site
    const metaTwitterSite = document.createElement('meta');
    metaTwitterSite.name = 'twitter:site';
    metaTwitterSite.content = config.twitterSite || twitterHandle;
    document.head.appendChild(metaTwitterSite);

    // Twitter Creator
    if (config.twitterCreator) {
      const metaTwitterCreator = document.createElement('meta');
      metaTwitterCreator.name = 'twitter:creator';
      metaTwitterCreator.content = config.twitterCreator;
      document.head.appendChild(metaTwitterCreator);
    }

    // Twitter Title
    const metaTwitterTitle = document.createElement('meta');
    metaTwitterTitle.name = 'twitter:title';
    metaTwitterTitle.content = twitterTitle;
    document.head.appendChild(metaTwitterTitle);

    // Twitter Description
    if (twitterDescription) {
      const metaTwitterDesc = document.createElement('meta');
      metaTwitterDesc.name = 'twitter:description';
      metaTwitterDesc.content = twitterDescription;
      document.head.appendChild(metaTwitterDesc);
    }

    // Twitter Image
    if (twitterImage) {
      const metaTwitterImage = document.createElement('meta');
      metaTwitterImage.name = 'twitter:image';
      metaTwitterImage.content = twitterImage.startsWith('http') ? twitterImage : `${siteUrl}${twitterImage}`;
      document.head.appendChild(metaTwitterImage);
    }

    // === JSON-LD STRUCTURED DATA ===
    
    const schemaType = config.schemaType || (ogType === 'article' ? 'Article' : 'WebPage');
    
    let jsonLd: any = {
      '@context': 'https://schema.org',
      '@type': schemaType,
      'headline': config.title,
      'description': config.description || '',
      'url': ogUrl,
      'inLanguage': 'pt-BR'
    };

    // Adicionar imagem ao schema
    if (ogImage) {
      jsonLd.image = {
        '@type': 'ImageObject',
        'url': ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`,
        'width': 1200,
        'height': 630
      };
    }

    // Campos específicos para Articles
    if (schemaType === 'Article' || schemaType === 'NewsArticle' || schemaType === 'BlogPosting') {
      jsonLd = {
        ...jsonLd,
        '@type': schemaType,
        'author': {
          '@type': 'Person',
          'name': config.articleAuthor || config.author || 'Admin'
        },
        'publisher': {
          '@type': 'Organization',
          'name': siteName,
          'logo': {
            '@type': 'ImageObject',
            'url': `${siteUrl}/logo.png`
          }
        }
      };

      if (config.articlePublishedTime) {
        jsonLd.datePublished = config.articlePublishedTime;
      }

      if (config.articleModifiedTime) {
        jsonLd.dateModified = config.articleModifiedTime;
      }

      if (config.articleSection) {
        jsonLd.articleSection = config.articleSection;
      }

      if (config.articleTags && config.articleTags.length > 0) {
        jsonLd.keywords = config.articleTags.join(', ');
      }
    }

    // Merge com dados customizados de schema se fornecidos
    if (config.schemaData) {
      jsonLd = { ...jsonLd, ...config.schemaData };
    }

    // Adicionar JSON-LD ao head
    const scriptJsonLd = document.createElement('script');
    scriptJsonLd.type = 'application/ld+json';
    scriptJsonLd.textContent = JSON.stringify(jsonLd, null, 2);
    document.head.appendChild(scriptJsonLd);

    // Cleanup ao desmontar
    return () => {
      // Não precisamos limpar, pois o próximo useEffect vai sobrescrever
    };
  }, [config, siteName, siteUrl, defaultImage, twitterHandle]);

  // Este componente não renderiza nada visível
  return null;
}

// Helper function para gerar configuração SEO de uma página
export function generatePageSEO(page: {
  title: string;
  slug: string;
  content?: string;
  excerpt?: string;
  featuredImage?: string;
  meta?: {
    description?: string;
    robots?: string;
    keywords?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    twitterTitle?: string;
    twitterDescription?: string;
    twitterImage?: string;
  };
  author?: string;
  createdAt?: string;
  updatedAt?: string;
  categories?: string[];
}): SEOConfig {
  const baseUrl = window.location.origin;
  const pageUrl = `${baseUrl}/${page.slug}`;

  return {
    title: page.title,
    description: page.meta?.description || page.excerpt || '',
    keywords: page.meta?.keywords || '',
    canonical: pageUrl,
    robots: page.meta?.robots || 'index, follow',
    author: page.author || 'Admin',

    // Open Graph
    ogType: 'website',
    ogTitle: page.meta?.ogTitle || page.title,
    ogDescription: page.meta?.ogDescription || page.meta?.description || page.excerpt || '',
    ogImage: page.meta?.ogImage || page.featuredImage || '',
    ogUrl: pageUrl,

    // Twitter
    twitterCard: 'summary_large_image',
    twitterTitle: page.meta?.twitterTitle || page.meta?.ogTitle || page.title,
    twitterDescription: page.meta?.twitterDescription || page.meta?.ogDescription || page.meta?.description || page.excerpt || '',
    twitterImage: page.meta?.twitterImage || page.meta?.ogImage || page.featuredImage || '',

    // Schema
    schemaType: 'WebPage'
  };
}

// Helper function para gerar configuração SEO de um artigo
export function generateArticleSEO(article: {
  title: string;
  slug?: string;
  summary?: string;
  content?: string;
  featuredImage?: string;
  author?: string;
  publishedDate?: string;
  createdAt?: string;
  updatedAt?: string;
  categories?: string[];
  tags?: string[];
  meta?: {
    description?: string;
    robots?: string;
    keywords?: string;
  };
}): SEOConfig {
  const baseUrl = window.location.origin;
  const articleUrl = article.slug ? `${baseUrl}/${article.slug}` : window.location.href;

  return {
    title: article.title,
    description: article.meta?.description || article.summary || '',
    keywords: article.meta?.keywords || article.tags?.join(', ') || '',
    canonical: articleUrl,
    robots: article.meta?.robots || 'index, follow',
    author: article.author || 'Admin',

    // Open Graph
    ogType: 'article',
    ogTitle: article.title,
    ogDescription: article.meta?.description || article.summary || '',
    ogImage: article.featuredImage || '',
    ogUrl: articleUrl,

    // Article specific
    articlePublishedTime: article.publishedDate || article.createdAt || new Date().toISOString(),
    articleModifiedTime: article.updatedAt || new Date().toISOString(),
    articleAuthor: article.author || 'Admin',
    articleSection: article.categories?.[0] || '',
    articleTags: article.tags || article.categories || [],

    // Twitter
    twitterCard: 'summary_large_image',
    twitterTitle: article.title,
    twitterDescription: article.meta?.description || article.summary || '',
    twitterImage: article.featuredImage || '',

    // Schema
    schemaType: 'Article'
  };
}
