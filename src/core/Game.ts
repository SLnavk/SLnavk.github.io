import { StateMachine } from './StateMachine';
import { EventBus } from './EventBus';
import { PlayerState, GameContext, SceneType } from '../types';

export function createInitialPlayer(): PlayerState {
  return {
    level: 1,
    hp: 30,
    maxHp: 30,
    baseAttack: 5,
    baseDefense: 2,
    baseSpeed: 5,
    baseMagic: 3,
    gold: 300,
    inventory: [],
    equipment: { weapon: null, armor: null },
    floorReached: 1,
    exp: 0,
    expToNext: 10,
    statPoints: 0,
    allocatedStats: { hp: 0, attack: 0, speed: 0, magic: 0 },
  };
}

export function createInitialContext(player?: PlayerState): GameContext {
  return {
    player: player ?? createInitialPlayer(),
    floorNumber: 1,
    foundStairs: false,
    battleMessage: [],
    previousScene: null,
  };
}

export class Game {
  private stateMachine: StateMachine;
  private context: GameContext;
  eventBus: EventBus;

  constructor(container: HTMLElement) {
    this.stateMachine = new StateMachine(container);
    this.eventBus = new EventBus();
    this.context = createInitialContext();
  }

  registerScene(scene: { type: SceneType; enter: (ctx: GameContext) => void; render: (c: HTMLElement) => void; exit: () => void }): void {
    this.stateMachine.register(scene);
  }

  start(startScene: SceneType = 'home'): void {
    this.stateMachine.transition(startScene, this.context);
  }

  transition(to: SceneType, partial?: Partial<GameContext>): void {
    if (partial) {
      this.context = { ...this.context, ...partial };
    }
    this.stateMachine.transition(to, this.context);
  }

  getContext(): GameContext {
    return this.context;
  }

  updateContext(partial: Partial<GameContext>): void {
    this.context = { ...this.context, ...partial };
  }
}
