import { TVBrand, IRLogEntry, TVConfig } from '../types/tv';
import { buildAndroidIRPattern } from './universalIRCodes';
import { audioHaptics } from './audioHaptics';

type Listener = (entry: IRLogEntry) => void;

class TVConnectionService {
  private config: TVConfig = {
    brand: 'simulator',
    ipAddress: '192.168.1.88',
    port: 8080,
    useSimulator: true,
    hapticsEnabled: true,
    soundEnabled: true,
    soundVolume: 0.6,
    remoteTheme: 'dark',
    backlightEnabled: false,
    remoteMode: 'keypad',
    normalTV: {
      enabled: true,
      brandId: 'sony',
      setupCode: '0001',
      transmitter: 'audio_ir',
      bridgeUrl: 'http://192.168.1.100/send_ir',
      audioBlastEnabled: true,
    },
  };

  private logs: IRLogEntry[] = [];
  private listeners: Listener[] = [];

  constructor() {
    try {
      const saved = localStorage.getItem('fuji_tv_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.config = {
          ...this.config,
          ...parsed,
          normalTV: { ...this.config.normalTV, ...(parsed.normalTV || {}) },
        };
      }
    } catch {}
  }

  public getConfig(): TVConfig {
    return { ...this.config };
  }

  public updateConfig(partial: Partial<TVConfig>) {
    this.config = { ...this.config, ...partial };
    try {
      localStorage.setItem('fuji_tv_config', JSON.stringify(this.config));
    } catch {}
  }

  public subscribe(cb: Listener) {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter(l => l !== cb);
    };
  }

  public sendCommand(cmd: string, details?: string): IRLogEntry {
    const brand = this.config.brand;
    const protocol = this.getProtocolForBrand(brand);
    const hex = this.generateHexCode(brand, cmd);

    const now = new Date();
    const timeStr = now.toLocaleTimeString('ja-JP', { hour12: false }) + '.' + String(now.getMilliseconds()).padStart(3, '0');

    // 1. Build Physical Normal TV IR Pattern
    const targetBrand = this.config.normalTV?.brandId || 'sony';
    const irData = buildAndroidIRPattern(targetBrand, cmd);

    // 2. Transmit via Audio IR Blaster (3.5mm / USB-C Dongle)
    if (this.config.normalTV?.audioBlastEnabled) {
      audioHaptics.blastAudioIR(irData.pattern);
    }

    // 3. Transmit via Native Android ConsumerIrManager (if available)
    if (typeof window !== 'undefined') {
      const win = window as any;
      if (win.AndroidIR && typeof win.AndroidIR.transmit === 'function') {
        try {
          win.AndroidIR.transmit(irData.frequency, JSON.stringify(irData.pattern));
        } catch {}
      }
    }

    // 4. Transmit via Wi-Fi IR Bridge (BroadLink / Tuya / ESP32 Hub)
    if (
      this.config.normalTV?.transmitter === 'wifi_bridge' &&
      this.config.normalTV.bridgeUrl
    ) {
      try {
        fetch(this.config.normalTV.bridgeUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          mode: 'no-cors',
          body: JSON.stringify({
            command: cmd,
            brand: targetBrand,
            frequency: irData.frequency,
            pattern: irData.pattern,
            hexCode: hex,
          }),
        }).catch(() => {});
      } catch {}
    }

    const entry: IRLogEntry = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: timeStr,
      command: details ? `${cmd} (${details})` : cmd,
      protocol: this.config.normalTV?.enabled
        ? `${protocol} + Physical IR (${targetBrand.toUpperCase()})`
        : protocol,
      hexCode: hex,
      brand: brand.toUpperCase(),
    };

    this.logs.unshift(entry);
    if (this.logs.length > 50) this.logs.pop();

    this.listeners.forEach(l => l(entry));
    return entry;
  }

  public getLogs(): IRLogEntry[] {
    return [...this.logs];
  }

  public clearLogs() {
    this.logs = [];
  }

  private getProtocolForBrand(brand: TVBrand): string {
    switch (brand) {
      case 'sony':
        return 'SONY-SIRC-15bit / IP-Control';
      case 'panasonic':
        return 'Panasonic-VIERA-NRC / HTTP-SOAP';
      case 'sharp':
        return 'Sharp-AQUOS-IP / IR-48bit';
      case 'lg':
        return 'LG-webOS-SSAP / NEC-32bit';
      case 'samsung':
        return 'Samsung-SmartControl / WebSocket';
      case 'toshiba':
        return 'Toshiba-REGZA-IP / NEC';
      case 'simulator':
      default:
        return 'FUJI-TV-HYBRID-BROADCAST-D2';
    }
  }

  private generateHexCode(brand: TVBrand, cmd: string): string {
    const hash = Array.from(cmd).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const prefix = {
      simulator: '0x88',
      sony: '0x54',
      panasonic: '0x02',
      sharp: '0xAA',
      lg: '0x20',
      samsung: '0xE0',
      toshiba: '0x40',
    }[brand] || '0x00';

    const hex1 = ((hash * 17) & 0xFF).toString(16).padStart(2, '0').toUpperCase();
    const hex2 = ((hash * 31) & 0xFF).toString(16).padStart(2, '0').toUpperCase();
    const hex3 = ((hash * 53) & 0xFF).toString(16).padStart(2, '0').toUpperCase();

    return `${prefix} ${hex1} ${hex2} ${hex3}`;
  }
}

export const tvConnection = new TVConnectionService();
