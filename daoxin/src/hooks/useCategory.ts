import { useAtom } from 'jotai';
import { CategoryList, SelectedCategoryName } from '../store/category';
import type { Category } from '../types/category';

import { saveEncryptedData, loadEncryptedData } from '../utils/storage';

import { DAOXIN_DEFAULT_CATEGORYS, CATEGORY_STORAGE_KEY } from '../value';

const useCategory = () => {
  const [categories, setCategories] = useAtom(CategoryList);
  const [selectedCategoryName, setSelectedCategoryName] = useAtom(SelectedCategoryName);

  const initCategories = async () => {
    const data = await loadEncryptedData<Category[]>(CATEGORY_STORAGE_KEY);
    const next = data || DAOXIN_DEFAULT_CATEGORYS;
    // 기존 데이터에 exp가 없는 경우를 위한 초기화
    const withExp = next.map(c => ({ ...c, exp: c.exp || 0 }));
    if (!data) await saveEncryptedData(CATEGORY_STORAGE_KEY, withExp);
    setCategories(withExp);
  };

  const addCategory = (newCategory: Category) => {
    const next = [...categories, { ...newCategory, exp: 0 }];
    setCategories(next);
    saveEncryptedData(CATEGORY_STORAGE_KEY, next);
  };

  const addCategoryExp = (categoryId: string, amount: number) => {
    const next = categories.map((c) =>
      c.id === categoryId ? { ...c, exp: c.exp + amount } : c
    );
    setCategories(next);
    saveEncryptedData(CATEGORY_STORAGE_KEY, next);
  };

  const editCategory = (id: string, updatedFields: Partial<Category>) => {
    const next = categories.map((c) =>
      c.id === id ? { ...c, ...updatedFields } : c,
    );
    setCategories(next);
    saveEncryptedData(CATEGORY_STORAGE_KEY, next);
  };

  const deleteCategory = (id: string) => {
    const next = categories.filter((c) => c.id !== id);
    setCategories(next);
    saveEncryptedData(CATEGORY_STORAGE_KEY, next);
    
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
    addCategoryExp,
    editCategory,
    deleteCategory,
    selectCategoryByName,
    // 현재 선택된 카테고리 객체 반환
    selectedCategory: categories.find(c => c.name === selectedCategoryName) || null
  };
};

export default useCategory;