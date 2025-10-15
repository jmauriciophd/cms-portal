import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  path?: string;
  onClick?: () => void;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center gap-2 text-sm ${className}`}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const isFirst = index === 0;

        return (
          <div key={index} className="flex items-center gap-2">
            {index > 0 && (
              <ChevronRight className="w-4 h-4 text-gray-400" aria-hidden="true" />
            )}
            
            {isLast ? (
              <span
                className="text-gray-900 font-medium"
                aria-current="page"
              >
                {isFirst && <Home className="w-4 h-4 inline mr-1" aria-hidden="true" />}
                {item.label}
              </span>
            ) : (
              <button
                type="button"
                className="h-auto p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                onClick={item.onClick}
              >
                {isFirst && <Home className="w-4 h-4 inline mr-1" aria-hidden="true" />}
                {item.label}
              </button>
            )}
          </div>
        );
      })}
    </nav>
  );
}
