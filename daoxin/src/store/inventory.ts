import { atom } from 'jotai';
import { UserInventory } from '../types/inventory';
import { DEFAULT_INVENTORY } from '../value';

/**
 * 사용자 인벤토리 및 공법 상태 아톰
 */
export const inventoryAtom = atom<UserInventory>(DEFAULT_INVENTORY);

/**
 * 보유 영석 (조회용 파생 아톰)
 */
export const spiritStonesAtom = atom((get) => get(inventoryAtom).spiritStones);

/**
 * 현재 장착된 공법 목록 (파생 아톰)
 */
export const equippedTechniquesAtom = atom((get) => {
  const inv = get(inventoryAtom);
  return inv.ownedTechniques.filter(t => inv.equippedTechniqueIds.includes(t.id));
});
