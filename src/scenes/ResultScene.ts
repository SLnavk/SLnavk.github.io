import { Scene, GameContext, SceneType } from '../types';

export class ResultScene implements Scene {
  type: SceneType = 'result';
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
    const result = this.context.result ?? { isClear: false, floorReached: 1, goldEarned: 0 };
    const p = this.context.player;

    const content = document.createElement('div');
    content.className = 'content-area';

    const title = document.createElement('h1');
    title.textContent = result.isClear ? 'ゲームクリア！' : '力尽きました...';
    content.appendChild(title);

    const info = document.createElement('div');
    info.className = 'info';
    info.innerHTML = `
      <div>到達階層: ${result.floorReached}階層</div>
      <div>所持金: ${p.gold}G</div>
    `;
    content.appendChild(info);

    if (!result.isClear) {
      const msg = document.createElement('div');
      msg.className = 'message-area';
      msg.innerHTML = '<div>所持アイテムと装備を失った...</div>';
      content.appendChild(msg);
    }

    container.appendChild(content);

    const actions = document.createElement('div');
    actions.className = 'action-area';

    const btnHome = document.createElement('button');
    btnHome.textContent = 'タイトルに戻る';
    btnHome.addEventListener('click', () => {
      this.onTransition('home', {
        floorNumber: 1,
        foundStairs: false,
        monster: undefined,
        result: undefined,
        battleMessage: [],
      });
    });
    actions.appendChild(btnHome);

    container.appendChild(actions);
  }

  exit(): void {}
}
