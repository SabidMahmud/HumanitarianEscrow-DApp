import { CheckCircle2, XCircle } from "lucide-react";

interface ArbiterTxFeedbackProps {
  txSuccess: string | null;
  txError: string | null;
}

export default function ArbiterTxFeedback({
  txSuccess,
  txError,
}: ArbiterTxFeedbackProps) {
  if (!txSuccess && !txError) {
    return null;
  }

  return (
    <>
      {txSuccess && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm mb-8 animate-fade-in-up">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          {txSuccess}
        </div>
      )}
      {txError && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm mb-8 animate-fade-in-up">
          <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
          {txError}
        </div>
      )}
    </>
  );
}
