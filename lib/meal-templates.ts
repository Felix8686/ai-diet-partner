import type { MealKind, MealTemplate } from "@/types";
import { defaultRequirementForIngredient } from "@/lib/reality-data";

function template(
  id: string,
  kind: MealKind,
  title: string,
  scene: string,
  prepMinutes: number,
  kitchenCapabilities: string[],
  estimatedCost: number,
  ingredients: string[],
  tags: string[],
  alternative: string,
  note?: string,
  timeHint?: string,
): MealTemplate {
  const containsAnimalProducts = ingredients.some((ingredient) => /鸡肉|鸡胸|牛肉|鱼|虾|蛋|牛奶|酸奶|奶酪/.test(ingredient));
  const hasConvenienceScene = scene.includes("便利店");
  const isProvidedMeal = !hasConvenienceScene && ["公司食堂", "外卖", "外食"].some((providedScene) => scene.includes(providedScene));
  const result: MealTemplate = {
    id,
    kind,
    title,
    scene,
    prepMinutes,
    kitchenCapabilities,
    estimatedCost,
    ingredients,
    shoppingItems: isProvidedMeal ? [] : ingredients.map(defaultRequirementForIngredient),
    tags,
    dietaryTags: containsAnimalProducts ? ["contains-animal"] : ["plant-based"],
    alternatives: [alternative],
  };
  if (note) result.note = note;
  if (timeHint) result.timeHint = timeHint;
  return result;
}

