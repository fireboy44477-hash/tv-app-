import React, { useState, useEffect } from 'react';
import { TVState, TVConfig, InputSource, LiveReaction } from './types/tv';
import { FujiRemoteControl } from './components/FujiRemoteControl';
import { TVSimulator } from './components/TVSimulator';
import { ProgramGuideModal } from './components/ProgramGuideModal';
import { PairingSettingsModal } from './components/PairingSettingsModal';
import { InstallPromptModal } from './components/InstallPromptModal';
import { StorePublishingHub } from './components/StorePublishingHub';
import { VoiceRemoteModal } from './components/VoiceRemoteModal';
import { NormalTVSetupModal } from './components/NormalTVSetupModal';
import { usePWAInstall } from './hooks/usePWAInstall';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { audioHaptics } from './utils/audioHaptics';
import { tvConnection } from './utils/tvConnection';
import {
  Tv,
  Smartphone,
  Calendar,
  Settings,
  Download,
  Volume2,
  VolumeX,
  WifiOff,
  Store,
  Mic,
  Package,
  Zap,
} from 'lucide-react';

type ActiveView = 'remote' | 'duo' | 'guide' | 'store';

export default function App() {
  const [activeView, setActiveView] = useState<ActiveView>('duo');
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isNormalTVModalOpen, setIsNormalTVModalOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(audioHaptics.isSoundEnabled());

  const { isInstalled } = usePWAInstall();
  const isOnline = useOnlineStatus();
  const [tvConfig, setTvConfig] = useState<TVConfig>(tvConnection.getConfig());

  // Master TV Receiver State
  const [tvState, setTvState] = useState<TVState>({
    power: true,
    currentChannel: 8, // FUJI TELEVISION DEFAULT
    volume: 24,
    isMuted: false,
    inputSource: 'TERRESTRIAL',
    subtitlesActive: false,
    audioTrack: 'main',
    screenEffect: 'none',
    liveReactions: [],
    cursorPos: null,
    dData: {
      isOpen: false,
      activeTab: 'janken',
      jankenScore: 320,
      jankenRound: 1,
      jankenState: 'ready',
      playerChoice: null,
      botChoice: null,
      jankenResult: null,
    },
  });

  // On mobile screens default to Duo or Remote
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setActiveView('duo');
    }
  }, []);

  const handleUpdateConfig = (partial: Partial<TVConfig>) => {
    setTvConfig(prev => ({ ...prev, ...partial }));
    tvConnection.updateConfig(partial);
  };

  const togglePower = () => {
    setTvState(prev => ({
      ...prev,
      power: !prev.power,
      dData: { ...prev.dData, isOpen: false },
    }));
  };

  const selectChannel = (ch: number) => {
    setTvState(prev => ({
      ...prev,
      power: true,
      currentChannel: ch,
    }));
  };

  const changeVolume = (delta: number) => {
    setTvState(prev => ({
      ...prev,
      volume: Math.max(0, Math.min(100, prev.volume + delta)),
      isMuted: false,
    }));
  };

  const toggleMute = () => {
    setTvState(prev => ({
      ...prev,
      isMuted: !prev.isMuted,
    }));
  };

  const selectInput = (input: InputSource) => {
    setTvState(prev => ({
      ...prev,
      inputSource: input,
    }));
  };

  const toggleSubtitles = () => {
    setTvState(prev => ({
      ...prev,
      subtitlesActive: !prev.subtitlesActive,
    }));
  };

  const toggleAudioTrack = () => {
    setTvState(prev => ({
      ...prev,
      audioTrack: prev.audioTrack === 'main' ? 'sub' : 'main',
    }));
  };

  const toggleDData = () => {
    setTvState(prev => ({
      ...prev,
      dData: {
        ...prev.dData,
        isOpen: !prev.dData.isOpen,
        jankenState: 'ready',
      },
    }));
  };

  const setDDataTab = (tab: 'weather' | 'news' | 'janken' | 'odaiba') => {
    setTvState(prev => ({
      ...prev,
      dData: {
        ...prev.dData,
        isOpen: true,
        activeTab: tab,
      },
    }));
  };

  // 4-Color Buttons Handler for Mezamashi Janken
  const handleColorButtonPress = (color: 'blue' | 'red' | 'green' | 'yellow') => {
    setTvState(prev => {
      const choices: ('rock' | 'scissors' | 'paper')[] = ['rock', 'scissors', 'paper'];
      let playerChoice: 'rock' | 'scissors' | 'paper';

      if (color === 'blue') playerChoice = 'rock';
      else if (color === 'red') playerChoice = 'scissors';
      else if (color === 'green') playerChoice = 'paper';
      else {
        playerChoice = 'rock';
      }

      const botChoice = choices[Math.floor(Math.random() * choices.length)];
      let result: 'win' | 'lose' | 'draw';

      if (playerChoice === botChoice) {
        result = 'draw';
      } else if (
        (playerChoice === 'rock' && botChoice === 'scissors') ||
        (playerChoice === 'scissors' && botChoice === 'paper') ||
        (playerChoice === 'paper' && botChoice === 'rock')
      ) {
        result = 'win';
      } else {
        result = 'lose';
      }

      const pointDelta = result === 'win' ? 100 : result === 'draw' ? 50 : 20;

      return {
        ...prev,
        dData: {
          ...prev.dData,
          isOpen: true,
          activeTab: 'janken',
          jankenState: 'revealed',
          playerChoice,
          botChoice,
          jankenResult: result,
          jankenScore: prev.dData.jankenScore + pointDelta,
          jankenRound: prev.dData.jankenRound + 1,
        },
      };
    });
  };

  // Live Cheering Reactions Barrage
  const handleSendReaction = (emoji: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    const x = 10 + Math.random() * 80;
    const reaction: LiveReaction = { id, emoji, x };

    setTvState(prev => ({
      ...prev,
      liveReactions: [...(prev.liveReactions || []), reaction],
    }));

    audioHaptics.playClick();
    audioHaptics.triggerHaptic('light');

    setTimeout(() => {
      setTvState(prev => ({
        ...prev,
        liveReactions: (prev.liveReactions || []).filter(r => r.id !== id),
      }));
    }, 2400);
  };

  // Magic Trackpad cursor positioning
  const handleCursorMove = (x: number, y: number) => {
    setTvState(prev => ({
      ...prev,
      cursorPos: { x, y },
    }));
  };

  // Voice command dispatcher
  const handleExecuteVoiceCommand = (cmd: string) => {
    if (cmd === 'CH_8') selectChannel(8);
    else if (cmd === 'OPEN_JANKEN') setDDataTab('janken');
    else if (cmd === 'OPEN_WEATHER') setDDataTab('weather');
    else if (cmd === 'OPEN_NEWS') setDDataTab('news');
    else if (cmd === 'MUTE') toggleMute();
    else if (cmd === 'VOL_UP_10') changeVolume(10);
    else if (cmd === 'TOGGLE_CC') toggleSubtitles();
    else if (cmd === 'STREAM_FOD') selectChannel(8);
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    audioHaptics.setSoundEnabled(next);
    handleUpdateConfig({ soundEnabled: next });
  };

  const toggleRemoteMode = () => {
    const next = tvConfig.remoteMode === 'keypad' ? 'touchpad' : 'keypad';
    handleUpdateConfig({ remoteMode: next });
  };

  const toggleBacklight = () => {
    handleUpdateConfig({ backlightEnabled: !tvConfig.backlightEnabled });
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col antialiased selection:bg-red-600 selection:text-white">
      {/* 1. TOP GLOBAL NAVIGATION & SYSTEM HEADER */}
      <header className="sticky top-0 z-30 bg-neutral-900/90 backdrop-blur-xl border-b border-neutral-800 px-3 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Brand Logo & Station ID */}
          <div className="flex items-center gap-2.5">
            <div className="relative w-8 h-8 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 p-0.5 shadow-lg shadow-red-900/40 flex items-center justify-center font-black text-white text-base">
              8
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-yellow-400 rounded-full border-2 border-neutral-900"></span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-sm sm:text-base tracking-tight text-white">
                  Fuji TV Remote
                </h1>
                <span className="hidden sm:inline-block bg-red-600/30 text-red-400 border border-red-500/30 text-[9px] font-bold px-1.5 py-0.2 rounded font-mono">
                  CX-8
                </span>
                <span className="hidden md:inline-block bg-amber-950 text-amber-300 border border-amber-500/40 text-[9px] font-bold px-1.5 py-0.2 rounded font-mono">
                  Universal IR
                </span>
              </div>
              <p className="text-[10px] text-neutral-400 font-medium hidden sm:block">
                Universal Physical TV & Smart Companion Remote
              </p>
            </div>
          </div>

          {/* Center View Selector Tabs */}
          <div className="flex items-center bg-neutral-950 p-1 rounded-2xl border border-neutral-800 text-xs">
            <button
              onClick={() => {
                setActiveView('duo');
                audioHaptics.playClick();
              }}
              className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
                activeView === 'duo'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">TV + Remote</span>
              <span className="sm:hidden">Duo</span>
            </button>
            <button
              onClick={() => {
                setActiveView('remote');
                audioHaptics.playClick();
              }}
              className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
                activeView === 'remote'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Remote</span>
            </button>
            <button
              onClick={() => {
                setActiveView('guide');
                audioHaptics.playClick();
              }}
              className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
                activeView === 'guide'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>TV Guide</span>
            </button>
            <button
              onClick={() => {
                setActiveView('store');
                audioHaptics.playClick();
              }}
              className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
                activeView === 'store'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Package className="w-3.5 h-3.5 text-emerald-300" />
              <span className="hidden sm:inline">Play Store Hub</span>
              <span className="sm:hidden">Publish</span>
            </button>
          </div>

          {/* Right Action Icons & Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Normal TV Setup Wizard Button */}
            <button
              onClick={() => setIsNormalTVModalOpen(true)}
              className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95"
              title="Setup Physical Normal TV IR Control"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Normal TV IR</span>
            </button>

            {/* AI Voice Remote Trigger */}
            <button
              onClick={() => setIsVoiceModalOpen(true)}
              className="bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/40 p-2 rounded-xl transition active:scale-95"
              title="AI Voice Assistant Remote"
            >
              <Mic className="w-4 h-4" />
            </button>

            {/* Install PWA Button */}
            <button
              onClick={() => setIsInstallModalOpen(true)}
              className="bg-neutral-800 hover:bg-neutral-750 text-white text-xs font-bold px-2.5 sm:px-3 py-1.5 rounded-xl border border-neutral-700 flex items-center gap-1.5 shadow transition active:scale-95"
              title="Install Fuji TV Remote on iOS / Android"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">
                {isInstalled ? 'Installed' : 'Download App'}
              </span>
              <span className="sm:hidden">Install</span>
            </button>

            {/* Sound Mute / Unmute Toggle */}
            <button
              onClick={toggleSound}
              className="p-2 rounded-xl bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700 transition"
              title={soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-neutral-500" />
              )}
            </button>

            {/* Settings Modal Button */}
            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="p-2 rounded-xl bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700 transition"
              title="Settings & TV Pairing"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Offline Status Warning Bar */}
      {!isOnline && (
        <div className="bg-amber-600 text-white text-xs font-bold py-1 px-4 text-center flex items-center justify-center gap-2">
          <WifiOff className="w-3.5 h-3.5" />
          <span>Offline Mode active (Local remote caching ensures full functionality without network connection)</span>
        </div>
      )}

      {/* 2. MAIN WORKSPACE CONTENT */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 flex flex-col justify-center">
        {/* VIEW A: TV + REMOTE DUO MODE */}
        {activeView === 'duo' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Simulated TV Screen & d-Data Broadcast */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-4">
              <TVSimulator
                tvState={tvState}
                onColorButtonPress={handleColorButtonPress}
                onCloseDData={() =>
                  setTvState(prev => ({
                    ...prev,
                    dData: { ...prev.dData, isOpen: false },
                  }))
                }
                onSetDDataTab={setDDataTab}
                onSendReaction={handleSendReaction}
              />

              {/* Station Feature Card & Quick Guide */}
              <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-neutral-300">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 font-black text-lg">
                    8
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">
                      Fuji Television Network Inc. (JOCX-DTV)
                    </h4>
                    <p className="text-[11px] text-neutral-400">
                      Channel ID: 8 • Broadcast Center: Odaiba, Minato City, Tokyo, Japan
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => selectChannel(8)}
                    className="flex-1 sm:flex-initial bg-red-600 hover:bg-red-500 text-white font-bold py-1.5 px-3 rounded-xl shadow text-xs transition"
                  >
                    Tune to Ch 8
                  </button>
                  <button
                    onClick={() => setIsNormalTVModalOpen(true)}
                    className="flex-1 sm:flex-initial bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold py-1.5 px-3 rounded-xl text-xs transition flex items-center justify-center gap-1"
                  >
                    <Tv className="w-3.5 h-3.5 text-amber-400" />
                    Control Normal TV
                  </button>
                  <button
                    onClick={() => setIsGuideModalOpen(true)}
                    className="flex-1 sm:flex-initial bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold py-1.5 px-3 rounded-xl border border-neutral-700 text-xs transition"
                  >
                    EPG Schedule
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Authentic Fuji Remote Controller */}
            <div className="lg:col-span-5 xl:col-span-4 flex justify-center">
              <FujiRemoteControl
                tvState={tvState}
                onPowerToggle={togglePower}
                onChannelSelect={selectChannel}
                onVolumeChange={changeVolume}
                onMuteToggle={toggleMute}
                onInputSelect={selectInput}
                onSubtitlesToggle={toggleSubtitles}
                onAudioTrackToggle={toggleAudioTrack}
                onToggleDData={toggleDData}
                onColorButtonPress={handleColorButtonPress}
                onOpenEPG={() => setIsGuideModalOpen(true)}
                onOpenVoiceRemote={() => setIsVoiceModalOpen(true)}
                onOpenNormalTVSetup={() => setIsNormalTVModalOpen(true)}
                normalTVBrandName={tvConfig.normalTV?.brandId?.toUpperCase()}
                onSendReaction={handleSendReaction}
                remoteMode={tvConfig.remoteMode}
                onToggleRemoteMode={toggleRemoteMode}
                backlightActive={tvConfig.backlightEnabled}
                onToggleBacklight={toggleBacklight}
                onCursorMove={handleCursorMove}
                remoteTheme={tvConfig.remoteTheme}
              />
            </div>
          </div>
        )}

        {/* VIEW B: REMOTE ONLY */}
        {activeView === 'remote' && (
          <div className="flex flex-col items-center justify-center py-2 sm:py-6">
            <div className="text-center mb-4">
              <span className="text-[11px] text-red-400 font-bold uppercase tracking-wider block">
                SMART & UNIVERSAL NORMAL TV CONTROLLER
              </span>
              <h2 className="text-lg font-black text-white">Fuji TV Dedicated Remote</h2>
              <p className="text-xs text-neutral-400">
                Controls both your phone's receiver and physical televisions via Universal IR
              </p>
            </div>

            <FujiRemoteControl
              tvState={tvState}
              onPowerToggle={togglePower}
              onChannelSelect={selectChannel}
              onVolumeChange={changeVolume}
              onMuteToggle={toggleMute}
              onInputSelect={selectInput}
              onSubtitlesToggle={toggleSubtitles}
              onAudioTrackToggle={toggleAudioTrack}
              onToggleDData={toggleDData}
              onColorButtonPress={handleColorButtonPress}
              onOpenEPG={() => setIsGuideModalOpen(true)}
              onOpenVoiceRemote={() => setIsVoiceModalOpen(true)}
              onOpenNormalTVSetup={() => setIsNormalTVModalOpen(true)}
              normalTVBrandName={tvConfig.normalTV?.brandId?.toUpperCase()}
              onSendReaction={handleSendReaction}
              remoteMode={tvConfig.remoteMode}
              onToggleRemoteMode={toggleRemoteMode}
              backlightActive={tvConfig.backlightEnabled}
              onToggleBacklight={toggleBacklight}
              onCursorMove={handleCursorMove}
              remoteTheme={tvConfig.remoteTheme}
            />
          </div>
        )}

        {/* VIEW C: EPG PROGRAM GUIDE */}
        {activeView === 'guide' && (
          <div className="w-full max-w-4xl mx-auto py-2">
            <ProgramGuideModal
              isOpen={true}
              onClose={() => setActiveView('duo')}
              onSelectChannel={ch => {
                selectChannel(ch);
                setActiveView('duo');
              }}
            />
          </div>
        )}

        {/* VIEW D: STORE PUBLISHING HUB */}
        {activeView === 'store' && <StorePublishingHub />}
      </main>

      {/* 3. MODALS */}
      <NormalTVSetupModal
        isOpen={isNormalTVModalOpen}
        onClose={() => setIsNormalTVModalOpen(false)}
        normalConfig={tvConfig.normalTV}
        onUpdateNormalConfig={partial =>
          handleUpdateConfig({ normalTV: { ...tvConfig.normalTV, ...partial } })
        }
      />

      <InstallPromptModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />

      <VoiceRemoteModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onExecuteCommand={handleExecuteVoiceCommand}
      />

      <PairingSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        config={tvConfig}
        onUpdateConfig={handleUpdateConfig}
      />

      {isGuideModalOpen && (
        <ProgramGuideModal
          isOpen={isGuideModalOpen}
          onClose={() => setIsGuideModalOpen(false)}
          onSelectChannel={ch => {
            selectChannel(ch);
            setIsGuideModalOpen(false);
          }}
        />
      )}

      {/* 4. FOOTER */}
      <footer className="border-t border-neutral-900 bg-neutral-950 py-3 px-4 text-center text-[11px] text-neutral-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-neutral-400">Fuji TV Remote PWA</span>
            <span>•</span>
            <span className="text-emerald-400 font-medium">Universal Normal TV & Play Store Packaging Ready</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsNormalTVModalOpen(true)}
              className="text-amber-400 hover:text-amber-300 underline font-bold"
            >
              Normal TV Universal IR Setup
            </button>
            <button
              onClick={() => setActiveView('store')}
              className="hover:text-emerald-400 text-emerald-300 underline font-bold"
            >
              Export Play Store Package (.ZIP)
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
