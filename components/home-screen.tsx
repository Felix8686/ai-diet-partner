"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BottomNav } from "./bottom-nav";
import type { GeneratedWeekPlan, MealKind, MealPlanItem, OnboardingProfile } from "@/types";
import { getNextMealState } from "@/lib/home-view";
import { getLocalTodayIndex, getLocalWeekStartKey } from "@/lib/local-calendar";
import { loadProfile, loadWeeklyPlan } from "@/lib/storage";

const mealLabels: Record<MealKind, string> = { breakfast: "早餐", lunch: "午餐", dinner: "晚餐", snack: "加餐" };

function greeting(hour: number) {
  if (hour >= 5 && hour < 11) return "早上好";
  if (hour >= 11 && hour < 17) return "下午好";
  return "晚上好";
}

function MealCard({ meal, focus = false }: { meal: MealPlanItem; focus?: boolean }) {
  return (
    <article className={focus ? "mealCard focusMeal" : "mealCard compactCard"}>
      <div className="mealTopline"><strong>{mealLabels[meal.kind]}</strong><span>{meal.timeHint || "按当天安排"}</span></div>
      <h3>{meal.title}</h3>
      <div className="mealMeta"><span>{meal.scene}</span><span>准备 {meal.prepMinutes} 分钟</span></div>
      {meal.note && <p>{meal.note}</p>}
      {meal.costSource && <p className="fieldHint">约 ¥{meal.resolvedCost ?? meal.estimatedCost}{meal.costSource === "reference" ? " · 参考估价" : " · 按你的价格"}</p>}
      {meal.alternatives[0] && <details><summary>换一种</summary><p>{meal.alternatives[0]}</p></details>}
    </article>
  );
}

function DailyFeedbackPrompt() {
  return <section className="feedbackPrompt"><div className="sectionHeading compact"><div><h2>今天吃得怎么样？</h2><p>约 30 秒，告诉我哪里不方便。</p></div></div><Link href="/feedback" className="primaryButton">记录今天的情况</Link></section>;
}

export function HomeScreen() {
  const [now, setNow] = useState(() => new Date());
  const [plan, setPlan] = useState<GeneratedWeekPlan | null | undefined>(undefined);
  const [profile, setProfile] = useState<OnboardingProfile | null | undefined>(undefined);

  useEffect(() => { const updateTime = () => setNow(new Date()); updateTime(); const timer = window.setInterval(updateTime, 60_000); return () => window.clearInterval(timer); }, []);
  useEffect(() => { setPlan(loadWeeklyPlan(getLocalWeekStartKey())); setProfile(loadProfile()); }, []);

  if (plan === undefined || profile === undefined) return <main className="appShell withNav"><header className="pageHeader homeHeader"><p className="homeKicker">正在准备</p><h1>读取你的本周方案</h1><p>马上就好。</p></header><BottomNav /></main>;
  if (plan === null) return <main className="appShell withNav"><header className="pageHeader homeHeader"><p className="homeKicker">先从这里开始</p><h1>先告诉我你的日常</h1><p>完成三步建档后，我会按你的时间、预算和吃饭环境安排这一周。</p></header><section className="feedbackPrompt"><h2>还没有本周方案</h2><p>先完成建档，之后就能看到今天怎么吃。</p><Link href="/onboarding" className="primaryButton">开始三步建档</Link></section><BottomNav /></main>;

  const hour = now.getHours();
  const todayIndex = getLocalTodayIndex(now);
  const meals = plan.days[todayIndex]?.meals ?? [];
  const state = getNextMealState(meals, hour, profile?.breakfastPattern);
  const tomorrowMeal = plan.days[todayIndex + 1]?.meals.find((meal) => meal.kind !== "snack");

  return (
    <main className="appShell withNav">
      <header className="pageHeader homeHeader"><p className="homeKicker">{state.label}</p><h1>{greeting(hour)}</h1><p>首页只回答一件事：你接下来怎么吃。</p></header>

      <section className="sectionBlock">
        <div className="sectionHeading"><h2>{state.afterDinner ? "今天先到这里" : "接下来怎么吃"}</h2></div>
        {plan.rulesCannotSatisfy && <p className="planNotice">有些现实条件暂时无法同时满足，已保留当前能执行的选择；调整资料后可以重新生成。</p>}
        {plan.containsReferenceEstimates && <p className="planNotice">本周约 ¥{plan.estimatedCost}，其中部分餐食仍是参考估价。可在“我的 → 我的食材与常见价格”补充真实价格。</p>}
        {!state.afterDinner && state.nextMeal && <MealCard meal={state.nextMeal} focus />}
        {!state.afterDinner && !state.nextMeal && <p className="emptyState">今天接下来暂时没有合适餐食，去本周方案看看其他安排。</p>}
        {!state.afterDinner && state.previewMeal && <article className="previewRow"><div><strong>稍后</strong><span>{mealLabels[state.previewMeal.kind]}</span></div><p>{state.previewMeal.title} · 准备 {state.previewMeal.prepMinutes} 分钟</p></article>}
        {state.afterDinner && tomorrowMeal && <article className="previewRow"><div><strong>明天先看</strong><span>{mealLabels[tomorrowMeal.kind]}</span></div><p>{tomorrowMeal.title}</p></article>}
        {state.afterDinner && <DailyFeedbackPrompt />}
      </section>

      <BottomNav />
    </main>
  );
}
