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

export const useSpeech = (onTranscript: (text: string) => void) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const { toast } = useToast();

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const warmupSpeech = useCallback(() => {
    const synth = window.speechSynthesis;
    if (synth.getVoices().length === 0) {
      const warmupUtterance = new SpeechSynthesisUtterance('');
      warmupUtterance.volume = 0;
      synth.speak(warmupUtterance);
    }
  }, []);

  const resetSpeech = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  useEffect(() => {
    const recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const synthesis = window.speechSynthesis;

    if (recognition && synthesis) {
      setIsSupported(true);
      const recognitionInstance = new recognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          }
        }
        if (finalTranscript) {
          onTranscript(finalTranscript.trim());
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
        setIsListening(false);
      };

      recognitionRef.current = recognitionInstance;
      
      // Warm up speech synthesis engine
      synthesis.getVoices();
      synthesis.onvoiceschanged = warmupSpeech;
      warmupSpeech();

    } else {
      setIsSupported(false);
      console.warn('Speech recognition or synthesis not supported in this browser.');
    }

    return () => {
      recognitionRef.current?.stop();
      window.speechSynthesis.cancel();
    }
  }, [onTranscript, toast, warmupSpeech]);

  const toggleListening = useCallback(() => {
    if (!isSupported) return;

    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      try {
        recognitionRef.current?.start();
      } catch (error) {
        console.error("Could not start recognition", error);
        setIsListening(false);
      }
    }
    setIsListening(prev => !prev);
  }, [isListening, isSupported]);
  
  const speak = useCallback((text: string) => {
    if (!isSupported || !text) return;
    
    if (window.speechSynthesis.speaking) {
      resetSpeech();
      setTimeout(() => speak(text), 100);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      utteranceRef.current = null;
    };
    utterance.onerror = (e) => {
      toast({
        title: 'Speech Error',
        description: 'Could not play the audio. Please try again.',
        variant: 'destructive',
      });
      setIsSpeaking(false);
      utteranceRef.current = null;
    }
    window.speechSynthesis.speak(utterance);
  }, [isSupported, toast, resetSpeech]);
  
  const cancelSpeaking = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [isSupported]);


  return { isListening, isSpeaking, isSupported, toggleListening, speak, cancelSpeaking };
};
