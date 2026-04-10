/**
 * Application-wide constants and display labels.
 */

import { MissionStatus, MISSION_STATUS_LABELS } from "@/types";

/** Expected chain ID for local Ganache development. */
export const GANACHE_CHAIN_ID = 1337;

/** Status badge color classes (Tailwind) keyed by MissionStatus. */
export const STATUS_COLORS: Record<MissionStatus, string> = {
  [MissionStatus.Pending]:          "text-amber-300 bg-amber-400/10 border-amber-400/20",
  [MissionStatus.InTransit]:        "text-blue-300 bg-blue-400/10 border-blue-400/20",
  [MissionStatus.AwaitingApproval]: "text-emerald-300 bg-emerald-400/10 border-emerald-400/20",
  [MissionStatus.Delivered]:        "text-slate-300 bg-white/5 border-white/10",
  [MissionStatus.Disputed]:         "text-rose-300 bg-rose-400/10 border-rose-400/20",
  [MissionStatus.Resolved]:         "text-slate-300 bg-white/5 border-white/10",
};

/** Re-export for convenience. */
export { MISSION_STATUS_LABELS };
