import { BaseScene } from './BaseScene';
import type { VocabData } from '../../engine/types';
import { attachPip, ensurePipTexture, type PipController } from '../character';

export class VocabScene extends BaseScene {
  private pip?: PipController;

  preload() {
    ensurePipTexture(this);
  }

  protected renderScene(width: number, height: number, _x: number, y: number): void {
    const data = this.sceneConfig.data as VocabData;
    const cardW = Math.min(width - 80, 520);
    const cardH = 260;
    const cardX = width / 2;
    const cardY = y + height * 0.35;
    this.add.rectangle(cardX, cardY, cardW, cardH, this.palette.card)
      .setStrokeStyle(2, 0xe5e7eb);
    this.add.text(cardX, cardY - 40, data.word.toUpperCase(), {
      fontFamily: 'Poppins', fontSize: '56px', color: this.palette.text, fontStyle: 'bold',
    }).setOrigin(0.5);
    this.add.text(cardX, cardY + 50, data.definition, {
      fontFamily: 'Inter', fontSize: '22px', color: this.palette.text,
      wordWrap: { width: cardW - 40 }, align: 'center',
    }).setOrigin(0.5);

    this.addPrimaryButton('Got it ▶', () => {
      this.pip?.celebrate();
      this.time.delayedCall(420, () => this.complete({ correct: true }));
    });

    this.pip = attachPip(this, { side: 'left' });
    this.pip.enter('left').then(() => {
      this.pip?.point(cardX, cardY);
      this.pip?.say(`${data.word}: ${data.definition}`);
    });
  }
}
