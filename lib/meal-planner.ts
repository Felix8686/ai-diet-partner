import type { GeneratedWeekPlan, MealKind, MealTemplate, OnboardingProfile } from "@/types";
import { getLocalDateKey, getLocalWeekDates, getLocalWeekStartKey, parseLocalDateKey } from "@/lib/local-calendar";
import { mealTemplates } from "@/lib/meal-templates";

export type PlanWeekInput = string | { weekStart: string };

type PlanSelection = {
  dayIndex: number;
  kind: MealKind;
  candidates: MealTemplate[];
  meal: MealTemplate;
};

const dayNames = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
const kindLabels: Record<MealKind, string> = {
  breakfast: "早餐",
  lunch: "午餐",
  dinner: "晚餐",
  snack: "加餐",
};
const mealKinds: MealKind[] = ["breakfast", "lunch", "dinner"];
const outsideScenes = new Set(["公司食堂", "外卖", "便利店", "外食"]);
const meatTerms = ["鸡肉", "鸡胸", "牛肉", "鱼", "虾", "虾仁"];
const veganTerms = [...meatTerms, "蛋", "牛奶", "酸奶", "奶酪"];

function hash(value: string): number {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}

function terms(value: string): string[] {
  return value
    .toLowerCase()
    .replace(/过敏|忌口|不能吃|不吃|不喜欢/g, " ")
    .split(/[、,，;；/／\s]+/)
    .map((term) => term.trim())
    .filter(Boolean);
}

function normalizeWeekStart(week: PlanWeekInput): string {
  const rawWeekStart = typeof week === "string" ? week : week.weekStart;
  return getLocalWeekStartKey(parseLocalDateKey(rawWeekStart) ?? new Date());
}

function parseBudget(value: string): number | null {
  const budget = Number(value);
  return Number.isFinite(budget) && budget >= 0 ? budget : null;
}

function maxWeekdayPrepMinutes(value: string): number {
  if (value === "10 分钟以内") return 10;
  if (value === "30–60 分钟") return 60;
  if (value === "通常不做饭") return 10;
  return 30;
}

function sceneParts(scene: string): string[] {
  return scene.split(/[ /／、]+/).filter(Boolean);
}

function isOutsidePreferred(profile: OnboardingProfile): boolean {
  return profile.weekdayCookTime === "通常不做饭"
    || profile.outsideMealRatio.includes("大多数")
    || profile.outsideMealRatio.includes("4–7");
}

function isForbidden(template: MealTemplate, profile: OnboardingProfile): boolean {
  const restrictions = profile.dietaryRestrictions.toLowerCase();
  const templateText = [template.title, ...template.ingredients, ...template.tags].join(" ").toLowerCase();
  const disliked = terms(profile.dislikedFoods);
  const restrictionTerms = terms(profile.dietaryRestrictions).filter((term) => !["素食", "纯素", "全素"].includes(term));

  if ((restrictions.includes("纯素") || restrictions.includes("全素"))
    && (template.dietaryTags.includes("contains-animal")
      || template.ingredients.some((ingredient) => veganTerms.some((term) => ingredient.includes(term))))) return true;
  if (restrictions.includes("素食")
    && template.ingredients.some((ingredient) => meatTerms.some((term) => ingredient.includes(term)))) return true;

  return [...disliked, ...restrictionTerms].some((term) => templateText.includes(term));
}

function canUseTemplate(template: MealTemplate, profile: OnboardingProfile, isWeekend: boolean): boolean {
  const capabilities = Array.isArray(profile.kitchenCapabilities) ? profile.kitchenCapabilities : [];
  if (!template.kitchenCapabilities.every((capability) => capabilities.includes(capability))) return false;
  if (isWeekend) return true;

  const maxPrep = maxWeekdayPrepMinutes(profile.weekdayCookTime);
  if (template.prepMinutes > maxPrep) return false;
  if (profile.weekdayCookTime === "通常不做饭" && template.kitchenCapabilities.length > 0) return false;
  return true;
}

function preferenceScore(template: MealTemplate, profile: OnboardingProfile, isWeekend: boolean): number {
  const scenes = Array.isArray(profile.mealScenes) ? profile.mealScenes : [];
  const templateScenes = sceneParts(template.scene);
  const likes = terms(profile.likedFoods);
  let score = 0;

  if (templateScenes.some((scene) => scenes.includes(scene))) score += 30;
  if (isOutsidePreferred(profile)) score += templateScenes.some((scene) => outsideScenes.has(scene)) ? 24 : -8;
  if (scenes.includes("在家吃")) score += templateScenes.includes("家里") ? 30 : -6;
  if (profile.weekdayCookTime === "通常不做饭") score += template.kitchenCapabilities.length === 0 ? 28 : -30;
  if (!isWeekend && template.prepMinutes <= maxWeekdayPrepMinutes(profile.weekdayCookTime)) score += 8;
  if (template.tags.includes("无烹饪") && profile.weekdayCookTime === "通常不做饭") score += 8;
  score += likes.filter((like) => [template.title, ...template.ingredients].join(" ").toLowerCase().includes(like)).length * 7;
  return score;
}

