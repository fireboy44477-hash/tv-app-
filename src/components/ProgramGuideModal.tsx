import React, { useState } from 'react';
import { FUJI_PROGRAMS, CHANNELS, OTHER_CHANNEL_PROGRAMS } from '../utils/tvChannels';
import { X, Calendar, Bell, Tv } from 'lucide-react';
import { audioHaptics } from '../utils/audioHaptics';

interface ProgramGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectChannel: (channelNumber: number) => void;
}

export const ProgramGuideModal: React.FC<ProgramGuideModalProps> = ({
  isOpen,
  onClose,
  onSelectChannel,
}) => {
  const [selectedChannel, setSelectedChannel] = useState<number>(8);
  const [reminderSet, setReminderSet] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const toggleReminder = (id: string) => {
    audioHaptics.triggerHaptic('light');
    audioHaptics.playClick();
    setReminderSet(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const programs =
    selectedChannel === 8
      ? FUJI_PROGRAMS
      : [
          OTHER_CHANNEL_PROGRAMS[selectedChannel] || {
            id: 'generic',
            channelNumber: selectedChannel,
            title: 'Digital High-Definition Broadcast',
            genre: 'General Program',
            timeSlot: 'All Day',
            description: 'Digital television broadcasting feed.',
            hasSubtitles: false,
            hasBilingual: false,
            hasDataBroadcast: false,
          },
        ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[85vh] bg-neutral-900 border border-neutral-700/80 rounded-3xl shadow-2xl flex flex-col text-neutral-100 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">
                  Digital Television EPG Program Guide
                </h3>
                <span className="bg-red-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded">
                  FUJI TV CH 8
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Tokyo Greater Metro Area Broadcast Schedule
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-2 rounded-full hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Channel Selector Tab Strip */}
        <div className="flex items-center gap-1.5 p-2.5 bg-neutral-950 border-b border-neutral-800 overflow-x-auto select-none">
          {CHANNELS.slice(0, 8).map(ch => (
            <button
              key={ch.number}
              onClick={() => {
                setSelectedChannel(ch.number);
                audioHaptics.playClick();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                selectedChannel === ch.number
                  ? ch.isFuji
                    ? 'bg-red-600 text-white shadow-lg shadow-red-950/60 ring-1 ring-red-400'
                    : 'bg-neutral-700 text-white shadow'
                  : ch.isFuji
                  ? 'bg-red-950/50 text-red-300 border border-red-800/40 hover:bg-red-900/40'
                  : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <span className="font-mono text-[11px]">{ch.number}</span>
              <span>{ch.shortName}</span>
              {ch.isFuji && <span className="text-[8px] bg-yellow-400 text-black px-1 rounded font-black">CX</span>}
            </button>
          ))}
        </div>

        {/* Programs List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {programs.map(prog => (
            <div
              key={prog.id}
              className={`p-3.5 rounded-2xl border transition ${
                prog.channelNumber === 8
                  ? 'bg-neutral-850/70 border-neutral-750 hover:border-red-500/50'
                  : 'bg-neutral-950/60 border-neutral-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-bold text-xs bg-neutral-800 text-amber-400 px-2 py-0.5 rounded">
                    {prog.timeSlot}
                  </span>
                  <span className="text-[10px] bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded font-medium">
                    {prog.genre}
                  </span>
                  {prog.hasDataBroadcast && (
                    <span className="text-[9px] bg-red-950 text-red-300 border border-red-500/40 px-1.5 py-0.2 rounded font-bold">
                      d-Data
                    </span>
                  )}
                  {prog.hasSubtitles && (
                    <span className="text-[9px] bg-yellow-950 text-yellow-300 border border-yellow-500/40 px-1 py-0.2 rounded font-bold">
                      CC
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleReminder(prog.id)}
                    className={`text-xs px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition ${
                      reminderSet[prog.id]
                        ? 'bg-yellow-500 text-neutral-950 shadow'
                        : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                    }`}
                  >
                    <Bell className="w-3 h-3" />
                    {reminderSet[prog.id] ? 'Reminder Set' : 'Set Reminder'}
                  </button>

                  <button
                    onClick={() => {
                      onSelectChannel(prog.channelNumber);
                      onClose();
                    }}
                    className="text-xs bg-red-600 hover:bg-red-500 text-white font-bold px-3 py-1 rounded-lg flex items-center gap-1 shadow transition active:scale-95"
                  >
                    <Tv className="w-3 h-3" />
                    Watch Channel
                  </button>
                </div>
              </div>

              <h4 className="text-sm font-black text-white mb-1">{prog.title}</h4>
              <p className="text-xs text-neutral-300 leading-relaxed mb-2">
                {prog.description}
              </p>

              {prog.cast && (
                <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 pt-1 border-t border-neutral-800/60">
                  <span className="text-neutral-500 font-semibold">Cast:</span>
                  {prog.cast.map((c, i) => (
                    <span key={i} className="bg-neutral-800/80 px-1.5 py-0.2 rounded">
                      {c}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
          <span>※ Program schedules subject to live network updates</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
