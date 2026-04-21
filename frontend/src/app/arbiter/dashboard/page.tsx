"use client";

import { useCallback, useEffect, useState } from "react";
import { BrowserProvider, Contract, type Eip1193Provider } from "ethers";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import ArbiterDashboardHeader from "@/components/arbiter/ArbiterDashboardHeader";
import ArbiterStatsBar from "@/components/arbiter/ArbiterStatsBar";
import ArbiterTxFeedback from "@/components/arbiter/ArbiterTxFeedback";
import DisputeResolutionSection from "@/components/arbiter/DisputeResolutionSection";
import type {
  ArbiterProcessingId,
  DisputedMission,
} from "@/components/arbiter/types";
import { ZERO_ADDRESS } from "@/components/arbiter/utils";
import AppShell from "@/components/layout/AppShell";
import NoWallet from "@/components/ui/NoWallet";
import { CONTRACT_ADDRESS, HUMANITARIAN_ESCROW_ABI } from "@/config/contract";
import { useWeb3 } from "@/context/Web3Context";
import { MissionStatus } from "@/types/mission";

interface MissionRow {
  id: bigint;
  category: string;
  region: string;
  status: bigint;
  donor: string;
  selectedAgency: string;
  lockedFunds: bigint;
}

interface MissionWithStatus {
  id: number;
  category: string;
  region: string;
  status: MissionStatus;
  donor: string;
  selectedAgency: string;
  lockedFunds: bigint;
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

function getTxErrorMessage(error: unknown) {
  if (error && typeof error === "object") {
    const maybeError = error as { reason?: unknown; message?: unknown };

    if (typeof maybeError.reason === "string" && maybeError.reason.length > 0) {
      return maybeError.reason;
    }

    if (
      typeof maybeError.message === "string" &&
      maybeError.message.length > 0
    ) {
      return maybeError.message;
    }
  }

  return "Transaction failed.";
}

export default function ArbiterDashboardPage() {
  const { address, role, isLoading: authLoading } = useWeb3();
  const router = useRouter();

  const [missions, setMissions] = useState<DisputedMission[]>([]);
  const [accumulatedFees, setAccumulatedFees] = useState<bigint>(BigInt(0));
  const [contractBalance, setContractBalance] = useState<bigint>(BigInt(0));
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<ArbiterProcessingId>(null);
  const [txError, setTxError] = useState<string | null>(null);
  const [txSuccess, setTxSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && role && role !== "UN_ARBITER") {
      router.push("/connect");
    }
  }, [authLoading, role, router]);

  const fetchData = useCallback(async () => {
    const ethereum = getEthereumProvider();
    if (!CONTRACT_ADDRESS || !ethereum) return;
    setIsLoading(true);

    try {
      const provider = new BrowserProvider(ethereum);
      const contract = new Contract(
        CONTRACT_ADDRESS,
        HUMANITARIAN_ESCROW_ABI,
        provider,
      );

      const [count, fees, contractEthBalance] = await Promise.all([
        contract.missionCount(),
        contract.accumulatedFees(),
        provider.getBalance(CONTRACT_ADDRESS),
      ]);

      setAccumulatedFees(fees as bigint);
      setContractBalance(contractEthBalance as bigint);

      const total = Number(count);
      if (total === 0) {
        setMissions([]);
        setIsLoading(false);
        return;
      }

      const all = await Promise.all(
        Array.from({ length: total }, (_, i) =>
          contract.missions(i + 1).then((m: MissionRow) => ({
            id: Number(m.id),
            category: m.category as string,
            region: m.region as string,
            status: Number(m.status) as MissionStatus,
            donor: m.donor as string,
            selectedAgency: m.selectedAgency as string,
            lockedFunds: m.lockedFunds as bigint,
          }) satisfies MissionWithStatus),
        ),
      );

      const disputedMissions = all.filter(
        (mission) => mission.status === MissionStatus.Disputed,
      );

      if (disputedMissions.length === 0) {
        setMissions([]);
        return;
      }

      const participantAddresses = Array.from(
        new Set(
          disputedMissions
            .flatMap((mission) => [mission.donor, mission.selectedAgency])
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

      setMissions(
        disputedMissions.map(
          (mission): DisputedMission => ({
            id: mission.id,
            category: mission.category,
            region: mission.region,
            donor: mission.donor,
            donorName:
              nameByWallet.get(mission.donor.toLowerCase()) ?? "Unknown donor",
            selectedAgency: mission.selectedAgency,
            agencyName:
              mission.selectedAgency === ZERO_ADDRESS
                ? null
                : (nameByWallet.get(mission.selectedAgency.toLowerCase()) ??
                  "Unknown agency"),
            lockedFunds: mission.lockedFunds,
          }),
        ),
      );
    } catch (err) {
      console.error("Failed to fetch arbiter data:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && role === "UN_ARBITER") {
      fetchData();
    }
  }, [authLoading, role, fetchData]);

  useEffect(() => {
    const ethereum = getEthereumProvider();
    if (
      !ethereum ||
      !CONTRACT_ADDRESS ||
      role !== "UN_ARBITER"
    ) {
      return;
    }

    const provider = new BrowserProvider(ethereum);
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
      "FeesWithdrawn",
    ];

    eventNames.forEach((eventName) => contract.on(eventName, refresh));

    return () => {
      eventNames.forEach((eventName) => contract.off(eventName, refresh));
    };
  }, [role, fetchData]);

  const resolveDispute = async (missionId: number, agencyFault: boolean) => {
    const ethereum = getEthereumProvider();
    if (!ethereum || !CONTRACT_ADDRESS) return;
    setProcessingId(missionId);
    setTxError(null);
    setTxSuccess(null);

    try {
      const provider = new BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(
        CONTRACT_ADDRESS,
        HUMANITARIAN_ESCROW_ABI,
        signer,
      );
      const tx = await contract.resolveDispute(missionId, agencyFault);
      await tx.wait();
      setTxSuccess(
        agencyFault
          ? `Mission #${missionId}: Funds refunded to donor.`
          : `Mission #${missionId}: Funds released to agency.`,
      );
      await fetchData();
    } catch (err) {
      setTxError(getTxErrorMessage(err));
    } finally {
      setProcessingId(null);
    }
  };

  const withdrawFees = async () => {
    const ethereum = getEthereumProvider();
    if (!ethereum || !CONTRACT_ADDRESS) return;
    setProcessingId("fees");
    setTxError(null);
    setTxSuccess(null);

    try {
      const provider = new BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(
        CONTRACT_ADDRESS,
        HUMANITARIAN_ESCROW_ABI,
        signer,
      );
      const tx = await contract.withdrawFees();
      await tx.wait();
      setTxSuccess("Accumulated fees withdrawn to your wallet.");
      await fetchData();
    } catch (err) {
      setTxError(getTxErrorMessage(err));
    } finally {
      setProcessingId(null);
    }
  };

  if (typeof window !== "undefined" && !getEthereumProvider()) {
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

  if (authLoading || (isLoading && missions.length === 0)) {
    return (
      <AppShell>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell currentPath="/arbiter/dashboard">
      <div className="mx-auto max-w-7xl px-6 py-32 lg:px-12">
        <ArbiterDashboardHeader
          address={address}
          isRefreshing={isLoading}
          onRefresh={fetchData}
        />

        <ArbiterStatsBar
          disputedCount={missions.length}
          accumulatedFees={accumulatedFees}
          contractBalance={contractBalance}
          isWithdrawingFees={processingId === "fees"}
          onWithdrawFees={withdrawFees}
        />

        <ArbiterTxFeedback txSuccess={txSuccess} txError={txError} />

        <DisputeResolutionSection
          missions={missions}
          processingId={processingId}
          onResolveDispute={resolveDispute}
        />
      </div>
    </AppShell>
  );
}
