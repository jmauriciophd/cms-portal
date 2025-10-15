/**
 * FileSystemHelper
 * 
 * Funções auxiliares para criar arquivos HTML automaticamente
 * quando matérias, páginas ou templates são salvos
 */

interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  path: string;
  size?: number;
  url?: string;
  mimeType?: string;
  createdAt: string;
  modifiedAt?: string;
  parent?: string;
  protected?: boolean;
}

/**
 * Cria ou atualiza um arquivo HTML no sistema de arquivos
 */
export function saveHTMLFile(params: {
  type: 'article' | 'page' | 'template';
  id: string;
  title: string;
  slug: string;
  components: any[];
  meta?: {
    description?: string;
    robots?: string;
  };
}): void {
  const { type, id, title, slug, components, meta } = params;

  // Define o caminho base baseado no tipo
  const basePath = type === 'article' 
    ? '/Arquivos/paginas/materias'
    : type === 'page'
    ? '/Arquivos/paginas/pages'
    : '/Arquivos/paginas/templates';

  // Garante que a pasta existe
  ensureFolderExists(basePath);

  // Gera o HTML
  const htmlContent = generateHTML(title, components, meta);

  // Cria um blob do HTML
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const size = blob.size;
  const url = URL.createObjectURL(blob);

  // Nome do arquivo
  const fileName = `${slug}.html`;
  const filePath = `${basePath}/${fileName}`;

  // Carrega arquivos existentes
  const files = JSON.parse(localStorage.getItem('files') || '[]');

  // Verifica se o arquivo já existe
  const existingFileIndex = files.findIndex((f: FileItem) => f.path === filePath);

  const fileData: FileItem = {
    id: existingFileIndex >= 0 ? files[existingFileIndex].id : `file-${Date.now()}-${Math.random()}`,
    name: fileName,
    type: 'file',
    path: filePath,
    parent: basePath,
    size,
    url,
    mimeType: 'text/html',
    createdAt: existingFileIndex >= 0 ? files[existingFileIndex].createdAt : new Date().toISOString(),
    modifiedAt: new Date().toISOString()
  };

  if (existingFileIndex >= 0) {
    // Atualiza arquivo existente
    files[existingFileIndex] = fileData;
  } else {
    // Adiciona novo arquivo
    files.push(fileData);
  }

  // Salva de volta
  localStorage.setItem('files', JSON.stringify(files));
}

/**
 * Garante que uma pasta existe no sistema
 */
function ensureFolderExists(path: string): void {
  const files = JSON.parse(localStorage.getItem('files') || '[]');
  
  // Divide o caminho em partes
  const parts = path.split('/').filter(p => p);
  let currentPath = '';

  parts.forEach(part => {
    const parentPath = currentPath || '/';
    currentPath = currentPath ? `${currentPath}/${part}` : `/${part}`;

    // Verifica se a pasta já existe
    const exists = files.some((f: FileItem) => f.path === currentPath && f.type === 'folder');

    if (!exists) {
      // Cria a pasta
      const newFolder: FileItem = {
        id: `folder-${Date.now()}-${Math.random()}`,
        name: part,
        type: 'folder',
        path: currentPath,
        parent: parentPath,
        createdAt: new Date().toISOString()
      };
      files.push(newFolder);
    }
  });

  localStorage.setItem('files', JSON.stringify(files));
}

/**
 * Gera HTML a partir dos componentes
 */
function generateHTML(
  title: string, 
  components: any[], 
  meta?: { description?: string; robots?: string }
): string {
  const description = meta?.description || title;
  const robots = meta?.robots || 'index,follow';

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${escapeHtml(description)}">
    <meta name="robots" content="${robots}">
    <title>${escapeHtml(title)}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        img { max-width: 100%; height: auto; }
        h1, h2, h3, h4, h5, h6 { margin-bottom: 0.5em; }
        p { margin-bottom: 1em; }
    </style>
</head>
<body>
    <div class="container">
        <h1>${escapeHtml(title)}</h1>
        ${renderComponents(components)}
    </div>
</body>
</html>`;
}

/**
 * Renderiza componentes para HTML
 */
function renderComponents(components: any[]): string {
  if (!components || components.length === 0) {
    return '<p>Conteúdo vazio</p>';
  }

  return components.map(comp => {
    switch (comp.type) {
      case 'heading':
      case 'h1':
      case 'h2':
      case 'h3':
        const level = comp.props?.level || '2';
        return `<h${level}>${escapeHtml(comp.props?.text || '')}</h${level}>`;
      
      case 'paragraph':
      case 'text':
        return `<p>${escapeHtml(comp.props?.text || comp.props?.content || '')}</p>`;
      
      case 'image':
        return `<img src="${escapeHtml(comp.props?.url || comp.props?.src || '')}" alt="${escapeHtml(comp.props?.alt || '')}" />`;
      
      case 'button':
        return `<a href="${escapeHtml(comp.props?.href || '#')}" style="display: inline-block; padding: 10px 20px; background: #4F46E5; color: white; text-decoration: none; border-radius: 5px;">${escapeHtml(comp.props?.text || 'Botão')}</a>`;
      
      case 'list':
        const items = comp.props?.items || [];
        return `<ul>${items.map((item: string) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
      
      case 'container':
      case 'div':
        const children = comp.children || [];
        return `<div>${renderComponents(children)}</div>`;
      
      default:
        return `<div><!-- Componente ${comp.type} --></div>`;
    }
  }).join('\n');
}

/**
 * Escapa HTML para prevenir XSS
 */
function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&',
    '<': '<',
    '>': '>',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Remove um arquivo HTML quando uma matéria/página é deletada
 */
export function deleteHTMLFile(params: {
  type: 'article' | 'page' | 'template';
  slug: string;
}): void {
  const { type, slug } = params;

  const basePath = type === 'article' 
    ? '/Arquivos/paginas/materias'
    : type === 'page'
    ? '/Arquivos/paginas/pages'
    : '/Arquivos/paginas/templates';

  const filePath = `${basePath}/${slug}.html`;

  const files = JSON.parse(localStorage.getItem('files') || '[]');
  const updatedFiles = files.filter((f: FileItem) => f.path !== filePath);
  
  localStorage.setItem('files', JSON.stringify(updatedFiles));
}

/**
 * Renomeia um arquivo HTML quando o slug muda
 */
export function renameHTMLFile(params: {
  type: 'article' | 'page' | 'template';
  oldSlug: string;
  newSlug: string;
}): void {
  const { type, oldSlug, newSlug } = params;

  const basePath = type === 'article' 
    ? '/Arquivos/paginas/materias'
    : type === 'page'
    ? '/Arquivos/paginas/pages'
    : '/Arquivos/paginas/templates';

  const oldPath = `${basePath}/${oldSlug}.html`;
  const newPath = `${basePath}/${newSlug}.html`;
  const newName = `${newSlug}.html`;

  const files = JSON.parse(localStorage.getItem('files') || '[]');
  const fileIndex = files.findIndex((f: FileItem) => f.path === oldPath);

  if (fileIndex >= 0) {
    files[fileIndex].path = newPath;
    files[fileIndex].name = newName;
    files[fileIndex].modifiedAt = new Date().toISOString();
    localStorage.setItem('files', JSON.stringify(files));
  }
}
