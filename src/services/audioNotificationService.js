// Services de notification audio pour les alertes de session
class AudioNotificationService {
  constructor() {
    this.audioContext = null;
    this.sounds = new Map();
    this.isEnabled = true;
    this.volume = 0.7;
    
    this.initializeAudioContext();
    this.preloadSounds();
  }

  async initializeAudioContext() {
    try {
      // Initialiser le contexte audio
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Débloquer le contexte audio (nécessaire après interaction utilisateur)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
    } catch (error) {
      console.warn('⚠️ [AUDIO] Impossible d\'initialiser le contexte audio:', error);
      this.isEnabled = false;
    }
  }

  // Générateur de sons synthétisés
  createBeepSound(frequency = 800, duration = 0.2, type = 'sine') {
    if (!this.audioContext) return null;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    oscillator.type = type;
    
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(this.volume, this.audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
    
    return { oscillator, gainNode, duration };
  }

  // Sons prédéfinis
  preloadSounds() {
    // Son d'alerte 5 minutes - son doux mais informatif
    this.sounds.set('warning_5min', () => {
      return this.createBeepSound(440, 0.3, 'sine'); // La - son doux
    });

    // Son d'alerte 1 minute - plus urgent
    this.sounds.set('warning_1min', () => {
      return this.createBeepSound(880, 0.5, 'square'); // La aigu - plus urgent
    });

    // Son d'expiration - très urgent
    this.sounds.set('session_expired', () => {
      // Séquence de 3 bips rapides
      return this.createBeepSound(1100, 0.15, 'sawtooth'); // Son très aigu et urgent
    });

    // Son de succès
    this.sounds.set('success', () => {
      return this.createBeepSound(660, 0.3, 'sine'); // Mi - son positif
    });

    // Son d'erreur
    this.sounds.set('error', () => {
      return this.createBeepSound(220, 0.8, 'sawtooth'); // Son grave et inquiétant
    });
  }

  async playSound(soundType) {
    if (!this.isEnabled || !this.audioContext) {
      console.warn('⚠️ [AUDIO] Audio désactivé ou contexte indisponible');
      return;
    }

    try {
      // S'assurer que le contexte audio est actif
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      const soundGenerator = this.sounds.get(soundType);
      if (!soundGenerator) {
        console.warn(`⚠️ [AUDIO] Son non trouvé: ${soundType}`);
        return;
      }

      // Gérer les sons spéciaux avec séquences
      if (soundType === 'session_expired') {
        await this.playExpiredSequence();
        return;
      }

      if (soundType === 'warning_1min') {
        await this.playUrgentSequence();
        return;
      }

      // Son simple
      const sound = soundGenerator();
      if (sound) {
        const { oscillator, duration } = sound;
        const now = this.audioContext.currentTime;
        
        oscillator.start(now);
        oscillator.stop(now + duration);
      }

    } catch (error) {
      console.error('❌ [AUDIO] Erreur lors de la lecture du son:', error);
    }
  }

  // Séquence d'alerte urgente (1 minute)
  async playUrgentSequence() {
    const delays = [0, 0.2, 0.4]; // 3 bips rapides
    
    for (const delay of delays) {
      setTimeout(() => {
        const sound = this.createBeepSound(880, 0.15, 'square');
        if (sound) {
          const { oscillator, duration } = sound;
          const now = this.audioContext.currentTime;
          oscillator.start(now);
          oscillator.stop(now + duration);
        }
      }, delay * 1000);
    }
  }

  // Séquence d'expiration (très urgente)
  async playExpiredSequence() {
    const sequence = [
      { freq: 1100, duration: 0.15, delay: 0 },
      { freq: 1300, duration: 0.15, delay: 0.2 },
      { freq: 1100, duration: 0.15, delay: 0.4 },
      { freq: 1500, duration: 0.3, delay: 0.7 }
    ];
    
    for (const note of sequence) {
      setTimeout(() => {
        const sound = this.createBeepSound(note.freq, note.duration, 'sawtooth');
        if (sound) {
          const { oscillator, duration } = sound;
          const now = this.audioContext.currentTime;
          oscillator.start(now);
          oscillator.stop(now + duration);
        }
      }, note.delay * 1000);
    }
  }

  // Contrôles
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  setEnabled(enabled) {
    this.isEnabled = enabled;
  }

  getVolume() {
    return this.volume;
  }

  isAudioEnabled() {
    return this.isEnabled && !!this.audioContext;
  }

  // Test des sons
  async testSound(soundType = 'warning_5min') {
    console.log(`🔊 [AUDIO] Test du son: ${soundType}`);
    await this.playSound(soundType);
  }

  // Méthodes utilitaires pour les notifications de session
  playSessionWarning5Min() {
    console.log('🔔 [AUDIO] Alerte 5 minutes');
    return this.playSound('warning_5min');
  }

  playSessionWarning1Min() {
    console.log('🚨 [AUDIO] Alerte 1 minute');
    return this.playSound('warning_1min');
  }

  playSessionExpired() {
    console.log('🔥 [AUDIO] Session expirée');
    return this.playSound('session_expired');
  }

  playSuccess() {
    return this.playSound('success');
  }

  playError() {
    return this.playSound('error');
  }
}

// Instance singleton
const audioNotificationService = new AudioNotificationService();

export default audioNotificationService;

// Export des méthodes principales
export const {
  playSessionWarning5Min,
  playSessionWarning1Min,
  playSessionExpired,
  playSuccess,
  playError,
  setVolume,
  setEnabled,
  testSound,
  isAudioEnabled
} = audioNotificationService;
