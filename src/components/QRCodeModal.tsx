import React, { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  QrCode,
  Smartphone,
  X,
  Copy,
  Check,
  Download,
  Share2,
  ExternalLink,
  Sparkles,
  Wifi,
  ShieldCheck,
  FileImage,
  RefreshCw,
} from 'lucide-react';
import { audioHaptics } from '../utils/audioHaptics';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  appUrl?: string;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  appUrl,
}) => {
  const [copied, setCopied] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const [isEditingUrl, setIsEditingUrl] = useState(false);

  if (!isOpen) return null;

  // Use custom URL if entered, else passed appUrl, else window.location, else Cloud Run default
  const defaultUrl =
    appUrl ||
    (typeof window !== 'undefined'
      ? window.location.href.split('?')[0]
      : 'https://ais-pre-asb6vzvbaeztm4aagggfbt-62144606047.asia-east1.run.app');

  const activeUrl = customUrl.trim() || defaultUrl;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeUrl);
    setCopied(true);
    audioHaptics.playClick();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSVG = () => {
    const svg = document.getElementById('fuji-qr-code-svg');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fuji-tv-remote-qr-code.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    audioHaptics.playBeep();
  };

  const handleDownloadPNG = () => {
    const svg = document.getElementById('fuji-qr-code-svg') as SVGElement | null;
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    canvas.width = 600;
    canvas.height = 600;

    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      if (ctx) {
        // Draw white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, 600, 600);

        canvas.toBlob(blob => {
          if (!blob) return;
          const pngUrl = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = pngUrl;
          a.download = 'fuji-tv-remote-qr-code.png';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(pngUrl);
          audioHaptics.playBeep();
        }, 'image/png');
      }
      URL.revokeObjectURL(url);
    };

    img.src = url;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md max-h-[92vh] overflow-y-auto bg-neutral-900 border border-neutral-700/80 rounded-3xl p-5 sm:p-6 shadow-2xl text-neutral-100">
        {/* Glow Accent */}
        <div className="absolute -top-12 -right-12 w-44 h-44 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-2 rounded-full hover:bg-neutral-800 transition"
          title="Close QR Code Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center text-white shadow-lg shadow-red-900/40">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="bg-red-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded">
                CX 8ch
              </span>
              <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider">
                Instant Mobile Download
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-white">
              Scan to Download to Phone
            </h3>
            <p className="text-xs text-neutral-400">
              Open on iOS Safari or Android Chrome in 2 seconds
            </p>
          </div>
        </div>

        {/* Center QR Code Container */}
        <div className="flex flex-col items-center justify-center my-3 bg-neutral-950 p-4 rounded-2xl border border-neutral-800">
          <div className="p-3.5 bg-white rounded-2xl shadow-2xl border-4 border-neutral-800 flex items-center justify-center relative group">
            <QRCodeSVG
              id="fuji-qr-code-svg"
              value={activeUrl}
              size={210}
              level="H"
              includeMargin={false}
              fgColor="#0f1115"
              bgColor="#ffffff"
              imageSettings={{
                src: '/favicon.png',
                x: undefined,
                y: undefined,
                height: 38,
                width: 38,
                excavate: true,
              }}
            />
          </div>

          <p className="text-[11px] text-neutral-300 text-center mt-3 flex items-center gap-1.5 font-medium">
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>Point your phone camera at this QR code</span>
          </p>

          {/* Active URL bar */}
          <div className="w-full mt-3 pt-2.5 border-t border-neutral-850 flex items-center justify-between gap-2">
            <div className="flex-1 truncate text-[11px] font-mono text-neutral-400 bg-neutral-900 px-2.5 py-1 rounded-lg border border-neutral-800">
              {activeUrl}
            </div>
            <button
              onClick={handleCopy}
              className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[10px] font-bold px-2 py-1 rounded-lg border border-neutral-700 flex items-center gap-1 transition"
              title="Copy URL"
            >
              {copied ? (
                <Check className="w-3 h-3 text-emerald-400" />
              ) : (
                <Copy className="w-3 h-3 text-neutral-400" />
              )}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Platform-Specific 1-2-3 Guides */}
        <div className="space-y-2 mb-4">
          <div className="bg-neutral-950 p-3 rounded-2xl border border-neutral-800 flex items-start gap-2.5 text-xs">
            <span className="bg-sky-950 text-sky-400 border border-sky-800/60 font-bold px-2 py-0.5 rounded text-[10px] mt-0.5 flex-shrink-0">
              Apple iOS
            </span>
            <span className="text-neutral-300 text-[11px] leading-snug">
              Open Camera app → Tap yellow Safari notification → Tap <strong className="text-white">Share</strong> → <strong className="text-white">Add to Home Screen</strong>.
            </span>
          </div>

          <div className="bg-neutral-950 p-3 rounded-2xl border border-neutral-800 flex items-start gap-2.5 text-xs">
            <span className="bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-bold px-2 py-0.5 rounded text-[10px] mt-0.5 flex-shrink-0">
              Android
            </span>
            <span className="text-neutral-300 text-[11px] leading-snug">
              Scan with Camera / Google Lens → Tap link → Tap <strong className="text-white">"Install / Add to Home screen"</strong> prompt to get the native WebAPK.
            </span>
          </div>
        </div>

        {/* QR Code Save & Export Buttons */}
        <div className="pt-3 border-t border-neutral-800 flex flex-col sm:flex-row items-center gap-2">
          <button
            onClick={handleDownloadPNG}
            className="w-full sm:flex-1 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold py-2.5 px-3 rounded-xl shadow flex items-center justify-center gap-1.5 transition active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            Download PNG (HQ)
          </button>

          <button
            onClick={handleDownloadSVG}
            className="w-full sm:flex-1 bg-neutral-800 hover:bg-neutral-750 text-neutral-200 text-xs font-bold py-2.5 px-3 rounded-xl border border-neutral-700 flex items-center justify-center gap-1.5 transition active:scale-95"
          >
            <FileImage className="w-3.5 h-3.5 text-neutral-400" />
            Download Vector SVG
          </button>
        </div>

        {/* Local Wi-Fi / Custom URL testing drawer toggle */}
        <div className="mt-3 text-center">
          {!isEditingUrl ? (
            <button
              onClick={() => setIsEditingUrl(true)}
              className="text-[10px] text-neutral-500 hover:text-neutral-300 underline"
            >
              Test with custom IP / local Wi-Fi URL?
            </button>
          ) : (
            <div className="mt-2 p-2 bg-neutral-950 rounded-xl border border-neutral-800 space-y-1.5">
              <label className="text-[10px] text-neutral-400 block text-left">
                Custom Phone Destination URL (e.g. your LAN IP or staging host):
              </label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={customUrl}
                  onChange={e => setCustomUrl(e.target.value)}
                  placeholder="https://192.168.1.100:3000"
                  className="flex-1 bg-neutral-900 border border-neutral-750 rounded-lg px-2 py-1 text-[11px] text-white font-mono focus:outline-none focus:border-red-500"
                />
                <button
                  onClick={() => {
                    setCustomUrl('');
                    setIsEditingUrl(false);
                  }}
                  className="bg-neutral-800 text-neutral-400 hover:text-white px-2 py-1 rounded-lg text-[10px]"
                >
                  Reset
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
