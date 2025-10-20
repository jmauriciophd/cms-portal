/**
 * BatchImportService
 * 
 * Sistema completo de importação em lote com mapeamento por IA
 * Suporta múltiplas fontes: HTML/PHP, WordPress REST, JSON APIs, RSS/Atom, Sitemaps
 * 
 * Features:
 * - Descoberta automática de conteúdo
 * - Extração e parsing inteligente
 * - Mapeamento por IA com validação
 * - Importação incremental e idempotente
 * - Sistema de filas e jobs
 * - Observabilidade e métricas
 * - Revisão humana
 */

import { AIService } from './AIService';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

export type SourceType = 'wordpress' | 'html' | 'rss' | 'json-api' | 'sitemap';
export type JobStatus = 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';
export type ItemStatus = 'discovered' | 'fetched' | 'extracted' | 'normalized' | 'mapped' | 'pending-review' | 'approved' | 'rejected' | 'imported' | 'failed';
export type ImportAction = 'create' | 'update' | 'skip';

export interface SourceProfile {
  id: string;
  name: string;
  domain: string;
  type: SourceType;
  enabled: boolean;
  
  // Configuração de acesso
  baseUrl: string;
  auth?: {
    type: 'none' | 'basic' | 'bearer' | 'oauth';
    credentials?: Record<string, string>;
  };
  
  // Rate limiting
  rateLimit: {
    requestsPerSecond: number;
    concurrent: number;
  };
  
  // Configuração específica por tipo
  config: {
    // WordPress
    wpRestEndpoint?: string;
    wpContentTypes?: string[];
    
    // HTML/Scraping
    selectors?: Record<string, string>;
    renderJs?: boolean;
    
    // RSS/Atom
    feedUrl?: string;
    
    // JSON API
    apiEndpoint?: string;
    apiMapping?: Record<string, string>;
    
    // Sitemap
    sitemapUrl?: string;
    urlPatterns?: string[];
  };
  
  // Headers customizados
  headers?: Record<string, string>;
  
  // Allowlist/Denylist
  allowlist?: string[];
  denylist?: string[];
  
  // Metadados
  createdAt: string;
  updatedAt: string;
  lastSync?: string;
  
  // Estatísticas
  stats?: {
    totalDiscovered: number;
    totalImported: number;
    successRate: number;
    avgConfidence: number;
  };
}

export interface ImportJob {
  id: string;
  name: string;
  sourceProfileIds: string[];
  status: JobStatus;
  
  // Configuração
  config: {
    incremental: boolean;
    dryRun: boolean;
    autoApprove: boolean;
    confidenceThreshold: number;
    maxItems?: number;
    filters?: {
      dateFrom?: string;
      dateTo?: string;
      categories?: string[];
      urlPattern?: string;
    };
  };
  
  // Agendamento
  schedule?: {
    enabled: boolean;
    cron?: string;
    nextRun?: string;
  };
  
  // Progresso
  progress: {
    discovered: number;
    fetched: number;
    extracted: number;
    normalized: number;
    mapped: number;
    pendingReview: number;
    approved: number;
    rejected: number;
    imported: number;
    failed: number;
    total: number;
    percentage: number;
  };
  
  // Métricas
  metrics: {
    startedAt?: string;
    completedAt?: string;
    duration?: number;
    itemsPerSecond?: number;
    successRate: number;
    avgConfidence: number;
    avgMappingTime?: number;
    errors: number;
  };
  
  // Metadados
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  
  // Logs e erros
  logs: JobLog[];
  errors: JobError[];
}

export interface JobLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error';
  stage: string;
  message: string;
  metadata?: Record<string, any>;
}

export interface JobError {
  id: string;
  timestamp: string;
  itemId?: string;
  stage: string;
  error: string;
  stack?: string;
  retryCount: number;
  resolved: boolean;
}

export interface DiscoveredItem {
  id: string;
  jobId: string;
  sourceProfileId: string;
  
  // URL e identificação
  url: string;
  canonicalUrl?: string;
  
  // Status
  status: ItemStatus;
  stage: string;
  
  // Dados brutos
  rawContent?: {
    html?: string;
    json?: any;
    statusCode?: number;
    headers?: Record<string, string>;
    contentType?: string;
    contentHash?: string;
  };
  
