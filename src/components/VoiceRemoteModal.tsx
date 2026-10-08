import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Sparkles, X, Volume2, Tv, Radio } from 'lucide-react';
import { audioHaptics } from '../utils/audioHaptics';

interface VoiceRemoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExecuteCommand: (cmd: string, actionDescription: string) => void;
}

export const VoiceRemoteModal: React.FC<VoiceRemoteModalProps> = ({
  isOpen,
  onClose,
  onExecuteCommand,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState('Tap the microphone or select a quick voice command below:');

  const quickCommands = [
    { label: 'Tune to Fuji TV 8ch', cmd: 'CH_8', desc: 'Switched to Channel 8 (Fuji Television)' },
    { label: 'Play Mezamashi Janken', cmd: 'OPEN_JANKEN', desc: 'Opening Mezamashi Janken game' },
    { label: 'Volume Up 10%', cmd: 'VOL_UP_10', desc: 'Increased volume by 10%' },
    { label: 'Tokyo Odaiba Weather', cmd: 'OPEN_WEATHER', desc: 'Showing Odaiba weather forecast' },
    { label: 'FNN Breaking News', cmd: 'OPEN_NEWS', desc: 'Displaying FNN News Flash' },
    { label: 'Toggle Subtitles (CC)', cmd: 'TOGGLE_CC', desc: 'Toggled Closed Captions' },
    { label: 'Mute Audio', cmd: 'MUTE', desc: 'Muted TV audio' },
    { label: 'Launch FOD On-Demand', cmd: 'STREAM_FOD', desc: 'Launching Fuji On Demand stream' },
  ];

  // Web Speech Recognition if available
  useEffect(() => {
    if (!isOpen) {
      setIsListening(false);
      setTranscript('');
      return;
    }
  }, [isOpen]);

  const handleStartListening = () => {
    audioHaptics.playClick();
    audioHaptics.triggerHaptic('medium');

    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: any }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: any }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setFeedbackMsg('Voice recognition not supported in this browser. Please use quick commands below.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      setIsListening(true);
      setFeedbackMsg('Listening... say a command like "Fuji TV" or "Mute TV"');

      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript.toLowerCase();
        setTranscript(text);
        setIsListening(false);
        processVoiceText(text);
      };

      recognition.onerror = () => {
        setIsListening(false);
        setFeedbackMsg('Could not understand voice. Please try again or tap a command below.');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
      setFeedbackMsg('Microphone access was denied or unavailable.');
    }
  };

  const processVoiceText = (text: string) => {
    if (text.includes('fuji') || text.includes('eight') || text.includes('channel 8') || text.includes('8')) {
      executeAction('CH_8', 'Tuning to Fuji Television Channel 8');
    } else if (text.includes('janken') || text.includes('game') || text.includes('rock')) {
      executeAction('OPEN_JANKEN', 'Starting Mezamashi Janken game');
    } else if (text.includes('weather')) {
      executeAction('OPEN_WEATHER', 'Showing Tokyo Odaiba Weather');
    } else if (text.includes('news')) {
      executeAction('OPEN_NEWS', 'Opening FNN News Flash');
    } else if (text.includes('mute') || text.includes('quiet') || text.includes('silence')) {
      executeAction('MUTE', 'Toggling Mute');
    } else if (text.includes('volume') || text.includes('loud') || text.includes('louder')) {
      executeAction('VOL_UP_10', 'Increasing volume');
    } else if (text.includes('fod') || text.includes('stream') || text.includes('demand')) {
      executeAction('STREAM_FOD', 'Opening Fuji On Demand');
    } else {
      setFeedbackMsg(`Recognized: "${text}". Command processed via Fuji TV AI Assistant.`);
      executeAction('CH_8', `Executed voice action: ${text}`);
    }
  };

  const executeAction = (cmd: string, desc: string) => {
    audioHaptics.playFujiJingle();
    audioHaptics.triggerHaptic('heavy');
    setFeedbackMsg(`✓ ${desc}`);
    onExecuteCommand(cmd, desc);
    setTimeout(() => {
      onClose();
    }, 1100);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-700 rounded-3xl p-6 shadow-2xl text-neutral-100 overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-2 rounded-full hover:bg-neutral-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="bg-red-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded">
                AI SMART VOICE
              </span>
              <span className="text-[10px] text-red-400 font-bold uppercase">
                Fuji Voice Command
              </span>
            </div>
            <h3 className="text-base font-black text-white">Fuji TV Voice Remote</h3>
          </div>
        </div>

        {/* Big Mic Button */}
        <div className="my-5 flex flex-col items-center justify-center">
          <button
            onClick={handleStartListening}
            className={`w-24 h-24 rounded-full flex flex-col items-center justify-center transition-all ${
              isListening
                ? 'bg-red-600 text-white shadow-[0_0_30px_#ef4444] scale-110 animate-pulse border-4 border-red-300'
                : 'bg-neutral-800 hover:bg-neutral-750 text-neutral-200 border-2 border-neutral-700 shadow-xl active:scale-95'
            }`}
          >
            {isListening ? (
              <Mic className="w-9 h-9 animate-bounce" />
            ) : (
              <Mic className="w-9 h-9" />
            )}
            <span className="text-[9px] font-black uppercase mt-1">
              {isListening ? 'Listening...' : 'Tap to Speak'}
            </span>
          </button>

          <p className="text-xs text-neutral-300 text-center mt-3 max-w-xs leading-relaxed font-medium">
            {feedbackMsg}
          </p>
          {transcript && (
            <p className="text-xs text-red-400 font-bold italic mt-1">"{transcript}"</p>
          )}
        </div>

        {/* Quick Voice Chips */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold text-neutral-400 block px-1">
            Quick Voice Command Shortcuts:
          </span>
          <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto p-1">
            {quickCommands.map((qc, i) => (
              <button
                key={i}
                onClick={() => executeAction(qc.cmd, qc.desc)}
                className="bg-neutral-800/80 hover:bg-neutral-750 border border-neutral-700/80 text-left p-2 rounded-xl text-[11px] font-medium text-neutral-200 hover:text-white transition flex items-center justify-between group active:scale-95"
              >
                <span className="truncate mr-1">{qc.label}</span>
                <Sparkles className="w-3 h-3 text-red-400 opacity-60 group-hover:opacity-100 flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-neutral-800 text-center">
          <button
            onClick={onClose}
            className="text-xs text-neutral-400 hover:text-white font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
