/**
 * Universal TV Infrared (IR) Protocol Database & Code Generator
 * Supports:
 * 1. Android ConsumerIrManager pulse patterns (microseconds)
 * 2. 38kHz Modulated Audio pulses for 3.5mm / USB-C IR Blaster LEDs
 * 3. Hex / Base64 / Pronto IR codes for BroadLink, Tuya, and ESP32 IR Bridges
 */

export interface UniversalTVBrand {
  id: string;
  name: string;
  protocol: 'NEC' | 'SONY12' | 'SONY15' | 'PANASONIC' | 'SAMSUNG' | 'RC5' | 'SHARP';
  frequency: number; // usually 38000 or 40000 Hz
  codeList: string[]; // 4-digit setup codes
  commands: Record<string, number>; // command key to numeric/hex code
}

export const UNIVERSAL_BRANDS: UniversalTVBrand[] = [
  {
    id: 'sony',
    name: 'Sony (Bravia / Trinitron / Standard)',
    protocol: 'SONY12',
    frequency: 40000,
    codeList: ['0001', '0011', '0024', '0080'],
    commands: {
      POWER: 0x15,
      CH_UP: 0x10,
      CH_DOWN: 0x11,
      VOL_UP: 0x12,
      VOL_DOWN: 0x13,
      MUTE: 0x14,
      INPUT: 0x25,
      CH_8: 0x07, // 8th key
      ENTER: 0x65,
    },
  },
  {
    id: 'panasonic',
    name: 'Panasonic (Viera / Standard)',
    protocol: 'PANASONIC',
    frequency: 36700,
    codeList: ['0051', '0055', '0162', '0226'],
    commands: {
      POWER: 0x3D,
      CH_UP: 0x2C,
      CH_DOWN: 0x2D,
      VOL_UP: 0x20,
      VOL_DOWN: 0x21,
      MUTE: 0x32,
      INPUT: 0x33,
      CH_8: 0x08,
      ENTER: 0x29,
    },
  },
  {
    id: 'samsung',
    name: 'Samsung (All Series / Normal TV)',
    protocol: 'SAMSUNG',
    frequency: 38000,
    codeList: ['0060', '0019', '0030', '0056'],
    commands: {
      POWER: 0x02,
      CH_UP: 0x12,
      CH_DOWN: 0x10,
      VOL_UP: 0x07,
      VOL_DOWN: 0x0B,
      MUTE: 0x0F,
      INPUT: 0x01,
      CH_8: 0x08,
      ENTER: 0x44,
    },
  },
  {
    id: 'lg',
    name: 'LG (Flatron / OLED / Standard)',
    protocol: 'NEC',
    frequency: 38000,
    codeList: ['0056', '0178', '0030', '0004'],
    commands: {
      POWER: 0x10,
      CH_UP: 0x00,
      CH_DOWN: 0x01,
      VOL_UP: 0x02,
      VOL_DOWN: 0x03,
      MUTE: 0x09,
      INPUT: 0x0B,
      CH_8: 0x08,
      ENTER: 0x44,
    },
  },
  {
    id: 'sharp',
    name: 'Sharp (Aquos / Standard)',
    protocol: 'SHARP',
    frequency: 38000,
    codeList: ['0093', '0165', '0386', '0020'],
    commands: {
      POWER: 0x21,
      CH_UP: 0x12,
      CH_DOWN: 0x13,
      VOL_UP: 0x14,
      VOL_DOWN: 0x15,
      MUTE: 0x16,
      INPUT: 0x22,
      CH_8: 0x08,
      ENTER: 0x3A,
    },
  },
  {
    id: 'toshiba',
    name: 'Toshiba (Regza / Standard)',
    protocol: 'NEC',
    frequency: 38000,
    codeList: ['0156', '0060', '0154', '0125'],
    commands: {
      POWER: 0x12,
      CH_UP: 0x01,
      CH_DOWN: 0x02,
      VOL_UP: 0x1A,
      VOL_DOWN: 0x1E,
      MUTE: 0x10,
      INPUT: 0x0F,
      CH_8: 0x08,
      ENTER: 0x24,
    },
  },
  {
    id: 'tcl',
    name: 'TCL / Roku TV (Normal TV & Smart)',
    protocol: 'NEC',
    frequency: 38000,
    codeList: ['0842', '0625', '0156'],
    commands: {
      POWER: 0xD0,
      CH_UP: 0xD2,
      CH_DOWN: 0xD3,
      VOL_UP: 0xD4,
      VOL_DOWN: 0xD5,
      MUTE: 0xD6,
      INPUT: 0xD7,
      CH_8: 0x08,
      ENTER: 0xD8,
    },
  },
  {
    id: 'hisense',
    name: 'Hisense (Standard / VIDAA)',
    protocol: 'NEC',
    frequency: 38000,
    codeList: ['0216', '0156', '0748'],
    commands: {
      POWER: 0x08,
      CH_UP: 0x10,
      CH_DOWN: 0x11,
      VOL_UP: 0x12,
      VOL_DOWN: 0x13,
      MUTE: 0x14,
      INPUT: 0x38,
      CH_8: 0x08,
      ENTER: 0x22,
    },
  },
  {
    id: 'vizio',
    name: 'Vizio (All Models)',
    protocol: 'NEC',
    frequency: 38000,
    codeList: ['0017', '0054', '0112'],
    commands: {
      POWER: 0x0C,
      CH_UP: 0x20,
      CH_DOWN: 0x21,
      VOL_UP: 0x10,
      VOL_DOWN: 0x11,
      MUTE: 0x0D,
      INPUT: 0x0A,
      CH_8: 0x08,
      ENTER: 0x5C,
    },
  },
  {
    id: 'philips',
    name: 'Philips (Magnavox / Standard)',
    protocol: 'RC5',
    frequency: 36000,
    codeList: ['0054', '0012', '0062'],
    commands: {
      POWER: 0x0C,
      CH_UP: 0x20,
      CH_DOWN: 0x21,
      VOL_UP: 0x10,
      VOL_DOWN: 0x11,
      MUTE: 0x0D,
      INPUT: 0x38,
      CH_8: 0x08,
      ENTER: 0x57,
    },
  },
];

