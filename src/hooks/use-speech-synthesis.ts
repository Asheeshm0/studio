"use client"

import { useState, useEffect, useCallback, useRef } from 'react';
import type { VoiceOption } from '@/components/chat/chat-provider';

type SpeechSynthesisOptions = {
  voiceGender?: VoiceOption;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (event: SpeechSynthesisErrorEvent) => void;
};

export const useSpeechSynthesis = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);
      
      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        if (availableVoices.length > 0) {
          setVoices(availableVoices);
        }
      };

      loadVoices();
      // Voices are often loaded asynchronously.
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    const handleBeforeUnload = () => {
      window.speechSynthesis.cancel();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speak = useCallback((text: string, options: SpeechSynthesisOptions = {}) => {
    if (!isSupported) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;
    
    if (options.voiceGender && voices.length > 0) {
      const englishVoices = voices.filter(voice => voice.lang.startsWith('en'));
      
      let selectedVoice = englishVoices.find(voice => 
        voice.name.toLowerCase().includes(options.voiceGender!)
      );
      
      if (!selectedVoice) {
        if (options.voiceGender === 'male') {
          // Fallback for male voices
          selectedVoice = englishVoices.find(voice => voice.name.toLowerCase().includes('male')) || englishVoices.find(v => !v.name.toLowerCase().includes('female'));
        } else {
          // Fallback for female voices (usually default)
          selectedVoice = englishVoices.find(voice => voice.name.toLowerCase().includes('female')) || englishVoices[0];
        }
      }

      utterance.voice = selectedVoice || null;
    }

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

    setTimeout(() => window.speechSynthesis.speak(utterance), 0);
  }, [isSupported, voices]);

  const cancel = useCallback(() => {
    if (!isSupported || !isSpeaking) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false); 
  }, [isSupported, isSpeaking]);

  return { isSpeaking, isSupported, speak, cancel };
};
