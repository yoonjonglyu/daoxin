import { useAtom, useAtomValue } from 'jotai';
import { inventoryAtom, spiritStonesAtom, equippedTechniquesAtom } from '../store/inventory';
import { UserInventory, ShopItem } from '../types/inventory';
import { saveEncryptedData, loadEncryptedData } from '../utils/storage';
import { INVENTORY_STORAGE_KEY, DEFAULT_INVENTORY, DAOXIN_SHOP_ITEMS } from '../value';
import { findTechniquePreset } from '../services/techniqueService';
import { useTranslation } from '../utils/i18n';

export const useInventory = () => {
  const [inventory, setInventory] = useAtom(inventoryAtom);
  const spiritStones = useAtomValue(spiritStonesAtom);
  const equippedTechniques = useAtomValue(equippedTechniquesAtom);
  const { t } = useTranslation();

  const saveInventory = async (next: UserInventory) => {
    setInventory(next);
    await saveEncryptedData(INVENTORY_STORAGE_KEY, next);
  };

  /**
   * 앱 구동 시 저장된 인벤토리 데이터 로드
   */
  const initInventory = async () => {
    const data = await loadEncryptedData<UserInventory>(INVENTORY_STORAGE_KEY);
    if (data) {
      // 기존 저장 데이터와 신규 구조 병합 (하위 호환성 유지)
      const merged: UserInventory = {
        ...DEFAULT_INVENTORY,
        ...data,
        consumables: {
          ...DEFAULT_INVENTORY.consumables,
          ...(data.consumables || {}),
        },
      };
      setInventory(merged);
    } else {
      await saveEncryptedData(INVENTORY_STORAGE_KEY, DEFAULT_INVENTORY);
      setInventory(DEFAULT_INVENTORY);
    }
  };

  /**
   * 영석 추가 획득
   */
  const addSpiritStones = async (amount: number) => {
    if (amount <= 0) return;
    const next: UserInventory = {
      ...inventory,
      spiritStones: inventory.spiritStones + amount,
    };
    await saveInventory(next);
  };

  /**
   * 영석 소비
   */
  const spendSpiritStones = async (amount: number): Promise<boolean> => {
    if (inventory.spiritStones < amount) return false;
    const next: UserInventory = {
      ...inventory,
      spiritStones: inventory.spiritStones - amount,
    };
    await saveInventory(next);
    return true;
  };

  /**
   * 공법 장착
   */
  const equipTechnique = async (techId: string): Promise<boolean> => {
    if (inventory.equippedTechniqueIds.includes(techId)) return true;
    if (inventory.equippedTechniqueIds.length >= inventory.maxEquipSlots) {
      return false; // 슬롯 부족
    }
    const next: UserInventory = {
      ...inventory,
      equippedTechniqueIds: [...inventory.equippedTechniqueIds, techId],
    };
    await saveInventory(next);
    return true;
  };

  /**
   * 공법 장착 해제
   */
  const unequipTechnique = async (techId: string) => {
    const next: UserInventory = {
      ...inventory,
      equippedTechniqueIds: inventory.equippedTechniqueIds.filter(id => id !== techId),
    };
    await saveInventory(next);
  };

  /**
   * 공법의 특화 대상 카테고리 지정
   */
  const setTechniqueTargetCategory = async (techId: string, categoryId: string) => {
    const updated = inventory.ownedTechniques.map(t =>
      t.id === techId ? { ...t, targetCategory: categoryId } : t
    );
    const next: UserInventory = {
      ...inventory,
      ownedTechniques: updated,
    };
    await saveInventory(next);
  };

  /**
   * 상점 아이템 구매
   */
  const buyShopItem = async (item: ShopItem): Promise<{ success: boolean; message: string }> => {
    if (inventory.spiritStones < item.price) {
      return { success: false, message: t('notEnoughStones') };
    }

    // 1. 공법 비급 구매 처리
    if (item.category === 'technique' && item.techniqueId) {
      const alreadyOwned = inventory.ownedTechniques.some(t => t.id === item.techniqueId);
      if (alreadyOwned) {
        return { success: false, message: t('alreadyOwnedTechnique') };
      }
      const techPreset = findTechniquePreset(item.techniqueId);
      if (!techPreset) {
        return { success: false, message: 'Invalid Technique' };
      }

      const next: UserInventory = {
        ...inventory,
        spiritStones: inventory.spiritStones - item.price,
        ownedTechniques: [...inventory.ownedTechniques, techPreset],
      };
      await saveInventory(next);
      const itemName = item.nameKey ? t(item.nameKey as any) : item.name;
      return { success: true, message: t('purchaseSuccess', { name: itemName }) };
    }

    // 2. 단약/소모품 구매 처리
    if (item.category === 'elixir') {
      const itemName = item.nameKey ? t(item.nameKey as any) : item.name;

      if (item.id === 'shop-elixir-shield') {
        const next: UserInventory = {
          ...inventory,
          spiritStones: inventory.spiritStones - item.price,
          consumables: {
            ...inventory.consumables,
            streakShields: (inventory.consumables.streakShields || 0) + 1,
          },
        };
        await saveInventory(next);
        return { success: true, message: t('purchaseSuccess', { name: itemName }) };
      }

      if (item.id === 'shop-elixir-boost') {
        const boostDurationHours = item.effectValue || 24;
        const now = new Date();
        now.setHours(now.getHours() + boostDurationHours);

        const next: UserInventory = {
          ...inventory,
          spiritStones: inventory.spiritStones - item.price,
          consumables: {
            ...inventory.consumables,
            expBoostUntil: now.toISOString(),
          },
        };
        await saveInventory(next);
        return { success: true, message: t('purchaseSuccess', { name: itemName }) };
      }
    }

    return { success: false, message: t('notEnoughStones') };
  };

  /**
   * 청심환(24시간 공력 부스트) 즉시 활성화
   */
  const activateExpBoost = async (hours = 24) => {
    const now = new Date();
    now.setHours(now.getHours() + hours);

    const next: UserInventory = {
      ...inventory,
      consumables: {
        ...inventory.consumables,
        expBoostUntil: now.toISOString(),
      },
    };
    await saveInventory(next);
  };

  /**
   * 보심단(스트릭 보호 알약) 사용
   */
  const useStreakShield = async (): Promise<boolean> => {
    if ((inventory.consumables.streakShields || 0) <= 0) return false;
    const next: UserInventory = {
      ...inventory,
      consumables: {
        ...inventory.consumables,
        streakShields: inventory.consumables.streakShields - 1,
      },
    };
    await saveInventory(next);
    return true;
  };

  return {
    inventory,
    spiritStones,
    equippedTechniques,
    shopItems: DAOXIN_SHOP_ITEMS,
    initInventory,
    addSpiritStones,
    spendSpiritStones,
    equipTechnique,
    unequipTechnique,
    setTechniqueTargetCategory,
    buyShopItem,
    activateExpBoost,
    useStreakShield,
    updateInventory: saveInventory,
  };
};

export default useInventory;
