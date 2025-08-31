"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from './use-toast';
import { getAudioResponse } from '@/app/actions';

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
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const cancelSpeaking = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = "";
    }
    setIsSpeaking(false);
  }, []);

  useEffect(() => {
    const recognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (recognition) {
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
      
    } else {
      setIsSupported(true); // Still true for synthesis
      console.warn('Speech recognition not supported in this browser.');
    }

    const audio = new Audio();
    audio.onplaying = () => setIsSpeaking(true);
    audio.onended = () => {
      cancelSpeaking();
    };
    audio.onerror = (e) => {
      const error = (e.target as HTMLAudioElement)?.error;
      // Dont show an error if the user cancels the audio
      if (error?.code !== 20) {
        toast({
          title: 'Speech Error',
          description: 'Could not play the audio. Please try again.',
          variant: 'destructive',
        });
      }
      cancelSpeaking();
    }
    audioRef.current = audio;

    return () => {
      recognitionRef.current?.stop();
      cancelSpeaking();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onTranscript, toast]);

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
    } else {
      try {
        recognitionRef.current?.start();
      } catch (error) {
        console.error("Could not start recognition", error);
        setIsListening(false);
      }
    }
    setIsListening(prev => !prev);
  }, [isListening, toast]);
  
  const speak = useCallback(async (text: string) => {
    if (!text || !audioRef.current) return;
  
    if (isSpeaking) {
      cancelSpeaking();
    }
  
    setIsSpeaking(true);
    try {
      const audioSrc = await getAudioResponse(text);
  
      if (audioSrc && audioRef.current) {
        audioRef.current.src = audioSrc;
        await audioRef.current.play();
      } else {
        toast({
          title: 'Speech Error',
          description: 'Could not generate audio for this message.',
          variant: 'destructive',
        });
        setIsSpeaking(false);
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      toast({
        title: 'Playback Error',
        description: 'Failed to play the audio.',
        variant: 'destructive',
      });
      setIsSpeaking(false);
    }
  }, [isSpeaking, toast, cancelSpeaking]);

  return { isListening, isSpeaking, isSupported, toggleListening, speak, cancelSpeaking };
};
