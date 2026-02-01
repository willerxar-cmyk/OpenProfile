'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu, FloatingMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { Button } from '@/components/ui/button';
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  Heading1, 
  Heading2, 
  Heading3, 
  List, 
  ListOrdered, 
  Quote, 
  Code, 
  Link as LinkIcon,
  Image as ImageIcon,
  Undo,
  Redo,
  SeparatorHorizontal
} from 'lucide-react';
import { useCallback, useState } from 'react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/contexts/I18nContext';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({ 
  content, 
  onChange, 
  placeholder,
  className 
}: RichTextEditorProps) {
  const { t } = useI18n();
  const [isUploading, setIsUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Image.configure({
        inline: true,
        allowBase64: false,
      }),
      Link.configure({
        openOnClick: false,
        linkOnPaste: true,
      }),
      Placeholder.configure({
        placeholder: placeholder || t('editor.placeholder') || 'Comece a escrever...',
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const handleImageUpload = useCallback(async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file || !editor) return;

      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'blog');

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) throw new Error('Upload failed');
        
        const data = await response.json();
        editor.chain().focus().setImage({ src: data.url }).run();
      } catch (error) {
        console.error('Image upload failed:', error);
        alert('Failed to upload image');
      } finally {
        setIsUploading(false);
      }
    };

    input.click();
  }, [editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  if (!editor) {
    return null;
  }

  const ToolbarButton = ({ 
    onClick, 
    active, 
    disabled, 
    icon: Icon,
    title,
  }: { 
    onClick: () => void; 
    active?: boolean; 
    disabled?: boolean;
    icon: React.ElementType;
    title?: string;
  }) => (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'h-8 w-8 p-0',
        active && 'bg-primary/10 text-primary'
      )}
      title={title}
    >
      <Icon className="w-4 h-4" />
    </Button>
  );

  return (
    <div className={cn('border rounded-lg overflow-hidden bg-background', className)}>
      {/* Toolbar */}
      <div className="border-b p-2 flex flex-wrap items-center gap-1 bg-muted/50">
        <div className="flex items-center gap-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            icon={Undo}
            title={t('editor.undo') || 'Desfazer'}
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            icon={Redo}
            title={t('editor.redo') || 'Refazer'}
          />
        </div>

        <div className="w-px h-6 bg-border mx-1" />

        <div className="flex items-center gap-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            active={editor.isActive('heading', { level: 1 })}
            icon={Heading1}
            title={t('editor.heading1') || 'Título 1'}
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive('heading', { level: 2 })}
            icon={Heading2}
            title={t('editor.heading2') || 'Título 2'}
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            active={editor.isActive('heading', { level: 3 })}
            icon={Heading3}
            title={t('editor.heading3') || 'Título 3'}
          />
        </div>

        <div className="w-px h-6 bg-border mx-1" />

        <div className="flex items-center gap-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive('bold')}
            icon={Bold}
            title={t('editor.bold') || 'Negrito'}
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')}
            icon={Italic}
            title={t('editor.italic') || 'Itálico'}
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            active={editor.isActive('strike')}
            icon={Strikethrough}
            title={t('editor.strike') || 'Tachado'}
          />
        </div>

        <div className="w-px h-6 bg-border mx-1" />

        <div className="flex items-center gap-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive('bulletList')}
            icon={List}
            title={t('editor.bulletList') || 'Lista'}
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive('orderedList')}
            icon={ListOrdered}
            title={t('editor.orderedList') || 'Lista numerada'}
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive('blockquote')}
            icon={Quote}
            title={t('editor.blockquote') || 'Citação'}
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            active={editor.isActive('codeBlock')}
            icon={Code}
            title={t('editor.code') || 'Código'}
          />
        </div>

        <div className="w-px h-6 bg-border mx-1" />

        <div className="flex items-center gap-1">
          <ToolbarButton
            onClick={setLink}
            active={editor.isActive('link')}
            icon={LinkIcon}
            title={t('editor.link') || 'Link'}
          />
          <ToolbarButton
            onClick={handleImageUpload}
            disabled={isUploading}
            icon={ImageIcon}
            title={t('editor.image') || 'Imagem'}
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            icon={SeparatorHorizontal}
            title={t('editor.divider') || 'Divisor'}
          />
        </div>
      </div>

      {/* Editor Content */}
      <EditorContent 
        editor={editor} 
        className="prose prose-sm max-w-none p-4 min-h-[300px] focus:outline-none"
      />

      {/* Bubble Menu (floating toolbar on selection) */}
      {editor && (
        <BubbleMenu editor={editor}>
          <div className="flex items-center gap-1 bg-background border shadow-lg rounded-lg p-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              active={editor.isActive('bold')}
              icon={Bold}
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              active={editor.isActive('italic')}
              icon={Italic}
            />
            <ToolbarButton
              onClick={setLink}
              active={editor.isActive('link')}
              icon={LinkIcon}
            />
          </div>
        </BubbleMenu>
      )}

      {/* Floating Menu (on empty lines) */}
      {editor && (
        <FloatingMenu editor={editor}>
          <div className="flex items-center gap-1 bg-background border shadow-lg rounded-lg p-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              icon={Heading1}
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              icon={List}
            />
            <ToolbarButton
              onClick={handleImageUpload}
              disabled={isUploading}
              icon={ImageIcon}
            />
          </div>
        </FloatingMenu>
      )}
    </div>
  );
}
