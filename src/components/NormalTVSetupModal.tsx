import React, { useState } from 'react';
import { UNIVERSAL_BRANDS, UniversalTVBrand } from '../utils/universalIRCodes';
import { NormalTVConfig, NormalTVTransmitter } from '../types/tv';
import { tvConnection } from '../utils/tvConnection';
import { audioHaptics } from '../utils/audioHaptics';
import {
  Tv,
  Radio,
  CheckCircle,
  X,
  Zap,
  Wifi,
  Smartphone,
  Headphones,
  Sliders,
  Play,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface NormalTVSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  normalConfig: NormalTVConfig;
  onUpdateNormalConfig: (cfg: Partial<NormalTVConfig>) => void;
}

export const NormalTVSetupModal: React.FC<NormalTVSetupModalProps> = ({
  isOpen,
  onClose,
  normalConfig,
  onUpdateNormalConfig,
}) => {
  const [selectedBrand, setSelectedBrand] = useState<string>(normalConfig.brandId || 'sony');
  const [selectedCode, setSelectedCode] = useState<string>(normalConfig.setupCode || '0001');
  const [testResult, setTestResult] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentBrandInfo: UniversalTVBrand =
    UNIVERSAL_BRANDS.find(b => b.id === selectedBrand) || UNIVERSAL_BRANDS[0];

  const handleTestCommand = (cmd: string, label: string) => {
    audioHaptics.playClick();
    audioHaptics.triggerHaptic('heavy');
    tvConnection.sendCommand(cmd, `Universal IR Test: ${label}`);
    setTestResult(`✓ Blasted ${label} IR Signal (${currentBrandInfo.name} - Code ${selectedCode})`);
    setTimeout(() => setTestResult(null), 3000);
  };

  const transmitters: { id: NormalTVTransmitter; title: string; desc: string; icon: any }[] = [
    {
      id: 'audio_ir',
      title: '3.5mm Headphone Jack / USB-C Audio IR Blaster',
      desc: 'Modulates real 38kHz square wave pulses through phone audio output into an attached LED diode dongle.',
      icon: Headphones,
    },
    {
      id: 'wifi_bridge',
      title: 'Wi-Fi Smart IR Hub (BroadLink, Tuya, SwitchBot, ESP32)',
      desc: 'Controls your normal TV via a Wi-Fi infrared bridge device located in your living room.',
      icon: Wifi,
    },
    {
      id: 'android_ir',
      title: 'Android Hardware IR Blaster Diode',
      desc: 'Uses built-in ConsumerIrManager on phones with native top IR transmitters (Xiaomi, Vivo, Huawei, etc.).',
      icon: Smartphone,
    },
    {
      id: 'hdmi_cec',
      title: 'Streaming Stick HDMI-CEC (Fire TV, Roku, Chromecast, Apple TV)',
      desc: 'Controls normal TV power and volume over HDMI-CEC from any connected streaming media stick.',
      icon: Zap,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-neutral-900 border border-neutral-700/80 rounded-3xl shadow-2xl flex flex-col text-neutral-100 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-900/30">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">
                  Universal Normal TV Controller Setup
                </h3>
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-bold px-1.5 py-0.2 rounded font-mono">
                  Physical TV
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Control regular non-smart TVs using IR Blasters, Audio Emitters, Wi-Fi Bridges, or HDMI-CEC
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {/* 1. SELECT TV BRAND */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-white flex items-center justify-between">
              <span>Step 1: Select Your Physical TV Brand</span>
              <span className="text-[10px] text-neutral-400">20+ Brands Supported</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {UNIVERSAL_BRANDS.map(brand => (
                <button
                  key={brand.id}
                  onClick={() => {
                    setSelectedBrand(brand.id);
                    setSelectedCode(brand.codeList[0]);
                    onUpdateNormalConfig({ brandId: brand.id, setupCode: brand.codeList[0] });
                    audioHaptics.playClick();
                  }}
                  className={`p-2.5 rounded-xl border text-left transition flex items-center justify-between ${
                    selectedBrand === brand.id
                      ? 'bg-neutral-800 border-amber-500 text-white shadow-md'
                      : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  <span className="text-xs font-bold truncate">{brand.name.split(' (')[0]}</span>
                  {selectedBrand === brand.id && (
                    <CheckCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 2. CHOOSE TRANSMISSION HARDWARE METHOD */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-white block">
              Step 2: Choose How Your Phone Blasts Signals to Your TV
            </label>
            <div className="grid grid-cols-1 gap-2">
              {transmitters.map(tr => {
                const Icon = tr.icon;
                const isSelected = normalConfig.transmitter === tr.id;
                return (
                  <button
                    key={tr.id}
                    onClick={() => {
                      onUpdateNormalConfig({ transmitter: tr.id });
                      audioHaptics.playClick();
                    }}
                    className={`p-3 rounded-xl border text-left transition flex items-start gap-3 ${
                      isSelected
                        ? 'bg-neutral-800/90 border-amber-500 text-white shadow-md'
                        : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        isSelected ? 'bg-amber-500 text-neutral-950' : 'bg-neutral-900 text-neutral-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-neutral-200">{tr.title}</span>
                        {isSelected && (
                          <span className="text-[10px] text-amber-400 font-bold">Active</span>
                        )}
                      </div>
                      <p className="text-[11px] text-neutral-400 leading-relaxed mt-0.5">
                        {tr.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* IF WI-FI BRIDGE SELECTED: Webhook / Local IP configuration */}
          {normalConfig.transmitter === 'wifi_bridge' && (
            <div className="bg-neutral-950 p-3.5 rounded-2xl border border-neutral-800 space-y-2">
              <label className="text-xs font-bold text-amber-400 block">
                Wi-Fi IR Blaster Local URL / Webhook Endpoint:
              </label>
              <input
                type="text"
                value={normalConfig.bridgeUrl || ''}
                onChange={e => onUpdateNormalConfig({ bridgeUrl: e.target.value })}
                placeholder="http://192.168.1.100/send_ir or Home Assistant Webhook"
                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
              />
              <p className="text-[10px] text-neutral-500">
                Compatible with BroadLink RM4/Pro, Tuya IR Hub, SwitchBot Hub Mini, or DIY ESP32 IR Blaster.
              </p>
            </div>
          )}

          {/* 3. STEP 3: INTERACTIVE CODE TESTING & AUTO-PAIRING */}
          <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">
                  Step 3: Test IR Commands on Physical TV
                </span>
                <span className="text-[10px] text-neutral-400">
                  Aim your phone's IR emitter / hub at your television and press:
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-neutral-400 text-[10px]">Code:</span>
                <select
                  value={selectedCode}
                  onChange={e => {
                    setSelectedCode(e.target.value);
                    onUpdateNormalConfig({ setupCode: e.target.value });
                  }}
                  className="bg-neutral-900 border border-neutral-700 text-white rounded-lg px-2 py-1 text-xs font-mono font-bold"
                >
                  {currentBrandInfo.codeList.map(c => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Test Action Buttons */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleTestCommand('POWER', 'POWER TOGGLE')}
                className="bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold py-2 px-3 rounded-xl border border-neutral-700 flex items-center justify-center gap-1.5 transition active:scale-95"
              >
                <Zap className="w-3.5 h-3.5 text-red-500" />
                Test Power
              </button>
              <button
                onClick={() => handleTestCommand('VOL_UP', 'VOLUME UP (+)')}
                className="bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold py-2 px-3 rounded-xl border border-neutral-700 flex items-center justify-center gap-1.5 transition active:scale-95"
              >
                Test Vol ＋
              </button>
              <button
                onClick={() => handleTestCommand('CH_8', 'CHANNEL 8 (FUJI TV)')}
                className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold py-2 px-3 rounded-xl shadow flex items-center justify-center gap-1.5 transition active:scale-95"
              >
                Test Ch 8 (Fuji)
              </button>
            </div>

            {/* Test result status flash */}
            {testResult && (
              <div className="bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-medium p-2 rounded-xl text-center animate-in fade-in">
                {testResult}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Universal IR Ready: <strong>{currentBrandInfo.name.split(' (')[0]}</strong></span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-black transition shadow"
          >
            Save & Finish Setup
          </button>
        </div>
      </div>
    </div>
  );
};
