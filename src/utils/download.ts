/**
 * Download Utility
 * Funções para download de arquivos e pastas
 */

import { toast } from 'sonner@2.0.3';

export interface DownloadableFile {
  name: string;
  url: string;
  mimeType?: string;
}

export interface DownloadableFolder {
  name: string;
  files: DownloadableFile[];
  subfolders?: DownloadableFolder[];
}

/**
 * Faz download de um arquivo individual
 */
export function downloadFile(file: DownloadableFile): void {
  try {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(`Download de "${file.name}" iniciado`);
  } catch (error) {
    console.error('Erro ao fazer download:', error);
    toast.error('Erro ao iniciar download');
  }
}

/**
 * Faz download de múltiplos arquivos
 */
export async function downloadMultipleFiles(files: DownloadableFile[]): Promise<void> {
  if (files.length === 0) {
    toast.error('Nenhum arquivo para download');
    return;
  }

  if (files.length === 1) {
    downloadFile(files[0]);
    return;
  }

  // Para múltiplos arquivos, mostra aviso
  toast.info(`Iniciando download de ${files.length} arquivos...`);

  // Download sequencial com delay para não sobrecarregar o navegador
  for (let i = 0; i < files.length; i++) {
    setTimeout(() => {
      downloadFile(files[i]);
    }, i * 200); // 200ms de delay entre cada download
  }
}

/**
 * Converte um Data URL para Blob
 */
function dataURLtoBlob(dataURL: string): Blob {
  const parts = dataURL.split(',');
  const mimeMatch = parts[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
  const bstr = atob(parts[1]);
  const n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  for (let i = 0; i < n; i++) {
    u8arr[i] = bstr.charCodeAt(i);
  }
  
  return new Blob([u8arr], { type: mime });
}

/**
 * Faz download de uma pasta como arquivo ZIP
 * Nota: Usa JSZip para criar o arquivo ZIP
 */
export async function downloadFolder(folder: DownloadableFolder): Promise<void> {
  try {
    // Importa JSZip dinamicamente
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();

    // Função recursiva para adicionar arquivos ao ZIP
    const addToZip = async (
      zipFolder: any,
      items: DownloadableFile[],
      subfolders?: DownloadableFolder[]
    ) => {
      // Adiciona arquivos
      for (const file of items) {
        try {
          if (file.url.startsWith('data:')) {
            // Converte Data URL para Blob
            const blob = dataURLtoBlob(file.url);
            zipFolder.file(file.name, blob);
          } else if (file.url.startsWith('blob:')) {
            // Faz fetch do blob URL
            const response = await fetch(file.url);
            const blob = await response.blob();
            zipFolder.file(file.name, blob);
          } else {
            // URL normal - tenta fazer fetch
            try {
              const response = await fetch(file.url);
              const blob = await response.blob();
              zipFolder.file(file.name, blob);
            } catch (err) {
              console.warn(`Não foi possível adicionar ${file.name} ao ZIP`, err);
              // Adiciona um arquivo de texto indicando o erro
              zipFolder.file(
                `${file.name}.url.txt`,
                `URL original: ${file.url}\n\nNão foi possível baixar este arquivo automaticamente.`
              );
            }
          }
        } catch (error) {
          console.error(`Erro ao adicionar arquivo ${file.name}:`, error);
        }
      }

      // Adiciona subpastas recursivamente
      if (subfolders) {
        for (const subfolder of subfolders) {
          const subZipFolder = zipFolder.folder(subfolder.name);
          await addToZip(subZipFolder, subfolder.files, subfolder.subfolders);
        }
      }
    };

    // Adiciona todos os arquivos e subpastas ao ZIP
    await addToZip(zip, folder.files, folder.subfolders);

    // Gera o arquivo ZIP
    toast.info('Compactando arquivos...');
    const blob = await zip.generateAsync({ type: 'blob' });

    // Faz download do ZIP
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${folder.name}.zip`;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Limpa o URL do blob
    setTimeout(() => URL.revokeObjectURL(link.href), 100);

    toast.success(`Pasta "${folder.name}" baixada com sucesso`);
  } catch (error) {
    console.error('Erro ao fazer download da pasta:', error);
    toast.error('Erro ao compactar e baixar a pasta');
  }
}

/**
 * Prepara estrutura de pasta a partir de array de arquivos com paths
 */
export function prepareFolderStructure(
  folderName: string,
  allFiles: Array<{
    name: string;
    path: string;
    url: string;
    mimeType?: string;
    type: 'file' | 'folder';
  }>,
  folderPath: string
): DownloadableFolder {
  const folder: DownloadableFolder = {
    name: folderName,
    files: [],
    subfolders: []
  };

  // Filtra arquivos que estão diretamente nesta pasta
  const directFiles = allFiles.filter(
    f => f.type === 'file' && f.path.startsWith(folderPath + '/') && 
    f.path.split('/').length === folderPath.split('/').length + 1
  );

  folder.files = directFiles.map(f => ({
    name: f.name,
    url: f.url,
    mimeType: f.mimeType
  }));

  // Identifica subpastas
  const subfolderPaths = new Set<string>();
  allFiles
    .filter(f => f.type === 'folder' && f.path.startsWith(folderPath + '/'))
    .forEach(f => {
      const relativePath = f.path.substring(folderPath.length + 1);
      const firstSegment = relativePath.split('/')[0];
      if (firstSegment) {
        subfolderPaths.add(folderPath + '/' + firstSegment);
      }
    });

  // Processa subpastas recursivamente
  folder.subfolders = Array.from(subfolderPaths).map(subPath => {
    const subFolderName = subPath.split('/').pop() || 'pasta';
    return prepareFolderStructure(subFolderName, allFiles, subPath);
  });

  return folder;
}

/**
 * Exporta todos os dados do sistema como backup
 */
export async function exportSystemBackup(): Promise<void> {
  try {
    toast.info('Preparando backup do sistema...');

    // Coleta todos os dados do localStorage
    const backup: Record<string, any> = {};
    const keys = [
      'files',
      'pages',
      'articles',
      'templates',
      'menus',
      'users',
      'settings',
      'customFields',
      'links',
      'snippets',
      'auditLogs'
    ];

    keys.forEach(key => {
      const data = localStorage.getItem(key);
      if (data) {
        try {
          backup[key] = JSON.parse(data);
        } catch (e) {
          backup[key] = data;
        }
      }
    });

    // Adiciona metadados
    backup._metadata = {
      exportDate: new Date().toISOString(),
      version: '1.0.0',
      systemName: 'CMS Portal'
    };

    // Converte para JSON
    const jsonString = JSON.stringify(backup, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });

    // Faz download
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `cms-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => URL.revokeObjectURL(link.href), 100);

    toast.success('Backup do sistema exportado com sucesso');
  } catch (error) {
    console.error('Erro ao exportar backup:', error);
    toast.error('Erro ao exportar backup do sistema');
  }
}
