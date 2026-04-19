import { useState } from "react";
import { X, Plus, Loader2, XCircle } from "lucide-react";

const CATEGORIES = [
  "Medical Supplies",
  "Food Aid",
  "Clean Water",
  "Shelter & Housing",
  "Evacuation Support",
  "Education Materials",
];

interface PostMissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Called when the user submits the form. Parent handles the tx. */
  onSubmit: (category: string, budget: string, region: string) => Promise<void>;
  isSubmitting: boolean;
  txError: string | null;
}

export default function PostMissionModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  txError,
}: PostMissionModalProps) {
  const [category, setCategory] = useState("");
  const [budget, setBudget] = useState("");
  const [region, setRegion] = useState("");

  if (!isOpen) return null;

  const canSubmit = category.trim() && budget && region.trim() && !isSubmitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    await onSubmit(category.trim(), budget, region.trim());
    // Parent handles reset after confirmed tx
    setCategory("");
    setBudget("");
    setRegion("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-100">Post New Mission</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-5">
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
            <input
              type="text"
              list="categories-list"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Medical Supplies"
              className="w-full bg-slate-800/60 border border-white/10 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/30 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 text-sm transition-all"
            />
            <datalist id="categories-list">
              {CATEGORIES.map((c) => <option key={c} value={c} />)}
            </datalist>
          </div>

          {/* Max Budget */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Max Budget <span className="text-slate-500 text-xs font-normal">(in ETH)</span>
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="e.g. 2.5"
              className="w-full bg-slate-800/60 border border-white/10 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/30 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 text-sm transition-all"
            />
          </div>

          {/* Region */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Target Region</label>
            <input
              type="text"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              placeholder="e.g. Sudan, Khartoum"
              className="w-full bg-slate-800/60 border border-white/10 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/30 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 text-sm transition-all"
            />
          </div>

          {/* Error */}
          {txError && (
            <div className="flex items-start gap-2 text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
              <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
              {txError}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 py-3 text-sm font-medium text-slate-300 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="flex-1 rounded-xl bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 py-3 text-sm font-semibold text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-[0_0_20px_rgba(245,158,11,0.3)]"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {isSubmitting ? "Posting…" : "Post Mission"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
