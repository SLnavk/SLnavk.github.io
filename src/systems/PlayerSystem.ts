import { PlayerState, Consumable, Equippable, LevelUpResult, StatAllocation } from '../types';

const STATS_PER_LEVEL = 3;

export class PlayerSystem {
  static heal(player: PlayerState, amount: number): void {
    player.hp = Math.min(player.maxHp, player.hp + amount);
  }

  static takeDamage(player: PlayerState, amount: number): boolean {
    player.hp -= amount;
    if (player.hp <= 0) {
      player.hp = 0;
      return true;
    }
    return false;
  }

  static addGold(player: PlayerState, amount: number): void {
    player.gold += amount;
  }

  static spendGold(player: PlayerState, amount: number): boolean {
    if (player.gold < amount) return false;
    player.gold -= amount;
    return true;
  }

  static addItem(player: PlayerState, item: Consumable): void {
    const existing = player.inventory.find(i => i.id === item.id);
    if (existing) return;
    player.inventory.push({ ...item });
  }

  static removeItem(player: PlayerState, itemId: string): Consumable | null {
    const idx = player.inventory.findIndex(i => i.id === itemId);
    if (idx === -1) return null;
    const [removed] = player.inventory.splice(idx, 1);
    return removed;
  }

  static equip(player: PlayerState, item: Equippable): void {
    if (item.type === 'weapon') {
      player.equipment.weapon = item;
    } else if (item.type === 'armor') {
      player.equipment.armor = item;
    }
  }

  static getTotalAttack(player: PlayerState): number {
    const weaponBonus = player.equipment.weapon?.effect.attack ?? 0;
    return player.baseAttack + weaponBonus;
  }

  static getTotalDefense(player: PlayerState): number {
    const armorBonus = player.equipment.armor?.effect.defense ?? 0;
    return player.baseDefense + armorBonus;
  }

  static getTotalSpeed(player: PlayerState): number {
    return player.baseSpeed;
  }

  static getTotalMagic(player: PlayerState): number {
    return player.baseMagic;
  }

  static loseItemsOnDeath(player: PlayerState): void {
    player.inventory = [];
    player.equipment = { weapon: null, armor: null };
  }

  static fullHeal(player: PlayerState): void {
    player.hp = player.maxHp;
  }

  static addExp(player: PlayerState, amount: number): LevelUpResult {
    player.exp += amount;
    if (player.exp >= player.expToNext) {
      player.exp -= player.expToNext;
      player.level += 1;
      player.expToNext = player.level * 10;
      player.statPoints += STATS_PER_LEVEL;
      return { leveledUp: true, newLevel: player.level };
    }
    return { leveledUp: false, newLevel: player.level };
  }

  static allocateStat(player: PlayerState, stat: keyof StatAllocation): boolean {
    if (player.statPoints <= 0) return false;

    player.statPoints -= 1;
    player.allocatedStats[stat] += 1;

    switch (stat) {
      case 'hp':
        player.maxHp += 5;
        player.hp += 5;
        break;
      case 'attack':
        player.baseAttack += 1;
        break;
      case 'speed':
        player.baseSpeed += 1;
        break;
      case 'magic':
        player.baseMagic += 1;
        break;
    }
    return true;
  }

  static resetStats(player: PlayerState): void {
    const points = Object.values(player.allocatedStats).reduce((a, b) => a + b, 0);
    player.statPoints += points;
    player.maxHp -= player.allocatedStats.hp * 5;
    player.hp = Math.min(player.hp, player.maxHp);
    player.baseAttack -= player.allocatedStats.attack;
    player.baseSpeed -= player.allocatedStats.speed;
    player.baseMagic -= player.allocatedStats.magic;
    player.allocatedStats = { hp: 0, attack: 0, speed: 0, magic: 0 };
  }
}
