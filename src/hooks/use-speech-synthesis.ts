"use client"

import { useState, useEffect, useCallback, useRef } from 'react';

type SpeechSynthesisOptions = {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (event: SpeechSynthesisErrorEvent) => void;
};

export const useSpeechSynthesis = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);
    }

    const handleBeforeUnload = () => {
      window.speechSynthesis.cancel();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Ensure any lingering speech is canceled when the component unmounts
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speak = useCallback((text: string, options: SpeechSynthesisOptions = {}) => {
    if (!isSupported) return;

    // Always cancel any previous speech before starting a new one.
    // This is the most reliable way to prevent "interrupted" errors.
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;

    utterance.onstart = () => {
      setIsSpeaking(true);
      options.onStart?.();
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      utteranceRef.current = null;
      options.onEnd?.();
    };

    utterance.onerror = (event) => {
      console.error('SpeechSynthesis Error', event.error);
      setIsSpeaking(false);
      utteranceRef.current = null;
      options.onError?.(event);
    };

    // The timeout can help in some browsers, but the explicit cancel() above is more important.
    setTimeout(() => window.speechSynthesis.speak(utterance), 0);
  }, [isSupported]);

  const cancel = useCallback(() => {
    if (!isSupported || !isSpeaking) return;
    window.speechSynthesis.cancel();
    // Manually update state as onend might not fire after a manual cancel.
    setIsSpeaking(false); 
  }, [isSupported, isSpeaking]);

  return { isSpeaking, isSupported, speak, cancel };
};
