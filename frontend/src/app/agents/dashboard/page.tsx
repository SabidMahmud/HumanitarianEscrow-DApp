"use client";

import { useState, useEffect, useCallback } from "react";
import {
  BrowserProvider,
  Contract,
  JsonRpcProvider,
  parseEther,
  type Eip1193Provider,
} from "ethers";
import AppShell from "@/components/layout/AppShell";
import { useWeb3 } from "@/context/Web3Context";
import { useRouter } from "next/navigation";
import { CONTRACT_ADDRESS, HUMANITARIAN_ESCROW_ABI } from "@/config/contract";
import { MissionStatus } from "@/types/mission";
import type { MissionWithBids } from "@/hooks/useMissions";
import { CheckCircle2, XCircle, Loader2, RefreshCw } from "lucide-react";

import MissionBoard from "@/components/agents/MissionBoard";
import DeliveryHistory from "@/components/agents/DeliveryHistory";
import MyMissionsSection from "@/components/agents/MyMissionsSection";
import NoWallet from "@/components/ui/NoWallet";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

interface AgentInfo {
  name: string;
  reputationScore: number;
}

interface MissionWithPayout extends MissionWithBids {
  payoutToAgency?: bigint;
  donorName: string;
  selectedAgencyName: string | null;
}

interface MissionRow {
  id: bigint;
  category: string;
  maxBudget: bigint;
  region: string;
  status: bigint;
  donor: string;
  selectedAgency: string;
  lockedFunds: bigint;
}

interface BidRow {
  agency: string;
  amount: bigint;
}

interface UserRow {
  name: string;
  role: bigint;
  wallet: string;
  reputationScore: bigint;
  isRegistered: boolean;
}

interface EthereumWindow extends Window {
  ethereum?: Eip1193Provider;
}

function getEthereumProvider() {
  if (typeof window === "undefined") {
    return null;
  }

  return (window as EthereumWindow).ethereum ?? null;
}

async function getReadProvider() {
  const rpcProvider = new JsonRpcProvider("http://localhost:8545");
  try {
    await rpcProvider.getBlockNumber();
    return rpcProvider;
  } catch {
    const ethereum = getEthereumProvider();
    if (ethereum) {
      return new BrowserProvider(ethereum);
    }
  }
  throw new Error("No read provider available");
}

function calculateOperationalFee(amount: bigint) {
  return amount < parseEther("2") ? (amount * 2n) / 100n : (amount * 1n) / 100n;
}

