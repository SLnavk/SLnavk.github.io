import { Scene, GameContext, SceneType, StatAllocation } from '../types';
import { PlayerSystem } from '../systems/PlayerSystem';
import { SaveSystem } from '../systems/SaveSystem';

const STAT_LABELS: Record<keyof StatAllocation, string> = {
  hp: '体力',
  attack: '攻撃力',
  speed: '素早さ',
  magic: '魔力',
};

const STAT_DESC: Record<keyof StatAllocation, string> = {
  hp: '最大HP+5',
  attack: '攻撃力+1',
  speed: '素早さ+1',
  magic: '魔力+1',
};

export class LevelUpScene implements Scene {
  type: SceneType = 'levelup';
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

    const title = document.createElement('h1');
    title.textContent = 'レベルアップ！';
    content.appendChild(title);

    const levelInfo = document.createElement('div');
    levelInfo.className = 'status-bar';
    levelInfo.innerHTML = `<div>Lv.${p.level}</div><div>残りP: ${p.statPoints}</div>`;
    content.appendChild(levelInfo);

    const currentInfo = document.createElement('div');
    currentInfo.className = 'info';
    currentInfo.innerHTML = `
      <div>HP: ${p.hp}/${p.maxHp}</div>
      <div>攻撃力: ${p.baseAttack} | 素早さ: ${p.baseSpeed}</div>
      <div>魔力: ${p.baseMagic} | 防御: ${PlayerSystem.getTotalDefense(p)}</div>
    `;
    content.appendChild(currentInfo);

    const stats = document.createElement('div');
    stats.className = 'levelup-stats';

    const allocStats: Array<keyof StatAllocation> = ['hp', 'attack', 'speed', 'magic'];

    for (const stat of allocStats) {
      const row = document.createElement('div');
      row.className = 'levelup-row';

      const info = document.createElement('span');
      info.textContent = `${STAT_LABELS[stat]} (${STAT_DESC[stat]})  現在: ${p.allocatedStats[stat]}`;
      row.appendChild(info);

      const btn = document.createElement('button');
      btn.textContent = '＋';
      btn.className = 'btn-plus';
      btn.disabled = p.statPoints <= 0;
      btn.addEventListener('click', () => {
        PlayerSystem.allocateStat(p, stat);
        this.render(container);
      });
      row.appendChild(btn);

      stats.appendChild(row);
    }

    content.appendChild(stats);
    container.appendChild(content);

    const actions = document.createElement('div');
    actions.className = 'action-area';

    const btnDone = document.createElement('button');
    btnDone.textContent = '決定';
    btnDone.addEventListener('click', () => {
      SaveSystem.save(this.toSaveData());
      const prev = this.context.previousScene ?? 'home';
      this.onTransition(prev, {
        battleMessage: [],
      });
    });
    actions.appendChild(btnDone);

    container.appendChild(actions);
  }

  private toSaveData() {
    return {
      player: this.context.player,
      floorNumber: this.context.floorNumber,
      foundStairs: this.context.foundStairs,
      previousScene: this.context.previousScene,
      battleMessage: [],
      timestamp: Date.now(),
    };
  }

  exit(): void {}
}
