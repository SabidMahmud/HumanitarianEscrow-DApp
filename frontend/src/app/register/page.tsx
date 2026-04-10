"use client";

import React, { useEffect } from "react";
import { useWeb3 } from "@/context/Web3Context";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const { address, role, isLoading } = useWeb3();
  const router = useRouter();

  // Redirect if already registered
  useEffect(() => {
    if (!isLoading && role && role !== "UNREGISTERED") {
       router.push("/connect");
    }
  }, [isLoading, role, router]);

  return (
    <div className="min-h-screen bg-[#050b14] flex flex-col items-center justify-center p-6 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-slate-900 via-[#050b14] to-[#050b14]" />
      <div className="relative z-10 max-w-md w-full bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-8 shadow-2xl text-center">
         <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
            <UserPlus className="w-8 h-8 text-blue-400" />
         </div>
         <h1 className="text-3xl font-bold text-slate-100 mb-2 font-fraunces">Register Identity</h1>
         <p className="text-slate-400 mb-8">
           Wallet <span className="font-mono text-xs bg-slate-800 px-2 py-1 rounded text-slate-300 border border-slate-700/50">{address ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}` : "Not connected"}</span>
           <br/>needs to be registered on-chain.
         </p>

         {/* TODO: Impl registerUser mutation */}
         <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50 mb-8 text-left">
           <p className="text-sm text-amber-400 font-medium">Pending Feature:</p>
           <p className="text-sm text-slate-300 mt-1">Please wait for the implementation of the registration form. It will allow you to pick 'Donor' or 'Relief Agency'.</p>
         </div>

         <Link 
           href="/"
           className="w-full inline-block text-slate-400 hover:text-white transition-colors text-sm"
         >
           Cancel and return home
         </Link>
      </div>
    </div>
  );
}
