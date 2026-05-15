import { ExplorationResult, Consumable } from '../types';
import { getMonsterForFloor } from '../data/monsters';
import { CONSUMABLES } from '../data/items';

const MONSTER_CHANCE = 0.4;
const ITEM_CHANCE = 0.15;
const NOTHING_CHANCE = 0.45;

export class DungeonSystem {
  static explore(floor: number): ExplorationResult {
    const roll = Math.random();

    if (roll < MONSTER_CHANCE) {
      const monster = getMonsterForFloor(floor);
      return {
        event: 'monster',
        monster,
        message: `${monster.name} が現れた！`,
      };
    }

    if (roll < MONSTER_CHANCE + ITEM_CHANCE) {
      const item = DungeonSystem.pickRandomItem();
      return {
        event: 'item',
        item,
        message: `${item.name} を拾った！`,
      };
    }

    return {
      event: 'nothing',
      message: '何も見つからなかった。',
    };
  }

  static rollStairs(): boolean {
    return Math.random() < 0.15;
  }

  static isPortalFloor(floor: number): boolean {
    return floor === 10;
  }

  private static pickRandomItem(): Consumable {
    const items = CONSUMABLES.filter(c => c.price <= 80 && c.id !== 'stat_reset');
    return { ...items[Math.floor(Math.random() * items.length)] };
  }
}
