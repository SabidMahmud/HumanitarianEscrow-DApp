import React from "react";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";

type RolePlaceholderProps = {
  currentPath: string;
  eyebrow: string;
  title: string;
  description: string;
  nextStep: string;
  highlights: string[];
};

export default function RolePlaceholder({
  currentPath,
  eyebrow,
  title,
  description,
  nextStep,
  highlights,
}: RolePlaceholderProps) {
  return (
    <AppShell currentPath={currentPath}>
      <section className="relative mx-auto flex max-w-6xl flex-col gap-10 px-6 pb-16 pt-40 lg:px-12">
        <div className="max-w-3xl animate-fade-in-up">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-glow" />
            {eyebrow}
          </span>
          <h1 className="font-(family-name:--font-fraunces) text-5xl font-semibold tracking-tight text-slate-50 md:text-7xl">
            {title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-400 md:text-xl">
            {description}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {highlights.map((highlight, index) => (
            <div
              key={highlight}
              className="glass-card rounded-[1.75rem] p-6 animate-fade-in-up"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10 text-sm font-bold text-emerald-300">
                0{index + 1}
              </div>
              <p className="text-sm leading-relaxed text-slate-300">{highlight}</p>
            </div>
          ))}
        </div>

        <div className="glass-panel rounded-4xl p-8 md:p-12 animate-fade-in-up">
          <span className="mb-3 block text-xs font-bold uppercase tracking-[0.3em] text-teal-300">
            Next pass
          </span>
          <p className="max-w-3xl text-lg leading-relaxed text-slate-300">
            {nextStep}
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/donors" className="primary-button">
              Review Donors Page
            </Link>
            <Link href="/" className="glass-button">
              Back to Overview
            </Link>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
