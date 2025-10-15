import { useState } from 'react';
import { ChevronDown, ChevronRight, Folder, FolderOpen, File } from 'lucide-react';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';

interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  path: string;
  parent?: string;
  children?: FileItem[];
  size?: number;
  mimeType?: string;
}

interface FolderNavigatorProps {
  files: FileItem[];
  currentPath: string;
  onNavigate: (path: string) => void;
  onFileSelect?: (file: FileItem) => void;
  selectedPath?: string;
  className?: string;
}

export function FolderNavigator({
  files,
  currentPath,
  onNavigate,
  onFileSelect,
  selectedPath,
  className = ''
}: FolderNavigatorProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set([currentPath])
  );

  // Construir árvore hierárquica
  const buildTree = (): FileItem[] => {
    const tree: FileItem[] = [];
    const itemMap = new Map<string, FileItem>();

    // Primeiro, criar mapa de todos os itens
    files.forEach(file => {
      itemMap.set(file.path, { ...file, children: [] });
    });

    // Depois, construir hierarquia
    files.forEach(file => {
      const item = itemMap.get(file.path);
      if (!item) return;

      if (file.parent && file.parent !== '/') {
        const parent = itemMap.get(file.parent);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(item);
        } else {
          tree.push(item);
        }
      } else {
        tree.push(item);
      }
    });

    return tree.sort((a, b) => {
      if (a.type === 'folder' && b.type !== 'folder') return -1;
      if (a.type !== 'folder' && b.type === 'folder') return 1;
      return a.name.localeCompare(b.name);
    });
  };

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const handleFolderClick = (folder: FileItem) => {
    toggleFolder(folder.path);
    onNavigate(folder.path);
  };

  const handleFileClick = (file: FileItem) => {
    if (onFileSelect) {
      onFileSelect(file);
    }
  };

  const TreeNode = ({ item, level = 0 }: { item: FileItem; level?: number }) => {
    const isExpanded = expandedFolders.has(item.path);
    const isSelected = selectedPath === item.path;
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div>
        <div
          className={`
            flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer
            transition-colors hover:bg-gray-100
            ${isSelected ? 'bg-indigo-100 border-l-2 border-indigo-500' : ''}
          `}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => {
            if (item.type === 'folder') {
              handleFolderClick(item);
            } else {
              handleFileClick(item);
            }
          }}
        >
          {/* Expand/Collapse Icon */}
          {item.type === 'folder' && hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFolder(item.path);
              }}
              className="p-0 w-4 h-4 flex items-center justify-center"
              aria-label={isExpanded ? 'Colapsar pasta' : 'Expandir pasta'}
            >
              {isExpanded ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </button>
          )}

          {/* Spacer for items without expand button */}
          {(item.type === 'file' || !hasChildren) && (
            <div className="w-4" />
          )}

          {/* Folder/File Icon */}
          {item.type === 'folder' ? (
            isExpanded ? (
              <FolderOpen className="w-4 h-4 text-blue-500 flex-shrink-0" />
            ) : (
              <Folder className="w-4 h-4 text-blue-500 flex-shrink-0" />
            )
          ) : (
            <File className="w-4 h-4 text-gray-500 flex-shrink-0" />
          )}

          {/* Name */}
          <span className="flex-1 truncate text-sm">
            {item.name}
          </span>

          {/* Count badge for folders */}
          {item.type === 'folder' && hasChildren && (
            <Badge variant="secondary" className="text-xs">
              {item.children!.length}
            </Badge>
          )}
        </div>

        {/* Children */}
        {item.type === 'folder' && isExpanded && hasChildren && (
          <div>
            {item.children!.map((child) => (
              <TreeNode key={child.id} item={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  const tree = buildTree();

  return (
    <div className={`border rounded-lg bg-white ${className}`}>
      <div className="p-3 border-b bg-gray-50">
        <div className="flex items-center gap-2">
          <Folder className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium">Navegação de Pastas</span>
        </div>
      </div>

      <ScrollArea className="h-[400px]">
        <div className="p-2">
          {tree.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              <Folder className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>Nenhuma pasta encontrada</p>
            </div>
          ) : (
            tree.map((item) => <TreeNode key={item.id} item={item} />)
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
