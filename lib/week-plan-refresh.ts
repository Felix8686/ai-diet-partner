import type { FeedbackAdjustment, GeneratedWeekPlan, OnboardingProfile, ShoppingItem, StoredFeedback } from "@/types";
import { aggregateFeedbackForWeek } from "@/lib/feedback-adjustments";
import { deriveShoppingList, mergeShoppingListPreservingPurchased } from "@/lib/shopping-list";
import { generateWeekPlan } from "@/lib/meal-planner";

export type NextWeekPlanRefresh = {
  plan: GeneratedWeekPlan;
  shoppingList: ShoppingItem[];
  adjustments: FeedbackAdjustment;
  hasEffectiveAdjustments: boolean;
};

export function refreshNextWeekPlan(
  profile: OnboardingProfile,
  currentPlan: GeneratedWeekPlan,
  nextWeekStart: string,
  feedback: StoredFeedback[],
  previousShoppingList: ShoppingItem[],
): NextWeekPlanRefresh {
  const adjustments = aggregateFeedbackForWeek(feedback, currentPlan);
  const hasEffectiveAdjustments = adjustments.explanations.length > 0;
  const plan = generateWeekPlan(
    profile,
    nextWeekStart,
    hasEffectiveAdjustments ? adjustments : undefined,
  );
  const shoppingList = mergeShoppingListPreservingPurchased(
    previousShoppingList,
    deriveShoppingList(plan),
  );

  return {
    plan,
    shoppingList,
    adjustments,
    hasEffectiveAdjustments,
  };
}
