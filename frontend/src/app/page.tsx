import AppShell from "@/components/layout/AppShell";
import {
  fundRoutes,
  heroSignals,
  lifecycle,
  missionJourney,
  missionRules,
  roles,
} from "@/lib/landing-data";
import {
  FundRouteCard,
  HeroSignalCard,
  LifecycleCard,
  MissionJourneyCard,
  MissionRuleCard,
  RoleCard,
} from "@/components/landing/LandingCards";

// ─── Sections ─────────────────────────────────────────────────────────────────

const SECTION_BASE = "relative z-10 mx-auto max-w-7xl px-6 lg:px-12";

function HeroSection() {
  return (
    <section className={`${SECTION_BASE} relative flex flex-col items-center pb-20 pt-40 text-center`}>
      <div className="glass-card mb-8 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-widest text-emerald-300 animate-fade-in-up">
        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-glow" />
        Transparent Relief Coordination
      </div>

      <h1 className="z-10 mb-8 text-5xl font-bold tracking-tight animate-fade-in-up delay-100 md:text-7xl lg:text-8xl">
        A Clearer Way to <br className="hidden md:block" />
        <span className="text-gradient">Coordinate Aid</span>
      </h1>

      <p className="mb-12 max-w-2xl text-lg leading-relaxed text-slate-400 animate-fade-in-up delay-200 md:text-xl">
        This DApp helps donors understand where money is going, agencies compete
        transparently, and gives the arbiter a defined dispute path when delivery is
        challenged.
      </p>

      <div className="mb-24 flex flex-col gap-4 animate-fade-in-up delay-300 sm:flex-row">
        <a href="#roles" className="primary-button">Explore Role Views</a>
        <a href="#funds" className="glass-button">See How Funds Move</a>
      </div>

      <div className="grid w-full grid-cols-1 gap-6 animate-fade-in-up delay-400 md:grid-cols-3">
        {heroSignals.map((signal, index) => (
          <HeroSignalCard key={signal.value} signal={signal} index={index} />
        ))}
      </div>
    </section>
  );
}

function MissionJourneySection() {
  return (
    <section className={`${SECTION_BASE} py-16`}>
      <div className="glass-panel relative overflow-hidden rounded-4xl p-8 animate-fade-in-up md:p-12">
        <div className="pointer-events-none absolute right-0 top-0 h-96 w-96 rounded-full bg-teal-500/10 blur-[100px]" />

        <div className="relative z-10 flex flex-col items-start justify-between gap-12 lg:flex-row">
          <div className="lg:w-1/3">
            <span className="mb-4 block text-xs font-bold uppercase tracking-widest text-emerald-400">
              How one mission moves
            </span>
            <h2 className="mb-6 text-3xl font-bold md:text-4xl">
              One glance, <br />
              one lifecycle.
            </h2>
            {missionRules.map((rule) => (
              <MissionRuleCard key={rule.title} rule={rule} />
            ))}
          </div>

          <div className="w-full space-y-4 lg:w-2/3">
            {missionJourney.map((item, index) => (
              <MissionJourneyCard key={item.title} item={item} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function RolesSection() {
  return (
    <section id="roles" className={`${SECTION_BASE} py-24`}>
      <div className="mx-auto mb-16 max-w-3xl animate-fade-in-up text-center">
        <span className="mb-4 block text-xs font-bold uppercase tracking-widest text-emerald-400">
          Who it serves
        </span>
        <h2 className="mb-6 text-4xl font-bold md:text-5xl">
          Three dashboards, one shared mission record.
        </h2>
        <p className="text-lg text-slate-400">
          Every role gets a simpler working surface with only the actions that matter at
          that stage of the mission lifecycle.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {roles.map((role, index) => (
          <RoleCard key={role.label} role={role} index={index} />
        ))}
      </div>
    </section>
  );
}

function FlowSection() {
  return (
    <section id="flow" className={`${SECTION_BASE} py-24`}>
      <div className="mb-16 max-w-3xl animate-fade-in-up">
        <span className="mb-4 block text-xs font-bold uppercase tracking-widest text-teal-400">
          Mission flow
        </span>
        <h2 className="mb-6 text-4xl font-bold md:text-5xl">
          The product explains the workflow step by step.
        </h2>
        <p className="text-lg text-slate-400">
          A mission should feel understandable at first glance, even for someone seeing
          escrow logic for the first time.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {lifecycle.map((item, index) => (
          <LifecycleCard key={item.step} item={item} index={index} />
        ))}
      </div>
    </section>
  );
}

function FundsSection() {
  return (
    <section id="funds" className={`${SECTION_BASE} py-24`}>
      <div className="mx-auto mb-16 max-w-3xl animate-fade-in-up text-center">
        <span className="mb-4 block text-xs font-bold uppercase tracking-widest text-cyan-400">
          Where the money goes
        </span>
        <h2 className="mb-6 text-4xl font-bold md:text-5xl">
          Two clear routes explain every financial outcome.
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {fundRoutes.map((route, index) => (
          <FundRouteCard key={route.label} route={route} index={index} />
        ))}
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <AppShell currentPath="/">
      <HeroSection />
      <MissionJourneySection />
      <RolesSection />
      <FlowSection />
      <FundsSection />
    </AppShell>
  );
}
