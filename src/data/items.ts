import { Equippable, Consumable } from '../types';

export const WEAPONS: Equippable[] = [
  { id: 'wooden_sword', name: '木の剣', type: 'weapon', price: 100, effect: { attack: 3 }, description: '攻撃+3' },
  { id: 'iron_sword', name: '鉄の剣', type: 'weapon', price: 300, effect: { attack: 6 }, description: '攻撃+6' },
  { id: 'steel_sword', name: '鋼の剣', type: 'weapon', price: 600, effect: { attack: 10 }, description: '攻撃+10' },
];

export const ARMORS: Equippable[] = [
  { id: 'leather_shield', name: '皮の盾', type: 'armor', price: 80, effect: { defense: 2 }, description: '防御+2' },
  { id: 'iron_armor', name: '鉄の鎧', type: 'armor', price: 250, effect: { defense: 5 }, description: '防御+5' },
  { id: 'steel_armor', name: '鋼の鎧', type: 'armor', price: 500, effect: { defense: 9 }, description: '防御+9' },
];

export const CONSUMABLES: Consumable[] = [
  { id: 'potion_less', name: '小回復薬', type: 'consumable', price: 30, effect: { heal: 20 }, description: 'HP+20' },
  { id: 'potion_mid', name: '中回復薬', type: 'consumable', price: 80, effect: { heal: 50 }, description: 'HP+50' },
  { id: 'potion_full', name: '全回復薬', type: 'consumable', price: 200, effect: { heal: 9999 }, description: 'HP全回復' },
  { id: 'stat_reset', name: '忘却の薬', type: 'consumable', price: 500, effect: { heal: 0 }, description: 'ステータスを振り直す' },
];

export const ALL_ITEMS = [...WEAPONS, ...ARMORS, ...CONSUMABLES];

export function getItemById(id: string) {
  return ALL_ITEMS.find(item => item.id === id);
}
