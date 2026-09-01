import type { GeneratedWeekPlan, ShoppingItem } from "@/types";

const categoryOrder = ["蛋白质", "蔬菜", "主食", "水果 / 饮品", "其他"];

function categoryForIngredient(ingredient: string): string {
  if (["鸡肉", "鸡胸肉", "牛肉", "鱼", "虾仁", "鸡蛋", "茶叶蛋", "豆腐", "无糖酸奶", "牛奶", "无糖牛奶", "无糖豆浆", "奶酪"].some((item) => ingredient.includes(item))) return "蛋白质";
  if (["蔬菜", "青菜", "生菜", "冷冻蔬菜", "冷冻混合蔬菜", "西兰花", "番茄", "蘑菇"].some((item) => ingredient.includes(item))) return "蔬菜";
  if (["米饭", "即食米饭", "燕麦", "燕麦片", "面条", "米粉", "全麦面包", "全麦三明治", "玉米"].some((item) => ingredient.includes(item))) return "主食";
  if (["苹果", "香蕉", "坚果"].some((item) => ingredient.includes(item))) return "水果 / 饮品";
  return "其他";
}

export function deriveShoppingList(plan: GeneratedWeekPlan): ShoppingItem[] {
  const counts = new Map<string, number>();
  for (const day of plan.days) {
    for (const meal of day.meals) {
      for (const ingredient of meal.shoppingItems) {
        const name = ingredient.trim();
        if (name) counts.set(name, (counts.get(name) ?? 0) + 1);
      }
    }
  }

  return [...counts.entries()]
    .sort(([leftName], [rightName]) => {
      const categoryDifference = categoryOrder.indexOf(categoryForIngredient(leftName)) - categoryOrder.indexOf(categoryForIngredient(rightName));
      return categoryDifference || leftName.localeCompare(rightName);
    })
    .map(([name, count], index) => ({
      id: `ingredient-${index + 1}-${name}`,
      category: categoryForIngredient(name),
      name,
      amount: `${count} 份餐食用量`,
      purchased: false,
    }));
}

export function mergeShoppingListPreservingPurchased(
  previousItems: ShoppingItem[],
  nextItems: ShoppingItem[],
): ShoppingItem[] {
  const purchasedNames = new Set(
    previousItems.filter((item) => item.purchased).map((item) => item.name.trim()),
  );

  return nextItems.map((item) => ({
    ...item,
    purchased: purchasedNames.has(item.name.trim()),
  }));
}
