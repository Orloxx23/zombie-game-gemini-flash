"use client";

import { useState, useEffect } from 'react';

export function useApiKey() {
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkApiKey();
  }, []);

  const checkApiKey = async () => {
    try {
      const tempApiKey = localStorage.getItem('temp_api_key');
      if (tempApiKey) {
        setHasApiKey(true);
        setIsLoading(false);
        return;
      }
      
      const response = await fetch('/api/check-api-key');
      const data = await response.json();
      setHasApiKey(data.hasApiKey);
    } catch (error) {
      setHasApiKey(false);
    } finally {
      setIsLoading(false);
    }
  };

  const setApiKey = async (apiKey: string) => {
    try {
      const response = await fetch('/api/check-api-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey })
      });

      if (response.ok) {
        localStorage.setItem('temp_api_key', apiKey);
        setHasApiKey(true);
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  return { hasApiKey, isLoading, setApiKey };
}