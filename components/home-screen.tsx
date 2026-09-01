"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BottomNav } from "./bottom-nav";
import type { GeneratedWeekPlan, MealKind, MealPlanItem, OnboardingProfile } from "@/types";
import { getEveningContent, getHomeMeals, getHomePeriod, getMorningHomeState, type HomePeriod } from "@/lib/home-view";
import { getLocalTodayIndex, getLocalWeekStartKey } from "@/lib/local-calendar";
import { loadProfile, loadWeeklyPlan } from "@/lib/storage";

const periods = [
  { id: "morning", label: "早上", range: "早餐" },
  { id: "noon", label: "中午", range: "午餐" },
  { id: "evening", label: "晚上", range: "晚餐" },
] satisfies Array<{ id: HomePeriod; label: string; range: string }>;

const mealLabels: Record<MealKind, string> = {
  breakfast: "早餐",
  lunch: "午餐",
  dinner: "晚餐",
  snack: "加餐",
};

function greeting(hour: number) {
  if (hour >= 5 && hour < 11) return "早上好";
  if (hour >= 11 && hour < 17) return "下午好";
  return "晚上好";
}

function MealCard({ meal, focus = false }: { meal: MealPlanItem; focus?: boolean }) {
  return (
    <article className={focus ? "mealCard focusMeal" : "mealCard compactCard"}>
      <div className="mealTopline">
        <strong>{mealLabels[meal.kind]}</strong>
        <span>{meal.timeHint || "按当天安排"}</span>
      </div>
      <h3>{meal.title}</h3>
      <div className="mealMeta">
        <span>{meal.scene}</span>
        <span>准备 {meal.prepMinutes} 分钟</span>
      </div>
      {meal.note && <p>{meal.note}</p>}
      {meal.alternatives[0] && <details><summary>换一种</summary><p>{meal.alternatives[0]}</p></details>}
    </article>
  );
}

function MissingMeal({ kind }: { kind: MealKind }) {
  return <p className="mealUnavailable">{mealLabels[kind]}暂时没有合适模板，先看其他餐别。</p>;
}

function DailyFeedbackPrompt() {
  return (
    <section className="feedbackPrompt">
      <div className="sectionHeading compact">
        <div><h2>今天吃得怎么样？</h2><p>约 30 秒，告诉我哪里不方便。</p></div>
      </div>
      <Link href="/feedback" className="primaryButton">记录今天的情况</Link>
    </section>
  );
}

export function HomeScreen() {
  const [now, setNow] = useState(() => new Date());
  const [plan, setPlan] = useState<GeneratedWeekPlan | null | undefined>(undefined);
  const [profile, setProfile] = useState<OnboardingProfile | null | undefined>(undefined);
  useEffect(() => {
    const updateTime = () => setNow(new Date());
    updateTime();
    const timer = window.setInterval(updateTime, 60_000);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => {
    setPlan(loadWeeklyPlan(getLocalWeekStartKey()));
    setProfile(loadProfile());
  }, []);

  if (plan === undefined || profile === undefined) {
    return <main className="appShell withNav"><header className="pageHeader homeHeader"><p className="homeKicker">正在准备</p><h1>读取你的本周方案</h1><p>马上就好。</p></header><BottomNav /></main>;
  }

  if (plan === null) {
    return (
      <main className="appShell withNav">
        <header className="pageHeader homeHeader"><p className="homeKicker">先从这里开始</p><h1>先告诉我你的日常</h1><p>完成三步建档后，我会按你的时间、预算和吃饭环境安排这一周。</p></header>
        <section className="feedbackPrompt"><h2>还没有本周方案</h2><p>先完成建档，之后就能看到今天怎么吃。</p><Link href="/onboarding" className="primaryButton">开始三步建档</Link></section>
        <BottomNav />
      </main>
    );
  }

  const hour = now.getHours();
  const period = getHomePeriod(hour);
  const meals = plan.days[getLocalTodayIndex(now)]?.meals ?? [];
  const homeMeals = getHomeMeals(meals);
  const morningState = getMorningHomeState(homeMeals, profile?.breakfastPattern);
  const { lunch, dinner } = homeMeals;
  const breakfast = morningState.breakfastSkipped ? undefined : homeMeals.breakfast;
  const eveningContent = getEveningContent(Boolean(dinner));

  return (
    <main className="appShell withNav">
      <header className="pageHeader homeHeader">
        <p className="homeKicker">{period === "morning" ? (morningState.breakfastSkipped ? "午餐时间" : "先看早餐") : period === "noon" ? "午餐时间" : "晚餐安排"}</p>
        <h1>{greeting(hour)}</h1>
        <p>按你今天的时间，先把下一顿安排好。</p>
      </header>

      <section className="periodBar" aria-label="今日时段">
        {periods.map((item) => (
          <div key={item.id} className={item.id === period ? "period active" : "period"}>
            <strong>{item.label}</strong>
            <span>{item.range}</span>
          </div>
        ))}
      </section>

      <section className="sectionBlock">
        <div className="sectionHeading">
          <h2>接下来怎么吃</h2>
        </div>
        {plan.rulesCannotSatisfy && <p className="planNotice">有些现实条件暂时无法同时满足，已保留当前能执行的选择；调整资料后可以重新生成。</p>}
        {!breakfast && !lunch && !dinner && <p className="emptyState">今天暂时没有符合当前条件的餐食模板，回到资料里调整后再生成一次。</p>}

        {period === "morning" && (
          <>
            {breakfast ? <MealCard meal={breakfast} focus={morningState.focusKind === "breakfast"} /> : morningState.showMissingBreakfast && <MissingMeal kind="breakfast" />}
            {lunch ? <MealCard meal={lunch} focus={morningState.focusKind === "lunch"} /> : <MissingMeal kind="lunch" />}
            {dinner ? <article className="previewRow"><div><strong>晚餐预览</strong><span>{dinner.scene}</span></div><p>{dinner.title} · 准备 {dinner.prepMinutes} 分钟</p></article> : <MissingMeal kind="dinner" />}
          </>
        )}

        {period === "noon" && (
          <>
            {lunch ? <MealCard meal={lunch} focus /> : <MissingMeal kind="lunch" />}
            <div className="subsectionLabel">晚餐安排</div>
            {dinner ? <MealCard meal={dinner} /> : <MissingMeal kind="dinner" />}
          </>
        )}

        {period === "evening" && (
          <>
            {eveningContent.includes("dinner") && dinner && <MealCard meal={dinner} focus />}
            {eveningContent.includes("missing-dinner") && <MissingMeal kind="dinner" />}
            {eveningContent.includes("feedback") && <DailyFeedbackPrompt />}
          </>
        )}
      </section>

      <BottomNav />
    </main>
  );
}
