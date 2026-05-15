import { Scene, GameContext, SceneType } from '../types';
import { ShopSystem } from '../systems/ShopSystem';
import { SaveSystem } from '../systems/SaveSystem';

export class ShopScene implements Scene {
  type: SceneType = 'shop';
  private context!: GameContext;
  private onTransition: (to: SceneType, partial?: Partial<GameContext>) => void;

  constructor(onTransition: (to: SceneType, partial?: Partial<GameContext>) => void) {
    this.onTransition = onTransition;
  }

  enter(context: GameContext): void {
    this.context = context;
  }

  render(container: HTMLElement): void {
    container.innerHTML = '';
    const p = this.context.player;

    const content = document.createElement('div');
    content.className = 'content-area';

    const status = document.createElement('div');
    status.className = 'status-bar';
    status.innerHTML = `
      <div>ショップ</div>
      <div>所持金: ${p.gold}G</div>
    `;
    content.appendChild(status);

    const items = ShopSystem.getAvailableItems();
    const list = document.createElement('div');
    list.className = 'shop-list';

    for (const { entry, item } of items) {
      const row = document.createElement('div');
      row.className = 'shop-item';

      const info = document.createElement('span');
      info.textContent = `${item.name} (${item.description}) - ${entry.price}G`;
      row.appendChild(info);

      const btn = document.createElement('button');
      btn.textContent = '買う';
      btn.disabled = p.gold < entry.price;
      btn.addEventListener('click', () => {
        const result = ShopSystem.buyItem(entry.itemId, p);
        if (result.success) {
          SaveSystem.save({
            player: p,
            floorNumber: 1,
            foundStairs: false,
            previousScene: 'shop',
            battleMessage: [],
            timestamp: Date.now(),
          });
          this.render(container);
        } else {
          alert(result.message);
        }
      });
      row.appendChild(btn);

      list.appendChild(row);
    }

    content.appendChild(list);
    container.appendChild(content);

    const actions = document.createElement('div');
    actions.className = 'action-area';

    const btnBack = document.createElement('button');
    btnBack.textContent = '地上に戻る';
    btnBack.addEventListener('click', () => {
      this.onTransition('home');
    });
    actions.appendChild(btnBack);

    container.appendChild(actions);
  }

  exit(): void {}
}
