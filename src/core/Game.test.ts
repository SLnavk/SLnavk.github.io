import { describe, it, expect, vi } from 'vitest';
import { Game, createInitialPlayer, createInitialContext } from './Game';
import { SceneType, GameContext } from '../types';

describe('Game', () => {
  it('should create initial player with default values', () => {
    const player = createInitialPlayer();
    expect(player.hp).toBe(30);
    expect(player.maxHp).toBe(30);
    expect(player.gold).toBe(300);
    expect(player.baseAttack).toBe(5);
    expect(player.baseDefense).toBe(2);
  });

  it('should create initial context', () => {
    const ctx = createInitialContext();
    expect(ctx.floorNumber).toBe(1);
    expect(ctx.foundStairs).toBe(false);
    expect(ctx.player.hp).toBe(30);
  });

  it('should register and transition scenes', () => {
    const container = document.createElement('div');
    const game = new Game(container);

    const mockScene = {
      type: 'home' as SceneType,
      enter: vi.fn(),
      render: vi.fn(),
      exit: vi.fn(),
    };

    game.registerScene(mockScene);
    game.start('home');

    expect(mockScene.enter).toHaveBeenCalled();
  });

  it('should update context on transition', () => {
    const container = document.createElement('div');
    const game = new Game(container);

    const mockScene = {
      type: 'home' as SceneType,
      enter: vi.fn(),
      render: vi.fn(),
      exit: vi.fn(),
    };

    game.registerScene(mockScene);
    game.start('home');
    game.transition('home', { floorNumber: 5 });

    expect(game.getContext().floorNumber).toBe(5);
  });

  it('should update context partially', () => {
    const container = document.createElement('div');
    const game = new Game(container);
    game.updateContext({ floorNumber: 3, foundStairs: true });
    const ctx = game.getContext();
    expect(ctx.floorNumber).toBe(3);
    expect(ctx.foundStairs).toBe(true);
  });
});
