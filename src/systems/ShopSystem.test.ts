import { describe, it, expect, vi } from 'vitest';
import { ShopSystem } from './ShopSystem';
import { PlayerState } from '../types';

function createTestPlayer(overrides?: Partial<PlayerState>): PlayerState {
  return {
    level: 1,
    hp: 30,
    maxHp: 30,
    baseAttack: 5,
    baseDefense: 2,
    baseSpeed: 5,
    baseMagic: 3,
    gold: 200,
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

describe('ShopSystem', () => {
  describe('getAvailableItems', () => {
    it('should return shop items with data', () => {
      const items = ShopSystem.getAvailableItems();
      expect(items.length).toBeGreaterThan(0);
      items.forEach(d => {
        expect(d.entry.itemId).toBeDefined();
        expect(d.item.name).toBeDefined();
      });
    });
  });

  describe('buyItem', () => {
    it('should successfully buy a consumable item', () => {
      const player = createTestPlayer({ gold: 200 });
      const result = ShopSystem.buyItem('potion_less', player);
      expect(result.success).toBe(true);
      expect(player.gold).toBe(170);
      expect(player.inventory).toHaveLength(1);
      expect(player.inventory[0].id).toBe('potion_less');
    });

    it('should fail when insufficient gold', () => {
      const player = createTestPlayer({ gold: 10 });
      const result = ShopSystem.buyItem('potion_less', player);
      expect(result.success).toBe(false);
      expect(player.gold).toBe(10);
    });

    it('should fail for unknown item', () => {
      const player = createTestPlayer({ gold: 200 });
      const result = ShopSystem.buyItem('nonexistent', player);
      expect(result.success).toBe(false);
    });

    it('should buy and equip weapon', () => {
      const player = createTestPlayer({ gold: 200 });
      const result = ShopSystem.buyItem('wooden_sword', player);
      expect(result.success).toBe(true);
      expect(player.gold).toBe(100);
      expect(player.equipment.weapon?.id).toBe('wooden_sword');
    });
  });
});
