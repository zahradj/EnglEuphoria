import { BaseScene } from './BaseScene';
import type { FillBlankData } from '../../engine/types';

export class FillBlankScene extends BaseScene {
  protected renderScene(width: number, height: number, _x: number, y: number): void {
    const data = this.sceneConfig.data as FillBlankData;
    this.add.text(width / 2, y + 80, data.sentence, {
      fontFamily: 'Poppins', fontSize: '32px', color: this.palette.text, fontStyle: 'bold',
      wordWrap: { width: width - 80 }, align: 'center',
    }).setOrigin(0.5);

    // Read the prompt aloud for screen-reader users.
    this.announce(`Fill in the blank: ${data.sentence}`);

    let answered = false;
    const ow = 160; const oh = 56;
    const spacing = width / (data.options.length + 1);
    const cards: Array<{ rect: Phaser.GameObjects.Rectangle; activate: () => void }> = [];

    data.options.forEach((opt, i) => {
      const ox = spacing * (i + 1);
      const oy = y + 220;
      const bg = this.add.rectangle(ox, oy, ow, oh, this.palette.card).setStrokeStyle(2, 0xe5e7eb);
      const txt = this.add.text(ox, oy, opt, {
        fontFamily: 'Inter', fontSize: '22px', color: this.palette.text, fontStyle: 'bold',
      }).setOrigin(0.5);
      bg.setInteractive({ useHandCursor: true });
      this.attachHoverLift(bg);

      const activate = () => {
        if (answered) return;
        answered = true;
        const correct = opt === data.answer;
        this.rippleAt(ox, oy, correct ? this.palette.ok : this.palette.bad);
        bg.setFillStyle(correct ? this.palette.ok : this.palette.bad, 1);
        txt.setColor('#ffffff');
        if (correct) {
          this.pulseScale(bg);
          this.reward.correct({ at: { x: ox, y: oy }, xp: 10 });
          this.announce(`Correct. ${opt}.`);
        } else {
          this.nudgeShake(bg);
          this.nudgeShake(txt);
          this.reward.wrong({ at: { x: ox, y: oy } });
          this.announce(`Not quite. The answer is ${data.answer}.`);
        }
        this.time.delayedCall(correct ? 900 : 700, () => this.complete({ correct, score: correct ? 1 : 0 }));
      };

      bg.on('pointerdown', activate);
      cards.push({ rect: bg, activate });
    });

    this.attachChoiceKeyboard(cards);
  }
}
