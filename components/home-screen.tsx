"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BottomNav } from "./bottom-nav";

const periods = [
  { label: "早上", range: "6:00–10:30", start: 6, end: 10 },
  { label: "中午", range: "10:30–14:30", start: 10, end: 14 },
  { label: "晚上", range: "16:30–22:00", start: 16, end: 21 },
  { label: "夜间", range: "22:00–6:00", start: 22, end: 23 }
];

function greeting(hour: number) {
  if (hour < 11) return "早上好";
  if (hour < 17) return "下午好";
  return "晚上好";
}

function periodIndex(hour: number) {
  if (hour >= 6 && hour < 10.5) return 0;
  if (hour >= 10.5 && hour < 16.5) return 1;
  if (hour >= 16.5 && hour < 22) return 2;
  return 3;
}

export function HomeScreen() {
  const [hour, setHour] = useState(8);
  useEffect(() => setHour(new Date().getHours()), []);
  const current = periodIndex(hour);
  const showFeedback = hour >= 18 || hour < 3;

  return (
    <main className="appShell withNav">
      <header className="pageHeader homeHeader">
        <h1>{greeting(hour)}</h1>
      </header>

      <section className="periodBar" aria-label="今日时段">
        {periods.map((item, index) => (
          <div key={item.label} className={index === current ? "period active" : "period"}>
            <strong>{item.label}</strong>
            <span>{item.range}</span>
          </div>
        ))}
      </section>

      <section className="sectionBlock">
        <div className="sectionHeading">
          <h2>接下来怎么吃</h2>
        </div>

        <article className="mealCard">
          <div className="mealTopline"><strong>早餐</strong><span>建议 7:00–9:30</span></div>
          <div className="mealBody">
            <div><h3>燕麦 + 鸡蛋 + 牛奶 + 水果</h3><p>约 10 分钟</p></div>
            <button className="secondaryButton">换一换</button>
          </div>
        </article>

        <article className="mealCard">
          <div className="mealTopline"><strong>午餐</strong><span>公司食堂 · 11:30–13:30</span></div>
          <div className="mealBody">
            <div><h3>1 份蛋白质 + 2 份蔬菜 + 适量主食</h3><p>少油汁，主食正常吃</p></div>
            <Link className="textButton" href="/week">看详情</Link>
          </div>
        </article>

        <article className="previewRow">
          <div><strong>晚餐预览</strong><span>下班后</span></div>
          <p>番茄鸡蛋面（快手版） · 约 15 分钟</p>
        </article>
      </section>

      {showFeedback && (
        <section className="feedbackBlock">
          <div className="sectionHeading compact"><div><h2>今天吃得怎么样？</h2><p>约 30 秒</p></div></div>
          <div className="feedbackOptions">
            <button>按计划吃了</button><button>有些变化</button><button>今天没按计划</button>
          </div>
          <Link href="/week" className="textButton">补充原因</Link>
        </section>
      )}

      <BottomNav />
    </main>
  );
}
