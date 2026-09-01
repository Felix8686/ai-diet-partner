import type { DayPlan, MealKind, MealPlanItem, ShoppingItem } from "@/types";

function meal(
  id: string,
  kind: MealKind,
  title: string,
  scene: string,
  prepMinutes: number,
  alternative: string,
  note?: string,
  timeHint?: string,
): MealPlanItem {
  return { id, kind, title, scene, prepMinutes, alternatives: [alternative], note, timeHint };
}

export const weekPlan: DayPlan[] = [
  {
    day: "周一",
    meals: [
      meal("mon-b", "breakfast", "燕麦 + 鸡蛋 + 牛奶 + 水果", "家里", 10, "全麦面包 + 鸡蛋 + 无糖酸奶", "简单快手", "7:00–9:30"),
      meal("mon-l", "lunch", "一份蛋白质 + 两份蔬菜 + 适量主食", "公司食堂", 5, "外卖：清蒸/炖/烤 + 蔬菜 + 米饭", "少油汁，主食正常吃", "11:30–13:30"),
      meal("mon-d", "dinner", "番茄鸡蛋面（快手版）", "下班后", 15, "清蒸鱼 + 蔬菜 + 半碗饭"),
      meal("mon-s", "snack", "苹果 1 个", "办公室 / 家里", 1, "无糖酸奶", "饿的时候再吃"),
    ],
  },
  {
    day: "周二",
    meals: [
      meal("tue-b", "breakfast", "全麦面包 + 鸡蛋 + 牛奶", "家里", 5, "即食燕麦 + 无糖酸奶", "前一晚煮好鸡蛋", "7:00–9:30"),
      meal("tue-l", "lunch", "照烧鸡肉饭：少酱汁 + 一份蔬菜", "公司食堂", 5, "外卖：鸡肉饭去多余酱汁，补一份青菜", "正常吃主食，不需要额外加餐", "11:30–13:30"),
      meal("tue-d", "dinner", "豆腐蔬菜煲 + 米饭", "家里", 20, "便利店：即食鸡胸 + 沙拉 + 玉米"),
    ],
  },
  {
    day: "周三",
    meals: [
      meal("wed-b", "breakfast", "无糖酸奶 + 香蕉 + 坚果", "家里", 3, "牛奶 + 全麦面包 + 水煮蛋", "不用开火", "7:00–9:30"),
      meal("wed-l", "lunch", "鱼或鸡肉 + 两份蔬菜 + 米饭", "公司食堂", 5, "外卖：优先蒸鱼或烤鸡，另选一份蔬菜", "按当天能买到的菜选择", "11:30–13:30"),
      meal("wed-d", "dinner", "电饭锅鸡肉蘑菇饭 + 小番茄", "家里", 25, "番茄鸡蛋面 + 一份即食蔬菜"),
    ],
  },
  {
    day: "周四",
    meals: [
      meal("thu-b", "breakfast", "玉米 + 鸡蛋 + 无糖豆浆", "便利店 / 家里", 5, "全麦三明治 + 无糖牛奶", "买得到就直接组合", "7:00–9:30"),
      meal("thu-l", "lunch", "番茄牛肉盖饭 + 一份青菜", "外卖", 5, "食堂：瘦肉菜 + 米饭，酱汁少一些", "外食也按方便程度选择", "11:30–13:30"),
      meal("thu-d", "dinner", "虾仁炒蛋 + 西兰花 + 半碗饭", "家里", 18, "豆腐 + 冷冻蔬菜 + 即食米饭"),
    ],
  },
  {
    day: "周五",
    meals: [
      meal("fri-b", "breakfast", "鸡蛋蔬菜三明治 + 牛奶", "家里", 8, "即食燕麦 + 香蕉", "周五保持简单", "7:00–9:30"),
      meal("fri-l", "lunch", "食堂自选：一份肉菜 + 一份素菜 + 主食", "公司食堂", 5, "外卖：汤粉加蛋和青菜", "按现场供应灵活替换", "11:30–13:30"),
      meal("fri-d", "dinner", "清汤牛肉粉 + 青菜", "外食", 10, "家里：鸡蛋面加番茄和青菜"),
    ],
  },
  {
    day: "周六",
    meals: [
      meal("sat-b", "breakfast", "鸡蛋蔬菜卷 + 无糖豆浆", "家里", 15, "全麦面包 + 奶酪 + 水果", "有时间再做，不必复杂", "8:00–10:00"),
      meal("sat-l", "lunch", "家常蒸鱼 + 炒青菜 + 米饭", "家里", 30, "外卖：蒸鱼套餐 + 青菜"),
      meal("sat-d", "dinner", "鸡肉蔬菜拌面", "家里", 20, "豆腐蔬菜煲 + 米饭"),
    ],
  },
  {
    day: "周日",
    meals: [
      meal("sun-b", "breakfast", "牛奶燕麦 + 水煮蛋 + 苹果", "家里", 8, "全麦面包 + 无糖酸奶", "为下周留一点余量", "8:00–10:00"),
      meal("sun-l", "lunch", "牛肉蔬菜饭 + 一份清汤", "外食", 10, "家里：牛肉片 + 冷冻蔬菜 + 米饭"),
      meal("sun-d", "dinner", "番茄豆腐汤 + 玉米", "家里", 20, "便利店：茶叶蛋 + 玉米 + 无糖豆浆", "收尾保持轻松"),
    ],
  },
];

export const shoppingItems: ShoppingItem[] = [
  { id: "1", category: "蛋白质", name: "鸡蛋", amount: "10 个", price: 6, purchased: true },
  { id: "2", category: "蛋白质", name: "鸡胸肉", amount: "500 g", price: 12.5, purchased: false },
  { id: "3", category: "蛋白质", name: "北豆腐", amount: "500 g", price: 4.5, purchased: false },
  { id: "4", category: "蛋白质", name: "冷冻虾仁", amount: "300 g", price: 18, purchased: false },
  { id: "5", category: "蔬菜", name: "西兰花", amount: "300 g", price: 4.8, purchased: false },
  { id: "6", category: "蔬菜", name: "番茄", amount: "6 个", price: 9, purchased: true },
  { id: "7", category: "蔬菜", name: "冷冻混合蔬菜", amount: "500 g", price: 12, purchased: false },
  { id: "8", category: "主食", name: "燕麦片", amount: "500 g", price: 6.5, purchased: false },
  { id: "9", category: "主食", name: "全麦面包", amount: "1 袋", price: 9.9, purchased: true },
  { id: "10", category: "主食", name: "大米", amount: "1 kg", price: 5, purchased: true },
  { id: "11", category: "水果 / 饮品", name: "香蕉", amount: "4 根", price: 7, purchased: false },
  { id: "12", category: "水果 / 饮品", name: "无糖牛奶", amount: "2 L", price: 18, purchased: false },
];
