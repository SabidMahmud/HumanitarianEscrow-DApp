import type { Metadata } from "next";
import AppShell from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "Donor Dashboard | Humanitarian Escrow",
  description: "Manage missions, review bids, and approve fund releases.",
};

const mockActiveMissions = [
  {
    id: "M-1042",
    title: "Emergency Medical Supplies",
    region: "Sudan, Khartoum",
    budget: "50,000 USDC",
    status: "Pending Bids",
    bidsCount: 3,
    createdAt: "2 hrs ago",
  },
  {
    id: "M-1038",
    title: "Clean Water Infrastructure",
    region: "Yemen, Sana'a",
    budget: "120,000 USDC",
    status: "Funded (In Transit)",
    bidsCount: 5,
    agency: "Oxfam International",
    createdAt: "3 days ago",
  },
];

const mockBids = [
  {
    agency: "Doctors Without Borders",
    reputation: 98,
    bidAmount: "45,000 USDC",
    timeline: "14 days",
    status: "Under Review",
  },
  {
    agency: "Red Cross Emergency",
    reputation: 92,
    bidAmount: "48,500 USDC",
    timeline: "10 days",
    status: "Under Review",
  },
  {
    agency: "Local Relief Coalition",
    reputation: 75,
    bidAmount: "42,000 USDC",
    timeline: "21 days",
    status: "Under Review",
  },
];

const mockAwaitingApproval = [
  {
    id: "M-1025",
    title: "Winter Shelter Tents",
    region: "Syria, Idlib",
    agency: "UNHCR Partners",
    escrowAmount: "85,000 USDC",
    deliveredAt: "4 hrs ago",
  },
];

export default function DonorsPage() {
  return (
    <AppShell currentPath="/donors">
      <div className="mx-auto max-w-7xl px-6 py-32 lg:px-12">
        {/* Header & Primary Action */}
        <div className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end animate-fade-in-up">
          <div>
            <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-300 shadow-[0_0_10px_rgba(252,211,77,0.8)]" />
              Donor Workspace
            </span>
            <h1 className="font-(family-name:--font-fraunces) text-4xl font-semibold text-slate-50 md:text-5xl">
              Hello, Global Fund.
            </h1>
            <p className="mt-2 text-slate-400">
              Manage your active missions and pending escrow approvals.
            </p>
          </div>
          <button className="primary-button group">
            <svg
              className="mr-2 h-4 w-4 transition-transform group-hover:rotate-90"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Post New Mission
          </button>
        </div>

        {/* Deliveries Awaiting Approval (High Priority) */}
        {mockAwaitingApproval.length > 0 && (
          <section className="mb-16 animate-fade-in-up delay-100">
            <h2 className="mb-6 text-xl font-semibold text-slate-100 flex items-center gap-3">
              Action Required: Approve Delivery
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-xs text-emerald-300">
                {mockAwaitingApproval.length}
              </span>
            </h2>
            <div className="grid gap-6">
              {mockAwaitingApproval.map((mission) => (
                <div key={mission.id} className="glass-panel rounded-3xl p-6 border-l-4 border-emerald-500">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                      <div className="flex gap-3 mb-2">
                        <span className="font-mono text-sm text-slate-400 border border-white/10 bg-white/5 px-2 py-0.5 rounded">
                          {mission.id}
                        </span>
                        <span className="text-sm text-emerald-400">Delivered {mission.deliveredAt}</span>
                      </div>
                      <h3 className="text-2xl font-semibold text-slate-100">{mission.title}</h3>
                      <p className="mt-1 text-slate-400 text-sm">
                        Region: <span className="text-slate-300">{mission.region}</span> • Agency: <span className="text-slate-300">{mission.agency}</span>
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-4 min-w-50">
                      <div className="text-right">
                        <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Escrow Amount</p>
                        <p className="text-2xl font-mono text-emerald-300 font-bold">{mission.escrowAmount}</p>
                      </div>
                      <div className="flex w-full gap-3">
                        <button className="flex-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 text-sm font-semibold text-slate-300 transition-colors">
                          Dispute
                        </button>
                        <button className="flex-1 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 px-4 py-2 text-sm font-semibold text-emerald-300 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                          Approve
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-12 animate-fade-in-up delay-200">
          {/* Active Missions Loop */}
          <section>
            <h2 className="mb-6 text-xl font-semibold text-slate-100">Your Active Missions</h2>
            <div className="space-y-4">
              {mockActiveMissions.map((mission) => (
                <div key={mission.id} className="glass-card rounded-[1.25rem] p-5 cursor-pointer hover:border-amber-400/30">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs text-slate-400">{mission.id}</span>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                      mission.status.includes('Pending') 
                        ? 'bg-amber-400/10 text-amber-300 border border-amber-400/20'
                        : 'bg-emerald-400/10 text-emerald-300 border border-emerald-400/20'
                    }`}>
                      {mission.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-200 mb-1">{mission.title}</h3>
                  <p className="text-sm text-slate-400 mb-4">{mission.region}</p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest">Max Budget</p>
                      <p className="font-mono text-sm text-slate-300">{mission.budget}</p>
                    </div>
                    <div className="text-right">
                      {mission.bidsCount > 0 ? (
                        <p className="text-sm font-medium text-amber-300">
                          {mission.bidsCount} Bids Received
                        </p>
                      ) : (
                        <p className="text-sm text-slate-500">Awaiting bids</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Bid Review Panel */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-100">Review Bids</h2>
              <span className="text-xs text-slate-400 font-mono">For M-1042</span>
            </div>
            
            <div className="glass-panel rounded-3xl p-6 lg:p-8">
              <div className="mb-6 pb-6 border-b border-white/5">
                <h3 className="text-lg font-semibold text-slate-200">Emergency Medical Supplies</h3>
                <p className="text-sm text-slate-400 mt-1">Select an agency to fund and deploy.</p>
              </div>

              <div className="space-y-4">
                {mockBids.map((bid, i) => (
                  <div key={bid.agency} className="rounded-xl bg-white/5 border border-white/10 p-4 hover:bg-white/10 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium text-slate-200">{bid.agency}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <div className={`h-1.5 w-1.5 rounded-full ${bid.reputation > 90 ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                          <span className="text-xs text-slate-400">Trust Score: {bid.reputation}/100</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="block font-mono font-bold text-slate-200">{bid.bidAmount}</span>
                        <span className="text-xs text-slate-500">Est. {bid.timeline}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                       <button className="flex-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-xs font-semibold text-emerald-300 py-2 transition-colors">
                        Accept & Fund
                      </button>
                      <button className="rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-400 px-4 py-2 transition-colors">
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
