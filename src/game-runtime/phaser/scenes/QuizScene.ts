import { BaseScene } from './BaseScene';
import type { QuizData } from '../../engine/types';

export class QuizScene extends BaseScene {
  protected renderScene(width: number, height: number, _x: number, y: number): void {
    const data = this.sceneConfig.data as QuizData;
    this.add.text(width / 2, y + 40, data.question, {
      fontFamily: 'Poppins', fontSize: '28px', color: this.palette.text, fontStyle: 'bold',
      wordWrap: { width: width - 80 }, align: 'center',
    }).setOrigin(0.5);

    // Announce the question so screen-reader users hear it after the
    // generic scene-transition message fired in BaseScene.create().
    this.announce(data.question);

    let answered = false;
    const cards: Array<{ rect: Phaser.GameObjects.Rectangle; activate: () => void }> = [];

    data.options.forEach((opt, i) => {
      const ow = Math.min(width - 80, 480);
      const oh = 56;
      const ox = width / 2;
      const oy = y + 120 + i * (oh + 16);
      const bg = this.add.rectangle(ox, oy, ow, oh, this.palette.card).setStrokeStyle(2, 0xe5e7eb);
      const txt = this.add.text(ox, oy, opt, {
        fontFamily: 'Inter', fontSize: '22px', color: this.palette.text,
      }).setOrigin(0.5);
      bg.setInteractive({ useHandCursor: true });
      this.attachHoverLift(bg);

      const activate = () => {
        if (answered) return;
        answered = true;
        const correct = i === data.answerIndex;
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
          const right = data.options[data.answerIndex];
          this.announce(`Not quite. The answer is ${right}.`);
        }
        this.time.delayedCall(correct ? 900 : 700, () => this.complete({ correct, score: correct ? 1 : 0 }));
      };

      bg.on('pointerdown', activate);
      cards.push({ rect: bg, activate });
    });

    this.attachChoiceKeyboard(cards);
  }
}
