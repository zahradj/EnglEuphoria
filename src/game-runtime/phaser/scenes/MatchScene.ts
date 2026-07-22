import Phaser from 'phaser';
import { BaseScene } from './BaseScene';
import type { MatchData } from '../../engine/types';

export class MatchScene extends BaseScene {
  protected renderScene(width: number, height: number, _x: number, y: number): void {
    const data = this.sceneConfig.data as MatchData;
    this.add.text(width / 2, y + 30, data.prompt, {
      fontFamily: 'Poppins', fontSize: '22px', color: this.palette.text, fontStyle: 'bold',
    }).setOrigin(0.5);

    const lefts = data.pairs.map((p) => p.left);
    const rights = Phaser.Utils.Array.Shuffle(data.pairs.map((p) => p.right));
    const colW = width / 3;
    const startY = y + 100;
    const rowH = 64;

    let selectedLeft: { idx: number; node: Phaser.GameObjects.Rectangle } | null = null;
    const usedLeft = new Set<number>();
    const usedRight = new Set<number>();
    let matched = 0;

    const makeCard = (
      label: string, x: number, yPos: number, onClick: (rect: Phaser.GameObjects.Rectangle) => void,
    ) => {
      const rect = this.add.rectangle(x, yPos, colW - 40, rowH - 12, this.palette.card)
        .setStrokeStyle(2, 0xe5e7eb);
      this.add.text(x, yPos, label, {
        fontFamily: 'Inter', fontSize: '20px', color: this.palette.text,
      }).setOrigin(0.5);
      rect.setInteractive({ useHandCursor: true });
      this.attachHoverLift(rect);
      rect.on('pointerdown', () => onClick(rect));
      return rect;
    };

    lefts.forEach((label, i) => {
      const rect = makeCard(label, colW, startY + i * rowH, (r) => {
        if (usedLeft.has(i)) return;
        if (selectedLeft) selectedLeft.node.setStrokeStyle(2, 0xe5e7eb);
        selectedLeft = { idx: i, node: r };
        r.setStrokeStyle(3, this.palette.accent);
        this.rippleAt(r.x, r.y, this.palette.accent);
      });
      void rect;
    });

    rights.forEach((label, j) => {
      const rect = makeCard(label, colW * 2, startY + j * rowH, (r) => {
        if (usedRight.has(j) || !selectedLeft) return;
        const leftLabel = lefts[selectedLeft.idx];
        const pair = data.pairs.find((p) => p.left === leftLabel)!;
        if (pair.right === label) {
          r.setFillStyle(this.palette.ok, 0.4);
          selectedLeft.node.setFillStyle(this.palette.ok, 0.4);
          this.pulseScale(r);
          this.pulseScale(selectedLeft.node);
          this.rippleAt(r.x, r.y, this.palette.ok);
          usedLeft.add(selectedLeft.idx);
          usedRight.add(j);
          this.reward.correct({ at: { x: r.x, y: r.y }, xp: 5 });
          selectedLeft = null;
          matched += 1;
          if (matched === data.pairs.length) {
            this.time.delayedCall(700, () => this.complete({ correct: true, score: 1 }));
          }
        } else {
          r.setFillStyle(this.palette.bad, 0.4);
          this.nudgeShake(r);
          this.reward.wrong({ at: { x: r.x, y: r.y } });
          this.time.delayedCall(400, () => r.setFillStyle(this.palette.card, 1));
          if (selectedLeft) selectedLeft.node.setStrokeStyle(2, 0xe5e7eb);
          selectedLeft = null;
        }
      });
      void rect;
    });
  }
}
