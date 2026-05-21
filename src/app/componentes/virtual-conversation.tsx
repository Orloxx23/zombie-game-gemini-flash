"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { ArrowDownIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { GameMessage } from "@/lib/types";

interface VirtualConversationProps {
  messages: GameMessage[];
  renderMessage: (message: GameMessage, index: number) => ReactNode;
  /** Class applied to the scroll container — typically padding-bottom to reserve space for fixed bottom UI. */
  scrollAreaClassName?: string;
  scrollButtonClassName?: string;
}

export function VirtualConversation({
  messages,
  renderMessage,
  scrollAreaClassName,
  scrollButtonClassName,
}: VirtualConversationProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const wasAtBottomRef = useRef(true);

  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => {
      const msg = messages[index];
      if (!msg) return 200;
      if (msg.role === "user") return 100;
      if (msg.image || msg.imageLoading) return 700;
      return 250;
    },
    overscan: 4,
    getItemKey: (index) => messages[index]?.id ?? index,
  });

  const checkIsAtBottom = useCallback(() => {
    const el = parentRef.current;
    if (!el) return true;
    const threshold = 80;
    return el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
  }, []);

  useEffect(() => {
    const el = parentRef.current;
    if (!el) return;
    const handleScroll = () => {
      const atBottom = checkIsAtBottom();
      setIsAtBottom(atBottom);
      wasAtBottomRef.current = atBottom;
    };
    el.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => el.removeEventListener("scroll", handleScroll);
  }, [checkIsAtBottom]);

  const scrollToBottom = useCallback((smooth = true) => {
    const el = parentRef.current;
    if (!el) return;
    el.scrollTo({
      top: el.scrollHeight,
      behavior: smooth ? "smooth" : "auto",
    });
  }, []);

  // Auto-scroll to bottom when messages change, if the user was at bottom
  useEffect(() => {
    if (wasAtBottomRef.current) {
      const id = requestAnimationFrame(() => scrollToBottom(true));
      return () => cancelAnimationFrame(id);
    }
  }, [messages, scrollToBottom]);

  // Also re-scroll when the virtualizer reports a new total size (image loaded)
  const totalSize = virtualizer.getTotalSize();
  useEffect(() => {
    if (wasAtBottomRef.current) {
      const id = requestAnimationFrame(() => scrollToBottom(false));
      return () => cancelAnimationFrame(id);
    }
  }, [totalSize, scrollToBottom]);

  const items = virtualizer.getVirtualItems();

  return (
    <div className="relative flex-1 overflow-hidden">
      <div
        ref={parentRef}
        role="log"
        className={cn("absolute inset-0 overflow-y-auto", scrollAreaClassName)}
      >
        <div
          className="max-w-xl mx-auto p-4 relative"
          style={{ height: `${totalSize}px` }}
        >
          {items.map((virtualItem) => {
            const message = messages[virtualItem.index];
            if (!message) return null;
            return (
              <div
                key={virtualItem.key}
                ref={virtualizer.measureElement}
                data-index={virtualItem.index}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                {renderMessage(message, virtualItem.index)}
              </div>
            );
          })}
        </div>
      </div>

      {!isAtBottom && (
        <Button
          onClick={() => scrollToBottom(true)}
          size="icon"
          variant="outline"
          type="button"
          className={cn(
            "absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-background/70 backdrop-blur-sm z-20",
            scrollButtonClassName
          )}
          aria-label="Ir al último mensaje"
        >
          <ArrowDownIcon className="size-4" />
        </Button>
      )}
    </div>
  );
}
