import React, { useState } from 'react';
import { TVState, InputSource } from '../types/tv';
import { audioHaptics } from '../utils/audioHaptics';
import { tvConnection } from '../utils/tvConnection';
import { MagicTouchpad } from './MagicTouchpad';
import {
  Power,
  Volume2,
  VolumeX,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  List,
  Mic,
  Lightbulb,
  MousePointer,
  Sparkles,
} from 'lucide-react';

interface FujiRemoteControlProps {
  tvState: TVState;
  onPowerToggle: () => void;
  onChannelSelect: (ch: number) => void;
  onVolumeChange: (delta: number) => void;
  onMuteToggle: () => void;
  onInputSelect: (input: InputSource) => void;
  onSubtitlesToggle: () => void;
  onAudioTrackToggle: () => void;
  onToggleDData: () => void;
  onColorButtonPress: (color: 'blue' | 'red' | 'green' | 'yellow') => void;
  onOpenEPG: () => void;
  onOpenVoiceRemote?: () => void;
  onSendReaction?: (emoji: string) => void;
  remoteMode?: 'keypad' | 'touchpad';
  onToggleRemoteMode?: () => void;
  backlightActive?: boolean;
  onToggleBacklight?: () => void;
  onCursorMove?: (x: number, y: number) => void;
  onOpenNormalTVSetup?: () => void;
  normalTVBrandName?: string;
  remoteTheme?: 'dark' | 'crimson' | 'silver';
}

