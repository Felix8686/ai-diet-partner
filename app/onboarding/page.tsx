"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const titles = ["身体与方向", "我的日常生活", "我平时怎么吃"];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const router = useRouter();

  function submit(event: FormEvent) {
    event.preventDefault();
    if (step < 2) setStep(step + 1);
    else router.push("/week");
  }

  return (
    <main className="appShell onboardingShell">
      <header className="pageHeader centered"><h1>先了解一下你的日常</h1></header>
      <div className="stepper" aria-label={`第 ${step + 1} 步，共 3 步`}>
        {[0, 1, 2].map((item) => <span key={item} className={item <= step ? "step active" : "step"} />)}
      </div>
      <div className="onboardingTitle"><p>{step + 1}/3</p><h2>{titles[step]}</h2><span>这些信息以后都可以修改。</span></div>

      <form onSubmit={submit} className="formStack">
        {step === 0 && <>
          <label>年龄<input type="number" placeholder="32" /></label>
          <label>性别<select defaultValue=""><option value="" disabled>请选择</option><option>男</option><option>女</option><option>不便透露</option></select></label>
          <label>身高（cm）<input type="number" placeholder="175" /></label>
          <label>体重（kg）<input type="number" step="0.1" placeholder="72.0" /></label>
          <fieldset><legend>你现在主要想做什么？</legend><div className="choiceGrid"><label><input type="radio" name="goal" defaultChecked />减脂</label><label><input type="radio" name="goal" />保持</label><label><input type="radio" name="goal" />改善健康</label></div></fieldset>
        </>}
        {step === 1 && <>
          <label>每周大约愿意花多少餐费？<input type="number" placeholder="例如 350" /></label>
          <label>工作日一顿饭最多愿意做多久？<select defaultValue="15–30 分钟"><option>10 分钟以内</option><option>15–30 分钟</option><option>30–60 分钟</option></select></label>
          <label>工作日午餐通常在哪里吃？<select defaultValue="公司食堂"><option>公司食堂</option><option>外卖</option><option>便利店</option><option>自己带饭</option><option>不固定</option></select></label>
          <label>每周大约有几顿外食？<input type="number" placeholder="5" /></label>
        </>}
        {step === 2 && <>
          <label>常吃或喜欢的食物<textarea placeholder="例如：米饭、面条、鸡蛋、鱼、豆腐" /></label>
          <label>不喜欢 / 不能吃的食物<textarea placeholder="没有可以留空" /></label>
          <fieldset><legend>家里方便使用的做饭方式</legend><div className="choiceGrid"><label><input type="checkbox" defaultChecked />炒</label><label><input type="checkbox" defaultChecked />煮</label><label><input type="checkbox" />蒸</label><label><input type="checkbox" defaultChecked />微波</label><label><input type="checkbox" />空气炸锅</label><label><input type="checkbox" />烤箱</label></div></fieldset>
          <label>你平时最常在哪里买菜？<input placeholder="例如：楼下超市、永辉、菜市场" /></label>
        </>}

        <div className="formActions">
          {step > 0 && <button type="button" className="secondaryButton" onClick={() => setStep(step - 1)}>上一步</button>}
          <button className="primaryButton" type="submit">{step === 2 ? "生成我的第一周方案" : "下一步"}</button>
        </div>
      </form>
    </main>
  );
}
