"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from './use-toast';

// Define the SpeechRecognition interface for TypeScript
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export const useSpeech = (onTranscript: (text: string) => void, autoStop: boolean = false) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const { toast } = useToast();

  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      setIsSupported(true);
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = !autoStop;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';
      
      let finalTranscript = '';

      recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        if (finalTranscript || interimTranscript) {
          onTranscript((finalTranscript || interimTranscript).trim());
        }
      };

      recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
        if (event.error === 'network') {
          toast({
            title: 'Network Error',
            description: 'Speech recognition service is unavailable. Please check your internet connection.',
            variant: 'destructive',
          });
        }
        setIsListening(false);
      };
      
      recognitionInstance.onend = () => {
        if(autoStop && finalTranscript) {
          onTranscript(finalTranscript.trim())
          finalTranscript = ''
        }
        setIsListening(false);
      };

      recognitionRef.current = recognitionInstance;
      
    } else {
      setIsSupported(false);
      console.warn('Speech recognition not supported in this browser.');
    }

    return () => {
      recognitionRef.current?.stop();
    }
  }, [onTranscript, toast, autoStop]);

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) {
       toast({
        title: 'Unsupported',
        description: 'Speech recognition is not supported in this browser.',
      });
      return
    };

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (error) {
        console.error("Could not start recognition", error);
        setIsListening(false);
      }
    }
  }, [isListening, toast]);

  return { isListening, isSupported, toggleListening };
};
