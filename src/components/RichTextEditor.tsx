'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Lightweight HTML rich text editor with formatting toolbar.
 * No external dependencies. Uses document.execCommand which is deprecated but
 * works reliably in all modern browsers for simple content editing needs.
 */
export function RichTextEditor({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [hasFocus, setHasFocus] = useState(false);

  // Set initial content only once / when value changes externally.
  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value || '';
    }
  }, [value]);

  const exec = useCallback((cmd: string, arg?: string) => {
    document.execCommand(cmd, false, arg);
    if (ref.current) onChange(ref.current.innerHTML);
    ref.current?.focus();
  }, [onChange]);

  function onInput() {
    if (!ref.current) return;
    onChange(ref.current.innerHTML);
  }

  function insertLink() {
    const url = prompt('Enter URL:');
    if (!url) return;
    exec('createLink', url);
  }

  function clearFormatting() {
    exec('removeFormat');
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02]">
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-2 py-2 border-b border-white/10 flex-wrap">
        <ToolBtn onClick={() => exec('bold')} title="Bold (Ctrl+B)"><b>B</b></ToolBtn>
        <ToolBtn onClick={() => exec('italic')} title="Italic (Ctrl+I)"><i>I</i></ToolBtn>
        <ToolBtn onClick={() => exec('underline')} title="Underline"><span className="underline">U</span></ToolBtn>
        <ToolBtn onClick={() => exec('strikeThrough')} title="Strikethrough"><span className="line-through">S</span></ToolBtn>
        <Divider />
        <ToolBtn onClick={() => exec('formatBlock', 'h2')} title="Heading 2">H2</ToolBtn>
        <ToolBtn onClick={() => exec('formatBlock', 'h3')} title="Heading 3">H3</ToolBtn>
        <ToolBtn onClick={() => exec('formatBlock', 'p')} title="Paragraph">P</ToolBtn>
        <ToolBtn onClick={() => exec('formatBlock', 'blockquote')} title="Quote">&ldquo;</ToolBtn>
        <Divider />
        <ToolBtn onClick={() => exec('insertUnorderedList')} title="Bulleted list">• List</ToolBtn>
        <ToolBtn onClick={() => exec('insertOrderedList')} title="Numbered list">1. List</ToolBtn>
        <Divider />
        <ToolBtn onClick={insertLink} title="Insert link">🔗</ToolBtn>
        <ToolBtn onClick={() => exec('unlink')} title="Remove link">⊘</ToolBtn>
        <Divider />
        <ToolBtn onClick={() => exec('justifyLeft')} title="Align left">⫷</ToolBtn>
        <ToolBtn onClick={() => exec('justifyCenter')} title="Align center">≡</ToolBtn>
        <ToolBtn onClick={() => exec('justifyRight')} title="Align right">⫸</ToolBtn>
        <Divider />
        <ToolBtn onClick={clearFormatting} title="Clear formatting">Aa</ToolBtn>
      </div>

      {/* Content area */}
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={onInput}
        onFocus={() => setHasFocus(true)}
        onBlur={() => setHasFocus(false)}
        data-placeholder={placeholder || 'Start writing…'}
        className={`min-h-[220px] px-4 py-3 prose-content focus:outline-none ${hasFocus ? 'ring-1 ring-inset ring-neon-magenta/30' : ''}`}
        style={{
          color: '#F5F5F5',
          lineHeight: 1.7,
        }}
      />

      <style jsx>{`
        [contenteditable]:empty::before {
          content: attr(data-placeholder);
          color: rgba(255, 255, 255, 0.35);
          pointer-events: none;
        }
        :global(.prose-content h2) {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 1rem 0 0.5rem;
        }
        :global(.prose-content h3) {
          font-size: 1.2rem;
          font-weight: 600;
          margin: 0.875rem 0 0.5rem;
        }
        :global(.prose-content p) {
          margin: 0.5rem 0;
        }
        :global(.prose-content ul) {
          list-style: disc;
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }
        :global(.prose-content ol) {
          list-style: decimal;
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }
        :global(.prose-content blockquote) {
          border-left: 3px solid rgba(255, 60, 130, 0.4);
          padding-left: 1rem;
          margin: 0.75rem 0;
          color: rgba(255, 255, 255, 0.7);
          font-style: italic;
        }
        :global(.prose-content a) {
          color: #D92EFF;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}

function ToolBtn({ onClick, title, children }: { onClick: () => void; title: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      title={title}
      className="px-2.5 py-1 rounded-md text-xs text-ink-muted hover:text-ink hover:bg-white/10 transition-colors min-w-[28px]"
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="w-px h-5 bg-white/10 mx-1" />;
}
