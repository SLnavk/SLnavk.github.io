import { describe, it, expect } from 'vitest';
import { PlayerSystem } from './PlayerSystem';
import { PlayerState, Consumable, Equippable } from '../types';

function createTestPlayer(overrides?: Partial<PlayerState>): PlayerState {
  return {
    level: 1,
    hp: 30,
    maxHp: 30,
    baseAttack: 5,
    baseDefense: 2,
    baseSpeed: 5,
    baseMagic: 3,
    gold: 100,
    inventory: [],
    equipment: { weapon: null, armor: null },
    floorReached: 1,
    exp: 0,
    expToNext: 10,
    statPoints: 0,
    allocatedStats: { hp: 0, attack: 0, speed: 0, magic: 0 },
    ...overrides,
  };
}

describe('PlayerSystem', () => {
  describe('heal', () => {
    it('should heal within max HP', () => {
      const player = createTestPlayer({ hp: 10 });
      PlayerSystem.heal(player, 15);
      expect(player.hp).toBe(25);
    });

    it('should not exceed max HP', () => {
      const player = createTestPlayer({ hp: 25 });
      PlayerSystem.heal(player, 20);
      expect(player.hp).toBe(30);
    });
  });

  describe('takeDamage', () => {
    it('should reduce HP', () => {
      const player = createTestPlayer({ hp: 20 });
      const dead = PlayerSystem.takeDamage(player, 10);
      expect(player.hp).toBe(10);
      expect(dead).toBe(false);
    });

    it('should return true when HP reaches 0', () => {
      const player = createTestPlayer({ hp: 10 });
      const dead = PlayerSystem.takeDamage(player, 15);
      expect(player.hp).toBe(0);
      expect(dead).toBe(true);
    });
  });

  describe('gold', () => {
    it('should add gold', () => {
      const player = createTestPlayer({ gold: 50 });
      PlayerSystem.addGold(player, 30);
      expect(player.gold).toBe(80);
    });

    it('should spend gold when sufficient', () => {
      const player = createTestPlayer({ gold: 100 });
      const result = PlayerSystem.spendGold(player, 60);
      expect(result).toBe(true);
      expect(player.gold).toBe(40);
    });

    it('should fail to spend gold when insufficient', () => {
      const player = createTestPlayer({ gold: 10 });
      const result = PlayerSystem.spendGold(player, 60);
      expect(result).toBe(false);
      expect(player.gold).toBe(10);
    });
  });

  describe('inventory', () => {
    it('should add consumable item', () => {
      const player = createTestPlayer();
      const potion: Consumable = { id: 'potion_less', name: '小回復薬', type: 'consumable', price: 30, effect: { heal: 20 }, description: 'HP+20' };
      PlayerSystem.addItem(player, potion);
      expect(player.inventory).toHaveLength(1);
      expect(player.inventory[0].id).toBe('potion_less');
    });

    it('should remove consumable item', () => {
      const potion: Consumable = { id: 'potion_less', name: '小回復薬', type: 'consumable', price: 30, effect: { heal: 20 }, description: 'HP+20' };
      const player = createTestPlayer({ inventory: [potion] });
      const removed = PlayerSystem.removeItem(player, 'potion_less');
      expect(removed).not.toBeNull();
      expect(player.inventory).toHaveLength(0);
    });
  });

  describe('equip', () => {
    it('should equip weapon', () => {
      const player = createTestPlayer();
      const sword: Equippable = { id: 'wooden_sword', name: '木の剣', type: 'weapon', price: 100, effect: { attack: 3 }, description: '攻撃+3' };
      PlayerSystem.equip(player, sword);
      expect(player.equipment.weapon?.id).toBe('wooden_sword');
    });

    it('should equip armor', () => {
      const player = createTestPlayer();
      const shield: Equippable = { id: 'leather_shield', name: '皮の盾', type: 'armor', price: 80, effect: { defense: 2 }, description: '防御+2' };
      PlayerSystem.equip(player, shield);
      expect(player.equipment.armor?.id).toBe('leather_shield');
    });
  });

  describe('combat stats', () => {
    it('should calculate total attack with weapon', () => {
      const sword: Equippable = { id: 'wooden_sword', name: '木の剣', type: 'weapon', price: 100, effect: { attack: 3 }, description: '攻撃+3' };
      const player = createTestPlayer({ baseAttack: 5, equipment: { weapon: sword, armor: null } });
      expect(PlayerSystem.getTotalAttack(player)).toBe(8);
    });

    it('should calculate total defense with armor', () => {
      const shield: Equippable = { id: 'leather_shield', name: '皮の盾', type: 'armor', price: 80, effect: { defense: 2 }, description: '防御+2' };
      const player = createTestPlayer({ baseDefense: 2, equipment: { weapon: null, armor: shield } });
      expect(PlayerSystem.getTotalDefense(player)).toBe(4);
    });
  });

  describe('death', () => {
    it('should lose all items and equipment on death', () => {
      const sword: Equippable = { id: 'wooden_sword', name: '木の剣', type: 'weapon', price: 100, effect: { attack: 3 }, description: '攻撃+3' };
      const potion: Consumable = { id: 'potion_less', name: '小回復薬', type: 'consumable', price: 30, effect: { heal: 20 }, description: 'HP+20' };
      const player = createTestPlayer({ inventory: [potion], equipment: { weapon: sword, armor: null } });
      PlayerSystem.loseItemsOnDeath(player);
      expect(player.inventory).toHaveLength(0);
      expect(player.equipment.weapon).toBeNull();
      expect(player.equipment.armor).toBeNull();
    });
  });

  describe('fullHeal', () => {
    it('should restore HP to max', () => {
      const player = createTestPlayer({ hp: 5 });
      PlayerSystem.fullHeal(player);
      expect(player.hp).toBe(30);
    });
  });

  describe('addExp', () => {
    it('should add experience', () => {
      const player = createTestPlayer({ exp: 5, expToNext: 10 });
      const result = PlayerSystem.addExp(player, 3);
      expect(player.exp).toBe(8);
      expect(result.leveledUp).toBe(false);
    });

    it('should level up when exp reaches threshold', () => {
      const player = createTestPlayer({ exp: 8, expToNext: 10, level: 1 });
      const result = PlayerSystem.addExp(player, 5);
      expect(player.exp).toBe(3);
      expect(player.level).toBe(2);
      expect(player.expToNext).toBe(20);
      expect(player.statPoints).toBe(3);
      expect(result.leveledUp).toBe(true);
      expect(result.newLevel).toBe(2);
    });
  });

  describe('allocateStat', () => {
    it('should allocate to HP', () => {
      const player = createTestPlayer({ statPoints: 3, maxHp: 30, hp: 30 });
      const ok = PlayerSystem.allocateStat(player, 'hp');
      expect(ok).toBe(true);
      expect(player.maxHp).toBe(35);
      expect(player.hp).toBe(35);
      expect(player.statPoints).toBe(2);
      expect(player.allocatedStats.hp).toBe(1);
    });

    it('should allocate to attack', () => {
      const player = createTestPlayer({ statPoints: 3, baseAttack: 5 });
      PlayerSystem.allocateStat(player, 'attack');
      expect(player.baseAttack).toBe(6);
      expect(player.allocatedStats.attack).toBe(1);
    });

    it('should allocate to speed', () => {
      const player = createTestPlayer({ statPoints: 3, baseSpeed: 5 });
      PlayerSystem.allocateStat(player, 'speed');
      expect(player.baseSpeed).toBe(6);
    });

    it('should allocate to magic', () => {
      const player = createTestPlayer({ statPoints: 3, baseMagic: 3 });
      PlayerSystem.allocateStat(player, 'magic');
      expect(player.baseMagic).toBe(4);
    });

    it('should fail when no points available', () => {
      const player = createTestPlayer({ statPoints: 0 });
      const ok = PlayerSystem.allocateStat(player, 'hp');
      expect(ok).toBe(false);
    });
  });

  describe('resetStats', () => {
    it('should return all allocated points', () => {
      const player = createTestPlayer({
        statPoints: 0,
        allocatedStats: { hp: 2, attack: 1, speed: 0, magic: 1 },
        maxHp: 40,
        hp: 35,
        baseAttack: 6,
        baseSpeed: 5,
        baseMagic: 4,
      });
      PlayerSystem.resetStats(player);
      expect(player.statPoints).toBe(4);
      expect(player.maxHp).toBe(30);
      expect(player.baseAttack).toBe(5);
      expect(player.baseSpeed).toBe(5);
      expect(player.baseMagic).toBe(3);
      expect(player.allocatedStats).toEqual({ hp: 0, attack: 0, speed: 0, magic: 0 });
    });
  });
});
