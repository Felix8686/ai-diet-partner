"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BottomNav } from "./bottom-nav";
import type { MealKind, MealPlanItem } from "@/types";
import { getHomePeriod, type HomePeriod } from "@/lib/home-view";
import { getLocalTodayIndex } from "@/lib/local-calendar";
import { weekPlan } from "@/lib/mock-data";

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

function findMeal(meals: MealPlanItem[], kind: MealKind) {
  return meals.find((meal) => meal.kind === kind);
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
      <details>
        <summary>换一种</summary>
        <p>{meal.alternatives[0]}</p>
      </details>
    </article>
  );
}

export function HomeScreen() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const updateTime = () => setNow(new Date());
    updateTime();
    const timer = window.setInterval(updateTime, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const hour = now.getHours();
  const period = getHomePeriod(hour);
  const meals = weekPlan[getLocalTodayIndex(now)].meals;
  const breakfast = findMeal(meals, "breakfast");
  const lunch = findMeal(meals, "lunch");
  const dinner = findMeal(meals, "dinner");

  return (
    <main className="appShell withNav">
      <header className="pageHeader homeHeader">
        <p className="homeKicker">{period === "morning" ? "先看早餐" : period === "noon" ? "午餐时间" : "晚餐安排"}</p>
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

        {period === "morning" && breakfast && lunch && dinner && (
          <>
            <MealCard meal={breakfast} focus />
            <MealCard meal={lunch} />
            <article className="previewRow">
              <div><strong>晚餐预览</strong><span>{dinner.scene}</span></div>
              <p>{dinner.title} · 准备 {dinner.prepMinutes} 分钟</p>
            </article>
          </>
        )}

        {period === "noon" && lunch && dinner && (
          <>
            <MealCard meal={lunch} focus />
            <div className="subsectionLabel">晚餐安排</div>
            <MealCard meal={dinner} />
          </>
        )}

        {period === "evening" && dinner && (
          <>
            <MealCard meal={dinner} focus />
            <section className="feedbackPrompt">
              <div className="sectionHeading compact">
                <div><h2>今天吃得怎么样？</h2><p>约 30 秒，告诉我哪里不方便。</p></div>
              </div>
              <Link href="/feedback" className="primaryButton">记录今天的情况</Link>
            </section>
          </>
        )}
      </section>

      <BottomNav />
    </main>
  );
}
