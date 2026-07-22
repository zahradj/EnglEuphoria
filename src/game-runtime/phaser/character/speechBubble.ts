/**
 * SpeechBubble — rounded-rect bubble with typewriter text.
 * Anchored to a target point (Pip's mouth) with a small tail.
 */
import Phaser from 'phaser';

export interface BubbleOptions {
  maxWidth?: number;
  durationMs?: number;
  fontSize?: number;
}

export class SpeechBubble {
  private container: Phaser.GameObjects.Container;
  private bg: Phaser.GameObjects.Graphics;
  private txt: Phaser.GameObjects.Text;
  private typer?: Phaser.Time.TimerEvent;
  private autoDismiss?: Phaser.Time.TimerEvent;
  private full = '';

  constructor(private scene: Phaser.Scene) {
    this.container = scene.add.container(0, 0).setDepth(950).setVisible(false);
    this.bg = scene.add.graphics();
    this.txt = scene.add.text(0, 0, '', {
      fontFamily: 'Poppins, Inter, sans-serif',
      fontSize: '20px',
      color: '#1a1a1a',
      wordWrap: { width: 320 },
    }).setOrigin(0, 0);
    this.container.add([this.bg, this.txt]);
  }

  say(text: string, anchorX: number, anchorY: number, opts: BubbleOptions = {}) {
    const maxWidth = opts.maxWidth ?? 320;
    const durationMs = opts.durationMs ?? Math.max(2400, text.length * 55);
    const fontSize = opts.fontSize ?? 20;

    this.typer?.remove();
    this.autoDismiss?.remove();

    this.full = text;
    this.txt.setStyle({
      fontFamily: 'Poppins, Inter, sans-serif',
      fontSize: `${fontSize}px`,
      color: '#1a1a1a',
      wordWrap: { width: maxWidth },
    });
    this.txt.setText('');

    // Measure final size by setting full text temporarily
    this.txt.setText(text);
    const w = Math.min(this.txt.width + 28, maxWidth + 28);
    const h = this.txt.height + 24;
    this.txt.setText('');

    // Position bubble above-and-right of anchor (Pip's head)
    const camW = this.scene.scale.width;
    let bx = anchorX + 40;
    if (bx + w > camW - 16) bx = anchorX - w - 40;
    const by = Math.max(16, anchorY - h - 24);

    this.container.setPosition(bx, by).setVisible(true).setAlpha(0).setScale(0.9);
    this.bg.clear();
    this.bg.fillStyle(0xffffff, 1);
    this.bg.lineStyle(3, 0xfb923c, 1);
    this.bg.fillRoundedRect(0, 0, w, h, 18);
    this.bg.strokeRoundedRect(0, 0, w, h, 18);
    // tail pointing toward anchor
    const tailX = anchorX > bx + w / 2 ? w - 28 : 20;
    this.bg.fillTriangle(tailX, h, tailX + 18, h, tailX + 8, h + 14);
    this.bg.lineBetween(tailX, h, tailX + 8, h + 14);
    this.bg.lineBetween(tailX + 18, h, tailX + 8, h + 14);
    this.txt.setPosition(14, 12);

    this.scene.tweens.add({
      targets: this.container,
      alpha: 1,
      scale: 1,
      duration: 180,
      ease: 'Back.Out',
    });

    // Typewriter
    let i = 0;
    this.typer = this.scene.time.addEvent({
      delay: 22,
      repeat: text.length - 1,
      callback: () => {
        i++;
        this.txt.setText(text.slice(0, i));
      },
    });

    this.autoDismiss = this.scene.time.delayedCall(durationMs, () => this.hide());
  }

  hide() {
    this.typer?.remove();
    this.autoDismiss?.remove();
    if (!this.container.visible) return;
    this.scene.tweens.add({
      targets: this.container,
      alpha: 0,
      scale: 0.9,
      duration: 140,
      onComplete: () => this.container.setVisible(false),
    });
  }

  destroy() {
    this.typer?.remove();
    this.autoDismiss?.remove();
    this.container.destroy();
  }
}
