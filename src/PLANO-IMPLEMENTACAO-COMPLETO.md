# 🚀 PLANO DE IMPLEMENTAÇÃO - CMS AVANÇADO

## ✅ STATUS: PLANEJAMENTO APROVADO

**Data de Criação:** 15/10/2025  
**Versão:** 1.0  
**Tipo:** Plano de Implementação Completo  
**Prazo Estimado:** 8-12 semanas  
**_redirects:** Corrigido (35ª vez!)  

---

## 📋 ÍNDICE

1. [Visão Geral](#visão-geral)
2. [Arquitetura da Solução](#arquitetura-da-solução)
3. [Funcionalidade 1: API REST](#funcionalidade-1-api-rest)
4. [Funcionalidade 2: Componentes Avançados](#funcionalidade-2-componentes-avançados)
5. [Funcionalidade 3: Editor de Estilos Visual](#funcionalidade-3-editor-de-estilos-visual)
6. [Funcionalidade 4: Templates Prontos](#funcionalidade-4-templates-prontos)
7. [Funcionalidade 5: Colaboração em Tempo Real](#funcionalidade-5-colaboração-em-tempo-real)
8. [Funcionalidade 6: Media Library Integrada](#funcionalidade-6-media-library-integrada)
9. [Funcionalidade 7: Preview Responsivo](#funcionalidade-7-preview-responsivo)
10. [Funcionalidade 8: Publicação Direta](#funcionalidade-8-publicação-direta)
11. [Funcionalidade 9: SEO Metadata Editor](#funcionalidade-9-seo-metadata-editor)
12. [Funcionalidade 10: A/B Testing de Layouts](#funcionalidade-10-ab-testing-de-layouts)
13. [Cronograma de Implementação](#cronograma-de-implementação)
14. [Testes e Validação](#testes-e-validação)
15. [Documentação e Treinamento](#documentação-e-treinamento)

---

## 🎯 VISÃO GERAL

### **Objetivo:**
Transformar o CMS atual em uma plataforma completa e profissional com funcionalidades enterprise, mantendo a estrutura e funcionalidades existentes 100% intactas.

### **Princípios Fundamentais:**
1. ✅ **Zero Breaking Changes** - Nada do sistema atual será quebrado
2. ✅ **Backward Compatibility** - Tudo que existe continuará funcionando
3. ✅ **Progressive Enhancement** - Novas funcionalidades são adições, não substituições
4. ✅ **Performance First** - Implementações otimizadas desde o início
5. ✅ **Security by Design** - Segurança em todas as camadas

### **Escopo Total:**
- **10 Funcionalidades Principais**
- **~50 Novos Componentes**
- **~15.000 linhas de código**
- **30+ Endpoints de API**
- **20+ Templates Prontos**
- **100% Documentado**

---

## 🏗️ ARQUITETURA DA SOLUÇÃO

### **Estrutura de Pastas (Nova)**

```
/
├── api/                          # 🆕 NOVO
│   ├── routes/
│   │   ├── content.routes.ts
│   │   ├── media.routes.ts
│   │   ├── seo.routes.ts
│   │   └── analytics.routes.ts
│   ├── controllers/
│   │   ├── ContentController.ts
│   │   ├── MediaController.ts
│   │   └── SEOController.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── admin.middleware.ts
│   │   └── rateLimit.middleware.ts
│   └── server.ts
│
├── components/
│   ├── advanced/                 # 🆕 NOVO
│   │   ├── VideoEmbed.tsx
│   │   ├── DynamicForm.tsx
│   │   ├── ImageGallery.tsx
│   │   ├── ContentCarousel.tsx
│   │   └── index.ts
│   │
│   ├── collaboration/            # 🆕 NOVO
│   │   ├── RealtimeEditor.tsx
│   │   ├── UserPresence.tsx
│   │   ├── CollaborationProvider.tsx
│   │   └── index.ts
│   │
│   ├── media/                    # 🆕 NOVO
│   │   ├── MediaLibrary.tsx
│   │   ├── MediaUploader.tsx
│   │   ├── MediaGrid.tsx
│   │   └── MediaDetails.tsx
│   │
│   ├── preview/                  # 🆕 NOVO
│   │   ├── ResponsivePreview.tsx
│   │   ├── DeviceFrame.tsx
│   │   └── PreviewControls.tsx
│   │
│   ├── seo/                      # 🆕 NOVO
│   │   ├── SEOEditor.tsx
│   │   ├── MetadataForm.tsx
│   │   ├── JSONLDGenerator.tsx
│   │   └── SEOPreview.tsx
│   │
│   ├── styles/                   # 🆕 NOVO
│   │   ├── VisualStyleEditor.tsx
│   │   ├── ColorPicker.tsx
│   │   ├── SliderControl.tsx
│   │   └── StylePresets.tsx
│   │
│   ├── testing/                  # 🆕 NOVO
│   │   ├── ABTestManager.tsx
│   │   ├── VariantEditor.tsx
│   │   ├── TestResults.tsx
│   │   └── index.ts
│   │
│   └── [pastas existentes...]    # ✅ MANTIDAS
│
├── services/
│   ├── APIService.ts             # 🆕 NOVO
│   ├── WebSocketService.ts       # 🆕 NOVO
│   ├── MediaService.ts           # 🆕 NOVO
│   ├── SEOService.ts             # 🆕 NOVO
│   ├── ABTestService.ts          # 🆕 NOVO
│   └── [serviços existentes...]  # ✅ MANTIDOS
│
├── templates/                    # 🆕 NOVO
│   ├── landing/
│   │   ├── hero-landing.json
│   │   ├── product-launch.json
│   │   └── ...
│   ├── blog/
│   │   ├── classic-blog.json
│   │   ├── magazine.json
│   │   └── ...
│   └── portfolio/
│       ├── creative-portfolio.json
│       ├── agency-portfolio.json
│       └── ...
│
└── [arquivos existentes...]      # ✅ MANTIDOS
```

### **Stack Tecnológico (Adições)**

```typescript
// Backend/API
- Express.js (API REST)
- Socket.IO (WebSockets para colaboração)
- JWT (Autenticação de API)
- Multer (Upload de arquivos)

// Frontend (Novos Pacotes)
- react-player (Vídeo embed)
- react-hook-form + zod (Formulários)
- lightgallery (Galeria de imagens)
- embla-carousel-react (Carrossel avançado)
- react-colorful (Color picker)
- react-device-frameset (Preview responsivo)
- socket.io-client (Colaboração tempo real)

// SEO e Analytics
- next-seo (Metadata management)
- schema-dts (JSON-LD types)

// Testes
- Jest (Unit tests)
- React Testing Library
- Cypress (E2E tests)
```

---

## 🔌 FUNCIONALIDADE 1: API REST

### **1.1. Visão Geral**

**Objetivo:** Criar API RESTful completa para acesso externo ao CMS.

**Benefícios:**
- Integração com aplicativos mobile
- Automação e webhooks
- Integrações terceiras
- Headless CMS capabilities

### **1.2. Arquitetura da API**

```typescript
// /api/server.ts

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { authMiddleware, adminMiddleware } from './middleware';
import { contentRoutes, mediaRoutes, seoRoutes } from './routes';

const app = express();
const PORT = process.env.API_PORT || 3001;

// Security
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
  credentials: true
}));

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rate limiting
import rateLimit from 'express-rate-limit';
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // limite de requisições
});
app.use('/api/', limiter);

// Routes
app.use('/api/content', authMiddleware, adminMiddleware, contentRoutes);
app.use('/api/media', authMiddleware, adminMiddleware, mediaRoutes);
app.use('/api/seo', authMiddleware, adminMiddleware, seoRoutes);
app.use('/api/analytics', authMiddleware, analyticsRoutes);

// Health check (pública)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`🚀 API Server running on port ${PORT}`);
});

export default app;
```

### **1.3. Endpoints da API**

#### **Content Endpoints**

```typescript
// /api/routes/content.routes.ts

import express from 'express';
import { ContentController } from '../controllers/ContentController';

const router = express.Router();
const controller = new ContentController();

/**
 * @route   GET /api/content/pages
 * @desc    Listar todas as páginas
 * @access  Admin
 */
router.get('/pages', controller.getAllPages);

/**
 * @route   GET /api/content/pages/:id
 * @desc    Obter página específica
 * @access  Admin
 */
router.get('/pages/:id', controller.getPageById);

/**
 * @route   POST /api/content/pages
 * @desc    Criar nova página
 * @access  Admin
 * @body    { title, slug, content, status, seo }
 */
router.post('/pages', controller.createPage);

/**
 * @route   PUT /api/content/pages/:id
 * @desc    Atualizar página
 * @access  Admin
 */
router.put('/pages/:id', controller.updatePage);

/**
 * @route   DELETE /api/content/pages/:id
 * @desc    Excluir página
 * @access  Admin
 */
router.delete('/pages/:id', controller.deletePage);

/**
 * @route   POST /api/content/pages/:id/publish
 * @desc    Publicar página
 * @access  Admin
 */
router.post('/pages/:id/publish', controller.publishPage);

/**
 * @route   POST /api/content/pages/:id/duplicate
 * @desc    Duplicar página
 * @access  Admin
 */
router.post('/pages/:id/duplicate', controller.duplicatePage);

export default router;
```

#### **Media Endpoints**

```typescript
// /api/routes/media.routes.ts

import express from 'express';
import multer from 'multer';
import { MediaController } from '../controllers/MediaController';

const router = express.Router();
const controller = new MediaController();

// Configuração de upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|mp4|webm/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não permitido'));
    }
  }
});

/**
 * @route   POST /api/media/upload
 * @desc    Upload de arquivo(s)
 * @access  Admin
 */
router.post('/upload', upload.array('files', 10), controller.uploadFiles);

/**
 * @route   GET /api/media
 * @desc    Listar arquivos
 * @access  Admin
 */
router.get('/', controller.listMedia);

/**
 * @route   GET /api/media/:id
 * @desc    Obter arquivo específico
 * @access  Admin
 */
router.get('/:id', controller.getMediaById);

/**
 * @route   DELETE /api/media/:id
 * @desc    Excluir arquivo
 * @access  Admin
 */
router.delete('/:id', controller.deleteMedia);

/**
 * @route   PUT /api/media/:id
 * @desc    Atualizar metadados do arquivo
 * @access  Admin
 */
router.put('/:id', controller.updateMedia);

export default router;
```

#### **SEO Endpoints**

```typescript
// /api/routes/seo.routes.ts

import express from 'express';
import { SEOController } from '../controllers/SEOController';

const router = express.Router();
const controller = new SEOController();

/**
 * @route   GET /api/seo/:pageId
 * @desc    Obter metadados SEO da página
 * @access  Admin
 */
router.get('/:pageId', controller.getSEOMetadata);

/**
 * @route   PUT /api/seo/:pageId
 * @desc    Atualizar metadados SEO
 * @access  Admin
 */
router.put('/:pageId', controller.updateSEOMetadata);

/**
 * @route   POST /api/seo/:pageId/generate
 * @desc    Gerar JSON-LD automaticamente
 * @access  Admin
 */
router.post('/:pageId/generate', controller.generateJSONLD);

/**
 * @route   GET /api/seo/sitemap.xml
 * @desc    Gerar sitemap XML
 * @access  Public
 */
router.get('/sitemap.xml', controller.generateSitemap);

export default router;
```

### **1.4. Autenticação e Autorização**

```typescript
// /api/middleware/auth.middleware.ts

import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Obter token do header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const parts = authHeader.split(' ');
    
    if (parts.length !== 2) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    const [scheme, token] = parts;

    if (!/^Bearer$/i.test(scheme)) {
      return res.status(401).json({ error: 'Token mal formatado' });
    }

    // Verificar token
    jwt.verify(token, JWT_SECRET, (err, decoded: any) => {
      if (err) {
        return res.status(401).json({ error: 'Token inválido' });
      }

      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role
      };

      return next();
    });
  } catch (error) {
    return res.status(401).json({ error: 'Autenticação falhou' });
  }
};

// Middleware para verificar se é admin
export const adminMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Não autenticado' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
  }

  next();
};
```

### **1.5. Controllers**

```typescript
// /api/controllers/ContentController.ts

import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';

export class ContentController {
  // GET /api/content/pages
  async getAllPages(req: AuthRequest, res: Response) {
    try {
      // Buscar do localStorage (adaptado para backend)
      const pages = await this.getPagesFromStorage();
      
      res.json({
        success: true,
        data: pages,
        total: pages.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Erro ao buscar páginas'
      });
    }
  }

  // GET /api/content/pages/:id
  async getPageById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const pages = await this.getPagesFromStorage();
      const page = pages.find(p => p.id === id);

      if (!page) {
        return res.status(404).json({
          success: false,
          error: 'Página não encontrada'
        });
      }

      res.json({
        success: true,
        data: page
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Erro ao buscar página'
      });
    }
  }

  // POST /api/content/pages
  async createPage(req: AuthRequest, res: Response) {
    try {
      const pageData = req.body;
      
      // Validação
      if (!pageData.title || !pageData.slug) {
        return res.status(400).json({
          success: false,
          error: 'Título e slug são obrigatórios'
        });
      }

      // Criar página
      const newPage = {
        id: this.generateId(),
        ...pageData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: req.user?.id
      };

      // Salvar
      await this.savePage(newPage);

      // Audit log
      await this.logAudit({
        type: 'page_created',
        userId: req.user?.id,
        details: { pageId: newPage.id, title: newPage.title }
      });

      res.status(201).json({
        success: true,
        data: newPage
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Erro ao criar página'
      });
    }
  }

  // PUT /api/content/pages/:id
  async updatePage(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const pages = await this.getPagesFromStorage();
      const pageIndex = pages.findIndex(p => p.id === id);

      if (pageIndex === -1) {
        return res.status(404).json({
          success: false,
          error: 'Página não encontrada'
        });
      }

      // Atualizar
      const updatedPage = {
        ...pages[pageIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
        updatedBy: req.user?.id
      };

      pages[pageIndex] = updatedPage;
      await this.savePages(pages);

      // Audit log
      await this.logAudit({
        type: 'page_updated',
        userId: req.user?.id,
        details: { pageId: id, title: updatedPage.title }
      });

      res.json({
        success: true,
        data: updatedPage
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Erro ao atualizar página'
      });
    }
  }

  // DELETE /api/content/pages/:id
  async deletePage(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      const pages = await this.getPagesFromStorage();
      const filteredPages = pages.filter(p => p.id !== id);

      if (pages.length === filteredPages.length) {
        return res.status(404).json({
          success: false,
          error: 'Página não encontrada'
        });
      }

      await this.savePages(filteredPages);

      // Audit log
      await this.logAudit({
        type: 'page_deleted',
        userId: req.user?.id,
        details: { pageId: id }
      });

      res.json({
        success: true,
        message: 'Página excluída com sucesso'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Erro ao excluir página'
      });
    }
  }

  // POST /api/content/pages/:id/publish
  async publishPage(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      const pages = await this.getPagesFromStorage();
      const pageIndex = pages.findIndex(p => p.id === id);

      if (pageIndex === -1) {
        return res.status(404).json({
          success: false,
          error: 'Página não encontrada'
        });
      }

      // Publicar
      pages[pageIndex].status = 'published';
      pages[pageIndex].publishedAt = new Date().toISOString();
      pages[pageIndex].publishedBy = req.user?.id;

      await this.savePages(pages);

      // Audit log
      await this.logAudit({
        type: 'page_published',
        userId: req.user?.id,
        details: { pageId: id, title: pages[pageIndex].title }
      });

      res.json({
        success: true,
        data: pages[pageIndex]
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Erro ao publicar página'
      });
    }
  }

  // Helpers
  private async getPagesFromStorage(): Promise<any[]> {
    // Implementar leitura do storage (arquivo ou DB)
    return [];
  }

  private async savePages(pages: any[]): Promise<void> {
    // Implementar salvamento
  }

  private async savePage(page: any): Promise<void> {
    const pages = await this.getPagesFromStorage();
    pages.push(page);
    await this.savePages(pages);
  }

  private generateId(): string {
    return `page-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private async logAudit(data: any): Promise<void> {
    // Implementar audit log
  }
}
```

### **1.6. Cliente da API (Frontend)**

```typescript
// /services/APIService.ts

export class APIService {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = 'http://localhost:3001/api') {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('apiToken');
  }

  // Autenticação
  async authenticate(email: string, password: string): Promise<string> {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      throw new Error('Autenticação falhou');
    }

    const data = await response.json();
    this.token = data.token;
    localStorage.setItem('apiToken', this.token);

    return this.token;
  }

  // Headers com autenticação
  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      ...(this.token && { 'Authorization': `Bearer ${this.token}` })
    };
  }

  // Content endpoints
  async getPages() {
    const response = await fetch(`${this.baseURL}/content/pages`, {
      headers: this.getHeaders()
    });
    return response.json();
  }

  async getPage(id: string) {
    const response = await fetch(`${this.baseURL}/content/pages/${id}`, {
      headers: this.getHeaders()
    });
    return response.json();
  }

  async createPage(data: any) {
    const response = await fetch(`${this.baseURL}/content/pages`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    return response.json();
  }

  async updatePage(id: string, data: any) {
    const response = await fetch(`${this.baseURL}/content/pages/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    return response.json();
  }

  async deletePage(id: string) {
    const response = await fetch(`${this.baseURL}/content/pages/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    return response.json();
  }

  async publishPage(id: string) {
    const response = await fetch(`${this.baseURL}/content/pages/${id}/publish`, {
      method: 'POST',
      headers: this.getHeaders()
    });
    return response.json();
  }

  // Media endpoints
  async uploadMedia(files: File[]) {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    const response = await fetch(`${this.baseURL}/media/upload`, {
      method: 'POST',
      headers: {
        ...(this.token && { 'Authorization': `Bearer ${this.token}` })
      },
      body: formData
    });
    return response.json();
  }

  async getMedia() {
    const response = await fetch(`${this.baseURL}/media`, {
      headers: this.getHeaders()
    });
    return response.json();
  }

  // SEO endpoints
  async getSEO(pageId: string) {
    const response = await fetch(`${this.baseURL}/seo/${pageId}`, {
      headers: this.getHeaders()
    });
    return response.json();
  }

  async updateSEO(pageId: string, data: any) {
    const response = await fetch(`${this.baseURL}/seo/${pageId}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    return response.json();
  }

  async generateJSONLD(pageId: string) {
    const response = await fetch(`${this.baseURL}/seo/${pageId}/generate`, {
      method: 'POST',
      headers: this.getHeaders()
    });
    return response.json();
  }
}

// Singleton instance
export const apiService = new APIService();
```

### **1.7. Documentação da API**

```typescript
// /api/swagger.config.ts

import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CMS API',
      version: '1.0.0',
      description: 'API RESTful para gerenciamento de conteúdo',
      contact: {
        name: 'API Support',
        email: 'api@example.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3001/api',
        description: 'Desenvolvimento'
      },
      {
        url: 'https://api.example.com',
        description: 'Produção'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },
  apis: ['./api/routes/*.ts']
};

export const swaggerSpec = swaggerJsdoc(options);
```

### **1.8. Testes da API**

```typescript
// /api/__tests__/content.test.ts

import request from 'supertest';
import app from '../server';

describe('Content API', () => {
  let authToken: string;

  beforeAll(async () => {
    // Autenticar
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'admin123'
      });
    
    authToken = response.body.token;
  });

  describe('GET /api/content/pages', () => {
    it('deve retornar lista de páginas', async () => {
      const response = await request(app)
        .get('/api/content/pages')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('deve falhar sem autenticação', async () => {
      const response = await request(app)
        .get('/api/content/pages');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/content/pages', () => {
    it('deve criar nova página', async () => {
      const newPage = {
        title: 'Test Page',
        slug: '/test-page',
        content: '<h1>Test</h1>',
        status: 'draft'
      };

      const response = await request(app)
        .post('/api/content/pages')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newPage);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(newPage.title);
    });
  });

  // Mais testes...
});
```

---

## 📦 FUNCIONALIDADE 2: COMPONENTES AVANÇADOS

### **2.1. VideoEmbed Component**

```typescript
// /components/advanced/VideoEmbed.tsx

import React, { useState } from 'react';
import ReactPlayer from 'react-player';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

interface VideoEmbedProps {
  url?: string;
  width?: string | number;
  height?: string | number;
  autoplay?: boolean;
  controls?: boolean;
  loop?: boolean;
  muted?: boolean;
  onReady?: () => void;
  onError?: (error: any) => void;
}

export function VideoEmbed({
  url = '',
  width = '100%',
  height = '360px',
  autoplay = false,
  controls = true,
  loop = false,
  muted = false,
  onReady,
  onError
}: VideoEmbedProps) {
  return (
    <div 
      className="video-embed-wrapper" 
      style={{ width, height, position: 'relative' }}
    >
      <ReactPlayer
        url={url}
        width="100%"
        height="100%"
        playing={autoplay}
        controls={controls}
        loop={loop}
        muted={muted}
        onReady={onReady}
        onError={onError}
        config={{
          youtube: {
            playerVars: { 
              showinfo: 1,
              modestbranding: 1
            }
          },
          vimeo: {
            playerOptions: {
              title: true,
              byline: true,
              portrait: true
            }
          }
        }}
      />
    </div>
  );
}

// Editor de configuração do vídeo
export function VideoEmbedEditor({ 
  value, 
  onChange 
}: { 
  value: any; 
  onChange: (value: any) => void 
}) {
  const [config, setConfig] = useState({
    url: value?.url || '',
    width: value?.width || '100%',
    height: value?.height || '360px',
    autoplay: value?.autoplay || false,
    controls: value?.controls !== false,
    loop: value?.loop || false,
    muted: value?.muted || false,
    aspectRatio: value?.aspectRatio || '16:9'
  });

  const handleChange = (key: string, newValue: any) => {
    const updated = { ...config, [key]: newValue };
    setConfig(updated);
    onChange(updated);
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <Tabs defaultValue="content">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="content">Conteúdo</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-4">
            <div>
              <Label>URL do Vídeo</Label>
              <Input
                placeholder="https://www.youtube.com/watch?v=..."
                value={config.url}
                onChange={(e) => handleChange('url', e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                Suporta: YouTube, Vimeo, Dailymotion, SoundCloud, etc.
              </p>
            </div>

            {/* Preview */}
            {config.url && (
              <div className="border rounded-lg overflow-hidden">
                <VideoEmbed {...config} />
              </div>
            )}
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            {/* Dimensões */}
            <div>
              <Label>Aspect Ratio</Label>
              <Select
                value={config.aspectRatio}
                onValueChange={(value) => handleChange('aspectRatio', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="16:9">16:9 (Widescreen)</SelectItem>
                  <SelectItem value="4:3">4:3 (Standard)</SelectItem>
                  <SelectItem value="1:1">1:1 (Square)</SelectItem>
                  <SelectItem value="9:16">9:16 (Vertical)</SelectItem>
                  <SelectItem value="21:9">21:9 (Ultrawide)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Largura</Label>
              <Input
                placeholder="100%"
                value={config.width}
                onChange={(e) => handleChange('width', e.target.value)}
              />
            </div>

            <div>
              <Label>Altura</Label>
              <Input
                placeholder="360px"
                value={config.height}
                onChange={(e) => handleChange('height', e.target.value)}
              />
            </div>

            {/* Opções de reprodução */}
            <div className="space-y-3 border-t pt-3">
              <div className="flex items-center justify-between">
                <Label>Autoplay</Label>
                <Switch
                  checked={config.autoplay}
                  onCheckedChange={(checked) => handleChange('autoplay', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Controles</Label>
                <Switch
                  checked={config.controls}
                  onCheckedChange={(checked) => handleChange('controls', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Loop</Label>
                <Switch
                  checked={config.loop}
                  onCheckedChange={(checked) => handleChange('loop', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Mudo</Label>
                <Switch
                  checked={config.muted}
                  onCheckedChange={(checked) => handleChange('muted', checked)}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
```

### **2.2. DynamicForm Component**

```typescript
// /components/advanced/DynamicForm.tsx

import React from 'react';
import { useForm } from 'react-hook-form@7.55.0';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner@2.0.3';

export interface FormField {
  id: string;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'checkbox' | 'radio' | 'select';
  label: string;
  placeholder?: string;
  required?: boolean;
  validation?: any;
  options?: { label: string; value: string }[]; // Para select/radio
}

export interface DynamicFormProps {
  fields: FormField[];
  submitLabel?: string;
  onSubmit: (data: any) => void | Promise<void>;
  emailService?: {
    provider: 'mailchimp' | 'sendgrid' | 'webhook';
    config: any;
  };
}

export function DynamicForm({
  fields,
  submitLabel = 'Enviar',
  onSubmit,
  emailService
}: DynamicFormProps) {
  // Construir schema de validação dinamicamente
  const schemaFields: any = {};
  fields.forEach(field => {
    let fieldSchema = z.string();

    if (field.type === 'email') {
      fieldSchema = z.string().email('E-mail inválido');
    }

    if (field.required) {
      fieldSchema = fieldSchema.min(1, `${field.label} é obrigatório`);
    } else {
      fieldSchema = fieldSchema.optional();
    }

    schemaFields[field.id] = fieldSchema;
  });

  const schema = z.object(schemaFields);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm({
    resolver: zodResolver(schema)
  });

  const handleFormSubmit = async (data: any) => {
    try {
      // Enviar para email service se configurado
      if (emailService) {
        await sendToEmailService(data, emailService);
      }

      // Callback personalizado
      await onSubmit(data);

      toast.success('Formulário enviado com sucesso!');
      reset();
    } catch (error) {
      toast.error('Erro ao enviar formulário');
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {fields.map(field => (
        <div key={field.id}>
          <Label htmlFor={field.id}>
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </Label>

          {/* Text/Email/Tel */}
          {['text', 'email', 'tel'].includes(field.type) && (
            <Input
              id={field.id}
              type={field.type}
              placeholder={field.placeholder}
              {...register(field.id)}
            />
          )}

          {/* Textarea */}
          {field.type === 'textarea' && (
            <Textarea
              id={field.id}
              placeholder={field.placeholder}
              {...register(field.id)}
            />
          )}

          {/* Checkbox */}
          {field.type === 'checkbox' && (
            <div className="flex items-center space-x-2">
              <Checkbox id={field.id} {...register(field.id)} />
              <label htmlFor={field.id} className="text-sm">
                {field.placeholder}
              </label>
            </div>
          )}

          {/* Radio Group */}
          {field.type === 'radio' && field.options && (
            <RadioGroup {...register(field.id)}>
              {field.options.map(option => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={`${field.id}-${option.value}`} />
                  <Label htmlFor={`${field.id}-${option.value}`}>{option.label}</Label>
                </div>
              ))}
            </RadioGroup>
          )}

          {/* Select */}
          {field.type === 'select' && field.options && (
            <Select {...register(field.id)}>
              <SelectTrigger>
                <SelectValue placeholder={field.placeholder} />
              </SelectTrigger>
              <SelectContent>
                {field.options.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Error message */}
          {errors[field.id] && (
            <p className="text-sm text-red-500 mt-1">
              {errors[field.id]?.message as string}
            </p>
          )}
        </div>
      ))}

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Enviando...' : submitLabel}
      </Button>
    </form>
  );
}

// Helper para enviar para serviços de email
async function sendToEmailService(data: any, service: any) {
  if (service.provider === 'mailchimp') {
    // Integração com Mailchimp
    await fetch(`https://us1.api.mailchimp.com/3.0/lists/${service.config.listId}/members`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${service.config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email_address: data.email,
        status: 'subscribed',
        merge_fields: data
      })
    });
  } else if (service.provider === 'webhook') {
    // Webhook genérico
    await fetch(service.config.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  }
}

// Editor de configuração do formulário
export function DynamicFormEditor({
  value,
  onChange
}: {
  value: any;
  onChange: (value: any) => void;
}) {
  const [fields, setFields] = useState<FormField[]>(value?.fields || []);

  const addField = () => {
    const newField: FormField = {
      id: `field-${Date.now()}`,
      type: 'text',
      label: 'Novo Campo',
      required: false
    };
    const updated = [...fields, newField];
    setFields(updated);
    onChange({ ...value, fields: updated });
  };

  const updateField = (index: number, updates: Partial<FormField>) => {
    const updated = [...fields];
    updated[index] = { ...updated[index], ...updates };
    setFields(updated);
    onChange({ ...value, fields: updated });
  };

  const removeField = (index: number) => {
    const updated = fields.filter((_, i) => i !== index);
    setFields(updated);
    onChange({ ...value, fields: updated });
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Campos do Formulário</h3>
          <Button onClick={addField} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Campo
          </Button>
        </div>

        <div className="space-y-3">
          {fields.map((field, index) => (
            <Card key={field.id}>
              <CardContent className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <Input
                    value={field.label}
                    onChange={(e) => updateField(index, { label: e.target.value })}
                    placeholder="Label do campo"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeField(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <Select
                  value={field.type}
                  onValueChange={(type: any) => updateField(index, { type })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Texto</SelectItem>
                    <SelectItem value="email">E-mail</SelectItem>
                    <SelectItem value="tel">Telefone</SelectItem>
                    <SelectItem value="textarea">Área de Texto</SelectItem>
                    <SelectItem value="checkbox">Checkbox</SelectItem>
                    <SelectItem value="radio">Radio</SelectItem>
                    <SelectItem value="select">Select</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  value={field.placeholder || ''}
                  onChange={(e) => updateField(index, { placeholder: e.target.value })}
                  placeholder="Placeholder"
                />

                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={field.required}
                    onCheckedChange={(checked) => updateField(index, { required: checked as boolean })}
                  />
                  <Label>Campo obrigatório</Label>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Preview do formulário */}
        <div className="border-t pt-4">
          <h4 className="font-medium mb-3">Preview:</h4>
          <DynamicForm
            fields={fields}
            onSubmit={(data) => console.log('Preview submit:', data)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
```

Devido ao limite de caracteres, vou continuar o plano em uma segunda parte. Você gostaria que eu continue com as funcionalidades 3-10?