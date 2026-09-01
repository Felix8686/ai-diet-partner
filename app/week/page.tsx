"use client";

import { useState } from "react";
import Link from "next/link";
import { BottomNav } from "@/components/bottom-nav";
import { weekPlan } from "@/lib/mock-data";
import { formatLocalDate, getLocalTodayIndex, getLocalWeekDates } from "@/lib/local-calendar";

const labels: Record<string, string> = { breakfast: "早餐", lunch: "午餐", dinner: "晚餐", snack: "加餐" };

export default function WeekPage() {
  const [currentDate] = useState(() => new Date());
  const weekDates = getLocalWeekDates(currentDate);
  const todayIndex = getLocalTodayIndex(currentDate);
  const [selected, setSelected] = useState(todayIndex);
  const day = weekPlan[selected];

  return (
    <main className="appShell withNav">
      <header className="pageHeader centered"><p className="homeKicker">按天查看</p><h1>这周怎么吃</h1><p>只看今天这一天，做饭和外食都能换。</p></header>

      <section className="strategyLine">
        <strong>安排思路</strong>
        <span>工作日尽量简单；午餐正常吃食堂或外卖，晚餐留出更省事的替换。</span>
      </section>

      <div className="dayTabs" role="tablist">
        {weekPlan.map((item, index) => (
          <button type="button" role="tab" aria-selected={selected === index} aria-controls="selected-day" aria-label={`${item.day} ${formatLocalDate(weekDates[index])}${todayIndex === index ? "，今天" : ""}`} key={item.day} onClick={() => setSelected(index)} className={selected === index ? "dayTab active" : "dayTab"}>
            <strong>{item.day}</strong><span>{formatLocalDate(weekDates[index])}</span>
          </button>
        ))}
      </div>

      <section className="sectionBlock" id="selected-day" role="tabpanel">
        <div className="sectionHeading compact">
          <div><p className="sectionEyebrow">当前选择</p><h2>{day.day} · {selected === todayIndex ? "今天" : formatLocalDate(weekDates[selected])}</h2></div>
          <Link className="textButton" href="/shopping">去采购</Link>
        </div>
        <div className="mealList">
          {day.meals.map((meal) => (
            <article className="mealCard compactCard" key={meal.id}>
              <div className="mealTopline"><strong>{labels[meal.kind]}</strong><span>{meal.timeHint || "按当天安排"}</span></div>
              <h3>{meal.title}</h3>
              <div className="mealMeta"><span>{meal.scene}</span><span>准备 {meal.prepMinutes} 分钟</span></div>
              {meal.note && <p>{meal.note}</p>}
              <div className="replacement"><span>替换方案</span><p>{meal.alternatives[0]}</p></div>
            </article>
          ))}
        </div>
      </section>

      <BottomNav />
    </main>
  );
}
