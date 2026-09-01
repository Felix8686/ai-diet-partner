import { strict as assert } from "node:assert";
import test from "node:test";
import type { FeedbackDraft } from "@/types";
import { feedbackCanSubmit } from "./feedback-validation";

const baseDraft: FeedbackDraft = {
  executionStatus: "completed",
  snackLevel: "none",
  deviationReasons: [],
  otherReason: "",
};

function draft(overrides: Partial<FeedbackDraft>): FeedbackDraft {
  return { ...baseDraft, ...overrides };
}

test("完成时允许不填写偏离原因", () => {
  assert.equal(feedbackCanSubmit(draft({ executionStatus: "completed" })), true);
});

test("部分完成或没执行时必须至少选择一个原因", () => {
  assert.equal(feedbackCanSubmit(draft({ executionStatus: "partial", deviationReasons: [] })), false);
  assert.equal(feedbackCanSubmit(draft({ executionStatus: "skipped", deviationReasons: [] })), false);
  assert.equal(feedbackCanSubmit(draft({ executionStatus: "partial", deviationReasons: ["没时间"] })), true);
});

test("选择其他时必须补充文字", () => {
  assert.equal(feedbackCanSubmit(draft({ executionStatus: "partial", deviationReasons: ["其他"], otherReason: "" })), false);
  assert.equal(feedbackCanSubmit(draft({ executionStatus: "partial", deviationReasons: ["其他"], otherReason: "临时加班" })), true);
});
