"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { BottomNav } from "@/components/bottom-nav";
import type { FoodAvailability, FoodEnvironmentItem, FoodEnvironmentKind } from "@/types";
import { getLocalWeekStartKey } from "@/lib/local-calendar";
import { generateWeekPlan } from "@/lib/meal-planner";
import { deriveShoppingList, mergeShoppingListPreservingPurchased } from "@/lib/shopping-list";
import { loadFoodEnvironment, loadProfile, loadShoppingList, saveFoodEnvironment, saveShoppingList, saveWeeklyPlan } from "@/lib/storage";

const units = ["个", "根", "片", "杯", "盒", "袋", "瓶", "g", "kg", "斤", "份"];
const scenes = ["公司食堂", "外卖", "外食", "便利店"];
const availabilityOptions: FoodAvailability[] = ["稳定能买到", "通常能买到", "不太稳定"];

type Draft = {
  kind: FoodEnvironmentKind;
  name: string;
  scene: string;
  quantity: string;
  unit: string;
  price: string;
  place: string;
  availability: FoodAvailability;
};

const initialDraft: Draft = { kind: "ingredient", name: "", scene: "外卖", quantity: "1", unit: "个", price: "", place: "", availability: "通常能买到" };

export default function FoodEnvironmentPage() {
  const [items, setItems] = useState<FoodEnvironmentItem[]>([]);
  const [draft, setDraft] = useState<Draft>(initialDraft);
  const [message, setMessage] = useState("");

  useEffect(() => setItems(loadFoodEnvironment()), []);

  function addItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const quantity = Number(draft.quantity);
    const price = Number(draft.price);
    if (!draft.name.trim() || !Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(price) || price < 0) return;
    const item: FoodEnvironmentItem = {
      id: `reality-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      kind: draft.kind,
      name: draft.name.trim(),
      ...(draft.kind === "prepared-meal" ? { scene: draft.scene } : {}),
      quantity: draft.kind === "prepared-meal" ? 1 : quantity,
      unit: draft.kind === "prepared-meal" ? "份" : draft.unit,
      price,
      ...(draft.place.trim() ? { place: draft.place.trim() } : {}),
      availability: draft.availability,
    };
    const next = [...items, item];
    setItems(next);
    saveFoodEnvironment(next);
    setDraft((current) => ({ ...initialDraft, kind: current.kind, scene: current.scene }));
    setMessage("已保存。重新生成本周方案后会优先使用这些真实价格。");
  }

  function removeItem(id: string) {
    const next = items.filter((item) => item.id !== id);
    setItems(next);
    saveFoodEnvironment(next);
  }

  function regenerate() {
    const profile = loadProfile();
    if (!profile) { setMessage("还没有个人资料，请先完成建档。"); return; }
    const weekStart = getLocalWeekStartKey();
    const plan = generateWeekPlan(profile, weekStart, undefined, items);
    const shopping = mergeShoppingListPreservingPurchased(loadShoppingList(weekStart), deriveShoppingList(plan));
    saveWeeklyPlan(plan);
    saveShoppingList(weekStart, shopping);
    setMessage(plan.containsReferenceEstimates ? "已更新本周方案；仍有部分餐食没有你的真实价格，会继续标记为参考估价。" : "已更新本周方案；本周餐费已使用你录入的真实价格。" );
  }

  return (
    <main className="appShell withNav">
      <header className="pageHeader centered"><p className="homeKicker">现实饮食环境</p><h1>我的食材和常见价格</h1><p>这里记录的是你长期能买到什么、实际多少钱，不是冰箱库存。</p></header>

      <section className="feedbackPrompt">
        <h2>添加一条真实数据</h2>
        <form className="formStack" onSubmit={addItem}>
          <label>类型<select value={draft.kind} onChange={(event) => setDraft({ ...draft, kind: event.currentTarget.value as FoodEnvironmentKind })}><option value="ingredient">常买食材 / 便利店成品</option><option value="prepared-meal">外食 / 食堂 / 外卖餐食</option></select></label>
          <label>名称<input required value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.currentTarget.value })} placeholder={draft.kind === "ingredient" ? "例如：鸡蛋、无糖酸奶" : "例如：楼下牛肉粉、公司食堂一荤一素"} /></label>
          {draft.kind === "ingredient" ? <div className="formActions"><label>一次买多少<input type="number" min="0.01" step="0.01" value={draft.quantity} onChange={(event) => setDraft({ ...draft, quantity: event.currentTarget.value })} /></label><label>单位<select value={draft.unit} onChange={(event) => setDraft({ ...draft, unit: event.currentTarget.value })}>{units.map((unit) => <option key={unit}>{unit}</option>)}</select></label></div> : <label>场景<select value={draft.scene} onChange={(event) => setDraft({ ...draft, scene: event.currentTarget.value })}>{scenes.map((scene) => <option key={scene}>{scene}</option>)}</select></label>}
          <label>{draft.kind === "prepared-meal" ? "每份实际价格（元）" : "这次购买价格（元）"}<input required type="number" min="0" step="0.01" value={draft.price} onChange={(event) => setDraft({ ...draft, price: event.currentTarget.value })} /></label>
          <label>常买地点（可选）<input value={draft.place} onChange={(event) => setDraft({ ...draft, place: event.currentTarget.value })} placeholder="例如：楼下超市、公司食堂" /></label>
          <label>可得性<select value={draft.availability} onChange={(event) => setDraft({ ...draft, availability: event.currentTarget.value as FoodAvailability })}>{availabilityOptions.map((option) => <option key={option}>{option}</option>)}</select></label>
          <button className="primaryButton" type="submit">保存这条数据</button>
        </form>
      </section>

      <section className="sectionBlock">
        <div className="sectionHeading compact"><div><h2>已记录</h2><p>{items.length} 条</p></div></div>
        {items.length === 0 && <p className="emptyState">还没有真实价格。现在的预算只能使用参考估价。</p>}
        <div className="mealList">{items.map((item) => <article className="mealCard compactCard" key={item.id}><div className="mealTopline"><strong>{item.kind === "ingredient" ? "常买食物" : item.scene}</strong><span>{item.availability}</span></div><h3>{item.name}</h3><p>{item.kind === "ingredient" ? `${item.quantity} ${item.unit} · ¥${item.price}` : `1 份 · ¥${item.price}`}{item.place ? ` · ${item.place}` : ""}</p><button type="button" className="textButton" onClick={() => removeItem(item.id)}>删除</button></article>)}</div>
      </section>

      <section className="feedbackPrompt"><h2>让本周方案使用这些价格</h2><p>保存数据不会偷偷改你的方案。确认后再重新计算本周预算与采购清单。</p>{message && <p className="fieldHint">{message}</p>}<button className="primaryButton" type="button" onClick={regenerate}>按最新价格更新本周方案</button><Link href="/week" className="secondaryButton">回到本周方案</Link></section>
      <BottomNav />
    </main>
  );
}
