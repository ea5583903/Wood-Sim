class AudioManager {
  constructor() {
    this.audioContext = null;
    this.masterGain = null;
    this.muted = false;
    this.volume = 0.3;
    
    this.initAudio();
  }
  
  initAudio() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.masterGain.gain.value = this.volume;
    } catch (e) {
      console.warn('Web Audio API not supported');
    }
  }
  
  createBeep(frequency, duration, type = 'sine') {
    if (!this.audioContext || this.muted) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);
    
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    
    gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }
  
  playShoot() {
    this.createBeep(800, 0.1, 'square');
  }
  
  playHit() {
    this.createBeep(400, 0.15, 'sawtooth');
  }
  
  playExplosion() {
    this.createBeep(200, 0.3, 'sawtooth');
    setTimeout(() => this.createBeep(150, 0.2, 'triangle'), 50);
  }
  
  playPowerUp() {
    this.createBeep(600, 0.1);
    setTimeout(() => this.createBeep(800, 0.1), 100);
    setTimeout(() => this.createBeep(1000, 0.1), 200);
  }
  
  playDamage() {
    this.createBeep(150, 0.5, 'sawtooth');
  }
  
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.masterGain) {
      this.masterGain.gain.value = this.muted ? 0 : this.volume;
    }
  }
  
  toggleMute() {
    this.muted = !this.muted;
    if (this.masterGain) {
      this.masterGain.gain.value = this.muted ? 0 : this.volume;
    }
  }
}

export default AudioManager;