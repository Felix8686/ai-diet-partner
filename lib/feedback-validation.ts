import type { FeedbackDraft } from "@/types";

export function feedbackCanSubmit(draft: FeedbackDraft): boolean {
  if (!draft.executionStatus || !draft.snackLevel) return false;
  if (draft.executionStatus !== "completed" && draft.deviationReasons.length === 0) return false;
  if (draft.deviationReasons.includes("其他") && draft.otherReason.trim() === "") return false;
  return true;
}

export function getFeedbackValidationMessage(draft: FeedbackDraft): string {
  if (!draft.executionStatus || !draft.snackLevel) return "请先完成前面的选择。";
  if (draft.executionStatus !== "completed" && draft.deviationReasons.length === 0) return "如果没有完全执行，请选一个主要原因。";
  if (draft.deviationReasons.includes("其他") && draft.otherReason.trim() === "") return "请补充一下“其他”原因。";
  return "";
}
