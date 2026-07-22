import { logger } from '@/utils/logger';

export class JitsiApiLoader {
  private static isLoading = false;
  private static isLoaded = false;

  static async loadJitsiApi(): Promise<void> {
    if (this.isLoaded && window.JitsiMeetExternalAPI) {
      logger.debug('Jitsi API already loaded');
      return Promise.resolve();
    }

    if (this.isLoading) {
      logger.debug('Jitsi API is already loading, waiting');
      return new Promise((resolve, reject) => {
        const checkLoaded = () => {
          if (this.isLoaded && window.JitsiMeetExternalAPI) {
            resolve();
          } else if (!this.isLoading) {
            reject(new Error('Failed to load Jitsi API'));
          } else {
            setTimeout(checkLoaded, 100);
          }
        };
        checkLoaded();
      });
    }

    return new Promise((resolve, reject) => {
      logger.debug('Loading Jitsi Meet API');
      this.isLoading = true;

      const existingScript = document.querySelector('script[src*="external_api.js"]');
      if (existingScript) {
        logger.debug('Jitsi script already exists, checking if loaded');
        if (window.JitsiMeetExternalAPI) {
          this.isLoaded = true;
          this.isLoading = false;
          resolve();
          return;
        }
      }

      const script = document.createElement('script');
      script.src = 'https://meet.jit.si/external_api.js';
      script.async = true;
      
      script.onload = () => {
        logger.info('Jitsi API script loaded');
        this.isLoaded = true;
        this.isLoading = false;
        
        if (window.JitsiMeetExternalAPI) {
          resolve();
        } else {
          reject(new Error('Jitsi API loaded but JitsiMeetExternalAPI not available'));
        }
      };
      
      script.onerror = (error) => {
        logger.error('Failed to load Jitsi API script', error);
        this.isLoading = false;
        reject(new Error('Failed to load Jitsi Meet API script'));
      };

      document.head.appendChild(script);
    });
  }

  static createContainer(): HTMLElement {
    let container = document.getElementById('jitsi-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'jitsi-container';
      container.style.display = 'none';
      container.style.position = 'absolute';
      container.style.top = '-9999px';
      container.style.left = '-9999px';
      container.style.width = '1px';
      container.style.height = '1px';
      document.body.appendChild(container);
      logger.debug('Created Jitsi container');
    }
    return container;
  }

  static removeContainer(): void {
    const container = document.getElementById('jitsi-container');
    if (container) {
      container.remove();
      logger.debug('Removed Jitsi container');
    }
  }
}
