import React, { useState, useEffect, useRef } from 'react';
import { Mic, Loader2 } from 'lucide-react';
import { api } from '../../lib/api.js';

interface VoiceDictationButtonProps {
  onTranscript: (text: string) => void;
  className?: string;
  size?: 'sm' | 'md';
}

declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

export const VoiceDictationButton: React.FC<VoiceDictationButtonProps> = ({
  onTranscript,
  className = '',
  size = 'md',
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [hasSpeechApi, setHasSpeechApi] = useState(false);

  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      setHasSpeechApi(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          onTranscript(finalTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Web Speech API error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [onTranscript]);

  const startListening = async () => {
    if (hasSpeechApi && recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        return;
      } catch (err) {
        console.warn('SpeechRecognition start failed, trying MediaRecorder:', err);
      }
    }

    // MediaRecorder fallback using Whisper API
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: MediaRecorder.isTypeSupported('audio/webm')
            ? 'audio/webm'
            : 'audio/mp4',
        });

        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          stream.getTracks().forEach((track) => track.stop());
          const audioBlob = new Blob(audioChunksRef.current, {
            type: mediaRecorder.mimeType,
          });

          // Convert blob to base64 and send to /api/transcribe
          setIsTranscribing(true);
          try {
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = async () => {
              const base64Audio = reader.result as string;
              const res = await api.post<{ text: string }>('/api/transcribe', {
                audioBase64: base64Audio,
                mimeType: mediaRecorder.mimeType,
              });
              if (res.text) {
                onTranscript(res.text);
              }
              setIsTranscribing(false);
            };
          } catch (err) {
            console.error('Transcription API error:', err);
            setIsTranscribing(false);
          }
        };

        mediaRecorder.start();
        mediaRecorderRef.current = mediaRecorder;
        setIsListening(true);
      } catch (err) {
        alert('Microphone access was denied or not available.');
        setIsListening(false);
      }
    } else {
      alert('Microphone recording is not supported in this browser.');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && hasSpeechApi) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // ignore
      }
    }

    setIsListening(false);
  };

  const toggleListening = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const isSmall = size === 'sm';

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={toggleListening}
        disabled={isTranscribing}
        title={
          isListening
            ? 'Click to stop dictation'
            : isTranscribing
            ? 'Transcribing audio...'
            : 'Click to dictate with your microphone'
        }
        className={`inline-flex items-center gap-1.5 rounded-xl font-medium transition-all ${
          isListening
            ? 'bg-rose-500/15 border border-rose-500/40 text-rose-600 dark:text-rose-400 shadow-sm animate-pulse px-3 py-1.5'
            : isTranscribing
            ? 'bg-slate-100 dark:bg-white/[0.05] text-slate-400 px-3 py-1.5 cursor-wait'
            : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.05] p-2'
        } ${className}`}
      >
        {isTranscribing ? (
          <>
            <Loader2 className={`animate-spin ${isSmall ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} />
            <span className="text-[11px]">Transcribing...</span>
          </>
        ) : isListening ? (
          <>
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <Mic className={isSmall ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
            <span className="text-[11px] font-semibold">Listening...</span>
          </>
        ) : (
          <Mic className={isSmall ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
        )}
      </button>
    </div>
  );
};
