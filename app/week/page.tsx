"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BottomNav } from "@/components/bottom-nav";
import type { GeneratedWeekPlan } from "@/types";
import { formatLocalDateKey, getLocalTodayIndex, getLocalWeekStartKey } from "@/lib/local-calendar";
import { loadWeeklyPlan } from "@/lib/storage";

const labels: Record<string, string> = { breakfast: "早餐", lunch: "午餐", dinner: "晚餐", snack: "加餐" };

export default function WeekPage() {
  const [plan, setPlan] = useState<GeneratedWeekPlan | null | undefined>(undefined);
  const [selected, setSelected] = useState(() => getLocalTodayIndex());

  useEffect(() => {
    setPlan(loadWeeklyPlan(getLocalWeekStartKey()));
  }, []);

  if (plan === undefined) {
    return <main className="appShell withNav"><header className="pageHeader centered"><p className="homeKicker">正在准备</p><h1>读取本周方案</h1><p>马上就好。</p></header><BottomNav /></main>;
  }

  if (plan === null || plan.days.length === 0) {
    return (
      <main className="appShell withNav">
        <header className="pageHeader centered"><p className="homeKicker">还没有方案</p><h1>先完成一次建档</h1><p>告诉我你的时间、预算和吃饭环境，再生成这周的安排。</p></header>
        <section className="feedbackPrompt"><h2>本周方案还没生成</h2><p>完成三步建档后，这里会显示每天的吃什么和替换方案。</p><Link href="/onboarding" className="primaryButton">开始三步建档</Link></section>
        <BottomNav />
      </main>
    );
  }

  const todayIndex = getLocalTodayIndex();
  const safeSelected = Math.min(selected, plan.days.length - 1);
  const day = plan.days[safeSelected];

  return (
    <main className="appShell withNav">
      <header className="pageHeader centered"><p className="homeKicker">按天查看</p><h1>这周怎么吃</h1><p>只看今天这一天，做饭和外食都能换。</p></header>

      <section className="strategyLine">
        <strong>安排思路</strong>
        <span>工作日尽量简单；午餐正常吃食堂或外卖，晚餐留出更省事的替换。</span>
      </section>

      <div className="dayTabs" role="tablist">
        {plan.days.map((item, index) => (
          <button type="button" role="tab" aria-selected={safeSelected === index} aria-controls="selected-day" aria-label={`${item.day} ${formatLocalDateKey(item.date)}${todayIndex === index ? "，今天" : ""}`} key={item.date} onClick={() => setSelected(index)} className={safeSelected === index ? "dayTab active" : "dayTab"}>
            <strong>{item.day}</strong><span>{formatLocalDateKey(item.date)}</span>
          </button>
        ))}
      </div>

      <section className="sectionBlock" id="selected-day" role="tabpanel">
        <div className="sectionHeading compact">
          <div><p className="sectionEyebrow">当前选择</p><h2>{day.day} · {safeSelected === todayIndex ? "今天" : formatLocalDateKey(day.date)}</h2></div>
          <Link className="textButton" href="/shopping">去采购</Link>
        </div>
        {plan.rulesCannotSatisfy && <p className="planNotice">{plan.warnings[0] ?? "有些现实条件暂时无法同时满足，已保留当前能执行的选择。"}</p>}
        <div className="mealList">
          {day.meals.map((meal) => (
            <article className="mealCard compactCard" key={meal.id}>
              <div className="mealTopline"><strong>{labels[meal.kind]}</strong><span>{meal.timeHint || "按当天安排"}</span></div>
              <h3>{meal.title}</h3>
              <div className="mealMeta"><span>{meal.scene}</span><span>准备 {meal.prepMinutes} 分钟</span></div>
              {meal.note && <p>{meal.note}</p>}
              {meal.alternatives[0] && <div className="replacement"><span>替换方案</span><p>{meal.alternatives[0]}</p></div>}
            </article>
          ))}
        </div>
      </section>

      <BottomNav />
    </main>
  );
}
