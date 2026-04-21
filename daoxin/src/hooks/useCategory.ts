import { useAtom } from 'jotai';
import { CategoryList, SelectedCategoryName } from '../store/category';
import type { Category } from '../types/category';
import {
  decryptData,
  encryptData,
  setLocalStorage,
  getLocalStorage,
} from 'isa-util';
import { SALT,DAOXIN_DEFAULT_CATEGORYS } from '../value';

const CATEGORY_STORAGE_KEY = 'DAOXIN_CATEGORY_LIST';


const useCategory = () => {
  const [categories, setCategories] = useAtom(CategoryList);
  const [selectedCategoryName, setSelectedCategoryName] = useAtom(SelectedCategoryName);

  const _saveData = async (list: Category[]) => {
    try {
      const encryptedValue = await encryptData(
        JSON.stringify(list),
        SALT,
        SALT,
      );
      setLocalStorage(CATEGORY_STORAGE_KEY, encryptedValue);
    } catch (error) {
      console.error('카테고리 저장 중 오류 발생:', error);
    }
  };

  const initCategories = async () => {
    const storedData = getLocalStorage<any>(CATEGORY_STORAGE_KEY);
    if (!storedData) {
      await _saveData(DAOXIN_DEFAULT_CATEGORYS);
      setCategories(DAOXIN_DEFAULT_CATEGORYS);
      return;
    }

    try {
      const decrypted = await decryptData(
        storedData.encryptedData,
        storedData.iv,
        SALT,
        SALT,
      );
      const parsed = JSON.parse(decrypted);
      setCategories(parsed);
    } catch (error) {
      setCategories(DAOXIN_DEFAULT_CATEGORYS);
      console.error('카테고리 로드 중 오류 발생:', error);
    }
  };

  const addCategory = (newCategory: Category) => {
    const next = [...categories, newCategory];
    setCategories(next);
    _saveData(next);
  };

  const editCategory = (id: string, updatedFields: Partial<Category>) => {
    const next = categories.map((c) =>
      c.id === id ? { ...c, ...updatedFields } : c,
    );
    setCategories(next);
    _saveData(next);
  };

  const deleteCategory = (id: string) => {
    const next = categories.filter((c) => c.id !== id);
    setCategories(next);
    _saveData(next);
    
    // 선택된 카테고리가 삭제된 경우 선택 해제
    const target = categories.find(c => c.id === id);
    if (target && selectedCategoryName === target.name) {
      setSelectedCategoryName(null);
    }
  };

  const selectCategoryByName = (name: string | null) => {
    setSelectedCategoryName(name);
  };

  return {
    categories,
    selectedCategoryName,
    initCategories,
    addCategory,
    editCategory,
    deleteCategory,
    selectCategoryByName,
    // 현재 선택된 카테고리 객체 반환
    selectedCategory: categories.find(c => c.name === selectedCategoryName) || null
  };
};

export default useCategory;