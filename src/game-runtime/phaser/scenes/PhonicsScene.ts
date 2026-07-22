import { BaseScene } from './BaseScene';
import type { PhonicsData } from '../../engine/types';

export class PhonicsScene extends BaseScene {
  protected renderScene(width: number, height: number, _x: number, y: number): void {
    const data = this.sceneConfig.data as PhonicsData;
    this.add.text(width / 2, y + 40, 'Phonics', {
      fontFamily: 'Inter', fontSize: '18px', color: this.palette.text,
    }).setOrigin(0.5);
    this.add.text(width / 2, y + 100, data.sound, {
      fontFamily: 'Poppins', fontSize: '72px', color: this.palette.text, fontStyle: 'bold',
    }).setOrigin(0.5);
    data.examples.forEach((ex, i) => {
      this.add.text(width / 2, y + 200 + i * 44, ex.toUpperCase(), {
        fontFamily: 'Inter', fontSize: '28px', color: this.palette.text,
      }).setOrigin(0.5);
    });
    this.addPrimaryButton('Got it ▶', () => this.complete({ correct: true }));
  }
}
