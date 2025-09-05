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
      window.speechSynthesis.cancel();
    };
  }, []);

  const speak = useCallback((text: string, options: SpeechSynthesisOptions = {}) => {
    if (!isSupported) return;

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
      console.error('SpeechSynthesis Error', event);
      setIsSpeaking(false);
      utteranceRef.current = null;
      options.onError?.(event);
    };

    window.speechSynthesis.speak(utterance);
  }, [isSupported]);

  const cancel = useCallback(() => {
    if (!isSupported || !isSpeaking) return;
    window.speechSynthesis.cancel();
  }, [isSupported, isSpeaking]);

  return { isSpeaking, isSupported, speak, cancel };
};
