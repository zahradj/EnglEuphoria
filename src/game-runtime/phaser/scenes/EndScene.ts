import { BaseScene } from './BaseScene';
import type { EndData } from '../../engine/types';
import { attachPip, ensurePipTexture, type PipController } from '../character';
import { SoundScape } from '../audio';

export class EndScene extends BaseScene {
  private pip?: PipController;

  preload() {
    ensurePipTexture(this);
  }

  protected renderScene(width: number, height: number, _x: number, y: number): void {
    const data = this.sceneConfig.data as EndData;
    // Triumphant fanfare on the finale.
    this.time.delayedCall(180, () => SoundScape.fanfare());
    this.add.text(width / 2, y + 60, data.title, {
      fontFamily: 'Poppins', fontSize: '40px', color: this.palette.text, fontStyle: 'bold',
    }).setOrigin(0.5);
    data.bullets.forEach((b, i) => {
      this.add.text(width / 2, y + 150 + i * 40, `★ ${b}`, {
        fontFamily: 'Inter', fontSize: '22px', color: this.palette.text,
      }).setOrigin(0.5);
    });
    this.addPrimaryButton('Done ✓', () => this.complete({ correct: true }));

    this.pip = attachPip(this, { side: 'right' });
    this.pip.enter('right').then(() => {
      this.pip?.celebrate();
      const line = data.bullets[0] ? `Amazing! ${data.bullets[0]}` : 'Amazing work!';
      this.pip?.say(line);
    });
  }
}
