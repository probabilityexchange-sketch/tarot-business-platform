"use client";

import { useState, useRef, useEffect } from "react";
import { useEditor } from "@tiptap/react";
import { X, Sparkles, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  editor: ReturnType<typeof useEditor>;
  onGenerated?: (html: string) => void;
};

type Tab = "topic" | "text";

export function AIGenerateModal({ editor, onGenerated }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("topic");
  const [topic, setTopic] = useState("");
  const [rawText, setRawText] = useState("");
  const [generating, setGenerating] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const openModal = () => setIsOpen(true);
  const closeModal = () => {
    abortRef.current?.abort();
    setIsOpen(false);
    setTopic("");
    setRawText("");
  };

  const generate = async () => {
    if (!editor) return;
    setGenerating(true);

    const body =
      activeTab === "topic"
        ? { type: "topic", topic }
        : { type: "text", rawText };

    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/generate-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: abortRef.current.signal,
      });

      if (!res.ok) throw new Error("Generation failed");

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No reader available");

      let html = "";
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        html += decoder.decode(value, { stream: true });
        editor.chain().focus().setContent(html).run();
      }

      onGenerated?.(html);
      closeModal();
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) {
        console.error("Generation error:", error);
      }
    } finally {
      setGenerating(false);
    }
  };

  if (!isOpen) {
    return (
      <Button onClick={openModal} variant="secondary" size="sm">
        <Sparkles size={16} className="mr-2" />
        AI Generate
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={closeModal}
      />
      <div className="relative z-10 w-full max-w-lg bg-surface-container-high rounded-xl shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-outline-variant">
          <h2 className="font-display text-lg text-on-surface flex items-center gap-2">
            <Sparkles size={20} className="text-primary" />
            AI Generate Post
          </h2>
          <button
            onClick={closeModal}
            className="p-1 text-on-surface/60 hover:text-on-surface transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex border-b border-outline-variant">
          <button
            onClick={() => setActiveTab("topic")}
            className={cn(
              "flex-1 py-3 text-sm font-label uppercase tracking-wider transition-colors",
              activeTab === "topic"
                ? "text-primary border-b-2 border-primary"
                : "text-on-surface/60 hover:text-on-surface"
            )}
          >
            <div className="flex items-center justify-center gap-2">
              <Sparkles size={14} />
              From Topic
            </div>
          </button>
          <button
            onClick={() => setActiveTab("text")}
            className={cn(
              "flex-1 py-3 text-sm font-label uppercase tracking-wider transition-colors",
              activeTab === "text"
                ? "text-primary border-b-2 border-primary"
                : "text-on-surface/60 hover:text-on-surface"
            )}
          >
            <div className="flex items-center justify-center gap-2">
              <FileText size={14} />
              From Text
            </div>
          </button>
        </div>

        <div className="p-4">
          {activeTab === "topic" ? (
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter a topic or title..."
              className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg text-on-surface placeholder:text-on-surface/40 focus:outline-none focus:border-primary"
            />
          ) : (
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste your notes or raw text here..."
              rows={6}
              className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg text-on-surface placeholder:text-on-surface/40 focus:outline-none focus:border-primary resize-none"
            />
          )}
        </div>

        <div className="flex gap-3 p-4 border-t border-outline-variant">
          <Button variant="secondary" onClick={closeModal} className="flex-1">
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={generate}
            disabled={generating || (activeTab === "topic" ? !topic : !rawText)}
            className="flex-1"
          >
            {generating ? "Generating..." : "Generate"}
          </Button>
        </div>
      </div>
    </div>
  );
}