  // Dados extraídos
  extracted?: {
    title?: string;
    content?: string;
    excerpt?: string;
    author?: string;
    publishedDate?: string;
    modifiedDate?: string;
    categories?: string[];
    tags?: string[];
    images?: string[];
    metadata?: Record<string, any>;
    language?: string;
    quality?: number;
  };
  
  // Dados normalizados
  normalized?: {
    title: string;
    contentHtml: string;
    excerpt: string;
    slug: string;
    author?: string;
    publishedAt?: string;
    updatedAt?: string;
    categories: string[];
    tags: string[];
    featuredImage?: string;
    images: string[];
    metadata: Record<string, any>;
  };
  
  // Mapeamento IA
  mapped?: {
    contentType: string;
    fields: Record<string, any>;
    confidence: {
      overall: number;
      byField: Record<string, number>;
    };
    rationale?: string;
    violations?: string[];
    needsReview: boolean;
  };
  
  // Decisão de importação
  importDecision?: {
    action: ImportAction;
    reason: string;
    existingId?: string;
    diff?: Record<string, any>;
  };
  
  // Resultado
  importResult?: {
    success: boolean;
    cmsId?: string;
    error?: string;
    importedAt?: string;
  };
  
  // Metadados
  discoveredAt: string;
  updatedAt: string;
  retryCount: number;
  
  // ETag/Last-Modified para incremental
  etag?: string;
  lastModified?: string;
}

export interface ReviewItem extends DiscoveredItem {
  // Dados editados pelo usuário
  userEdited?: Partial<DiscoveredItem['mapped']>;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

export interface BatchImportMetrics {
  // Métricas globais
  totalJobs: number;
  activeJobs: number;
  completedJobs: number;
  failedJobs: number;
  
  totalItems: number;
  importedItems: number;
  pendingReview: number;
  failedItems: number;
  
  // Performance
  avgImportTime: number;
  avgConfidence: number;
  successRate: number;
  
  // Por fonte
  bySource: Record<string, {
    items: number;
    imported: number;
    confidence: number;
    successRate: number;
  }>;
  
  // Por tipo de conteúdo
  byContentType: Record<string, number>;
  
  // Timeline (últimos 30 dias)
  timeline: Array<{
    date: string;
    discovered: number;
    imported: number;
    failed: number;
  }>;
}

// ============================================================================
// FEW-SHOT EXAMPLES PARA IA
// ============================================================================

const FEW_SHOT_EXAMPLES = {
  'noticia': [
    {
      input: {
        title: 'Prefeitura anuncia novo programa de habitação',
        content: '<p>A Prefeitura Municipal anunciou hoje...</p>',
        author: 'João Silva',
        date: '2024-01-15',
        categories: ['Habitação', 'Política']
      },
      output: {
        contentType: 'article',
        fields: {
          title: 'Prefeitura anuncia novo programa de habitação',
          body_html: '<p>A Prefeitura Municipal anunciou hoje...</p>',
          excerpt: 'A Prefeitura Municipal anunciou hoje...',
          author: 'João Silva',
          published_at: '2024-01-15T00:00:00Z',
          categories: ['Habitação', 'Política'],
          tags: ['habitação', 'programa social', 'prefeitura'],
          slug: 'prefeitura-anuncia-novo-programa-habitacao'
        }
      }
    }
  ],
  'pagina-institucional': [
    {
      input: {
        title: 'Sobre a Secretaria',
        content: '<p>A Secretaria Municipal de...</p>',
        section: 'institucional'
      },
      output: {
        contentType: 'page',
        fields: {
          title: 'Sobre a Secretaria',
          body_html: '<p>A Secretaria Municipal de...</p>',
          slug: 'sobre-secretaria',
          parent_id: null,
          template: 'institutional',
          visibility: 'public'
        }
      }
    }
  ],
  'evento': [
    {
      input: {
        title: 'Audiência Pública - Orçamento 2024',
        content: '<p>Será realizada no dia...</p>',
        date: '2024-02-20',
        location: 'Câmara Municipal'
      },
      output: {
        contentType: 'event',
        fields: {
          title: 'Audiência Pública - Orçamento 2024',
          description: '<p>Será realizada no dia...</p>',
          event_date: '2024-02-20T00:00:00Z',
          location: 'Câmara Municipal',
          slug: 'audiencia-publica-orcamento-2024',
          categories: ['Eventos', 'Política']
        }
      }
    }
  ]
};

// ============================================================================
// SERVIÇO PRINCIPAL
// ============================================================================

class BatchImportServiceClass {
  private readonly STORAGE_KEYS = {
    PROFILES: 'batch_import_profiles',
    JOBS: 'batch_import_jobs',
    ITEMS: 'batch_import_items',
    METRICS: 'batch_import_metrics'
  };

