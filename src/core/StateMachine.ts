import { Scene, SceneType, GameContext } from '../types';

export class StateMachine {
  private states: Map<SceneType, Scene> = new Map();
  private currentState: SceneType | null = null;
  private container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  register(scene: Scene): void {
    this.states.set(scene.type, scene);
  }

  transition(to: SceneType, context: GameContext): void {
    if (this.currentState) {
      this.states.get(this.currentState)?.exit();
    }
    this.currentState = to;
    const scene = this.states.get(to);
    if (scene) {
      scene.enter(context);
      this.container.innerHTML = '';
      scene.render(this.container);
    }
  }

  getCurrent(): SceneType | null {
    return this.currentState;
  }
}
