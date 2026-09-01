"use client";

import { useState } from "react";
import Link from "next/link";
import { BottomNav } from "@/components/bottom-nav";
import { weekPlan } from "@/lib/mock-data";

const labels: Record<string, string> = { breakfast: "早餐", lunch: "午餐", dinner: "晚餐", snack: "加餐" };

export default function WeekPage() {
  const [selected, setSelected] = useState(0);
  const day = weekPlan[selected];

  return (
    <main className="appShell withNav">
      <header className="pageHeader centered"><h1>本周方案</h1></header>

      <section className="strategyLine">
        <strong>这周怎么吃</strong>
        <span>工作日尽量简单；午餐正常吃食堂，晚餐稍微轻一点。</span>
      </section>

      <div className="dayTabs" role="tablist">
        {weekPlan.map((item, index) => (
          <button key={item.day} onClick={() => setSelected(index)} className={selected === index ? "dayTab active" : "dayTab"}>
            <strong>{item.day}</strong><span>{item.date}</span>
          </button>
        ))}
      </div>

      <section className="sectionBlock">
        <h2>{day.day} · {selected === 0 ? "今天" : day.date}</h2>
        <div className="mealList">
          {day.meals.map((meal) => (
            <article className="mealCard compactCard" key={meal.id}>
              <div className="mealTopline"><strong>{labels[meal.kind]}</strong><span>{meal.scene || meal.timeHint || ""}</span></div>
              <h3>{meal.title}</h3>
              <p>{meal.prepMinutes ? `约 ${meal.prepMinutes} 分钟` : meal.note}</p>
              {meal.alternatives?.[0] && <details><summary>换一种</summary><p>{meal.alternatives[0]}</p></details>}
            </article>
          ))}
        </div>
      </section>

      <div className="compactLinks">
        <Link href="/shopping">采购清单</Link><span>·</span><button>方案说明</button>
      </div>

      <BottomNav />
    </main>
  );
}
