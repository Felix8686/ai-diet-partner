"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { BottomNav } from "@/components/bottom-nav";
import type { FeedbackDraft } from "@/types";
import { getFeedbackValidationMessage, feedbackCanSubmit } from "@/lib/feedback-validation";
import { getLocalDateKey } from "@/lib/local-calendar";
import { loadDailyFeedback, saveDailyFeedback } from "@/lib/storage";

const executionOptions: Array<{ value: FeedbackDraft["executionStatus"]; label: string }> = [
  { value: "completed", label: "完成" },
  { value: "partial", label: "部分完成" },
  { value: "skipped", label: "没执行" },
];

const snackOptions: Array<{ value: FeedbackDraft["snackLevel"]; label: string }> = [
  { value: "none", label: "没有" },
  { value: "little", label: "少量" },
  { value: "more", label: "比较多" },
];

const reasonOptions = ["没时间", "太麻烦", "买不到", "太贵", "不喜欢", "临时聚餐", "其他"];

const initialDraft: FeedbackDraft = {
  executionStatus: "",
  snackLevel: "",
  deviationReasons: [],
  otherReason: "",
};

export default function FeedbackPage() {
  const [draft, setDraft] = useState<FeedbackDraft>(initialDraft);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const savedFeedback = loadDailyFeedback(getLocalDateKey());
    if (savedFeedback) {
      setDraft(savedFeedback);
      setSubmitted(true);
    }
  }, []);

  function toggleReason(reason: string) {
    setDraft((current) => {
      const reasons = current.deviationReasons.includes(reason)
        ? current.deviationReasons.filter((item) => item !== reason)
        : [...current.deviationReasons, reason];
      return { ...current, deviationReasons: reasons };
    });
    setError("");
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationMessage = getFeedbackValidationMessage(draft);
    if (!feedbackCanSubmit(draft)) {
      setError(validationMessage);
      return;
    }

    const date = getLocalDateKey();
    saveDailyFeedback(date, draft);
    setError("");
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <main className="appShell withNav">
        <section className="feedbackSuccess" aria-live="polite">
          <p className="homeKicker">记录完成</p>
          <h1>收到，今天就到这里。</h1>
          <p>下周会根据你遇到的情况，把方案调整得更容易执行。</p>
          <div className="formActions">
            <Link className="primaryButton" href="/">回到首页</Link>
            <Link className="secondaryButton" href="/week">查看本周方案</Link>
          </div>
        </section>
        <BottomNav />
      </main>
    );
  }

  return (
    <main className="appShell withNav feedbackPage">
      <header className="pageHeader">
        <p className="homeKicker">每日反馈 · 约 30 秒</p>
        <h1>今天吃得怎么样？</h1>
        <p>不做评价，只记录哪里需要下次更方便。</p>
      </header>

      <form onSubmit={submit} className="formStack">
        <fieldset>
          <legend>今天的计划执行情况</legend>
          <div className="choiceGrid threeColumns">
            {executionOptions.map((option, index) => (
              <label key={option.value}>
                <input aria-label={option.label} type="radio" name="execution" value={option.value} required={index === 0} checked={draft.executionStatus === option.value} onChange={() => { setDraft((current) => ({ ...current, executionStatus: option.value })); setError(""); }} />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend>今天零食情况</legend>
          <div className="choiceGrid threeColumns">
            {snackOptions.map((option, index) => (
              <label key={option.value}>
                <input aria-label={option.label} type="radio" name="snack" value={option.value} required={index === 0} checked={draft.snackLevel === option.value} onChange={() => { setDraft((current) => ({ ...current, snackLevel: option.value })); setError(""); }} />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend>如果有变化，主要是什么原因？</legend>
          <div className="choiceGrid">
            {reasonOptions.map((reason) => (
              <label key={reason}>
                <input aria-label={reason} type="checkbox" checked={draft.deviationReasons.includes(reason)} onChange={() => toggleReason(reason)} />
                {reason}
              </label>
            ))}
          </div>
          {draft.deviationReasons.includes("其他") && <label htmlFor="other-reason">请补充其他原因<input id="other-reason" maxLength={80} value={draft.otherReason} onChange={(event) => { const value = event.currentTarget.value; setDraft((current) => ({ ...current, otherReason: value })); setError(""); }} placeholder="例如：临时加班" /></label>}
          <p className="fieldHint">完成时可以不选；如果部分完成或没执行，请至少选一个。</p>
        </fieldset>

        {error && <p className="formError" role="alert">{error}</p>}
        <button className="primaryButton" type="submit">保存今天的反馈</button>
      </form>

      <BottomNav />
    </main>
  );
}
