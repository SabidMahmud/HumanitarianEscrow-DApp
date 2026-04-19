"use client";

import { useState, useEffect, useCallback } from "react";
import { BrowserProvider, Contract, parseEther } from "ethers";
import AppShell from "@/components/layout/AppShell";
import { useWeb3 } from "@/context/Web3Context";
import { useRouter } from "next/navigation";
import { CONTRACT_ADDRESS, HUMANITARIAN_ESCROW_ABI } from "@/config/contract";
import { MissionStatus } from "@/types/mission";
import type { MissionWithBids } from "@/hooks/useMissions";
import { CheckCircle2, XCircle, Loader2, Plus, RefreshCw } from "lucide-react";

import DonorStats from "@/components/donors/DonorStats";
import PostMissionModal from "@/components/donors/PostMissionModal";
import AwaitingApprovalSection from "@/components/donors/AwaitingApprovalSection";
import MissionList from "@/components/donors/MissionList";
import BidPanel from "@/components/donors/BidPanel";
import NoWallet from "@/components/ui/NoWallet";

export default function DonorDashboardPage() {
  const { address, role, isLoading: authLoading } = useWeb3();
  const router = useRouter();

  const [missions, setMissions] = useState<MissionWithBids[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [processingId, setProcessingId] = useState<number | "post" | null>(null);
  const [txError, setTxError] = useState<string | null>(null);
  const [txSuccess, setTxSuccess] = useState<string | null>(null);

  // ── Role guard ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!authLoading && role && role !== "DONOR") router.push("/connect");
  }, [authLoading, role, router]);

  // ── Data fetching ───────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    if (!CONTRACT_ADDRESS || !(window as any).ethereum || !address) return;
    setIsLoading(true);
    try {
      const provider = new BrowserProvider((window as any).ethereum);
      const contract = new Contract(CONTRACT_ADDRESS, HUMANITARIAN_ESCROW_ABI, provider);

      const count = Number(await contract.missionCount());
      if (count === 0) { setMissions([]); return; }

      const all = await Promise.all(
        Array.from({ length: count }, (_, i) =>
          contract.missions(i + 1).then(async (m: any) => {
            const status = Number(m.status) as MissionStatus;
            let bids: { agency: string; amount: bigint }[] = [];
            if (status === MissionStatus.Pending) {
              const raw = await contract.getMissionBids(Number(m.id));
              bids = raw.map((b: any) => ({ agency: b.agency as string, amount: b.amount as bigint }));
            }
            return {
              id: Number(m.id), category: m.category, maxBudget: m.maxBudget as bigint,
              region: m.region, status, donor: m.donor, selectedAgency: m.selectedAgency,
              lockedFunds: m.lockedFunds as bigint, bids,
            } satisfies MissionWithBids;
          })
        )
      );

      setMissions(all.filter((m) => m.donor.toLowerCase() === address.toLowerCase()));
    } catch (err) {
      console.error("Failed to fetch donor missions:", err);
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  useEffect(() => {
    if (!authLoading && role === "DONOR" && address) fetchData();
  }, [authLoading, role, address, fetchData]);

  // ── Transaction helper ───────────────────────────────────────────────────────
  async function execTx(id: number | "post", fn: (c: Contract) => Promise<any>, successMsg: string) {
    if (!CONTRACT_ADDRESS || !(window as any).ethereum) return;
    setProcessingId(id);
    setTxError(null);
    setTxSuccess(null);
    try {
      const signer = await new BrowserProvider((window as any).ethereum).getSigner();
      const contract = new Contract(CONTRACT_ADDRESS, HUMANITARIAN_ESCROW_ABI, signer);
      const tx = await fn(contract);
      await tx.wait();
      setTxSuccess(successMsg);
      await fetchData();
    } catch (err: any) {
      setTxError(err?.reason ?? err?.message ?? "Transaction failed.");
    } finally {
      setProcessingId(null);
    }
  }

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handlePostMission = (category: string, budget: string, region: string) =>
    execTx("post", (c) => c.postMission(category, parseEther(budget), region), "Mission posted!").then(() =>
      setIsModalOpen(false)
    );

  const handleFundMission = (missionId: number, agency: string, amount: bigint) =>
    execTx(missionId, (c) => c.fundMission(missionId, agency, { value: amount }), `Mission #${missionId} funded!`);

  const handleApprove = (missionId: number) =>
    execTx(missionId, (c) => c.approveDelivery(missionId), `Delivery approved for mission #${missionId}.`);

  const handleDispute = (missionId: number) =>
    execTx(missionId, (c) => c.disputeMission(missionId), `Dispute raised for mission #${missionId}.`);

  const handleSelect = (id: number) => setSelectedId((prev) => (prev === id ? null : id));

  // ── Derived ───────────────────────────────────────────────────────────────────
  const stats = {
    total: missions.length,
    pending: missions.filter((m) => m.status === MissionStatus.Pending).length,
    inTransit: missions.filter((m) => m.status === MissionStatus.InTransit).length,
    awaitingApproval: missions.filter((m) => m.status === MissionStatus.AwaitingApproval).length,
  };
  const selectedMission = missions.find((m) => m.id === selectedId) ?? null;

  // ── Render ────────────────────────────────────────────────────────────────────
  // MetaMask not installed
  if (typeof window !== "undefined" && !(window as any).ethereum) {
    return <AppShell><NoWallet notInstalled /></AppShell>;
  }

  // MetaMask installed but not connected
  if (!authLoading && !address) {
    return <AppShell><NoWallet /></AppShell>;
  }

  if (authLoading || (isLoading && missions.length === 0)) {
    return (
      <AppShell>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell currentPath="/donors/dashboard">
      <div className="mx-auto max-w-7xl px-6 py-32 lg:px-12">

        {/* Header */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 animate-fade-in-up">
          <div>
            <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-300 shadow-[0_0_10px_rgba(252,211,77,0.8)]" />
              Donor Workspace
            </span>
            <h1 className="font-fraunces text-4xl font-semibold text-slate-50 md:text-5xl">Donor Dashboard</h1>
            <p className="mt-2 text-slate-400 font-mono text-sm">
              {address ? `${address.slice(0, 6)}…${address.slice(-4)}` : "—"}
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={fetchData} disabled={isLoading} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2.5 text-sm text-slate-300 transition-colors disabled:opacity-50 cursor-pointer">
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>
            <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all cursor-pointer">
              <Plus className="w-4 h-4" /> Post New Mission
            </button>
          </div>
        </div>

        <DonorStats {...stats} />

        {/* Tx feedback */}
        {txSuccess && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm mb-8 animate-fade-in-up">
            <CheckCircle2 className="w-5 h-5 shrink-0" /> {txSuccess}
          </div>
        )}
        {txError && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm mb-8 animate-fade-in-up">
            <XCircle className="w-5 h-5 shrink-0 mt-0.5" /> {txError}
          </div>
        )}

        <AwaitingApprovalSection missions={missions} processingId={processingId} onApprove={handleApprove} onDispute={handleDispute} />

        {/* Mission list + bid panel */}
        <div className="grid gap-8 lg:grid-cols-[1fr_420px] animate-fade-in-up">
          <section>
            <h2 className="mb-4 text-xl font-semibold text-slate-100">Your Missions</h2>
            <MissionList missions={missions} selectedId={selectedId} onSelect={handleSelect} />
          </section>
          <BidPanel mission={selectedMission} processingId={processingId} onFund={handleFundMission} />
        </div>
      </div>

      <PostMissionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handlePostMission}
        isSubmitting={processingId === "post"}
        txError={processingId === "post" ? txError : null}
      />
    </AppShell>
  );
}
