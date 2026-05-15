export interface ShopItemEntry {
  itemId: string;
  price: number;
}

export const SHOP_ITEMS: ShopItemEntry[] = [
  { itemId: 'potion_less', price: 30 },
  { itemId: 'potion_mid', price: 80 },
  { itemId: 'wooden_sword', price: 100 },
  { itemId: 'leather_shield', price: 80 },
  { itemId: 'stat_reset', price: 500 },
];
