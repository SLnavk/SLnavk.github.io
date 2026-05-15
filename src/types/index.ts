export type ItemType = 'weapon' | 'armor' | 'consumable';

export interface ItemEffect {
  heal?: number;
  attack?: number;
  defense?: number;
}

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  price: number;
  effect: ItemEffect;
  description: string;
}

export interface Equippable extends Item {
  type: 'weapon' | 'armor';
  effect: { attack?: number; defense?: number };
}

export interface Consumable extends Item {
  type: 'consumable';
  effect: { heal: number };
}

export interface StatAllocation {
  hp: number;
  attack: number;
  speed: number;
  magic: number;
}

export interface Monster {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  gold: number;
  exp: number;
  minFloor: number;
  maxFloor: number;
}

export interface Equipment {
  weapon: Equippable | null;
  armor: Equippable | null;
}

export interface PlayerState {
  level: number;
  hp: number;
  maxHp: number;
  baseAttack: number;
  baseDefense: number;
  baseSpeed: number;
  baseMagic: number;
  gold: number;
  inventory: Consumable[];
  equipment: Equipment;
  floorReached: number;
  exp: number;
  expToNext: number;
  statPoints: number;
  allocatedStats: StatAllocation;
}

export type SceneType = 'home' | 'shop' | 'dungeon' | 'battle' | 'result' | 'levelup';

export interface GameContext {
  player: PlayerState;
  floorNumber: number;
  foundStairs: boolean;
  monster?: Monster;
  result?: GameResult;
  battleMessage: string[];
  previousScene: SceneType | null;
}

export interface ExplorationResult {
  event: 'monster' | 'stairs' | 'item' | 'nothing';
  monster?: Monster;
  item?: Consumable;
  message: string;
}

export interface AttackResult {
  damage: number;
  isCritical: boolean;
  message: string;
}

export interface GameResult {
  isClear: boolean;
  floorReached: number;
  goldEarned: number;
}

export interface SaveData {
  player: PlayerState;
  floorNumber: number;
  foundStairs: boolean;
  previousScene: SceneType | null;
  battleMessage: string[];
  timestamp: number;
}

export interface Scene {
  type: SceneType;
  enter(context: GameContext): void;
  render(container: HTMLElement): void;
  exit(): void;
}

export interface LevelUpResult {
  leveledUp: boolean;
  newLevel: number;
}
