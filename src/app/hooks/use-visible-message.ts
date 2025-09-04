import { useEffect, useState, useRef } from 'react';
import { type GameMessage } from '@/lib/types';

export function useVisibleMessage(messages: GameMessage[]) {
  const [visibleMessageId, setVisibleMessageId] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter(entry => entry.isIntersecting);
        if (visibleEntries.length > 0) {
          const topEntry = visibleEntries.reduce((top, entry) => 
            entry.boundingClientRect.top < top.boundingClientRect.top ? entry : top
          );
          const messageId = topEntry.target.getAttribute('data-message-id');
          if (messageId) {
            setVisibleMessageId(messageId);
          }
        }
      },
      { threshold: 0.5, rootMargin: '-20% 0px -20% 0px' }
    );

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  const observeMessage = (element: HTMLElement | null, messageId: string) => {
    if (!element || !observerRef.current) return;
    
    element.setAttribute('data-message-id', messageId);
    observerRef.current.observe(element);
  };

  const visibleMessage = messages.find(msg => msg.id === visibleMessageId);
  
  return { visibleMessage, observeMessage };
}