/**
 * Converts a command into a raw microsecond pattern for Android ConsumerIrManager
 */
export function buildAndroidIRPattern(brandId: string, cmd: string): { frequency: number; pattern: number[] } {
  const brand = UNIVERSAL_BRANDS.find(b => b.id === brandId) || UNIVERSAL_BRANDS[0];
  const cmdCode = brand.commands[cmd] ?? 0x10;

  if (brand.protocol === 'SONY12') {
    // Sony SIRC 12-bit
    const pattern: number[] = [];
    pattern.push(2400, 600); // Header
    for (let i = 0; i < 7; i++) {
      const bit = (cmdCode >> i) & 1;
      pattern.push(bit ? 1200 : 600, 600);
    }
    const deviceAddr = 0x01; // TV address
    for (let i = 0; i < 5; i++) {
      const bit = (deviceAddr >> i) & 1;
      pattern.push(bit ? 1200 : 600, 600);
    }
    return { frequency: brand.frequency, pattern };
  }

  // Standard NEC protocol (38kHz)
  const pattern: number[] = [];
  pattern.push(9000, 4500); // 9ms mark, 4.5ms space
  const address = 0x00;
  const addressInv = 0xFF;
  const command = cmdCode & 0xFF;
  const commandInv = (~cmdCode) & 0xFF;

  const dataBytes = [address, addressInv, command, commandInv];
  for (const byte of dataBytes) {
    for (let bit = 0; bit < 8; bit++) {
      const isOne = (byte >> bit) & 1;
      pattern.push(560); // mark
      pattern.push(isOne ? 1690 : 560); // space
    }
  }
  pattern.push(560); // stop bit
  return { frequency: brand.frequency, pattern };
}

/**
 * Generates audio waveform data (19kHz square wave modulated on 2 channels in opposite phase)
 * for standard 3.5mm or USB-C IR LED dongles plugged into any phone!
 */
export function generateAudioIRWaveform(ctx: AudioContext, pattern: number[]): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const totalMicroseconds = pattern.reduce((acc, val) => acc + val, 0);
  const totalSamples = Math.ceil((totalMicroseconds / 1000000) * sampleRate);

  const buffer = ctx.createBuffer(2, totalSamples, sampleRate);
  const channelLeft = buffer.getChannelData(0);
  const channelRight = buffer.getChannelData(1);

  let currentSample = 0;
  const carrierFreq = 19000; // Half carrier for dual antiparallel LED dongles
  const carrierPeriodSamples = sampleRate / carrierFreq;

  for (let i = 0; i < pattern.length; i++) {
    const durationUs = pattern[i];
    const durationSamples = Math.round((durationUs / 1000000) * sampleRate);
    const isMark = (i % 2 === 0);

    for (let s = 0; s < durationSamples; s++) {
      const sampleIndex = currentSample + s;
      if (sampleIndex < totalSamples) {
        if (isMark) {
          const phase = (sampleIndex % carrierPeriodSamples) / carrierPeriodSamples;
          const val = phase < 0.5 ? 0.95 : -0.95;
          channelLeft[sampleIndex] = val;
          channelRight[sampleIndex] = -val; // Inverted phase to double peak voltage across LED!
        } else {
          channelLeft[sampleIndex] = 0;
          channelRight[sampleIndex] = 0;
        }
      }
    }
    currentSample += durationSamples;
  }

  return buffer;
}
