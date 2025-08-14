import React, { useState, useRef, useEffect } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Digite o texto...",
  rows = 4,
  className = ""
}) => {
  const [isToolbarVisible, setIsToolbarVisible] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const applyFormat = (format: string) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const beforeText = value.substring(0, start);
    const afterText = value.substring(end);

    let formattedText = '';
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'underline':
        formattedText = `__${selectedText}__`;
        break;
      case 'newline':
        formattedText = selectedText + '\n';
        break;
      default:
        formattedText = selectedText;
    }

    const newValue = beforeText + formattedText + afterText;
    onChange(newValue);

    // Restaurar foco e seleção
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(
          start + (format === 'newline' ? selectedText.length + 1 : 2),
          start + formattedText.length - (format === 'newline' ? 0 : 2)
        );
      }
    }, 0);
  };

  const formatText = (text: string): string => {
    // Converter markdown para HTML para exibição
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/__(.*?)__/g, '<u>$1</u>')
      .replace(/\n/g, '<br>');
  };

  const renderPreview = () => {
    if (!value) return null;
    
    return (
      <div className="mt-2 p-3 bg-[#1b1b1b] border border-[#333333] rounded-lg">
        <div className="text-sm text-[#f2f2f2]/70 mb-2">Prévia:</div>
        <div 
          className="text-[#f2f2f2] prose prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: formatText(value) }}
        />
      </div>
    );
  };

  return (
    <div className="relative">
      {/* Toolbar */}
      <div className="mb-2 flex gap-1">
        <button
          type="button"
          onClick={() => applyFormat('bold')}
          className="px-3 py-1 bg-[#333333] hover:bg-[#444444] text-[#f2f2f2] rounded text-sm font-bold transition-colors"
          title="Negrito (Ctrl+B)"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => applyFormat('italic')}
          className="px-3 py-1 bg-[#333333] hover:bg-[#444444] text-[#f2f2f2] rounded text-sm italic transition-colors"
          title="Itálico (Ctrl+I)"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => applyFormat('underline')}
          className="px-3 py-1 bg-[#333333] hover:bg-[#444444] text-[#f2f2f2] rounded text-sm underline transition-colors"
          title="Sublinhado (Ctrl+U)"
        >
          U
        </button>
        <button
          type="button"
          onClick={() => applyFormat('newline')}
          className="px-3 py-1 bg-[#333333] hover:bg-[#444444] text-[#f2f2f2] rounded text-sm transition-colors"
          title="Quebra de linha"
        >
          ↵
        </button>
      </div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className={`w-full bg-[#1b1b1b] border border-[#333333] rounded-lg px-4 py-2 text-[#f2f2f2] focus:border-[#8b0000] focus:outline-none font-mono text-sm ${className}`}
        placeholder={placeholder}
        onKeyDown={(e) => {
          // Atalhos de teclado
          if (e.ctrlKey || e.metaKey) {
            switch (e.key.toLowerCase()) {
              case 'b':
                e.preventDefault();
                applyFormat('bold');
                break;
              case 'i':
                e.preventDefault();
                applyFormat('italic');
                break;
              case 'u':
                e.preventDefault();
                applyFormat('underline');
                break;
            }
          }
        }}
      />

      {/* Preview */}
      {value && renderPreview()}
    </div>
  );
};

export default RichTextEditor;
