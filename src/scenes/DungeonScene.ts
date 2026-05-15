import { Scene, GameContext, SceneType } from '../types';
import { DungeonSystem } from '../systems/DungeonSystem';
import { PlayerSystem } from '../systems/PlayerSystem';
import { SaveSystem } from '../systems/SaveSystem';

export class DungeonScene implements Scene {
  type: SceneType = 'dungeon';
  private context!: GameContext;
  private logMessages: string[] = [];
  private showingItemSelect = false;
  private onTransition: (to: SceneType, partial?: Partial<GameContext>) => void;

  constructor(onTransition: (to: SceneType, partial?: Partial<GameContext>) => void) {
    this.onTransition = onTransition;
  }

  enter(context: GameContext): void {
    this.context = context;
    this.logMessages = context.battleMessage ?? [];
    this.showingItemSelect = false;
  }

  render(container: HTMLElement): void {
    this.currentContainer = container;
    container.innerHTML = '';
    const p = this.context.player;
    const floor = this.context.floorNumber;
    const foundStairs = this.context.foundStairs;

    const content = document.createElement('div');
    content.className = 'content-area';

    const status = document.createElement('div');
    status.className = 'status-bar';
    status.innerHTML = `
      <div>${floor}階層</div>
      <div>HP: ${p.hp}/${p.maxHp}</div>
    `;
    content.appendChild(status);

    if (foundStairs) {
      const btnNext = document.createElement('button');
      btnNext.className = 'inline-button';
      btnNext.textContent = '次の階層へ';
      btnNext.addEventListener('click', () => this.onNextFloor());
      content.appendChild(btnNext);
    }

    if (DungeonSystem.isPortalFloor(floor)) {
      const btnPortal = document.createElement('button');
      btnPortal.className = 'inline-button';
      btnPortal.textContent = '帰還ポータルを使う (アイテム持ち帰り)';
      btnPortal.addEventListener('click', () => this.onPortal());
      content.appendChild(btnPortal);
    }

    if (this.showingItemSelect) {
      this.renderDungeonItemSelect(content);
    } else {
      const messageArea = document.createElement('div');
      messageArea.className = 'message-area';
      messageArea.innerHTML = this.logMessages.map(m => `<div>${m}</div>`).join('');
      content.appendChild(messageArea);

      const inv = document.createElement('div');
      inv.className = 'info';
      const wp = p.equipment.weapon;
      const ar = p.equipment.armor;
      inv.innerHTML = `
        <div>攻撃: ${PlayerSystem.getTotalAttack(p)} | 防御: ${PlayerSystem.getTotalDefense(p)}</div>
        <div>武器: ${wp ? wp.name : 'なし'} 防具: ${ar ? ar.name : 'なし'}</div>
        <div>アイテム: ${p.inventory.map(i => i.name).join(', ') || 'なし'}</div>
      `;
      content.appendChild(inv);
    }

    container.appendChild(content);

    const actions = document.createElement('div');
    actions.className = 'action-area';

    const actionRow = document.createElement('div');
    actionRow.className = 'battle-actions';

    if (this.showingItemSelect) {
      const btnBack = document.createElement('button');
      btnBack.textContent = '戻る';
      btnBack.addEventListener('click', () => {
        this.showingItemSelect = false;
        this.renderContainer();
      });
      actionRow.appendChild(btnBack);
    } else {
      const btnExplore = document.createElement('button');
      btnExplore.textContent = '探索する';
      btnExplore.addEventListener('click', () => this.onExplore());
      actionRow.appendChild(btnExplore);

      const btnItem = document.createElement('button');
      btnItem.textContent = 'アイテム';
      btnItem.disabled = this.context.player.inventory.length === 0;
      btnItem.addEventListener('click', () => {
        this.showingItemSelect = true;
        this.renderContainer();
      });
      actionRow.appendChild(btnItem);

      const btnEscape = document.createElement('button');
      btnEscape.textContent = '脱出する';
      btnEscape.addEventListener('click', () => this.onEscape());
      actionRow.appendChild(btnEscape);
    }

    actions.appendChild(actionRow);
    container.appendChild(actions);
  }

