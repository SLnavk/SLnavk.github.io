import { Scene, GameContext, SceneType, Monster, Consumable } from '../types';
import { BattleSystem } from '../systems/BattleSystem';
import { PlayerSystem } from '../systems/PlayerSystem';
import { SaveSystem } from '../systems/SaveSystem';

export class BattleScene implements Scene {
  type: SceneType = 'battle';
  private context!: GameContext;
  private monster!: Monster;
  private logs: string[] = [];
  private onTransition: (to: SceneType, partial?: Partial<GameContext>) => void;
  private showingItemSelect = false;

  constructor(onTransition: (to: SceneType, partial?: Partial<GameContext>) => void) {
    this.onTransition = onTransition;
  }

  enter(context: GameContext): void {
    this.context = context;
    this.monster = context.monster ?? { id: 'unknown', name: '???', hp: 10, maxHp: 10, attack: 3, defense: 1, gold: 5, exp: 3, minFloor: 1, maxFloor: 10 };
    this.logs = context.battleMessage ?? [];
    this.showingItemSelect = false;
  }

  render(container: HTMLElement): void {
    this.currentContainer = container;
    container.innerHTML = '';

    const content = document.createElement('div');
    content.className = 'content-area';

    const monsterBar = document.createElement('div');
    monsterBar.className = 'monster-bar';
    monsterBar.innerHTML = `
      <div>${this.monster.name}</div>
      <div>HP: ${Math.max(0, this.monster.hp)}/${this.monster.maxHp}</div>
    `;
    content.appendChild(monsterBar);

    const status = document.createElement('div');
    status.className = 'status-bar';
    status.innerHTML = `
      <div>HP: ${this.context.player.hp}/${this.context.player.maxHp}</div>
    `;
    content.appendChild(status);

    if (this.showingItemSelect) {
      this.renderBattleItemSelect(content);
    } else {
      const logArea = document.createElement('div');
      logArea.className = 'message-area';
      logArea.innerHTML = this.logs.map(m => `<div>${m}</div>`).join('');
      content.appendChild(logArea);
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
    } else if (!BattleSystem.isDead(this.monster) && !BattleSystem.isDead(this.context.player)) {
      const btnAttack = document.createElement('button');
      btnAttack.textContent = '攻撃';
      btnAttack.addEventListener('click', () => this.onAttack());
      actionRow.appendChild(btnAttack);

      const btnItem = document.createElement('button');
      btnItem.textContent = 'アイテム';
      btnItem.disabled = this.context.player.inventory.length === 0;
      btnItem.addEventListener('click', () => {
        this.showingItemSelect = true;
        this.renderContainer();
      });
      actionRow.appendChild(btnItem);

      const btnFlee = document.createElement('button');
      btnFlee.textContent = '逃走';
      btnFlee.addEventListener('click', () => this.onFlee());
      actionRow.appendChild(btnFlee);
    }

    actions.appendChild(actionRow);
    container.appendChild(actions);
  }

