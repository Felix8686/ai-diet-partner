import type { DayPlan, ShoppingItem } from "@/types";

export const weekPlan: DayPlan[] = [
  {
    day: "周一",
    date: "9/1",
    meals: [
      { id: "mon-b", kind: "breakfast", title: "燕麦 + 鸡蛋 + 牛奶 + 水果", timeHint: "7:00–9:30", prepMinutes: 10, note: "简单快手", alternatives: ["全麦面包 + 鸡蛋 + 无糖酸奶"] },
      { id: "mon-l", kind: "lunch", title: "1份蛋白质 + 2份蔬菜 + 适量主食", scene: "公司食堂", timeHint: "11:30–13:30", note: "少油汁，主食正常吃", alternatives: ["外卖：优先清蒸/炖/烤 + 蔬菜 + 米饭"] },
      { id: "mon-d", kind: "dinner", title: "番茄鸡蛋面（快手版）", scene: "下班后", prepMinutes: 15, alternatives: ["清蒸鱼 + 蔬菜 + 半碗饭"] },
      { id: "mon-s", kind: "snack", title: "苹果 1 个", note: "饿的时候再吃", alternatives: ["无糖酸奶"] }
    ]
  },
  ...["周二", "周三", "周四", "周五", "周六", "周日"].map((day, index) => ({
    day,
    date: `9/${index + 2}`,
    meals: [
      { id: `${index}-b`, kind: "breakfast" as const, title: "全麦面包 + 鸡蛋 + 牛奶", prepMinutes: 5 },
      { id: `${index}-l`, kind: "lunch" as const, title: "蛋白质 + 蔬菜 + 主食", scene: index < 4 ? "公司食堂" : "在家/外食" },
      { id: `${index}-d`, kind: "dinner" as const, title: index % 2 === 0 ? "豆腐蔬菜煲 + 米饭" : "鸡肉蔬菜拌面", prepMinutes: 20 }
    ]
  }))
];

export const shoppingItems: ShoppingItem[] = [
  { id: "1", category: "蛋白质", name: "鸡蛋", amount: "10 个", price: 6, purchased: true },
  { id: "2", category: "蛋白质", name: "鸡胸肉", amount: "500 g", price: 12.5, purchased: false },
  { id: "3", category: "蛋白质", name: "豆腐", amount: "500 g", price: 4.5, purchased: false },
  { id: "4", category: "蔬菜", name: "西兰花", amount: "300 g", price: 4.8, purchased: false },
  { id: "5", category: "蔬菜", name: "番茄", amount: "4 个", price: 6, purchased: true },
  { id: "6", category: "主食", name: "燕麦片", amount: "500 g", price: 6.5, purchased: false },
  { id: "7", category: "主食", name: "大米", amount: "1 kg", price: 5, purchased: true }
];