function rankCandidates(
  candidates: MealTemplate[],
  profile: OnboardingProfile,
  dayIndex: number,
  kind: MealKind,
  weekStart: string,
  usedCounts: Map<string, number>,
  previousId?: string,
): MealTemplate[] {
  const isWeekend = dayIndex >= 5;
  return [...candidates].sort((left, right) => {
    const leftScore = preferenceScore(left, profile, isWeekend) - (usedCounts.get(left.id) ?? 0) * 7 - (left.id === previousId ? 28 : 0);
    const rightScore = preferenceScore(right, profile, isWeekend) - (usedCounts.get(right.id) ?? 0) * 7 - (right.id === previousId ? 28 : 0);
    if (rightScore !== leftScore) return rightScore - leftScore;
    const leftTie = hash(`${weekStart}|${dayIndex}|${kind}|${left.id}`);
    const rightTie = hash(`${weekStart}|${dayIndex}|${kind}|${right.id}`);
    return leftTie - rightTie || left.id.localeCompare(right.id);
  });
}

function safeAlternativeTitles(selection: PlanSelection, profile: OnboardingProfile, weekStart: string): string[] {
  return rankCandidates(
    selection.candidates.filter((candidate) => candidate.id !== selection.meal.id),
    profile,
    selection.dayIndex,
    selection.kind,
    weekStart,
    new Map(),
  ).slice(0, 1).map((candidate) => candidate.title);
}

function snackDays(profile: OnboardingProfile): number[] {
  if (profile.snackHabit.includes("没有")) return [];
  if (profile.snackHabit.includes("经常")) return [0, 1, 2, 3, 4, 5, 6];
  return [1, 3, 5];
}

function totalCost(selections: PlanSelection[]): number {
  return Number(selections.reduce((total, selection) => total + selection.meal.estimatedCost, 0).toFixed(2));
}

function reduceToBudget(selections: PlanSelection[], profile: OnboardingProfile, budget: number, weekStart: string): boolean {
  let estimatedCost = totalCost(selections);
  while (estimatedCost > budget) {
    const options = selections.flatMap((selection, selectionIndex) => {
      const currentScore = preferenceScore(selection.meal, profile, selection.dayIndex >= 5);
      return selection.candidates
        .filter((candidate) => candidate.id !== selection.meal.id && candidate.estimatedCost < selection.meal.estimatedCost)
        .map((candidate) => {
          const saving = selection.meal.estimatedCost - candidate.estimatedCost;
          const preferenceLoss = currentScore - preferenceScore(candidate, profile, selection.dayIndex >= 5);
          return {
            candidate,
            selectionIndex,
            saving,
            preferenceLoss,
            ratio: preferenceLoss / saving,
            tie: hash(`${weekStart}|budget|${selectionIndex}|${candidate.id}`),
          };
        });
    }).sort((left, right) => left.ratio - right.ratio || right.saving - left.saving || left.tie - right.tie);

    const replacement = options[0];
    if (!replacement) return false;
    selections[replacement.selectionIndex].meal = replacement.candidate;
    estimatedCost = totalCost(selections);
  }
  return true;
}

export function generateWeekPlan(profile: OnboardingProfile, week: PlanWeekInput): GeneratedWeekPlan {
  const weekStart = normalizeWeekStart(week);
  const dates = getLocalWeekDates(parseLocalDateKey(weekStart) ?? new Date());
  const usedCounts = new Map<string, number>();
  const selections: PlanSelection[] = [];
  const warnings: string[] = [];
  const snackDaySet = new Set(snackDays(profile));
  const profileScenes = Array.isArray(profile.mealScenes) ? profile.mealScenes : [];

  for (let dayIndex = 0; dayIndex < dates.length; dayIndex += 1) {
    const kinds = snackDaySet.has(dayIndex) ? [...mealKinds, "snack" as const] : mealKinds;
    let previousId: string | undefined;
    for (const kind of kinds) {
      const candidates = mealTemplates.filter((template) => template.kind === kind)
        .filter((template) => !isForbidden(template, profile))
        .filter((template) => canUseTemplate(template, profile, dayIndex >= 5));
      const ranked = rankCandidates(candidates, profile, dayIndex, kind, weekStart, usedCounts, previousId);
      const meal = ranked[0];
      if (!meal) {
        warnings.push(`${dayNames[dayIndex]}${kindLabels[kind]}暂时没有同时满足当前条件的餐食模板。`);
        continue;
      }
      selections.push({ dayIndex, kind, candidates, meal });
      usedCounts.set(meal.id, (usedCounts.get(meal.id) ?? 0) + 1);
      previousId = meal.id;
    }
  }

  const budget = parseBudget(profile.weeklyFoodBudget);
  let estimatedCost = totalCost(selections);
  if (budget !== null && estimatedCost > budget) {
    const reduced = reduceToBudget(selections, profile, budget, weekStart);
    estimatedCost = totalCost(selections);
    if (!reduced || estimatedCost > budget) {
      warnings.push(`当前模板池无法在每周 ${budget} 元内同时满足全部条件，已保留最接近的可行组合。`);
    }
  }

  const days = dates.map((date, dayIndex) => ({
    day: dayNames[dayIndex],
    date: getLocalDateKey(date),
    meals: selections.filter((selection) => selection.dayIndex === dayIndex).map((selection) => ({
      ...selection.meal,
      alternatives: safeAlternativeTitles(selection, profile, weekStart),
    })),
  }));
  const rulesCannotSatisfy = warnings.length > 0;

  return {
    weekStart,
    days,
    strategy: isOutsidePreferred(profile) || profileScenes.some((scene) => outsideScenes.has(scene))
      ? "优先安排工作日能直接买到或快速处理的餐食。"
      : "优先安排家里能完成的餐食，保留少量外食替换。",
    estimatedCost,
    budget,
    rulesCannotSatisfy,
    status: rulesCannotSatisfy ? "rules-cannot-satisfy" : "ready",
    warnings,
  };
}
