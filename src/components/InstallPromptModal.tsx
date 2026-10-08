import React from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Share2, PlusSquare, Smartphone, CheckCircle2, X } from 'lucide-react';

interface InstallPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallPromptModal: React.FC<InstallPromptModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-700 rounded-3xl p-6 shadow-2xl text-neutral-100 overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-2 rounded-full hover:bg-neutral-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with App Icon */}
        <div className="flex items-center gap-3.5 mb-5">
          <img
            src="/pwa-192x192.png"
            alt="Fuji TV Remote Icon"
            className="w-14 h-14 rounded-2xl shadow-lg border border-neutral-700/80 bg-neutral-950 p-0.5 object-cover"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="bg-red-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded">
                CX CH 8
              </span>
              <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider">
                Official PWA App
              </span>
            </div>
            <h3 className="text-lg font-black text-white">Fuji TV Remote</h3>
            <p className="text-xs text-neutral-400">iOS & Android Seamless Download</p>
          </div>
        </div>

        {/* Already Installed State */}
        {isInstalled ? (
          <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-4 text-center my-4 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <p className="text-sm font-bold text-emerald-300">
              App is Already Installed!
            </p>
            <p className="text-xs text-neutral-300">
              Running in standalone fullscreen mode from your device launcher.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* ANDROID / CHROME / 1-CLICK FLOW */}
            {isInstallable && (
              <div className="bg-neutral-800/80 border border-neutral-700 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  Android / Chrome 1-Tap Download
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Downloads directly to your device like a native Play Store application with complete offline capability.
                </p>
                <button
                  onClick={handleInstallClick}
                  className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black py-3 px-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  Download / Install App
                </button>
              </div>
            )}

            {/* iOS SAFARI STEP-BY-STEP FLOW */}
            {(isIOS || !isInstallable) && (
              <div className="bg-neutral-800/80 border border-neutral-700 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <Smartphone className="w-4 h-4 text-sky-400" />
                  iPhone & iPad (iOS Safari) Installation Guide
                </div>
                <ol className="text-xs text-neutral-300 space-y-2.5 list-decimal list-inside bg-neutral-900/80 p-3 rounded-xl border border-neutral-800">
                  <li className="leading-snug">
                    Tap the{' '}
                    <span className="inline-flex items-center gap-1 font-bold text-sky-300 bg-sky-950/60 px-1.5 py-0.5 rounded border border-sky-800/60">
                      <Share2 className="w-3 h-3" /> Share
                    </span>{' '}
                    button in Safari’s bottom toolbar.
                  </li>
                  <li className="leading-snug">
                    Scroll down and choose{' '}
                    <span className="inline-flex items-center gap-1 font-bold text-neutral-100 bg-neutral-800 px-1.5 py-0.5 rounded border border-neutral-700">
                      <PlusSquare className="w-3 h-3" /> Add to Home Screen
                    </span>.
                  </li>
                  <li className="leading-snug">
                    Tap <strong className="text-white">"Add"</strong> in the top-right corner to place the Fuji TV Remote app icon on your home screen.
                  </li>
                </ol>
                <div className="text-[11px] text-neutral-400 bg-black/40 p-2 rounded-lg">
                  💡 Once added, the app launches without the Safari address bar, just like a native App Store remote.
                </div>
              </div>
            )}

            {/* Cross-platform badge info */}
            <div className="flex items-center justify-between text-[11px] text-neutral-400 px-1 pt-1">
              <span>✓ 100% Offline Support</span>
              <span>✓ Ultra-Fast Cache</span>
              <span>✓ App Store & Play Store Compliant</span>
            </div>
          </div>
        )}

        <div className="mt-5 pt-3 border-t border-neutral-800 text-center">
          <button
            onClick={onClose}
            className="text-xs font-semibold text-neutral-400 hover:text-white px-4 py-1.5 rounded-lg hover:bg-neutral-800 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
