"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, Image as ImageIcon, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { adminFetch } from "@/lib/admin-client";

type Props = {
  postId: string;
  value?: string;
  onChange?: (url: string) => void;
};

export function ImageUpload({ postId, value, onChange }: Props) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(value);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setError(null);
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("postId", postId);

      try {
        const res = await adminFetch("/api/upload-image", {
          method: "POST",
          body: formData,
        });
        if (!res.ok) throw new Error("Upload failed");
        const { url } = await res.json();
        setPreview(url);
        onChange?.(url);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Upload failed";
        setError(message);
        console.error("Upload error:", err);
      } finally {
        setUploading(false);
      }
    },
    [postId, onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
    },
    maxFiles: 1,
  });

  const removeImage = () => {
    setPreview(undefined);
    setError(null);
    onChange?.("");
  };

  if (preview) {
    return (
      <div className="relative inline-block">
        <img
          src={preview}
          alt="Preview"
          className="max-w-[200px] max-h-[200px] rounded-lg object-cover"
        />
        <button
          type="button"
          onClick={removeImage}
          className="absolute -top-2 -right-2 p-1 bg-error rounded-full text-white hover:bg-error/80 transition-colors"
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
        isDragActive
          ? "border-primary bg-primary/10"
          : "border-outline-variant hover:border-primary/50 hover:bg-surface-container-low"
      )}
    >
      <input {...getInputProps()} />
      {uploading ? (
        <div className="text-on-surface/60">Uploading...</div>
      ) : (
        <div className="flex flex-col items-center gap-2 text-on-surface/60">
          {isDragActive ? (
            <ImageIcon size={32} className="text-primary" />
          ) : (
            <Upload size={32} />
          )}
          <span className="text-sm">
            {isDragActive ? "Drop image here" : "Drag & drop or click to upload"}
          </span>
        </div>
      )}
      {error && (
        <div className="mt-3 flex items-center justify-center gap-2 text-error text-sm">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
