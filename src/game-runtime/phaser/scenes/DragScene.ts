import Phaser from 'phaser';
import { BaseScene } from './BaseScene';
import type { DragData } from '../../engine/types';
import { SoundScape } from '../audio';
import { haptic } from '../touch';

export class DragScene extends BaseScene {
  protected renderScene(width: number, height: number, _x: number, y: number): void {
    const data = this.sceneConfig.data as DragData;
    const compact = this.isCompact();

    this.add.text(width / 2, y + 30, data.prompt, {
      fontFamily: 'Poppins',
      fontSize: compact ? '20px' : '24px',
      color: this.palette.text,
      fontStyle: 'bold',
      wordWrap: { width: width - 60 },
      align: 'center',
    }).setOrigin(0.5);

    // Responsive target & token sizing — never below 44px tap-target.
    const targetW = Math.max(96, Math.min(160, (width - 60) / Math.max(data.targets.length, 1) - 12));
    const targetH = compact ? 88 : 100;
    const tokenW = Math.max(96, Math.min(140, (width - 60) / Math.max(data.items.length, 1) - 12));
    const tokenH = compact ? 56 : 64;

    const targetSlots = new Map<string, Phaser.GameObjects.Rectangle>();
    const targetMatched = new Map<string, boolean>();
    const targetForItem = new Map<string, string>(); // itemId -> targetId
    data.targets.forEach((t) => targetForItem.set(t.accepts, t.id));

    const targetXSpacing = width / (data.targets.length + 1);
    data.targets.forEach((t, i) => {
      const tx = targetXSpacing * (i + 1);
      const ty = y + 150;
      const rect = this.add.rectangle(tx, ty, targetW, targetH, 0xe0e7ff).setStrokeStyle(3, 0x6366f1);
      this.add.text(tx, ty, t.label, {
        fontFamily: 'Inter',
        fontSize: compact ? '16px' : '18px',
        color: this.palette.text,
        wordWrap: { width: targetW - 16 },
        align: 'center',
      }).setOrigin(0.5);
      targetSlots.set(t.id, rect);
      targetMatched.set(t.id, false);
    });

    let matched = 0;
    const itemXSpacing = width / (data.items.length + 1);
    data.items.forEach((it, i) => {
      const ix = itemXSpacing * (i + 1);
      const iy = y + height - 120;
      const token = this.add.container(ix, iy);
      const bg = this.add.rectangle(0, 0, tokenW, tokenH, this.palette.accent);
      const txt = this.add.text(0, 0, it.label, {
        fontFamily: 'Inter',
        fontSize: compact ? '18px' : '20px',
        color: this.palette.accentText,
        fontStyle: 'bold',
        wordWrap: { width: tokenW - 16 },
        align: 'center',
      }).setOrigin(0.5);
      token.add([bg, txt]);
      token.setSize(tokenW, tokenH);
      // Generous hit area: 24px padding around the visual so finger drags
      // engage even when the touch lands just outside the card.
      token.setInteractive({
        hitArea: new Phaser.Geom.Rectangle(-tokenW / 2 - 12, -tokenH / 2 - 12, tokenW + 24, tokenH + 24),
        hitAreaCallback: Phaser.Geom.Rectangle.Contains,
        draggable: true,
        useHandCursor: true,
      });
      this.input.setDraggable(token);
      const home = { x: ix, y: iy };

      token.on('dragstart', () => {
        SoundScape.pick();
        haptic('tap');
        token.setScale(1.06);
        // Highlight the correct target so kids see the affordance.
        const correctTargetId = targetForItem.get(it.id);
        if (correctTargetId && !targetMatched.get(correctTargetId)) {
          const r = targetSlots.get(correctTargetId);
          r?.setStrokeStyle(4, this.palette.accent, 1);
        }
      });
      token.on('drag', (_p: Phaser.Input.Pointer, dx: number, dy: number) => {
        token.x = dx; token.y = dy;
      });
      token.on('dragend', () => {
        token.setScale(1);
        SoundScape.drop();
        // Reset hint stroke on the correct target unless it was matched.
        const correctTargetId = targetForItem.get(it.id);
        if (correctTargetId && !targetMatched.get(correctTargetId)) {
          targetSlots.get(correctTargetId)?.setStrokeStyle(3, 0x6366f1);
        }
        const target = data.targets.find((t) => {
          const r = targetSlots.get(t.id)!;
          return Phaser.Geom.Rectangle.Contains(r.getBounds(), token.x, token.y);
        });
        if (target && target.accepts === it.id && !targetMatched.get(target.id)) {
          targetMatched.set(target.id, true);
          const r = targetSlots.get(target.id)!;
          r.setFillStyle(this.palette.ok, 0.4);
          this.tweens.add({ targets: token, x: r.x, y: r.y, duration: 150, ease: 'Back.Out' });
          this.pulseScale(r);
          this.rippleAt(r.x, r.y, this.palette.ok);
          token.disableInteractive();
          matched += 1;
          this.reward.correct({ at: { x: r.x, y: r.y }, xp: 5 });
          if (matched === data.items.length) {
            haptic('celebrate');
            this.time.delayedCall(700, () => this.complete({ correct: true, score: 1 }));
          }
        } else {
          this.reward.wrong({ at: { x: token.x, y: token.y } });
          this.rippleAt(token.x, token.y, this.palette.bad);
          haptic('error');
          this.tweens.add({ targets: token, x: home.x, y: home.y, duration: 260, ease: 'Back.Out' });
        }
      });
    });
  }
}
