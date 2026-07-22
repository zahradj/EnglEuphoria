import { BaseScene } from './BaseScene';
import type { StoryData } from '../../engine/types';

export class StoryScene extends BaseScene {
  private pageIdx = 0;
  private pageText?: Phaser.GameObjects.Text;
  private nextBtn?: Phaser.GameObjects.Container;

  protected renderScene(width: number, height: number, _x: number, y: number): void {
    const data = this.sceneConfig.data as StoryData;
    this.add.text(width / 2, y + 30, data.title, {
      fontFamily: 'Poppins', fontSize: '28px', color: this.palette.text, fontStyle: 'bold',
    }).setOrigin(0.5);
    this.pageText = this.add.text(width / 2, y + height * 0.4, data.pages[0].text, {
      fontFamily: 'Inter', fontSize: '24px', color: this.palette.text,
      wordWrap: { width: width - 100 }, align: 'center',
    }).setOrigin(0.5);
    this.refreshButton();
  }

  private refreshButton() {
    const data = this.sceneConfig.data as StoryData;
    const isLast = this.pageIdx === data.pages.length - 1;
    if (this.nextBtn) this.nextBtn.destroy(true);
    this.nextBtn = this.addPrimaryButton(isLast ? 'Finish ▶' : 'Next ▶', () => {
      if (isLast) {
        this.complete({ correct: true });
        return;
      }
      this.pageIdx += 1;
      this.pageText?.setText(data.pages[this.pageIdx].text);
      this.refreshButton();
    });
  }
}