  private renderDungeonItemSelect(container: HTMLElement): void {
    const title = document.createElement('h2');
    title.textContent = 'アイテムを使う';
    container.appendChild(title);

    const list = document.createElement('div');
    list.className = 'item-select-list';

    const p = this.context.player;
    if (p.inventory.length === 0) {
      const empty = document.createElement('div');
      empty.textContent = 'アイテムを持っていない';
      empty.style.padding = '12px';
      list.appendChild(empty);
    } else {
      for (const item of p.inventory) {
        const row = document.createElement('div');
        row.className = 'item-select-row';

        const label = document.createElement('span');
        if (item.id === 'stat_reset') {
          label.textContent = `${item.name} (ステータス振り直し)`;
        } else {
          label.textContent = `${item.name} (HP+${item.effect.heal})`;
        }
        row.appendChild(label);

        const btn = document.createElement('button');
        btn.textContent = '使う';
        btn.addEventListener('click', () => {
          this.showingItemSelect = false;
          this.onUseItem(item);
        });
        row.appendChild(btn);

        list.appendChild(row);
      }
    }

    container.appendChild(list);
  }

  private onUseItem(item: import('../types').Consumable): void {
    const p = this.context.player;

    if (item.id === 'stat_reset') {
      const confirmed = confirm('ステータスを振り直しますか？');
      if (!confirmed) {
        this.renderContainer();
        return;
      }
      const removed = PlayerSystem.removeItem(p, item.id);
      if (!removed) return;
      PlayerSystem.resetStats(p);
      this.logMessages.push('忘却の薬を使った！ ステータスが振り直された！');
      SaveSystem.save(this.toSaveData());
      this.renderContainer();
      return;
    }

    const removed = PlayerSystem.removeItem(p, item.id);
    if (!removed) {
      this.renderContainer();
      return;
    }

    PlayerSystem.heal(p, item.effect.heal);
    this.logMessages.push(`${item.name} を使った！ ${item.effect.heal}HP回復！`);
    SaveSystem.save(this.toSaveData());
    this.renderContainer();
  }

  private onExplore(): void {
    const p = this.context.player;
    const floor = this.context.floorNumber;

    this.logMessages = [];
    const result = DungeonSystem.explore(floor);

    if (!this.context.foundStairs && DungeonSystem.rollStairs()) {
      this.context.foundStairs = true;
      this.logMessages.push('階段を発見した！');
    }

    if (result.event === 'monster') {
      this.logMessages.push(result.message);
      this.context.monster = result.monster;
      this.render(this.containerRef());
      setTimeout(() => {
        this.onTransition('battle', { monster: result.monster, battleMessage: this.logMessages });
      }, 500);
      return;
    } else if (result.event === 'item' && result.item) {
      PlayerSystem.addItem(p, result.item);
      this.logMessages.push(result.message);
      SaveSystem.save(this.toSaveData());
    } else {
      this.logMessages.push(result.message);
    }

    this.render(this.containerRef());
  }

  private onNextFloor(): void {
    const nextFloor = this.context.floorNumber + 1;
    this.context.foundStairs = false;
    this.logMessages = [`${nextFloor}階層に降りた。`];

    if (nextFloor === 10) {
      this.context.foundStairs = true;
      this.logMessages.push('帰還ポータルを発見した！');
    }

    SaveSystem.save(this.toSaveData());

    this.onTransition('dungeon', {
      floorNumber: nextFloor,
      foundStairs: this.context.foundStairs,
      battleMessage: this.logMessages,
    });
  }

  private onPortal(): void {
    this.logMessages = ['無事に地上に帰還した！'];
    SaveSystem.save(this.toSaveData());
    this.onTransition('home', {
      battleMessage: this.logMessages,
    });
  }

  private onEscape(): void {
    const confirmed = confirm(
      '本当に脱出しますか？\n\n' +
      '・所持アイテムをすべて失う\n' +
      '・装備品をすべて失う\n' +
      '・所持金をすべて失う\n\n' +
      'それでも脱出しますか？'
    );
    if (!confirmed) return;

    const p = this.context.player;
    PlayerSystem.loseItemsOnDeath(p);
    p.gold = 0;

    this.logMessages = ['アイテムと所持金を失い、地上に逃げ帰った...'];
    this.onTransition('home', { battleMessage: this.logMessages });
  }

  private currentContainer: HTMLElement | null = null;
  private containerRef(): HTMLElement {
    return this.currentContainer!;
  }
  private renderContainer(): void {
    if (this.currentContainer) {
      this.render(this.currentContainer);
    }
  }

  private toSaveData() {
    return {
      player: this.context.player,
      floorNumber: this.context.floorNumber,
      foundStairs: this.context.foundStairs,
      previousScene: 'dungeon' as SceneType,
      battleMessage: this.logMessages,
      timestamp: Date.now(),
    };
  }

  exit(): void {}
}
