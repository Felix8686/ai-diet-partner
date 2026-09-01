"use client";

import { useMemo, useState } from "react";
import { BottomNav } from "@/components/bottom-nav";
import { shoppingItems as seed } from "@/lib/mock-data";

type ShoppingStatus = "pending" | "purchased";

export default function ShoppingPage() {
  const [items, setItems] = useState(seed);
  const [status, setStatus] = useState<ShoppingStatus>("pending");
  const counts = useMemo(() => ({
    pending: items.filter((item) => !item.purchased).length,
    purchased: items.filter((item) => item.purchased).length,
  }), [items]);
  const visibleItems = useMemo(() => items.filter((item) => status === "pending" ? !item.purchased : item.purchased), [items, status]);
  const categories = [...new Set(visibleItems.map((item) => item.category))];

  function toggle(id: string) {
    setItems((current) => current.map((item) => item.id === id ? { ...item, purchased: !item.purchased } : item));
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
