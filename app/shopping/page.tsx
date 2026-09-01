"use client";

import { useMemo, useState } from "react";
import { BottomNav } from "@/components/bottom-nav";
import { shoppingItems as seed } from "@/lib/mock-data";

export default function ShoppingPage() {
  const [items, setItems] = useState(seed);
  const remaining = useMemo(() => items.filter((item) => !item.purchased).length, [items]);
  const categories = [...new Set(items.map((item) => item.category))];

  function toggle(id: string) {
    setItems((current) => current.map((item) => item.id === id ? { ...item, purchased: !item.purchased } : item));
  }

  return (
    <main className="appShell withNav">
      <header className="pageHeader centered"><h1>本周采购清单</h1><p>还有 {remaining} 项没买</p></header>
      {categories.map((category) => (
        <section className="shoppingGroup" key={category}>
          <h2>{category}</h2>
          {items.filter((item) => item.category === category).map((item) => (
            <label className={item.purchased ? "shoppingRow purchased" : "shoppingRow"} key={item.id}>
              <input type="checkbox" checked={item.purchased} onChange={() => toggle(item.id)} />
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
