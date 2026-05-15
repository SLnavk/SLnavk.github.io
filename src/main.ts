import './style.css';
import { Game, createInitialPlayer, createInitialContext } from './core/Game';
import { HomeScene } from './scenes/HomeScene';
import { ShopScene } from './scenes/ShopScene';
import { DungeonScene } from './scenes/DungeonScene';
import { BattleScene } from './scenes/BattleScene';
import { ResultScene } from './scenes/ResultScene';
import { LevelUpScene } from './scenes/LevelUpScene';
import { SceneType, GameContext } from './types';
import { SaveSystem } from './systems/SaveSystem';

function init() {
  const container = document.getElementById('app')!;
  const game = new Game(container);

  const transition = (to: SceneType, partial?: Partial<GameContext>) => {
    game.transition(to, partial);
  };

  const homeScene = new HomeScene(transition);
  const shopScene = new ShopScene(transition);
  const dungeonScene = new DungeonScene(transition);
  const battleScene = new BattleScene(transition);
  const resultScene = new ResultScene(transition);
  const levelUpScene = new LevelUpScene(transition);

  game.registerScene(homeScene);
  game.registerScene(shopScene);
  game.registerScene(dungeonScene);
  game.registerScene(battleScene);
  game.registerScene(resultScene);
  game.registerScene(levelUpScene);

  const saved = SaveSystem.load();
  if (saved) {
    const context: GameContext = {
      player: saved.player,
      floorNumber: saved.floorNumber,
      foundStairs: saved.foundStairs,
      battleMessage: saved.battleMessage ?? [],
      previousScene: saved.previousScene ?? null,
    };
    game.updateContext(context);
    const startScene = saved.previousScene ?? 'home';
    game.start(startScene as SceneType);
  } else {
    game.start('home');
  }
}

document.addEventListener('DOMContentLoaded', init);
