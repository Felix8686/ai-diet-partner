import type { FeedbackAdjustment, FoodEnvironmentItem, GeneratedWeekPlan, MealKind, MealTemplate, OnboardingProfile } from "@/types";
import { getLocalDateKey, getLocalWeekDates, getLocalWeekStartKey, parseLocalDateKey } from "@/lib/local-calendar";
import { mealTemplates } from "@/lib/meal-templates";
import { resolveMealCost } from "@/lib/reality-data";

export type PlanWeekInput = string | { weekStart: string };

type PlanSelection = { dayIndex: number; kind: MealKind; candidates: MealTemplate[]; meal: MealTemplate };

const dayNames = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
const kindLabels: Record<MealKind, string> = { breakfast: "早餐", lunch: "午餐", dinner: "晚餐", snack: "加餐" };
const mealKinds: MealKind[] = ["breakfast", "lunch", "dinner"];
const outsideScenes = new Set(["公司食堂", "外卖", "便利店", "外食"]);
const meatTerms = ["鸡肉", "鸡胸", "牛肉", "鱼", "虾", "虾仁"];
const veganTerms = [...meatTerms, "蛋", "牛奶", "酸奶", "奶酪"];
const relaxedWeekendDifference = "工作日更忙，周末有时间";
const busyWeekendDifference = "周末反而更忙";

function hash(value: string): number { let result = 2166136261; for (let index = 0; index < value.length; index += 1) { result ^= value.charCodeAt(index); result = Math.imul(result, 16777619); } return result >>> 0; }
function terms(value: string): string[] { return value.toLowerCase().replace(/过敏|忌口|不能吃|不吃|不喜欢/g, " ").split(/[、,，;；/／\s]+/).map((term) => term.trim().replace(/^对/, "")).filter(Boolean); }
function normalizeWeekStart(week: PlanWeekInput): string { const raw = typeof week === "string" ? week : week.weekStart; return getLocalWeekStartKey(parseLocalDateKey(raw) ?? new Date()); }
function parseBudget(value: string): number | null { const budget = Number(value); return Number.isFinite(budget) && budget >= 0 ? budget : null; }
function maxWeekdayPrepMinutes(value: string): number { if (value === "10 分钟以内") return 10; if (value === "30–60 分钟") return 60; if (value === "通常不做饭") return 10; return 30; }
function maxAllowedPrepMinutes(profile: OnboardingProfile, isWeekend: boolean): number { const weekdayMax = maxWeekdayPrepMinutes(profile.weekdayCookTime); return isWeekend && profile.weekdayWeekendDifference === relaxedWeekendDifference ? 60 : weekdayMax; }
function sceneParts(scene: string): string[] { return scene.split(/[ /／、]+/).filter(Boolean); }
function isOutsidePreferred(profile: OnboardingProfile): boolean { return profile.weekdayCookTime === "通常不做饭" || profile.outsideMealRatio.includes("大多数") || profile.outsideMealRatio.includes("4–7"); }

function isForbidden(template: MealTemplate, profile: OnboardingProfile): boolean {
  const restrictions = profile.dietaryRestrictions.toLowerCase();
  const templateText = [template.title, ...template.ingredients, ...template.tags].join(" ").toLowerCase();
  const disliked = terms(profile.dislikedFoods);
  const restrictionTerms = terms(profile.dietaryRestrictions).filter((term) => !["素食", "纯素", "全素"].includes(term)).flatMap((term) => term === "鸡蛋" ? [term, "蛋"] : [term]);
  if ((restrictions.includes("纯素") || restrictions.includes("全素")) && (template.dietaryTags.includes("contains-animal") || template.ingredients.some((ingredient) => veganTerms.some((term) => ingredient.includes(term))))) return true;
  if (restrictions.includes("素食") && template.ingredients.some((ingredient) => meatTerms.some((term) => ingredient.includes(term)))) return true;
  return [...disliked, ...restrictionTerms].some((term) => templateText.includes(term));
}

function canUseTemplate(template: MealTemplate, profile: OnboardingProfile, isWeekend: boolean): boolean {
  const capabilities = Array.isArray(profile.kitchenCapabilities) ? profile.kitchenCapabilities : [];
  if (!template.kitchenCapabilities.every((capability) => capabilities.includes(capability))) return false;
  if (template.prepMinutes > maxAllowedPrepMinutes(profile, isWeekend)) return false;
  if (profile.weekdayCookTime === "通常不做饭" && template.kitchenCapabilities.length > 0) return false;
  return true;
}

