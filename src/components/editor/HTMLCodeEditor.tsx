import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/button';

interface HTMLCodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
}

export function HTMLCodeEditor({ value, onChange, onClose }: HTMLCodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const [code, setCode] = useState(value);
  const [lineNumbers, setLineNumbers] = useState<string>('');

  useEffect(() => {
    // Atualiza o código quando o valor externo mudar
    setCode(value);
  }, [value]);

  useEffect(() => {
    // Atualiza números de linha
    const lines = code.split('\n').length;
    setLineNumbers(Array.from({ length: lines }, (_, i) => i + 1).join('\n'));
    
    // Sincroniza scroll do syntax highlighting com textarea
    if (textareaRef.current && preRef.current) {
      preRef.current.scrollTop = textareaRef.current.scrollTop;
      preRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  }, [code]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setCode(newValue);
  };

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (preRef.current) {
      preRef.current.scrollTop = e.currentTarget.scrollTop;
      preRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    
    // Tab para inserir indentação
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = code.substring(0, start) + '  ' + code.substring(end);
      setCode(newValue);
      
      // Restaura posição do cursor
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
    
    // Auto-complete de tags
    if (e.key === '>') {
      const start = textarea.selectionStart;
      const textBefore = code.substring(0, start);
      const tagMatch = textBefore.match(/<([a-zA-Z][a-zA-Z0-9]*)[^>]*$/);
      
      if (tagMatch && !textBefore.endsWith('/>')) {
        const tagName = tagMatch[1];
        const voidTags = ['img', 'br', 'hr', 'input', 'meta', 'link', 'area', 'base', 'col', 'embed', 'param', 'source', 'track', 'wbr'];
        
        if (!voidTags.includes(tagName.toLowerCase())) {
          setTimeout(() => {
            const newValue = code.substring(0, start + 1) + `</${tagName}>` + code.substring(start + 1);
            setCode(newValue);
            textarea.selectionStart = textarea.selectionEnd = start + 1;
          }, 0);
        }
      }
    }
  };

  const applySyntaxHighlighting = (html: string): string => {
    // Primeiro, escapa o HTML original para exibição segura
    let result = html
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
    
    // Aplica coloração sintática
    result = result
      // DOCTYPE
      .replace(/(<!DOCTYPE[^&]*?>)/gi, '<span style="color: #c586c0;">$1</span>')
      // Comentários HTML
      .replace(/(<!--[\s\S]*?-->)/g, '<span style="color: #6a9955; font-style: italic;">$1</span>')
      // Tags de fechamento completas: </tag>
      .replace(/(<\/)([\w-]+)(>)/g, 
        '<span style="color: #808080;">$1</span><span style="color: #4ec9b0;">$2</span><span style="color: #808080;">$3</span>')
      // Tags de abertura e auto-fechamento (processamento mais detalhado)
      .replace(/(<)([\w-]+)((?:\s+[\w-]+(?:=(?:&quot;[^&]*?&quot;|&#039;[^&]*?&#039;|[\w-]+))?)*\s*)(\/?)(>)/g, 
        (match, p1, tagName, attrs, slash, p5) => {
          // Colorir a tag de abertura
          let result = `<span style="color: #808080;">${p1}</span><span style="color: #4ec9b0;">${tagName}</span>`;
          
          // Processar atributos
          if (attrs) {
            attrs = attrs.replace(/([\w-]+)(=)(&quot;[^&]*?&quot;|&#039;[^&]*?&#039;|[\w-]+)/g, 
              (m, attrName, eq, value) => {
                let coloredValue = value;
                if (value.startsWith('&quot;') || value.startsWith('&#039;')) {
                  coloredValue = `<span style="color: #ce9178;">${value}</span>`;
                }
                return `<span style="color: #9cdcfe;">${attrName}</span><span style="color: #d4d4d4;">${eq}</span>${coloredValue}`;
              }
            );
            result += attrs;
          }
          
          // Adicionar slash e fechamento
          if (slash) {
            result += `<span style="color: #808080;">${slash}</span>`;
          }
          result += `<span style="color: #808080;">${p5}</span>`;
          
          return result;
        });
    
    return result;
  };

  const handleApply = () => {
    onChange(code);
    onClose();
  };

  const formatCode = () => {
    const formatted = formatHTML(code);
    setCode(formatted);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-lg">Editor de Código HTML</h2>
            <p className="text-sm text-gray-600 mt-1">
              Edite o HTML diretamente com syntax highlighting
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 p-3 bg-gray-50 border-b">
          <Button variant="outline" size="sm" onClick={formatCode}>
            Formatar Código
          </Button>
          <div className="flex-1" />
          <span className="text-xs text-gray-600">
            {code.split('\n').length} linhas | {code.length} caracteres
          </span>
        </div>

        {/* Editor */}
        <div className="flex-1 overflow-hidden relative bg-[#1e1e1e]">
          <div className="absolute inset-0 flex">
            {/* Line numbers */}
            <pre className="bg-[#252526] text-gray-500 text-right py-4 pr-3 pl-4 text-sm select-none overflow-hidden border-r border-gray-700"
                 style={{ 
                   fontFamily: 'Monaco, Menlo, "Courier New", monospace',
                   lineHeight: '1.5',
                   userSelect: 'none',
                   minWidth: '50px'
                 }}>
              {lineNumbers}
            </pre>

            {/* Code container */}
            <div className="flex-1 relative overflow-hidden">
              {/* Syntax highlighted background */}
              <pre
                ref={preRef}
                className="absolute inset-0 py-4 px-4 text-sm overflow-auto pointer-events-none"
                style={{ 
                  fontFamily: 'Monaco, Menlo, "Courier New", monospace',
                  lineHeight: '1.5',
                  color: '#d4d4d4',
                  whiteSpace: 'pre',
                  overflowWrap: 'normal'
                }}
                dangerouslySetInnerHTML={{ 
                  __html: applySyntaxHighlighting(code)
                }}
              />

              {/* Actual textarea */}
              <textarea
                ref={textareaRef}
                value={code}
                onChange={handleChange}
                onScroll={handleScroll}
                onKeyDown={handleKeyDown}
                className="absolute inset-0 py-4 px-4 text-sm bg-transparent text-transparent caret-white resize-none outline-none overflow-auto"
                style={{ 
                  fontFamily: 'Monaco, Menlo, "Courier New", monospace',
                  lineHeight: '1.5',
                  caretColor: 'white',
                  whiteSpace: 'pre',
                  overflowWrap: 'normal'
                }}
                spellCheck={false}
                autoComplete="off"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleApply}>
            Aplicar Alterações
          </Button>
        </div>
      </div>
    </div>
  );
}

// Função auxiliar para formatar HTML
function formatHTML(html: string): string {
  let formatted = '';
  let indent = 0;
  const tab = '  ';

  // Remove espaços extras
  html = html.replace(/>\s+</g, '><').trim();

  // Tags que não precisam de quebra de linha
  const inlineTags = ['span', 'a', 'strong', 'em', 'b', 'i', 'u', 'small', 'code'];
  
  // Tags auto-fechadas
  const voidTags = ['img', 'br', 'hr', 'input', 'meta', 'link', 'area', 'base', 'col', 'embed', 'param', 'source', 'track', 'wbr'];

  let i = 0;
  while (i < html.length) {
    if (html[i] === '<') {
      let tagEnd = html.indexOf('>', i);
      if (tagEnd === -1) tagEnd = html.length;
      
      const tag = html.substring(i, tagEnd + 1);
      const tagName = tag.match(/<\/?([a-zA-Z][a-zA-Z0-9]*)/)?.[1] || '';
      const isClosing = tag.startsWith('</');
      const isSelfClosing = tag.endsWith('/>') || voidTags.includes(tagName.toLowerCase());
      const isInline = inlineTags.includes(tagName.toLowerCase());

      if (isClosing) {
        indent = Math.max(0, indent - 1);
      }

      if (!isInline && formatted.length > 0 && !formatted.endsWith('\n')) {
        formatted += '\n';
      }

      if (!isInline) {
        formatted += tab.repeat(indent);
      }

      formatted += tag;

      if (!isClosing && !isSelfClosing && !isInline) {
        indent++;
      }

      if (!isInline) {
        formatted += '\n';
      }

      i = tagEnd + 1;
    } else {
      // Texto entre tags
      let nextTag = html.indexOf('<', i);
      if (nextTag === -1) nextTag = html.length;
      
      const text = html.substring(i, nextTag).trim();
      if (text) {
        if (formatted.endsWith('\n')) {
          formatted += tab.repeat(indent);
        }
        formatted += text;
      }
      
      i = nextTag;
    }
  }

  return formatted.trim();
}
