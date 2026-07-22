// Eye-contact / gaze-avoidance detector.
// Uses the browser's experimental FaceDetector when available, otherwise
// returns neutral readings (the engine downgrades to volume+posture only).
// No heavy ML deps — keeps the bundle small.

declare global {
  interface Window {
    FaceDetector?: new (opts?: { fastMode?: boolean }) => {
      detect: (img: CanvasImageSource) => Promise<Array<{ boundingBox: DOMRect; landmarks?: Array<{ type: string }> }>>;
    };
  }
}

const WINDOW_MS = 4000;

export class GazeDetector {
  private samples: Array<{ t: number; contact: boolean }> = [];
  private detector: ReturnType<NonNullable<Window['FaceDetector']>['prototype']['detect']> extends infer R ? unknown : never;
  private fd: InstanceType<NonNullable<Window['FaceDetector']>> | null = null;

  constructor() {
    try {
      if (typeof window !== 'undefined' && window.FaceDetector) {
        this.fd = new window.FaceDetector({ fastMode: true });
      }
    } catch {
      this.fd = null;
    }
  }

  available() {
    return !!this.fd;
  }

  async sample(video: HTMLVideoElement, now = Date.now()): Promise<void> {
    if (!this.fd || video.readyState < 2) return;
    try {
      const faces = await this.fd.detect(video);
      const contact = faces.length > 0 && this.faceCentered(faces[0].boundingBox, video);
      this.samples.push({ t: now, contact });
      const cutoff = now - WINDOW_MS;
      while (this.samples.length && this.samples[0].t < cutoff) this.samples.shift();
    } catch {
      /* ignore */
    }
  }

  ratio(): number {
    if (!this.samples.length) return 0.5; // neutral when unknown
    const yes = this.samples.filter((s) => s.contact).length;
    return yes / this.samples.length;
  }

  private faceCentered(box: DOMRect, video: HTMLVideoElement): boolean {
    const w = video.videoWidth || 1;
    const h = video.videoHeight || 1;
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;
    return (
      cx > w * 0.25 &&
      cx < w * 0.75 &&
      cy > h * 0.15 &&
      cy < h * 0.7 &&
      box.width > w * 0.18
    );
  }
}
