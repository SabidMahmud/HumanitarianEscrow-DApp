import React from "react";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

type AppShellProps = {
  children: React.ReactNode;
  currentPath?: string;
};

export default function AppShell({
  children,
  currentPath,
}: AppShellProps) {
  return (
    <main className="relative min-h-screen text-slate-100 font-sans selection:bg-emerald-500/30">
      <div className="fixed inset-0 z-[-1] grid-bg bg-[#050b14]" />
      <div className="fixed top-[-10%] left-[-10%] h-125 w-125 rounded-full bg-emerald-600/20 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] h-150 w-150 rounded-full bg-teal-600/10 blur-[150px] pointer-events-none" />
      <div className="fixed top-[40%] left-[60%] h-75 w-75 rounded-full bg-cyan-600/10 blur-[100px] pointer-events-none" />

      <Navbar currentPath={currentPath} />
      {children}
      <Footer />
    </main>
  );
}
