export type TVBrand = 
  | 'simulator' 
  | 'sony' 
  | 'panasonic' 
  | 'sharp' 
  | 'lg' 
  | 'samsung' 
  | 'toshiba';

export type InputSource = 'TERRESTRIAL' | 'BS' | 'CS' | '4K' | 'HDMI1' | 'FOD';

export interface TVChannel {
  number: number;
  name: string;
  shortName: string;
  isFuji: boolean;
  frequency?: string;
}

export interface TVProgram {
  id: string;
  channelNumber: number;
  title: string;
  genre: string;
  timeSlot: string;
  description: string;
  rating?: string;
  cast?: string[];
  hasSubtitles: boolean;
  hasBilingual: boolean;
  hasDataBroadcast: boolean;
}

export interface DDataState {
  isOpen: boolean;
  activeTab: 'weather' | 'news' | 'janken' | 'odaiba';
  jankenScore: number;
  jankenRound: number;
  jankenState: 'ready' | 'countdown' | 'revealed';
  playerChoice: 'rock' | 'scissors' | 'paper' | null;
  botChoice: 'rock' | 'scissors' | 'paper' | null;
  jankenResult: 'win' | 'lose' | 'draw' | null;
}

export interface LiveReaction {
  id: string;
  emoji: string;
  x: number;
}

export interface TVState {
  power: boolean;
  currentChannel: number;
  volume: number;
  isMuted: boolean;
  inputSource: InputSource;
  subtitlesActive: boolean;
  audioTrack: 'main' | 'sub';
  dData: DDataState;
  screenEffect: 'none' | 'scanline' | 'glitch';
  liveReactions: LiveReaction[];
  cursorPos: { x: number; y: number } | null;
}

export interface IRLogEntry {
  id: string;
  timestamp: string;
  command: string;
  protocol: string;
  hexCode: string;
  brand: string;
}

export type NormalTVTransmitter = 'audio_ir' | 'wifi_bridge' | 'android_ir' | 'hdmi_cec';

export interface NormalTVConfig {
  enabled: boolean;
  brandId: string;
  setupCode: string;
  transmitter: NormalTVTransmitter;
  bridgeUrl: string; // e.g. http://192.168.1.100/send_ir
  audioBlastEnabled: boolean;
}

export interface TVConfig {
  brand: TVBrand;
  ipAddress: string;
  port: number;
  useSimulator: boolean;
  hapticsEnabled: boolean;
  soundEnabled: boolean;
  soundVolume: number;
  remoteTheme: 'dark' | 'crimson' | 'silver';
  backlightEnabled: boolean;
  remoteMode: 'keypad' | 'touchpad';
  normalTV: NormalTVConfig;
}
