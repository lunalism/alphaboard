import { CATEGORY_COLORS } from '@/constants';

export function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] || "bg-gray-100 text-gray-600";
}
