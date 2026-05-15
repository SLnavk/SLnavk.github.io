import { Monster } from '../types';

export const MONSTERS: Monster[] = [
  { id: 'slime', name: 'スライム', hp: 5, maxHp: 5, attack: 2, defense: 1, gold: 5, exp: 3, minFloor: 1, maxFloor: 3 },
  { id: 'goblin', name: 'ゴブリン', hp: 10, maxHp: 10, attack: 4, defense: 2, gold: 10, exp: 5, minFloor: 2, maxFloor: 5 },
  { id: 'skeleton', name: 'スケルトン', hp: 15, maxHp: 15, attack: 6, defense: 3, gold: 15, exp: 8, minFloor: 4, maxFloor: 7 },
  { id: 'bat', name: 'コウモリ', hp: 8, maxHp: 8, attack: 5, defense: 1, gold: 8, exp: 4, minFloor: 1, maxFloor: 4 },
  { id: 'wolf', name: 'ウルフ', hp: 12, maxHp: 12, attack: 7, defense: 2, gold: 12, exp: 7, minFloor: 3, maxFloor: 6 },
  { id: 'orc', name: 'オーク', hp: 20, maxHp: 20, attack: 8, defense: 4, gold: 20, exp: 10, minFloor: 5, maxFloor: 8 },
  { id: 'wizard', name: 'ウィザード', hp: 18, maxHp: 18, attack: 10, defense: 3, gold: 25, exp: 12, minFloor: 6, maxFloor: 9 },
  { id: 'dragon', name: 'ドラゴン', hp: 30, maxHp: 30, attack: 12, defense: 6, gold: 50, exp: 15, minFloor: 9, maxFloor: 10 },
];

export function getMonsterForFloor(floor: number): Monster {
  const candidates = MONSTERS.filter(m => floor >= m.minFloor && floor <= m.maxFloor);
  const monster = candidates[Math.floor(Math.random() * candidates.length)];
  return { ...monster };
}
