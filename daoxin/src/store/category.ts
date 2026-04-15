import { atom } from 'jotai';
import type { Category } from '../types/category';

/**
 * 독립적인 카테고리 데이터 목록입니다.
 * 수행(Task)과는 ID나 이름을 통해 느슨하게 연결됩니다.
 */
export const CategoryList = atom<Category[]>([]);

export const SelectedCategoryName = atom<string | null>(null);