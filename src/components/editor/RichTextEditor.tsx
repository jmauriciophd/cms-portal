import { useEffect, useRef } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isUpdatingRef = useRef(false);

  useEffect(() => {
    if (editorRef.current && !isUpdatingRef.current) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      isUpdatingRef.current = true;
      onChange(editorRef.current.innerHTML);
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

  return (
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
        <div className="flex items-center gap-1">
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
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="min-h-[200px] p-3 focus:outline-none text-sm"
        style={{ 
          lineHeight: '1.6',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}
      />
    </div>
  );
}
