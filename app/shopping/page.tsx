"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BottomNav } from "@/components/bottom-nav";
import type { ShoppingItem } from "@/types";
import { getLocalWeekStartKey } from "@/lib/local-calendar";
import { deriveShoppingList } from "@/lib/shopping-list";
import { loadShoppingList, loadWeeklyPlan, saveShoppingList } from "@/lib/storage";

type ShoppingStatus = "pending" | "purchased";

export default function ShoppingPage() {
  const [items, setItems] = useState<ShoppingItem[] | null>(null);
  const [hasPlan, setHasPlan] = useState<boolean | undefined>(undefined);
  const [status, setStatus] = useState<ShoppingStatus>("pending");
  useEffect(() => {
    const plan = loadWeeklyPlan(getLocalWeekStartKey());
    if (!plan) {
      setHasPlan(false);
      setItems([]);
      return;
    }
    const storedItems = loadShoppingList();
    const nextItems = storedItems.length > 0 ? storedItems : deriveShoppingList(plan);
    setHasPlan(true);
    setItems(nextItems);
    if (storedItems.length === 0) saveShoppingList(nextItems);
  }, []);
  useEffect(() => {
    if (items) saveShoppingList(items);
  }, [items]);

  const currentItems = items ?? [];
  const counts = useMemo(() => ({
    pending: currentItems.filter((item) => !item.purchased).length,
    purchased: currentItems.filter((item) => item.purchased).length,
  }), [currentItems]);
  const visibleItems = useMemo(() => currentItems.filter((item) => status === "pending" ? !item.purchased : item.purchased), [currentItems, status]);
  const categories = [...new Set(visibleItems.map((item) => item.category))];

  if (hasPlan === undefined || items === null) {
    return <main className="appShell withNav"><header className="pageHeader centered"><p className="homeKicker">正在准备</p><h1>读取采购清单</h1><p>马上就好。</p></header><BottomNav /></main>;
  }

  if (!hasPlan) {
    return (
      <main className="appShell withNav">
        <header className="pageHeader centered"><p className="homeKicker">还没有方案</p><h1>先生成本周饮食方案</h1><p>采购清单会根据本周方案里的主要食材自动整理。</p></header>
        <section className="feedbackPrompt"><h2>采购清单还没生成</h2><p>完成三步建档后，这里会显示本周需要准备的食材。</p><Link className="primaryButton" href="/onboarding">开始三步建档</Link></section>
        <BottomNav />
      </main>
    );
  }

  function toggle(id: string) {
    setItems((current) => current?.map((item) => item.id === id ? { ...item, purchased: !item.purchased } : item) ?? []);
  }

  return (
    <main className="appShell withNav">
      <header className="pageHeader centered"><p className="homeKicker">按状态查看</p><h1>本周采购清单</h1><p>买到后勾一下即可。</p></header>
      <div className="statusTabs" role="tablist" aria-label="采购状态">
        <button type="button" role="tab" aria-selected={status === "pending"} className={status === "pending" ? "statusTab active" : "statusTab"} onClick={() => setStatus("pending")}>
          未买 <strong>{counts.pending}</strong>
        </button>
        <button type="button" role="tab" aria-selected={status === "purchased"} className={status === "purchased" ? "statusTab active" : "statusTab"} onClick={() => setStatus("purchased")}>
          已买 <strong>{counts.purchased}</strong>
        </button>
      </div>
      {visibleItems.length === 0 && <p className="emptyState">这一栏暂时没有食材。</p>}
      {categories.map((category) => (
        <section className="shoppingGroup" key={category}>
          <h2>{category}</h2>
          {visibleItems.filter((item) => item.category === category).map((item) => (
            <label className={item.purchased ? "shoppingRow purchased" : "shoppingRow"} key={item.id}>
              <input type="checkbox" aria-label={`${item.name}，${item.purchased ? "已买" : "未买"}`} checked={item.purchased} onChange={() => toggle(item.id)} />
              <span className="shoppingName">{item.name}</span><span>{item.amount}</span>
              {item.price && <span>¥{item.price}</span>}
            </label>
          ))}
        </section>
      ))}
      <BottomNav />
    </main>
  );
}
