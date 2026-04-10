import type { Metadata } from "next";
import AppShell from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "Global Missions | Humanitarian Escrow",
  description: "View all missions and resolve delivery disputes.",
};

const mockAllMissions = [
  {
    id: "M-1045",
    title: "Cholera Response Kits",
    region: "Haiti, Port-au-Prince",
    budget: "75,000 USDC",
    status: "Pending Bids",
    date: "Today",
  },
  {
    id: "M-1042",
    title: "Emergency Medical Supplies",
    region: "Sudan, Khartoum",
    budget: "50,000 USDC",
    status: "Pending Bids",
    date: "Yesterday",
  },
  {
    id: "M-1038",
    title: "Clean Water Infrastructure",
    region: "Yemen, Sana'a",
    budget: "48,500 USDC",
    status: "In Transit",
    date: "3 days ago",
  },
  {
    id: "M-1025",
    title: "Winter Shelter Tents",
    region: "Syria, Idlib",
    budget: "85,000 USDC",
    status: "Awaiting Approval",
    date: "1 week ago",
  },
  {
    id: "M-0992",
    title: "Medical Evacuation Transport",
    region: "Lebanon, Beirut",
    budget: "210,000 USDC",
    status: "Disputed",
    date: "2 weeks ago",
  },
  {
    id: "M-0988",
    title: "Solar Generators",
    region: "Ukraine, Kyiv",
    budget: "115,000 USDC",
    status: "Completed",
    date: "1 month ago",
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "Pending Bids":
      return "text-amber-300 bg-amber-400/10 border-amber-400/20";
    case "In Transit":
      return "text-blue-300 bg-blue-400/10 border-blue-400/20";
    case "Awaiting Approval":
      return "text-emerald-300 bg-emerald-400/10 border-emerald-400/20";
    case "Disputed":
      return "text-rose-300 bg-rose-400/10 border-rose-400/20";
    case "Completed":
      return "text-slate-300 bg-white/5 border-white/10";
    default:
      return "text-slate-300 bg-white/5 border-white/10";
  }
};

export default function MissionsPage() {
  return (
    <AppShell currentPath="/missions">
      <div className="mx-auto max-w-7xl px-6 py-32 lg:px-12">
        {/* Header */}
        <div className="mb-12 animate-fade-in-up">
          <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-rose-400/20 bg-rose-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-rose-200">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-400 shadow-[0_0_10px_rgba(251,113,133,0.8)]" />
            Arbiter & Public Registry
          </span>
          <h1 className="font-(family-name:--font-fraunces) text-4xl font-semibold text-slate-50 md:text-5xl">
            Global Mission Ledger
          </h1>
          <p className="mt-2 text-slate-400 max-w-2xl">
            The immutable record of all escrow contracts. Arbiters resolve disputes here, while the public can audit funding flows.
          </p>
        </div>

        {/* Global Registry Table */}
        <section className="animate-fade-in-up delay-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-xl font-semibold text-slate-100">Global Registry</h2>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Search missions..." 
                className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50 min-w-50"
              />
              <button className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-4 py-2 text-sm text-slate-300 transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filter
              </button>
            </div>
          </div>

          <div className="glass-panel rounded-3xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/2">
                    <th className="px-6 py-4 font-semibold text-slate-400">Mission ID</th>
                    <th className="px-6 py-4 font-semibold text-slate-400">Title & Region</th>
                    <th className="px-6 py-4 font-semibold text-slate-400">Status</th>
                    <th className="px-6 py-4 font-semibold text-slate-400 text-right">Budget / Escrow</th>
                    <th className="px-6 py-4 font-semibold text-slate-400 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {mockAllMissions.map((mission) => (
                    <tr key={mission.id} className="hover:bg-white/2 transition-colors group cursor-pointer">
                      <td className="px-6 py-5 font-mono text-slate-500 group-hover:text-slate-300 transition-colors">
                        {mission.id}
                      </td>
                      <td className="px-6 py-5">
                        <p className="font-medium text-slate-200 mb-1">{mission.title}</p>
                        <p className="text-xs text-slate-500">{mission.region}</p>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border ${getStatusColor(mission.status)}`}>
                          {mission.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right font-mono text-slate-300">
                        {mission.budget}
                      </td>
                      <td className="px-6 py-5 text-right text-slate-500 text-xs">
                        {mission.date}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
