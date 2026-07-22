// Enhanced sound effects service for game interactions
class SoundEffectsService {
  private isMuted = false;
  private audioContext: AudioContext | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'AudioContext' in window) {
      this.audioContext = new AudioContext();
    }
  }

  playTone(frequency: number, duration: number, type: OscillatorType = 'sine') {
    if (this.isMuted || !this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  // UI Sounds
  playButtonClick() {
    this.playTone(800, 0.1, 'square');
  }

  playPageTurn() {
    this.playTone(400, 0.2, 'sine');
    setTimeout(() => this.playTone(500, 0.15, 'sine'), 50);
  }

  // Feedback Sounds
  playCorrect() {
    this.playTone(523, 0.1, 'sine');
    setTimeout(() => this.playTone(659, 0.1, 'sine'), 100);
    setTimeout(() => this.playTone(784, 0.2, 'sine'), 200);
  }

  playIncorrect() {
    this.playTone(300, 0.15, 'sawtooth');
    setTimeout(() => this.playTone(250, 0.2, 'sawtooth'), 100);
  }

  // Playground-specific sounds
  playPop() {
    this.playTone(1200, 0.08, 'sine');
    setTimeout(() => this.playTone(600, 0.05, 'sine'), 40);
  }

  playWhoosh() {
    if (this.isMuted || !this.audioContext) return;
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    osc.connect(gain);
    gain.connect(this.audioContext.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.2);
    gain.gain.setValueAtTime(0.2, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
    osc.start(this.audioContext.currentTime);
    osc.stop(this.audioContext.currentTime + 0.2);
  }

  playDing() {
    this.playTone(1047, 0.15, 'sine');
    this.playTone(1319, 0.15, 'sine');
  }

  playBuzz() {
    this.playTone(150, 0.25, 'sawtooth');
  }

  playSnap() {
    this.playTone(1500, 0.03, 'square');
  }

  playPerfectStreak() {
    const notes = [523, 587, 659, 784, 880];
    notes.forEach((note, i) => {
      setTimeout(() => this.playTone(note, 0.15, 'sine'), i * 80);
    });
  }

  playCelebration() {
    const notes = [523, 659, 784, 1047];
    notes.forEach((note, i) => {
      setTimeout(() => {
        this.playTone(note, 0.2, 'sine');
        this.playTone(note * 1.5, 0.2, 'sine');
      }, i * 100);
    });
  }

  playPowerUp() {
    this.playTone(800, 0.1, 'square');
    setTimeout(() => this.playTone(1000, 0.1, 'square'), 80);
    setTimeout(() => this.playTone(1200, 0.15, 'square'), 160);
  }

  playTimerWarning() {
    this.playTone(440, 0.1, 'triangle');
  }

  playLevelComplete() {
    this.playCelebration();
  }

  playStarEarned() {
    this.playTone(1000, 0.1, 'sine');
    setTimeout(() => this.playTone(1200, 0.15, 'sine'), 100);
  }

  playLevelUpAnthem() {
    if (this.isMuted || !this.audioContext) return;
    const melody = [
      { note: 523, duration: 0.3 },
      { note: 587, duration: 0.3 },
      { note: 659, duration: 0.4 },
      { note: 659, duration: 0.2 },
      { note: 698, duration: 0.3 },
      { note: 784, duration: 0.5 },
      { note: 880, duration: 0.4 },
      { note: 784, duration: 0.3 },
      { note: 1047, duration: 0.6 },
    ];

    let time = 0;
    melody.forEach(({ note, duration }) => {
      setTimeout(() => {
        this.playTone(note, duration, 'sine');
        this.playTone(note * 0.5, duration * 1.2, 'sine');
      }, time * 1000);
      time += duration;
    });

    setTimeout(() => {
      this.playTone(523, 1.2, 'sine');
      this.playTone(659, 1.2, 'sine');
      this.playTone(784, 1.2, 'sine');
      this.playTone(1047, 1.2, 'sine');
    }, time * 1000);
  }

  setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  isSoundMuted(): boolean {
    return this.isMuted;
  }
}

export const soundEffectsService = new SoundEffectsService();