function preferenceScore(template: MealTemplate, profile: OnboardingProfile, isWeekend: boolean, environment: FoodEnvironmentItem[], adjustments?: FeedbackAdjustment): number {
  const scenes = Array.isArray(profile.mealScenes) ? profile.mealScenes : [];
  const templateScenes = sceneParts(template.scene);
  const likes = terms(profile.likedFoods);
  let score = 0;
  if (templateScenes.some((scene) => scenes.includes(scene))) score += 30;
  if (template.kind === "lunch" && scenes.includes("自己带饭")) score += templateScenes.includes("自己带饭") ? 42 : -18;
  if (isOutsidePreferred(profile)) score += templateScenes.some((scene) => outsideScenes.has(scene)) ? 24 : -8;
  if (scenes.includes("在家吃")) score += templateScenes.includes("家里") ? 30 : -6;
  if (profile.weekdayCookTime === "通常不做饭") score += template.kitchenCapabilities.length === 0 ? 28 : -30;
  if (!isWeekend && template.prepMinutes <= maxWeekdayPrepMinutes(profile.weekdayCookTime)) score += 8;
  if (isWeekend && profile.weekdayWeekendDifference === relaxedWeekendDifference && template.prepMinutes > maxWeekdayPrepMinutes(profile.weekdayCookTime)) score += 12;
  if (isWeekend && profile.weekdayWeekendDifference === busyWeekendDifference) { score -= template.prepMinutes; score -= template.kitchenCapabilities.length * 8; }
  if (template.kind === "breakfast" && profile.breakfastPattern.includes("有时来不及")) { const quick = template.prepMinutes <= 5 && template.kitchenCapabilities.length === 0; score += quick ? 36 : -36; }
  if (template.tags.includes("无烹饪") && profile.weekdayCookTime === "通常不做饭") score += 8;
  score += likes.filter((like) => [template.title, ...template.ingredients].join(" ").toLowerCase().includes(like)).length * 7;
  if (adjustments) {
    if (adjustments.timePressure > 0) { const quick = template.prepMinutes <= 10 || template.kitchenCapabilities.length === 0 || template.tags.includes("无烹饪"); score += adjustments.timePressure * (quick ? 14 : -10); score -= adjustments.timePressure * Math.max(0, template.prepMinutes - 10); }
    if (adjustments.simplicity > 0) { const simple = template.prepMinutes <= 10 && template.kitchenCapabilities.length <= 1; score += adjustments.simplicity * (simple ? 12 : -8); score -= adjustments.simplicity * (template.kitchenCapabilities.length * 6 + Math.max(0, template.prepMinutes - 10) / 2); }
    if (adjustments.availability > 0) { const easy = template.shoppingItems.length <= 2 || template.scene.includes("便利店") || template.scene.includes("公司食堂") || template.scene.includes("外卖"); score += adjustments.availability * (easy ? 14 : -6); score -= adjustments.availability * Math.min(template.shoppingItems.length, 4) * 2; }
    if (adjustments.costSensitivity > 0) score -= adjustments.costSensitivity * resolveMealCost(template, environment).cost * 1.5;
    if (adjustments.dislikedMealIds.includes(template.id)) score -= 30;
  }
  return score;
}

function rankCandidates(candidates: MealTemplate[], profile: OnboardingProfile, dayIndex: number, kind: MealKind, weekStart: string, usedCounts: Map<string, number>, environment: FoodEnvironmentItem[], previousId?: string, adjustments?: FeedbackAdjustment): MealTemplate[] {
  const isWeekend = dayIndex >= 5;
  return [...candidates].sort((left, right) => {
    const leftScore = preferenceScore(left, profile, isWeekend, environment, adjustments) - (usedCounts.get(left.id) ?? 0) * 7 - (left.id === previousId ? 28 : 0);
    const rightScore = preferenceScore(right, profile, isWeekend, environment, adjustments) - (usedCounts.get(right.id) ?? 0) * 7 - (right.id === previousId ? 28 : 0);
    if (rightScore !== leftScore) return rightScore - leftScore;
    const leftTie = hash(`${weekStart}|${dayIndex}|${kind}|${left.id}`); const rightTie = hash(`${weekStart}|${dayIndex}|${kind}|${right.id}`);
    return leftTie - rightTie || left.id.localeCompare(right.id);
  });
}

function safeAlternativeTitles(selection: PlanSelection, profile: OnboardingProfile, weekStart: string, environment: FoodEnvironmentItem[], adjustments?: FeedbackAdjustment): string[] {
  return rankCandidates(selection.candidates.filter((candidate) => candidate.id !== selection.meal.id), profile, selection.dayIndex, selection.kind, weekStart, new Map(), environment, undefined, adjustments).slice(0, 1).map((candidate) => candidate.title);
}
function snackDays(profile: OnboardingProfile): number[] { if (profile.snackHabit.includes("没有")) return []; if (profile.snackHabit.includes("经常")) return [0, 1, 2, 3, 4, 5, 6]; return [1, 3, 5]; }
function totalCost(selections: PlanSelection[], environment: FoodEnvironmentItem[]): number { return Number(selections.reduce((total, selection) => total + resolveMealCost(selection.meal, environment).cost, 0).toFixed(2)); }

