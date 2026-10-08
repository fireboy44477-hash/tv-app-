import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { QRCodeSVG } from 'qrcode.react';
import {
  Download,
  Share2,
  PlusSquare,
  Smartphone,
  CheckCircle2,
  X,
  QrCode,
  Copy,
  Check,
} from 'lucide-react';
import { audioHaptics } from '../utils/audioHaptics';

interface InstallPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  appUrl?: string;
}

export const InstallPromptModal: React.FC<InstallPromptModalProps> = ({
  isOpen,
  onClose,
  appUrl,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(true);

  if (!isOpen) return null;

  const targetUrl =
    appUrl ||
    (typeof window !== 'undefined'
      ? window.location.href.split('?')[0]
      : 'https://ais-pre-asb6vzvbaeztm4aagggfbt-62144606047.asia-east1.run.app');

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      onClose();
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(targetUrl);
    setCopied(true);
    audioHaptics.playClick();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-neutral-900 border border-neutral-700/80 rounded-3xl p-5 sm:p-6 shadow-2xl text-neutral-100">
        {/* Glow accent */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-2 rounded-full hover:bg-neutral-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with App Icon */}
        <div className="flex items-center gap-3.5 mb-4">
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
                Seamless Install
              </span>
            </div>
            <h3 className="text-lg font-black text-white">Download to Your Phone</h3>
            <p className="text-xs text-neutral-400">Install as native app on iOS & Android</p>
          </div>
        </div>

        {/* PROMINENT QR CODE DOWNLOAD CARD */}
        <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 mb-4 flex flex-col sm:flex-row items-center gap-4 shadow-inner">
          <div className="p-2.5 bg-white rounded-xl shadow-lg border-2 border-neutral-700 flex-shrink-0">
            <QRCodeSVG
              value={targetUrl}
              size={130}
              level="M"
              fgColor="#111317"
              bgColor="#ffffff"
              imageSettings={{
                src: '/favicon.png',
                x: undefined,
                y: undefined,
                height: 24,
                width: 24,
                excavate: true,
              }}
            />
          </div>

          <div className="space-y-2 text-center sm:text-left flex-1">
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-bold text-white">
              <QrCode className="w-4 h-4 text-emerald-400" />
              <span>Scan QR Code with Phone Camera</span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Open your iPhone Camera or Android Google Lens / Camera app and point it at this QR code to launch and install the app seamlessly.
            </p>
            <button
              onClick={handleCopyLink}
              className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 text-[10px] font-bold py-1.5 px-3 rounded-lg flex items-center justify-center sm:justify-start gap-1.5 transition active:scale-95 w-full sm:w-auto"
            >
              {copied ? (
                <Check className="w-3 h-3 text-emerald-400" />
              ) : (
                <Copy className="w-3 h-3 text-neutral-400" />
              )}
              {copied ? 'Download Link Copied!' : 'Copy Mobile Download Link'}
            </button>
          </div>
        </div>

        {/* Already Installed State */}
        {isInstalled ? (
          <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-4 text-center my-3 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <p className="text-sm font-bold text-emerald-300">
              App is Already Installed!
            </p>
            <p className="text-xs text-neutral-300">
              Running in standalone fullscreen mode on this device.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* ANDROID / CHROME / 1-CLICK FLOW */}
            {isInstallable && (
              <div className="bg-neutral-800/80 border border-neutral-700 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  Direct Device Install (WebAPK)
                </div>
                <button
                  onClick={handleInstallClick}
                  className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black py-2.5 px-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition active:scale-95 text-xs"
                >
                  <Download className="w-4 h-4" />
                  Install App on This Device
                </button>
              </div>
            )}

            {/* iOS SAFARI STEP-BY-STEP FLOW */}
            {(isIOS || !isInstallable) && (
              <div className="bg-neutral-800/80 border border-neutral-700 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <Smartphone className="w-4 h-4 text-sky-400" />
                  iPhone & iPad (Safari) Quick Steps
                </div>
                <ol className="text-[11px] text-neutral-300 space-y-1.5 list-decimal list-inside bg-neutral-900/80 p-2.5 rounded-xl border border-neutral-800">
                  <li className="leading-snug">
                    Tap the{' '}
                    <span className="inline-flex items-center gap-1 font-bold text-sky-300 bg-sky-950/60 px-1 py-0.2 rounded border border-sky-800/60">
                      <Share2 className="w-2.5 h-2.5" /> Share
                    </span>{' '}
                    button in Safari toolbar.
                  </li>
                  <li className="leading-snug">
                    Scroll down and select{' '}
                    <span className="inline-flex items-center gap-1 font-bold text-neutral-100 bg-neutral-800 px-1 py-0.2 rounded border border-neutral-700">
                      <PlusSquare className="w-2.5 h-2.5" /> Add to Home Screen
                    </span>.
                  </li>
                  <li className="leading-snug">
                    Tap <strong className="text-white">"Add"</strong> in top-right corner.
                  </li>
                </ol>
              </div>
            )}

            {/* Cross-platform badge info */}
            <div className="flex items-center justify-between text-[10px] text-neutral-400 px-1 pt-1">
              <span>✓ 100% Offline Support</span>
              <span>✓ High-Speed Cache</span>
              <span>✓ App Store & Play Store Compliant</span>
            </div>
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-neutral-800 text-center">
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
