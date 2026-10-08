import React, { useState, useEffect } from 'react';
import { TVState } from '../types/tv';
import { CHANNELS, FUJI_PROGRAMS, OTHER_CHANNEL_PROGRAMS, ODAIBA_WEATHER, FUJI_NEWS_TICKER } from '../utils/tvChannels';
import { Volume2, VolumeX, Radio, Tv, Sun, CloudRain, Wind, Sparkles, Trophy } from 'lucide-react';

interface TVSimulatorProps {
  tvState: TVState;
  onColorButtonPress: (color: 'blue' | 'red' | 'green' | 'yellow') => void;
  onCloseDData: () => void;
  onSetDDataTab: (tab: 'weather' | 'news' | 'janken' | 'odaiba') => void;
  onSendReaction?: (emoji: string) => void;
}

export const TVSimulator: React.FC<TVSimulatorProps> = ({
  tvState,
  onColorButtonPress,
  onCloseDData,
  onSetDDataTab,
  onSendReaction,
}) => {
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [showVolumeBanner, setShowVolumeBanner] = useState(false);
  const [fujiProgramIndex, setFujiProgramIndex] = useState(0);

  // Clock in Tokyo (JST)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
      setCurrentDate(
        now.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          weekday: 'short',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Cycle through Fuji TV shows if on channel 8
  useEffect(() => {
    const timer = setInterval(() => {
      setFujiProgramIndex(prev => (prev + 1) % FUJI_PROGRAMS.length);
    }, 45000);
    return () => clearInterval(timer);
  }, []);

  // Show volume banner briefly when volume or mute state changes
  useEffect(() => {
    if (!tvState.power) return;
    setShowVolumeBanner(true);
    const t = setTimeout(() => setShowVolumeBanner(false), 2400);
    return () => clearTimeout(t);
  }, [tvState.volume, tvState.isMuted]);

  const currentChannelInfo = CHANNELS.find(c => c.number === tvState.currentChannel) || CHANNELS[7];
  const isFuji = currentChannelInfo.number === 8;
  const currentProgram = isFuji
    ? FUJI_PROGRAMS[fujiProgramIndex]
    : OTHER_CHANNEL_PROGRAMS[tvState.currentChannel] || {
        id: 'generic',
        channelNumber: tvState.currentChannel,
        title: `${currentChannelInfo.name} Digital Broadcast`,
        genre: 'General Program',
        timeSlot: 'On Air',
        description: 'High-definition digital television broadcast feed.',
        hasSubtitles: false,
        hasBilingual: false,
        hasDataBroadcast: false,
      };

  return (
    <div className="relative w-full max-w-2xl mx-auto rounded-2xl overflow-hidden bg-black border-4 border-neutral-800 shadow-2xl transition-all">
      {/* Top TV Frame Bezel & Model Mark */}
      <div className="bg-neutral-900/90 px-3 py-1.5 flex items-center justify-between text-[11px] text-neutral-400 border-b border-neutral-800 select-none">
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-bold tracking-wider text-neutral-200">FUJI-VISION 4K OLED</span>
          <span className="text-[9px] bg-red-600/90 text-white px-1.5 py-0.2 rounded font-mono font-bold">
            CX-081
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-neutral-400 font-mono text-[10px]">
            {tvState.inputSource} • 1080p@60Hz
          </span>
          <div className="flex items-center gap-1">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                tvState.power ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-red-500 shadow-[0_0_8px_#ef4444]'
              }`}
            ></span>
            <span className="text-[10px]">{tvState.power ? 'ON' : 'STANDBY'}</span>
          </div>
        </div>
      </div>

      {/* Screen Display Area (16:9 Aspect Ratio) */}
      <div className="relative aspect-video w-full bg-neutral-950 flex items-center justify-center overflow-hidden">
        {/* If Power is OFF */}
        {!tvState.power && (
          <div className="w-full h-full flex flex-col items-center justify-center bg-radial from-neutral-900 to-black text-neutral-600 select-none">
            <Tv className="w-12 h-12 stroke-[1.2] opacity-30 mb-2" />
            <p className="text-xs font-mono tracking-widest text-neutral-500">STANDBY (POWER OFF)</p>
            <p className="text-[11px] text-neutral-600 mt-1">Press the POWER button on the remote to turn on</p>
          </div>
        )}

        {/* If Power is ON */}
        {tvState.power && (
          <div className="relative w-full h-full flex flex-col justify-between p-3 select-none overflow-hidden">
            {/* Visual broadcast backdrop animated gradient */}
            <div
              className={`absolute inset-0 transition-colors duration-1000 ${
                isFuji
                  ? fujiProgramIndex === 0
                    ? 'bg-gradient-to-br from-amber-900/40 via-sky-950/60 to-neutral-950'
                    : fujiProgramIndex === 1
                    ? 'bg-gradient-to-br from-orange-950/40 via-rose-950/50 to-neutral-950'
                    : fujiProgramIndex === 2
                    ? 'bg-gradient-to-br from-blue-950/60 via-red-950/40 to-neutral-950'
                    : fujiProgramIndex === 3
                    ? 'bg-gradient-to-br from-amber-950/40 via-orange-950/40 to-neutral-950'
                    : fujiProgramIndex === 4
                    ? 'bg-gradient-to-br from-pink-950/40 via-purple-950/50 to-neutral-950'
                    : fujiProgramIndex === 5
                    ? 'bg-gradient-to-br from-emerald-950/50 via-blue-950/60 to-neutral-950'
                    : 'bg-gradient-to-br from-indigo-950/50 via-slate-950 to-neutral-950'
                  : 'bg-gradient-to-br from-slate-900 via-neutral-900 to-neutral-950'
              }`}
            />

            {/* Subtle animated scanline or broadcast texture */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none opacity-40"></div>

            {/* Top OSD Bar: Channel Badge + Clock */}
            <div className="relative z-10 flex items-start justify-between">
              {/* Channel Identification */}
              <div className="flex items-center gap-2">
                <div
                  className={`flex items-center px-2 py-0.5 rounded shadow-lg backdrop-blur-md ${
                    isFuji
                      ? 'bg-red-600/90 border border-red-400/30 text-white'
                      : 'bg-neutral-800/80 border border-neutral-700 text-neutral-200'
                  }`}
                >
                  <span className="text-base font-black tracking-tight mr-1 font-mono">
                    {String(currentChannelInfo.number).padStart(2, '0')}
                  </span>
                  <div className="flex flex-col leading-none">
                    <span className="text-[11px] font-bold">{currentChannelInfo.name}</span>
                    <span className="text-[8px] opacity-80 font-mono tracking-wider">
                      {isFuji ? 'FUJI TELEVISION CX' : 'DIGITAL TV'}
                    </span>
                  </div>
                </div>

                {isFuji && (
                  <span className="text-[10px] bg-red-950/60 border border-red-500/40 text-red-300 font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                    <Radio className="w-3 h-3 text-red-400 animate-pulse" />
                    LIVE ON AIR
                  </span>
                )}
              </div>

              {/* Timestamp */}
              <div className="bg-black/60 backdrop-blur-md border border-neutral-700/60 px-2 py-0.5 rounded text-right shadow-md">
                <div className="text-[13px] font-bold font-mono text-neutral-100 tracking-wider">
                  {currentTime} JST
                </div>
                <div className="text-[9px] text-neutral-400 font-medium">
                  {currentDate} • Tokyo Odaiba HQ
                </div>
              </div>
            </div>

            {/* Center Stage: Simulated Broadcast Visuals */}
            <div className="relative z-10 my-auto text-center px-4">
              {isFuji ? (
                <div className="space-y-1.5">
                  {/* Fuji TV Show Category Icon */}
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-600/20 border border-red-500/30 text-red-300 text-[11px] font-medium shadow-sm">
                    <Sparkles className="w-3 h-3 text-yellow-400" />
                    {currentProgram.genre}
                  </div>

                  {/* Program Title */}
                  <h2 className="text-lg md:text-xl font-extrabold text-white tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                    {currentProgram.title}
                  </h2>

                  {/* Show Description */}
                  <p className="text-xs text-neutral-300 max-w-lg mx-auto line-clamp-2 leading-relaxed drop-shadow">
                    {currentProgram.description}
                  </p>

                  {/* Cast Info */}
                  {currentProgram.cast && (
                    <div className="flex items-center justify-center gap-2 text-[10px] text-neutral-400">
                      <span className="text-neutral-500">Cast:</span>
                      {currentProgram.cast.slice(0, 3).map((person, idx) => (
                        <span key={idx} className="bg-neutral-800/60 px-1.5 py-0.5 rounded">
                          {person}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Live d-data notification callout */}
                  <div className="pt-2 flex justify-center">
                    <button
                      onClick={() => onSetDDataTab('janken')}
                      className="inline-flex items-center gap-1.5 bg-gradient-to-r from-red-600/90 to-rose-600/90 hover:from-red-500 hover:to-rose-500 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-lg border border-red-400/40 transition transform active:scale-95"
                    >
                      <span className="bg-yellow-400 text-black text-[9px] px-1 py-0.2 rounded font-black">
                        d
                      </span>
                      Press [d] on remote to join interactive broadcast game!
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-xs text-neutral-400 font-medium">
                    {currentProgram.timeSlot}
                  </div>
                  <h2 className="text-lg font-bold text-white drop-shadow">
                    {currentProgram.title}
                  </h2>
                  <p className="text-xs text-neutral-300 max-w-md mx-auto">
                    {currentProgram.description}
                  </p>
                  <p className="text-[11px] text-red-400 font-medium pt-2">
                    💡 Press [8] on the remote to switch directly to Fuji Television
                  </p>
                </div>
              )}
            </div>

            {/* Subtitles OSD Overlay if active */}
            {tvState.subtitlesActive && (
              <div className="relative z-15 self-center bg-black/85 border border-yellow-500/40 text-yellow-300 text-xs px-3 py-1 rounded shadow-lg mb-1 tracking-wide font-medium">
                [CC] Welcome to Fuji Television. Thank you for watching live with us today!
              </div>
            )}

            {/* Bottom Status Ticker */}
            <div className="relative z-10 flex items-center justify-between text-[10px] text-neutral-300 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg border border-neutral-800/80">
              <div className="flex items-center gap-2 overflow-hidden flex-1 mr-2">
                <span className="bg-red-600 text-white font-bold text-[9px] px-1 rounded flex-shrink-0">
                  FNN
                </span>
                <div className="truncate text-neutral-200">
                  {FUJI_NEWS_TICKER[fujiProgramIndex % FUJI_NEWS_TICKER.length]}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {tvState.subtitlesActive && (
                  <span className="bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 px-1 rounded font-bold text-[9px]">
                    CC ON
                  </span>
                )}
                <span className="bg-neutral-800 text-neutral-300 px-1 rounded font-mono text-[9px]">
                  {tvState.audioTrack === 'main' ? 'Main Stereo' : 'Sub Commentary'}
                </span>
                <span className="bg-red-950/80 text-red-300 border border-red-500/30 px-1 rounded font-bold text-[9px]">
                  d-Data Ready
                </span>
              </div>
            </div>

            {/* Volume OSD Banner Pop-up */}
            {showVolumeBanner && (
              <div className="absolute top-10 left-1/2 -translate-x-1/2 z-30 bg-black/85 backdrop-blur-md border border-neutral-700 px-4 py-2 rounded-xl shadow-2xl flex items-center gap-3">
                {tvState.isMuted || tvState.volume === 0 ? (
                  <VolumeX className="w-5 h-5 text-red-400" />
                ) : (
                  <Volume2 className="w-5 h-5 text-emerald-400" />
                )}
                <div className="w-32 bg-neutral-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-150 ${
                      tvState.isMuted ? 'bg-neutral-600' : 'bg-emerald-400'
                    }`}
                    style={{ width: `${tvState.isMuted ? 0 : tvState.volume}%` }}
                  />
                </div>
                <span className="font-mono font-bold text-xs text-white min-w-[20px]">
                  {tvState.isMuted ? 'MUTED' : tvState.volume}
                </span>
              </div>
            )}

            {/* Live Floating Audience Reactions Barrage */}
            {tvState.liveReactions?.map(r => (
              <div
                key={r.id}
                className="absolute bottom-8 text-2xl sm:text-3xl pointer-events-none animate-bounce z-25 drop-shadow-lg"
                style={{
                  left: `${r.x}%`,
                }}
              >
                {r.emoji}
              </div>
            ))}

            {/* Magic Pointer Cursor if Active */}
            {tvState.cursorPos && (
              <div
                className="absolute w-6 h-6 -ml-3 -mt-3 rounded-full border-2 border-red-500 bg-red-500/30 shadow-[0_0_12px_#ef4444] z-35 pointer-events-none transition-all duration-75 flex items-center justify-center"
                style={{
                  left: `${tvState.cursorPos.x}%`,
                  top: `${tvState.cursorPos.y}%`,
                }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-white shadow" />
              </div>
            )}

            {/* Full d-Data Interactive Broadcast Overlay */}
            {tvState.dData.isOpen && (
              <div className="absolute inset-2 z-40 bg-neutral-900/95 backdrop-blur-xl border border-neutral-700/80 rounded-xl p-3 shadow-2xl flex flex-col justify-between text-neutral-100 animate-in fade-in zoom-in-95 duration-200">
                {/* d-Data Header */}
                <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-red-600 text-white font-black text-xs px-2 py-0.5 rounded shadow">
                      d DATA
                    </span>
                    <span className="font-bold text-sm tracking-wide">
                      Fuji TV Interactive Hybridcast
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-neutral-400">
                      Press [d] or [BACK] on remote to close
                    </span>
                    <button
                      onClick={onCloseDData}
                      className="text-xs bg-neutral-800 hover:bg-neutral-700 px-2 py-0.5 rounded text-neutral-300 font-bold"
                    >
                      ✕ Close
                    </button>
                  </div>
                </div>

                {/* d-Data Tabs */}
                <div className="flex gap-1 border-b border-neutral-800 py-1.5 text-xs">
                  <button
                    onClick={() => onSetDDataTab('janken')}
                    className={`px-3 py-1 rounded font-bold transition flex items-center gap-1 ${
                      tvState.dData.activeTab === 'janken'
                        ? 'bg-red-600 text-white shadow'
                        : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                    }`}
                  >
                    <Trophy className="w-3.5 h-3.5" />
                    Mezamashi Janken (Game)
                  </button>
                  <button
                    onClick={() => onSetDDataTab('weather')}
                    className={`px-3 py-1 rounded font-bold transition flex items-center gap-1 ${
                      tvState.dData.activeTab === 'weather'
                        ? 'bg-blue-600 text-white shadow'
                        : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5" />
                    Odaiba / Tokyo Weather
                  </button>
                  <button
                    onClick={() => onSetDDataTab('news')}
                    className={`px-3 py-1 rounded font-bold transition flex items-center gap-1 ${
                      tvState.dData.activeTab === 'news'
                        ? 'bg-emerald-600 text-white shadow'
                        : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                    }`}
                  >
                    FNN News Flash
                  </button>
                  <button
                    onClick={() => onSetDDataTab('odaiba')}
                    className={`px-3 py-1 rounded font-bold transition flex items-center gap-1 ${
                      tvState.dData.activeTab === 'odaiba'
                        ? 'bg-purple-600 text-white shadow'
                        : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                    }`}
                  >
                    Fuji TV HQ Guide
                  </button>
                </div>

                {/* d-Data Body Content */}
                <div className="flex-1 py-2 overflow-y-auto">
                  {/* TAB 1: Mezamashi Janken Interactive Game */}
                  {tvState.dData.activeTab === 'janken' && (
                    <div className="h-full flex flex-col justify-between bg-neutral-950/60 rounded-lg p-3 border border-neutral-800">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs text-yellow-400 font-bold flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5" />
                            Viewer Interactive Game Show
                          </div>
                          <h3 className="text-base font-extrabold text-white">
                            Mezamashi Janken (Rock-Paper-Scissors)
                          </h3>
                        </div>
                        <div className="bg-yellow-500/10 border border-yellow-500/30 px-3 py-1 rounded-lg text-right">
                          <span className="text-[10px] text-yellow-300/80 block">Earned Points</span>
                          <span className="text-lg font-black font-mono text-yellow-400">
                            {tvState.dData.jankenScore} pts
                          </span>
                        </div>
                      </div>

                      {/* Janken Arena */}
                      <div className="my-2 p-3 bg-neutral-900/90 rounded-lg border border-neutral-700/60 text-center">
                        {tvState.dData.jankenState === 'ready' && (
                          <div className="space-y-1">
                            <p className="text-sm font-bold text-amber-300">
                              "Mezamashi Janken, Janken... GO!"
                            </p>
                            <p className="text-xs text-neutral-300">
                              Use the 4-Color Buttons on your remote to make your move!
                            </p>
                          </div>
                        )}

                        {tvState.dData.jankenState === 'revealed' && (
                          <div className="space-y-2 animate-in fade-in zoom-in-95">
                            <div className="flex items-center justify-center gap-6">
                              <div className="text-center">
                                <span className="text-[10px] text-neutral-400 block mb-1">You</span>
                                <span className="text-3xl">
                                  {tvState.dData.playerChoice === 'rock' && '✊ Rock'}
                                  {tvState.dData.playerChoice === 'scissors' && '✌️ Scissors'}
                                  {tvState.dData.playerChoice === 'paper' && '✋ Paper'}
                                </span>
                              </div>
                              <span className="text-xl font-bold text-neutral-500">VS</span>
                              <div className="text-center">
                                <span className="text-[10px] text-neutral-400 block mb-1">Fuji TV</span>
                                <span className="text-3xl">
                                  {tvState.dData.botChoice === 'rock' && '✊ Rock'}
                                  {tvState.dData.botChoice === 'scissors' && '✌️ Scissors'}
                                  {tvState.dData.botChoice === 'paper' && '✋ Paper'}
                                </span>
                              </div>
                            </div>

                            <div
                              className={`text-sm font-black py-1 px-3 rounded-full inline-block ${
                                tvState.dData.jankenResult === 'win'
                                  ? 'bg-yellow-500 text-black shadow-lg animate-bounce'
                                  : tvState.dData.jankenResult === 'lose'
                                  ? 'bg-neutral-800 text-neutral-300'
                                  : 'bg-blue-600 text-white'
                              }`}
                            >
                              {tvState.dData.jankenResult === 'win' && '🎉 You Won! (+100 pts)'}
                              {tvState.dData.jankenResult === 'lose' && '😢 You Lost... (+20 pts)'}
                              {tvState.dData.jankenResult === 'draw' && '🤝 It’s a Draw! (+50 pts)'}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* 4-Color Button Direct Guidance */}
                      <div className="grid grid-cols-4 gap-1.5 text-center text-xs">
                        <button
                          onClick={() => onColorButtonPress('blue')}
                          className="bg-blue-600 hover:bg-blue-500 text-white p-1.5 rounded-lg font-bold flex flex-col items-center shadow"
                        >
                          <span className="text-[10px] opacity-80">[BLUE] Key</span>
                          <span className="text-sm font-black">✊ Rock</span>
                        </button>
                        <button
                          onClick={() => onColorButtonPress('red')}
                          className="bg-red-600 hover:bg-red-500 text-white p-1.5 rounded-lg font-bold flex flex-col items-center shadow"
                        >
                          <span className="text-[10px] opacity-80">[RED] Key</span>
                          <span className="text-sm font-black">✌️ Scissors</span>
                        </button>
                        <button
                          onClick={() => onColorButtonPress('green')}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white p-1.5 rounded-lg font-bold flex flex-col items-center shadow"
                        >
                          <span className="text-[10px] opacity-80">[GREEN] Key</span>
                          <span className="text-sm font-black">✋ Paper</span>
                        </button>
                        <button
                          onClick={() => onColorButtonPress('yellow')}
                          className="bg-yellow-500 hover:bg-yellow-400 text-neutral-950 p-1.5 rounded-lg font-bold flex flex-col items-center shadow"
                        >
                          <span className="text-[10px] opacity-80">[YELLOW] Key</span>
                          <span className="text-sm font-black">⭐ Bonus</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: Weather */}
                  {tvState.dData.activeTab === 'weather' && (
                    <div className="bg-neutral-950/60 rounded-lg p-3 border border-neutral-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-[11px] text-blue-400 font-bold">
                            Japan Meteorological Agency & Fuji TV Sensor
                          </div>
                          <h4 className="text-sm font-bold text-white">{ODAIBA_WEATHER.city}</h4>
                        </div>
                        <div className="text-2xl font-black text-amber-400">
                          {ODAIBA_WEATHER.temp}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-[11px] text-neutral-300 pt-1">
                        <div className="bg-neutral-900 p-2 rounded border border-neutral-800 flex items-center gap-1.5">
                          <Sun className="w-4 h-4 text-amber-400" />
                          <div>
                            <span className="text-neutral-500 block text-[9px]">Condition</span>
                            <span className="font-bold">{ODAIBA_WEATHER.condition}</span>
                          </div>
                        </div>
                        <div className="bg-neutral-900 p-2 rounded border border-neutral-800 flex items-center gap-1.5">
                          <CloudRain className="w-4 h-4 text-blue-400" />
                          <div>
                            <span className="text-neutral-500 block text-[9px]">Rain Chance</span>
                            <span className="font-bold">{ODAIBA_WEATHER.rainChance}</span>
                          </div>
                        </div>
                        <div className="bg-neutral-900 p-2 rounded border border-neutral-800 flex items-center gap-1.5">
                          <Wind className="w-4 h-4 text-teal-400" />
                          <div>
                            <span className="text-neutral-500 block text-[9px]">Wind Speed</span>
                            <span className="font-bold">{ODAIBA_WEATHER.wind}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-neutral-900/80 p-2 rounded text-[10px] text-neutral-300 border border-neutral-800">
                        🔭 <strong>Observation Deck:</strong> {ODAIBA_WEATHER.hachitamaObservation}
                      </div>
                    </div>
                  )}

                  {/* TAB 3: FNN News */}
                  {tvState.dData.activeTab === 'news' && (
                    <div className="bg-neutral-950/60 rounded-lg p-3 border border-neutral-800 space-y-1.5">
                      <div className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                        <Radio className="w-3.5 h-3.5" />
                        FNN (Fuji News Network) Latest Breaking Flash
                      </div>
                      <div className="space-y-1.5 pt-1">
                        {FUJI_NEWS_TICKER.map((item, idx) => (
                          <div
                            key={idx}
                            className="bg-neutral-900 p-2 rounded border border-neutral-800/80 text-xs text-neutral-200 flex items-start gap-2"
                          >
                            <span className="text-[10px] font-mono text-emerald-400 font-bold">
                              0{idx + 1}
                            </span>
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB 4: Headquarters Hachitama */}
                  {tvState.dData.activeTab === 'odaiba' && (
                    <div className="bg-neutral-950/60 rounded-lg p-3 border border-neutral-800 space-y-2 text-xs">
                      <h4 className="font-bold text-purple-300 flex items-center gap-1">
                        🌐 Odaiba Fuji Television Headquarters (FCG Building) Guide
                      </h4>
                      <p className="text-neutral-300 text-[11px] leading-relaxed">
                        Designed by renowned architect Kenzo Tange. Featuring the famous 32-meter titanium sphere "Hachitama" observatory with 270-degree views of Rainbow Bridge, Tokyo Tower, and Mount Fuji.
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-[10px]">
                        <div className="bg-neutral-900 p-2 rounded border border-neutral-800">
                          <span className="text-neutral-400 block font-semibold">Spherical Observatory Hachitama</span>
                          <span className="text-white">Hours: 10:00 - 18:00 (Closed Mondays)</span>
                        </div>
                        <div className="bg-neutral-900 p-2 rounded border border-neutral-800">
                          <span className="text-neutral-400 block font-semibold">Fuji TV Official Store "Fujisan"</span>
                          <span className="text-white">Exclusive anime merchandise & broadcast souvenirs</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* d-Data Footer Instructions */}
                <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-[10px] text-neutral-400">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>Blue
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-red-500"></span>Red
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>Green
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-yellow-500"></span>Yellow
                    </span>
                    <span>Interactive Functions</span>
                  </div>
                  <span className="font-mono text-neutral-500">BML 3.0 / Hybridcast 2.1</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* TV Screen Stand / Lower Bar with Reaction Cheering Buttons */}
      <div className="bg-neutral-900 px-3 py-1.5 flex flex-wrap items-center justify-between border-t border-neutral-800/80 text-[10px] text-neutral-400 gap-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-neutral-300">CX Channel 8</span>
          <span className="text-neutral-600">•</span>
          <span className="text-neutral-400">Live Reactions:</span>
          {onSendReaction && (
            <div className="flex items-center gap-1">
              {['🔥', '👏', '❤️', '🎉', '🇯🇵'].map(em => (
                <button
                  key={em}
                  onClick={() => onSendReaction(em)}
                  className="bg-neutral-800 hover:bg-neutral-750 p-1 rounded-lg text-xs transition active:scale-125"
                  title={`Cheer ${em}`}
                >
                  {em}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span>TV Volume: <strong className="font-mono text-neutral-200">{tvState.volume}%</strong></span>
          <span className="bg-emerald-950 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded font-mono text-[9px]">
            Google Play TWA
          </span>
        </div>
      </div>
    </div>
  );
};