export const mealTemplates: MealTemplate[] = [
  template("breakfast-oats-yogurt", "breakfast", "燕麦 + 无糖酸奶 + 香蕉", "家里 / 便利店", 3, [], 6, ["燕麦片", "无糖酸奶", "香蕉"], ["早餐", "无烹饪", "家里", "便利店"], "全麦面包 + 牛奶 + 水果", "不用开火，来不及的时候也能组合。", "7:00–9:30"),
  template("breakfast-toast-egg", "breakfast", "全麦面包 + 鸡蛋 + 牛奶", "家里", 5, ["煮"], 6, ["全麦面包", "鸡蛋", "牛奶"], ["早餐", "家里", "快速"], "即食燕麦 + 无糖酸奶", "前一晚煮好鸡蛋会更省事。", "7:00–9:30"),
  template("breakfast-convenience-sandwich", "breakfast", "全麦三明治 + 无糖牛奶", "便利店", 2, [], 10, ["全麦三明治", "无糖牛奶"], ["早餐", "便利店", "无烹饪"], "无糖酸奶 + 香蕉", "买到就能吃。", "7:00–9:30"),
  template("breakfast-corn-soy", "breakfast", "玉米 + 无糖豆浆 + 茶叶蛋", "便利店 / 家里", 3, [], 8, ["玉米", "无糖豆浆", "茶叶蛋"], ["早餐", "便利店", "无烹饪"], "全麦三明治 + 无糖牛奶", "直接组合，不需要额外准备。", "7:00–9:30"),
  template("breakfast-vegetable-roll", "breakfast", "鸡蛋蔬菜卷 + 无糖豆浆", "家里", 15, ["炒"], 9, ["鸡蛋", "蔬菜", "无糖豆浆"], ["早餐", "家里", "荤"], "全麦面包 + 奶酪 + 水果", "有时间再做，不必每天复杂。", "7:00–9:30"),
  template("breakfast-milk-oats-egg", "breakfast", "牛奶燕麦 + 水煮蛋 + 苹果", "家里", 8, ["煮"], 7, ["牛奶", "燕麦片", "鸡蛋", "苹果"], ["早餐", "家里", "荤"], "全麦面包 + 无糖酸奶", "把鸡蛋提前煮好即可。", "7:00–9:30"),

  template("lunch-cafeteria-chicken", "lunch", "食堂：一份肉菜 + 一份素菜 + 米饭", "公司食堂", 5, [], 12, ["鸡肉", "蔬菜", "米饭"], ["午餐", "外食", "食堂", "荤"], "外卖鸡肉饭，酱汁少一些", "按现场有的菜灵活选择。", "11:30–13:30"),
  template("lunch-cafeteria-fish", "lunch", "食堂：鱼 + 青菜 + 米饭", "公司食堂", 5, [], 14, ["鱼", "青菜", "米饭"], ["午餐", "外食", "食堂", "荤"], "食堂：瘦肉菜 + 米饭 + 青菜", "优先选择清蒸或少油做法。", "11:30–13:30"),
  template("lunch-takeout-chicken", "lunch", "外卖鸡肉饭（少酱汁）", "外卖", 5, [], 15, ["鸡肉", "米饭", "蔬菜"], ["午餐", "外食", "外卖", "荤"], "食堂：一份肉菜 + 一份素菜 + 米饭", "正常吃主食，酱汁少一些。", "11:30–13:30"),
  template("lunch-takeout-noodles", "lunch", "外卖汤粉 + 鸡蛋 + 青菜", "外卖", 8, [], 11, ["米粉", "鸡蛋", "青菜"], ["午餐", "外食", "外卖", "荤"], "食堂：鱼 + 青菜 + 米饭", "临时忙时优先选择有蛋白质和蔬菜的组合。", "11:30–13:30"),
  template("lunch-convenience-chicken", "lunch", "即食鸡胸 + 沙拉 + 玉米", "便利店", 2, [], 16, ["鸡胸肉", "生菜", "玉米"], ["午餐", "外食", "便利店", "无烹饪", "荤"], "外卖鸡肉饭，少酱汁", "买到就能组合。", "11:30–13:30"),
  template("lunch-home-fish", "lunch", "家常蒸鱼 + 炒青菜 + 米饭", "家里", 30, ["蒸", "炒"], 18, ["鱼", "青菜", "米饭"], ["午餐", "家里", "荤"], "豆腐蔬菜饭", "周末或时间充足时再做。", "11:30–13:30"),
  template("lunch-home-tofu", "lunch", "豆腐蔬菜饭", "家里", 20, ["煮"], 10, ["豆腐", "蔬菜", "米饭"], ["午餐", "家里", "素食友好"], "家常蒸鱼 + 炒青菜 + 米饭", "一锅完成，清理也比较简单。", "11:30–13:30"),
  template("lunch-home-chicken-mushroom", "lunch", "鸡肉蘑菇饭", "家里", 25, ["煮"], 14, ["鸡肉", "蘑菇", "米饭"], ["午餐", "家里", "荤"], "豆腐蔬菜饭", "可以一次做两份。", "11:30–13:30"),
  template("lunch-packed-chicken", "lunch", "自带：鸡肉蘑菇饭", "自己带饭 / 家里", 25, ["煮"], 14, ["鸡肉", "蘑菇", "米饭"], ["午餐", "自己带饭", "家里", "可提前准备", "荤"], "自带：豆腐蔬菜饭", "可以前一晚多做一份，装盒后带到公司。", "11:30–13:30"),
  template("lunch-packed-tofu", "lunch", "自带：豆腐蔬菜饭", "自己带饭 / 家里", 20, ["煮"], 11, ["豆腐", "蔬菜", "米饭"], ["午餐", "自己带饭", "家里", "可提前准备", "素食友好"], "自带：鸡肉蘑菇饭", "一锅完成，放凉后装盒即可携带。", "11:30–13:30"),

  template("dinner-tomato-egg-noodles", "dinner", "番茄鸡蛋面（快手版）", "家里", 15, ["煮"], 9, ["番茄", "鸡蛋", "面条"], ["晚餐", "家里", "快速", "荤"], "豆腐蔬菜煲 + 米饭", "下班后不想复杂时可以选。"),
  template("dinner-tofu-vegetable-pot", "dinner", "豆腐蔬菜煲 + 米饭", "家里", 20, ["煮"], 10, ["豆腐", "蔬菜", "米饭"], ["晚餐", "家里", "素食友好"], "番茄鸡蛋面（快手版）", "一锅完成，适合平日晚餐。"),
  template("dinner-microwave-chicken", "dinner", "微波鸡胸 + 冷冻蔬菜 + 即食米饭", "便利店 / 家里", 8, ["微波"], 15, ["鸡胸肉", "冷冻蔬菜", "即食米饭"], ["晚餐", "便利店", "家里", "快速", "荤"], "便利店：茶叶蛋 + 玉米 + 无糖豆浆", "只需要加热和组合。"),
  template("dinner-steamed-fish", "dinner", "清蒸鱼 + 炒青菜 + 半碗饭", "家里", 30, ["蒸", "炒"], 19, ["鱼", "青菜", "米饭"], ["晚餐", "家里", "荤"], "豆腐蔬菜煲 + 米饭", "留出时间时再做。"),
  template("dinner-shrimp-egg", "dinner", "虾仁炒蛋 + 西兰花 + 半碗饭", "家里", 18, ["炒"], 18, ["虾仁", "鸡蛋", "西兰花", "米饭"], ["晚餐", "家里", "荤"], "微波鸡胸 + 冷冻蔬菜 + 即食米饭", "食材准备好后很快。"),
  template("dinner-beef-noodles", "dinner", "清汤牛肉粉 + 青菜", "外食", 10, [], 16, ["牛肉", "米粉", "青菜"], ["晚餐", "外食", "荤"], "家里：鸡蛋面加番茄和青菜", "临时外食也可以直接选择。"),
  template("dinner-chicken-vegetable-noodles", "dinner", "鸡肉蔬菜拌面", "家里", 20, ["煮", "炒"], 13, ["鸡肉", "面条", "蔬菜"], ["晚餐", "家里", "荤"], "豆腐蔬菜煲 + 米饭", "一锅面和蔬菜一起完成。"),
  template("dinner-convenience-egg-corn", "dinner", "便利店：茶叶蛋 + 玉米 + 无糖豆浆", "便利店 / 家里", 3, [], 12, ["茶叶蛋", "玉米", "无糖豆浆"], ["晚餐", "便利店", "无烹饪", "荤"], "微波鸡胸 + 冷冻蔬菜 + 即食米饭", "不想做饭时直接组合。"),

  template("snack-apple", "snack", "苹果 1 个", "办公室 / 家里", 1, [], 2, ["苹果"], ["加餐", "无烹饪"], "无糖酸奶", "饿的时候再吃。"),
  template("snack-yogurt", "snack", "无糖酸奶", "便利店 / 家里", 1, [], 4, ["无糖酸奶"], ["加餐", "无烹饪"], "香蕉", "买到就能吃。"),
  template("snack-banana", "snack", "香蕉 1 根", "办公室 / 家里", 1, [], 2, ["香蕉"], ["加餐", "无烹饪"], "苹果 1 个", "适合放在办公室。"),
  template("snack-nuts", "snack", "原味坚果一小把", "便利店 / 家里", 1, [], 5, ["坚果"], ["加餐", "无烹饪"], "无糖酸奶", "买小包装更容易控制份量。"),
];
