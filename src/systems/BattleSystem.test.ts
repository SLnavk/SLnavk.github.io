import { describe, it, expect, vi } from 'vitest';
import { BattleSystem } from './BattleSystem';
import { PlayerState, Monster } from '../types';

function createTestMonster(overrides?: Partial<Monster>): Monster {
  return {
    id: 'slime',
    name: 'スライム',
    hp: 10,
    maxHp: 10,
    attack: 3,
    defense: 1,
    gold: 5,
    exp: 3,
    minFloor: 1,
    maxFloor: 3,
    ...overrides,
  };
}

describe('BattleSystem', () => {
  describe('executeAttack', () => {
    it('should deal damage based on attack and defense', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5);
      const defender = { defense: 1, hp: 20 };
      const result = BattleSystem.executeAttack({ attack: 5 }, defender);
      expect(result.damage).toBe(4);
      expect(defender.hp).toBe(16);
      vi.restoreAllMocks();
    });

    it('should deal minimum 1 damage', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5);
      const defender = { defense: 10, hp: 20 };
      const result = BattleSystem.executeAttack({ attack: 2 }, defender);
      expect(result.damage).toBe(1);
      expect(defender.hp).toBe(19);
      vi.restoreAllMocks();
    });

    it('should have critical hits', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.05);
      const defender = { defense: 1, hp: 20 };
      const result = BattleSystem.executeAttack({ attack: 10 }, defender);
      const expectedDmg = Math.floor((10 - 1) * 1.5);
      expect(result.damage).toBe(expectedDmg);
      expect(result.isCritical).toBe(true);
      vi.restoreAllMocks();
    });
  });

  describe('tryFlee', () => {
    it('should flee successfully with high probability', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.1);
      const player: PlayerState = { level: 1, hp: 30, maxHp: 30, baseAttack: 5, baseDefense: 10, baseSpeed: 5, baseMagic: 3, gold: 0, inventory: [], equipment: { weapon: null, armor: null }, floorReached: 1, exp: 0, expToNext: 10, statPoints: 0, allocatedStats: { hp: 0, attack: 0, speed: 0, magic: 0 } };
      const monster = createTestMonster({ attack: 1 });
      const result = BattleSystem.tryFlee(player, monster);
      expect(result).toBe(true);
      vi.restoreAllMocks();
    });

    it('should fail flee with low probability', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.95);
      const player: PlayerState = { level: 1, hp: 30, maxHp: 30, baseAttack: 5, baseDefense: 1, baseSpeed: 5, baseMagic: 3, gold: 0, inventory: [], equipment: { weapon: null, armor: null }, floorReached: 1, exp: 0, expToNext: 10, statPoints: 0, allocatedStats: { hp: 0, attack: 0, speed: 0, magic: 0 } };
      const monster = createTestMonster({ attack: 99 });
      const result = BattleSystem.tryFlee(player, monster);
      expect(result).toBe(false);
      vi.restoreAllMocks();
    });
  });

  describe('isDead', () => {
    it('should return true when HP <= 0', () => {
      expect(BattleSystem.isDead({ hp: 0 })).toBe(true);
      expect(BattleSystem.isDead({ hp: -5 })).toBe(true);
    });

    it('should return false when HP > 0', () => {
      expect(BattleSystem.isDead({ hp: 1 })).toBe(false);
      expect(BattleSystem.isDead({ hp: 10 })).toBe(false);
    });
  });
});
