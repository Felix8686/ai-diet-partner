"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BottomNav } from "@/components/bottom-nav";
import type { GeneratedWeekPlan } from "@/types";
import { formatLocalDateKey, getAdjacentWeekStartKey, getLocalTodayIndex, getLocalWeekStartKey } from "@/lib/local-calendar";
import { loadFeedbackForWeek, loadProfile, loadShoppingList, loadWeeklyPlan, saveShoppingList, saveWeeklyPlan } from "@/lib/storage";
import { refreshNextWeekPlan } from "@/lib/week-plan-refresh";
import { isTodayInWeekView, type WeekView } from "@/lib/week-view";

const labels: Record<string, string> = { breakfast: "早餐", lunch: "午餐", dinner: "晚餐", snack: "加餐" };

export default function WeekPage() {
  const [plans, setPlans] = useState<Record<WeekView, GeneratedWeekPlan | null> | undefined>(undefined);
  const [selectedWeek, setSelectedWeek] = useState<WeekView>("current");
  const [selected, setSelected] = useState(() => getLocalTodayIndex());
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const currentWeekStart = getLocalWeekStartKey();
  const nextWeekStart = getAdjacentWeekStartKey(currentWeekStart, 1) ?? currentWeekStart;

  useEffect(() => {
    setPlans({ current: loadWeeklyPlan(currentWeekStart), next: loadWeeklyPlan(nextWeekStart) });
  }, [currentWeekStart, nextWeekStart]);

  function generateNextWeek() {
    if (!plans?.current || generating) return;
    const profile = loadProfile();
    if (!profile) { setError("还没有找到建档资料，请先完成一次建档。"); return; }
    setGenerating(true); setError("");
    try {
      const refreshed = refreshNextWeekPlan(profile, plans.current, nextWeekStart, loadFeedbackForWeek(currentWeekStart), loadShoppingList(nextWeekStart));
      saveWeeklyPlan(refreshed.plan); saveShoppingList(nextWeekStart, refreshed.shoppingList);
      setPlans((current) => current ? { ...current, next: refreshed.plan } : current); setSelectedWeek("next"); setSelected(0);
    } catch { setError("下周方案更新失败，请稍后再试。"); } finally { setGenerating(false); }
  }

  if (plans === undefined) return <main className="appShell withNav"><header className="pageHeader centered"><p className="homeKicker">正在准备</p><h1>读取本周方案</h1><p>马上就好。</p></header><BottomNav /></main>;
  const currentPlan = plans.current;
  if (currentPlan === null || currentPlan.days.length === 0) return <main className="appShell withNav"><header className="pageHeader centered"><p className="homeKicker">还没有方案</p><h1>先完成一次建档</h1><p>告诉我你的时间、预算和吃饭环境，再生成这周的安排。</p></header><section className="feedbackPrompt"><h2>本周方案还没生成</h2><p>完成三步建档后，这里会显示每天的吃什么和替换方案。</p><Link href="/onboarding" className="primaryButton">开始三步建档</Link></section><BottomNav /></main>;

  const plan = plans[selectedWeek];
  if (plan === null || plan.days.length === 0) return <main className="appShell withNav"><header className="pageHeader centered"><p className="homeKicker">下周准备</p><h1>下周方案还没生成</h1><p>先看看本周反馈，再安排下一周。</p></header><div className="statusTabs weekSwitcher" role="tablist" aria-label="查看周期"><button type="button" role="tab" aria-selected={selectedWeek === "current"} className={selectedWeek === "current" ? "statusTab active" : "statusTab"} onClick={() => setSelectedWeek("current")}>本周</button><button type="button" role="tab" aria-selected={selectedWeek === "next"} className={selectedWeek === "next" ? "statusTab active" : "statusTab"} onClick={() => setSelectedWeek("next")}>下周</button></div><section className="feedbackPrompt"><h2>从本周反馈开始</h2><p>生成后会单独保存下周方案，不会覆盖本周已经勾选的内容。</p>{error && <p className="formError" role="alert">{error}</p>}<button className="primaryButton" type="button" disabled={generating} onClick={generateNextWeek}>{generating ? "正在生成" : "看看下周怎么调整"}</button></section><BottomNav /></main>;

  const todayIndex = getLocalTodayIndex();
  const safeSelected = Math.min(selected, plan.days.length - 1);
  const day = plan.days[safeSelected];
  const nextPlan = plans.next;
  const selectedDayIsToday = isTodayInWeekView(selectedWeek, safeSelected, todayIndex);

  return (
    <main className="appShell withNav">
      <header className="pageHeader centered"><p className="homeKicker">按天查看</p><h1>{selectedWeek === "current" ? "这周怎么吃" : "下周怎么吃"}</h1><p>只看今天这一天，做饭和外食都能换。</p></header>
      <div className="statusTabs weekSwitcher" role="tablist" aria-label="查看周期"><button type="button" role="tab" aria-selected={selectedWeek === "current"} className={selectedWeek === "current" ? "statusTab active" : "statusTab"} onClick={() => { setSelectedWeek("current"); setSelected(getLocalTodayIndex()); }}>本周</button><button type="button" role="tab" aria-selected={selectedWeek === "next"} className={selectedWeek === "next" ? "statusTab active" : "statusTab"} onClick={() => { setSelectedWeek("next"); setSelected(0); }}>下周</button></div>

      <section className="strategyLine"><strong>安排思路</strong><span>{plan.strategy}</span></section>
      <section className="adjustmentNotice" aria-label="预算说明">
        <strong>本周餐费约 ¥{plan.estimatedCost}{plan.budget !== null ? ` / 预算 ¥${plan.budget}` : ""}</strong>
        <p>{plan.containsReferenceEstimates ? "其中部分餐食没有你的真实价格，仍使用参考估价。" : "当前餐费已按你录入的真实价格计算。"}</p>
        {plan.containsReferenceEstimates && <Link className="textButton" href="/food-environment">补充真实价格</Link>}
      </section>

      {selectedWeek === "next" && plan.adjustmentSummary && plan.adjustmentSummary.length > 0 && <section className="adjustmentNotice" aria-label="下周调整说明"><strong>下周做了这些调整</strong>{plan.adjustmentSummary.slice(0, 2).map((summary) => <p key={summary}>{summary}</p>)}</section>}
      {selectedWeek === "next" && (!plan.adjustmentSummary || plan.adjustmentSummary.length === 0) && <p className="fieldHint">本周没有形成新的调整信号，下周仍按当前资料安排。</p>}

      <div className="dayTabs" role="tablist">{plan.days.map((item, index) => <button type="button" role="tab" aria-selected={safeSelected === index} aria-controls="selected-day" aria-label={`${item.day} ${formatLocalDateKey(item.date)}${isTodayInWeekView(selectedWeek, index, todayIndex) ? "，今天" : ""}`} key={item.date} onClick={() => setSelected(index)} className={safeSelected === index ? "dayTab active" : "dayTab"}><strong>{item.day}</strong><span>{formatLocalDateKey(item.date)}</span></button>)}</div>

      <section className="sectionBlock" id="selected-day" role="tabpanel">
        <div className="sectionHeading compact"><div><p className="sectionEyebrow">当前选择</p><h2>{day.day} · {selectedDayIsToday ? "今天" : formatLocalDateKey(day.date)}</h2></div><Link className="textButton" href={`/shopping?week=${selectedWeek === "current" ? currentWeekStart : nextWeekStart}`}>去采购</Link></div>
        {plan.rulesCannotSatisfy && <p className="planNotice">{plan.warnings[0] ?? "有些现实条件暂时无法同时满足，已保留当前能执行的选择。"}</p>}
        <div className="mealList">{day.meals.map((meal) => <article className="mealCard compactCard" key={meal.id}><div className="mealTopline"><strong>{labels[meal.kind]}</strong><span>{meal.timeHint || "按当天安排"}</span></div><h3>{meal.title}</h3><div className="mealMeta"><span>{meal.scene}</span><span>准备 {meal.prepMinutes} 分钟</span></div>{meal.note && <p>{meal.note}</p>}<p className="fieldHint">约 ¥{meal.resolvedCost ?? meal.estimatedCost}{meal.costSource === "user" ? " · 按你的价格" : " · 参考估价"}</p>{meal.alternatives[0] && <div className="replacement"><span>替换方案</span><p>{meal.alternatives[0]}</p></div>}</article>)}</div>
      </section>

      {selectedWeek === "current" && <section className="feedbackPrompt"><h2>{nextPlan ? "下周方案已准备好" : "看看下周怎么调整"}</h2><p>{nextPlan ? "下周方案已单独保存，本周的采购勾选不会被覆盖。" : "提交本周反馈后，我会把下一周安排得更容易执行。"}</p>{error && <p className="formError" role="alert">{error}</p>}{nextPlan ? <div className="formActions"><button className="secondaryButton" type="button" onClick={() => { setSelectedWeek("next"); setSelected(0); }}>查看下周方案</button><button className="primaryButton" type="button" disabled={generating} onClick={generateNextWeek}>{generating ? "正在更新" : "根据最新反馈更新"}</button></div> : <button className="primaryButton" type="button" disabled={generating} onClick={generateNextWeek}>{generating ? "正在生成" : "看看下周怎么调整"}</button>}</section>}
      <BottomNav />
    </main>
  );
}
