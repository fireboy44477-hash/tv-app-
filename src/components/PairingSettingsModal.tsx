import React, { useState, useEffect } from 'react';
import { TVConfig, TVBrand, IRLogEntry } from '../types/tv';
import { tvConnection } from '../utils/tvConnection';
import { audioHaptics } from '../utils/audioHaptics';
import {
  X,
  Tv,
  Volume2,
  VolumeX,
  Vibrate,
  Sliders,
  Terminal,
  Trash2,
  Check,
  Palette,
} from 'lucide-react';

interface PairingSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: TVConfig;
  onUpdateConfig: (cfg: Partial<TVConfig>) => void;
}

export const PairingSettingsModal: React.FC<PairingSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
}) => {
  const [logs, setLogs] = useState<IRLogEntry[]>([]);

  useEffect(() => {
    if (isOpen) {
      setLogs(tvConnection.getLogs());
      const unsub = tvConnection.subscribe(() => {
        setLogs(tvConnection.getLogs());
      });
      return () => unsub();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const brands: { id: TVBrand; name: string; proto: string }[] = [
    { id: 'simulator', name: 'Virtual TV Simulator (Built-in)', proto: 'Fuji Hybridcast D2' },
    { id: 'sony', name: 'Sony BRAVIA', proto: 'SIRC / IP Pre-shared key' },
    { id: 'panasonic', name: 'Panasonic VIERA', proto: 'VIERA Connect NRC' },
    { id: 'sharp', name: 'Sharp AQUOS', proto: 'AQUOS IP Controller' },
    { id: 'lg', name: 'LG webOS TV', proto: 'SSAP WebSocket Protocol' },
    { id: 'samsung', name: 'Samsung Tizen TV', proto: 'SmartThings WebSocket' },
    { id: 'toshiba', name: 'Toshiba REGZA', proto: 'REGZA Connect IP' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[85vh] bg-neutral-900 border border-neutral-700/80 rounded-3xl shadow-2xl flex flex-col text-neutral-100 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-white">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Settings & Smart TV Pairing</h3>
              <p className="text-[11px] text-neutral-400">TV Brand, Haptics, and Transmission Protocols</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-2 rounded-full hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {/* 1. TV BRAND SELECTOR */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
              <Tv className="w-4 h-4 text-red-500" />
              Target Smart TV Brand
            </label>
            <div className="grid grid-cols-1 gap-1.5">
              {brands.map(b => (
                <button
                  key={b.id}
                  onClick={() => {
                    onUpdateConfig({ brand: b.id });
                    audioHaptics.playClick();
                  }}
                  className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition ${
                    config.brand === b.id
                      ? 'bg-neutral-800 border-red-500/80 text-white shadow-md'
                      : 'bg-neutral-950/50 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold block">{b.name}</span>
                    <span className="text-[10px] text-neutral-500 font-mono">{b.proto}</span>
                  </div>
                  {config.brand === b.id && (
                    <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Check className="w-3 h-3" /> Connected
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 2. REMOTE FINISH / THEME */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-rose-400" />
              Remote Chassis Finish
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'dark' as const, name: 'Titanium Dark', sub: 'Matte Black' },
                { id: 'crimson' as const, name: 'Fuji Crimson', sub: 'Anniversary Red' },
                { id: 'silver' as const, name: 'Classic Silver', sub: 'Brushed Metal' },
              ].map(th => (
                <button
                  key={th.id}
                  onClick={() => {
                    onUpdateConfig({ remoteTheme: th.id });
                    audioHaptics.playClick();
                  }}
                  className={`p-2 rounded-xl border text-center transition ${
                    config.remoteTheme === th.id
                      ? 'bg-neutral-800 border-red-500 text-white shadow'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  <span className="text-xs font-bold block">{th.name}</span>
                  <span className="text-[9px] text-neutral-500">{th.sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. SOUND & HAPTIC FEEDBACK */}
          <div className="space-y-3 bg-neutral-950 p-4 rounded-2xl border border-neutral-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {config.soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <VolumeX className="w-4 h-4 text-neutral-500" />
                )}
                <div>
                  <span className="text-xs font-bold text-white block">Mechanical Click Sound (Web Audio)</span>
                  <span className="text-[10px] text-neutral-400">Synthesizes tactile hardware click transients</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={config.soundEnabled}
                onChange={e => {
                  const val = e.target.checked;
                  onUpdateConfig({ soundEnabled: val });
                  audioHaptics.setSoundEnabled(val);
                }}
                className="w-4 h-4 accent-red-600 rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Vibrate className="w-4 h-4 text-amber-400" />
                <div>
                  <span className="text-xs font-bold text-white block">Haptic Feedback (Vibration)</span>
                  <span className="text-[10px] text-neutral-400">Triggers physical phone vibration on press</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={config.hapticsEnabled}
                onChange={e => onUpdateConfig({ hapticsEnabled: e.target.checked })}
                className="w-4 h-4 accent-red-600 rounded"
              />
            </div>
          </div>

          {/* 4. REAL-TIME IR / IP TRANSMISSION MONITOR */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-sky-400" />
                Infrared (IR) & IP Command Stream Log
              </label>
              <button
                onClick={() => {
                  tvConnection.clearLogs();
                  setLogs([]);
                }}
                className="text-[10px] text-neutral-400 hover:text-white flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                Clear
              </button>
            </div>

            <div className="bg-black border border-neutral-800 rounded-xl p-2.5 font-mono text-[10px] max-h-36 overflow-y-auto space-y-1">
              {logs.length === 0 ? (
                <div className="text-neutral-600 text-center py-2">
                  Press any remote button to inspect outgoing infrared & IP packets
                </div>
              ) : (
                logs.map(log => (
                  <div key={log.id} className="flex items-center justify-between text-neutral-300">
                    <span className="text-neutral-500">{log.timestamp}</span>
                    <span className="text-red-400 font-bold">{log.command}</span>
                    <span className="text-sky-300">{log.hexCode}</span>
                    <span className="text-neutral-500">{log.protocol.split(' ')[0]}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-neutral-950 border-t border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition shadow"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
