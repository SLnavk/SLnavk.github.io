import { AttackResult, PlayerState, Monster } from '../types';
import { PlayerSystem } from './PlayerSystem';

export class BattleSystem {
  static executeAttack(attacker: { attack: number }, defender: { defense: number, hp: number }): AttackResult {
    const isCritical = Math.random() < 0.1;
    let damage = Math.max(1, attacker.attack - defender.defense);
    if (isCritical) {
      damage = Math.floor(damage * 1.5);
    }
    defender.hp -= damage;
    return {
      damage,
      isCritical,
      message: isCritical ? `会心の一撃！ ${damage}のダメージ！` : `${damage}のダメージ！`,
    };
  }

  static tryFlee(player: PlayerState, monster: Monster): boolean {
    const escapeChance = 0.5 + (PlayerSystem.getTotalDefense(player) - monster.attack) * 0.02;
    return Math.random() < Math.max(0.2, Math.min(0.9, escapeChance));
  }

  static isDead(target: { hp: number }): boolean {
    return target.hp <= 0;
  }
}