function reduceToBudget(selections: PlanSelection[], profile: OnboardingProfile, budget: number, weekStart: string, environment: FoodEnvironmentItem[], adjustments?: FeedbackAdjustment): boolean {
  let estimatedCost = totalCost(selections, environment);
  while (estimatedCost > budget) {
    const options = selections.flatMap((selection, selectionIndex) => {
      const currentCost = resolveMealCost(selection.meal, environment).cost;
      const currentScore = preferenceScore(selection.meal, profile, selection.dayIndex >= 5, environment, adjustments);
      return selection.candidates.filter((candidate) => candidate.id !== selection.meal.id && resolveMealCost(candidate, environment).cost < currentCost).map((candidate) => {
        const candidateCost = resolveMealCost(candidate, environment).cost; const saving = currentCost - candidateCost;
        const preferenceLoss = currentScore - preferenceScore(candidate, profile, selection.dayIndex >= 5, environment, adjustments);
        return { candidate, selectionIndex, saving, ratio: preferenceLoss / saving, tie: hash(`${weekStart}|budget|${selectionIndex}|${candidate.id}`) };
      });
    }).sort((left, right) => left.ratio - right.ratio || right.saving - left.saving || left.tie - right.tie);
    const replacement = options[0]; if (!replacement) return false;
    selections[replacement.selectionIndex].meal = replacement.candidate; estimatedCost = totalCost(selections, environment);
  }
  return true;
}

export function generateWeekPlan(profile: OnboardingProfile, week: PlanWeekInput, adjustments?: FeedbackAdjustment, environment: FoodEnvironmentItem[] = []): GeneratedWeekPlan {
  const weekStart = normalizeWeekStart(week); const dates = getLocalWeekDates(parseLocalDateKey(weekStart) ?? new Date());
  const usedCounts = new Map<string, number>(); const selections: PlanSelection[] = []; const warnings: string[] = [];
  const snackDaySet = new Set(snackDays(profile)); const profileScenes = Array.isArray(profile.mealScenes) ? profile.mealScenes : [];
  for (let dayIndex = 0; dayIndex < dates.length; dayIndex += 1) {
    const baseKinds = profile.breakfastPattern.includes("通常不吃") ? mealKinds.filter((kind) => kind !== "breakfast") : mealKinds;
    const kinds = snackDaySet.has(dayIndex) ? [...baseKinds, "snack" as const] : baseKinds; let previousId: string | undefined;
    for (const kind of kinds) {
      const candidates = mealTemplates.filter((template) => template.kind === kind).filter((template) => !isForbidden(template, profile)).filter((template) => canUseTemplate(template, profile, dayIndex >= 5));
      const ranked = rankCandidates(candidates, profile, dayIndex, kind, weekStart, usedCounts, environment, previousId, adjustments); const meal = ranked[0];
      if (!meal) { warnings.push(`${dayNames[dayIndex]}${kindLabels[kind]}暂时没有同时满足当前条件的餐食模板。`); continue; }
      selections.push({ dayIndex, kind, candidates, meal }); usedCounts.set(meal.id, (usedCounts.get(meal.id) ?? 0) + 1); previousId = meal.id;
    }
  }
  const budget = parseBudget(profile.weeklyFoodBudget); let estimatedCost = totalCost(selections, environment);
  if (budget !== null && estimatedCost > budget) { const reduced = reduceToBudget(selections, profile, budget, weekStart, environment, adjustments); estimatedCost = totalCost(selections, environment); if (!reduced || estimatedCost > budget) warnings.push(`当前可用数据无法在每周 ${budget} 元内同时满足全部条件，已保留最接近的可行组合。`); }
  let userPricedMeals = 0; let referencePricedMeals = 0;
  const days = dates.map((date, dayIndex) => ({ day: dayNames[dayIndex], date: getLocalDateKey(date), meals: selections.filter((selection) => selection.dayIndex === dayIndex).map((selection) => {
    const price = resolveMealCost(selection.meal, environment); if (price.source === "user") userPricedMeals += 1; else referencePricedMeals += 1;
    return { ...selection.meal, resolvedCost: price.cost, costSource: price.source, alternatives: safeAlternativeTitles(selection, profile, weekStart, environment, adjustments) };
  }) }));
  const rulesCannotSatisfy = warnings.length > 0;
  return {
    weekStart, days,
    strategy: isOutsidePreferred(profile) || profileScenes.some((scene) => outsideScenes.has(scene)) ? "优先安排工作日能直接买到或快速处理的餐食。" : "优先安排家里能完成的餐食，保留少量外食替换。",
    estimatedCost, budget, containsReferenceEstimates: referencePricedMeals > 0, userPricedMeals, referencePricedMeals,
    rulesCannotSatisfy, status: rulesCannotSatisfy ? "rules-cannot-satisfy" : "ready", warnings,
    ...(adjustments ? { adjustmentSummary: adjustments.explanations } : {}),
  };
}