  // ========================================================================
  // SOURCE PROFILES
  // ========================================================================

  getProfiles(): SourceProfile[] {
    const data = localStorage.getItem(this.STORAGE_KEYS.PROFILES);
    return data ? JSON.parse(data) : this.getDefaultProfiles();
  }

  getProfile(id: string): SourceProfile | undefined {
    return this.getProfiles().find(p => p.id === id);
  }

  saveProfile(profile: Partial<SourceProfile>): SourceProfile {
    const profiles = this.getProfiles();
    
    if (profile.id) {
      const index = profiles.findIndex(p => p.id === profile.id);
      if (index >= 0) {
        profiles[index] = { ...profiles[index], ...profile, updatedAt: new Date().toISOString() };
        localStorage.setItem(this.STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
        return profiles[index];
      }
    }
    
    const newProfile: SourceProfile = {
      id: `profile_${Date.now()}`,
      name: profile.name || 'Novo Perfil',
      domain: profile.domain || '',
      type: profile.type || 'html',
      enabled: profile.enabled ?? true,
      baseUrl: profile.baseUrl || '',
      rateLimit: profile.rateLimit || { requestsPerSecond: 2, concurrent: 3 },
      config: profile.config || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    profiles.push(newProfile);
    localStorage.setItem(this.STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
    return newProfile;
  }

  deleteProfile(id: string): void {
    const profiles = this.getProfiles().filter(p => p.id !== id);
    localStorage.setItem(this.STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
  }

  private getDefaultProfiles(): SourceProfile[] {
    const defaults: SourceProfile[] = [
      {
        id: 'profile_wp_example',
        name: 'WordPress - Portal Exemplo',
        domain: 'portal.exemplo.gov.br',
        type: 'wordpress',
        enabled: true,
        baseUrl: 'https://portal.exemplo.gov.br',
        rateLimit: { requestsPerSecond: 2, concurrent: 3 },
        config: {
          wpRestEndpoint: '/wp-json/wp/v2',
          wpContentTypes: ['posts', 'pages']
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        stats: {
          totalDiscovered: 1247,
          totalImported: 1198,
          successRate: 96.1,
          avgConfidence: 0.89
        }
      },
      {
        id: 'profile_html_example',
        name: 'HTML - Site Antigo',
        domain: 'old.exemplo.gov.br',
        type: 'html',
        enabled: true,
        baseUrl: 'https://old.exemplo.gov.br',
        rateLimit: { requestsPerSecond: 1, concurrent: 2 },
        config: {
          selectors: {
            title: 'h1.page-title',
            content: 'div.content',
            author: 'span.author',
            date: 'time.published'
          },
          renderJs: false
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        stats: {
          totalDiscovered: 543,
          totalImported: 487,
          successRate: 89.7,
          avgConfidence: 0.82
        }
      },
      {
        id: 'profile_rss_example',
        name: 'RSS - Feed de Notícias',
        domain: 'noticias.exemplo.gov.br',
        type: 'rss',
        enabled: true,
        baseUrl: 'https://noticias.exemplo.gov.br',
        rateLimit: { requestsPerSecond: 1, concurrent: 1 },
        config: {
          feedUrl: 'https://noticias.exemplo.gov.br/feed'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        stats: {
          totalDiscovered: 892,
          totalImported: 856,
          successRate: 96.0,
          avgConfidence: 0.91
        }
      }
    ];
    
    localStorage.setItem(this.STORAGE_KEYS.PROFILES, JSON.stringify(defaults));
    return defaults;
  }

  // ========================================================================
  // JOBS
  // ========================================================================

  getJobs(): ImportJob[] {
    const data = localStorage.getItem(this.STORAGE_KEYS.JOBS);
    return data ? JSON.parse(data) : this.getDefaultJobs();
  }

  getJob(id: string): ImportJob | undefined {
    return this.getJobs().find(j => j.id === id);
  }

  createJob(config: Partial<ImportJob>): ImportJob {
    const jobs = this.getJobs();
    
    const newJob: ImportJob = {
      id: `job_${Date.now()}`,
      name: config.name || `Importação ${new Date().toLocaleDateString()}`,
      sourceProfileIds: config.sourceProfileIds || [],
      status: 'pending',
      config: {
        incremental: config.config?.incremental ?? true,
        dryRun: config.config?.dryRun ?? false,
        autoApprove: config.config?.autoApprove ?? false,
        confidenceThreshold: config.config?.confidenceThreshold ?? 0.8,
        maxItems: config.config?.maxItems,
        filters: config.config?.filters
      },
      schedule: config.schedule,
      progress: {
        discovered: 0,
        fetched: 0,
        extracted: 0,
        normalized: 0,
        mapped: 0,
        pendingReview: 0,
        approved: 0,
        rejected: 0,
        imported: 0,
        failed: 0,
        total: 0,
        percentage: 0
      },
      metrics: {
        successRate: 0,
        avgConfidence: 0,
        errors: 0
      },
      createdBy: localStorage.getItem('cms_current_user') || 'admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      logs: [],
      errors: []
    };
    
    jobs.unshift(newJob);
    localStorage.setItem(this.STORAGE_KEYS.JOBS, JSON.stringify(jobs));
    return newJob;
  }

  updateJob(id: string, updates: Partial<ImportJob>): void {
    const jobs = this.getJobs();
    const index = jobs.findIndex(j => j.id === id);
    
    if (index >= 0) {
      jobs[index] = {
        ...jobs[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(this.STORAGE_KEYS.JOBS, JSON.stringify(jobs));
    }
  }

  deleteJob(id: string): void {
    const jobs = this.getJobs().filter(j => j.id !== id);
    localStorage.setItem(this.STORAGE_KEYS.JOBS, JSON.stringify(jobs));
    
    // Também remove os items do job
    const items = this.getItems().filter(i => i.jobId !== id);
    localStorage.setItem(this.STORAGE_KEYS.ITEMS, JSON.stringify(items));
  }

  async startJob(id: string): Promise<void> {
    this.updateJob(id, { 
      status: 'running',
      'metrics.startedAt': new Date().toISOString()
    });
    
    this.addJobLog(id, 'info', 'job', 'Job iniciado');
    
    // Simula processamento assíncrono
    setTimeout(() => this.processJob(id), 100);
  }

  pauseJob(id: string): void {
    this.updateJob(id, { status: 'paused' });
    this.addJobLog(id, 'warning', 'job', 'Job pausado');
  }

  cancelJob(id: string): void {
    this.updateJob(id, { status: 'cancelled' });
    this.addJobLog(id, 'warning', 'job', 'Job cancelado');
  }

  private async processJob(id: string): Promise<void> {
    const job = this.getJob(id);
    if (!job || job.status !== 'running') return;
    
    try {
      // 1. Descoberta
      await this.discoverContent(job);
      
      // 2. Fetch e extração
      await this.fetchAndExtract(job);
      
      // 3. Normalização
      await this.normalizeContent(job);
      
      // 4. Mapeamento IA
      await this.mapWithAI(job);
      
      // 5. Importação (se autoApprove)
      if (job.config.autoApprove) {
        await this.importApprovedItems(job);
      }
      
      this.updateJob(id, { 
        status: 'completed',
        'metrics.completedAt': new Date().toISOString()
      });
      
      this.addJobLog(id, 'info', 'job', 'Job concluído com sucesso');
      
    } catch (error) {
      this.updateJob(id, { status: 'failed' });
      this.addJobError(id, 'job', String(error));
      this.addJobLog(id, 'error', 'job', `Erro: ${error}`);
    }
  }

  private async discoverContent(job: ImportJob): Promise<void> {
    this.addJobLog(job.id, 'info', 'discovery', 'Iniciando descoberta de conteúdo');
    
    const items: DiscoveredItem[] = [];
    
    for (const profileId of job.sourceProfileIds) {
      const profile = this.getProfile(profileId);
      if (!profile || !profile.enabled) continue;
      
      // Simula descoberta baseada no tipo
      const discovered = this.simulateDiscovery(job, profile);
      items.push(...discovered);
    }
    
    // Salva items descobertos
    const existingItems = this.getItems();
    const allItems = [...existingItems, ...items];
    localStorage.setItem(this.STORAGE_KEYS.ITEMS, JSON.stringify(allItems));
    
    // Atualiza progresso
    this.updateJobProgress(job.id, { 
      discovered: items.length,
      total: items.length 
    });
    
    this.addJobLog(job.id, 'info', 'discovery', `${items.length} itens descobertos`);
  }

  private simulateDiscovery(job: ImportJob, profile: SourceProfile): DiscoveredItem[] {
    const count = Math.floor(Math.random() * 20) + 10; // 10-30 items
    const items: DiscoveredItem[] = [];
    
    for (let i = 0; i < count; i++) {
      items.push({
        id: `item_${Date.now()}_${i}`,
        jobId: job.id,
        sourceProfileId: profile.id,
        url: `${profile.baseUrl}/content/${i + 1}`,
        status: 'discovered',
        stage: 'discovery',
        discoveredAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        retryCount: 0
      });
    }
    
    return items;
  }

  private async fetchAndExtract(job: ImportJob): Promise<void> {
    this.addJobLog(job.id, 'info', 'fetch', 'Iniciando fetch e extração');
    
    const items = this.getItemsByJob(job.id).filter(i => i.status === 'discovered');
    
    for (const item of items) {
      // Simula fetch e extração
      await this.delay(50);
      
      const profile = this.getProfile(item.sourceProfileId);
      if (!profile) continue;
      
      const extracted = this.simulateExtraction(profile);
      
      this.updateItem(item.id, {
        status: 'extracted',
        stage: 'extraction',
        rawContent: {
          html: '<p>Conteúdo HTML simulado...</p>',
          statusCode: 200,
          contentType: 'text/html',
          contentHash: `hash_${Date.now()}`
        },
        extracted
      });
      
      this.updateJobProgress(job.id, { extracted: this.getJobProgress(job.id).extracted + 1 });
    }
    
    this.addJobLog(job.id, 'info', 'fetch', `${items.length} itens extraídos`);
  }

  private simulateExtraction(profile: SourceProfile) {
    const titles = [
      'Prefeitura anuncia novo programa de habitação popular',
      'Secretaria de Saúde amplia horário de atendimento',
      'Obras de infraestrutura são concluídas no bairro Centro',
      'Educação municipal recebe investimento em tecnologia',
      'Meio Ambiente promove campanha de reciclagem'
    ];
    
    const title = titles[Math.floor(Math.random() * titles.length)];
    
    return {
      title,
      content: `<p>Este é o conteúdo completo sobre: ${title}. Lorem ipsum dolor sit amet...</p>`,
      excerpt: `Resumo: ${title.substring(0, 100)}...`,
      author: ['João Silva', 'Maria Santos', 'Pedro Oliveira'][Math.floor(Math.random() * 3)],
      publishedDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      categories: ['Notícias', 'Governo'][Math.floor(Math.random() * 2)] ? ['Notícias'] : ['Governo'],
      tags: ['cidade', 'governo', 'serviços'],
      language: 'pt-BR',
      quality: 0.8 + Math.random() * 0.2
    };
  }

  private async normalizeContent(job: ImportJob): Promise<void> {
    this.addJobLog(job.id, 'info', 'normalize', 'Iniciando normalização');
    
    const items = this.getItemsByJob(job.id).filter(i => i.status === 'extracted');
    
    for (const item of items) {
      await this.delay(30);
      
      if (!item.extracted) continue;
      
      const normalized = {
        title: this.sanitize(item.extracted.title || ''),
        contentHtml: this.sanitizeHtml(item.extracted.content || ''),
        excerpt: this.sanitize(item.extracted.excerpt || ''),
        slug: this.generateSlug(item.extracted.title || ''),
        author: item.extracted.author,
        publishedAt: item.extracted.publishedDate,
        updatedAt: item.extracted.modifiedDate,
        categories: item.extracted.categories || [],
        tags: item.extracted.tags || [],
        images: item.extracted.images || [],
        metadata: item.extracted.metadata || {}
      };
      
      this.updateItem(item.id, {
        status: 'normalized',
        stage: 'normalization',
        normalized
      });
      
      this.updateJobProgress(job.id, { normalized: this.getJobProgress(job.id).normalized + 1 });
    }
    
    this.addJobLog(job.id, 'info', 'normalize', `${items.length} itens normalizados`);
  }

  private async mapWithAI(job: ImportJob): Promise<void> {
    this.addJobLog(job.id, 'info', 'ai-mapping', 'Iniciando mapeamento por IA');
    
    const items = this.getItemsByJob(job.id).filter(i => i.status === 'normalized');
    
    for (const item of items) {
      await this.delay(100);
      
      if (!item.normalized) continue;
      
      try {
        const mapped = await this.performAIMapping(item);
        
        const needsReview = mapped.confidence.overall < job.config.confidenceThreshold || 
                          (mapped.violations?.length || 0) > 0;
        
        this.updateItem(item.id, {
          status: needsReview ? 'pending-review' : 'mapped',
          stage: 'ai-mapping',
          mapped: { ...mapped, needsReview }
        });
        
        if (needsReview) {
          this.updateJobProgress(job.id, { pendingReview: this.getJobProgress(job.id).pendingReview + 1 });
        } else {
          this.updateJobProgress(job.id, { mapped: this.getJobProgress(job.id).mapped + 1 });
        }
        
      } catch (error) {
        this.updateItem(item.id, { status: 'failed', stage: 'ai-mapping' });
        this.addJobError(job.id, 'ai-mapping', String(error), item.id);
        this.updateJobProgress(job.id, { failed: this.getJobProgress(job.id).failed + 1 });
      }
    }
    
    this.addJobLog(job.id, 'info', 'ai-mapping', `${items.length} itens mapeados`);
  }

  private async performAIMapping(item: DiscoveredItem) {
    const normalized = item.normalized!;
    
    // Simula chamada à IA (em produção, usaria AIService)
    const contentType = 'article';
    const confidence = {
      overall: 0.75 + Math.random() * 0.25,
      byField: {
        title: 0.95,
        body_html: 0.88,
        excerpt: 0.82,
        author: 0.75,
        categories: 0.70,
        tags: 0.65
      }
    };
    
    const fields = {
      title: normalized.title,
      body_html: normalized.contentHtml,
      excerpt: normalized.excerpt,
      slug: normalized.slug,
      author: normalized.author || 'Autor Desconhecido',
      published_at: normalized.publishedAt || new Date().toISOString(),
      updated_at: normalized.updatedAt || new Date().toISOString(),
      categories: normalized.categories,
      tags: normalized.tags,
      status: 'draft',
      visibility: 'public'
    };
    
    const violations: string[] = [];
    if (!normalized.title) violations.push('Título obrigatório ausente');
    if (!normalized.contentHtml) violations.push('Conteúdo obrigatório ausente');
    
    return {
      contentType,
      fields,
      confidence,
      rationale: 'Mapeamento baseado em padrões detectados no conteúdo',
      violations: violations.length > 0 ? violations : undefined,
      needsReview: false
    };
  }

  private async importApprovedItems(job: ImportJob): Promise<void> {
    this.addJobLog(job.id, 'info', 'import', 'Iniciando importação');
    
    const items = this.getItemsByJob(job.id).filter(i => 
      i.status === 'mapped' || i.status === 'approved'
    );
    
    for (const item of items) {
      await this.delay(50);
      
      try {
        // Simula importação no CMS
        const result = this.simulateImport(item);
        
        this.updateItem(item.id, {
          status: 'imported',
          stage: 'import',
          importResult: result
        });
        
        this.updateJobProgress(job.id, { imported: this.getJobProgress(job.id).imported + 1 });
        
      } catch (error) {
        this.updateItem(item.id, { status: 'failed', stage: 'import' });
        this.addJobError(job.id, 'import', String(error), item.id);
        this.updateJobProgress(job.id, { failed: this.getJobProgress(job.id).failed + 1 });
      }
    }
    
    this.addJobLog(job.id, 'info', 'import', `${items.length} itens importados`);
  }

  private simulateImport(item: DiscoveredItem) {
    return {
      success: true,
      cmsId: `cms_${Date.now()}`,
      importedAt: new Date().toISOString()
    };
  }

  // ========================================================================
  // ITEMS
  // ========================================================================

  getItems(): DiscoveredItem[] {
    const data = localStorage.getItem(this.STORAGE_KEYS.ITEMS);
    return data ? JSON.parse(data) : [];
  }

  getItemsByJob(jobId: string): DiscoveredItem[] {
    return this.getItems().filter(i => i.jobId === jobId);
  }

  getItemsForReview(): ReviewItem[] {
    return this.getItems().filter(i => i.status === 'pending-review') as ReviewItem[];
  }

  getItem(id: string): DiscoveredItem | undefined {
    return this.getItems().find(i => i.id === id);
  }

  updateItem(id: string, updates: Partial<DiscoveredItem>): void {
    const items = this.getItems();
    const index = items.findIndex(i => i.id === id);
    
    if (index >= 0) {
      items[index] = {
        ...items[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(this.STORAGE_KEYS.ITEMS, JSON.stringify(items));
    }
  }

  approveItem(id: string, edits?: Partial<DiscoveredItem['mapped']>): void {
    const item = this.getItem(id);
    if (!item) return;
    
    const updates: Partial<ReviewItem> = {
      status: 'approved',
      reviewedBy: localStorage.getItem('cms_current_user') || 'admin',
      reviewedAt: new Date().toISOString()
    };
    
    if (edits) {
      updates.userEdited = edits;
      updates.mapped = { ...item.mapped, ...edits };
    }
    
    this.updateItem(id, updates);
    
    // Atualiza progresso do job
    const job = this.getJob(item.jobId);
    if (job) {
      this.updateJobProgress(item.jobId, {
        pendingReview: job.progress.pendingReview - 1,
        approved: job.progress.approved + 1
      });
    }
  }

  rejectItem(id: string, reason: string): void {
    const item = this.getItem(id);
    if (!item) return;
    
    this.updateItem(id, {
      status: 'rejected',
      reviewedBy: localStorage.getItem('cms_current_user') || 'admin',
      reviewedAt: new Date().toISOString(),
      reviewNotes: reason
    } as Partial<ReviewItem>);
    
    // Atualiza progresso do job
    const job = this.getJob(item.jobId);
    if (job) {
      this.updateJobProgress(item.jobId, {
        pendingReview: job.progress.pendingReview - 1,
        rejected: job.progress.rejected + 1
      });
    }
  }

  reprocessItem(id: string): void {
    const item = this.getItem(id);
    if (!item) return;
    
    this.updateItem(id, {
      status: 'discovered',
      stage: 'reprocess',
      retryCount: item.retryCount + 1
    });
    
    // Reprocessa o item
    const job = this.getJob(item.jobId);
    if (job && job.status === 'running') {
      setTimeout(() => this.processJob(job.id), 100);
    }
  }

  // ========================================================================
  // MÉTRICAS
  // ========================================================================

  getMetrics(): BatchImportMetrics {
    const jobs = this.getJobs();
    const items = this.getItems();
    
    const activeJobs = jobs.filter(j => j.status === 'running').length;
    const completedJobs = jobs.filter(j => j.status === 'completed').length;
    const failedJobs = jobs.filter(j => j.status === 'failed').length;
    
    const importedItems = items.filter(i => i.status === 'imported').length;
    const pendingReview = items.filter(i => i.status === 'pending-review').length;
    const failedItems = items.filter(i => i.status === 'failed').length;
    
    const avgConfidence = items
      .filter(i => i.mapped?.confidence.overall)
      .reduce((sum, i) => sum + (i.mapped!.confidence.overall), 0) / (items.length || 1);
    
    const successRate = items.length > 0 
      ? (importedItems / items.length) * 100 
      : 0;
    
    // Métricas por fonte
    const bySource: Record<string, any> = {};
    const profiles = this.getProfiles();
    
    profiles.forEach(profile => {
      const profileItems = items.filter(i => i.sourceProfileId === profile.id);
      const profileImported = profileItems.filter(i => i.status === 'imported').length;
      
      bySource[profile.name] = {
        items: profileItems.length,
        imported: profileImported,
        confidence: profileItems
          .filter(i => i.mapped?.confidence.overall)
          .reduce((sum, i) => sum + (i.mapped!.confidence.overall), 0) / (profileItems.length || 1),
        successRate: profileItems.length > 0 ? (profileImported / profileItems.length) * 100 : 0
      };
    });
    
    // Timeline (últimos 30 dias)
    const timeline: BatchImportMetrics['timeline'] = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayItems = items.filter(item => 
        item.discoveredAt.startsWith(dateStr)
      );
      
      timeline.push({
        date: dateStr,
        discovered: dayItems.length,
        imported: dayItems.filter(i => i.status === 'imported').length,
        failed: dayItems.filter(i => i.status === 'failed').length
      });
    }
    
    return {
      totalJobs: jobs.length,
      activeJobs,
      completedJobs,
      failedJobs,
      totalItems: items.length,
      importedItems,
      pendingReview,
      failedItems,
      avgImportTime: 0,
      avgConfidence,
      successRate,
      bySource,
      byContentType: {
        'article': importedItems,
        'page': 0,
        'event': 0
      },
      timeline
    };
  }

  // ========================================================================
  // HELPERS
  // ========================================================================

  private addJobLog(jobId: string, level: JobLog['level'], stage: string, message: string, metadata?: Record<string, any>): void {
    const job = this.getJob(jobId);
    if (!job) return;
    
    const log: JobLog = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString(),
      level,
      stage,
      message,
      metadata
    };
    
    job.logs.unshift(log);
    if (job.logs.length > 1000) job.logs = job.logs.slice(0, 1000);
    
    this.updateJob(jobId, { logs: job.logs });
  }

  private addJobError(jobId: string, stage: string, error: string, itemId?: string): void {
    const job = this.getJob(jobId);
    if (!job) return;
    
    const jobError: JobError = {
      id: `error_${Date.now()}`,
      timestamp: new Date().toISOString(),
      itemId,
      stage,
      error,
      retryCount: 0,
      resolved: false
    };
    
    job.errors.unshift(jobError);
    job.metrics.errors++;
    
    this.updateJob(jobId, { 
      errors: job.errors,
      metrics: job.metrics
    });
  }

  private updateJobProgress(jobId: string, updates: Partial<ImportJob['progress']>): void {
    const job = this.getJob(jobId);
    if (!job) return;
    
    const progress = { ...job.progress, ...updates };
    progress.percentage = progress.total > 0 
      ? Math.round((progress.imported + progress.rejected) / progress.total * 100)
      : 0;
    
    // Calcula métricas
    const metrics = { ...job.metrics };
    if (progress.total > 0) {
      metrics.successRate = (progress.imported / progress.total) * 100;
    }
    
    const items = this.getItemsByJob(jobId);
    const mappedItems = items.filter(i => i.mapped?.confidence.overall);
    if (mappedItems.length > 0) {
      metrics.avgConfidence = mappedItems.reduce((sum, i) => 
        sum + (i.mapped!.confidence.overall), 0
      ) / mappedItems.length;
    }
    
    this.updateJob(jobId, { progress, metrics });
  }

  private getJobProgress(jobId: string): ImportJob['progress'] {
    const job = this.getJob(jobId);
    return job ? job.progress : {
      discovered: 0,
      fetched: 0,
      extracted: 0,
      normalized: 0,
      mapped: 0,
      pendingReview: 0,
      approved: 0,
      rejected: 0,
      imported: 0,
      failed: 0,
      total: 0,
      percentage: 0
    };
  }

  private sanitize(text: string): string {
    return text.trim().replace(/<[^>]*>/g, '');
  }

  private sanitizeHtml(html: string): string {
    // Em produção, usar biblioteca como DOMPurify
    return html.replace(/<script[^>]*>.*?<\/script>/gi, '')
               .replace(/on\w+="[^"]*"/gi, '');
  }

  private generateSlug(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private getDefaultJobs(): ImportJob[] {
    const jobs: ImportJob[] = [
      {
        id: 'job_demo_1',
        name: 'Importação WordPress - Portal Exemplo',
        sourceProfileIds: ['profile_wp_example'],
        status: 'completed',
        config: {
          incremental: true,
          dryRun: false,
          autoApprove: false,
          confidenceThreshold: 0.8
        },
        progress: {
          discovered: 150,
          fetched: 150,
          extracted: 150,
          normalized: 150,
          mapped: 142,
          pendingReview: 8,
          approved: 134,
          rejected: 8,
          imported: 134,
          failed: 0,
          total: 150,
          percentage: 95
        },
        metrics: {
          startedAt: new Date(Date.now() - 3600000).toISOString(),
          completedAt: new Date(Date.now() - 600000).toISOString(),
          duration: 3000000,
          itemsPerSecond: 0.05,
          successRate: 95.3,
          avgConfidence: 0.89,
          avgMappingTime: 150,
          errors: 0
        },
        createdBy: 'admin',
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        updatedAt: new Date(Date.now() - 600000).toISOString(),
        logs: [
          {
            id: 'log_1',
            timestamp: new Date(Date.now() - 600000).toISOString(),
            level: 'info',
            stage: 'job',
            message: 'Job concluído com sucesso'
          }
        ],
        errors: []
      }
    ];
    
    localStorage.setItem(this.STORAGE_KEYS.JOBS, JSON.stringify(jobs));
    return jobs;
  }
}

export const BatchImportService = new BatchImportServiceClass();
