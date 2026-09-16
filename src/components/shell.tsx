import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useTelemetry } from "@/lib/telemetry";

const nav = [
  { to: "/", label: "Overview" },
  { to: "/tanks", label: "Tanks" },
  { to: "/alerts", label: "Alerts" },
  { to: "/reports", label: "Reports" },
] as const;

export function Shell({ children }: { children: ReactNode }) {
  const { tanks } = useTelemetry();
  const sync = Math.min(...tanks.filter((t) => t.status !== "offline").map((t) => t.lastSync));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto grid max-w-[1440px] grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 sm:px-6 lg:flex lg:gap-6">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="grid size-8 shrink-0 place-items-center rounded-md bg-primary/15 ring-1 ring-primary/30">
              <span className="text-sm font-semibold text-primary">◈</span>
            </div>
            <div className="min-w-0 leading-none">
              <p className="truncate text-[15px] font-semibold tracking-tight">AquaCore</p>
              <p className="label-eyebrow mt-1">Smart Water Tank Monitor</p>
            </div>
          </div>

          <nav className="hidden items-center gap-1 text-sm md:flex lg:ml-4">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                activeProps={{ className: "bg-secondary text-foreground ring-1 ring-border" }}
                inactiveProps={{ className: "text-muted-foreground hover:text-foreground" }}
                className="rounded-md px-3 py-1.5 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4 lg:ml-auto">
            <div className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
              <span className="pulse-dot size-1.5 rounded-full bg-primary" />
              Live · synced {sync}s ago
            </div>
            <div className="flex items-center gap-2 border-l border-border pl-3">
              <div className="grid size-8 shrink-0 place-items-center rounded-full bg-secondary text-xs font-semibold text-primary">
                RM
              </div>
              <span className="hidden text-sm sm:block">R. Mercer</span>
            </div>
          </div>
        </div>

        <nav className="flex gap-1 overflow-x-auto border-t border-border px-4 py-2 text-sm md:hidden">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              activeProps={{ className: "bg-secondary text-foreground ring-1 ring-border" }}
              inactiveProps={{ className: "text-muted-foreground" }}
              className="shrink-0 rounded-md px-3 py-1.5"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6">{children}</div>
    </div>
  );
}
