const revealItems = document.querySelectorAll(".reveal");
const projectTabs = document.querySelectorAll(".work-item");
const languageToggle = document.querySelector("[data-language-toggle]");
const translatableItems = document.querySelectorAll("[data-i18n]");
const projectType = document.querySelector("[data-project-type]");
const projectTitle = document.querySelector("[data-project-title]");
const projectSummary = document.querySelector("[data-project-summary]");
const projectChallenge = document.querySelector("[data-project-challenge]");
const projectOutcome = document.querySelector("[data-project-outcome]");
const projectVisual = document.querySelector("[data-project-visual]");
const boardLabelA = document.querySelector("[data-board-label-a]");
const boardTitleA = document.querySelector("[data-board-title-a]");
const boardLabelB = document.querySelector("[data-board-label-b]");
const boardTitleB = document.querySelector("[data-board-title-b]");

const copy = {
  zh: {
    "nav.work": "作品",
    "nav.approach": "方法",
    "nav.about": "关于",
    "nav.contact": "联系",
    "hero.role": "产品设计师 / Product Designer",
    "hero.titleA": "把复杂业务",
    "hero.titleB": "设计得清晰、可信、好用。",
    "hero.lede":
      "我关注企业级系统、全球化产品和桌面端工作流，擅长把模糊需求整理成可落地的产品体验。",
    "hero.viewWork": "查看作品",
    "hero.resume": "打开简历 PDF",
    "signals.ia.title": "信息架构",
    "signals.ia.body": "让复杂页面有明确层级",
    "signals.system.title": "设计系统",
    "signals.system.body": "沉淀可复用的产品模式",
    "signals.global.title": "全球化体验",
    "signals.global.body": "兼顾多语言和跨区域使用",
    "work.kicker": "精选项目",
    "work.note": "适合放 2-3 个完整案例，后续可替换成真实项目截图与链接。",
    "work.challenge": "挑战",
    "work.outcome": "结果",
    "projects.0.name": "企业决策看板",
    "projects.0.meta": "B 端工作流",
    "projects.1.name": "智能化新手引导",
    "projects.1.meta": "移动端体验",
    "projects.2.name": "多角色服务平台",
    "projects.2.meta": "服务设计",
    "approach.kicker": "设计方法",
    "approach.note": "招聘方和客户通常想快速看到你的思考方式。",
    "approach.0.title": "先定义问题边界",
    "approach.0.body": "梳理角色、场景、业务限制和成功标准，避免一开始就陷入界面细节。",
    "approach.1.title": "用结构降低复杂度",
    "approach.1.body": "通过信息架构、任务流和组件模式，让高密度系统仍然可理解。",
    "approach.2.title": "验证真实使用",
    "approach.2.body": "用原型、走查和反馈闭环检查设计是否真的帮助用户完成工作。",
    "about.kicker": "关于我",
    "about.note": "简洁介绍，后续可继续补充经历、奖项或真实案例。",
    "about.bodyA":
      "我是一名关注产品逻辑与体验质量的设计师，长期围绕 B 端产品、国际化体验、可复用设计模式和 0 到 1 项目展开工作。",
    "about.bodyB":
      "我希望作品集给人的第一印象是：清楚、有判断力、能把复杂问题讲明白，也能把设计推进到真实落地。",
    "contact.kicker": "联系",
    "contact.title": "欢迎聊聊设计机会、项目合作或作品集反馈。",
  },
  en: {
    "nav.work": "Work",
    "nav.approach": "Approach",
    "nav.about": "About",
    "nav.contact": "Contact",
    "hero.role": "Product Designer / UX Designer",
    "hero.titleA": "Designing complex work",
    "hero.titleB": "into clear, trusted experiences.",
    "hero.lede":
      "I focus on enterprise systems, global products, and desktop workflows, turning ambiguous requirements into usable product experiences.",
    "hero.viewWork": "View work",
    "hero.resume": "Open resume PDF",
    "signals.ia.title": "Information Architecture",
    "signals.ia.body": "Clear hierarchy for complex screens",
    "signals.system.title": "Design Systems",
    "signals.system.body": "Reusable patterns for product teams",
    "signals.global.title": "Global Experience",
    "signals.global.body": "Thoughtful multi-language workflows",
    "work.kicker": "Selected work",
    "work.note": "A focused space for 2-3 case studies, ready for real screenshots and links.",
    "work.challenge": "Challenge",
    "work.outcome": "Outcome",
    "projects.0.name": "Decision dashboard",
    "projects.0.meta": "B2B workflow",
    "projects.1.name": "Adaptive onboarding",
    "projects.1.meta": "Mobile experience",
    "projects.2.name": "Multi-role service platform",
    "projects.2.meta": "Service design",
    "approach.kicker": "Approach",
    "approach.note": "Recruiters and clients need to understand how you think, fast.",
    "approach.0.title": "Frame the problem first",
    "approach.0.body": "Clarify roles, scenarios, constraints, and success criteria before jumping into interface details.",
    "approach.1.title": "Use structure to reduce complexity",
    "approach.1.body": "Shape information architecture, task flows, and patterns so dense systems stay understandable.",
    "approach.2.title": "Validate real use",
    "approach.2.body": "Use prototypes, walkthroughs, and feedback loops to test whether design helps people get work done.",
    "about.kicker": "About",
    "about.note": "A concise introduction. Experience, awards, and real case studies can be added next.",
    "about.bodyA":
      "I am a designer focused on product logic and experience quality, with work across B2B products, internationalization, reusable patterns, and 0 to 1 projects.",
    "about.bodyB":
      "I want this portfolio to feel clear, thoughtful, and grounded: able to explain complex problems and move design toward real delivery.",
    "contact.kicker": "Contact",
    "contact.title": "Open to design roles, project collaboration, and portfolio conversations.",
  },
};

