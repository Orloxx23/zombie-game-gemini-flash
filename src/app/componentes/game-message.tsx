import { Message, MessageContent } from "@/components/message";
import { Response } from "@/components/response";
import { type GameMessage as GameMessageType } from "@/lib/types";
import { Image } from "@/components/image";
import { UI_MESSAGES } from "@/lib/consts";
import { Loader } from "@/components/loader";
import { useRef, useEffect } from "react";

export function GameMessage({ 
  message, 
  onObserve 
}: { 
  message: GameMessageType;
  onObserve?: (element: HTMLElement | null, messageId: string) => void;
}) {
  const { role, content, image, imageLoading, coinsEarned } = message;

  const messageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (onObserve && messageRef.current) {
      onObserve(messageRef.current, message.id);
    }
  }, [onObserve, message.id]);

  return (
    <div ref={messageRef}>
      <Message from={role}>
      <MessageContent>
        {
          role === 'assistant' && (
            <picture className="w-full max-w-2xl aspect-video overflow-hidden rounded-md bg-border">
              {
                imageLoading && (
                  <div className="w-full h-full flex items-center justify-center bg-border animate-pulse">
                    <div className="flex mb-4 space-x-2 opacity-50">
                      <Loader />
                      <span>{UI_MESSAGES.LOADING.IMAGE}</span>
                    </div>
                  </div>
                )
              }

              {image && (
                <Image
                  base64={image.base64Data}
                  mediaType={image.mediaType}
                  uint8Array={new Uint8Array()}
                  alt="zombie apocalypse pixel art image"
                  className="w-full h-full object-cover object-center"
                />
                
              )}
            </picture>
          )
        }
      
        <Response>
          {content}
        </Response>
        
        {role === 'assistant' && coinsEarned && coinsEarned > 0 && (
          <div className="mt-2 inline-flex items-center justify-end gap-0 text-xs">
            <span>🪙</span>
            <span>+{coinsEarned}</span>
          </div>
        )}
      </MessageContent>
    </Message>
    </div>
  )
}