export const FujiRemoteControl: React.FC<FujiRemoteControlProps> = ({
  tvState,
  onPowerToggle,
  onChannelSelect,
  onVolumeChange,
  onMuteToggle,
  onInputSelect,
  onSubtitlesToggle,
  onAudioTrackToggle,
  onToggleDData,
  onColorButtonPress,
  onOpenEPG,
  onOpenVoiceRemote,
  onSendReaction,
  remoteMode = 'keypad',
  onToggleRemoteMode,
  backlightActive = false,
  onToggleBacklight,
  onCursorMove,
  onOpenNormalTVSetup,
  normalTVBrandName,
  remoteTheme = 'dark',
}) => {
  const [irActive, setIrActive] = useState(false);
  const [pressedBtn, setPressedBtn] = useState<string | null>(null);

  const flashIR = (label: string, cmdHex = 'SEND_IR') => {
    setIrActive(true);
    setPressedBtn(label);
    tvConnection.sendCommand(label, cmdHex);
    setTimeout(() => setIrActive(false), 220);
    setTimeout(() => setPressedBtn(null), 150);
  };

  const handleButtonClick = (
    label: string,
    action: () => void,
    soundType: 'click' | 'beep' | 'ddata' | 'fuji' = 'click',
    hapticStrength: 'light' | 'medium' | 'heavy' = 'light'
  ) => {
    flashIR(label);
    audioHaptics.triggerHaptic(hapticStrength);
    if (soundType === 'click') audioHaptics.playClick();
    else if (soundType === 'beep') audioHaptics.playBeep();
    else if (soundType === 'ddata') audioHaptics.playDDataChime();
    else if (soundType === 'fuji') audioHaptics.playFujiJingle();
    action();
  };

  // Backlight style modifier
  const glowClass = backlightActive
    ? 'ring-1 ring-cyan-400/60 shadow-[0_0_10px_rgba(34,211,238,0.3)] text-cyan-200'
    : '';

  // Chassis theme classes
  const themeChassisClass =
    remoteTheme === 'crimson'
      ? 'remote-chassis-crimson border-rose-950/70'
      : remoteTheme === 'silver'
      ? 'remote-chassis-silver border-slate-700/60'
      : 'remote-chassis-dark border-neutral-800';

  return (
    <div className="relative w-full max-w-[340px] mx-auto select-none">
      {/* IR Blaster Transceiver Diode at the Top Edge */}
      <div className="flex justify-center -mb-2 relative z-20">
        <div
          className={`w-12 h-3.5 rounded-t-lg transition-all duration-150 flex items-center justify-center border-t border-x ${
            irActive
              ? 'bg-rose-500 shadow-[0_0_24px_#f43f5e] border-rose-300 scale-105'
              : 'bg-neutral-900 border-neutral-700/60 shadow-sm'
          }`}
        >
          <div
            className={`w-3 h-1.5 rounded-full transition-all duration-150 ${
              irActive ? 'bg-white shadow-[0_0_8px_#ffffff]' : 'bg-red-950'
            }`}
          />
        </div>
      </div>

      {/* Main Remote Body Chassis */}
      <div
        className={`relative rounded-3xl p-4 sm:p-5 border-2 shadow-2xl transition-all ${themeChassisClass}`}
      >
        {/* Subtle metallic texture accent */}
        <div className="absolute inset-0 rounded-3xl bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.06),transparent_70%)] pointer-events-none" />

        {/* 1. BRAND HEADER, VOICE MIC & POWER ROW */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800/80">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 shadow-[0_0_8px_#ef4444] animate-pulse"></span>
              <span className="font-extrabold tracking-widest text-xs text-neutral-100 font-sans">
                FUJI TELEVISION
              </span>
            </div>
            <span className="text-[9px] text-neutral-400 font-semibold tracking-wider">
              Smart TV Remote Controller
            </span>
            {onOpenNormalTVSetup && (
              <button
                onClick={() => {
                  audioHaptics.playClick();
                  onOpenNormalTVSetup();
                }}
                className="mt-1 text-[8px] bg-neutral-800/90 hover:bg-neutral-700/90 border border-neutral-700 px-1.5 py-0.5 rounded-md text-neutral-300 font-mono flex items-center gap-1 w-fit transition active:scale-95"
                title="Configure Normal Physical TV Control (IR / Wi-Fi)"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Normal TV IR: <strong className="text-white font-sans">{normalTVBrandName || 'Universal'}</strong></span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {/* AI Voice Assistant Mic Button */}
            {onOpenVoiceRemote && (
              <button
                onClick={() => {
                  audioHaptics.playClick();
                  audioHaptics.triggerHaptic('medium');
                  onOpenVoiceRemote();
                }}
                className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 text-white flex items-center justify-center shadow-[0_0_12px_rgba(244,63,94,0.4)] border border-red-400/50 hover:brightness-110 active:scale-90 transition"
                title="AI Voice Assistant"
              >
                <Mic className="w-4 h-4" />
              </button>
            )}

            {/* Backlight Luminescence Toggle */}
            {onToggleBacklight && (
              <button
                onClick={() => {
                  audioHaptics.playClick();
                  onToggleBacklight();
                }}
                className={`w-9 h-9 rounded-xl flex items-center justify-center border transition active:scale-90 ${
                  backlightActive
                    ? 'bg-cyan-950 text-cyan-300 border-cyan-400 shadow-[0_0_12px_#22d3ee]'
                    : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-white'
                }`}
                title="Toggle Button Backlight"
              >
                <Lightbulb className="w-4 h-4" />
              </button>
            )}

            {/* Power Button */}
            <button
              onClick={() =>
                handleButtonClick('POWER', onPowerToggle, 'beep', 'heavy')
              }
              className={`w-10 h-10 rounded-2xl flex flex-col items-center justify-center transition-all ${
                tvState.power
                  ? 'bg-red-600 text-white shadow-[0_0_16px_rgba(239,68,68,0.5)] border border-red-400'
                  : 'bg-neutral-800 text-neutral-400 border border-neutral-700 hover:text-white'
              } active:scale-90`}
              title="Power"
            >
              <Power className="w-4 h-4 stroke-[2.2]" />
              <span className="text-[6px] font-bold mt-0.5">POWER</span>
            </button>
          </div>
        </div>

        {/* 2. BROADCAST INPUT SELECTORS */}
        <div className="grid grid-cols-4 gap-1.5 py-2.5 border-b border-neutral-800/60">
          {[
            { id: 'TERRESTRIAL', label: 'TERR', sub: 'Broadcast' },
            { id: 'BS', label: 'BS', sub: 'Satellite' },
            { id: 'CS', label: 'CS', sub: 'Cable' },
            { id: '4K', label: '4K/8K', sub: 'Ultra HD' },
          ].map(inp => (
            <button
              key={inp.id}
              onClick={() =>
                handleButtonClick(
                  `INPUT_${inp.id}`,
                  () => onInputSelect(inp.id as InputSource),
                  'click'
                )
              }
              className={`remote-button-tactile py-1.5 rounded-xl flex flex-col items-center justify-center text-center transition ${glowClass} ${
                tvState.inputSource === inp.id
                  ? 'border border-red-500/70 text-red-400 bg-neutral-800'
                  : 'text-neutral-300 hover:text-white'
              }`}
            >
              <span className="text-[11px] font-bold">{inp.label}</span>
              <span className="text-[7px] text-neutral-500">{inp.sub}</span>
            </button>
          ))}
        </div>

        {/* 3. CHANNEL KEYPAD (1-12) WITH HIGHLIGHTED FUJI TV CH 8 */}
        <div className="py-2.5 border-b border-neutral-800/60">
          <div className="grid grid-cols-3 gap-2">
            {[
              { num: 1, name: 'NHK G' },
              { num: 2, name: 'NHK E' },
              { num: 3, name: 'IND' },
              { num: 4, name: 'NTV' },
              { num: 5, name: 'EX' },
              { num: 6, name: 'TBS' },
              { num: 7, name: 'TX' },
              { num: 8, name: 'FUJI TV', isStar: true },
              { num: 9, name: 'MX' },
              { num: 10, name: 'TVS' },
              { num: 11, name: 'J:COM' },
              { num: 12, name: 'OUJ' },
            ].map(ch => {
              const isSelected = tvState.currentChannel === ch.num;

              if (ch.isStar) {
                // SPECIAL FUJI TV BUTTON (8)
                return (
                  <button
                    key={ch.num}
                    onClick={() =>
                      handleButtonClick(
                        `CH_8_FUJI`,
                        () => onChannelSelect(8),
                        'fuji',
                        'heavy'
                      )
                    }
                    className={`relative col-span-1 rounded-xl p-2 flex flex-col items-center justify-center transition transform active:scale-95 ${
                      isSelected
                        ? 'remote-fuji-accent ring-2 ring-yellow-400 shadow-[0_0_20px_rgba(255,42,95,0.7)] text-white'
                        : 'bg-gradient-to-b from-red-600 via-rose-700 to-red-900 border-2 border-red-400/60 text-white shadow-lg hover:brightness-110'
                    }`}
                  >
                    {/* Glowing Star Badge */}
                    <div className="absolute -top-1.5 -right-1 bg-yellow-400 text-neutral-950 text-[7px] font-black px-1 rounded-full shadow">
                      CX
                    </div>
                    <span className="text-xl font-black font-sans leading-none">
                      8
                    </span>
                    <span className="text-[9px] font-extrabold tracking-tight mt-0.5 text-white/95">
                      FUJI TV
                    </span>
                  </button>
                );
              }

              return (
                <button
                  key={ch.num}
                  onClick={() =>
                    handleButtonClick(
                      `CH_${ch.num}`,
                      () => onChannelSelect(ch.num),
                      'click'
                    )
                  }
                  className={`remote-button-tactile rounded-xl p-2 flex flex-col items-center justify-center transition ${glowClass} ${
                    isSelected
                      ? 'border border-sky-400 bg-sky-950/40 text-sky-300'
                      : 'text-neutral-200 hover:text-white'
                  }`}
                >
                  <span className="text-lg font-bold font-sans leading-none">
                    {ch.num}
                  </span>
                  <span className="text-[8px] text-neutral-400 font-medium truncate max-w-[64px]">
                    {ch.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. FOUR-COLOR DATA BUTTONS & CHEERING STAMP ROW */}
        <div className="py-2.5 border-b border-neutral-800/60">
          <div className="text-[9px] text-neutral-400 font-semibold mb-1 flex items-center justify-between px-1">
            <span>4-Color Interactive Keys</span>
            {onSendReaction && (
              <div className="flex items-center gap-1">
                {['🔥', '👏', '❤️'].map(em => (
                  <button
                    key={em}
                    onClick={() => {
                      audioHaptics.playClick();
                      onSendReaction(em);
                    }}
                    className="hover:scale-125 transition text-xs"
                    title={`Send ${em} to TV`}
                  >
                    {em}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[
              {
                color: 'blue' as const,
                label: 'BLUE',
                bg: 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/50',
                sub: '✊ Rock',
              },
              {
                color: 'red' as const,
                label: 'RED',
                bg: 'bg-red-600 hover:bg-red-500 text-white shadow-red-900/50',
                sub: '✌️ Scissors',
              },
              {
                color: 'green' as const,
                label: 'GREEN',
                bg: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/50',
                sub: '✋ Paper',
              },
              {
                color: 'yellow' as const,
                label: 'YELLOW',
                bg: 'bg-yellow-500 hover:bg-yellow-400 text-neutral-950 shadow-yellow-900/50',
                sub: '⭐ Star',
              },
            ].map(b => (
              <button
                key={b.color}
                onClick={() => {
                  flashIR(`COLOR_${b.color.toUpperCase()}`);
                  audioHaptics.playColorButtonSound(b.color);
                  audioHaptics.triggerHaptic('medium');
                  onColorButtonPress(b.color);
                }}
                className={`py-2 rounded-xl flex flex-col items-center justify-center shadow-md transition active:scale-90 ${b.bg}`}
              >
                <span className="text-[10px] font-black">{b.label}</span>
                <span className="text-[7px] font-bold opacity-80">{b.sub}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 5. 'd' DATA & FUNCTION BUTTONS ROW */}
        <div className="grid grid-cols-3 gap-2 py-2.5 border-b border-neutral-800/60">
          {/* EPG Program Guide */}
          <button
            onClick={() => handleButtonClick('EPG_GUIDE', onOpenEPG, 'click')}
            className={`remote-button-tactile py-2 rounded-xl flex flex-col items-center justify-center text-neutral-300 hover:text-white ${glowClass}`}
          >
            <List className="w-4 h-4 text-sky-400 mb-0.5" />
            <span className="text-[10px] font-bold">GUIDE</span>
            <span className="text-[7px] text-neutral-500">EPG Schedule</span>
          </button>

          {/* FUJI 'd' DATA BUTTON (ILLUMINATED) */}
          <button
            onClick={() =>
              handleButtonClick('D_DATA', onToggleDData, 'ddata', 'medium')
            }
            className={`py-2 rounded-xl flex flex-col items-center justify-center transition active:scale-95 ${
              tvState.dData.isOpen
                ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-[0_0_18px_rgba(225,29,72,0.8)] border border-red-300'
                : 'bg-neutral-800 border border-neutral-700 text-white hover:border-red-500/80 shadow'
            }`}
          >
            <span className="bg-yellow-400 text-black text-[9px] font-black px-1.5 py-0.2 rounded leading-none mb-0.5">
              d
            </span>
            <span className="text-[11px] font-black tracking-wider">DATA</span>
            <span className="text-[7px] text-neutral-400">Hybridcast</span>
          </button>

          {/* Subtitles Toggle */}
          <button
            onClick={() =>
              handleButtonClick('SUBTITLES', onSubtitlesToggle, 'click')
            }
            className={`remote-button-tactile py-2 rounded-xl flex flex-col items-center justify-center transition ${glowClass} ${
              tvState.subtitlesActive
                ? 'border border-yellow-500 text-yellow-300 bg-neutral-800'
                : 'text-neutral-300 hover:text-white'
            }`}
          >
            <span className="text-[10px] font-bold">SUBTITLE</span>
            <span className="text-[7px] text-neutral-500">
              {tvState.subtitlesActive ? 'CC ON' : 'CC OFF'}
            </span>
          </button>
        </div>

        {/* 6. NAVIGATION: D-PAD WHEEL OR MAGIC TOUCHPAD */}
        <div className="py-3 flex flex-col items-center border-b border-neutral-800/60">
          {/* Mode Switcher pill */}
          {onToggleRemoteMode && (
            <div className="flex items-center gap-1 bg-neutral-900 p-0.5 rounded-xl border border-neutral-800 mb-2">
              <button
                onClick={() => {
                  if (remoteMode !== 'keypad') {
                    audioHaptics.playClick();
                    onToggleRemoteMode();
                  }
                }}
                className={`px-2.5 py-1 rounded-lg text-[9px] font-bold transition flex items-center gap-1 ${
                  remoteMode === 'keypad'
                    ? 'bg-red-600 text-white shadow'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Classic D-Pad
              </button>
              <button
                onClick={() => {
                  if (remoteMode !== 'touchpad') {
                    audioHaptics.playClick();
                    onToggleRemoteMode();
                  }
                }}
                className={`px-2.5 py-1 rounded-lg text-[9px] font-bold transition flex items-center gap-1 ${
                  remoteMode === 'touchpad'
                    ? 'bg-red-600 text-white shadow'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <MousePointer className="w-3 h-3" />
                Magic Trackpad
              </button>
            </div>
          )}

          {remoteMode === 'touchpad' ? (
            <MagicTouchpad
              onTap={() => handleButtonClick('TOUCH_SELECT', onToggleDData, 'fuji')}
              onSwipeUp={() => handleButtonClick('TOUCH_VOL_UP', () => onVolumeChange(5), 'beep')}
              onSwipeDown={() => handleButtonClick('TOUCH_VOL_DOWN', () => onVolumeChange(-5), 'beep')}
              onCursorMove={onCursorMove}
            />
          ) : (
            <div className="relative w-44 h-44 dpad-ring rounded-full p-2 flex items-center justify-center shadow-2xl">
              {/* UP */}
              <button
                onClick={() =>
                  handleButtonClick(
                    'NAV_UP',
                    () => onVolumeChange(2),
                    'click'
                  )
                }
                className="absolute top-2 w-12 h-9 rounded-t-2xl flex items-center justify-center text-neutral-300 hover:text-white active:scale-95"
                title="Up"
              >
                <ChevronUp className="w-5 h-5" />
              </button>

              {/* DOWN */}
              <button
                onClick={() =>
                  handleButtonClick(
                    'NAV_DOWN',
                    () => onVolumeChange(-2),
                    'click'
                  )
                }
                className="absolute bottom-2 w-12 h-9 rounded-b-2xl flex items-center justify-center text-neutral-300 hover:text-white active:scale-95"
                title="Down"
              >
                <ChevronDown className="w-5 h-5" />
              </button>

              {/* LEFT */}
              <button
                onClick={() =>
                  handleButtonClick(
                    'NAV_LEFT',
                    () => onChannelSelect(Math.max(1, tvState.currentChannel - 1)),
                    'click'
                  )
                }
                className="absolute left-2 w-9 h-12 rounded-l-2xl flex items-center justify-center text-neutral-300 hover:text-white active:scale-95"
                title="Left"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* RIGHT */}
              <button
                onClick={() =>
                  handleButtonClick(
                    'NAV_RIGHT',
                    () => onChannelSelect(Math.min(12, tvState.currentChannel + 1)),
                    'click'
                  )
                }
                className="absolute right-2 w-9 h-12 rounded-r-2xl flex items-center justify-center text-neutral-300 hover:text-white active:scale-95"
                title="Right"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* CENTER "OK / SELECT" BUTTON */}
              <button
                onClick={() =>
                  handleButtonClick(
                    'SELECT_ENTER',
                    onToggleDData,
                    'fuji',
                    'medium'
                  )
                }
                className="w-16 h-16 rounded-full dpad-center-button flex flex-col items-center justify-center text-white active:scale-90 transition shadow-lg"
                title="Select / Enter"
              >
                <span className="text-xs font-black tracking-widest">OK</span>
                <span className="text-[7px] opacity-80">ENTER</span>
              </button>
            </div>
          )}

          {/* D-PAD CORNER BUTTONS: Back, Home, Audio, Menu */}
          <div className="grid grid-cols-4 gap-2 w-full mt-2.5">
            <button
              onClick={() =>
                handleButtonClick(
                  'BACK',
                  () => {
                    if (tvState.dData.isOpen) onToggleDData();
                  },
                  'click'
                )
              }
              className={`remote-button-tactile py-1.5 rounded-xl text-center text-neutral-300 hover:text-white ${glowClass}`}
            >
              <span className="text-[10px] font-bold block">BACK</span>
              <span className="text-[7px] text-neutral-500">Return</span>
            </button>
            <button
              onClick={() =>
                handleButtonClick(
                  'HOME',
                  () => onChannelSelect(8),
                  'fuji'
                )
              }
              className={`remote-button-tactile py-1.5 rounded-xl text-center text-neutral-300 hover:text-white ${glowClass}`}
            >
              <span className="text-[10px] font-bold block">HOME</span>
              <span className="text-[7px] text-neutral-500">CX Portal</span>
            </button>
            <button
              onClick={() =>
                handleButtonClick('AUDIO_TRACK', onAudioTrackToggle, 'click')
              }
              className={`remote-button-tactile py-1.5 rounded-xl text-center ${glowClass} ${
                tvState.audioTrack === 'sub'
                  ? 'border border-amber-400 text-amber-300'
                  : 'text-neutral-300 hover:text-white'
              }`}
            >
              <span className="text-[10px] font-bold block">AUDIO</span>
              <span className="text-[7px] text-neutral-500">
                {tvState.audioTrack === 'main' ? 'Main' : 'Sub'}
              </span>
            </button>
            <button
              onClick={() =>
                handleButtonClick(
                  'MENU',
                  onOpenEPG,
                  'click'
                )
              }
              className={`remote-button-tactile py-1.5 rounded-xl text-center text-neutral-300 hover:text-white ${glowClass}`}
            >
              <span className="text-[10px] font-bold block">MENU</span>
              <span className="text-[7px] text-neutral-500">Options</span>
            </button>
          </div>
        </div>

        {/* 7. VOLUME & CHANNEL VERTICAL ROCKERS + MUTE */}
        <div className="py-2.5 flex items-center justify-between border-b border-neutral-800/60">
          {/* VOLUME ROCKER */}
          <div className="flex flex-col items-center bg-neutral-900/90 border border-neutral-800 rounded-2xl p-1 shadow-inner w-20">
            <button
              onClick={() =>
                handleButtonClick(
                  'VOL_UP',
                  () => onVolumeChange(5),
                  'beep'
                )
              }
              className="w-full py-2 flex items-center justify-center text-neutral-200 hover:text-white active:scale-90"
              title="Volume Up"
            >
              <span className="text-base font-black">＋</span>
            </button>
            <div className="text-center py-1 border-y border-neutral-800 w-full">
              <span className="text-[10px] font-bold text-neutral-400 block">VOL</span>
              <span className="text-[8px] font-mono text-neutral-500">
                {tvState.volume}
              </span>
            </div>
            <button
              onClick={() =>
                handleButtonClick(
                  'VOL_DOWN',
                  () => onVolumeChange(-5),
                  'beep'
                )
              }
              className="w-full py-2 flex items-center justify-center text-neutral-200 hover:text-white active:scale-90"
              title="Volume Down"
            >
              <span className="text-base font-black">－</span>
            </button>
          </div>

          {/* CENTER MUTE BUTTON */}
          <div className="flex flex-col items-center justify-center">
            <button
              onClick={() =>
                handleButtonClick('MUTE', onMuteToggle, 'beep', 'medium')
              }
              className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center transition active:scale-90 ${
                tvState.isMuted
                  ? 'bg-amber-600 text-white shadow-[0_0_12px_rgba(217,119,6,0.5)] border border-amber-300'
                  : `remote-button-tactile text-neutral-300 hover:text-white ${glowClass}`
              }`}
              title="Mute"
            >
              {tvState.isMuted ? (
                <VolumeX className="w-5 h-5 text-white" />
              ) : (
                <Volume2 className="w-5 h-5 text-neutral-300" />
              )}
              <span className="text-[8px] font-bold mt-0.5">MUTE</span>
            </button>
          </div>

          {/* CHANNEL ROCKER */}
          <div className="flex flex-col items-center bg-neutral-900/90 border border-neutral-800 rounded-2xl p-1 shadow-inner w-20">
            <button
              onClick={() =>
                handleButtonClick(
                  'CH_UP',
                  () => onChannelSelect(Math.min(12, tvState.currentChannel + 1)),
                  'click'
                )
              }
              className="w-full py-2 flex items-center justify-center text-neutral-200 hover:text-white active:scale-90"
              title="Channel Up"
            >
              <span className="text-base font-black">▲</span>
            </button>
            <div className="text-center py-1 border-y border-neutral-800 w-full">
              <span className="text-[10px] font-bold text-neutral-400 block">CH</span>
              <span className="text-[8px] font-mono text-neutral-500">
                CH {tvState.currentChannel}
              </span>
            </div>
            <button
              onClick={() =>
                handleButtonClick(
                  'CH_DOWN',
                  () => onChannelSelect(Math.max(1, tvState.currentChannel - 1)),
                  'click'
                )
              }
              className="w-full py-2 flex items-center justify-center text-neutral-200 hover:text-white active:scale-90"
              title="Channel Down"
            >
              <span className="text-base font-black">▼</span>
            </button>
          </div>
        </div>

        {/* 8. FAST STREAMING SHORTCUTS */}
        <div className="py-2.5 border-b border-neutral-800/60">
          <div className="text-[9px] text-neutral-400 font-semibold mb-1 px-1">
            Streaming App Direct
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {/* FOD BUTTON */}
            <button
              onClick={() =>
                handleButtonClick(
                  'STREAM_FOD',
                  () => onChannelSelect(8),
                  'fuji',
                  'heavy'
                )
              }
              className="bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-xl py-2 flex flex-col items-center justify-center shadow-md border border-red-400/50 active:scale-90"
            >
              <span className="text-xs font-black tracking-wider">FOD</span>
              <span className="text-[6px] font-bold opacity-90">Fuji On Demand</span>
            </button>

            {/* TVer */}
            <button
              onClick={() =>
                handleButtonClick(
                  'STREAM_TVER',
                  () => onChannelSelect(8),
                  'click'
                )
              }
              className="bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-teal-300 rounded-xl py-2 flex flex-col items-center justify-center active:scale-90"
            >
              <span className="text-xs font-black">TVer</span>
              <span className="text-[6px] text-neutral-400">Catch-up TV</span>
            </button>

            {/* YouTube */}
            <button
              onClick={() =>
                handleButtonClick(
                  'STREAM_YOUTUBE',
                  () => {},
                  'click'
                )
              }
              className="bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-red-400 rounded-xl py-2 flex flex-col items-center justify-center active:scale-90"
            >
              <span className="text-xs font-black">YouTube</span>
              <span className="text-[6px] text-neutral-400">Videos</span>
            </button>

            {/* Netflix */}
            <button
              onClick={() =>
                handleButtonClick(
                  'STREAM_NETFLIX',
                  () => {},
                  'click'
                )
              }
              className="bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-red-500 rounded-xl py-2 flex flex-col items-center justify-center active:scale-90"
            >
              <span className="text-xs font-black">NETFLIX</span>
              <span className="text-[6px] text-neutral-400">Movies & Series</span>
            </button>
          </div>
        </div>

        {/* 9. MEDIA PLAYBACK & DVR RECORD ROW */}
        <div className="pt-2.5">
          <div className="grid grid-cols-5 gap-1.5 text-neutral-300">
            <button
              onClick={() => handleButtonClick('REWIND_10S', () => {}, 'click')}
              className={`remote-button-tactile py-2 rounded-xl flex items-center justify-center text-neutral-400 hover:text-white ${glowClass}`}
              title="Skip Back 10s"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleButtonClick('PLAY', () => {}, 'click')}
              className={`remote-button-tactile py-2 rounded-xl flex items-center justify-center text-emerald-400 hover:text-white ${glowClass}`}
              title="Play"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
            </button>
            <button
              onClick={() => handleButtonClick('PAUSE', () => {}, 'click')}
              className={`remote-button-tactile py-2 rounded-xl flex items-center justify-center text-amber-400 hover:text-white ${glowClass}`}
              title="Pause"
            >
              <Pause className="w-3.5 h-3.5 fill-current" />
            </button>
            <button
              onClick={() => handleButtonClick('FORWARD_30S', () => {}, 'click')}
              className={`remote-button-tactile py-2 rounded-xl flex items-center justify-center text-neutral-400 hover:text-white ${glowClass}`}
              title="Skip Ahead 30s"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() =>
                handleButtonClick('RECORD', () => {}, 'beep', 'heavy')
              }
              className={`remote-button-tactile py-2 rounded-xl flex items-center justify-center text-red-500 hover:text-red-400 ${glowClass}`}
              title="Record"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 shadow-[0_0_6px_#ef4444]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
