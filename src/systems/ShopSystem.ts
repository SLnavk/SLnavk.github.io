import { PlayerState, Item } from '../types';
import { SHOP_ITEMS, ShopItemEntry } from '../data/shop';
import { getItemById } from '../data/items';
import { PlayerSystem } from './PlayerSystem';

export interface ShopDisplayItem {
  entry: ShopItemEntry;
  item: Item;
}

export class ShopSystem {
  static getAvailableItems(): ShopDisplayItem[] {
    const result: ShopDisplayItem[] = [];
    for (const entry of SHOP_ITEMS) {
      const item = getItemById(entry.itemId);
      if (item) result.push({ entry, item });
    }
    return result;
  }

  static buyItem(itemId: string, player: PlayerState): { success: boolean; message: string } {
    const entry = SHOP_ITEMS.find(s => s.itemId === itemId);
    if (!entry) return { success: false, message: '商品が見つかりません。' };

    const item = getItemById(itemId);
    if (!item) return { success: false, message: '商品が見つかりません。' };

    if (!PlayerSystem.spendGold(player, entry.price)) {
      return { success: false, message: 'ゴールドが足りません。' };
    }

    if (item.type === 'consumable') {
      PlayerSystem.addItem(player, item as any);
    } else {
      PlayerSystem.equip(player, item as any);
    }

    return { success: true, message: `${item.name} を購入した！` };
  }
}
