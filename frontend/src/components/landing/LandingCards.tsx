import type {
  FundRoute,
  HeroSignal,
  LifecycleStep,
  MissionJourneyItem,
  MissionRule,
  Role,
} from "@/lib/landing-data";

// ─── Utilities ────────────────────────────────────────────────────────────────

function joinClasses(...classes: Array<string | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

const ANIMATION_DELAYS = ["delay-100", "delay-200", "delay-300", "delay-400"] as const;

function getAnimationDelay(index: number): string {
  return ANIMATION_DELAYS[Math.min(index, ANIMATION_DELAYS.length - 1)];
}

// ─── Cards ────────────────────────────────────────────────────────────────────

export function HeroSignalCard({ signal, index }: { signal: HeroSignal; index: number }) {
  return (
    <div className="glass-card flex flex-col items-start rounded-2xl p-8 text-left group">
      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-emerald-500/20">
        <span className="font-bold text-emerald-400">0{index + 1}</span>
      </div>
      <h3 className="mb-3 text-2xl font-bold text-slate-100">{signal.value}</h3>
      <p className="text-sm leading-relaxed text-slate-400">{signal.copy}</p>
    </div>
  );
}

export function MissionJourneyCard({ item, index }: { item: MissionJourneyItem; index: number }) {
  return (
    <div className="glass-card flex items-start gap-6 rounded-2xl p-6 group">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 font-bold text-emerald-400 transition-all duration-300 group-hover:scale-110 group-hover:bg-emerald-500/10">
        {String(index + 1).padStart(2, "0")}
      </div>
      <div>
        <h3 className="mb-2 text-lg font-bold text-slate-200">{item.title}</h3>
        <p className="text-sm leading-relaxed text-slate-400">{item.copy}</p>
      </div>
    </div>
  );
}

export function MissionRuleCard({ rule }: { rule: MissionRule }) {
  return (
    <div className={joinClasses("glass-card rounded-2xl border-l-[3px] p-6", rule.accentClassName)}>
      <h4 className="mb-2 text-sm font-bold text-slate-200">{rule.title}</h4>
      <p className="text-xs text-slate-400">{rule.copy}</p>
    </div>
  );
}

export function RoleCard({ role, index }: { role: Role; index: number }) {
  return (
    <div
      className={joinClasses(
        "glass-card group relative overflow-hidden rounded-4xl p-8 animate-fade-in-up",
        getAnimationDelay(index),
      )}
    >
      <div className="absolute inset-0 bg-linear-to-b from-transparent to-white/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <div className="relative z-10 mb-8 flex items-center justify-between">
        <h3 className="text-xl font-bold text-slate-100">{role.label}</h3>
        <span className="whitespace-nowrap rounded-full border border-emerald-500/30 bg-emerald-500/20 px-3 py-1 text-[10px] font-bold text-emerald-300 md:text-xs">
          {role.badge}
        </span>
      </div>
      <p className="relative z-10 mb-4 text-lg font-medium leading-snug text-slate-200">
        {role.title}
      </p>
      <p className="relative z-10 mb-8 text-sm leading-relaxed text-slate-400">{role.copy}</p>
      <ul className="relative z-10 space-y-4">
        {role.points.map((point) => (
          <li key={point} className="flex items-start gap-3 text-sm text-slate-300">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            {point}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function LifecycleCard({ item, index }: { item: LifecycleStep; index: number }) {
  return (
    <div
      className={joinClasses(
        "glass-panel group relative rounded-3xl p-8 animate-fade-in-up",
        getAnimationDelay(index),
      )}
    >
      <div className="absolute left-0 top-0 h-1 w-full bg-linear-to-r from-emerald-400 to-transparent opacity-50 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="mb-6 font-mono text-4xl font-bold text-white/10 transition-colors duration-300 group-hover:text-emerald-500/20">
        {item.step}
      </div>
      <h3 className="mb-4 text-xl font-bold text-slate-200">{item.title}</h3>
      <p className="text-sm leading-relaxed text-slate-400">{item.copy}</p>
    </div>
  );
}

export function FundRouteCard({ route, index }: { route: FundRoute; index: number }) {
  return (
    <div
      className={joinClasses(
        "glass-card rounded-4xl p-8 md:p-10 animate-fade-in-up",
        getAnimationDelay(index),
      )}
    >
      <div className="mb-6 inline-block rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-cyan-400">
        {route.label}
      </div>
      <h3 className="mb-4 text-2xl font-bold text-slate-100">{route.title}</h3>
      <p className="mb-10 leading-relaxed text-slate-400">{route.copy}</p>
      <div className="space-y-4">
        {route.items.map((item, stepIndex) => (
          <div
            key={item}
            className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/5 p-4"
          >
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-cyan-500/30 bg-cyan-500/20 text-xs font-bold text-cyan-400">
              {stepIndex + 1}
            </div>
            <p className="text-sm font-medium text-slate-300">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
