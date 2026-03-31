"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { cn } from "@/lib/utils";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
} from "lucide-react";

type Props = {
  initialContent?: string;
  onChange?: (html: string) => void;
};

type ToolbarButtonProps = {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
};

function ToolbarButton({ onClick, active, disabled, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "p-2 rounded transition-colors",
        active
          ? "bg-primary text-on-primary-fixed"
          : "text-on-surface/60 hover:bg-surface-container hover:text-on-surface"
      )}
    >
      {children}
    </button>
  );
}

export function BlogPostEditor({ initialContent = "", onChange }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  if (!editor) return null;

  const addImage = () => {
    const url = window.prompt("Enter image URL:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL:", previousUrl);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className="border border-outline-variant rounded-lg overflow-hidden bg-surface-container-low">
      <div className="flex flex-wrap gap-1 p-2 border-b border-outline-variant bg-surface">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
        >
          <Bold size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
        >
          <Italic size={18} />
        </ToolbarButton>
        <div className="w-px h-6 bg-outline-variant mx-1 self-center" />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive("heading", { level: 2 })}
        >
          <Heading2 size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive("heading", { level: 3 })}
        >
          <Heading3 size={18} />
        </ToolbarButton>
        <div className="w-px h-6 bg-outline-variant mx-1 self-center" />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
        >
          <List size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
        >
          <ListOrdered size={18} />
        </ToolbarButton>
        <div className="w-px h-6 bg-outline-variant mx-1 self-center" />
        <ToolbarButton
          onClick={setLink}
          active={editor.isActive("link")}
        >
          <LinkIcon size={18} />
        </ToolbarButton>
        <ToolbarButton onClick={addImage}>
          <ImageIcon size={18} />
        </ToolbarButton>
      </div>
      <EditorContent
        editor={editor}
        className="prose prose-invert max-w-none p-4 min-h-[300px] focus:outline-none"
      />
    </div>
  );
}
