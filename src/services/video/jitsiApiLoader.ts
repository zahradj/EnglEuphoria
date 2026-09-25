import { logger } from '@/utils/logger';

export class JitsiApiLoader {
  private static isLoading = false;
  private static isLoaded = false;

  /** How long to wait for the injected <script> to fire onload/onerror before giving up. */
  private static readonly LOAD_TIMEOUT_MS = 15000;

  static async loadJitsiApi(): Promise<void> {
    // If the global constructor is already on `window`, the API *is* loaded —
    // whether we injected the script, index.html did, or a previous loader
    // instance did before module state was reset. The old guard also required
    // our private `isLoaded` flag, so in any of those cases we'd fall through
    // and inject a redundant <script>, then hang forever waiting for an
    // `onload` that never comes (it also never fires in jsdom, which is why
    // every lifecycle test timed out on `await service.initialize()`).
    if (window.JitsiMeetExternalAPI) {
      this.isLoaded = true;
      this.isLoading = false;
      logger.debug('Jitsi API already available on window');
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

      // Guard against a load that never resolves (offline, CDN stall, a
      // network layer that holds the connection open without ever firing
      // onload or onerror). Without this, `initialize()` hangs indefinitely
      // with no error surfaced anywhere.
      const timeoutId = setTimeout(() => {
        this.isLoading = false;
        script.onload = null;
        script.onerror = null;
        script.remove();
        reject(new Error('Timed out loading Jitsi Meet API script'));
      }, this.LOAD_TIMEOUT_MS);

      script.onload = () => {
        clearTimeout(timeoutId);
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
        clearTimeout(timeoutId);
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
