import { BaseScene } from './BaseScene';
import type { IntroData } from '../../engine/types';
import { attachPip, ensurePipTexture, type PipController } from '../character';
import { SoundScape } from '../audio';

export class IntroScene extends BaseScene {
  private pip?: PipController;

  preload() {
    ensurePipTexture(this);
  }

  protected renderScene(width: number, height: number, _x: number, y: number): void {
    const data = this.sceneConfig.data as IntroData;
    this.add.text(width / 2, y + height * 0.35, data.title, {
      fontFamily: 'Poppins, Inter, sans-serif',
      fontSize: '42px',
      color: this.palette.text,
      fontStyle: 'bold',
    }).setOrigin(0.5);
    if (data.subtitle) {
      this.add.text(width / 2, y + height * 0.35 + 56, data.subtitle, {
        fontFamily: 'Inter, sans-serif',
        fontSize: '20px',
        color: this.palette.text,
      }).setOrigin(0.5);
    }
    this.addPrimaryButton('Start ▶', () => {
      SoundScape.unlock();
      SoundScape.tap();
      this.complete({ correct: true });
    });

    this.pip = attachPip(this, { side: 'left' });
    this.pip.enter('left').then(() => {
      const line = data.subtitle ? `${data.title} — ${data.subtitle}` : data.title;
      this.pip?.say(line);
    });
  }
}