const projects = {
  zh: [
    {
      type: "B2B SaaS / Enterprise Workflow",
      title: "把分散的数据看板重构成决策系统",
      summary: "从指标堆叠转向任务导向的信息结构，帮助团队更快发现问题、判断优先级并采取行动。",
      challenge: "信息很多，但用户很难判断下一步该做什么。",
      outcome: "建立从监控、诊断到行动的清晰操作路径。",
      board: ["决策流程", "从信号到行动", "设计重点", "降低认知负担"],
    },
    {
      type: "Consumer Product / Mobile Experience",
      title: "让新手引导更像理解用户，而不是打断用户",
      summary: "重新组织首次使用路径，在效率、信任感和个性化之间取得平衡。",
      challenge: "用户需要快速进入产品价值，但又不能被密集说明压垮。",
      outcome: "形成更轻、更有反馈感的启动体验。",
      board: ["引导节奏", "少一步阻力", "设计重点", "建立使用信心"],
    },
    {
      type: "Service Platform / Multi-role Product",
      title: "为多角色服务平台建立一致的体验语言",
      summary: "梳理不同角色的目标、权限和操作路径，让同一套系统对不同团队都更清楚。",
      challenge: "不同团队使用同一平台，但关注点和操作优先级不同。",
      outcome: "沉淀跨角色的交互模型和可复用界面模式。",
      board: ["服务蓝图", "多角色协作", "设计重点", "统一体验逻辑"],
    },
  ],
  en: [
    {
      type: "B2B SaaS / Enterprise Workflow",
      title: "Redesigning a fragmented dashboard into a decision system",
      summary:
        "Shifted a metrics-heavy workspace into a task-led structure so teams could spot issues, judge priority, and act faster.",
      challenge: "The interface had plenty of information, but little decision clarity.",
      outcome: "Built a clearer path from monitoring, to diagnosis, to action.",
      board: ["Decision flow", "Signal to action", "Design focus", "Reduce cognitive load"],
    },
    {
      type: "Consumer Product / Mobile Experience",
      title: "Making onboarding feel intelligent instead of instructional",
      summary: "Reworked the first-use journey to balance speed, reassurance, and personalization.",
      challenge: "Users needed momentum without being overwhelmed by setup instructions.",
      outcome: "Created a lighter entry experience with clearer feedback and stronger trust.",
      board: ["Entry rhythm", "Less friction", "Design focus", "Build user confidence"],
    },
    {
      type: "Service Platform / Multi-role Product",
      title: "Creating one experience language for a multi-role service platform",
      summary:
        "Mapped roles, permissions, and workflows so the same system could feel clear to different teams.",
      challenge: "Several teams used one platform, but each had different priorities and tasks.",
      outcome: "Defined a shared interaction model and reusable interface patterns across roles.",
      board: ["Service blueprint", "Cross-role work", "Design focus", "Unify experience logic"],
    },
  ],
};

let currentLanguage = "zh";
let activeProject = 0;

function renderProject(index) {
  const project = projects[currentLanguage][index];
  if (!project) return;

  activeProject = index;
  projectType.textContent = project.type;
  projectTitle.textContent = project.title;
  projectSummary.textContent = project.summary;
  projectChallenge.textContent = project.challenge;
  projectOutcome.textContent = project.outcome;
  projectVisual.dataset.projectVisual = String(index);
  boardLabelA.textContent = project.board[0];
  boardTitleA.textContent = project.board[1];
  boardLabelB.textContent = project.board[2];
  boardTitleB.textContent = project.board[3];

  projectTabs.forEach((tab, tabIndex) => {
    const isActive = tabIndex === index;
    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  });
}

function renderLanguage(language) {
  currentLanguage = language;
  document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
  languageToggle.textContent = language === "zh" ? "EN" : "中";

  translatableItems.forEach((item) => {
    const key = item.dataset.i18n;
    item.textContent = copy[language][key];
  });

  renderProject(activeProject);
}

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

projectTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    renderProject(Number(tab.dataset.project));
  });
});

languageToggle.addEventListener("click", () => {
  renderLanguage(currentLanguage === "zh" ? "en" : "zh");
});

renderLanguage("zh");