export default function AgentDashboardPage() {
  const { address, role, isLoading: authLoading } = useWeb3();
  const router = useRouter();

  const [agentInfo, setAgentInfo] = useState<AgentInfo | null>(null);
  const [allMissions, setAllMissions] = useState<MissionWithPayout[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [processingId, setProcessingId] = useState<number | null>(null);
  const [txError, setTxError] = useState<string | null>(null);
  const [txSuccess, setTxSuccess] = useState<string | null>(null);

  // ── Role guard ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!authLoading && role && role !== "RELIEF_AGENCY")
      router.push("/connect");
  }, [authLoading, role, router]);

  // ── Data fetching ─────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    if (!CONTRACT_ADDRESS || !address) return;
    setIsLoading(true);
    try {
      const provider = await getReadProvider();
      const contract = new Contract(
        CONTRACT_ADDRESS,
        HUMANITARIAN_ESCROW_ABI,
        provider,
      );

      // Fetch user info, mission count, and settlement events in parallel.
      const [
        userData,
        countRaw,
        missionFundedEvents,
        deliveryApprovedEvents,
        disputeResolvedEvents,
      ] = await Promise.all([
        contract.users(address),
        contract.missionCount(),
        contract.queryFilter(contract.filters.MissionFunded(), 0, "latest"),
        contract.queryFilter(contract.filters.DeliveryApproved(), 0, "latest"),
        contract.queryFilter(contract.filters.DisputeResolved(), 0, "latest"),
      ]);

      const count = Number(countRaw);

      const fundedAmountByMission = new Map<number, bigint>();
      for (const event of missionFundedEvents) {
        if (!("args" in event)) continue;

        const missionId = Number(event.args[0] ?? 0);
        const fundedAmount = event.args[3] as bigint | undefined;

        if (missionId > 0 && fundedAmount !== undefined) {
          fundedAmountByMission.set(missionId, fundedAmount);
        }
      }

      const payoutByMission = new Map<number, bigint>();

      for (const event of deliveryApprovedEvents) {
        if (!("args" in event)) continue;

        const missionId = Number(event.args[0] ?? 0);
        const agencyPayout = event.args[1] as bigint | undefined;

        if (missionId > 0 && agencyPayout !== undefined) {
          payoutByMission.set(missionId, agencyPayout);
        }
      }

      for (const event of disputeResolvedEvents) {
        if (!("args" in event)) continue;

        const missionId = Number(event.args[0] ?? 0);
        const agencyFault = Boolean(event.args[1]);
        const amountResolved = event.args[2] as bigint | undefined;

        if (missionId <= 0 || amountResolved === undefined) continue;

        // On arbiter fault=true branch, donor is refunded so agency payout is zero.
        payoutByMission.set(missionId, agencyFault ? 0n : amountResolved);
      }

      setAgentInfo({
        name: userData.name as string,
        reputationScore: Number(userData.reputationScore),
      });

      if (count === 0) {
        setAllMissions([]);
        return;
      }

      const missions = await Promise.all(
        Array.from({ length: count }, (_, i) =>
          contract.missions(i + 1).then(async (m: MissionRow) => {
            const status = Number(m.status) as MissionStatus;
            let bids: { agency: string; amount: bigint }[] = [];
            const hasSelectedAgency =
              (m.selectedAgency as string) !== ZERO_ADDRESS;
            // Load bids for Pending missions (for bidding board) and funded missions
            // (for payout fallback when settlement logs are unavailable).
            if (status === MissionStatus.Pending || hasSelectedAgency) {
              const raw = (await contract.getMissionBids(Number(m.id))) as BidRow[];
              bids = raw.map((b) => ({
                agency: b.agency as string,
                amount: b.amount as bigint,
              }));
            }
            return {
              id: Number(m.id),
              category: m.category,
              maxBudget: m.maxBudget as bigint,
              region: m.region,
              status,
              donor: m.donor,
              selectedAgency: m.selectedAgency,
              lockedFunds: m.lockedFunds as bigint,
              bids,
              payoutToAgency: payoutByMission.get(Number(m.id)),
            };
          }),
        ),
      );

      const missionsMissingPayout = missions
        .filter(
          (mission) =>
            (mission.status === MissionStatus.Delivered ||
              mission.status === MissionStatus.Resolved) &&
            payoutByMission.get(mission.id) === undefined,
        )
        .map((mission) => mission.id);

      if (missionsMissingPayout.length > 0) {
        const fallbackPayouts = await Promise.all(
          missionsMissingPayout.map(async (missionId) => {
            const [deliveryLogs, disputeLogs] = await Promise.all([
              contract.queryFilter(
                contract.filters.DeliveryApproved(missionId),
                0,
                "latest",
              ),
              contract.queryFilter(
                contract.filters.DisputeResolved(missionId),
                0,
                "latest",
              ),
            ]);

            const latestDeliveryLog = deliveryLogs[deliveryLogs.length - 1];
            if (latestDeliveryLog && "args" in latestDeliveryLog) {
              const payout = latestDeliveryLog.args[1] as bigint | undefined;
              if (payout !== undefined) {
                return { missionId, payoutToAgency: payout };
              }
            }

            const latestDisputeLog = disputeLogs[disputeLogs.length - 1];
            if (latestDisputeLog && "args" in latestDisputeLog) {
              const agencyFault = Boolean(latestDisputeLog.args[1]);
              const payout = latestDisputeLog.args[2] as bigint | undefined;
              if (payout !== undefined) {
                return {
                  missionId,
                  payoutToAgency: agencyFault ? 0n : payout,
                };
              }
            }

            return null;
          }),
        );

        for (const fallback of fallbackPayouts) {
          if (fallback) {
            payoutByMission.set(fallback.missionId, fallback.payoutToAgency);
          }
        }
      }

      for (const mission of missions) {
        if (
          mission.status === MissionStatus.Delivered &&
          payoutByMission.get(mission.id) === undefined
        ) {
          const selectedBidAmount = mission.bids.find(
            (bid) =>
              bid.agency.toLowerCase() === mission.selectedAgency.toLowerCase(),
          )?.amount;
          const fundedAmount =
            fundedAmountByMission.get(mission.id) ?? selectedBidAmount;
          if (fundedAmount !== undefined) {
            payoutByMission.set(
              mission.id,
              fundedAmount - calculateOperationalFee(fundedAmount),
            );
          }
        }
      }

      const participantAddresses = Array.from(
        new Set(
          missions
            .flatMap((mission) => [
              mission.donor,
              mission.selectedAgency,
              ...mission.bids.map((bid) => bid.agency),
            ])
            .filter((wallet) => wallet !== ZERO_ADDRESS),
        ),
      );

      const users = await Promise.all(
        participantAddresses.map((wallet) =>
          contract.users(wallet).then((user: UserRow) => ({
            wallet: wallet.toLowerCase(),
            name:
              user.isRegistered && user.name.trim().length > 0
                ? user.name.trim()
                : null,
          })),
        ),
      );

      const nameByWallet = new Map(users.map((user) => [user.wallet, user.name]));

      setAllMissions(
        missions.map(
          (mission): MissionWithPayout => ({
            ...mission,
            payoutToAgency: payoutByMission.get(mission.id),
            donorName:
              nameByWallet.get(mission.donor.toLowerCase()) ?? "Unknown donor",
            selectedAgencyName:
              mission.selectedAgency === ZERO_ADDRESS
                ? null
                : (nameByWallet.get(mission.selectedAgency.toLowerCase()) ??
                  "Unknown agency"),
          }),
        ),
      );
    } catch (err) {
      console.error("Failed to fetch agent data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  useEffect(() => {
    if (!authLoading && role === "RELIEF_AGENCY" && address) fetchData();
  }, [authLoading, role, address, fetchData]);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !(window as any).ethereum ||
      !CONTRACT_ADDRESS ||
      !address ||
      role !== "RELIEF_AGENCY"
    ) {
      return;
    }

    const provider = new BrowserProvider((window as any).ethereum);
    const contract = new Contract(
      CONTRACT_ADDRESS,
      HUMANITARIAN_ESCROW_ABI,
      provider,
    );
    const refresh = () => {
      fetchData();
    };

    const eventNames = [
      "MissionPosted",
      "PledgeSubmitted",
      "MissionFunded",
      "AidDelivered",
      "DeliveryApproved",
      "MissionDisputed",
      "DisputeResolved",
    ];

    eventNames.forEach((eventName) => contract.on(eventName, refresh));

    return () => {
      eventNames.forEach((eventName) => contract.off(eventName, refresh));
    };
  }, [address, role, fetchData]);

  // ── Transaction helper ────────────────────────────────────────────────────────
  async function execTx(
    id: number,
    fn: (c: Contract) => Promise<any>,
    successMsg: string,
  ) {
    if (!CONTRACT_ADDRESS || !(window as any).ethereum) return;
    setProcessingId(id);
    setTxError(null);
    setTxSuccess(null);
    try {
      const signer = await new BrowserProvider(
        (window as any).ethereum,
      ).getSigner();
      const contract = new Contract(
        CONTRACT_ADDRESS,
        HUMANITARIAN_ESCROW_ABI,
        signer,
      );
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

  // ── Handlers ──────────────────────────────────────────────────────────────────
  const handleBid = (missionId: number, bidAmountEth: string) =>
    execTx(
      missionId,
      (c) => c.pledgeToDeliver(missionId, parseEther(bidAmountEth)),
      `Bid submitted for mission #${missionId}!`,
    );

  const handleMarkDelivered = (missionId: number) =>
    execTx(
      missionId,
      (c) => c.markDelivered(missionId),
      `Mission #${missionId} marked as delivered. Awaiting donor approval.`,
    );

  // ── Derived state ─────────────────────────────────────────────────────────────
  const isMyMission = (m: MissionWithPayout) =>
    m.selectedAgency.toLowerCase() === (address ?? "").toLowerCase();

  const pendingMissions = allMissions.filter(
    (m) => m.status === MissionStatus.Pending,
  );
  const myMissions = allMissions.filter(
    (m) =>
      isMyMission(m) &&
      [
        MissionStatus.InTransit,
        MissionStatus.AwaitingApproval,
        MissionStatus.Disputed,
        MissionStatus.Delivered,
      ].includes(m.status),
  );
  const pastDeliveries = allMissions.filter(
    (m) =>
      [MissionStatus.Delivered, MissionStatus.Resolved].includes(m.status) &&
      isMyMission(m),
  );
  const deliveredCount = pastDeliveries.length;
  const repScore = agentInfo?.reputationScore ?? 0;
  const repColor =
    repScore >= 80
      ? "text-emerald-300"
      : repScore >= 50
        ? "text-amber-300"
        : "text-rose-300";

  // ── Loading ───────────────────────────────────────────────────────────────────
  if (typeof window !== "undefined" && !(window as any).ethereum) {
    return (
      <AppShell>
        <NoWallet notInstalled />
      </AppShell>
    );
  }
  if (!authLoading && !address) {
    return (
      <AppShell>
        <NoWallet />
      </AppShell>
    );
  }

  if (authLoading || (isLoading && !agentInfo)) {
    return (
      <AppShell>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell currentPath="/agents/dashboard">
      <div className="mx-auto max-w-7xl px-6 py-32 lg:px-12">
        {/* Header + Stats */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 animate-fade-in-up">
          <div>
            <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-teal-400/20 bg-teal-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-teal-200">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-300 shadow-[0_0_10px_rgba(45,212,191,0.8)]" />
              Agency Workspace
            </span>
            <h1 className="font-fraunces text-4xl font-semibold text-slate-50 md:text-5xl">
              {agentInfo?.name ?? "Relief Agency"}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Reputation */}
            <div className="glass-card rounded-2xl px-6 py-4 border-l-[3px] border-l-teal-400">
              <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">
                Reputation
              </p>
              <div className="flex items-baseline gap-1.5">
                <span className={`text-3xl font-bold font-mono ${repColor}`}>
                  {repScore}
                </span>
                <span className="text-sm text-slate-500">pts</span>
              </div>
              {repScore < 40 && (
                <p className="text-[10px] text-rose-400 mt-1">
                  Below bid threshold (40)
                </p>
              )}
            </div>
            {/* Delivered count */}
            <div className="glass-card rounded-2xl px-6 py-4 border-l-[3px] border-l-cyan-400">
              <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">
                Delivered
              </p>
              <span className="text-3xl font-bold font-mono text-cyan-300">
                {deliveredCount}
              </span>
            </div>
            {/* Refresh */}
            <button
              onClick={fetchData}
              disabled={isLoading}
              className="p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw
                className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>

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

        {/* My missions: funded + in transit */}
        <MyMissionsSection
          missions={myMissions}
          processingId={processingId}
          onMarkDelivered={handleMarkDelivered}
        />

        {/* Mission board + Delivery history */}
        <div className="grid gap-8 lg:grid-cols-2 animate-fade-in-up">
          <MissionBoard
            missions={pendingMissions}
            agentAddress={address ?? ""}
            reputationScore={repScore}
            processingId={processingId}
            onBid={handleBid}
          />
          <DeliveryHistory deliveries={pastDeliveries} />
        </div>
      </div>
    </AppShell>
  );
}
