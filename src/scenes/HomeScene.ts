import { Scene, GameContext, SceneType } from '../types';
import { PlayerSystem } from '../systems/PlayerSystem';
import { SaveSystem } from '../systems/SaveSystem';

export class HomeScene implements Scene {
  type: SceneType = 'home';
  private context!: GameContext;
  private container!: HTMLElement;
  private onTransition: (to: SceneType, partial?: Partial<GameContext>) => void;

  constructor(onTransition: (to: SceneType, partial?: Partial<GameContext>) => void) {
    this.onTransition = onTransition;
  }

  enter(context: GameContext): void {
    this.context = context;
  }

  render(container: HTMLElement): void {
    this.container = container;
    container.innerHTML = '';
    const p = this.context.player;

    const content = document.createElement('div');
    content.className = 'content-area';

    const status = document.createElement('div');
    status.className = 'status-bar';
    status.innerHTML = `
      <div>Lv.${p.level}</div>
      <div>HP: ${p.hp}/${p.maxHp}</div>
      <div>${p.gold}G</div>
    `;
    content.appendChild(status);

    const expBar = document.createElement('div');
    expBar.className = 'exp-bar';
    const expPct = Math.round((p.exp / p.expToNext) * 100);
    expBar.innerHTML = `
      <div class="exp-bar-fill" style="width:${expPct}%"></div>
      <div class="exp-bar-text">EXP: ${p.exp}/${p.expToNext}</div>
    `;
    content.appendChild(expBar);

    const title = document.createElement('h1');
    title.textContent = 'ダンジョンの街';
    content.appendChild(title);

    const equipInfo = document.createElement('div');
    equipInfo.className = 'info';
    const wp = p.equipment.weapon;
    const ar = p.equipment.armor;
    equipInfo.innerHTML = `
      <div>武器: ${wp ? `${wp.name} (攻撃+${wp.effect.attack})` : 'なし'}</div>
      <div>防具: ${ar ? `${ar.name} (防御+${ar.effect.defense})` : 'なし'}</div>
      <div>アイテム: ${p.inventory.length}個</div>
      <div>攻撃力:${PlayerSystem.getTotalAttack(p)} 防御:${PlayerSystem.getTotalDefense(p)} 素早さ:${PlayerSystem.getTotalSpeed(p)} 魔力:${PlayerSystem.getTotalMagic(p)}</div>
    `;
    content.appendChild(equipInfo);

    container.appendChild(content);

    const actions = document.createElement('div');
    actions.className = 'action-area';

    const btnDungeon = document.createElement('button');
    btnDungeon.textContent = 'ダンジョンへ行く';
    btnDungeon.addEventListener('click', () => {
      this.onTransition('dungeon', { floorNumber: 1, foundStairs: false, battleMessage: [] });
    });
    actions.appendChild(btnDungeon);

    const btnShop = document.createElement('button');
    btnShop.textContent = 'ショップへ行く';
    btnShop.addEventListener('click', () => {
      this.onTransition('shop');
    });
    actions.appendChild(btnShop);

    const btnRest = document.createElement('button');
    btnRest.textContent = '休息する (HP全回復)';
    btnRest.addEventListener('click', () => {
      PlayerSystem.fullHeal(p);
      SaveSystem.save(this.toSaveData());
      this.render(this.container);
    });
    actions.appendChild(btnRest);

    if (p.statPoints > 0) {
      const btnStats = document.createElement('button');
      btnStats.textContent = `ステータス割り振り (残り${p.statPoints}P)`;
      btnStats.addEventListener('click', () => {
        this.onTransition('levelup', { previousScene: 'home' });
      });
      actions.appendChild(btnStats);
    }

    const btnNewGame = document.createElement('button');
    btnNewGame.className = 'btn-danger';
    btnNewGame.textContent = 'ニューゲーム (全てリセット)';
    btnNewGame.addEventListener('click', () => {
      const confirmed = confirm('本当に最初からやり直しますか？\n全てのデータが失われます。');
      if (!confirmed) return;
      SaveSystem.clear();
      location.reload();
    });
    actions.appendChild(btnNewGame);

    container.appendChild(actions);
  }

  private toSaveData() {
    return {
      player: this.context.player,
      floorNumber: 1,
      foundStairs: false,
      previousScene: 'home' as SceneType,
      battleMessage: [],
      timestamp: Date.now(),
    };
  }

  exit(): void {}
}
