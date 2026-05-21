"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface ImageModalProps {
  open: boolean;
  onClose: () => void;
  url: string;
  alt?: string;
}

export function ImageModal({
  open,
  onClose,
  url,
  alt = "scene illustration",
}: ImageModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = originalOverflow;
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Imagen ampliada"
      onClick={onClose}
      className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-150"
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-label="Cerrar imagen"
        className="absolute top-4 right-4 z-10 size-10 rounded-full bg-background/80 hover:bg-background flex items-center justify-center transition-colors text-foreground"
      >
        <X className="size-5" />
      </button>

      <img
        src={url}
        alt={alt}
        onClick={(e) => e.stopPropagation()}
        className="max-w-full max-h-full object-contain rounded-md shadow-2xl select-none"
        draggable={false}
      />
    </div>,
    document.body
  );
}