  private renderBattleItemSelect(container: HTMLElement): void {
    const title = document.createElement('h2');
    title.textContent = 'アイテムを選んでください';
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
        label.textContent = item.id === 'stat_reset'
          ? `${item.name} (ステータス振り直し)`
          : `${item.name} (HP+${item.effect.heal})`;
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

  private onAttack(): void {
    const p = this.context.player;
    const atk = PlayerSystem.getTotalAttack(p);
    const result = BattleSystem.executeAttack({ attack: atk }, this.monster);
    this.logs.push(`あなたの攻撃！ ${result.message}`);

    if (BattleSystem.isDead(this.monster)) {
      this.logs.push(`${this.monster.name} を倒した！`);
      PlayerSystem.addGold(p, this.monster.gold);
      this.logs.push(`${this.monster.gold}G を獲得！`);

      const lvResult = PlayerSystem.addExp(p, this.monster.exp);
      this.logs.push(`${this.monster.exp}EXP を獲得！`);

      if (lvResult.leveledUp) {
        this.logs.push(`レベルアップ！ Lv.${lvResult.newLevel - 1} → Lv.${lvResult.newLevel}`);
        SaveSystem.save(this.toSaveData());
        this.onTransition('levelup', { previousScene: 'dungeon', battleMessage: this.logs });
      } else {
        SaveSystem.save(this.toSaveData());
        this.onTransition('dungeon', { battleMessage: this.logs });
      }
      return;
    }

    const enemyAtk = this.monster.attack;
    const def = PlayerSystem.getTotalDefense(p);
    p.hp = Math.max(0, p.hp - Math.max(1, enemyAtk - def));
    this.logs.push(`${this.monster.name} の攻撃！ ${Math.max(1, enemyAtk - def)}のダメージ！`);

    if (BattleSystem.isDead(p)) {
      this.logs.push('あなたは力尽きた...');
      PlayerSystem.loseItemsOnDeath(p);
      this.onTransition('result', {
        result: { isClear: false, floorReached: this.context.floorNumber, goldEarned: 0 },
        battleMessage: this.logs,
      });
      return;
    }

    this.renderContainer();
  }

  private onUseItem(item: Consumable): void {
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
      this.logs.push('忘却の薬を使った！ ステータスが振り直された！');
      this.doEnemyTurn();
      return;
    }

    const removed = PlayerSystem.removeItem(p, item.id);
    if (!removed) {
      this.renderContainer();
      return;
    }

    PlayerSystem.heal(p, item.effect.heal);
    this.logs.push(`${item.name} を使った！ ${item.effect.heal}HP回復！`);
    this.doEnemyTurn();
  }

  private doEnemyTurn(): void {
    const p = this.context.player;
    const def = PlayerSystem.getTotalDefense(p);
    p.hp = Math.max(0, p.hp - Math.max(1, this.monster.attack - def));
    this.logs.push(`${this.monster.name} の攻撃！ ${Math.max(1, this.monster.attack - def)}のダメージ！`);

    if (BattleSystem.isDead(p)) {
      this.logs.push('あなたは力尽きた...');
      PlayerSystem.loseItemsOnDeath(p);
      this.onTransition('result', {
        result: { isClear: false, floorReached: this.context.floorNumber, goldEarned: 0 },
        battleMessage: this.logs,
      });
      return;
    }

    this.renderContainer();
  }

  private onFlee(): void {
    const p = this.context.player;
    const success = BattleSystem.tryFlee(p, this.monster);

    if (success) {
      this.logs.push('逃走に成功した！');
      this.onTransition('dungeon', { battleMessage: this.logs });
    } else {
      this.logs.push('逃走に失敗した！');
      const def = PlayerSystem.getTotalDefense(p);
      p.hp = Math.max(0, p.hp - Math.max(1, this.monster.attack - def));
      this.logs.push(`${this.monster.name} の攻撃！ ${Math.max(1, this.monster.attack - def)}のダメージ！`);

      if (BattleSystem.isDead(p)) {
        this.logs.push('あなたは力尽きた...');
        PlayerSystem.loseItemsOnDeath(p);
        this.onTransition('result', {
          result: { isClear: false, floorReached: this.context.floorNumber, goldEarned: 0 },
          battleMessage: this.logs,
        });
        return;
      }

      this.renderContainer();
    }
  }

  private toSaveData() {
    return {
      player: this.context.player,
      floorNumber: this.context.floorNumber,
      foundStairs: this.context.foundStairs,
      previousScene: 'dungeon' as SceneType,
      battleMessage: this.logs,
      timestamp: Date.now(),
    };
  }

  private currentContainer: HTMLElement | null = null;
  private renderContainer(): void {
    if (this.currentContainer) {
      this.render(this.currentContainer);
    }
  }

  exit(): void {}
}
