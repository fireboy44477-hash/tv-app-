/**
 * Audio Synthesizer and Haptic Engine for Fuji TV Remote
 * Uses Web Audio API for zero-latency, realistic tactile feedback
 */

class AudioHapticService {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private volume: number = 0.5;

  constructor() {
    // Attempt load preferences
    try {
      const savedSound = localStorage.getItem('fuji_tv_sound_enabled');
      if (savedSound !== null) this.soundEnabled = savedSound === 'true';
      const savedVol = localStorage.getItem('fuji_tv_sound_vol');
      if (savedVol !== null) this.volume = parseFloat(savedVol);
    } catch {
      // ignore
    }
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
    try {
      localStorage.setItem('fuji_tv_sound_enabled', String(enabled));
    } catch {}
  }

  public isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    try {
      localStorage.setItem('fuji_tv_sound_vol', String(this.volume));
    } catch {}
  }

  public triggerHaptic(type: 'light' | 'medium' | 'heavy' | 'double' = 'light') {
    if (typeof window === 'undefined' || !window.navigator || !window.navigator.vibrate) return;
    try {
      switch (type) {
        case 'light':
          window.navigator.vibrate(12);
          break;
        case 'medium':
          window.navigator.vibrate(25);
          break;
        case 'heavy':
          window.navigator.vibrate(45);
          break;
        case 'double':
          window.navigator.vibrate([15, 40, 20]);
          break;
      }
    } catch {}
  }

  /**
   * Tactile click for regular remote buttons
   */
  public playClick() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Sharp mechanical transient
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(620, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.035);

      gain.gain.setValueAtTime(0.3 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch {}
  }

  /**
   * Beep for channel change or power button
   */
  public playBeep(freq = 880) {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.25 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch {}
  }

  /**
   * Authentic Fuji TV 'd' data button chime (pleasant digital major chord)
   */
  public playDDataChime() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const now = this.ctx.currentTime + idx * 0.05;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.2 * this.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.18);
      });
    } catch {}
  }

  /**
   * Fuji TV iconic signature jingle (Mezamashi fanfare)
   */
  public playFujiJingle() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      // 8 Ch Fuji signature melody notes (G4, C5, E5, G5)
      const chord = [392.00, 523.25, 659.25, 783.99];
      chord.forEach((freq, idx) => {
        if (!this.ctx) return;
        const now = this.ctx.currentTime + idx * 0.07;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = idx === 3 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.3 * this.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.3);
      });
    } catch {}
  }

  /**
   * Data button color tone (Blue, Red, Green, Yellow)
   */
  public playColorButtonSound(color: 'blue' | 'red' | 'green' | 'yellow') {
    const freqs = {
      blue: 440,    // A4
      red: 554.37,  // C#5
      green: 659.25,// E5
      yellow: 740   // F#5
    };
    this.playBeep(freqs[color] || 500);
  }

  /**
   * Transmits real 38kHz infrared modulated audio pulses through 3.5mm audio jack or USB-C DAC
   * for controlling normal physical TV sets using an attached IR blaster diode.
   */
  public blastAudioIR(pattern: number[]) {
    this.initContext();
    if (!this.ctx) return;

    try {
      // Dynamic import or local waveform generation
      const sampleRate = this.ctx.sampleRate;
      const totalMicroseconds = pattern.reduce((acc, val) => acc + val, 0);
      const totalSamples = Math.ceil((totalMicroseconds / 1000000) * sampleRate);

      const buffer = this.ctx.createBuffer(2, totalSamples, sampleRate);
      const chL = buffer.getChannelData(0);
      const chR = buffer.getChannelData(1);

      let currentSample = 0;
      const carrierPeriodSamples = sampleRate / 19000;

      for (let i = 0; i < pattern.length; i++) {
        const durationUs = pattern[i];
        const durationSamples = Math.round((durationUs / 1000000) * sampleRate);
        const isMark = i % 2 === 0;

        for (let s = 0; s < durationSamples; s++) {
          const idx = currentSample + s;
          if (idx < totalSamples) {
            if (isMark) {
              const phase = (idx % carrierPeriodSamples) / carrierPeriodSamples;
              const val = phase < 0.5 ? 0.98 : -0.98;
              chL[idx] = val;
              chR[idx] = -val;
            } else {
              chL[idx] = 0;
              chR[idx] = 0;
            }
          }
        }
        currentSample += durationSamples;
      }

      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(this.ctx.destination);
      source.start();
    } catch {}
  }
}

export const audioHaptics = new AudioHapticService();
