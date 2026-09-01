import type { FeedbackAdjustment, FeedbackReason, GeneratedWeekPlan, StoredFeedback } from "@/types";

export const feedbackReasons: FeedbackReason[] = ["没时间", "太麻烦", "买不到", "太贵", "不喜欢", "临时聚餐", "其他"];

const explanationPriority: FeedbackReason[] = ["没时间", "太麻烦", "买不到", "太贵", "不喜欢"];

function emptyReasonCounts(): Record<FeedbackReason, number> {
  return Object.fromEntries(feedbackReasons.map((reason) => [reason, 0])) as Record<FeedbackReason, number>;
}

function isFeedbackReason(value: string): value is FeedbackReason {
  return feedbackReasons.includes(value as FeedbackReason);
}

function mainMealForDate(plan: GeneratedWeekPlan | null | undefined, date: string) {
  const day = plan?.days.find((item) => item.date === date);
  return day?.meals.find((meal) => meal.kind === "lunch")
    ?? day?.meals.find((meal) => meal.kind === "dinner")
    ?? day?.meals.find((meal) => meal.kind === "breakfast")
    ?? day?.meals.find((meal) => meal.kind === "snack");
}

function explanation(reason: FeedbackReason, count: number): string {
  if (reason === "没时间") return `这周有 ${count} 次因为没时间没完全执行，下周优先更快的餐。`;
  if (reason === "太麻烦") return `这周有 ${count} 次觉得准备太麻烦，下周减少复杂步骤。`;
  if (reason === "买不到") return `这周有 ${count} 次遇到食材买不到，下周优先更容易买到的组合。`;
  if (reason === "太贵") return `这周有 ${count} 次觉得餐费偏高，下周优先更省的选择。`;
  return `这周有 ${count} 次不喜欢当天的主餐，下周降低相同餐食再次出现的概率。`;
}

export function aggregateFeedbackForWeek(
  feedback: StoredFeedback[],
  sourcePlan?: GeneratedWeekPlan | null,
): FeedbackAdjustment {
  const reasonCounts = emptyReasonCounts();
  const dislikedMealIds = new Set<string>();

  for (const entry of [...feedback].sort((left, right) => left.date.localeCompare(right.date) || left.submittedAt - right.submittedAt)) {
    for (const reason of new Set(entry.deviationReasons)) {
      if (!isFeedbackReason(reason)) continue;
      reasonCounts[reason] += 1;
      if (reason === "不喜欢") {
        const meal = mainMealForDate(sourcePlan, entry.date);
        if (meal) dislikedMealIds.add(meal.id);
      }
    }
  }

  const explanations = explanationPriority
    .filter((reason) => reason !== "不喜欢" || dislikedMealIds.size > 0)
    .filter((reason) => reasonCounts[reason] > 0)
    .slice(0, 2)
    .map((reason) => explanation(reason, reasonCounts[reason]));

  return {
    feedbackCount: feedback.length,
    reasonCounts,
    timePressure: Math.min(reasonCounts["没时间"], 3),
    simplicity: Math.min(reasonCounts["太麻烦"], 3),
    availability: Math.min(reasonCounts["买不到"], 3),
    costSensitivity: Math.min(reasonCounts["太贵"], 3),
    dislikedMealIds: [...dislikedMealIds].sort(),
    explanations,
  };
}
