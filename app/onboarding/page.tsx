"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Goal, OnboardingProfile } from "@/types";

const titles = ["身体与目标", "现实生活条件", "平时怎么吃"];

const goalOptions: Goal[] = ["减脂", "增肌", "保持", "改善健康"];
const sceneOptions = ["公司食堂", "外卖", "便利店", "自己带饭", "在家吃"];
const kitchenOptions = ["炒", "煮", "蒸", "微波", "空气炸锅", "烤箱"];

const initialProfile: OnboardingProfile = {
  age: "",
  sex: "",
  heightCm: "",
  weightKg: "",
  goal: "减脂",
  weeklyFoodBudget: "",
  weekdayCookTime: "15–30 分钟",
  weekdayWeekendDifference: "工作日更忙，周末有时间",
  outsideMealRatio: "每周约 4–7 顿",
  mealScenes: ["公司食堂"],
  likedFoods: "",
  dislikedFoods: "",
  dietaryRestrictions: "",
  breakfastPattern: "大多数时候会吃",
  lateNightSnack: "偶尔",
  snackHabit: "偶尔",
  kitchenCapabilities: ["炒", "煮", "微波"],
  shoppingPlace: "",
};

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<OnboardingProfile>(initialProfile);
  const router = useRouter();

  function updateField<K extends keyof OnboardingProfile>(field: K, value: OnboardingProfile[K]) {
    setProfile((current) => ({ ...current, [field]: value }));
  }

  function toggleOption(field: "mealScenes" | "kitchenCapabilities", option: string) {
    setProfile((current) => {
      const values = current[field];
      const nextValues = values.includes(option) ? values.filter((value) => value !== option) : [...values, option];
      return { ...current, [field]: nextValues };
    });
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step < 2) {
      setStep((current) => current + 1);
      return;
    }

    window.localStorage.setItem("ai-diet-profile", JSON.stringify(profile));
    router.push("/week");
  }

  return (
    <main className="appShell onboardingShell">
      <header className="pageHeader centered">
        <p className="homeKicker">第一次使用</p>
        <h1>先了解一下你的日常</h1>
        <p>用 3 步告诉我，什么方案对你更现实。</p>
      </header>
      <div className="stepper" aria-label={`第 ${step + 1} 步，共 3 步`}>
        {[0, 1, 2].map((item) => (
          <span key={item} className={item <= step ? "step active" : "step"} />
        ))}
      </div>
      <div className="onboardingTitle">
        <p>{step + 1}/3</p>
        <h2>{titles[step]}</h2>
        <span className="formHint">这些信息以后都可以修改。</span>
      </div>

      <form onSubmit={submit} className="formStack">
        {step === 0 && (
          <>
            <label htmlFor="age">年龄<input id="age" type="number" min="16" max="100" inputMode="numeric" required value={profile.age} onChange={(event) => updateField("age", event.currentTarget.value)} placeholder="例如 32" /></label>
            <label htmlFor="sex">性别<select id="sex" required value={profile.sex} onChange={(event) => updateField("sex", event.currentTarget.value)}><option value="" disabled>请选择</option><option>男</option><option>女</option><option>不便透露</option></select></label>
            <label htmlFor="height">身高（cm）<input id="height" type="number" min="100" max="240" inputMode="decimal" required value={profile.heightCm} onChange={(event) => updateField("heightCm", event.currentTarget.value)} placeholder="例如 175" /></label>
            <label htmlFor="weight">体重（kg）<input id="weight" type="number" min="30" max="300" step="0.1" inputMode="decimal" required value={profile.weightKg} onChange={(event) => updateField("weightKg", event.currentTarget.value)} placeholder="例如 72" /></label>
            <fieldset>
              <legend>你现在主要想做什么？</legend>
              <div className="choiceGrid">
                {goalOptions.map((goal) => (
                  <label key={goal}><input aria-label={goal} type="radio" name="goal" value={goal} checked={profile.goal === goal} onChange={() => updateField("goal", goal)} />{goal}</label>
                ))}
              </div>
            </fieldset>
          </>
        )}
        {step === 1 && (
          <>
            <label htmlFor="budget">每周大约愿意花多少餐费？<input id="budget" type="number" min="0" inputMode="decimal" required value={profile.weeklyFoodBudget} onChange={(event) => updateField("weeklyFoodBudget", event.currentTarget.value)} placeholder="例如 350" /></label>
            <label htmlFor="cook-time">工作日一顿饭最多愿意做多久？<select id="cook-time" required value={profile.weekdayCookTime} onChange={(event) => updateField("weekdayCookTime", event.currentTarget.value)}><option>10 分钟以内</option><option>15–30 分钟</option><option>30–60 分钟</option><option>通常不做饭</option></select></label>
            <label htmlFor="weekend-difference">工作日和周末有什么不同？<select id="weekend-difference" value={profile.weekdayWeekendDifference} onChange={(event) => updateField("weekdayWeekendDifference", event.currentTarget.value)}><option>工作日更忙，周末有时间</option><option>每天时间差不多</option><option>周末反而更忙</option></select></label>
            <label htmlFor="outside-meal-ratio">平时外食比例？<select id="outside-meal-ratio" required value={profile.outsideMealRatio} onChange={(event) => updateField("outsideMealRatio", event.currentTarget.value)}><option>几乎都在家</option><option>每周约 1–3 顿</option><option>每周约 4–7 顿</option><option>大多数在外面吃</option></select></label>
            <fieldset>
              <legend>你常遇到哪些吃饭场景？</legend>
              <div className="choiceGrid">
                {sceneOptions.map((scene) => (
                  <label key={scene}><input aria-label={scene} type="checkbox" checked={profile.mealScenes.includes(scene)} onChange={() => toggleOption("mealScenes", scene)} />{scene}</label>
                ))}
              </div>
            </fieldset>
          </>
        )}
        {step === 2 && (
          <>
            <label htmlFor="liked-foods">常吃或喜欢的食物<textarea id="liked-foods" value={profile.likedFoods} onChange={(event) => updateField("likedFoods", event.currentTarget.value)} placeholder="例如：米饭、面条、鸡蛋、鱼、豆腐" /></label>
            <label htmlFor="disliked-foods">不喜欢的食物<textarea id="disliked-foods" value={profile.dislikedFoods} onChange={(event) => updateField("dislikedFoods", event.currentTarget.value)} placeholder="没有可以留空" /></label>
            <label htmlFor="restrictions">饮食禁忌<textarea id="restrictions" value={profile.dietaryRestrictions} onChange={(event) => updateField("dietaryRestrictions", event.currentTarget.value)} placeholder="例如：对花生过敏、素食；没有可以留空" /></label>
            <label htmlFor="breakfast-pattern">平时早餐怎么样？<select id="breakfast-pattern" value={profile.breakfastPattern} onChange={(event) => updateField("breakfastPattern", event.currentTarget.value)}><option>大多数时候会吃</option><option>有时来不及</option><option>通常不吃</option></select></label>
            <label htmlFor="late-night-snack">夜宵习惯？<select id="late-night-snack" value={profile.lateNightSnack} onChange={(event) => updateField("lateNightSnack", event.currentTarget.value)}><option>没有</option><option>偶尔</option><option>经常</option></select></label>
            <label htmlFor="snack-habit">零食习惯？<select id="snack-habit" value={profile.snackHabit} onChange={(event) => updateField("snackHabit", event.currentTarget.value)}><option>没有</option><option>偶尔</option><option>经常</option></select></label>
            <fieldset>
              <legend>家里方便使用的做饭方式</legend>
              <div className="choiceGrid">
                {kitchenOptions.map((option) => (
                  <label key={option}><input aria-label={option} type="checkbox" checked={profile.kitchenCapabilities.includes(option)} onChange={() => toggleOption("kitchenCapabilities", option)} />{option}</label>
                ))}
              </div>
            </fieldset>
            <label htmlFor="shopping-place">平时最常在哪里买菜？<input id="shopping-place" value={profile.shoppingPlace} onChange={(event) => updateField("shoppingPlace", event.currentTarget.value)} placeholder="例如：楼下超市、菜市场" /></label>
          </>
        )}

        <div className="formActions">
          {step > 0 && <button type="button" className="secondaryButton" onClick={() => setStep((current) => current - 1)}>上一步</button>}
          <button className="primaryButton" type="submit">{step === 2 ? "生成我的第一周方案" : "下一步"}</button>
        </div>
      </form>
    </main>
  );
}
