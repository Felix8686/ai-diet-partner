export type WeekView = "current" | "next";

export function isTodayInWeekView(
  weekView: WeekView,
  dayIndex: number,
  localTodayIndex: number,
): boolean {
  return weekView === "current" && dayIndex === localTodayIndex;
}
