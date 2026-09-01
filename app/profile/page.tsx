import Link from "next/link";
import { BottomNav } from "@/components/bottom-nav";

export default function ProfilePage() {
  return (
    <main className="appShell withNav">
      <header className="pageHeader"><h1>我的</h1></header>
      <section className="settingsList">
        <Link href="/onboarding"><strong>个人资料与生活条件</strong><span>修改 ›</span></Link>
        <button><strong>我的食材</strong><span>即将接入小票识别 ›</span></button>
        <button><strong>饮食偏好</strong><span>查看 ›</span></button>
      </section>
      <BottomNav />
    </main>
  );
}
