import React, { useState } from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface VoiceMicProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

export const VoiceMicButton: React.FC<VoiceMicProps> = ({ onTranscript, disabled }) => {
  const [isRecording, setIsRecording] = useState(false);
  const { language } = useLanguage();

  const handleToggleRecord = () => {
    // Check SpeechRecognition support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice speech recognition is supported in modern Chrome, Edge, and Android browsers. Please use text typing on this device.");
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === 'te' ? 'te-IN' : 'en-IN';

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          onTranscript(transcript);
        }
        setIsRecording(false);
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    } catch {
      setIsRecording(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggleRecord}
      disabled={disabled}
      title={isRecording ? "Listening... Click to stop" : "Speak your question in Telugu or English"}
      className={`btn ${isRecording ? 'mic-recording' : 'btn-secondary'} rounded-full`}
      style={{ padding: '0.625rem 1rem', borderRadius: '9999px' }}
    >
      {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
      <span>{isRecording ? (language === 'te' ? 'వింటున్నాము...' : 'Listening...') : (language === 'te' ? 'మాట్లాడండి' : 'Voice Input')}</span>
    </button>
  );
};

export const SpeakButton: React.FC<{ text: string }> = ({ text }) => {
  const { language } = useLanguage();
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'te' ? 'te-IN' : 'en-IN';
    utterance.rate = 0.9;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <button
      type="button"
      onClick={speak}
      className="btn btn-outline btn-sm"
      title="Listen to this explanation"
    >
      <Volume2 size={16} className={isSpeaking ? "text-green-600 animate-pulse" : ""} />
      <span>{language === 'te' ? 'వినండి' : 'Listen'}</span>
    </button>
  );
};
