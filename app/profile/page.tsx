import Link from "next/link";
import { BottomNav } from "@/components/bottom-nav";

export default function ProfilePage() {
  return (
    <main className="appShell withNav">
      <header className="pageHeader"><h1>我的</h1></header>
      <section className="settingsList">
        <Link href="/onboarding"><strong>个人资料与生活条件</strong><span>修改 ›</span></Link>
        <Link href="/food-environment"><strong>我的食材与常见价格</strong><span>录入 / 修改 ›</span></Link>
        <Link href="/onboarding"><strong>饮食偏好</strong><span>修改 ›</span></Link>
      </section>
      <BottomNav />
    </main>
  );
}
