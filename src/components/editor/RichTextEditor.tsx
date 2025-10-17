import { useEffect, useRef, useState } from 'react';
import { Code2, Sparkles } from 'lucide-react';
import { HTMLCodeEditor } from './HTMLCodeEditor';
import { TextSuggestions } from './TextSuggestions';
import { AISelector } from '../ai/AISelector';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isUpdatingRef = useRef(false);
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showAISelector, setShowAISelector] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const [editorText, setEditorText] = useState('');

  useEffect(() => {
    if (editorRef.current && !isUpdatingRef.current) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      isUpdatingRef.current = true;
      const html = editorRef.current.innerHTML;
      onChange(html);
      
      // Atualiza o texto para sugestões
      setEditorText(editorRef.current.textContent || '');
      
      // Obtém posição do cursor
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(editorRef.current);
        preCaretRange.setEnd(range.endContainer, range.endOffset);
        setCursorPosition(preCaretRange.toString().length);
      }
      
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 0);
    }
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  const handleAcceptSuggestion = (suggestionText: string) => {
    if (!editorRef.current) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    
    // Remove a última palavra parcial
    const textNode = range.startContainer;
    if (textNode.nodeType === Node.TEXT_NODE && textNode.textContent) {
      const textBefore = textNode.textContent.substring(0, range.startOffset);
      const words = textBefore.split(/\s+/);
      const lastWord = words[words.length - 1] || '';
      
      if (lastWord) {
        range.setStart(textNode, range.startOffset - lastWord.length);
      }
    }
    
    // Insere a sugestão
    range.deleteContents();
    const textNodeToInsert = document.createTextNode(suggestionText + ' ');
    range.insertNode(textNodeToInsert);
    
    // Move o cursor para o final
    range.setStartAfter(textNodeToInsert);
    range.setEndAfter(textNodeToInsert);
    selection.removeAllRanges();
    selection.addRange(range);
    
    handleInput();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Ctrl+M para ativar/desativar sugestões
    if (e.ctrlKey && e.key === 'm') {
      e.preventDefault();
      setShowSuggestions(prev => !prev);
    }
  };

  const handleOpenAI = () => {
    // Capturar texto selecionado
    const selection = window.getSelection();
    const selected = selection?.toString() || '';
    setSelectedText(selected);
    setShowAISelector(true);
  };

  const handleInsertAIText = (text: string) => {
    if (!editorRef.current) return;

    const selection = window.getSelection();
    if (!selection) return;

    // Se há texto selecionado, substituir. Caso contrário, inserir na posição do cursor
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      
      // Inserir novo conteúdo
      const div = document.createElement('div');
      div.innerHTML = text;
      const fragment = document.createDocumentFragment();
      let node;
      while ((node = div.firstChild)) {
        fragment.appendChild(node);
      }
      range.insertNode(fragment);
      
      // Move o cursor para o final do texto inserido
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
      
      handleInput();
    }
  };

  return (
    <>
      {showCodeEditor && (
        <HTMLCodeEditor
          value={value}
          onChange={onChange}
          onClose={() => setShowCodeEditor(false)}
        />
      )}
      
      <AISelector
        open={showAISelector}
        onClose={() => setShowAISelector(false)}
        onInsert={handleInsertAIText}
        selectedText={selectedText}
      />
      
      <div className="border border-gray-300 rounded-md overflow-hidden bg-white">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50 border-b border-gray-300">
        {/* Formatação de texto */}
        <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
          <button
            type="button"
            onClick={() => execCommand('bold')}
            className="p-1.5 hover:bg-gray-200 rounded text-sm"
            title="Negrito"
          >
            <strong>B</strong>
          </button>
          <button
            type="button"
            onClick={() => execCommand('italic')}
            className="p-1.5 hover:bg-gray-200 rounded text-sm"
            title="Itálico"
          >
            <em>I</em>
          </button>
          <button
            type="button"
            onClick={() => execCommand('underline')}
            className="p-1.5 hover:bg-gray-200 rounded text-sm"
            title="Sublinhado"
          >
            <u>U</u>
          </button>
        </div>

        {/* Alinhamento */}
        <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
          <button
            type="button"
            onClick={() => execCommand('justifyLeft')}
            className="p-1.5 hover:bg-gray-200 rounded text-xs"
            title="Alinhar à esquerda"
          >
            ≡
          </button>
          <button
            type="button"
            onClick={() => execCommand('justifyCenter')}
            className="p-1.5 hover:bg-gray-200 rounded text-xs"
            title="Centralizar"
          >
            ≣
          </button>
          <button
            type="button"
            onClick={() => execCommand('justifyRight')}
            className="p-1.5 hover:bg-gray-200 rounded text-xs"
            title="Alinhar à direita"
          >
            ≡
          </button>
        </div>

        {/* Listas */}
        <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
          <button
            type="button"
            onClick={() => execCommand('insertUnorderedList')}
            className="p-1.5 hover:bg-gray-200 rounded text-xs"
            title="Lista com marcadores"
          >
            ≣
          </button>
          <button
            type="button"
            onClick={() => execCommand('insertOrderedList')}
            className="p-1.5 hover:bg-gray-200 rounded text-xs"
            title="Lista numerada"
          >
            ≣
          </button>
        </div>

        {/* Links */}
        <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
          <button
            type="button"
            onClick={() => {
              const url = prompt('Digite a URL:');
              if (url) execCommand('createLink', url);
            }}
            className="p-1.5 hover:bg-gray-200 rounded text-xs"
            title="Inserir link"
          >
            🔗
          </button>
        </div>

        {/* Ferramentas avançadas */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setShowCodeEditor(true)}
            className="p-1.5 hover:bg-gray-200 rounded flex items-center gap-1 text-xs"
            title="Editor de Código HTML"
          >
            <Code2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">HTML</span>
          </button>
          
          <button
            type="button"
            onClick={handleOpenAI}
            className="p-1.5 rounded flex items-center gap-1 text-xs transition-colors hover:bg-purple-100 hover:text-purple-700"
            title="Assistente de IA"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">IA</span>
          </button>
          
          <button
            type="button"
            onClick={() => setShowSuggestions(prev => !prev)}
            className={`p-1.5 rounded flex items-center gap-1 text-xs transition-colors ${
              showSuggestions 
                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                : 'hover:bg-gray-200'
            }`}
            title="Sugestões Automáticas (Ctrl+M)"
          >
            💡
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="relative">
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          className="min-h-[200px] p-3 focus:outline-none text-sm"
          style={{ 
            lineHeight: '1.6',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}
        />
        
        {/* Sugestões inteligentes */}
        {showSuggestions && (
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <TextSuggestions
              currentText={editorText}
              cursorPosition={cursorPosition}
              onAcceptSuggestion={handleAcceptSuggestion}
            />
          </div>
        )}
      </div>
      
      {/* Dica de atalho */}
      {showSuggestions && (
        <div className="px-3 py-2 bg-blue-50 border-t border-blue-200 text-xs text-blue-700 flex items-center gap-2">
          💡
          <span>Sugestões automáticas ativadas • Ctrl+M para desativar • Continue digitando para ver sugestões</span>
        </div>
      )}
    </div>
    </>
  );
}
