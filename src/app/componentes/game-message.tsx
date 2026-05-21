import { Message, MessageContent } from "@/components/message";
import { Response } from "@/components/response";
import { type GameMessage as GameMessageType } from "@/lib/types";
import { UI_MESSAGES } from "@/lib/consts";
import { Loader } from "@/components/loader";
import { memo, useRef, useEffect, useState } from "react";
import { ImageModal } from "./image-modal";

const STAT_META = {
  attraction: { icon: "💖", label: "Atracción" },
  desire: { icon: "🔥", label: "Deseo" },
  tension: { icon: "⚡", label: "Tensión" },
  stamina: { icon: "💪", label: "Resistencia" },
  chemistry: { icon: "✨", label: "Química" },
} as const;

function GameMessageInner({
  message,
  onObserve,
}: {
  message: GameMessageType;
  onObserve?: (element: HTMLElement | null, messageId: string) => void;
}) {
  const { role, content, image, imageLoading, coinsEarned, newDiscoveries, actAdvanced, statChanges } = message;

  const messageRef = useRef<HTMLDivElement>(null);
  const [zoomOpen, setZoomOpen] = useState(false);

  useEffect(() => {
    if (onObserve && messageRef.current) {
      onObserve(messageRef.current, message.id);
    }
  }, [onObserve, message.id]);

  if (role === "assistant" && !content) {
    return (
      <div ref={messageRef} className="flex items-center gap-2 text-sm text-muted-foreground px-2 py-3 opacity-70">
        <Loader />
        <span>{UI_MESSAGES.LOADING.STORY}</span>
      </div>
    );
  }

  return (
    <div ref={messageRef}>
      <Message from={role}>
        <MessageContent>
          {role === "assistant" && (
            <picture className="w-full max-w-2xl aspect-video overflow-hidden rounded-md bg-border">
              {imageLoading && (
                <div className="w-full h-full flex items-center justify-center bg-border animate-pulse">
                  <div className="flex mb-4 space-x-2 opacity-50">
                    <Loader />
                    <span>{UI_MESSAGES.LOADING.IMAGE}</span>
                  </div>
                </div>
              )}

              {image && (
                <button
                  type="button"
                  onClick={() => setZoomOpen(true)}
                  aria-label="Ampliar imagen"
                  className="w-full h-full cursor-zoom-in p-0 m-0 border-0 bg-transparent"
                >
                  <img
                    src={image.url}
                    alt="scene illustration"
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover object-center"
                  />
                </button>
              )}
            </picture>
          )}

          {image && (
            <ImageModal
              open={zoomOpen}
              onClose={() => setZoomOpen(false)}
              url={image.url}
            />
          )}

          <Response>{content}</Response>

          {role === "assistant" && (
            <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
              {coinsEarned && coinsEarned > 0 ? (
                <span className="inline-flex items-center gap-0.5 bg-yellow-500/20 text-yellow-200 px-2 py-0.5 rounded-full text-[10px]">
                  <span>🪙</span>
                  <span>+{coinsEarned}</span>
                </span>
              ) : null}
              {statChanges &&
                (
                  Object.entries(statChanges) as [
                    keyof typeof STAT_META,
                    number
                  ][]
                )
                  .filter(([, v]) => v !== 0 && v !== undefined)
                  .map(([stat, value]) => {
                    const meta = STAT_META[stat];
                    if (!meta) return null;
                    const positive = value > 0;
                    return (
                      <span
                        key={stat}
                        className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] ${
                          positive
                            ? "bg-emerald-500/20 text-emerald-200"
                            : "bg-rose-500/20 text-rose-200"
                        }`}
                      >
                        <span>{meta.icon}</span>
                        <span>
                          {positive ? "+" : ""}
                          {value} {meta.label}
                        </span>
                      </span>
                    );
                  })}
              {actAdvanced && (
                <span className="bg-pink-500/30 text-pink-200 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wide">
                  ⏭️ Nuevo acto
                </span>
              )}
              {newDiscoveries?.map((d) => (
                <span
                  key={d}
                  className="bg-yellow-500/30 text-yellow-200 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wide"
                >
                  ✨ {d}
                </span>
              ))}
            </div>
          )}
        </MessageContent>
      </Message>
    </div>
  );
}

export const GameMessage = memo(GameMessageInner, (prev, next) => {
  const a = prev.message;
  const b = next.message;
  return (
    a.id === b.id &&
    a.content === b.content &&
    a.imageLoading === b.imageLoading &&
    a.image?.url === b.image?.url &&
    a.coinsEarned === b.coinsEarned &&
    a.actAdvanced === b.actAdvanced &&
    prev.onObserve === next.onObserve
  );
});
