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
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [suggestionPosition, setSuggestionPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    // Atualiza o código quando o valor externo mudar (sem formatar automaticamente)
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
    
    // Verificar se deve mostrar sugestões de tags HTML
    const cursorPos = e.target.selectionStart;
    const textBeforeCursor = newValue.substring(0, cursorPos);
    const match = textBeforeCursor.match(/<([a-zA-Z]*)$/);
    
    if (match) {
      const partial = match[1].toLowerCase();
      const htmlTags = [
        'div', 'span', 'p', 'a', 'img', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li', 'table', 'tr', 'td', 'th', 'thead', 'tbody',
        'header', 'footer', 'nav', 'section', 'article', 'aside', 'main',
        'form', 'input', 'button', 'textarea', 'select', 'option', 'label',
        'video', 'audio', 'source', 'canvas', 'svg', 'iframe', 'script', 'style',
        'meta', 'link', 'title', 'br', 'hr', 'strong', 'em', 'code', 'pre'
      ];
      
      const filtered = htmlTags.filter(tag => tag.startsWith(partial));
      
      if (filtered.length > 0) {
        setSuggestions(filtered);
        setSuggestionIndex(0);
        setShowSuggestions(true);
        
        // Calcular posição das sugestões
        if (textareaRef.current) {
          const lines = textBeforeCursor.split('\n');
          const currentLine = lines.length;
          const currentCol = lines[lines.length - 1].length;
          setSuggestionPosition({
            top: currentLine * 21, // 21px é aproximadamente a altura da linha
            left: 60 + currentCol * 7.2 // 60px é a largura dos números de linha + padding
          });
        }
      } else {
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (preRef.current) {
      preRef.current.scrollTop = e.currentTarget.scrollTop;
      preRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  };

  const acceptSuggestion = () => {
    if (!showSuggestions || suggestions.length === 0 || !textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = code.substring(0, cursorPos);
    const match = textBeforeCursor.match(/<([a-zA-Z]*)$/);
    
    if (match) {
      const partial = match[1];
      const suggestion = suggestions[suggestionIndex];
      const newValue = code.substring(0, cursorPos - partial.length) + suggestion + code.substring(cursorPos);
      setCode(newValue);
      setShowSuggestions(false);
      
      setTimeout(() => {
        const newPos = cursorPos - partial.length + suggestion.length;
        textarea.selectionStart = textarea.selectionEnd = newPos;
        textarea.focus();
      }, 0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    
    // Navegação nas sugestões
    if (showSuggestions) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSuggestionIndex(prev => (prev + 1) % suggestions.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSuggestionIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
        return;
      }
      if (e.key === 'Tab' || e.key === 'Enter') {
        e.preventDefault();
        acceptSuggestion();
        return;
      }
      if (e.key === 'Escape') {
        setShowSuggestions(false);
        return;
      }
    }
    
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
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
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
          <span className="text-xs text-gray-500 mr-2">
            💡 Digite &lt; para ver sugestões de tags | Tab/Enter para aceitar | ↑↓ para navegar
          </span>
          <span className="text-xs text-gray-600">
            {code.split('\n').length} linhas | {code.length} caracteres
          </span>
        </div>

        {/* Editor */}
        <div className="flex-1 overflow-hidden relative bg-[#1e1e1e]">
          {/* Sugestões de autocomplete */}
          {showSuggestions && suggestions.length > 0 && (
            <div 
              className="absolute z-10 bg-[#252526] border border-gray-600 rounded shadow-lg"
              style={{
                top: `${suggestionPosition.top}px`,
                left: `${suggestionPosition.left}px`,
                maxHeight: '200px',
                overflowY: 'auto'
              }}
            >
              {suggestions.map((suggestion, index) => (
                <div
                  key={suggestion}
                  className={`px-3 py-1 cursor-pointer text-sm ${
                    index === suggestionIndex 
                      ? 'bg-indigo-600 text-white' 
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                  onClick={() => {
                    setSuggestionIndex(index);
                    acceptSuggestion();
                  }}
                  style={{ fontFamily: 'Monaco, Menlo, "Courier New", monospace' }}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
          
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
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  overflowWrap: 'anywhere'
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
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  overflowWrap: 'anywhere'
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
