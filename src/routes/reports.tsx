import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { MetricTile, UsageChart } from "@/components/telemetry-ui";
import { fmt, useSelectedTank, useTelemetry } from "@/lib/telemetry";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Usage Reports — Smart Water Tank Monitor" },
      {
        name: "description",
        content:
          "Daily and weekly water consumption trends, pump runtime and per-tank usage breakdowns.",
      },
      { property: "og:title", content: "Usage Reports — Smart Water Tank Monitor" },
      {
        property: "og:description",
        content: "Weekly consumption trends and per-tank usage breakdowns.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/reports" },
    ],
    links: [{ rel: "canonical", href: "/reports" }],
  }),
  component: ReportsPage,
});

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function ReportsPage() {
  const { tanks } = useTelemetry();
  const tank = useSelectedTank();
  const week = tank.history7d;
  const max = Math.max(1, ...week);
  const total = week.reduce((a, b) => a + b, 0);
  const fleetDaily = tanks.reduce((a, t) => a + t.dailyUsage, 0);

  return (
    <Shell>
      <div className="mb-5">
        <p className="label-eyebrow">Analytics</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Usage reports</h1>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricTile label="7-day total" value={fmt(total)} sub="L · selected tank" />
        <MetricTile
          label="Daily average"
          value={fmt(Math.round(total / 7))}
          sub="L / day"
        />
        <MetricTile label="Fleet today" value={fmt(fleetDaily)} sub="L · all tanks" />
        <MetricTile label="Pump runtime" value="3.4" sub="hrs · last 24h" />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <section className="panel-card p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-sm font-medium">{tank.name} · 7-day consumption</p>
            <span className="font-mono text-[11px] text-muted-foreground">L / day</span>
          </div>
          <div className="flex h-56 items-end gap-2">
            {week.map((v, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-2">
                <span className="font-mono text-[10px] text-muted-foreground">{v}</span>
                <div
                  className={`w-full rounded-t-md ${v === max ? "bg-aqua" : "bg-aqua-deep/60"}`}
                  style={{ height: `${Math.max(6, (v / max) * 100)}%` }}
                />
                <span className="font-mono text-[10px] text-muted-foreground">{days[i]}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="panel-card p-5">
          <p className="label-eyebrow mb-4">Usage by tank · today</p>
          <div className="space-y-4">
            {tanks.map((t) => (
              <div key={t.id}>
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="truncate">{t.name}</span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {fmt(t.dailyUsage)} L
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-background/60">
                  <div
                    className="h-full rounded-full bg-aqua-deep"
                    style={{
                      width: `${Math.round((t.dailyUsage / Math.max(1, fleetDaily)) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-5">
        <UsageChart data={tank.usage24h} peakLabel="hourly buckets" />
      </div>
    </Shell>
  );
}
